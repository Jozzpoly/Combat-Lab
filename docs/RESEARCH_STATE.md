# Combat Lab — Current Research State

**Canonical status date:** 2026-09-26  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; post-closure preparation / frontier-shaping campaign ACTIVE; no new specimen selected**

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

Repository cleanup result:

- `main` is the **only remaining branch ref**;
- all six stale experiment/refoundation refs were removed only after ancestry verification;
- unique historical lineages remain reachable from `main` through canonical Git ancestry;
- old "active/current/next" language in historical documents is explicitly marked non-authoritative;
- the former append-only state is preserved in `docs/archive/`;
- permanent workflows are only `check.yml` and `pages.yml`;
- deployments are exact-SHA and browser-qualified;
- Pages deployment from CI requires explicit `[deploy]` or manual workflow dispatch;
- repository closure evidence is recorded in `REPOSITORY_CLOSURE_AUDIT_2026-09-26.md`.

## 7. Current objective / next move

There is still no preselected R4, weapon family or body-system continuation.

The immediate objective is to **finish the post-closure cleanup, authority synchronization and preparation campaign** before opening another specimen.

That preparation must leave:

- one coherent canonical truth;
- no durable document silently acting on superseded execution instructions;
- repository / branch / deploy hygiene guarded by tests;
- the public B0 closure provenance intact;
- the new Owner direction above preserved without prematurely implementing it.

After this preparation closes:

> **NEXT RESEARCH DIRECTION — OPEN FOR DELIBERATE FRONTIER SELECTION.**

Optional linked scaling, larger-world pressure and cross-project donor recovery are now legitimate frontier-shaping inputs. None of them is automatically the next build merely because it is recorded here.
