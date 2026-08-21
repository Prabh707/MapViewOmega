/**
 * AccessRide - Community Barrier & Crowd Pulse Reporting Component
 * Allows passengers to report broken ramps, dark stops, crowding, or safety commendations in 1 tap.
 */

import { TRANSIT_STOPS, TRANSIT_LINES } from '../data/transitData.js';
import { StorageService } from '../services/storageService.js';
import { speechService } from '../services/speechService.js';

export class CommunityReporter {
  constructor(onReportSubmitted) {
    this.onReportSubmitted = onReportSubmitted;
  }

  openReportModal(preselectedStopId = null) {
    const modal = document.getElementById('reportModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    // Populate stop dropdown
    const stopSelect = document.getElementById('reportStopSelect');
    if (stopSelect) {
      stopSelect.innerHTML = `
        <option value="">Select Stop / Station</option>
        ${Object.values(TRANSIT_STOPS).map(s => `
          <option value="${s.id}" ${preselectedStopId === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>
        `).join('')}
      `;
    }

    const form = document.getElementById('communityReportForm');
    if (form) {
      form.onsubmit = (e) => this.handleSubmitReport(e, modal);
    }

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }
  }

  handleSubmitReport(e, modal) {
    e.preventDefault();

    const stopSelect = document.getElementById('reportStopSelect');
    const typeInput = document.querySelector('input[name="reportType"]:checked');
    const detailsInput = document.getElementById('reportDetails');

    if (!stopSelect.value || !typeInput) {
      alert('Please select a stop and an issue type.');
      return;
    }

    const stop = TRANSIT_STOPS[stopSelect.value];
    const typeValue = typeInput.value;

    let category = 'Accessibility';
    let title = 'Accessibility Barrier Reported';
    let impact = 'Accessibility Score Updated';

    if (typeValue === 'broken_elevator') {
      title = `Broken Elevator at ${stop.name}`;
      category = 'Accessibility Barrier';
      impact = 'Elevator status set to Inaccessible';
    } else if (typeValue === 'broken_ramp') {
      title = `Vehicle Ramp Lift Inoperative`;
      category = 'Accessibility Barrier';
      impact = 'Step-free access flagged';
    } else if (typeValue === 'dim_lighting') {
      title = `Dim / Out-of-Order Lighting`;
      category = 'Safety Issue';
      impact = 'Safety score reduced by 15%';
    } else if (typeValue === 'crowded') {
      title = `High Vehicle Crowding (Low Seating)`;
      category = 'Crowding';
      impact = 'Crowd level set to High';
    } else if (typeValue === 'delay') {
      title = `Transit Delay Reported`;
      category = 'Transit Delay';
      impact = 'Estimated wait increased by 6 min';
    } else if (typeValue === 'safe_verified') {
      title = `Safe Corridor & Active Security Verified`;
      category = 'Safety Commendation';
      impact = 'Safety score boosted';
    }

    const newReport = {
      stopId: stop.id,
      stopName: stop.name,
      type: typeValue,
      category,
      title,
      details: detailsInput.value.trim() || 'Passenger field observation reported via AccessRide.',
      impact
    };

    const updatedReports = StorageService.addCommunityReport(newReport);
    modal.classList.add('hidden');
    formReset();

    speechService.speak('Thank you for reporting. Community route safety scores have been dynamically updated.');

    if (this.onReportSubmitted) {
      this.onReportSubmitted(updatedReports);
    }

    function formReset() {
      if (detailsInput) detailsInput.value = '';
    }
  }

  renderCommunityFeed(containerId, onUpvote) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const reports = StorageService.getCommunityReports();

    if (reports.length === 0) {
      container.innerHTML = `<div class="empty-state">No active community alerts. Transit network reporting all clear.</div>`;
      return;
    }

    container.innerHTML = reports.map(r => `
      <div class="report-card ${r.type.includes('safe') ? 'report-safe' : r.type.includes('broken') ? 'report-barrier' : 'report-warning'}">
        <div class="report-card-top">
          <span class="report-tag ${r.type.includes('safe') ? 'tag-safe' : 'tag-alert'}">${r.category}</span>
          <span class="report-time">⏱️ ${r.timestamp}</span>
        </div>
        <h4 class="report-title">${r.title}</h4>
        <p class="report-desc">${r.details}</p>
        <div class="report-card-footer">
          <span class="report-impact"><strong>Impact:</strong> ${r.impact}</span>
          <button class="btn btn-xs btn-outline upvote-btn" data-report-id="${r.id}">
            👍 Helpful (${r.upvotes})
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.upvote-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-report-id');
        const report = reports.find(x => x.id === id);
        if (report) {
          report.upvotes++;
          StorageService.saveCommunityReports(reports);
          this.renderCommunityFeed(containerId, onUpvote);
        }
      };
    });
  }
}
