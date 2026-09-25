# Combat Lab — Research State

**Authority:** current `main` research truth  
**Status:** 2026-09-25  
**Purpose:** discover embodied combat possibilities that may later inform **Feniks**. This repository is a laboratory, not the Feniks combat implementation.

Combat Lab is intentionally broader than melee attacks or sword physics. Relevant variables include body scale/proportions, mass, locomotion, reach, weapon geometry, projectiles/bows, spears, axes, shields, magic, terrain, contact, multiple actors and the interaction between different combat families.

## Current truth

There is **no accepted Feniks combat model** in this repository.

## ACTIVE STATE — Combat Lab vNext execution refoundation

**Decision:** proceed with a clean execution-substrate refoundation while preserving all research evidence.

Active refoundation branch:

- `refoundation/combat-lab-vnext`

Frozen pre-refoundation branch checkpoint:

- `experiment/whole-combat-organisms-v0` at `ba081120d2563f767e14cd5b61e07f6503a0627f`.

Why this is necessary:

- the active runtime had become an R3-specific Owner specimen rather than a neutral laboratory;
- package/runtime naming and module ownership encoded the latest melee/contact hypothesis;
- the branch had diverged heavily from `main` (233 commits ahead / 12 behind at the audit point);
- historical experiments repeatedly concentrated on melee/contact/exchange despite the broader Feniks intent;
- Owner evidence arrived too late in several campaigns relative to the amount of machine-side work.

This is **not** a knowledge reset.

Preserve exact SHAs, Owner observations, negative results, qualified mechanism donors, causal kernels and research protocol lessons.

Do not automatically preserve current runtime structure, actor assumptions, attack abstractions, R3 solver semantics or experiment numbering.

### Neutral substrate checkpoint

Implementation checkpoint:

- `6f2ed95b102cba802c1701326c7b9026892a532c`;
- clean branch contains no inherited R3 runtime;
- shared core currently owns fixed stepping, raw input capture, experiment lifecycle, canvas sizing/frame setup and build provenance;
- `experiments/substrate-smoke.js` is intentionally a non-combat diagnostic;
- CI PASS;
- Pages workflow is being refit to carry the neutral `experiments/` directory and to whitelist the refoundation lane instead of the retired whole-combat lane.

Evidence boundary:

> **substrate plumbing can be machine-qualified; its usefulness for future combat discovery remains to be proven by the experiments it enables.**

### First vNext frontier selected — BODY / SCALE

The first post-refoundation discovery campaign is **EMBODIED SCALE FIELD S0**.

It is intentionally a body/world field before attacks are added.

Primary question:

> **Can continuous changes in body scale and embodied mass create immediately perceptible differences in movement, access and contact without class flags, scripted correct routes or attack mechanics?**

This does not make body/scale the final combat foundation. It is selected because actor/body assumptions have high leverage over later melee, ranged, magic, terrain and multi-actor work.

See `docs/VNEXT_FRONTIER_SELECTION_2026-09-25.md`.

### S0 machine qualification

Exact pre-deploy code checkpoint:

- `59d214ce10c261586268e309c701036fa690db63`.

Evidence:

- **10 / 10 automated checks PASS**;
- scale derivation is continuous and contains no class flag;
- a small body can traverse the central opening while the large body is materially excluded under the same movement input;
- mass-weighted body contact changes the lighter participant more than the heavier participant;
- a long mixed scale/movement soak remains finite;
- fixed-step runtime / registry / smoke substrate checks PASS;
- headless Chromium served the real `index.html` + ES-module graph and replaced `Loading…` with `Embodied Scale Field S0`.

Browser boundary:

- Opera Browser Connector remained unavailable after repeated retries;
- this is tooling unavailability, not S0 evidence.

Human evidence remains **UNPROVEN**.

The next valid evidence is a short raw Owner observation of S0.

### Exact Owner-observation deployment

The first branch deployment at `78de4144d93582bb87862c302b0412cf3ca01916` was provenance-correct, but a subsequent automatic `main` Pages deployment was allowed to finish and therefore could replace the public surface.

The final Owner-observation deployment is intentionally re-issued from the current refoundation head after that `main` deployment completes.

This is deployment hygiene only; no S0 behavior was changed after the machine/browser qualification.

### S0 deployed Owner gate

Exact public observation specimen:

- `3da498947b480c5da5a52530293afa818014b3c8`.

Qualification:

- branch check run `36172051949`: SUCCESS;
- Pages run `36172099859`: SUCCESS;
- Pages build checked out exact `3da498947b480c5da5a52530293afa818014b3c8`;
- emitted artifact ID `10880701771`;
- artifact `COMMIT.txt`: `3da498947b480c5da5a52530293afa818014b3c8`;
- artifact `BRANCH.txt`: `refoundation/combat-lab-vnext`;
- versioned CSS / JS module graph uses the same exact SHA;
- public target: `https://jozzpoly.github.io/Combat-Lab/`.

A redundant container-local Chromium run against the downloaded emitted artifact timed out in that container environment and is **not counted as experiment evidence**. The CI headless-Chromium gate on the actual source/module graph remains PASS.

Owner feel / usefulness remains **UNPROVEN** until direct Owner observation.

### First S0 Owner recording — APPARATUS FAIL

The first Owner recording of public specimen `3da498947b480c5da5a52530293afa818014b3c8` is authoritative product evidence.

Result:

> **OWNER-OBSERVED PRODUCT FAIL: the simulation never started.**

Observed for the full ~12.6 s recording:

- blank canvas;
- timer fixed at `0.00 s`;
- static `RUNNING` label;
- `source: local` never replaced;
- selector visually changes but does not load the selected experiment;
- expected control actions do not produce application-state changes.

Exact deployed source confirms a startup temporal-dead-zone bug: `loadExperiment()` writes `elapsed` and `last` before their later `let` initializations.

Research boundary:

- public S0 specimen: **FAIL**;
- browser qualification gate: **FAIL / insufficient**;
- BODY / SCALE human phenomenon: **UNPROVEN**, not rejected;
- machine body/scale mechanism tests remain narrow mechanistic evidence only.

Do not modify body/scale semantics from this recording.

Runtime repair is now active with a strict semantic boundary:

- no BODY / SCALE experiment code is changed;
- shell startup ordering is repaired;
- BOOTING / RUNNING / PAUSED / ERROR is explicit;
- browser runtime qualification now requires live frames, advancing simulation time, real Digit3 input changing S0 scale, reset restoring S0, pause/resume behavior, experiment switching, and zero captured runtime error.

The repaired specimen must pass this gate before deployment.

See `docs/S0_FIRST_OWNER_RECORDING_ANALYSIS_2026-09-25.md`.

### S0 runtime repair qualification

Runtime-only repair checkpoint:

- `fd851a13d1f36776f15b513884047f5cc90ff3a5`.

Critical preservation check:

- S0 experiment blob at failed Owner specimen `3da498947…`: `d0ea720a1978fe385b0358c3b870f7cc10e335a8`;
- S0 experiment blob after runtime repair: `d0ea720a1978fe385b0358c3b870f7cc10e335a8`;
- **BODY / SCALE behavior is byte-identical.**

Qualification:

- 10 / 10 deterministic tests PASS;
- live headless-Chromium gate PASS;
- runtime reaches RUNNING with advancing frame/time heartbeat;
- real `Digit3` browser input changes active S0 scale to the large anchor;
- Reset restores the S0 initial scale/state;
- Pause holds simulation time and Resume advances it;
- experiment selector actually loads the smoke probe and then returns to S0;
- no captured runtime error.

The new gate itself first caught a heartbeat/reset inconsistency and blocked promotion. That instrumentation issue was corrected before this PASS.

This is the required evidence to redeploy the same S0 hypothesis for the first actual Owner body/scale observation.

### Pages emitted-artifact gate

The deployment pipeline now browser-qualifies the emitted `dist/` **after** SHA versioning and `COMMIT.txt` / `BRANCH.txt` generation, before artifact upload.

For interactive specimens the emitted artifact must pass the same live gate:

- live frame/time heartbeat;
- real keyboard input;
- reset;
- pause/resume;
- experiment switching;
- zero captured runtime error.

This closes the gap between source-tree browser qualification and the exact Pages artifact delivered to the Owner.

### Repaired S0 final Owner gate

Exact public specimen:

- `f4c64e35f225b3a8d994f6ac05b5e7c02689cf6c`.

Qualification:

- branch check run `36176211940`: SUCCESS;
- source-tree live browser gate: PASS;
- Pages run `36176248859`: SUCCESS;
- Pages build checked out exact `f4c64e35f225b3a8d994f6ac05b5e7c02689cf6c`;
- **emitted `dist/` live browser gate: PASS before upload**;
- emitted gate observed title `Embodied Scale Field S0`, live elapsed time ~0.20 s, active experiment `embodied-scale-field-v0`, scale 1.0 and provenance `source: f4c64e35f225 · refoundation/combat-lab-vnext`;
- the same gate exercised real Digit3 input, reset, pause/resume, experiment switching and zero captured runtime error;
- Pages artifact ID `10881868542`;
- deploy: SUCCESS.

Preservation:

- S0 experiment blob remains `d0ea720a1978fe385b0358c3b870f7cc10e335a8`, identical to the failed first Owner specimen.

Therefore:

> **runtime translation is re-qualified; BODY / SCALE itself remains unchanged and still awaits its first valid Owner observation.**

### S0 second Owner recording — POSITIVE BODY/WORLD SIGNAL

The repaired S0 received its first valid Owner play recording.

Owner feedback:

- the specimen is genuinely in the direction Feniks needs;
- largest body does not fit the central passage but can use side routes;
- mass difference is perceptible in movement / displacement;
- the result is still extremely raw and far from final Feniks needs;
- moving away from a weapon-system-centric foundation is considered justified;
- future combat is expected to be a hybrid discovered through experimentation, not a weapon mechanic frozen in advance.

Dense recording analysis promotes the broad body/world direction while explicitly refusing to canonize S0's placeholder laws.

Strongest matched observation:

- large form remains unable to clear the central opening around ~7.1–10.9 s;
- at ~11.0 s the Owner switches to small at essentially the same location;
- small clears the relation immediately afterward.

Source geometry:

- central gap: 54;
- small diameter: 23.4;
- medium diameter: 36;
- large diameter: 61.2;
- side bypass: 70.

Therefore the useful relation is material and permissive:

> **large loses one route but not movement through the world.**

Contact evidence also shows qualitatively different yield / displacement behavior between small and large bodies, but exact mass and motor laws remain unqualified.

Status:

- BODY / WORLD discovery direction: **ACTIVE / POSITIVE OWNER SIGNAL**;
- exact scale->mass law: UNPROVEN;
- exact locomotion law: UNPROVEN;
- current circle collider: PLACEHOLDER;
- current contact solver: MECHANISM ONLY;
- continuous scale sweep: UNPROVEN;
- S1 frontier: disentangle envelope, mass and locomotor authority before adding attacks.

See:

- `docs/S0_SECOND_OWNER_RECORDING_DENSE_ANALYSIS_2026-09-25.md`;
- `docs/EMBODIED_COMBAT_ECOLOGY_CAMPAIGN_2026-09-25.md`.

### WORKBENCH RESET — post-S0

The rushed post-S0 S1 execution lane has been discarded.

Active branch was reset to:

- `3e9648fe77c49994c49b60722aa9b2d550124d58`.

This preserves the positive S0 BODY / WORLD evidence and removes S1 implementation / shortcut UX / premature Owner-gate work from the active line.

The retained insight is narrower:

- body envelope, mass/equipment burden and locomotor capability must eventually become separable research variables;
- direct continuous manipulation is valuable;
- Owner-facing controls must be permissive enough to support deliberate breakage.

The immediate implementation target is now **Combat Lab Workbench**, not another gameplay specimen.

See `docs/COMBAT_LAB_WORKBENCH_REFOUNDATION_2026-09-25.md`.

### Workbench W1/W2 internal checkpoint — NO DEPLOY

Current internal checkpoint:

- `c92e20b032aad50a74512b12b0d5f83dac39cf09`.

What now exists:

- persistent desktop Workbench shell;
- large experiment viewport;
- experiment selector;
- right-side Lab Inspector;
- generic experiment-authored numeric control rendering;
- direct slider + numeric editing;
- anchor buttons;
- per-parameter reset;
- separate `Reset World` and `Restore Defaults`;
- derived/read-only values separated from authored parameters;
- live state section;
- optional debug overlay;
- provenance/session drawer;
- soft-range vs wide safety-rail behavior;
- explicit EXTREME state that allows rather than rejects out-of-soft-range values.

S0 is the only research phenomenon migrated into the Inspector.

Its scale safety rails are now deliberately broad:

- `0.05 .. 8.0`;

while the convenient soft range remains:

- `0.40 .. 2.00`.

This broadening is an authoring/discovery affordance, not a new Feniks body-model claim.

Internal qualification:

- **14 / 14 automated checks PASS**;
- real Chromium Workbench gate PASS;
- slider changes live S0 state;
- numeric entry changes live S0 state;
- Reset World restores world position while preserving authored scale;
- Restore Defaults restores authored scale;
- pause/resume PASS;
- experiment switching PASS;
- safety-rail scale 0.05 and 8.0 remain finite under long world movement;
- source screenshots inspected at 1600×1000, extreme scale 4.5 and compact desktop 1280×800;
- compact desktop layout uses one Inspector scroll rather than page + Inspector double scroll.

Evidence boundary:

> **Workbench interaction substrate: internally qualified enough to continue development.**

Not qualified:

- public deployment freshness;
- final visual design;
- future body parameter decomposition;
- any S1 gameplay claim;
- Owner-ready status.

**NO DEPLOY / NO OWNER TEST requested at this checkpoint.**

### Next embodied question — Load / Envelope B0

After the Workbench core and A/B parameter comparison became internally functional, the next body experiment was redesigned from zero.

The discarded S1 `envelope / mass / drive` ontology is **not restored**.

B0 instead separates:

- body envelope;
- intrinsic body mass;
- carried load mass;
- locomotor force multiplier.

Primary causal case:

> same actor geometry + same locomotor capability + different carried load.

B0 holds max speed constant and lets total mass affect acceleration/braking only through a force/mass relation.

Traction, stance, rotational inertia and equipment geometry remain explicitly outside B0.

This experiment is currently an **internal design hypothesis only**.

See `docs/EMBODIMENT_DECOMPOSITION_LOAD_ENVELOPE_B0_2026-09-25.md`.

### Broader refoundation frontier

No later combat family is preselected.

The next implementation after the neutral substrate must be chosen against the broader possibility map, including:

- body size / envelope / mass;
- locomotion and embodied handling;
- shields / occupied space;
- reach / polearms;
- axes and materially different tool geometry;
- bows / projectile / line-of-sight play;
- magic that is not merely a projectile reskin;
- terrain relations;
- mixed modalities;
- multiple actors / future co-op pressure;
- persistent exchange / afterstate donors such as R3.

See:

- `docs/COMBAT_LAB_REFOUNDATION_AUDIT_2026-09-25.md`
- `docs/COMBAT_LAB_VNEXT_EXECUTION_SUBSTRATE.md`


### Owner scope correction — 2026-09-25

The current R3 line must not become the project spine merely because it produced the first positive Owner signal.

Owner intent is broader:

> **Combat Lab is a laboratory for discovering combat as a whole embodied/systemic space, not a sword-combat project.**

Important consequences:

- character/body size is itself a high-value experimental dimension, not merely a balance parameter;
- bows/projectiles, magic, axes, spears and other families are expected research territory;
- interactions between combat modalities may matter more than optimizing any one weapon;
- body/equipment/world relations remain first-class;
- "combat" is not reducible to hit exchange, damage, or melee contact;
- a clean refoundation/restart of the active implementation is acceptable if current lineage creates conceptual inertia.

Restart does **not** mean discarding evidence. Preserve:

- Owner FAILs;
- qualified mechanism donors;
- positive Owner signals;
- exact specimen SHAs;
- methodological lessons.

But do not preserve accidental architecture, naming, branch lineage or implementation shape merely because it already exists.

Current consequence:

> **R4 is no longer the automatic next step.**

R3 remains worth keeping and may receive a later adversarial follow-up, but the next campaign choice must be made against the broader Combat Lab possibility space.

## Whole Combat Organisms v0 — W1 checkpoint

Active branch:

- `experiment/whole-combat-organisms-v0`

Neutral situation substrate:

- exact agent-rehearsal deployment: `ba408d52549175b06d10d5387eb7f331717cc630`;
- branch checkpoint after evidence capture: `0b064d5d7d18be48fe2b264d46d11e6df0a745ec`;
- 6 / 6 deterministic W1 checks PASS;
- Pages build checked out the exact rehearsal SHA and deploy completed successfully;
- Opera executed the real browser module/runtime loop and exposed changing pressure states.

What W1 is:

> a neutral Broken Yard situation substrate with one responsive player body, two cheap pressure bodies, real body/world occupancy and readable state-machine commitment/recovery — intentionally without player attack or HP authority.

What W1 is not:

- combat evidence;
- Owner evidence;
- proof that Broken Yard is visually legible or fun;
- proof that multi-pressure is the right Feniks encounter structure.

