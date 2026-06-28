import type { ChessboardArrow } from '../../chessboard/lastMoveArrow';
import { fenAfterUci } from './refutation';

export type MissSequencePhase = 'wrong' | 'refutation' | 'answer' | 'retry';

export type MissSequenceState = {
  setupFen: string;
  attemptedUci: string;
  phase: MissSequencePhase;
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

/** Wall-clock budget from wrong-move start to refutation visible (incl. animation). */
export const REFUTATION_RESPONSE_BUDGET_MS = 1000;
export const MISS_WRONG_PAUSE_MS = 120;
export const MISS_REFUTATION_PAUSE_MS = 900;
/** Max wait for fallback engine before skipping refutation (within response budget). */
export const MISS_REFUTATION_MAX_WAIT_MS = 550;
export const MISS_MOVE_ANIMATION_MS = 220;

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

function uciOriginSquare(uci: string | null | undefined): string | null {
  if (!uci || uci.length < 4) {
    return null;
  }
  return uci.slice(0, 2);
}

export type GetMissDisplayOptions = {
  /** Keep the quiz position visible and mark the drag origin with a red X. */
  snapBackOnWrong?: boolean;
};

export function getMissDisplay(
  sequence: MissSequenceState | null,
  expectedUci: string | null,
  refutationUci: string | null,
  answerArrowColor: string,
  options: GetMissDisplayOptions = {},
): MissDisplay {
  const snapBackOnWrong = options.snapBackOnWrong === true;
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
        fen: snapBackOnWrong ? setupFen : (fenAfterWrong ?? setupFen),
        arrows: [],
        lastMoveUci: snapBackOnWrong ? null : attemptedUci,
        animating: false,
        incorrectMoveSquare: snapBackOnWrong
          ? uciOriginSquare(attemptedUci)
          : uciDestinationSquare(attemptedUci),
        refutationMoveSquare: null,
      };
    case 'refutation': {
      if (snapBackOnWrong) {
        return {
          fen: setupFen,
          arrows: moveArrow(refutationUci, 'rgba(239, 108, 0, 0.85)'),
          lastMoveUci: null,
          animating: false,
          incorrectMoveSquare: null,
          refutationMoveSquare: uciDestinationSquare(refutationUci),
        };
      }
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
