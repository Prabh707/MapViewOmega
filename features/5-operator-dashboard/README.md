# Feature 5: Operator Command Dashboard

## What this feature does

Every other feature in the app is built for the *rider*. This one flips the perspective: it's the
screen a transit **operator/staff member** would use — live fleet status, an incident triage
queue built from riders' community reports (feature 4), and the ability to broadcast a
system-wide alert.

## The three data sources it reads

`OperatorDashboard.tsx` doesn't own any data itself — everything is passed in as props from
`App.tsx`, which is the shared state owner for the whole app:

```ts
interface OperatorDashboardProps {
  fleet: FleetVehicle[];
  reports: CommunityReport[];
  stops: TransitStop[];
  lines: TransitLine[];
  onResolveReport: (reportId: string, note?: string) => void;
  onUpdateVehicle: (vehicleId: string, updates: Partial<FleetVehicle>) => void;
  onBroadcastAlert: (title: string, message: string) => void;
  // ...
}
```

This is a common and useful pattern worth learning if you're new to React: the dashboard is a
**"dumb" / presentational component** — it displays whatever data it's handed and calls callback
functions (`onResolveReport`, `onUpdateVehicle`, `onBroadcastAlert`) when the operator takes an
action, rather than mutating any data directly itself. All the actual mutation logic lives one
level up, in `App.tsx`, which then updates `transitService.ts`'s in-memory store. This keeps the
dashboard easy to test and reason about in isolation.

## 1. Fleet telemetry

Each vehicle in `fleet: FleetVehicle[]` carries a live-ish snapshot:

```ts
export interface FleetVehicle {
  vehicleId: string;
  lineId: string;
  occupancyPct: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  wheelchairBaysOccupied: number;
  wheelchairBaysTotal: number;
  rampStatus: 'Operational - Auto Ramp' | 'Bridge Plate Verified' | 'Hydraulic Alert' | 'Maintenance Needed';
  nextStopId: string;
  etaNextStopSec: number;
  speedKmh: number;
  emergencySosActive: boolean;
  // ...
}
```

The dashboard aggregates this across the whole fleet — e.g. total wheelchair bays occupied vs.
total available system-wide:

```ts
const totalWheelchairBaysOccupied = fleet.reduce((acc, v) => acc + v.wheelchairBaysOccupied, 0);
const totalWheelchairBays = fleet.reduce((acc, v) => acc + v.wheelchairBaysTotal, 0);
```

If you haven't seen `.reduce()` before: it walks through every vehicle and keeps a running total
(`acc`), which is a very common way to turn a list of items into a single summary number.

## 2. Incident triage queue

This reuses the exact same `CommunityReport` objects from feature 4, but from the operator's
point of view: filterable by category, sortable, and each one has a **"resolve"** action that
calls `onResolveReport(reportId, note)` back up to `App.tsx`. The dashboard pre-computes counts
per category for quick-glance stats:

```ts
const activeReports = reports.filter(r => r.status !== 'resolved');
const barrierReports = activeReports.filter(r => r.category === 'Accessibility Barrier');
const crowdReports  = activeReports.filter(r => r.category === 'Crowding');
const delayReports  = activeReports.filter(r => r.category === 'Transit Delay');
```

## 3. System broadcast

A simple text box where the operator types a title + message and calls `onBroadcastAlert(title,
message)` — conceptually, this is meant to represent pushing an alert out to every active rider's
app (e.g. "Metro Blue Line delayed 15 minutes due to signal issue"). In this prototype it doesn't
actually reach other simulated riders — there's no multi-user simulation — but the plumbing is
there for exactly that purpose if a backend were added.

## Files in this folder

- `components/OperatorDashboard.tsx` — the full dashboard UI and aggregation logic above
- `services/transitService.ts` — where fleet and report data actually live, and where
  `onResolveReport`/`onUpdateVehicle` ultimately write their changes
- `types/transit.ts` — `FleetVehicle`, `CommunityReport`, `TransitStop`, `TransitLine`
