# Combat Lab — Second Owner Rehearsal Recording Feedback Campaign

**Date:** 2026-09-27  
**Status:** **ACTIVE EVIDENCE EXTRACTION · NO IMPLEMENTATION PROMOTION YET**  
**Owner-tested frozen runtime:** `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`  
**Public control plane:** `rehearsal/current`

## 1. Campaign purpose

This campaign exists to extract the maximum useful evidence from the second Owner recording before changing the runtime again.

The recording is not being treated as a request to immediately add crowd features. In particular, Owner remarks about “personal space” and bodies that can squeeze/compress are **research seeds**, not implementation decisions.

The campaign must separate:

- direct Owner-observed behavior;
- video-visible apparatus behavior;
- exact frozen-runtime mechanistic evidence;
- hypotheses about causes;
- future candidate experiments.

## 2. Direct Owner feedback

Owner explicitly reported:

- some balls visibly got stuck and “died”;
- there are many smaller bugs, problems and missing pieces;
- despite that, the system now **starts to imitate a crowd in a meaningful sense**;
- the behavior naturally suggests future experiments with something like personal space and/or bodies that can yield/compress under pressure;
- do **not** jump straight into those mechanisms; first extract the recording seriously and broadly.

This is the strongest positive crowd/ecology Owner signal so far, but it is not a crowd-system qualification.

## 3. Recording-level observations

The ~187 s recording is a sequence of natural pressure experiments rather than one fixed trial.

Observed population exploration includes approximately:

- 8 baseline;
- 18;
- 35;
- 64;
- repeated 24-person trials with live passing-side edits;
- 256 explicit break regime;
- another 64-person run;
- 30 near the end.

This is already a product-level improvement over the first Ecology rehearsal: exact population-on-reset is actually used to move quickly between sparse, pressure, dense and break regimes.

### Moderate populations

At roughly 18–35 actors the world often shows:

- two opposing fronts approaching the central obstacle pair;
- compression around the available passage;
- irregular local displacement rather than perfectly scripted lanes;
- partial release of the jam;
- many actors reaching the opposite side;
- a residual cohort that stops completing the trip.

Examples visible in the recording:

- 18 actors: arrival count rises to roughly 13 before the next reset;
- 35 actors: arrival count rises through roughly 9 → 21 → 26 before reset;
- 30 actors near the end: arrival count rises roughly 0 → 2 → 13 while the recording ends.

This repeated compress/release/residual pattern is part of the positive “crowd-like” signal.

### 64-person regime

Two different 64-person trials show a qualitatively different regime:

- large opposing masses form;
- the central area becomes persistently congested;
- arrival count remains at 0 for the inspected interval;
- `max solve` is at `24/24`;
- the visual state resembles a sustained gridlock rather than ordinary local blocking.

The first inspected 64-person run uses LEFT passing convention. A later 64-person run occurs after other live policy experimentation. Dense failure is therefore not explained by one passing-side choice alone.

### 256 break regime

The 256 trial is clearly a break/stress regime:

- bodies initially occupy almost solid rectangular masses;
- `max solve = 24/24` immediately;
- the browser visibly slows;
- simulation time advances substantially slower than wall time.

From video timing, simulation advances from about 0.11 s to 2.52 s over roughly 4.5 s wall time after the reset, with an initial visible stall.

This remains valid breakability evidence, but not clean crowd-behavior evidence.

## 4. Exact frozen-runtime mechanistic audit

The deployed Pages artifact for exact R0 was downloaded and executed offline without changing the runtime.

### Finding A — recovery is one-shot per actor

Frozen R0 stores:

- `staticReplanAttempted`;
- `dynamicEncounterAttempted`;

as lifetime booleans for the trial.

After one static replan attempt, an actor cannot perform another static replan.
After one dynamic encounter attempt, an actor cannot perform another dynamic encounter response.

Exact-runtime replay:

