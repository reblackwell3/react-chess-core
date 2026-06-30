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
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
};

const labelStyle: CSSProperties = {
  color: '#FFD700',
  fontWeight: 800,
  fontSize: 'clamp(2.75rem, 14vmin, 5rem)',
  lineHeight: 1.1,
  textAlign: 'center',
  padding: '0 16px',
  letterSpacing: '0.04em',
  textShadow: '0 2px 12px rgba(0, 0, 0, 0.85), 0 0 24px rgba(0, 0, 0, 0.5)',
};

/** Centered "COMPLETED" label over the board at game end. */
export const BoardGameCompleteOverlay = ({
  label = 'COMPLETED',
}: {
  label?: string;
}) => (
  <div style={overlayStyle} aria-live="polite">
    <span style={labelStyle}>{label}</span>
  </div>
);
