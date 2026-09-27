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


## 8A. Further falsification — clean 18-person trial preserves the crowd signal

The 18-person recording segment is especially valuable because the current generator is still collision-free at both start and target positions.

Visible sequence (~20–42 s):

- two clean opposing columns;
- approach to the central obstacle pair;
- first central contact/compression;
- several seconds of local jam / rearrangement;
- irregular release to both sides;
- accumulation near destinations;
- a small residual cohort that fails to complete.

The overlay rises to approximately **15 / 18 arrived** before the next reset.

Independent video tracking of the residual state finds at least **two bodies remaining practically stationary for >=5 s while still far from their target side**.

Therefore:

> **the positive crowd-like phenomenology and the residual “death” phenomenon both survive in a physically valid spawn/target regime.**

Invalid high-density packing is a major confounder, but it is not the sole cause of either phenomenon.

The 18-person segment also reaches historical `max solve 24/24` during the encounter, so solver difficulty begins before invalid spawn packing. This is a separate scaling/correctness pressure, not evidence that the spawn itself was invalid.

## 8B. Passing-side semantics are one-shot, not a persistent convention

Exact frozen R0 logic shows:

- `dynamicEncounterAttempted` begins false;
- the first qualifying dynamic no-progress event sets it true permanently;
- LEFT / RIGHT perform one `SIDESTEP` lasting 0.8 s, then resume the previous DIRECT/ROUTE plan;
- because `dynamicEncounterAttempted` remains true, no later dynamic encounter can trigger another sidestep;
- NONE enters `DYNAMIC_BLOCKED_NO_CONVENTION`, but `preferredVelocity` still drives it toward its plan; the label means “no convention recovery available”, not a stationary body.

So current `Passing side` is still fundamentally a D0-style **first-encounter probe**, not a reusable crowd norm.

This matters for interpreting the recording:

- the Owner naturally edits passing side live several times;
- around the repeated 24-person section, policies are changed during running trials before some resets;
- those sequences are useful product evidence that the control invites experimentation;
- they are **not clean matched A/B/C behavioral trials**;
- even a clean reset under LEFT/RIGHT/NONE would currently test only the first qualifying encounter for each actor.

The approximately 24-person NONE trial beginning near ~131 s remains directionally interesting: by ~13.2 simulation seconds the overlay shows about **11 / 24 arrived** and several actors remain dispersed/residual. But because 24 already begins with invalid body overlap, this is not promotion-grade evidence about convention quality.

## 8C. Arrival lifecycle is a semantic source of inert physical bodies

`ARRIVED` currently means:

- actor brain enters a terminal mode;
- desired velocity becomes zero;
- body remains fully material in the same contact solver;
- later contacts may displace that body;
- actor does not revoke ARRIVED or regain locomotion.

This creates a hybrid state:

> **cognitively finished, physically active as an obstacle.**

That can be valid in some future game situations, but it is not neutral apparatus behavior for the current counterflow experiment.

In this topology, every actor's target is a point in the opposite side's destination column. Therefore completed actors accumulate as stationary material bodies exactly where later members of the same stream are trying to finish.

At valid density this already increases endpoint pressure.
At invalid density the target slots themselves overlap, making terminal-body accumulation pathological.

The current overlay compounds the ambiguity by counting sticky `mode==="ARRIVED"`, not current geometric occupancy of the target.

This is now a first-class experiment-design question, not a small UI bug:

- should a completed test subject leave the flow?
- should crossing a finish line count and then retire it from contact?
- should it acquire a new purpose?
- should persistent target occupancy be the actual phenomenon under test?

Do not pick one implicitly.

## 8D. Contact solver scaling ceiling is structurally predictable

Current coupled solve can perform:

- all `N(N-1)/2` body pairs;
- up to 12 contact iterations per pair pass;
- up to 24 static<->dynamic coupled passes;
- at 120 simulation steps / second.

Worst-case pair checks per simulation step:

| Population | Body pairs | Max pair checks / sim-step |
| ---: | ---: | ---: |
| 18 | 153 | 44,064 |
| 24 | 276 | 79,488 |
| 35 | 595 | 171,360 |
| 64 | 2,016 | 580,608 |
| 256 | 32,640 | 9,400,320 |

At 120 Hz, the 256 theoretical ceiling exceeds **1.1 billion pair checks per simulated second** before other work.

This explains why the 256 Owner run is a legitimate break-regime result but not a meaningful crowd-quality benchmark.

