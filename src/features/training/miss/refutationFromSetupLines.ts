import {
  formatPvPreview,
  uciPvToSan,
} from '../../engine/formatEvaluation';
import type { EngineEvaluation, EngineLine } from '../../engine/types';
import {
  fenAfterUci,
  lineEvalCpForGap,
  REFUTATION_EVAL_GAP_CP,
} from './refutation';

/** Default play-time search depth when hosts do not pass a target. */
export const DEFAULT_SETUP_REFUTATION_TARGET_DEPTH = 10;

/** @deprecated Renamed — instant cache now requires {@link DEFAULT_SETUP_REFUTATION_TARGET_DEPTH}. */
export const SETUP_REFUTATION_MIN_DEPTH = 4;

export type SetupRefutationCacheOptions = {
  /** Wrong-move multipv line must reach at least this depth. */
  targetDepth?: number;
  /** When true, only use cache after play-time search completes. */
  requireIdle?: boolean;
};

export type SetupRefutationResult = {
  fenAfterWrong: string;
  refutationUci: string;
  refutationSan: string | null;
  refutationLine: string | null;
};

const normalizeUci = (uci: string): string => uci.toLowerCase().trim();

export const findSetupLineByFirstMove = (
  lines: EngineLine[],
  moveUci: string,
): EngineLine | null => {
  const target = normalizeUci(moveUci);
  return (
    lines.find(
      (line) => line.pv[0] && normalizeUci(line.pv[0]) === target,
    ) ?? null
  );
};

/** Eval gap at setup: how much worse the wrong first move is vs the correct one. */
export const setupRefutationEvalGapCp = (
  wrongLine: EngineLine,
  correctLine: EngineLine,
): number | null => {
  const wrongCp = lineEvalCpForGap(wrongLine);
  const correctCp = lineEvalCpForGap(correctLine);
  if (wrongCp === null || correctCp === null) {
    return null;
  }
  return correctCp - wrongCp;
};

const evaluationUsable = (evaluation: EngineEvaluation): boolean =>
  evaluation.status !== 'loading' &&
  evaluation.status !== 'error' &&
  evaluation.lines.length > 0;

/**
 * Instant refutation from play-time multipv on the setup position.
 * Requires the wrong-move line to finish searching to the play-time target depth.
 */
export function tryRefutationFromSetupEvaluation(
  setupFen: string,
  evaluation: EngineEvaluation,
  attemptedUci: string,
  expectedUci: string | null,
  cacheOptions: SetupRefutationCacheOptions = {},
): SetupRefutationResult | null {
  const targetDepth =
    cacheOptions.targetDepth ?? DEFAULT_SETUP_REFUTATION_TARGET_DEPTH;
  const requireIdle = cacheOptions.requireIdle ?? true;

  if (!evaluationUsable(evaluation)) {
    return null;
  }

  if (requireIdle && evaluation.status !== 'idle') {
    return null;
  }

  const wrongLine = findSetupLineByFirstMove(evaluation.lines, attemptedUci);
  if (!wrongLine || wrongLine.depth < targetDepth || wrongLine.pv.length < 2) {
    return null;
  }

  const fenAfterWrong = fenAfterUci(setupFen, attemptedUci);
  if (!fenAfterWrong) {
    return null;
  }

  if (expectedUci) {
    const correctLine =
      findSetupLineByFirstMove(evaluation.lines, expectedUci) ??
      evaluation.lines[0];
    if (!correctLine) {
      return null;
    }
    const gap = setupRefutationEvalGapCp(wrongLine, correctLine);
    if (gap === null || gap < REFUTATION_EVAL_GAP_CP) {
      return null;
    }
  }

  const refutationUci = wrongLine.pv[1];
  const refutationSan =
    uciPvToSan(fenAfterWrong, [refutationUci])[0] ?? refutationUci;
  const refutationLine = wrongLine.pv.length > 1
    ? formatPvPreview(fenAfterWrong, wrongLine.pv.slice(1), 4)
    : null;

  return {
    fenAfterWrong,
    refutationUci,
    refutationSan,
    refutationLine,
  };
};
