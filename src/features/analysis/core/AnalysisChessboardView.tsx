import { ChessboardDnDProvider } from '../../chessboard/ChessboardDnDProvider';
import { HighlightChessboard } from '../../chessboard/HighlightChessboard';
import { AnalysisBoardModel } from './useAnalysisBoardModel';

/** Draggable analysis board (no surrounding layout chrome). */
export const AnalysisChessboardView = ({ model }: { model: AnalysisBoardModel }) => (
  <ChessboardDnDProvider>
    <HighlightChessboard
      checkSquare={model.checkSquare ?? ''}
      hintSquare={null}
      incorrectMoveSquare={null}
      position={model.fen}
      boardOrientation={model.boardOrientation}
      boardWidth={model.boardWidth}
      arePiecesDraggable={true}
      onPieceDrop={model.onPieceDrop}
      promotionDialogVariant="modal"
      lastMoveUci={model.lastMoveUci}
    />
  </ChessboardDnDProvider>
);
