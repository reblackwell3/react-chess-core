/**
 * Square overlay colors for puzzle boards (check, hint, incorrect).
 */
export const boardSquareHighlightColors = {
  check: 'rgba(255, 127, 127, 0.8)',
  hint: 'rgba(119, 177, 212, 0.75)',
  /** Muted red — softer than the in-check highlight. */
  incorrect: 'rgba(140, 38, 38, 0.82)',
  selected: 'rgba(255, 255, 0, 0.45)',
  moveTarget:
    'radial-gradient(circle, rgba(0, 0, 0, 0.18) 22%, transparent 22%)',
  captureTarget:
    'radial-gradient(circle, rgba(0, 0, 0, 0.18) 72%, transparent 72%)',
} as const;
