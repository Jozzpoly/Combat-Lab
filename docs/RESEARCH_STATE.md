# Combat Lab — Current Research State

**Canonical status date:** 2026-09-26  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; Active Spatial Ecology first Owner rehearsal COMPLETE; feedback extraction ACTIVE; target hypothesis INCONCLUSIVE due material apparatus findings**

## 1. Owner intent

Combat Lab exists to discover combat language and embodied possibility for Feniks.

It is deliberately broader than melee or hitting. Important research territory includes:

- body size / envelope / proportions;
- intrinsic and carried mass;
- movement and locomotor authority;
- occupied space / collision / support;
- reach, shields, polearms, axes;
- bows / projectiles;
- magic;
- terrain;
- multiple actors and future co-op pressure;
- mixed modalities;
- persistent material/world state.

No single historical line — including R3 sword/tool contact — is the project spine.

A clean implementation restart is allowed whenever accumulated architecture constrains discovery. Evidence must survive such resets.

### Post-closure Owner direction — 2026-09-26

These are **Owner intent / future capability candidates**, not qualified mechanics and not an automatic next implementation:

- preserve envelope, mass/load and locomotor authority as independently editable underlying dimensions;
- later explore **optional explicit linkage / correlated scaling** so one authored change (for example body size) can deliberately drive selected mass, speed, force or other dimensions up/down together when the Owner wants a coherent phenotype quickly;
- such linkage must remain visible, reversible and authorable rather than becoming a hidden universal law that destroys independent experimentation;
- expand future test pressure toward a **larger and more varied world** with more terrain, obstacles and multiple varied opponents / residents, especially for displacement, pushing, being pushed, clearance and spatial-relation experiments;
- population pressure must remain **permissively scalable**: a small deterministic baseline may improve readability, but the Owner must be able to spawn more bodies directly (for example +1 / +5 / +10 repeatedly) and intentionally drive the experiment into crowd, horde and break regimes;
- after the current cleanup/preparation campaign, perform a deliberate donor review of **Feniks, ReflexBrain, Companion and SPC** for already-developed movement, pathfinding, spatial-relation and related infrastructure before reinventing those capabilities;
- cross-project donor code or architecture is never local authority by default: recover the exact useful property/evidence, transplant the minimum when a Combat Lab question actually needs it, and re-qualify it locally.

## 2. Evidence hierarchy

For product/experience claims:

> **Owner feedback and Owner-observed behavior > machine PASS > documentation > prior roadmap.**

If Owner play says a feature or specimen does not work, its product-level status is FAIL until new real evidence is Owner-observed.

Machine evidence may remain as narrow diagnostic/mechanism evidence.

## 3. Current qualified foundation

### Workbench substrate — MECHANICALLY QUALIFIED; CURRENT LAB UX HAS MATERIAL OWNER FINDINGS

Owner-observed direct use includes:

- sliders and exact numeric editing;
- live manipulation while simulation runs;
- per-parameter reset;
- Reset World;
- Debug;
- experiment switching;
- one parameter-slot capture.

Current substrate also has:

- focus isolation between Inspector editing and world input;
- permissive soft ranges + wide numerical safety rails;
- explicit `EXTREME` and `SAFETY RAIL` truth;
- authored vs derived/live values;
- A/B parameter slots;
- exact provenance;
- source-tree and emitted-artifact browser qualification.

A/B capture/application is now **OWNER-USED** in the first Ecology recording, but comparison usefulness remains **UNPROVEN** because the recording ends before a clean interpreted A↔B loop is established.

### B0 Load / Envelope — POSITIVE OWNER SIGNAL / STAGE CLOSED

The Owner explicitly judged the direction positively and spontaneously explored non-correlated phenotypes, including small/heavy/high-force and giant/heavy/high-force configurations.

Narrowly supported principle:

> **Spatial envelope, inertial burden/load and locomotor authority should remain separable research dimensions unless later evidence justifies correlating them.**

Still unqualified:

