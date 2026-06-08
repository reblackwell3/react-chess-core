import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AnalysisBoard } from '../../features/analysis/defaults/AnalysisBoard';
import { STORYBOOK_ANALYSIS_LAYOUT } from '../storybookLayout';
import { ANALYSIS_REGRESSIONS } from './fixtures';
import { createRegressionAnalysisContext } from './regressionAnalysisContext';

const MOVE_CLICK_DELAY_MS = 500;

const regression = ANALYSIS_REGRESSIONS.stockfishAnalysisMove3Ke6;

const meta: Meta<typeof AnalysisBoard> = {
  title: 'Regressions/Stockfish analysis',
  component: AnalysisBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Stockfish + analysis navigation regressions. Requires `npm run copy:stockfish` ' +
          '(runs automatically before Storybook).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AnalysisBoard>;

const assertEngineHealthy = (text: string) => {
  expect(text).not.toMatch(/Stockfish worker failed/i);
  expect(text).not.toMatch(/Engine unavailable/i);
};

/** Puzzle 66abad1bcb8d6163fd6e172a — rapid clicks through every main-line move. */
export const Move3Ke6DuringAnalysis: Story = {
  name: regression.name,
  args: {
    analysisContext: createRegressionAnalysisContext(regression),
    theme: 'dark',
    layout: STORYBOOK_ANALYSIS_LAYOUT,
    onClose: () => {},
    engine: { enabled: true, depth: 14, multiPv: 2 },
  },
  parameters: {
    docs: {
      description: {
        story: `Source puzzle ${regression.sourceId}. ${regression.description}`,
      },
    },
  },
  play: async () => {
    const body = within(document.body);
    const user = userEvent.setup({ delay: null });

    const dialog = await waitFor(() =>
      body.getByRole('dialog', { name: 'Analysis' }),
    );
    const sidebar = within(dialog);

    const moveRows = await waitFor(() => {
      const rows = within(
        sidebar.getByRole('list', { name: 'Move history' }),
      ).getAllByRole('listitem');
      expect(rows.length).toBeGreaterThan(1);
      return rows;
    });

    // Do not wait for engine idle — click through every ply while search is running.
    for (const row of moveRows) {
      await user.click(row);
      await new Promise((resolve) => setTimeout(resolve, MOVE_CLICK_DELAY_MS));
    }

    await waitFor(
      () => {
        const text = document.body.textContent ?? '';
        assertEngineHealthy(text);
        expect(text).toMatch(/Analyzing|Engine · depth|[+-]?\d/i);
      },
      { timeout: 30000 },
    );
  },
};
