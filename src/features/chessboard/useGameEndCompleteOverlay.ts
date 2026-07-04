import { useEffect, useRef, useState } from 'react';
import { GAME_END_COMPLETE_OVERLAY_MS } from './useTimedOverlay';

/**
 * Shows the game-end overlay for {@link GAME_END_COMPLETE_OVERLAY_MS} once the
 * game is complete and any blocking flow (e.g. replay segment recap) has finished.
 */
export function useGameEndCompleteOverlay(
  complete: boolean,
  segmentBusy: boolean,
): boolean {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!complete) {
      clearTimer();
      setVisible(false);
      return;
    }

    if (segmentBusy) {
      clearTimer();
      setVisible(false);
      return;
    }

    setVisible(true);
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setVisible(false);
    }, GAME_END_COMPLETE_OVERLAY_MS);

    return clearTimer;
  }, [complete, segmentBusy]);

  return visible;
}
