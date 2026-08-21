import React from 'react';
import { UserPreferences } from '../types/transit';

interface NavbarProps {
  currentTab: 'home' | 'planner' | 'operator';
  onSelectTab: (tab: 'home' | 'planner' | 'operator') => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenPreferencesModal: () => void;
  onOpenReportModal: () => void;
  activeReportCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  preferences,
  onUpdatePreferences,
  onOpenPreferencesModal,
  onOpenReportModal,
  activeReportCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('home')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20 text-white font-bold text-xl ring-2 ring-emerald-400/30">
              <span>🦼</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Access<span className="text-emerald-400">Ride</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Safe & Accessible Transit Navigator</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80" aria-label="Main Navigation">
            <button
              id="navTabHome"
              onClick={() => onSelectTab('home')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏠</span>
              <span className="hidden sm:inline">Home & Overview</span>
              <span className="sm:hidden">Home</span>
            </button>

            <button
              id="navTabPlanner"
              onClick={() => onSelectTab('planner')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentTab === 'planner'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Route Planner & Map</span>
              <span className="sm:hidden">Planner</span>
            </button>

            <button
              id="navTabOperator"
              onClick={() => onSelectTab('operator')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentTab === 'operator'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏢</span>
              <span className="hidden sm:inline">Operator Command</span>
              <span className="sm:hidden">Operator</span>
              {activeReportCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {activeReportCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Accessibility Controls & Preferences Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Quick Report Button */}
            <button
              id="navQuickReportBtn"
              onClick={onOpenReportModal}
              title="Report an issue, crowding, delay, or barrier"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
            >
              <span>⚠️</span>
              <span className="hidden md:inline">Report Issue</span>
            </button>

            
            {/* Preferences Modal Button */}
            <button
              id="openPreferencesBtn"
              onClick={onOpenPreferencesModal}
              title="Customize Accessibility Preferences"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Preferences</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              id="toggleHighContrastBtn"
              onClick={() => onUpdatePreferences({ highContrast: !preferences.highContrast })}
              title="Toggle WCAG AAA High-Contrast Mode"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                preferences.highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>👁️</span>
              <span className="hidden md:inline">{preferences.highContrast ? 'High Contrast: ON' : 'Contrast'}</span>
            </button>

            {/* Voice Cues Toggle */}
            <button
              id="toggleVoiceCuesBtn"
              onClick={() => onUpdatePreferences({ voiceAnnouncements: !preferences.voiceAnnouncements })}
              title="Toggle Audio Voice Guidance Announcements"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border ${
                preferences.voiceAnnouncements
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>🔊</span>
              <span className="hidden lg:inline">{preferences.voiceAnnouncements ? 'Voice: ON' : 'Voice'}</span>
            </button>

            {/* Text Scaling Controls */}
            <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => onUpdatePreferences({ fontSize: 'normal' })}
                className={`px-2 py-0.5 rounded font-medium ${preferences.fontSize === 'normal' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                title="Normal text size"
              >
                A
              </button>
              <button
                onClick={() => onUpdatePreferences({ fontSize: 'large' })}
                className={`px-2 py-0.5 rounded font-bold ${preferences.fontSize === 'large' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                title="Large text size"
              >
                A+
              </button>
              <button
                onClick={() => onUpdatePreferences({ fontSize: 'xlarge' })}
                className={`px-2 py-0.5 rounded font-extrabold ${preferences.fontSize === 'xlarge' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                title="Extra large text size"
              >
                A++
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
