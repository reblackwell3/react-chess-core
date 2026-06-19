import type { CSSProperties, FC } from 'react';
import type { CustomSquareProps } from 'react-chessboard/dist/chessboard/types';
import { CorrectMoveCheckBadge } from './CorrectMoveCheckBadge';

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 20,
  overflow: 'visible',
};

export function createFeedbackSquareRenderer(
  correctMoveSquare: string,
): FC<CustomSquareProps> {
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
      </div>
    );
  };
}
