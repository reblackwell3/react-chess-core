import { useEffect, useMemo, useRef, useState } from 'react';
import { boardArrowColors } from '../chessboard/boardArrowColors';

export const SOLUTION_LINE_RECAP_FAST_STEP_MS = 100;
export const SOLUTION_LINE_RECAP_FAST_ANIM_MS = 80;
export const SOLUTION_LINE_RECAP_SLOW_PRE_MOVE_MS = 900;
export const SOLUTION_LINE_RECAP_SLOW_ANIM_MS = 450;

/** Minimum wait after the post-completion recap before auto-loading the next card. */
export const AUTO_ADVANCE_ON_COMPLETE_DELAY_MS = 5000;

export type SolutionLineRecapTiming = {
  /** Delay after applying a ply before advancing to the next one. */
  stepMs: number;
  /** Board animation duration when a ply is applied. */
  animMs: number;
  /** Pause showing the answer arrow before playing a missed ply. */
  missArrowPauseMs: number;
  /** Board animation when playing a missed ply after the arrow. */
  missAnimMs: number;
};

const DEFAULT_SOLUTION_LINE_RECAP_TIMING: SolutionLineRecapTiming = {
  stepMs: SOLUTION_LINE_RECAP_FAST_STEP_MS,
  animMs: SOLUTION_LINE_RECAP_FAST_ANIM_MS,
  missArrowPauseMs: SOLUTION_LINE_RECAP_SLOW_PRE_MOVE_MS,
  missAnimMs: SOLUTION_LINE_RECAP_SLOW_ANIM_MS,
};

export type SolutionLineRecapArrow = [string, string, string];

export type SolutionLineRecapState = {
  active: boolean;
  fen: string;
  lastMoveUci: string | null;
  highlightUci: string | null;
  customArrows: SolutionLineRecapArrow[];
  animationDuration: number;
};

export function uciToAnswerArrows(
  uci: string | null,
  color: string = boardArrowColors.answer,
): SolutionLineRecapArrow[] {
  if (!uci || uci.length < 4) {
    return [];
  }
  return [[uci.slice(0, 2), uci.slice(2, 4), color]];
}

export type UseSolutionLineRecapOptions = {
  active: boolean;
  movesUci: string[];
  startIndex: number;
  endIndex: number;
  missedIndices: number[];
  /** FEN before the move at `startIndex`. */
  segmentStartFen: string;
  /** Last move UCI already on the board at segment start. */
  setupUci?: string | null;
  onComplete: () => void;
  /** When true, call `onComplete` immediately if there are no missed moves. */
  completeImmediatelyWhenNoMisses?: boolean;
  /** Resolve FEN before (`afterMove: false`) or after (`afterMove: true`) a move. */
  resolveFen: (moveIndex: number, afterMove: boolean) => string;
  arrowColor?: string;
  /** Override default fast/slow recap pacing (replay and courses use defaults). */
  timing?: Partial<SolutionLineRecapTiming>;
};

const idleRecapState = (
  segmentStartFen: string,
  setupUci: string | null | undefined,
): SolutionLineRecapState => ({
  active: false,
  fen: segmentStartFen,
  lastMoveUci: setupUci ?? null,
  highlightUci: null,
  customArrows: [],
  animationDuration: 0,
});

/**
 * Replays a move line — fast for clean plies, slow with an answer arrow on misses.
 * Used while waiting to auto-advance after puzzle, replay segment, or course line completion.
 */
export function useSolutionLineRecap({
  active,
  movesUci,
  startIndex,
  endIndex,
  missedIndices,
  segmentStartFen,
  setupUci = null,
  onComplete,
  completeImmediatelyWhenNoMisses = false,
  resolveFen,
  arrowColor = boardArrowColors.answer,
  timing: timingOverride,
}: UseSolutionLineRecapOptions): SolutionLineRecapState {
  const timing = useMemo(
    () => ({
      ...DEFAULT_SOLUTION_LINE_RECAP_TIMING,
      ...timingOverride,
    }),
    [timingOverride],
  );
  const missedSet = useMemo(() => new Set(missedIndices), [missedIndices]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [state, setState] = useState<SolutionLineRecapState>(() =>
    idleRecapState(segmentStartFen, setupUci),
  );

  useEffect(() => {
    setState(idleRecapState(segmentStartFen, setupUci));
  }, [segmentStartFen, setupUci]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const missesInRange = missedIndices.filter(
      (index) => index >= startIndex && index < endIndex,
    );
    if (completeImmediatelyWhenNoMisses && missesInRange.length === 0) {
      onCompleteRef.current();
      return;
    }

    if (startIndex >= endIndex) {
      onCompleteRef.current();
      return;
    }

    let cancelled = false;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelled) {
          fn();
        }
      }, ms);
      timeoutIds.push(id);
    };

    setState({
      active: true,
      fen: segmentStartFen,
      lastMoveUci: setupUci ?? null,
      highlightUci: null,
      customArrows: [],
      animationDuration: 0,
    });

    let moveIndex = startIndex;

    const finish = () => {
      setState((prev) => ({ ...prev, active: false }));
      onCompleteRef.current();
    };

    const applyMove = (miss: boolean) => {
      const uci = movesUci[moveIndex];
      if (!uci) {
        finish();
        return;
      }

      setState({
        active: true,
        fen: resolveFen(moveIndex, true),
        lastMoveUci: uci,
        highlightUci: null,
        customArrows: [],
        animationDuration: miss ? timing.missAnimMs : timing.animMs,
      });
      moveIndex += 1;
    };

    const step = () => {
      if (cancelled) {
        return;
      }

      if (moveIndex >= endIndex) {
        finish();
        return;
      }

      const uci = movesUci[moveIndex];
      if (!uci) {
        finish();
        return;
      }

      if (missedSet.has(moveIndex)) {
        setState({
          active: true,
          fen: resolveFen(moveIndex, false),
          lastMoveUci: moveIndex > startIndex ? movesUci[moveIndex - 1] ?? setupUci ?? null : setupUci ?? null,
          highlightUci: uci,
          customArrows: uciToAnswerArrows(uci, arrowColor),
          animationDuration: 0,
        });

        schedule(() => {
          applyMove(true);
          schedule(step, timing.stepMs + timing.missAnimMs);
        }, timing.missArrowPauseMs);
        return;
      }

      applyMove(false);
      schedule(step, timing.stepMs + timing.animMs);
    };

    schedule(step, timing.stepMs);

    return () => {
      cancelled = true;
      timeoutIds.forEach(clearTimeout);
    };
  }, [
    active,
    arrowColor,
    completeImmediatelyWhenNoMisses,
    endIndex,
    missedIndices,
    missedSet,
    movesUci,
    resolveFen,
    segmentStartFen,
    setupUci,
    startIndex,
    timing.animMs,
    timing.missAnimMs,
    timing.missArrowPauseMs,
    timing.stepMs,
  ]);

  return active ? state : idleRecapState(segmentStartFen, setupUci);
}
