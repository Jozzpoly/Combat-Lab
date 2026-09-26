# Combat Lab — First Ecology Rehearsal Implicit Requirements Mining

**Date:** 2026-09-26  
**Source:** first public Active Spatial Ecology v0 Owner recording + direct Owner feedback + exact specimen code  
**Campaign:** first feedback/evidence campaign  
**Scope:** infer requirements and anti-requirements from observed Owner work; do not select replacement architecture or implementation

## 0. Why this record exists

The first recording did more than expose defects.

It revealed how the Owner actually uses a research lab when left unscripted.

That observed workflow is a better source of Lab requirements than a speculative feature list.

This record therefore asks:

> **What must a professional Combat Lab make easy, visible and trustworthy if it is to support the Owner's real method of discovery?**

It deliberately does **not** answer:

- which UI framework to build;
- which physics engine to use;
- which pathfinding/crowd algorithm to adopt;
- whether to use tabs, docks, panels, graphs or windows;
- which exact replacement organism to implement.

## 1. Evidence confidence vocabulary

### DIRECT OWNER REQUIREMENT

Explicitly stated by the Owner in feedback.

### STRONG OBSERVED REQUIREMENT

Not stated as a feature request, but repeatedly implied by visible behavior or by a material failure in reconstructing the experiment.

### RESEARCH-INTEGRITY REQUIREMENT

Needed so future evidence can be interpreted and reproduced rather than merely observed.

### CANDIDATE / OPEN QUESTION

Plausible from the recording, but not yet strong enough to freeze.

## 2. The observed Owner loop

The recording repeatedly follows a recognizable loop:

> **provoke → observe → notice anomaly → seek explanation → alter state → return to world → escalate → seek explanation again → push to break → attempt recovery/comparison**

This is more important than any individual control.

A professional Lab must support transitions between these modes with low friction.

Current Workbench supports the ingredients but not the workflow.

The Owner repeatedly pays an orientation/context-switch cost between:

- population pressure;
- future resident phenotype;
- live player phenotype;
- camera;
- Debug;
- A/B state;
- aggregate telemetry.

Coarse recording samples already show at least ~8 substantial top↔lower-panel relocations in under four minutes.

The current single vertical schema-form therefore does not match the actual research loop.

## 3. Core workflow requirement — manipulation must be high-bandwidth

**Status:** STRONG OBSERVED REQUIREMENT

The Owner continuously manipulates the running experiment.

Examples include:

- live player envelope changes;
- live mass/load changes;
- live locomotor-force changes;
- live camera changes;
- population spawning while the world continues;
- Debug toggling during the phenomenon;
- A/B capture/application late in the session.

Most substantial edits occur while status remains **RUNNING**.

Therefore:

> **Combat Lab must treat live intervention as a first-class experimental operation, not as configuration that is expected to happen before Run.**

Consequences for future architecture:

- authored state must be safe to alter while simulation runs;
- external intervention must be distinguishable from world-evolved state;
- the system must preserve provenance of interventions;
- Pause/Reset may remain tools, but they cannot be mandatory boundaries around ordinary authoring.

This also means the Lab is allowed to perform non-diegetic operations that would make no sense inside Feniks itself.

Instantly changing body mass or envelope is an **apparatus operation**, not game-world semantics.

The architecture must preserve that distinction.

## 4. Extreme values are normal experimental work

**Status:** STRONG OBSERVED REQUIREMENT / PRESERVE

The Owner uses exact/extreme values as part of normal discovery.

Visible progression includes approximate states such as:

- early: envelope ~1.42, load ~1.6, force ~1.55;
- later: envelope 2, mass 2, load 4;
- later: mass 12, force 12;
- later: mass 32, load 14;
- later: envelope ~1.16, mass 62, load 14;
- later: force 62.

Therefore:

- wide hard rails are not a debug-only escape hatch;
- exact numeric entry must remain first-class;
- “EXTREME” may communicate context but must not discourage the state;
- future professionalization must **not** regress into narrow paternalistic parameter limits.

## 5. Direct manipulation vs precision configuration

### Camera

**Status:** DIRECT OWNER REQUIREMENT

The Owner explicitly wants:

- mouse-wheel zoom;
- a broader/easier zoom range.

