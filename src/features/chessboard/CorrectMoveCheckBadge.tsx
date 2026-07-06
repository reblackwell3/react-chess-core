import type { CSSProperties } from 'react';

const badgeStyle: CSSProperties = {
  position: 'absolute',
  right: '6%',
  bottom: '6%',
  width: '26%',
  height: '26%',
  minWidth: 14,
  minHeight: 14,
  maxWidth: 26,
  maxHeight: 26,
  borderRadius: '50%',
  backgroundColor: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
  zIndex: 25,
};

/** Green circle with a white check, anchored to the bottom-right of a square
 *  square (over the piece). */
export const CorrectMoveCheckBadge = () => (
  <span aria-hidden style={badgeStyle}>
    <svg
      viewBox="0 0 12 12"
      width="62%"
      height="62%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6.2 5 8.7 9.5 3.8"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);
