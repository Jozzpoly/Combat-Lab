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

## 38. Non-use is also evidence

Not every machine-qualified capability became part of the Owner's natural workflow.

### Spawn-template authoring

Machine tests proved mixed resident waves.

The recording does not show meaningful resident-template authoring.

Status:

> **HUMAN VALUE UNPROVEN**

Do not promote cohort/phenotype spawning merely because the mechanism exists.

### Force +10

`Force +10` was added as an explicit destructive overlap-pressure action.

The Owner's actual stress-search behavior instead centers on repeated ordinary `Spawn +50`.

The recording does not establish that forced overlap is a useful Owner tool.

Status:

> **MECHANICALLY QUALIFIED / HUMAN VALUE UNPROVEN**

This corrects an earlier agent assumption that “let me break it” primarily meant allowing illegal dynamic overlap.

Observed need is broader:

> **make it cheap to move the system through pressure regimes and discover the break boundary.**

### Pause / Reset

The recording is dominated by uninterrupted RUNNING manipulation.

Pause/Reset remain useful infrastructure, but they are not the center of the observed workflow.

Do not redesign the Lab around configuration→Run cycles.

## 39. The organism needs a competence floor, not maximum intelligence

**Status:** CRITICAL RESEARCH TENSION

The current actor is too simple.

The wrong reaction would be:

> add enough intelligence that it always solves crowding elegantly.

That could erase the very embodied spatial relations Combat Lab is meant to discover.

A future organism needs a **substrate competence floor**:

- recognizes persistent lack of progress;
- can react to ordinary obstacles/actors;
- can alter a failed immediate plan;
- has enough body/world awareness not to behave like a blind particle.

But organism intelligence must remain below the point where hidden planning policies author the experimental result.

Invariant:

> **the actor should be competent enough not to invalidate the experiment, but not so prescriptive that it answers the experiment for us.**

## 40. Separate “intent”, “navigation feasibility” and “contact outcome”

**Status:** STRONG ARCHITECTURAL REQUIREMENT

Current Ecology collapses several layers into one emergent mess:

- fixed waypoint = purpose;
- local static probe = navigation;
- desired velocity = movement decision;
- circle solver = dynamic relationship.

When jams occur, it is difficult to know which layer failed.

Future architecture should preserve conceptual separation between at least:

1. **why / where the actor intends to go**;
2. **what routes/motions are feasible**;
3. **what immediate movement it chooses**;
4. **what happens physically when bodies meet**.

This is not a mandate for four classes or systems.

It is a causal-separation requirement for research.

## 41. Physicality vs flow is a central unresolved research tension

**Status:** OPEN / MUST NOT BE PRE-SOLVED

Owner feedback says bodies block too much.

Combat Lab's purpose says occupied space and displacement should matter.

Therefore both simplistic extremes are wrong:

- hard discs that crystallize into accidental walls;
- ghost-like actors that never materially constrain one another.

Future work must preserve the ability to discover a useful middle space.

Questions include:

- when should contact yield?
- when should a body resist?
- how should mass/force/shape affect passage?
- when is a jam meaningful vs accidental?
- can actors negotiate without erasing physical consequence?

No answer is selected by this recording.

## 42. Better navigation must not silently become crowd choreography

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Replacing the current particle movement with an off-the-shelf avoidance system could make the screen look better while harming the research.

A sophisticated crowd system may automatically:

- spread actors;
- maintain personal space;
- resolve reciprocal avoidance;
- prefer smooth flow.

Those behaviors may themselves answer questions Combat Lab should be allowed to investigate.

Therefore donor recovery / navigation work must distinguish:

- **basic competence / feasibility substrate**;
- **behavioral policy / crowd semantics**.

Import the former cautiously.

Treat the latter as hypothesis, not infrastructure.

## 43. Determinism and variation must coexist

**Status:** STRONG RESEARCH REQUIREMENT

The deterministic baseline has value:

- reproducibility;
- A/B;
- bug recovery;
- exact provenance.

But fixed deterministic goals and ID arithmetic currently create repeated artificial traffic.

A professional Lab likely needs both:

- reproducible seeds/scenarios;
- the ability to vary stimulus/population/intent without rewriting code.

Invariant:

> **reproducible does not mean globally fixed forever; variation must itself be reproducible.**

## 44. Heterogeneity increases the observability burden non-linearly

**Status:** STRONG RESEARCH REQUIREMENT

One phenotype can be read from global controls.

Ten cohorts cannot.

