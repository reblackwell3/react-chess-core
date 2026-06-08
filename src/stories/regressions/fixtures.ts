export interface AnalysisRegression {
  /** Story name shown in Storybook. */
  name: string;
  /** The edge case and the expected behavior, for the story docs. */
  description: string;
  /** Source puzzle id (endchess) for traceability. */
  sourceId: string;
  /** Starting FEN as stored for the puzzle. */
  fen: string;
  /** Space-separated UCI solution moves (first move is played automatically). */
  moves: string;
}

/**
 * Real puzzles that previously exposed analysis bugs, captured so the scenarios
 * can be reproduced in Storybook.
 */
export const ANALYSIS_REGRESSIONS: Record<string, AnalysisRegression> = {
  stockfishAnalysisMove3Ke6: {
    name: 'Stockfish survives rapid analysis nav',
    description:
      'Endgame pawn puzzle (1784). Opening analysis at the final ply, then clicking ' +
      'through every main-line move in the sidebar while Stockfish is searching used to ' +
      'crash the WASM worker with RuntimeError: unreachable.',
    sourceId: '66abad1bcb8d6163fd6e172a',
    fen: '8/6p1/4k2p/2pp3P/5PP1/1KP5/8/8 b - - 6 46',
    moves: 'e6f6 b3a4 f6e6 a4b5 d5d4 c3d4 c5d4 b5c4 e6d6 c4d4',
  },
};
