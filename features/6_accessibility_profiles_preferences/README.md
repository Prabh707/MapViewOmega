# Feature 6: Accessibility Profiles & Preferences Engine

Six pre-built user mobility profiles with granular preference controls, persisted to `localStorage` and applied in real-time across the routing engine, map overlays, and UI display modes.

---

## 👤 Built-in Mobility Profiles

| Profile | Icon | Focus |
|:--|:--|:--|
| `wheelchair` | 🦼 | 100% step-free, elevator required, low-floor ramp mandatory |
| `elderly` | 🧓 | Short walks (≤200m), seating breaks, gentle slopes |
| `vision_hearing` | 👁️ | Audio announcements, tactile paving, visual display |
| `night_safety` | 🌙 | CCTV corridors, Blue Light pillars, lit paths (≥9.0/10) |
| `quiet_sensory` | 🧠 | Low crowd, quiet vehicles, no sudden audio |
| `standard` | 🚶 | Speed-optimized; standard accessibility checks |

---

## ⚙️ Preference Toggles

Each profile ships with defaults but the user can override any setting:

| Setting | Type | Effect |
|:--|:--|:--|
| `stepFreeOnly` | boolean | Routing engine excludes any route with steps |
| `avoidStairs` | boolean | Penalizes routes with stairs but doesn't exclude |
| `maxWalkDistanceMeters` | number | Cap on walking distance (100–800m) |
| `preferSaferRoute` | boolean | Boosts safety score weight ×2 in final ranking |
| `avoidCrowded` | boolean | Applies -25 penalty to routes with high crowd levels |
| `requireElevators` | boolean | Excludes routes with broken or absent elevators |
| `voiceAnnouncements` | boolean | Enables Web Speech API across all components |
| `highContrast` | boolean | Applies WCAG AAA high-contrast mode to UI |
| `fontSize` | `normal\|large\|xlarge` | Scales font sizes across UI |

---

## 📁 Files in This Module

| File | Purpose |
|:--|:--|
| `PreferenceModal.tsx` | Full accessibility settings modal UI |
| `HomeScreen.tsx` | Profile picker card grid and quick preset launcher |

---

## 🔌 Props / Interface

```typescript
// PreferenceModal
interface PreferenceModalProps {
  preferences: UserPreferences;
  profiles: AccessibilityProfile[];
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onSelectProfile: (profileId: ProfileId) => void;
  onClose: () => void;
}

// HomeScreen
interface HomeScreenProps {
  profiles: AccessibilityProfile[];
  stops: TransitStop[];
  presets: QuickPreset[];
  preferences: UserPreferences;
  reports: CommunityReport[];
  onSelectProfile: (profileId: ProfileId) => void;
  onSelectPreset: (preset: QuickPreset) => void;
  onStartPlanning: () => void;
  onOpenPreferencesModal: () => void;
  onOpenReportModal: () => void;
  onUpvoteReport: (reportId: string) => void;
}
```

---

## 🔧 Integration

```tsx
<PreferenceModal
  preferences={userPreferences}
  profiles={accessibilityProfiles}
  onUpdatePreferences={(delta) => setPreferences(prev => ({...prev, ...delta}))}
  onSelectProfile={(id) => loadProfile(id)}
  onClose={() => setPrefModalOpen(false)}
/>
```