Important negative/apparatus evidence was retained instead of hidden:

- initial route probes crossed world geometry;
- the first deterministic path itself crossed a wall;
- pressure initially face-hugged the player for excessive contact time;
- after disengage, pressure bodies themselves formed a persistent blob;
- the peer-separation edit briefly introduced a code-level ReferenceError;
- each issue was corrected without lowering the pre-existing gate.

Final deterministic 20 s signature at `6257789d...`:

- `waypointAdvances = 33`;
- `playerThreatContactFrames = 317 / 2400`;
- `playerContactEpisodes = 8`;
- `maxPlayerContactStreak = 115` (~0.96 s);
- `threatThreatContactFrames = 539 / 2400`;
- `pairContacts = 595`;
- `worldContacts = 499`;
- all pressure phases observed;
- finite state throughout.

Evidence boundary:

- mechanism / deterministic rehearsal: **PASS**;
- exact deploy provenance: **PASS**;
- browser module/runtime execution: **PASS**;
- canvas visual legibility: **UNPROVEN** because the screenshot connector did not provide an inspectable visual surface in this run;
- Owner eligibility: **NO**.

W1 served its purpose and W2/O1 has now been fully red-teamed.

## W2 — O1 HOLD / BREAK — WHOLE-ORGANISM FAIL, MECHANISM DONOR RETAINED

Final O1 v0 research checkpoint:

- active branch checkpoint: `227e7003ce75db62c170a69c81097ae4673ddd28`;
- final existing-law diagnostic suite before verdict: **35 / 35 PASS** at `c69d609408ccfc7527472b9afe5bad4b75658134`;
- Owner play: **NOT REQUESTED**.

What survived as mechanism evidence:

- continuously present directional shield geometry;
- frontal shield contact can consume a lunge's damage path without binary parry cancellation;
- both bodies remain physically displaced by shield contact;
- brace can alter frontal yield without global infinite mass;
- side/rear commitment bypasses frontal shield relation;
- readable windup can be escaped by leaving actual threat geometry;
- late sidestep does not create magic evasion;
- same-step committed consequences can resolve without execution-order authority;
- true multi-angle concurrency changes the pressure problem;
- finite solid-target budgets expose and remove accidental compact cleave.

Why the whole organism failed:

- under serial pressure, brace was behaviorally irrelevant;
- aggressive click-forward dominated deliberate hold;
- attack reach / timing / lethality changes, including combined changes, did not fix the structural dominance;
- weak serial pressure could be neutralized by mobile shield orientation even with player attacks disabled;
- close-five concurrency finally created defensive value, but the promising stance result depended on compact multi-target cleave;
- removing cleave caused the stance result to collapse;
- adaptive brace timing did not rescue it;
- proactive braced shield-drive did **not** produce BREAK — it died faster than unbraced movement under the same close-five pressure.

Final shield-drive falsifier:

- braced drive: DOWN in 1.583 s;
- unbraced drive: DOWN in 2.758 s;
- attack-disabled chase: DOWN in 2.758 s.

Therefore:

> **O1 v0 did not produce a robust HOLD / BREAK whole combat organism.**

Do not revive it through brace buffs, stamina, guard-break, shield-bash rescue buttons, arbitrary enemy HP, or reinstating cleave.

O1 remains a useful donor package. A future Feniks combat may still contain shield / stance / physical tanking behavior; this verdict is specific to the tested organism.

### W3 — O2 REACH / THREAT — WHOLE-ORGANISM FAIL, KERNEL DONOR RETAINED

Preserved campaign checkpoint:

- branch checkpoint: `375974c3403387b3ebf4ca8c6c68355cbc6618a2`;
- Owner play: **NOT REQUESTED**.

O2 causal-kernel evidence remains useful:

- persistent spear geometry without passive damage;
- outer-tip thrust authority rather than whole-shaft damage;
- one solid damaging target per thrust;
- wall truncation / clearance consequence;
- zero-damage close clearance displacement;
- live locomotion;
- same-step committed consequence discipline.

The whole organism failed its pre-registered backward-kite falsifier.

The key pressure-speed sweep showed two regimes:

1. when direct pursuit is slower than / equal to player movement, retreat simply cancels engagement;
2. once pursuit becomes faster, direct chase feeds bodies into the spear axis and backward + thrust clears safely at 100 HP across multiple faster pursuit speeds.

Representative deep-open results:

- pressure 1.08x player speed: backward-kite CLEAR, 100 HP;
- pressure 1.15x: backward-kite CLEAR, 100 HP;
- pressure 1.25x: backward-kite CLEAR, 100 HP.

This was achieved without world-boundary dependence.

Therefore:

> **O2 v0 does not create robust REACH / THREAT play; its simplest winning strategy remains backwards movement + thrust.**

Do not rescue it with hidden spear-aware AI, arbitrary backwards penalties, tighter arena boundaries, stamina taxes or pursuit-speed tuning.

### Campaign-level correction — GENERIC CHEAP PRESSURE IS NOT A DISCOVERY OPPONENT

O1 and O2 failed for different local reasons, but both depended on the same generic W1 cheap-pressure abstraction.

That abstraction is now reclassified as:

> **useful mechanism / stress-test infrastructure, not sufficient opponent substrate for product-level combat discovery.**

This corrects a regression against the Feniks combat refoundation, which had already warned that opponent pressure should stop being one generic duelist / pressure body.

The next discovery lane must treat **adversary identity as part of the whole organism**.

Do not mechanically implement O3 against the same pressure cell.

### Adversarial Combat Organism v1 — WHOLE-ORGANISM FAIL, DONORS RETAINED

Final preserved checkpoint:

- active-lane verdict: `2fc9d4bbf06b178805442b96f44defeb1952ef05`;
- final combat-loop gate before verdict: `bdc9c7634b8a290b93bf23bb74fd48dff5675fb9`;
- deterministic suite at final combat gate: **31 / 31 PASS**;
- Owner play: **NOT REQUESTED**.

What survived:

**A1 v1 — adversary action diversity**

- a light `dash-line` and heavy `sweep-arc` can use one shared seek -> prepare -> commit -> recover lifecycle;
- action geometry is equipment/action data rather than a hidden enemy class branch;
- open-field strategy crossover was real:
  - light: lateral orbit can clear cleanly while backstep pays a hit;
  - heavy: lateral orbit can fail while giving ground / backstep clears;
- heavy backstep remained viable under bounded reaction delay, so the discriminator did not require zero-latency internal-state access.

**A2b — first-solid-body material authority**

- adversary commits can resolve against the first solid body rather than special-casing the player;
- another adversary can materially intercept a committed hit;
- direct heavy-sweep interception survived lateral blocker error through ~24 px and failed beyond it;
- body-screen value can exist with **zero friendly damage**;
- interception-only benefit appeared in 3 / 4 ordinary layout families;
- coarse sampled / quantized positional knowledge preserved part of the effect.

These are valuable donor mechanisms.

What failed:

- the mixed light + heavy pair remained broadly two independent attack relations / health bars;
- focus order barely changed the fight;
- peer body collision alone contributed little;
- material cross-interaction was real but sparse;
- screen positioning could matter while the player withheld offense;
- once the same coarse screen policy also used the ordinary compact lethal strike, all-body authority produced **0 / 24 combat-outcome improvements**:
  - 0 clear upgrades;
  - 0 HP advantages;
  - 0 reductions in player hits;
  - 0 survival-time advantages.

Therefore:

> **Adversarial Combat Organism v1 does not earn Owner attention.**

Cross-campaign warning:

> **O1 and A2b independently show that a spatial defensive relation can become meaningful in isolation and then disappear when ordinary compact offense removes pressure faster than the relation matters.**

Do not rescue this lane with enemy HP, reduced player damage, stamina, dodge/parry, terrain, more enemies, scripted formations or stronger friendly fire.

The complete evidence record is preserved in `docs/ADVERSARIAL_COMBAT_ORGANISM_V1.md`.

### LINE / IMPULSE Organism v0 — WHOLE-ORGANISM FAIL, KERNEL DONOR RETAINED

Final preserved checkpoint:

- verdict: `994ebadd5a8ac4e2066a128627ec2693948772c5`;
- corrected engaged diagnostic: `0750c317d4e8a3d9dfe0da7c1aa567ffcdf8a698`;
- final deterministic suite: **17 / 17 PASS**;
- Owner play: **NOT REQUESTED**.

What survived:

- finite projectile travel and swept collision;
- first-solid-body / first-solid-wall authority;
- deterministic draw / release with live locomotion;
- bounded impulse with mass-dependent displacement;
- no hidden stun / i-frames / forced attack cancellation;
- projectile contact can be measured before consequence application for same-step authority;
- a light rusher donor with readable prepare and non-homing locked dash.

