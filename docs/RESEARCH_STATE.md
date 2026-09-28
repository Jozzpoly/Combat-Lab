# Combat Lab — Current Research State

**Canonical status date:** 2026-09-27  
**Authority:** current live truth; supersedes older "active/current/next" wording inside historical campaign documents  
**Canonical branch:** `main` after repository canonicalization  
**Stage:** **Workbench + B0 CLOSED; first Ecology feedback campaign CLOSED; bounded E1 MECHANICALLY QUALIFIED; R0 DEPLOYED; SECOND OWNER REHEARSAL FEEDBACK CAMPAIGN CLOSED AT EVIDENCE SATURATION; CROWD-LIKE OWNER SIGNAL POSITIVE; M1 STATIC LOCOMOTION MECHANICALLY QUALIFIED; R1 ROUTE EXECUTION / RECOVERY RESEARCH ACTIVE; R1-0 AUTHORITY AUDIT NEXT**

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
- the **current deployed Pages artifact is frozen R0 `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd` via `rehearsal/current`**;
- source check `36318084351` on the moved rehearsal ref — SUCCESS;
- Pages build/deploy `36318131633` — SUCCESS;
- emitted artifact `10931422584` contains `COMMIT.txt = 9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd` and `BRANCH.txt = rehearsal/current`, and was browser-qualified before upload;
- ordinary root still defaults to B0;
- direct current rehearsal selector is `?experiment=integrated-ecology-rehearsal-r0`;
- independent external fetch from this agent runtime was unavailable after deployment (GitHub Pages inaccessible to built-in web and Opera Connector disconnected), so the fresh Owner open is also the remaining external surface verification;
- the first Ecology specimen remains preserved as historical Git evidence at `experiment/active-spatial-ecology = ce96587826746efad426347a8a394048810e4ee2`; it is not the current Pages artifact;
- repository closure evidence is recorded in `REPOSITORY_CLOSURE_AUDIT_2026-09-26.md`.

## 7. Current objective / next move

The first Ecology recording/feedback campaign remains **CLOSED**.

Canonical classification remains:

> **TARGET HYPOTHESIS INCONCLUSIVE — APPARATUS LIMITATIONS BECAME THE DOMINANT FINDING.**

The mechanics refoundation has now reached a bounded integration checkpoint:

- L0/L1 apparatus truth is mechanically qualified;
- N0/N0b static feasibility and verified alternative witnesses are mechanically qualified;
- N1 static-obstruction recovery is mechanically qualified;
- C0 candidate contact semantics are mechanically qualified, not selected Feniks physics;
- P0 performance/scaling attribution is mechanically qualified;
- D0 dynamic encounter competence is mechanically qualified;
- E1 bounded 8-body integration is mechanically qualified at `88a7ffe13d54e7eb3b25346fc9d4113b723733c2`, CI `36311419931`.

E1 remains deliberately narrow. It does not qualify crowd-scale efficiency, production pathfinding/physics, final contact law, final passing semantics or Owner experience. Its 8-body browser probe reached `21 / 24` coupled passes and ~`174,496` pair checks over 10 s; P0 remains mandatory when scale rises.

### R0 second-rehearsal candidate — INTERNALLY QUALIFIED / OWNER EXPERIENCE UNQUALIFIED

Exact frozen runtime candidate:

- `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`;
- source CI `36317682590` — **SUCCESS**;
- Node suite PASS;
- live Chromium Workbench gate PASS;
- source screenshot artifact PASS;
- direct startup route `?experiment=integrated-ecology-rehearsal-r0` browser-qualified.

R0 addresses the material apparatus findings from the first Owner recording without changing the qualified E1 mechanics:

- **camera:** real mouse-wheel zoom under cursor, explicit wide `0.12× … 8×` rails, Fit, middle-drag pan;
- **information architecture:** persistent **Tune / Observe / Compare / Session** contexts replace one long generic Inspector;
- **pressure authoring:** exact **Population on reset** replaces repeated `Spawn +50`; current population and next-reset population remain distinct until explicit Reset World;
- **breakability:** population soft range is convenience only; explicit numerical rail remains high and no hidden despawn/ghosting/protective cap is introduced;
- **causal observation:** clicking one resident selects it and opens Observe with **Why now / Purpose / Immediate plan / Blocked by / No progress / Last decision** plus embodied dimensions;
- **debug scope:** selected-subject route/intent/contact evidence replaces global target-line webs as the primary explanation surface;
- **comparison truth:** population is intentionally excluded from A/B because changing count also rebuilds distributed topology; shared passing convention remains scoped comparison state;
- **provenance:** the exact R0 direct URL is qualified before deployment.