As phenotype dimensions and population diversity increase, the Lab must avoid a state where:

> more experimental richness produces less ability to attribute outcomes.

Therefore observability/provenance capability must scale alongside authoring capability.

Do not add large phenotype systems ahead of the ability to inspect their consequences.

## 45. Richer organisms will invalidate the current population-performance intuition

**Status:** RESEARCH-INTEGRITY REQUIREMENT

The current 845-resident stress result is produced by extremely cheap organisms.

A future actor may add:

- dynamic-body queries;
- stuck detection;
- routing;
- richer movement constraints;
- perception;
- state/history.

Population capacity may therefore drop substantially even after collision broad-phase optimization.

Do not turn “845 simple circles” into a future scale promise.

Performance targets must be evaluated against the actual research organism.

## 46. Optimization has two categories: semantic-neutral and semantic-changing

**Status:** STRONG ARCHITECTURAL REQUIREMENT

Some scaling improvements can be largely semantic-neutral:

- spatial broad phase;
- neighborhood indexing;
- avoiding obviously impossible pair checks;
- profiling/instrumentation.

Others alter behavior:

- RVO/ORCA;
- soft collision;
- priority/yield rules;
- path planner policies.

Future optimization work must keep this distinction explicit.

A faster result is not neutral if it changes what bodies do.

## 47. Observation tooling must have bounded observer cost

**Status:** STRONG OBSERVED REQUIREMENT

Global debug lines at crowd scale harm legibility and may add render cost.

More ambitious Debug cannot mean “draw everything”.

Diagnostics need explicit scope/cost.

At high scale, the Lab should be able to say:

> this diagnostic is local/selected/aggregated

rather than silently rendering per-actor detail for hundreds of actors.

## 48. Local pressure is more meaningful than count alone

**Status:** STRONG OBSERVED REQUIREMENT

The same number of residents can create radically different situations depending on:

- body size;
- distribution;
- local route capacity;
- goal convergence;
- obstacles.

Population count is therefore only one pressure dimension.

The first recording demonstrates:

- modest global occupied area;
- extreme local close-packing.

Future stress apparatus/diagnostics must avoid equating:

> more entities = more meaningful pressure.

The research variable is closer to **spatial pressure regime**, of which entity count is one cause.

No canonical pressure formula is selected yet.

## 49. The Owner's attention is a finite experimental resource

**Status:** STRONG PRODUCT REQUIREMENT

Every unnecessary scroll, hidden scope or opaque metric consumes attention that could instead go into:

- noticing behavior;
- forming a hypothesis;
- trying a different intervention.

The recording makes this visible.

Professionalization should therefore be evaluated partly by:

> **how much Owner attention goes into operating the apparatus versus investigating the phenomenon.**

This is not an argument for reducing expressive power.

It is an argument for better state organization and direct manipulation.

## 50. State density and information density are different

**Status:** STRONG PRODUCT REQUIREMENT

The current Inspector is long despite having relatively little true information.

Redundant labels, repeated reset icons, explanatory prose and flat vertical layout increase **screen length** without proportionally increasing useful **state visibility**.

Future Lab design should optimize for:

- high useful information density;
- low ambiguity;
- progressive detail;
- context-aware labels.

Do not confuse “compact” with “hide everything”.

## 51. Professional Lab must preserve causal provenance across live intervention

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Because the Owner edits a running world, future evidence may depend on sequences such as:

1. increase mass;
2. wait 4 s;
3. increase force;
4. spawn 50;
5. observe jam;
6. zoom out;
7. enable diagnostic.

Without an intervention ledger, these causal sequences become anecdotal.

This requirement strengthens the need to log **Owner-caused state transitions** separately from simulation evolution.

## 52. Future comparison should compare questions, not entire UI state

**Status:** STRONG DERIVED REQUIREMENT

A/B currently snapshots broad editable state.

The recording suggests the Owner's actual questions are narrower:

- what changes if body mass changes?
- what changes if force changes?
- what changes at another population pressure?
- what changes if the organism model changes?

Future comparison machinery should make the compared hypothesis/scope explicit.

It may still support broad snapshots.

But “capture everything because it is editable” is not sufficient research semantics.

## 53. Candidate refoundation falsifiers derived from the recording

These are **future validation criteria**, not a redesign plan.

A refounded Lab should be considered materially unsuccessful if Owner testing still shows:

