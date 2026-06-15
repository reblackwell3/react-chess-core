import { createContext, useContext, ReactNode } from 'react';
import {
  type BoardThemeId,
  boardThemeFromLegacyUiTheme,
  getBoardThemeStyles,
} from './boardThemes';

interface ChessboardThemeContextType {
  customDarkSquareStyle: { backgroundColor: string };
  customLightSquareStyle: { backgroundColor: string };
}

export const ChessboardThemeContext = createContext<
  ChessboardThemeContextType | undefined
>(undefined);

export const useChessboardTheme = () => {
  const context = useContext(ChessboardThemeContext);
  if (!context) {
    throw new Error('useChessboardTheme must be used within a ThemeProvider');
  }
  return context;
};

/** @deprecated Use {@link useChessboardTheme}. */
export const useTheme = useChessboardTheme;

/** @deprecated Use {@link getBoardThemeStyles}. */
export const getStylesForTheme = (theme: 'light' | 'dark') =>
  getBoardThemeStyles(boardThemeFromLegacyUiTheme(theme));

export type ThemeProviderProps = {
  children?: ReactNode;
  /** UI chrome palette; used when `boardTheme` is omitted. */
  theme?: 'light' | 'dark';
  boardTheme?: BoardThemeId;
};

export const ThemeProvider = ({
  children,
  theme = 'dark',
  boardTheme,
}: ThemeProviderProps) => {
  const resolvedBoardTheme =
    boardTheme ?? boardThemeFromLegacyUiTheme(theme);
  const { customDarkSquareStyle, customLightSquareStyle } =
    getBoardThemeStyles(resolvedBoardTheme);

  return (
    <ChessboardThemeContext.Provider
      value={{ customDarkSquareStyle, customLightSquareStyle }}
    >
      {children}
    </ChessboardThemeContext.Provider>
  );
};
