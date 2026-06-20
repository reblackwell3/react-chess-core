import type { CSSProperties, FC } from 'react';
import type { CustomSquareProps } from 'react-chessboard/dist/chessboard/types';
import { CorrectMoveCheckBadge } from './CorrectMoveCheckBadge';
import { IncorrectMoveXBadge } from './IncorrectMoveXBadge';

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 20,
  overflow: 'visible',
};

export type FeedbackSquareRendererOptions = {
  correctMoveSquare?: string | null;
  incorrectMoveSquare?: string | null;
};

export function createFeedbackSquareRenderer({
  correctMoveSquare = null,
  incorrectMoveSquare = null,
}: FeedbackSquareRendererOptions): FC<CustomSquareProps> | undefined {
  if (!correctMoveSquare && !incorrectMoveSquare) {
    return undefined;
  }

  return function FeedbackSquare({ children, style, square, ref }) {
    return (
      <div
        ref={ref}
        style={{ ...style, position: 'relative', overflow: 'visible' }}
      >
        {children}
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
      </div>
    );
  };
}
