# Combat Lab — Current Research State

**Canonical status date:** 2026-09-26  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; first Active Spatial Ecology Owner rehearsal + feedback/evidence campaign CLOSED; target hypothesis INCONCLUSIVE; refoundation campaign NOT YET STARTED**

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
- public provenance files currently report: `COMMIT.txt = ce96587826746efad426347a8a394048810e4ee2`; `BRANCH.txt = rehearsal/current`;
- direct public Ecology rehearsal selector remains `?experiment=active-spatial-ecology-v0`;
- repository closure evidence is recorded in `REPOSITORY_CLOSURE_AUDIT_2026-09-26.md`.

## 7. Current objective / next move

The first public Active Spatial Ecology Owner rehearsal and the dedicated feedback/evidence-extraction campaign are now **CLOSED**.

Durable closure / transition record:

- [Combat Lab handoff after first Ecology feedback campaign](COMBAT_LAB_HANDOFF_2026-09-26_ECOLOGY_FEEDBACK_CLOSURE.md)

Primary campaign evidence:

- [First Ecology Owner recording deep feedback](ACTIVE_SPATIAL_ECOLOGY_FIRST_OWNER_RECORDING_FEEDBACK_2026-09-26.md)
- [First rehearsal implicit requirements mining](COMBAT_LAB_FIRST_REHEARSAL_IMPLICIT_REQUIREMENTS_2026-09-26.md)

Canonical classification remains:

> **TARGET HYPOTHESIS INCONCLUSIVE — APPARATUS LIMITATIONS BECAME THE DOMINANT FINDING.**

Owner/product truth after the rehearsal:

- Combat Lab as a permissive self-directed research environment has a **positive Owner signal**;
- current Lab UX / information architecture has **material FAIL-level findings**;
- current resident sophistication and ordinary crowd/contact behavior are **not adequate for promotion**;
- current Debug/observability is **not adequate for crowd-scale explanation**;
- current performance result is a whole-runtime/harness result, not a clean actor-capacity claim;
- the current Ecology specimen remains an evidence source, not a foundation to polish into permanence.

Key campaign-1 findings now preserved include:

- live intervention, exact numeric entry and broad/extreme ranges are durable Owner workflow;
- independent envelope / inertial burden / locomotor authority remain valuable raw research axes;
- optional linkage may be useful only as explicit/reversible convenience;
- current single vertical schema-form has crossed its scalability boundary;
- current flat editable-ID state model is insufficient for scoped comparison/provenance;
- exact final Owner comparison action was **Capture B → Apply A** inside the live 845-resident world, directly exposing comparison-scope/matched-state problems;
- resident movement lacks dynamic-body awareness, stuck-state memory and replanning;
- current route/stimulus harness contains strong hidden convergence biases, including a universal goal-10 hub;
- near-player spawning and fallback zones can author local pressure;
- current one-pass sequential body solver plus persistent intent produces stable packed states;
- current performance knee includes O(N²) pair work, synchronous spawn placement, rendering and high-frequency evidence snapshots;
- observation/evidence machinery itself can materially contribute to runtime cost;
- first campaign found enough independent failure classes that further recording mining now has diminishing return relative to a new refoundation/research campaign.

### Transition boundary

Do **not** patch or redesign the runtime in the closed campaign.

The next conversation should begin a separate, critical refoundation/research campaign.

It should first:

1. recover fresh live repo truth;
2. read the closure handoff and campaign evidence records;
3. challenge shared Lab / Workbench architecture from first principles;
4. separate shared Lab needs from Ecology-specific organism/contact/navigation debt;
5. recover targeted Feniks / ReflexBrain / Companion / SPC donor evidence only when concrete dependencies justify it;
6. formulate a bounded refoundation/research strategy before implementation.

Do not jump directly to:

- weapons;
- stance;
- damage/combat AI;
- ORCA/RVO;
- Rapier;
- production pathfinding;
- old-solver optimization;
- superficial Inspector/CSS polish.

Public/repository provenance remains:

- public Ecology evidence candidate: `ce96587826746efad426347a8a394048810e4ee2`;
- public control ref: `rehearsal/current`;
- active historical experiment lane: `experiment/active-spatial-ecology`;
- canonical truth: `main`.

The public specimen should remain available as the exact evidence source until a later deliberate deployment changes it.

### Transition invariant

> **Preserve the experimental freedom that finally made Combat Lab useful, but refound the apparatus and organism from evidence rather than polishing the current specimen into a false foundation.**
