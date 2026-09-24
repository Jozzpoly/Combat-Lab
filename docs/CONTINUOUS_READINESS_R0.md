# CONTINUOUS READINESS R0 — No Auto-Neutral Causal Kernel

**Date:** 2026-09-25  
**Status:** active hypothesis card; pre-implementation  
**Owner play:** not eligible  
**Source:** `PERSISTENT_AFTERSTATE_READINESS_AUDIT_2026-09-25.md`

## 0. Purpose

R0 asks one mechanism-level question before another combat organism is allowed:

> **Can the physical result of one action remain the meaningful starting condition of the next action without turning control into manual physics work?**

This is deliberately narrower than combat.

R0 contains:

- one controllable body;
- one continuously simulated weapon/tool state;
- simple static contact fixtures;
- deterministic action sequences;
- no HP;
- no opponent AI;
- no win/lose objective;
- no class/progression system.

If this kernel fails, do not hide the failure inside an encounter.

---

## 1. The missing property

Prior donors often stored physical state:

- weapon angle;
- weapon velocity;
- body displacement;
- contact velocity.

But their controller semantics restored:

- canonical guard;
- idle reach;
- attack `idle`;
- pressure `approach`.

R0 removes that automatic semantic reset.

Working invariant:

> **The result of one exchange should be the physical starting condition of the next, not a disturbance that the controller automatically erases.**

---

## 2. Player-intent surface — GUIDE + COMMIT

This is a diagnostic control contract, not a final Feniks input scheme.

### GUIDE

The cursor / aim direction continuously expresses:

> **where I want the weapon to become useful.**

GUIDE applies bounded handling authority toward that intent.

It may:

- turn / redirect the weapon;
- manage extension within a bounded useful range;
- damp uncontrolled energy.

It must not:

- teleport weapon pose;
- snap to a canonical guard;
- instantly erase angular/radial velocity;
- fully converge different inherited states before the next decision window.

GUIDE is allowed to make the weapon manageable.

It is not allowed to make prior contact irrelevant.

### COMMIT

COMMIT expresses:

> **use the weapon from where it physically is now toward the currently intended relation.**

On commit start:

- intent direction is captured;
- weapon pose is **not** reset;
- weapon velocity is **not** reset;
- body locomotion remains live;
- commit adds a bounded temporary authority/energy contribution from the inherited state.

During commit:

- captured intent does not home;
- ordinary GUIDE authority is reduced or suspended enough that it cannot rewrite commitment;
- world contact remains authoritative;
- no scripted animation path is imposed.

After commit:

- no authored recovery trajectory;
- no canonical guard target;
- weapon remains in the state physically produced by action/contact;
- GUIDE resumes ordinary finite authority.

This is the central R0 difference from Terrarium.

---

## 3. Weapon state

Minimum continuous state:

- world-space or body-relative angle;
- angular velocity;
- reach / extension;
- radial velocity;
- current GUIDE intent;
- commit state / remaining commit authority;
- wall-contact episode state.

No hidden:

- opening token;
- combo index;
- guard-side enum deciding outcome;
- frame-advantage state;
- poise meter.

A state difference must be explainable through actual pose / motion.

---

## 4. Locomotion boundary

Body locomotion remains responsive.

R0 must not obtain persistence by making the body sluggish.

Required property:

> **the player can change body movement immediately while weapon readiness still carries history.**

This deliberately separates:

- locomotion responsiveness;
- weapon/tool readiness persistence.

Body motion may contribute to weapon point velocity later, but R0 does not need damage.

---

## 5. Contact fixtures

R0 needs only enough world to create different first-action outcomes.

### FREE

No contact.

The commit misses / completes in open space.

### WALL

A solid wall intercepts the weapon.

Wall contact:

- constrains geometry;
- changes angular/radial motion;
- does not create a hidden blocked state.

### OBLIQUE WALL

A differently placed/oriented contact causes another deterministic inherited pose.

Optional only if FREE vs WALL is not enough to distinguish state family.

### PASSIVE TOOL/BLADE

A static or mechanically simple opposing segment may later create clash-style redirection.

Do not add an AI opponent in R0.

---

## 6. Core two-action experiment

Every R0 claim must survive this sequence.

