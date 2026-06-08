import { Chess } from 'chess.js';
import type { AnalysisContext } from '../features/analysis/types';
import { applyUciMove } from '../features/analysis/analysisUtils';

export const samplePuzzleFen =
  'r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24';

export const samplePuzzleMoves = 'f2g3 e6e7 b2b1 b3c1 b1c1 h6c1'.split(' ');

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

/** Completed puzzle snapshot for analysis stories. */
export const createSampleAnalysisContext = (): AnalysisContext => ({
  initialFen: samplePuzzleFen,
  solutionMoves: samplePuzzleMoves,
  currentPly: samplePuzzleMoves.length,
  boardOrientation: playerColorForSolution(samplePuzzleFen, samplePuzzleMoves),
});
