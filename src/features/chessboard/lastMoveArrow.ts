export type ChessboardArrow = [string, string, string];

/** Subtle green arrow visible on light and dark boards (Lichess-style). */
export const DEFAULT_LAST_MOVE_ARROW_COLOR = 'rgba(155, 199, 0, 0.85)';

export const uciToArrow = (
  uci: string,
  color: string = DEFAULT_LAST_MOVE_ARROW_COLOR,
): ChessboardArrow => [uci.slice(0, 2), uci.slice(2, 4), color];

export const lastMoveArrowFromUci = (
  uci: string | null | undefined,
  color: string = DEFAULT_LAST_MOVE_ARROW_COLOR,
): ChessboardArrow[] => {
  if (!uci || uci.length < 4) {
    return [];
  }
  return [uciToArrow(uci, color)];
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
  lastMoveArrowColor?: string,
): ChessboardArrow[] => {
  const lastMove = lastMoveArrowFromUci(lastMoveUci, lastMoveArrowColor);
  if (!lastMove.length) {
    return customArrows ?? [];
  }
  return [...lastMove, ...(customArrows ?? [])];
};
