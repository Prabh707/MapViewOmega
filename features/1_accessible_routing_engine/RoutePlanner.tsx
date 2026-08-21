import React from 'react';
import { TransitStop, RouteCandidate, UserPreferences, QuickPreset } from '../types/transit';
import { RouteCard } from './RouteCard';
import { MapView } from './MapView';

interface RoutePlannerProps {
  stops: TransitStop[];
  presets: QuickPreset[];
  originId: string;
  destId: string;
  onChangeOrigin: (id: string) => void;
  onChangeDest: (id: string) => void;
  onSwapLocations: () => void;
  onCalculateRoutes: () => void;
  onSelectPreset: (preset: QuickPreset) => void;
  routes: RouteCandidate[];
  selectedRoute: RouteCandidate | null;
  onSelectRoute: (route: RouteCandidate) => void;
  onOpenDetails: (route: RouteCandidate) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenPreferencesModal: () => void;
  onOpenReportModal?: () => void;
  onReportStop?: (stopId: string) => void;
  onStartJourney?: (route: RouteCandidate) => void;
}


export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  stops,
  presets,
  originId,
  destId,
  onChangeOrigin,
  onChangeDest,
  onSwapLocations,
  onCalculateRoutes,
  onSelectPreset,
  routes,
  selectedRoute,
  onSelectRoute,
  onOpenDetails,
  preferences,
  onUpdatePreferences,
  onOpenPreferencesModal,
  onOpenReportModal,
  onReportStop,
  onStartJourney
}) => {


  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      
      {/* 1. Trip Search Card & Preferences Quick Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Active Profile & Quick Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Needs:</span>
            <button
              onClick={onOpenPreferencesModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900 transition"
              title="Click to customize profile"
            >
              <span>♿</span>
              <span className="capitalize">{preferences.profileId.replace('_', ' ')} Profile</span>
              <span className="text-[10px] opacity-70">✏️</span>
            </button>
          </div>

          {/* Quick toggle chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => onUpdatePreferences({ stepFreeOnly: !preferences.stepFreeOnly })}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                preferences.stepFreeOnly
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🦼 Step-Free: {preferences.stepFreeOnly ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => onUpdatePreferences({ avoidStairs: !preferences.avoidStairs })}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                preferences.avoidStairs
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🪜 Avoid Stairs: {preferences.avoidStairs ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => onUpdatePreferences({ preferSaferRoute: !preferences.preferSaferRoute })}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                preferences.preferSaferRoute
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🛡️ Safer Route: {preferences.preferSaferRoute ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => onUpdatePreferences({ avoidCrowded: !preferences.avoidCrowded })}
              className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                preferences.avoidCrowded
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              👥 Avoid Crowds: {preferences.avoidCrowded ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onOpenPreferencesModal}
              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            >
              ⚙️ More Filters...
            </button>
          </div>
        </div>

        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          {/* Origin Dropdown */}
          <div className="md:col-span-5">
            <label htmlFor="originSelectInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
              <span className="text-emerald-400">📍</span>
              <span>Starting Stop / Origin</span>
            </label>
            <select
              id="originSelectInput"
              value={originId}
              onChange={(e) => onChangeOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">Select origin location...</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="button"
              id="swapLocationsBtn"
              onClick={onSwapLocations}
              title="Swap Origin and Destination"
              className="w-full md:w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-sm transition"
            >
              ⇄ <span className="md:hidden ml-2">Swap Locations</span>
            </button>
          </div>

          {/* Destination Dropdown */}
          <div className="md:col-span-5">
            <label htmlFor="destSelectInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
              <span className="text-blue-400">🏁</span>
              <span>Destination Stop</span>
            </label>
            <select
              id="destSelectInput"
              value={destId}
              onChange={(e) => onChangeDest(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">Select destination location...</option>
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Presets Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-semibold">Quick Presets:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`px-3 py-1 rounded-lg font-medium border transition ${
                originId === preset.originId && destId === preset.destId
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

      </div>

      {/* 2. Main Split Content: Route Results & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Route Options List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Ranked Route Options</h3>
              <p className="text-xs text-slate-400">Ordered by your personalized accessibility, comfort & safety score</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {routes.length} Available Routes
            </span>
          </div>

          {/* List of Route Cards */}
          <div className="space-y-4">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={selectedRoute?.id === route.id}
                preferences={preferences}
                onSelectRoute={onSelectRoute}
                onOpenDetails={onOpenDetails}
                onStartJourney={onStartJourney}
              />
            ))}


            {routes.length === 0 && (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-3xl block mb-2">🔍</span>
                <h4 className="text-sm font-bold text-white">No routes found</h4>
                <p className="text-xs text-slate-400 mt-1">Please select an origin and destination location from the controls above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div className="lg:col-span-6 lg:sticky lg:top-20">
          <MapView
            stops={stops}
            selectedRoute={selectedRoute}
            onSetOrigin={onChangeOrigin}
            onSetDest={onChangeDest}
            onReportStop={onReportStop}
          />

        </div>

      </div>

    </div>
  );
};
