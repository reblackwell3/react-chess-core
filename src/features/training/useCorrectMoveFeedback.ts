import { useCallback, useEffect, useRef, useState } from 'react';
import { CORRECT_MOVE_FEEDBACK_MS } from './correctMoveFeedbackMs';

export function useCorrectMoveFeedback(
  delayMs: number = CORRECT_MOVE_FEEDBACK_MS,
) {
  const [correctMoveSquare, setCorrectMoveSquare] = useState<string | null>(
    null,
  );
  const timeoutRef = useRef<number | null>(null);

  const clearCorrectMoveFeedback = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCorrectMoveSquare(null);
  }, []);

  const showCorrectMove = useCallback(
    (targetSquare: string, onComplete?: () => void) => {
      clearCorrectMoveFeedback();
      setCorrectMoveSquare(targetSquare);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setCorrectMoveSquare(null);
        onComplete?.();
      }, delayMs);
    },
    [clearCorrectMoveFeedback, delayMs],
  );

  useEffect(() => clearCorrectMoveFeedback, [clearCorrectMoveFeedback]);

  return {
    correctMoveSquare,
    showCorrectMove,
    clearCorrectMoveFeedback,
    isShowingCorrectMove: correctMoveSquare !== null,
  };
}
