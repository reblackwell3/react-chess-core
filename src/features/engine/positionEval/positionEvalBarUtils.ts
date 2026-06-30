export const DEFAULT_EVAL_BAR_MAX_PAWNS = 5;

/** Map a white-perspective eval to a 0–100 bar position (+5 → 100, −5 → 0). */
export function evalToBarPercent(
  centipawns: number | null,
  mate: number | null,
  maxPawns = DEFAULT_EVAL_BAR_MAX_PAWNS,
): number {
  if (mate !== null) {
    return mate > 0 ? 100 : 0;
  }
  if (centipawns === null) {
    return 50;
  }
  const pawns = centipawns / 100;
  const clamped = Math.max(-maxPawns, Math.min(maxPawns, pawns));
  return ((clamped + maxPawns) / (2 * maxPawns)) * 100;
}

export const evalBarTickValues = (
  maxPawns = DEFAULT_EVAL_BAR_MAX_PAWNS,
): number[] => {
  const ticks: number[] = [];
  for (let value = -maxPawns; value <= maxPawns; value += 1) {
    ticks.push(value);
  }
  return ticks;
};

export const evalTickToPercent = (
  pawnValue: number,
  maxPawns = DEFAULT_EVAL_BAR_MAX_PAWNS,
): number => ((pawnValue + maxPawns) / (2 * maxPawns)) * 100;

/** Compact eval label for the vertical bar (Chess.com-style). */
export function formatEvalBarLabel(
  centipawns: number | null,
  mate: number | null,
): string {
  if (mate !== null) {
    return mate > 0 ? `#${mate}` : `#${mate}`;
  }
  if (centipawns === null) {
    return '…';
  }
  const pawns = centipawns / 100;
  if (Math.abs(pawns) < 0.05) {
    return '0.0';
  }
  const sign = pawns > 0 ? '+' : '';
  return `${sign}${pawns.toFixed(1)}`;
}
