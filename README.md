# AccessRide

**Accessibility-First Transit routing, safety check-ins, and predictive crowd & safety insights.**

AccessRide is a single-page web app that helps riders with different mobility, sensory, and safety needs find and follow the best route across a transit network — and gives transit operators the tools to monitor fleet status, triage rider-submitted reports, and forecast crowding.

---

## 1. What's in this project

| Feature | Description |
|---|---|
| **Accessibility Profiles** | 6 rider profiles (wheelchair, elderly, vision/hearing, night safety, quiet/sensory, standard), each with a tuned default preference set |
| **Multi-Modal Route Engine** | Scores routes on accessibility, safety, comfort & speed, with full explanations and trade-offs |
| **Live Journey Mode** | Turn-by-turn navigation, voice announcements, and a 4-stage missed check-in → emergency escalation flow |
| **Crowdsourced Reporting** | Riders flag broken elevators, dim lighting, crowding, delays, and safety concerns from the map or a route |
| **Operator Command Dashboard** | Fleet telemetry, incident triage queue, and system-wide broadcast alerts |
| **Predictive Insights (ML)** | Two models trained in-browser: a crowd-level forecaster and a safety/lighting score estimator for proposed corridors |

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 3 (utility classes) + a small hand-written stylesheet for animations, scrollbars, and the WCAG AAA high-contrast / font-scaling system (`src/custom.css`) |
| Mapping | Leaflet, with CartoDB Voyager tiles |
| Machine learning | No external ML library — a softmax classifier and a ridge linear regression, written and trained from scratch in plain TypeScript (see [section 5](#5-the-machine-learning-layer)) |

This project previously ran with no build step at all: React, Leaflet, and Babel Standalone were all loaded from CDNs directly inside `index.html`, and JSX was transpiled live in the browser on every page load. It's now a proper Vite project — the same component code compiles ahead of time, ships as optimized static assets, and gets full TypeScript type-checking.

---

## 3. Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install        # install dependencies
npm run dev        # start the Vite dev server (hot reload)
npm run build      # type-check with tsc, then build an optimized production bundle into dist/
npm run preview    # serve the production build locally
npm run lint       # run oxlint
```

---

## 4. Project structure

```
src/
├── main.tsx                   Application entry point
├── index.css                  Tailwind + Leaflet + custom.css, in that order
│                              (custom.css must load after Tailwind's base layer to override it)
├── custom.css                 Hand-written animations, scrollbars, and the
│                              accessibility theming system
├── App.tsx                    Root component: tab navigation, shared state,
│                              and the wiring between features
│
├── types/
│   └── transit.ts             Every shared TypeScript type: stops, lines,
│                              routes, reports, fleet vehicles, accessibility profiles
│
├── data/
│   └── transitData.ts         Mock transit network: stops, lines,
│                              accessibility profiles, and quick-plan presets
│
├── services/
│   ├── transitService.ts      In-memory data store (stops, lines, reports,
│   │                          fleet) with simple CRUD methods
│   ├── routingEngine.ts       Generates and scores candidate routes against
│   │                          a rider's accessibility preferences
│   └── speechService.ts       Thin wrapper over the Web Speech API for
│                              voice announcements
│
├── components/                One file per screen or modal: HomeScreen,
│                              RoutePlanner, MapView, JourneyMode,
│                              OperatorDashboard, PreferenceModal,
│                              ReportModal, RouteCard, RouteDetailModal,
│                              Navbar, InsightsPanel
│
└── ml/                        The predictive models — see section 5
    ├── mathUtils.ts           Dependency-free numeric helpers (dot product,
    │                          sigmoid, softmax, feature standardization)
    ├── crowdModel.ts          Crowd-level forecaster
    ├── safetyModel.ts         Safety/lighting score estimator
    └── index.ts               Barrel export
```

Also present at the project root:

```
features/    A parallel, read-only reference copy of the same source files,
             split one feature per folder with its own README. Useful if
             you want to lift a single feature (e.g. just the routing
             engine) into another project. It mirrors src/ but is not part
             of the build — the compiled app only ever reads from src/.
```

---

## 5. The machine learning layer

Both models are intentionally small and dependency-free: no TensorFlow, no scikit-learn equivalent, just gradient descent written out in TypeScript. That keeps them auditable end-to-end and fast enough to retrain every time the app loads, with zero backend or API calls.

### Crowd-level forecast

A multinomial logistic regression (a "softmax classifier") predicts whether a given transit line will be low / moderate / high crowded at a chosen hour of day and day type (weekday vs. weekend).

**Features:** hour of day (encoded cyclically with sin/cos so 11pm and midnight are numerically close), weekday vs. weekend, the line's service frequency, and the line's known baseline crowd level.

**Training data:** the app has no historical ridership log yet — each line only has one static `crowdLevel` snapshot. `crowdModel.ts` builds a synthetic-but-realistic training set instead: it shapes a 24-hour ridership curve around each line's baseline (two commuter peaks on weekdays, one soft midday peak on weekends) and adds noise, then trains the classifier on that. The model is genuinely fit by gradient descent — nothing is hard-coded per line.

**Swapping in real data:** once real ridership timestamps exist (for example, from `CommunityReport.crowdLevelReported` entries or fleet telemetry pings), replace `buildSyntheticTrainingSet()` in `crowdModel.ts` with a function that maps that history into the same `CrowdSample[]` shape. Everything downstream — training, prediction, the chart in the Insights tab — keeps working unchanged.

### Safety / lighting score estimator

A ridge (L2-regularized) linear regression predicts a 1–10 safety score for a stop or a hypothetical new corridor, from the same infrastructure flags already tracked on every stop: CCTV coverage, a nearby security kiosk, a Blue-Light SOS station, step-free access, a ramp, an operational elevator, tactile paving, and audio announcements.

**Training data:** the app's existing ~8 stops. That's a small dataset, so the model uses fairly strong L2 regularization to avoid overfitting to so few examples — add more stops (or real accessibility audit data) to `MOCK_TRANSIT_STOPS` and it will fit a sharper model automatically next time it trains.

**Why this doubles as a suggestion engine:** because it's a *linear* model, each feature's learned weight is a direct, readable answer to "how much would adding this improve the score?" `suggestImprovements()` in `safetyModel.ts` turns those weights into a ranked "what to build next" list — this is what powers the suggestions shown in the Insights tab.

### Where it shows up in the app

Both models are wired into a new **Predictive Insights** tab (`src/components/InsightsPanel.tsx`): pick a line and day type to see its 24-hour crowd forecast, or toggle safety features for a proposed corridor to see its estimated score and top suggested improvements.

---

## 6. Accessibility

- WCAG AAA high-contrast theme toggle
- Three-step font scaling (normal / large / extra-large)
- Full voice announcement support via the Web Speech API
- Six built-in accessibility profiles with tuned defaults, fully overridable per user
- Preferences persist to `localStorage` across sessions

---

## 7. Notes on the migration from the original prototype

This app began as a browser-only prototype: a single `index.html` loading React, Leaflet, and Babel Standalone from CDNs, with JSX transpiled live on every page load and no build step or type checking at all. Moving it to Vite involved:

- Adopting `src/` (the clean, already-modular TSX source) as the single source of truth, and removing the earlier hand-rolled vanilla-JS implementation (`js/`), a leftover scratch file (`temp_script.js`), and the inline CDN `<script>` tags in `index.html`
- Installing Leaflet as a real npm dependency and importing it directly in `MapView.tsx`, instead of relying on a `window.L` global injected by a CDN `<script>` tag
- Installing Tailwind CSS as a proper PostCSS build step instead of the CDN JIT compiler
- Fixing a handful of small type gaps that had no way to surface before there was a type checker in the loop (for example, the emergency escalation flow produced a `'sos_alert'` report that the `ReportType` union didn't yet know about) — no application behavior changed, only the types now match what the code actually does
