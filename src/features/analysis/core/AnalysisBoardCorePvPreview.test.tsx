/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { AnalysisBoardCore } from './AnalysisBoardCore';
import { ANALYSIS_PV_STEP_MS } from '../analysisPvStepMs';

// Avoid the engine barrel: it pulls MUI, which isn't resolvable in this jest env.
jest.mock('../../engine', () => ({
  DEFAULT_STOCKFISH_SCRIPT_URL: '/stockfish.js',
  useAnalysisEngine: jest.fn(() => ({
    status: 'done',
    depth: 16,
    lines: [],
  })),
}));

jest.mock('./AnalysisChessboardView', () => ({
  AnalysisChessboardView: ({ model }: { model: { fen: string } }) => (
    <div data-testid="board-fen">{model.fen}</div>
  ),
}));

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_AFTER_E4 =
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
const FEN_AFTER_E4_E6 =
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
const FEN_AFTER_D4 =
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1';

const renderAnalysis = () =>
  render(
    <AnalysisBoardCore
      analysisContext={{
        initialFen: START_FEN,
        solutionMoves: ['d2d4', 'd7d5'],
        currentPly: 0,
        boardOrientation: 'white',
      }}
      onClose={() => {}}
      theme="dark"
      boardWidth={400}
      renderContainer={({ children }) => <div>{children}</div>}
      renderMain={({ board, sidebar }) => (
        <div>
          {board}
          {sidebar}
        </div>
      )}
      renderSidebar={({
        historyRows,
        onSelectHistoryRow,
        engineEvaluationPanel,
      }) => (
        <div>
          {historyRows.map((row) => (
            <button key={row.key} onClick={() => onSelectHistoryRow(row)}>
              {row.label}
            </button>
          ))}
          {engineEvaluationPanel}
        </div>
      )}
      renderEngineEvaluation={({ onSelectPvLine }) => (
        <button onClick={() => onSelectPvLine?.(['e2e4', 'e7e6'], 16, 1)}>
          pv-line
        </button>
      )}
    />,
  );

describe('AnalysisBoardCore PV preview', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates the PV line, then returns to a clicked history row mid-animation', () => {
    renderAnalysis();
    expect(screen.getByTestId('board-fen').textContent).toBe(START_FEN);

    fireEvent.click(screen.getByText('pv-line'));
    expect(screen.getByTestId('board-fen').textContent).toBe(FEN_AFTER_E4);

    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('board-fen').textContent).toBe(START_FEN);
  });

  it('returns to a clicked history row after the full PV line has played', () => {
    renderAnalysis();

    fireEvent.click(screen.getByText('pv-line'));
    act(() => {
      jest.advanceTimersByTime(ANALYSIS_PV_STEP_MS * 3);
    });
    expect(screen.getByTestId('board-fen').textContent).toBe(FEN_AFTER_E4_E6);

    fireEvent.click(screen.getByText('1. d4'));
    expect(screen.getByTestId('board-fen').textContent).toBe(FEN_AFTER_D4);

    fireEvent.click(screen.getByText('pv-line'));
    act(() => {
      jest.advanceTimersByTime(ANALYSIS_PV_STEP_MS * 3);
    });
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByTestId('board-fen').textContent).toBe(START_FEN);
  });
});
