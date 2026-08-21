/**
 * AccessRide - Operator & Campus Transport Safety Dashboard
 * Gives transit managers & campus safety dispatchers real-time visibility into vehicle accessibility capacity,
 * ramp health, crowd densities, and passenger hazard reports.
 */

import { INITIAL_FLEET, TRANSIT_STOPS } from '../data/transitData.js';
import { StorageService } from '../services/storageService.js';
import { speechService } from '../services/speechService.js';

export class OperatorDashboard {
  constructor(containerId, onStateChange) {
    this.containerId = containerId;
    this.onStateChange = onStateChange;
    this.fleet = [...INITIAL_FLEET];
    this.nightOwlMode = true;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const reports = StorageService.getCommunityReports();
    const barrierReports = reports.filter(r => r.type.includes('broken') || r.type.includes('dim') || r.type.includes('hazard'));

    container.innerHTML = `
      <div class="operator-view-wrapper">
        <div class="operator-header-bar">
          <div>
            <span class="badge badge-emerald">● Live Fleet Telemetry Active</span>
            <h2 class="operator-title">Transit Operator & Campus Safety Command</h2>
            <p class="operator-subtitle">Monitor vehicle accessibility capacities, ramp lifts, crowd levels, and passenger incident reports in real time.</p>
          </div>
          <div class="operator-controls">
            <label class="toggle-switch-label">
              <span>🌙 Night Owl Safe Escort Protocol</span>
              <input type="checkbox" id="nightOwlToggle" ${this.nightOwlMode ? 'checked' : ''}/>
            </label>
          </div>
        </div>

        <!-- Key Metrics Summary Row -->
        <div class="operator-stats-grid">
          <div class="stat-card">
            <div class="stat-num">${this.fleet.length}</div>
            <div class="stat-label">Active Fleet Vehicles</div>
            <div class="stat-sub">100% GPS Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-num stat-emerald">6 / 6</div>
            <div class="stat-label">Accessible Wheelchair Bays</div>
            <div class="stat-sub">1 currently reserved</div>
          </div>
          <div class="stat-card">
            <div class="stat-num stat-amber">${barrierReports.length}</div>
            <div class="stat-label">Active Passenger Barrier Reports</div>
            <div class="stat-sub">Requires dispatcher action</div>
          </div>
          <div class="stat-card">
            <div class="stat-num stat-blue">98.4%</div>
            <div class="stat-label">Safe Corridor Lighting Index</div>
            <div class="stat-sub">Campus perimeter</div>
          </div>
        </div>

        <!-- Fleet Vehicles Live Status Table -->
        <div class="operator-section-card">
          <div class="section-header-flex">
            <h3>🚍 Live Fleet Accessibility & Occupancy</h3>
            <span class="table-legend">Green: Ramp OK • Amber: High Load • Red: Lift Issue</span>
          </div>

          <div class="table-responsive">
            <table class="operator-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Route / Line</th>
                  <th>Driver / Officer</th>
                  <th>Crowd Occupancy</th>
                  <th>Wheelchair Bays</th>
                  <th>Ramp Lift Status</th>
                  <th>Next Stop</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.fleet.map(v => `
                  <tr>
                    <td><strong>${v.vehicleId}</strong></td>
                    <td><span class="badge badge-subtle">${v.lineName}</span></td>
                    <td>${v.driver}</td>
                    <td>
                      <div class="occupancy-bar-container">
                        <div class="occupancy-bar ${v.occupancyPct > 75 ? 'bar-high' : v.occupancyPct > 50 ? 'bar-med' : 'bar-low'}" style="width: ${v.occupancyPct}%;"></div>
                        <span class="occupancy-text">${v.occupancyPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${v.wheelchairBaysOccupied > 0 ? 'badge-amber' : 'badge-emerald'}">
                        🦼 ${v.wheelchairBaysOccupied} / ${v.wheelchairBaysTotal} In Use
                      </span>
                    </td>
                    <td>
                      <span class="ramp-status-pill ${v.rampStatus.includes('Operational') ? 'status-ok' : 'status-alert'}">
                        ${v.rampStatus.includes('Operational') ? '✓ ' + v.rampStatus : '⚠️ ' + v.rampStatus}
                      </span>
                    </td>
                    <td>${TRANSIT_STOPS[v.nextStopId] ? TRANSIT_STOPS[v.nextStopId].name : v.nextStopId} (${v.etaNextStopSec}s)</td>
                    <td>
                      <button class="btn btn-xs btn-primary ping-vehicle-btn" data-vid="${v.vehicleId}">
                        📡 Ping Driver
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Real-time Passenger Hazard & Barrier Queue -->
        <div class="operator-section-card">
          <div class="section-header-flex">
            <h3>⚠️ Passenger Accessibility & Hazard Queue</h3>
            <button class="btn btn-xs btn-outline" id="refreshReportsBtn">🔄 Refresh Queue</button>
          </div>

          <div class="dispatch-queue-list">
            ${reports.map(r => `
              <div class="dispatch-item ${r.type.includes('safe') ? 'dispatch-safe' : 'dispatch-alert'}">
                <div class="dispatch-item-info">
                  <div class="dispatch-meta">
                    <span class="badge ${r.type.includes('safe') ? 'badge-emerald' : 'badge-danger'}">${r.category}</span>
                    <span class="dispatch-stop">📍 ${r.stopName}</span>
                    <span class="dispatch-time">${r.timestamp}</span>
                  </div>
                  <h4 class="dispatch-title">${r.title}</h4>
                  <p class="dispatch-desc">${r.details}</p>
                </div>
                <div class="dispatch-actions">
                  ${r.type.includes('broken') ? `
                    <button class="btn btn-xs btn-primary resolve-barrier-btn" data-rep-id="${r.id}" data-stop-id="${r.stopId}">
                      🛠️ Dispatch Maintenance
                    </button>
                  ` : r.type.includes('dim') ? `
                    <button class="btn btn-xs btn-amber dispatch-security-btn" data-rep-id="${r.id}">
                      🔦 Escort Patrol Sent
                    </button>
                  ` : `
                    <button class="btn btn-xs btn-secondary ack-btn" data-rep-id="${r.id}">
                      ✓ Acknowledged
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const nightToggle = document.getElementById('nightOwlToggle');
    if (nightToggle) {
      nightToggle.onchange = (e) => {
        this.nightOwlMode = e.target.checked;
        speechService.announceSafetyAlert(
          this.nightOwlMode ? 'Campus Night Owl Safe Escort protocol is now ACTIVE.' : 'Standard transit dispatch protocol resumed.'
        );
      };
    }

    const refreshBtn = document.getElementById('refreshReportsBtn');
    if (refreshBtn) {
      refreshBtn.onclick = () => this.render();
    }

    // Ping Driver
    document.querySelectorAll('.ping-vehicle-btn').forEach(btn => {
      btn.onclick = () => {
        const vid = btn.getAttribute('data-vid');
        alert(`Dispatched priority accessibility notification to vehicle ${vid}. Priority ramp staging requested.`);
      };
    });

    // Resolve Barrier
    document.querySelectorAll('.resolve-barrier-btn').forEach(btn => {
      btn.onclick = () => {
        const repId = btn.getAttribute('data-rep-id');
        const stopId = btn.getAttribute('data-stop-id');
        this.resolveBarrier(repId, stopId);
      };
    });

    // Dispatch Security
    document.querySelectorAll('.dispatch-security-btn').forEach(btn => {
      btn.onclick = () => {
        const repId = btn.getAttribute('data-rep-id');
        alert(`Campus safety escort team assigned to location for report #${repId}.`);
      };
    });
  }

  resolveBarrier(reportId, stopId) {
    const reports = StorageService.getCommunityReports();
    const updated = reports.filter(r => r.id !== reportId);
    StorageService.saveCommunityReports(updated);

    // If stop elevator was broken, restore it
    if (TRANSIT_STOPS[stopId] && TRANSIT_STOPS[stopId].elevatorStatus === 'broken') {
      TRANSIT_STOPS[stopId].elevatorStatus = 'operational';
    }

    speechService.speak('Barrier repair dispatched and resolved. Transit accessibility scores updated.');
    this.render();

    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
