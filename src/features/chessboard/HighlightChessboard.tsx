import { useMemo, type CSSProperties } from 'react';
import { boardSquareHighlightColors } from './boardSquareHighlightColors';
import { useChessboardTheme } from './chessboardTheme';
import { createFeedbackSquareRenderer } from './createFeedbackSquareRenderer';
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

const getFeedbackHighlighting = (
  hintSquare: string | null,
  incorrectMoveSquare: string | null,
) => {
  const styles: Record<string, { backgroundColor: string }> = {};
  if (hintSquare) {
    styles[hintSquare] = { backgroundColor: boardSquareHighlightColors.hint };
  }
  if (incorrectMoveSquare) {
    styles[incorrectMoveSquare] = {
      backgroundColor: boardSquareHighlightColors.incorrect,
    };
  }
  return styles;
};

export interface HighlightChessboardProps {
  checkSquare: string;
  hintSquare: string | null;
  incorrectMoveSquare: string | null;
  /** Destination square of the last correct training move — shows a green check. */
  correctMoveSquare?: string | null;
  /** Enable click-to-move when `onPieceDrop` is provided. Defaults to true. */
  clickToMove?: boolean;
  [key: string]: any;
}

export const HighlightChessboard = ({
  checkSquare,
  hintSquare,
  incorrectMoveSquare,
  correctMoveSquare = null,
  clickToMove,
  customSquareStyles: extraSquareStyles,
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
  const feedbackStyles = getFeedbackHighlighting(
    hintSquare,
    incorrectMoveSquare,
  );
  const customSquareStyles = {
    ...clickSquareStyles,
    ...checkStyles,
    ...feedbackStyles,
    ...extraSquareStyles,
  };
  const customSquare = useMemo(
    () =>
      correctMoveSquare
        ? createFeedbackSquareRenderer(correctMoveSquare)
        : undefined,
    [correctMoveSquare],
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
      {...promotionControlProps}
      {...props}
    />
  );
};