- 8 actors / 20 s → 7 arrived; the remaining actor has already consumed static recovery;
- 18 / 25 s → 15 arrived; all 3 residual actors consumed static recovery, 2 also consumed dynamic recovery;
- 24 / 25 s → 23 arrived; the residual actor consumed both;
- 35 / 25 s → 29 arrived; 5 of 6 residual actors already consumed their single dynamic encounter.

**Material interpretation:** this is a strong candidate mechanism for Owner-observed “death”. A minimal one-shot falsifier competence has been carried too literally into a repeated-contact crowd environment.

This does not yet prove every visually dead ball has this cause.

### Finding B — pressure topology becomes physically invalid above 20 actors

Spawn and target Y positions use a fixed 580-unit vertical span divided by side population. Body radii are 20 / 26 / 32.

Exact initial-topology audit:

| Population | Initial dynamic overlap pairs | Initial world-boundary violators |
| ---: | ---: | ---: |
| 8 | 0 | 0 |
| 18 | 0 | 0 |
| 20 | 0 | 0 |
| 21 | 3 | 0 |
| 24 | 14 | 0 |
| 30 | 28 | 2 |
| 35 | 33 | 1 |
| 64 | 141 | 2 |
| 256 | 2603 | 8 |

The last completely clean population under the current generator is **20**.

Therefore:

> **the current “24 pressure” preset already injects initial physical overlap.**

The same spacing is used for targets, so high-N destination packing is also physically incompatible with body envelopes.

This is a major apparatus limitation. Dense recordings cannot be interpreted as pure crowd-pressure evidence until stimulus topology is separated from initial penetration / impossible goal packing.

### Finding C — ARRIVED is a sticky historical latch, not current physical arrival

When an actor enters arrival tolerance:

- mode becomes `ARRIVED`;
- desired velocity becomes zero.

If later body-body contact pushes that actor away from its target, there is no transition that restores locomotion from `ARRIVED`.

The aggregate `arrived` counter counts the sticky mode, not current geometric target occupancy.

Exact replay after 25 s:

- 18 actors: 15 latched ARRIVED, all 15 still physically inside target tolerance;
- 24 actors: 23 latched ARRIVED, but only **7 / 23** remain physically inside arrival tolerance;
- 35 actors: 29 latched ARRIVED, but only **3 / 29** remain physically inside arrival tolerance.

Some latched-arrived actors are displaced tens of world units from their targets.

This creates two distinct problems:

1. the visible world can contain physically displaced, inert “dead” bodies;
2. the label `arrived` overstates current physical arrival.

This may be another direct contributor to the Owner-observed “dying” balls.

### Finding D — coupled solver saturation is not rare at moderate density

Exact LEFT trials, measured per simulation frame:

| Population | Average coupled passes | Frames at 24/24 |
| ---: | ---: | ---: |
| 8 | 1.40 | 0% |
| 18 | 12.56 over first 10 s | 30.3% |
| 24 | 11.04 over first 10 s | 27.7% |
| 35 | 15.81 over first 10 s | 58.8% |
| 64 | 17.04 over first 5 s | 60.0% |

64 uses the full 24-pass budget from the first simulated frame.

The video independently shows substantial real-time slowdown at 64 and 256. The exact Node replay of 64 / 5 simulated seconds also takes ~12.9 s wall time.

Therefore current dense-gridlock evidence mixes:

- organism policy;
- impossible initial/target packing;
- contact-law behavior;
- bounded solver convergence;
- performance slowdown.

### Finding E — clean sparse regime still exposes competence debt

Invalid spawn packing is not the whole story.

Even with collision-free initial topology:

- 4 actors / 20 s can leave 1 residual;
- 8 / 20 s can leave 1 residual;
- 12 / 20 s can leave 1 residual;
- 16 / 20 s can leave 2 residual;
- 18 / 20 s can leave 5 residual.

Those residuals commonly remain in `ROUTE` after consuming one-shot recovery.

So there are at least two independent debts:

1. **organism lifecycle/recovery debt** at low/valid density;
2. **stimulus topology + solver debt** at higher density.

