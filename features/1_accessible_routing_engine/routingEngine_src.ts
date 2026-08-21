import { TransitStop, TransitLine, RouteCandidate, RouteSegment, UserPreferences, RouteScoreBreakdown, RouteExplanation } from '../types/transit';
import { MOCK_TRANSIT_STOPS, MOCK_TRANSIT_LINES } from '../data/transitData';

export class RoutingEngine {
  private static stops = MOCK_TRANSIT_STOPS;
  private static lines = MOCK_TRANSIT_LINES;

  /**
   * Find, generate, score, and rank candidate routes between origin and destination
   */
  public static calculateRoutes(
    originId: string,
    destId: string,
    preferences: UserPreferences
  ): RouteCandidate[] {
    const origin = this.stops[originId];
    const dest = this.stops[destId];

    if (!origin || !dest || originId === destId) {
      return [];
    }

    const rawCandidates: RouteCandidate[] = [];

    // Option 1: SafeCorridor Campus Night Shuttle Route
    const shuttleLine = this.lines.line_shuttle;
    if (this.canUseLine(shuttleLine, originId, destId) || originId === 'stop_gate' || originId === 'stop_lib' || destId === 'stop_lib' || destId === 'stop_hosp') {
      rawCandidates.push(this.buildShuttleRoute(origin, dest, shuttleLine, preferences));
    }

    // Option 2: Metro Blue Line Route (Fast Subway, but has Stairs & Broken Elevator at Metro Central)
    const metroLine = this.lines.line_metro;
    if (this.canUseLine(metroLine, originId, destId) || originId === 'stop_gate' || originId === 'stop_lib' || destId === 'stop_metro' || originId === 'stop_sports' || destId === 'stop_tech') {
      rawCandidates.push(this.buildMetroRoute(origin, dest, metroLine, preferences));
    }

    // Option 3: City Rapid Bus 4 (Direct City Route, Curbside boarding, moderate walk)
    const busLine = this.lines.line_bus4;
    if (this.canUseLine(busLine, originId, destId) || originId === 'stop_gate' || originId === 'stop_lib' || destId === 'stop_hosp' || originId === 'stop_arts') {
      rawCandidates.push(this.buildBusRoute(origin, dest, busLine, preferences));
    }

    // Option 4: University Light Rail Green (Step-Free, quiet, scenic campus perimeter)
    const greenLine = this.lines.line_green_rail;
    if (this.canUseLine(greenLine, originId, destId) || originId === 'stop_gate' || originId === 'stop_sports' || destId === 'stop_tech' || originId === 'stop_lib' || destId === 'stop_res') {
      rawCandidates.push(this.buildGreenRailRoute(origin, dest, greenLine, preferences));
    }


    // Fallback: If no preset line matched directly, generate synthetic combined multi-modal candidate
    if (rawCandidates.length === 0) {
      rawCandidates.push(this.buildSyntheticDirectRoute(origin, dest, preferences));
      rawCandidates.push(this.buildSyntheticAlternativeRoute(origin, dest, preferences));
    }

    // Score and rank candidates based on user preferences
    const scoredCandidates = rawCandidates.map(candidate => {
      const scores = this.calculateScores(candidate, preferences);
      const explanation = this.generateExplanation(candidate, scores, preferences);
      return {
        ...candidate,
        scores,
        explanation
      };
    });

    // Sort descending by overall weighted score
    scoredCandidates.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

    // Mark the top candidate as recommended
    if (scoredCandidates.length > 0) {
      scoredCandidates[0].isRecommended = true;
      scoredCandidates[0].badges = ['⭐ Best Match', ...scoredCandidates[0].badges];
    }

    return scoredCandidates;
  }

  private static canUseLine(line: TransitLine, fromId: string, toId: string): boolean {
    const fromIdx = line.stopsSequence.indexOf(fromId);
    const toIdx = line.stopsSequence.indexOf(toId);
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  }

