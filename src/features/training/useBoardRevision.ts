import { useCallback, useState } from 'react';

/**
 * Bump the revision counter to force a controlled chessboard re-render after a
 * rejected drop. Pair with returning `false` from `onPieceDrop` so the board
 * snaps back without changing the controlled `position` FEN.
 */
export function useBoardRevision() {
  const [revision, setRevision] = useState(0);
  const bumpRevision = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  return { revision, bumpRevision };
}
