import {
  DEFAULT_MISS_RETRY_POLICY,
  normalizeMissRetryPolicy,
  resolvePostMissPhase,
} from './missRetryPolicy';

describe('normalizeMissRetryPolicy', () => {
  it('defaults to answer-arrow mode with a two-miss cap', () => {
    expect(normalizeMissRetryPolicy()).toEqual(DEFAULT_MISS_RETRY_POLICY);
  });

  it('maps legacy autoShowWrongMoves false to retry mode', () => {
    expect(normalizeMissRetryPolicy(undefined, false)).toEqual({
      allowRetryOnIncorrect: true,
      maxMissAttempts: 2,
    });
  });

  it('maps legacy autoShowWrongMoves true to answer-arrow mode', () => {
    expect(normalizeMissRetryPolicy(undefined, true)).toEqual({
      allowRetryOnIncorrect: false,
      maxMissAttempts: 2,
    });
  });
});

describe('resolvePostMissPhase', () => {
  const retryPolicy = {
    allowRetryOnIncorrect: true,
    maxMissAttempts: 2,
  };

  it('always shows the answer arrow when retry is disabled', () => {
    expect(
      resolvePostMissPhase(
        { allowRetryOnIncorrect: false, maxMissAttempts: 2 },
        1,
      ),
    ).toBe('answer');
  });

  it('allows one blind retry before forcing the answer arrow', () => {
    expect(resolvePostMissPhase(retryPolicy, 1)).toBe('retry');
    expect(resolvePostMissPhase(retryPolicy, 2)).toBe('answer');
  });
});
