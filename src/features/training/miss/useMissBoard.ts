import { useCallback, useMemo } from 'react';
import type { ChessboardArrow } from '../../chessboard/lastMoveArrow';
import type { AnalysisEngineOptions } from '../../engine/types';
import { uciFromDrop } from '../uciFromDrop';
import {
  getMissAnimationDuration,
  isMissInputLocked,
  type MissSequencePhase,
} from './missDisplay';
import { refutationEngineOptions } from './refutation';
import { useMissSequence, type KnownRefutation } from './useMissSequence';

type MissFeedback = 'correct' | 'incorrect' | null;

export function useMissBoard({
  feedback,
  expectedUci,
  positionFen,
  answerArrowColor,
  autoShowWrongMoves = true,
  snapBackOnWrong = false,
  engineOptions,
  knownRefutation = null,
}: {
  feedback: MissFeedback;
  expectedUci: string | null;
  positionFen: string;
  answerArrowColor: string;
  autoShowWrongMoves?: boolean;
  snapBackOnWrong?: boolean;
  engineOptions?: AnalysisEngineOptions;
  knownRefutation?: KnownRefutation | null;
}) {
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
  );

  const customArrows = useMemo<ChessboardArrow[]>(() => {
    if (feedback !== 'incorrect') {
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
          if (uci && uci.toLowerCase() !== expectedMoveUci.toLowerCase()) {
            missSequence.startSequence(dropFen, uci);
          } else if (
            uci &&
            uci.toLowerCase() === expectedMoveUci.toLowerCase()
          ) {
            missSequence.clearSequence();
          }
        }

        return onDrop(source, target, piece);
      },
    [
      boardPosition,
      expectedUci,
      missSequence.clearSequence,
      missSequence.startSequence,
    ],
  );

  return {
    missSequence,
    refutation: missSequence.refutation,
    customArrows,
    boardPosition,
    boardAnimating: display.animating,
    lastMoveUci: display.lastMoveUci,
    incorrectMoveSquare,
    refutationMoveSquare,
    animationDuration,
    inputLocked,
    phase,
    wrapDropHandler,
  };
}