A broadphase / spatial partition is an obvious future candidate if large-N crowd work becomes important, but implementing it now would be premature because the current stimulus topology and lifecycle semantics still contaminate the experiment.

## 8E. Revised causal map for “dead” balls

The campaign should no longer use “stuck/dead” as one bucket.

At least four mechanisms can produce a visually inert or non-completing body:

1. **recovery exhaustion**  
   Actor is still pursuing a purpose but has consumed its lifetime static/dynamic recovery flag.

2. **sticky terminal arrival**  
   Actor has completed cognitively, remains a material collider, gets displaced, and never reactivates.

3. **static no-witness terminal state**  
   `STATIC_STUCK_NO_WITNESS` explicitly zeros preferred movement.

4. **constraint/topology pathology**  
   Invalid initial/target packing or persistent coupled-solver saturation creates states that are not clean organism-policy evidence.

The next controlled experiment should be designed to separate these causes rather than “reduce stuckness” globally.


## 8F. The current stimulus is not pure counterflow

The distributed topology intentionally permutes target ranks:

`targetRank = rank ± floor(sideCount / 3)`.

Therefore actors travelling in the **same direction** are not simply trying to preserve lanes from one side to the other. They are assigned vertically shifted destinations and must cross/reorder relative to peers in their own stream.

At 18 actors, each side has 9 residents and the offset is 3 slots — a large vertical shift.

So the current recording combines at least four interaction sources:

1. opposing directional flow;
2. within-stream crossing / reordering;
3. static bottleneck geometry;
4. accumulation at terminal destination columns.

This is useful as a deliberately difficult interaction stimulus, but it is not a clean lane-formation or ordinary pedestrian-counterflow test.

Implication:

> future evidence about spontaneous lanes, anticipatory personal space or local crowd organization should include a **straight-flow baseline** rather than relying only on this permutation stimulus.

The current crowd-like Owner signal remains real at the phenomenological level; its mechanistic source is broader than “opposing pedestrians negotiate a bottleneck”.

## 8G. LEFT / RIGHT are not environment-symmetric in this map

The obstacle pair is vertically asymmetric:

- an outer path exists above the upper pillar;
- the lower pillar ends only ~10 world units from the bottom boundary, so no current body can use an equivalent bottom outer path;
- a central passage exists between the pillars.

Passing side is defined in each actor's local travel frame.

For the left-to-right stream:

- LEFT nudges globally upward;
- RIGHT nudges globally downward.

For the right-to-left stream the mapping reverses.

Therefore LEFT and RIGHT do not receive geometrically mirrored opportunities in this stimulus.

This matters because a policy difference can partly be a **map-side affordance difference**, not a general contact convention result.

Any later LEFT-vs-RIGHT comparison that aims at general behavior should use either:

- mirrored environments;
- symmetric route affordances;
- or explicit stratification by stream/direction.

## 8H. Pressure is currently encoded as initial packing, not flow rate

The recording exposed an important experimental-design distinction.

The current `Population on reset` pressure axis increases the number of bodies packed into two fixed vertical start columns and fixed destination columns.

Beyond 20 actors this changes not only crowd pressure but also:

- initial penetration;
- boundary validity;
- target feasibility;
- immediate solver work;
- terminal destination congestion.

So `population` is not a clean density/pressure independent variable at high N.

Potential future pressure axes to compare — **not implementation decisions yet**:

- wider or multi-row collision-free spawn regions;
- continuous entrance / arrival rate;
- fixed population in a larger physically valid holding area;
- periodic source/sink flow through the scene;
- world area scaled with population while local bottleneck width remains controlled.

This is conceptually important for preserving Owner breakability:

> “allow 256” should mean the Owner can intentionally overload the system, not that the ordinary pressure variable must create invalid initial geometry before the crowd even interacts.

## 8I. Transit completion and destination occupancy are currently conflated

Current R0 asks an actor to reach a point and then remain as a material body.

That mixes two different research questions:

1. **Can an organism traverse / negotiate the crowd?**
2. **Can many bodies persistently occupy the destination area?**

For the second question, stationary arrived bodies are legitimate pressure.
For the first, they are apparatus pollution after the relevant event has already happened.

A future experiment should make that choice explicit.

Candidate semantics to compare later:

- crossing a finish line then retiring/removing from interaction;
- entering a sink/portal and counting completion;
- wrap/recycle to the opposite source for steady-state flow;
- persistent destination occupancy as its own deliberate scenario;
- completion followed by a new purpose.

