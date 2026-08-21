
    const { useState, useEffect, useCallback, useRef } = React;

    // ==========================================
    // 1. DATASETS & MOCK DATA
    // ==========================================
    const ACCESSIBILITY_PROFILES = {
      wheelchair: {
        id: 'wheelchair',
        name: 'Wheelchair / Stroller',
        icon: '🦼',
        tagline: '100% Step-Free & Ramps',
        description: 'Guarantees 100% step-free pathways, operational elevators, low-floor vehicle ramps, and curb cutouts with minimal walking distances.',
        defaultPreferences: {
          profileId: 'wheelchair',
          stepFreeOnly: true,
          avoidStairs: true,
          maxWalkDistanceMeters: 300,
          preferSaferRoute: false,
          avoidCrowded: false,
          requireElevators: true,
          voiceAnnouncements: false,
          highContrast: false,
          fontSize: 'normal'
        }
      },
      elderly: {
        id: 'elderly',
        name: 'Reduced Mobility',
        icon: '🦯',
        tagline: 'Short Walks & Zero Stairs',
        description: 'Prioritizes shortest walking segments (< 250m), level pathways with benches, zero steep stairs, and direct routes with guaranteed seating.',
        defaultPreferences: {
          profileId: 'elderly',
          stepFreeOnly: true,
          avoidStairs: true,
          maxWalkDistanceMeters: 250,
          preferSaferRoute: true,
          avoidCrowded: false,
          requireElevators: true,
          voiceAnnouncements: false,
          highContrast: false,
          fontSize: 'normal'
        }
      },
      night_safety: {
        id: 'night_safety',
        name: 'Late-Night & Solo Safety',
        icon: '🌙',
        tagline: 'Bright Corridors & CCTV',
        description: 'Prioritizes maximum lighting (≥ 9.0/10), continuous CCTV coverage, emergency Blue-Light SOS kiosks, and staffed security hubs.',
        defaultPreferences: {
          profileId: 'night_safety',
          stepFreeOnly: false,
          avoidStairs: false,
          maxWalkDistanceMeters: 600,
          preferSaferRoute: true,
          avoidCrowded: false,
          requireElevators: false,
          voiceAnnouncements: true,
          highContrast: false,
          fontSize: 'normal'
        }
      },
      vision_hearing: {
        id: 'vision_hearing',
        name: 'Visual & Hearing Assist',
        icon: '👁️',
        tagline: 'Audio Cues & High Contrast',
        description: 'Prioritizes audible signals at crosswalks, tactile platform boarding strips, high-contrast visual signage, and screen-reader guidance.',
        defaultPreferences: {
          profileId: 'vision_hearing',
          stepFreeOnly: false,
          avoidStairs: false,
          maxWalkDistanceMeters: 500,
          preferSaferRoute: true,
          avoidCrowded: false,
          requireElevators: false,
          voiceAnnouncements: true,
          highContrast: true,
          fontSize: 'large'
        }
      },
      quiet_sensory: {
        id: 'quiet_sensory',
        name: 'Low Sensory & Calm',
        icon: '🎧',
        tagline: 'Low Crowds & Quiet Spaces',
        description: 'Filters out noisy construction zones, crowded peak-hour cars, and underground echo chambers for a low-stress sensory experience.',
        defaultPreferences: {
          profileId: 'quiet_sensory',
          stepFreeOnly: false,
          avoidStairs: false,
          maxWalkDistanceMeters: 600,
          preferSaferRoute: false,
          avoidCrowded: true,
          requireElevators: false,
          voiceAnnouncements: false,
          highContrast: false,
          fontSize: 'normal'
        }
      },
      standard: {
        id: 'standard',
        name: 'Standard Route',
        icon: '⚡',
        tagline: 'Fastest Direct Route',
        description: 'Standard multi-modal transit algorithm optimizing primarily for shortest travel duration and convenience.',
        defaultPreferences: {
          profileId: 'standard',
          stepFreeOnly: false,
          avoidStairs: false,
          maxWalkDistanceMeters: 1000,
          preferSaferRoute: false,
          avoidCrowded: false,
          requireElevators: false,
          voiceAnnouncements: false,
          highContrast: false,
          fontSize: 'normal'
        }
      }
    };

    const MOCK_TRANSIT_STOPS = {
      stop_gate: {
        id: 'stop_gate',
        name: 'Campus Main Gate & Transit Plaza',
        code: 'CMG-00',
        lat: 42.3582,
        lng: -71.0988,
        type: 'campus_hub',
        zone: 'Campus Main Entrance',
        lightingScore: 9.7,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: true,
        hasRamp: true,
        elevatorStatus: 'operational',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Heated Glass Enclosed Plaza Canopy',
        crowdLevel: 'moderate',
        description: 'Main campus entry hub with level low-floor bus boarding, ADA curb ramps, and 24/7 Blue Light SOS emergency kiosk.',
        features: ['Low-floor level boarding bays', '24/7 Blue Light SOS kiosk', 'High-intensity LED canopy lighting', 'CCTV monitored safe zone']
      },
      stop_lib: {
        id: 'stop_lib',
        name: 'University Central Library Hub',
        code: 'UCL-01',
        lat: 42.3601,
        lng: -71.0942,
        type: 'campus_hub',
        zone: 'West Campus Safe Corridor',
        lightingScore: 9.8,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: true,
        hasRamp: true,
        elevatorStatus: 'operational',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Heated Glass Enclosed Hub',
        crowdLevel: 'moderate',
        description: 'Primary accessible interchange on campus. Level boarding, tactile indicators, and automated wheelchair access bridge.',
        features: ['High-intensity LED lights', 'Emergency SOS Blue Light button', 'Wheelchair boarding zone', 'Visual & voice arrivals']
      },
      stop_metro: {
        id: 'stop_metro',
        name: 'Metro Central Station',
        code: 'MCS-12',
        lat: 42.3655,
        lng: -71.1037,
        type: 'metro_station',
        zone: 'Downtown Transit Center',
        lightingScore: 9.5,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: false,
        hasRamp: false,
        elevatorStatus: 'broken',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Major Underground Transit Hub',
        crowdLevel: 'high',
        description: 'Subway station with 18 concrete stairs at entrance. Primary elevator out of service for repair.',
        features: ['24/7 Transit Police Staffing', 'Braille direction boards', 'High visibility waiting bay']
      },
      stop_hosp: {
        id: 'stop_hosp',
        name: 'City General Hospital & Health Hub',
        code: 'CGH-04',
        lat: 42.3628,
        lng: -71.0765,
        type: 'medical_hub',
        zone: 'Medical District Safe Zone',
        lightingScore: 9.9,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: true,
        hasRamp: true,
        elevatorStatus: 'operational',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Hospital Main Canopy',
        crowdLevel: 'low',
        description: 'Hospital transit port. Level curb boarding with tactile strips, wheelchair assistance desk, and 24/7 escort.',
        features: ['Wheelchair lending kiosk', 'Security officer post', 'Level curb boarding', 'Heated passenger waiting bay']
      },
      stop_tech: {
        id: 'stop_tech',
        name: 'Innovation Tech Park',
        code: 'ITP-09',
        lat: 42.3702,
        lng: -71.0850,
        type: 'tech_campus',
        zone: 'North Innovation District',
        lightingScore: 9.1,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: true,
        hasRamp: true,
        elevatorStatus: 'operational',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Smart Solar Glass Shelter',
        crowdLevel: 'moderate',
        description: 'Modern glass platform with tactile paving, automatic low-floor bus ramp, and smart real-time arrival monitors.',
        features: ['Induction charging benches', 'Tactile sidewalk pathways', 'Emergency call phone']
      },
      stop_arts: {
        id: 'stop_arts',
        name: 'East Arts & Cultural District',
        code: 'EAA-07',
        lat: 42.3585,
        lng: -71.0820,
        type: 'street_stop',
        zone: 'East Side Cultural District',
        lightingScore: 6.2,
        cctvCovered: false,
        securityKioskNearby: false,
        blueLightSOS: false,
        stepFree: false,
        hasRamp: false,
        elevatorStatus: 'none',
        tactilePaving: false,
        audioAnnouncements: false,
        shelterType: 'Open Pole Stop',
        crowdLevel: 'moderate',
        description: 'Historic cobblestone area. Steep 8-inch curb step and dimmer heritage lighting. Avoid for wheelchair use.',
        features: ['Cobblestone sidewalk', 'Dim heritage street lamps', 'No weather shelter']
      },
      stop_res: {
        id: 'stop_res',
        name: 'North Student Residences',
        code: 'NSR-03',
        lat: 42.3735,
        lng: -71.0995,
        type: 'residence_stop',
        zone: 'North Campus Living Sector',
        lightingScore: 9.0,
        cctvCovered: true,
        securityKioskNearby: true,
        blueLightSOS: true,
        stepFree: true,
        hasRamp: true,
        elevatorStatus: 'operational',
        tactilePaving: true,
        audioAnnouncements: true,
        shelterType: 'Covered Glass Shed',
        crowdLevel: 'low',
        description: 'Residential campus stop with bright lighting, CCTV camera directly overhead, and emergency SOS pillar.',
        features: ['Residence hall security desk 20m away', 'SOS blue pillar', 'Level boarding platform']
      }
    };

    const MOCK_TRANSIT_LINES = {
      line_shuttle: {
        id: 'line_shuttle',
        name: 'SafeCorridor Campus Night Shuttle',
        shortName: 'Shuttle 1A',
        type: 'shuttle',
        color: '#10b981',
        textColor: '#ffffff',
        icon: '🛡️',
        frequencyMin: 8,
        stopsSequence: ['stop_gate', 'stop_lib', 'stop_hosp', 'stop_tech', 'stop_res'],
        crowdLevel: 'low',
        features: {
          lowFloorRamp: true,
          wheelchairBays: 3,
          audioAnnouncements: true,
          visualDisplay: true,
          onboardSafetyGuard: true,
          securityCameras: 4
        }
      },
      line_metro: {
        id: 'line_metro',
        name: 'Metro Blue Line (Downtown Subway)',
        shortName: 'Metro Blue',
        type: 'metro',
        color: '#3b82f6',
        textColor: '#ffffff',
        icon: '🚇',
        frequencyMin: 5,
        stopsSequence: ['stop_gate', 'stop_metro', 'stop_lib', 'stop_arts'],
        crowdLevel: 'high',
        features: {
          lowFloorRamp: true,
          wheelchairBays: 2,
          audioAnnouncements: true,
          visualDisplay: true,
          onboardSafetyGuard: false,
          securityCameras: 8
        }
      },
      line_bus4: {
        id: 'line_bus4',
        name: 'City Rapid Bus 4',
        shortName: 'Bus 4',
        type: 'bus',
        color: '#f59e0b',
        textColor: '#000000',
        icon: '🚌',
        frequencyMin: 12,
        stopsSequence: ['stop_gate', 'stop_lib', 'stop_arts', 'stop_hosp'],
        crowdLevel: 'moderate',
        features: {
          lowFloorRamp: true,
          wheelchairBays: 2,
          audioAnnouncements: true,
          visualDisplay: true,
          onboardSafetyGuard: false,
          securityCameras: 3
        }
      },
      line_green_rail: {
        id: 'line_green_rail',
        name: 'University Light Rail Green',
        shortName: 'Green Rail',
        type: 'light_rail',
        color: '#059669',
        textColor: '#ffffff',
        icon: '🚊',
        frequencyMin: 10,
        stopsSequence: ['stop_gate', 'stop_tech', 'stop_res', 'stop_lib'],
        crowdLevel: 'low',
        features: {
          lowFloorRamp: true,
          wheelchairBays: 4,
          audioAnnouncements: true,
          visualDisplay: true,
          onboardSafetyGuard: true,
          securityCameras: 6
        }
      }
    };

    const QUICK_PRESETS = [
      {
        id: 'preset_gate_to_lib',
        title: 'Main Gate ➔ Central Library',
        icon: '🏛️📚',
        originId: 'stop_gate',
        destId: 'stop_lib',
        description: 'Hackathon Primary Demo: 100% step-free SafeCorridor Shuttle vs subway stairs tradeoff.'
      },
      {
        id: 'preset_lib_to_metro',
        title: 'Library ➔ Metro Station',
        icon: '📚🚇',
        originId: 'stop_lib',
        destId: 'stop_metro',
        description: 'Demonstrates wheelchair & elevator avoidance vs fastest subway tradeoff.'
      },
      {
        id: 'preset_lib_to_hosp',
        title: 'Library ➔ Hospital Health Hub',
        icon: '🏥🦼',
        originId: 'stop_lib',
        destId: 'stop_hosp',
        description: '100% step-free safe corridor shuttle vs curbside bus with cobblestone hazard.'
      },
      {
        id: 'preset_tech_to_res',
        title: 'Tech Park ➔ Residences North',
        icon: '💻🏡',
        originId: 'stop_tech',
        destId: 'stop_res',
        description: 'Late-night lighted shuttle route with CCTV and zero stairs.'
      },
      {
        id: 'preset_arts_to_res',
        title: 'Arts District ➔ Residences',
        icon: '🎨🏠',
        originId: 'stop_arts',
        destId: 'stop_res',
        description: 'Shows barrier warnings on cobblestones and recommends safer lit paths.'
      }
    ];

    const INITIAL_COMMUNITY_REPORTS = [
      {
        id: 'rep_101',
        stopId: 'stop_metro',
        stopName: 'Metro Central Station',
        lineId: 'line_metro',
        lineName: 'Metro Blue Line (Downtown Sub)',
        type: 'broken_elevator',
        category: 'Accessibility Barrier',
        title: 'Broken Elevator at North Concourse',
        details: 'North mezzanine elevator is completely out of order with maintenance cones. Requires 18 stairs to reach boarding platform.',
        impact: 'Elevator status set to Inaccessible. Avoided in wheelchair routing.',
        timestamp: '12 mins ago',
        upvotes: 14,
        status: 'active',
        severity: 'critical'
      },
      {
        id: 'rep_102',
        stopId: 'stop_arts',
        stopName: 'Arts & Cultural District Alley',
        type: 'dim_lighting',
        category: 'Safety Issue',
        title: 'Cobblestone Pathway Dim Lighting Hazard',
        details: 'Curb cut is blocked by delivery crates and 2 streetlamps are flickering. Recommend using west detour corridor.',
        impact: 'Safety score reduced by 20% for nighttime walking.',
        timestamp: '28 mins ago',
        upvotes: 8,
        status: 'active',
        severity: 'medium'
      },
      {
        id: 'rep_103',
        lineId: 'line_metro',
        lineName: 'Metro Blue Line (Downtown Sub)',
        stopId: 'stop_metro',
        stopName: 'Metro Central Station',
        type: 'crowded',
        category: 'Crowding',
        title: 'Heavy Car Crowding & Zero Wheelchair Clearance',
        details: 'Subway cars at 95% occupancy during class change rush. Accessible bays blocked by standing passengers.',
        impact: 'Crowd level flagged as High.',
        timestamp: '35 mins ago',
        upvotes: 19,
        status: 'active',
        severity: 'high',
        crowdLevelReported: 'high'
      },
      {
        id: 'rep_104',
        lineId: 'line_bus4',
        lineName: 'City Rapid Transit Line 4',
        stopId: 'stop_lib',
        stopName: 'University Central Library Hub',
        type: 'delay',
        category: 'Transit Delay',
        title: 'City Bus 4 Running +8 Min Behind Schedule',
        details: 'Traffic backup along Commonwealth Ave. Recommend taking SafeCorridor Campus Night Shuttle instead.',
        impact: 'Wait time adjusted +8 mins.',
        timestamp: '42 mins ago',
        upvotes: 6,
        status: 'active',
        severity: 'medium',
        delayMinutesReported: 8
      },
      {
        id: 'rep_105',
        stopId: 'stop_hosp',
        stopName: 'City General Hospital & Health Hub',
        type: 'safe_verified',
        category: 'Safety Commendation',
        title: 'Bright Safe Corridor & Escort Staffed',
        details: 'Campus safety escort team active at medical hub. Level boarding ramp verified and clear of obstructions.',
        impact: 'Safety index verified at 9.9/10.',
        timestamp: '1 hour ago',
        upvotes: 27,
        status: 'active',
        severity: 'low'
      }
    ];

    const INITIAL_FLEET_DATA = [
      {
        vehicleId: 'SH-108',
        lineId: 'line_shuttle',
        lineName: 'SafeCorridor Campus Night Shuttle',
        driver: 'Officer M. Vasquez',
        occupancyPct: 35,
        crowdLevel: 'low',
        wheelchairBaysOccupied: 1,
        wheelchairBaysTotal: 3,
        rampStatus: 'Operational - Auto Ramp',
        nextStopId: 'stop_lib',
        etaNextStopSec: 75,
        speedKmh: 28,
        lastPingTime: 'Just now',
        emergencySosActive: false
      },
      {
        vehicleId: 'MB-402',
        lineId: 'line_metro',
        lineName: 'Metro Blue Line (Car 402)',
        driver: 'Cond. T. Reynolds',
        occupancyPct: 88,
        crowdLevel: 'high',
        wheelchairBaysOccupied: 2,
        wheelchairBaysTotal: 2,
        rampStatus: 'Bridge Plate Verified',
        nextStopId: 'stop_metro',
        etaNextStopSec: 140,
        speedKmh: 48,
        lastPingTime: '2s ago',
        emergencySosActive: false
      },
      {
        vehicleId: 'CB-214',
        lineId: 'line_bus4',
        lineName: 'City Rapid Transit Line 4',
        driver: 'Driver D. Kowalski',
        occupancyPct: 62,
        crowdLevel: 'moderate',
        wheelchairBaysOccupied: 0,
        wheelchairBaysTotal: 2,
        rampStatus: 'Operational - Auto Ramp',
        nextStopId: 'stop_arts',
        etaNextStopSec: 210,
        speedKmh: 22,
        lastPingTime: '5s ago',
        emergencySosActive: false
      },
      {
        vehicleId: 'GR-301',
        lineId: 'line_green_rail',
        lineName: 'University Light Rail Green',
        driver: 'Capt. E. Chen',
        occupancyPct: 20,
        crowdLevel: 'low',
        wheelchairBaysOccupied: 1,
        wheelchairBaysTotal: 4,
        rampStatus: 'Operational - Auto Ramp',
        nextStopId: 'stop_res',
        etaNextStopSec: 95,
        speedKmh: 35,
        lastPingTime: 'Just now',
        emergencySosActive: false
      }
    ];

    // ==========================================
    // 2. SERVICE LAYER (TRANSIT & SPEECH)
    // ==========================================
    class TransitService {
      static stopsCache = { ...MOCK_TRANSIT_STOPS };
      static reportsCache = null;
      static fleetCache = null;

      static async getStops() {
        return Promise.resolve(Object.values(this.stopsCache));
      }
      static async getLines() {
        return Promise.resolve(Object.values(MOCK_TRANSIT_LINES));
      }
      static getProfiles() {
        return Object.values(ACCESSIBILITY_PROFILES);
      }
      static getProfileById(id) {
        return ACCESSIBILITY_PROFILES[id] || ACCESSIBILITY_PROFILES.standard;
      }
      static getQuickPresets() {
        return QUICK_PRESETS;
      }

      static getCommunityReports() {
        if (this.reportsCache) return this.reportsCache;
        const saved = localStorage.getItem('accessride_community_reports');
        if (saved) {
          try {
            this.reportsCache = JSON.parse(saved);
            return this.reportsCache;
          } catch (e) {}
        }
        this.reportsCache = [...INITIAL_COMMUNITY_REPORTS];
        return this.reportsCache;
      }

      static addCommunityReport(reportData) {
        const reports = this.getCommunityReports();
        const newReport = {
          ...reportData,
          id: `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: 'Just now',
          upvotes: 1,
          status: 'active'
        };
        const updated = [newReport, ...reports];
        this.reportsCache = updated;
        localStorage.setItem('accessride_community_reports', JSON.stringify(updated));

        if (reportData.stopId && this.stopsCache[reportData.stopId]) {
          const stop = this.stopsCache[reportData.stopId];
          if (reportData.type === 'broken_elevator') {
            stop.elevatorStatus = 'broken';
          } else if (reportData.type === 'broken_ramp') {
            stop.hasRamp = false;
            stop.stepFree = false;
          } else if (reportData.type === 'crowded') {
            stop.crowdLevel = 'high';
          } else if (reportData.type === 'dim_lighting') {
            stop.lightingScore = Math.max(4.0, stop.lightingScore - 2.0);
          } else if (reportData.type === 'safe_verified') {
            stop.lightingScore = Math.min(10.0, stop.lightingScore + 0.5);
          }
        }
        return updated;
      }

      static resolveCommunityReport(reportId, resolutionNote) {
        const reports = this.getCommunityReports();
        const report = reports.find(r => r.id === reportId);
        if (report) {
          report.status = 'resolved';
          report.resolvedAt = 'Just now';
          report.resolutionNote = resolutionNote || 'Maintenance dispatched and barrier cleared.';

          if (report.stopId && this.stopsCache[report.stopId]) {
            const stop = this.stopsCache[report.stopId];
            if (report.type === 'broken_elevator') {
              stop.elevatorStatus = 'operational';
            } else if (report.type === 'broken_ramp') {
              stop.hasRamp = true;
              stop.stepFree = true;
            } else if (report.type === 'crowded') {
              stop.crowdLevel = 'moderate';
            }
          }
        }
        this.reportsCache = reports;
        localStorage.setItem('accessride_community_reports', JSON.stringify(reports));
        return reports;
      }

      static upvoteCommunityReport(reportId) {
        const reports = this.getCommunityReports();
        const report = reports.find(r => r.id === reportId);
        if (report) {
          report.upvotes += 1;
          this.reportsCache = reports;
          localStorage.setItem('accessride_community_reports', JSON.stringify(reports));
        }
        return reports;
      }

      static getFleetVehicles() {
        if (this.fleetCache) return this.fleetCache;
        const saved = localStorage.getItem('accessride_fleet_telemetry');
        if (saved) {
          try {
            this.fleetCache = JSON.parse(saved);
            return this.fleetCache;
          } catch (e) {}
        }
        this.fleetCache = [...INITIAL_FLEET_DATA];
        return this.fleetCache;
      }

      static updateFleetVehicle(vehicleId, updates) {
        const fleet = this.getFleetVehicles();
        const idx = fleet.findIndex(v => v.vehicleId === vehicleId);
        if (idx !== -1) {
          fleet[idx] = { ...fleet[idx], ...updates, lastPingTime: 'Just now' };
          this.fleetCache = fleet;
          localStorage.setItem('accessride_fleet_telemetry', JSON.stringify(fleet));
        }
        return fleet;
      }
    }

    class SpeechService {
      static enabled = false;
      static setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
        }
      }
      static speak(text) {
        if (!this.enabled || !('speechSynthesis' in window)) return;
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')));
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis error:', e);
        }
      }
    }

    // ==========================================
    // 3. ROUTING & RECOMMENDATION ENGINE
    // ==========================================
    class RoutingEngine {
      static calculateRoutes(originId, destId, preferences) {
        const origin = MOCK_TRANSIT_STOPS[originId];
        const dest = MOCK_TRANSIT_STOPS[destId];
        if (!origin || !dest || originId === destId) return [];

        const rawCandidates = [];

        // Route 1: SafeCorridor Campus Night Shuttle
        rawCandidates.push(this.buildShuttleRoute(origin, dest, MOCK_TRANSIT_LINES.line_shuttle, preferences));

        // Route 2: Metro Blue Line (Fastest, but Stairs & Broken Elevator at Metro Central)
        rawCandidates.push(this.buildMetroRoute(origin, dest, MOCK_TRANSIT_LINES.line_metro, preferences));

        // Route 3: City Rapid Bus 4
        rawCandidates.push(this.buildBusRoute(origin, dest, MOCK_TRANSIT_LINES.line_bus4, preferences));

        // Route 4: University Light Rail Green
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

        // Sort descending by overall match score
        scoredCandidates.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

        if (scoredCandidates.length > 0) {
          scoredCandidates[0].isRecommended = true;
          if (!scoredCandidates[0].badges.includes('⭐ Top Recommendation')) {
            scoredCandidates[0].badges.unshift('⭐ Top Recommendation');
          }
        }

        return scoredCandidates;
      }

      static buildShuttleRoute(origin, dest, line, prefs) {
        const segs = [
          {
            type: 'walk',
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

      static buildMetroRoute(origin, dest, line, prefs) {
        const segs = [
          {
            type: 'walk',
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

      static buildBusRoute(origin, dest, line, prefs) {
        const segs = [
          {
            type: 'walk',
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

      static buildGreenRailRoute(origin, dest, line, prefs) {
        const segs = [
          {
            type: 'walk',
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

      static scoreRoute(route, prefs) {
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

        let speedScore = Math.max(20, Math.min(100, Math.round(100 - (route.totalDurationMin * 2.5))));

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

      static generateExplanation(route, scores, prefs) {
        const whyRecommended = [];
        const tradeOffs = [];
        const barrierWarnings = [];
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

    // ==========================================
    // 4. REACT COMPONENTS
    // ==========================================

    // Component: Navbar
    const Navbar = ({
      currentTab,
      onSelectTab,
      preferences,
      onUpdatePreferences,
      onOpenPreferencesModal,
      onOpenReportModal,
      activeReportCount = 0
    }) => {
      return (
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Brand Logo */}
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('home')}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20 text-white font-bold text-xl ring-2 ring-emerald-400/30">
                  <span>🦼</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xl tracking-tight text-white">Access<span className="text-emerald-400">Ride</span></span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800/60">
                      v1.0 Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">Safe & Accessible Transit Navigator</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                <button
                  id="navTabHome"
                  onClick={() => onSelectTab('home')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    currentTab === 'home'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>🏠</span>
                  <span>Home</span>
                </button>

                <button
                  id="navTabPlanner"
                  onClick={() => onSelectTab('planner')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    currentTab === 'planner'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>🗺️</span>
                  <span>Route Planner</span>
                </button>

                <button
                  id="navTabOperator"
                  onClick={() => onSelectTab('operator')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    currentTab === 'operator'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>🏢</span>
                  <span className="hidden sm:inline">Operator Command</span>
                  <span className="sm:hidden">Command</span>
                  {activeReportCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse ml-1">
                      {activeReportCount}
                    </span>
                  )}
                </button>
              </nav>

              {/* Action & Accessibility Controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {onOpenReportModal && (
                  <button
                    id="navReportBtn"
                    onClick={onOpenReportModal}
                    title="Report Broken Elevator, Obstruction or Delay"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition shadow-sm"
                  >
                    <span>⚠️</span>
                    <span className="hidden md:inline">Report Issue</span>
                  </button>
                )}

                <button
                  id="openPreferencesBtn"
                  onClick={onOpenPreferencesModal}
                  title="Customize Accessibility Preferences"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <span>⚙️</span>
                  <span className="hidden lg:inline">Preferences</span>
                </button>

                <button
                  id="toggleHighContrastBtn"
                  onClick={() => onUpdatePreferences({ highContrast: !preferences.highContrast })}
                  title="Toggle WCAG AAA High-Contrast Mode"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
                    preferences.highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-400/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>👁️</span>
                  <span className="hidden xl:inline">{preferences.highContrast ? 'Contrast: ON' : 'Contrast'}</span>
                </button>

                <button
                  id="toggleVoiceCuesBtn"
                  onClick={() => onUpdatePreferences({ voiceAnnouncements: !preferences.voiceAnnouncements })}
                  title="Toggle Audio Voice Guidance Announcements"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border ${
                    preferences.voiceAnnouncements
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🔊</span>
                  <span className="hidden xl:inline">{preferences.voiceAnnouncements ? 'Voice: ON' : 'Voice'}</span>
                </button>
              </div>

            </div>
          </div>
        </header>
      );
    };

    // Component: HomeScreen
    const HomeScreen = ({
      profiles,
      stops,
      presets,
      preferences,
      reports = [],
      onSelectProfile,
      onSelectPreset,
      onStartPlanning,
      onOpenPreferencesModal,
      onOpenReportModal,
      onUpvoteReport
    }) => {
      const currentProfile = profiles.find(p => p.id === preferences.profileId) || profiles[0];

      return (
        <div className="space-y-10 pb-12 animate-fadeIn">
          
          {/* Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="animate-pulse">●</span>
                <span>Safer & Dignified Transit Navigator</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Navigate your campus with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">confidence, safety & zero barriers</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
                AccessRide prioritizes <strong>your accessibility and safety needs</strong> over pure speed. 
                Discover verified 100% step-free pathways, avoid broken elevators and stairs, and travel along illuminated corridors with emergency SOS protection.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  id="heroPlanTripBtn"
                  onClick={onStartPlanning}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>🗺️ Plan an Accessible Journey</span>
                  <span>➔</span>
                </button>

                {onOpenReportModal && (
                  <button
                    id="heroReportIssueBtn"
                    onClick={onOpenReportModal}
                    className="px-5 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-sm border border-amber-500/40 transition flex items-center space-x-2"
                  >
                    <span>⚠️ Report Barrier / Delay</span>
                  </button>
                )}

                <button
                  onClick={onOpenPreferencesModal}
                  className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition"
                >
                  <span>⚙️ Customize Mobility Needs</span>
                </button>
              </div>
            </div>
          </section>

          {/* Step 1: Profile Selector */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1: Choose Your Needs</span>
                <h2 className="text-2xl font-black text-white">How would you like to travel today?</h2>
              </div>
              <button
                onClick={onOpenPreferencesModal}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline self-start sm:self-auto"
              >
                Adjust Granular Filters &gt;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {profiles.map((p) => {
                const isSelected = preferences.profileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfile(p.id)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/50'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl">{p.icon}</span>
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{p.tagline}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currentProfile.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">Active Profile: {currentProfile.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      {currentProfile.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{currentProfile.description}</p>
                </div>
              </div>
              <button
                onClick={onStartPlanning}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
              >
                Find Routes with this Profile ➔
              </button>
            </div>
          </section>

          {/* Step 2: Presets */}
          <section>
            <div className="mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Quick Demos & Popular Routes</span>
              <h3 className="text-xl font-bold text-white">Explore Common Accessible Routes</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`bg-slate-900/70 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between ${
                    preset.id === 'preset_gate_to_lib'
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-emerald-500/60 hover:shadow-emerald-950/40'
                  }`}
                >
                  <div>
                    {preset.id === 'preset_gate_to_lib' && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider mb-2">
                        ⭐ Primary Demo
                      </span>
                    )}
                    <div className="flex items-center space-x-2 text-2xl mb-2">
                      <span>{preset.icon}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition mb-1">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">{preset.description}</p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 pt-2 border-t border-slate-800">
                    <span>View Ranked Routes</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Passenger Barrier & Transit Pulse Alerts */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Live Community Pulse & Real-Time Hazards</span>
                </span>
                <h3 className="text-xl font-bold text-white">Passenger-Reported Barrier Updates</h3>
              </div>
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <span>⚠️</span>
                  <span>Submit Live Barrier Report</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.slice(0, 6).map((report) => {
                const isResolved = report.status === 'resolved';
                return (
                  <div
                    key={report.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      isResolved
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : report.severity === 'critical'
                        ? 'bg-red-950/40 border-red-800/80 shadow-md shadow-red-950/20'
                        : report.severity === 'high'
                        ? 'bg-amber-950/30 border-amber-800/60'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          isResolved
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : report.severity === 'critical'
                            ? 'bg-red-900/80 text-red-200 border-red-700'
                            : report.severity === 'high'
                            ? 'bg-amber-900/80 text-amber-200 border-amber-700'
                            : 'bg-blue-900/60 text-blue-200 border-blue-700'
                        }`}>
                          {isResolved ? '✓ Resolved' : `${report.severity} Severity`}
                        </span>
                        <span className="text-[10px] text-slate-400">{report.timestamp}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{report.title}</h4>
                      <p className="text-xs text-slate-300 mb-2">{report.details}</p>
                      
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5 mb-3">
                        <div><strong>Location:</strong> {report.stopName}</div>
                        {report.lineName && <div><strong>Line:</strong> {report.lineName}</div>}
                        <div className="text-emerald-400"><strong>Routing Impact:</strong> {report.impact}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 text-[11px]">{report.category}</span>
                      {onUpvoteReport && !isResolved && (
                        <button
                          onClick={() => onUpvoteReport(report.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1"
                        >
                          <span>👍</span>
                          <span>{report.upvotes} Confirmations</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Pillars */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-2xl mb-4 text-emerald-400">
                🦼
              </div>
              <h4 className="text-base font-bold text-white mb-2">100% Step-Free Validation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guarantees routes with electric low-floor vehicle ramps, ADA curb ramps, and verified elevator access to eliminate physical barriers.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-2xl mb-4 text-blue-400">
                🛡️
              </div>
              <h4 className="text-base font-bold text-white mb-2">Safe Lit Corridors</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Routes scored by lighting intensity (up to 10/10), active CCTV coverage, 24/7 Blue-Light SOS kiosks, and security escort services.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-2xl mb-4 text-amber-400">
                🧠
              </div>
              <h4 className="text-base font-bold text-white mb-2">Transparent Route AI</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plain-English explanations for every route choice. Understand exactly why a route was recommended and what tradeoffs it avoids.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-2xl mb-4 text-red-400">
                🛗
              </div>
              <h4 className="text-base font-bold text-white mb-2">Barrier Hazard Avoidance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically reroutes around out-of-service elevators, steep stair-only concourses, cobblestone vibration zones, and high-rush crowds.
              </p>
            </div>
          </section>

          {/* Stops status grid */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Network Transparency</span>
                <h3 className="text-xl font-bold text-white">Live Station & Transit Hubs Status</h3>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Step-Free</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span>Barrier Alert</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stops.map((stop) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stop.zone}</span>
                      <h4 className="text-sm font-bold text-white">{stop.name}</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {stop.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                    <div className={`px-2 py-1 rounded flex items-center space-x-1.5 font-semibold ${
                      stop.stepFree ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50' : 'bg-red-950/70 text-red-300 border border-red-800/50'
                    }`}>
                      <span>{stop.stepFree ? '✓' : '⚠️'}</span>
                      <span>{stop.stepFree ? 'Step-Free' : 'Has Stairs'}</span>
                    </div>

                    <div className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 flex items-center space-x-1.5">
                      <span>💡</span>
                      <span>Light: {stop.lightingScore}/10</span>
                    </div>

                    <div className={`px-2 py-1 rounded flex items-center space-x-1.5 font-medium ${
                      stop.elevatorStatus === 'operational'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                        : stop.elevatorStatus === 'broken'
                        ? 'bg-red-950/70 text-red-300 border border-red-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span>🛗</span>
                      <span>Elev: {stop.elevatorStatus}</span>
                    </div>

                    <div className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1.5">
                      <span>👥</span>
                      <span className="capitalize">{stop.crowdLevel}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">{stop.description}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      );
    };

    // Component: PreferenceModal
    const PreferenceModal = ({ isOpen, onClose, preferences, onSavePreferences }) => {
      const [localPrefs, setLocalPrefs] = useState(preferences);

      useEffect(() => {
        setLocalPrefs(preferences);
      }, [preferences, isOpen]);

      if (!isOpen) return null;

      const handleSelectProfile = (profileId) => {
        const profile = ACCESSIBILITY_PROFILES[profileId];
        if (profile) {
          setLocalPrefs({
            ...profile.defaultPreferences,
            highContrast: localPrefs.highContrast,
            fontSize: localPrefs.fontSize,
            voiceAnnouncements: localPrefs.voiceAnnouncements
          });
        }
      };

      const handleSave = () => {
        onSavePreferences(localPrefs);
        onClose();
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">♿</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Accessibility & Travel Preferences</h2>
                  <p className="text-xs text-slate-400">Tailor routing algorithms to your specific mobility and safety needs</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Choose Mobility & Safety Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Object.values(ACCESSIBILITY_PROFILES).map((p) => {
                    const isSelected = localPrefs.profileId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProfile(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                            : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">{p.icon}</span>
                          <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{p.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{p.tagline}</p>
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                  2. Granular Physical Barrier Controls
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="text-sm font-bold text-white block">100% Step-Free Only</span>
                      <span className="text-xs text-slate-400">Strictly exclude any non-ramp or curb steps</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.stepFreeOnly}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, stepFreeOnly: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="text-sm font-bold text-white block">Avoid All Stairs</span>
                      <span className="text-xs text-slate-400">Never suggest routes requiring staircases</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.avoidStairs}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, avoidStairs: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="text-sm font-bold text-white block">Prefer Illuminated Corridors</span>
                      <span className="text-xs text-slate-400">Route via high-intensity lighting (≥9.0/10)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.preferSaferRoute}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, preferSaferRoute: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <span className="text-sm font-bold text-white block">Avoid Heavy Crowds</span>
                      <span className="text-xs text-slate-400">Penalize crowded vehicles and platforms</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPrefs.avoidCrowded}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, avoidCrowded: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  3. Maximum Comfortable Walking Distance: <span className="text-emerald-400 font-bold">{localPrefs.maxWalkDistanceMeters} meters</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={localPrefs.maxWalkDistanceMeters}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, maxWalkDistanceMeters: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
              >
                Apply Preferences
              </button>
            </div>

          </div>
        </div>
      );
    };

    // Component: JourneyMode (Turn-by-turn navigation & safety check-in)
    const JourneyMode = ({
      route,
      preferences,
      onCompleteJourney,
      onExitJourney,
      onOpenReportModal,
      voiceEnabled
    }) => {
      const [currentStepIndex, setCurrentStepIndex] = useState(0);
      const [timerSeconds, setTimerSeconds] = useState(15 * 60);
      const [isTimerActive, setIsTimerActive] = useState(true);
      const [isCheckinConfirmed, setIsCheckinConfirmed] = useState(false);
      const [isSosOpen, setIsSosOpen] = useState(false);
      const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
      const [isFakeCallConnected, setIsFakeCallConnected] = useState(false);
      const [completionToast, setCompletionToast] = useState(false);

      const steps = route.segments;
      const currentStep = steps[currentStepIndex] || steps[0];
      const progressPct = Math.round(((currentStepIndex + 1) / steps.length) * 100);

      useEffect(() => {
        if (voiceEnabled) {
          SpeechService.speak(`Starting accessible journey for ${route.title}. Step 1: ${currentStep.instructions}`);
        }
      }, []);

      useEffect(() => {
        if (!isTimerActive) return;

        const interval = setInterval(() => {
          setTimerSeconds(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              if (voiceEnabled) {
                SpeechService.speak('Safety check-in timer expired! Automated emergency alert simulated.');
              }
              setIsSosOpen(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }, [isTimerActive, voiceEnabled]);

      const formatTimer = (secs) => {
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
          SpeechService.speak(`Step ${currentStepIndex + 1} of ${steps.length}: ${currentStep.instructions}.`);
        }
      };

      const handleSnoozeTimer = () => {
        setTimerSeconds(prev => prev + 5 * 60);
        if (voiceEnabled) {
          SpeechService.speak('Safety timer extended by 5 minutes.');
        }
      };

      const handleConfirmCheckin = () => {
        setIsCheckinConfirmed(true);
        if (voiceEnabled) {
          SpeechService.speak('Safety check-in confirmed. You are safe and on schedule.');
        }
        setTimeout(() => setIsCheckinConfirmed(false), 3000);
      };

      const handleCompleteArrival = () => {
        setIsTimerActive(false);
        setCompletionToast(true);
        if (voiceEnabled) {
          SpeechService.speak('Safe arrival confirmed! Journey completed safely.');
        }
        setTimeout(() => {
          onCompleteJourney();
        }, 2200);
      };

      return (
        <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
          
          {/* Top Live Navigation Header Bar */}
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
                  onClick={() => {
                    setIsFakeCallOpen(true);
                    setIsFakeCallConnected(false);
                  }}
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
                <span className="text-emerald-400">Step {currentStepIndex + 1} of {steps.length}</span>
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

          {/* Current Step Active Guidance Hero */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 ring-1 ring-emerald-500/30">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-md shadow-emerald-600/30 uppercase tracking-wider">
                Current Action • Step {currentStepIndex + 1}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                ~{currentStep.durationMin} Minutes
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {currentStep.instructions}
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                From <strong className="text-white">{currentStep.fromName}</strong> ➔ <strong className="text-white">{currentStep.toName}</strong>
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
                <span>{currentStepIndex === steps.length - 1 ? '🛡️ Arrive at Destination ➔' : '✓ Mark Step Complete & Continue ➔'}</span>
              </button>
            </div>

          </div>

          {/* Automated Safety Check-In Timer Card */}
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
                    Verifies safe progress. If countdown reaches zero, an emergency beacon is sent to your trusted contacts.
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

              <div className="flex items-center space-x-2">
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

          {/* Full Turn-by-Turn Timeline Steps */}
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
                    <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isDone
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : isCurrent
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isDone ? '✓' : sIdx + 1}
                    </div>

                    <div className={`p-4 rounded-2xl border ml-2 transition ${
                      isCurrent
                        ? 'bg-slate-950 border-emerald-500/60 shadow-lg'
                        : isDone
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className={isCurrent ? 'text-emerald-400' : 'text-slate-300'}>
                          {seg.type === 'walk' ? `Walk (${seg.distanceMeters}m)` : `Transit (${seg.line?.shortName})`}
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

          {/* Complete Journey Safe Arrival Card */}
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

          {/* Safe Arrival Toast Confirmation Modal */}
          {completionToast && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-slate-900 border border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
                  🎉
                </div>
                <h2 className="text-2xl font-black text-white">Safe Arrival Confirmed!</h2>
                <p className="text-xs text-slate-300">
                  Your journey along the verified safe lit corridor has been recorded. All emergency timers stopped.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold">
                  ✓ Destination Reached: {route.segments[route.segments.length - 1].toName}
                </div>
              </div>
            </div>
          )}

          {/* SOS Emergency Modal */}
          {isSosOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" role="dialog">
              <div className="bg-slate-900 border border-red-600 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🚨</span>
                    <h2 className="text-lg font-black text-white">1-Tap Emergency Assistance</h2>
                  </div>
                  <button onClick={() => setIsSosOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
                </div>

                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/80 text-xs text-red-200 space-y-1">
                  <div className="font-bold text-white text-sm">📍 Live GPS Packet Broadcasted:</div>
                  <div><strong>Route:</strong> {route.title} (Step {currentStepIndex + 1})</div>
                  <div><strong>Coordinates:</strong> 42.3601° N, -71.0942° W</div>
                  <div><strong>Corridor:</strong> West Campus Safe Corridor (Blue-Light Enabled)</div>
                </div>

                <div className="space-y-2">
                  <a href="tel:911" className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-center block text-sm shadow-lg shadow-red-600/30 transition">
                    📞 Call 911 Emergency Services
                  </a>
                  <a href="tel:6175550199" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center block text-xs transition">
                    🛡️ Call Campus Safety Escort Desk (24/7)
                  </a>
                </div>

                <button onClick={() => setIsSosOpen(false)} className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                  Cancel / Close Emergency Beacon
                </button>
              </div>
            </div>
          )}

          {/* Fake Call Decoy Modal */}
          {isFakeCallOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" role="dialog">
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
                      onClick={() => setIsFakeCallOpen(false)}
                      className="w-14 h-14 rounded-full bg-red-600 text-white text-xl flex items-center justify-center font-bold shadow-lg hover:bg-red-500 transition"
                      title="Decline"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => {
                        setIsFakeCallConnected(true);
                        if (voiceEnabled) {
                          SpeechService.speak('Hey! I am tracking your bus ride right now. I am waiting for you at the library stop right near the front door. You are just two minutes away, see you soon!');
                        }
                      }}
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
                      onClick={() => setIsFakeCallOpen(false)}
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

    // Component: RouteCard
    const RouteCard = ({
      route,
      isSelected,
      preferences,
      onSelectRoute,
      onOpenDetails,
      onStartJourney
    }) => {
      const isBest = route.isRecommended;

      return (
        <div
          onClick={() => onSelectRoute(route)}
          className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-5 ${
            isSelected
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-950/40'
              : isBest
              ? 'bg-slate-900/90 border-emerald-500/80 hover:border-emerald-400 shadow-lg shadow-emerald-950/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {isBest && (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 flex items-center space-x-1">
                  <span>⭐</span>
                  <span>TOP RECOMMENDED</span>
                </span>
              )}
              {route.badges.slice(isBest ? 1 : 0, 3).map((badge, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    badge.includes('Step-Free') || badge.includes('Safe')
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : badge.includes('Stairs') || badge.includes('Broken')
                      ? 'bg-red-950/80 text-red-300 border-red-800/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-end">
              <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center space-x-1 ${
                route.scores.overallScore >= 90
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : route.scores.overallScore >= 75
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span>{route.scores.overallScore}</span>
                <span className="text-[10px] opacity-80">/100 Match</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{route.title}</span>
            </h4>
            <p className="text-xs text-slate-400">{route.subtitle}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-sm font-black text-white">{route.totalDurationMin} min</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Walking</span>
              <span className={`text-sm font-black ${route.totalWalkDistanceMeters > preferences.maxWalkDistanceMeters ? 'text-amber-400' : 'text-emerald-400'}`}>
                {route.totalWalkDistanceMeters}m
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Step-Free</span>
              <span className={`text-sm font-black ${route.stepFree ? 'text-emerald-400' : 'text-red-400'}`}>
                {route.stepFree ? '100% Yes' : 'No (Stairs)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety</span>
              <span className="text-sm font-black text-blue-400">{route.scores.safetyScore}/100</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border mb-3 text-xs ${
            isBest
              ? 'bg-emerald-950/40 border-emerald-800/50'
              : route.explanation.barrierWarnings.length > 0
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                <span>🧠</span>
                <span>Why this route for {preferences.profileId.toUpperCase()}:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Algorithmic Insight</span>
            </div>

            {route.explanation.whyRecommended.length > 0 && (
              <ul className="space-y-1 text-slate-300 mb-2">
                {route.explanation.whyRecommended.map((bullet, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 text-[11px] leading-tight">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {route.explanation.tradeOffs.length > 0 && (
              <p className="text-[11px] text-slate-400 italic mb-2">
                <strong>Tradeoff:</strong> {route.explanation.tradeOffs[0]}
              </p>
            )}

            {route.explanation.barrierWarnings.length > 0 && (
              <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 space-y-1">
                {route.explanation.barrierWarnings.map((warn, idx) => (
                  <div key={idx} className="text-[11px] font-semibold flex items-start space-x-1">
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoute(route);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isSelected ? '✓ On Map' : '🗺️ Map'}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(route);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition flex items-center space-x-1"
              >
                <span>Details</span>
                <span>➔</span>
              </button>
            </div>

            {onStartJourney && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartJourney(route);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
              >
                <span>▶</span>
                <span>Start Journey</span>
              </button>
            )}
          </div>

        </div>
      );
    };

    // Component: RouteDetailModal
    const RouteDetailModal = ({ route, onClose, onStartJourney }) => {
      if (!route) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Detailed Itinerary
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{route.totalDurationMin} min total</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{route.title}</h2>
              </div>

              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block">Total Walking</span>
                  <span className="text-sm font-bold text-emerald-400">{route.totalWalkDistanceMeters} meters</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Step-Free Status</span>
                  <span className={`text-sm font-bold ${route.stepFree ? 'text-emerald-400' : 'text-red-400'}`}>
                    {route.stepFree ? '✓ 100% Step-Free' : '⚠️ Has Stairs'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Corridor Lighting</span>
                  <span className="text-sm font-bold text-blue-400">💡 {route.lightingAverage}/10 Average</span>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {route.segments.map((segment, index) => {
                  const isWalk = segment.type === 'walk';

                  return (
                    <div key={index} className="relative">
                      <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isWalk
                          ? 'bg-slate-800 text-slate-300 border-slate-600'
                          : 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                      }`}>
                        {isWalk ? '🚶' : '🚌'}
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 ml-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Step {index + 1}: {isWalk ? `Walk (${segment.distanceMeters}m)` : `Transit (${segment.line?.shortName})`}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">~{segment.durationMin} min</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 mb-1.5">
                          {segment.fromName} ➔ {segment.toName}
                        </h4>

                        <p className="text-xs text-slate-300 mb-3">{segment.instructions}</p>

                        {segment.accessibilityNotes && segment.accessibilityNotes.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Accessibility Guidance</span>
                            {segment.accessibilityNotes.map((note, noteIdx) => (
                              <div
                                key={noteIdx}
                                className={`p-1.5 rounded flex items-start space-x-1.5 ${
                                  note.includes('⚠️') || note.includes('🚨')
                                    ? 'bg-red-950/60 text-red-300 border border-red-900/60 font-semibold'
                                    : 'bg-slate-900 text-slate-300'
                                }`}
                              >
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Close Itinerary
              </button>

              {onStartJourney && (
                <button
                  onClick={() => {
                    onClose();
                    onStartJourney(route);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>▶ Start Guided Journey</span>
                </button>
              )}
            </div>

          </div>
        </div>
      );
    };

    // Component: MapView
    const MapView = ({ stops, selectedRoute, onSetOrigin, onSetDest, onReportStop }) => {
      const mapContainerRef = useRef(null);
      const mapInstanceRef = useRef(null);
      const routeLayersRef = useRef([]);
      const markersRef = useRef({});

      useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        if (typeof L === 'undefined') return;

        const map = L.map(mapContainerRef.current, {
          center: [42.3650, -71.0950],
          zoom: 14,
          zoomControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;

        renderStops(map, stops);

        return () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      }, []);

      const renderStops = (map, stopList) => {
        Object.values(markersRef.current).forEach((m) => m.remove());
        markersRef.current = {};

        stopList.forEach((stop) => {
          const isBarrier = stop.elevatorStatus === 'broken' || !stop.stepFree;
          const isHighSafe = stop.lightingScore >= 9.2;

          let markerBg = '#10b981';
          let iconSymbol = '🦼';

          if (isBarrier) {
            markerBg = '#ef4444';
            iconSymbol = '⚠️';
          } else if (isHighSafe) {
            markerBg = '#059669';
            iconSymbol = '🛡️';
          }

          const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div class="custom-marker-pin" style="background-color: ${markerBg};" title="${stop.name}">
                <span class="custom-marker-icon">${iconSymbol}</span>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -17]
          });

          const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);

          const popupHtml = `
            <div style="min-width: 230px; font-family: 'Inter', sans-serif; padding: 12px; color: #0f172a;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${stop.zone}</span>
                <span style="font-size: 11px; font-weight: 800; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${stop.code}</span>
              </div>
              <h4 style="font-size: 13px; font-weight: 800; margin: 0 0 6px 0; color: #0f172a;">${stop.name}</h4>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 8px;">
                <div style="padding: 2px 6px; border-radius: 4px; background: ${stop.stepFree ? '#dcfce7' : '#fee2e2'}; color: ${stop.stepFree ? '#166534' : '#991b1b'}; font-weight: 700;">
                  ${stop.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
                </div>
                <div style="padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155; font-weight: 600;">
                  💡 ${stop.lightingScore}/10 Light
                </div>
                <div style="padding: 2px 6px; border-radius: 4px; background: ${stop.elevatorStatus === 'broken' ? '#fee2e2' : '#f1f5f9'}; color: ${stop.elevatorStatus === 'broken' ? '#991b1b' : '#334155'}; font-weight: 600;">
                  🛗 Elev: ${stop.elevatorStatus}
                </div>
                <div style="padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #334155; font-weight: 600;">
                  👥 ${stop.crowdLevel}
                </div>
              </div>

              <div style="display: flex; gap: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-bottom: 4px;">
                <button id="popup-origin-${stop.id}" style="flex: 1; padding: 5px 8px; font-size: 11px; font-weight: 700; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                  Set Origin
                </button>
                <button id="popup-dest-${stop.id}" style="flex: 1; padding: 5px 8px; font-size: 11px; font-weight: 700; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                  Set Dest
                </button>
              </div>

              ${onReportStop ? `
                <button id="popup-report-${stop.id}" style="width: 100%; padding: 4px 6px; font-size: 10px; font-weight: 700; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 6px; cursor: pointer; text-align: center;">
                  ⚠️ Report Barrier or Delay at this Stop
                </button>
              ` : ''}
            </div>
          `;

          marker.bindPopup(popupHtml);

          marker.on('popupopen', () => {
            const originBtn = document.getElementById(`popup-origin-${stop.id}`);
            const destBtn = document.getElementById(`popup-dest-${stop.id}`);
            const reportBtn = document.getElementById(`popup-report-${stop.id}`);
            if (originBtn) {
              originBtn.onclick = () => {
                onSetOrigin(stop.id);
                marker.closePopup();
              };
            }
            if (destBtn) {
              destBtn.onclick = () => {
                onSetDest(stop.id);
                marker.closePopup();
              };
            }
            if (reportBtn && onReportStop) {
              reportBtn.onclick = () => {
                onReportStop(stop.id);
                marker.closePopup();
              };
            }
          });

          markersRef.current[stop.id] = marker;
        });
      };

      useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || typeof L === 'undefined') return;

        routeLayersRef.current.forEach(layer => layer.remove());
        routeLayersRef.current = [];

        if (!selectedRoute) return;

        const allPositions = [];

        selectedRoute.polylines.forEach(poly => {
          const lineLayer = L.polyline(poly.positions, {
            color: poly.color,
            weight: poly.weight,
            dashArray: poly.dashArray || null,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          routeLayersRef.current.push(lineLayer);
          poly.positions.forEach(p => allPositions.push(p));
        });

        if (allPositions.length > 0) {
          const bounds = L.latLngBounds(allPositions);
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true
          });
        }
      }, [selectedRoute]);

      return (
        <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

          <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 pointer-events-auto max-w-[200px]">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Map Legend</span>
              <span className="text-[10px] text-emerald-400">Live</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span>100% Step-Free Hub</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-emerald-700 flex-shrink-0"></span>
              <span>Safe Lit Corridor</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <span>Barrier / Broken Elev</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 flex-shrink-0"></span>
              <span>Walking Path</span>
            </div>
          </div>

          {selectedRoute && (
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md border border-emerald-500/80 rounded-xl p-3 shadow-xl max-w-sm">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white">Visualizing: {selectedRoute.title}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">{selectedRoute.summary}</p>
            </div>
          )}
        </div>
      );
    };

    // Component: RoutePlanner
    const RoutePlanner = ({
      stops,
      presets,
      originId,
      destId,
      onChangeOrigin,
      onChangeDest,
      onSwapLocations,
      onCalculateRoutes,
      onSelectPreset,
      routes,
      selectedRoute,
      onSelectRoute,
      onOpenDetails,
      preferences,
      onUpdatePreferences,
      onOpenPreferencesModal,
      onOpenReportModal,
      onReportStop,
      onStartJourney
    }) => {
      return (
        <div className="space-y-6 pb-16 animate-fadeIn">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Needs:</span>
                <button
                  onClick={onOpenPreferencesModal}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900 transition"
                  title="Click to customize profile"
                >
                  <span>♿</span>
                  <span className="capitalize">{preferences.profileId.replace('_', ' ')} Profile</span>
                  <span className="text-[10px] opacity-70">✏️</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => onUpdatePreferences({ stepFreeOnly: !preferences.stepFreeOnly })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                    preferences.stepFreeOnly
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  🦼 Step-Free: {preferences.stepFreeOnly ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => onUpdatePreferences({ avoidStairs: !preferences.avoidStairs })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                    preferences.avoidStairs
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  🪜 Avoid Stairs: {preferences.avoidStairs ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => onUpdatePreferences({ preferSaferRoute: !preferences.preferSaferRoute })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                    preferences.preferSaferRoute
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  🛡️ Safer Route: {preferences.preferSaferRoute ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => onUpdatePreferences({ avoidCrowded: !preferences.avoidCrowded })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition border ${
                    preferences.avoidCrowded
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  👥 Avoid Crowds: {preferences.avoidCrowded ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={onOpenPreferencesModal}
                  className="px-2.5 py-1 rounded-lg font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                >
                  ⚙️ More Filters...
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              <div className="md:col-span-5">
                <label htmlFor="originSelectInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <span className="text-emerald-400">📍</span>
                  <span>Starting Stop / Origin</span>
                </label>
                <select
                  id="originSelectInput"
                  value={originId}
                  onChange={(e) => onChangeOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                >
                  <option value="">Select origin location...</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-center">
                <button
                  type="button"
                  id="swapLocationsBtn"
                  onClick={onSwapLocations}
                  title="Swap Origin and Destination"
                  className="w-full md:w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-sm transition"
                >
                  ⇄ <span className="md:hidden ml-2">Swap Locations</span>
                </button>
              </div>

              <div className="md:col-span-5">
                <label htmlFor="destSelectInput" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <span className="text-blue-400">🏁</span>
                  <span>Destination Stop</span>
                </label>
                <select
                  id="destSelectInput"
                  value={destId}
                  onChange={(e) => onChangeDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                >
                  <option value="">Select destination location...</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.stepFree ? '✓ Step-Free' : '⚠️ Has Stairs'}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-semibold">Quick Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-3 py-1 rounded-lg font-medium border transition ${
                    originId === preset.originId && destId === preset.destId
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Ranked Route Options</h3>
                  <p className="text-xs text-slate-400">Ordered by your personalized accessibility, comfort & safety score</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {routes.length} Available Routes
                </span>
              </div>

              <div className="space-y-4">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    preferences={preferences}
                    onSelectRoute={onSelectRoute}
                    onOpenDetails={onOpenDetails}
                    onStartJourney={onStartJourney}
                  />
                ))}

                {routes.length === 0 && (
                  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-3xl block mb-2">🔍</span>
                    <h4 className="text-sm font-bold text-white">No routes found</h4>
                    <p className="text-xs text-slate-400 mt-1">Please select an origin and destination location from the controls above.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 lg:sticky lg:top-20">
              <MapView
                stops={stops}
                selectedRoute={selectedRoute}
                onSetOrigin={onChangeOrigin}
                onSetDest={onChangeDest}
                onReportStop={onReportStop}
              />
            </div>

          </div>

        </div>
      );
    };

    // Component: ReportModal
    const ReportModal = ({
      isOpen,
      onClose,
      stops,
      lines,
      preselectedStopId,
      onReportSubmitted,
      voiceEnabled
    }) => {
      const [reportType, setReportType] = useState('broken_elevator');
      const [stopId, setStopId] = useState(preselectedStopId || 'stop_metro');
      const [lineId, setLineId] = useState('line_metro');
      const [title, setTitle] = useState('');
      const [details, setDetails] = useState('');
      const [crowdLevel, setCrowdLevel] = useState('high');
      const [delayMinutes, setDelayMinutes] = useState(8);
      const [isSubmitted, setIsSubmitted] = useState(false);

      useEffect(() => {
        if (preselectedStopId) {
          setStopId(preselectedStopId);
        }
      }, [preselectedStopId]);

      if (!isOpen) return null;

      const getCategoryAndSeverity = (type) => {
        switch (type) {
          case 'broken_elevator':
            return {
              category: 'Accessibility Barrier',
              severity: 'critical',
              defaultTitle: 'Broken Elevator Out of Service',
              impactText: 'Stop elevator status set to Broken. Wheelchair routes will immediately avoid this stop.'
            };
          case 'broken_ramp':
            return {
              category: 'Accessibility Barrier',
              severity: 'critical',
              defaultTitle: 'Damaged Curb Ramp / Boarding Bridge',
              impactText: 'Step-free access revoked for boarding platform until repair dispatch acknowledges.'
            };
          case 'dim_lighting':
            return {
              category: 'Safety Issue',
              severity: 'medium',
              defaultTitle: 'Flickering / Dim Pathway Lighting',
              impactText: 'Lighting index reduced by 2.0. Night-safety routing prioritizes illuminated alternate detours.'
            };
          case 'crowded':
            return {
              category: 'Crowding',
              severity: 'high',
              defaultTitle: 'Extreme Car Crowding / Wheelchair Bay Blocked',
              impactText: 'Line crowd level set to High. Low-sensory and wheelchair profiles receive alternate bus alerts.'
            };
          case 'delay':
            return {
              category: 'Transit Delay',
              severity: 'medium',
              defaultTitle: `Vehicle Running +${delayMinutes} Min Behind Schedule`,
              impactText: `Live travel estimates adjusted by +${delayMinutes} minutes on this line.`
            };
          case 'safe_verified':
            return {
              category: 'Safety Commendation',
              severity: 'low',
              defaultTitle: 'Safe Corridor Verified & Escort Staffed',
              impactText: 'Safety corridor score boosted (+0.5). Staffed security presence confirmed.'
            };
          case 'obstruction':
            return {
              category: 'Accessibility Barrier',
              severity: 'high',
              defaultTitle: 'Sidewalk / Platform Blocked by Obstruction',
              impactText: 'Temporary detour advisory generated for mobility device passengers.'
            };
          case 'escalator_down':
            return {
              category: 'Accessibility Barrier',
              severity: 'medium',
              defaultTitle: 'Downward Escalator Stalled',
              impactText: 'Physical barrier warning attached to station concourse.'
            };
          default:
            return {
              category: 'General Transit Notice',
              severity: 'low',
              defaultTitle: 'General Transit Observation',
              impactText: 'Observation logged into community database.'
            };
        }
      };

      const { category, severity, defaultTitle, impactText } = getCategoryAndSeverity(reportType);

      const handleSubmit = (e) => {
        e.preventDefault();
        const selectedStop = stops.find(s => s.id === stopId);
        const selectedLine = lines.find(l => l.id === lineId);

        const newReport = {
          stopId: stopId || undefined,
          stopName: selectedStop ? selectedStop.name : 'General Corridor',
          lineId: lineId || undefined,
          lineName: selectedLine ? selectedLine.name : undefined,
          type: reportType,
          category,
          severity,
          title: title.trim() || defaultTitle,
          details: details.trim() || `User reported ${reportType.replace('_', ' ')} at ${selectedStop ? selectedStop.name : 'transit station'}.`,
          impact: impactText,
          crowdLevelReported: reportType === 'crowded' ? crowdLevel : undefined,
          delayMinutesReported: reportType === 'delay' ? delayMinutes : undefined
        };

        onReportSubmitted(newReport);
        setIsSubmitted(true);

        if (voiceEnabled) {
          SpeechService.speak(`Report submitted for ${selectedStop ? selectedStop.name : 'transit line'}. Operator dashboard updated.`);
        }

        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 1800);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Report Barrier or Transit Delay</h2>
                  <p className="text-xs text-slate-400">Crowdsourced alerts immediately update routing & operator dispatch</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-black text-white">Report Successfully Broadcasted!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your alert is now visible on the live passenger pulse feed and flagged in the Operator Command Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                
                {/* 1. Category Pill Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    1. Issue / Condition Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { type: 'broken_elevator', label: '🛗 Broken Elev', color: 'red' },
                      { type: 'broken_ramp', label: '🪜 Broken Ramp', color: 'red' },
                      { type: 'crowded', label: '👥 High Crowd', color: 'purple' },
                      { type: 'delay', label: '⏱️ Bus Delay', color: 'amber' },
                      { type: 'dim_lighting', label: '💡 Dim Light', color: 'amber' },
                      { type: 'obstruction', label: '🚧 Blockage', color: 'amber' },
                      { type: 'escalator_down', label: '⚡ Escalator Off', color: 'blue' },
                      { type: 'safe_verified', label: '🛡️ Safe Verified', color: 'emerald' },
                    ].map((item) => {
                      const isSelected = reportType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setReportType(item.type)}
                          className={`p-2.5 rounded-xl border font-bold text-center transition ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 ring-2 ring-amber-500/40'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Station or Line Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Affected Station / Stop
                    </label>
                    <select
                      value={stopId}
                      onChange={(e) => setStopId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- General / In-Transit --</option>
                      {stops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Transit Route / Vehicle Line
                    </label>
                    <select
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Not Line Specific --</option>
                      {lines.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Parameter Controls */}
                {reportType === 'crowded' && (
                  <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                    <label className="block text-xs font-bold text-purple-300">
                      Reported Occupancy Level:
                    </label>
                    <div className="flex gap-2">
                      {['low', 'moderate', 'high'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCrowdLevel(lvl)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize border transition ${
                            crowdLevel === lvl
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {lvl} Crowd
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {reportType === 'delay' && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-amber-300">
                      <span>Estimated Delay:</span>
                      <span>+{delayMinutes} Minutes</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={45}
                      step={1}
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(Number(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}

                {/* Optional Custom Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Specific Description / Landmark Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Near North entrance turnstiles; cones blocking ramp..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Real-Time Routing Impact Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-amber-400 block">⚡ Instant Routing Engine Impact:</span>
                  <p className="text-slate-300">{impactText}</p>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                  >
                    🚀 Broadcast Live Alert
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      );
    };

    // Component: OperatorDashboard (Command Center)
    const OperatorDashboard = ({
      fleet,
      reports,
      stops,
      lines,
      onResolveReport,
      onUpdateVehicle,
      onBroadcastAlert,
      onOpenReportModal,
      voiceEnabled
    }) => {
      const [filterCategory, setFilterCategory] = useState('all');
      const [nightOwlMode, setNightOwlMode] = useState(true);
      const [pingedVehicles, setPingedVehicles] = useState({});
      const [activeTab, setActiveTab] = useState('overview');
      const [broadcastText, setBroadcastText] = useState('');
      const [broadcastSent, setBroadcastSent] = useState(false);

      const activeReports = reports.filter(r => r.status !== 'resolved');
      const resolvedReports = reports.filter(r => r.status === 'resolved');

      const filteredQueue = reports.filter(r => {
        if (filterCategory === 'all') return true;
        if (filterCategory === 'active') return r.status !== 'resolved';
        if (filterCategory === 'resolved') return r.status === 'resolved';
        if (filterCategory === 'barriers') return r.category === 'Accessibility Barrier';
        if (filterCategory === 'crowding') return r.category === 'Crowding';
        if (filterCategory === 'delays') return r.category === 'Transit Delay';
        if (filterCategory === 'safety') return r.category === 'Safety Issue' || r.category === 'Safety Commendation';
        return true;
      });

      const handlePingVehicle = (vehicleId) => {
        setPingedVehicles(prev => ({ ...prev, [vehicleId]: 'Notified ramp staging for incoming wheelchair passenger.' }));
        if (voiceEnabled) {
          SpeechService.speak(`Driver of vehicle ${vehicleId} signaled. Automated ramp deployment staged.`);
        }
        setTimeout(() => {
          setPingedVehicles(prev => {
            const next = { ...prev };
            delete next[vehicleId];
            return next;
          });
        }, 4000);
      };

      const handleToggleSos = (vehicle) => {
        onUpdateVehicle(vehicle.vehicleId, { emergencySosActive: !vehicle.emergencySosActive });
        if (voiceEnabled) {
          SpeechService.speak(`SOS status updated for vehicle ${vehicle.vehicleId}.`);
        }
      };

      const handleSendBroadcast = (e) => {
        e.preventDefault();
        if (!broadcastText.trim()) return;
        onBroadcastAlert('Campus Transit Advisory', broadcastText.trim());
        setBroadcastSent(true);
        if (voiceEnabled) {
          SpeechService.speak(`Advisory broadcasted to all passenger apps: ${broadcastText.trim()}`);
        }
        setBroadcastText('');
        setTimeout(() => setBroadcastSent(false), 3000);
      };

      const totalWheelchairBays = fleet.reduce((acc, v) => acc + v.wheelchairBaysTotal, 0);
      const occupiedWheelchairBays = fleet.reduce((acc, v) => acc + v.wheelchairBaysOccupied, 0);

      return (
        <div className="space-y-8 pb-16 animate-fadeIn">
          
          {/* Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping mr-2"></span>
                  OPERATOR COMMAND CENTER
                </span>
                <span className="text-xs text-slate-400 font-mono">Live Telemetry Synchronized</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">Campus Transit & Safety Dispatch</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Real-time fleet monitoring, passenger barrier ticket triage, accessible ramp diagnostics, and instant safety protocol broadcast.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const next = !nightOwlMode;
                  setNightOwlMode(next);
                  if (voiceEnabled) {
                    SpeechService.speak(next ? 'Night Owl safe escort protocol activated.' : 'Daytime transit protocol standard.');
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                  nightOwlMode
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>🌙</span>
                <span>Night Owl Safe Escort: {nightOwlMode ? 'ACTIVE' : 'STANDBY'}</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center space-x-1.5"
              >
                <span>⚠️ Log Observation</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span>🚍</span>
                <span>Active Fleet</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">{fleet.length} Vehicles</div>
              <p className="text-[11px] text-emerald-400">100% telemetry online</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span>🦼</span>
                <span>Wheelchair Bays</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {occupiedWheelchairBays} / {totalWheelchairBays}
              </div>
              <p className="text-[11px] text-slate-300">{totalWheelchairBays - occupiedWheelchairBays} bays available across network</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span>⚠️</span>
                <span>Open Barrier Tickets</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{activeReports.length} Active</div>
              <p className="text-[11px] text-slate-400">{resolvedReports.length} tickets resolved today</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span>💡</span>
                <span>Safe Lighting Index</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-400">9.4 / 10</div>
              <p className="text-[11px] text-slate-300">West & Med safe corridors high</p>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            {[
              { id: 'overview', label: '📊 Command Overview' },
              { id: 'fleet', label: `🚍 Live Fleet Telemetry (${fleet.length})` },
              { id: 'queue', label: `⚠️ Hazard Triage Queue (${activeReports.length})` },
              { id: 'broadcast', label: '📢 Public Broadcast Center' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: FLEET & TELEMETRY */}
          {(activeTab === 'overview' || activeTab === 'fleet') && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>🚍</span>
                    <span>Live Fleet Vehicle Diagnostics & Accessibility Status</span>
                  </h3>
                  <p className="text-xs text-slate-400">Live vehicle occupancy, ramp status, and ETA tracking</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Vehicle ID</th>
                      <th className="py-3 px-4">Line & Driver</th>
                      <th className="py-3 px-4">Occupancy Load</th>
                      <th className="py-3 px-4">Wheelchair Bays</th>
                      <th className="py-3 px-4">Ramp Lift Health</th>
                      <th className="py-3 px-4">Next Stop ETA</th>
                      <th className="py-3 px-4 rounded-r-xl text-right">Operator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {fleet.map(vehicle => {
                      const nextStop = stops.find(s => s.id === vehicle.nextStopId);
                      const isPinged = !!pingedVehicles[vehicle.vehicleId];

                      return (
                        <tr key={vehicle.vehicleId} className="hover:bg-slate-950/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                              {vehicle.vehicleId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{vehicle.lineName}</div>
                            <div className="text-[11px] text-slate-400">👤 {vehicle.driver}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full ${
                                    vehicle.occupancyPct > 80 ? 'bg-purple-500' : vehicle.occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${vehicle.occupancyPct}%` }}
                                />
                              </div>
                              <span className="font-bold text-white">{vehicle.occupancyPct}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              vehicle.wheelchairBaysOccupied === vehicle.wheelchairBaysTotal
                                ? 'bg-purple-950 text-purple-300 border-purple-700'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}>
                              🦼 {vehicle.wheelchairBaysOccupied} / {vehicle.wheelchairBaysTotal} In-Use
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                              ✓ {vehicle.rampStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{nextStop ? nextStop.name : 'Central Hub'}</div>
                            <div className="text-[11px] text-emerald-400 font-mono font-bold">⏱️ in {vehicle.etaNextStopSec}s ({vehicle.speedKmh} km/h)</div>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handlePingVehicle(vehicle.vehicleId)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition"
                            >
                              {isPinged ? '📡 Pinged!' : '📡 Ping Ramp'}
                            </button>
                            <button
                              onClick={() => handleToggleSos(vehicle)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                                vehicle.emergencySosActive
                                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                              }`}
                            >
                              🚨 SOS
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HAZARD & BARRIER TRIAGE QUEUE */}
          {(activeTab === 'overview' || activeTab === 'queue') && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Real-Time Passenger Hazard & Barrier Queue</span>
                  </h3>
                  <p className="text-xs text-slate-400">Review crowdsourced alerts, dispatch field repair crews, or clear barrier advisories</p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'all', label: `All (${reports.length})` },
                    { id: 'active', label: `Active (${activeReports.length})` },
                    { id: 'barriers', label: 'Barriers' },
                    { id: 'crowding', label: 'Crowding' },
                    { id: 'delays', label: 'Delays' },
                    { id: 'resolved', label: `Resolved (${resolvedReports.length})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterCategory(f.id)}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        filterCategory === f.id
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredQueue.map(ticket => {
                  const isResolved = ticket.status === 'resolved';

                  return (
                    <div
                      key={ticket.id}
                      className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isResolved
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                          : ticket.severity === 'critical'
                          ? 'bg-red-950/30 border-red-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isResolved
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : ticket.severity === 'critical'
                              ? 'bg-red-600 text-white'
                              : ticket.severity === 'high'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {isResolved ? '✓ Resolved' : `${ticket.severity} Priority`}
                          </span>

                          <span className="text-xs font-bold text-slate-400">{ticket.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 font-mono">{ticket.timestamp}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs font-semibold text-amber-400">👍 {ticket.upvotes} Confirmations</span>
                        </div>

                        <h4 className="text-base font-bold text-white">{ticket.title}</h4>
                        <p className="text-xs text-slate-300">{ticket.details}</p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            📍 {ticket.stopName}
                          </span>
                          {ticket.lineName && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              🚍 {ticket.lineName}
                            </span>
                          )}
                          <span className="text-emerald-400 font-semibold">
                            Impact: {ticket.impact}
                          </span>
                        </div>

                        {ticket.resolutionNote && (
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 mt-2">
                            <strong>Resolution Note:</strong> {ticket.resolutionNote} ({ticket.resolvedAt})
                          </div>
                        )}
                      </div>

                      {/* Dispatch Actions */}
                      {!isResolved && (
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                          {ticket.type === 'broken_elevator' && (
                            <button
                              onClick={() => {
                                onResolveReport(ticket.id, 'Elevator technician dispatched. Hydraulic sensor rebooted & verified operational.');
                                if (voiceEnabled) SpeechService.speak('Elevator maintenance dispatched. Elevator status restored to operational.');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition flex items-center space-x-1"
                            >
                              <span>🛠️</span>
                              <span>Dispatch Repair & Clear</span>
                            </button>
                          )}

                          {ticket.type === 'dim_lighting' && (
                            <button
                              onClick={() => {
                                onResolveReport(ticket.id, 'Campus safety escort team deployed with auxiliary LED lighting.');
                                if (voiceEnabled) SpeechService.speak('Safety escort deployed to corridor.');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white transition flex items-center space-x-1"
                            >
                              <span>🔦</span>
                              <span>Deploy Escort Patrol</span>
                            </button>
                          )}

                          {ticket.type === 'crowded' && (
                            <button
                              onClick={() => {
                                onResolveReport(ticket.id, 'Additional backup shuttle inserted into route sequence.');
                                if (voiceEnabled) SpeechService.speak('Backup shuttle deployed for crowd relief.');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white transition flex items-center space-x-1"
                            >
                              <span>🚍</span>
                              <span>Deploy Relief Shuttle</span>
                            </button>
                          )}

                          {ticket.type === 'delay' && (
                            <button
                              onClick={() => {
                                onResolveReport(ticket.id, 'Bus delay cleared. Signal priority enabled.');
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center space-x-1"
                            >
                              <span>⏱️</span>
                              <span>Sync Signal Priority</span>
                            </button>
                          )}

                          <button
                            onClick={() => onResolveReport(ticket.id, 'Acknowledged and resolved by safety command desk.')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            ✓ Acknowledge & Archive
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredQueue.length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                    <span>✓ No open tickets in this category. All systems clear.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BROADCAST ADVISORY CENTER */}
          {(activeTab === 'overview' || activeTab === 'broadcast') && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>📢</span>
                <span>Broadcast Campus Transit & Safety Advisory</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pushes instant banner notifications to all active passenger navigators and audio voice announcements.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Night Owl safe escort teams are now actively stationed at West Campus..."
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition shrink-0"
                  >
                    Broadcast to All Passengers
                  </button>
                </div>

                {broadcastSent && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-bold animate-fadeIn">
                    ✓ Advisory successfully sent to all passengers across network.
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      );
    };

    // Component: App Orchestrator
    const App = () => {
      const [currentTab, setCurrentTab] = useState('home');

      const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('accessride_preferences');
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {}
        }
        return TransitService.getProfileById('wheelchair').defaultPreferences;
      });

      const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
      const [isReportModalOpen, setIsReportModalOpen] = useState(false);
      const [reportPreselectedStopId, setReportPreselectedStopId] = useState(undefined);
      const [detailRoute, setDetailRoute] = useState(null);
      const [broadcastBanner, setBroadcastBanner] = useState(null);
      const [activeJourneyRoute, setActiveJourneyRoute] = useState(null);

      const [stops, setStops] = useState([]);
      const [lines, setLines] = useState([]);
      const [presets, setPresets] = useState([]);
      const [profiles, setProfiles] = useState([]);
      const [reports, setReports] = useState([]);
      const [fleet, setFleet] = useState([]);
      
      const [originId, setOriginId] = useState('stop_gate');
      const [destId, setDestId] = useState('stop_lib');
      const [routes, setRoutes] = useState([]);
      const [selectedRoute, setSelectedRoute] = useState(null);

      useEffect(() => {
        async function loadData() {
          const stopsData = await TransitService.getStops();
          const linesData = await TransitService.getLines();
          setStops(stopsData);
          setLines(linesData);
          setPresets(TransitService.getQuickPresets());
          setProfiles(TransitService.getProfiles());
          setReports(TransitService.getCommunityReports());
          setFleet(TransitService.getFleetVehicles());
        }
        loadData();
      }, []);

      useEffect(() => {
        if (preferences.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }

        document.documentElement.classList.remove('font-scale-large', 'font-scale-xlarge');
        if (preferences.fontSize === 'large') {
          document.documentElement.classList.add('font-scale-large');
        } else if (preferences.fontSize === 'xlarge') {
          document.documentElement.classList.add('font-scale-xlarge');
        }

        SpeechService.setEnabled(preferences.voiceAnnouncements);
        localStorage.setItem('accessride_preferences', JSON.stringify(preferences));
      }, [preferences]);

      const runRouteCalculation = useCallback((from, to, prefs) => {
        if (!from || !to || from === to) {
          setRoutes([]);
          setSelectedRoute(null);
          return;
        }

        const calculated = RoutingEngine.calculateRoutes(from, to, prefs);
        setRoutes(calculated);

        if (calculated.length > 0) {
          setSelectedRoute(calculated[0]);
          if (prefs.voiceAnnouncements) {
            SpeechService.speak(`Calculated ${calculated.length} routes. Top recommendation is ${calculated[0].title}. Total travel time: ${calculated[0].totalDurationMin} minutes.`);
          }
        } else {
          setSelectedRoute(null);
        }
      }, []);

      useEffect(() => {
        runRouteCalculation(originId, destId, preferences);
      }, [originId, destId, preferences, runRouteCalculation]);

      const handleUpdatePreferences = (updates) => {
        setPreferences(prev => ({ ...prev, ...updates }));
      };

      const handleSelectProfile = (profileId) => {
        const prof = TransitService.getProfileById(profileId);
        const updated = {
          ...prof.defaultPreferences,
          highContrast: preferences.highContrast,
          fontSize: preferences.fontSize,
          voiceAnnouncements: preferences.voiceAnnouncements
        };
        setPreferences(updated);
        if (preferences.voiceAnnouncements) {
          SpeechService.speak(`Accessibility profile switched to ${prof.name}.`);
        }
      };

      const handleSelectPreset = (preset) => {
        setOriginId(preset.originId);
        setDestId(preset.destId);
        setCurrentTab('planner');
        if (preferences.voiceAnnouncements) {
          SpeechService.speak(`Loading preset route from ${preset.title}.`);
        }
      };

      const handleSwapLocations = () => {
        const temp = originId;
        setOriginId(destId);
        setDestId(temp);
      };

      const handleStartJourney = (route) => {
        setActiveJourneyRoute(route);
        setCurrentTab('journey');
      };

      const handleCompleteJourney = () => {
        setActiveJourneyRoute(null);
        setCurrentTab('planner');
      };

      const handleExitJourney = () => {
        setActiveJourneyRoute(null);
        setCurrentTab('planner');
      };

      const handleOpenReport = (stopId) => {
        setReportPreselectedStopId(stopId);
        setIsReportModalOpen(true);
      };

      const handleReportSubmitted = async (newReportData) => {
        const updatedReports = TransitService.addCommunityReport(newReportData);
        setReports([...updatedReports]);
        
        const refreshedStops = await TransitService.getStops();
        setStops([...refreshedStops]);

        runRouteCalculation(originId, destId, preferences);
      };

      const handleResolveReport = async (reportId, note) => {
        const updatedReports = TransitService.resolveCommunityReport(reportId, note);
        setReports([...updatedReports]);

        const refreshedStops = await TransitService.getStops();
        setStops([...refreshedStops]);

        runRouteCalculation(originId, destId, preferences);
      };

      const handleUpvoteReport = (reportId) => {
        const updatedReports = TransitService.upvoteCommunityReport(reportId);
        setReports([...updatedReports]);
      };

      const handleUpdateVehicle = (vehicleId, updates) => {
        const updatedFleet = TransitService.updateFleetVehicle(vehicleId, updates);
        setFleet([...updatedFleet]);
      };

      const handleBroadcastAlert = (title, message) => {
        setBroadcastBanner({ title, message });
        setTimeout(() => {
          setBroadcastBanner(null);
        }, 8000);
      };

      const activeReportsCount = reports.filter(r => r.status !== 'resolved').length;

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
          
          <Navbar
            currentTab={currentTab === 'journey' ? 'planner' : currentTab}
            onSelectTab={(tab) => {
              if (currentTab === 'journey') {
                setActiveJourneyRoute(null);
              }
              setCurrentTab(tab);
            }}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onOpenPreferencesModal={() => setIsPrefModalOpen(true)}
            onOpenReportModal={() => handleOpenReport()}
            activeReportCount={activeReportsCount}
          />

          {broadcastBanner && (
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400 font-bold text-xs sm:text-sm flex items-center justify-between animate-fadeIn z-30">
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📢</span>
                  <span><strong>{broadcastBanner.title}:</strong> {broadcastBanner.message}</span>
                </div>
                <button
                  onClick={() => setBroadcastBanner(null)}
                  className="ml-4 text-slate-950 hover:text-white font-black px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {currentTab === 'journey' && activeJourneyRoute ? (
              <JourneyMode
                route={activeJourneyRoute}
                preferences={preferences}
                onCompleteJourney={handleCompleteJourney}
                onExitJourney={handleExitJourney}
                onOpenReportModal={() => handleOpenReport()}
                voiceEnabled={preferences.voiceAnnouncements}
              />
            ) : currentTab === 'home' ? (
              <HomeScreen
                profiles={profiles}
                stops={stops}
                presets={presets}
                preferences={preferences}
                reports={reports}
                onSelectProfile={handleSelectProfile}
                onSelectPreset={handleSelectPreset}
                onStartPlanning={() => setCurrentTab('planner')}
                onOpenPreferencesModal={() => setIsPrefModalOpen(true)}
                onOpenReportModal={() => handleOpenReport()}
                onUpvoteReport={handleUpvoteReport}
              />
            ) : currentTab === 'planner' ? (
              <RoutePlanner
                stops={stops}
                presets={presets}
                originId={originId}
                destId={destId}
                onChangeOrigin={setOriginId}
                onChangeDest={setDestId}
                onSwapLocations={handleSwapLocations}
                onCalculateRoutes={() => runRouteCalculation(originId, destId, preferences)}
                onSelectPreset={handleSelectPreset}
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
                onOpenDetails={setDetailRoute}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onOpenPreferencesModal={() => setIsPrefModalOpen(true)}
                onOpenReportModal={() => handleOpenReport()}
                onReportStop={(stopId) => handleOpenReport(stopId)}
                onStartJourney={handleStartJourney}
              />
            ) : (
              <OperatorDashboard
                fleet={fleet}
                reports={reports}
                stops={stops}
                lines={lines}
                onResolveReport={handleResolveReport}
                onUpdateVehicle={handleUpdateVehicle}
                onBroadcastAlert={handleBroadcastAlert}
                onOpenReportModal={() => handleOpenReport()}
                voiceEnabled={preferences.voiceAnnouncements}
              />
            )}
          </main>

          <PreferenceModal
            isOpen={isPrefModalOpen}
            onClose={() => setIsPrefModalOpen(false)}
            preferences={preferences}
            onSavePreferences={(newPrefs) => setPreferences(newPrefs)}
          />

          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            stops={stops}
            lines={lines}
            preselectedStopId={reportPreselectedStopId}
            onReportSubmitted={handleReportSubmitted}
            voiceEnabled={preferences.voiceAnnouncements}
          />

          <RouteDetailModal
            route={detailRoute}
            onClose={() => setDetailRoute(null)}
            onStartJourney={handleStartJourney}
          />

          <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span>🦼 AccessRide Navigator</span>
                <span>•</span>
                <span>WCAG 2.1 AAA Compliant Design System</span>
              </div>
              <p>Prioritizing dignity, safe lit corridors, and 100% barrier-free transit for all passengers.</p>
            </div>
          </footer>

        </div>
      );
    };

    // Mount to DOM
    const rootEl = document.getElementById('root');
    if (rootEl) {
      const root = ReactDOM.createRoot(rootEl);
      root.render(<App />);
    }
  