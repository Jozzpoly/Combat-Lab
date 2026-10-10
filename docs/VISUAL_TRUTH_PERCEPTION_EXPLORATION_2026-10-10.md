# Visual Truth / Perception / Crowd Fields — eksploracja, konsolidacja i powrót (2026-10-10)

**Status: RESEARCH / IDEAS BANK; NOT a feature backlog, chosen storage format, LLM-brain design or new architecture.** This is a bounded detour at explicit Owner request. Return to [the goal](VISION_ADAPTIVE_ROADMAP.md) and [real first look](OWNER_FIRST_LOOK.md) after harvesting the few ideas below. No engineering campaign is authorized by this document alone.

## Why — Owner intent, not machine hype

The first unretouched Chromium screenshot of Z1 exposed the truth better than many machine-PASS claims: **simple rectangles, disconnected mechanical stations, substantial UI**. Owner then asked to investigate short-interval snapshots, very low-resolution/B&W representations, layered PNG as a *mental anchor*, custom formats, locally centered multi-scale perceptions, observed crowd flow/density and potentially an organism's movement/decision history. He explicitly requested **exploration → consolidate/save → return to the original Combat Lab struggle**. He did *not* request immediate construction of an AI visual cortex, new traffic system, irreversible archive format or a separate project.

The active project still aims at a world where Owner can **freely provoke and break physically diverse organisms, actions, crowd dynamics and material consequences**, and actually inspect their real behavior. Visual observability is supportive, not the primary product. Historical Owner FAILs remain.

## Four distinct layers of information (do not conflate)

1. **Canonical world state and solver facts**: positions, shapes, contact impulses, materials, actor commands and actual external energy. Render-independent and exact within solver/model limitations. If a system has only proxy support, say so.
2. **Agent-accessible observation**: only fields an organism has legitimately sampled: line-of-sight/range/occlusion, body contacts, local history, uncertainty. Never leak privileged world truth into a purported POV; `not observed` is different from `no object`.
3. **Controller history / intent**: only log **actual** inputs, controller state, goals or planned actions *when those things really exist*. Current Z1 manually operated bodies have no autonomous plan. A proposed flow map or analyst prediction must never be mislabeled `actor thinks`.
4. **Analyst/Owner render**: faithful raw first-frame screenshot, motion timeline, debug overlays, cause/event ribbon and derived statistical maps. Such images are evidence of the executed version, not the primary source of reality.

Every captured layer should carry **provenance**: branch + SHA, scene identity, solver version, seed when applicable, simulation tick/time, physical units and coordinate frame, actual source of command/energy, level and transform, channels with unit/types, `truth/sensed/derived/hypothesis` classification and loss/quantization or sample freshness. Replay determinism should be *tested*, not assumed from same seed.

## PNG / custom format / standard formats: selection before invention

The RGBA idea is useful as an **illustration**: 4 co-registered channels; it is **not four independently resolvable maps**, nor a general-purpose channel registry. PNG supports 8/16-bit channels, but truecolor+alpha has special display semantics, viewing pipelines may apply color transforms, 8-bit quantization is bad for high-range or signed physics and different spatial scales need metadata/external grouping. A grayscale thumbnail rendered for human inspection is **NOT** the source data for the controller.

| Candidate | Where it fits | Main limitation for us |
| --- | --- | --- |
| **PNG** | Small human-readable silhouettes, masks, snapshots, one grayscale/packed quick export | Display-oriented pixel semantics, four-channel bound, shared resolution, conversion/precision pitfalls |
| **OpenEXR** | Offline multichannel floating-point diagnostics, depth/normal/force layers | Rich but heavy for a tiny browser-first short-run packet |
| **Zarr v3 (+ OME-NGFF concepts)** | Chunked typed N-D arrays, temporal stacks, different multiscales, spatial transforms | Library/storage complexity, file count/metadata for a 10-second local probe |
| **Versioned manifest JSON + typed binary arrays** | **Best provisional candidate to test** for 24×24, 64×64 actor-local maps plus sparse events | Need explicit schema, units, transforms, versions, validation; do not call it production format |
| **Custom binary container** | Only if measured needs expose a specific deficiency in standard/simple forms | Own codecs, backward compatibility, interoperability/maintenance obligations |

