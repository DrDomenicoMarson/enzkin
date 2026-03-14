import { levenbergMarquardt } from 'ml-levenberg-marquardt';
import type { Measurement, GroupedPoint, FitResult, ModelType } from '../types/enzyme';

/**
 * Group measurements by substrate concentration.
 * Computes mean, std dev, and count for each concentration.
 */
export function groupMeasurements(measurements: Measurement[]): GroupedPoint[] {
  const map = new Map<number, number[]>();
  for (const m of measurements) {
    const key = m.substrate;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m.rate);
  }

  const groups: GroupedPoint[] = [];
  for (const [substrate, rates] of map) {
    const n = rates.length;
    const mean = rates.reduce((a, b) => a + b, 0) / n;
    let stdDev = 0;
    if (n > 1) {
      const variance = rates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (n - 1);
      stdDev = Math.sqrt(variance);
    }
    groups.push({ substrate, meanRate: mean, stdDev, n });
  }

  return groups.sort((a, b) => a.substrate - b.substrate);
}

/**
 * Perform weighted nonlinear least-squares fitting.
 */
export function fitKinetics(
  measurements: Measurement[],
  modelType: ModelType
): FitResult {
  const warnings: string[] = [];
  const groups = groupMeasurements(measurements);

  // Filter to groups with n >= 2 for weighted fit
  const usable = groups.filter(g => g.n >= 2);


  if (usable.length < 2) {
    return {
      Km: 0, Vmax: 0,
      residuals: [],
      warnings: ['Not enough replicated concentrations for fitting. Need at least 2 concentrations with ≥ 2 replicates each.'],
      success: false,
    };
  }

  const nSingletons = groups.length - usable.length;
  if (nSingletons > 0) {
    warnings.push(
      `${nSingletons} concentration(s) with only 1 replicate excluded from weighted fit.`
    );
  }

  // Warn if very few replicated concentrations
  if (usable.length < 4) {
    warnings.push(
      'Few replicated concentrations available. Consider collecting more data for a stable fit.'
    );
  }

  // Build data arrays
  const xData = usable.map(g => g.substrate);
  const yData = usable.map(g => g.meanRate);

  // Weights = 1/σ² with a floor to prevent infinite weights
  const maxMean = Math.max(...yData);
  const varianceFloor = (0.01 * maxMean) ** 2; // floor: 1 % of max mean rate
  const weights = usable.map(g => {
    const variance = Math.max(g.stdDev ** 2, varianceFloor);
    return 1 / variance;
  });

  // Initial guesses
  const vmaxGuess = Math.max(...yData) * 1.1;
  const halfMax = vmaxGuess / 2;
  let kmGuess = xData[0];
  for (const g of usable) {
    if (g.meanRate >= halfMax) { kmGuess = g.substrate; break; }
  }
  kmGuess = Math.max(kmGuess, 0.01);

  try {
    if (modelType === 'substrate_inhibition') {
      // v = Vmax·[S] / (Km + [S] + [S]²/Ki)
      const kiGuess = xData[xData.length - 1] * 2;

      const result = levenbergMarquardt(
        { x: xData, y: yData },
        ([Vmax, Km, Ki]: number[]) => (x: number) =>
          (Vmax * x) / (Km + x + (x * x) / Ki),
        {
          initialValues: [vmaxGuess, kmGuess, kiGuess],
          minValues: [1e-9, 1e-9, 1e-9],
          weights,
          maxIterations: 200,
          errorTolerance: 1e-8,
        }
      );

      const [Vmax, Km, Ki] = result.parameterValues;

      // Compute residuals on ALL grouped data (including singletons for display)
      const allGroups = groupMeasurements(measurements);
      const residuals = allGroups.map(g => {
        const predicted = (Vmax * g.substrate) / (Km + g.substrate + (g.substrate * g.substrate) / Ki);
        return {
          substrate: g.substrate,
          observed: g.meanRate,
          predicted,
          residual: g.meanRate - predicted,
        };
      });

      return { Km, Vmax, Ki, residuals, warnings, success: true };
    } else {
      // Plain Michaelis-Menten: v = Vmax·[S] / (Km + [S])
      const result = levenbergMarquardt(
        { x: xData, y: yData },
        ([Vmax, Km]: number[]) => (x: number) =>
          (Vmax * x) / (Km + x),
        {
          initialValues: [vmaxGuess, kmGuess],
          minValues: [1e-9, 1e-9],
          weights,
          maxIterations: 200,
          errorTolerance: 1e-8,
        }
      );

      const [Vmax, Km] = result.parameterValues;

      const allGroups = groupMeasurements(measurements);
      const residuals = allGroups.map(g => {
        const predicted = (Vmax * g.substrate) / (Km + g.substrate);
        return {
          substrate: g.substrate,
          observed: g.meanRate,
          predicted,
          residual: g.meanRate - predicted,
        };
      });

      return { Km, Vmax, residuals, warnings, success: true };
    }
  } catch {
    return {
      Km: 0, Vmax: 0,
      residuals: [],
      warnings: [
        ...warnings,
        'Fit unstable or physically implausible. Collect more data or improve concentration coverage.',
      ],
      success: false,
    };
  }
}