  /**
   * Route 1: SafeCorridor Campus Night Shuttle (100% Step-Free, Safe, Zero Stairs, Low Crowds)
   */
  private static buildShuttleRoute(
    origin: TransitStop,
    dest: TransitStop,
    line: TransitLine,
    preferences: UserPreferences
  ): RouteCandidate {
    const walkStartDist = 60; // 60 meters
    const walkEndDist = 30; // 30 meters
    const totalWalk = walkStartDist + walkEndDist;
    const transitTime = 12; // 12 mins
    const totalDuration = transitTime + 3; // 15 mins

    const segments: RouteSegment[] = [
      {
        type: 'walk',
        fromName: origin.name,
        toName: `${origin.name} Shuttle Bay 1`,
        durationMin: 2,
        distanceMeters: walkStartDist,
        instructions: 'Follow the level tactile walkway to the illuminated SafeCorridor Shuttle Bay.',
        accessibilityNotes: [
          '✓ 100% Step-free level path with ADA curb ramps',
          '✓ High-intensity LED lighting (9.8/10 rating)',
          '✓ Blue Light Emergency SOS phone located at platform'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: origin.lightingScore,
        elevatorInvolved: false,
        coordinates: [
          [origin.lat, origin.lng],
          [origin.lat + 0.0005, origin.lng + 0.0004]
        ]
      },
      {
        type: 'transit',
        fromStopId: origin.id,
        toStopId: dest.id,
        fromName: origin.name,
        toName: dest.name,
        durationMin: transitTime,
        line,
        instructions: `Board ${line.name} (${line.shortName}). Driver deploys automated electric low-floor ramp.`,
        accessibilityNotes: [
          '✓ Automatic low-floor ramp with zero boarding step',
          '✓ 3 dedicated wheelchair securement bays with seatbelt locks',
          '✓ Real-time high-contrast visual display & automated audio stop announcements',
          '✓ Onboard student safety escort & 4 active security cameras'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.6,
        elevatorInvolved: false,
        coordinates: this.generatePolylineCoordinates(origin, dest, 4)
      },
      {
        type: 'walk',
        fromName: `${dest.name} Drop-off`,
        toName: dest.name,
        durationMin: 1,
        distanceMeters: walkEndDist,
        instructions: 'Alight at main entrance canopy. Direct automatic sliding glass doors.',
        accessibilityNotes: [
          '✓ Zero curb step; level canopy entrance',
          '✓ Automatic power-assisted entrance doors',
          '✓ Staffed welcome & assistance desk'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: dest.lightingScore,
        elevatorInvolved: false,
        coordinates: [
          [dest.lat + 0.0003, dest.lng + 0.0003],
          [dest.lat, dest.lng]
        ]
      }
    ];

    return {
      id: 'route_shuttle_safecorridor',
      title: 'SafeCorridor Campus Shuttle (100% Step-Free)',
      subtitle: `Via ${line.shortName} • Direct Service`,
      summary: '100% step-free low-floor shuttle through well-lit campus security corridors with minimal walking.',
      totalDurationMin: totalDuration,
      totalWalkDistanceMeters: totalWalk,
      transferCount: 0,
      segments,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'low',
      lightingAverage: 9.7,
      badges: ['100% Step-Free', 'Safe Corridor', 'Low Crowds', 'Zero Stairs'],
      scores: { accessibilityScore: 98, safetyScore: 96, comfortScore: 94, speedScore: 82, overallScore: 94 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      polylines: [
        {
          color: '#10b981',
          weight: 6,
          positions: [
            [origin.lat, origin.lng],
            ...this.generatePolylineCoordinates(origin, dest, 4),
            [dest.lat, dest.lng]
          ]
        },
        {
          color: '#10b981',
          dashArray: '5, 8',
          weight: 4,
          positions: [
            [origin.lat, origin.lng],
            [origin.lat + 0.0005, origin.lng + 0.0004]
          ]
        }
      ]
    };
  }

  /**
   * Route 2: Metro Blue Line (Fastest Subway, but has Stairs & Broken Elevator Warning)
   */
  private static buildMetroRoute(
    origin: TransitStop,
    dest: TransitStop,
    line: TransitLine,
    preferences: UserPreferences
  ): RouteCandidate {
    const walkStartDist = 180;
    const walkEndDist = 240;
    const totalWalk = walkStartDist + walkEndDist;
    const transitTime = 7;
    const totalDuration = 11; // 4 mins faster

    const hasBrokenElevator = origin.elevatorStatus === 'broken' || dest.elevatorStatus === 'broken';

    const segments: RouteSegment[] = [
      {
        type: 'walk',
        fromName: origin.name,
        toName: `${origin.name} North Mezzanine Gate`,
        durationMin: 3,
        distanceMeters: walkStartDist,
        instructions: 'Walk through downtown concourse. Main entrance contains 18 concrete stairs.',
        accessibilityNotes: [
          '⚠️ Entrance contains 18 steep concrete steps (no escalator down)',
          hasBrokenElevator ? '🚨 CRITICAL: Elevator is currently OUT OF SERVICE for hydraulic repair' : '✓ Elevator available',
          '✓ Moderate lighting (8.5/10) with transit police presence'
        ],
        stepFree: !hasBrokenElevator,
        hasStairs: true,
        lightingScore: 8.5,
        elevatorInvolved: true,
        elevatorStatus: hasBrokenElevator ? 'broken' : 'operational',
        coordinates: [
          [origin.lat, origin.lng],
          [origin.lat + 0.001, origin.lng - 0.0008]
        ]
      },
      {
        type: 'transit',
        fromStopId: origin.id,
        toStopId: dest.id,
        fromName: origin.name,
        toName: dest.name,
        durationMin: transitTime,
        line,
        instructions: `Take ${line.name} towards Tech Hub. High rush-hour passenger volume.`,
        accessibilityNotes: [
          '⚠️ 3-inch gap between train and platform edge; requires bridge plate or manual assist',
          '⚠️ High rush hour crowding; limited wheelchair seating availability',
          '✓ Rapid express transit speed (7 mins in-transit)'
        ],
        stepFree: false,
        hasStairs: true,
        lightingScore: 8.8,
        elevatorInvolved: false,
        coordinates: this.generatePolylineCoordinates(origin, dest, 3)
      },
      {
        type: 'walk',
        fromName: `${dest.name} Subway Exit`,
        toName: dest.name,
        durationMin: 3,
        distanceMeters: walkEndDist,
        instructions: 'Exit subway platform via escalators or stairs to street level.',
        accessibilityNotes: [
          '⚠️ 240m walk through subterranean corridor',
          '✓ High pedestrian traffic'
        ],
        stepFree: false,
        hasStairs: true,
        lightingScore: 8.7,
        elevatorInvolved: true,
        elevatorStatus: dest.elevatorStatus,
        coordinates: [
          [dest.lat - 0.001, dest.lng + 0.001],
          [dest.lat, dest.lng]
        ]
      }
    ];

    return {
      id: 'route_metro_express',
      title: 'Metro Blue Line Express (Fastest)',
      subtitle: `Via ${line.shortName} • 4 mins faster`,
      summary: 'Express underground subway. Fastest travel time, but contains stairs, a broken elevator alert, and high crowds.',
      totalDurationMin: totalDuration,
      totalWalkDistanceMeters: totalWalk,
      transferCount: 0,
      segments,
      stepFree: false,
      hasStairs: true,
      crowdLevel: 'high',
      lightingAverage: 8.7,
      badges: ['⚡ Fastest Time', '⚠️ Has Stairs', '🛗 Broken Elevator Alert', '👥 High Crowds'],
      scores: { accessibilityScore: 42, safetyScore: 80, comfortScore: 50, speedScore: 96, overallScore: 64 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      polylines: [
        {
          color: '#3b82f6',
          weight: 6,
          positions: [
            [origin.lat, origin.lng],
            ...this.generatePolylineCoordinates(origin, dest, 3),
            [dest.lat, dest.lng]
          ]
        },
        {
          color: '#3b82f6',
          dashArray: '5, 8',
          weight: 4,
          positions: [
            [origin.lat, origin.lng],
            [origin.lat + 0.001, origin.lng - 0.0008]
          ]
        }
      ]
    };
  }

  /**
   * Route 3: City Rapid Bus 4 (Direct Bus, Moderate Walk, Curbside Ramp)
   */
  private static buildBusRoute(
    origin: TransitStop,
    dest: TransitStop,
    line: TransitLine,
    preferences: UserPreferences
  ): RouteCandidate {
    const walkStartDist = 120;
    const walkEndDist = 90;
    const totalWalk = walkStartDist + walkEndDist;
    const transitTime = 14;
    const totalDuration = 18;

    const segments: RouteSegment[] = [
      {
        type: 'walk',
        fromName: origin.name,
        toName: `${origin.name} Bus Bay B`,
        durationMin: 2,
        distanceMeters: walkStartDist,
        instructions: 'Cross avenue using tactile pedestrian crosswalk with audible signal.',
        accessibilityNotes: [
          '✓ Curb cutouts with tactile truncated dome pads',
          '✓ Audible pedestrian crossing signal (chirp enabled)',
          '✓ Standard city lighting (8.2/10)'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 8.2,
        elevatorInvolved: false,
        coordinates: [
          [origin.lat, origin.lng],
          [origin.lat - 0.0004, origin.lng + 0.0008]
        ]
      },
      {
        type: 'transit',
        fromStopId: origin.id,
        toStopId: dest.id,
        fromName: origin.name,
        toName: dest.name,
        durationMin: transitTime,
        line,
        instructions: `Board ${line.name}. Low-floor front ramp available upon request.`,
        accessibilityNotes: [
          '✓ Front-door flip-out ramp (driver operated)',
          '✓ 2 wheelchair tie-down positions',
          '✓ Audio stop announcements and digital LED banner'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 8.4,
        elevatorInvolved: false,
        coordinates: this.generatePolylineCoordinates(origin, dest, 5, 0.002)
      },
      {
        type: 'walk',
        fromName: `${dest.name} Curbside Stop`,
        toName: dest.name,
        durationMin: 2,
        distanceMeters: walkEndDist,
        instructions: 'Walk along paved sidewalk to building main entrance.',
        accessibilityNotes: [
          '✓ Paved sidewalk with 1:20 gentle grade',
          '✓ Well-lit street section'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: dest.lightingScore,
        elevatorInvolved: false,
        coordinates: [
          [dest.lat + 0.0006, dest.lng - 0.0004],
          [dest.lat, dest.lng]
        ]
      }
    ];

    return {
      id: 'route_bus4_rapid',
      title: 'City Rapid Bus Line 4',
      subtitle: `Via ${line.shortName} • Curbside Ramp`,
      summary: 'Reliable street-level bus route with low-floor ramp, audio-visual announcements, and moderate walking distance.',
      totalDurationMin: totalDuration,
      totalWalkDistanceMeters: totalWalk,
      transferCount: 0,
      segments,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'moderate',
      lightingAverage: 8.3,
      badges: ['Step-Free Accessible', 'Audible Crossings', 'Flip-out Ramp'],
      scores: { accessibilityScore: 88, safetyScore: 82, comfortScore: 78, speedScore: 74, overallScore: 81 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      polylines: [
        {
          color: '#f59e0b',
          weight: 6,
          positions: [
            [origin.lat, origin.lng],
            ...this.generatePolylineCoordinates(origin, dest, 5, 0.002),
            [dest.lat, dest.lng]
          ]
        }
      ]
    };
  }

  /**
   * Route 4: University Light Rail Green
   */
  private static buildGreenRailRoute(
    origin: TransitStop,
    dest: TransitStop,
    line: TransitLine,
    preferences: UserPreferences
  ): RouteCandidate {
    const walkStartDist = 190;
    const walkEndDist = 180;
    const totalWalk = walkStartDist + walkEndDist;
    const transitTime = 10;
    const totalDuration = 17;

    const segments: RouteSegment[] = [
      {
        type: 'walk',
        fromName: origin.name,
        toName: `${origin.name} Light Rail Platform`,
        durationMin: 3,
        distanceMeters: walkStartDist,
        instructions: 'Walk along wide pedestrian promenade to Green Rail platform.',
        accessibilityNotes: [
          '✓ 100% Step-free broad pedestrian boulevard',
          '✓ High-visibility LED illuminated path'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.1,
        elevatorInvolved: false,
        coordinates: [
          [origin.lat, origin.lng],
          [origin.lat + 0.0008, origin.lng + 0.0006]
        ]
      },
      {
        type: 'transit',
        fromStopId: origin.id,
        toStopId: dest.id,
        fromName: origin.name,
        toName: dest.name,
        durationMin: transitTime,
        line,
        instructions: `Board ${line.name}. Level-boarding platform with zero threshold gap.`,
        accessibilityNotes: [
          '✓ Level platform boarding with automatic bridge threshold',
          '✓ 4 dedicated spacious wheelchair seating areas',
          '✓ Calm, smooth electric rail ride with low ambient noise'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.3,
        elevatorInvolved: false,
        coordinates: this.generatePolylineCoordinates(origin, dest, 4, -0.002)
      },
      {
        type: 'walk',
        fromName: `${dest.name} Rail Stop`,
        toName: dest.name,
        durationMin: 4,
        distanceMeters: walkEndDist,
        instructions: 'Walk across the university plaza to destination building.',
        accessibilityNotes: [
          '✓ Smooth brick pavers with zero curb lip',
          '✓ Benches every 50 meters for rest stops'
        ],
        stepFree: true,
        hasStairs: false,
        lightingScore: 9.2,
        elevatorInvolved: false,
        coordinates: [
          [dest.lat - 0.0005, dest.lng + 0.0008],
          [dest.lat, dest.lng]
        ]
      }
    ];

    return {
      id: 'route_green_rail',
      title: 'University Green Light Rail',
      subtitle: `Via ${line.shortName} • Level Boarding`,
      summary: 'Spacious light rail with level platform boarding and zero vibration. Ideal for comfort and sensory ease, with moderate walking.',
      totalDurationMin: totalDuration,
      totalWalkDistanceMeters: totalWalk,
      transferCount: 0,
      segments,
      stepFree: true,
      hasStairs: false,
      crowdLevel: 'low',
      lightingAverage: 9.2,
      badges: ['Level Boarding', 'Low Vibration', 'Rest Benches on Walk'],
      scores: { accessibilityScore: 92, safetyScore: 91, comfortScore: 95, speedScore: 78, overallScore: 88 },
      explanation: { headline: '', whyRecommended: [], tradeOffs: [], barrierWarnings: [], suitabilitySummary: '' },
      isRecommended: false,
      polylines: [
        {
          color: '#8b5cf6',
          weight: 6,
          positions: [
            [origin.lat, origin.lng],
            ...this.generatePolylineCoordinates(origin, dest, 4, -0.002),
            [dest.lat, dest.lng]
          ]
        }
      ]
    };
  }

  private static buildSyntheticDirectRoute(origin: TransitStop, dest: TransitStop, preferences: UserPreferences): RouteCandidate {
    const shuttle = this.lines.line_shuttle;
    return this.buildShuttleRoute(origin, dest, shuttle, preferences);
  }

  private static buildSyntheticAlternativeRoute(origin: TransitStop, dest: TransitStop, preferences: UserPreferences): RouteCandidate {
    const metro = this.lines.line_metro;
    return this.buildMetroRoute(origin, dest, metro, preferences);
  }

  /**
   * Helper to generate intermediate polyline coords with curvature
   */
  private static generatePolylineCoordinates(
    from: TransitStop,
    to: TransitStop,
    segmentsCount = 4,
    curveOffset = 0.0015
  ): [number, number][] {
    const coords: [number, number][] = [];
    coords.push([from.lat, from.lng]);

    for (let i = 1; i < segmentsCount; i++) {
      const fraction = i / segmentsCount;
      const lat = from.lat + (to.lat - from.lat) * fraction + Math.sin(fraction * Math.PI) * curveOffset;
      const lng = from.lng + (to.lng - from.lng) * fraction + Math.sin(fraction * Math.PI) * (curveOffset * 0.7);
      coords.push([lat, lng]);
    }

    coords.push([to.lat, to.lng]);
    return coords;
  }

  /**
   * Multi-factor scoring calculator
   */
  private static calculateScores(
    route: RouteCandidate,
    preferences: UserPreferences
  ): RouteScoreBreakdown {
    // 1. Accessibility Score (0 - 100)
    let accessibilityScore = 70;
    if (route.stepFree) accessibilityScore += 20;
    else accessibilityScore -= 30;

    if (route.hasStairs) accessibilityScore -= 35;

    // Check elevator reliability
    const hasBrokenElevator = route.segments.some(s => s.elevatorStatus === 'broken');
    if (hasBrokenElevator) accessibilityScore -= 40;

    accessibilityScore = Math.max(10, Math.min(100, accessibilityScore));

    // 2. Safety Score (0 - 100)
    let safetyScore = Math.round(route.lightingAverage * 9.5);
    if (route.lightingAverage >= 9.2) safetyScore += 8;
    if (route.crowdLevel === 'low') safetyScore += 2;
    safetyScore = Math.max(15, Math.min(100, safetyScore));

    // 3. Comfort & Sensory Score (0 - 100)
    let comfortScore = 75;
    if (route.crowdLevel === 'low') comfortScore = 95;
    else if (route.crowdLevel === 'moderate') comfortScore = 78;
    else comfortScore = 42;

    if (route.totalWalkDistanceMeters <= 100) comfortScore += 5;
    comfortScore = Math.max(10, Math.min(100, comfortScore));

    // 4. Speed Score (0 - 100)
    let speedScore = Math.max(20, Math.min(100, Math.round(100 - (route.totalDurationMin * 2.5))));

    // 5. User-tailored Overall Score Weighting
    let overallScore = 0;

    // Apply strict filters based on user preferences
    if (preferences.stepFreeOnly && (!route.stepFree || route.hasStairs || hasBrokenElevator)) {
      // Severe penalty if user needs step-free access and route has stairs or broken elevator
      overallScore = Math.max(15, Math.round(accessibilityScore * 0.4 + speedScore * 0.1));
    } else if (preferences.avoidStairs && route.hasStairs) {
      // Severe penalty if user requested avoiding stairs
      overallScore = Math.max(20, Math.round(accessibilityScore * 0.45 + safetyScore * 0.2));
    } else {
      // Dynamic profile-based weighting
      switch (preferences.profileId) {
        case 'wheelchair':
          overallScore = Math.round(
            accessibilityScore * 0.60 +
            safetyScore * 0.20 +
            comfortScore * 0.10 +
            speedScore * 0.10
          );
          break;

        case 'elderly':
          // Reduced mobility: short walks, zero stairs, high safety
          const walkPenalty = route.totalWalkDistanceMeters > preferences.maxWalkDistanceMeters ? 20 : 0;
          overallScore = Math.round(
            accessibilityScore * 0.45 +
            safetyScore * 0.30 +
            comfortScore * 0.15 +
            speedScore * 0.10 - walkPenalty
          );
          break;

        case 'night_safety':
          overallScore = Math.round(
            safetyScore * 0.60 +
            accessibilityScore * 0.20 +
            comfortScore * 0.10 +
            speedScore * 0.10
          );
          break;

        case 'quiet_sensory':
          overallScore = Math.round(
            comfortScore * 0.50 +
            safetyScore * 0.25 +
            accessibilityScore * 0.15 +
            speedScore * 0.10
          );
          break;

        case 'vision_hearing':
          overallScore = Math.round(
            accessibilityScore * 0.50 +
            safetyScore * 0.30 +
            comfortScore * 0.10 +
            speedScore * 0.10
          );
          break;

        case 'standard':
        default:
          overallScore = Math.round(
            speedScore * 0.50 +
            accessibilityScore * 0.20 +
            safetyScore * 0.20 +
            comfortScore * 0.10
          );
          break;
      }
    }

    // Walking distance custom limit modifier
    if (route.totalWalkDistanceMeters > preferences.maxWalkDistanceMeters) {
      const overMeters = route.totalWalkDistanceMeters - preferences.maxWalkDistanceMeters;
      const penalty = Math.min(30, Math.round(overMeters / 15));
      overallScore = Math.max(10, overallScore - penalty);
    }

    // Safety toggle modifier
    if (preferences.preferSaferRoute && route.lightingAverage < 9.0) {
      overallScore = Math.max(10, overallScore - 15);
    }

    // Avoid crowded toggle modifier
    if (preferences.avoidCrowded && route.crowdLevel === 'high') {
      overallScore = Math.max(10, overallScore - 25);
    }

    overallScore = Math.max(10, Math.min(100, overallScore));

    return {
      accessibilityScore,
      safetyScore,
      comfortScore,
      speedScore,
      overallScore
    };
  }

  /**
   * Transparent plain-English explanation generator
   */
  private static generateExplanation(
    route: RouteCandidate,
    scores: RouteScoreBreakdown,
    preferences: UserPreferences
  ): RouteExplanation {
    const whyRecommended: string[] = [];
    const tradeOffs: string[] = [];
    const barrierWarnings: string[] = [];

    const hasBrokenElevator = route.segments.some(s => s.elevatorStatus === 'broken');

    // Positives
    if (route.stepFree && !route.hasStairs) {
      whyRecommended.push('100% Step-Free: Complete level access, ADA curb cuts, and low-floor electric boarding ramp.');
    }

    if (route.totalWalkDistanceMeters <= 100) {
      whyRecommended.push(`Minimal Walking: Only ${route.totalWalkDistanceMeters}m of level walking with zero steep inclines.`);
    } else if (route.totalWalkDistanceMeters <= preferences.maxWalkDistanceMeters) {
      whyRecommended.push(`Comfortable Walk: ${route.totalWalkDistanceMeters}m walking distance fits within your ${preferences.maxWalkDistanceMeters}m preference limit.`);
    }

    if (route.lightingAverage >= 9.2) {
      whyRecommended.push(`Safe & Bright: High-intensity LED lighting (${route.lightingAverage}/10) along CCTV and Blue-Light SOS corridors.`);
    }

    if (route.crowdLevel === 'low') {
      whyRecommended.push('Low Crowding: Calm vehicle environment with open wheelchair positions and guaranteed seating.');
    }

    // Tradeoffs
    if (route.id === 'route_shuttle_safecorridor') {
      tradeOffs.push('Takes 4 minutes longer than underground subway, but avoids 18 stairs and broken elevator hazards.');
    } else if (route.id === 'route_metro_express') {
      tradeOffs.push('Fastest travel time (11 mins), but includes physical barriers and heavy passenger volume.');
    } else if (route.id === 'route_bus4_rapid') {
      tradeOffs.push('Reliable surface transit with flip-out ramp; requires crossing street at audible signal.');
    } else if (route.id === 'route_green_rail') {
      tradeOffs.push('Zero-vibration level rail boarding, but involves 370m total walking distance across campus.');
    }

    // Warnings
    if (route.hasStairs) {
      barrierWarnings.push('⚠️ Contains 18 concrete steps at entrance (no working downward escalator).');
    }

    if (hasBrokenElevator) {
      barrierWarnings.push('🚨 Broken Elevator Alert: Station elevator is out of service for repairs.');
    }

    if (route.crowdLevel === 'high') {
      barrierWarnings.push('👥 High rush hour crowding; boarding delays and limited wheelchair space.');
    }

    if (route.totalWalkDistanceMeters > preferences.maxWalkDistanceMeters) {
      barrierWarnings.push(`🚶 Walking distance (${route.totalWalkDistanceMeters}m) exceeds your selected limit (${preferences.maxWalkDistanceMeters}m).`);
    }

    // Headline & Suitability summary
    let headline = '';
    let suitabilitySummary = '';

    if (scores.overallScore >= 90) {
      headline = `⭐ Top Recommendation for ${preferences.profileId.replace('_', ' ').toUpperCase()}`;
      suitabilitySummary = `This route scored highest (${scores.overallScore}/100) because it strictly adheres to your accessibility and safety preferences, providing a seamless, stress-free journey with verified barrier-free transit.`;
    } else if (scores.overallScore >= 75) {
      headline = `✓ Viable Alternative Route (${scores.overallScore}/100)`;
      suitabilitySummary = `A strong secondary option with decent accessibility (${scores.accessibilityScore}/100), though with slightly higher walking distance or minor tradeoffs.`;
    } else {
      headline = `⚠️ Significant Barriers Detected (${scores.overallScore}/100)`;
      suitabilitySummary = `Not recommended for your current profile due to detected physical barriers (stairs, broken elevators, or excessive walking distances).`;
    }

    return {
      headline,
      whyRecommended,
      tradeOffs,
      barrierWarnings,
      suitabilitySummary
    };
  }
}
