import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnalysisEngineOptions } from '../../engine/types';
import {
  getMissDisplay,
  MISS_MOVE_ANIMATION_MS,
  MISS_REFUTATION_PAUSE_MS,
  MISS_WRONG_PAUSE_MS,
  REFUTATION_RESPONSE_BUDGET_MS,
  type MissDisplay,
  type MissSequencePhase,
  type MissSequenceState,
} from './missDisplay';
import {
  normalizeMissRetryPolicy,
  resolvePostMissPhase,
  type MissRetryPolicy,
} from './missRetryPolicy';
import {
  useMissRefutation,
  type KnownRefutation,
  type OnRefutationResolved,
  type ResolveKnownRefutation,
  type ResolvedRefutation,
} from './useMissRefutation';

export type { MissSequencePhase, MissDisplay };
export type { MissRetryPolicy };

type MissSequence = MissSequenceState;

export type {
  KnownRefutation,
  OnRefutationResolved,
  ResolveKnownRefutation,
  ResolvedRefutation,
};

export type MissSequenceOptions = {
  /** How long to hold the refutation on the board before advancing. */
  refutationPauseMs?: number;
  /** End the sequence after refutation instead of showing the answer arrow. */
  clearAfterRefutation?: boolean;
  /** Min time in wrong phase before refutation (default: animation + pause). */
  wrongHoldMs?: number;
  /** Retry vs answer-arrow behavior after a miss. */
  missRetryPolicy?: MissRetryPolicy;
  /** Fires when the engine (not a known refutation) resolves a refutation. */
  onRefutationResolved?: OnRefutationResolved;
  /** Async lookup of a stored refutation (e.g. backend cache). */
  resolveKnownRefutation?: ResolveKnownRefutation;
};

