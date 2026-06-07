/**
 * Square overlay colors for puzzle boards (check, hint, incorrect).
 */
export const boardSquareHighlightColors = {
  /** Muted red — visible but softer than the incorrect-move highlight. */
  check: 'rgba(140, 38, 38, 0.82)',
  hint: 'rgba(119, 177, 212, 0.75)',
  incorrect: 'rgba(255, 127, 127, 0.8)',
} as const;
