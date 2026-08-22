/**
 * crowdModel.ts
 * ---------------------------------------------------------------------------
 * Predicts how crowded a transit line is likely to be at a given hour of day
 * and day type (weekday vs. weekend), using multinomial logistic regression
 * (a "softmax classifier") over three classes: low / moderate / high.
 *
 * WHY SYNTHETIC TRAINING DATA
 * The app currently has no historical ridership log — each line only carries
 * a single static `crowdLevel` snapshot. To train a real model anyway, this
 * file generates a synthetic-but-realistic training set: it takes each
 * line's known baseline crowd level and its service frequency, then shapes
 * a 24-hour ridership curve around it (two commuter peaks on weekdays, a
 * flatter midday bump on weekends). The model is genuinely trained by
 * gradient descent on that data — nothing is hard-coded per line.
 *
 * SWAPPING IN REAL DATA LATER
 * Once real ridership timestamps exist (e.g. from `CommunityReport`
 * `crowdLevelReported` entries or fleet telemetry), replace
 * `buildSyntheticTrainingSet` with a function that maps that history into
 * the same `CrowdSample[]` shape and everything downstream keeps working.
 */

import type { TransitLine } from '../types/transit';
import { dot, fitStandardizer, softmax, standardize } from './mathUtils';
import type { Standardizer } from './mathUtils';

export type CrowdLabel = 'low' | 'moderate' | 'high';
const CLASSES: CrowdLabel[] = ['low', 'moderate', 'high'];

interface CrowdSample {
  features: number[]; // see featurize()
  label: CrowdLabel;
}

export interface CrowdModel {
  weights: number[][]; // one weight vector per class
  standardizer: Standardizer;
  featureNames: string[];
}

export interface CrowdPrediction {
  label: CrowdLabel;
  probabilities: Record<CrowdLabel, number>;
  confidencePct: number;
}

const FEATURE_NAMES = [
  'hourSin',
  'hourCos',
  'isWeekend',
  'frequencyMin',
  'baselineCrowdScore', // 0 = low, 0.5 = moderate, 1 = high (the line's known snapshot)
];

function crowdLevelToScore(level: CrowdLabel): number {
  return level === 'low' ? 0 : level === 'moderate' ? 0.5 : 1;
}

/** Encodes (line, hour, isWeekend) into the numeric feature vector the model consumes. */
function featurize(line: TransitLine, hour: number, isWeekend: boolean): number[] {
  const angle = (hour / 24) * 2 * Math.PI;
  return [
    Math.sin(angle),
    Math.cos(angle),
    isWeekend ? 1 : 0,
    line.frequencyMin,
    crowdLevelToScore(line.crowdLevel),
  ];
}

/** Deterministic pseudo-random generator so training data (and thus the model) is reproducible. */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function ridershipCurve(hour: number, isWeekend: boolean): number {
  // Weekday: morning peak ~8am, evening peak ~17:30. Weekend: single soft midday peak.
  const morningPeak = Math.exp(-((hour - 8) ** 2) / (2 * 1.3 ** 2));
  const eveningPeak = Math.exp(-((hour - 17.5) ** 2) / (2 * 1.6 ** 2));
  const weekendPeak = Math.exp(-((hour - 13) ** 2) / (2 * 3 ** 2));
  const base = 0.08;
  return isWeekend ? base + 0.55 * weekendPeak : base + 0.85 * morningPeak + 0.75 * eveningPeak;
}

function buildSyntheticTrainingSet(lines: TransitLine[]): CrowdSample[] {
  const rand = seededRandom(42);
  const samples: CrowdSample[] = [];

  for (const line of lines) {
    const baseline = crowdLevelToScore(line.crowdLevel);
    // Frequent service (small frequencyMin) spreads passengers over more vehicles -> less crowding.
    const frequencyRelief = Math.max(0, (10 - line.frequencyMin) / 10) * 0.25;

    for (const isWeekend of [false, true]) {
      for (let hour = 0; hour < 24; hour++) {
        // A few noisy samples per hour so the model sees natural variance, not one point per hour.
        for (let rep = 0; rep < 6; rep++) {
          const curve = ridershipCurve(hour, isWeekend);
          const noise = (rand() - 0.5) * 0.15;
          let intensity = 0.35 * baseline + 0.65 * curve - frequencyRelief + noise;
          intensity = Math.min(1, Math.max(0, intensity));

          const label: CrowdLabel = intensity < 0.33 ? 'low' : intensity < 0.66 ? 'moderate' : 'high';
          samples.push({ features: featurize(line, hour, isWeekend), label });
        }
      }
    }
  }
  return samples;
}

/** Trains the softmax classifier with plain batch gradient descent + L2 regularization. */
export function trainCrowdModel(lines: TransitLine[]): CrowdModel {
  const dataset = buildSyntheticTrainingSet(lines);
  const standardizer = fitStandardizer(dataset.map(d => d.features));
  const X = dataset.map(d => [1, ...standardize(d.features, standardizer)]); // bias term prepended
  const dims = X[0].length;

  const weights: number[][] = CLASSES.map(() => new Array(dims).fill(0));
  const learningRate = 0.35;
  const l2 = 0.001;
  const epochs = 300;
  const n = X.length;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const grads: number[][] = CLASSES.map(() => new Array(dims).fill(0));

    for (let i = 0; i < n; i++) {
      const scores = weights.map(w => dot(w, X[i]));
      const probs = softmax(scores);
      const trueIdx = CLASSES.indexOf(dataset[i].label);

      for (let c = 0; c < CLASSES.length; c++) {
        const error = probs[c] - (c === trueIdx ? 1 : 0);
        for (let j = 0; j < dims; j++) {
          grads[c][j] += error * X[i][j];
        }
      }
    }

    for (let c = 0; c < CLASSES.length; c++) {
      for (let j = 0; j < dims; j++) {
        const reg = j === 0 ? 0 : l2 * weights[c][j]; // don't regularize the bias term
        weights[c][j] -= learningRate * (grads[c][j] / n + reg);
      }
    }
  }

  return { weights, standardizer, featureNames: FEATURE_NAMES };
}

/** Predicts crowd level for a line at a given hour (0-23) and day type. */
export function predictCrowd(
  model: CrowdModel,
  line: TransitLine,
  hour: number,
  isWeekend: boolean
): CrowdPrediction {
  const raw = featurize(line, hour, isWeekend);
  const x = [1, ...standardize(raw, model.standardizer)];
  const scores = model.weights.map(w => dot(w, x));
  const probs = softmax(scores);

  const probabilities = {
    low: probs[0],
    moderate: probs[1],
    high: probs[2],
  } as Record<CrowdLabel, number>;

  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

  return {
    label: CLASSES[bestIdx],
    probabilities,
    confidencePct: Math.round(probs[bestIdx] * 100),
  };
}

/** Convenience: predicted crowd level across all 24 hours for one line/day-type, for charting. */
export function predictCrowdCurve(
  model: CrowdModel,
  line: TransitLine,
  isWeekend: boolean
): CrowdPrediction[] {
  return Array.from({ length: 24 }, (_, hour) => predictCrowd(model, line, hour, isWeekend));
}
