import { useCallback, useEffect, useRef, useState } from 'react';
import { CORRECT_MOVE_FEEDBACK_MS } from './correctMoveFeedbackMs';

export function useIncorrectMoveFeedback(
  delayMs: number = CORRECT_MOVE_FEEDBACK_MS,
) {
  const [incorrectMoveSquare, setIncorrectMoveSquare] = useState<string | null>(
    null,
  );
  const timeoutRef = useRef<number | null>(null);

  const clearIncorrectMoveFeedback = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIncorrectMoveSquare(null);
  }, []);

  const showIncorrectMove = useCallback(
    (originSquare: string, onComplete?: () => void) => {
      clearIncorrectMoveFeedback();
      setIncorrectMoveSquare(originSquare);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setIncorrectMoveSquare(null);
        onComplete?.();
      }, delayMs);
    },
    [clearIncorrectMoveFeedback, delayMs],
  );

  useEffect(() => clearIncorrectMoveFeedback, [clearIncorrectMoveFeedback]);

  return {
    incorrectMoveSquare,
    showIncorrectMove,
    clearIncorrectMoveFeedback,
    isShowingIncorrectMove: incorrectMoveSquare !== null,
  };
}
