import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AnalysisEngineProvider,
  normalizeSubscriberOptions,
  useAnalysisEngineContext,
} from './AnalysisEngineContext';
import { StockfishBrowserEngine } from './StockfishBrowserEngine';
import {
  AnalysisEngineOptions,
  DEFAULT_STOCKFISH_SCRIPT_URL,
  EngineEvaluation,
  emptyEngineEvaluation,
} from './types';

export const useAnalysisEngine = (
  fen: string,
  options: AnalysisEngineOptions = {},
): EngineEvaluation => {
  const context = useAnalysisEngineContext();
  const useShared = (options.shared ?? true) && context !== null;

  const {
    enabled = true,
    depth = 16,
    multiPv = 2,
    movetime,
    priority = 0,
    scriptUrl = DEFAULT_STOCKFISH_SCRIPT_URL,
  } = options;

  const [evaluation, setEvaluation] = useState<EngineEvaluation>(
    emptyEngineEvaluation(),
  );
  const [engineReady, setEngineReady] = useState(false);
  const engineRef = useRef<StockfishBrowserEngine | null>(null);
  const mountGenerationRef = useRef(0);
  const subscriberIdRef = useRef<number | null>(null);

  const subscriberOptions = useMemo(
    () => normalizeSubscriberOptions(fen, options),
    [fen, enabled, depth, multiPv, movetime, priority],
  );

  useLayoutEffect(() => {
    if (!useShared || !context) {
      return;
    }

    if (subscriberIdRef.current === null) {
      subscriberIdRef.current = context.register(
        subscriberOptions,
        setEvaluation,
      );
      return;
    }

    context.update(subscriberIdRef.current, subscriberOptions);
  }, [context, subscriberOptions, useShared]);

  useEffect(() => {
    if (!useShared || !context) {
      return;
    }

    const contextValue = context;
    return () => {
      if (subscriberIdRef.current !== null) {
        contextValue.unregister(subscriberIdRef.current);
        subscriberIdRef.current = null;
      }
    };
  }, [context, useShared]);

  useEffect(() => {
    if (useShared || !enabled || typeof Worker === 'undefined') {
      if (!useShared && !enabled) {
        setEvaluation(emptyEngineEvaluation());
        setEngineReady(false);
      }
      return;
    }

    const mountGeneration = ++mountGenerationRef.current;
    const engine = new StockfishBrowserEngine(scriptUrl);
    engineRef.current = engine;
    let cancelled = false;

    const unsubscribe = engine.subscribe((next) => {
      if (!cancelled && mountGeneration === mountGenerationRef.current) {
        setEvaluation(next);
      }
    });

    engine
      .init()
      .then(() => {
        if (
          !cancelled &&
          mountGeneration === mountGenerationRef.current
        ) {
          setEngineReady(true);
        }
      })
      .catch((error: unknown) => {
        if (cancelled || mountGeneration !== mountGenerationRef.current) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to start engine';
        setEvaluation({
          ...emptyEngineEvaluation(),
          status: 'error',
          error: message,
        });
      });

    return () => {
      cancelled = true;
      setEngineReady(false);
      unsubscribe();
      engine.dispose();
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
  }, [enabled, scriptUrl, useShared]);

  useLayoutEffect(() => {
    if (useShared || !enabled || !engineReady || !engineRef.current) {
      return;
    }

    const engine = engineRef.current;
    const timer = window.setTimeout(() => {
      engine.analyze(fen, depth, multiPv, movetime);
    }, 75);

    return () => {
      window.clearTimeout(timer);
    };
  }, [useShared, enabled, engineReady, fen, depth, multiPv, movetime]);

  return useMemo(() => {
    if (evaluation.fen !== fen) {
      return {
        ...emptyEngineEvaluation(),
        status:
          evaluation.status === 'error'
            ? 'error'
            : evaluation.status === 'loading'
              ? 'loading'
              : 'analyzing',
        error: evaluation.error,
        fen,
      };
    }
    return evaluation;
  }, [evaluation, fen]);
};

export { AnalysisEngineProvider };
