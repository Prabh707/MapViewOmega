/**
 * AccessRide - Main Application Controller
 * Coordinates Map, Routing Engine, Accessibility Profiles, Live Simulator, Safety Hub, and Operator Command.
 */

import { ACCESSIBILITY_PROFILES, TRANSIT_STOPS, TRANSIT_LINES } from './data/transitData.js';
import { RoutingEngine } from './services/routingEngine.js';
import { speechService } from './services/speechService.js';
import { StorageService } from './services/storageService.js';
import { MapController } from './components/mapController.js';
import { SafetyHub } from './components/safetyHub.js';
import { CommunityReporter } from './components/communityReporter.js';
import { OperatorDashboard } from './components/operatorDashboard.js';
import { OfflineViewer } from './components/offlineViewer.js';

class AccessRideApp {
  constructor() {
    this.currentTab = 'planner';
    this.userProfile = StorageService.getProfile();
    this.settings = StorageService.getSettings();
    this.activeRoute = null;
    this.currentStepIndex = 0;
    this.simulationInterval = null;

    // Initialize Services
    this.routingEngine = new RoutingEngine(StorageService.getCommunityReports());
    
    // Components
    this.mapController = new MapController('mapView', (action, stopId) => {
      this.handleMapStopSelect(action, stopId);
    });

    this.safetyHub = new SafetyHub(document.getElementById('safetyHubContainer'), () => {
      this.handleEmergencyTrigger();
    });

    this.communityReporter = new CommunityReporter((updatedReports) => {
      this.handleReportSubmitted(updatedReports);
    });

    this.operatorDashboard = new OperatorDashboard('operatorContainer', () => {
      this.refreshActiveCalculations();
    });

    this.offlineViewer = new OfflineViewer('offlineContainer', (route) => {
      this.startActiveJourney(route);
    });
  }

  init() {
    // 1. Setup Theme & Accessibility Settings
    this.applySettings();

    // 2. Initialize Leaflet Map
    this.mapController.initMap();

    // 3. Populate Form Elements
    this.renderProfileSelectors();
    this.populateStopSelects();

    // 4. Setup Navigation & Action Listeners
    this.attachEventListeners();

    // 5. Initial Demo Route Calculation
    const defaultOrigin = 'stop_lib';
    const defaultDest = 'stop_metro';
    document.getElementById('originSelect').value = defaultOrigin;
    document.getElementById('destSelect').value = defaultDest;
    this.calculateRoutes(defaultOrigin, defaultDest);

    // 6. Render Initial Community Feed
    this.communityReporter.renderCommunityFeed('communityFeedContainer');
  }

  applySettings() {
    if (this.settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    speechService.setEnabled(this.settings.voiceEnabled);

    const hcToggle = document.getElementById('highContrastToggle');
    if (hcToggle) hcToggle.checked = this.settings.highContrast;

    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) voiceToggle.checked = this.settings.voiceEnabled;
  }

