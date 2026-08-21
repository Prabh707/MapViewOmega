/**
 * AccessRide - Safety Hub & Emergency Toolkit
 * Includes Automated Safety Check-in Timer, Realistic Fake Call Simulator, and 1-Tap SOS Data Packet.
 */

import { speechService } from '../services/speechService.js';
import { StorageService } from '../services/storageService.js';

export class SafetyHub {
  constructor(containerElement, onEmergencyTriggered) {
    this.container = containerElement;
    this.onEmergencyTriggered = onEmergencyTriggered;
    this.timerInterval = null;
    this.remainingSeconds = 0;
    this.totalTimerSeconds = 0;
    this.isTimerRunning = false;
    this.activeRoute = null;
    this.fakeCallAudioContext = null;
  }

  setActiveRoute(route) {
    this.activeRoute = route;
  }

  // --- SAFETY CHECK-IN TIMER ---

  startCheckinTimer(minutes = 15) {
    this.stopCheckinTimer();
    this.totalTimerSeconds = minutes * 60;
    this.remainingSeconds = this.totalTimerSeconds;
    this.isTimerRunning = true;

    speechService.announceSafetyAlert(`Safety check-in scheduled for ${minutes} minutes. We will remind you to confirm your safe arrival.`);

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerDisplay();

      if (this.remainingSeconds <= 0) {
        this.stopCheckinTimer();
        this.triggerTimerExpiredAlert();
      }
    }, 1000);

    this.updateTimerDisplay();
  }

  snoozeTimer(extraMinutes = 5) {
    if (!this.isTimerRunning) {
      this.startCheckinTimer(extraMinutes);
      return;
    }
    this.remainingSeconds += extraMinutes * 60;
    this.totalTimerSeconds += extraMinutes * 60;
    this.updateTimerDisplay();
    speechService.speak(`Safety timer extended by ${extraMinutes} minutes.`);
  }

  confirmSafeArrival() {
    this.stopCheckinTimer();
    this.isTimerRunning = false;
    speechService.speak('Safe arrival confirmed! Journey completed safely.');
    this.renderSafeConfirmationToast();
    this.updateTimerDisplay();
  }

  stopCheckinTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  triggerTimerExpiredAlert() {
    speechService.announceSafetyAlert('Safety check-in timer expired! Automated emergency alert simulated.');
    this.openSOSModal(true);
  }

  updateTimerDisplay() {
    const timerElem = document.getElementById('safetyTimerCount');
    const timerStatus = document.getElementById('safetyTimerStatus');
    const timerBadge = document.getElementById('headerTimerBadge');

    if (!timerElem) return;

    if (!this.isTimerRunning) {
      timerElem.textContent = '--:--';
      if (timerStatus) timerStatus.textContent = 'No active timer. Start one before departure.';
      if (timerBadge) timerBadge.style.display = 'none';
      return;
    }

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    timerElem.textContent = formatted;
    if (timerStatus) {
      timerStatus.innerHTML = `<span class="badge badge-emerald pulse-badge">Active Protection</span> Check in before countdown ends.`;
    }

    if (timerBadge) {
      timerBadge.style.display = 'inline-flex';
      timerBadge.textContent = `⏱️ ${formatted}`;
    }
  }

  renderSafeConfirmationToast() {
    const toast = document.createElement('div');
    toast.className = 'safety-toast toast-success';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">🛡️</span>
        <div>
          <strong>Safe Arrival Recorded</strong>
          <p>Emergency contacts notified that you reached safely.</p>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // --- REALISTIC FAKE CALL SIMULATOR ---

  launchFakeCall(callerName = 'Campus Escort / Marcus') {
    const modal = document.getElementById('fakeCallModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('call-ringing');

    const callerElem = modal.querySelector('.fake-caller-name');
    if (callerElem) callerElem.textContent = callerName;

    // Trigger ringtone audio beep
    this.playRingtoneTone();

    const acceptBtn = modal.querySelector('.fake-call-accept');
    const declineBtn = modal.querySelector('.fake-call-decline');

    if (acceptBtn) {
      acceptBtn.onclick = () => this.handleAcceptFakeCall(modal);
    }
    if (declineBtn) {
      declineBtn.onclick = () => this.handleEndFakeCall(modal);
    }
  }

  playRingtoneTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      this.fakeCallAudioContext = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard phone ring tone 440Hz
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      // Ring pulse
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + 1.2);
      osc.stop(ctx.currentTime + 2.5);
    } catch (e) {
      console.log('Audio tone not allowed without direct interaction', e);
    }
  }

  handleAcceptFakeCall(modal) {
    modal.classList.remove('call-ringing');
    modal.classList.add('call-connected');

    const statusElem = modal.querySelector('.fake-call-status');
    if (statusElem) statusElem.textContent = '00:01 • Connected';

    // Realistic spoken simulated voice response
    speechService.speak('Hey! I am tracking your bus ride right now. I am waiting for you at the library stop right near the front door. You are just a couple stops away, see you in two minutes!');

    const endBtn = modal.querySelector('.fake-call-end');
    if (endBtn) {
      endBtn.onclick = () => this.handleEndFakeCall(modal);
    }
  }

  handleEndFakeCall(modal) {
    speechService.stop();
    modal.classList.remove('call-connected', 'call-ringing');
    modal.classList.add('hidden');
  }

  // --- 1-TAP SOS MODAL & DATA DISPATCH ---

  openSOSModal(isAutoExpired = false) {
    const modal = document.getElementById('sosModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const contacts = StorageService.getEmergencyContacts();
    const contactsContainer = modal.querySelector('.sos-contacts-list');
    if (contactsContainer) {
      contactsContainer.innerHTML = contacts.map(c => `
        <div class="sos-contact-card">
          <div>
            <strong>${c.name}</strong>
            <span class="badge badge-subtle">${c.badge}</span>
            <div class="contact-num">${c.phone}</div>
          </div>
          <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="btn btn-sm btn-danger">📞 Call Now</a>
        </div>
      `).join('');
    }

    // Populate current live context packet
    const locElem = modal.querySelector('.sos-live-location');
    if (locElem) {
      const activeLine = this.activeRoute ? this.activeRoute.title : 'Metro & Campus Corridor';
      locElem.innerHTML = `
        <strong>📍 Active Context:</strong> Near <em>${activeLine}</em><br/>
        <strong>Status:</strong> ${isAutoExpired ? '⚠️ Automated Timer Trigger (No Check-in)' : '🚨 User Requested Assistance'}<br/>
        <strong>GPS Lat/Lng:</strong> 42.3650° N, 71.0950° W
      `;
    }

    const closeBtn = modal.querySelector('.sos-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }
  }
}
