import { boardArrowColors } from './boardArrowColors';

export type ChessboardArrow = [string, string, string];

export const uciToArrow = (uci: string): ChessboardArrow => [
  uci.slice(0, 2),
  uci.slice(2, 4),
  boardArrowColors.lastMove,
];

export const lastMoveArrowFromUci = (
  uci: string | null | undefined,
): ChessboardArrow[] => {
  if (!uci || uci.length < 4) {
    return [];
  }
  return [uciToArrow(uci)];
};

/** UCI of the move that produced the position at {@link plyIndex}. */
export const lastMoveUciAtPly = (
  movesUci: readonly string[],
  plyIndex: number,
): string | null => {
  if (plyIndex <= 0) {
    return null;
  }
  return movesUci[plyIndex - 1] ?? null;
};

export const mergeCustomArrowsWithLastMove = (
  customArrows: ChessboardArrow[] | undefined,
  lastMoveUci: string | null | undefined,
): ChessboardArrow[] => {
  const lastMove = lastMoveArrowFromUci(lastMoveUci);
  if (!lastMove.length) {
    return customArrows ?? [];
  }
  return [...lastMove, ...(customArrows ?? [])];
};
