import { TransitStop, TransitLine, RouteCandidate, RouteSegment, RouteScoreBreakdown, RouteExplanation, UserPreferences } from './types';
import { MOCK_TRANSIT_STOPS, MOCK_TRANSIT_LINES } from './transitData';

export class RoutingEngine {
  /**
   * Evaluates all transit corridors between origin and destination,
   * generates candidate multi-modal routes, computes multi-dimensional scores,
   * and creates plain-English explanations.
   */
  public static calculateRoutes(
    originId: string,
    destId: string,
    preferences: UserPreferences
  ): RouteCandidate[] {
    const origin = MOCK_TRANSIT_STOPS[originId];
    const dest = MOCK_TRANSIT_STOPS[destId];
    if (!origin || !dest || originId === destId) return [];

    const rawCandidates: RouteCandidate[] = [];

    // Route 1: SafeCorridor Campus Night Shuttle (100% Step-Free & Escort Guard)
    rawCandidates.push(this.buildShuttleRoute(origin, dest, MOCK_TRANSIT_LINES.line_shuttle, preferences));

    // Route 2: Metro Blue Line (Fastest, but 18 stairs & broken elevator)
    rawCandidates.push(this.buildMetroRoute(origin, dest, MOCK_TRANSIT_LINES.line_metro, preferences));

    // Route 3: City Rapid Bus 4 (Surface transit with flip ramp, minor cobblestone alley)
    rawCandidates.push(this.buildBusRoute(origin, dest, MOCK_TRANSIT_LINES.line_bus4, preferences));

    // Route 4: University Light Rail Green (Zero-gap level boarding, 370m walking)
    rawCandidates.push(this.buildGreenRailRoute(origin, dest, MOCK_TRANSIT_LINES.line_green_rail, preferences));

    const scoredCandidates = rawCandidates.map(c => {
      const scores = this.scoreRoute(c, preferences);
      const explanation = this.generateExplanation(c, scores, preferences);
      return {
        ...c,
        scores,
        explanation
      };
    });

    // Sort descending by overall score
    scoredCandidates.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    if (scoredCandidates.length > 0) {
      scoredCandidates[0].isRecommended = true;
      if (!scoredCandidates[0].badges.includes('⭐ Top Recommendation')) {
        scoredCandidates[0].badges.unshift('⭐ Top Recommendation');
      }
    }

    return scoredCandidates;
  }

