import type { ChessboardArrow } from '../../chessboard/lastMoveArrow';
import { fenAfterUci } from './refutation';

export type MissSequencePhase = 'wrong' | 'refutation' | 'answer' | 'retry';

export type MissSequenceState = {
  setupFen: string;
  attemptedUci: string;
  phase: MissSequencePhase;
  /** Wrong attempts on this ply (1-based). */
  attemptCount: number;
};

export type MissDisplay = {
  fen: string | null;
  arrows: ChessboardArrow[];
  lastMoveUci: string | null;
  animating: boolean;
  /** Destination square of the wrong move while refutation feedback is active. */
  incorrectMoveSquare: string | null;
  /** Destination square of the engine refutation during the refutation phase. */
  refutationMoveSquare: string | null;
};

export const MISS_WRONG_PAUSE_MS = 120;
export const MISS_REFUTATION_PAUSE_MS = 900;
export const MISS_MOVE_ANIMATION_MS = 220;

/** Max wall-clock wait from wrong-move start before advancing (prefer engine movetime within this). */
export const REFUTATION_RESPONSE_BUDGET_MS = 1000;

function moveArrow(
  uci: string | null | undefined,
  color: string,
): ChessboardArrow[] {
  if (!uci || uci.length < 4) {
    return [];
  }
  return [[uci.slice(0, 2), uci.slice(2, 4), color] as ChessboardArrow];
}

function expectedMoveArrow(
  expectedUci: string | null,
  color: string,
): ChessboardArrow[] {
  return moveArrow(expectedUci, color);
}

function uciDestinationSquare(uci: string | null | undefined): string | null {
  if (!uci || uci.length < 4) {
    return null;
  }
  return uci.slice(2, 4);
}

export function getMissDisplay(
  sequence: MissSequenceState | null,
  expectedUci: string | null,
  refutationUci: string | null,
  answerArrowColor: string,
): MissDisplay {
  if (!sequence) {
    return {
      fen: null,
      arrows: [],
      lastMoveUci: null,
      animating: false,
      incorrectMoveSquare: null,
      refutationMoveSquare: null,
    };
  }

  const { setupFen, attemptedUci, phase } = sequence;
  const fenAfterWrong = fenAfterUci(setupFen, attemptedUci);

  switch (phase) {
    case 'wrong':
      return {
        fen: fenAfterWrong ?? setupFen,
        arrows: [],
        lastMoveUci: attemptedUci,
        animating: false,
        incorrectMoveSquare: uciDestinationSquare(attemptedUci),
        refutationMoveSquare: null,
      };
    case 'refutation': {
      const fenAfterRefutation =
        fenAfterWrong && refutationUci
          ? fenAfterUci(fenAfterWrong, refutationUci)
          : null;
      return {
        fen: fenAfterRefutation ?? fenAfterWrong ?? setupFen,
        arrows: [],
        lastMoveUci: refutationUci,
        animating: Boolean(fenAfterRefutation),
        incorrectMoveSquare: null,
        refutationMoveSquare: uciDestinationSquare(refutationUci),
      };
    }
    case 'retry':
      return {
        fen: setupFen,
        arrows: [],
        lastMoveUci: null,
        animating: false,
        incorrectMoveSquare: null,
        refutationMoveSquare: null,
      };
    case 'answer':
      return {
        fen: setupFen,
        arrows: expectedMoveArrow(expectedUci, answerArrowColor),
        lastMoveUci: null,
        animating: false,
        incorrectMoveSquare: null,
        refutationMoveSquare: null,
      };
    default:
      return {
        fen: setupFen,
        arrows: [],
        lastMoveUci: null,
        animating: false,
        incorrectMoveSquare: null,
        refutationMoveSquare: null,
      };
  }
}

/** Chessboard animation duration while a refutation move is playing. */
export function getMissAnimationDuration(animating: boolean): number {
  return animating ? MISS_MOVE_ANIMATION_MS : 0;
}

/** True while the user should not drag pieces during a miss/refutation sequence. */
export function isMissInputLocked(
  sequence: MissSequenceState | null,
  animating: boolean,
): boolean {
  if (!sequence) {
    return false;
  }
  return (
    sequence.phase === 'wrong' ||
    sequence.phase === 'refutation' ||
    animating
  );
}

/** True when the best-move answer arrow should be visible for an incorrect attempt. */
export function isAnswerArrowVisible(
  feedback: 'correct' | 'incorrect' | null,
  sequence: MissSequenceState | null,
  expectedUci: string | null,
): boolean {
  if (feedback !== 'incorrect' || !expectedUci) {
    return false;
  }
  if (!sequence) {
    return true;
  }
  return sequence.phase === 'answer';
}

/** True while a miss is unresolved (wrong move, refutation, retry, or answer drag). */
export function isAwaitingMissResolution(
  feedback: 'correct' | 'incorrect' | null,
): boolean {
  return feedback === 'incorrect';
}

/** Shared draggable gate for training boards using the miss sequence. */
export function isTrainingMissDraggable({
  feedback,
  sequence,
  animating,
  isUserTurn = true,
  finished = false,
  correctMoveSquare = null,
  incorrectMoveSquare = null,
  refutationMoveSquare = null,
}: {
  feedback?: 'correct' | 'incorrect' | null;
  sequence: MissSequenceState | null;
  animating: boolean;
  isUserTurn?: boolean;
  finished?: boolean;
  correctMoveSquare?: string | null;
  incorrectMoveSquare?: string | null;
  refutationMoveSquare?: string | null;
}): boolean {
  if (finished || !isUserTurn) {
    return false;
  }
  if (correctMoveSquare) {
    return false;
  }
  if (incorrectMoveSquare || refutationMoveSquare) {
    return false;
  }
  if (isMissInputLocked(sequence, animating)) {
    return false;
  }
  if (feedback === 'incorrect' && sequence?.phase === 'retry') {
    return true;
  }
  if (feedback === 'incorrect' && sequence?.phase === 'answer') {
    return true;
  }
  if (feedback === 'incorrect' && !sequence) {
    return true;
  }
  return feedback !== 'incorrect';
}

/**
 * Prefer miss-sequence destination X when a refutation sequence is active;
 * otherwise fall back to snap-back incorrect feedback (origin square).
 */
export function resolveIncorrectMoveSquare(
  sequence: MissSequenceState | null,
  missIncorrectSquare: string | null,
  fallbackIncorrectSquare: string | null,
): string | null {
  if (sequence) {
    return missIncorrectSquare;
  }
  return fallbackIncorrectSquare;
}