- repeated large scroll/search trips before simple interventions;
- uncertainty about whether a field edits player, future spawn, cohort or apparatus;
- camera zoom primarily performed through a distant numeric form;
- inability to identify the phenotype/provenance of an interesting resident;
- Debug becoming line-spaghetti at moderate crowd scale;
- no answer to “why is this actor stuck?”;
- comparison Apply changing hidden/unexpected state;
- stress search requiring many identical button presses;
- ordinary traffic collapsing into the same persistent close-packed attractors;
- actor competence depending on hidden policy sophisticated enough to predetermine the spatial result;
- failure modes being hidden by automatic clamps/despawns;
- inability to reconstruct the sequence of Owner interventions that produced a finding.

## 54. Important evidence gaps that remain open

The first recording does **not** settle:

- whether free-pan camera is truly needed, versus better follow/inspection tools;
- the ideal mouse-wheel zoom response / cursor anchoring;
- whether direct resident click-selection feels useful in practice;
- whether cohort authoring becomes valuable once provenance is visible;
- whether `Force +10` deserves to remain;
- the exact desired stress-control interaction;
- the right contact semantics between hard blocking and ghosting;
- the minimum useful resident competence;
- whether deterministic routing, local steering or another movement substrate best supports the research;
- how much Debug should be spatial overlay vs inspector vs temporal history;
- the desired comparison/checkpoint workflow;
- future population targets once organisms are richer;
- whether camera/view state should ever be intentionally included in a comparison snapshot.

These are deliberately left unresolved.

## 55. Refoundation problem statement emerging from feedback

Without choosing architecture, the recording now supports this problem statement:

> **Combat Lab needs to evolve from a generic live parameter form attached to a simulation into a research instrument that supports fast intervention, scoped state, causal inspection, reproducible provenance and deliberate break-testing — while keeping the world itself central and preserving the Owner's freedom to create absurd states.**

The same transformation is needed in the organism substrate:

> **from blind goal-seeking particles whose conflicts are repaired after the fact, toward minimally competent embodied actors whose intent, feasibility, immediate movement and physical contact can be investigated separately without pre-authoring the answer.**

## 56. Authored causes and derived consequences are too far apart

**Status:** STRONG OBSERVED REQUIREMENT

During player authoring the Owner edits:

- envelope;
- body mass;
- carried load;
- locomotor force.

The resulting live values:

- total mass;
- acceleration limit;
- current speed;

live much lower in the Inspector.

They cannot normally be read together while editing the causes.

This creates a cognitive tax:

> change value → remember it → leave the control → scroll → find derived state → reconstruct causal relation.

Future Lab architecture must preserve the conceptual distinction between authored and derived state while making **causally adjacent information easy to inspect together**.

This does not require every derived value to be permanently visible.

It requires that understanding an edit not demand navigation through unrelated sections.

## 57. Abstract templates need stronger feedback than live entities

**Status:** STRONG DERIVED REQUIREMENT

The live player has immediate feedback:

- body size changes visually;
- movement response changes immediately;
- contact behavior changes in the observed world.

The spawn template is different:

- values describe **future** bodies;
- no existing actor changes when the template changes;
- the Owner must spawn something and then remember which new bodies inherited the template;
- cohort provenance is visually weak.

This likely contributes to the observed asymmetry:

> aggressive player authoring / almost no visible spawn-template authoring.

Future authoring of templates/cohorts needs enough immediate interpretation that the Owner can understand what is being prepared before/after creation.

Possible mechanisms include previews, derived summaries, cohort inspection or direct instance authoring, but none is selected yet.

## 58. Observation controls are currently fragmented

**Status:** STRONG PRODUCT REQUIREMENT

Observation apparatus is split across distant parts of the current Inspector:

- Debug toggle near the top;
- camera zoom near the lower parameter area;
- simulation health in top status;
- spatial/live telemetry below A/B;
- world itself in the viewport.

The first rehearsal repeatedly moves between those regions while investigating anomalies.

Future Lab design should treat observation/explanation as a coherent workflow even if individual tools remain physically distributed.

Invariant:

> **the Owner should not need to navigate the authoring hierarchy just to change how he observes the same phenomenon.**

## 59. Interaction affinity should matter more than schema order

**Status:** STRONG ARCHITECTURAL REQUIREMENT

Current UI order follows schema groups.

Observed work follows task relationships.

Examples of high-affinity pairs from the recording:

