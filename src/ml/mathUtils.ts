/**
 * mathUtils.ts
 * ---------------------------------------------------------------------------
 * Minimal, dependency-free numeric helpers used to train and run the two
 * predictive models in this folder (see crowdModel.ts and safetyModel.ts).
 *
 * There is no ML library here on purpose: the models are small (a handful of
 * features, a handful of training rows) so plain gradient descent in
 * TypeScript is both fast enough and easy to read/audit line by line.
 */

/** Dot product of two equal-length vectors. */
export function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Numerically stable logistic sigmoid. */
export function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

/** Softmax over a raw score vector (turns class scores into probabilities). */
export function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map(s => Math.exp(s - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / total);
}

export interface Standardizer {
  means: number[];
  stds: number[];
}

/** Fits per-feature mean/std so every feature contributes on a similar scale. */
export function fitStandardizer(rows: number[][]): Standardizer {
  const n = rows.length;
  const dims = rows[0]?.length ?? 0;
  const means = new Array(dims).fill(0);
  const stds = new Array(dims).fill(1);

  for (let j = 0; j < dims; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += rows[i][j];
    means[j] = sum / n;
  }
  for (let j = 0; j < dims; j++) {
    let sq = 0;
    for (let i = 0; i < n; i++) sq += (rows[i][j] - means[j]) ** 2;
    const std = Math.sqrt(sq / n);
    stds[j] = std < 1e-8 ? 1 : std; // avoid divide-by-zero for constant features
  }
  return { means, stds };
}

export function standardize(row: number[], s: Standardizer): number[] {
  return row.map((v, j) => (v - s.means[j]) / s.stds[j]);
}
