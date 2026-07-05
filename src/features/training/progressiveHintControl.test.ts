import { getProgressiveHintControl } from './progressiveHintControl';

describe('getProgressiveHintControl', () => {
  it('returns disabled hint when neither hint nor reveal is available', () => {
    expect(
      getProgressiveHintControl({ canShowHint: false, canShowReveal: false }),
    ).toEqual({
      visible: true,
      label: 'Hint',
      disabled: true,
      phase: 'hint',
    });
  });

  it('returns hint phase when hint is available', () => {
    expect(
      getProgressiveHintControl({ canShowHint: true, canShowReveal: true }),
    ).toEqual({
      visible: true,
      label: 'Hint',
      disabled: false,
      phase: 'hint',
    });
  });

  it('returns reveal phase after hint is used', () => {
    expect(
      getProgressiveHintControl({ canShowHint: false, canShowReveal: true }),
    ).toEqual({
      visible: true,
      label: 'Show move',
      disabled: false,
      phase: 'reveal',
    });
  });

  it('supports custom reveal label for puzzles', () => {
    expect(
      getProgressiveHintControl({
        canShowHint: false,
        canShowReveal: true,
        revealLabel: 'Show solution',
      }),
    ).toMatchObject({ label: 'Show solution', phase: 'reveal' });
  });

  it('disables hint when reveal is not allowed and hint is unavailable', () => {
    expect(
      getProgressiveHintControl({ canShowHint: false, canShowReveal: false }),
    ).toEqual({
      visible: true,
      label: 'Hint',
      disabled: true,
      phase: 'hint',
    });
  });
});