  renderProfileSelectors() {
    const container = document.getElementById('profileSelectorGroup');
    if (!container) return;

    container.innerHTML = Object.values(ACCESSIBILITY_PROFILES).map(p => `
      <button class="profile-chip ${p.id === this.userProfile.profileId ? 'active' : ''}" data-profile-id="${p.id}" title="${p.description}">
        <span class="chip-icon">${p.icon}</span>
        <span class="chip-name">${p.name}</span>
      </button>
    `).join('');

    this.updateProfileDescription(this.userProfile.profileId);

    container.querySelectorAll('.profile-chip').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-profile-id');
        this.setProfile(id);
      };
    });
  }

  setProfile(profileId) {
    this.userProfile.profileId = profileId;
    StorageService.saveProfile(this.userProfile);

    document.querySelectorAll('.profile-chip').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-profile-id') === profileId);
    });

    this.updateProfileDescription(profileId);

    const profile = ACCESSIBILITY_PROFILES[profileId];
    speechService.speak(`Accessibility profile updated to ${profile.name}. Recalculating safest routes.`);

    // Recalculate routes with new profile priority
    const origin = document.getElementById('originSelect').value;
    const dest = document.getElementById('destSelect').value;
    if (origin && dest && origin !== dest) {
      this.calculateRoutes(origin, dest);
    }
  }

  updateProfileDescription(profileId) {
    const descElem = document.getElementById('profileDescription');
    const profile = ACCESSIBILITY_PROFILES[profileId];
    if (descElem && profile) {
      descElem.innerHTML = `
        <strong>${profile.name} Priority:</strong> ${profile.description}
      `;
    }
  }

  populateStopSelects() {
    const originSelect = document.getElementById('originSelect');
    const destSelect = document.getElementById('destSelect');

    const optionsHtml = `
      <option value="">Choose Location</option>
      ${Object.values(TRANSIT_STOPS).map(s => `
        <option value="${s.id}">${s.name} (${s.code}) - ${s.zone}</option>
      `).join('')}
    `;

    if (originSelect) originSelect.innerHTML = optionsHtml;
    if (destSelect) destSelect.innerHTML = optionsHtml;
  }

  handleMapStopSelect(action, stopId) {
    if (action === 'origin') {
      document.getElementById('originSelect').value = stopId;
    } else if (action === 'destination') {
      document.getElementById('destSelect').value = stopId;
    }

    const origin = document.getElementById('originSelect').value;
    const dest = document.getElementById('destSelect').value;
    if (origin && dest && origin !== dest) {
      this.calculateRoutes(origin, dest);
    }
  }

  calculateRoutes(originId, destId) {
    if (!originId || !destId || originId === destId) {
      alert('Please select two distinct locations.');
      return;
    }

    const routes = this.routingEngine.findRoutes(originId, destId, this.userProfile.profileId);
    this.renderRouteResults(routes);

    if (routes.length > 0) {
      this.mapController.drawActiveRoute(routes[0]);
    }
  }

  renderRouteResults(routes) {
    const container = document.getElementById('routeResultsList');
    if (!container) return;

    if (routes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No transit routes found between these locations matching your current criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = routes.map((r, idx) => `
      <div class="route-card ${idx === 0 ? 'card-recommended' : ''}" data-route-id="${r.id}">
        ${r.badge ? `
          <div class="route-badge badge-${r.badge.type}">
            ${r.badge.text}
          </div>
        ` : ''}

        <div class="route-card-header">
          <div>
            <h3 class="route-title">${r.title}</h3>
            <div class="route-quick-metrics">
              <span>⏱️ <strong>${r.totalDurationMin} min</strong></span>
              <span>🚶 <strong>${r.walkDistanceMeters}m walk</strong></span>
              <span>🔄 <strong>${r.transfersCount === 0 ? 'Direct (0 transfers)' : r.transfersCount + ' transfer'}</strong></span>
            </div>
          </div>

          <div class="match-score-circle" title="Personalized Compatibility Score">
            <span class="score-val">${r.scores.matchScore}%</span>
            <span class="score-label">MATCH</span>
          </div>
        </div>

        <!-- Multi-Factor Accessible Breakdown -->
        <div class="scores-meter-grid">
          <div class="meter-col">
            <div class="meter-label-flex">
              <span>🦼 Accessibility Score</span>
              <strong>${r.scores.accessibilityScore}%</strong>
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill fill-access" style="width: ${r.scores.accessibilityScore}%;"></div>
            </div>
          </div>

          <div class="meter-col">
            <div class="meter-label-flex">
              <span>🛡️ Safety Rating</span>
              <strong>${r.scores.safetyScore}%</strong>
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill fill-safety" style="width: ${r.scores.safetyScore}%;"></div>
            </div>
          </div>
        </div>

        <!-- Tags Strip -->
        <div class="tags-strip">
          ${r.tags.map(t => `<span class="tag-pill tag-${t.type}">${t.label}</span>`).join('')}
        </div>

        ${r.warnings.length > 0 ? `
          <div class="warnings-box">
            ${r.warnings.map(w => `<small>⚠️ ${w}</small>`).join('<br/>')}
          </div>
        ` : ''}

        <div class="route-card-actions">
          <button class="btn btn-sm btn-primary start-journey-btn" data-route-id="${r.id}">
            ▶ Start Guided Journey
          </button>
          <button class="btn btn-sm btn-outline preview-route-btn" data-route-id="${r.id}">
            🗺️ Preview on Map
          </button>
          <button class="btn btn-sm btn-subtle save-offline-btn" data-route-id="${r.id}" title="Save to device for offline access">
            📥 Save Offline
          </button>
        </div>
      </div>
    `).join('');

    // Attach Action Listeners
    container.querySelectorAll('.start-journey-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-route-id');
        const route = routes.find(x => x.id === id);
        if (route) this.startActiveJourney(route);
      };
    });

    container.querySelectorAll('.preview-route-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-route-id');
        const route = routes.find(x => x.id === id);
        if (route) this.mapController.drawActiveRoute(route);
      };
    });

    container.querySelectorAll('.save-offline-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-route-id');
        const route = routes.find(x => x.id === id);
        if (route) {
          StorageService.saveOfflineRoute(route);
          speechService.speak('Route pocket guide saved for offline access.');
          btn.innerHTML = '✓ Saved Offline';
          btn.classList.add('btn-emerald');
        }
      };
    });
  }

  startActiveJourney(route) {
    this.activeRoute = route;
    this.currentStepIndex = 0;
    this.safetyHub.setActiveRoute(route);

    // Switch to active journey tab
    this.switchTab('active_journey');

    // Draw route on map
    this.mapController.drawActiveRoute(route);

    // Start automated 15-minute safety check-in timer
    this.safetyHub.startCheckinTimer(15);

    // Announce departure
    speechService.announceStop(
      route.steps[0].instruction,
      'Safe route activated with real-time accessibility tracking and emergency check-in timer.'
    );

    this.renderActiveJourneyView();
    this.startVehicleSimulation();
  }

  renderActiveJourneyView() {
    const container = document.getElementById('activeJourneyContainer');
    if (!container || !this.activeRoute) return;

    const route = this.activeRoute;
    const currentStep = route.steps[this.currentStepIndex] || route.steps[0];

    container.innerHTML = `
      <div class="active-journey-card">
        <div class="journey-header-banner">
          <div>
            <span class="badge badge-emerald pulse-badge">● LIVE JOURNEY ACTIVE</span>
            <h2 class="journey-title">${route.title}</h2>
          </div>
          <div class="journey-top-actions">
            <button class="btn btn-sm btn-danger" id="journeySosBtn">🚨 SOS Emergency</button>
            <button class="btn btn-sm btn-outline" id="journeyReportBtn">⚠️ Report Hazard</button>
          </div>
        </div>

        <!-- Current Step Hero Banner -->
        <div class="current-step-hero">
          <div class="step-num-badge">Step ${this.currentStepIndex + 1} of ${route.steps.length}</div>
          <h3 class="current-instruction">${currentStep.instruction}</h3>
          <p class="current-detail">${currentStep.detail}</p>
          <div class="step-amenities-row">
            <span class="badge badge-subtle">🦼 ${currentStep.accessibilityBadge || 'Step-Free'}</span>
            <span class="badge badge-subtle">💡 Lighting: ${currentStep.lightingScore ? currentStep.lightingScore + '/10' : 'Safe Area'}</span>
            <span class="badge badge-subtle">🛡️ ${currentStep.safetyBadge || 'Safe Corridor'}</span>
          </div>

          <div class="step-audio-controls">
            <button class="btn btn-sm btn-primary" id="repeatVoiceBtn">
              🔊 Repeat Voice Guidance
            </button>
            <button class="btn btn-sm btn-secondary" id="nextStepBtn">
              ✓ Mark Step Complete ➔
            </button>
          </div>
        </div>

        <!-- Simulation Progress Tracker -->
        <div class="journey-progress-section">
          <div class="progress-labels">
            <span>Progress along route</span>
            <span id="simProgressPct">0%</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" id="simProgressBar" style="width: 5%;"></div>
          </div>
        </div>

        <!-- Turn-by-Turn Steps Accordion -->
        <div class="steps-timeline">
          <h4>Full Route Turn-by-Turn Guidance</h4>
          <div class="timeline-list">
            ${route.steps.map((s, idx) => `
              <div class="timeline-step ${idx === this.currentStepIndex ? 'timeline-active' : idx < this.currentStepIndex ? 'timeline-done' : ''}">
                <div class="timeline-marker">${idx < this.currentStepIndex ? '✓' : idx + 1}</div>
                <div class="timeline-content">
                  <strong>${s.instruction}</strong>
                  <p>${s.detail}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Safe Completion Card -->
        <div class="journey-finish-card">
          <button class="btn btn-lg btn-emerald-solid w-100" id="arriveSafelyBtn">
            🛡️ I Have Arrived Safely (End Journey & Stop Timer)
          </button>
        </div>
      </div>
    `;

    // Attach Journey Events
    const repeatBtn = document.getElementById('repeatVoiceBtn');
    if (repeatBtn) {
      repeatBtn.onclick = () => {
        speechService.announceStop(currentStep.instruction, currentStep.detail);
      };
    }

    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
      nextStepBtn.onclick = () => this.advanceStep();
    }

    const arriveBtn = document.getElementById('arriveSafelyBtn');
    if (arriveBtn) {
      arriveBtn.onclick = () => this.completeJourney();
    }

    const sosBtn = document.getElementById('journeySosBtn');
    if (sosBtn) {
      sosBtn.onclick = () => this.safetyHub.openSOSModal();
    }

    const repBtn = document.getElementById('journeyReportBtn');
    if (repBtn) {
      repBtn.onclick = () => this.communityReporter.openReportModal();
    }
  }

  advanceStep() {
    if (!this.activeRoute) return;
    if (this.currentStepIndex < this.activeRoute.steps.length - 1) {
      this.currentStepIndex++;
      const nextStep = this.activeRoute.steps[this.currentStepIndex];
      speechService.announceStop(nextStep.instruction, nextStep.detail);
      this.renderActiveJourneyView();
    } else {
      this.completeJourney();
    }
  }

  completeJourney() {
    this.stopVehicleSimulation();
    this.safetyHub.confirmSafeArrival();
    alert('🎉 Journey successfully completed! Safe arrival recorded.');
    this.activeRoute = null;
    this.switchTab('planner');
  }

  startVehicleSimulation() {
    this.stopVehicleSimulation();
    if (!this.activeRoute) return;

    let progress = 0;
    const steps = this.activeRoute.steps;

    this.simulationInterval = setInterval(() => {
      progress += 4;
      if (progress > 100) progress = 100;

      const bar = document.getElementById('simProgressBar');
      const pct = document.getElementById('simProgressPct');
      if (bar) bar.style.width = `${progress}%`;
      if (pct) pct.textContent = `${progress}%`;

      // Interpolate position
      const stepIdx = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));
      const currentStep = steps[stepIdx];
      if (currentStep.lat && currentStep.lng) {
        this.mapController.updateLiveVehicle(currentStep.lat, currentStep.lng, {
          lineName: this.activeRoute.title
        });
      }

      if (progress >= 100) {
        this.stopVehicleSimulation();
      }
    }, 1500);
  }

  stopVehicleSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-content-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabId}`);
    });

    // Lazy load specific tab content
    if (tabId === 'operator') {
      this.operatorDashboard.render();
    } else if (tabId === 'offline') {
      this.offlineViewer.render();
    } else if (tabId === 'community') {
      this.communityReporter.renderCommunityFeed('communityFeedContainer');
    }

    // Refresh map size when planner or active journey is shown
    if (tabId === 'planner' || tabId === 'active_journey') {
      setTimeout(() => {
        if (this.mapController.map) {
          this.mapController.map.invalidateSize();
        }
      }, 200);
    }
  }

  handleReportSubmitted(updatedReports) {
    this.routingEngine.setReports(updatedReports);
    this.communityReporter.renderCommunityFeed('communityFeedContainer');
    this.refreshActiveCalculations();
  }

  refreshActiveCalculations() {
    const origin = document.getElementById('originSelect')?.value;
    const dest = document.getElementById('destSelect')?.value;
    if (origin && dest && origin !== dest) {
      this.calculateRoutes(origin, dest);
    }
  }

  attachEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      };
    });

    // Search Route Trigger
    const findBtn = document.getElementById('findRoutesBtn');
    if (findBtn) {
      findBtn.onclick = () => {
        const origin = document.getElementById('originSelect').value;
        const dest = document.getElementById('destSelect').value;
        this.calculateRoutes(origin, dest);
      };
    }

    // Swap Origin/Dest
    const swapBtn = document.getElementById('swapLocationsBtn');
    if (swapBtn) {
      swapBtn.onclick = () => {
        const o = document.getElementById('originSelect');
        const d = document.getElementById('destSelect');
        const temp = o.value;
        o.value = d.value;
        d.value = temp;
        if (o.value && d.value) this.calculateRoutes(o.value, d.value);
      };
    }

    // Quick preset buttons
    document.querySelectorAll('.quick-preset-chip').forEach(chip => {
      chip.onclick = () => {
        const orig = chip.getAttribute('data-origin');
        const dest = chip.getAttribute('data-dest');
        document.getElementById('originSelect').value = orig;
        document.getElementById('destSelect').value = dest;
        this.calculateRoutes(orig, dest);
      };
    });

    // High-Contrast Toggle
    const hcToggle = document.getElementById('highContrastToggle');
    if (hcToggle) {
      hcToggle.onchange = (e) => {
        this.settings.highContrast = e.target.checked;
        StorageService.saveSettings(this.settings);
        this.applySettings();
        speechService.speak(this.settings.highContrast ? 'WCAG AAA High-Contrast Mode Enabled' : 'Standard Contrast Mode');
      };
    }

    // Voice Guidance Toggle
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
      voiceToggle.onchange = (e) => {
        this.settings.voiceEnabled = e.target.checked;
        StorageService.saveSettings(this.settings);
        this.applySettings();
      };
    }

    // Header SOS Button
    const headerSos = document.getElementById('headerSosBtn');
    if (headerSos) {
      headerSos.onclick = () => this.safetyHub.openSOSModal();
    }

    // Header Fake Call Button
    const headerFakeCall = document.getElementById('headerFakeCallBtn');
    if (headerFakeCall) {
      headerFakeCall.onclick = () => this.safetyHub.launchFakeCall();
    }

    // Header Report Button
    const headerReport = document.getElementById('headerReportBtn');
    if (headerReport) {
      headerReport.onclick = () => this.communityReporter.openReportModal();
    }

    // Safety Hub Timer Controls
    const start15Btn = document.getElementById('start15MinTimerBtn');
    if (start15Btn) {
      start15Btn.onclick = () => this.safetyHub.startCheckinTimer(15);
    }
    const snoozeBtn = document.getElementById('snoozeTimerBtn');
    if (snoozeBtn) {
      snoozeBtn.onclick = () => this.safetyHub.snoozeTimer(5);
    }
    const confirmSafeBtn = document.getElementById('confirmSafeArrivalBtn');
    if (confirmSafeBtn) {
      confirmSafeBtn.onclick = () => this.safetyHub.confirmSafeArrival();
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AccessRideApp();
  window.app.init();
});
