import { Chess, type Square } from 'chess.js';

/** Resolve a board drag into a legal UCI string, or null when illegal. */
export function uciFromDrop(
  fen: string,
  sourceSquare: string,
  targetSquare: string,
  piece: string,
): string | null {
  const chess = new Chess(fen);
  const pieceType = piece[1]?.toLowerCase();
  const legal = chess
    .moves({ square: sourceSquare as Square, verbose: true })
    .find(
      (move) =>
        move.to === targetSquare &&
        (!move.promotion || move.promotion === pieceType),
    );
  if (!legal) return null;
  return `${legal.from}${legal.to}${legal.promotion ?? ''}`;
}

export function matchesExpectedUci(
  uci: string,
  expectedUci: string,
): boolean {
  return uci.toLowerCase() === expectedUci.toLowerCase();
}
