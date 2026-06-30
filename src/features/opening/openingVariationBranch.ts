import { Chess } from 'chess.js';

export const pgnMovetextToSans = (pgn: string): string[] =>
  pgn
    .replace(/\d+\.\s*/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));

/** FEN after playing through a movetext line from `startFen` (default: initial position). */
export const fenFromOpeningPgn = (
  pgn: string | undefined,
  startFen?: string,
): string | undefined => {
  if (!pgn?.trim()) {
    return undefined;
  }

  const chess = startFen ? new Chess(startFen) : new Chess();
  for (const san of pgnMovetextToSans(pgn)) {
    const move = chess.move(san);
    if (!move) {
      return undefined;
    }
  }

  return chess.fen();
};

/** FEN after each ply (index 0 = start) for up to `maxPlies` half-moves. */
export const fenLineFromOpeningSans = (
  openingSans: string[] | undefined,
  startFen?: string,
  maxPlies?: number,
): string[] => {
  const chess = startFen ? new Chess(startFen) : new Chess();
  const fens = [chess.fen()];

  if (!openingSans?.length) {
    return fens;
  }

  const limit = maxPlies ?? openingSans.length;
  for (const san of openingSans.slice(0, limit)) {
    const move = chess.move(san);
    if (!move) {
      break;
    }
    fens.push(chess.fen());
  }

  return fens;
};

/** FEN after each ply (index 0 = start) for up to `maxPlies` half-moves. */
export const fenLineFromOpeningPgn = (
  pgn: string | undefined,
  startFen?: string,
  maxPlies?: number,
): string[] => {
  const chess = startFen ? new Chess(startFen) : new Chess();
  const fens = [chess.fen()];

  if (!pgn?.trim()) {
    return fens;
  }

  const limit = maxPlies ?? pgnMovetextToSans(pgn).length;
  for (const san of pgnMovetextToSans(pgn).slice(0, limit)) {
    const move = chess.move(san);
    if (!move) {
      break;
    }
    fens.push(chess.fen());
  }

  return fens;
};
