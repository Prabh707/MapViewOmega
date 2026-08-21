/**
 * AccessRide - Storage & Offline Route Management Service
 * Provides offline caching, profile persistence, and community report state synchronization.
 */

import { INITIAL_REPORTS, EMERGENCY_CONTACTS } from '../data/transitData.js';

const STORAGE_KEYS = {
  PROFILE: 'accessride_user_profile',
  OFFLINE_ROUTES: 'accessride_offline_routes',
  REPORTS: 'accessride_community_reports',
  EMERGENCY_CONTACTS: 'accessride_emergency_contacts',
  SETTINGS: 'accessride_app_settings'
};

export class StorageService {
  static getProfile() {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : { profileId: 'wheelchair', customFlags: {} };
  }

  static saveProfile(profileData) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
  }

  static getOfflineRoutes() {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_ROUTES);
    return saved ? JSON.parse(saved) : [];
  }

  static saveOfflineRoute(route) {
    const existing = this.getOfflineRoutes();
    const filtered = existing.filter(r => r.id !== route.id);
    const updated = [
      {
        ...route,
        savedAt: new Date().toISOString(),
        offlineReady: true
      },
      ...filtered
    ];
    localStorage.setItem(STORAGE_KEYS.OFFLINE_ROUTES, JSON.stringify(updated));
    return updated;
  }

  static removeOfflineRoute(routeId) {
    const existing = this.getOfflineRoutes();
    const updated = existing.filter(r => r.id !== routeId);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_ROUTES, JSON.stringify(updated));
    return updated;
  }

  static getCommunityReports() {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!saved) {
      this.saveCommunityReports(INITIAL_REPORTS);
      return INITIAL_REPORTS;
    }
    return JSON.parse(saved);
  }

  static saveCommunityReports(reports) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }

  static addCommunityReport(newReport) {
    const reports = this.getCommunityReports();
    const updated = [
      {
        id: `rep-user-${Date.now()}`,
        timestamp: 'Just now',
        upvotes: 1,
        status: 'Community Submitted / Under Operator Review',
        ...newReport
      },
      ...reports
    ];
    this.saveCommunityReports(updated);
    return updated;
  }

  static getEmergencyContacts() {
    const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    if (!saved) {
      this.saveEmergencyContacts(EMERGENCY_CONTACTS);
      return EMERGENCY_CONTACTS;
    }
    return JSON.parse(saved);
  }

  static saveEmergencyContacts(contacts) {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
  }

  static getSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : { highContrast: false, voiceEnabled: true, largeText: false };
  }

  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}
