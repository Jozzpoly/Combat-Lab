# Combat Lab Refoundation Audit — 2026-09-25

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> This file preserves the research state at its date. Any `active`, `current` or `next` wording below is historical. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Status:** historical strategic audit; refoundation executed and superseded by current canonical state  
**Scope:** Combat Lab as a research instrument  
**Owner trigger:** explicit correction that Combat Lab is broader than hitting or swords; body size and many other combat families matter; a clean restart may be needed  
**Pre-refoundation checkpoint:** `ba081120d2563f767e14cd5b61e07f6503a0627f`

## 0. Executive finding

Combat Lab has accumulated valuable evidence, but its execution substrate and campaign history have become narrower than the Owner's actual research space.

The repository repeatedly returned to melee/contact/exchange questions even after the project vision had expanded toward:

- body size and body identity;
- mass / movement / carrying consequences;
- shields and space holding;
- polearms / reach;
- axes;
- bows / projectiles;
- magic;
- terrain;
- mixed modalities;
- multiple participants and future co-op;
- progression-shaped capability.

R3 produced the first clearly positive Owner signal in the current lineage. That is important evidence.

It is **not** justification to make R3, sword physics or relational contact the spine of Combat Lab.

Decision:

> **Preserve the research corpus. Rebuild the execution substrate from a neutral base.**

This is a refoundation of implementation assumptions, not a reset of knowledge.

---

## 1. Evidence map

The statuses below describe what Combat Lab has actually established, not what Feniks ultimately needs.

| Dimension | Current evidence | Status |
| --- | --- | --- |
| Melee contact / tool-tool relation | Terrarium donors, R0 readiness, R3 joint afterstate, first positive R3 Owner signal | **STRONG MECHANISM / EARLY HUMAN SIGNAL** |
| Persistent afterstate | R0 no-auto-neutral and R3 shared history are causally qualified | **STRONG MECHANISM** |
| Body mass / equipment burden | Phenotype P0/P1 and shield/contact donors | **PARTIAL DONOR** |
| Body size / envelope | Corridor access and phenotype continuity evidence; no qualified Owner-facing organism | **PARTIAL / UNDEREXPLORED** |
| Stance / support / space holding | Directional brace / SET / shield donors; integrated organisms failed | **PARTIAL DONOR** |
| Reach / spear / polearm relation | Persistent reach, clearance and tip authority donors; O2 whole organism failed | **PARTIAL DONOR** |
| Axes / materially different melee geometry | No dedicated whole-organism campaign | **LARGELY UNEXPLORED** |
| Projectile physics | finite travel, sweep, first-solid-body, impulse donors | **MECHANISM ONLY** |
| Bow / ranged combat language | no strong Owner-facing bow organism; ranged experiment collapsed into delete/kite/suppress regimes | **UNDEREXPLORED** |
| Magic | no meaningful dedicated combat-language experiment | **UNEXPLORED** |
| Terrain as tactics | several geometry probes; repeatedly risked becoming authored answer or collision scenery | **PARTIAL / UNSOLVED** |
| Mixed melee/ranged/magic relations | no serious whole-organism campaign | **UNEXPLORED** |
| Multi-actor pressure | concurrency, screening and mixed adversary donors | **PARTIAL MECHANISM** |
| Co-op / complementary roles | architectural pressure only | **UNEXPLORED** |
| Opponent/adversary identity | A1/A2b showed action diversity and screening; generic pressure repeatedly failed as discovery substrate | **PARTIAL / UNSOLVED** |
| Verticality / 2.5D combat | future pressure only | **UNEXPLORED** |
| Progression-shaped combat identity | design pressure only | **UNEXPLORED** |
| Human feel evidence | Terrarium Owner FAIL; R3 early positive signal; most other lanes stopped agent-side | **SPARSE** |

The asymmetry is material:

> **Combat Lab knows substantially more about local melee/contact causality than it knows about the wider combat possibility space.**

---

## 2. What the old era taught us

### 2.1 Mechanism truth is not combat truth

Repeatedly demonstrated.

Geometry, hit authority, contact, displacement, readiness and afterstate can all be causally real while the whole organism remains uninteresting or strategically collapsed.

