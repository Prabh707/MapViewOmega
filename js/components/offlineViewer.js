/**
 * AccessRide - Offline Route Information & Pocket Card Viewer
 * Enables riders to store and access step-by-step accessible guides completely without network connection.
 */

import { StorageService } from '../services/storageService.js';
import { speechService } from '../services/speechService.js';

export class OfflineViewer {
  constructor(containerId, onSelectRoute) {
    this.containerId = containerId;
    this.onSelectRoute = onSelectRoute;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const routes = StorageService.getOfflineRoutes();

    if (routes.length === 0) {
      container.innerHTML = `
        <div class="offline-empty-state">
          <div class="empty-icon">📥</div>
          <h3>No Offline Routes Saved Yet</h3>
          <p>When planning a trip, tap <strong>"Save Offline Card"</strong> on any route recommendation to access it anywhere without cell service or WiFi.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="offline-container">
        <div class="offline-header">
          <div>
            <span class="badge badge-emerald">✓ Offline Pocket Storage Ready</span>
            <h2>Saved Accessible Journey Cards</h2>
            <p>These route guides and emergency hotlines are cached locally on your device.</p>
          </div>
          <button class="btn btn-outline btn-sm print-guide-btn" onclick="window.print()">
            🖨️ Print / Save PDF
          </button>
        </div>

        <div class="offline-cards-grid">
          ${routes.map(r => `
            <div class="offline-route-card">
              <div class="offline-card-top">
                <div>
                  <span class="badge badge-subtle">Saved ${new Date(r.savedAt).toLocaleDateString()}</span>
                  <h3 class="offline-card-title">${r.title}</h3>
                </div>
                <div class="offline-badge-score">
                  <span class="score-badge access-score">🦼 ${r.scores.accessibilityScore}% Access</span>
                  <span class="score-badge safety-score">🛡️ ${r.scores.safetyScore}% Safe</span>
                </div>
              </div>

              <div class="offline-metrics-strip">
                <div><strong>Duration:</strong> ${r.totalDurationMin} mins</div>
                <div><strong>Walking:</strong> ${r.walkDistanceMeters}m</div>
                <div><strong>Transfers:</strong> ${r.transfersCount}</div>
              </div>

              <!-- Step-by-Step Pocket Guide -->
              <div class="offline-steps-list">
                <h4>Turn-by-Turn Navigation Steps:</h4>
                <ol>
                  ${r.steps.map(s => `
                    <li>
                      <strong>${s.instruction}</strong>
                      <p>${s.detail}</p>
                      <small class="step-meta">Amenity: ${s.accessibilityBadge || 'Standard'} • ${s.safetyBadge || 'Lit Zone'}</small>
                    </li>
                  `).join('')}
                </ol>
              </div>

              <!-- Emergency Card Strip -->
              <div class="offline-emergency-box">
                <strong>🚨 Offline Emergency Contact:</strong>
                <span>Campus Escort: 1-800-555-SAFE • Transit Police: 1-800-555-TPOL</span>
              </div>

              <div class="offline-card-actions">
                <button class="btn btn-sm btn-primary offline-start-btn" data-route-id="${r.id}">
                  ▶ Start Live Simulation
                </button>
                <button class="btn btn-sm btn-danger-outline delete-offline-btn" data-route-id="${r.id}">
                  🗑️ Delete Saved Card
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners(routes);
  }

  attachEventListeners(routes) {
    document.querySelectorAll('.offline-start-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-route-id');
        const route = routes.find(r => r.id === id);
        if (route && this.onSelectRoute) {
          this.onSelectRoute(route);
        }
      };
    });

    document.querySelectorAll('.delete-offline-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-route-id');
        StorageService.removeOfflineRoute(id);
        speechService.speak('Offline route card removed.');
        this.render();
      };
    });
  }
}
