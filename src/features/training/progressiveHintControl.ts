export type ProgressiveHintControlInput = {
  canShowHint: boolean;
  canShowReveal: boolean;
  revealLabel?: string;
  hintLabel?: string;
};

export type ProgressiveHintControlState = {
  visible: boolean;
  label: string;
  disabled: boolean;
  phase: 'hint' | 'reveal';
};

export const getProgressiveHintControl = ({
  canShowHint,
  canShowReveal,
  revealLabel = 'Show move',
  hintLabel = 'Hint',
}: ProgressiveHintControlInput): ProgressiveHintControlState => {
  if (!canShowHint && !canShowReveal) {
    return {
      visible: true,
      label: hintLabel,
      disabled: true,
      phase: 'hint',
    };
  }

  if (canShowHint) {
    return {
      visible: true,
      label: hintLabel,
      disabled: false,
      phase: 'hint',
    };
  }

  return {
    visible: true,
    label: revealLabel,
    disabled: !canShowReveal,
    phase: 'reveal',
  };
};
