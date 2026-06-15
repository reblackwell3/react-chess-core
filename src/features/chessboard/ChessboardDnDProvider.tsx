import type { ReactNode } from 'react';
import { ChessboardDnDProvider as BaseChessboardDnDProvider } from 'react-chessboard';

/** Touch DnD also accepts mouse events (Chrome device emulation, touch laptops). */
const TOUCH_DND_OPTIONS = { enableMouseEvents: true } as const;

export const ChessboardDnDProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <BaseChessboardDnDProvider options={TOUCH_DND_OPTIONS}>
    {children}
  </BaseChessboardDnDProvider>
);
