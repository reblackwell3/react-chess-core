import type { CSSProperties } from 'react';

const badgeStyle: CSSProperties = {
  position: 'absolute',
  right: '6%',
  bottom: '6%',
  width: '22%',
  height: '22%',
  minWidth: 12,
  minHeight: 12,
  maxWidth: 22,
  maxHeight: 22,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  pointerEvents: 'none',
  zIndex: 25,
};

/** Small colored circle anchored to the bottom-right of a destination square. */
export const MoveQualityDotBadge = ({
  bgcolor,
}: {
  bgcolor: string;
}) => (
  <span aria-hidden style={{ ...badgeStyle, backgroundColor: bgcolor }} />
);