No option is selected yet.


## 8J. The top-left overlay mixes historical and current truth

Two prominent R0 metrics are easy to over-read.

### `max solve 24/24`

The overlay uses historical `maxCoupledPassesUsed`.

Once any frame reaches 24 coupled passes, the display remains `24/24` for the rest of the trial even if the current frame is cheap and the crowd has largely released.

The clean 18-person video visibly demonstrates this: the label remains saturated after much of the central cluster has already dispersed.

So the current overlay cannot distinguish:

- one historical hard frame;
- intermittent saturation;
- continuous saturation.

Future observability should separate at least:

- current coupled passes;
- peak coupled passes;
- optionally fraction/recent-window of saturated frames.

### `arrived N`

The overlay counts sticky terminal actor modes.

It does not report how many latched-arrived bodies remain physically inside target tolerance now.

Therefore the line combines:

- current residents;
- historical completion latch;
- historical peak solver cost.

This is too semantically compressed for serious causal diagnosis.

## 8K. High-density actors may spend their one-shot encounter competence before the real encounter

At 64+ actors the initial columns contain many overlapping same-stream neighbors.

Dynamic recovery threshold is only 0.42 s.
The opposing streams begin ~860 world units apart and must travel toward the central region before a true counterflow encounter.

Therefore the high-density stimulus creates a strong risk that actors consume `dynamicEncounterAttempted` while disentangling from **their own starting column**, before meeting the opposite stream.

Exact 64 replay already shows many actors have consumed their sole dynamic encounter early in the trial.

This is currently a strong causal hypothesis rather than a per-actor timestamp proof, but it follows directly from:

- invalid initial overlap;
- one-shot encounter semantics;
- short no-progress threshold;
- travel distance to the central encounter.

If confirmed, the current dense stimulus actively destroys the competence it is supposed to test.

## 8L. Preset names currently overstate experimental validity

The current R0 presets include:

- `24 pressure`;
- `64 dense`;
- `256 break`.

After the topology audit:

- 24 already has initial overlap;
- 64 is heavily invalid at start/target and solver-expensive;
- 256 is an intentional pathological break regime.

So only `256 break` is semantically honest as written.

The `24 pressure` / `64 dense` labels should not be treated as canonical pressure tiers in future work until pressure can be increased without changing physical validity.


## 8M. The overload is lost realtime, not variable-step physics

Workbench simulation uses:

- fixed `dt = 1/120 s`;
- `maxFrame = 0.05 s`;
- `maxAccum = 0.10 s`.

When the browser cannot keep up, wall time is discarded rather than converted into a larger physics timestep.

Therefore the visible 64 / 256 slow-motion regime means:

> **the apparatus is falling behind realtime while preserving fixed-step mechanics.**

This is substantially cleaner than silently increasing dt, but it still makes high-N Owner observation expensive and slow.

The existing `RuntimePerformanceMeter` already records:

- `simulationToWallRatio`;
- `discardedWallSeconds`;
- simulation / render / observation phase time.

R0 does not surface those values in the main ecology observation flow.

So the immediate observability debt is mainly **presentation**, not absence of instrumentation.

## 8N. Recording gives a practical realtime scaling bracket

The final recording sequence is especially informative because it runs 256 → 64 → ~30 through explicit Reset World transitions without reloading the page.

Approximate observed timing:

### 256

Around 149–151 s wall-time:

- sim time remains around 0.06–0.11 s for multiple wall seconds.

This is effectively a frozen break regime.

### 64

After reset:

- ~152 s wall: sim ~0.90 s;
- ~160 s wall: sim ~2.57 s;
- ~165 s wall: sim ~4.53 s;
- ~170 s wall: sim ~6.43 s.

This is roughly ~0.3x realtime over the segment.

### 35

Earlier 35-person trial:

- ~44 s wall: sim ~1.05 s;
- ~68 s wall: sim ~25.04 s.

This remains essentially realtime.

### ~30

Final trial:

- ~173 s wall: sim ~1.27 s;
- ~187 s wall: sim ~15.27 s.

Again essentially 1x realtime.

Bounded interpretation:

> **current useful interactive scaling is still healthy around 30–35 bodies, while 64 crosses a major realtime cliff and 256 is a deliberate break regime.**

This is not yet a precise maximum-capacity benchmark because topology invalidity and contact density differ with N.

