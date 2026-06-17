import type { ReactNode } from 'react';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { ChessboardDnDProvider as BaseChessboardDnDProvider } from 'react-chessboard';

/**
 * HTML5 for mouse (desktop + Chrome device emulation), touch backend for real
 * mobile devices. react-chessboard alone picks TouchBackend whenever
 * `ontouchstart` is in window, which breaks mouse drags in DevTools emulation.
 */
export const ChessboardDnDProvider = ({
  children,
}: {
  children: ReactNode;
}) => (
  <BaseChessboardDnDProvider backend={MultiBackend} options={HTML5toTouch}>
    {children}
  </BaseChessboardDnDProvider>
);
