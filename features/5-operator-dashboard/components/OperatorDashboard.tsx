import React, { useState } from 'react';
import { FleetVehicle, CommunityReport, TransitStop, TransitLine } from '../types/transit';
import { SpeechService } from '../services/speechService';

interface OperatorDashboardProps {
  fleet: FleetVehicle[];
  reports: CommunityReport[];
  stops: TransitStop[];
  lines: TransitLine[];
  onResolveReport: (reportId: string, note?: string) => void;
  onUpdateVehicle: (vehicleId: string, updates: Partial<FleetVehicle>) => void;
  onBroadcastAlert: (title: string, message: string) => void;
  onOpenReportModal: () => void;
  voiceEnabled: boolean;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  fleet,
  reports,
  stops,
  lines,
  onResolveReport,
  onUpdateVehicle,
  onBroadcastAlert,
  onOpenReportModal,
  voiceEnabled,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [nightOwlMode, setNightOwlMode] = useState<boolean>(true);
  const [pingedVehicles, setPingedVehicles] = useState<{ [vid: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'queue' | 'broadcast'>('overview');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  // Statistics
  const activeReports = reports.filter(r => r.status !== 'resolved');
  const barrierReports = activeReports.filter(r => r.category === 'Accessibility Barrier');
  const crowdReports = activeReports.filter(r => r.category === 'Crowding');
  const delayReports = activeReports.filter(r => r.category === 'Transit Delay');
  const safetyReports = activeReports.filter(
    r => r.category === 'Safety Issue' || r.category === 'Safety Commendation'
  );

  const totalWheelchairBaysOccupied = fleet.reduce((acc, v) => acc + v.wheelchairBaysOccupied, 0);
  const totalWheelchairBays = fleet.reduce((acc, v) => acc + v.wheelchairBaysTotal, 0);

  const filteredReports = reports.filter(r => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'barrier') return r.category === 'Accessibility Barrier';
    if (filterCategory === 'crowding') return r.category === 'Crowding';
    if (filterCategory === 'delay') return r.category === 'Transit Delay';
    if (filterCategory === 'safety')
      return r.category === 'Safety Issue' || r.category === 'Safety Commendation';
    if (filterCategory === 'active') return r.status !== 'resolved';
    if (filterCategory === 'resolved') return r.status === 'resolved';
    return true;
  });

  const handleNightOwlToggle = () => {
    const next = !nightOwlMode;
    setNightOwlMode(next);
    const msg = next
      ? 'Campus Night Owl Safe Escort protocol is now ACTIVE across all campus corridors.'
      : 'Standard transit dispatch protocol resumed.';
    if (voiceEnabled) {
      SpeechService.speak(msg);
    }
  };

  const handlePingVehicle = (vid: string) => {
    setPingedVehicles(prev => ({ ...prev, [vid]: 'Priority ramp staging requested. Driver notified.' }));
    if (voiceEnabled) {
      SpeechService.speak(`Dispatched priority accessibility notification to vehicle ${vid}.`);
    }
    setTimeout(() => {
      setPingedVehicles(prev => {
        const next = { ...prev };
        delete next[vid];
        return next;
      });
    }, 4000);
  };

  const handleToggleSos = (v: FleetVehicle) => {
    const nextSos = !v.emergencySosActive;
    onUpdateVehicle(v.vehicleId, { emergencySosActive: nextSos });
    if (voiceEnabled) {
      SpeechService.speak(
        nextSos
          ? `Emergency blue-light escort protocol triggered for vehicle ${v.vehicleId}.`
          : `Vehicle ${v.vehicleId} emergency status cleared.`
      );
    }
  };

