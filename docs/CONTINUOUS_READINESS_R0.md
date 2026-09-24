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
