import type { CSSProperties } from 'react';
import type { PlyNavigationTheme } from './types';

export type PlyNavigationPalette = {
  text: string;
  border: string;
  surface: string;
};

export const navRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

export const scrubberInputStyle: CSSProperties = {
  flex: 1,
};

export const plyLabelStyle: CSSProperties = {
  minWidth: 56,
  textAlign: 'center',
  fontSize: 14,
};

export function palette(theme: PlyNavigationTheme): PlyNavigationPalette {
  return {
    text: theme === 'dark' ? '#e8e8e8' : '#1a1a1a',
    border: theme === 'dark' ? '#3a3a3a' : '#d0d0d0',
    surface: theme === 'dark' ? '#262626' : '#f5f5f5',
  };
}

export function navButtonStyle(colors: PlyNavigationPalette): CSSProperties {
  return {
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
  };
}
