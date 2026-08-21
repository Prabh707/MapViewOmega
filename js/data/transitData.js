/**
 * AccessRide - High Fidelity Mock Transit & Campus Network Data
 * Designed for Accessibility-First and Safety-First Route Evaluation
 */

export const ACCESSIBILITY_PROFILES = {
  wheelchair: {
    id: 'wheelchair',
    name: 'Wheelchair / Stroller',
    icon: '🦼',
    description: '100% step-free paths, low-floor ramp vehicles, working elevators, curb ramps.',
    weights: { speed: 0.15, accessibility: 0.65, safety: 0.20 },
    requirements: {
      stepFreeOnly: true,
      requireRamp: true,
      elevatorMandatory: true,
      maxWalkDistanceMeters: 400
    }
  },
  elderly: {
    id: 'elderly',
    name: 'Elderly / Limited Mobility',
    icon: '🦯',
    description: 'Minimal walking distance, zero steep inclines, guaranteed seating, direct routes.',
    weights: { speed: 0.20, accessibility: 0.50, safety: 0.30 },
    requirements: {
      stepFreeOnly: true,
      requireRamp: false,
      maxWalkDistanceMeters: 250,
      avoidMultipleTransfers: true
    }
  },
  vision_hearing: {
    id: 'vision_hearing',
    name: 'Visual & Hearing Assist',
    icon: '👁️',
    description: 'Tactile platform paving, synthesized audio cues, high-contrast signage.',
    weights: { speed: 0.20, accessibility: 0.55, safety: 0.25 },
    requirements: {
      tactilePaving: true,
      audioAnnouncements: true,
      visualSignage: true,
      maxWalkDistanceMeters: 500
    }
  },
  night_safety: {
    id: 'night_safety',
    name: 'Late-Night / Solo Traveler',
    icon: '🌙',
    description: 'Prioritizes brightly lit stops, active CCTV coverage, emergency SOS kiosks, safe corridors.',
    weights: { speed: 0.15, accessibility: 0.20, safety: 0.65 },
    requirements: {
      minLightingScore: 8.0,
      cctvRequired: true,
      preferCampusEscort: true,
      avoidIsolatedStops: true
    }
  },
  standard: {
    id: 'standard',
    name: 'Standard Route',
    icon: '⚡',
    description: 'Balances travel speed, convenience, and basic safety.',
    weights: { speed: 0.60, accessibility: 0.20, safety: 0.20 },
    requirements: {
      stepFreeOnly: false,
      maxWalkDistanceMeters: 1000
    }
  }
};

