import type { ReactNode } from 'react';

export type PlyNavigationTheme = 'light' | 'dark';

/** Navigation state and handlers for stepping through a fixed move list. */
export type PlyNavigationModel = {
  /** 0-based half-move index already played from the line start. */
  plyIndex: number;
  /** Total half-moves in the line. */
  totalPly: number;
  canPrev: boolean;
  canNext: boolean;
  onGoFirst: () => void;
  onGoPrev: () => void;
  onGoNext: () => void;
  onGoLast: () => void;
  onGoTo: (ply: number) => void;
};

/** Passed to {@link PlyNavigationProps.renderPlyNavigation} and {@link DefaultPlyNavigation}. */
export type PlyNavigationRenderProps = PlyNavigationModel & {
  theme: PlyNavigationTheme;
  /** Range scrubber between prev/next. Defaults to true on {@link PlyNavigation}. */
  showScrubber: boolean;
  /** Inline `ply / total` label when the scrubber is hidden. */
  showPlyLabel: boolean;
};

export type PlyNavigationProps = PlyNavigationModel & {
  theme?: PlyNavigationTheme;
  /** Range scrubber between prev/next. Default true. */
  showScrubber?: boolean;
  /**
   * Inline `ply / total` label. Defaults to true when {@link showScrubber} is false,
   * false when the scrubber is shown.
   */
  showPlyLabel?: boolean;
  /** Omit to use {@link DefaultPlyNavigation}. Hosts can supply MUI (or other) UI here. */
  renderPlyNavigation?: (props: PlyNavigationRenderProps) => ReactNode;
};
