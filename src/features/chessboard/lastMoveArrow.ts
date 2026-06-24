import type { ComponentProps } from 'react';
import { Chessboard } from 'react-chessboard';
import { boardArrowColors } from './boardArrowColors';

export type ChessboardArrow = NonNullable<
  ComponentProps<typeof Chessboard>['customArrows']
>[number];

export const uciToArrow = (uci: string): ChessboardArrow =>
  [uci.slice(0, 2), uci.slice(2, 4), boardArrowColors.lastMove] as ChessboardArrow;
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

/** Like {@link lastMoveUciAtPly}, but uses a line-entry setup move at ply 0. */
export const lastMoveUciForLinePly = (
  movesUci: readonly string[],
  plyIndex: number,
  lineSetupUci?: string | null,
): string | null => {
  if (plyIndex > 0) {
    return lastMoveUciAtPly(movesUci, plyIndex);
  }
  return lineSetupUci ?? null;
};

/** First ply index where the trainer/quiz position is shown after an optional setup move. */
export const trainerLinePlyIndex = (movesUci: readonly string[]): number =>
  movesUci.length > 1 ? 1 : 0;

export type ChessboardLineContext = {
  movesUci: readonly string[];
  plyIndex: number;
  setupUci?: string | null;
};

export type ResolveLastMoveUciInput = {
  lastMoveUci?: string | null;
  lineContext?: ChessboardLineContext;
};

/** Resolve the last-move UCI for a board position from explicit or line context. */
export const resolveLastMoveUci = ({
  lastMoveUci,
  lineContext,
}: ResolveLastMoveUciInput): string | null => {
  if (lastMoveUci !== undefined) {
    return lastMoveUci;
  }
  if (lineContext) {
    return lastMoveUciForLinePly(
      lineContext.movesUci,
      lineContext.plyIndex,
      lineContext.setupUci,
    );
  }
  return null;
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
