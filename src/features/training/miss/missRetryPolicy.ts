export type MissRetryPolicy = {
  /**
   * When true, the user returns to the setup position to try again without the
   * answer arrow until {@link maxMissAttempts} is reached. Default false —
   * show the best-move arrow and expect a drag along it.
   */
  allowRetryOnIncorrect?: boolean;
  /** Wrong attempts on the same ply before the answer arrow is shown. Default 2. */
  maxMissAttempts?: number;
};

export const DEFAULT_MAX_MISS_ATTEMPTS = 2;

export const DEFAULT_MISS_RETRY_POLICY: Required<MissRetryPolicy> = {
  allowRetryOnIncorrect: false,
  maxMissAttempts: DEFAULT_MAX_MISS_ATTEMPTS,
};

/** Normalize policy, including legacy {@link autoShowWrongMoves} (inverse of retry). */
export function normalizeMissRetryPolicy(
  policy?: MissRetryPolicy,
  autoShowWrongMoves?: boolean,
): Required<MissRetryPolicy> {
  if (policy) {
    return { ...DEFAULT_MISS_RETRY_POLICY, ...policy };
  }
  if (autoShowWrongMoves === false) {
    return {
      allowRetryOnIncorrect: true,
      maxMissAttempts: DEFAULT_MISS_RETRY_POLICY.maxMissAttempts,
    };
  }
  return DEFAULT_MISS_RETRY_POLICY;
}

export function resolvePostMissPhase(
  policy: Required<MissRetryPolicy>,
  attemptCount: number,
): 'answer' | 'retry' {
  if (!policy.allowRetryOnIncorrect) {
    return 'answer';
  }
  if (attemptCount >= policy.maxMissAttempts) {
    return 'answer';
  }
  return 'retry';
}

export function missRetryPolicyFromAutoShowWrongMoves(
  autoShowWrongMoves: boolean,
): Required<MissRetryPolicy> {
  return normalizeMissRetryPolicy(undefined, autoShowWrongMoves);
}
