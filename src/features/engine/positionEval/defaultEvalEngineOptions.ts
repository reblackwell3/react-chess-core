import type { AnalysisEngineOptions } from '../types';
import { DEFAULT_STOCKFISH_SCRIPT_URL } from '../types';

/** Default Stockfish options for inline eval bars (shares play-time engine via PlayTimeEngineProvider). */
export const defaultInlineEvalEngineOptions = {
  scriptUrl: DEFAULT_STOCKFISH_SCRIPT_URL,
  depth: 10,
  multiPv: 6,
  priority: 0,
} as const satisfies AnalysisEngineOptions;
