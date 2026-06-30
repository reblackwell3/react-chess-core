import {
  DEFAULT_EVAL_BAR_MAX_PAWNS,
  evalBarTickValues,
  evalTickToPercent,
  evalToBarPercent,
  formatEvalBarLabel,
} from './positionEvalBarUtils';

describe('evalToBarPercent', () => {
  it('maps pawn eval across the bar scale', () => {
    expect(evalToBarPercent(500, null)).toBe(100);
    expect(evalToBarPercent(-500, null)).toBe(0);
    expect(evalToBarPercent(0, null)).toBe(50);
    expect(evalToBarPercent(100, null)).toBe(60);
    expect(evalToBarPercent(-100, null)).toBe(40);
  });

  it('clamps beyond the configured max', () => {
    expect(evalToBarPercent(900, null, DEFAULT_EVAL_BAR_MAX_PAWNS)).toBe(100);
    expect(evalToBarPercent(-900, null, DEFAULT_EVAL_BAR_MAX_PAWNS)).toBe(0);
  });

  it('pins mate scores to the bar edges', () => {
    expect(evalToBarPercent(null, 3)).toBe(100);
    expect(evalToBarPercent(null, -2)).toBe(0);
  });
});

describe('evalTickToPercent', () => {
  it('aligns integer ticks on the scale', () => {
    expect(evalTickToPercent(-5)).toBe(0);
    expect(evalTickToPercent(0)).toBe(50);
    expect(evalTickToPercent(5)).toBe(100);
    expect(evalTickToPercent(1)).toBe(60);
  });
});

describe('evalBarTickValues', () => {
  it('generates integer pawn ticks across the configured range', () => {
    expect(evalBarTickValues(2)).toEqual([-2, -1, 0, 1, 2]);
  });
});

describe('formatEvalBarLabel', () => {
  it('formats mate and centipawn labels', () => {
    expect(formatEvalBarLabel(null, 3)).toBe('#3');
    expect(formatEvalBarLabel(null, -2)).toBe('#-2');
    expect(formatEvalBarLabel(null, null)).toBe('…');
    expect(formatEvalBarLabel(0, null)).toBe('0.0');
    expect(formatEvalBarLabel(125, null)).toBe('+1.3');
    expect(formatEvalBarLabel(-80, null)).toBe('-0.8');
  });
});

describe('evalToBarPercent edge cases', () => {
  it('centers unknown eval at 50%', () => {
    expect(evalToBarPercent(null, null)).toBe(50);
  });
});