- final body model;
- final mass units;
- final load/equipment model;
- final locomotor-force law;
- braking / max-speed coupling;
- traction;
- stance;
- rotational inertia;
- humanoid collider geometry;
- armour restrictions;
- combat consequences.

## 4. Current B0 closure evidence

Final Owner-feedback-driven implementation introduced:

- widened B0 numerical rails:
  - envelope `0.05 .. 12`;
  - intrinsic body mass `0.01 .. 200`;
  - carried load `0 .. 200`;
  - locomotor force `0.01 .. 100`;
- Owner-entered force `42` is legal;
- committed numeric fields always display the value actually applied;
- real rail contact is explicitly labelled `SAFETY RAIL`;
- shorter Inspector copy;
- research experiments separated from internal diagnostics.

Closure implementation evidence:

- **31 / 31 automated checks PASS**;
- live Chromium gate PASS;
- normal / Owner-derived extreme / 1280×800 screenshots inspected;
- emitted Pages gate PASS;
- real public Opera verification PASS.

Exact Owner-verified closure specimen before repository canonicalization:

- `2eb9a878eb4fa9c406ca0e90abcab33cb186332a`.

Exact docs/closure checkpoint before repository cleanup:

- `a7c629e6e62c61969652327416bbc19a01793a4f`.

## 5. Historical combat evidence — boundaries

No accepted Feniks combat model exists.

Important historical outcomes remain evidence/donors:

- R0 authored arc vs sampled sweep — **FAILED AS COMBAT EXPERIMENT**;
- R1 small combat organism — **OWNER FEEL FAIL**;
- LIVE / BOUNDED / CAPTURED control spike — **REJECTED AS NON-DISCRIMINATING**;
- Combat Terrarium / Ruined Gate — **OWNER FAIL**, bounded material-contact donors retained;
- Phenotype Combat Ecology — mechanism donor only;
- O1 HOLD/BREAK — whole-organism FAIL, shield/support donors retained;
- O2 REACH/THREAT — whole-organism FAIL, reach/clearance donors retained;
- Adversarial Combat Organism v1 — whole-organism FAIL, screening/first-solid donors retained;
- LINE / IMPULSE — whole-organism FAIL, projectile/impulse donors retained;
- E0 / E0b — reusable grammar FAIL, ACCESS/DRIVE/SET donors retained;
- Continuous Readiness R0 — causal-kernel qualified;
- Readiness Under Pressure R1 / Follow-Through R2 — failed to convert local persistence into meaningful decision persistence;
- Relational Manifold R3 — joint-afterstate causal-kernel qualified;
- R3 Owner contact — first positive human signal, but literal sword-physics fit for Feniks remains unproven;
- S0 BODY / WORLD — positive direction signal;
- B0 — positive embodiment-decomposition signal.

See [Historical evidence index](HISTORY_INDEX.md).

## 6. Repository / deployment truth

The completed cleanup campaign temporarily reduced repository topology to `main` only after ancestry verification of all stale refs.

Current **research topology** intentionally contains:

- `main` — canonical truth / governance;
- `experiment/active-spatial-ecology` — one temporary active experiment lane.

A separate infrastructure-only ref may be present:

- `rehearsal/current` — exact public-rehearsal / rollback control plane; never an authoring lane and never research authority.

Do not count `rehearsal/current` as a third research branch. Its only legitimate motion is an explicit move to an already-selected exact candidate or intended rollback source.

The active lane was opened from green canonical main:

- base: `4b44a001be679cb987c8470ce208d3b503d698a9`;
- internally qualified runtime checkpoint: `d55b3b093325452e6dc730f314c886a2cbc85229`;
- exact qualified public-rehearsal candidate: `ce96587826746efad426347a8a394048810e4ee2`.

Do not use a moving branch HEAD as rehearsal provenance. Docs-only branch commits may advance independently; public rehearsal must name an exact SHA.

Other repository truth remains:

