import { fenAfterUci } from './refutation';

export type MissSequencePhase = 'wrong' | 'refutation' | 'answer' | 'retry';

export type MissSequenceState = {
  setupFen: string;
  attemptedUci: string;
  phase: MissSequencePhase;
};

export type MissDisplay = {
  fen: string | null;
  arrows: [string, string, string][];
  lastMoveUci: string | null;
  animating: boolean;
};

export const MISS_WRONG_PAUSE_MS = 450;
export const MISS_REFUTATION_PAUSE_MS = 900;
export const MISS_REFUTATION_MAX_WAIT_MS = 4000;
export const MISS_MOVE_ANIMATION_MS = 220;

function moveArrow(
  uci: string | null | undefined,
  color: string,
): [string, string, string][] {
  if (!uci || uci.length < 4) {
    return [];
  }
  return [[uci.slice(0, 2), uci.slice(2, 4), color]];
}

function expectedMoveArrow(
  expectedUci: string | null,
  color: string,
): [string, string, string][] {
  return moveArrow(expectedUci, color);
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
      };
    }
    case 'retry':
      return {
        fen: setupFen,
        arrows: [],
        lastMoveUci: null,
        animating: false,
      };
    case 'answer':
      return {
        fen: setupFen,
        arrows: expectedMoveArrow(expectedUci, answerArrowColor),
        lastMoveUci: null,
        animating: false,
      };
    default:
      return {
        fen: setupFen,
        arrows: [],
        lastMoveUci: null,
        animating: false,
      };
  }
}