The current camera technically supports a hard range of ~0.15×–6×, but the normal slider presents only ~0.55×–1.40× comfortably.

The recording uses ~0.75× very early and later ~0.55×.

The requirement is therefore broader than “increase slider max/min”:

> **high-frequency observation controls must have direct, high-bandwidth viewport interaction.**

The Inspector may still expose exact values.

It should not be the only interaction path for operations performed continuously during observation.

### Generalization

**Status:** STRONG OBSERVED REQUIREMENT

The same principle likely applies beyond camera:

- continuous observation/manipulation belongs close to the world interaction loop;
- detailed numeric setup belongs in precision authoring surfaces.

Do not interpret this as authority for any particular docking/window design yet.

## 6. Apparatus state must be separated from specimen state

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Current A/B capture includes every editable control, including camera zoom.

That means a comparison state can silently contain both:

- research specimen parameters;
- apparatus/view parameters.

This is dangerous because a camera change can alter perception of the result without changing the simulated phenomenon.

Future state architecture must distinguish at least conceptually:

1. **specimen/model authored state**;
2. **world/population state**;
3. **observation apparatus state** — camera, overlays, selected probes;
4. **session/provenance state**;
5. possibly **comparison/checkpoint state**.

Exact implementation is open.

Invariant:

> **A comparison must never hide which domains it will change.**

## 7. A/B must become epistemically transparent

**Status:** MATERIAL OWNER-OBSERVED UX FINDING

A/B is now **OWNER-USED**, because both slots become populated and Apply is reached/used in the recording.

But the summary can show only a prefix such as:

> Spawn envelope 1.00 · Spawn body mass 1.00 · +7

while the slot also contains player and camera values.

This creates several requirements:

- comparison state needs explicit scope;
- the Owner must know what differs before Apply;
- hidden “+7” values are insufficient for trustworthy research;
- comparison should not accidentally change observation conditions unless explicitly intended;
- state provenance must remain understandable after the comparison.

This does **not** yet select whether A/B should remain two slots, become checkpoints, diffs, timelines or another mechanism.

## 8. The Lab needs semantic scope, not flat global labels

**Status:** DIRECT OWNER REQUIREMENT + ARCHITECTURAL FINDING

Current group:

> Spawn phenotype

contains:

- Spawn envelope;
- Spawn body mass;
- Spawn carried load;
- Spawn locomotor force.

The Owner explicitly identifies this as bad/idiotic design.

The underlying problem is not copywriting.

The Lab currently conflates:

- globally unique machine ID/path;
- human-facing local field name;
- semantic scope/context.

Future parameter architecture must be able to express:

- scope: e.g. player / selected entity / new residents / cohort / world / apparatus;
- local label: e.g. Envelope;
- internal identity independent from the label.

Invariant:

> **Human labels should not need to restate their entire scope on every row.**

## 9. “Spawn phenotype” reveals a deeper current-vs-future-state problem

**Status:** STRONG OBSERVED REQUIREMENT

The Owner aggressively edits the **live player**.

He does not visibly edit resident spawn phenotype before building the 845-resident stress state.

This suggests an important difference:

- editing an existing live object is concrete and immediately legible;
- editing an abstract template for future objects is cognitively more remote.

Possible causes include:

- low discoverability;
- poor feedback;
- unclear value;
- authoring friction;
- lack of cohort identity after spawning.

The recording cannot distinguish which cause dominates.

But future Lab design must clearly distinguish and support:

- **this existing entity / selection**;
- **this cohort**;
- **the template/default used for future creation**.

Do not assume that one generic “spawn template” is sufficient authoring UX.

## 10. Spawned cohort provenance is a research requirement

**Status:** RESEARCH-INTEGRITY REQUIREMENT

The runtime internally preserves each body's phenotype.

The Lab visually does not preserve understandable experimental provenance.

After spawning, a resident is mostly an orange circle.

The Owner cannot readily recover:

- which wave/cohort created it;
- which authored phenotype it belongs to;
- when it entered the world;
- how many siblings from that cohort remain;
- whether a jam is dominated by one phenotype or another.

This is especially important because future experiments may deliberately mix contradictory phenotypes.

Invariant:

> **If the Lab can create heterogeneity, it must preserve enough provenance to attribute observed behavior to that heterogeneity.**

