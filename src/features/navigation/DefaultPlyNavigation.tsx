import {
  navButtonStyle,
  navRowStyle,
  palette,
  plyLabelStyle,
  scrubberInputStyle,
} from './plyNavigationStyles';
import type { PlyNavigationRenderProps } from './types';

/** Library-default ply navigation (inline styles). */
export const DefaultPlyNavigation = ({
  plyIndex,
  totalPly,
  canPrev,
  canNext,
  onGoFirst,
  onGoPrev,
  onGoNext,
  onGoLast,
  onGoTo,
  theme,
  showScrubber,
  showPlyLabel,
}: PlyNavigationRenderProps) => {
  const colors = palette(theme);
  const buttonStyle = navButtonStyle(colors);

  return (
    <div style={navRowStyle}>
      <button
        type="button"
        onClick={onGoFirst}
        disabled={!canPrev}
        style={buttonStyle}
        aria-label="First move"
      >
        ⏮
      </button>
      <button
        type="button"
        onClick={onGoPrev}
        disabled={!canPrev}
        style={buttonStyle}
        aria-label="Previous move"
      >
        ◀
      </button>

      {showScrubber ? (
        <input
          type="range"
          min={0}
          max={totalPly}
          value={plyIndex}
          onChange={(e) => onGoTo(Number(e.target.value))}
          style={scrubberInputStyle}
          aria-label="Scrub through game"
        />
      ) : showPlyLabel ? (
        <span style={{ ...plyLabelStyle, color: colors.text }}>
          {plyIndex} / {totalPly}
        </span>
      ) : null}

      <button
        type="button"
        onClick={onGoNext}
        disabled={!canNext}
        style={buttonStyle}
        aria-label="Next move"
      >
        ▶
      </button>
      <button
        type="button"
        onClick={onGoLast}
        disabled={!canNext}
        style={buttonStyle}
        aria-label="Last move"
      >
        ⏭
      </button>
    </div>
  );
};

export const defaultRenderPlyNavigation = (props: PlyNavigationRenderProps) => (
  <DefaultPlyNavigation {...props} />
);
