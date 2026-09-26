# Combat Lab — Current Research State

**Canonical status date:** 2026-09-26  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; Active Embodied Spatial Ecology v0 PUBLIC REHEARSAL LIVE / TRANSLATION PASS — OWNER VALUE UNPROVEN**

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

### Workbench — QUALIFIED FOR CURRENT RESEARCH USE

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

A/B **human usefulness remains UNPROVEN** because the Owner recording did not contain a complete A↔B comparison loop.

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

Active Embodied Spatial Ecology v0 has crossed both:

- the **internal apparatus/mechanism gate**; and
- the **public translation/provenance gate**.

Exact evidence records:

- [Active Spatial Ecology Internal Qualification](ACTIVE_SPATIAL_ECOLOGY_INTERNAL_QUALIFICATION_2026-09-26.md)
- exact internal runtime checkpoint: `d55b3b093325452e6dc730f314c886a2cbc85229`;
- exact public rehearsal candidate: `ce96587826746efad426347a8a394048810e4ee2`.

### Public rehearsal deployment — PASS

Deployment control:

- `rehearsal/current` points exactly to `ce96587826746efad426347a8a394048810e4ee2`;
- candidate rehearsal check run `36239476177` — **SUCCESS**;
- Pages run `36239513452` — emitted-artifact build qualification **SUCCESS**, deploy **SUCCESS**;
- workflow log proves checkout source `ce96587826746efad426347a8a394048810e4ee2` and label `rehearsal/current`.

External public-origin verification:

- `COMMIT.txt` = `ce96587826746efad426347a8a394048810e4ee2`;
- `BRANCH.txt` = `rehearsal/current`;
- direct URL `?experiment=active-spatial-ecology-v0` renders **Active Embodied Spatial Ecology v0**;
- ordinary public root still renders **Load / Envelope Field B0** by default.

This means the ecology specimen is publicly reachable without changing the ordinary root's default experiment.

### Current machine-qualified evidence

- original internal runtime qualification: **51 / 51 automated tests PASS**;
- final rehearsal candidate: **52 / 52 automated tests PASS**;
- real Chromium Workbench gate PASS;
- emitted Pages artifact browser gate PASS;
- mixed spawn waves preserve independently authored phenotypes;
- browser rehearsal reached **56 active residents with 0 spawn failures** and sampled ~**626 body contacts/s**;
- a separate mechanistic probe exceeded **100 active residents** while remaining finite;
- impossible giant-horde requests report legal-placement saturation rather than silently mutating the requested phenotype;
- zero → baseline → dense/horde population states are directly controllable;
- explicit `Force +10` can ignore dynamic-body spawn clearance while still respecting static world legality;
- forced main-thread stall surfaces `SIM STRESS` and dropped wall time rather than silently presenting slowdown as body behavior;
- visual red-team caught and repaired the initial off-camera spawn-pressure failure.

These claims qualify only apparatus/mechanistic/deployment facts.

Still **UNPROVEN until Owner play**:

- whether embodied differences remain decision-relevant under active spatial pressure;
- whether sparse / crowd / horde regimes produce qualitatively different useful behavior;
- whether pushing/yielding is readable, interesting or enjoyable;
- whether the current resident intent is adequate or dominates the phenomenon;
- whether `Force +10` reveals useful break-pressure or merely solver pathology;
- whether linked phenotype scaling is actually needed in practice;
- whether any of this belongs in Feniks;
- whether current collision, movement, camera or navigation laws deserve promotion.

Current next move:

> **early raw Owner observation on the already-live public ecology rehearsal.**

Direct rehearsal URL:

- `https://jozzpoly.github.io/Combat-Lab/?experiment=active-spatial-ecology-v0`

Do not add stance, equipment, weapons, crowd algorithms, navigation sophistication or further tuning before Owner evidence unless a concrete public-runtime defect appears.

Rollback source remains the canonical B0-equivalent runtime on `main`; moving `rehearsal/current` back to canonical `main` re-runs normal CI and restores the ordinary public specimen through the same exact-source deployment path.

Optional linked scaling remains an enabling Workbench candidate; current multi-phenotype authoring is now the first real context in which its friction can be observed rather than assumed.
