# AccessRide — Features Reference

This Folder is **not part of the build**. The real app only ever compiles code from `src/`.

Think of this folder as a library of "kits" — each subfolder pulls together the handful of files
that make one feature work, plus a README that explains that feature in plain English, from what
it does down to how the code actually does it. If you ever want to lift just one piece of
AccessRide (say, the route-scoring engine) into a different project, you can grab a single folder
here instead of hunting through all of `src/`.

Because each folder is meant to stand on its own, some files are duplicated across folders
(`types/transit.ts` shows up in almost every one, for example). That's intentional — it's a
trade-off of a little repetition for each folder being self-contained.

## The six features

| # | Folder | What it covers | Difficulty to understand |
|---|---|---|---|
| 1 | [`1-accessibility-profiles/`](./1-accessibility-profiles/README.md) | The 6 rider profiles (wheelchair, elderly, vision/hearing, night safety, quiet/sensory, standard) and the preferences system they configure | Beginner |
| 2 | [`2-route-engine/`](./2-route-engine/README.md) | Generates candidate routes between two stops and scores them on accessibility, safety, comfort, and speed | Intermediate |
| 3 | [`3-journey-mode/`](./3-journey-mode/README.md) | Turn-by-turn navigation with voice announcements and a 4-stage missed-check-in emergency escalation | Beginner–Intermediate |
| 4 | [`4-crowdsourced-reporting/`](./4-crowdsourced-reporting/README.md) | Riders flagging broken elevators, dim lighting, crowding, delays, and safety concerns | Beginner |
| 5 | [`5-operator-dashboard/`](./5-operator-dashboard/README.md) | The transit-operator side: fleet telemetry, incident triage queue, system broadcasts | Beginner–Intermediate |
| 6 | [`6-predictive-insights/`](./6-predictive-insights/README.md) | The two machine-learning models: a crowd-level forecaster and a safety-score estimator | Intermediate (has the ML math) |

## Suggested reading order if you're new to the codebase

1. **Accessibility Profiles** first — almost everything else reads from `UserPreferences`, so
   understanding what that object contains makes every other folder click faster.
2. **Route Engine** next — this is the actual "product," the thing the app is for.
3. **Journey Mode**, **Crowdsourced Reporting**, and **Operator Dashboard** in any order — they're
   independent of each other.
4. **Predictive Insights** last — it's the most mathematical piece, and it's easier to appreciate
   once you've seen what data (stops, lines, reports) already exists for it to learn from.

## How each feature folder is organized

Every folder mirrors the shape of `src/` but only includes what that feature needs:

```
N-feature-name/
├── README.md          Detailed, beginner-friendly explanation of this feature
├── components/         The screen(s)/modal(s) that make up its UI, if any
├── services/           Business logic it depends on, if any
├── ml/                 Machine-learning code, if any (only in feature 6)
├── data/                Mock data it reads from, if any
└── types/               Shared TypeScript types it uses
```
