import type { EnzymeSubstrateEntry } from '../types/enzyme';

/**
 * Compute the theoretical initial rate for a given enzyme–substrate pair
 * at a specified substrate concentration.
 */
export function theoreticalRate(entry: EnzymeSubstrateEntry, substrate: number): number {
  if (substrate <= 0) return 0;

  if (entry.modelType === 'substrate_inhibition' && entry.Ki != null) {
    // v = Vmax·[S] / (Km + [S] + [S]²/Ki)
    return (entry.Vmax * substrate) / (entry.Km + substrate + (substrate * substrate) / entry.Ki);
  }

  // Plain Michaelis–Menten: v = Vmax·[S] / (Km + [S])
  return (entry.Vmax * substrate) / (entry.Km + substrate);
}

/**
 * Returns true if the signal at this [S] is near the detection limit.
 * Threshold: theoretical rate < 2 % of Vmax.
 */
export function isNearDetectionLimit(entry: EnzymeSubstrateEntry, substrate: number): boolean {
  const v = theoreticalRate(entry, substrate);
  return v < 0.02 * entry.Vmax;
}
