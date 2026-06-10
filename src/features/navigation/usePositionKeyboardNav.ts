import { useEffect } from 'react';
import {
  isEditableKeyboardTarget,
  type PositionKeyboardNavOptions,
} from './positionKeyboardNav';

/**
 * Global keyboard shortcuts for browsing positions:
 * - ArrowLeft: previous
 * - ArrowRight: next
 * - Home: first (when {@link PositionKeyboardNavOptions.onFirst} is provided)
 * - End: last (when {@link PositionKeyboardNavOptions.onLast} is provided)
 *
 * Ignores keypresses while focus is in an input, textarea, select, or
 * contenteditable element, and ignores modified keys (Alt/Ctrl/Meta).
 */
export function usePositionKeyboardNav({
  enabled = true,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onFirst,
  onLast,
}: PositionKeyboardNavOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (!canPrev) {
            return;
          }
          event.preventDefault();
          onPrev();
          break;
        case 'ArrowRight':
          if (!canNext) {
            return;
          }
          event.preventDefault();
          onNext();
          break;
        case 'Home':
          if (!onFirst || !canPrev) {
            return;
          }
          event.preventDefault();
          onFirst();
          break;
        case 'End':
          if (!onLast || !canNext) {
            return;
          }
          event.preventDefault();
          onLast();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, canPrev, canNext, onPrev, onNext, onFirst, onLast]);
}
