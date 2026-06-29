import { Box, Typography } from '@mui/material';
import {
  DEFAULT_EVAL_BAR_MAX_PAWNS,
  evalToBarPercent,
} from './positionEvalBarUtils';

export type PositionEvalBarProps = {
  evalLabel: string;
  centipawns: number | null;
  mate: number | null;
  maxPawns?: number;
  status?: 'idle' | 'loading' | 'analyzing' | 'error';
};

const BAR_HEIGHT = 16;
const WHITE_FILL = '#ffffff';
const BLACK_FILL = '#262421';

export const PositionEvalBar = ({
  evalLabel,
  centipawns,
  mate,
  maxPawns = DEFAULT_EVAL_BAR_MAX_PAWNS,
  status = 'idle',
}: PositionEvalBarProps) => {
  const whitePercent = evalToBarPercent(centipawns, mate, maxPawns);

  const statusLabel =
    status === 'loading'
      ? '…'
      : status === 'analyzing' && centipawns === null && mate === null
        ? '…'
        : null;

  const displayLabel = statusLabel ?? evalLabel;

  return (
    <Box
      sx={{ width: '100%', position: 'relative' }}
      aria-label={`Position evaluation ${displayLabel}`}
      role="img"
    >
      <Box
        sx={{
          height: BAR_HEIGHT,
          display: 'flex',
          overflow: 'hidden',
          borderRadius: 0.5,
        }}
      >
        <Box
          sx={{
            width: `${whitePercent}%`,
            bgcolor: WHITE_FILL,
            transition: 'width 0.2s ease',
          }}
        />
        <Box
          sx={{
            flex: 1,
            bgcolor: BLACK_FILL,
            transition: 'flex-grow 0.2s ease',
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${whitePercent}%`,
          transform: 'translate(-50%, -50%)',
          px: 0.5,
          py: 0.125,
          minWidth: 28,
          bgcolor: 'rgba(255,255,255,0.92)',
          borderRadius: 0.25,
          textAlign: 'center',
          pointerEvents: 'none',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 10,
            lineHeight: 1.2,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            color: BLACK_FILL,
            display: 'block',
          }}
        >
          {displayLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default PositionEvalBar;