- camera ↔ world observation;
- body mass/load/force ↔ derived acceleration/current speed;
- population pressure ↔ crowd diagnostics;
- Debug ↔ selected anomaly;
- A/B Apply ↔ visible state diff;
- spawn action ↔ spawn/cohort phenotype.

Future interaction architecture should be evaluated by whether **things used together are cheap to use together**, not merely whether the schema hierarchy is tidy.

This is a requirement on information architecture, not a specific screen layout.

## 60. Exploratory continuity is part of the Owner method

**Status:** STRONG OBSERVED REQUIREMENT

The Owner does not run a clean reset after each intervention.

The session accumulates:

- population;
- player phenotype changes;
- spatial history;
- jams;
- stress;
- diagnostic exploration.

This path-dependent state is part of the research process.

Therefore Combat Lab cannot assume the dominant workflow is:

> configure → run → record result → reset → configure again.

It must support long-lived messy exploratory sessions.

That strengthens the requirements for:

- intervention history;
- checkpoints;
- scoped recovery;
- explicit provenance.

It does **not** remove the need for clean reproducible trials when a hypothesis later needs attribution.

## 61. The Lab needs both discovery mode and attribution mode

**Status:** STRONG DERIVED REQUIREMENT

The first rehearsal is predominantly **discovery mode**:

- change several things;
- escalate;
- watch;
- follow surprising behavior;
- push the system.

A/B represents an attempt at a more controlled **attribution/comparison mode**.

Both are legitimate.

A professional Lab should not force discovery into rigid experimental procedure.

But when the Owner decides:

> “I want to know whether X caused this,”

the Lab should make it possible to transition into a more controlled comparison without reconstructing everything manually.

This is a workflow requirement, not a demand for a specific scientific-method UI.

## 62. Experimental continuity and reproducibility are complementary, not opposing

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Messy exploration creates valuable findings.

Reproducibility is needed later to challenge them.

The Lab therefore needs enough provenance to turn:

> “something interesting happened after I messed with this for two minutes”

into:

> “here is the intervention/state sequence worth replaying or isolating.”

The first recording itself is evidence for this need because analysis had to reconstruct the sequence externally.

## 63. Population actions should create identifiable experimental cohorts

**Status:** STRONG DERIVED REQUIREMENT

Every spawn action is already a meaningful intervention.

In future heterogeneous tests, a wave may represent:

- one phenotype;
- one intent distribution;
- one pressure condition.

Treating all created actors as an undifferentiated resident array discards experiment structure.

Future architecture should be capable of remembering that:

> these bodies were created together under this authored state.

Whether that is surfaced as cohorts, batches, tags, layers or another concept remains open.

## 64. Cohort provenance should survive later template changes

**Status:** RESEARCH-INTEGRITY REQUIREMENT

The current runtime already preserves body phenotype values when the spawn template changes.

That mechanistic property is good.

The missing layer is human-readable provenance.

Future Lab behavior should preserve the same principle:

> changing the authoring template must not rewrite historical actors/cohorts unless explicitly requested.

And the Owner should be able to tell that this happened.

## 65. Selected-state context is likely more scalable than duplicated global sections

**Status:** STRONG CANDIDATE

As the Lab grows, separate permanent sections for:

- Player;
- Spawn template;
- Cohort A;
- Cohort B;
- selected resident;
- weapon;
- terrain object;

would recreate the current long-form problem at a larger scale.

The recording therefore strengthens a candidate requirement for **explicit current target/scope**:

> what thing am I authoring or inspecting right now?

Direct entity/cohort selection is one possible solution, not yet selected.

The invariant is that scope must be visible and scalable.

## 66. Current player editing reveals a useful property: immediate world feedback can replace UI verbosity

**Status:** STRONG OBSERVED REQUIREMENT

Despite poor panel organization, player phenotype authoring remains usable enough for sustained exploration because the world immediately demonstrates consequences.

This suggests an important design criterion:

> when the phenomenon itself gives clear feedback, the UI can stay lightweight.

Conversely, abstract states such as spawn templates, A/B slots and hidden actor intent require stronger explicit representation because the world cannot communicate them before interpretation.

Professionalization should add information where the world is insufficient, not cover every variable with permanent dashboards.

## 67. Lab-state visibility should be proportional to consequence

**Status:** STRONG DERIVED REQUIREMENT

Some state changes are local and obvious.

Others can silently alter the interpretation of the entire experiment.

Examples:

- camera state can confound visual A/B;
- spawn template affects all future actors;
- population actions permanently change current world composition;
- Restore Defaults / Apply can change many authored fields.

