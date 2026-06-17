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
| **3** | Done | `react-chess-puzzle-kit` depends on `file:../react-chess-core`, re-export for compatibility |
| **4** | Done | Remove duplicate shim files from puzzle-kit; slim public API (no core re-exports from puzzle-kit) |
| **5** | In progress | `react-chess-explorer` scaffold (core only); requirements → `docs/REQUIREMENTS.md` |

---

## Install (consumers)

```bash
npm install react-chess-core
```

**Peer dependencies:** `react`, `react-chessboard`, `chess.js`

For Stockfish in the browser:

```bash
npm install stockfish
npm run copy:stockfish   # in your app, or copy WASM to public/stockfish/
```

---

## Exports

- **Chessboard:** `ThemeProvider`, `useChessboardTheme`, `HighlightChessboard`, `boardSquareHighlightColors`
- **Engine:** `useAnalysisEngine`, `StockfishBrowserEngine`, `EngineEvaluationPanel`, `isAnalyzableFen`, types/helpers