## 8O. Reset World survives pathological overload

The same final sequence demonstrates an apparatus-strength result:

- 256 can nearly freeze the simulation;
- explicit Reset World can still move to 64;
- another reset can move to ~30;
- ~30 returns to realtime progression.

So the pathological regime does **not** visibly poison the runtime permanently.

That supports the Owner requirement that the Lab remain breakable and recoverable rather than protecting itself through hidden caps/despawns.

The remaining problem is that ordinary pressure levels should become physically valid and more computationally scalable, not that break regimes should be prevented.


## 8P. Owner interaction pattern identifies the highest-value Lab surfaces

The recording itself shows which apparatus features the Owner naturally uses.

### Heavily used / clearly valuable

**Exact population-on-reset**

The Owner repeatedly moves through substantially different population regimes without manual spawn-button repetition.

This is strong product evidence that exact authored pressure + explicit Reset World is a meaningful improvement.

**Live passing-side authoring**

The Owner changes the policy repeatedly while the experiment is running.

The resulting behavioral evidence is not a clean A/B because current passing-side semantics are one-shot and some edits occur mid-trial, but the *authoring interaction itself* is clearly used.

### Used as macro inspection

**Observe**

The Owner opens Observe during the repeated 24-person trial and again in the 64-person dense state.

In both inspected moments, no resident is selected.

This suggests the first natural diagnostic question is system-level:

> “what is happening to this whole crowd / simulation?”

rather than immediately:

> “why is resident-17 doing this?”

Current World Now values include cumulative contact resolutions and max coupled passes, but those are too raw / historically compressed to answer the causal question.

Example direct recording evidence:

- ~132 s, population 24, sim ~1.17 s:
  - `contact resolutions ~18,062`;
  - `max coupled passes 22`;
  - no selected resident.
- ~136 s, same trial, sim ~5.17 s:
  - `contact resolutions ~544,692`;
  - `max coupled passes 24`;
  - no selected resident.
- ~155 s, population 64, sim ~2.72 s:
  - `contact resolutions ~1,483,004`;
  - `max coupled passes 24`;
  - no selected resident.

This is strong evidence for a **macro causal-health layer** before selected-subject drilldown.

Candidate future macro categories, grounded in current findings:

- actively pursuing;
- current physical arrivals vs latched completions;
- recovery-exhausted;
- terminal-arrived-but-displaced;
- explicit static stuck;
- current dynamic stalled;
- current contact pairs;
- current coupled passes + peak;
- recent saturation fraction;
- simulation/wall ratio + discarded time.

These are evidence needs, not a frozen UI design.

### Used for provenance

**Session**

The Owner opens Session during the recording.
It visibly reports the frozen build `9fe3e7f7...` and `rehearsal/current`.

This is positive evidence that provenance is discoverable in the new IA.

### Not materially exercised

- selected-resident causal drilldown;
- Compare;
- global Overlay;
- camera zoom/pan (recorded view remains around Fit / ~0.70x in sampled frames).

Do not classify these as FAIL from this recording alone.
They remain Owner-unqualified.

## 8Q. Clean evidence now supports a bounded embodied-ecology subclaim

The 18-person trial is collision-free at spawn and targets.

Yet it still produces:

- opposing approach;
- local crowd compression;
- temporary jam;
- release;
- heterogeneous displacement;
- majority throughput;
- residual deadlock.

No central behavioral crowd coordinator or ghosting is required for those phenomena.

This supports a narrower claim than “crowds are solved”:

> **simple embodied actors plus local material contact are already sufficient to produce recognizable collective spatial phenomena in a valid small crowd.**

This is meaningful positive evidence for the embodied-ecology direction.

It does **not** qualify:

- current organism competence;
- large-N scaling;
- current passing convention;
- current solver as production physics;
- personal-space mechanics;
- dense crowd validity.

A future correction must preserve this valuable capacity for meaningful blocking / compression / jam rather than optimizing blindly for maximum throughput.


## 8R. Strong dead-actor mechanism — ROUTE can become stale without any failure detector

Frozen R0 static failure detection is more limited than “one replan per lifetime”.

The static no-progress branch requires:

- a static blocker this step;
- `!staticReplanAttempted`;
- **`actor.mode === "DIRECT"`**.

Therefore once an actor has accepted a verified route witness and entered `ROUTE`:

- static no-progress is no longer accumulated;
- a later static block while following that route cannot trigger recovery;
- the route follower advances a waypoint only by entering the waypoint's arrival tolerance;
- crowd contact can displace the body away from / beyond the route geometry;
- the actor can keep steering toward a stale waypoint indefinitely.

Exact replay already found that clean low-density residual actors commonly remain in `ROUTE` after using their one static recovery.

The clean 18-person recording places persistent residual bodies near the pillar geometry.

Together these make **stale ROUTE without a failure episode** a strong current explanation for at least part of the Owner-observed “death” phenomenon.

This does not invalidate the N0b route witness itself:

> the witness can be correct at query time while the **consumer's execution state becomes stale later**.

This is a composition failure between navigation evidence and embodied crowd disturbance.

## 8S. Selected-subject causal Observe currently has a blind spot for that failure

Current `subjectWhy()` can report:

- “following verified static route witness”

whenever mode is `ROUTE`.

But it does not know whether:

- the actor is making meaningful progress along that route;
- the actor has missed / passed a waypoint;
- the route has become stale after displacement;
- recovery eligibility has already been exhausted.

Similarly, `Blocked by` uses:

- pre-contact `staticBlockerThisStep`;
- current dynamic partner list.

The coupled solver's post-contact static projection corrections are not attributed back to the actor as an embodied blocking cause.

So an actor can be physically constrained by crowd→pillar interaction while selected-subject diagnostics under-report or misclassify the reason.

This is exactly the kind of causal-debug debt the next observability layer must avoid.

A useful future explanation should distinguish at least:

- verified route still valid and progressing;
- route execution not progressing;
- route waypoint stale / missed;
- physically pushed into static constraint;
- recovery available;
- recovery exhausted.


## 8T. Exact 1:1 reconstruction of the three visible 18-person residuals

The strongest causal result of the campaign is now an exact replay match between the recording and frozen R0 internals.

The final inspected 18-person recording state is around:

- simulation time `22.09 s`;
- `15 / 18 arrived`;
- three persistent residual bodies near the pillar geometry.

Exact frozen replay of:

- population `18`;
- passing side `LEFT`;
- fixed step `1/120 s`;
- exact R0 runtime `9fe3e7f7...`;

reproduces the same three spatial residuals.

### Residual A — resident-1

Visual match:

- blue / small phenotype;
- left side of upper pillar.

Exact state:

- mode: `ROUTE`;
- radius: `20`;
- position: approximately `(490, 275.996)`;
- exact tangent X to upper pillar left face: `510 - 20 = 490`;
- current blocker: `pillar.upper`;
- desired velocity remains non-zero, approximately `(+139, +16.9)`;
- route index has already advanced past the first safe corner;
- `staticReplanAttempted = true`;
- `staticNoProgressFor = 0`;
- this actor has **not** consumed a dynamic encounter.

### Residual B — resident-6

Visual match:

- large orange phenotype;
- left side of lower pillar.

Exact state:

- mode: `ROUTE`;
- radius: `32`;
- X approximately `478`;
- exact tangent to lower pillar left face: `510 - 32 = 478`;
- current blocker: `pillar.lower`;
- `staticReplanAttempted = true`;
- `staticNoProgressFor = 0`;
- dynamic encounter already used once.

### Residual C — resident-12

Visual match:

- large orange phenotype;
- right side of lower pillar.

Exact state:

- mode: `ROUTE`;
- radius: `32`;
- X exactly `622`;
- exact tangent to lower pillar right face: `590 + 32 = 622`;
- current blocker: `pillar.lower`;
- `staticReplanAttempted = true`;
- `staticNoProgressFor = 0`;
- dynamic encounter already used once.

This directly falsifies a simplistic explanation that all dead bodies require exhaustion of the dynamic sidestep competence: resident-1 dies without ever using it.

The common signature is instead:

> **valid route was acquired -> crowd contact displaced the actor after route progress -> route execution became stale -> actor reached a tangent static contact -> ROUTE mode had no failure episode / replan eligibility -> actor remained alive internally but spatially dead.**

## 8U. Route knowledge still exists at the dead positions

N0b was queried from each exact dead-body position without changing any world geometry.

All three positions still return a valid verified static route witness.

Therefore the deadlock is **not**:

- an unreachable world state;
- a missing N0b route;
- a permanent geometric softlock.

The route substrate can still answer the question correctly.

The failure is in **when / whether the embodied actor is allowed to ask again and how route execution reacts to displacement**.

This preserves an important qualification boundary:

> N0b route witness remains valid evidence infrastructure; its current crowd consumer is inadequate.

## 8V. Static collision integration contains an independent wall-stick mechanism

Exact residual motion exposed a second mechanism independent of route policy.

Current static integration:

1. proposes the full body displacement for the fixed step;
2. sweeps the circle against static geometry;
3. if blocked, advances only to the impact fraction;
4. removes the velocity component into the contact normal.

When a body is already tangent to a wall and its desired velocity contains:

- a small component into the wall;
- a meaningful tangential component;

the sweep can report contact at approximately fraction zero.

The full displacement is then discarded for that step.

The motor rebuilds the into-wall component on the next step, producing the same zero-fraction collision again.

Result:

> **the body does not perform the remaining tangential movement and can stick perfectly to a wall despite a valid tangential velocity component.**

For resident-1, position becomes bit-stable from roughly `7 s` through `22.09 s` while desired velocity remains non-zero.

So the observed death chain contains both:

- route/lifecycle debt;
- locomotion/contact integration debt.

Neither should be hidden by a higher-level crowd steering patch.

## 8W. Analysis-only counterfactuals separate candidate causes

The following experiments were performed only against a local extracted copy of the exact frozen Pages artifact.

They are **not repo changes** and do not qualify any fix.

### Counterfactual A — refresh only the three stale routes at 22.09 s

No physics change.
No personal space.
No passing-policy change.
No solver change.

Only the three exact residual actors receive a fresh current N0b witness.

Result:

- baseline at intervention: `15 / 18`;
- around `26.1 s`: `16 / 18`;
- all actors eventually complete;
- trial reaches `18 / 18 COMPLETE` around `29.73 s`.

Interpretation:

> **fresh route recovery alone is sufficient to revive the exact three film residuals.**

### Counterfactual B — wall sliding only

No new route query.
No change to one-shot recovery flags.
No personal space or crowd steering.

Static collision is modified analysis-only so blocked normal motion is removed while the valid remaining tangential movement can continue.

Result:

| Simulation time | Frozen R0 | Wall-slide counterfactual |
| ---: | ---: | ---: |
| 8 s | 1 / 18 | 5 / 18 |
| 10 s | 6 / 18 | 10 / 18 |
| 12 s | 8 / 18 | 13 / 18 |
| 14 s | 11 / 18 | 16 / 18 |
| 16 s | 12 / 18 | 17 / 18 |
| ~19.83 s | incomplete | **18 / 18 COMPLETE** |

Interpretation:

> wall sliding alone also eliminates the clean-18 residual failure, but materially changes the throughput and timing of the entire crowd encounter.

Therefore wall sliding must not be promoted merely as a harmless numerical patch. It changes the behavioral organism/world interaction enough to require its own bounded comparison.

### Counterfactual C — mechanically rewind routeIndex on static contact

A deliberately simple alternative was tested:

- no fresh path query;
- no wall slide;
- when a ROUTE actor hits static geometry, move it back toward the previous route waypoint.

Result:

- **FAIL**;
- only about `12 / 18` complete even after `40 s`;
- new oscillations/conflicts appear.

Interpretation:

> stale-route recovery is not safely reducible to “go back one waypoint”.

Do not use this heuristic.

### Counterfactual D — remove one-shot static recovery restriction

A broader analysis-only variant allows a ROUTE/DIRECT actor to accumulate static no-progress again and obtain another N0b witness.

Result:

- eventually `18 / 18 COMPLETE` around `30.25 s`;
- but the 18-person trial produces **22 static replans**;
- individual actors replan repeatedly, with some reaching roughly 4–5 replans.

Interpretation:

> reusable recovery solves completion, but naive unrestricted re-query creates replan chatter / thrashing.

Therefore the future mechanism should not be “delete `staticReplanAttempted`”.

The useful design concept exposed by the counterfactual is a **re-armable recovery episode**:

- recovery can become available again after meaningful new progress / changed circumstances;
- repeated failure within the same episode should not spam the route witness system;
- the re-arm event must be explicit and observable;
- the policy should remain event-driven rather than continuous path-query steering.

This is a future experiment hypothesis, not a selected implementation.

## 8X. Revised causal chain for the clean 18-person dead-body failure

The exact evidence now supports the following chain:

