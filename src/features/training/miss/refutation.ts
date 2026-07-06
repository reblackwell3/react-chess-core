import { Chess } from 'chess.js';
import { applyUciMove } from '../../analysis/analysisUtils';
import {
  formatPvPreview,
  uciPvToSan,
} from '../../engine/formatEvaluation';
import type { AnalysisEngineOptions, EngineEvaluation, EngineLine } from '../../engine/types';

/** Minimum eval loss (pawns) from the wrong move before showing a refutation. */
export const REFUTATION_EVAL_GAP_PAWNS = 0.5;
export const REFUTATION_EVAL_GAP_CP = REFUTATION_EVAL_GAP_PAWNS * 100;

export type RefutationResult = {
  fenAfterWrong: string | null;
  refutationUci: string | null;
  refutationSan: string | null;
  refutationLine: string | null;
  loading: boolean;
  error: string | null;
};

export const refutationEngineOptions: AnalysisEngineOptions = {
  depth: 10,
  multiPv: 1,
};

/** Stockfish movetime for on-demand refutation when the setup-PV cache misses. */
export const REFUTATION_FALLBACK_MOVETIME_MS = 500;

/** On-demand refutation when setup-PV cache misses. */
export const refutationFallbackEngineOptions: AnalysisEngineOptions = {
  depth: 10,
  multiPv: 1,
  movetime: REFUTATION_FALLBACK_MOVETIME_MS,
};

export function fenAfterUci(fen: string, uci: string): string | null {
  const chess = new Chess(fen);
  if (!applyUciMove(chess as unknown as Parameters<typeof applyUciMove>[0], uci)) {
    return null;
  }
  return chess.fen();
}

/** Centipawn score from side to move, comparable across sibling positions. */
export function lineEvalCpForGap(line: EngineLine | undefined): number | null {
  if (!line) {
    return null;
  }
  if (line.mate !== null) {
    return line.mate > 0 ? 10_000 - line.mate : -10_000 + line.mate;
  }
  return line.centipawns;
}

/** How much better the opponent's eval is after the wrong move vs the correct one. */
export function refutationEvalGapCp(
  evalAfterWrong: EngineEvaluation,
  evalAfterCorrect: EngineEvaluation,
): number | null {
  const wrongCp = lineEvalCpForGap(evalAfterWrong.lines[0]);
  const correctCp = lineEvalCpForGap(evalAfterCorrect.lines[0]);
  if (wrongCp === null || correctCp === null) {
    return null;
  }
  return wrongCp - correctCp;
}

export function refutationFromEvaluation(
  fenAfterWrong: string,
  evaluation: EngineEvaluation,
  evalGapCp: number | null,
  evalGapApplies: boolean,
  evalGapLoading: boolean,
): Omit<RefutationResult, 'fenAfterWrong'> {
  const loading =
    evaluation.status === 'loading' ||
    evaluation.status === 'analyzing' ||
    evalGapLoading;

  if (evaluation.status === 'error') {
    return {
      refutationUci: null,
      refutationSan: null,
      refutationLine: null,
      loading: false,
      error: evaluation.error ?? 'Engine unavailable',
    };
  }

  const meetsThreshold =
    !evalGapApplies ||
    (evalGapCp !== null && evalGapCp >= REFUTATION_EVAL_GAP_CP);

  if (!meetsThreshold) {
    return {
      refutationUci: null,
      refutationSan: null,
      refutationLine: null,
      loading,
      error: null,
    };
  }

  const refutationUci = evaluation.lines[0]?.pv?.[0] ?? null;
  const refutationSan = refutationUci
    ? (uciPvToSan(fenAfterWrong, [refutationUci])[0] ?? refutationUci)
    : null;
  const refutationLine = evaluation.lines[0]?.pv?.length
    ? formatPvPreview(fenAfterWrong, evaluation.lines[0].pv, 4)
    : null;

  return {
    refutationUci,
    refutationSan,
    refutationLine,
    loading,
    error: null,
  };
}
