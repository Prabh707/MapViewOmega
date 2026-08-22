# Feature 6: Predictive Insights (Machine Learning)

## What this feature does

Two small models, both trained **from scratch, entirely in the browser, on every page load** —
no external ML library, no server, no pre-trained weights file:

1. **Crowd forecaster** — "how crowded will this line likely be, at this hour, on a weekday vs.
   weekend?" (`crowdModel.ts`)
2. **Safety score estimator** — "how safe would this stop's infrastructure make it feel, on a
   1–10 scale — and what's the single best thing to add to improve it?" (`safetyModel.ts`)

Both surface in `components/InsightsPanel.tsx`, the "Insights" tab of the app.

If you're new to machine learning, this is a genuinely good folder to learn from: it's real,
working ML, but small and simple enough to read top-to-bottom in one sitting — no framework
magic hiding what's happening.

## First, the shared toolkit: `ml/mathUtils.ts`

Before either model, you need 4 small building blocks (all dependency-free, in plain
TypeScript):

- **`dot(a, b)`** — the dot product of two number arrays: multiply each pair, add them up. This
  is the single most-used operation in both models — it's literally how a linear model turns a
  row of input features into one output number: `weight1*feature1 + weight2*feature2 + ...`
- **`sigmoid(z)`** — squashes any number into the range (0, 1). Written in a "numerically stable"
  way (branching on whether `z` is positive or negative) specifically to avoid a common bug where
  `Math.exp()` of a very large negative number silently becomes `0` or overflows to `Infinity`.
- **`softmax(scores)`** — turns a list of raw scores into probabilities that sum to 1 (e.g.
  `[2.1, 0.4, -1.0]` → `[0.79, 0.18, 0.03]`). Used by the crowd model to go from "raw scores for
  low/moderate/high" to "78% chance moderate."
- **`fitStandardizer(rows)` / `standardize(row, standardizer)`** — computes each feature's mean
  and standard deviation across the training data, then rescales every value to
  `(value - mean) / std`. **Why this matters**: without it, a feature like "service frequency in
  minutes" (values like 5–20) would numerically dominate a feature like "is it the weekend" (just
  0 or 1), even if the 0/1 feature is actually more predictive. Standardizing puts every feature
  on the same rough scale before training.

## Model 1: The Crowd Forecaster (`crowdModel.ts`)

### The problem it solves, and the honest limitation it works around

The app doesn't have any real historical ridership logs — each transit line only has one static
`crowdLevel` snapshot ('low' | 'moderate' | 'high'). You can't train a *real* model on data that
doesn't exist. So this file does something worth understanding as a technique in its own right:
it **generates a synthetic-but-realistic training set**, then trains a genuine model on that.

```ts
function ridershipCurve(hour: number, isWeekend: boolean): number {
  const morningPeak = Math.exp(-((hour - 8) ** 2) / (2 * 1.3 ** 2));
  const eveningPeak = Math.exp(-((hour - 17.5) ** 2) / (2 * 1.6 ** 2));
  const weekendPeak = Math.exp(-((hour - 13) ** 2) / (2 * 3 ** 2));
  const base = 0.08;
  return isWeekend ? base + 0.55 * weekendPeak : base + 0.85 * morningPeak + 0.75 * eveningPeak;
}
```

This is a bell-curve shape (a Gaussian) centered at 8am and again at 5:30pm on weekdays — i.e.
classic commuter rush hour — and one gentler midday bump on weekends. `buildSyntheticTrainingSet`
then combines that curve with each line's own baseline crowd level and service frequency, adds a
bit of deterministic random noise (`seededRandom` — "deterministic" meaning it always produces the
exact same "random" sequence given the same seed, so training is reproducible run to run), and
buckets the result into low/moderate/high to create thousands of labeled training examples.

### A clever detail: encoding "hour of day" as sin/cos

```ts
const angle = (hour / 24) * 2 * Math.PI;
return [Math.sin(angle), Math.cos(angle), ...];
```

If you fed the model the raw hour number (0–23), it would think 11pm (23) and midnight (0) are
about as far apart as two numbers can be — when really they're one hour apart. Mapping the hour
onto a point around a circle (using sine and cosine) fixes that "wraparound" problem. This is a
standard trick called **cyclical feature encoding**, useful anytime a number wraps around (hour of
day, day of week, month of year, compass direction).

### The model itself: multinomial logistic regression, a.k.a. a "softmax classifier"

This just means: for each of the 3 possible outcomes (low/moderate/high), the model keeps its own
row of weights and computes a raw score = `dot(weights, features)`. Then `softmax()` turns those 3
raw scores into 3 probabilities that add up to 100%, and whichever is highest is the prediction.

