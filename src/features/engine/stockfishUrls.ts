/** Resolve a public asset path against the current page (honors CRA `PUBLIC_URL`). */
export const resolveStockfishScriptUrl = (
  scriptUrl: string,
  baseHref: string = typeof window !== 'undefined' ? window.location.href : '',
): string => new URL(scriptUrl, baseHref).href;

export const resolveStockfishWasmUrl = (scriptUrl: string, baseHref?: string): string =>
  resolveStockfishScriptUrl(scriptUrl, baseHref).replace(/\.js(\?.*)?$/i, '.wasm$1');

/**
 * Worker URL for stockfish.js (see examples/loadEngine.js in the stockfish package).
 * Stockfish derives the sibling `.wasm` URL from the worker script pathname.
 */
export const resolveStockfishWorkerUrl = (
  scriptUrl: string,
  baseHref?: string,
): string => resolveStockfishScriptUrl(scriptUrl, baseHref);
