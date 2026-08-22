import React from 'react';
import { UserPreferences, AccessibilityProfile, ProfileId } from '../types/transit';
import { ACCESSIBILITY_PROFILES } from '../data/transitData';

interface PreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (newPrefs: UserPreferences) => void;
}

export const PreferenceModal: React.FC<PreferenceModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [localPrefs, setLocalPrefs] = React.useState<UserPreferences>(preferences);

  // Sync state when modal opens
  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences, isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (profileId: ProfileId) => {
    const profile = ACCESSIBILITY_PROFILES[profileId];
    if (profile) {
      setLocalPrefs({
        ...profile.defaultPreferences,
        highContrast: localPrefs.highContrast,
        fontSize: localPrefs.fontSize,
        voiceAnnouncements: localPrefs.voiceAnnouncements,
      });
    }
  };

  const handleSave = () => {
    onSavePreferences(localPrefs);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prefModalTitle"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">♿</span>
            <div>
              <h2 id="prefModalTitle" className="text-lg font-bold text-white">
                Accessibility & Travel Preferences
              </h2>
              <p className="text-xs text-slate-400">
                Tailor routing algorithms to your specific mobility and safety needs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close preferences modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: Accessibility Profile Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Choose Mobility & Safety Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.values(ACCESSIBILITY_PROFILES).map((p: AccessibilityProfile) => {
                const isSelected = localPrefs.profileId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">{p.icon}</span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {p.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{p.tagline}</p>
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active profile description banner */}
            <div className="mt-2.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">ℹ️</span>
              <span>{ACCESSIBILITY_PROFILES[localPrefs.profileId]?.description}</span>
            </div>
          </div>

          {/* Section 2: Granular Filters & Overrides */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Granular Routing Constraints
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Step Free Only */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.stepFreeOnly}
                  onChange={e => setLocalPrefs({ ...localPrefs, stepFreeOnly: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>🦼 Step-Free Path Mandatory</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Strictly filters out non-accessible stops & vehicles without ramps
                  </p>
                </div>
              </label>

              {/* Avoid Stairs */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.avoidStairs}
                  onChange={e => setLocalPrefs({ ...localPrefs, avoidStairs: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>🪜 Avoid Stairs & Inclines</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bypasses stations with stair-only concourses or broken escalators
                  </p>
                </div>
              </label>

              {/* Prefer Safer Route */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.preferSaferRoute}
                  onChange={e => setLocalPrefs({ ...localPrefs, preferSaferRoute: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>🛡️ Safe Lit Corridors (≥8.5/10)</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Prioritizes high-intensity LED lighting, CCTV, & Blue-Light SOS stations
                  </p>
                </div>
              </label>

              {/* Avoid Crowded Vehicles */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.avoidCrowded}
                  onChange={e => setLocalPrefs({ ...localPrefs, avoidCrowded: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>👥 Avoid Crowded Vehicles</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Favors low passenger density shuttles with open wheelchair bays
                  </p>
                </div>
              </label>

              {/* Require Elevators */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.requireElevators}
                  onChange={e => setLocalPrefs({ ...localPrefs, requireElevators: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>🛗 Require Working Elevators</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bypasses stations with reported out-of-service elevators
                  </p>
                </div>
              </label>

              {/* Voice Guidance */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer hover:bg-slate-800/70 transition">
                <input
                  type="checkbox"
                  checked={localPrefs.voiceAnnouncements}
                  onChange={e => setLocalPrefs({ ...localPrefs, voiceAnnouncements: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-600"
                />
                <div>
                  <span className="text-sm font-semibold text-white flex items-center space-x-1.5">
                    <span>🔊 Audio Voice Announcements</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Announces route changes, curb cues, and boarding step-free warnings
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Max Walking Distance Tolerance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Maximum Walking Distance Tolerance
              </label>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {localPrefs.maxWalkDistanceMeters} meters (~
                {Math.round(localPrefs.maxWalkDistanceMeters / 80)} min walk)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[150, 300, 600, 1000].map(dist => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setLocalPrefs({ ...localPrefs, maxWalkDistanceMeters: dist })}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition ${
                    localPrefs.maxWalkDistanceMeters === dist
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  &lt; {dist}m{' '}
                  {dist <= 150
                    ? '(Minimal)'
                    : dist === 300
                      ? '(Low)'
                      : dist === 600
                        ? '(Moderate)'
                        : '(Standard)'}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Live Score Weighting Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Personalized Ranking Priority Weights</span>
              <span className="text-[10px] text-emerald-400">Live Algorithmic Balance</span>
            </h4>

            <div className="space-y-2 text-xs">
              {/* Accessibility */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>♿ Accessibility & Step-Free</span>
                  <span className="font-semibold">
                    {localPrefs.stepFreeOnly || localPrefs.profileId === 'wheelchair' ? '60%' : '35%'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: localPrefs.stepFreeOnly || localPrefs.profileId === 'wheelchair' ? '60%' : '35%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Safety */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>🛡️ Safety & Lighting</span>
                  <span className="font-semibold">
                    {localPrefs.preferSaferRoute || localPrefs.profileId === 'night_safety' ? '50%' : '25%'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        localPrefs.preferSaferRoute || localPrefs.profileId === 'night_safety'
                          ? '50%'
                          : '25%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Low Walking & Comfort */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>🚶 Low Walking & Comfort</span>
                  <span className="font-semibold">
                    {localPrefs.avoidStairs ||
                    localPrefs.avoidCrowded ||
                    localPrefs.maxWalkDistanceMeters <= 300
                      ? '40%'
                      : '20%'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        localPrefs.avoidStairs ||
                        localPrefs.avoidCrowded ||
                        localPrefs.maxWalkDistanceMeters <= 300
                          ? '40%'
                          : '20%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSelectProfile('standard')}
            className="text-xs font-semibold text-slate-400 hover:text-white underline transition"
          >
            Reset to Standard
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              id="savePreferencesBtn"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
            >
              <span>✓ Apply Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