The more consequential an operation is, the clearer its scope and effect should be before/after invocation.

This is more important than uniform UI consistency.

## 68. The first rehearsal exposes an attention-allocation failure

**Status:** STRONG SYNTHESIS

A meaningful portion of Owner attention is spent on:

- finding controls;
- scrolling;
- reconstructing hidden context;
- turning noisy diagnostics on/off;
- repeatedly pressing stress buttons.

Those actions do not themselves answer combat/world questions.

This means current apparatus overhead competes directly with research cognition.

The redesign goal should not simply be:

> fewer clicks.

It should be:

> **less working memory and navigation devoted to the apparatus per useful experimental insight.**

## 69. Cross-recording triangulation — what survived S0/B0 → Ecology

The Ecology requirements should not be learned from one recording in isolation.

Comparison against S0/B0 Owner evidence reveals which findings are stable.

### Live manipulation — REPEATED POSITIVE EVIDENCE

B0:

- Owner edits parameters while the world runs;
- movement/contact remains part of tuning.

Ecology:

- the same pattern becomes even stronger;
- major phenotype changes happen while RUNNING.

Conclusion:

> **live authoring is a stable Owner workflow requirement, not an experiment-specific convenience.**

### Wide permissive extremes — REPEATED POSITIVE EVIDENCE

B0:

- Owner explicitly enters force 42;
- narrow rail 8 is rejected by Owner behavior.

Ecology:

- Owner later uses mass 62 / force 62 and other extreme combinations.

Conclusion:

> **large exploratory headroom is now repeated human evidence across stages.**

### Independent embodiment dimensions — REPEATED POSITIVE EVIDENCE

B0:

- small/heavy/high-force and giant/heavy/high-force phenotypes are created spontaneously.

Ecology:

- player envelope, mass, load and force are again manipulated independently.

Conclusion:

> **raw independence remains a durable research principle even if optional linkage is added later.**

### Break → tune loop — REPEATED POSITIVE EVIDENCE

B0 explicitly moves from extreme breakage back toward finer tuning.

Ecology escalates all the way to horde/stress while also repeatedly rebuilding the player.

Conclusion:

> the Lab needs both coarse destructive manipulation and fine parameter refinement.

## 70. Cross-recording triangulation — what failed only after scale increased

### Single vertical Inspector

B0 record already notes panel density and repeated scrolling, but calls it acceptable after copy shortening.

Ecology turns the same mechanism into a material Owner FAIL.

Therefore:

> **the Inspector concept was locally adequate; the single vertical schema-form is not a scalable long-term architecture.**

Do not rewrite history by saying the B0 qualification was false.

The better interpretation is:

> B0 established a useful interaction kernel; Ecology exposed its scalability boundary.

### Authored vs derived separation

B0 evidence says authored vs derived relations were sufficiently visible for exploratory tuning.

Ecology retains the conceptual distinction but spreads causes and consequences too far apart spatially.

Therefore:

> **semantic separation remains good; presentation locality failed under larger state.**

### Debug

B0:

- Debug is discoverable and useful enough to continue movement/editing.

Ecology:

- the same global-overlay idea becomes severe visual noise at population scale.

Therefore:

> **Debug itself is validated as part of the Owner loop; one binary global representation is not.**

This is a strong argument for scale-/question-dependent observability rather than removing Debug.

## 71. Cross-recording triangulation — A/B has progressed mechanically but not epistemically

B0:

- slot A captured;
- no full comparison;
- human usefulness UNPROVEN.

Ecology:

- both slots become populated;
- Apply is reached/used;
- broad hidden scope becomes visible as a problem;
- recording still does not yield a clean interpretable A↔B comparison.

This repeated pattern is important.

The problem is no longer:

> “Owner has not discovered the feature.”

The Owner now uses it.

Yet it still does not naturally produce a trustworthy comparison.

Therefore:

> **A/B's next problem is semantic/epistemic design, not discoverability or plumbing.**

## 72. S0 positive physicality constrains how Ecology blocking may be repaired

S0 provides positive Owner evidence that:

- body envelope changes route availability;
- material body relations matter;
- heavy/light interaction can visibly alter another body;
- permissive alternate paths are preferable to hidden restrictions.

Ecology provides negative evidence that:

- ordinary multi-body traffic too easily becomes hard packed deadlock.

Together they reject both naive poles.

Do not infer from Ecology:

> remove body-body occupancy.

Do not infer from S0:

> hard circle blocking is good.

