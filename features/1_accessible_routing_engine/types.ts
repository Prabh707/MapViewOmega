export type ProfileId = 'wheelchair' | 'elderly' | 'vision_hearing' | 'night_safety' | 'quiet_sensory' | 'standard';

export interface UserPreferences {
  profileId: ProfileId;
  stepFreeOnly: boolean;
  avoidStairs: boolean;
  maxWalkDistanceMeters: number;
  preferSaferRoute: boolean;
  avoidCrowded: boolean;
  requireElevators: boolean;
  voiceAnnouncements: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export interface AccessibilityProfile {
  id: ProfileId;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  defaultPreferences: UserPreferences;
}

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  type: string;
  zone: string;
  lightingScore: number;
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
  type: string;
  color: string;
  textColor: string;
  icon: string;
  frequencyMin: number;
  stopsSequence: string[];
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
  instructions: string;
  accessibilityNotes: string[];
  stepFree: boolean;
  hasStairs: boolean;
  lightingScore: number;
  elevatorInvolved: boolean;
  elevatorStatus?: 'operational' | 'broken' | 'none';
  coordinates: [number, number][];
}

export interface RouteScoreBreakdown {
  accessibilityScore: number;
  safetyScore: number;
  comfortScore: number;
  speedScore: number;
  overallScore: number;
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
    positions: [number, number][];
    color: string;
    weight: number;
    dashArray?: string;
  }[];
}
