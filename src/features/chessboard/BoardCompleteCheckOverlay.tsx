import type { CSSProperties } from 'react';

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 10,
  borderRadius: 4,
};

const badgeStyle: CSSProperties = {
  width: '58%',
  height: '58%',
  borderRadius: '50%',
  backgroundColor: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
};

/** Large green check centered over the full chessboard when a line completes. */
export const BoardCompleteCheckOverlay = () => (
  <div aria-hidden style={overlayStyle}>
    <span style={badgeStyle}>
      <svg
        viewBox="0 0 24 24"
        width="58%"
        height="58%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 13l4 4L19 7"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </div>
);