Quick uncompressed payload sizes: `24×24×4 u8 = 2,304 B`; `64×64×4 u8 = 16,384 B` per sample (plus metadata). A signed `flow.x/flow.y` field is **two typed numerical components**, not a one-channel decorative arrow. Unknown, occluded, unreachable and empty must be explicitly distinct if perception is involved.

**Default for the FIRST probe:** a human contact sheet + simple machine-readable **manifest and selected state/event traces**. Add raw TypedArray/channel atlas and export/compression *only where inspection or an actual experiment earns it*. Comparison with EXR/Zarr is research, not a forced dependency.

## Multi-scale local observation is not only image resizing

Candidate spatial sampling for **future testing**, no fixed format or policy:
- Near: `24×24` samples in a few body lengths — contacts, support, local geometry.
- Mid: `64×64` covering wider interaction context.
- Far: sparse `32×32` over a larger radius, or sector/log-polar sample for field-of-view/foveation.
- Include actual world→actor transforms (origin, heading, meters/cell), FOV angle, occlusion, sampling rule, time/age, and *whose observation*. Same resolution can represent radically different amounts of information depending on scale.
- Sampling could adapt to crowd density, speed, sight properties, body morphology, confidence, cost budget or relevance. **Dynamic scale selection can also inject instability or surprise-free omniscience; test against fixed simple near-field.**
- Three candidate consumers: (a) **us** for debugging, (b) cheap perception interface for non-LLM behavior, (c) future LLM/embodied agent if justified. The same schema need not serve all three.

Falsifier: if tiny POV raster discards important collisions/occlusion or costs more to encode/decode than sparse direct sensor/contact facts, use sparse facts. If it reports what the organism couldn't sense, it fails as *perception* even when it looks useful as debug.

## Crowd flow: three DIFFERENT fields, not one magic controller

Inspired by visually striking huge simulations. Important separation:
- **Observed flow** `v_obs(x,t)`: aggregate of *actual* body velocities/trajectories over a window; descriptive, never makes a body move. Show density `rho`, variance/confidence and where no samples exist. Useful immediately for diagnostics (jam/counterflow, underused regions, physically induced motion).
- **Desired/navigation flow** `v_des(x,t,goal)`: vector/cost/potential field *used to recommend movement*; may depend on density, preferred direction and terrain. A global goal is an explicit authored choice, **not emergent intention**. Treuille–Cooper–Popović's Continuum Crowds (2006) computes a density/velocity/discomfort-sensitive potential and resultant movement for groups. Relevant research donor for **scaling**, not automatic new Combat Lab AI.
- **Contact/pressure field**: normalized local force/impulse/occupancy under a physically consistent sampling method. Do NOT call density alone mechanical pressure. It is a diagnostic layer until body/solver evidence supports a causal interpretation.

Rival family: **ORCA/RVO2** handles reciprocal local collision avoidance but requires externally supplied preferred velocities / navigation. It can be a **comparison control** for crowd flow efficiency; its collision-avoidance goal may be actively contrary to the desired physical contact/soft pushing and diverse bodies. Never import it as the core actor behavior by name recognition.

Useful hypothesis: many bodies can use one lower-cost coarse *shared world summary* while their **real body contact solver** arbitrates final impulses. Falsify whether this creates uniform traffic/goal obedience and suppresses real local consequences; crowd-scale speed without readable organism behavior is NOT victory.

## Visual-truth micro-experiment — optional one short pilot, not a new product track

Use the existing proven **Z1 Owner First Look** source, not a freshly invented behavioral scenario. Fixed-step physics, `10–20 s` simulation time, explicit manual input and scene snapshot. Generate **only**:

1. **Owner-facing raw:** t=0 original full application frame + one 8–12 frame chronological contact sheet of the actual same-world run (timestamps/inputs).
2. **Analyst-facing focus:** 128–256 px region of interest at close intervals around *first real contact*, simple B/W silhouettes and a motion-history overlay. No dashboard of 20 variants.
3. **Machine companion:** tiny JSON metadata + contact/command event timeline, first contact, attempted/actual movements. If it makes sense, sample one 24×24 occupancy crop and one 64×64 wider contextual crop — explicitly mark these `analyst sampler`, **NOT** an actor's own perception.