Cross-recording requirement:

> **preserve material spatial consequence while discovering contact/navigation behavior that does not turn accidental traffic into permanent walls.**

## 73. S0 drifters were adequate for dyadic evidence but do not scale into organisms

S0's simple drifters were sufficient to test:

- one heavy/light contact;
- displacement;
- body/world route fit.

Ecology scales similarly simple actor logic into a population and exposes its inadequacy.

Therefore:

> **a substrate can be adequate evidence machinery at one interaction cardinality and invalid at another.**

This is a general Combat Lab lesson.

Do not promote a donor/mechanism merely because it worked in a lower-cardinality specimen.

## 74. Copy reduction already failed as a sufficient answer to panel density

B0 closure deliberately shortened descriptions.

That was correct local polish.

Ecology still becomes difficult to navigate.

Therefore future refoundation should not treat the problem as:

> “make descriptions shorter again.”

The recording now proves that **information architecture**, not merely copy length, is the dominant issue.

## 75. Workbench qualification must be scoped more precisely after Ecology

Earlier canonical verdict:

> WORKBENCH FOUNDATION — QUALIFIED FOR CURRENT RESEARCH USE

remains defensible for the interaction kernel proven in B0.

Ecology adds an important scope boundary.

A more precise interpretation is:

### Qualified interaction primitives

- live numeric editing;
- exact entry;
- wide rails;
- authored/derived distinction;
- world reset vs parameter-default reset;
- experiment shell;
- provenance;
- basic action controls.

### Not qualified as scalable product architecture

- one long Inspector;
- binary global Debug;
- flat parameter naming/scope;
- broad opaque A/B snapshot semantics;
- population/cohort observability;
- crowd-scale diagnostics.

This distinction prevents two opposite errors:

- throwing away useful proven primitives;
- preserving the entire Workbench structure because it once earned a PASS.

## 76. Repeated Owner behavior gives a stable “research personality” for the Lab

Across S0/B0/Ecology the Owner repeatedly prefers:

- immediate interaction over reading instructions;
- physical/world evidence over abstract claims;
- extreme experiments over protected normal ranges;
- changing variables independently;
- continuing from surprising states rather than resetting immediately;
- understanding causes after something interesting happens;
- permissive failure over prevented failure.

This is not authority for a specific UI.

It is a durable design pressure:

> **Combat Lab should optimize for an exploratory experimentalist who discovers by perturbing a live world, not for a user filling out a configuration form before a test run.**

## 77. Current Workbench state model is structurally flat

**Status:** CODE-CONFIRMED ARCHITECTURAL LIMIT

`WorkbenchInspector` maintains:

- one ordered `editableIds` list;
- one set of numeric bindings;
- one set of live bindings.

`getParameterState()` iterates every editable ID and produces one flat object.

There is no neutral representation of:

- scope/domain;
- selected entity;
- selected cohort;
- apparatus vs specimen state;
- relationship between authored and derived values;
- nested object identity;
- comparison subset.

Therefore several recording findings cannot be solved cleanly by styling the current schema.

The contract itself needs more expressive semantics before the Lab can scale.

## 78. Current A/B opacity is deterministic architecture behavior

**Status:** CODE-CONFIRMED

The slot summary implementation displays:

- the first two entries;
- then `+N`.

Ecology's editable order begins with spawn-template fields.

Therefore summaries such as:

> Spawn envelope 1.00 · Spawn body mass 1.00 · +7

are not an accidental copy bug.

They are a deterministic result of:

1. flat parameter ordering;
2. capture-all semantics;
3. first-two summary formatting.

Likewise, `applyParameterState()` applies every captured editable value that still exists.

There is no diff preview or domain filtering.

This confirms:

> **A/B needs a semantic state model before presentation polish can make it trustworthy.**

## 79. Wheel zoom is absent from the current neutral input substrate

**Status:** CODE-CONFIRMED DIRECT REQUIREMENT GAP

`BrowserInput` currently supports:

- keyboard;
- pointer position;
- pointer buttons.

It does not capture wheel input.

The Owner's mouse-wheel camera requirement therefore requires a real input-contract extension or an experiment-local equivalent.

This is not currently a hidden feature that merely needs exposure.

A future shared input design should consider whether wheel is:

- neutral viewport input;
- experiment-owned input;
- apparatus-owned camera input.

That ownership decision is architectural and remains open.

## 80. Authored/live separation is implemented as different rendering roots