What failed:

- stand + fire deletes the rusher before meaningful engagement;
- max-rate fire is effectively identical to stand + fire;
- backwards kite + lethal fire clears safely before engagement;
- removing impulse leaves lethal outcomes essentially unchanged;
- impulse-only timing on prepare / commit does not create additional commitment misses;
- lateral movement creates misses, but adding commit-timed impulse does not improve that result;
- backwards retreat + repeated **zero-damage** impulse holds the rusher out of engagement for 10 s at 100 HP with zero boundary support.

Therefore:

> **LINE / IMPULSE v0 fails projectile-spam, backwards-kite and ranged-HP-subtraction falsifiers.**

Do not proceed to the planned obstruction / cover phase.

The complete evidence record is preserved in `docs/LINE_IMPULSE_ORGANISM_V0.md`.

### Cross-campaign combat discovery audit — SYNTHESIS COMPLETE

Primary audit:

- [Cross-Campaign Combat Discovery Audit — Exchange Before Consequence](CROSS_CAMPAIGN_COMBAT_AUDIT_2026-09-24.md)
- synthesis commit: `271c60a600604c26a89e4e6eaaff825c74cd7eb5`

Working thesis remains:

> **EXCHANGE BEFORE CONSEQUENCE**

### EXCHANGE GRAMMAR E0 v0 — FAIL, ACCESS + MATERIAL DRIVE DONORS RETAINED

Primary record:

- [EXCHANGE GRAMMAR E0 — Mirrored Access Contest](EXCHANGE_GRAMMAR_E0.md)
- final attribution: `e15670db86b5a60dcff2e57b02478e333c3aa09b`;
- lateral falsifier: `240375ca756c43488205be9acd39b77b2b3aeb22`;
- deterministic suite: **6 / 6 PASS**;
- Owner play: **NOT REQUESTED**.

What survived:

- ACCESS gives retreat a world-grounded concession:
  - DENY retreat -> breached in 1.783 s;
  - BREACH retreat -> blocked after 6 s;
  - zero boundary dependence;
- material DRIVE can change access outcome;
- with the same full-authority defender:
  - normal player DRIVE -> crossed 2.225 s;
  - player DRIVE disabled -> blocked;
  - DRIVE state with carry=0 and contact displacement=0 -> blocked;
- recovery measurably limits spam;
- same-step opposing commitments preserve symmetric consequence.

What failed:

- BREACH forward + DRIVE whenever ready crossed **7 / 7** lateral starts;
- captured vs homing DRIVE crossed **7 / 7** with identical times;
- the commitment direction therefore has no demonstrated strategic cost;
- the access objective gives forward DRIVE mostly upside;
- inherited afterstate is not rich enough to defeat blind aggressive commitment.

Therefore:

> **do not proceed to E1 damage reintroduction.**

### EXCHANGE GRAMMAR E0b — FAIL, DIRECTIONAL SUPPORT DONOR RETAINED

Primary record:

- [EXCHANGE GRAMMAR E0b — SET / DRIVE](EXCHANGE_GRAMMAR_E0B_SET_DRIVE.md)
- final contact-conditioned attribution: `f0ad558a0e9b44baac9646198f1589900c646d24`;
- deterministic suite: **7 / 7 PASS**;
- Owner play: **NOT REQUESTED**.

What survived:

- directional SET is a real contact law rather than a global mass multiplier;
- aligned support materially reduces yield;
- support remains movable / turnable;
- support sacrifice during DRIVE is a real local trade;
- centered BREACH changes from **CROSSED 1.85 s** with zero support to **BLOCKED after 6 s** with directional SET;
- ACCESS remains useful donor evidence for world-grounded retreat concession.

What failed:

- blind BREACH DRIVE still crosses **6 / 7** broad starts;
- angle-switch crosses **7 / 7**;
- directional and omnidirectional support both produce **6 / 7** broad crosses;
- captured and homing angle-switch DRIVE both produce **7 / 7** crosses with effectively identical times;
- support sacrifice vs retaining support changes only the centered cell.

Contact-conditioned attribution shows support is active (~0.998–1.0) in the off-center cells, so the broad failure is not caused by the defender simply failing to orient.

Structural conclusion:

> **ACCESS + one defending body collapses into either a central supported wall or lateral bypass. It did not create a reusable exchange grammar.**

Do not rescue E0b through lane narrowing, stronger support, larger bodies, movement-speed tuning or another SET constant sweep.

### Persistent afterstate / readiness audit — SYNTHESIS COMPLETE

Primary record:

- [Persistent Afterstate / Readiness Audit](PERSISTENT_AFTERSTATE_READINESS_AUDIT_2026-09-25.md)
- audit commit: `7d640f2b80e3283a7a45f7a28966846cad523d5b`

Cross-donor finding:

> **Prior organisms often preserved physical state briefly, but their controllers repeatedly attracted combat back toward authored neutral / idle / approach semantics.**

Exact evidence:

- Terrarium weapon clash / wall / hit changed real weapon velocity, but spring targets still returned to canonical guard / idle reach;
- O1 player attack always returned `windup -> active -> recover -> idle`, while pressure recovery returned to `approach`;
- O2 action state became `null` after recovery and spear reach returned to `idleReach`;
- O2 clearance created real displacement, but neither player action grammar nor pressure intent inherited that displacement as the next tactical state;
- shared responsive locomotion could quickly dominate inherited contact velocity.

Important correction:

> **Do not solve this by adding inertia, longer recovery, stamina or control lock.**

The missing candidate is **decision persistence**, not merely longer physical decay.

### CONTINUOUS READINESS R0 — CAUSAL-KERNEL QUALIFIED

Primary hypothesis / result:

- [CONTINUOUS READINESS R0 — No Auto-Neutral Causal Kernel](CONTINUOUS_READINESS_R0.md)
- final evidence checkpoint: `eceb858fa25944c3c09e0eaf27358d2c76007fa0`;
- deterministic suite: **12 / 12 PASS**;
- Owner play: **NOT REQUESTED**.

Defended mechanism claims:

- FREE vs WALL first outcomes create materially different starting readiness for an identical second COMMIT;
- identical second action paths differ substantially;
- pose-only inheritance remains strong after inherited angular/radial velocity is deliberately erased;
- erasing both pose and velocity collapses the history difference to zero;
- ordinary GUIDE lets readiness history decay naturally rather than permanently;
- matched AUTO-NEUTRAL restores equivalence much faster;
- a broad GUIDE-authority sweep exposes a machine-side tradeoff between state memory and intentional recovery;
- sharp aim does not instantly erase history in the reference regime;
- locomotion remains responsive during COMMIT;
- 20 s / 21-impact wall-contact soak is finite, bounded and deterministic.

Critical evidence:

- full history distance at 0.24 s: **2.537**;
- pose-only: **1.393**;
- velocity-only: **1.705**;
- both erased: **0**;
- ordinary GUIDE history distance:
  - 0.65 s: **1.514**;
  - 1.00 s: **0.433**;
  - 1.60 s: **0.077**;
- matched AUTO-NEUTRAL ratio:
  - 0.40 s: **0.162**;
  - 0.65 s: **0.027**;
  - 1.00 s: **0.003**.

Interpretation:

> **the campaign now has evidence for persistent readiness beyond residual inertia: contact can change the physical starting condition of the next action without a hidden token or canonical guard reset.**

Evidence boundary:

- control feel: **UNPROVEN**;
- readability: **UNPROVEN**;
- combat value: **UNPROVEN**;
- Feniks suitability: **UNPROVEN**.

### READINESS UNDER PRESSURE R1 — FAIL, R0 DONOR SURVIVES

Primary record:

- [READINESS UNDER PRESSURE R1](READINESS_UNDER_PRESSURE_R1.md)
- final material sweep: `92c231f57635076b54e189b2770c2479d0e85a2d`;
- deterministic suite: **19 / 19 PASS**;
- Owner play: **NOT REQUESTED**.

Defended narrow facts:

- mirrored EAST/WEST rusher uses readable prepare + non-homing locked dash;
- readiness history changes actual tool/body contact geometry;
- COMMIT-only material contact changes rusher trajectory without hidden cancel;
- ordinary lateral movement leaves the locked dash geometry without i-frames.

Failure:

- immediate COMMIT: all 4 history × side cells still end in player body contact;
- GUIDE THEN COMMIT: same 4 / 4 body contacts;
- LATERAL EVADE: 4 / 4 body misses, requiring ~108 units movement;
- full bounded tool material authority creates ~9–13 units lateral rusher deviation but **0 / 4** body-miss upgrades;
- scales beyond 1 correctly saturate at the designed 105 delta-speed cap and still do not change outcome.

Conclusion:

> **R1 made readiness affect contact, but not what the player should do.**

