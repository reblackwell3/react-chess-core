import { matchesExpectedUci, uciFromDrop } from './uciFromDrop';

export type ExpectedMoveAttempt = {
  uci: string;
  sourceSquare: string;
  targetSquare: string;
};

export type ExpectedMoveDropResult =
  | { kind: 'ignored' }
  | { kind: 'illegal' }
  | { kind: 'correct'; attempt: ExpectedMoveAttempt }
  | { kind: 'incorrect'; attempt: ExpectedMoveAttempt };

export type CreateExpectedMoveDropHandlerOptions = {
  fen: string;
  expectedUci: string | null | undefined;
  enabled: boolean;
  onCorrect: (attempt: ExpectedMoveAttempt) => void;
  onIncorrect: (attempt: ExpectedMoveAttempt) => void;
};

/**
 * Evaluate a training drop without mutating board position.
 * Returns `false` for incorrect attempts so react-chessboard snaps the piece back.
 */
export function evaluateExpectedMoveDrop(
  fen: string,
  sourceSquare: string,
  targetSquare: string,
  piece: string,
  expectedUci: string | null | undefined,
  enabled: boolean,
): ExpectedMoveDropResult {
  if (!enabled || !expectedUci) {
    return { kind: 'ignored' };
  }

  const uci = uciFromDrop(fen, sourceSquare, targetSquare, piece);
  if (!uci) {
    return { kind: 'illegal' };
  }

  const attempt: ExpectedMoveAttempt = {
    uci,
    sourceSquare,
    targetSquare,
  };

  if (matchesExpectedUci(uci, expectedUci)) {
    return { kind: 'correct', attempt };
  }

  return { kind: 'incorrect', attempt };
}

export function createExpectedMoveDropHandler({
  fen,
  expectedUci,
  enabled,
  onCorrect,
  onIncorrect,
}: CreateExpectedMoveDropHandlerOptions) {
  return (sourceSquare: string, targetSquare: string, piece: string): boolean => {
    const result = evaluateExpectedMoveDrop(
      fen,
      sourceSquare,
      targetSquare,
      piece,
      expectedUci,
      enabled,
    );

    switch (result.kind) {
      case 'correct':
        onCorrect(result.attempt);
        return true;
      case 'incorrect':
        onIncorrect(result.attempt);
        return false;
      default:
        return false;
    }
  };
}