## 5. Apparatus / UX evidence from the recording

### Positive evidence

**Population authoring is materially better.**

The Owner naturally moves through many population regimes without repeated Spawn +50 clicks. This directly addresses one of the dominant first-rehearsal apparatus failures.

**The new Inspector contexts are discoverable enough to be explored.**

The recording visibly enters Observe and Session.

**Breakability remains intact.**

The Owner can directly request 256 and produce an ugly, slow, pathological state. No hidden protective despawn/ghosting prevents it.

### Still unqualified / unused paths

In the inspected Observe moments, the panel still says **“click a resident”**; no selected resident is visible in those sampled moments.

Therefore selected-subject causal Observe is **not Owner-qualified by this recording**. It exists and is mechanically browser-qualified, but there is not yet evidence that the Owner naturally used it to answer a causal question.

Similarly:

- Compare is not materially exercised in the recording;
- the overlay/debug toggle is not materially exercised;
- sampled keyframes remain around the default Fit view (~0.70×), so camera feel is not meaningfully qualified by this recording.

These are not FAILs; they are missing Owner evidence.

## 6. Positive crowd signal — bounded interpretation

The strongest positive result is not “we solved crowds”.

It is:

> **once several embodied actors with heterogeneous radii/mass/contact resistance share a bottleneck, the world now produces recognizable collective phenomena — opposing fronts, compression, temporary jams, release, queues and residual deadlock — strongly enough that the Owner spontaneously described it as beginning to imitate a crowd.**

That signal appears across multiple resets and populations rather than one lucky frame.

However, the dense regimes are too contaminated to identify which mechanisms deserve credit.

Current classification:

> **CROWD-LIKE PHENOMENOLOGY: POSITIVE OWNER SIGNAL. MECHANISTIC ATTRIBUTION: INCONCLUSIVE. DENSE APPARATUS VALIDITY: FAIL ABOVE CURRENT CLEAN TOPOLOGY FLOOR.**

## 7. Personal-space / soft-body ideas — research seeds only

The recording naturally motivates at least three distinct ideas that must not be conflated:

1. **preferred personal space / anticipatory separation** — a behavioral layer that reacts before hard contact;
2. **compressible soft envelope** — a physical/contact layer where a soft outer radius can yield under pressure while a hard core remains material;
3. **actual deformable body physics** — much higher-complexity soft-body simulation.

The first two are plausible future experiment families.
The third is not implied by the evidence and should not be imported merely because “soft bodies” sounds intuitive.

Current R0 only negotiates after actual contact plus no-progress. That inherently biases behavior toward touching, compression and late reaction. A future soft/pre-contact layer may be valuable, but testing it before fixing lifecycle and topology debt would confound the result.

## 8. Active questions for this campaign

Before any new crowd mechanic is promoted:

1. Which visually dead actors are:
   - one-shot recovery exhaustion;
   - sticky ARRIVED corpses;
   - static no-witness cases;
   - solver/pathological topology victims?
2. Can pressure be increased while keeping spawn/target topology physically valid and comparable?
3. What should “arrival” mean physically:
   - momentary crossing;
   - persistent occupancy;
   - exit/despawn through a boundary/portal;
   - goal completion followed by a new purpose?
4. How much of the apparent crowd feel survives in a collision-free, non-overlapping stimulus topology?
5. How much solver budget is truly needed after topology debt is removed?
6. Should repeated encounters be a reusable local competence rather than a lifetime one-shot flag?
7. Is current passing-side behavior useful after multiple encounters, or only as a one-shot D0 proof?
8. What observer/debug evidence is needed to distinguish behavioral deadlock from numerical saturation during Owner play?

## 9. Immediate campaign boundary

**Do not implement personal space, soft envelopes, new crowd steering or a new solver yet.**

Continue extracting/falsifying the recording and frozen R0 first.

The next implementation should only be selected after the dominant causes of dead/stuck actors and invalid pressure topology are separated well enough that a new experiment will measure one thing rather than repair several hidden defects at once.