1. Begin from one identical initial body + weapon state.
2. Use identical first COMMIT intent.
3. Environment causes different realized outcome:
   - FREE;
   - WALL;
   - optional OBLIQUE / passive-tool contact.
4. Give the system the **same bounded inter-action interval**.
5. Keep body movement / GUIDE input controlled and identical unless a specific ablation says otherwise.
6. Issue an identical second COMMIT intent.
7. Compare the realized second action.

Required phenomenon:

> **the second action must materially differ because the first action left a different readiness state.**

Useful measurable differences may include:

- starting weapon angle;
- starting angular/radial velocity;
- path swept by second commit;
- time to cross an intended line;
- maximum useful reach;
- wall/contact outcome;
- required guide work before second commit.

The experiment fails if the difference is only a debug epsilon.

---

## 7. AUTO-NEUTRAL ablation — mandatory

Create an explicit old-style control condition.

After first action:

- apply an authored spring toward one canonical guard angle / idle reach;
- use enough authority to restore the old neutral-attractor behavior.

Then run the same second action.

Required comparison:

- **NO AUTO-NEUTRAL:** FREE and WALL histories remain materially different;
- **AUTO-NEUTRAL:** those histories converge substantially before the second action.

This proves that divergence comes from inherited readiness, not unrelated geometry.

Do not tune AUTO-NEUTRAL to be intentionally bad.

It should be a competent version of the prior architecture.

---

## 8. GUIDE authority sweep — controller-chore boundary

R0 must not choose one magic guide constant.

Sweep broad GUIDE authority.

Expected regimes:

### Too weak

- state persists;
- control becomes maintenance / physics puppeteering;
- recovery to useful relation takes excessive work/time.

FAIL as product direction even if persistence is strong.

### Too strong

- cursor aim instantly erases inherited state;
- FREE/WALL histories converge before second action;
- auto-neutral effectively returns through aim.

FAIL.

### Candidate middle regime

- body control remains responsive;
- weapon is predictably guideable;
- history survives long enough to change the next action;
- intentional recovery/conversion is possible in bounded time.

Machine evidence may locate such a regime.

Only Owner play could later say whether it feels good.

---

## 9. Intentional conversion / recovery test

Persistence must not mean being trapped in a bad state.

From a WALL-displaced readiness state, test a simple deliberate GUIDE input.

Required evidence:

- player intent can move weapon toward another useful relation;
- conversion takes finite, predictable work/time;
- locomotion remains available;
- no canonical guard is required;
- the system does not oscillate / explode.

Compare:

- passive no-input / unchanged intent;
- deliberate re-guide;
- instant-snap ablation.

The target is:

> **history matters, but agency can transform history.**

---

## 10. Instant-aim-erasure falsifier

After the first outcome, sharply rotate cursor/body intent.

FAIL if:

- readiness immediately becomes equivalent across FREE/WALL histories;
- weapon teleports or gains enough authority that prior state ceases to matter before a meaningful decision window.

This test is separate from AUTO-NEUTRAL.

It asks whether **player aim itself** accidentally recreates the neutral attractor.

---

## 11. Stability / physics-mush gate

Run deterministic multi-action soak.

Required:

- finite state;
- no energy pumping from repeated wall contact;
- no uncontrolled angular acceleration;
- no persistent interpenetration;
- no tiny numerical differences producing qualitatively chaotic paths;
- repeated identical input from identical state reproduces identical result.

Contact episode handling may damp or dissipate energy.

It must not secretly reset pose to neutral.

---

## 12. Passive-hazard boundary

The weapon may occupy real geometry.

R0 must not accidentally imply:

> **persistent pose = passive damage/block aura.**

There is no damage in R0.

A later organism must separately earn:

- when contact is threatening;
- when damage authority exists;
- whether a held pose can intercept.

R0 tests readiness state only.

---

## 13. What counts as a meaningful inherited state

A state is **not** meaningful merely because angle differs numerically.

At least one of these must be true:

- identical second COMMIT follows a materially different path;
- identical second COMMIT reaches useful alignment at materially different time;
- one history can contact a fixture/target that the other cannot;
- one history makes another simple action family naturally more available than the other;
- deliberate GUIDE work required to recover differs substantially.

Do not define arbitrary pass thresholds before observing broad-scale behavior.

First map the effect, then set qualification bounds.

---

## 14. Anti-goals

Do not turn R0 into:

