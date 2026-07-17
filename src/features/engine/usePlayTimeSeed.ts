import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayTimeSeedEvaluation } from './PlayTimeEngineContext';

export type GetPlayTimeSeed = (
  fen: string,
) => Promise<PlayTimeSeedEvaluation | null>;

/** How long to hold Stockfish start while the cache lookup is in flight. */
export const PLAY_TIME_SEED_TIMEOUT_MS = 1000;

type SeedState = {
  fen: string;
  seed: PlayTimeSeedEvaluation | null;
  pending: boolean;
};

/**
 * Fetches a cached play-time evaluation for the setup FEN. Stockfish start is
 * held (`seedPending`) until the lookup resolves or times out; a response
 * arriving after the timeout is discarded so it cannot race the local engine.
 */
export function usePlayTimeSeed(
  fen: string,
  enabled: boolean,
  getSeed?: GetPlayTimeSeed,
  timeoutMs: number = PLAY_TIME_SEED_TIMEOUT_MS,
): { seedEvaluation: PlayTimeSeedEvaluation | null; seedPending: boolean } {
  const [state, setState] = useState<SeedState | null>(null);
  const getSeedRef = useRef(getSeed);
  getSeedRef.current = getSeed;

  useEffect(() => {
    if (!enabled || !fen || !getSeedRef.current) {
      setState(null);
      return undefined;
    }

    let cancelled = false;
    let timedOut = false;
    setState({ fen, seed: null, pending: true });

    const timer = window.setTimeout(() => {
      timedOut = true;
      setState((current) =>
        current?.fen === fen ? { ...current, pending: false } : current,
      );
    }, timeoutMs);

    getSeedRef
      .current(fen)
      .then((seed) => {
        if (cancelled || timedOut) {
          return;
        }
        window.clearTimeout(timer);
        setState({ fen, seed, pending: false });
      })
      .catch(() => {
        if (cancelled || timedOut) {
          return;
        }
        window.clearTimeout(timer);
        setState({ fen, seed: null, pending: false });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, fen, timeoutMs]);

  return useMemo(
    () => ({
      seedEvaluation: state?.fen === fen ? state.seed : null,
      seedPending: state?.fen === fen ? state.pending : false,
    }),
    [fen, state],
  );
}
