/**
 * Board arrow colors — change these values to update arrows app-wide.
 */
export const boardArrowColors = {
  /** Arrow showing the move that reached the current position. */
  lastMove: 'rgba(130, 130, 130, 0.75)',
  /** Arrow showing the correct / answer move during training. */
  answer: '#1976d2',
} as const;

/** @deprecated Use {@link boardArrowColors.lastMove} */
export const DEFAULT_LAST_MOVE_ARROW_COLOR = boardArrowColors.lastMove;

/** @deprecated Use {@link boardArrowColors.answer} */
export const DEFAULT_ANSWER_ARROW_COLOR = boardArrowColors.answer;
