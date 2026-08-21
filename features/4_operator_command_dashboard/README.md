# Feature 4: Operator Command Dashboard

A real-time transit operator control panel for fleet monitoring, incident management, and campus-wide broadcast advisories.

---

## 🎯 Key Features

### 1. Live KPI Metrics Bar
- **Total Accessible Fleet** — count of active low-floor ramp vehicles
- **Active Safety Reports** — open community barrier / SOS tickets
- **Open Barrier Tickets** — broken elevators, blocked ramps needing dispatch
- **Safe Lighting Index** — campus-wide CCTV & Blue Light corridor coverage

### 2. Live Fleet Telemetry Table
Real-time tracking of every vehicle's:
- Electric ramp status (Deployed / Stowed / Fault)
- Wheelchair bay occupancy
- Driver name and contact
- Current occupancy load %
- Next stop and ETA

### 3. Incident Triage Queue
Categorized live ticket management with 1-click dispatch actions:

| Ticket Type | Action Button |
|:--|:--|
| `sos_alert` | 🚓 Dispatch Security & Intercept *(animated red, highest priority)* |
| `broken_elevator` | 🛠️ Dispatch Maintenance & Repair |
| `dim_lighting` | 🔦 Send Safety Escort Team |
| `crowded` | 🚍 Deploy Backup Shuttle |
| `delay` | ⏱️ Broadcast Delay Notice |

### 4. Campus-Wide Broadcast Center
Push instant advisory banners to all active passenger navigators.

---

## 📁 Files in This Module

| File | Purpose |
|:--|:--|
| `OperatorDashboard.tsx` | Full operator control panel React component |

---

## 🔌 Props / Interface

```typescript
interface OperatorDashboardProps {
  reports: CommunityReport[];
  fleet: FleetVehicle[];
  stops: TransitStop[];
  voiceEnabled: boolean;
  onResolveReport: (reportId: string, note: string) => void;
  onUpdateVehicle: (vehicleId: string, updates: Partial<FleetVehicle>) => void;
  onBroadcastAlert: (title: string, message: string) => void;
}
```

---

## 🔧 Integration

```tsx
<OperatorDashboard
  reports={liveReports}
  fleet={liveFleet}
  stops={allStops}
  voiceEnabled={true}
  onResolveReport={(id, note) => resolveReport(id, note)}
  onUpdateVehicle={(id, updates) => updateVehicle(id, updates)}
  onBroadcastAlert={(title, msg) => pushBroadcast(title, msg)}
/>
```

---

## 🆘 SOS Alert Workflow

When a passenger misses a safety check-in and campus security is dispatched (Feature 2), an emergency ticket with `type: 'sos_alert'` is automatically injected into this dashboard's triage queue. The operator sees it at the **top of the queue** with a pulsing red `🚓 Dispatch Security & Intercept` button for immediate 1-click resolution.