**How to implement cheaply if/when chosen:** reuse source-proven Chromium/Playwright-compatible browser run in GitHub Actions, frame stepping and captured actual canvas; offscreen capture at exact solver ticks rather than recording wallclock slowed video, plus Node/Python + NumPy/Pillow for optional contact sheets. Prefer CI **artifacts** for full frame sequences (not thousands of base64 log lines), with *one* representative human-viewable image linked from the report. No TinyFish, no new hosted service, no public deploy. Check that the action runner really uploads/downloads artifacts before claiming capability.

**Gates before making the instrument permanent:**
- Different reviewers can understand **what moved/why** better than from one screenshot or event log.
- At least one important visual or causal misinterpretation is corrected by the capture.
- Captures do not alter physical timing/state (or instrumentation perturbation is measured).
- A cheap baseline (2 stills + five events) is compared against the complicated atlas.
- Owner actually finds the view worth inspecting, not just the agent liking its own analytics.

Stop early if the baseline provides the same understanding. **Do not make all visual probes mandatory for every run**. Use where there is enough temporal/contact pressure.

## Sources and provenance of external exploration (2026-10-10)

- `Continuum Crowds` (Treuille, Cooper, Popović 2006): https://graphics.cs.cmu.edu/?p=375 ; full abstract/source https://grail.cs.washington.edu/projects/crowd-flows/continuum-crowds.pdf
- ORCA/RVO2 and requirement for user-supplied preferred velocity: https://gamma-web.iacs.umd.edu/RVO2/documentation/2.0/whatsnew.html
- Zarr 3 multidimensional typed/chunked representation: https://zarr-specs.readthedocs.io/en/latest/v3/core/
- OME NGFF multiple spatial scales and coordinate transforms (concept donor): https://github.com/ome/ngff-spec/blob/main/index.md
- OpenEXR multichannel/multipart: https://openexr.com/
- W3C PNG-3 alpha/channel precision: https://www.w3.org/TR/png-3/

These sources support **what each technique can express**, not that its adoption would improve Combat Lab, throughput or gameplay. No encoding benchmark or new gameplay prototype has been executed in this research detour.

## Additional critical cross-check — what the research still did NOT resolve

**2026-10-10 follow-up against primary research and wider original Combat Lab Owner intent.** This section preserves the *newly clarified boundaries*, not a new workstream.

### Ownership/semantics of separate spatial channels

Terrain/support, motion collision, line-of-sight blocking, ownership/social meanings and perceptual knowledge need **not** be the same map or derivation. The author may deliberately define a non-collidable sight blocker, unusual collision for a visual bush, or special material friction; that is an explicit **scoped authored rule**, not bad world truth merely because another solver would behave differently. An organism's **belief** about that terrain is a separate time-indexed inference, and an analyst's accessibility estimate a third. A single RGBA packing does not make the four channels semantically commensurate.

