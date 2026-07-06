import type { CSSProperties, FC } from 'react';
import type { CustomSquareProps } from 'react-chessboard/dist/chessboard/types';
import { CorrectMoveCheckBadge } from './CorrectMoveCheckBadge';
import { IncorrectMoveXBadge } from './IncorrectMoveXBadge';
import { MoveQualityDotBadge } from './MoveQualityDotBadge';
import { RefutationMoveBadge } from './RefutationMoveBadge';

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 20,
  overflow: 'visible',
};

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
        {square === correctMoveSquare ? (
          <div style={overlayStyle}>
            <CorrectMoveCheckBadge />
          </div>
        ) : null}
        {square === incorrectMoveSquare ? (
          <div style={overlayStyle}>
            <IncorrectMoveXBadge />
          </div>
        ) : null}
        {square === refutationMoveSquare ? (
          <div style={overlayStyle}>
            <RefutationMoveBadge />
          </div>
        ) : null}
      </div>
    );
  };
}
