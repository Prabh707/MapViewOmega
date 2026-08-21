# AccessRide — Modular Feature Exchange Directory

This directory contains every major AccessRide feature as a self-contained, isolated module. Each folder includes the component source code, types, and a dedicated `README.md` explaining how to integrate or repurpose it independently.

---

## 📦 Feature Modules

| # | Folder | Feature | Key Files |
|:--|:--|:--|:--|
| 1 | [`1_accessible_routing_engine/`](./1_accessible_routing_engine/) | Accessibility-first multi-modal routing algorithm | `RoutingEngine.ts`, `RoutePlanner.tsx`, `RouteCard.tsx`, `RouteDetailModal.tsx`, `transitData.ts`, `types.ts` |
| 2 | [`2_journey_navigation_safety_checkin/`](./2_journey_navigation_safety_checkin/) | Live navigation + 4-stage missed check-in escalation | `JourneyMode.tsx`, `SpeechService.ts` |
| 3 | [`3_crowdsourced_barrier_reporting/`](./3_crowdsourced_barrier_reporting/) | Passenger barrier & hazard reporting modal | `ReportModal.tsx` |
| 4 | [`4_operator_command_dashboard/`](./4_operator_command_dashboard/) | Fleet telemetry, incident triage & broadcast center | `OperatorDashboard.tsx` |
| 5 | [`5_interactive_accessibility_map/`](./5_interactive_accessibility_map/) | Leaflet map with step-free overlays & route polylines | `MapView.tsx` |
| 6 | [`6_accessibility_profiles_preferences/`](./6_accessibility_profiles_preferences/) | 6 mobility profiles + granular preference controls | `PreferenceModal.tsx`, `HomeScreen.tsx` |

---

## 🗂️ Shared / Reusable Files

These files are shared across all feature modules:

| File | Purpose |
|:--|:--|
| [`shared_types.ts`](./shared_types.ts) | All TypeScript interfaces & type definitions |
| [`shared_TransitService.ts`](./shared_TransitService.ts) | In-memory mock data store & CRUD operations |
| [`shared_SpeechService.ts`](./shared_SpeechService.ts) | Web Speech API wrapper for accessible voice announcements |
| [`shared_styles.css`](./shared_styles.css) | Complete design system CSS (dark mode, animations, WCAG AAA tokens) |
| [`App.tsx`](./App.tsx) | Root application wiring all features together |

---

## 🔄 Safety Escalation Data Flow

```
JourneyMode (Feature 2)
    ↓ onTriggerEmergencyEscalation(route, step)
App.tsx
    ↓ TransitService.addCommunityReport({ type: 'sos_alert', severity: 'critical' })
    ↓ setBroadcastBanner(...)
OperatorDashboard (Feature 4)
    ↓ Renders SOS ticket at top of triage queue
    ↓ 🚓 "Dispatch Security & Intercept" button → resolves ticket
```

---

## 🚀 Quick Start (Standalone HTML — No Build Required)

The app runs as a pure client-side React 18 app via Babel Standalone — no Node.js needed:

```bash
# Start a local HTTP server in the project root
python -m http.server 8080

# Open in browser
http://localhost:8080/
```

---

## 🎯 Demo Scenario (Hackathon Walk-through)

1. Open AccessRide → Select **Wheelchair + Avoid Stairs + Prefer Safer Route**
2. Enter **Main Gate → Central Library** → Compare 4 routes
3. Understand why SafeCorridor Shuttle is recommended (18 stairs vs. 0)
4. Click **▶ Start Accessible Journey**
5. In Journey Mode → click **⚡ Demo: Expire in 3s**
6. Watch the 4-stage safety escalation: Warning → SMS Contact → Security Dispatch
7. Switch to **🏢 Operator Command** tab → see live SOS ticket in triage queue
8. Click **🚓 Dispatch Security & Intercept** → ticket resolved
9. Back in Journey Mode → click **✓ I Have Arrived Safely**
