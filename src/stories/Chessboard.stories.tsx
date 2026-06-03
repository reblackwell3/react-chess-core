import { Meta, StoryObj } from '@storybook/react';
import { ChessboardDnDProvider } from 'react-chessboard';
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