Do not tune impulse / rusher constants until this changes.

R0 continuous readiness remains qualified.

### READINESS FOLLOW-THROUGH R2 — FAIL, PHYSICAL OVERRUN DONOR RETAINED

Primary record:

- [READINESS FOLLOW-THROUGH R2](READINESS_FOLLOW_THROUGH_R2.md)
- final falsifier: `4b97bd184138e2f319aa13c0a436a6d2b2455f76`;
- deterministic suite: **25 / 25 PASS**;
- Owner play: **NOT REQUESTED**.

What survived:

- ordinary movement can leave the locked dash geometry;
- the corrected minimum deterministic evade is ~49.2 units rather than the earlier over-evade ~108;
- rusher overrun is genuinely physical;
- no recovery timer defines the opportunity;
- dash commit ends ~0.792 s and positive closing is naturally recovered ~1.275 s;
- physical opportunity is ~0.483 s;
- readiness history remains measurable at commit end in the reference regime.

What failed:

- immediate follow-up is determined by pressure side, not FREE/WALL readiness history:
  - EAST: FREE and WALL both no-contact;
  - WEST: FREE and WALL both pre-turnaround contact;
- this remains true while FREE/WALL readiness distance at commit end is still ~0.404 at the reference setting;
- therefore history existed but did not change the immediate action opportunity;
- the R2 card explicitly required stopping if K1 had no contextual follow-up phenomenon.

Later GUIDE diagnostics do not rescue the result:

- one low-authority cell at 0.18 shows a history-dependent guided contact;
- at 0.38+ guided follow contacts all four cells;
- higher GUIDE authority naturally erases readiness history.

Do not tune GUIDE or rusher constants around the 0.18 cell.

### Joint relational afterstate audit — SYNTHESIS COMPLETE

Primary record:

- [Joint Relational Afterstate Audit](JOINT_RELATIONAL_AFTERSTATE_AUDIT_2026-09-25.md)
- synthesis commit: `4ec6c1afbc95e26a5a98e208bdb8fbc3477a124f`.

Cross-donor result:

> **local persistence is real, but strategic persistence likely requires a shared material relation rather than a stronger local readiness variable.**

Re-audited donors:

- Terrarium blade↔blade contact:
  - genuinely mutual segment/contact geometry;
  - both weapon velocities and both bodies changed;
  - but each controller independently restored its own neutral target after separation.
- Terrarium weapon↔wall:
  - world co-owned the constraint while contact persisted;
  - after separation the weapon returned to local control semantics.
- O1 shield↔body:
  - persistent occupied directional geometry with real yield/displacement;
  - but the relation remained mostly defender-owned and attacker state returned to its own lifecycle.
- A2b first-solid-body authority:
  - strongest multi-actor relational donor;
  - another body can genuinely consume a committed action even with zero friendly damage;
  - but ordinary compact offense later removed the relation faster than it could matter.
- ordinary body↔body:
  - symmetric physical causality;
  - weak next-decision persistence.

Current missing property:

> **a relational manifold: a material configuration jointly determined by multiple participants / tools / world geometry that changes all participants' next useful possibilities and leaves consequential afterstate when the relation breaks.**

This is **not** a sword-lock / bind minigame proposal.

Hard boundaries before any future R3:

- no bind mode;
- no hidden vulnerability token;
- no one-side aim reset;
- no static infinite-mass wall;
- no physics-wrestling chore;
- no passive block bubble;
- no terrain-puzzle dependency;
- no target-script cooperation;
- no immediate return to equivalent neutral state after contact.

### RELATIONAL MANIFOLD R3 — JOINT-AFTERSTATE CAUSAL KERNEL QUALIFIED

Primary record:

- [Relational Manifold R3](RELATIONAL_MANIFOLD_R3.md)
- final evidence checkpoint: `f95b7798c40cf65460acb0a28f78069919c3ce66`;
- deterministic suite: **10 / 10 PASS**;
- Owner play: **NOT REQUESTED**.

Defended narrow facts:

- a symmetric two-tool material relation can persist across many simulation steps without a bind mode;
- ordinary locomotion can break that relation through geometry;
- press-medium CONTACT vs matched GHOST leaves equal readiness divergence on both participants: **0.5099 / 0.5099**;
- identical next COMMIT differs by **0.4835 rad** for both participants;
- tiny lateral perturbations produce smooth mirrored families rather than chaotic flips;
- independent local neutralization collapses joint tool history to ~0.0004 readiness distance / ~0.0003 next-path delta by 1.2 s;
- six-second sustained contact remains finite with one fresh impact, no impact pumping and max angular speed ~0.666;
- ordinary body separation breaks that long relation in ~0.158 s;
- a one-side ordinary GUIDE perturbation produces a mirrored cross-response on the other tool (**0.0236** each direction).

Interpretation:

> **the campaign now has mechanism evidence for a jointly owned material afterstate, not only player-local persistence.**

Important boundary:

- cross-contact influence is real but modest relative to own-tool handling;
- longer maintained contact increases divergence in this simple kernel;
- aim alone may not untangle a crossing relation while bodies remain fixed;
- whether that is readable possibility or physics-wrestling chore is entirely unproven.

### Current frontier — R3 OWNER CONTACT SPECIMEN, BEFORE R4

The mechanically qualified R3 kernel has not yet been observed by the Owner as a human-facing phenomenon.

Hard boundary:

> **R3 kernel qualified ≠ R3 human phenomenon qualified.**

The active campaign therefore pauses the previously proposed R4 pressure step and performs a smaller translation test first:

- restore the exact qualified R3 kernel from its preserved evidence checkpoint;
- expose one participant to direct human locomotion + GUIDE + COMMIT;
- give the other tool a transparent, deterministic, player-independent guide rhythm so it is not a dead static wall and not an adversarial AI;
- add only causal observability: material tool geometry, contact point, short motion traces and raw contact duration;
- preserve manual reset and inherited physical state;
- add no HP, damage, stamina, parry window, bind state, hidden advantage, target script or feel tuning.

Machine qualification may establish only:

- exact kernel restoration;
- deterministic/runtime health;
- input plumbing;
- deploy provenance;
- observability plumbing.

It may not establish feel, readability, useful combat choice or Feniks fit.

First Owner observation is intentionally weakly instructed. A negative result such as "sticky", "invisible", "arbitrary" or "physics wrestling" is decisive product evidence even while the causal kernel remains mechanically qualified.

Only after Owner evidence do we decide whether to:

- repair the translation / control surface;
- retain R3 only as a donor kernel;
- or open minimal adversarial-pressure R4.

Primary campaign record:

- [R3 Owner Contact Specimen](R3_OWNER_CONTACT_SPECIMEN.md)

Owner deployment is **QUALIFIED FOR OBSERVATION ONLY** at exact deployed specimen `b51aad2dbc6475237b9fb22fdb0ed24b82bb6827`.

Machine evidence at that exact specimen:

- R3 regression + Owner specimen suite: **15 / 15 PASS**;
- initial state remains separated without Owner input;
- deliberate ordinary entry can create material CONTACT;
- ordinary locomotion can break the relation again;
- exact Pages artifact loads its versioned ES-module graph in Chromium without missing modules, page errors or console errors;
- Pages build checked out and deployed the exact source SHA.

Browser-connector boundary:

- Opera Browser Connector remained disconnected after repeated retries;
- this is tooling unavailability, not product evidence;
- the exact deployed Pages artifact was therefore exercised in local Chromium with routed artifact modules rather than claiming a live public-URL observation.

First Owner observation is now recorded.

Owner response to exact deployed specimen `b51aad2dbc6475237b9fb22fdb0ed24b82bb6827` is an **EARLY POSITIVE SIGNAL**:

- the result is "already something";
- it is "something we can work on";
- the raw starting point is appealing;
- whether Feniks needs this kind of sword physics remains explicitly uncertain.

Therefore:

> **R3 human phenomenon = interesting enough to continue researching.**

This does **not** promote sword physics, R3, or any current control/contact law into Feniks combat.

R3 now earns preservation and possible follow-up, but not priority by inertia.

The next valid strategic question is broader:

> **Which combat dimensions are currently most underexplored and most likely to reveal a qualitatively new possibility surface?**

Candidates include, without implying an ordering:

- body scale / body-envelope differences;
- long reach / polearms;
- axes and materially different weapon geometry;
- bows / projectiles and ranged-space negotiation;
- magic as a different action/world relation rather than a reskinned projectile;
- shield/body/terrain relations;
- mixed modalities and asymmetric participants;
- R3-style shared material relation under pressure.

Before implementing another lane, decide whether the current repository should continue incrementally or be refounded on a cleaner experimental substrate.

## Recovery correction — 2026-09-22