  const handleResolveBarrier = (report: CommunityReport) => {
    onResolveReport(
      report.id,
      'Dispatched maintenance repair crew. Barrier resolved and operational status restored.'
    );
    if (voiceEnabled) {
      SpeechService.speak(
        `Barrier maintenance dispatched for ${report.stopName}. Step-free routing restored.`
      );
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    onBroadcastAlert('Campus Safety Advisory', broadcastText.trim());
    setBroadcastSent(true);
    if (voiceEnabled) {
      SpeechService.speak(`Campus transit broadcast dispatched to all mobile navigation units.`);
    }
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastText('');
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* 1. Header & Live Command Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700/80 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
                Live Telemetry Active
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Dispatch Server: Synchronized
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Transit Operator & Campus Safety Command
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Real-time monitoring of vehicle accessibility capacities, electric ramp lifts, passenger barrier
              queues, and live crowd incident dispatch.
            </p>
          </div>

          {/* Quick Actions & Night Owl Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <button
              onClick={handleNightOwlToggle}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                nightOwlMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>🌙</span>
              <span>Night Owl Safe Escort: {nightOwlMode ? 'ACTIVE' : 'STANDBY'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
            >
              <span>⚠️</span>
              <span>Submit Dispatch Observation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Vehicles */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Fleet</span>
            <span className="text-lg">🚍</span>
          </div>
          <div className="text-3xl font-black text-white">
            {fleet.length} <span className="text-sm font-normal text-slate-400">Vehicles</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 font-semibold">
            <span>● 100% GPS & Lift Monitored</span>
          </div>
        </div>

        {/* Metric 2: Accessible Wheelchair Bays */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Accessible Bays</span>
            <span className="text-lg">🦼</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {totalWheelchairBaysOccupied} / {totalWheelchairBays}
            <span className="text-sm font-normal text-slate-400 ml-2">In Use</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {totalWheelchairBays - totalWheelchairBaysOccupied} bays ready for immediate staging
          </div>
        </div>

        {/* Metric 3: Active Barrier Queue */}
        <div
          className={`border rounded-2xl p-5 shadow-lg transition-all ${
            barrierReports.length > 0
              ? 'bg-red-950/40 border-red-800/80 shadow-red-950/30'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Open Barrier Tickets</span>
            <span className="text-lg">⚠️</span>
          </div>
          <div
            className={`text-3xl font-black ${barrierReports.length > 0 ? 'text-red-400' : 'text-slate-100'}`}
          >
            {barrierReports.length} <span className="text-sm font-normal text-slate-400">Active</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {activeReports.length} total passenger reports in queue
          </div>
        </div>

        {/* Metric 4: Safe Corridor Index */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Safe Lighting Index</span>
            <span className="text-lg">🛡️</span>
          </div>
          <div className="text-3xl font-black text-blue-400">98.4%</div>
          <div className="mt-2 text-xs text-slate-400">Perimeter CCTV & 24/7 Blue-Light active</div>
        </div>
      </div>

      {/* 3. Live Fleet Vehicles Table & Real-Time Telemetry */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🚍</span>
              <span>Live Fleet Accessibility & Occupancy Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Continuous feed of ramp lift diagnostics, wheelchair capacity, and driver dispatch
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              ✓ Green: Low Load & Ramp OK
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
              ⚠️ Amber: Moderate / Bridge Plate
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Vehicle ID</th>
                <th className="py-3 px-3">Route / Transit Line</th>
                <th className="py-3 px-3">Driver / Officer</th>
                <th className="py-3 px-3">Occupancy Load</th>
                <th className="py-3 px-3">Wheelchair Bays</th>
                <th className="py-3 px-3">Electric Ramp Status</th>
                <th className="py-3 px-3">Next Stop & ETA</th>
                <th className="py-3 px-3 text-right">Dispatcher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {fleet.map(v => {
                const nextStop = stops.find(s => s.id === v.nextStopId);
                const pingMsg = pingedVehicles[v.vehicleId];

                return (
                  <tr key={v.vehicleId} className="hover:bg-slate-800/40 transition">
                    {/* Vehicle ID */}
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      <div className="flex items-center space-x-1.5">
                        {v.emergencySosActive && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                        )}
                        <span>{v.vehicleId}</span>
                      </div>
                    </td>

                    {/* Route Line */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {v.lineName}
                      </span>
                    </td>

                    {/* Driver */}
                    <td className="py-3 px-3 text-slate-300">{v.driver}</td>

                    {/* Occupancy Bar */}
                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>{v.occupancyPct}% Load</span>
                          <span className="capitalize">{v.crowdLevel}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              v.occupancyPct > 75
                                ? 'bg-purple-500'
                                : v.occupancyPct > 45
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${v.occupancyPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Wheelchair Bays */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${
                          v.wheelchairBaysOccupied >= v.wheelchairBaysTotal
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : v.wheelchairBaysOccupied > 0
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        🦼 {v.wheelchairBaysOccupied} / {v.wheelchairBaysTotal} In Use
                      </span>
                    </td>

                    {/* Ramp Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center space-x-1 border ${
                          v.rampStatus.includes('Operational')
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                            : v.rampStatus.includes('Verified')
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                              : 'bg-red-950/80 text-red-300 border-red-800/80'
                        }`}
                      >
                        <span>
                          {v.rampStatus.includes('Operational') || v.rampStatus.includes('Verified')
                            ? '✓'
                            : '⚠️'}
                        </span>
                        <span>{v.rampStatus}</span>
                      </span>
                    </td>

                    {/* Next Stop & ETA */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{nextStop ? nextStop.name : v.nextStopId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ETA: {v.etaNextStopSec}s • {v.speedKmh} km/h
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right">
                      {pingMsg ? (
                        <span className="text-[11px] font-bold text-emerald-400 animate-pulse block">
                          ✓ {pingMsg}
                        </span>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handlePingVehicle(v.vehicleId)}
                            title="Ping Driver for Ramp Staging"
                            className="px-2.5 py-1.5 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                          >
                            📡 Ping Ramp
                          </button>

                          <button
                            onClick={() => handleToggleSos(v)}
                            title={
                              v.emergencySosActive ? 'Clear Emergency SOS' : 'Trigger Safe Escort Protocol'
                            }
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs border transition ${
                              v.emergencySosActive
                                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            🚨 {v.emergencySosActive ? 'SOS ON' : 'Escort'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real-Time Passenger Hazard & Barrier Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>⚠️</span>
                <span>Real-Time Passenger Hazard & Barrier Queue</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800">
                {activeReports.length} Open
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Field observations submitted by passengers instantly arrive here for dispatcher resolution.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: 'all', label: `All (${reports.length})` },
              { id: 'barrier', label: `Barriers (${barrierReports.length})` },
              { id: 'crowding', label: `Crowding (${crowdReports.length})` },
              { id: 'delay', label: `Delays (${delayReports.length})` },
              { id: 'safety', label: `Safety (${safetyReports.length})` },
              { id: 'resolved', label: `Resolved` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid / List */}
        <div className="space-y-3">
          {filteredReports.map(report => {
            const isResolved = report.status === 'resolved';
            const isBarrier = report.category === 'Accessibility Barrier';
            const isCrowd = report.category === 'Crowding';
            const isDelay = report.category === 'Transit Delay';
            const isSafety = report.category === 'Safety Issue' || report.category === 'Safety Commendation';

            return (
              <div
                key={report.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                    : isBarrier
                      ? 'bg-red-950/30 border-red-900/60 hover:border-red-700/80 shadow-md shadow-red-950/20'
                      : isCrowd
                        ? 'bg-purple-950/30 border-purple-900/60 hover:border-purple-700/80'
                        : isDelay
                          ? 'bg-amber-950/30 border-amber-900/60 hover:border-amber-700/80'
                          : 'bg-emerald-950/30 border-emerald-900/60 hover:border-emerald-700/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Meta & Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Status badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isResolved
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-red-600 text-white font-bold animate-pulse'
                        }`}
                      >
                        {isResolved ? '✓ Resolved' : '● Live Ticket'}
                      </span>

                      {/* Category badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isBarrier
                            ? 'bg-red-950/80 text-red-300 border-red-800'
                            : isCrowd
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                              : isDelay
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {report.category}
                      </span>

                      {/* Station / Line */}
                      <span className="font-bold text-slate-300 flex items-center space-x-1">
                        <span>📍</span>
                        <span>{report.stopName}</span>
                      </span>

                      {report.lineName && (
                        <span className="font-mono text-slate-400">({report.lineName})</span>
                      )}

                      {/* Timestamp */}
                      <span className="text-slate-400 ml-auto font-mono text-[11px]">
                        ⏱️ {report.timestamp}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white">{report.title}</h3>

                    {/* Details */}
                    <p className="text-xs text-slate-300 leading-relaxed">{report.details}</p>

                    {/* Impact & Upvotes */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="text-slate-400">
                        <strong className="text-slate-200">Impact:</strong> {report.impact}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        👍 {report.upvotes} Passengers Verified
                      </span>
                      {report.resolutionNote && (
                        <span className="text-emerald-400 font-medium">✓ Note: {report.resolutionNote}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Operator Dispatch Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                    {!isResolved ? (
                      <>
                        {report.type === 'sos_alert' ? (
                          <button
                            onClick={() =>
                              onResolveReport(
                                report.id,
                                'Campus Security Patrol Unit #4 (Officer J. Miller) intercepted passenger safely. Escort completed to destination.'
                              )
                            }
                            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 transition flex items-center space-x-1 animate-pulse"
                          >
                            🚓 Dispatch Security & Escort
                          </button>
                        ) : isBarrier ? (
                          <button
                            onClick={() => handleResolveBarrier(report)}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
                          >
                            🛠️ Dispatch Maintenance & Repair
                          </button>
                        ) : isSafety ? (
                          <button
                            onClick={() =>
                              onResolveReport(report.id, 'Campus safety escort and lighting crew dispatched.')
                            }
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition"
                          >
                            🔦 Send Safety Escort Team
                          </button>
                        ) : isCrowd ? (
                          <button
                            onClick={() =>
                              onResolveReport(report.id, 'Extra vehicle dispatched to handle crowd load.')
                            }
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition"
                          >
                            🚍 Deploy Backup Shuttle
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onResolveReport(report.id, 'Broadcasted advisory notice to all passengers.')
                            }
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 transition"
                          >
                            ⏱️ Broadcast Delay Notice
                          </button>
                        )}

                        <button
                          onClick={() => onResolveReport(report.id, 'Acknowledged by dispatcher.')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                          ✓ Acknowledge & Archive
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 italic">
                        Resolved by Dispatcher ({report.resolvedAt || 'Completed'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-3xl block">🎉</span>
              <h4 className="text-sm font-bold text-white">All Clear in this Category</h4>
              <p className="text-xs text-slate-400">No active incidents or barrier tickets reported.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. System-wide Dispatch Advisory Broadcast Center */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
            <span>📢</span>
            <span>Broadcast Campus Transit Advisory</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Push instantaneous notifications and accessibility alerts to all passenger navigation screens.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                placeholder="e.g. Weather Alert: West Campus heated shuttle running every 4 min with zero steps."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition shrink-0"
              >
                Broadcast ➔
              </button>
            </div>

            {broadcastSent && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold animate-fadeIn">
                ✓ Advisory broadcast dispatched to all passenger devices!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
