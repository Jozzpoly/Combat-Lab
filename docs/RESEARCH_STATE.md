# Combat Lab — Current Research State

**Canonical status date:** 2026-09-27  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; first Active Spatial Ecology Owner rehearsal + feedback/evidence campaign CLOSED; target hypothesis INCONCLUSIVE; refoundation mechanics L0/L1 + N0/N0b + N1 + C0 + P0 + D0 + bounded E1 INTEGRATION MECHANICALLY QUALIFIED; OWNER REHEARSAL READINESS ACTIVE / UNQUALIFIED**

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
- targeted donor recovery from **Feniks, ReflexBrain, Companion and SPC** is question-driven rather than scheduled wholesale; the first concrete movement/feasibility need has already recovered bounded Companion whole-body feasibility evidence, while other donors remain unselected until a live dependency justifies them;
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
- `experiment/active-spatial-ecology` — closed Ecology execution/evidence lane retained temporarily because its unique lineage and exact public specimen still matter; not current execution authority.

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

The first Ecology recording/feedback campaign remains **CLOSED**.

The separate **Combat Lab refoundation/research campaign is now ACTIVE**. Runtime refoundation now contains bounded shared-apparatus L0/L1 plus the first Ecology-adjacent N0 static-feasibility query; organism policy, routing/replanning and contact semantics remain unimplemented.

Primary active strategy:

- [Refoundation research campaign](COMBAT_LAB_REFOUNDATION_RESEARCH_CAMPAIGN_2026-09-26.md)

Closed-campaign evidence remains authoritative input:

- [Combat Lab handoff after first Ecology feedback campaign](COMBAT_LAB_HANDOFF_2026-09-26_ECOLOGY_FEEDBACK_CLOSURE.md)
- [First Ecology Owner recording deep feedback](ACTIVE_SPATIAL_ECOLOGY_FIRST_OWNER_RECORDING_FEEDBACK_2026-09-26.md)
- [First rehearsal implicit requirements mining](COMBAT_LAB_FIRST_REHEARSAL_IMPLICIT_REQUIREMENTS_2026-09-26.md)

Canonical Ecology classification remains:

> **TARGET HYPOTHESIS INCONCLUSIVE — APPARATUS LIMITATIONS BECAME THE DOMINANT FINDING.**

### Active refoundation boundary

The campaign now treats two problem families separately:

**Shared Lab / apparatus**

- intervention provenance and scope;
- comparison semantics rather than capture-all state;
- scalable information architecture;
- query-driven / cost-aware observability;
- truthful clock/performance attribution;
- exact build/deployment provenance;
- continued permissive extreme/break testing.

**Ecology / multi-body substrate**

- intent/stimulus;
- whole-body feasibility/navigation;
- minimal progress/stuck competence;
- immediate motion choice;
- contact/yield/displacement semantics;
- local pressure and scaling.

The current shell's flat numeric parameter contract, global A/B and binary Debug are historical donors, not refoundation authority.

Targeted donor recovery has already identified Companion whole-body static feasibility and hard-feasibility-vs-comfort separation as strong bounded donors. SPC contributes competence/world-authority boundaries; ReflexBrain is not currently selected as a movement donor. No donor architecture or physics backend is promoted wholesale.

### Current refoundation evidence

The full qualification/falsification history lives in the refoundation campaign document. Canonical live truth is:

| Cell | Status | Narrow result |
| --- | --- | --- |
| **L0 provenance** | MECHANICALLY QUALIFIED | Structured live interventions retain scope, before/after/requested truth and timing identity without per-frame world event sourcing. |
| **L1 comparison** | MECHANICALLY QUALIFIED | Experiments declare comparison scope; A/B no longer means every editable numeric field; Apply vs matched Reset World is explicit. |
| **N0 direct feasibility** | MECHANICALLY QUALIFIED | Exact swept whole-body static traversal, first blocker and hard-vs-comfort truth are queryable on demand. |
| **N0b alternative witness** | MECHANICALLY QUALIFIED | A bounded graph may return physically verified static route witnesses; `none-found` is explicitly not an unreachable proof. |
| **N1 static-obstruction recovery** | MECHANICALLY QUALIFIED | One actor can detect persistent no-progress, preserve trigger evidence and consume one verified witness without continuous apparatus steering. |
| **C0 contact candidate** | MECHANICALLY QUALIFIED | One explicit law family produces hold/yield/displacement with visible `contactMobility = 1/(mass × resistance)` and bounded pair-order artifact. |
| **P0 scaling attribution** | MECHANICALLY QUALIFIED | Wall/sim fidelity, render cadence, simulation/render/observation phases, query/intervention cost and exact contact work are separable. |
| **D0 dynamic encounter** | MECHANICALLY QUALIFIED | Persistent dynamic no-progress can trigger an explicit local passing-side decision; perfect symmetry with no convention remains an honest hold. |

