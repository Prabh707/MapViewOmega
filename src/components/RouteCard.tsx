import React from 'react';
import { RouteCandidate, UserPreferences } from '../types/transit';

interface RouteCardProps {
  route: RouteCandidate;
  isSelected: boolean;
  preferences: UserPreferences;
  onSelectRoute: (route: RouteCandidate) => void;
  onOpenDetails: (route: RouteCandidate) => void;
  onStartJourney?: (route: RouteCandidate) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  preferences,
  onSelectRoute,
  onOpenDetails,
  onStartJourney
}) => {
  const isBest = route.isRecommended;

  return (
    <div
      onClick={() => onSelectRoute(route)}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-5 ${
        isSelected
          ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-950/40'
          : isBest
          ? 'bg-slate-900/90 border-emerald-500/80 hover:border-emerald-400 shadow-lg shadow-emerald-950/30'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      {/* Top Badges & Overall Score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {isBest && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 flex items-center space-x-1">
              <span>⭐</span>
              <span>TOP RECOMMENDED</span>
            </span>
          )}
          {route.badges.slice(isBest ? 1 : 0, 3).map((badge, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                badge.includes('Step-Free') || badge.includes('Safe')
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : badge.includes('Stairs') || badge.includes('Broken')
                  ? 'bg-red-950/80 text-red-300 border-red-800/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Overall Match Score Pill */}
        <div className="flex flex-col items-end">
          <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center space-x-1 ${
            route.scores.overallScore >= 90
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : route.scores.overallScore >= 75
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            <span>{route.scores.overallScore}</span>
            <span className="text-[10px] opacity-80">/100 Match</span>
          </div>
        </div>
      </div>

      {/* Route Title & Subtitle */}
      <div className="mb-3">
        <h4 className="text-base font-bold text-white flex items-center space-x-2">
          <span>{route.title}</span>
        </h4>
        <p className="text-xs text-slate-400">{route.subtitle}</p>
      </div>

      {/* Key Metric Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
          <span className="text-sm font-black text-white">{route.totalDurationMin} min</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Walking</span>
          <span className={`text-sm font-black ${route.totalWalkDistanceMeters > preferences.maxWalkDistanceMeters ? 'text-amber-400' : 'text-emerald-400'}`}>
            {route.totalWalkDistanceMeters}m
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Step-Free</span>
          <span className={`text-sm font-black ${route.stepFree ? 'text-emerald-400' : 'text-red-400'}`}>
            {route.stepFree ? '100% Yes' : 'No (Stairs)'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety</span>
          <span className="text-sm font-black text-blue-400">{route.scores.safetyScore}/100</span>
        </div>
      </div>

      {/* Transparent Why-Selected / Recommendation Explanation */}
      <div className={`p-3.5 rounded-xl border mb-3 text-xs ${
        isBest
          ? 'bg-emerald-950/40 border-emerald-800/50'
          : route.explanation.barrierWarnings.length > 0
          ? 'bg-slate-950 border-slate-800'
          : 'bg-slate-950/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <span>🧠</span>
            <span>Why this route for {preferences.profileId.toUpperCase()}:</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Algorithmic Insight</span>
        </div>

        {/* Why recommended bullet points */}
        {route.explanation.whyRecommended.length > 0 && (
          <ul className="space-y-1 text-slate-300 mb-2">
            {route.explanation.whyRecommended.map((bullet, idx) => (
              <li key={idx} className="flex items-start space-x-1.5 text-[11px] leading-tight">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tradeoffs */}
        {route.explanation.tradeOffs.length > 0 && (
          <p className="text-[11px] text-slate-400 italic mb-2">
            <strong>Tradeoff:</strong> {route.explanation.tradeOffs[0]}
          </p>
        )}

        {/* Barrier Warnings */}
        {route.explanation.barrierWarnings.length > 0 && (
          <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 space-y-1">
            {route.explanation.barrierWarnings.map((warn, idx) => (
              <div key={idx} className="text-[11px] font-semibold flex items-start space-x-1">
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoute(route);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isSelected
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isSelected ? '✓ On Map' : '🗺️ Map'}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(route);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition flex items-center space-x-1"
          >
            <span>Details</span>
            <span>➔</span>
          </button>
        </div>

        {onStartJourney && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartJourney(route);
            }}
            className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
          >
            <span>▶</span>
            <span>Start Journey</span>
          </button>
        )}
      </div>

    </div>
  );
};

