import { Chess, type Square } from 'chess.js';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { boardSquareHighlightColors } from './boardSquareHighlightColors';

type Piece = string;

type PendingPromotion = {
  from: Square;
  to: Square;
  piece: Piece;
};

export type ClickToMoveSquareStyles = Record<string, CSSProperties>;

export type UseClickToMoveOptions = {
  enabled: boolean;
  position: string | undefined;
  arePiecesDraggable?: boolean;
  autoPromoteToQueen?: boolean;
  isDraggablePiece?: (args: { piece: Piece; sourceSquare: Square }) => boolean;
  onPromotionCheck?: (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => boolean;
  onPieceDrop?: (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => boolean;
  onSquareClick?: (square: Square, piece: Piece | undefined) => void;
  onPromotionPieceSelect?: (
    piece?: Piece,
    promoteFromSquare?: Square,
    promoteToSquare?: Square,
  ) => boolean;
  onPieceDragBegin?: (piece: Piece, sourceSquare: Square) => void;
};

function defaultPromotionCheck(
  sourceSquare: Square,
  targetSquare: Square,
  piece: Piece,
): boolean {
  return (
    ((piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
      (piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1')) &&
    Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)) <= 1
  );
}

function pieceAtSquare(fen: string, square: Square): Piece | null {
  const boardPiece = new Chess(fen).get(square);
  if (!boardPiece) {
    return null;
  }
  const color = boardPiece.color === 'w' ? 'w' : 'b';
  const type = boardPiece.type.toUpperCase();
  return `${color}${type}`;
}

function getMoveOptionStyles(fen: string, fromSquare: Square): ClickToMoveSquareStyles {
  const chess = new Chess(fen);
  const moves = chess.moves({ square: fromSquare, verbose: true });
  if (!moves.length) {
    return {
      [fromSquare]: { backgroundColor: boardSquareHighlightColors.selected },
    };
  }

  const styles: ClickToMoveSquareStyles = {
    [fromSquare]: { backgroundColor: boardSquareHighlightColors.selected },
  };

  for (const move of moves) {
    styles[move.to] = {
      background: chess.get(move.to)
        ? boardSquareHighlightColors.captureTarget
        : boardSquareHighlightColors.moveTarget,
      borderRadius: '50%',
    };
  }

  return styles;
}

export function useClickToMove({
  enabled,
  position,
  arePiecesDraggable = true,
  autoPromoteToQueen = false,
  isDraggablePiece,
  onPromotionCheck = defaultPromotionCheck,
  onPieceDrop,
  onSquareClick,
  onPromotionPieceSelect,
  onPieceDragBegin,
}: UseClickToMoveOptions) {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(
    null,
  );

  const fen = typeof position === 'string' ? position : undefined;

  const clearSelection = useCallback(() => {
    setMoveFrom(null);
    setPendingPromotion(null);
  }, []);

  useEffect(() => {
    clearSelection();
  }, [fen, clearSelection]);

  const clickSquareStyles = useMemo<ClickToMoveSquareStyles>(() => {
    if (!enabled || !moveFrom || !fen) {
      return {};
    }
    return getMoveOptionStyles(fen, moveFrom);
  }, [enabled, fen, moveFrom]);

  const canSelectPiece = useCallback(
    (square: Square, piece: Piece | undefined) => {
      if (!piece || !arePiecesDraggable || !onPieceDrop) {
        return false;
      }
      if (isDraggablePiece) {
        return isDraggablePiece({ piece, sourceSquare: square });
      }
      return true;
    },
    [arePiecesDraggable, isDraggablePiece, onPieceDrop],
  );

  const tryCompleteMove = useCallback(
    (from: Square, to: Square, piece: Piece) => {
      if (!onPieceDrop) {
        return false;
      }

      if (onPromotionCheck(from, to, piece)) {
        if (autoPromoteToQueen) {
          const promotedPiece = piece[0] === 'w' ? 'wQ' : 'bQ';
          const accepted = onPieceDrop(from, to, promotedPiece);
          clearSelection();
          return accepted;
        }

        setPendingPromotion({ from, to, piece });
        setMoveFrom(null);
        return true;
      }

      const accepted = onPieceDrop(from, to, piece);
      clearSelection();
      return accepted;
    },
    [autoPromoteToQueen, clearSelection, onPieceDrop, onPromotionCheck],
  );

  const handleSquareClick = useCallback(
    (square: Square, piece: Piece | undefined) => {
      onSquareClick?.(square, piece);

      if (!enabled || !onPieceDrop || !arePiecesDraggable || !fen) {
        return;
      }

      if (!moveFrom) {
        if (canSelectPiece(square, piece)) {
          setMoveFrom(square);
        }
        return;
      }

      if (square === moveFrom) {
        clearSelection();
        return;
      }

      const sourcePiece = pieceAtSquare(fen, moveFrom);
      if (!sourcePiece) {
        clearSelection();
        return;
      }

      const accepted = tryCompleteMove(moveFrom, square, sourcePiece);
      if (accepted) {
        return;
      }

      if (canSelectPiece(square, piece)) {
        setMoveFrom(square);
        return;
      }

      clearSelection();
    },
    [
      arePiecesDraggable,
      canSelectPiece,
      clearSelection,
      enabled,
      fen,
      moveFrom,
      onPieceDrop,
      onSquareClick,
      tryCompleteMove,
    ],
  );

  const handlePromotionPieceSelect = useCallback(
    (
      piece?: Piece,
      promoteFromSquare?: Square,
      promoteToSquare?: Square,
    ): boolean => {
      if (pendingPromotion && piece) {
        const { from, to } = pendingPromotion;
        onPieceDrop?.(from, to, piece);
        onPromotionPieceSelect?.(piece, from, to);
        clearSelection();
        return false;
      }

      if (onPromotionPieceSelect) {
        return onPromotionPieceSelect(piece, promoteFromSquare, promoteToSquare);
      }

      return true;
    },
    [clearSelection, onPieceDrop, onPromotionPieceSelect, pendingPromotion],
  );

  const handlePieceDragBegin = useCallback(
    (piece: Piece, sourceSquare: Square) => {
      clearSelection();
      onPieceDragBegin?.(piece, sourceSquare);
    },
    [clearSelection, onPieceDragBegin],
  );

  return {
    clickSquareStyles,
    handleSquareClick,
    handlePromotionPieceSelect,
    handlePieceDragBegin,
    showPromotionDialog: pendingPromotion !== null,
    promotionToSquare: pendingPromotion?.to ?? null,
  };
}
