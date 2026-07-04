import type { ReactNode } from 'react';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ChessboardDnDProvider as BaseChessboardDnDProvider } from 'react-chessboard';

const touchMouseOptions = { enableMouseEvents: true };

/**
 * TouchBackend for touch and mouse (enableMouseEvents). Works on real devices and
 * avoids Chrome DevTools XL/4K Desktop HTML5Backend drag offset bugs.
 */
export const ChessboardDnDProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <BaseChessboardDnDProvider backend={TouchBackend} options={touchMouseOptions}>
    {children}
  </BaseChessboardDnDProvider>
);
