# react-chess-core

```bash
npm install
npm run build
```

Shared **chessboard** (theme + `HighlightChessboard`) and **browser Stockfish** utilities. Used by `react-chess-puzzle-kit` and (planned) `react-chess-explorer`.

Used in production at [endchess.com](https://endchess.com).

Storybook: `npm run storybook` → http://localhost:6007

---

## Migration phases (Option B)

| Phase | Status | Work |
|-------|--------|------|
| **1** | Done | Scaffold package, Rollup, Storybook |
| **2** | Done | Board + engine source live in this repo |
| **3** | Done | `react-chess-puzzle-kit` depends on `file:../react-chess-core-2`, re-export for compatibility |
| **4** | Done | Remove duplicate shim files from puzzle-kit; slim public API (no core re-exports from puzzle-kit) |
| **5** | In progress | `react-chess-explorer` scaffold (core only); requirements → `docs/REQUIREMENTS.md` |

---

## Install (consumers)

```bash
npm install react-chess-core
```

**Peer dependencies:** `react`, `react-chessboard`, `chess.js`, `@mui/material` (for eval bar components)

For Stockfish in the browser:

```bash
npm install stockfish
npm run copy:stockfish   # copies WASM/JS to public/stockfish/ in this package
```

Host apps can call the same script via `node node_modules/react-chess-core/scripts/copy-stockfish.mjs` or keep a thin postinstall wrapper.

---

## Exports

- **Chessboard:** `ThemeProvider`, `useChessboardTheme`, `HighlightChessboard`, `boardSquareHighlightColors`
- **Opening:** `pgnMovetextToSans`, `fenFromOpeningPgn`, `fenLineFromOpeningPgn`, `fenLineFromOpeningSans`, `fenLineFromUciMoves`
- **Engine:** `useAnalysisEngine`, `StockfishBrowserEngine`, `BoardPositionEval`, `PositionEvalBar`, `isAnalyzableFen`, types/helpers
