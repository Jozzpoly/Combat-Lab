# Combat Lab — Current Research State

**Canonical status date:** 2026-09-26  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; first Active Spatial Ecology Owner rehearsal + feedback/evidence campaign CLOSED; target hypothesis INCONCLUSIVE; refoundation/research campaign ACTIVE; L0 provenance + L1 scoped comparison + N0 whole-body static feasibility MECHANICALLY QUALIFIED; Owner UX / routing / movement competence UNQUALIFIED**

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

**L0 — intervention provenance: MECHANICALLY QUALIFIED · OWNER UX UNQUALIFIED**

Exact qualified checkpoint:

- `7cf8060953daf558ddf4f58931183a34543c1641`;
- CI run `36293139713`;
- **40 / 40 automated checks PASS**;
- live Chromium Workbench gate PASS;
- 29 ordered interventions reconstructed during the existing B0 exercise;
- covered operations include exact numeric edits, requested-vs-applied safety-rail truth, comparison capture/apply, Reset World, Restore Defaults, per-parameter reset, Debug, Pause and B0↔S0 switching;
- normal movement input remains outside the intervention ledger;
- no per-frame world snapshotting or replay system was introduced.

L0 proves only that the Lab can preserve lightweight structured intervention provenance without changing the existing B0/S0 behavioral contract. It does **not** prove that the history is yet easy or useful for the Owner to inspect.

**L1 — scoped comparison: MECHANICALLY QUALIFIED · OWNER UX UNQUALIFIED**

Exact qualified checkpoint:

- `c13c83389f68481fe586a7b613429887314b7235`;
- CI run `36293705172`;
- **44 / 44 automated checks PASS**;
- live Chromium Workbench gate PASS;
- B0 declares exactly four `specimen/player` fields instead of inheriting every editable numeric field;
- S0 declares its own one-field body-scale comparison contract;
- slot summaries expose comparison identity, semantic scope and field count;
- A↔B differences are visible before Apply; the browser gate explicitly recovered `Carried load mass 0.00 → 4.00`;
- Apply semantics explicitly say current World state remains live and Reset World is separate when a matched start matters;
- L0 provenance stores the scoped comparison snapshot itself, so later evidence does not need to infer what Capture meant.

L1 does **not** qualify the two-slot UI, comparison usefulness, checkpoint/replay semantics or Owner-facing workflow quality.

**N0 — whole-body static feasibility + on-demand observation query: MECHANICALLY QUALIFIED · ROUTING / MOVEMENT COMPETENCE / OWNER UX UNQUALIFIED**

Exact qualified checkpoint:

- `2f99520fa586f58bd6d79997ada7f69967c55635`;
- CI run `36294227944`;
- **53 / 53 automated checks PASS**;
- live Chromium Workbench gate PASS;
- direct swept-body traversal distinguishes a legal endpoint from a blocked path;
- the same 54-unit B0 choke is hard-clear for a small/baseline body and hard-blocked for envelope 1.70;
- hard body feasibility remains separate from +10 desired/comfort clearance;
- first static blocker and world boundary are explicit;
- exact side/corner tangency remains legal while true penetration blocks;
- the query is observational, ignores dynamic actors by construction and does not mutate caller geometry;
- `runtime.query(...)` executes experiment-owned observation only on demand; no per-frame global probe was introduced.

Important negative evidence:

- first green N0 checkpoint `5236f39a917093803438ba7c2c182e94663b2308` used an expanded-AABB approximation that could falsely block rounded rectangle corners;
- post-PASS audit rejected that geometry despite green CI;
- `2f99520...` replaced it with side-strip + corner-circle swept geometry and added explicit corner/tangency regressions.

N0 qualifies a static geometric/query mechanism only. It does not qualify a route planner, dynamic avoidance, stuck detection, replanning, actor competence or contact behavior.

### Immediate next research boundary

Do **not** jump directly from “direct path blocked” to a sophisticated pathfinder or N1 behavior policy.

The next question is a bounded **static alternative-feasibility audit**:

- what is the smallest body-aware substrate that can answer whether a hard-feasible alternative around static geometry exists;
- can that substrate remain a query/witness rather than silently becoming actor behavior;
- can hard connectivity remain separate from comfort/preference;
- can the result be explained through the same on-demand observation seam;
- does Companion's deterministic corner/visibility graph provide useful bounded infrastructure, or does it import more route policy than Combat Lab currently needs.

Only after that question is answered should N1 add persistent no-progress detection and choose whether/when an actor consumes an alternative route.

### Active invariant

> **Preserve the experimental freedom that made Combat Lab useful; refound state, causality and organism competence so the apparatus reveals the phenomenon instead of becoming it.**
