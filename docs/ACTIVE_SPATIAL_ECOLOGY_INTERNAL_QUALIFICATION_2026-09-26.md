# Active Embodied Spatial Ecology v0 — Internal Qualification

**Date:** 2026-09-26  
**Branch:** `experiment/active-spatial-ecology`  
**Qualified checkpoint:** `d55b3b093325452e6dc730f314c886a2cbc85229`  
**Status:** **INTERNALLY QUALIFIED FOR DELIBERATE PUBLIC REHEARSAL — OWNER VALUE UNPROVEN**  
**Public deployment:** not yet changed by this checkpoint

## 0. Evidence boundary

This document qualifies apparatus/mechanism integrity only.

It does **not** claim:

- good combat;
- good crowd behavior;
- satisfying pushing;
- useful AI;
- Feniks fit;
- decision relevance;
- readable or interesting horde play;
- that the current collision/movement laws should survive;
- that the active spatial ecology hypothesis is human-positive.

The next material evidence is direct Owner play.

## 1. Implemented bounded specimen

The specimen adds:

- one continuous world larger than the viewport;
- experiment-owned player-following camera;
- fixed default camera zoom with broad manual zoom;
- multiple spatial regions / obstacle families;
- six deterministic heterogeneous baseline active bodies;
- simple deterministic destination-seeking resident intent;
- independently authored player phenotype:
  - envelope;
  - intrinsic mass;
  - carried load;
  - locomotor force;
- independently authored spawn-template phenotype with the same dimensions;
- direct population actions:
  - `Spawn +1`;
  - `Spawn +5`;
  - `Spawn +10`;
  - `Spawn +50`;
  - `Clear extras`;
  - `Clear all`;
- deterministic legal spawn attempts, preferring a ring around the current player so new pressure appears in the observed local world;
- fallback world entry regions when local legal placement saturates;
- explicit spawn-failure reporting rather than silent phenotype mutation;
- population / nominal occupied-area / contact-rate diagnostics;
- neutral Workbench experiment-owned action buttons;
- fixed-step stress telemetry that exposes discarded wall time without removing the existing anti-spiral safety guard.

No weapons, HP, damage, combat AI, classes, stance, production pathfinding or production physics were added.

## 2. Owner correction materially changed the apparatus

The first provisional design said “small population, not a crowd benchmark”.

That was wrong.

The corrected contract is:

> **bounded baseline, unbounded curiosity**

The readable baseline is only the starting condition.

Population pressure is now deliberately explorable from:

- zero residents;
- sparse relations;
- baseline;
- multi-body flow;
- dense crowd;
- horde;
- technical / spatial saturation and break regimes.

No low research cap was introduced.

## 3. Mechanistic qualification

Final automated suite at the qualified checkpoint:

> **51 / 51 PASS**

New ecology-specific checks establish narrowly that:

- baseline population is deterministic and heterogeneous;
- spawn-template authoring affects new residents without rewriting old residents;
- mixed phenotype waves can coexist in one live world;
- repeated spawning can exceed one hundred active residents before any artificial cap;
- >100-body state remains numerically finite in a bounded deterministic soak;
- population can be reduced to zero;
- `Clear extras` restores the baseline subset;
- Reset World restores deterministic baseline while preserving authored player/spawn/view parameters;
- active residents move without player input;
- player envelope remains independent from mass/locomotor force;
- camera zoom does not silently follow body envelope;
- giant-envelope horde requests report placement saturation truthfully rather than shrinking/changing the requested phenotype;
- B0/S0 and repository hygiene regressions remain green.

## 4. Real Chromium Workbench gate

Run:

- GitHub Actions run `36236532447`;
- test job `108389212064`;
- result: **SUCCESS**.

The real-browser gate preserved the existing B0 regressions first, then switched into the new ecology experiment.

Observed/proven in-browser:

### Existing foundation remains alive

- B0 exact numeric editing;
- force 42 regression;
- explicit true safety rail;
- B0 A/B mechanism;
- B0 focus isolation;
- B0 reset/default separation;
- B0 ↔ S0 experiment switching;
- research/diagnostic grouping.

### New ecology controls

Browser verified presence/use of:

- independently editable player phenotype;
- independently editable spawn phenotype;
- `Spawn +1 / +5 / +10 / +50`;
- `Clear all`;
- larger camera-following world;
- direct player movement.

### Mixed waves

Wave A:

- 10 residents;
- envelope 0.55;
- body mass 8;
- carried load 2;
- locomotor force 5.

Wave B, added later into the same world:

- 5 residents;
- envelope 2.0;
- body mass 0.5;
- carried load 0;
- locomotor force 0.75.

Browser gate verified that creating wave B did not rewrite wave A.

### Dense pressure

One `Spawn +50` request after restoring the baseline produced:

- **56 active residents total**;
- **0 spawn failures**;
- nominal occupied-body area: ~**4.35%** of world area;
- sampled body contact rate: ~**626 contacts/s**;
- static contact rate at that sampled window: 0.

