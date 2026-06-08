import { Chess } from 'chess.js';
import type { AnalysisContext } from '../../features/analysis/types';
import { applyUciMove } from '../../features/analysis/analysisUtils';
import { AnalysisRegression } from './fixtures';

/** Side to move for the final (user) ply in a puzzle line. */
const playerColorForSolution = (
  initialFen: string,
  moves: string[],
): 'white' | 'black' => {
  const chess = new Chess(initialFen);
  const setupPlies = Math.max(0, moves.length - 1);
  for (let j = 0; j < setupPlies; j++) {
    applyUciMove(chess, moves[j]);
  }
  return chess.turn() === 'w' ? 'white' : 'black';
};

/** Main-line sidebar labels (`Start`, `1. e4`, …) for a regression puzzle. */
export const getRegressionMainLineLabels = (
  regression: AnalysisRegression,
): string[] => {
  const moves = regression.moves.split(' ').filter(Boolean);
  const chess = new Chess(regression.fen);
  const labels = ['Start'];

  moves.forEach((uci, index) => {
    if (applyUciMove(chess, uci)) {
      const san = chess.history().at(-1) ?? uci;
      labels.push(`${index + 1}. ${san}`);
    }
  });

  return labels;
};

/** Completed puzzle snapshot for analysis regression stories. */
export const createRegressionAnalysisContext = (
  regression: AnalysisRegression,
): AnalysisContext => {
  const moves = regression.moves.split(' ').filter(Boolean);

  return {
    initialFen: regression.fen,
    solutionMoves: moves,
    currentPly: moves.length,
    boardOrientation: playerColorForSolution(regression.fen, moves),
  };
};