No specific color/palette/naming solution is selected.

## 11. The Lab needs an experimental intervention ledger

**Status:** STRONG RESEARCH-INTEGRITY REQUIREMENT

This requirement was not explicitly requested by the Owner.

It was exposed by the analysis process itself.

To reconstruct the first rehearsal, the analysis had to infer actions from:

- frame chronology;
- changing parameter values;
- population deltas;
- cursor positions;
- final resident count.

For example, the +750 population increase had to be reconstructed as the equivalent of 15 × `Spawn +50`.

A professional research instrument should not require video forensics to answer:

> what did I change before this phenomenon appeared?

At minimum, future architecture should be capable of preserving a lightweight ordered intervention history such as:

- parameter changed;
- action invoked;
- entity/cohort spawned;
- reset;
- comparison applied;
- debug/camera changes where relevant;
- timestamp / simulation time;
- exact authored value.

This is not authority for a full replay system.

It is a requirement that experiments remain attributable and reproducible.

## 12. Recovery must not require remembering hidden state

**Status:** STRONG OBSERVED REQUIREMENT

Current workflow places burden on the Owner to remember:

- what the spawn template currently means;
- which values A/B contain;
- what camera state belongs to which observation;
- which population changes happened since reset;
- what exactly Restore Defaults or Apply will alter.

The more expressive the Lab becomes, the less acceptable hidden state becomes.

Future state-changing actions need visible scope and consequences.

Candidate future capabilities such as undo/checkpoints/history are plausible, but not frozen by this campaign.

The frozen requirement is:

> **recovery and comparison must not depend on the Owner remembering invisible state.**

## 13. Debug must be query-driven, not globally maximal

**Status:** DIRECT OWNER REQUIREMENT + STRONG OBSERVED REQUIREMENT

Debug is enabled twice when understanding is needed, then disabled when it becomes visual noise.

This establishes a useful workflow:

> **diagnostics are demand-driven.**

Current binary Debug tries to render the same class of information for every actor.

That does not scale.

At six actors, per-actor vectors can be useful.

At 845 actors, drawing hundreds of global-goal lines destroys legibility.

Future observability must support multiple scales of questioning.

### Actor-local questions

The Lab should be capable of answering for one chosen body:

- what are you trying to do?
- what immediate motion did you choose?
- what is your actual velocity?
- why are you not making progress?
- what are you contacting?
- for how long have you been blocked?
- what phenotype/cohort are you?
- which world/actor relation currently limits you?

### Region/crowd questions

The Lab should be capable of answering:

- where is local density high?
- where is progress failing?
- where are contacts persistent?
- where do flows oppose each other?
- which routes are overloaded?
- which areas are still traversable?

### Runtime questions

The Lab should be capable of answering:

- where is simulation time spent?
- what phase is scaling badly?
- how much wall time is being dropped?
- what is broad-phase/pair workload?
- is failure physics, navigation, rendering or scripting?

Exact overlays/heatmaps/graphs are future design decisions.

Invariant:

> **Debug should answer a question, not simply draw more implementation internals.**

## 14. Observability itself needs level-of-detail

**Status:** STRONG OBSERVED REQUIREMENT

The same visualization cannot be appropriate at:

- 6 bodies;
- 95 bodies;
- 295 bodies;
- 845 bodies.

The recording is direct evidence.

Therefore future Debug/observability needs a scale-aware model.

Possible categories:

- entity-local detail at small scope;
- selected probes in medium scope;
- aggregate spatial fields / cluster summaries at crowd scale;
- performance summaries at stress scale.

This is an observability requirement, not yet a claim about simulation LOD.

## 15. Diagnostic names must describe what is actually measured

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Current `Body contacts / s` is actually repeated pair-overlap resolver hits per fixed step.

Current `Static contacts / s` includes repeated world resolution calls.

`Nominal occupied area` is total body-disc area divided by world area, not local occupancy or traversability.

These metrics are useful, but their human-facing names can overstate their meaning.

Professional Lab diagnostics must distinguish:

- events;
- persistent states;
- solver work;
- rates;
- approximations;
- spatial vs global measures.

Invariant:

> **a metric label must not imply stronger semantics than the measurement actually has.**

