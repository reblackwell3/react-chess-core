import { Chess } from 'chess.js';
import { applyUciMove } from '../analysis/analysisUtils';

/** FEN after applying the first `ply` moves from `startFen`. */
export function fenAtPlyFromStart(
  startFen: string,
  movesUci: string[],
  ply: number,
): string {
  const chess = new Chess(startFen);
  for (let i = 0; i < ply && i < movesUci.length; i++) {
    applyUciMove(chess, movesUci[i]!);
  }
  return chess.fen();
}
