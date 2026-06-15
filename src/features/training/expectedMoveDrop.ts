import { matchesExpectedUci, uciFromDrop } from './uciFromDrop';

export type ExpectedMoveDropResult =
  | { kind: 'ignored' }
  | { kind: 'illegal' }
  | { kind: 'correct'; uci: string }
  | { kind: 'incorrect'; uci: string };

export type CreateExpectedMoveDropHandlerOptions = {
  fen: string;
  expectedUci: string | null | undefined;
  enabled: boolean;
  onCorrect: (uci: string) => void;
  onIncorrect: (uci: string) => void;
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

  if (matchesExpectedUci(uci, expectedUci)) {
    return { kind: 'correct', uci };
  }

  return { kind: 'incorrect', uci };
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
        onCorrect(result.uci);
        return true;
      case 'incorrect':
        onIncorrect(result.uci);
        return false;
      default:
        return false;
    }
  };
}
