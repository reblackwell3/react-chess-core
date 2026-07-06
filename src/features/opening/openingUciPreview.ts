import { Chess } from 'chess.js';

const applyUci = (chess: Chess, uci: string): boolean => {
  if (!uci || uci.length < 4) {
    return false;
  }

  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;

  try {
    return chess.move({ from, to, promotion }) !== null;
  } catch {
    return false;
  }
};

export const parsePreviewMovesUci = (movesUci?: string): string[] =>
  movesUci?.trim().split(/\s+/).filter(Boolean) ?? [];

/** FEN after each ply (index 0 = start) for up to `maxPlies` half-moves. */
export const fenLineFromUciMoves = (
  startFen: string | undefined,
  movesUci: string[] | string | undefined,
  maxPlies?: number,
): string[] => {
  if (!startFen?.trim()) {
    return [];
  }

  const chess = new Chess(startFen);
  const fens = [chess.fen()];
  const moves = Array.isArray(movesUci)
    ? movesUci
    : parsePreviewMovesUci(movesUci);
  const limit = maxPlies ?? moves.length;

  for (const uci of moves.slice(0, limit)) {
    if (!applyUci(chess, uci)) {
      break;
    }
    fens.push(chess.fen());
  }

  return fens;
};
