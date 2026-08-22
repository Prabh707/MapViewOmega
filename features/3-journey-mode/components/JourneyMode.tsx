import React, { useState, useEffect } from 'react';
import { RouteCandidate, RouteSegment, UserPreferences } from '../types/transit';
import { SpeechService } from '../services/speechService';

interface JourneyModeProps {
  route: RouteCandidate;
  preferences: UserPreferences;
  onCompleteJourney: () => void;
  onExitJourney: () => void;
  onOpenReportModal: () => void;
  onTriggerEmergencyEscalation?: (route: RouteCandidate, step: RouteSegment) => void;
  voiceEnabled: boolean;
}

export const JourneyMode: React.FC<JourneyModeProps> = ({
  route,
  preferences,
  onCompleteJourney,
  onExitJourney,
  onOpenReportModal,
  onTriggerEmergencyEscalation,
  voiceEnabled,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60); // 15-minute standard countdown
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [checkinPhase, setCheckinPhase] = useState<'normal' | 'warning' | 'escalated'>('normal');
  const [warningSeconds, setWarningSeconds] = useState<number>(30); // 30s urgent countdown
  const [isCheckinConfirmed, setIsCheckinConfirmed] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState<boolean>(false);
  const [isFakeCallConnected, setIsFakeCallConnected] = useState<boolean>(false);
  const [completionToast, setCompletionToast] = useState<boolean>(false);

  const steps: RouteSegment[] = route.segments;
  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPct = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // 1. Initial Voice Announcement
  useEffect(() => {
    if (voiceEnabled) {
      SpeechService.speak(
        `Starting accessible journey for ${route.title}. Step 1: ${currentStep.instructions}`
      );
    }
  }, []);

  // 2. Normal Safety Check-in Timer (Counting down to 0)
  useEffect(() => {
    if (!isTimerActive || checkinPhase !== 'normal') return;

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          // USER MISSED CHECK-IN -> Transition to WARNING PHASE
          setCheckinPhase('warning');
          setWarningSeconds(30);
          if (voiceEnabled) {
            SpeechService.speak(
              'Warning: Safety check-in missed! Please confirm you are safe within 30 seconds before emergency contacts and campus security are alerted.'
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, checkinPhase, voiceEnabled]);

  // 3. Phase 2: Warning Countdown Timer (User Doesn't Respond within 30s -> Escalation)
  useEffect(() => {
    if (checkinPhase !== 'warning') return;

    const warnInterval = setInterval(() => {
      setWarningSeconds(prev => {
        if (prev <= 1) {
          // USER DOES NOT RESPOND -> AUTOMATED EMERGENCY ESCALATION
          setCheckinPhase('escalated');
          if (onTriggerEmergencyEscalation) {
            onTriggerEmergencyEscalation(route, currentStep);
          }
          if (voiceEnabled) {
            SpeechService.speak(
              'Safety check-in expired with no response. Automated emergency escalation activated. Alerting emergency contacts and campus security desk.'
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(warnInterval);
  }, [checkinPhase, route, currentStep, onTriggerEmergencyEscalation, voiceEnabled]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleAdvanceStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = steps[nextIdx];
      if (voiceEnabled) {
        SpeechService.speak(`Step ${nextIdx + 1}: ${nextStep.instructions}`);
      }
    } else {
      handleCompleteArrival();
    }
  };

  const handleRepeatVoice = () => {
    if (voiceEnabled) {
      SpeechService.speak(
        `Step ${currentStepIndex + 1} of ${steps.length}: ${currentStep.instructions}. ${currentStep.accessibilityNotes ? currentStep.accessibilityNotes.join('. ') : ''}`
      );
    }
  };

  const handleSnoozeTimer = () => {
    setTimerSeconds(5 * 60);
    setCheckinPhase('normal');
    if (voiceEnabled) {
      SpeechService.speak('Safety timer extended by 5 minutes.');
    }
  };

  const handleConfirmCheckin = () => {
    setTimerSeconds(15 * 60);
    setCheckinPhase('normal');
    setIsCheckinConfirmed(true);
    if (voiceEnabled) {
      SpeechService.speak('Safety check-in confirmed. You are safe and on schedule.');
    }
    setTimeout(() => setIsCheckinConfirmed(false), 3000);
  };

  const handleTriggerDemoMissedCheckin = () => {
    setTimerSeconds(3);
    setCheckinPhase('normal');
    if (voiceEnabled) {
      SpeechService.speak('Fast demo mode: Safety check-in timer set to expire in 3 seconds.');
    }
  };

  const handleManualEscalate = () => {
    setCheckinPhase('escalated');
    if (onTriggerEmergencyEscalation) {
      onTriggerEmergencyEscalation(route, currentStep);
    }
    if (voiceEnabled) {
      SpeechService.speak('Emergency escalation triggered immediately.');
    }
  };

  const handleDeescalate = () => {
    setCheckinPhase('normal');
    setTimerSeconds(15 * 60);
    if (voiceEnabled) {
      SpeechService.speak('Emergency status resolved. Safety timer reset to 15 minutes.');
    }
  };

  const handleCompleteArrival = () => {
    setIsTimerActive(false);
    setCompletionToast(true);
    if (voiceEnabled) {
      SpeechService.speak(
        'Safe arrival confirmed! Journey completed safely. Thank you for using AccessRide.'
      );
    }
    setTimeout(() => {
      onCompleteJourney();
    }, 2500);
  };

  const handleStartFakeCall = () => {
    setIsFakeCallOpen(true);
    setIsFakeCallConnected(false);
  };

  const handleAcceptFakeCall = () => {
    setIsFakeCallConnected(true);
    if (voiceEnabled) {
      SpeechService.speak(
        'Hey! I am tracking your bus ride right now. I am waiting for you at the library stop right near the front door. You are just two minutes away, see you soon!'
      );
    }
  };

  const handleEndFakeCall = () => {
    setIsFakeCallOpen(false);
    setIsFakeCallConnected(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. Top Live Navigation Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700/80 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
                LIVE JOURNEY ACTIVE
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {route.totalDurationMin} min total
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{route.title}</h1>
            <p className="text-xs text-slate-300 mt-1">{route.subtitle}</p>
          </div>

          {/* Quick Safety Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition flex items-center space-x-1 animate-pulse"
            >
              <span>🚨</span>
              <span>1-Tap SOS</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center space-x-1"
            >
              <span>⚠️</span>
              <span>Report Hazard</span>
            </button>

            <button
              onClick={handleStartFakeCall}
              title="Launch Fake Call Escort"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <span>📞 Decoy</span>
            </button>

            <button
              onClick={onExitJourney}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Exit Journey Mode"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-slate-400">{progressPct}% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Current Step Active Guidance Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 ring-1 ring-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-md shadow-emerald-600/30 uppercase tracking-wider">
            Current Action • Step {currentStepIndex + 1}
          </span>
          <span className="text-xs font-bold text-emerald-400">~{currentStep.durationMin} Minutes</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {currentStep.instructions}
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            From <strong className="text-white">{currentStep.fromName}</strong> ➔{' '}
            <strong className="text-white">{currentStep.toName}</strong>
          </p>
        </div>

        {/* Step Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <span className="text-base">🦼</span>
            <span>{currentStep.stepFree ? '100% Step-Free Pathway' : 'Has Stairs Warning'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-2">
            <span className="text-base">💡</span>
            <span>Lighting Score: {currentStep.lightingScore}/10</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center space-x-2">
            <span className="text-base">🛡️</span>
            <span>CCTV & Safe Escort Monitored</span>
          </div>
        </div>

        {/* Step Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleRepeatVoice}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-2"
          >
            <span>🔊</span>
            <span>Repeat Voice Guidance</span>
          </button>

          <button
            onClick={handleAdvanceStep}
            className="flex-1 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>
              {currentStepIndex === steps.length - 1
                ? '🛡️ Arrive at Destination ➔'
                : '✓ Mark Step Complete & Continue ➔'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SAFETY CHECK-IN MULTI-TIER ESCALATION ENGINE                           */}
      {/* User misses check-in -> Warning -> No Response -> Contact -> Security     */}
      {/* ========================================================================= */}

      {/* Stage 0: Normal Check-In Timer Card */}
      {checkinPhase === 'normal' && (
        <div className="bg-slate-900/90 border border-blue-500/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xl font-bold">
                ⏱️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Automated Safety Check-In Timer</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active Protection
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  If countdown expires without confirmation, an emergency escalation sequence automatically
                  notifies your trusted contacts and campus dispatch.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-3xl font-black text-emerald-400 bg-slate-950 px-4 py-1.5 rounded-2xl border border-slate-800 inline-block shadow-inner">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-400">
              {isCheckinConfirmed ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span>✓</span>
                  <span>Check-in confirmed! Timer synchronized.</span>
                </span>
              ) : (
                <span>Check in when you reach each transit milestone or bus stop.</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerDemoMissedCheckin}
                title="Simulate missed check-in for hackathon demonstration"
                className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition flex items-center space-x-1"
              >
                <span>⚡ Demo: Expire in 3s</span>
              </button>

              <button
                onClick={handleSnoozeTimer}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +5 Min Snooze
              </button>

              <button
                onClick={handleConfirmCheckin}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition flex items-center space-x-1"
              >
                <span>✓</span>
                <span>I am Safe (Check In Now)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 1: Warning Card (User Misses Check-In -> 30s Warning) */}
      {checkinPhase === 'warning' && (
        <div className="bg-gradient-to-br from-amber-950/90 via-slate-900 to-red-950/80 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-pulse">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-500 text-amber-300 flex items-center justify-center text-2xl font-black">
                ⚠️
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-amber-300">STAGE 1: CHECK-IN OVERDUE WARNING</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-bounce">
                    URGENT
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  You missed your scheduled transit check-in. Please confirm you are safe before emergency
                  escalation.
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-amber-400 uppercase">Auto-Escalates In:</div>
              <span className="font-mono text-3xl font-black text-red-400 bg-slate-950 px-4 py-1 rounded-2xl border border-red-800 inline-block shadow-lg">
                00:{warningSeconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automated Escalation Pipeline:
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 flex-wrap gap-2">
              <div className="flex items-center space-x-1.5 text-amber-400">
                <span>⚠️</span>
                <span>1. Missed Check-In (Active)</span>
              </div>
              <span>➔</span>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <span>📱</span>
                <span>2. Notify Sarah Jenkins (SMS)</span>
              </div>
              <span>➔</span>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <span>🚓</span>
                <span>3. Campus Security Dispatch</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={handleSnoozeTimer}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              +5 Min Snooze
            </button>

            <button
              onClick={handleManualEscalate}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-red-700 hover:bg-red-600 text-white shadow-md transition"
            >
              🚨 Escalate Immediately
            </button>

            <button
              onClick={handleConfirmCheckin}
              className="px-6 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>✓ I am Safe (Cancel Alert)</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 2 & 3: Emergency Escalation Active (Emergency Contact Notified + Campus Security Dispatch) */}
      {checkinPhase === 'escalated' && (
        <div className="bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-red-600/40 animate-pulse">
                🚨
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-black text-white">EMERGENCY PROTOCOL ACTIVATED</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                    LIVE INCIDENT #SOS-408
                  </span>
                </div>
                <p className="text-xs text-red-200">
                  User did not respond to check-in warning. Emergency contacts and campus police command have
                  been automatically mobilized.
                </p>
              </div>
            </div>

            <button
              onClick={handleDeescalate}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition self-start sm:self-auto shrink-0"
            >
              ✓ I am Safe (De-escalate)
            </button>
          </div>

          {/* Multi-tier Escalation Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stage 2 Card: Emergency Contact Notified */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center space-x-1.5">
                  <span>📱</span>
                  <span>STAGE 2: Emergency Contact Notified</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800">
                  SMS & PUSH SENT
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">Sarah Jenkins (Primary Emergency Contact • Sister)</div>
                <div className="text-slate-400">Phone: +1 (555) 234-5678 • Status: Delivered Just Now</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                <div className="text-[10px] text-amber-400 font-bold uppercase">
                  Automated SMS Payload Preview:
                </div>
                <p className="text-slate-300 italic">
                  "🚨 URGENT: Alex Rivera missed a scheduled transit check-in on 'SafeCorridor Campus Night
                  Shuttle'. Last GPS: 42.3601° N, -71.0942° W near Central Library. Battery: 84%. Live
                  Tracking: https://accessride.campus/track/b048"
                </p>
              </div>
            </div>

            {/* Stage 3 Card: Campus Security / Operator Dispatched */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-red-500/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-red-400 flex items-center space-x-1.5">
                  <span>🚓</span>
                  <span>STAGE 3: Campus Security & Operator</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                  PATROL DISPATCHED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">Campus Security Patrol Cruiser #12</div>
                <div className="text-slate-300">
                  Responding Officer: <strong>Officer J. Miller (Badge #409)</strong>
                </div>
                <div className="text-emerald-400 font-bold">⏱️ ETA to Intercept Point: ~2 Minutes</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">
                  Intercept Location: <strong>{currentStep.fromName}</strong>
                </div>
                <div className="text-slate-400">
                  Operator Incident Ticket:{' '}
                  <strong className="text-amber-400">Injected to Dispatch Queue</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Emergency Call Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-red-900/60">
            <div className="text-xs text-slate-400">
              Stay in your current well-lit location. Officer Miller has received your exact step location.
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="tel:6175550199"
                className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center space-x-1.5"
              >
                <span>📞</span>
                <span>Call Security Desk: (617) 555-0199</span>
              </a>
              <a
                href="tel:911"
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md transition flex items-center space-x-1.5"
              >
                <span>🚨</span>
                <span>Call 911</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Full Turn-by-Turn Timeline Steps */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <span>🗺️</span>
          <span>Full Route Steps Breakdown</span>
        </h3>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {steps.map((seg, sIdx) => {
            const isDone = sIdx < currentStepIndex;
            const isCurrent = sIdx === currentStepIndex;

            return (
              <div key={sIdx} className="relative">
                <div
                  className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : isCurrent
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isDone ? '✓' : sIdx + 1}
                </div>

                <div
                  className={`p-4 rounded-2xl border ml-2 transition ${
                    isCurrent
                      ? 'bg-slate-950 border-emerald-500/60 shadow-lg'
                      : isDone
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={isCurrent ? 'text-emerald-400' : 'text-slate-300'}>
                      {seg.type === 'walk'
                        ? `Walk (${seg.distanceMeters}m)`
                        : `Transit (${seg.line?.shortName})`}
                    </span>
                    <span className="text-slate-400 font-normal">~{seg.durationMin} min</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{seg.instructions}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Complete Journey Safe Arrival Card */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-600/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-3">
        <h3 className="text-lg font-black text-white">Reached Your Final Destination?</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Confirm your safe arrival to stop all timers, log completion, and release automated escort tracking.
        </p>
        <button
          onClick={handleCompleteArrival}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/40 transition transform hover:-translate-y-0.5 inline-flex items-center justify-center space-x-2"
        >
          <span>🛡️ I Have Arrived Safely (Complete Journey)</span>
        </button>
      </div>

      {/* 6. Safe Arrival Toast Confirmation Modal */}
      {completionToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
              🎉
            </div>
            <h2 className="text-2xl font-black text-white">Safe Arrival Confirmed!</h2>
            <p className="text-xs text-slate-300">
              Your journey along the verified safe lit corridor has been recorded. All emergency timers
              stopped.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold">
              ✓ Destination Reached: {route.segments[route.segments.length - 1].toName}
            </div>
          </div>
        </div>
      )}

      {/* 7. SOS Emergency Modal */}
      {isSosOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
        >
          <div className="bg-slate-900 border border-red-600 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚨</span>
                <h2 className="text-lg font-black text-white">1-Tap Emergency Assistance</h2>
              </div>
              <button
                onClick={() => setIsSosOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/80 text-xs text-red-200 space-y-1">
              <div className="font-bold text-white text-sm">📍 Live GPS Packet Broadcasted:</div>
              <div>
                <strong>Route:</strong> {route.title} (Step {currentStepIndex + 1})
              </div>
              <div>
                <strong>Coordinates:</strong> 42.3601° N, -71.0942° W
              </div>
              <div>
                <strong>Corridor:</strong> West Campus Safe Corridor (Blue-Light Enabled)
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="tel:911"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-center block text-sm shadow-lg shadow-red-600/30 transition"
              >
                📞 Call 911 Emergency Services
              </a>
              <a
                href="tel:6175550199"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center block text-xs transition"
              >
                🛡️ Call Campus Safety Escort Desk (24/7)
              </a>
            </div>

            <button
              onClick={() => setIsSosOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel / Close Emergency Beacon
            </button>
          </div>
        </div>
      )}

      {/* 8. Fake Call Decoy Modal */}
      {isFakeCallOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          role="dialog"
        >
          <div className="bg-slate-950 border border-slate-700 rounded-3xl p-8 max-sm w-full text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-3xl mx-auto shadow-xl">
                🛡️
              </div>
              <h3 className="text-xl font-black text-white">Campus Safety Escort</h3>
              <p className="text-xs text-emerald-400 font-mono">
                {isFakeCallConnected ? '00:14 • Connected' : 'Incoming Security Call...'}
              </p>
            </div>

            {!isFakeCallConnected ? (
              <div className="flex items-center justify-around pt-4">
                <button
                  onClick={handleEndFakeCall}
                  className="w-14 h-14 rounded-full bg-red-600 text-white text-xl flex items-center justify-center font-bold shadow-lg hover:bg-red-500 transition"
                  title="Decline"
                >
                  ✕
                </button>
                <button
                  onClick={handleAcceptFakeCall}
                  className="w-14 h-14 rounded-full bg-emerald-600 text-white text-xl flex items-center justify-center font-bold shadow-lg hover:bg-emerald-500 transition animate-bounce"
                  title="Accept"
                >
                  📞
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                  "I am tracking your ride right now near the library stop. See you in two minutes!"
                </p>
                <button
                  onClick={handleEndFakeCall}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                >
                  End Decoy Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
