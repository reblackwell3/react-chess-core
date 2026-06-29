import { useEffect, useRef, useState } from 'react';

/** How long the game-end "Complete" label stays on the board. */
export const GAME_END_COMPLETE_OVERLAY_MS = 1500;

/**
 * Shows an overlay for {@link durationMs} after `active` becomes true.
 * Resets when `active` becomes false so scrubbing away and back can retrigger.
 */
export function useTimedOverlay(active: boolean, durationMs: number): boolean {
  const [visible, setVisible] = useState(false);
  const armedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      armedRef.current = false;
      setVisible(false);
      return;
    }

    if (armedRef.current) {
      return;
    }

    armedRef.current = true;
    setVisible(true);
    const id = window.setTimeout(() => {
      setVisible(false);
    }, durationMs);

    return () => {
      window.clearTimeout(id);
    };
  }, [active, durationMs]);

  return visible;
}