// Preset Locations around a high-density university & metropolitan corridor (Sample coords: Boston/Cambridge transit style)
export const TRANSIT_STOPS = {
  stop_lib: {
    id: 'stop_lib',
    name: 'University Central Library',
    code: 'UCL-01',
    lat: 42.3601,
    lng: -71.0942,
    type: 'campus_hub',
    lightingScore: 9.8, // 1 to 10
    cctvCovered: true,
    securityKioskNearby: true,
    blueLightSOS: true,
    stepFree: true,
    hasRamp: true,
    elevatorStatus: 'operational', // 'operational' | 'broken' | 'none'
    tactilePaving: true,
    audioAnnouncements: true,
    shelterType: 'Heated Glass Enclosed Hub',
    crowdLevel: 'moderate', // 'low' | 'moderate' | 'high'
    zone: 'West Campus Safe Corridor',
    features: ['High-intensity LED lights', 'Emergency SOS button', 'Wheelchair boarding zone', 'Visual real-time arrivals']
  },
  stop_metro: {
    id: 'stop_metro',
    name: 'Metro Central Station',
    code: 'MCS-12',
    lat: 42.3655,
    lng: -71.1037,
    type: 'metro_station',
    lightingScore: 9.5,
    cctvCovered: true,
    securityKioskNearby: true,
    blueLightSOS: true,
    stepFree: true,
    hasRamp: true,
    elevatorStatus: 'operational',
    tactilePaving: true,
    audioAnnouncements: true,
    shelterType: 'Major Underground Transit Hub',
    crowdLevel: 'high',
    zone: 'Downtown Transit Center',
    features: ['24/7 Transit Police Staffing', 'Double-wide elevators', 'Braille direction boards', 'High visibility waiting bay']
  },
  stop_hosp: {
    id: 'stop_hosp',
    name: 'City General Hospital',
    code: 'CGH-04',
    lat: 42.3628,
    lng: -71.0765,
    type: 'medical_hub',
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
    zone: 'Medical District Safe Zone',
    features: ['Wheelchair lending kiosk', 'Security officer post', 'Level curb boarding', 'Heated passenger waiting bay']
  },
  stop_tech: {
    id: 'stop_tech',
    name: 'Innovation Tech Park',
    code: 'ITP-09',
    lat: 42.3702,
    lng: -71.0850,
    type: 'tech_campus',
    lightingScore: 9.0,
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
    zone: 'North Innovation District',
    features: ['Induction charging benches', 'Tactile sidewalk pathways', 'Emergency call phone']
  },
  stop_quad: {
    id: 'stop_quad',
    name: 'South Campus Quad',
    code: 'SCQ-02',
    lat: 42.3560,
    lng: -71.1010,
    type: 'campus_stop',
    lightingScore: 9.3,
    cctvCovered: true,
    securityKioskNearby: true,
    blueLightSOS: true,
    stepFree: true,
    hasRamp: true,
    elevatorStatus: 'operational',
    tactilePaving: true,
    audioAnnouncements: true,
    shelterType: 'Covered Campus Pavilion',
    crowdLevel: 'low',
    zone: 'Campus Safe Corridor',
    features: ['Campus Escort meeting point', 'Emergency Blue Light pole', 'Zero-curb boarding']
  },
  stop_arts: {
    id: 'stop_arts',
    name: 'East Arts Alley',
    code: 'EAA-07',
    lat: 42.3585,
    lng: -71.0820,
    type: 'street_stop',
    lightingScore: 6.2,
    cctvCovered: false,
    securityKioskNearby: false,
    blueLightSOS: false,
    stepFree: false, // steep curb
    hasRamp: false,
    elevatorStatus: 'none',
    tactilePaving: false,
    audioAnnouncements: false,
    shelterType: 'Open Pole Stop',
    crowdLevel: 'moderate',
    zone: 'East Side Cultural District',
    features: ['Cobblestone sidewalk', 'Dim heritage street lamps', 'No weather shelter']
  },
  stop_mall: {
    id: 'stop_mall',
    name: 'Westside Plaza & Market',
    code: 'WPM-05',
    lat: 42.3680,
    lng: -71.1150,
    type: 'commercial_hub',
    lightingScore: 8.8,
    cctvCovered: true,
    securityKioskNearby: true,
    blueLightSOS: false,
    stepFree: true,
    hasRamp: true,
    elevatorStatus: 'operational',
    tactilePaving: true,
    audioAnnouncements: true,
    shelterType: 'Large Canopy Hub',
    crowdLevel: 'high',
    zone: 'West Commercial Zone',
    features: ['Ramp access to plaza', 'Security patrol cars', 'Audio schedule speaker']
  },
  stop_res: {
    id: 'stop_res',
    name: 'North Student Residences',
    code: 'NSR-03',
    lat: 42.3735,
    lng: -71.0995,
    type: 'residence_stop',
    lightingScore: 8.9,
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
    zone: 'North Campus Living Sector',
    features: ['Residence hall security desk 20m away', 'SOS blue pillar', 'Level boarding platform']
  },
  stop_pines: {
    id: 'stop_pines',
    name: 'Old Industrial Overpass',
    code: 'OIO-19',
    lat: 42.3665,
    lng: -71.0710,
    type: 'cutoff_stop',
    lightingScore: 4.1,
    cctvCovered: false,
    securityKioskNearby: false,
    blueLightSOS: false,
    stepFree: false, // 18 stairs to platform
    hasRamp: false,
    elevatorStatus: 'broken',
    tactilePaving: false,
    audioAnnouncements: false,
    shelterType: 'Damaged Wooden Shed',
    crowdLevel: 'low',
    zone: 'Old Freight District',
    features: ['Stairs-only platform', 'Poor lighting', 'Broken elevator reported']
  }
};

