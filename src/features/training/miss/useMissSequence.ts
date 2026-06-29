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
import { useMissRefutation, type KnownRefutation } from './useMissRefutation';

export type { MissSequencePhase, MissDisplay };

type MissSequence = MissSequenceState;

export type { KnownRefutation };

export type MissSequenceOptions = {
  /** How long to hold the refutation on the board before advancing. */
  refutationPauseMs?: number;
  /** End the sequence after refutation instead of showing the answer arrow. */
  clearAfterRefutation?: boolean;
};

export function useMissSequence(
  feedback: 'correct' | 'incorrect' | null,
  expectedUci: string | null,
  engineOptions: AnalysisEngineOptions,
  answerArrowColor: string,
  autoShowWrongMoves: boolean,
  snapBackOnWrong = false,
  knownRefutation: KnownRefutation | null = null,
  options: MissSequenceOptions = {},
) {
  const refutationPauseMs =
    options.refutationPauseMs ?? MISS_REFUTATION_PAUSE_MS;
  const clearAfterRefutation = options.clearAfterRefutation === true;
  const [sequence, setSequence] = useState<MissSequence | null>(null);

  const refutation = useMissRefutation(
    sequence?.setupFen ?? null,
    sequence?.attemptedUci ?? null,
    expectedUci,
    sequence != null,
    engineOptions,
    knownRefutation,
  );

  const startSequence = useCallback(
    (setupFen: string, attemptedUci: string) => {
      setSequence({
        setupFen,
        attemptedUci,
        phase: autoShowWrongMoves ? 'wrong' : 'retry',
      });
    },
    [autoShowWrongMoves],
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

  useEffect(() => {
    if (sequence?.phase === 'wrong') {
      if (wrongPhaseEnteredAtRef.current === null) {
        wrongPhaseEnteredAtRef.current = Date.now();
      }
      return;
    }
    wrongPhaseEnteredAtRef.current = null;
  }, [sequence?.phase]);

  useEffect(() => {
    if (!sequence || sequence.phase !== 'wrong' || !autoShowWrongMoves) {
      return undefined;
    }

    const enteredAt = wrongPhaseEnteredAtRef.current ?? Date.now();
    const deadline = enteredAt + REFUTATION_RESPONSE_BUDGET_MS;
    const earliestShow =
      enteredAt + MISS_MOVE_ANIMATION_MS + MISS_WRONG_PAUSE_MS;

    const advance = () => {
      setSequence((current) => {
        if (!current || current.phase !== 'wrong') {
          return current;
        }
        if (refutation.loading && Date.now() < deadline) {
          return current;
        }
        return {
          ...current,
          phase: refutation.refutationUci ? 'refutation' : 'answer',
        };
      });
    };

    const schedule = () => {
      const now = Date.now();
      const hasRefutation =
        Boolean(refutation.refutationUci) && !refutation.loading;

      if (hasRefutation) {
        return window.setTimeout(advance, Math.max(0, earliestShow - now));
      }

      if (refutation.loading) {
        return window.setTimeout(advance, Math.max(0, deadline - now));
      }

      return window.setTimeout(advance, Math.max(0, earliestShow - now));
    };

    const timer = schedule();
    return () => window.clearTimeout(timer);
  }, [
    autoShowWrongMoves,
    refutation.loading,
    refutation.refutationUci,
    sequence,
  ]);

  useEffect(() => {
    if (!sequence || sequence.phase !== 'refutation') {
      return undefined;
    }

    const delay = window.setTimeout(() => {
      setSequence((current) => {
        if (current?.phase !== 'refutation') {
          return current;
        }
        if (clearAfterRefutation) {
          return null;
        }
        return { ...current, phase: 'answer' };
      });
    }, refutationPauseMs);

    return () => window.clearTimeout(delay);
  }, [clearAfterRefutation, refutationPauseMs, sequence]);

  const display = useMemo(
    (): MissDisplay =>
      getMissDisplay(
        sequence,
        expectedUci,
        refutation.refutationUci,
        answerArrowColor,
        { snapBackOnWrong },
      ),
    [
      answerArrowColor,
      expectedUci,
      refutation.refutationUci,
      sequence,
      snapBackOnWrong,
    ],
  );

  return {
    sequence,
    refutation,
    display,
    startSequence,
    clearSequence,
  };
}

