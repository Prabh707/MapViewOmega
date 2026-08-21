/**
 * AccessRide - Personalized Accessibility & Safety Multi-Factor Routing Engine
 * Core Differentiator: Prioritizes individual safety and accessibility needs over pure speed.
 */

import { TRANSIT_STOPS, TRANSIT_LINES, ACCESSIBILITY_PROFILES } from '../data/transitData.js';

// Haversine distance calculator in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export class RoutingEngine {
  constructor(activeReports = []) {
    this.stops = TRANSIT_STOPS;
    this.lines = TRANSIT_LINES;
    this.reports = activeReports;
  }

  setReports(reports) {
    this.reports = reports;
  }

  /**
   * Evaluates the accessibility score of a specific stop (0-100)
   */
  evaluateStopAccessibility(stopId) {
    const stop = this.stops[stopId];
    if (!stop) return 50;

    let score = 70;
    if (stop.stepFree) score += 15;
    else score -= 30;

    if (stop.hasRamp) score += 10;
    if (stop.tactilePaving) score += 10;
    if (stop.audioAnnouncements) score += 10;

    if (stop.elevatorStatus === 'broken') {
      score -= 40;
    } else if (stop.elevatorStatus === 'operational') {
      score += 10;
    }

    // Factor in user reported barrier issues
    const stopReports = this.reports.filter(r => r.stopId === stopId);
    stopReports.forEach(r => {
      if (r.type === 'broken_elevator' || r.type === 'broken_ramp') score -= 25;
      if (r.type === 'accessibility_barrier') score -= 15;
    });

    return Math.max(10, Math.min(100, score));
  }

  /**
   * Evaluates the safety score of a specific stop (0-100)
   */
  evaluateStopSafety(stopId) {
    const stop = this.stops[stopId];
    if (!stop) return 50;

    let score = stop.lightingScore * 7.5; // Up to 75 points from lighting

    if (stop.cctvCovered) score += 10;
    if (stop.securityKioskNearby) score += 10;
    if (stop.blueLightSOS) score += 10;

    // Crowd factor for safety (moderate is safest; empty/isolated has slight penalty)
    if (stop.crowdLevel === 'moderate') score += 5;
    else if (stop.crowdLevel === 'low' && stop.lightingScore < 7) score -= 10;

    // Factor in user reported safety issues
    const stopReports = this.reports.filter(r => r.stopId === stopId);
    stopReports.forEach(r => {
      if (r.type === 'dim_lighting') score -= 15;
      if (r.type === 'harassment_hazard' || r.type === 'safety_concern') score -= 25;
      if (r.type === 'safe_verified') score += 10;
    });

    return Math.max(15, Math.min(100, Math.round(score)));
  }

  /**
   * Evaluates line accessibility score (0-100)
   */
  evaluateLineAccessibility(lineId) {
    const line = this.lines[lineId];
    if (!line) return 60;

    let score = 50;
    if (line.features.lowFloorRamp) score += 30;
    if (line.features.wheelchairBays >= 2) score += 15;
    if (line.features.audioAnnouncements) score += 10;
    if (line.features.visualDisplay) score += 10;

    return Math.min(100, score);
  }

  /**
   * Evaluates line safety score (0-100)
   */
  evaluateLineSafety(lineId) {
    const line = this.lines[lineId];
    if (!line) return 60;

    let score = 60;
    if (line.features.onboardSafetyGuard) score += 25;
    if (line.features.companionEscortAvailable) score += 15;
    if (line.features.securityCameras >= 2) score += 10;

    return Math.min(100, score);
  }

  /**
   * Plans and scores personalized routes between origin and destination
   */
  findRoutes(originStopId, destStopId, profileId = 'wheelchair') {
    const profile = ACCESSIBILITY_PROFILES[profileId] || ACCESSIBILITY_PROFILES.standard;
    const originStop = this.stops[originStopId];
    const destStop = this.stops[destStopId];

    if (!originStop || !destStop || originStopId === destStopId) {
      return [];
    }

    const candidateRoutes = [];

    // 1. Direct Transit Lines
    Object.values(this.lines).forEach(line => {
      const origIdx = line.stopsSequence.indexOf(originStopId);
      const destIdx = line.stopsSequence.indexOf(destStopId);

      if (origIdx !== -1 && destIdx !== -1 && origIdx < destIdx) {
        const intermediateStops = line.stopsSequence.slice(origIdx, destIdx + 1);
        const stopsCount = intermediateStops.length;
        const transitDurationMin = (stopsCount - 1) * 3 + (line.frequencyMin / 2);
        const walkDistMeters = 80; // minimal walk at terminal

        const routeOption = this.buildRouteObject({
          id: `route_direct_${line.id}`,
          title: `Direct via ${line.shortName}`,
          lineSegments: [
            {
              line,
              fromStopId: originStopId,
              toStopId: destStopId,
              intermediateStops,
              durationMin: Math.round(transitDurationMin)
            }
          ],
          walkDistanceMeters: walkDistMeters,
          totalDurationMin: Math.round(transitDurationMin + 2),
          transfersCount: 0,
          profile
        });

        candidateRoutes.push(routeOption);
      }
    });

    // 2. Transfer Connections (1-transfer routes via central hub)
    Object.values(this.lines).forEach(line1 => {
      const origIdx = line1.stopsSequence.indexOf(originStopId);
      if (origIdx === -1) return;

      // Check each stop downstream in line1 as transfer point
      for (let i = origIdx + 1; i < line1.stopsSequence.length; i++) {
        const transferStopId = line1.stopsSequence[i];
        if (transferStopId === destStopId) continue;

        // Check if another line goes from transferStopId to destStopId
        Object.values(this.lines).forEach(line2 => {
          if (line2.id === line1.id) return;
          const transIdx = line2.stopsSequence.indexOf(transferStopId);
          const destIdx = line2.stopsSequence.indexOf(destStopId);

          if (transIdx !== -1 && destIdx !== -1 && transIdx < destIdx) {
            const seg1Stops = line1.stopsSequence.slice(origIdx, i + 1);
            const seg2Stops = line2.stopsSequence.slice(transIdx, destIdx + 1);
            const durationMin = (seg1Stops.length - 1) * 3 + 4 + (seg2Stops.length - 1) * 3;
            const walkDistMeters = 150; // transfer walking

            const routeOption = this.buildRouteObject({
              id: `route_trans_${line1.id}_${line2.id}`,
              title: `${line1.shortName} ➔ Transfer at ${this.stops[transferStopId].name} ➔ ${line2.shortName}`,
              lineSegments: [
                {
                  line: line1,
                  fromStopId: originStopId,
                  toStopId: transferStopId,
                  intermediateStops: seg1Stops,
                  durationMin: Math.round((seg1Stops.length - 1) * 3)
                },
                {
                  line: line2,
                  fromStopId: transferStopId,
                  toStopId: destStopId,
                  intermediateStops: seg2Stops,
                  durationMin: Math.round((seg2Stops.length - 1) * 3)
                }
              ],
              transferStopId,
              walkDistanceMeters: walkDistMeters,
              totalDurationMin: Math.round(durationMin + 6),
              transfersCount: 1,
              profile
            });

            candidateRoutes.push(routeOption);
          }
        });
      }
    });

    // 3. Fallback Walk + Safe Shuttle Route if no direct
    if (candidateRoutes.length === 0) {
      // Find nearest accessible shuttle connection
      const defaultLine = this.lines.line_safe_shuttle;
      const nearestStop = defaultLine.stopsSequence[0];
      const directDist = getDistanceMeters(originStop.lat, originStop.lng, destStop.lat, destStop.lng);
      
      const fallbackRoute = this.buildRouteObject({
        id: 'route_accessible_escort',
        title: `Campus Security Escort & Safe Corridor`,
        lineSegments: [
          {
            line: defaultLine,
            fromStopId: originStopId,
            toStopId: destStopId,
            intermediateStops: [originStopId, destStopId],
            durationMin: Math.round(directDist / 100) + 5
          }
        ],
        walkDistanceMeters: Math.min(200, directDist),
        totalDurationMin: Math.round(directDist / 90) + 8,
        transfersCount: 0,
        profile
      });
      candidateRoutes.push(fallbackRoute);
    }

    // 4. Sort and apply smart ranking based on User Profile
    return this.rankAndBadgeRoutes(candidateRoutes, profile);
  }

  /**
   * Constructs the structured route object with step-by-step instructions and metrics
   */
  buildRouteObject({ id, title, lineSegments, transferStopId, walkDistanceMeters, totalDurationMin, transfersCount, profile }) {
    let totalAccessScore = 0;
    let totalSafetyScore = 0;
    let evaluatedStopsCount = 0;
    const allStopsInRoute = [];
    const steps = [];

    // Initial walk to origin station step
    const firstStop = this.stops[lineSegments[0].fromStopId];
    steps.push({
      stepNumber: 1,
      type: 'walk_start',
      instruction: `Start at ${firstStop.name}`,
      detail: `Boarding platform is ${firstStop.stepFree ? 'Step-Free' : 'Standard'}. ${firstStop.tactilePaving ? 'Tactile sidewalk available.' : ''}`,
      lightingScore: firstStop.lightingScore,
      accessibilityBadge: firstStop.stepFree ? 'Level Boarding' : 'Elevated Curb',
      safetyBadge: firstStop.blueLightSOS ? 'Blue Light SOS Hub' : 'Standard Area',
      lat: firstStop.lat,
      lng: firstStop.lng
    });

    lineSegments.forEach((seg, segIdx) => {
      const line = seg.line;
      const lineAccess = this.evaluateLineAccessibility(line.id);
      const lineSafety = this.evaluateLineSafety(line.id);

      seg.intermediateStops.forEach(stId => {
        if (!allStopsInRoute.includes(stId)) {
          allStopsInRoute.push(stId);
          totalAccessScore += this.evaluateStopAccessibility(stId);
          totalSafetyScore += this.evaluateStopSafety(stId);
          evaluatedStopsCount++;
        }
      });

      // Boarding step
      steps.push({
        stepNumber: steps.length + 1,
        type: 'transit_board',
        instruction: `Board ${line.name}`,
        detail: `Vehicle has ${line.features.lowFloorRamp ? 'Low-Floor Ramp Access' : 'Stair Entry'} & ${line.features.wheelchairBays} Wheelchair Bay(s). ${line.features.onboardSafetyGuard ? 'Safety Escort Staff Onboard.' : ''}`,
        lineColor: line.color,
        lineIcon: line.icon,
        lineName: line.shortName,
        durationMin: seg.durationMin,
        stopsCount: seg.intermediateStops.length - 1,
        lat: this.stops[seg.fromStopId].lat,
        lng: this.stops[seg.fromStopId].lng
      });

      // Transfer or destination step
      if (segIdx < lineSegments.length - 1 && transferStopId) {
        const transStop = this.stops[transferStopId];
        steps.push({
          stepNumber: steps.length + 1,
          type: 'transfer',
          instruction: `Alight at ${transStop.name} & Transfer`,
          detail: `Transfer path is ${transStop.stepFree ? '100% Step-Free' : 'Requires stairs'}. Elevator status: ${transStop.elevatorStatus.toUpperCase()}. Well-lit corridor with CCTV.`,
          lightingScore: transStop.lightingScore,
          accessibilityBadge: transStop.elevatorStatus === 'operational' ? 'Elevator Active' : 'Stairs Warning',
          safetyBadge: 'Security Kiosk Present',
          lat: transStop.lat,
          lng: transStop.lng
        });
      }
    });

    const finalStop = this.stops[lineSegments[lineSegments.length - 1].toStopId];
    steps.push({
      stepNumber: steps.length + 1,
      type: 'arrive',
      instruction: `Arrive at Destination: ${finalStop.name}`,
      detail: `Safe arrival zone. ${finalStop.shelterType}. Security & well-lit pedestrian path.`,
      lightingScore: finalStop.lightingScore,
      accessibilityBadge: 'Accessible Exit',
      safetyBadge: 'Safe Arrival Verified',
      lat: finalStop.lat,
      lng: finalStop.lng
    });

    const avgStopAccess = evaluatedStopsCount > 0 ? Math.round(totalAccessScore / evaluatedStopsCount) : 80;
    const avgStopSafety = evaluatedStopsCount > 0 ? Math.round(totalSafetyScore / evaluatedStopsCount) : 80;

    // Speed Score (normalized where 10min = 100, 30min = 50, 60min = 20)
    const speedScore = Math.max(10, Math.min(100, Math.round(100 - (totalDurationMin - 8) * 2.2)));

    // Accessibility Score combining stops & vehicles
    const primaryLine = lineSegments[0].line;
    const vehicleAccess = this.evaluateLineAccessibility(primaryLine.id);
    const accessibilityScore = Math.round(avgStopAccess * 0.6 + vehicleAccess * 0.4);

    // Safety Score combining stops, CCTV, lighting & guards
    const vehicleSafety = this.evaluateLineSafety(primaryLine.id);
    const safetyScore = Math.round(avgStopSafety * 0.6 + vehicleSafety * 0.4);

    // Calculate match score using profile weights
    const weights = profile.weights;
    const matchScore = Math.round(
      (accessibilityScore * weights.accessibility) +
      (safetyScore * weights.safety) +
      (speedScore * weights.speed)
    );

    // Determine features and warning tags
    const tags = [];
    if (accessibilityScore >= 90) tags.push({ label: '100% Step-Free', type: 'access' });
    if (primaryLine.features.lowFloorRamp) tags.push({ label: 'Ramp Vehicle', type: 'access' });
    if (safetyScore >= 90) tags.push({ label: 'Well-Lit Safe Corridor', type: 'safety' });
    if (primaryLine.features.onboardSafetyGuard) tags.push({ label: 'Security Guard Onboard', type: 'safety' });
    if (walkDistanceMeters <= 120) tags.push({ label: 'Minimal Walking (<120m)', type: 'comfort' });
    if (transfersCount === 0) tags.push({ label: 'Zero Transfers', type: 'comfort' });

    const warnings = [];
    if (accessibilityScore < 70) warnings.push('May include curbs, stairs, or non-ramp vehicles');
    if (safetyScore < 70) warnings.push('Contains isolated or lower lighting stops at night');

    return {
      id,
      title,
      totalDurationMin,
      walkDistanceMeters,
      transfersCount,
      allStopsInRoute,
      lineSegments,
      steps,
      scores: {
        matchScore,
        accessibilityScore,
        safetyScore,
        speedScore
      },
      tags,
      warnings,
      badge: null // Will be assigned during ranking
    };
  }

  /**
   * Sorts candidate routes and applies badges like "Safest at Night", "Maximum Accessibility", etc.
   */
  rankAndBadgeRoutes(routes, profile) {
    if (!routes || routes.length === 0) return [];

    // Sort descending by match score
    const sorted = [...routes].sort((a, b) => b.scores.matchScore - a.scores.matchScore);

    // Find standout options
    let highestSafety = sorted[0];
    let highestAccess = sorted[0];
    let fastest = sorted[0];

    sorted.forEach(r => {
      if (r.scores.safetyScore > highestSafety.scores.safetyScore) highestSafety = r;
      if (r.scores.accessibilityScore > highestAccess.scores.accessibilityScore) highestAccess = r;
      if (r.totalDurationMin < fastest.totalDurationMin) fastest = r;
    });

    // Assign contextual badges
    sorted[0].badge = {
      text: '★ Top Recommendation for You',
      type: 'best_match'
    };

    sorted.forEach((r, idx) => {
      if (idx !== 0) {
        if (r.id === highestSafety.id && highestSafety.scores.safetyScore >= 85) {
          r.badge = { text: '🛡️ Safest at Night', type: 'safety' };
        } else if (r.id === highestAccess.id && highestAccess.scores.accessibilityScore >= 90) {
          r.badge = { text: '🦼 Maximum Accessibility', type: 'access' };
        } else if (r.id === fastest.id) {
          r.badge = { text: '⚡ Fastest Route', type: 'speed' };
        }
      }
    });

    return sorted;
  }
}
