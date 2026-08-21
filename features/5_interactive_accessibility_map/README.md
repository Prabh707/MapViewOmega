# Feature 5: Interactive Accessible Campus Map

A Leaflet.js-powered interactive map showing step-free routes, stop accessibility status, barrier locations, and safe corridor overlays in real time.

---

## 🗺️ Map Layers

| Layer | Symbol | Description |
|:--|:--|:--|
| Accessible Stops | 🟢 Green Pin | Step-free, operational elevator, CCTV |
| Barrier Warning | 🔴 Red Pin | Broken elevator / blocked ramp reported |
| Active Route | Colored Polyline | Selected multi-modal route drawn on map |
| Safe Corridors | 💚 Green Overlay | LED-lit, Blue-Light SOS monitored paths |
| Danger / Avoid | 🔴 Red Overlay | Avoid: Stairs, dim zones, broken lifts |

---

## 📁 Files in This Module

| File | Purpose |
|:--|:--|
| `MapView.tsx` | Interactive Leaflet map component |

---

## 🔌 Props / Interface

```typescript
interface MapViewProps {
  stops: TransitStop[];
  selectedRoute?: RouteCandidate | null;
  originId?: string;
  destId?: string;
  reports: CommunityReport[];
  preferences: UserPreferences;
  onSelectStop?: (stopId: string) => void;
}
```

---

## 📦 Dependencies

- **Leaflet.js** (CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`)
- **react-leaflet** (if using TSX): `npm install react-leaflet leaflet`

---

## 🔧 Integration

```tsx
<MapView
  stops={transitStops}
  selectedRoute={currentRoute}
  originId="stop_gate"
  destId="stop_lib"
  reports={communityReports}
  preferences={userPreferences}
  onSelectStop={(stopId) => setOrigin(stopId)}
/>
```
