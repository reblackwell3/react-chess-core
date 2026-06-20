import { Meta, StoryObj } from '@storybook/react';
import { Chess } from 'chess.js';
import { useState } from 'react';
import { ChessboardDnDProvider } from '../features/chessboard/ChessboardDnDProvider';
import { HighlightChessboard } from '../features/chessboard/HighlightChessboard';
const meta: Meta<typeof HighlightChessboard> = {
  title: 'Chessboard/HighlightChessboard',
  component: HighlightChessboard,
  decorators: [
    (Story) => (
      <ChessboardDnDProvider>
        <Story />
      </ChessboardDnDProvider>
    ),
  ],
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof HighlightChessboard>;

export const StartingPosition: Story = {
  args: {
    checkSquare: '',
    hintSquare: null,
    incorrectMoveSquare: null,
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    boardOrientation: 'white',
    boardWidth: 400,
  },
};

export const WithHint: Story = {
  args: {
    ...StartingPosition.args,
    hintSquare: 'e4',
  },
};

export const ClickToMove: Story = {
  args: {
    ...StartingPosition.args,
    arePiecesDraggable: true,
    autoPromoteToQueen: true,
    onPieceDrop: () => true,
  },
  render: (args) => {
    const [fen, setFen] = useState(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    );

    return (
      <HighlightChessboard
        {...args}
        position={fen}
        onPieceDrop={(from: string, to: string, piece: string) => {
          const chess = new Chess(fen);
          const move = chess.move({
            from,
            to,
            promotion: piece[1]?.toLowerCase(),
          });
          if (!move) {
            return false;
          }
          setFen(chess.fen());
          return true;
        }}
      />
    );
  },
};

export const WithCorrectMoveCheck: Story = {
  args: {
    ...StartingPosition.args,
    position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    correctMoveSquare: 'e4',
  },
};

export const WithIncorrectMoveX: Story = {
  args: {
    ...StartingPosition.args,
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    incorrectMoveSquare: 'e2',
  },
};
