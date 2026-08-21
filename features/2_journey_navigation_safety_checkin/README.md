# Feature 2: Journey Mode & Multi-Tier Safety Check-In Escalation

A live turn-by-turn navigation engine with an automated multi-tier safety escalation pipeline designed for solo campus transit users.

---

## 🛡️ Safety Escalation Pipeline

```
Normal 15:00 Check-In Timer
         ↓ (timer expires with no response)
Stage 1: MISSED CHECK-IN WARNING
         ↓ (urgent 30-second amber countdown, voice announcement)
Stage 2: USER DOESN'T RESPOND → Emergency Contact Notified
         ↓ (automated SMS + Push to trusted contact with live GPS)
Stage 3: Campus Security / Operator Dispatched
         ↓ (live SOS ticket injected into Operator Command Dashboard)
```

---

## 📁 Files in This Module

| File | Purpose |
|:--|:--|
| `JourneyMode.tsx` | Main React component — navigation, timer, escalation UI |
| `SpeechService.ts` | Web Speech API wrapper for accessible audio guidance |

---

## 🔌 Props / Interface

```typescript
interface JourneyModeProps {
  route: RouteCandidate;                           // Selected accessible route
  preferences: UserPreferences;                    // User accessibility settings
  onCompleteJourney: () => void;                   // Called on safe arrival
  onExitJourney: () => void;                       // Called when user exits journey
  onOpenReportModal: () => void;                   // Opens the hazard report modal
  onTriggerEmergencyEscalation?: (              
    route: RouteCandidate, 
    step: RouteSegment
  ) => void;                                       // Fires when escalation triggers
  voiceEnabled: boolean;                           // Enable Web Speech API
}
```

---

## ⚡ Demo Shortcut

During a live journey, the **`⚡ Demo: Expire in 3s`** button fast-forwards the 15-minute check-in timer to expire in 3 seconds — instantly triggering the Stage 1 Warning for hackathon demonstrations.

---

## 🔧 Integration

```tsx
<JourneyMode
  route={selectedRoute}
  preferences={userPreferences}
  onCompleteJourney={() => setView('planner')}
  onExitJourney={() => setView('planner')}
  onOpenReportModal={() => setReportModalOpen(true)}
  onTriggerEmergencyEscalation={(route, step) => {
    // Inject SOS ticket into your operator backend
    createEmergencyTicket({ route, step });
  }}
  voiceEnabled={true}
/>
```