Latest exact qualified checkpoints:

- L0 `7cf8060953da...`;
- L1 `c13c83389f68...`;
- N0 `2f99520fa586...`;
- N0b `86bf323104fa...`;
- N1 `f54cd64e08bb...`;
- C0 `5ea8931c9e36...`;
- P0 `71ada13dd175...`, CI `36309076545`, **92 / 92 PASS** + live Chromium PASS;
- D0 `7bac0fc84bd1...`, CI `36309731062`, **102 / 102 PASS** + live Chromium PASS.

Important P0 evidence: sparse contact work reconciles exactly with the current naïve all-pairs law (`12 → 66 pairs/iteration → 330 checks/5 steps`; `24 → 276 → 1380`), dense work reports contact resolutions separately, forced wall-time loss is explicit, rolling metrics are bounded, and O(1) run totals preserve discarded-time evidence after it leaves the rolling window. Browser timing remains environment-specific evidence, not a portable benchmark.

### E1 bounded integration — MECHANICALLY QUALIFIED / OWNER-FACING REHEARSAL UNQUALIFIED

Exact qualified checkpoint:

- `88a7ffe13d54e7eb3b25346fc9d4113b723733c2`;
- CI run `36311419931`;
- **Node suite PASS**;
- live Chromium Workbench regression PASS;
- browser-only E1 integrated probe PASS without exposing E1 in the Owner experiment selector.

Narrow integrated evidence:

- explicit non-hub distributed counterflow topology with unique destinations;
- heterogeneous radius / mass / motor authority / contact resistance;
- N1-style static recovery and D0-style dynamic encounters both occur;
- final step truth has **zero static overlap violations** and **zero dynamic overlap violations**;
- LEFT passing convention materially reduces remaining distance versus NONE in the exact bounded cell;
- NONE history preserves explicit no-convention encounter evidence;
- causal trigger signatures remain stable under forward vs reverse pair iteration;
- pair-order position drift exists, but does not select different static/dynamic policy branches in the qualified cell;
- static↔dynamic constraint composition required a coupled alternating solve;
- shared N0 tangency tolerance was hardened after E1 exposed contradictory near-tangent truth.

Critical scaling boundary:

- the 8-body browser probe reached `maxCoupledPassesUsed = 21 / 24`;
- browser sample performed roughly `174,496` pair checks and `15,540` contact resolutions across the 10 s trial;
- this is **not** acceptable evidence for crowd-scale efficiency or a production solver;
- P0 must remain active when population grows.

E1 therefore qualifies only this proposition:

> **The currently qualified static-feasibility, static-recovery, candidate-contact and dynamic-encounter mechanisms can coexist in one bounded multi-actor cell without the old known harness hub, static/dynamic truth contradiction or hidden global passing coordinator.**

It does **not** qualify:

- crowd/horde behavior;
- production pathfinding/physics;
- Feniks contact law;
- final passing-side semantics;
- high-population scaling;
- Owner-facing Lab UX;
- second Owner rehearsal readiness.

### Active campaign: second Owner rehearsal readiness

Do **not** expose E1 as the next Owner specimen yet.

The first rehearsal proved that apparatus failure can dominate the intended phenomenon. The next work now shifts from mechanics to the material Owner FAILs that remain unresolved:

1. **Camera / spatial inspection**
   - mouse-wheel zoom is a direct Owner requirement;
   - materially broader/easier zoom range is a direct Owner requirement;
   - free-pan / decoupled research camera remains a strong candidate, not yet frozen.

2. **Population / pressure authoring**
   - preserve direct sparse→horde→break exploration;
   - eliminate repetitive `Spawn +50` as the only practical stress-search path;
   - preserve explicit extreme/break regimes rather than hidden caps, despawns or protection.

3. **Causal Debug / subject inspection**
   - replace global line-web Debug as the primary explanation mechanism;
   - build from the already-qualified on-demand causal query model;
   - make it possible to answer why a chosen actor is stopped / what it wants / what blocks it / how long / what decision it made;
   - selection/inspection mechanism is still a design question.

4. **Workbench information architecture**
   - current long vertical generic form already failed Owner usability at ~9 numeric parameters;
   - machine identity, semantic scope and local human label must remain separate;
   - state compression and contextual grouping should replace repeated scrolling;
   - do not prematurely freeze tabs/docks/multi-window as the answer.

5. **Rehearsal provenance**
   - exact deployed public specimen/build identity remains a hard gate.

The next campaign must produce a **rehearsal candidate**, not merely a prettier Inspector. The readiness gate is whether the Owner can freely provoke, inspect, understand and break the integrated phenomenon without the apparatus becoming the dominant finding again.

### Active invariant

> **Preserve the experimental freedom that made Combat Lab useful; refound state, causality and organism competence so the apparatus reveals the phenomenon instead of becoming it.**