Do not hardcode `red = terrain, green = collision, blue = vision, alpha = pressure` into a source-of-truth API. Declare channels independently, with authority, scope, type, unit, coordinate transform and observation/availability provenance. An **unknown** pixel must remain distinguishable from a known empty pixel; see [OctoMap's occupied/free/unknown distinctions](https://octomap.github.io/octomap/doc/).

There are also at least **two very different 'agents'** who may consume images:
- **External research assistant** (us): may justifiably inspect full world truth, debug overlays, actual inputs and counterfactual traces.
- **In-world controller/NPC:** may receive only sensor-available samples and legitimate memory. Providing an atlas of exact hidden obstacles/world intentions as its supposed POV **silently destroys the embodied-research question**. Neither consumer requires a PNG file if a numeric array or sparse contact event is more direct.

### Resolution and interpretation cannot be picked by pixel count alone

A `24×24` sampling field over a `3×3 m` area means **12.5 cm/cell**; over `12×12 m` it means **50 cm/cell**. Even visually compelling `64×64` and `24×24` tiles are not comparable unless we know body size, physical FOV, coverage, range, sampling policy and transform. Narrow limbs, small passages and fast impacts can vanish between spatial/temporal samples. **Never infer 'no object/contact' from its absence in a coarse downsample**. Preserve exact contact events separately and consider conservative occupancy aggregation or sparse geometry for safety-critical probes.

Candidate foveated/log-polar maps naturally prioritize direction/range differently, but distort uniform area and complicate motion comparison. There is relevant prior art in [Traver & Bernardino's log-polar robotics review](https://www.sciencedirect.com/science/article/pii/S0921889009001687), **not evidence that adaptive multi-scale already improves Combat Lab**.

### A flow field can erase the phenomenon we want to discover

**High-density counterflow trap:** if two equally sized populations locally move east and west, the *mean* observed velocity may be approximately ZERO, exactly as in a motionless jam. A vector-arrow image alone falsely equates those radically different physical situations. Observed flow analysis must preserve at least **sample count/density**, vector variance (or two directional modes) and actor-contact data where relevant. If only one extra diagnostic is affordable, a contact/event trace usually beats a prettier vector rendering for causal attribution.

[Continuum Crowds (2006)](https://grail.cs.washington.edu/projects/crowd-flows/continuum-crowds.pdf) explicitly uses crowd density and density-weighted mean velocity to construct a group-level goal-directed field. **The group's goal and discomfort inputs are exogenous**, and compressing an organism's opportunities into that group objective can wipe out the body diversity Owner wants. [Patil et al. (2010)](https://ics-websites.science.uu.nl/docs/vakken/mcrws/papers_new/Patil%20et%20al%20-%202010%20-%20Directing%20crowd%20simulations%20using%20navigation%20fields.pdf) goes further in explicitly authoring goals/guidance fields to direct crowds, which is valuable for directing spectacle **but not an answer to endogenous purpose, contact-based group behavior or perception**. [RVO2/ORCA](https://gamma-web.iacs.umd.edu/RVO2/documentation/2.0/whatsnew.html) requires preferred velocities from the application and addresses avoidance, not which world action a creature wishes to perform. None should be imported as an automatic behavior default.

Physical **pressure** likewise requires well-defined force/stress/contact aggregation, not merely a heatmap of population density; there is dedicated work estimating crowd contact forces and pressure from micro- and macro-scale models: [Jebrane et al., 2019](https://www.sciencedirect.com/science/article/pii/S0307904X19302793).

### Replay/capture: what is evidence vs convenience

Exact tick capture solves **temporal aliasing in screenshot scheduling**, not physical determinism by itself. Store the initial authored scene, action commands and actor identifiers, source/solver version, sampling times, and a minimal hash/state check at critical ticks. Run an identical case twice before claiming replay equivalence; cross-hardware floating-point effects can make bit-exact simulation impossible without engine-specific constraints (see [Isaac Lab reproducibility guidance](https://isaac-sim.github.io/IsaacLab/main/source/features/reproducibility.html)). Owner-facing frames remain **raw, unretouched truth of the actual app**; low-res/B&W/motion-ghost channels must be visibly labeled **derived analytical views**.

### Final decision rule for this detour

**Keep one practical idea now:** with the next legitimate Z1/S2 or whole-world observation, opportunistically render a fixed-step **raw first frame + short causal contact strip + input/contact trace**, if doing so clarifies something the existing screenshot could not. Compare it to an even cheaper baseline (two stills and a few event lines). **Do not build a proprietary `brain format`, adaptive vision engine or flow-steered crowd controller until a real gameplay/analysis pressure demonstrates a specific deficit.** The lab's long-term vision includes heterogeneous, compound and potentially deformable/animal-like organisms — another rectangle traffic test would be moving backwards, however sophisticated its vector field.

## Disposition — return to the actual fight

**Keep now:** (1) honest raw image plus few key times, (2) explicit event and provenance trace, (3) option to overlay actual contact/velocity and show simple nearby occupancy, (4) distinguish world truth / agent access / diagnostic inference, (5) flow maps as a **research diagnostic** for future crowd tests.

**Keep on the shelf:** multi-scale adaptive observation, foveation/egocentric tensor packets, custom archive, flow-driven crowd navigation, ORCA comparison. They may be valuable later, but are NOT now a commitment.

**Back to:** [First real Owner Look](OWNER_FIRST_LOOK.md) + [Adaptive Roadmap](VISION_ADAPTIVE_ROADMAP.md) and the physical body↔world frontier. The owner-facing work must continue presenting **what is actually there**, including aesthetically crude bodies, restricted actions and failed tests. A future visual pilot may be opportunistically attached to the very next meaningful existing scene test; do not block Owner with a new perception architecture.