- Exanima-like manual arm simulation;
- Mount & Blade directional attack/block clone;
- mouse gesture combat;
- combo tree;
- fighting-game frame-state system;
- stamina/poise test;
- animation lock;
- physics sandbox with no intent layer;
- one optimal neutral guard;
- slower controls disguised as commitment.

Do not add:

- HP;
- damage;
- opponent AI;
- progression;
- terrain puzzle;
- multiple weapons;

before the causal kernel survives.

---

## 15. Feniks relevance if the kernel survives

R0 would provide a new substrate for later discovery.

### Weapon identity

Different equipment could vary:

- handling authority;
- inertia;
- useful state transitions;
- coverage;
- reach;
- wall/contact recovery.

Identity comes from how state evolves, not only DPS/range.

### Classless specialization

A character may become good at:

- redirecting heavy tools;
- maintaining coverage while moving;
- recovering useful state;
- converting one readiness relation into another.

Shared properties / learned techniques can produce roles without class flags.

### Progression

Growth can deepen play through:

- handling;
- recovery authority;
- transition skill;
- movement-under-equipment;
- learned state conversions;

rather than pure damage scaling.

### Co-op

Persistent exposure/coverage can create windows one actor makes and another uses.

### Terrain

Wall / obstruction contact can affect future readiness rather than merely cancel one attack frame.

These are future pressures only.

---

## 16. Promotion gate

R0 becomes **causal-kernel qualified** only if all hold:

- FREE vs WALL first outcomes create deterministic, materially distinct inherited readiness;
- identical second COMMIT materially differs because of that history;
- AUTO-NEUTRAL ablation collapses much of that divergence;
- a broad GUIDE-authority sweep contains at least one nontrivial regime between chore and instant erasure;
- intentional GUIDE can transform bad readiness without canonical reset;
- locomotion remains responsive throughout;
- sharp aim changes do not instantly erase history in the candidate regime;
- multi-action soak remains stable and reproducible;
- no HP/damage/opponent is needed to create the effect.

This is **not** Owner eligibility.

After R0:

> **only then design a minimal opponent exchange where persistent readiness must compete with real pressure.**

---

## Working invariant

> **Simple intent, inherited physical state, no automatic semantic reset.**


---

## 17. R0 result — CAUSAL KERNEL QUALIFIED, HUMAN HANDLING UNPROVEN

Final agent-side evidence checkpoint:

- first kernel: `558c5984dad4394f0d850afcba0888fa1a5b935d`;
- broad GUIDE mapping correction: `ac28a9b636d7b3d6b7c127be9d00f9ae076a589b`;
- pose / velocity attribution + persistence lifetime: `44f264d6c70b8c2cbdafbb301d10373effe09876`;
- matched neutral / control tradeoff / repeated-contact stability: `eceb858fa25944c3c09e0eaf27358d2c76007fa0`;
- deterministic suite: **12 / 12 PASS**;
- Owner play: **NOT REQUESTED**.

### 17.1 First outcome changes the actual next action

With GUIDE authority `0.38` and a 0.24 s inter-action interval:

**FREE first commit**
- second-start angle: 2.469 rad;
- angular velocity: 4.000;
- reach: 91.15;
- second commit path: **2.583 rad**.

**WALL first commit**
- one real wall impact;
- second-start angle: 0.214 rad;
- angular velocity: 4.144;
- reach: 85.29;
- second commit path: **1.019 rad**.

Composite readiness distance before the identical second commit:

- **2.537**.

Thus:

> **an identical second intent no longer starts from an equivalent semantic/physical state.**

### 17.2 The effect is not only residual inertia

Matched attribution after the first outcome:

- full inherited state: **2.537** readiness distance;
- pose-only, with angular/radial velocity deliberately zeroed: **1.393**;
- velocity-only, with pose/reach deliberately equalized: **1.705**;
- pose + velocity both erased: **0.000**.

Pose-only second paths remain different:

- FREE history: 1.568 rad;
- WALL history: 0.993 rad.

Therefore:

> **persistent readiness is carried by configuration as well as residual kinetic energy.**

This rejects the narrow explanation "the system only remembers because the weapon is still moving."

### 17.3 History decays naturally under ordinary GUIDE

At GUIDE authority `0.38`, FREE/WALL readiness distance after equal inter-action intervals:

