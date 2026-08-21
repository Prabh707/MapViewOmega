/**
 * AccessRide - Interactive Leaflet Map Controller
 * Renders accessibility-styled stop markers, route polylines, safe corridor night glow, and live fleet positions.
 */

import { TRANSIT_STOPS, TRANSIT_LINES } from '../data/transitData.js';

export class MapController {
  constructor(mapContainerId, onSelectStop) {
    this.mapContainerId = mapContainerId;
    this.onSelectStop = onSelectStop;
    this.map = null;
    this.stopMarkers = {};
    this.routeLayers = [];
    this.vehicleMarker = null;
    this.corridorLayers = [];
    this.userLocationMarker = null;
  }

  initMap() {
    if (this.map) return;

    // Center on the transit network
    this.map = L.map(this.mapContainerId, {
      center: [42.3650, -71.0950],
      zoom: 14,
      zoomControl: false
    });

    // Add clean, accessible map tiles (CartoDB Positron for high legibility)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.renderAllStops();
    this.renderSafeCorridorGlow();
  }

  renderAllStops() {
    Object.values(TRANSIT_STOPS).forEach(stop => {
      const isHighSafe = stop.lightingScore >= 9.0;
      const isFullyAccessible = stop.stepFree && stop.elevatorStatus !== 'broken';
      const isBarrier = stop.elevatorStatus === 'broken' || !stop.stepFree;

      let markerBg = '#10b981'; // green accessible
      let iconSymbol = '🦼';

      if (isBarrier) {
        markerBg = '#ef4444'; // red barrier
        iconSymbol = '⚠️';
      } else if (isHighSafe) {
        markerBg = '#059669'; // emerald safe
        iconSymbol = '🛡️';
      }

      const customIcon = L.divIcon({
        className: 'custom-transit-marker',
        html: `
          <div class="marker-pin" style="background-color: ${markerBg};" title="${stop.name}">
            <span class="marker-icon">${iconSymbol}</span>
            <span class="marker-pulse"></span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(this.map);

      // Station accessibility & safety popup
      const popupContent = `
        <div class="stop-popup-card">
          <div class="popup-header">
            <span class="popup-type">${stop.zone}</span>
            <h4 class="popup-title">${stop.name}</h4>
            <span class="popup-code">${stop.code}</span>
          </div>

          <div class="popup-metrics-grid">
            <div class="metric-pill ${stop.stepFree ? 'pill-safe' : 'pill-warn'}">
              <strong>${stop.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}</strong>
            </div>
            <div class="metric-pill ${stop.lightingScore >= 8.5 ? 'pill-safe' : 'pill-warn'}">
              <strong>💡 ${stop.lightingScore}/10 Light</strong>
            </div>
            <div class="metric-pill ${stop.elevatorStatus === 'operational' ? 'pill-safe' : stop.elevatorStatus === 'broken' ? 'pill-danger' : 'pill-neutral'}">
              <strong>🛗 Elev: ${stop.elevatorStatus}</strong>
            </div>
            <div class="metric-pill pill-neutral">
              <strong>👥 ${stop.crowdLevel.toUpperCase()} crowd</strong>
            </div>
          </div>

          <div class="popup-amenities">
            <small><strong>Amenities:</strong> ${stop.features.join(' • ')}</small>
          </div>

          <div class="popup-actions">
            <button class="btn btn-xs btn-primary set-origin-btn" data-stop-id="${stop.id}">Set as Origin</button>
            <button class="btn btn-xs btn-secondary set-dest-btn" data-stop-id="${stop.id}">Set as Destination</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'accessible-leaflet-popup' });

      marker.on('popupopen', () => {
        const origBtn = document.querySelector(`.set-origin-btn[data-stop-id="${stop.id}"]`);
        const destBtn = document.querySelector(`.set-dest-btn[data-stop-id="${stop.id}"]`);
        if (origBtn) {
          origBtn.onclick = () => {
            if (this.onSelectStop) this.onSelectStop('origin', stop.id);
            this.map.closePopup();
          };
        }
        if (destBtn) {
          destBtn.onclick = () => {
            if (this.onSelectStop) this.onSelectStop('destination', stop.id);
            this.map.closePopup();
          };
        }
      });

      this.stopMarkers[stop.id] = marker;
    });
  }

  renderSafeCorridorGlow() {
    // Draw safe corridor paths (e.g., Campus Safe Shuttle line)
    const shuttle = TRANSIT_LINES.line_safe_shuttle;
    const latLngs = shuttle.stopsSequence.map(id => [TRANSIT_STOPS[id].lat, TRANSIT_STOPS[id].lng]);

    // Translucent glowing emerald corridor buffer
    const glowCorridor = L.polyline(latLngs, {
      color: '#10b981',
      weight: 12,
      opacity: 0.22,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '8, 8'
    }).addTo(this.map);

    this.corridorLayers.push(glowCorridor);
  }

  drawActiveRoute(route) {
    this.clearRouteLayers();

    if (!route || !route.steps) return;

    const allRoutePoints = [];

    route.lineSegments.forEach(segment => {
      const line = segment.line;
      const points = segment.intermediateStops.map(id => [TRANSIT_STOPS[id].lat, TRANSIT_STOPS[id].lng]);
      allRoutePoints.push(...points);

      // Outer glow line
      const outerGlow = L.polyline(points, {
        color: line.color || '#3b82f6',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round'
      }).addTo(this.map);

      // Main crisp route polyline
      const mainPolyline = L.polyline(points, {
        color: line.color || '#3b82f6',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);

      this.routeLayers.push(outerGlow, mainPolyline);
    });

    if (allRoutePoints.length > 0) {
      const bounds = L.latLngBounds(allRoutePoints);
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  clearRouteLayers() {
    this.routeLayers.forEach(layer => this.map.removeLayer(layer));
    this.routeLayers = [];
    if (this.vehicleMarker) {
      this.map.removeLayer(this.vehicleMarker);
      this.vehicleMarker = null;
    }
  }

  updateLiveVehicle(lat, lng, vehicleInfo) {
    if (!this.vehicleMarker) {
      const vehicleIcon = L.divIcon({
        className: 'vehicle-live-marker',
        html: `
          <div class="vehicle-pin pulse-vehicle" title="${vehicleInfo.lineName || 'Transit Bus'}">
            <span>🚍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      this.vehicleMarker = L.marker([lat, lng], { icon: vehicleIcon }).addTo(this.map);
    } else {
      this.vehicleMarker.setLatLng([lat, lng]);
    }
  }

  setUserLocation(lat, lng) {
    if (!this.userLocationMarker) {
      const userIcon = L.divIcon({
        className: 'user-loc-marker',
        html: `
          <div class="user-pulse-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      this.userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map);
    } else {
      this.userLocationMarker.setLatLng([lat, lng]);
    }
  }

  highlightStop(stopId) {
    const marker = this.stopMarkers[stopId];
    if (marker) {
      this.map.panTo(marker.getLatLng(), { animate: true, duration: 0.8 });
      marker.openPopup();
    }
  }
}
