import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isAnalyzableFen } from './isAnalyzableFen';
import {
  AnalysisEngineProvider,
  useAnalysisEngineContext,
} from './AnalysisEngineContext';
import { useAnalysisEngine } from './useAnalysisEngine';
import {
  AnalysisEngineOptions,
  DEFAULT_STOCKFISH_SCRIPT_URL,
  EngineEvaluation,
  emptyEngineEvaluation,
} from './types';

export type PlayTimeEngineContextValue = {
  evaluation: EngineEvaluation;
  setupFen: string;
  pauseAnalysis: () => void;
  resumeAnalysis: () => void;
};

const PlayTimeEngineContext = createContext<PlayTimeEngineContextValue | null>(
  null,
);

export const usePlayTimeEngineEvaluation =
  (): PlayTimeEngineContextValue | null => useContext(PlayTimeEngineContext);

/** Cached play-time analysis fetched from a backend engine cache. */
export type PlayTimeSeedEvaluation = {
  /** Must have status 'idle' and per-line depth set for the refutation cache. */
  evaluation: EngineEvaluation;
  /** Search depth of the cached result. */
  depth: number;
  /** MultiPV requested when the cached result was produced. */
  multiPv: number;
};

export type PlayTimeEngineProviderProps = {
  fen: string;
  enabled?: boolean;
  options?: AnalysisEngineOptions;
  /** Cached evaluation; used instead of Stockfish when deep/wide enough. */
  seedEvaluation?: PlayTimeSeedEvaluation | null;
  /** Hold Stockfish start while a cache lookup is in flight. */
  seedPending?: boolean;
  /** Fires when a locally computed (non-seeded) evaluation completes. */
  onEvaluationComplete?: (evaluation: EngineEvaluation, fen: string) => void;
  children: React.ReactNode;
};

const defaultPlayTimeOptions: AnalysisEngineOptions = {
  depth: 10,
  multiPv: 6,
  priority: 0,
};

const PlayTimeEngineInner = ({
  fen,
  enabled = true,
  options = {},
  seedEvaluation = null,
  seedPending = false,
  onEvaluationComplete,
  children,
}: PlayTimeEngineProviderProps) => {
  const [paused, setPaused] = useState(false);
  const mergedOptions = useMemo(
    () => ({
      ...defaultPlayTimeOptions,
      ...options,
    }),
    [options],
  );

  const targetDepth = mergedOptions.depth ?? defaultPlayTimeOptions.depth!;
  const targetMultiPv =
    mergedOptions.multiPv ?? defaultPlayTimeOptions.multiPv!;

  const seedUsable =
    seedEvaluation != null &&
    seedEvaluation.evaluation.lines.length > 0 &&
    seedEvaluation.depth >= targetDepth &&
    seedEvaluation.multiPv >= targetMultiPv &&
    (seedEvaluation.evaluation.fen == null ||
      seedEvaluation.evaluation.fen === fen);

  const analysisEnabled =
    (mergedOptions.enabled ?? enabled) &&
    !paused &&
    !seedUsable &&
    !seedPending &&
    isAnalyzableFen(fen);

  const localEvaluation = useAnalysisEngine(fen, {
    ...mergedOptions,
    enabled: analysisEnabled,
    shared: true,
  });

  const evaluation = useMemo((): EngineEvaluation => {
    if (seedUsable) {
      return seedEvaluation!.evaluation;
    }
    if (seedPending && localEvaluation.lines.length === 0) {
      return { ...emptyEngineEvaluation(), status: 'loading' };
    }
    return localEvaluation;
  }, [localEvaluation, seedEvaluation, seedPending, seedUsable]);

  const completeReportedFenRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !onEvaluationComplete ||
      !analysisEnabled ||
      localEvaluation.status !== 'idle' ||
      localEvaluation.lines.length === 0 ||
      localEvaluation.depth === 0 ||
      completeReportedFenRef.current === fen
    ) {
      return;
    }
    completeReportedFenRef.current = fen;
    onEvaluationComplete(localEvaluation, fen);
  }, [analysisEnabled, fen, localEvaluation, onEvaluationComplete]);

  const value = useMemo(
    (): PlayTimeEngineContextValue => ({
      evaluation,
      setupFen: fen,
      pauseAnalysis: () => setPaused(true),
      resumeAnalysis: () => setPaused(false),
    }),
    [evaluation, fen],
  );

  return (
    <PlayTimeEngineContext.Provider value={value}>
      {children}
    </PlayTimeEngineContext.Provider>
  );
};

/**
 * Shared play-time Stockfish on the setup FEN (multipv cache for refutation).
 * Nests in an existing {@link AnalysisEngineProvider} when present; otherwise
 * creates one.
 */
export const PlayTimeEngineProvider = ({
  fen,
  enabled = true,
  options = {},
  seedEvaluation = null,
  seedPending = false,
  onEvaluationComplete,
  children,
}: PlayTimeEngineProviderProps) => {
  const existingEngine = useAnalysisEngineContext();
  const scriptUrl =
    options.scriptUrl ?? DEFAULT_STOCKFISH_SCRIPT_URL;

  const inner = (
    <PlayTimeEngineInner
      fen={fen}
      enabled={enabled}
      options={options}
      seedEvaluation={seedEvaluation}
      seedPending={seedPending}
      onEvaluationComplete={onEvaluationComplete}
    >
      {children}
    </PlayTimeEngineInner>
  );

  if (existingEngine) {
    return inner;
  }

  return (
    <AnalysisEngineProvider scriptUrl={scriptUrl}>
      {inner}
    </AnalysisEngineProvider>
  );
};

export const emptyPlayTimeEvaluation = (
  fen: string,
): PlayTimeEngineContextValue => ({
  evaluation: { ...emptyEngineEvaluation(), fen },
  setupFen: fen,
  pauseAnalysis: () => {},
  resumeAnalysis: () => {},
});