export function useMissSequence(
  feedback: 'correct' | 'incorrect' | null,
  expectedUci: string | null,
  engineOptions: AnalysisEngineOptions,
  answerArrowColor: string,
  autoShowWrongMoves: boolean,
  snapBackOnWrong = false,
  knownRefutation: KnownRefutation | null = null,
  setupCacheTargetDepth?: number,
  options: MissSequenceOptions = {},
) {
  const missRetryPolicy = useMemo(
    () => normalizeMissRetryPolicy(options.missRetryPolicy, autoShowWrongMoves),
    [
      autoShowWrongMoves,
      options.missRetryPolicy?.allowRetryOnIncorrect,
      options.missRetryPolicy?.maxMissAttempts,
    ],
  );
  const allowRetryOnIncorrect = missRetryPolicy.allowRetryOnIncorrect;
  const maxMissAttempts = missRetryPolicy.maxMissAttempts;
  const refutationPauseMs =
    options.refutationPauseMs ?? MISS_REFUTATION_PAUSE_MS;
  const clearAfterRefutation = options.clearAfterRefutation === true;
  const wrongHoldMs =
    options.wrongHoldMs ?? MISS_MOVE_ANIMATION_MS + MISS_WRONG_PAUSE_MS;
  const [sequence, setSequence] = useState<MissSequence | null>(null);

  const refutation = useMissRefutation(
    sequence?.setupFen ?? null,
    sequence?.attemptedUci ?? null,
    expectedUci,
    sequence != null,
    engineOptions,
    knownRefutation,
    setupCacheTargetDepth,
    options.onRefutationResolved,
    options.resolveKnownRefutation,
  );

  const startSequence = useCallback((setupFen: string, attemptedUci: string) => {
    setSequence({
      setupFen,
      attemptedUci,
      phase: 'wrong',
      attemptCount: 1,
    });
  }, []);

  const recordWrongAttempt = useCallback(
    (setupFen: string, attemptedUci: string) => {
      setSequence((current) => {
        const baseSetupFen = current?.setupFen ?? setupFen;
        const nextCount = (current?.attemptCount ?? 0) + 1;
        return {
          setupFen: baseSetupFen,
          attemptedUci,
          phase: 'wrong',
          attemptCount: nextCount,
        };
      });
    },
    [],
  );

  const clearSequence = useCallback(() => {
    setSequence(null);
  }, []);

  const prevFeedbackRef = useRef(feedback);
  useEffect(() => {
    const prevFeedback = prevFeedbackRef.current;
    prevFeedbackRef.current = feedback;
    if (prevFeedback === 'incorrect' && feedback !== 'incorrect') {
      setSequence(null);
    }
  }, [feedback]);

  const wrongPhaseEnteredAtRef = useRef<number | null>(null);
  const refutationPhaseEnteredAtRef = useRef<number | null>(null);
  const refutationRef = useRef(refutation);
  refutationRef.current = refutation;

  const sequencePhase = sequence?.phase ?? null;
  const sequenceKey = sequence
    ? `${sequence.setupFen}:${sequence.attemptedUci}:${sequence.attemptCount}`
    : null;

  useEffect(() => {
    if (sequencePhase === 'wrong') {
      if (wrongPhaseEnteredAtRef.current === null) {
        wrongPhaseEnteredAtRef.current = Date.now();
      }
      refutationPhaseEnteredAtRef.current = null;
      return;
    }
    wrongPhaseEnteredAtRef.current = null;
    if (sequencePhase !== 'refutation') {
      refutationPhaseEnteredAtRef.current = null;
    }
  }, [sequencePhase]);

  useEffect(() => {
    if (sequencePhase !== 'wrong' || !sequenceKey) {
      return undefined;
    }

    const enteredAt = wrongPhaseEnteredAtRef.current ?? Date.now();
    const earliestShow = enteredAt + wrongHoldMs;
    const deadline = enteredAt + REFUTATION_RESPONSE_BUDGET_MS;

    const advanceWhenReady = () => {
      const { refutationUci, loading } = refutationRef.current;
      setSequence((current) => {
        if (!current || current.phase !== 'wrong') {
          return current;
        }
        const now = Date.now();
        // Prefer fallback Stockfish movetime, but cap total wait at REFUTATION_RESPONSE_BUDGET_MS.
        if (loading && now < deadline) {
          return current;
        }
        if (refutationUci) {
          return {
            ...current,
            phase: 'refutation',
            shownRefutationUci: refutationUci,
          };
        }
        return {
          ...current,
          phase: resolvePostMissPhase(missRetryPolicy, current.attemptCount),
        };
      });
    };

    const now = Date.now();
    const { loading } = refutationRef.current;

    if (now >= earliestShow && (!loading || now >= deadline)) {
      advanceWhenReady();
      return undefined;
    }

    const nextAt = now < earliestShow ? earliestShow : deadline;
    const timer = window.setTimeout(advanceWhenReady, Math.max(0, nextAt - now));
    return () => window.clearTimeout(timer);
  }, [
    refutation.loading,
    refutation.refutationUci,
    sequenceKey,
    sequencePhase,
    wrongHoldMs,
  ]);

  useEffect(() => {
    if (sequencePhase !== 'refutation' || !sequenceKey) {
      return undefined;
    }

    if (refutationPhaseEnteredAtRef.current === null) {
      refutationPhaseEnteredAtRef.current = Date.now();
    }

    const enteredAt = refutationPhaseEnteredAtRef.current;
    const delay = window.setTimeout(() => {
      setSequence((current) => {
        if (current?.phase !== 'refutation') {
          return current;
        }
        if (clearAfterRefutation) {
          return null;
        }
        return {
          ...current,
          phase: resolvePostMissPhase(missRetryPolicy, current.attemptCount),
        };
      });
    }, Math.max(0, refutationPauseMs - (Date.now() - enteredAt)));

    return () => window.clearTimeout(delay);
  }, [
    allowRetryOnIncorrect,
    maxMissAttempts,
    clearAfterRefutation,
    refutationPauseMs,
    sequenceKey,
    sequencePhase,
  ]);

  const display = useMemo(
    (): MissDisplay =>
      getMissDisplay(
        sequence,
        expectedUci,
        refutation.refutationUci,
        answerArrowColor,
      ),
    [
      answerArrowColor,
      expectedUci,
      refutation.refutationUci,
      sequence,
    ],
  );

  return {
    sequence,
    refutation,
    display,
    missRetryPolicy,
    startSequence,
    recordWrongAttempt,
    clearSequence,
  };
}