A full project-history recovery changed the active research strategy.

### Phenotype Combat Ecology P0/P1 — RETAINED AS MECHANISM DONOR, NOT ACTIVE PRODUCT DIRECTION

Preserved branch / checkpoint:

- branch: `experiment/phenotype-combat-ecology-v0`
- last clean checkpoint before strategic demotion: `e82b55866cdd31ff7769c353cf2f6eab8d9cc3fa`
- temporary interactive P1 rehearsal lineage included `90f8e8886d024c69001f0f699fa593d6d6d67711`

What P0/P1 actually demonstrated:

- body/equipment mass can flow through one shared movement/contact derivation;
- shield can exist as directional occupied geometry rather than hidden damage reduction;
- brace can trade movement/turn authority for greater resistance to displacement without infinite mass;
- body envelope can matter to world access;
- a continuity hybrid can interpolate numerically without a hard class flag;
- an authored pressure cell can exploit these properties to produce different mechanical outcomes.

What it did **not** demonstrate:

- that the resulting combat is enjoyable, readable or worth mastering;
- that the anchor presets define a genuinely continuous build ecology rather than coordinated fixture bundles;
- that the observed strategy crossover emerges from ordinary play rather than from authored route/policy structure;
- that heavy play is more than "the same fighter, slower but harder to move";
- that the current `brace` abstraction captures the richer stance/contact behavior Feniks may want;
- that classlessness should be the primary discovery objective before a valuable combat organism exists.

Fresh code review found a specific evidence boundary: the P1 matrix uses authored front/side policies, a deliberately size-discriminating side route and a central-threat condition. That is valid **mechanism evidence**, but too close to a route/policy proof to qualify as emergent combat ecology.

Therefore:

> **Do not continue P1 toward Owner eligibility merely by adding browser QA, polish or more matrix tuning.**

P0/P1 remains a donor package for future whole organisms.

### Active discovery frontier — WHOLE COMBAT ORGANISMS

The primary question is now:

> **What whole combat organism makes the player want to fight again because body, weapon, movement, opponent and place jointly create readable, useful possibilities?**

Secondary constraint, not primary objective:

> **Can a surviving combat language later support body/equipment/progression-driven specialization without hard class authority?**

This returns classlessness to its proper role: an important Feniks constraint and later falsifier, not a substitute for finding combat worth having.

Discovery should compare a small number of deliberately divergent **whole organisms**. They may differ in body, equipment, weapon behavior, pressure, terrain and control vocabulary when those differences are necessary to expose genuinely different play.

Do not force the same weapon/action model across candidates merely to make attribution clean. Attribution comes only after a phenomenon survives Owner play.

### Promotion order

1. find a whole organism with real possibility richness;
2. establish that natural play produces curiosity / mastery / desire to repeat;
3. only then isolate which mechanisms created the valuable phenomenon;
4. only then pressure-test classless continuity, progression coupling and broader Feniks integration.


### Mechanism Probe v1 — QUALIFIED AS MECHANISM EVIDENCE, NOT OWNER-ELIGIBLE

Preserved specimen:

- branch: `experiment/discovery-campaign-v1`
- deployed/provenance-verified head: `88b7c40a0f66e222d683e7062f68b37e98776ba2`

The A/B/C/D matrix is now explicitly classified as a **technical / mechanism falsifier**.

It demonstrated:

- four mechanically distinct player-intent / realization contracts can coexist;
- A↔C and B↔D can be made causally different rather than parameter-only variants;
- material contact can alter realized motion while preserving simple input;
- the browser/deployment instrument can be provenance-controlled.

It did **not** provide enough integrated game context to justify Owner feel testing.

Missing product evidence includes:

- an actual place/world slice;
- credible body↔weapon↔movement coupling;
- persistent spatial defense worth reading;
- meaningful opponent pressure;
- weapon identity;
- terrain-dependent decisions;
- camera/world feel;
- repeated-play desire and mastery.

The earlier state label `Owner feel campaign — ACTIVE` is retracted.

Current active direction:

> **Ruined Gate Terrarium v1 is now REJECTED by Owner play. Do not tune it further as a product organism.**

Preserved rejected Owner specimen:

- branch: `experiment/combat-terrarium-v1`
- Owner-tested public SHA: `47210b16cc9a32d2d53ca42875ca7af5c6b318b3`

The earlier phenotype question is now preserved as a **bounded mechanism question**, not the active product frontier:

> **Can distinct combat roles and strategies emerge from shared body + equipment + world rules, while controls remain responsive and no hard class flag decides what the character is?**

It produced useful mechanism evidence, but full recovery showed that pursuing it as the next product lane risks repeating premature attribution.

Authoritative historical/refoundation documents:

- [Owner Specimen Refoundation](OWNER_SPECIMEN_REFOUNDATION.md) — why the Terrarium was built.
- [Feniks Combat Refoundation — phenotype before attack engine](FENIKS_COMBAT_REFOUNDATION_2026-09-21.md) — why the Terrarium failed and what the next discovery object must test.

Three implementation directions have already produced useful negative evidence:

### R0 — authored arc vs sampled sweep

**Result:** FAILED AS A COMBAT EXPERIMENT.

R0 isolated hit geometry so aggressively that the player was effectively judging a hit-test visualizer rather than fighting. The geometry work was useful, but it did not answer the project question.

Relevant preserved research commits include:

- `6c5b293f64f6b8fd751f106418d6fea6a7eb47b4` — R0 collision/control notes
- `18f91a70819418e792794e9b5493c0842543f581` — corrected rotational-sweep assumptions

### R1 — small combat organism

**Result:** FAILED OWNER FEEL.

R1 restored an opponent, attack timing, contact, damage, obstacles and reset. That made the specimen more complete, but not more representative of the combat Feniks is searching for.

The important lesson is not “R1 needs polish.” The direction itself did not earn continuation.

### Control / commitment micro-spike

Preserved specimen commit:

- `7852d6b9f76f271b08c1f7c1b3acdb41fb87aa56`

It compared LIVE STEER, BOUNDED STEER and CAPTURED attack direction.

**Result:** REJECTED / NON-DISCRIMINATING.

All three modes shared the same movement, attack duration, sweep, reach, opponent and contact model. Only post-click steering authority changed. In live play the three choices were practically indistinguishable.

The failure is methodological: three different algorithms are not three different combat hypotheses if the player can use essentially the same motor strategy and feel essentially the same game.

## Owner-confirmed pressures

These constrain experiments without specifying a final answer:

- responsiveness and player agency have veto over simulation elegance;
- the player should feel embodied in a materially meaningful world, not operate a detached combat abstraction;
- movement during attacks is the strong default; stronger commitment must earn itself in play rather than arrive as an arbitrary animation lock;
- body, weapon, movement, terrain, mass and contact are high-value candidates only when their effects are perceivable and usable by the player;
- hit resolution should primarily respect actual spatial relation and geometry rather than invisible invulnerability windows;
- universal dodge-roll / i-frame combat is not an assumed foundation;
- nontarget combat matters, while target lock, soft focus and aim assistance remain open experimental questions;
- weapon identity should be allowed to emerge from how a weapon negotiates reach, space, timing, movement and contact, not only from damage/range/cooldown values;
- simple authored rules are allowed to beat deeper simulation whenever they make a better game;
- automated tests can qualify mechanisms; **Owner play is required to qualify gameplay**.

## Current research question

The previous frontier was framed too narrowly around attack steering.

The broader active question is:

> **What player-to-body-to-weapon control language makes melee combat feel responsive, embodied, spatially meaningful and worth mastering in Feniks?**

This question deliberately precedes a final choice of camera, target system, hit authority, animation model, weapon physics, classes, progression or AI architecture.

## Historical mechanism-hypothesis gate

The four-corner probe used the following gate to escape parameter-only comparison. It remains useful as historical methodology for bounded mechanism probes, but it no longer defines the product-specimen roadmap.

Before a bounded mechanism comparison is coded, candidates should be qualitatively different rather than parameter-only variants.

Each hypothesis must state:

1. what the player physically does with movement / aim / attack input;
2. what the embodied character and weapon actually do;
3. what should feel materially different within the first ~30 seconds;
4. why that difference could matter to Feniks;
5. what observation would falsify the hypothesis.

A candidate fails this gate if the same player strategy can be used across candidates with only a timing, angle, speed or tuning difference.

## Active hypothesis space

The first pass mixed **core combat languages** with orthogonal assist/evaluation axes. That has now been corrected before implementation.

The core candidates below must differ in the player's motor strategy and in the realized body/weapon behavior, not merely in constants.

### C1 — continuous direct weapon expression

The player continuously expresses weapon intent through aim/drag/orientation while locomotion remains live.

