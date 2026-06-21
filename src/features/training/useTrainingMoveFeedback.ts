import { useCallback } from 'react';
import {
  createExpectedMoveDropHandler,
  type CreateExpectedMoveDropHandlerOptions,
  type ExpectedMoveAttempt,
} from './expectedMoveDrop';
import { useCorrectMoveFeedback } from './useCorrectMoveFeedback';
import { useIncorrectMoveFeedback } from './useIncorrectMoveFeedback';

export type CreateTrainingDropHandlerOptions = Omit<
  CreateExpectedMoveDropHandlerOptions,
  'onCorrect' | 'onIncorrect'
> & {
  onCorrect?: (attempt: ExpectedMoveAttempt) => void;
  onIncorrect?: (attempt: ExpectedMoveAttempt) => void;
  /** When true, miss-sequence overlays handle incorrect feedback instead of the red X. */
  skipIncorrectOverlay?: boolean;
};

/**
 * Shared correct/incorrect move overlays for training boards.
 * Incorrect feedback uses the drag origin square when the piece snaps back.
 */
export function useTrainingMoveFeedback(
  delayMs?: number,
) {
  const {
    correctMoveSquare,
    showCorrectMove,
    clearCorrectMoveFeedback,
    isShowingCorrectMove,
  } = useCorrectMoveFeedback(delayMs);
  const {
    incorrectMoveSquare,
    showIncorrectMove,
    clearIncorrectMoveFeedback,
    isShowingIncorrectMove,
  } = useIncorrectMoveFeedback(delayMs);

  const clearMoveFeedback = useCallback(() => {
    clearCorrectMoveFeedback();
    clearIncorrectMoveFeedback();
  }, [clearCorrectMoveFeedback, clearIncorrectMoveFeedback]);

  const createDropHandler = useCallback(
    ({
      onCorrect,
      onIncorrect,
      skipIncorrectOverlay = false,
      ...options
    }: CreateTrainingDropHandlerOptions) =>
      createExpectedMoveDropHandler({
        ...options,
        onCorrect: (attempt) => {
          onCorrect?.(attempt);
        },
        onIncorrect: (attempt) => {
          if (!skipIncorrectOverlay) {
            showIncorrectMove(attempt.sourceSquare);
          }
          onIncorrect?.(attempt);
        },
      }),
    [showIncorrectMove],
  );

  return {
    correctMoveSquare,
    incorrectMoveSquare,
    showCorrectMove,
    showIncorrectMove,
    clearMoveFeedback,
    clearCorrectMoveFeedback,
    clearIncorrectMoveFeedback,
    isShowingCorrectMove,
    isShowingIncorrectMove,
    isShowingMoveFeedback:
      isShowingCorrectMove || isShowingIncorrectMove,
    createDropHandler,
  };
}
