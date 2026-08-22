import React from 'react';
import { RouteCandidate, RouteSegment } from '../types/transit';

interface RouteDetailModalProps {
  route: RouteCandidate | null;
  onClose: () => void;
  onStartJourney?: (route: RouteCandidate) => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ route, onClose, onStartJourney }) => {
  if (!route) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="itineraryModalTitle"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Detailed Itinerary
              </span>
              <span className="text-xs text-slate-400 font-medium">{route.totalDurationMin} min total</span>
            </div>
            <h2 id="itineraryModalTitle" className="text-lg font-bold text-white mt-1">
              {route.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close itinerary modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Timeline */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
            <div>
              <span className="text-slate-400 block">Total Walking</span>
              <span className="text-sm font-bold text-emerald-400">
                {route.totalWalkDistanceMeters} meters
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Step-Free Status</span>
              <span className={`text-sm font-bold ${route.stepFree ? 'text-emerald-400' : 'text-red-400'}`}>
                {route.stepFree ? '✓ 100% Step-Free' : '⚠️ Has Stairs'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Corridor Lighting</span>
              <span className="text-sm font-bold text-blue-400">💡 {route.lightingAverage}/10 Average</span>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {route.segments.map((segment: RouteSegment, index: number) => {
              const isWalk = segment.type === 'walk';

              return (
                <div key={index} className="relative">
                  {/* Step Icon Badge on Timeline */}
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isWalk
                        ? 'bg-slate-800 text-slate-300 border-slate-600'
                        : 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                    }`}
                  >
                    {isWalk ? '🚶' : '🚌'}
                  </div>

                  {/* Step Card Content */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 ml-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Step {index + 1}:{' '}
                        {isWalk
                          ? `Walk (${segment.distanceMeters}m)`
                          : `Transit (${segment.line?.shortName})`}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        ~{segment.durationMin} min
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-1.5">
                      {segment.fromName} ➔ {segment.toName}
                    </h4>

                    <p className="text-xs text-slate-300 mb-3">{segment.instructions}</p>

                    {/* Accessibility & Safety Guidelines on this segment */}
                    {segment.accessibilityNotes && segment.accessibilityNotes.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Accessibility Guidance
                        </span>
                        {segment.accessibilityNotes.map((note, noteIdx) => (
                          <div
                            key={noteIdx}
                            className={`p-1.5 rounded flex items-start space-x-1.5 ${
                              note.includes('⚠️') || note.includes('🚨')
                                ? 'bg-red-950/60 text-red-300 border border-red-900/60 font-semibold'
                                : 'bg-slate-900 text-slate-300'
                            }`}
                          >
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close Itinerary
          </button>

          {onStartJourney && (
            <button
              onClick={() => {
                onClose();
                onStartJourney(route);
              }}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>▶ Start Guided Journey</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
