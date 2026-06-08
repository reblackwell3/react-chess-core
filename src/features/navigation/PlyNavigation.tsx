import { defaultRenderPlyNavigation } from './DefaultPlyNavigation';
import type { PlyNavigationProps } from './types';

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
  showScrubber = true,
  showPlyLabel,
  renderPlyNavigation = defaultRenderPlyNavigation,
}: PlyNavigationProps) =>
  renderPlyNavigation({
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
