import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { StockfishBrowserEngine } from './StockfishBrowserEngine';
import {
  AnalysisEngineOptions,
  DEFAULT_STOCKFISH_SCRIPT_URL,
  EngineEvaluation,
  emptyEngineEvaluation,
} from './types';

export type SubscriberOptions = {
  fen: string;
  enabled: boolean;
  depth: number;
  multiPv: number;
  priority: number;
};

type Subscriber = {
  id: number;
  options: SubscriberOptions;
  listener: (evaluation: EngineEvaluation) => void;
};

type AnalysisEngineContextValue = {
  register: (
    options: SubscriberOptions,
    listener: (evaluation: EngineEvaluation) => void,
  ) => number;
  update: (id: number, options: SubscriberOptions) => void;
  unregister: (id: number) => void;
};

const AnalysisEngineContext = createContext<AnalysisEngineContextValue | null>(
  null,
);

export const useAnalysisEngineContext = (): AnalysisEngineContextValue | null =>
  useContext(AnalysisEngineContext);

export const normalizeSubscriberOptions = (
  fen: string,
  options: AnalysisEngineOptions = {},
): SubscriberOptions => ({
  fen,
  enabled: options.enabled ?? true,
  depth: options.depth ?? 16,
  multiPv: options.multiPv ?? 2,
  priority: options.priority ?? 0,
});

const analyzingForFen = (
  fen: string,
  evaluation: EngineEvaluation,
): EngineEvaluation => ({
  ...emptyEngineEvaluation(),
  status:
    evaluation.status === 'error'
      ? 'error'
      : evaluation.status === 'loading'
        ? 'loading'
        : 'analyzing',
  error: evaluation.error,
  fen,
});

export type AnalysisEngineProviderProps = {
  scriptUrl?: string;
  children: React.ReactNode;
};

export const AnalysisEngineProvider = ({
  scriptUrl = DEFAULT_STOCKFISH_SCRIPT_URL,
  children,
}: AnalysisEngineProviderProps) => {
  const engineRef = useRef<StockfishBrowserEngine | null>(null);
  const subscribersRef = useRef<Map<number, Subscriber>>(new Map());
  const nextIdRef = useRef(0);
  const activeKeyRef = useRef('');
  const readyRef = useRef(false);
  const scheduleRef = useRef<number | null>(null);
  const lastEvaluationRef = useRef<EngineEvaluation>(emptyEngineEvaluation());

  const pickActive = useCallback((): Subscriber | null => {
    const enabled = [...subscribersRef.current.values()].filter(
      (subscriber) => subscriber.options.enabled,
    );
    if (enabled.length === 0) {
      return null;
    }
    return enabled.sort(
      (left, right) => right.options.priority - left.options.priority,
    )[0];
  }, []);

  const notifyAll = useCallback(
    (evaluation: EngineEvaluation) => {
      lastEvaluationRef.current = evaluation;
      const active = pickActive();
      for (const subscriber of subscribersRef.current.values()) {
        const { fen, enabled } = subscriber.options;
        if (!enabled) {
          subscriber.listener(emptyEngineEvaluation());
          continue;
        }
        if (evaluation.fen && evaluation.fen === fen) {
          subscriber.listener(evaluation);
          continue;
        }
        if (active?.id === subscriber.id) {
          subscriber.listener(analyzingForFen(fen, evaluation));
        }
      }
    },
    [pickActive],
  );

  const syncAnalysis = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !readyRef.current) {
      return;
    }

    const active = pickActive();
    if (!active) {
      activeKeyRef.current = '';
      engine.stop();
      notifyAll(emptyEngineEvaluation());
      return;
    }

    const { fen, depth, multiPv } = active.options;
    const key = `${active.id}|${fen}|${depth}|${multiPv}`;
    if (key === activeKeyRef.current) {
      return;
    }
    activeKeyRef.current = key;

    if (scheduleRef.current !== null) {
      window.clearTimeout(scheduleRef.current);
    }
    scheduleRef.current = window.setTimeout(() => {
      scheduleRef.current = null;
      engine.analyze(fen, depth, multiPv);
    }, 75);
  }, [notifyAll, pickActive]);

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      return;
    }

    const engine = new StockfishBrowserEngine(scriptUrl);
    engineRef.current = engine;
    let cancelled = false;

    const unsubscribe = engine.subscribe((evaluation) => {
      if (!cancelled) {
        notifyAll(evaluation);
      }
    });

    engine
      .init()
      .then(() => {
        if (cancelled) {
          return;
        }
        readyRef.current = true;
        syncAnalysis();
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Failed to start engine';
        notifyAll({
          ...emptyEngineEvaluation(),
          status: 'error',
          error: message,
        });
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      activeKeyRef.current = '';
      if (scheduleRef.current !== null) {
        window.clearTimeout(scheduleRef.current);
        scheduleRef.current = null;
      }
      unsubscribe();
      engine.dispose();
      engineRef.current = null;
    };
  }, [notifyAll, scriptUrl, syncAnalysis]);

  const register = useCallback(
    (
      options: SubscriberOptions,
      listener: (evaluation: EngineEvaluation) => void,
    ): number => {
      const id = ++nextIdRef.current;
      subscribersRef.current.set(id, { id, options, listener });

      if (options.enabled) {
        const active = pickActive();
        if (active?.id === id) {
          listener(analyzingForFen(options.fen, lastEvaluationRef.current));
        }
      } else {
        listener(emptyEngineEvaluation());
      }

      syncAnalysis();
      return id;
    },
    [pickActive, syncAnalysis],
  );

  const update = useCallback(
    (id: number, options: SubscriberOptions) => {
      const subscriber = subscribersRef.current.get(id);
      if (!subscriber) {
        return;
      }
      subscriber.options = options;
      if (!options.enabled) {
        subscriber.listener(emptyEngineEvaluation());
      } else {
        const active = pickActive();
        if (active?.id === id) {
          subscriber.listener(
            analyzingForFen(options.fen, lastEvaluationRef.current),
          );
        }
      }
      activeKeyRef.current = '';
      syncAnalysis();
    },
    [pickActive, syncAnalysis],
  );

  const unregister = useCallback(
    (id: number) => {
      subscribersRef.current.delete(id);
      activeKeyRef.current = '';
      syncAnalysis();
    },
    [syncAnalysis],
  );

  const value = useMemo(
    () => ({
      register,
      update,
      unregister,
    }),
    [register, unregister, update],
  );

  return (
    <AnalysisEngineContext.Provider value={value}>
      {children}
    </AnalysisEngineContext.Provider>
  );
};
