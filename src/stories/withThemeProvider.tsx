import React from 'react';
import { ThemeProvider } from '../features/chessboard/chessboardTheme';

const withThemeProvider = (Story: React.ComponentType, context: { globals: { theme?: string } }) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider theme={theme}>
      <Story />
    </ThemeProvider>
  );
};

export default withThemeProvider;
