import {
  fenLineFromUciMoves,
  parsePreviewMovesUci,
} from './openingUciPreview';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('parsePreviewMovesUci', () => {
  it('parses whitespace-separated UCI moves', () => {
    expect(parsePreviewMovesUci('e2e4 e7e5 g1f3')).toEqual([
      'e2e4',
      'e7e5',
      'g1f3',
    ]);
  });

  it('returns an empty array for blank input', () => {
    expect(parsePreviewMovesUci(undefined)).toEqual([]);
    expect(parsePreviewMovesUci('   ')).toEqual([]);
  });
});

describe('fenLineFromUciMoves', () => {
  it('returns an empty array when start FEN is missing', () => {
    expect(fenLineFromUciMoves(undefined, 'e2e4')).toEqual([]);
    expect(fenLineFromUciMoves('  ', 'e2e4')).toEqual([]);
  });

  it('builds a ply-by-ply FEN line capped at maxPlies', () => {
    const line = fenLineFromUciMoves(START, 'e2e4 e7e5 g1f3', 2);

    expect(line).toHaveLength(3);
    expect(line[0]).toBe(START);
    expect(line[2]).toBe(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    );
  });
});
