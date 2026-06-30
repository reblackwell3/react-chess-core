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
  width: '72%',
  padding: '8% 6%',
  borderRadius: '999px',
  backgroundColor: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: '#fff',
  fontWeight: 800,
  fontSize: 'clamp(0.95rem, 5.2vw, 1.65rem)',
  letterSpacing: '0.06em',
  lineHeight: 1.15,
  textAlign: 'center',
  textTransform: 'uppercase',
};

/** Large prompt centered over the board when replay resumes after a segment recap. */
export const BoardYourMoveAgainOverlay = () => (
  <div aria-live="polite" style={overlayStyle}>
    <div style={badgeStyle}>
      <p style={labelStyle}>Your move again</p>
    </div>
  </div>
);