- 0.00 s: 2.816;
- 0.08 s: 2.831;
- 0.16 s: 2.737;
- 0.24 s: 2.537;
- 0.40 s: 2.525;
- 0.65 s: 1.514;
- 1.00 s: 0.433;
- 1.60 s: 0.077;
- 2.50 s: 0.011.

The relation is therefore persistent but not permanent.

The early curve is dynamic / oscillatory rather than a monotonic scalar cooldown, which is expected for a continuous state and must remain a future feel/readability risk.

### 17.4 AUTO-NEUTRAL erases history much faster

Matched-time comparison at the same GUIDE reference:

| interval | inherited GUIDE | AUTO-NEUTRAL | ratio |
|---:|---:|---:|---:|
| 0.08 s | 2.831 | 1.974 | 0.697 |
| 0.16 s | 2.737 | 2.195 | 0.802 |
| 0.24 s | 2.537 | 1.963 | 0.774 |
| 0.40 s | 2.525 | 0.409 | 0.162 |
| 0.65 s | 1.514 | 0.041 | 0.027 |
| 1.00 s | 0.433 | 0.001 | 0.003 |

AUTO-NEUTRAL is not instantly convergent because it remains a physical spring rather than a teleport.

But after a short physical transient it overwhelmingly restores equivalence.

This supports the neutral-attractor diagnosis.

### 17.5 Control authority exposes a broad tradeoff, not one magic value

Machine-side mapping:

| GUIDE authority | history at 0.24 s | deliberate wall-state recovery |
|---:|---:|---:|
| 0.08 | 4.137 | 0.767 s |
| 0.18 | 3.929 | 0.442 s |
| 0.38 | 2.537 | 0.275 s |
| 0.75 | 2.172 | 0.142 s |
| 1.25 | 1.442 | 0.100 s |
| 2.00 | 1.014 | 0.075 s |
| 3.50 | 0.812 | 0.050 s |
| 6.00 | 0.738 | 0.042 s |

This is **not** a feel qualification.

It demonstrates only that the kernel does not force the binary choice:

- "history matters but weapon is unrecoverable";
- "weapon is controllable but history instantly disappears."

A broad machine-side region contains both measurable history and bounded intentional conversion.

Which part, if any, feels good remains Owner evidence later.

### 17.6 Sharp aim does not instantly erase readiness

At GUIDE authority `0.38`, after sharply changing aim and allowing 0.08 s:

- FREE vs WALL second-start readiness distance: **3.453**.

Thus the ordinary aim layer is not acting as an instantaneous hidden reset in the tested regime.

### 17.7 Locomotion remains independent and responsive

During active COMMIT:

- body movement remained live;
- deterministic test reached >150 movement speed and >20 units translation during the short action window.

R0 did not obtain weapon-state persistence by locking locomotion.

### 17.8 Repeated material contact is stable

Stationary 20 s wall-contact soak:

- **21 fresh wall impacts**;
- max angular speed: **7.181**;
- max radial speed: **61.262**;
- reach remained bounded: 82.08–92.89;
- finite state throughout;
- exact deterministic repeat reproduced the same result.

No energy pumping was observed in this diagnostic.

### 17.9 Evidence boundary

R0 now qualifies these mechanism claims:

- no-auto-neutral continuous readiness can exist stably;
- first-action environment/contact can change the actual starting state of the next action;
- inherited pose itself matters independently of residual velocity;
- ordinary finite GUIDE can transform readiness without requiring a canonical guard;
- stronger GUIDE progressively trades history for faster intentional recovery;
- explicit AUTO-NEUTRAL recreates the older convergence behavior;
- body locomotion can remain responsive while weapon readiness persists.

R0 does **not** qualify:

- intuitive controls;
- satisfying weapon feel;
- human readability;
- desirable mental load;
- a good combat exchange;
- a Feniks weapon model;
- any damage/hit-authority model.

### 17.10 Promotion decision

Status:

> **CONTINUOUS READINESS R0 = CAUSAL-KERNEL QUALIFIED.**

Owner eligibility:

> **NO.**

Next frontier:

> **design the smallest adversarial pressure cell that can falsify whether inherited readiness creates a real choice under pressure rather than merely different deterministic trajectories.**

Do not add HP/damage yet.

Do not build a full combat organism yet.

