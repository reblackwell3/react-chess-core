import { defaultRenderPlyNavigation } from './DefaultPlyNavigation';
import type { PlyNavigationProps } from './types';
import { usePositionKeyboardNav } from './usePositionKeyboardNav';

/**
 * Step through a fixed move list. Omit {@link PlyNavigationProps.renderPlyNavigation}
 * for the default inline-styled UI, or pass a custom renderer (e.g. MUI controls).
 */
export const PlyNavigation = ({
  plyIndex,
  totalPly,
  canPrev,
  canNext,
  onGoFirst,
  onGoPrev,
  onGoNext,
  onGoLast,
  onGoTo,
  theme = 'dark',
  keyboardNav = true,
  showScrubber = true,
  showPlyLabel,
  renderPlyNavigation = defaultRenderPlyNavigation,
}: PlyNavigationProps) => {
  usePositionKeyboardNav({
    enabled: keyboardNav,
    canPrev,
    canNext,
    onPrev: onGoPrev,
    onNext: onGoNext,
    onFirst: onGoFirst,
    onLast: onGoLast,
  });

  return renderPlyNavigation({
    plyIndex,
    totalPly,
    canPrev,
    canNext,
    onGoFirst,
    onGoPrev,
    onGoNext,
    onGoLast,
    onGoTo,
    theme,
    showScrubber,
    showPlyLabel: showPlyLabel ?? !showScrubber,
  });
};
