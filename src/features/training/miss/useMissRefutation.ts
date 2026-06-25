import { useEffect, useMemo } from 'react';
import { usePlayTimeEngineEvaluation } from '../../engine/PlayTimeEngineContext';
import { useAnalysisEngine } from '../../engine/useAnalysisEngine';
import type { AnalysisEngineOptions } from '../../engine/types';
import {
  fenAfterUci,
  lineEvalCpForGap,
  refutationEvalGapCp,
  refutationFallbackEngineOptions,
  refutationFromEvaluation,
  type RefutationResult,
} from './refutation';
import {
  findSetupLineByFirstMove,
  tryRefutationFromSetupEvaluation,
} from './refutationFromSetupLines';

export function useMissRefutation(
  setupFen: string | null,
  attemptedUci: string | null,
  expectedUci: string | null,
  enabled: boolean,
  engineOptions: AnalysisEngineOptions,
): RefutationResult {
  const playTime = usePlayTimeEngineEvaluation();

  const setupEvaluation = useMemo(() => {
    if (
      !setupFen ||
      !playTime ||
      playTime.setupFen !== setupFen ||
      playTime.evaluation.lines.length === 0
    ) {
      return null;
    }
    return playTime.evaluation;
  }, [playTime, setupFen]);

  const cacheResult = useMemo(() => {
    if (!enabled || !setupFen || !attemptedUci || !setupEvaluation) {
      return null;
    }
    return tryRefutationFromSetupEvaluation(
      setupFen,
      setupEvaluation,
      attemptedUci,
      expectedUci,
    );
  }, [attemptedUci, enabled, expectedUci, setupEvaluation, setupFen]);

  const cacheHit = cacheResult != null;

  const fenAfterWrong = useMemo(() => {
    if (cacheResult) {
      return cacheResult.fenAfterWrong;
    }
    if (!setupFen || !attemptedUci) {
      return null;
    }
    return fenAfterUci(setupFen, attemptedUci);
  }, [attemptedUci, cacheResult, setupFen]);

  const fenAfterCorrect = useMemo(() => {
    if (!setupFen || !expectedUci) {
      return null;
    }
    return fenAfterUci(setupFen, expectedUci);
  }, [expectedUci, setupFen]);

  const fallbackEngine = useMemo(
    () => ({
      ...refutationFallbackEngineOptions,
      ...engineOptions,
    }),
    [engineOptions],
  );

  const expectedInSetupCache = useMemo(() => {
    if (!expectedUci || !setupEvaluation) {
      return false;
    }
    return findSetupLineByFirstMove(setupEvaluation.lines, expectedUci) != null;
  }, [expectedUci, setupEvaluation]);

  const runWrongEngine = enabled && Boolean(fenAfterWrong) && !cacheHit;
  const runCorrectEngine =
    enabled &&
    Boolean(fenAfterCorrect) &&
    !cacheHit &&
    !expectedInSetupCache;

  const wrongEvaluation = useAnalysisEngine(fenAfterWrong ?? '', {
    ...fallbackEngine,
    enabled: runWrongEngine,
    shared: false,
  });

  const correctEvaluation = useAnalysisEngine(fenAfterCorrect ?? '', {
    ...fallbackEngine,
    enabled: runCorrectEngine,
    shared: false,
  });

  useEffect(() => {
    if (!enabled || !playTime) {
      return undefined;
    }
    if (cacheHit || runWrongEngine || runCorrectEngine) {
      playTime.pauseAnalysis();
      return () => playTime.resumeAnalysis();
    }
    return undefined;
  }, [
    cacheHit,
    enabled,
    playTime,
    runCorrectEngine,
    runWrongEngine,
  ]);

  return useMemo(() => {
    if (!fenAfterWrong) {
      return {
        fenAfterWrong: null,
        refutationUci: null,
        refutationSan: null,
        refutationLine: null,
        loading: false,
        error: null,
      };
    }

    if (cacheResult) {
      return {
        fenAfterWrong: cacheResult.fenAfterWrong,
        refutationUci: cacheResult.refutationUci,
        refutationSan: cacheResult.refutationSan,
        refutationLine: cacheResult.refutationLine,
        loading: false,
        error: null,
      };
    }

    const evalGapApplies = Boolean(fenAfterCorrect);
    let evalGapCp: number | null = null;
    let evalGapLoading = false;

    if (evalGapApplies && expectedInSetupCache && setupEvaluation && expectedUci) {
      const wrongLine = findSetupLineByFirstMove(
        setupEvaluation.lines,
        attemptedUci ?? '',
      );
      const correctLine =
        findSetupLineByFirstMove(setupEvaluation.lines, expectedUci) ??
        setupEvaluation.lines[0];
      if (wrongLine && correctLine) {
        const wrongCp = lineEvalCpForGap(wrongLine);
        const correctCp = lineEvalCpForGap(correctLine);
        if (wrongCp != null && correctCp != null) {
          evalGapCp = correctCp - wrongCp;
        }
      }
    } else if (evalGapApplies) {
      evalGapCp = refutationEvalGapCp(wrongEvaluation, correctEvaluation);
      evalGapLoading =
        evalGapCp === null &&
        wrongEvaluation.status !== 'error' &&
        correctEvaluation.status !== 'error' &&
        (correctEvaluation.status === 'loading' ||
          correctEvaluation.status === 'analyzing' ||
          wrongEvaluation.status === 'loading' ||
          wrongEvaluation.status === 'analyzing');
    }

    return {
      fenAfterWrong,
      ...refutationFromEvaluation(
        fenAfterWrong,
        wrongEvaluation,
        evalGapCp,
        evalGapApplies,
        evalGapLoading,
      ),
    };
  }, [
    attemptedUci,
    cacheResult,
    correctEvaluation,
    expectedInSetupCache,
    expectedUci,
    fenAfterCorrect,
    fenAfterWrong,
    setupEvaluation,
    wrongEvaluation,
  ]);
}
