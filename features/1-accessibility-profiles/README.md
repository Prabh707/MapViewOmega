# Feature 1: Accessibility Profiles

## What this feature does

Instead of making every rider manually configure a dozen settings, AccessRide offers **6
ready-made profiles**. Picking one instantly fills in a sensible set of defaults; the rider can
still fine-tune anything afterward.

| Profile ID | Who it's for | What it turns on by default |
|---|---|---|
| `wheelchair` | Wheelchair / mobility-device users | Step-free routes only, requires working elevators, low max walking distance |
| `elderly` | Older riders | Avoids stairs, prefers shorter walks, prefers safer/well-lit routes |
| `night_safety` | Anyone traveling at night or through unfamiliar areas | Prioritizes routes with CCTV, lighting, and SOS stations |
| `quiet_sensory` | Riders with sensory sensitivities | Avoids crowded vehicles/stops |
| `vision_hearing` | Blind, low-vision, deaf, or hard-of-hearing riders | Turns on voice announcements and high-contrast display |
| `standard` | Everyone else / no specific needs | Balanced defaults, nothing extreme |

## The key idea (for beginners): a profile is just a preset object

There's no special "wheelchair mode" logic scattered through the app. A profile is nothing more
than a bundle of default values for one shared settings object, `UserPreferences`:

```ts
export interface UserPreferences {
  profileId: ProfileId;
  stepFreeOnly: boolean;          // 100% step-free / ramps required
  avoidStairs: boolean;           // Avoid stairs and steep inclines
  maxWalkDistanceMeters: number;  // e.g. 250, 500, 1000
  preferSaferRoute: boolean;      // Prioritize lighting >= 8.5, CCTV, SOS
  avoidCrowded: boolean;          // Prefer low/moderate crowd levels
  requireElevators: boolean;      // Require operational elevators for transfers
  voiceAnnouncements: boolean;    // Speech announcements on/off
  highContrast: boolean;          // WCAG AAA high-contrast theme
  fontSize: 'normal' | 'large' | 'xlarge';
}
```

Every other feature in the app — the route engine, journey mode, even the display theme — just
reads values off this one object. It doesn't know or care which named profile you picked; it only
sees "stepFreeOnly is true" or "avoidCrowded is true." That's what makes the system easy to
extend: add a 7th profile by adding one more entry to `ACCESSIBILITY_PROFILES` in
`data/transitData.ts`, and every downstream feature automatically respects it — no other code
needs to change.

## How selecting a profile actually works — code walkthrough

This all happens in `components/PreferenceModal.tsx`:

```ts
const handleSelectProfile = (profileId: ProfileId) => {
  const profile = ACCESSIBILITY_PROFILES[profileId];
  if (profile) {
    setLocalPrefs({
      ...profile.defaultPreferences,
      highContrast: localPrefs.highContrast,
      fontSize: localPrefs.fontSize,
      voiceAnnouncements: localPrefs.voiceAnnouncements,
    });
  }
};
```

Step by step:
1. Look up the profile's `defaultPreferences` object (defined in `data/transitData.ts`).
2. Spread all of those defaults into the local state — this is what fills in stepFreeOnly,
   avoidStairs, etc. all at once.
3. **Deliberately override three fields back to whatever the rider already had set**:
   `highContrast`, `fontSize`, and `voiceAnnouncements`. These are treated as personal display/
   accessibility settings that shouldn't get silently reset just because someone tried out a
   different travel profile — e.g. if you already turned on high contrast for your own vision
   needs, switching to the "elderly" profile shouldn't turn it back off.
4. Nothing is saved yet — this only updates a **local, unsaved copy** (`localPrefs`) inside the
   modal. The rider still has to hit "Save," which calls `onSavePreferences(localPrefs)` in the
   parent (`App.tsx`), which is what actually commits the change and (per `App.tsx`) persists it
   to `localStorage` so it survives a page refresh.

## Why this design is good for accessibility specifically

- **No dead ends**: every profile is just a starting point, never a locked-in mode. A wheelchair
  user who also wants voice announcements can still turn that on — the categories aren't mutually
  exclusive.
- **Single source of truth**: because `UserPreferences` is one flat object, there's exactly one
  place (the route engine's scoring weights — see feature 2) that has to interpret it. No feature
  has to special-case "if profile is X, do Y."
- **Fails safe**: if `profileId` ever pointed at something not in `ACCESSIBILITY_PROFILES` (e.g. a
  typo or future removed profile), `handleSelectProfile` simply does nothing (`if (profile)`)
  rather than crashing.

## Files in this folder

- `components/PreferenceModal.tsx` — the settings modal UI and the profile-selection logic above
- `data/transitData.ts` — where the 6 profiles and their default preference bundles are defined
  (look for `ACCESSIBILITY_PROFILES`)
- `types/transit.ts` — the `UserPreferences`, `AccessibilityProfile`, and `ProfileId` type
  definitions that tie it all together