This is only evidence that dense moving material contact is actually occurring.

It is **not** evidence that the resulting crowd behavior is good.

### Zero ↔ baseline ↔ horde

Browser gate directly exercised:

- Clear extras → baseline;
- Clear all → zero residents;
- Reset World → deterministic six-resident baseline;
- Spawn +50 → dense pressure state.

### Simulation stress truth

The browser gate deliberately blocked the main thread for ~125 ms.

The fixed-step safety guard remained active and the Workbench reported:

- `SIM STRESS`;
- cumulative dropped wall time: **0.05 s**.

The diagnostic therefore distinguishes loss of real-time fidelity from actor/world behavior instead of silently slowing the simulation.

Reset World clears the stress accounting.

## 5. Visual rehearsal and one caught apparatus failure

Three screenshots were captured automatically:

- ordinary/mixed-phenotype world;
- dense-pressure world;
- compact 1280×800 layout.

### First visual pass — MATERIAL FINDING

The first implementation used distant fixed spawn entry zones.

Machine state correctly reached 50+ residents, but the camera often still looked sparse because many new bodies were outside the observed region.

That was a genuine apparatus failure:

> **“population exists” was not equivalent to “the Owner receives live pressure”.**

Repair:

- legal spawning now first tries a deterministic annulus around current player position;
- only then uses world entry-zone fallback;
- population buttons were promoted above parameter detail in the Inspector.

### Rehearsal after repair

Manual screenshot inspection shows:

- ordinary state: mixed body sizes visible around the player;
- dense state: many bodies occupy the currently observed space and create visually legible local pressure;
- population actions are immediately visible;
- spawn-template authoring follows directly below them;
- giant Owner-derived player body remains visibly giant because camera zoom is not auto-normalized;
- compact 1280×800 layout remains usable without horizontal Inspector overflow.

Visual inspection can qualify presentation integrity only, not feel.

## 6. Current technical boundaries

### Collision / scaling

Dynamic body pairs still use the simple all-pairs qualitative solver.

Approximate per-step pair comparisons grow as:

`N × (N - 1) / 2`

This is intentionally not optimized yet.

Reason:

- current specimen already crosses 100 active residents in a finite mechanistic probe;
- optimizing before the Owner encounters a materially useful density would risk building crowd infrastructure for a phenomenon that may not deserve it.

If Owner play quickly finds a useful higher-density regime and O(N²) becomes the blocker, spatial broad phase / a stronger physics substrate becomes justified.

### Navigation

Resident intent uses deliberately weak deterministic destination seeking plus local static-obstacle steering.

It does not contain:

- combat tactics;
- player-countering policy;
- class roles;
- ORCA/RVO;
- multi-agent planning.

This is sufficient only if movement apparatus does not dominate Owner attention.

## 7. Targeted donor result

A bounded donor reconnaissance was already performed because higher population makes navigation/spatial infrastructure relevant.

### Companion-Brain-Lab

Useful candidates exist for later targeted transplant:

- static physical occupancy queries;
- hard-body vs comfort-clearance routing semantics;
- explicit egress behavior;
- deterministic static routing;
- inspectable spatial locomotion;
- Rapier-backed physical-world seam.

But Companion’s own current evidence explicitly does **not** provide a ready multi-companion ORCA/RVO crowd system.

Do not import Companion architecture wholesale.

### ReflexBrain-Lab

Current repository has no movement authority worth importing for this question.

### SPC / Llm-Live-NPC

Current repository does not contain the mature pathfinding/multi-body movement substrate needed here.

## 8. Internal promotion decision

The specimen has survived:

- hypothesis review;
- adversarial frontier comparison;
- Owner permissiveness correction;
- apparatus review;
- unit/mechanistic qualification;
- >100-body permissiveness probe;
- giant-horde saturation truth test;
- real Chromium interaction gate;
- dense real-contact gate;
- forced simulation-stress truth test;
- visual red-team and repair;
- compact layout inspection.

Therefore:

> **INTERNALLY QUALIFIED FOR DELIBERATE PUBLIC REHEARSAL**

This means only that it is now worth translating to a real public origin for direct Owner observation.

It is **not** a positive result for the research hypothesis.

## 9. Next evidence

After exact public-origin qualification, the Owner should receive the specimen with minimal interpretation.

The important observations are behavioral:

- does he immediately start spawning/breaking populations;
- does he create weird or coherent phenotypes without being instructed;
- does he naturally treat different bodies / spatial regions differently;
- does dense pressure reveal new behavior or only noise;
- does he reach for camera, clear/reset, Debug or authoring in ways that reveal apparatus friction;
- at what population/body regime does the experiment stop feeling like world relations and start feeling like solver failure.

The Owner’s reaction outranks every PASS above.

## Working invariant

> **Machine evidence earns the right to ask the human question; it does not answer it.**
