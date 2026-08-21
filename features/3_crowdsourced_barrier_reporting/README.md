# Feature 3: Crowdsourced Accessibility Barrier Reporting

Real-time community-driven reporting system allowing passengers to log accessibility barriers, safety hazards, transit delays, and crowding — with instant feedback into the routing engine.

---

## 🎯 Report Types

| Type | Badge | Impact |
|:--|:--|:--|
| `broken_elevator` | 🚨 Barrier | Immediately re-routes wheelchair users away from affected stop |
| `blocked_ramp` | 🚨 Barrier | Flags stop as inaccessible; routing engine avoids it |
| `uneven_surface` | ⚠️ Surface | Notifies routing of increased difficulty |
| `dim_lighting` | 🔦 Safety | Reduces safety score of corridor |
| `crowded` | 👥 Crowd | Increases crowd-level at stop |
| `delay` | ⏱️ Delay | Adds expected wait time to route duration |
| `sos_alert` | 🚨 SOS | Critical — injected directly into Operator Command Dashboard triage queue |

---

## 📁 Files in This Module

| File | Purpose |
|:--|:--|
| `ReportModal.tsx` | Full report submission modal with stop selector, photo, category & severity |

---

## 🔌 Props / Interface

```typescript
// Community Report Shape
interface CommunityReport {
  id: string;
  stopId: string;
  stopName: string;
  lineId?: string;
  lineName?: string;
  type: 'broken_elevator' | 'blocked_ramp' | 'uneven_surface' | 'crowded' | 'delay' | 'dim_lighting' | 'sos_alert';
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  details: string;
  impact: string;
  timestamp: string;
  upvotes: number;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
  resolvedNote?: string;
}

// ReportModal props
interface ReportModalProps {
  stops: TransitStop[];
  onClose: () => void;
  onSubmit: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'status'>) => void;
  preselectedStopId?: string;
}
```

---

## 🔧 Integration

```tsx
<ReportModal
  stops={allStops}
  preselectedStopId="stop_gate"
  onClose={() => setModalOpen(false)}
  onSubmit={(reportData) => {
    // Add to your backend / state
    addReport(reportData);
  }}
/>
```
