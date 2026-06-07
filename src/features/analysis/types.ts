/** Input for {@link AnalysisPosition} and the analysis board UI. */
export type AnalysisContext = {
  initialFen: string;
  /** Main line in UCI notation (e.g. full game or puzzle solution). */
  solutionMoves: string[];
  /** Ply index to open at (0 = start position). */
  currentPly: number;
  boardOrientation: 'white' | 'black';
};