// Transit Lines & Active Fleet
export const TRANSIT_LINES = {
  line_safe_shuttle: {
    id: 'line_safe_shuttle',
    name: 'Campus SafeCorridor Night Shuttle (Shuttle 101)',
    shortName: 'Shuttle 101',
    mode: 'Campus Safe Vehicle',
    color: '#10b981', // Emerald Safe
    icon: '🛡️',
    frequencyMin: 10,
    features: {
      lowFloorRamp: true,
      wheelchairBays: 2,
      onboardSafetyGuard: true,
      audioAnnouncements: true,
      visualDisplay: true,
      securityCameras: 4,
      companionEscortAvailable: true
    },
    stopsSequence: ['stop_lib', 'stop_quad', 'stop_metro', 'stop_res', 'stop_tech']
  },
  line_metro_rapid: {
    id: 'line_metro_rapid',
    name: 'Metro Rapid Bus 42',
    shortName: 'Rapid 42',
    mode: 'City Rapid Transit',
    color: '#3b82f6', // Blue
    icon: '🚌',
    frequencyMin: 7,
    features: {
      lowFloorRamp: true,
      wheelchairBays: 2,
      onboardSafetyGuard: false,
      audioAnnouncements: true,
      visualDisplay: true,
      securityCameras: 2,
      companionEscortAvailable: false
    },
    stopsSequence: ['stop_mall', 'stop_metro', 'stop_lib', 'stop_hosp']
  },
  line_tech_connector: {
    id: 'line_tech_connector',
    name: 'Innovation Tech Connector 15',
    shortName: 'Connector 15',
    mode: 'Shared Micro-Transit',
    color: '#8b5cf6', // Violet
    icon: '🚐',
    frequencyMin: 12,
    features: {
      lowFloorRamp: true,
      wheelchairBays: 1,
      onboardSafetyGuard: false,
      audioAnnouncements: true,
      visualDisplay: true,
      securityCameras: 2,
      companionEscortAvailable: false
    },
    stopsSequence: ['stop_tech', 'stop_res', 'stop_metro', 'stop_mall']
  },
  line_east_express: {
    id: 'line_east_express',
    name: 'Eastside Express 88 (Stair Coach)',
    shortName: 'Express 88',
    mode: 'Standard Highway Coach',
    color: '#f59e0b', // Amber
    icon: '🚍',
    frequencyMin: 15,
    features: {
      lowFloorRamp: false, // High steps
      wheelchairBays: 1, // Mechanical lift (needs 5 min driver prep)
      onboardSafetyGuard: false,
      audioAnnouncements: false,
      visualDisplay: false,
      securityCameras: 1,
      companionEscortAvailable: false
    },
    stopsSequence: ['stop_arts', 'stop_pines', 'stop_hosp', 'stop_lib']
  }
};

