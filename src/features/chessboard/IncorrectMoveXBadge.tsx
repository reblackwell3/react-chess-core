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
  backgroundColor: '#c62828',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
  zIndex: 25,
};

/** Red circle with a white X, anchored to the bottom-right of a square. */
export const IncorrectMoveXBadge = () => (
  <span aria-hidden style={badgeStyle}>
    <svg
      viewBox="0 0 12 12"
      width="58%"
      height="58%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.2 3.2 8.8 8.8M8.8 3.2 3.2 8.8"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </span>
);
