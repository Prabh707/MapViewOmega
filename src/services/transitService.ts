import { TransitStop, TransitLine, AccessibilityProfile, QuickPreset, CommunityReport, FleetVehicle } from '../types/transit';
import { MOCK_TRANSIT_STOPS, MOCK_TRANSIT_LINES, ACCESSIBILITY_PROFILES, QUICK_PRESETS, INITIAL_COMMUNITY_REPORTS, INITIAL_FLEET_DATA } from '../data/transitData';

export class TransitService {
  private static stopsCache: Record<string, TransitStop> = { ...MOCK_TRANSIT_STOPS };
  private static reportsCache: CommunityReport[] | null = null;
  private static fleetCache: FleetVehicle[] | null = null;

  /**
   * Returns all available transit stops
   */
  public static async getStops(): Promise<TransitStop[]> {
    return Promise.resolve(Object.values(this.stopsCache));
  }

  /**
   * Returns a specific transit stop by its ID
   */
  public static async getStopById(id: string): Promise<TransitStop | null> {
    return Promise.resolve(this.stopsCache[id] || null);
  }

  /**
   * Updates stop attributes dynamically (e.g. elevator repair, crowd update)
   */
  public static updateStop(id: string, updates: Partial<TransitStop>): TransitStop | null {
    if (this.stopsCache[id]) {
      this.stopsCache[id] = { ...this.stopsCache[id], ...updates };
      return this.stopsCache[id];
    }
    return null;
  }

  /**
   * Returns all available transit lines
   */
  public static async getLines(): Promise<TransitLine[]> {
    return Promise.resolve(Object.values(MOCK_TRANSIT_LINES));
  }

  /**
   * Returns a transit line by its ID
   */
  public static async getLineById(id: string): Promise<TransitLine | null> {
    return Promise.resolve(MOCK_TRANSIT_LINES[id] || null);
  }

  /**
   * Returns all accessibility profiles
   */
  public static getProfiles(): AccessibilityProfile[] {
    return Object.values(ACCESSIBILITY_PROFILES);
  }

  /**
   * Returns a specific accessibility profile
   */
  public static getProfileById(id: string): AccessibilityProfile {
    return ACCESSIBILITY_PROFILES[id] || ACCESSIBILITY_PROFILES.standard;
  }

  /**
   * Returns quick route presets
   */
  public static getQuickPresets(): QuickPreset[] {
    return QUICK_PRESETS;
  }

  /**
   * Search stops by keyword
   */
  public static async searchStops(query: string): Promise<TransitStop[]> {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(this.stopsCache);
    
    return Object.values(this.stopsCache).filter(stop => 
      stop.name.toLowerCase().includes(q) ||
      stop.code.toLowerCase().includes(q) ||
      stop.zone.toLowerCase().includes(q) ||
      stop.features.some(f => f.toLowerCase().includes(q))
    );
  }

  /**
   * Get all active and historical community reports
   */
  public static getCommunityReports(): CommunityReport[] {
    if (this.reportsCache) return this.reportsCache;

    const saved = localStorage.getItem('accessride_community_reports');
    if (saved) {
      try {
        this.reportsCache = JSON.parse(saved);
        return this.reportsCache!;
      } catch (e) {
        console.warn('Failed to parse saved reports', e);
      }
    }

    this.reportsCache = [...INITIAL_COMMUNITY_REPORTS];
    return this.reportsCache;
  }

  /**
   * Add a new passenger community report and dynamically impact stop/route metrics
   */
  public static addCommunityReport(reportData: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'status'>): CommunityReport[] {
    const reports = this.getCommunityReports();
    const newReport: CommunityReport = {
      ...reportData,
      id: `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      upvotes: 1,
      status: 'active'
    };

    const updated = [newReport, ...reports];
    this.reportsCache = updated;
    localStorage.setItem('accessride_community_reports', JSON.stringify(updated));

    // Dynamic stop impact based on report type
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

  /**
   * Operator resolution of a passenger barrier or delay ticket
   */
  public static resolveCommunityReport(reportId: string, resolutionNote?: string): CommunityReport[] {
    const reports = this.getCommunityReports();
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
      report.status = 'resolved';
      report.resolvedAt = 'Just now';
      report.resolutionNote = resolutionNote || 'Maintenance dispatched and barrier cleared.';

      // Restore stop if it was flagged as broken
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

  /**
   * Upvote a helpful community report
   */
  public static upvoteCommunityReport(reportId: string): CommunityReport[] {
    const reports = this.getCommunityReports();
    const report = reports.find(r => r.id === reportId);
    if (report) {
      report.upvotes += 1;
      this.reportsCache = reports;
      localStorage.setItem('accessride_community_reports', JSON.stringify(reports));
    }
    return reports;
  }

  /**
   * Get all live fleet vehicles telemetry
   */
  public static getFleetVehicles(): FleetVehicle[] {
    if (this.fleetCache) return this.fleetCache;

    const saved = localStorage.getItem('accessride_fleet_telemetry');
    if (saved) {
      try {
        this.fleetCache = JSON.parse(saved);
        return this.fleetCache!;
      } catch (e) {
        console.warn('Failed to parse saved fleet', e);
      }
    }

    this.fleetCache = [...INITIAL_FLEET_DATA];
    return this.fleetCache;
  }

  /**
   * Update vehicle telemetry in real-time
   */
  public static updateFleetVehicle(vehicleId: string, updates: Partial<FleetVehicle>): FleetVehicle[] {
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

