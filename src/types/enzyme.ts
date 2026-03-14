/** Kinetic model type */
export type ModelType = 'mm' | 'substrate_inhibition';

/** One enzyme–substrate pair in the local database */
export interface EnzymeSubstrateEntry {
  id: string;
  enzymeName: string;
  substrateName: string;
  modelType: ModelType;
  Km: number;   // mM
  Vmax: number;  // µmol/min
  Ki?: number;   // mM  (required when modelType === 'substrate_inhibition')
  /** Flexible optional metadata (EC number, organism, pH, etc.) */
  metadata?: Record<string, string>;
}

/** A single experimental measurement */
export interface Measurement {
  index: number;
  substrate: number;   // [S] in mM
  rate: number;        // measured v in µmol/min
  replicate: number;   // replicate # at this [S]
  warning?: string;    // detection-limit warning text
}

/** Grouped data for one concentration level (used in fitting) */
export interface GroupedPoint {
  substrate: number;
  meanRate: number;
  stdDev: number;
  n: number;
}

/** Result of a nonlinear regression fit */
export interface FitResult {
  Km: number;
  Vmax: number;
  Ki?: number;
  residuals: { substrate: number; observed: number; predicted: number; residual: number }[];
  warnings: string[];
  success: boolean;
}

/** Full session state */
export interface SessionState {
  sessionId: string;
  entry: EnzymeSubstrateEntry | null;
  measurements: Measurement[];
  fitResult: FitResult | null;
}