- all six old stale experiment/refoundation refs remain deleted;
- unique historical lineages remain reachable from `main` through canonical Git ancestry;
- old "active/current/next" language in historical documents is explicitly marked non-authoritative;
- the former append-only state is preserved in `docs/archive/`;
- permanent workflows are only `check.yml` and `pages.yml`;
- deployments are exact-SHA and browser-qualified;
- Pages deployment requires explicit `[deploy]` from checked `main`, a successful checked `rehearsal/current` move to an exact candidate, or manual workflow dispatch of an exact source ref;
- ordinary `experiment/*` pushes never deploy;
- the **current public artifact is the ecology rehearsal candidate `ce96587826746efad426347a8a394048810e4ee2` via `rehearsal/current`**; ordinary root still defaults to B0, while the direct ecology query opens the rehearsal specimen;
- repository closure evidence is recorded in `REPOSITORY_CLOSURE_AUDIT_2026-09-26.md`.

## 7. Current objective / next move

The first public Active Spatial Ecology Owner rehearsal is complete.

Primary evidence record:

- [First Ecology Owner recording deep feedback](ACTIVE_SPATIAL_ECOLOGY_FIRST_OWNER_RECORDING_FEEDBACK_2026-09-26.md)

Direct Owner truth:

- camera interaction is inadequate; mouse-wheel zoom and a wider/easier usable range are required;
- bodies block one another too strongly and produce too many stupid jams;
- organisms are too simple;
- Debug is not ambitious enough;
- the Lab's current information architecture/naming/orientation are poor and unpleasant to use;
- repeated `Spawn +50` presses were needed to reach obvious lag;
- substantial parts of the Lab now need fundamental / architectural redesign and professional hardening;
- despite those failures, the Lab **is beginning to fulfill its intended role**.

Recording-derived findings:

- the stress horde was mostly homogeneous default residents while the Owner aggressively modified the player;
- resident steering is unaware of dynamic bodies and has no stuck/replan semantics;
- only 12 global goals drive the whole population;
- deterministic ID-based goal stepping creates short route cycles, including a 1-goal cycle for 1/12 of actor-ID residues;
- local jam morphology appears well before the final horde and resembles driven granular packing;
- Debug's global goal-line overlay rapidly becomes unreadable and does not display the actual local steering choice;
- the current global occupied-area metric hides severe local congestion;
- current body/static contact counters measure repeated resolver work, not unique behavioral contact events;
- the O(N²) pair phase reaches ~357,435 pair checks per fixed step at 845 residents + player (~42.9M/s at 120 Hz);
- first visible stress appears only after repeated escalation into the hundreds, with Debug OFF at onset;
- current vertical Inspector is already difficult to navigate with only nine numeric controls plus actions/A-B/telemetry;
- spawn-template labels leak flat machine scope into every human label;
- spawned-cohort provenance is effectively invisible after creation;
- A/B is now Owner-used, but its summary/scope are too opaque for trustworthy comparison;
- optional linked phenotype scaling gains real authoring-friction evidence, but must remain visible/reversible rather than becoming a hidden law.

Research classification:

> **TARGET HYPOTHESIS INCONCLUSIVE — APPARATUS LIMITATIONS BECAME THE DOMINANT FINDING.**

Do not interpret the rehearsal as either a positive or negative verdict on embodied multi-actor spatial ecology itself.

### Campaign boundary

The current campaign remains **feedback extraction only**.

Do not patch or redesign the runtime yet.

The next campaign, only after this evidence pass is deliberately closed, should challenge from first principles:

- shared Lab / Workbench architecture;
- organism / locomotion / navigation substrate;
- body-contact semantics;
- observability / Debug architecture;
- scaling infrastructure and donor opportunities.

Do not jump directly to stance, equipment, weapons, combat AI, production pathfinding or crowd algorithms.

Public/repository provenance remains:

- public candidate: `ce96587826746efad426347a8a394048810e4ee2`;
- public control ref: `rehearsal/current`;
- canonical truth: `main`.

The current public specimen may remain available as the exact evidence source while analysis continues.
