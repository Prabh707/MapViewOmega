# Feature 3: Live Journey Mode

## What this feature does

Once a rider picks a route, "Journey Mode" (`components/JourneyMode.tsx`) takes over as a
turn-by-turn navigation screen: it announces the current step out loud, and — this is the
distinctive part — it runs an automated **safety check-in timer** in the background that escalates
through 4 stages if the rider doesn't respond, culminating in notifying an emergency contact and
campus security.

## The core idea (for beginners): a state machine driven by two timers

If you've never heard the term, a **state machine** just means: the component is always in
exactly one of a small number of named "phases," and specific events move it from one phase to
the next. Here, that's tracked in one variable:

```ts
const [checkinPhase, setCheckinPhase] = useState<'normal' | 'warning' | 'escalated'>('normal');
```

Combined with a countdown number (`timerSeconds`), that's the whole engine. Here's the full
sequence:

### Stage 0 — Normal (15-minute countdown)

```ts
const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60); // 15 minutes
```
While `checkinPhase === 'normal'`, a `setInterval`-style effect ticks `timerSeconds` down once
per second. The rider sees a big countdown and a "Check in now" button. If they tap it, the timer
just resets back to 15 minutes — nothing escalates.

### Stage 1 — Warning (30-second grace period)

If the countdown hits 0 with no check-in, the phase flips to `'warning'`, a **second, shorter**
30-second timer starts, and — importantly — the app proactively speaks a warning out loud:

```ts
'Warning: Safety check-in missed! Please confirm you are safe within 30 seconds
before emergency contacts and campus security are alerted.'
```

This gives the rider one last chance to say "I'm fine" before anything more serious happens. They
can still tap "confirm safe" here to fall back to Stage 0.

### Stage 2 & 3 — Escalated (automated, no more waiting)

If *that* 30-second timer also expires with no response, the phase flips to `'escalated'` and
`onTriggerEmergencyEscalation(route, currentStep)` fires — a callback passed down from `App.tsx`
so the parent app can react too (e.g. surface it to the Operator Dashboard's incident queue). From
here the UI shows two sequential-looking cards that represent stages 2 and 3 of the *conceptual*
escalation:
- **Stage 2: Emergency Contact Notified** — shows a mock "Sarah Jenkins (Primary Emergency
  Contact)" being alerted.
- **Stage 3: Campus Security / Operator Dispatched** — shows campus security being looped in,
  plus a direct "Call 911" button for real emergencies.

The rider can de-escalate at any point by tapping **"✓ I am Safe"**, which resets `checkinPhase`
back to `'normal'` and the timer back to 15 minutes.

## Why two separate timers instead of one?

This models a real safety-app pattern deliberately: a **long, low-friction countdown** (15
minutes — because constantly demanding check-ins would be exhausting) followed by a **short,
urgent grace window** (30 seconds) once something looks wrong. The 30-second window exists so a
single missed check-in (rider was just busy, or didn't hear a notification) doesn't instantly
trigger a false alarm to family and security — but a *sustained* non-response does.

## Voice announcements

Every phase transition also calls `SpeechService.speak(...)` (see `services/speechService.ts`,
a thin wrapper over the browser's built-in `speechSynthesis` API) so a rider who can't look at
their screen — because they're walking, or have low vision — still hears every status change,
not just sees it.

## Developer/demo conveniences (worth knowing so you're not confused reading the code)

- `handleSnoozeTimer()` — extends the timer by 5 minutes (for testing without waiting 15 minutes)
- `handleFastDemo()` (look for `setTimerSeconds(3)`) — sets the timer to expire in 3 seconds, so a
  developer can see the whole escalation sequence play out quickly instead of waiting the full 15
  minutes + 30 seconds
- **1-Tap SOS button** — separate from the automated timer entirely; lets a rider *immediately*
  jump straight to the escalated state on demand, for when something is wrong right now and they
  don't want to wait for any timer at all

## Files in this folder

- `components/JourneyMode.tsx` — the full state machine and UI described above
- `services/speechService.ts` — the voice-announcement wrapper
- `types/transit.ts` — `RouteCandidate` and `RouteSegment`, which describe what "the current step"
  actually is
