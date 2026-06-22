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

const CHECK_OVERLAY_SIZE = '42%';

const badgeStyle = (variant: 'success' | 'partial'): CSSProperties => ({
  width: CHECK_OVERLAY_SIZE,
  height: CHECK_OVERLAY_SIZE,
  borderRadius: '50%',
  backgroundColor: variant === 'success' ? '#2e7d32' : '#616161',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
});

export type BoardCompleteCheckVariant = 'success' | 'partial';

/** Medium check centered over the full chessboard when a line completes. */
export const BoardCompleteCheckOverlay = ({
  variant = 'success',
}: {
  /** Green for a clean solve; grey when the line finished after a miss, hint, or reveal. */
  variant?: BoardCompleteCheckVariant;
}) => (
  <div aria-hidden style={overlayStyle}>
    <span style={badgeStyle(variant)}>
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
