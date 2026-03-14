import type { EnzymeSubstrateEntry } from '../types/enzyme';
import { theoreticalRate, isNearDetectionLimit } from './kinetics';

/**
 * Box-Muller transform: generate a standard normal random variable.
 */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Simulate one noisy measurement at a given substrate concentration.
 *
 * Noise model:
 *  - Heteroscedastic: σ = baseFraction × v_true
 *  - Near detection limit: σ is boosted (higher relative uncertainty)
 *  - Rare mild outliers (~1 in 30): additive perturbation of 2–4 σ
 *  - Output clamped to ≥ 0
 */
export function simulateMeasurement(
  entry: EnzymeSubstrateEntry,
  substrate: number
): { rate: number; warning?: string } {
  const vTrue = theoreticalRate(entry, substrate);

  // --- heteroscedastic noise ---
  const baseFraction = 0.05; // 5 % CV at normal signal levels
  let sigma = baseFraction * Math.max(vTrue, 0.001 * entry.Vmax);

  // Near detection limit → inflate noise (higher relative uncertainty)
  if (isNearDetectionLimit(entry, substrate)) {
    sigma = Math.max(sigma, 0.03 * entry.Vmax);
  }

  // --- Gaussian perturbation ---
  let noise = randn() * sigma;

  // --- Rare mild outliers (~1 in 30) ---
  if (Math.random() < 1 / 30) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const magnitude = 2 + Math.random() * 2; // 2–4 σ additional shift
    noise += direction * magnitude * sigma;
  }

  // Clamp to ≥ 0
  const measured = Math.max(0, vTrue + noise);

  // Warning text
  let warning: string | undefined;
  if (isNearDetectionLimit(entry, substrate)) {
    warning =
      'Substrate concentration very low: reaction likely near detection limit; measured rate may be unreliable.';
  }

  return { rate: measured, warning };
}