// Operator Fleet Live Vehicle Statuses
export const INITIAL_FLEET = [
  {
    vehicleId: 'BUS-101A',
    lineId: 'line_safe_shuttle',
    lineName: 'Shuttle 101',
    driver: 'Officer Marcus Sterling',
    occupancyPct: 35, // Low crowd
    wheelchairBaysOccupied: 0,
    wheelchairBaysTotal: 2,
    rampStatus: '100% Operational',
    cctvFeed: 'Live & Active',
    currentLocation: { lat: 42.3615, lng: -71.0965 },
    nextStopId: 'stop_quad',
    etaNextStopSec: 140,
    safetyStatus: 'Normal / Security Escort Active'
  },
  {
    vehicleId: 'BUS-42B',
    lineId: 'line_metro_rapid',
    lineName: 'Rapid 42',
    driver: 'Elena Rostova',
    occupancyPct: 78, // High crowd
    wheelchairBaysOccupied: 1,
    wheelchairBaysTotal: 2,
    rampStatus: '100% Operational',
    cctvFeed: 'Live & Active',
    currentLocation: { lat: 42.3640, lng: -71.1000 },
    nextStopId: 'stop_lib',
    etaNextStopSec: 90,
    safetyStatus: 'Normal'
  },
  {
    vehicleId: 'SHUTTLE-15C',
    lineId: 'line_tech_connector',
    lineName: 'Connector 15',
    driver: 'Devon Patel',
    occupancyPct: 45,
    wheelchairBaysOccupied: 0,
    wheelchairBaysTotal: 1,
    rampStatus: '100% Operational',
    cctvFeed: 'Live & Active',
    currentLocation: { lat: 42.3718, lng: -71.0920 },
    nextStopId: 'stop_res',
    etaNextStopSec: 210,
    safetyStatus: 'Normal'
  },
  {
    vehicleId: 'COACH-88D',
    lineId: 'line_east_express',
    lineName: 'Express 88',
    driver: 'Frank Callahan',
    occupancyPct: 85,
    wheelchairBaysOccupied: 0,
    wheelchairBaysTotal: 1,
    rampStatus: 'Hydraulic Lift Slow / Needs Inspection',
    cctvFeed: 'Intermittent',
    currentLocation: { lat: 42.3605, lng: -71.0790 },
    nextStopId: 'stop_hosp',
    etaNextStopSec: 320,
    safetyStatus: 'High Crowding'
  }
];

// Initial Live Community Reports (Crowd, Barriers, Safety alerts)
export const INITIAL_REPORTS = [
  {
    id: 'rep-01',
    stopId: 'stop_arts',
    stopName: 'East Arts Alley',
    type: 'dim_lighting',
    category: 'Safety',
    title: 'Street Lamp Flicker & Poor Lighting',
    details: 'The two corner lights near the boarding pole are dark. Caution advised when waiting alone.',
    timestamp: '12 mins ago',
    upvotes: 6,
    status: 'Verified by Community',
    impact: 'Safety score reduced by 15%'
  },
  {
    id: 'rep-02',
    stopId: 'stop_pines',
    stopName: 'Old Industrial Overpass',
    type: 'broken_elevator',
    category: 'Accessibility Barrier',
    title: 'Elevator Out of Service to Platform 2',
    details: 'Elevator power board tripped. Wheelchair users must use Metro Central detour.',
    timestamp: '25 mins ago',
    upvotes: 14,
    status: 'Maintenance Ticket #4092 Dispatched',
    impact: 'Accessibility score marked Inaccessible'
  },
  {
    id: 'rep-03',
    stopId: 'stop_lib',
    stopName: 'University Central Library',
    type: 'safe_verified',
    category: 'Safety Commendation',
    title: 'Campus Security Escort Stationed',
    details: 'Active security staff and visible blue light assistance operational.',
    timestamp: '35 mins ago',
    upvotes: 19,
    status: 'Confirmed Safe Corridor',
    impact: 'Safety score +10%'
  }
];

export const EMERGENCY_CONTACTS = [
  { name: 'Campus Safety & Escort Service', phone: '1-800-555-SAFE (7233)', badge: '24/7 Campus Escort' },
  { name: 'Transit Police Emergency Line', phone: '1-800-555-TPOL (8765)', badge: 'Direct Transit Dispatch' },
  { name: 'Emergency Ambulance / Police', phone: '911 / 112', badge: 'National Emergency' },
  { name: 'AccessRide Accessibility Dispatch', phone: '1-800-555-RIDE', badge: 'Ramp / Assistance Hotline' }
];
