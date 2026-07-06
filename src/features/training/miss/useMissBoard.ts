import { useCallback, useMemo } from 'react';
import type { ChessboardArrow } from '../../chessboard/lastMoveArrow';
import type { AnalysisEngineOptions } from '../../engine/types';
import { uciFromDrop } from '../uciFromDrop';
import {
  getMissAnimationDuration,
  isAnswerArrowVisible,
  isAwaitingMissResolution,
  isMissInputLocked,
  isTrainingMissDraggable,
  type MissSequencePhase,
} from './missDisplay';
import {
  missRetryPolicyFromAutoShowWrongMoves,
  normalizeMissRetryPolicy,
  type MissRetryPolicy,
} from './missRetryPolicy';
import { refutationEngineOptions } from './refutation';
import { useMissSequence, type KnownRefutation } from './useMissSequence';

type MissFeedback = 'correct' | 'incorrect' | null;

export type UseMissBoardOptions = {
  feedback: MissFeedback;
  expectedUci: string | null;
  positionFen: string;
  answerArrowColor: string;
  /** @deprecated Prefer {@link missRetryPolicy}. When false, enables blind retry (capped). */
  autoShowWrongMoves?: boolean;
  missRetryPolicy?: MissRetryPolicy;
  snapBackOnWrong?: boolean;
  engineOptions?: AnalysisEngineOptions;
  knownRefutation?: KnownRefutation | null;
  /** Play-time engine depth; instant refutation cache requires this on the wrong line. */
  setupCacheTargetDepth?: number;
};

export function useMissBoard({
  feedback,
  expectedUci,
  positionFen,
  answerArrowColor,
  autoShowWrongMoves = true,
  missRetryPolicy,
  snapBackOnWrong = false,
  engineOptions,
  knownRefutation = null,
  setupCacheTargetDepth,
}: UseMissBoardOptions) {
  const resolvedPolicy = useMemo(
    () =>
      missRetryPolicy
        ? normalizeMissRetryPolicy(missRetryPolicy)
        : missRetryPolicyFromAutoShowWrongMoves(autoShowWrongMoves),
    [
      autoShowWrongMoves,
      missRetryPolicy?.allowRetryOnIncorrect,
      missRetryPolicy?.maxMissAttempts,
    ],
  );

  const refutationEngine = useMemo(
    () => ({
      ...refutationEngineOptions,
      ...engineOptions,
    }),
    [engineOptions],
  );

  const missSequence = useMissSequence(
    feedback,
    expectedUci,
    refutationEngine,
    answerArrowColor,
    autoShowWrongMoves,
    snapBackOnWrong,
    knownRefutation,
    setupCacheTargetDepth,
    { missRetryPolicy: resolvedPolicy },
  );

  const customArrows = useMemo<ChessboardArrow[]>(() => {
    if (!isAnswerArrowVisible(feedback, missSequence.sequence, expectedUci)) {
      return [];
    }

    if (missSequence.sequence) {
      return missSequence.display.arrows;
    }

    if (expectedUci) {
      return [
        [
          expectedUci.slice(0, 2),
          expectedUci.slice(2, 4),
          answerArrowColor,
        ] as ChessboardArrow,
      ];
    }

    return [];
  }, [
    answerArrowColor,
    expectedUci,
    feedback,
    missSequence.display.arrows,
    missSequence.sequence,
  ]);

  const boardPosition = missSequence.display.fen ?? positionFen;
  const { display, sequence } = missSequence;
  const phase: MissSequencePhase | null = sequence?.phase ?? null;
  const incorrectMoveSquare = sequence ? display.incorrectMoveSquare : null;
  const refutationMoveSquare = display.refutationMoveSquare;
  const animationDuration = getMissAnimationDuration(display.animating);
  const inputLocked = isMissInputLocked(sequence, display.animating);
  const answerArrowVisible = isAnswerArrowVisible(
    feedback,
    sequence,
    expectedUci,
  );
  const awaitingMissResolution = isAwaitingMissResolution(feedback);

  const wrapDropHandler = useCallback(
    (
      onDrop: (source: string, target: string, piece: string) => boolean,
      {
        enabled,
        dropFen = boardPosition,
        expectedMoveUci = expectedUci,
      }: {
        enabled: boolean;
        dropFen?: string;
        expectedMoveUci?: string | null;
      },
    ) =>
      (source: string, target: string, piece: string) => {
        if (enabled && expectedMoveUci) {
          const uci = uciFromDrop(dropFen, source, target, piece);
          if (uci) {
            const isExpected =
              uci.toLowerCase() === expectedMoveUci.toLowerCase();
            if (isExpected) {
              missSequence.clearSequence();
            } else if (
              answerArrowVisible &&
              !resolvedPolicy.allowRetryOnIncorrect &&
              sequence?.phase === 'answer'
            ) {
              return false;
            } else if (sequence?.phase === 'retry') {
              missSequence.recordWrongAttempt(
                sequence.setupFen,
                uci,
              );
            } else if (!isExpected) {
              missSequence.startSequence(dropFen, uci);
            }
          }
        }

        return onDrop(source, target, piece);
      },
    [
      answerArrowVisible,
      boardPosition,
      expectedUci,
      missSequence.clearSequence,
      missSequence.recordWrongAttempt,
      missSequence.startSequence,
      resolvedPolicy.allowRetryOnIncorrect,
      sequence?.phase,
      sequence?.setupFen,
    ],
  );

  const isDraggable = useCallback(
    (options: {
      isUserTurn?: boolean;
      finished?: boolean;
      correctMoveSquare?: string | null;
      fallbackIncorrectSquare?: string | null;
    } = {}) =>
      isTrainingMissDraggable({
        feedback,
        sequence,
        animating: display.animating,
        isUserTurn: options.isUserTurn,
        finished: options.finished,
        correctMoveSquare: options.correctMoveSquare ?? null,
        incorrectMoveSquare:
          incorrectMoveSquare ?? options.fallbackIncorrectSquare ?? null,
        refutationMoveSquare,
      }),
    [
      display.animating,
      feedback,
      incorrectMoveSquare,
      refutationMoveSquare,
      sequence,
    ],
  );

  return {
    missSequence,
    refutation: missSequence.refutation,
    missRetryPolicy: resolvedPolicy,
    customArrows,
    boardPosition,
    boardAnimating: display.animating,
    lastMoveUci: display.lastMoveUci,
    incorrectMoveSquare,
    refutationMoveSquare,
    animationDuration,
    inputLocked,
    phase,
    answerArrowVisible,
    awaitingMissResolution,
    wrapDropHandler,
    isDraggable,
  };
}