## 16. Local spatial metrics matter more than global occupancy for crowd research

**Status:** STRONG OBSERVED REQUIREMENT

At 845 residents:

- global nominal occupied area is only ~16%;
- visually, local regions are almost completely packed.

Therefore global average occupancy hides the dominant phenomenon.

Future research into crowd/contact requires the capability to reason about spatially local state such as:

- local density;
- pressure/contact persistence;
- local traversability;
- flow/progress.

No exact metric is selected.

## 17. Pressure authoring must support research modes, not only button increments

**Status:** DIRECT OWNER FEEDBACK + STRONG OBSERVED REQUIREMENT

`+1/+5/+10/+50` successfully established permissive manual escalation.

The recording now reveals the next limit.

The Owner needs many repeated `+50` actions to locate the performance knee.

This means there are at least two distinct research modes:

### Composition mode

> add a few bodies and observe relations.

Small increments are appropriate.

### Stress-search mode

> deliberately move through population regimes until behavior or runtime changes qualitatively.

Repeated clicking becomes friction.

The Lab must eventually support high-throughput pressure authoring without removing the ability to make individual increments.

Potential mechanisms such as target population, arbitrary batch, ramp or “continue until condition” remain design candidates, not current decisions.

## 18. Breakability is a permanent Lab principle

**Status:** DIRECT OWNER CONTRACT / PRESERVE

The Owner explicitly wants the ability to break things.

The first rehearsal validates the value:

- population can be pushed far beyond the readable baseline;
- runtime exposes `SIM STRESS`;
- the break boundary itself becomes evidence.

Future professionalization must not remove this.

Invariant:

> **default states may be safe/readable; the Owner must retain a direct path into absurd and failure regimes.**

Diagnostics should explain failure rather than prevent it.

## 19. The Lab must distinguish technical breakdown from phenomenon breakdown

**Status:** RESEARCH-INTEGRITY REQUIREMENT

At high population several layers can fail:

- actor logic;
- contact solver quality;
- navigation;
- readability;
- rendering;
- simulation-time budget.

Current `SIM STRESS` is a good first example of truthful technical reporting.

Future apparatus must preserve and deepen the distinction:

> “the crowd behaves this way”

versus

> “the simulation is no longer keeping real time”

versus

> “the solver is generating pathological packing”

versus

> “the UI can no longer make the world understandable”.

## 20. Current performance ceiling must not become a false product limit

**Status:** RESEARCH-INTEGRITY REQUIREMENT

At 845 residents + player the naïve dynamic pair phase performs approximately:

- 357,435 pair checks per fixed step;
- ~42.9M checks per simulated second at 120 Hz.

Stress appears in that regime.

The correct conclusion is not:

> “Combat Lab can support ~800 organisms.”

Nor:

> “the browser cannot support more.”

The correct conclusion is:

> **this specific O(N²) substrate finds its knee in this region under this specimen.**

Future performance diagnostics should make such causal boundaries visible.

## 21. Organisms must be capable of responding when the world says “no”

**Status:** DIRECT OWNER FEEDBACK + STRONG ARCHITECTURAL FINDING

The Owner says organisms are too simple.

The recording/code reveal the minimum missing category:

> **the actor needs some ability to detect persistent failure and alter behavior.**

Current resident can remain indefinitely committed to an unreachable/congested goal.

A future organism does not necessarily need sophisticated AI.

But a useful embodied actor must be capable, at some level, of distinguishing:

- making progress;
- temporarily obstructed;
- persistently blocked;
- route/goal no longer viable.

The exact response — reroute, yield, wait, choose another purpose, push, back out — is future research.

Do not prematurely select one universal policy.

## 22. Test stimulus must be first-class and inspectable

**Status:** STRONG RESEARCH-INTEGRITY REQUIREMENT

The 12 fixed global goals and actor-ID arithmetic materially shape the observed world.

One twelfth of ID residues produce a one-goal cycle.

Many others traverse only subsets of the goal graph.

Therefore hidden stimulus logic can dominate the apparent “ecology”.

Future Lab architecture must make movement/task stimulus explicit enough that researchers can distinguish:

> behavior caused by organism/world relations

from

> behavior caused by the test harness.

Stimulus provenance should be inspectable just like phenotype provenance.

