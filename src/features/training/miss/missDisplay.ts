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
