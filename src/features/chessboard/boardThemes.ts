export const BOARD_THEME_IDS = [
  'classic',
  'forest',
  'marine',
  'marble',
  'ivory',
  'ocean',
  'copper',
  'bubblegum',
  'sunset',
] as const;

export type BoardThemeId = (typeof BOARD_THEME_IDS)[number];

export type BoardThemeDefinition = {
  label: string;
  darkSquare: string;
  lightSquare: string;
};

export const DEFAULT_BOARD_THEME: BoardThemeId = 'classic';

export const BOARD_THEMES: Record<BoardThemeId, BoardThemeDefinition> = {
  classic: {
    label: 'Classic',
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
  },
  forest: {
    label: 'Forest',
    darkSquare: '#769656',
    lightSquare: '#eeeed2',
  },
  marine: {
    label: 'Marine',
    darkSquare: '#5b7c99',
    lightSquare: '#d6e4f0',
  },
  marble: {
    label: 'Marble',
    darkSquare: '#a8a8a8',
    lightSquare: '#ffffff',
  },
  ivory: {
    label: 'Ivory',
    darkSquare: '#c9a66b',
    lightSquare: '#fff8e7',
  },
  ocean: {
    label: 'Ocean',
    darkSquare: '#2d6a7e',
    lightSquare: '#a8dadc',
  },
  copper: {
    label: 'Copper',
    darkSquare: '#9c6644',
    lightSquare: '#f4e4d4',
  },
  bubblegum: {
    label: 'Bubblegum',
    darkSquare: '#c77dff',
    lightSquare: '#ffd6ff',
  },
  sunset: {
    label: 'Sunset',
    darkSquare: '#e76f51',
    lightSquare: '#ffe8d6',
  },
};

export function isBoardThemeId(value: unknown): value is BoardThemeId {
  return (
    typeof value === 'string' &&
    (BOARD_THEME_IDS as readonly string[]).includes(value)
  );
}

export function boardThemeFromLegacyUiTheme(_theme: 'light' | 'dark'): BoardThemeId {
  return DEFAULT_BOARD_THEME;
}

export function getBoardThemeStyles(boardTheme: BoardThemeId) {
  const { darkSquare, lightSquare } = BOARD_THEMES[boardTheme];
  return {
    customDarkSquareStyle: { backgroundColor: darkSquare },
    customLightSquareStyle: { backgroundColor: lightSquare },
  };
}