Training (`trainCrowdModel`) is **batch gradient descent**:
1. Run every training example through the model, get its predicted probabilities.
2. Compare each prediction to the true label — the difference is the "error."
3. Nudge every weight a little bit in the direction that would have reduced that error, scaled by
   a `learningRate` (0.35 here).
4. Repeat for 300 passes over the data ("epochs").

```ts
const error = probs[c] - (c === trueIdx ? 1 : 0);
for (let j = 0; j < dims; j++) {
  grads[c][j] += error * X[i][j];
}
```

There's also a small **L2 regularization** term (`l2 = 0.001`) added when updating weights — this
gently discourages any single weight from growing huge, which helps the model generalize instead
of memorizing quirks of the (synthetic) training data.

## Model 2: The Safety Score Estimator (`safetyModel.ts`)

### What's different about this one

Unlike the crowd model, this one trains on **real** data — every stop in `MOCK_TRANSIT_STOPS`
already has a human-assigned `lightingScore` (1–10) and a set of yes/no infrastructure facts:

```ts
export interface SafetyFeatures {
  cctvCovered: boolean;
  securityKioskNearby: boolean;
  blueLightSOS: boolean;
  stepFree: boolean;
  hasRamp: boolean;
  elevatorOperational: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
}
```

The catch: there are only about 8 stops total, which is a *tiny* training set by ML standards.

### The model: ridge (L2-regularized) linear regression

"Linear regression" means the prediction is just a weighted sum of the inputs, plus a starting
bias value: `predicted_score = bias + w1*cctv + w2*kiosk + w3*sos + ... `. Training works the
same gradient-descent way as the crowd model, but simpler — there's only one number to predict
(the score), not three class probabilities:

```ts
const pred = dot(weights, X[i]);
const error = pred - targets[i];
// ... nudge weights to reduce error, same idea as before
```

"Ridge" specifically refers to the **strong L2 regularization** (`l2 = 0.15` — notably stronger
than the crowd model's `0.001`). With only 8 examples, an unregularized model could easily fit
those 8 points *perfectly* while making wild, unstable predictions on anything slightly
different — a classic case of **overfitting**. Regularization is the fix: it keeps every weight
smaller and more conservative, trading a little accuracy on the training data for much better,
more sensible behavior on new inputs.

### Why a *linear* model was chosen on purpose — and why it doubles as a recommendation engine

This is the most important design decision in this whole feature. Because the model is linear,
every feature's learned weight has a direct, human-readable meaning: *"a working elevator is
worth about this many safety points."* A more powerful but "black box" model (like a neural
network) couldn't offer that.

`suggestImprovements()` exploits exactly this:

```ts
for (const name of FEATURE_NAMES) {
  if (features[name]) continue;             // skip anything already present
  const withFeature = { ...features, [name]: true };
  const gain = predictSafetyScore(model, withFeature) - baseline;
  if (gain > 0) {
    suggestions.push({ feature: name, label: FEATURE_LABELS[name], estimatedGain: gain });
  }
}
```

For every safety feature a stop *doesn't* have yet, it asks the model "what would my score become
if this were added, holding everything else the same?" — then ranks all of those hypothetical
improvements best-first. That's what powers the "here's what to build next" suggestions in the
Insights tab — a genuinely useful, explainable output that falls straight out of using a simple
model instead of a fancy one.

## The recurring theme across both models

Neither model is loaded from a saved file — `trainCrowdModel()` and `trainSafetyModel()` run
fresh every time `InsightsPanel` needs them, and because the datasets and models are so small,
this takes milliseconds. This is only possible *because* the models were kept deliberately
simple — it's a good illustration that "machine learning" doesn't always mean "huge neural
network on a GPU cluster." Sometimes a few hundred lines of gradient descent, run instantly in a
browser tab, is exactly the right tool.

## Files in this folder

- `ml/mathUtils.ts` — dot product, sigmoid, softmax, feature standardization
- `ml/crowdModel.ts` — synthetic data generation + softmax classifier for crowd forecasting
- `ml/safetyModel.ts` — ridge linear regression for safety scoring + the improvement-suggestion
  logic
- `ml/index.ts` — barrel export (re-exports everything above from one import path)
- `components/InsightsPanel.tsx` — the UI: pick a line + day type for a 24-hour crowd forecast
  chart, or toggle safety features for a proposed corridor to see its estimated score and ranked
  suggestions
- `data/transitData.ts` — the mock stops/lines that both models train on
- `types/transit.ts` — `TransitLine`, `TransitStop`, and the underlying fields both models read
  (`crowdLevel`, `frequencyMin`, `lightingScore`, `cctvCovered`, etc.)