1. actor initially moves DIRECT;
2. static blocker produces factual no-progress;
3. actor obtains a valid N0b route witness;
4. actor makes real progress and advances route state;
5. material crowd contact later displaces it away from the route corridor;
6. current route index / waypoint becomes stale relative to embodied position;
7. actor steers a direct segment toward that stale route state;
8. static sweep reaches tangent contact with a pillar;
9. current integrator discards the tangential remainder of blocked motion;
10. actor remains in ROUTE, so static no-progress detection is disabled;
11. lifetime `staticReplanAttempted` also forbids another route query;
12. actor can remain indefinitely alive-in-policy but dead-in-space.

This is now the strongest explanation for the three explicitly reconstructed residuals from the clean 18-person recording.

Important boundary:

- **route staleness is causal;**
- **wall-stick is causal;**
- both independently admit successful counterfactuals;
- the recording does not yet tell us which correction gives the desired Feniks/Combat-Lab movement feel;
- they may both deserve correction, but must be tested separately before composition.


## 8Y. Clean 18 factorial separates body negotiation, obstacles and target crossing

Additional analysis-only trials used the exact frozen mechanics with clean population 18.

No runtime/repo mechanics were modified.

### Straight-flow + open world

Targets preserve each actor's Y lane and both pillars are removed.

Results:

| Passing convention | Result |
| --- | --- |
| LEFT | **18 / 18 COMPLETE**, ~21.52 s |
| RIGHT | **18 / 18 COMPLETE**, ~21.51 s |
| NONE | **0 / 18 after 30 s** |

All 18 actors in the LEFT/RIGHT trials use one dynamic encounter episode.

This is a particularly clean causal result:

> **hard material contact plus the existing one-shot local passing convention is sufficient to resolve a pure open-space head-on counterflow; without a passing convention the same material streams form a stable gridlock.**

No static routing, pillar geometry or target permutation is needed for this effect.

So the current D0-style convention has real local causal authority.
Its weakness is repeated/composed encounters, not the absence of any useful behavior.

### Straight-flow + pillars

Keeping straight targets but restoring current pillars:

| Convention | Result at 30 s |
| --- | ---: |
| LEFT | 15 / 18 |
| RIGHT | 16 / 18 |
| NONE | 11 / 18 |

The dead-body / stale-route failure returns only after static obstacle interaction is reintroduced.

### Permuted targets + open world

Removing pillars but restoring current target permutation:

- all LEFT / RIGHT / NONE variants eventually complete;
- interaction/contact work is substantially higher than pure straight flow;
- NONE no longer creates the clean stable head-on gridlock because permuted goals themselves introduce lateral desired motion.

Therefore current target permutation is not neutral “variety”:

> it supplies its own de facto avoidance/crossing geometry and can mask what the explicit passing convention is doing.

### Permuted targets + pillars — current R0 stimulus

At clean 18:

- LEFT: 15 / 18 at 30 s;
- NONE: 13 / 18;
- RIGHT: 18 / 18 COMPLETE around 13.68 s.

This apparent RIGHT advantage is **not** a general policy qualification.

The factorial shows that obstacles + target crossing + map asymmetry interact strongly with the convention.

## 8Z. Mirrored-world falsifier proves policy result is environment-relative

A full geometric mirror was tested analysis-only:

- pillar geometry mirrored vertically;
- actor start Y positions mirrored;
- target Y positions mirrored;
- LEFT and RIGHT exchanged under the coordinate reflection.

Result pairs:

- original LEFT -> 15 / 18;
- exact mirrored RIGHT -> 15 / 18;
- contact work and remaining distance are nearly identical.

And:

- original RIGHT -> 16 / 18;
- exact mirrored LEFT -> 16 / 18;
- again nearly identical.

So the apparent side preference transforms with the environment exactly as expected under reflection.

Bounded verdict:

> **current LEFT-vs-RIGHT outcome is coupled to environment orientation / route affordances, not evidence that one convention is intrinsically superior.**

Future convention experiments should use:

- symmetric stimuli;
- mirrored paired stimuli;
- or explicit directional/environment stratification.

This is especially important before adding anticipatory personal-space behavior, because an asymmetric map can otherwise make a steering bias look intelligent.

## 9. Immediate campaign boundary

**Do not implement personal space, soft envelopes, new crowd steering or a new solver yet.**

Continue extracting/falsifying the recording and frozen R0 first.

The next implementation should only be selected after the dominant causes of dead/stuck actors and invalid pressure topology are separated well enough that a new experiment will measure one thing rather than repair several hidden defects at once.
