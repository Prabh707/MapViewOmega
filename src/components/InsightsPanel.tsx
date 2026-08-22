import React, { useMemo, useState } from 'react';
import type { TransitStop, TransitLine } from '../types/transit';
import {
  trainCrowdModel,
  predictCrowdCurve,
  type CrowdLabel,
  trainSafetyModel,
  predictSafetyScore,
  suggestImprovements,
  type SafetyFeatures,
} from '../ml';

interface InsightsPanelProps {
  stops: TransitStop[];
  lines: TransitLine[];
}

const CROWD_COLOR: Record<CrowdLabel, string> = {
  low: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  high: 'bg-red-500',
};

const CROWD_TEXT: Record<CrowdLabel, string> = {
  low: 'text-emerald-400',
  moderate: 'text-amber-400',
  high: 'text-red-400',
};

const DEFAULT_FEATURES: SafetyFeatures = {
  cctvCovered: false,
  securityKioskNearby: false,
  blueLightSOS: false,
  stepFree: false,
  hasRamp: false,
  elevatorOperational: false,
  tactilePaving: false,
  audioAnnouncements: false,
};

const FEATURE_TOGGLES: { key: keyof SafetyFeatures; label: string; icon: string }[] = [
  { key: 'cctvCovered', label: 'CCTV Coverage', icon: '📷' },
  { key: 'securityKioskNearby', label: 'Security Kiosk Nearby', icon: '🛡️' },
  { key: 'blueLightSOS', label: 'Blue-Light SOS Station', icon: '🆘' },
  { key: 'stepFree', label: 'Step-Free Pathway', icon: '♿' },
  { key: 'hasRamp', label: 'Compliant Ramp', icon: '🛤️' },
  { key: 'elevatorOperational', label: 'Operational Elevator', icon: '🛗' },
  { key: 'tactilePaving', label: 'Tactile Warning Paving', icon: '🔲' },
  { key: 'audioAnnouncements', label: 'Audio Announcements', icon: '🔊' },
];

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ stops, lines }) => {
  // Models are trained once per mount (or whenever the underlying data changes) — see ml/crowdModel.ts
  // and ml/safetyModel.ts for what "trained" means here (real gradient descent, not lookup tables).
  const crowdModel = useMemo(() => trainCrowdModel(lines), [lines]);
  const safetyModel = useMemo(() => trainSafetyModel(stops), [stops]);

  const [selectedLineId, setSelectedLineId] = useState<string>(lines[0]?.id ?? '');
  const [isWeekend, setIsWeekend] = useState(false);

  const [corridorFeatures, setCorridorFeatures] = useState<SafetyFeatures>(DEFAULT_FEATURES);

  const selectedLine = lines.find(l => l.id === selectedLineId) ?? lines[0];
  const crowdCurve = useMemo(
    () => (selectedLine ? predictCrowdCurve(crowdModel, selectedLine, isWeekend) : []),
    [crowdModel, selectedLine, isWeekend]
  );

  const predictedScore = useMemo(
    () => predictSafetyScore(safetyModel, corridorFeatures),
    [safetyModel, corridorFeatures]
  );
  const suggestions = useMemo(
    () => suggestImprovements(safetyModel, corridorFeatures),
    [safetyModel, corridorFeatures]
  );

  const toggleFeature = (key: keyof SafetyFeatures) => {
    setCorridorFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>🔮</span> Predictive Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Two lightweight machine-learning models — trained live in your browser on this app's own transit
          data — forecast crowding and estimate corridor safety.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Crowd-level forecast                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👥</span> Crowd-Level Forecast
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multinomial logistic regression over hour-of-day, day type, service frequency, and each line's
              known baseline crowd level.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedLineId}
              onChange={e => setSelectedLineId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-200"
            >
              {lines.map(line => (
                <option key={line.id} value={line.id}>
                  {line.icon} {line.shortName}
                </option>
              ))}
            </select>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs">
              <button
                onClick={() => setIsWeekend(false)}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  !isWeekend ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekday
              </button>
              <button
                onClick={() => setIsWeekend(true)}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  isWeekend ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekend
              </button>
            </div>
          </div>
        </div>

        {selectedLine && (
          <>
            <div className="flex items-end gap-1 h-32">
              {crowdCurve.map((pred, hour) => (
                <div
                  key={hour}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-7 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10">
                    {hour}:00 · {pred.label} ({pred.confidencePct}%)
                  </div>
                  <div
                    className={`w-full rounded-t ${CROWD_COLOR[pred.label]} transition-all`}
                    style={{ height: `${Math.max(6, pred.probabilities[pred.label] * 100)}%`, opacity: 0.85 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>11pm</span>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              {(['low', 'moderate', 'high'] as CrowdLabel[]).map(label => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${CROWD_COLOR[label]}`} />
                  <span className={`font-semibold capitalize ${CROWD_TEXT[label]}`}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Safety / lighting score estimator for a proposed corridor        */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💡</span> Safety Score Estimator for a New Corridor
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Ridge linear regression trained on this app's existing stops. Toggle the features a proposed stop or
          corridor would have, and the model estimates its safety/lighting score (1–10) plus what would raise
          it the most.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FEATURE_TOGGLES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleFeature(key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center transition ${
                  corridorFeatures[key]
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-[11px] font-semibold leading-tight">{label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Predicted Safety Score
              </div>
              <div
                className={`text-4xl font-black mt-1 ${
                  predictedScore >= 8.5
                    ? 'text-emerald-400'
                    : predictedScore >= 6.5
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {predictedScore.toFixed(1)}
                <span className="text-lg text-slate-500">/10</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 flex-1">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
                Suggested Next Steps
              </div>
              {suggestions.length === 0 ? (
                <p className="text-xs text-emerald-400">
                  All modeled safety features are already present for this corridor.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {suggestions.slice(0, 4).map(s => (
                    <li key={s.feature} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{s.label}</span>
                      <span className="font-bold text-emerald-400">+{s.estimatedGain.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