The weapon's realized path is tightly coupled to that continuous input rather than being only a canned strike fired at a chosen angle.

**30-second discriminator:** the player should immediately discover that *how they move the aim during the encounter* changes what the weapon physically does.

**Feniks value if it works:** unusually direct mastery, spatial precision and strong player authorship.

**Primary falsifier:** it feels like steering a cursor-mounted damage wand, lacks body credibility, or creates excessive dexterity burden without better combat decisions.

### C2 — authored intent strikes with live locomotion

The player chooses a discrete strike intent — for example a thrust, compact cut, broad cut or shove-like action — while retaining meaningful control of locomotion during execution.

The trajectory can be authored and legible rather than simulated. The point is to create a strong **simple-system benchmark** against which more physical approaches must earn their complexity.

**30-second discriminator:** success comes from choosing a spatially appropriate action and positioning it, not from manually steering the weapon through the whole stroke.

**Feniks value if it works:** clarity, responsiveness, weapon identity and low implementation/debug complexity without arbitrary full-body animation lock.

**Primary falsifier:** it collapses into ordinary cooldown-button combat, actions feel detached from body/world state, or locomotion makes the authored strike visually/mechanically incoherent.

### C3 — body / momentum coupled strikes

The player's current movement, body turn, weapon mass and attack effort materially shape the realized strike.

Control remains live, but the body cannot instantaneously erase physical commitment. Constraint should be legible and manipulable rather than imposed as `canMove=false`.

**30-second discriminator:** entering the same attack from different movement states produces tactically useful differences that the player can intentionally exploit.

**Feniks value if it works:** weight and embodiment emerge from controllable causality rather than animation lock.

**Primary falsifier:** inertia mainly produces sluggishness, unpredictability or correction fighting, and the player spends effort managing the controller instead of fighting.

### C4 — persistent guard / contact continuum

The weapon has meaningful spatial presence between attacks. Guard orientation, approach, contact, pressure, deflection and transition into an offensive action become part of the same control language.

The experiment must remain game-like; it is not a mandate for continuous rigid-body sword simulation.

**30-second discriminator:** the player begins making decisions *before* pressing attack because weapon/body relation to the opponent already matters.

**Feniks value if it works:** spacing, weapon length, terrain and physical presence can become naturally important without relying on hidden state.

**Primary falsifier:** fiddliness, visual noise, contact jitter or cognitive load dominate the decisions gained.

### Not core hypotheses — deferred orthogonal axes

These may later be crossed with a surviving core language, but comparing them as peers to C1–C4 would repeat the category error:

- **soft focus / aim assist / target assistance** — changes orientation burden and intent interpretation;
- **camera and facing policy** — changes perception/control mapping;
- **evasive movement vocabulary** — hop, sidestep, acceleration/footwork, etc.; no assumed universal roll or i-frames;
- **body/weapon archetype scaling** — heavy vs light bodies, reach, mass, turnability;
- **terrain/contact richness** — walls, narrow passages, soft collision, displacement;
- **hit-fidelity level** — authored volumes vs deeper geometric/physical contact, unless a core hypothesis specifically depends on it.

### Evaluation lens, not a separate combat model

**Footwork** is currently treated as a cross-cutting test: does a candidate naturally make approach, reach, angle, retreat and terrain useful?

A candidate that talks about spatial combat but does not change meaningful footwork has probably failed regardless of how sophisticated its hit resolver is.

The C1–C4 descriptions are **design pressures / corners**, not mutually exclusive taxonomic species. Existing combat systems often combine these properties, so treating them as four independent lanes would create another false experimental structure.

### Discovery method — whole-organism divergence first

Combat Lab is currently in **exploratory discovery**, not mechanism attribution.

The previous three-organism framing was itself falsified before implementation. It conflated two independent questions:

1. how the player expresses combat intent;
2. how body / weapon / world realize that intent.

A discrete authored action can still be resolved through material weapon contact, while continuous input can be realized either kinematically or through coupled dynamics. That missing combination is important enough to deserve its own discovery organism.

The current campaign therefore uses four deliberate corners:

| | Authored / kinematic realization | Material / coupled realization |
|---|---|---|
| **Continuous intent** | **A — DIRECT** | **C — COUPLED DIRECT** |
| **Discrete intent** | **B — ACTIONS** | **D — COUPLED ACTIONS** |

These are extreme research organisms, not mutually exclusive categories for final Feniks combat.

#### A — DIRECT

The player continuously shapes weapon motion with high input authority. The weapon remains body-anchored and spatially factual, but its motion is crisp and kinematic rather than inertia-driven.

Expected natural strategy: directly shape/correct useful weapon paths.

#### B — ACTIONS

The player uses responsive locomotion + aim and selects a tiny authored vocabulary, initially compact cut + thrust.

Expected natural strategy: choose the right action and place it through footwork.

This is the simple benchmark deeper systems must beat.

#### C — COUPLED DIRECT

The player continuously expresses desired weapon/body motion, but the realized result is filtered through body turn, momentum, weapon inertia and contact.

Expected natural strategy: set up motion, preload, step and follow through rather than merely draw a path.

#### D — COUPLED ACTIONS

The player selects the same kind of compact authored intent as B, while material state/contact can alter whether and how the requested motion completes.

Expected natural strategy: choose actions partly by whether the current body/weapon/world relationship gives them room to happen.

This is the missing quadrant and a high-value Feniks hypothesis: **simple game-like input may coexist with material consequences**.

### Why four survive the discriminator gate

- **A vs B:** continuous manipulation vs discrete authored choice under deliberately low-dynamics realization.
- **C vs D:** continuous drive vs discrete action choice under material/coupled realization.
- **A vs C:** similar continuous expression; dynamics must visibly change player strategy or they have not earned themselves.
- **B vs D:** similar discrete surface controls; material resolution must add gameplay value or lose to the simpler authored benchmark.

The campaign specification is authoritative for implementation detail:

- [Discovery Campaign v1](DISCOVERY_CAMPAIGN_V1.md)

### Orthogonal axes remain deferred

Do not silently use these to rescue a weak organism:

- soft focus / aim assist / hard target ownership;
- camera/facing policy changes;
- dodge vocabulary;
- body/weapon archetype scaling;
- shield/stamina/combo systems;
- richer terrain;
- RPG progression.

If an organism only works after one of these is added, record that dependency rather than contaminating the first comparison.

### Shared situation

All four solve the same small fight:

- one responsive embodied player;
- one readable melee opponent applying pressure;
- open room plus one offset pillar / short-wall relation;
- real threat geometry, no i-frames;
- immediate reset;
- enough feedback to understand hit / miss / contact;
- no progression, magic, loot or feature pile.

The situation is shared. Attack engines are not.

### 30-second discriminator

The first campaign is valid only if the Owner naturally begins doing different things:

- **A:** shaping/directing the weapon;
- **B:** selecting/placing actions;
- **C:** setting up and exploiting motion/momentum;
- **D:** selecting actions around material clearance/contact state.

If real play collapses two lanes into the same strategy, that distinction failed even if the implementations differ.

### Discovery before attribution

Multiple coupled mechanics are allowed to differ now because the goal is to discover **where a valuable combat phenomenon exists**.

Only after an organism survives Owner play should the lab isolate narrower variables such as steering rate, hit fidelity, assistance, timing or contact model.

R0 and the LIVE / BOUNDED / CAPTURED spike remain warnings against entering attribution mode before there is anything worth attributing.

## Combat Terrarium execution state

### T0 — terrarium substrate — DONE

The active branch now contains one integrated Ruined Gate world slice with:

- responsive body locomotion;
- persistent sword / spear weapon state;
- static topology with open and constrained space;
- one pressure-producing duelist;
- shared simulation/event spine;
- deterministic rehearsals and soak coverage.

This is substrate, not an accepted combat model.

### T1 — embodied strike/contact loop — MECHANISM-QUALIFIED

Agent-side evidence currently supports:

- movement remains live during attacks;
- wall contact constrains realized weapon motion;
- fresh energetic weapon contact redirects motion;
- sustained weapon contact is causal without becoming a binary global parry;
- damaging geometry is distinct from the spear shaft;
- thrust damage uses directional closing velocity at the actual contact point;
- body motion materially changes realized impact consequence;
- backing away cannot create damaging thrust merely from large absolute speed.

These are mechanism claims only. They do not establish good feel.

#### Same-step hit authority correction — 2026-09-21

A review of the hit resolver found a hidden order bias: the player body hit was applied before the duelist body hit. A lethal player hit could therefore set the duelist to `alive=false` before the duelist's already-committed same-step strike was evaluated, and the first knockback could also contaminate the second impact calculation.

This was corrected by separating **contact measurement** from **consequence application**:

