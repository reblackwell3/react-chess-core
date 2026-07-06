import { useMemo, type CSSProperties } from 'react';
import { boardSquareHighlightColors } from './boardSquareHighlightColors';
import { useChessboardTheme } from './chessboardTheme';
import { createFeedbackSquareRenderer } from './createFeedbackSquareRenderer';
import {
  mergeCustomArrowsWithLastMove,
  resolveLastMoveUci,
  type ChessboardLineContext,
} from './lastMoveArrow';
import { useClickToMove } from './useClickToMove';
import { Chessboard } from 'react-chessboard';

/** Prevent mobile long-press text selection and iOS callout menus on the board. */
const nonSelectableBoardStyle: CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
};

const getCheckHighlighting = (checkSquare: string) => {
  const styles: Record<string, { backgroundColor: string }> = {};
  styles[checkSquare] = { backgroundColor: boardSquareHighlightColors.check };
  return styles;
};

const getFeedbackHighlighting = (hintSquare: string | null) => {
  const styles: Record<string, { backgroundColor: string }> = {};
  if (hintSquare) {
    styles[hintSquare] = { backgroundColor: boardSquareHighlightColors.hint };
  }
  return styles;
};

export interface HighlightChessboardProps {
  checkSquare: string;
  hintSquare: string | null;
  /** Origin square of a rejected training move — shows a red X on the snapped-back piece. */
  incorrectMoveSquare?: string | null;
  /** Destination square of the engine refutation — shows an orange exclamation. */
  refutationMoveSquare?: string | null;
  /** Destination square of the last correct training move — shows a green check. */
  correctMoveSquare?: string | null;
  /** UCI of the move that led to the current position (shows a last-move arrow). */
  lastMoveUci?: string | null;
  /** When `lastMoveUci` is omitted, derives the arrow from the line at `plyIndex`. */
  lineContext?: ChessboardLineContext;
  /** Enable click-to-move when `onPieceDrop` is provided. Defaults to true. */
  clickToMove?: boolean;
  /** Show selected-square / move-target overlays for click-to-move. Defaults to true. */
  clickToMoveHighlight?: boolean;
  /** Colored move-quality dots on destination squares (bottom-right of square). */
  moveQualitySquareStyles?: Record<
    string,
    { bgcolor: string }
  >;
  [key: string]: any;
}

export const HighlightChessboard = ({
  checkSquare,
  hintSquare,
  incorrectMoveSquare = null,
  refutationMoveSquare = null,
  correctMoveSquare = null,
  lastMoveUci,
  lineContext,
  clickToMove,
  clickToMoveHighlight = true,
  moveQualitySquareStyles,
  customSquareStyles: extraSquareStyles,
  customArrows,
  customBoardStyle,
  onPieceDrop,
  position,
  arePiecesDraggable,
  autoPromoteToQueen,
  isDraggablePiece,
  onPromotionCheck,
  onSquareClick,
  onPromotionPieceSelect,
  onPieceDragBegin,
  showPromotionDialog: showPromotionDialogProp,
  promotionToSquare: promotionToSquareProp,
  ...props
}: HighlightChessboardProps) => {
  const { customDarkSquareStyle, customLightSquareStyle } = useChessboardTheme();
  const clickToMoveEnabled =
    clickToMove !== false && typeof onPieceDrop === 'function';

  const {
    clickSquareStyles,
    handleSquareClick,
    handlePromotionPieceSelect,
    handlePieceDragBegin,
    showPromotionDialog: clickPromotionDialog,
    promotionToSquare: clickPromotionToSquare,
  } = useClickToMove({
    enabled: clickToMoveEnabled,
    position,
    arePiecesDraggable,
    autoPromoteToQueen,
    isDraggablePiece,
    onPromotionCheck,
    onPieceDrop,
    onSquareClick,
    onPromotionPieceSelect,
    onPieceDragBegin,
  });

  const checkStyles = getCheckHighlighting(checkSquare);
  const feedbackStyles = getFeedbackHighlighting(hintSquare);
  const customSquareStyles = {
    ...(clickToMoveHighlight ? clickSquareStyles : {}),
    ...checkStyles,
    ...feedbackStyles,
    ...extraSquareStyles,
  };
  const customSquare = useMemo(
    () =>
      createFeedbackSquareRenderer({
        correctMoveSquare,
        incorrectMoveSquare,
        refutationMoveSquare,
        moveQualitySquareStyles,
      }),
    [
      correctMoveSquare,
      incorrectMoveSquare,
      refutationMoveSquare,
      moveQualitySquareStyles,
    ],
  );

  const resolvedLastMoveUci = useMemo(
    () => resolveLastMoveUci({ lastMoveUci, lineContext }),
    [lastMoveUci, lineContext],
  );

  const mergedCustomArrows = useMemo(
    () => mergeCustomArrowsWithLastMove(customArrows, resolvedLastMoveUci),
    [customArrows, resolvedLastMoveUci],
  );

  const promotionControlProps = clickPromotionDialog
    ? {
        showPromotionDialog: true,
        promotionToSquare: clickPromotionToSquare,
      }
    : showPromotionDialogProp !== undefined ||
        promotionToSquareProp !== undefined
      ? {
          showPromotionDialog: showPromotionDialogProp,
          promotionToSquare: promotionToSquareProp,
        }
      : {};

  return (
    <Chessboard
      customDarkSquareStyle={customDarkSquareStyle}
      customLightSquareStyle={customLightSquareStyle}
      customSquareStyles={customSquareStyles}
      customSquare={customSquare}
      customBoardStyle={{ ...nonSelectableBoardStyle, ...customBoardStyle }}
      position={position}
      arePiecesDraggable={arePiecesDraggable}
      autoPromoteToQueen={autoPromoteToQueen}
      isDraggablePiece={isDraggablePiece}
      onPromotionCheck={onPromotionCheck}
      onPieceDrop={onPieceDrop}
      onSquareClick={clickToMoveEnabled ? handleSquareClick : onSquareClick}
      onPromotionPieceSelect={
        clickToMoveEnabled ? handlePromotionPieceSelect : onPromotionPieceSelect
      }
      onPieceDragBegin={
        clickToMoveEnabled ? handlePieceDragBegin : onPieceDragBegin
      }
      customArrows={mergedCustomArrows}
      {...promotionControlProps}
      {...props}
    />
  );
};
