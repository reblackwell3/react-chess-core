import { useMemo } from 'react';
import { Box } from '@mui/material';
import { normalizeEvalForWhite } from '../formatEvaluation';
import { isAnalyzableFen } from '../isAnalyzableFen';
import { usePlayTimeEngineEvaluation } from '../PlayTimeEngineContext';
import { useAnalysisEngine } from '../useAnalysisEngine';
import type { AnalysisEngineOptions } from '../types';
import { defaultInlineEvalEngineOptions } from './defaultEvalEngineOptions';
import { PositionEvalBar } from './PositionEvalBar';
import {
  DEFAULT_EVAL_BAR_MAX_PAWNS,
  formatEvalBarLabel,
} from './positionEvalBarUtils';

export type BoardPositionEvalProps = {
  fen: string;
  maxPawns?: number;
  engine?: AnalysisEngineOptions;
};

type BoardPositionEvalInnerProps = BoardPositionEvalProps & {
  playTime: ReturnType<typeof usePlayTimeEngineEvaluation>;
};

const BoardPositionEvalInner = ({
  fen,
  maxPawns = DEFAULT_EVAL_BAR_MAX_PAWNS,
  engine,
  playTime,
}: BoardPositionEvalInnerProps) => {
  const engineOptions = useMemo(
    () => ({
      ...defaultInlineEvalEngineOptions,
      ...engine,
      enabled:
        !playTime &&
        (engine?.enabled ?? true) &&
        isAnalyzableFen(fen),
    }),
    [engine, fen, playTime],
  );

  const standaloneEvaluation = useAnalysisEngine(fen, engineOptions);
  const evaluation = playTime?.evaluation ?? standaloneEvaluation;
  const topLine = evaluation.lines[0];
  const normalized = topLine
    ? normalizeEvalForWhite(fen, topLine.centipawns, topLine.mate)
    : { centipawns: null, mate: null };

  const evalLabel =
    evaluation.status === 'error'
      ? '—'
      : formatEvalBarLabel(normalized.centipawns, normalized.mate);

  if (!isAnalyzableFen(fen)) {
    return null;
  }

  return (
    <Box sx={{ mb: 0.75 }}>
      <PositionEvalBar
        evalLabel={evalLabel}
        centipawns={normalized.centipawns}
        mate={normalized.mate}
        maxPawns={maxPawns}
        status={evaluation.status}
      />
    </Box>
  );
};

export const BoardPositionEval = (props: BoardPositionEvalProps) => {
  const playTime = usePlayTimeEngineEvaluation();
  const sharedPlayTime =
    playTime && playTime.setupFen === props.fen ? playTime : null;

  return (
    <BoardPositionEvalInner {...props} playTime={sharedPlayTime} />
  );
};

export default BoardPositionEval;
