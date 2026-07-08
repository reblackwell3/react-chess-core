import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { usePositionKeyboardNav } from '../../navigation';
import { applyUciMove } from '../analysisUtils';
import { ANALYSIS_PV_STEP_MS } from '../analysisPvStepMs';
import { AnalysisChessboardView } from './AnalysisChessboardView';
import {
  AnalysisContainerRenderProps,
  AnalysisMainRenderProps,
  AnalysisSidebarRenderProps,
  EngineEvaluationRenderProps,
} from './renderProps';
import { AnalysisEngineOptions } from '../../engine/types';
import {
  AnalysisBoardModel,
  useAnalysisBoardModel,
  UseAnalysisBoardModelArgs,
} from './useAnalysisBoardModel';

export type AnalysisBoardCoreProps = UseAnalysisBoardModelArgs & {
  engine?: AnalysisEngineOptions;
  /**
   * Register ArrowLeft/ArrowRight/Home/End shortcuts while analysis is open.
   * Default true.
   */
  keyboardNav?: boolean;
  /** Host-owned shell (modal, page layout, etc.). */
  renderContainer: (props: AnalysisContainerRenderProps) => React.ReactNode;
  /** Host-owned grid/placement of board + sidebar (no library default). */
  renderMain: (props: AnalysisMainRenderProps) => React.ReactNode;
  renderSidebar: (props: AnalysisSidebarRenderProps) => React.ReactNode;
  renderEngineEvaluation: (
    props: EngineEvaluationRenderProps,
  ) => React.ReactNode;
};

/**
 * Analysis logic + composition only: hook, board node, sidebar/engine slots.
 * No layout divs — use {@link renderMain} (e.g. `AnalysisBoardLayout` from `analysis/defaults` or a host layout).
 */
export const AnalysisBoardCore = ({
  renderContainer,
  renderMain,
  renderSidebar,
  renderEngineEvaluation,
  keyboardNav = true,
  ...modelArgs
}: AnalysisBoardCoreProps) => {
  const model = useAnalysisBoardModel(modelArgs);
  return (
    <AnalysisBoardCoreView
      model={model}
      keyboardNav={keyboardNav}
      renderContainer={renderContainer}
      renderMain={renderMain}
      renderSidebar={renderSidebar}
      renderEngineEvaluation={renderEngineEvaluation}
    />
  );
};

type AnalysisBoardCoreViewProps = {
  model: AnalysisBoardModel;
  keyboardNav: boolean;
  renderContainer: AnalysisBoardCoreProps['renderContainer'];
  renderMain: AnalysisBoardCoreProps['renderMain'];
  renderSidebar: AnalysisBoardCoreProps['renderSidebar'];
  renderEngineEvaluation: AnalysisBoardCoreProps['renderEngineEvaluation'];
};

/** Pure composition (no layout styles) for testing and reuse. */
export const AnalysisBoardCoreView = ({
  model,
  keyboardNav,
  renderContainer,
  renderMain,
  renderSidebar,
  renderEngineEvaluation,
}: AnalysisBoardCoreViewProps) => {
  const { ply, maxPly, onSelectPly, fen: navFen } = model;
  const [pvPreview, setPvPreview] = useState<{
    fen: string;
    lastMoveUci: string | null;
    multipv: number;
  } | null>(null);
  const pvAnimRef = useRef<{
    cancelled: boolean;
    timeoutIds: ReturnType<typeof setTimeout>[];
  }>({ cancelled: false, timeoutIds: [] });

  const clearPvAnimation = useCallback(() => {
    const anim = pvAnimRef.current;
    anim.cancelled = true;
    anim.timeoutIds.forEach(clearTimeout);
    pvAnimRef.current = { cancelled: false, timeoutIds: [] };
  }, []);

  useEffect(() => () => clearPvAnimation(), [clearPvAnimation]);

  const onSelectPvLine = useCallback(
    (pv: string[], _depth: number, multipv: number) => {
      if (pv.length === 0) {
        return;
      }

      clearPvAnimation();
      const anim = {
        cancelled: false,
        timeoutIds: [] as ReturnType<typeof setTimeout>[],
      };
      pvAnimRef.current = anim;

      const chess = new Chess(navFen);
      let lastUci: string | null = null;
      let plyIndex = 0;

      const step = () => {
        if (anim.cancelled || plyIndex >= pv.length) {
          return;
        }

        const uci = pv[plyIndex]!;
        if (!applyUciMove(chess, uci)) {
          return;
        }

        lastUci = uci;
        plyIndex += 1;
        setPvPreview({ fen: chess.fen(), lastMoveUci: lastUci, multipv });

        if (plyIndex < pv.length) {
          const id = setTimeout(step, ANALYSIS_PV_STEP_MS);
          anim.timeoutIds.push(id);
        }
      };

      step();
    },
    [clearPvAnimation, navFen],
  );

  const displayModel =
    pvPreview !== null
      ? {
          ...model,
          fen: pvPreview.fen,
          lastMoveUci: pvPreview.lastMoveUci,
          onSelectPly: (nextPly: number) => {
            clearPvAnimation();
            setPvPreview(null);
            onSelectPly(nextPly);
          },
          onSelectHistoryRow: (row: Parameters<typeof model.onSelectHistoryRow>[0]) => {
            clearPvAnimation();
            setPvPreview(null);
            model.onSelectHistoryRow(row);
          },
          onPieceDrop: (
            sourceSquare: string,
            targetSquare: string,
            piece: string,
          ) => {
            clearPvAnimation();
            setPvPreview(null);
            return model.onPieceDrop(sourceSquare, targetSquare, piece);
          },
        }
      : model;

  const canPrev = ply > 0;
  const canNext = ply < maxPly;
  const goFirst = useCallback(() => onSelectPly(0), [onSelectPly]);
  const goPrev = useCallback(() => onSelectPly(ply - 1), [onSelectPly, ply]);
  const goNext = useCallback(() => onSelectPly(ply + 1), [onSelectPly, ply]);
  const goLast = useCallback(() => onSelectPly(maxPly), [maxPly, onSelectPly]);

  usePositionKeyboardNav({
    enabled: keyboardNav,
    canPrev,
    canNext,
    onPrev: goPrev,
    onNext: goNext,
    onFirst: goFirst,
    onLast: goLast,
  });

  const board = <AnalysisChessboardView model={displayModel} />;
  const engineEvaluationPanel = model.engineEnabled
    ? renderEngineEvaluation({
        fen: navFen,
        evaluation: model.engineEvaluation,
        theme: model.theme,
        selectedPvMultipv: pvPreview?.multipv ?? null,
        onSelectPvLine,
      })
    : null;

  const sidebar = renderSidebar({
    moves: model.solutionSans,
    historyRows: model.historyRows,
    isHistoryRowSelected: model.isHistoryRowSelected,
    onSelectHistoryRow: model.onSelectHistoryRow,
    ply: model.ply,
    maxPly: model.maxPly,
    onSelectPly: model.onSelectPly,
    theme: model.theme,
    engineEvaluationPanel,
  });

  const main = renderMain({ model, board, sidebar });

  return renderContainer({
    theme: model.theme,
    onClose: model.onClose,
    children: main,
    onBackdropMouseDown: model.onBackdropMouseDown,
  });
};

export type { AnalysisBoardModel, UseAnalysisBoardModelArgs };
