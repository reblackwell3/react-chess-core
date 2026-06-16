import { useMemo } from 'react';
import { useAnalysisEngine } from '../../engine/useAnalysisEngine';
import type { AnalysisEngineOptions } from '../../engine/types';
import {
  fenAfterUci,
  refutationEvalGapCp,
  refutationFromEvaluation,
  type RefutationResult,
} from './refutation';

export function useMissRefutation(
  setupFen: string | null,
  attemptedUci: string | null,
  expectedUci: string | null,
  enabled: boolean,
  engineOptions: AnalysisEngineOptions,
): RefutationResult {
  const fenAfterWrong = useMemo(() => {
    if (!setupFen || !attemptedUci) {
      return null;
    }
    return fenAfterUci(setupFen, attemptedUci);
  }, [setupFen, attemptedUci]);

  const fenAfterCorrect = useMemo(() => {
    if (!setupFen || !expectedUci) {
      return null;
    }
    return fenAfterUci(setupFen, expectedUci);
  }, [setupFen, expectedUci]);

  const wrongEvaluation = useAnalysisEngine(fenAfterWrong ?? '', {
    ...engineOptions,
    enabled: enabled && Boolean(fenAfterWrong),
    shared: false,
  });

  const correctEvaluation = useAnalysisEngine(fenAfterCorrect ?? '', {
    ...engineOptions,
    enabled: enabled && Boolean(fenAfterCorrect),
    shared: false,
  });

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

    const evalGapApplies = Boolean(fenAfterCorrect);
    const evalGapCp = evalGapApplies
      ? refutationEvalGapCp(wrongEvaluation, correctEvaluation)
      : null;
    const evalGapLoading =
      evalGapApplies &&
      evalGapCp === null &&
      wrongEvaluation.status !== 'error' &&
      correctEvaluation.status !== 'error' &&
      (correctEvaluation.status === 'loading' ||
        correctEvaluation.status === 'analyzing' ||
        wrongEvaluation.status === 'loading' ||
        wrongEvaluation.status === 'analyzing');

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
  }, [fenAfterCorrect, fenAfterWrong, correctEvaluation, wrongEvaluation]);
}
