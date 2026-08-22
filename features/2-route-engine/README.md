# Feature 2: Multi-Modal Route Engine

## What this feature does

Given a starting stop and a destination stop, `RoutingEngine.calculateRoutes()` in
`services/routingEngine.ts` returns a **ranked list of route candidates** — e.g. "Night Shuttle,"
"Metro Blue Line," "City Rapid Bus 4" — each scored and explained against the rider's
accessibility preferences (see feature 1).

This is the closest thing the app has to a "real" algorithm — everything else is mostly CRUD and
display logic, but this file genuinely evaluates trade-offs.

## The big picture: it's a two-step process

```
Step 1: GENERATE            Step 2: SCORE & RANK
candidate routes    ───►    each candidate gets 4 sub-scores,
(hardcoded lines)           blended into 1 overall score, sorted best-first
```

### Step 1 — Generating candidates

There's no real-time trip planner here (no graph search, no Dijkstra's algorithm) — remember,
this whole app runs on **mock data**. `calculateRoutes()` just checks a handful of hardcoded
`if` conditions to decide which of the network's known lines (the night shuttle, the metro, a
city bus, etc.) could plausibly connect your origin and destination, and builds a `RouteCandidate`
object for each one that qualifies. Each candidate already carries raw facts baked in ahead of
time: whether it's step-free, whether it has stairs, its lighting average, its crowd level, its
walking distance, its duration.

### Step 2 — Scoring: 4 independent sub-scores, each 0–100

This is `calculateScores()`, and it's worth reading slowly because it's a great example of
**rule-based scoring** (as opposed to machine learning — see feature 6 for the ML approach).
Every sub-score starts from a baseline and gets nudged up or down by simple `if` statements:

**1. Accessibility score** — starts at 70.
```ts
if (route.stepFree) accessibilityScore += 20;
else accessibilityScore -= 30;
if (route.hasStairs) accessibilityScore -= 35;
if (hasBrokenElevator) accessibilityScore -= 40;
```
A broken elevator alone can drag a route from a strong 90 down into the 30s.

**2. Safety score** — built from the route's average lighting rating (stops are rated ~0–10 for
lighting in the mock data):
```ts
let safetyScore = Math.round(route.lightingAverage * 9.5);
if (route.lightingAverage >= 9.2) safetyScore += 8;   // bonus for very well-lit corridors
if (route.crowdLevel === 'low') safetyScore += 2;      // quiet routes feel marginally safer
```

**3. Comfort score** — driven mostly by crowding:
```ts
if (route.crowdLevel === 'low') comfortScore = 95;
else if (route.crowdLevel === 'moderate') comfortScore = 78;
else comfortScore = 42;   // 'high' crowding
```

**4. Speed score** — a straight penalty for duration:
```ts
let speedScore = Math.max(20, Math.min(100, Math.round(100 - route.totalDurationMin * 2.5)));
```
Every minute of travel time costs 2.5 points, floored at 20 so it never bottoms out to zero.

### Step 3 — Blending the 4 sub-scores into one overall score, based on *who's asking*

This is the part that actually uses the rider's chosen accessibility profile. Each profile gets
its own weighted formula — e.g. a wheelchair user's overall score leans heavily on
accessibility, while the standard profile leans on speed:

```ts
case 'wheelchair':
  overallScore = accessibilityScore*0.6 + safetyScore*0.2 + comfortScore*0.1 + speedScore*0.1;
  break;
case 'night_safety':
  overallScore = safetyScore*0.6 + accessibilityScore*0.2 + comfortScore*0.1 + speedScore*0.1;
  break;
case 'standard':
default:
  overallScore = speedScore*0.5 + accessibilityScore*0.2 + safetyScore*0.2 + comfortScore*0.1;
  break;
```

Notice every profile's weights add up to 1.0 (i.e. 100%) — that's what makes this a proper
weighted average rather than an arbitrary point pile.

### Step 4 — Hard overrides for strict requirements

Some preferences are too important to just be "one weighted factor among four" — they get
checked *before* the profile-weighting logic even runs:

```ts
if (preferences.stepFreeOnly && (!route.stepFree || route.hasStairs || hasBrokenElevator)) {
  // Heavily suppress this route's score regardless of profile
  overallScore = Math.max(15, Math.round(accessibilityScore * 0.4 + speedScore * 0.1));
}
```
If a wheelchair user has switched on "step-free only," a fast-but-inaccessible route gets
capped low no matter how good its other scores are — it won't quietly sneak to the top of the
list just because it's fast.

### Step 5 — Fine-grained penalties applied last

After the main score is computed, three more adjustments run on top of it:
- **Walking too far**: if you walk more than your `maxWalkDistanceMeters`, you lose up to 30
  points, scaled by how far over the limit you went (1 point per 15 extra meters).
- **"Prefer safer route" toggle**: if it's on and the route's lighting average is below 9.0, minus
  15 points.
- **"Avoid crowded" toggle**: if it's on and the route is rated `'high'` crowding, minus 25 points.

Every score, at every stage, is clamped between roughly 10 and 100 (`Math.max(10, ...)`) so no
route can hit a literal 0 that might read as "broken" in the UI.

## Why it's designed this way (beginner takeaway)

This is a good real-world example of when **you don't need machine learning**. The rules here
are simple, well understood, and explainable in one sentence each ("a broken elevator is a -40").
That transparency matters a lot for an accessibility app — a rider needs to trust *why* a route
was recommended, and "the model said so" is a much worse answer than "this route has 2 broken
elevators." Compare this to feature 6, where the crowd/safety predictions genuinely do use
learned models — because *those* questions ("will it be crowded at 5pm?") don't have a clean rule
to hand-write.

## Files in this folder

- `services/routingEngine.ts` — everything described above
- `components/RoutePlanner.tsx` — the screen where a rider picks origin/destination and preset
  quick-trips, and triggers `calculateRoutes()`
- `components/RouteCard.tsx` — the compact summary card for one route in the results list
- `components/RouteDetailModal.tsx` — the expanded view showing the full score breakdown and
  segment-by-segment explanation for one route
- `components/MapView.tsx` — renders the route's stops and polyline on a Leaflet map
- `data/transitData.ts` — the mock stops and lines the engine draws candidates from
- `types/transit.ts` — `RouteCandidate`, `RouteScoreBreakdown`, `RouteSegment`, etc.
