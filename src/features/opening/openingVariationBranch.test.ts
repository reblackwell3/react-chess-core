import {
  fenFromOpeningPgn,
  fenLineFromOpeningPgn,
} from './openingVariationBranch';

describe('openingVariationBranch', () => {
  it('derives the tabiya FEN from a lichess opening PGN', () => {
    const fen = fenFromOpeningPgn(
      '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6',
    );

    expect(fen).toBe(
      'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    );
  });

  it('builds a ply-by-ply FEN line capped at maxPlies', () => {
    const line = fenLineFromOpeningPgn(
      '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3',
      undefined,
      3,
    );

    expect(line).toHaveLength(4);
    expect(line[0]).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    );
    expect(line[3]).toBe(
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    );
  });

  it('derives the English Attack FEN from its lichess PGN', () => {
    const fen = fenFromOpeningPgn(
      '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3',
    );

    expect(fen).toBe(
      'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6',
    );
  });
});