### 2.2 Possibility richness matters more than mechanical completeness

Terrarium was more complete than several earlier probes and still failed hard in Owner play.

The strongest recurring failure was not "missing polish".

It was:

> **too few interesting things to intentionally do next.**

### 2.3 Shared rules are valuable, but authored situations can fake emergence

Phenotype Combat Ecology demonstrated that shared body/equipment properties can mechanically create different outcomes.

It did not prove that those roles become compelling play when the test situation itself encodes the answer.

### 2.4 Fast consequence is not the enemy

The evidence does not require sponge combat.

The actual problem was that consequence often became available before the relation was interesting enough to deserve it.

### 2.5 Retreat / kiting expose weak engagement structure

When local combat value is only HP survival/clear, responsive movement can cancel or trivialize engagement.

Do not solve this with arbitrary backward penalties or stamina taxes.

### 2.6 Persistent physical state is promising but not sufficient

R0 and R3 demonstrate that history can survive contact and alter the next realized action.

R1/R2 demonstrate the harder truth:

> **state persistence does not automatically create decision persistence.**

### 2.7 Owner evidence entered too late too often

The project became highly capable at machine falsification.

That reduced false positives, but several campaigns accumulated substantial implementation and analysis before the Owner ever touched a specimen.

R3 showed the value of a different cadence: once the phenomenon was stable enough, a short Owner observation produced strategically important information immediately.

---

## 3. Structural bias in the current implementation

At the audit checkpoint, the active app imported the R3 Owner specimen directly.

The package identified itself as `combat-lab-relational-manifold-r3`.

The active branch was 233 commits ahead and 12 behind `main`.

This is evidence of execution coupling:

- the runtime is not neutral;
- the latest experiment owns the application shell;
- branch chronology has started acting like architecture;
- the easiest next work is whatever reuses the current melee/contact machinery.

That is exactly the condition under which a research lab should refound its substrate.

---

## 4. Preserve vs reset

### Preserve as durable research truth

- exact specimen / campaign SHAs;
- Owner observations, especially explicit FAILs and the R3 early positive signal;
- falsifiers and stop conditions;
- causal kernels that survived their tests;
- donor mechanisms;
- experiment protocol;
- deployment/provenance discipline;
- negative evidence about generic pressure, retreat, offense deletion, authored route bias and neutral attractors;
- the distinction between machine evidence and human evidence.

### Do not carry forward by default

- R3 runtime ownership of the app;
- R3 solver as a shared combat foundation;
- one generic actor/body representation;
- one generic attack engine;
- one generic weapon abstraction;
- current commitment semantics;
- current experiment numbering as roadmap;
- current branch ancestry as architecture;
- melee-first sequencing;
- one default opponent controller;
- current presentation assumptions where they encode a specific hypothesis.

### Preserve only as optional utility after re-qualification

- generic math helpers;
- collision/geometry primitives;
- fixed-step helpers;
- rendering helpers.

Even these should be promoted only if they are semantically neutral across genuinely different future experiments.

---

## 5. Refoundation decision

**Decision: YES — refound the execution substrate.**

Meaning:

- no destructive repository reset;
- no deletion of research history;
- no claim that prior work was wasted;
- no immediate rewrite of Feniks combat.

Instead:

1. freeze the current whole-combat branch as evidence;
2. start a clean branch from canonical `main`;
3. move only current research truth and protocol corrections;
4. build a minimal neutral laboratory shell;
5. choose the next discovery campaign from the broad possibility map rather than the current code path.

The refoundation branch is:

- `refoundation/combat-lab-vnext`

It starts from `main` `53a7196526014c6acee78d8f9b75daa024607c2a`.

The pre-refoundation branch remains recoverable at:

- `ba081120d2563f767e14cd5b61e07f6503a0627f`.

---

## 6. vNext research map

The map is not a feature roadmap.

It is a guard against tunnel vision.

### Actor / body

Questions:

- size / footprint;
- proportions / reach origin;
- mass;
- acceleration / braking;
- turnability;
- contact resistance;
- squeeze / passage relation;
- posture / stance;
- burden / carried equipment.