**Status:** CODE-CONFIRMED ARCHITECTURAL LIMIT

Editable groups render into `parameterRoot`.

Derived/live groups render into `liveRoot`.

This guarantees a clean conceptual separation, which was useful in B0.

But it also makes it difficult for an experiment to express:

> “show this derived consequence next to this authored cause.”

The Ecology recording shows why both properties matter:

- authored vs derived must remain distinguishable;
- causal neighbors sometimes need local co-visibility.

Future Workbench semantics need to support both without collapsing authored/derived truth.

## 81. Actions have no first-class provenance in the current Workbench

**Status:** CODE-CONFIRMED RESEARCH-INTEGRITY LIMIT

A generic action button currently:

1. invokes `inspector.action(action.id)`;
2. runs `sync(true)`.

The Workbench does not automatically record:

- action ID;
- simulation time;
- result;
- parameter context;
- affected cohort/entity.

Therefore the first recording's spawn history had to be reconstructed externally.

A future intervention ledger cannot be added reliably as a visual afterthought; the action/state contract must provide enough semantic event information.

## 82. Parameter edits likewise lack an intervention event stream

**Status:** CODE-CONFIRMED RESEARCH-INTEGRITY LIMIT

Numeric edits directly call:

`inspector.set(control.id, value)`.

The Workbench does not retain:

- previous value;
- new applied value;
- simulation time;
- scope/target;
- whether the change came from slider, numeric entry, anchor, reset, A/B Apply or Restore Defaults.

This is adequate for a demo/control panel.

It is insufficient for a research instrument expected to explain how a live state was reached.

## 83. Current input architecture already contains a useful separation worth preserving

**Status:** CODE-CONFIRMED STRENGTH

`BrowserInput` deliberately clears world keyboard state when focus is inside:

- INPUT;
- TEXTAREA;
- SELECT;
- BUTTON;
- contenteditable / Workbench input surfaces.

This was introduced after B0 focus leakage and remains a good boundary:

> **editing the apparatus should not accidentally operate the world.**

Future direct viewport manipulation, wheel zoom and entity inspection should preserve similarly explicit input ownership.

## 84. Current architecture has no concept of “selected research subject”

**Status:** CODE-CONFIRMED LIMIT / STRONG CANDIDATE REQUIREMENT

The Workbench mounts one experiment-level inspector.

It can ask that experiment for values by global IDs.

There is no shared concept equivalent to:

- selected actor;
- selected cohort;
- selected object;
- selected region;
- selected diagnostic probe.

This explains why the easiest implementation pattern is to create permanent sections such as:

- Player phenotype;
- Spawn phenotype.

That pattern does not scale to many inspectable subjects.

A future refoundation should challenge whether **selection/context** needs to become a neutral Workbench concept, while keeping the actual semantics of actor/cohort/object experiment-owned.

## 85. Current generic control contract is too narrow for the now-observed research workflow

The original Workbench intentionally started with:

- numeric;
- action;
- read-only.

That bounded design was correct for S0/B0.

Ecology now produces evidence for additional semantic capabilities, not necessarily additional widget types:

- scoped state;
- selected target/context;
- intervention events;
- state/checkpoint domains;
- causal authored↔derived relationships;
- richer observation apparatus.

The lesson is not:

> add 15 generic widget types.

It is:

> **the neutral contract now needs richer research semantics before it needs richer controls.**

## 86. Ecology exposes a fundamental limit of parameter-only A/B

**Status:** CRITICAL RESEARCH-INTEGRITY FINDING

Current A/B captures editable parameters.

It does **not** capture the evolving world/population state.

In B0 this can be useful when a matched world start is externally guaranteed.

In Ecology the world becomes strongly path-dependent:

- hundreds of moving actors;
- persistent jams;
- changing contact networks;
- spatial redistribution over time.

Therefore:

> applying A and B sequentially inside one evolving 845-resident world does not create a controlled A/B comparison.

The parameter vector may differ cleanly while the initial physical situation does not.

This means a professional comparison system needs an explicit answer to:

> **what start state is being held constant?**

Potential later mechanisms include:

- deterministic reset/re-run;
- world checkpoint;
- replayed intervention sequence;
- controlled scenario seed;
- matched saved population state.

No mechanism is selected by this campaign.

## 87. Current A/B captures the wrong boundary for complex experiments

Current parameter slots can include:

- camera zoom — often apparatus state and a possible visual confound.

They exclude:

- actor positions;
- velocities;
- population composition/history;
- current jams/contact topology;
- simulation time.

