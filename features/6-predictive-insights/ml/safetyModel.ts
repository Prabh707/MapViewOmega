/**
 * safetyModel.ts
 * ---------------------------------------------------------------------------
 * Predicts a lighting/safety score (1-10) for a stop or a proposed new
 * corridor, from the same infrastructure features already tracked on every
 * `TransitStop` (CCTV coverage, security kiosks, blue-light SOS, step-free
 * access, elevator status, tactile paving, audio announcements).
 *
 * MODEL: ridge (L2-regularized) linear regression, trained by gradient
 * descent on the app's existing stops. With only ~8 labeled stops this is a
 * small dataset — regularization keeps the fitted weights from swinging
 * wildly on so little data. Add more stops (or real survey/audit data) to
 * `MOCK_TRANSIT_STOPS` and the model improves automatically next time it is
 * trained; nothing here is hard-coded per stop.
 *
 * WHY THIS IS USEFUL BEYOND PREDICTION: because it's a *linear* model, each
 * feature's learned weight is a direct, readable answer to "how much would
 * adding this improve the safety score?" — see `suggestImprovements` below,
 * which is what actually powers the "what should I do next" suggestions in
 * the Insights panel.
 */

import type { TransitStop } from '../types/transit';
import { dot, fitStandardizer, standardize } from './mathUtils';
import type { Standardizer } from './mathUtils';

export interface SafetyFeatures {
  cctvCovered: boolean;
  securityKioskNearby: boolean;
  blueLightSOS: boolean;
  stepFree: boolean;
  hasRamp: boolean;
  elevatorOperational: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
}

export interface SafetyModel {
  weights: number[]; // [bias, ...one per feature]
  standardizer: Standardizer;
  featureNames: (keyof SafetyFeatures)[];
}

export interface ImprovementSuggestion {
  feature: keyof SafetyFeatures;
  label: string;
  estimatedGain: number; // predicted increase in safety score (0-10 scale) if this feature were added
}

const FEATURE_NAMES: (keyof SafetyFeatures)[] = [
  'cctvCovered',
  'securityKioskNearby',
  'blueLightSOS',
  'stepFree',
  'hasRamp',
  'elevatorOperational',
  'tactilePaving',
  'audioAnnouncements',
];

const FEATURE_LABELS: Record<keyof SafetyFeatures, string> = {
  cctvCovered: 'Add CCTV coverage',
  securityKioskNearby: 'Staff a security kiosk nearby',
  blueLightSOS: 'Install a Blue-Light SOS station',
  stepFree: 'Make the pathway fully step-free',
  hasRamp: 'Add a compliant ramp',
  elevatorOperational: 'Repair / commission an operational elevator',
  tactilePaving: 'Add tactile warning paving',
  audioAnnouncements: 'Add audio announcements',
};

function stopToFeatures(stop: TransitStop): SafetyFeatures {
  return {
    cctvCovered: stop.cctvCovered,
    securityKioskNearby: stop.securityKioskNearby,
    blueLightSOS: stop.blueLightSOS,
    stepFree: stop.stepFree,
    hasRamp: stop.hasRamp,
    elevatorOperational: stop.elevatorStatus === 'operational',
    tactilePaving: stop.tactilePaving,
    audioAnnouncements: stop.audioAnnouncements,
  };
}

function featuresToVector(f: SafetyFeatures): number[] {
  return FEATURE_NAMES.map(name => (f[name] ? 1 : 0));
}

/** Trains ridge linear regression by batch gradient descent on the app's known stops. */
export function trainSafetyModel(stops: TransitStop[]): SafetyModel {
  const rows = stops.map(s => featuresToVector(stopToFeatures(s)));
  const targets = stops.map(s => s.lightingScore);
  const standardizer = fitStandardizer(rows);
  const X = rows.map(r => [1, ...standardize(r, standardizer)]);
  const dims = X[0].length;
  const n = X.length;

  const weights = new Array(dims).fill(0);
  const learningRate = 0.08;
  const l2 = 0.15; // stronger regularization: dataset is small (~8 rows), guards against overfitting
  const epochs = 2000;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const grad = new Array(dims).fill(0);
    for (let i = 0; i < n; i++) {
      const pred = dot(weights, X[i]);
      const error = pred - targets[i];
      for (let j = 0; j < dims; j++) grad[j] += error * X[i][j];
    }
    for (let j = 0; j < dims; j++) {
      const reg = j === 0 ? 0 : l2 * weights[j];
      weights[j] -= learningRate * (grad[j] / n + reg);
    }
  }

  return { weights, standardizer, featureNames: FEATURE_NAMES };
}

/** Predicts a 1-10 safety/lighting score for a hypothetical or existing corridor. */
export function predictSafetyScore(model: SafetyModel, features: SafetyFeatures): number {
  const raw = featuresToVector(features);
  const x = [1, ...standardize(raw, model.standardizer)];
  const score = dot(model.weights, x);
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Ranks the features NOT currently present by how much the model expects
 * the safety score to improve if each were added on its own, holding
 * everything else constant. This turns the regression weights directly
 * into a prioritized "what to build next" list.
 */
export function suggestImprovements(model: SafetyModel, features: SafetyFeatures): ImprovementSuggestion[] {
  const baseline = predictSafetyScore(model, features);
  const suggestions: ImprovementSuggestion[] = [];

  for (const name of FEATURE_NAMES) {
    if (features[name]) continue; // already present, nothing to suggest
    const withFeature = { ...features, [name]: true };
    const gain = predictSafetyScore(model, withFeature) - baseline;
    if (gain > 0) {
      suggestions.push({
        feature: name,
        label: FEATURE_LABELS[name],
        estimatedGain: Math.round(gain * 10) / 10,
      });
    }
  }

  return suggestions.sort((a, b) => b.estimatedGain - a.estimatedGain);
}

export { stopToFeatures, FEATURE_LABELS };
