import React, { useCallback } from 'react';
import { usePositionKeyboardNav } from '../../navigation';
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
  const { ply, maxPly, onSelectPly } = model;
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

  const board = <AnalysisChessboardView model={model} />;
  const engineEvaluationPanel = model.engineEnabled
    ? renderEngineEvaluation({
        fen: model.fen,
        evaluation: model.engineEvaluation,
        theme: model.theme,
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
