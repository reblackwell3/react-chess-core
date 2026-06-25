import React, {
  createContext,
  useContext,
  useMemo,
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

export type PlayTimeEngineProviderProps = {
  fen: string;
  enabled?: boolean;
  options?: AnalysisEngineOptions;
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

  const analysisEnabled =
    (mergedOptions.enabled ?? enabled) &&
    !paused &&
    isAnalyzableFen(fen);

  const evaluation = useAnalysisEngine(fen, {
    ...mergedOptions,
    enabled: analysisEnabled,
    shared: true,
  });

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
  children,
}: PlayTimeEngineProviderProps) => {
  const existingEngine = useAnalysisEngineContext();
  const scriptUrl =
    options.scriptUrl ?? DEFAULT_STOCKFISH_SCRIPT_URL;

  const inner = (
    <PlayTimeEngineInner fen={fen} enabled={enabled} options={options}>
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