## 23. Movement pressure should emerge incidentally, not be secretly authored by the harness

**Status:** STRONG RESEARCH-INTEGRITY REQUIREMENT

The intended hypothesis required active bodies whose independent intent creates pressure incidentally.

The current fixed-goal system creates systematic convergence onto a tiny set of locations.

Therefore future apparatus must avoid silently encoding the pressure pattern that it later claims to observe.

This does not prohibit authored scenarios.

It requires them to be explicit and interpretable as scenario stimulus.

## 24. “Less blocking” must not be solved by deleting physicality

**Status:** DIRECT OWNER FAIL + OPEN RESEARCH BOUNDARY

The Owner reports too much blocking and too many stupid jams.

The recording strongly validates that failure.

But the correct requirement is **not**:

> make actors ghost through one another.

Combat Lab exists partly to explore occupied space, displacement, mass and material relations.

Therefore the future contact substrate must preserve the possibility that:

- bodies matter spatially;
- pushing can matter;
- holding space can matter;

while avoiding accidental permanent deadlock as the default result of ordinary traffic.

The exact physical/contact semantics remain open research.

## 25. Intentional blocking and accidental jam are different phenomena

**Status:** STRONG DERIVED REQUIREMENT

The current system has no semantic distinction between:

- a body intentionally holding a position;
- a body trying to pass;
- a body waiting/yielding;
- a body accidentally stuck because the solver packed it into a crowd.

Yet all can look like “occupied space”.

A future research substrate must be able to investigate these relations separately enough that accidental traffic jams do not masquerade as meaningful embodied control of space.

This does not require an MMO-style “stance system” now.

It defines a distinction the apparatus must eventually be capable of expressing.

## 26. Direct live actor inspection is a strong candidate requirement

**Status:** STRONG CANDIDATE, NOT DIRECTLY REQUESTED

The recording repeatedly reaches states where a particular local jam is interesting, but there is no way to ask:

> what is that orange body?

Because heterogeneous provenance and actor-state explanation are absent, click/select inspection becomes a strong candidate.

Potential information includes:

- phenotype;
- cohort;
- goal/intent;
- desired vs actual motion;
- blocked duration;
- contacts.

The exact interaction model is not frozen.

## 27. Camera and viewpoint are part of scientific apparatus

**Status:** DIRECT + STRONG INFERRED REQUIREMENT

Mouse-wheel zoom is explicit.

A second, still-open issue is that the camera is hard-coupled to player-following.

In a research lab, the phenomenon of interest may occur away from the player.

The recording does not prove a specific free-pan implementation is required.

It does establish a broader requirement:

> **observation location/scale must not be unnecessarily constrained by player locomotion.**

Future camera design must be reviewed as research instrumentation, not only game-camera UX.

## 28. The viewport must remain the primary truth surface

**Status:** STRONG OBSERVED REQUIREMENT

The Owner repeatedly returns attention to the running world.

Controls are used to provoke or explain.

The Lab should therefore avoid becoming a dashboard in which the simulation is secondary to forms/graphs.

Even a more ambitious Debug should preserve the world as the primary place where hypotheses are perceived.

Diagnostics should augment causal reading, not replace the phenomenon with instrumentation.

## 29. The Lab needs state-at-a-glance

**Status:** STRONG OBSERVED REQUIREMENT

Current navigation forces the Owner to remember what is offscreen.

At a minimum, a professional Lab must make the currently relevant experiment state recoverable without traversing a long form.

This does not mean every parameter must be permanently visible.

It means the Owner should be able to answer quickly:

- what am I currently manipulating?
- which entity/cohort/template is targeted?
- what comparison/checkpoint is active?
- what population regime am I in?
- is simulation healthy?
- what diagnostics are active?

Exact layout is future design.

## 30. Optional parameter linkage should be a relationship layer, not base truth

**Status:** OWNER REQUEST + NOW SUPPORTED BY OBSERVED FRICTION

The recording shows repeated manual multi-field construction of player phenotypes.

That supplies real evidence that authoring related values can become tedious.

At the same time, the Owner intentionally creates unusual non-correlated values.

Therefore:

> **underlying dimensions stay independent; optional visible relationships may sit above them.**

Required properties of any future linkage:

- explicit;
- reversible;
- selectively scoped;
- does not destroy raw editability;
- makes its effects visible.

No dependency graph design is selected yet.

## 31. Lab architecture must scale in parameter count before combat complexity arrives

**Status:** STRONG ARCHITECTURAL REQUIREMENT

Current Ecology has only nine numeric controls:

- four spawn phenotype;
- four player phenotype;
- one camera.

This already produces severe vertical-form friction.

Future Combat Lab may need to explore:

- movement;
- turning;
- body/contact properties;
- terrain;
- perception;
- stance/posture;
- equipment;
- weapons;
- ranged systems;
- magic;
- multiple cohorts;
- AI/stimulus controls.

Therefore the current “render all schema controls in one vertical Inspector” architecture is already falsified as a long-term interaction model.

This does not imply abandoning schemas.

It means schema rendering cannot itself be the full product architecture.

## 32. Research state needs domain-aware reset semantics

**Status:** STRONG REQUIREMENT, partly inherited from earlier Owner evidence

Existing separation between:

- Reset World;
- Restore Defaults;

is valuable.

The first Ecology rehearsal adds more domains:

- population;
- player authored phenotype;
- future spawn template;
- camera;
- diagnostics;
- comparison state.

Future reset/recovery actions must remain explicit about which domains they affect.

A single global “reset everything” is insufficient as the main recovery model.

## 33. Observed anti-requirements

The recording gives strong evidence against several design tendencies.

### Do not

- make the Lab safer by narrowing useful extreme ranges;
- solve jams by simply disabling physical occupancy;
- hide technical slowdown by adaptive despawn/clamping;
- interpret a green machine test as a good research experience;
- add more fields to the existing single vertical form and call it scalability;
- expose machine-global naming directly as human labels;
- draw every actor's debug information simultaneously at crowd scale;
- let comparison operations change hidden apparatus state;
- create heterogeneous populations without preserving attribution;
- treat a fixed hidden waypoint script as neutral ecology;
- optimize O(N²) aggressively before deciding which future contact/organism substrate deserves optimization;
- add combat semantics merely to make current spatial pressure interesting.

## 34. Preserved strengths

The redesign must not throw away what the recording validates.

Preserve conceptually:

- permissive experimentation;
- live authoring;
- exact numeric entry;
- wide hard rails;
- clear “EXTREME / safety rail” truth;
- ability to drive the runtime into break regimes;
- visible technical stress rather than hidden rescue;
- independent envelope / mass-load / locomotor-authority dimensions;
- deterministic/reproducible baseline where useful;
- direct public specimen provenance;
- separation between machine evidence and Owner truth;
- easy return/reset paths;
- the world remaining the primary research surface.

## 35. Emergent requirement model

The recording suggests that a professional Combat Lab is not fundamentally:

> a simulation + a parameter Inspector.

It behaves more like a composition of five research domains:

### A. World / phenomenon

The thing being experienced and manipulated.

### B. Authoring / intervention

What the Owner changes deliberately during the experiment.

### C. Population / provenance

Which actors/cohorts exist and where they came from.

### D. Observation / explanation

Camera, selection, diagnostics, spatial/running-state interpretation.

### E. Comparison / evidence

Checkpoints, diffs, session history and enough provenance to reproduce or challenge a finding.

These are **requirements domains**, not UI panes.

Do not freeze them into a specific screen layout yet.

## 36. Strongest new requirement from this mining pass

> **Combat Lab must reduce the Owner's need to remember and navigate apparatus state, while increasing his ability to directly provoke, inspect, explain and reproduce world phenomena.**

That is a better redesign criterion than “make the Inspector nicer”.

## 37. Campaign boundary remains unchanged

This mining pass remains part of **campaign 1: feedback/evidence extraction**.

No runtime changes were authorized or made from these findings.

Before implementation, later work should still:

- challenge these inferred requirements;
- recover relevant donor evidence;
- distinguish shared-Lab needs from Ecology-specific needs;
- search for conflicts between research flexibility and usability;
- decide which requirements deserve architectural commitment and which should remain experiment-local.

## Working invariant

> **A professional Combat Lab should make it cheap to ask a dangerous question of the world, cheap to see what happened, and hard to misunderstand why.**
