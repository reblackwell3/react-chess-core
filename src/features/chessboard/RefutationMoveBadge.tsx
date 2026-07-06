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
  backgroundColor: '#ef6c00',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
  zIndex: 25,
};

/** Orange circle with a white exclamation mark, anchored to the bottom-right of a square. */
export const RefutationMoveBadge = () => (
  <span aria-hidden style={badgeStyle}>
    <svg
      viewBox="0 0 12 12"
      width="58%"
      height="58%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2.5v4.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="9.2" r="0.9" fill="#fff" />
    </svg>
  </span>
);
