import type { FC } from 'react';
import type { CustomSquareProps } from 'react-chessboard/dist/chessboard/types';
import { CorrectMoveCheckBadge } from './CorrectMoveCheckBadge';
import { IncorrectMoveXBadge } from './IncorrectMoveXBadge';
import { MoveQualityDotBadge } from './MoveQualityDotBadge';
import { RefutationMoveBadge } from './RefutationMoveBadge';

export type MoveQualitySquareStyle = {
  bgcolor: string;
};

export type FeedbackSquareRendererOptions = {
  correctMoveSquare?: string | null;
  incorrectMoveSquare?: string | null;
  refutationMoveSquare?: string | null;
  moveQualitySquareStyles?: Record<string, MoveQualitySquareStyle>;
};

export function createFeedbackSquareRenderer({
  correctMoveSquare = null,
  incorrectMoveSquare = null,
  refutationMoveSquare = null,
  moveQualitySquareStyles,
}: FeedbackSquareRendererOptions): FC<CustomSquareProps> | undefined {
  const hasMoveQuality =
    moveQualitySquareStyles != null &&
    Object.keys(moveQualitySquareStyles).length > 0;

  if (
    !correctMoveSquare &&
    !incorrectMoveSquare &&
    !refutationMoveSquare &&
    !hasMoveQuality
  ) {
    return undefined;
  }

  return function FeedbackSquare({ children, style, square, ref }) {
    const moveQualityStyle = moveQualitySquareStyles?.[square];

    return (
      <div
        ref={ref}
        style={{ ...style, position: 'relative', overflow: 'visible' }}
      >
        {children}
        {moveQualityStyle &&
        square !== correctMoveSquare &&
        square !== incorrectMoveSquare &&
        square !== refutationMoveSquare ? (
          <MoveQualityDotBadge bgcolor={moveQualityStyle.bgcolor} />
        ) : null}
        {square === correctMoveSquare ? <CorrectMoveCheckBadge /> : null}
        {square === incorrectMoveSquare ? <IncorrectMoveXBadge /> : null}
        {square === refutationMoveSquare ? <RefutationMoveBadge /> : null}
      </div>
    );
  };
}