### Tool / equipment

Questions:

- occupied space;
- reach;
- clearance;
- mass / handling;
- persistent coverage;
- projectile production;
- preparation;
- ammunition / resource as world fact;
- body requirement;
- hand/slot occupancy where useful.

### Action / intent

Questions:

- direct continuous expression;
- compact authored actions;
- preparation;
- commitment;
- release;
- cancellation / redirection;
- movement during action;
- learned techniques.

### World

Questions:

- open space;
- choke;
- cover / occlusion;
- obstruction;
- elevation / vertical relation later;
- material surfaces;
- local objectives / access;
- multiple routes.

### Relation

Questions:

- threat;
- support;
- interception;
- screening;
- pursuit;
- spacing;
- shared contact;
- line of sight;
- area denial;
- displacement;
- protection of another actor.

### Consequence / afterstate

Questions:

- damage;
- displacement;
- changed access;
- changed line;
- exposure;
- lost coverage;
- altered readiness;
- broken formation;
- world-state change;
- persistent magic/world effects later.

### Population

Questions:

- asymmetric enemies;
- multiple simultaneous pressures;
- complementary allies;
- crowd / horde regimes;
- elite/boss scale differences;
- future co-op.

---

## 7. Highest-value blind spots

Do not read this as a fixed order.

### Body / scale

High relevance, high cross-system leverage, only partially explored, and capable of invalidating many hidden assumptions in actor/controller/world code.

### Ranged / bow

We have projectile mechanics but not a compelling ranged combat language.

A bow must not become "melee attack with projectile=true".

### Magic

Almost completely open.

Especially valuable if tested as a fundamentally different relation to space/world/actors rather than as colored projectiles.

### Mixed modalities

Potentially where body, shield, reach, ranged and magic begin to reveal real party/combat ecology.

Currently almost absent from evidence.

### Multi-actor / party relation

Screening and concurrency donors exist, but there is little human evidence about complementary roles.

---

## 8. How to choose the first vNext campaign

Do not choose by familiarity or code reuse.

Evaluate candidates against:

- **Owner relevance** — does it speak directly to the desired Feniks possibility space?
- **information gain** — can it invalidate several assumptions at once?
- **orthogonality** — does it escape the melee/contact tunnel?
- **cross-system leverage** — would the result affect future body/world/tool architecture?
- **human discriminability** — could the Owner notice the phenomenon quickly?
- **apparatus risk** — how easily can the test script accidentally pre-author the answer?
- **implementation reversibility** — can we learn without committing architecture?

Body/scale is currently a strong candidate because it scores well on several dimensions and attacks the assumption that "actor" is a fixed unit.

It is **not yet selected**.

---

## 9. Owner-test cadence for vNext

For discovery organisms:

1. machine-test runtime and causal integrity;
2. perform enough red-team work to avoid an obviously invalid specimen;
3. expose the phenomenon to the Owner early;
4. only after a human-positive signal enter deeper attribution.

Do not spend dozens of tests perfecting a phenomenon the Owner has never experienced unless the mechanistic question itself is the research target.

---

## 10. Immediate execution sequence

### R0 — canonicalize the refoundation

- create clean branch from `main`;
- carry forward current scope correction, R3 Owner evidence and this audit;
- freeze old active branch as evidence;
- do not deploy.

### R1 — build neutral vNext substrate

Build only the minimum runtime defined in `COMBAT_LAB_VNEXT_EXECUTION_SUBSTRATE.md`.

No combat semantics.

### R2 — frontier selection

Re-evaluate at least three divergent first-campaign candidates against the selection criteria.

At least one candidate should be materially outside melee-contact continuation.

### R3 — first vNext discovery organism

Create one deliberately bounded whole organism with:

- clear hypothesis;
- 30-second human discriminator;
- hard falsifier;
- minimal machine gate;
- early Owner play.

The numbering above belongs only to refoundation execution. It is not continuation of old R0/R1/R2/R3 combat semantics.

---

## Working invariant

> **Combat Lab exists to discover combat worth supporting, not to preserve the architecture of the last interesting experiment.**