- both body-hit candidates are measured from one shared pre-impact state;
- both committed consequences are then applied;
- legitimate same-step trades survive;
- if both actors die in that shared step, the round resolves as a draw / double-down rather than silently awarding player-first authority.

A deterministic regression test now proves that two simultaneous committed lethal contacts both resolve. The full suite passes 30 / 30, while existing sword/spear rehearsal signatures remain unchanged.

Interpretation boundary:

> This removes an implementation-order artifact. It does not claim that trades are desirable at any particular frequency; their gameplay value remains an Owner-level feel question.

### T2 — pressure / spatial play — ACTIVE

The first accidental Owner exposure produced useful negative/positive evidence:

- hit ownership / combat state was not readable enough;
- opponent pressure was too relentless;
- weight was positively perceived;
- relatively fast lethality / meaningful hits were positively perceived.

The duelist now uses a commit -> breathe/reposition rhythm while remaining dangerous in passive-pressure rehearsal.

Open question:

> does the fight create useful, readable spatial decisions rather than merely mechanically valid collisions?

### T3 — second material setup — ACTIVE, PARTIAL MECHANISM EVIDENCE

Sword and spear now differ through more than damage/range constants:

- spear has greater reach and inertia;
- spear thrust uses an outer damaging region while the shaft remains non-damaging;
- close face-hug range is a real disadvantage for the spear;
- ruined-gate clearance distinguishes spear cut, spear thrust and sword cut;
- movement into / away from a thrust changes consequence.

#### Spear range-control falsifier — 2026-09-21

A first qualification attempt appeared to show that spear combat collapsed almost entirely into face-hug range:

- 18 s terrarium: 201 working-band frames vs 1392 face-hug frames;
- 120 s soak: 1550 working-band frames vs 9779 face-hug frames.

That was **not valid evidence against the spear mechanics**.

Instrumentation showed the rehearsal controller was spending most retreat time blindly pushing into an outer world boundary:

- open-field diagnostic: 1112 / 1277 retreat frames boundary-constrained;
- terrarium: 1505 / 1718 retreat frames boundary-constrained.

A deliberately simple one-step wall-aware space-making policy removed that controller artifact without changing combat laws, weapon tuning, damage or qualification thresholds.

At commit `0a0d38108294b813e62fcd5a74a29b2ab980c414`:

- CI: 29 / 29 PASS;
- 18 s spear terrarium: 658 working-band vs 108 face-hug frames;
- 120 s spear soak: 5102 working-band vs 826 face-hug frames;
- boundary-constrained retreat in the 18 s terrarium fell to 6 frames.

Interpretation boundary:

> This demonstrates that the current spear mechanics can support a materially different range-preserving strategy under competent basic spatial footwork. It does **not** demonstrate that maintaining that range is intuitive, enjoyable, readable or worth mastering for the Owner.

Do not rescue the spear by making the rehearsal increasingly omniscient. The next evidence must keep asking whether ordinary player-understandable movement is enough.

### T4 — presentation / causality — AGENT-SIDE ADEQUATE FOR OWNER PASS

Local HP, hit reactions, damage numbers and explicit prototype hit-ownership feedback were added after the accidental Owner exposure.

The presentation pass now distinguishes:

- damage dealt vs damage taken through semantic color / emphasis;
- local impact on the body that actually received the hit;
- simultaneous same-step trades as `TRADE · DEALT … · TOOK …` rather than allowing the last event to overwrite the first;
- lethal simultaneous contacts as `DOUBLE DOWN`.

The backtick debug remains separate from normal play and now records the most recent body hit / blade clash / wall contact, highlights its world-space location and reports impact speed where the resolver has a meaningful speed value.

Still deliberately unproven until Owner play:

- whether representative hits/misses are actually legible at combat speed with debug off;
- whether the feedback hierarchy is perceptually sufficient rather than merely present;
- whether weapon weight and causality feel understandable rather than instrumented.

### T5 — agent rehearsal — QUALIFIED FOR THIS OWNER PASS

Current agent-side gate includes:

- syntax/runtime tests;
- deterministic duel rehearsals;
- passive-pressure rehearsal;
- gate-clearance discriminator;
- open-field range-control falsifier;
- multi-minute soak;
- deployment provenance controls.

A green agent gate is necessary but not sufficient for Owner eligibility.

### T6 — Owner evidence — REJECTED

The Owner played the exact provenance-verified candidate at `47210b16cc9a32d2d53ca42875ca7af5c6b318b3` and supplied a ~26 s recording.

**Result: FAIL AS A COMBAT ORGANISM.**

The Owner's direct judgement was that it remained effectively unplayable, very bad and not remotely good enough to continue by tuning.

Video-level observations:

- the Owner remained on the sword rather than naturally exploring the second weapon;
- close engagement repeatedly collapsed into the same adhesive melee swirl;
- a won exchange did not produce a richer second encounter — the same basic fight shape returned;
- Ruined Gate geometry existed but rarely became an interesting player decision;
- hit ownership feedback explained events better, but did not create richer agency.

Interpretation:

> The Terrarium became a better-instrumented and more mechanically defensible version of an organism whose possibility space was still too poor.

Do **not** respond by tuning:

- aggression;
- damage;
- sword timing;
- recovery;
- spear range;
- HP;
- feedback intensity.

Preserve useful donors:

- movement remains live during attacks;
- causal weapon/world contact;
- directional body-motion contribution to impact;
- exact-SHA deployment/provenance;
- same-step symmetric hit authority;
- positive Owner signal for weight and relatively fast consequence.

Demote everything else back to hypothesis.

The next active phase is **Phenotype Combat Ecology refoundation**. See `FENIKS_COMBAT_REFOUNDATION_2026-09-21.md`.

## Owner evidence — accidental early exposure, 2026-09-21

The Owner played a still-pre-qualification Ruined Gate build before being asked to test it. This is **valid evidence about that build**, not acceptance of the terrarium.

Observed Owner feedback:

- combat state / hit ownership was not readable enough; the Owner initially felt they were continuously losing and only near the end used HP to infer who was actually ahead;
- the opponent felt too aggressive and pressed too continuously;
- the sense of **weight** was positively received;
- relatively **fast lethality / meaningful hits** was positively received;
- Mount & Blade and Exanima are useful here primarily as philosophical references for weight, consequence and meaningful contact, **not as combat systems to copy**.

Immediate response:

- preserve lethality instead of solving pressure with HP inflation;
- introduce commit -> breathe/reposition rhythm in the duelist;
- make hit ownership locally explicit during prototyping;
- keep developing world-grounded weapon/space consequences.

External corroboration found during follow-up research: Bare Mettle's September 2026 Exanima notes describe an AI regression where improved AI "attacked almost relentlessly", which they judged less fun and corrected by reducing aggression / increasing behavioral variety. This supports the general pressure-rhythm lesson, not direct imitation of Exanima.

## Active experiment checkpoint — Phenotype Combat Ecology v0

Active branch:

- `experiment/phenotype-combat-ecology-v0`

Current evidence:

- P0 shared phenotype substrate is mechanism-qualified;
- ordinary equipment burden continuously changes the same body's movement/contact derivation;
- brace trades mobility/turn authority for physical contact authority without immunity;
- body contact transfers closing motion;
- shield is occupied frontal geometry and transfers motion rather than applying a hidden damage reduction state;
- actual corridor geometry admits the light body and blocks the heavy body;
- Bulwark, Skirmisher and continuity hybrid use one shared compact weapon family and one shared authored strike;
- a threshold-free strategy matrix produced the first mechanical crossover:
  - Bulwark frontal crossing: 1.667 s, 100 HP, 2 shield blocks; tight side-route failed;
  - Skirmisher frontal crossing: 1.183 s, 32 HP after 2 hits;
  - Skirmisher tight side-route: 1.100 s, 100 HP, 0 hits;
  - continuity hybrid crosses frontally but does not fit the tight side-route.

Interpretation boundary:

> This is evidence that shared body + equipment + posture + world rules can mechanically create different strategy value without hard class authority. It is **not** evidence that the resulting play is intuitive, satisfying or Feniks-worthy.

Interactive P1 state:

- exact agent-rehearsal deploy SHA: `90f8e8886d024c69001f0f699fa593d6d6d67711`;
- CI passed;
- Pages build provenance verified exact SHA;
- static public fetch verified the P1 HTML;
- real browser module execution / visual render was **not qualified** because the Opera Browser Connector became unavailable during the rehearsal;
- therefore P1 remains **NOT OWNER-ELIGIBLE**.

Public truth should remain `main` until browser/runtime rehearsal and the next product-integrity gate are actually defended.

## State invariant

A failed specimen is evidence, not a foundation.

Combat Lab should prefer a clean reset over accumulating mechanics around an unearned direction.
