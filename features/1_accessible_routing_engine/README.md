# Feature 1: Accessible & Safe Routing Engine

The **Accessible Routing Engine** is an accessibility-first routing algorithm that balances physical step-free infrastructure, safe lit corridors (≥9.0/10), and crowd levels against travel time.

---

## 🎯 Key Capabilities

1. **Barrier Penalty Architecture**:
   - Out-of-service elevators: `-45` accessibility penalty.
   - Non-ramp steps / staircases: `-50` accessibility penalty.
   - Walking distance over user limit: Scaled progressive penalty.
2. **Safety Scoring**:
   - Calculates average lighting along all walked and transit segments.
   - Boosts corridors with CCTV coverage and 24/7 Blue Light emergency pillars.
3. **Transparent Algorithmic Explanations**:
   - Generates plain-English bullet points explaining *why* a route was recommended over faster alternatives (e.g. avoiding 18 subway stairs).

---

## 💻 Usage Example

```typescript
import { RoutingEngine } from './RoutingEngine';

const preferences = {
  profileId: 'wheelchair',
  stepFreeOnly: true,
  avoidStairs: true,
  maxWalkDistanceMeters: 300,
  preferSaferRoute: true,
  avoidCrowded: false,
  requireElevators: true,
  voiceAnnouncements: true,
  highContrast: false,
  fontSize: 'normal'
};

const routes = RoutingEngine.calculateRoutes('stop_gate', 'stop_lib', preferences);
console.log('Top Recommended Route:', routes[0].title);
console.log('Algorithmic Score:', routes[0].scores.overallScore);
```
