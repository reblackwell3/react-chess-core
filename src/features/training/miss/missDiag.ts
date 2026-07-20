const PREFIX = '[miss-diag]';

/** Origin for t= offsets within a single miss sequence. */
let missOriginMs: number | null = null;

const isEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    // Opt out with localStorage.setItem('endchess.debug.miss', '0')
    // Opt in (default while debugging) with anything else / unset.
    return window.localStorage.getItem('endchess.debug.miss') !== '0';
  } catch {
    return true;
  }
};

const visibilityState = (): string =>
  typeof document !== 'undefined' ? document.visibilityState : 'n/a';

/** Mark the start of a miss sequence; subsequent logs report t= ms since this. */
export const missDiagStart = (
  event: string,
  detail: Record<string, unknown> = {},
): void => {
  if (!isEnabled()) {
    return;
  }
  missOriginMs = performance.now();
  // eslint-disable-next-line no-console -- temporary miss-sequence diagnostics
  console.info(PREFIX, event, {
    t: 0,
    visibility: visibilityState(),
    ...detail,
  });
};

export const missDiag = (
  event: string,
  detail: Record<string, unknown> = {},
): void => {
  if (!isEnabled()) {
    return;
  }
  const t =
    missOriginMs == null
      ? null
      : Math.round(performance.now() - missOriginMs);
  // eslint-disable-next-line no-console -- temporary miss-sequence diagnostics
  console.info(PREFIX, event, {
    t,
    visibility: visibilityState(),
    ...detail,
  });
};
