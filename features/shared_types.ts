export type ProfileId = 'wheelchair' | 'elderly' | 'vision_hearing' | 'night_safety' | 'quiet_sensory' | 'standard';

export interface AccessibilityProfile {
  id: ProfileId;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  defaultPreferences: UserPreferences;
}

export interface UserPreferences {
  profileId: ProfileId;
  stepFreeOnly: boolean;          // 100% step-free / ramps required
  avoidStairs: boolean;           // Avoid stairs and steep inclines
  maxWalkDistanceMeters: number;  // Low walking distance preference (e.g. 250, 500, 1000)
  preferSaferRoute: boolean;      // Prioritize high lighting (>=8.5), CCTV, emergency SOS
  avoidCrowded: boolean;          // Prefer low/moderate crowd levels
  requireElevators: boolean;      // Require operational elevators for multi-level transfers
  voiceAnnouncements: boolean;    // Voice cues / speech announcements enabled
  highContrast: boolean;          // WCAG AAA high contrast theme
  fontSize: 'normal' | 'large' | 'xlarge'; // Font scaling for low vision
}

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  type: 'campus_hub' | 'metro_station' | 'medical_hub' | 'tech_campus' | 'residence_hall' | 'arts_district' | 'sports_complex' | 'suburban_link';
  zone: string;
  lightingScore: number;          // 1.0 to 10.0 (Scale: 10 = daylight bright LED)
  cctvCovered: boolean;
  securityKioskNearby: boolean;
  blueLightSOS: boolean;
  stepFree: boolean;
  hasRamp: boolean;
  elevatorStatus: 'operational' | 'broken' | 'under_maintenance' | 'none';
  tactilePaving: boolean;
  audioAnnouncements: boolean;
  shelterType: string;
  crowdLevel: 'low' | 'moderate' | 'high';
  description: string;
  features: string[];
}

export interface TransitLine {
  id: string;
  name: string;
  shortName: string;
  type: 'campus_shuttle' | 'subway' | 'bus' | 'light_rail';
  color: string;
  textColor: string;
  icon: string;
  frequencyMin: number;
  stopsSequence: string[];        // Array of stop IDs
  crowdLevel: 'low' | 'moderate' | 'high';
  features: {
    lowFloorRamp: boolean;
    wheelchairBays: number;
    audioAnnouncements: boolean;
    visualDisplay: boolean;
    onboardSafetyGuard: boolean;
    securityCameras: number;
  };
}

export interface RouteSegment {
  type: 'walk' | 'transit';
  fromStopId?: string;
  toStopId?: string;
  fromName: string;
  toName: string;
  durationMin: number;
  distanceMeters?: number;
  line?: TransitLine;
  intermediateStops?: string[];
  instructions: string;
  accessibilityNotes: string[];
  stepFree: boolean;
  hasStairs: boolean;
  lightingScore: number;
  elevatorInvolved: boolean;
  elevatorStatus?: 'operational' | 'broken' | 'none';
  coordinates: [number, number][]; // [lat, lng] array
}

export interface RouteScoreBreakdown {
  accessibilityScore: number;     // 0-100
  safetyScore: number;            // 0-100
  comfortScore: number;           // 0-100
  speedScore: number;             // 0-100
  overallScore: number;           // 0-100 weighted
}

export interface RouteExplanation {
  headline: string;
  whyRecommended: string[];
  tradeOffs: string[];
  barrierWarnings: string[];
  suitabilitySummary: string;
}

export interface RouteCandidate {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  totalDurationMin: number;
  totalWalkDistanceMeters: number;
  transferCount: number;
  segments: RouteSegment[];
  scores: RouteScoreBreakdown;
  explanation: RouteExplanation;
  isRecommended: boolean;
  stepFree: boolean;
  hasStairs: boolean;
  crowdLevel: 'low' | 'moderate' | 'high';
  lightingAverage: number;
  badges: string[];
  polylines: {
    color: string;
    dashArray?: string;
    weight: number;
    positions: [number, number][];
  }[];
}

export interface QuickPreset {
  id: string;
  title: string;
  icon: string;
  originId: string;
  destId: string;
  description: string;
}

export type ReportType = 
  | 'broken_elevator'
  | 'broken_ramp'
  | 'dim_lighting'
  | 'crowded'
  | 'delay'
  | 'safe_verified'
  | 'obstruction'
  | 'escalator_down';

export type ReportCategory = 
  | 'Accessibility Barrier'
  | 'Crowding'
  | 'Transit Delay'
  | 'Safety Issue'
  | 'Safety Commendation';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CommunityReport {
  id: string;
  stopId?: string;
  stopName: string;
  lineId?: string;
  lineName?: string;
  type: ReportType;
  category: ReportCategory;
  title: string;
  details: string;
  impact: string;
  timestamp: string;
  upvotes: number;
  status: 'active' | 'in_progress' | 'resolved';
  severity: ReportSeverity;
  crowdLevelReported?: 'low' | 'moderate' | 'high';
  delayMinutesReported?: number;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface FleetVehicle {
  vehicleId: string;
  lineId: string;
  lineName: string;
  driver: string;
  occupancyPct: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  wheelchairBaysOccupied: number;
  wheelchairBaysTotal: number;
  rampStatus: 'Operational - Auto Ramp' | 'Bridge Plate Verified' | 'Hydraulic Alert' | 'Maintenance Needed';
  nextStopId: string;
  etaNextStopSec: number;
  speedKmh: number;
  lastPingTime: string;
  emergencySosActive: boolean;
}

