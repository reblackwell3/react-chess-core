import { Chess } from 'chess.js';
import { applyUciMove } from '../analysis/analysisUtils';
import { fenAtPlyFromStart } from './fenAtPly';

/** Standard chess starting position. */
export const STANDARD_START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Compare positions ignoring move clocks (first four FEN fields). */
export function normalizeFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(' ');
}

/** Apply a UCI move; throws if illegal. */
export function applyUci(chess: Chess, uci: string): void {
  if (!applyUciMove(chess, uci)) {
    throw new Error(`Illegal UCI move: ${uci}`);
  }
}

/** FEN after applying the first `ply` moves from `startFen`. */
export function fenAtPly(
  movesUci: string[],
  ply: number,
  startFen: string = STANDARD_START_FEN,
): string {
  return fenAtPlyFromStart(startFen, movesUci, ply);
}

/** Index of the next move to play to reach `targetFen`, or 0 if not found. */
export function findPlyIndexForFen(
  movesUci: string[],
  targetFen: string,
  startFen: string = STANDARD_START_FEN,
): number {
  const target = normalizeFen(targetFen);
  const chess = new Chess(startFen);

  if (normalizeFen(chess.fen()) === target) {
    return 0;
  }

  for (let i = 0; i < movesUci.length; i++) {
    applyUci(chess, movesUci[i]!);
    if (normalizeFen(chess.fen()) === target) {
      return i + 1;
    }
  }

  return 0;
}
