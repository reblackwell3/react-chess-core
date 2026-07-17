import { useEffect, useMemo, useRef, useState } from 'react';
import { uciPvToSan } from '../../engine/formatEvaluation';
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
  DEFAULT_SETUP_REFUTATION_TARGET_DEPTH,
  findSetupLineByFirstMove,
  tryRefutationFromSetupEvaluation,
} from './refutationFromSetupLines';

export type KnownRefutation = {
  uci: string;
  san?: string | null;
  /** When set, only use this refutation for the matching wrong-move UCI. */
  onlyForAttemptedUci?: string;
};

/** Engine-derived refutation, reported so hosts can persist it. */
export type ResolvedRefutation = {
  setupFen: string;
  wrongUci: string;
  refutationUci: string;
  refutationSan: string | null;
  depth: number | null;
};

export type OnRefutationResolved = (resolved: ResolvedRefutation) => void;

/**
 * Async lookup of a previously stored refutation (e.g. a backend cache).
 * Runs when a miss starts and the setup-line cache does not hit.
 */
export type ResolveKnownRefutation = (
  setupFen: string,
  wrongUci: string,
) => Promise<KnownRefutation | null>;

export function useMissRefutation(
  setupFen: string | null,
  attemptedUci: string | null,
  expectedUci: string | null,
  enabled: boolean,
  engineOptions: AnalysisEngineOptions,
  knownRefutation: KnownRefutation | null = null,
  setupCacheTargetDepth: number = DEFAULT_SETUP_REFUTATION_TARGET_DEPTH,
  onRefutationResolved?: OnRefutationResolved,
  resolveKnownRefutation?: ResolveKnownRefutation,
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
      { targetDepth: setupCacheTargetDepth },
    );
  }, [
    attemptedUci,
    enabled,
    expectedUci,
    setupCacheTargetDepth,
    setupEvaluation,
    setupFen,
  ]);

  const cacheHit = cacheResult != null;

  const lookupKey =
    setupFen && attemptedUci ? `${setupFen}:${attemptedUci}` : null;
  const [fetchedKnown, setFetchedKnown] = useState<{
    key: string;
    value: KnownRefutation | null;
  } | null>(null);

  useEffect(() => {
    if (
      !resolveKnownRefutation ||
      !enabled ||
      !setupFen ||
      !attemptedUci ||
      !lookupKey ||
      cacheHit ||
      knownRefutation?.uci
    ) {
      return undefined;
    }
    if (fetchedKnown?.key === lookupKey) {
      return undefined;
    }
    let cancelled = false;
    resolveKnownRefutation(setupFen, attemptedUci)
      .then((value) => {
        if (!cancelled) {
          setFetchedKnown({ key: lookupKey, value });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedKnown({ key: lookupKey, value: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    attemptedUci,
    cacheHit,
    enabled,
    fetchedKnown,
    knownRefutation?.uci,
    lookupKey,
    resolveKnownRefutation,
    setupFen,
  ]);

  const effectiveKnown = useMemo((): KnownRefutation | null => {
    if (knownRefutation) {
      return knownRefutation;
    }
    if (lookupKey && fetchedKnown?.key === lookupKey && fetchedKnown.value) {
      return fetchedKnown.value;
    }
    return null;
  }, [fetchedKnown, knownRefutation, lookupKey]);

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
    shared: true,
    priority: 10,
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

  const result = useMemo(() => {
    if (
      enabled &&
      effectiveKnown?.uci &&
      setupFen &&
      attemptedUci
    ) {
      const onlyFor = effectiveKnown.onlyForAttemptedUci;
      if (
        onlyFor &&
        attemptedUci.toLowerCase() !== onlyFor.toLowerCase()
      ) {
        // Fall through to engine/cache for other wrong moves.
      } else {
        const fenAfterWrongMove = fenAfterUci(setupFen, attemptedUci);
        if (fenAfterWrongMove) {
          const refutationSan =
            effectiveKnown.san ??
            uciPvToSan(fenAfterWrongMove, [effectiveKnown.uci])[0] ??
            effectiveKnown.uci;
          return {
            fenAfterWrong: fenAfterWrongMove,
            refutationUci: effectiveKnown.uci,
            refutationSan,
            refutationLine: null,
            loading: false,
            error: null,
          };
        }
      }
    }

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
    effectiveKnown,
    setupEvaluation,
    setupFen,
    enabled,
    wrongEvaluation,
  ]);

  const knownApplied = Boolean(
    enabled &&
      effectiveKnown?.uci &&
      setupFen &&
      attemptedUci &&
      (!effectiveKnown.onlyForAttemptedUci ||
        attemptedUci.toLowerCase() ===
          effectiveKnown.onlyForAttemptedUci.toLowerCase()),
  );

  const reportedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !onRefutationResolved ||
      !enabled ||
      knownApplied ||
      !setupFen ||
      !attemptedUci ||
      result.loading ||
      !result.refutationUci
    ) {
      return;
    }
    const key = `${setupFen}:${attemptedUci}`;
    if (reportedKeyRef.current === key) {
      return;
    }
    reportedKeyRef.current = key;
    const depth = cacheResult
      ? findSetupLineByFirstMove(
          setupEvaluation?.lines ?? [],
          attemptedUci,
        )?.depth ?? null
      : wrongEvaluation.lines[0]?.depth ?? null;
    onRefutationResolved({
      setupFen,
      wrongUci: attemptedUci,
      refutationUci: result.refutationUci,
      refutationSan: result.refutationSan,
      depth,
    });
  }, [
    attemptedUci,
    cacheResult,
    enabled,
    knownApplied,
    onRefutationResolved,
    result,
    setupEvaluation,
    setupFen,
    wrongEvaluation,
  ]);

  return result;
}