Important boundary:

> **R0 is internally qualified as an exact public rehearsal candidate, not as a good Owner experience. Only a new Owner rehearsal can qualify usability, readability, explanatory value, feel or research usefulness.**

### Immediate next move

The second Owner recording feedback/evidence campaign is now **CLOSED AT EVIDENCE SATURATION**.

Do not modify frozen R0 merely because the recording produced plausible feature ideas or because analysis-only counterfactuals produced promising candidates.

Current high-value findings:

- Owner reports that the experiment now begins to imitate a crowd;
- Owner also observes balls that become stuck / appear to “die”;
- every final residual in the physically valid 4–20 sweep belongs to the same stale-ROUTE / zero-fraction static-contact family;
- exact reconstruction maps all three filmed clean-18 residuals to that mechanism;
- static locomotion currently discards viable tangent motion at wall contact;
- route witness authority becomes invalid after crowd displacement, but immediate route re-query causes severe replan thrashing;
- analysis-only wall sliding fixes the complete clean 4–20 sweep but does not restore route execution truth;
- analysis-only stale-route -> DIRECT -> bounded N1 recovery helps but cannot fix every valid case without wall sliding;
- composing those two candidates yields a clean 4–20 sweep with bounded replan counts, but is **not yet a selected implementation**;
- pure straight/open counterflow still requires explicit local dynamic negotiation: NONE remains a material head-on gridlock while LEFT/RIGHT resolve it;
- `ARRIVED` is a sticky mode and becomes heavily displaced above the clean packing floor, but retiring completed bodies does not fix the clean residual family;
- current distributed start/target topology is collision-free only through population **20**;
- population is a scenario generator rather than a clean monotonic pressure scalar;
- 64 and 256 remain contaminated by invalid packing, solver/capacity pressure and at 256 sustained correctness failure;
- exact population authoring is a clear apparatus improvement;
- selected-subject causal Observe / camera feel / Compare remain Owner-unqualified because they were not materially exercised.

Canonical active evidence record:

- `docs/ACTIVE_SECOND_OWNER_REHEARSAL_RECORDING_FEEDBACK_2026-09-27.md`.

The recording/frozen-R0 extraction campaign is now **closed at evidence saturation**.

Do not continue generating broad R0 counterfactuals by inertia.

M1 constraint-aware static locomotion is now **MECHANICALLY QUALIFIED / NOT INTEGRATED**.

Exact checkpoint:

- `f4d92076fb88f2b538b309a56deffdc51eeeda94`;
- CI `36356102263` — SUCCESS;
- A–H mechanical falsifiers PASS;
- exact three filmed wall-death anchors PASS;
- S2 was not opened because the one-contact residual-slide candidate passed the required corner gate.

M1 remains an isolated research foundation; frozen R0 is unchanged.

R1 embodied route execution / recovery research is now **ACTIVE DESIGN**.

Canonical records:

- M1: `docs/M1_CONSTRAINT_AWARE_STATIC_LOCOMOTION_RESEARCH_2026-09-27.md`;
- R1: `docs/R1_EMBODIED_ROUTE_EXECUTION_RECOVERY_RESEARCH_2026-09-28.md`.

Immediate implementation boundary:

> **R1-0 must classify current route-witness executability from the embodied body's actual position without performing a fresh global N0b query.**

Only after that authority layer is qualified may R1 open local suffix reconnection and bounded recovery episodes.

M1 qualified a minimal residual-slide candidate that preserves hard blocking, tangent authority, body-size capacity and causal observability in the isolated static substrate.

Targeted donor recovery from `Jozzpoly/Box3d-Character-Controler@e7a98be...` contributes only the invariant/falsifier pattern “remove unsupported normal authority, preserve valid tangent authority”; donor runtime architecture is not imported.

After M1 qualification:

1. **R1 embodied route execution / recovery episodes**;
2. **D1 repeated dynamic encounter episodes**;
3. **S1 valid pressure/completion/macro-observability substrate**;
4. then **E2 controlled recomposition + fresh Owner rehearsal**.

Personal-space / compressible-envelope research remains a later horizon after those foundations.


### Active invariant

> **Preserve the experimental freedom that made Combat Lab useful; refound state, causality and organism competence so the apparatus reveals the phenomenon instead of becoming it.**
