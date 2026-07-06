import { getMissDisplay, type MissSequenceState } from './missDisplay';

const setupFen =
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
const expectedUci = 'e7e5';
const attemptedUci = 'd7d5';
const refutationUci = 'e4d5';
const answerArrowColor = '#1976d2';

function sequence(
  phase: MissSequenceState['phase'],
  shownRefutationUci?: string | null,
): MissSequenceState {
  return {
    setupFen,
    attemptedUci,
    phase,
    attemptCount: 1,
    shownRefutationUci,
  };
}

describe('getMissDisplay refutation phase', () => {
  it('uses shownRefutationUci when engine output later clears', () => {
    const display = getMissDisplay(
      sequence('refutation', refutationUci),
      expectedUci,
      null,
      answerArrowColor,
    );

    expect(display.refutationMoveSquare).toBe('d5');
    expect(display.lastMoveUci).toBe(refutationUci);
    expect(display.fen).toBe(
      'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
    );
  });
});