  private static buildShuttleRoute(origin: TransitStop, dest: TransitStop, line: TransitLine, prefs: UserPreferences): RouteCandidate {
    const segs: RouteSegment[] = [
      {
        type: 'walk',
        fromStopId: origin.id,
        toStopId: origin.id,
        fromName: origin.name,
        toName: origin.name + ' Level Bay 1',
        durationMin: 1,
        distanceMeters: 45,
        instructions: `Walk 45m along the illuminated, CCTV-monitored sidewalk with zero curb steps to Bay 1.`,
        accessibilityNotes: ['100% Step-Free level path', 'Tactile paving indicators', `Lighting: ${origin.lightingScore}/10`],
        stepFree: true,
        hasStairs: false,
        lightingScore: origin.lightingScore,
        elevatorInvolved: false,
        coordinates: [[origin.lat, origin.lng], [origin.lat + 0.0003, origin.lng + 0.0003]]
      },
      {
        type: 'transit',
        line: line,
        fromStopId: origin.id,
        toStopId: dest.id,
        fromName: origin.name,
        toName: dest.name,
        durationMin: 12,
        instructions: `Board ${line.name} (${line.shortName}). Automated electric wheelchair ramp deploys at front door.`,
        accessibilityNotes: ['Low-floor automatic ramp', '3 dedicated wheelchair bays', 'Security escort on board', 'Voice & LED next-stop alerts'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.8,
        elevatorInvolved: false,
        coordinates: [[origin.lat, origin.lng], [42.3615, -71.0965], [dest.lat, dest.lng]]
      },
      {
        type: 'walk',
        fromStopId: dest.id,
        toStopId: dest.id,
        fromName: dest.name + ' Bay',
        toName: dest.name + ' Entrance',
        durationMin: 1,
        distanceMeters: 35,
        instructions: `Exit shuttle onto flush curb platform and enter ${dest.name} via sliding power doors.`,
        accessibilityNotes: ['Zero incline level entrance', 'Audible door chime', `Lighting: ${dest.lightingScore}/10`],
        stepFree: true,
        hasStairs: false,
        lightingScore: dest.lightingScore,
        elevatorInvolved: false,
        coordinates: [[dest.lat + 0.0002, dest.lng + 0.0002], [dest.lat, dest.lng]]
      }
    ];

    return {
      id: 'route_shuttle_safecorridor',
      title: 'SafeCorridor Campus Night Shuttle (Route 1A)',
      subtitle: '100% Step-Free Low-Floor Vehicle • Escort Guard Onboard',
      summary: 'Direct campus link via lit safe corridors with dedicated wheelchair ramp and 0 stairs.',
      totalDurationMin: 14,
      totalWalkDistanceMeters: 80,
      transferCount: 0,
      segments: segs,
      scores: { accessibilityScore: 99, safetyScore: 98, comfortScore: 95, speedScore: 82, overallScore: 96 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'low',
      lightingAverage: 9.8,
      badges: ['100% Step-Free', 'Safe Lit Corridor', 'Zero Stairs', 'Low Crowding'],
      polylines: [
        { positions: [[origin.lat, origin.lng], [42.3615, -71.0965], [dest.lat, dest.lng]], color: '#10b981', weight: 6 }
      ]
    };
  }

  private static buildMetroRoute(origin: TransitStop, dest: TransitStop, line: TransitLine, prefs: UserPreferences): RouteCandidate {
    const segs: RouteSegment[] = [
      {
        type: 'walk',
        fromStopId: origin.id,
        toStopId: 'stop_metro',
        fromName: origin.name,
        toName: 'Metro Station Entrance',
        durationMin: 2,
        distanceMeters: 110,
        instructions: `Walk 110m to Metro Central Station concourse. Notice: 18 concrete steps required at north entrance.`,
        accessibilityNotes: ['⚠️ 18 stairs to platform', '🚨 Broken elevator reported on north concourse', 'Moderate lighting'],
        stepFree: false,
        hasStairs: true,
        lightingScore: 8.5,
        elevatorInvolved: true,
        elevatorStatus: 'broken',
        coordinates: [[origin.lat, origin.lng], [42.3630, -71.0980]]
      },
      {
        type: 'transit',
        line: line,
        fromStopId: 'stop_metro',
        toStopId: dest.id,
        fromName: 'Metro Central Station',
        toName: dest.name,
        durationMin: 7,
        instructions: `Take ${line.name} 2 stops. High passenger crowding; wheelchair securement area may be occupied.`,
        accessibilityNotes: ['Level platform boarding with 2-inch gap', 'Audible train chimes', 'High crowd density'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.2,
        elevatorInvolved: false,
        coordinates: [[42.3630, -71.0980], [42.3640, -71.0950], [dest.lat, dest.lng]]
      },
      {
        type: 'walk',
        fromStopId: dest.id,
        toStopId: dest.id,
        fromName: 'Metro Station Exit',
        toName: dest.name,
        durationMin: 2,
        distanceMeters: 75,
        instructions: `Exit train and proceed up south ramp to destination.`,
        accessibilityNotes: ['Working south elevator', 'High ceiling lighting'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.0,
        elevatorInvolved: true,
        elevatorStatus: 'operational',
        coordinates: [[dest.lat + 0.0003, dest.lng + 0.0003], [dest.lat, dest.lng]]
      }
    ];

    return {
      id: 'route_metro_express',
      title: 'Metro Blue Line Express',
      subtitle: 'Underground Subway • 11 min Fastest, but Stairs & Broken Elevator',
      summary: 'Fastest underground link, but involves 18 stairs at Metro Central entrance and high rush crowd.',
      totalDurationMin: 11,
      totalWalkDistanceMeters: 185,
      transferCount: 0,
      segments: segs,
      scores: { accessibilityScore: 35, safetyScore: 80, comfortScore: 45, speedScore: 95, overallScore: 48 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      stepFree: false,
      hasStairs: true,
      crowdLevel: 'high',
      lightingAverage: 8.9,
      badges: ['Fastest (11 min)', '⚠️ Has 18 Stairs', '🚨 Broken Elevator', 'High Crowds'],
      polylines: [
        { positions: [[origin.lat, origin.lng], [42.3630, -71.0980], [42.3640, -71.0950], [dest.lat, dest.lng]], color: '#3b82f6', weight: 5 }
      ]
    };
  }

  private static buildBusRoute(origin: TransitStop, dest: TransitStop, line: TransitLine, prefs: UserPreferences): RouteCandidate {
    const segs: RouteSegment[] = [
      {
        type: 'walk',
        fromStopId: origin.id,
        toStopId: 'stop_bus',
        fromName: origin.name,
        toName: 'Bus 4 Curbside Stop',
        durationMin: 3,
        distanceMeters: 140,
        instructions: `Walk 140m across pedestrian crosswalk with audible beeper to curbside stop.`,
        accessibilityNotes: ['Audible pedestrian crossing', 'Curb ramp with yellow tactile warning surface'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 8.8,
        elevatorInvolved: false,
        coordinates: [[origin.lat, origin.lng], [42.3590, -71.0960]]
      },
      {
        type: 'transit',
        line: line,
        fromStopId: 'stop_bus',
        toStopId: dest.id,
        fromName: 'Commonwealth Bus Stop',
        toName: dest.name,
        durationMin: 11,
        instructions: `Board ${line.name}. Driver flips mechanical ramp upon request. 2 wheelchair securement positions.`,
        accessibilityNotes: ['Flip-out low-floor ramp', '2 wheelchair bays', 'Moderate crowd occupancy'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 8.9,
        elevatorInvolved: false,
        coordinates: [[42.3590, -71.0960], [42.3610, -71.0930], [dest.lat, dest.lng]]
      },
      {
        type: 'walk',
        fromStopId: dest.id,
        toStopId: dest.id,
        fromName: 'Bus Stop Drop-off',
        toName: dest.name,
        durationMin: 3,
        distanceMeters: 100,
        instructions: `Roll 100m along side plaza. Warning: Brief 15m stretch of uneven heritage cobblestone alley.`,
        accessibilityNotes: ['⚠️ 15m uneven cobblestone alley vibration', 'Continuous sidewalk'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 7.9,
        elevatorInvolved: false,
        coordinates: [[dest.lat - 0.0003, dest.lng - 0.0003], [dest.lat, dest.lng]]
      }
    ];

    return {
      id: 'route_bus4_rapid',
      title: 'City Rapid Bus 4 (Surface Transit)',
      subtitle: 'Low-Floor Bus with Flip-Out Ramp • Mild Cobblestone Alley',
      summary: 'Surface transit alternative with moderate walking distance and minor cobblestone vibration.',
      totalDurationMin: 17,
      totalWalkDistanceMeters: 240,
      transferCount: 0,
      segments: segs,
      scores: { accessibilityScore: 82, safetyScore: 84, comfortScore: 72, speedScore: 78, overallScore: 79 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'moderate',
      lightingAverage: 8.5,
      badges: ['Low-Floor Ramp', 'Step-Free', 'Moderate Crowd', 'Surface Link'],
      polylines: [
        { positions: [[origin.lat, origin.lng], [42.3590, -71.0960], [42.3610, -71.0930], [dest.lat, dest.lng]], color: '#f59e0b', weight: 5 }
      ]
    };
  }

  private static buildGreenRailRoute(origin: TransitStop, dest: TransitStop, line: TransitLine, prefs: UserPreferences): RouteCandidate {
    const segs: RouteSegment[] = [
      {
        type: 'walk',
        fromStopId: origin.id,
        toStopId: 'stop_rail',
        fromName: origin.name,
        toName: 'Green Rail Station',
        durationMin: 4,
        distanceMeters: 220,
        instructions: `Walk 220m along North Avenue past science quad to the light rail platform.`,
        accessibilityNotes: ['Wide concrete pathway', 'Bench rest areas every 60m', 'LED lighting'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.3,
        elevatorInvolved: false,
        coordinates: [[origin.lat, origin.lng], [42.3670, -71.0920]]
      },
      {
        type: 'transit',
        line: line,
        fromStopId: 'stop_rail',
        toStopId: dest.id,
        fromName: 'Green Rail Station',
        toName: dest.name,
        durationMin: 13,
        instructions: `Board ${line.name}. Flush level boarding with zero gap; 4 dedicated wheelchair bays.`,
        accessibilityNotes: ['Level zero-gap boarding', '4 wheelchair bays', 'Smooth quiet electric ride'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.6,
        elevatorInvolved: false,
        coordinates: [[42.3670, -71.0920], [42.3640, -71.0910], [dest.lat, dest.lng]]
      },
      {
        type: 'walk',
        fromStopId: dest.id,
        toStopId: dest.id,
        fromName: 'Rail Station Concourse',
        toName: dest.name,
        durationMin: 4,
        distanceMeters: 150,
        instructions: `Roll 150m along illuminated south corridor to destination building.`,
        accessibilityNotes: ['Gentle 1:20 ADA compliant ramp', 'Blue light SOS kiosk'],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.4,
        elevatorInvolved: false,
        coordinates: [[dest.lat + 0.0004, dest.lng + 0.0004], [dest.lat, dest.lng]]
      }
    ];

    return {
      id: 'route_green_rail',
      title: 'University Light Rail Green (Campus Loop)',
      subtitle: 'Zero-Gap Level Boarding • 370m Total Walking Distance',
      summary: 'Quiet electric rail with 4 wheelchair bays; involves slightly longer walking distance across campus.',
      totalDurationMin: 21,
      totalWalkDistanceMeters: 370,
      transferCount: 0,
      segments: segs,
      scores: { accessibilityScore: 88, safetyScore: 94, comfortScore: 92, speedScore: 68, overallScore: 84 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'low',
      lightingAverage: 9.4,
      badges: ['Zero-Gap Boarding', 'Safe Corridor', 'Low Sensory', 'Quiet Electric'],
      polylines: [
        { positions: [[origin.lat, origin.lng], [42.3670, -71.0920], [42.3640, -71.0910], [dest.lat, dest.lng]], color: '#059669', weight: 5 }
      ]
    };
  }

  private static scoreRoute(route: RouteCandidate, prefs: UserPreferences): RouteScoreBreakdown {
    let accessibilityScore = 90;
    const hasBrokenElevator = route.segments.some(s => s.elevatorStatus === 'broken');

    if (!route.stepFree || route.hasStairs) accessibilityScore -= 50;
    if (hasBrokenElevator) accessibilityScore -= 45;
    if (route.totalWalkDistanceMeters <= 100) accessibilityScore += 10;
    accessibilityScore = Math.max(10, Math.min(100, accessibilityScore));

    let safetyScore = Math.round(route.lightingAverage * 9.5);
    if (route.lightingAverage >= 9.2) safetyScore += 8;
    safetyScore = Math.max(15, Math.min(100, safetyScore));

    let comfortScore = 75;
    if (route.crowdLevel === 'low') comfortScore = 95;
    else if (route.crowdLevel === 'moderate') comfortScore = 78;
    else comfortScore = 42;
    if (route.totalWalkDistanceMeters <= 100) comfortScore += 5;
    comfortScore = Math.max(10, Math.min(100, comfortScore));

    const speedScore = Math.max(20, Math.min(100, Math.round(100 - (route.totalDurationMin * 2.5))));

    let overallScore = 0;
    if (prefs.stepFreeOnly && (!route.stepFree || route.hasStairs || hasBrokenElevator)) {
      overallScore = Math.max(15, Math.round(accessibilityScore * 0.4 + speedScore * 0.1));
    } else if (prefs.avoidStairs && route.hasStairs) {
      overallScore = Math.max(20, Math.round(accessibilityScore * 0.45 + safetyScore * 0.2));
    } else {
      switch (prefs.profileId) {
        case 'wheelchair':
          overallScore = Math.round(accessibilityScore * 0.60 + safetyScore * 0.20 + comfortScore * 0.10 + speedScore * 0.10);
          break;
        case 'elderly':
          const walkPenalty = route.totalWalkDistanceMeters > prefs.maxWalkDistanceMeters ? 20 : 0;
          overallScore = Math.round(accessibilityScore * 0.45 + safetyScore * 0.30 + comfortScore * 0.15 + speedScore * 0.10 - walkPenalty);
          break;
        case 'night_safety':
          overallScore = Math.round(safetyScore * 0.60 + accessibilityScore * 0.20 + comfortScore * 0.10 + speedScore * 0.10);
          break;
        case 'quiet_sensory':
          overallScore = Math.round(comfortScore * 0.50 + safetyScore * 0.25 + accessibilityScore * 0.15 + speedScore * 0.10);
          break;
        case 'vision_hearing':
          overallScore = Math.round(accessibilityScore * 0.50 + safetyScore * 0.30 + comfortScore * 0.10 + speedScore * 0.10);
          break;
        case 'standard':
        default:
          overallScore = Math.round(speedScore * 0.50 + accessibilityScore * 0.20 + safetyScore * 0.20 + comfortScore * 0.10);
          break;
      }
    }

    if (route.totalWalkDistanceMeters > prefs.maxWalkDistanceMeters) {
      const over = route.totalWalkDistanceMeters - prefs.maxWalkDistanceMeters;
      overallScore = Math.max(10, overallScore - Math.min(30, Math.round(over / 15)));
    }
    if (prefs.preferSaferRoute && route.lightingAverage < 9.0) {
      overallScore = Math.max(10, overallScore - 15);
    }
    if (prefs.avoidCrowded && route.crowdLevel === 'high') {
      overallScore = Math.max(10, overallScore - 25);
    }

    overallScore = Math.max(10, Math.min(100, overallScore));

    return { accessibilityScore, safetyScore, comfortScore, speedScore, overallScore };
  }

  private static generateExplanation(route: RouteCandidate, scores: RouteScoreBreakdown, prefs: UserPreferences): RouteExplanation {
    const whyRecommended: string[] = [];
    const tradeOffs: string[] = [];
    const barrierWarnings: string[] = [];
    const hasBrokenElevator = route.segments.some(s => s.elevatorStatus === 'broken');

    if (route.stepFree && !route.hasStairs) {
      whyRecommended.push('100% Step-Free: Complete level access, ADA curb cutouts, and low-floor electric boarding ramp.');
    }
    if (route.totalWalkDistanceMeters <= 100) {
      whyRecommended.push(`Minimal Walking: Only ${route.totalWalkDistanceMeters}m of level walking with zero steep inclines.`);
    } else if (route.totalWalkDistanceMeters <= prefs.maxWalkDistanceMeters) {
      whyRecommended.push(`Comfortable Walk: ${route.totalWalkDistanceMeters}m walking distance fits within your ${prefs.maxWalkDistanceMeters}m limit.`);
    }
    if (route.lightingAverage >= 9.2) {
      whyRecommended.push(`Safe & Bright: High-intensity LED lighting (${route.lightingAverage}/10) along CCTV and Blue-Light SOS corridors.`);
    }
    if (route.crowdLevel === 'low') {
      whyRecommended.push('Low Crowding: Calm vehicle environment with open wheelchair bays and guaranteed seating.');
    }

    if (route.id === 'route_shuttle_safecorridor') {
      tradeOffs.push('Takes 4 minutes longer than underground subway, but eliminates 18 stairs and broken elevator hazards.');
    } else if (route.id === 'route_metro_express') {
      tradeOffs.push('Fastest travel time (11 mins), but includes physical barriers and heavy passenger crowding.');
    } else if (route.id === 'route_bus4_rapid') {
      tradeOffs.push('Reliable surface transit with flip-out ramp; requires crossing street at audible signal.');
    } else if (route.id === 'route_green_rail') {
      tradeOffs.push('Zero-vibration level rail boarding, but involves 370m total walking distance across campus.');
    }

    if (route.hasStairs) {
      barrierWarnings.push('⚠️ Contains 18 concrete steps at entrance (no working downward escalator).');
    }
    if (hasBrokenElevator) {
      barrierWarnings.push('🚨 Broken Elevator Alert: Station elevator is out of service for repair.');
    }
    if (route.crowdLevel === 'high') {
      barrierWarnings.push('👥 High rush hour crowding; boarding delays and limited wheelchair space.');
    }
    if (route.totalWalkDistanceMeters > prefs.maxWalkDistanceMeters) {
      barrierWarnings.push(`🚶 Walking distance (${route.totalWalkDistanceMeters}m) exceeds your selected limit (${prefs.maxWalkDistanceMeters}m).`);
    }

    let headline = '';
    let suitabilitySummary = '';
    if (scores.overallScore >= 90) {
      headline = `⭐ Top Recommendation for ${prefs.profileId.replace('_', ' ').toUpperCase()}`;
      suitabilitySummary = `This route scored highest (${scores.overallScore}/100) because it strictly adheres to your accessibility and safety preferences, providing a seamless, stress-free journey with verified barrier-free transit.`;
    } else if (scores.overallScore >= 75) {
      headline = `✓ Viable Alternative Route (${scores.overallScore}/100)`;
      suitabilitySummary = `A strong secondary option with decent accessibility (${scores.accessibilityScore}/100), though with slightly higher walking distance or minor tradeoffs.`;
    } else {
      headline = `⚠️ Significant Barriers Detected (${scores.overallScore}/100)`;
      suitabilitySummary = `Not recommended for your current profile due to detected physical barriers (stairs, broken elevators, or excessive walking distances).`;
    }

    return { headline, whyRecommended, tradeOffs, barrierWarnings, suitabilitySummary };
  }
}