That is almost the opposite of what some stateful comparisons may require.

The requirement is not “snapshot absolutely everything”.

It is:

> **comparison domains must be explicit and question-dependent.**

Examples of possible comparison questions:

- same world start, different player phenotype;
- same actor population, different contact law;
- same phenotype, different pressure regime;
- same simulation result, different observation view.

These require different state boundaries.

## 88. “Experiment state” cannot remain synonymous with “editable controls”

**Status:** CODE + RECORDING CONFIRMED

The current implementation makes a convenient assumption:

> editable parameters ≈ state worth capturing.

Ecology falsifies that assumption.

Research-relevant state may include:

- authored law/configuration;
- instantiated population;
- world dynamic state;
- stimulus state;
- intervention history;
- random seed;
- observation apparatus.

Future Workbench refoundation needs a more explicit state ontology before comparison/replay tooling can become trustworthy.

## 89. Long-lived exploratory worlds make checkpoints more valuable than global resets alone

**Status:** STRONG DERIVED REQUIREMENT

The Owner keeps the evolving world alive rather than repeatedly resetting.

In that workflow, an interesting jam or crowd arrangement may itself be evidence worth preserving.

A global deterministic Reset is useful, but it destroys the found state.

Therefore a future Lab likely needs some way to preserve **interesting intermediate research state** before destructive follow-up.

This is a candidate requirement for checkpointing, not authority for a particular serialization/replay implementation.

## 90. Dynamic-world comparison requires time semantics

**Status:** RESEARCH-INTEGRITY REQUIREMENT

In a moving population, “same parameters” at two different times are not equivalent experimental conditions.

Comparison tooling must eventually make temporal context explicit enough to distinguish:

- same simulation time from matched start;
- same intervention sequence;
- same instantaneous world checkpoint;
- merely “whatever the world looked like when Apply was clicked.”

Current A/B provides no such distinction.

## 91. Observation convenience must not silently author the phenomenon

**Status:** CRITICAL RESEARCH-INTEGRITY REQUIREMENT

The near-player spawn repair improved visibility.

It also changed spatial pressure.

This demonstrates a general rule:

> **an apparatus feature added to make something easier to observe must be audited for whether it changes the phenomenon being observed.**

Examples to watch later:

- camera-follow spawning;
- auto-centering;
- debug-only physics alterations;
- adaptive despawn;
- auto-spacing crowds;
- hidden spawn redistribution.

Visibility and neutrality are separate axes.

## 92. Spawn location must be explicit stimulus state

**Status:** STRONG REQUIREMENT

Where an actor enters the world materially affects:

- local density;
- route choice;
- first contacts;
- jam formation.

Therefore spawn placement is not incidental infrastructure once crowd/world relations are under study.

Future experiments should be able to treat placement policy as explicit scenario/stimulus state with provenance.

No spawn-editor design is selected.

## 93. Phenotype assignment and stimulus assignment must be matchable

**Status:** CRITICAL CAUSAL REQUIREMENT

Current serial couples:

- creation order;
- position seed;
- initial goal;
- route cycle.

A future phenotype comparison needs the ability, where appropriate, to hold non-phenotype stimulus constant.

Invariant:

> **changing phenotype must not necessarily force a different route/start/stimulus unless the experiment explicitly intends that confound.**

This may later require matched cohorts, shared seeds, cloned starts or another method.

No method is selected yet.

## 94. Implementation identity must not silently become behavioral policy

**Status:** CODE-CONFIRMED RESEARCH-INTEGRITY REQUIREMENT

Actor ID currently influences goal stepping.

Future architecture should separate:

- identity/provenance;
- random/deterministic seed;
- behavioral stimulus/policy.

They may be deterministically related if explicitly chosen.

They should not be accidentally coupled because a string contains a number.

## 95. Role differences must be visible when interpreting embodied comparisons

**Status:** RESEARCH-INTEGRITY REQUIREMENT

Player and residents currently differ in more than authored phenotype:

- direct human control vs waypoint control;
- max speed ~225 vs ~175.

Therefore “player pushes resident” is not a pure phenotype comparison.

Future debug/evidence should make role/controller-law differences legible enough that embodiment claims do not silently absorb them.

This does not require identical player/NPC controllers.

It requires attribution discipline.

## Working invariant

> **A professional Combat Lab should make it cheap to ask a dangerous question of the world, cheap to see what happened, and hard to misunderstand why.**
