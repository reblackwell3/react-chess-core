import { Chess, Square } from 'chess.js';

/** Apply a UCI move (e.g. `e7e8q`) without throwing. */
export function applyUciMove(chess: Chess, uci: string): boolean {
  if (!uci || uci.length < 4) {
    return false;
  }

  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length > 4 ? uci[4] : undefined;

  try {
    return chess.move({ from, to, promotion }) !== null;
  } catch {
    try {
      chess.move(uci);
      return true;
    } catch {
      return false;
    }
  }
}

export function getCheckSquareFromChess(chess: Chess): string {
  if (!chess.inCheck()) {
    return '';
  }

  const turn = chess.turn();
  const board = chess.board();

  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      const piece = board[rowIndex][colIndex];
      if (piece?.type === 'k' && piece.color === turn) {
        return String.fromCharCode(97 + colIndex) + (8 - rowIndex);
      }
    }
  }

  return '';
}
