# EXCHANGE GRAMMAR E0b — SET / DRIVE

**Date:** 2026-09-24  
**Status:** active hypothesis card; implementation not started  
**Owner play:** not eligible  
**Parent evidence:** E0 v0 FAIL; ACCESS + material DRIVE retained

## 0. Research question

E0 v0 established two useful facts:

- a local ACCESS stake can make retreat concede something without stamina or backwards-speed punishment;
- a materially realized DRIVE can change access outcome.

It also failed as an exchange grammar:

- blind forward DRIVE solved BREACH across 7 / 7 broad lateral starts;
- captured commitment direction behaved identically to homing;
- DRIVE had almost pure upside relative to the BREACH objective.

The next question is therefore:

> **Can a persistent directional support/contact relation exist before commitment, so DRIVE must negotiate or sacrifice spatial authority instead of acting as a universal forward shove?**

Working pair:

> **SET / DRIVE**

This is a diagnostic exchange law, not a proposed Feniks move list.

---

## 1. Explicit non-inheritance from O1 brace

E0b must not become O1 with the shield removed.

O1 tested:

- heavy/shield phenotype;
- multi-pressure combat;
- shield occupancy;
- brace posture;
- lethal compact offense;
- HOLD / BREAK as a role fantasy.

E0b tests only:

- two comparable bodies;
- no weapon;
- no HP;
- no damage;
- no shield geometry;
- one wide ACCESS relation;
- one shared support/contact law.

No claim about tanks, classes or final stances is allowed.

---

## 2. ACCESS remains the contested value

Retain the successful E0 donor.

### DENY

The adversary tries to cross the access line behind the player.

### BREACH

The player tries to cross the access line behind the adversary.

Same wide open field.

No doorway.

No capture meter.

No world boundary pressure.

Retreat remains legal and keeps its already-demonstrated consequence:

- defender retreat can concede access;
- breacher retreat concedes progress.

Do not change ACCESS while testing SET / DRIVE.

---

## 3. SET — a directional support relation, not a block state

SET expresses:

> **I am currently organizing my body/support to resist contact along this facing relation.**

It does not mean:

- invulnerable;
- immovable;
- parrying;
- damage reduction;
- infinite mass;
- collision disabled;
- attack cancelled.

### 3.1 Continuous directional law

SET must affect contact through a continuous alignment term.

Candidate law:

- derive contact normal from actual body/contact geometry;
- derive support direction from actor facing;
- calculate alignment from the dot product between incoming contact and support direction;
- high frontal alignment increases ground-supported resistance to yield;
- oblique contact gets less support;
- side/rear contact approaches ordinary body response.

No branch such as:

`if SET && frontal => block`

is allowed.

The implementation may expose a scalar support contribution for measurement, but it must be derived from geometry.

### 3.2 No global mass multiplier

SET does not alter the actor's world mass.

The body remains the same mass for:

- ordinary body contact;
- unrelated directions;
- future projectile/body interactions;
- all non-supported relations.

Support participates only in the specific realized contact relation.

### 3.3 SET is persistent and readable

While SET is held:

- the support direction persists in world space through actor facing;
- locomotion remains live;
- facing remains controllable;
- the actor may yield under sufficient contact;
- turning takes finite time;
- the relation exists before DRIVE arrives.

No timing-window parry.

---

## 4. Cost of SET

SET needs a real cost or it becomes a universal defense button.

Initial candidate cost is **authority trade**, not a meter:

- translation acceleration remains available but reduced moderately;
- turn authority remains available but reduced moderately;
- top speed is not arbitrarily clamped to zero;
- leaving SET restores ordinary locomotion immediately or with only physical carried velocity.

This is diagnostic.

The intended cost is:

> **a strongly supported direction is harder to reposition quickly.**

Do not add stamina.

Do not add a support health bar.

Do not add cooldown for entering SET.

The support law itself must carry the value.

---

## 5. DRIVE now sacrifices support

Retain E0's material DRIVE donor with one structural change:

> **during DRIVE prepare / commit / recover, SET support is unavailable.**

The actor chooses between:

- maintaining directional support;
- committing forward consequence.

This creates a potential exchange trade:

- SET can resist a badly chosen DRIVE;
- DRIVE can exploit poor SET orientation;
- DRIVE gives up its own support and can therefore lose the next relation if it commits badly.

Movement remains live throughout.

Captured DRIVE direction remains required.

Homing is an ablation only.

---

## 6. Contact resolution

Two sources may contribute to one contact:

- ordinary body inertia/mass;
- directional ground support from SET.

The contact resolver should remain symmetric.

A useful conceptual form:

> **realized yield = body response modified by directional support available in that exact contact.**

Not:

> defender wins because SET has priority over DRIVE.

### 6.1 DRIVE into aligned SET

Expected possibility, not guaranteed outcome:

- defender yields less;
- attacker may lose forward velocity / be redirected / remain outside access;
- both bodies still move;
- no stun or forced cancel.

### 6.2 DRIVE into misaligned SET

Expected:

- support contribution falls continuously;
- attacker can gain angle / access;
- defender may need to turn, move or abandon SET.

### 6.3 DRIVE vs DRIVE

Same-step symmetry remains.

Neither side gets execution-order priority.

### 6.4 SET vs ordinary movement

SET should not create remote threat or force.

No contact, no effect.

---

## 7. Initial control vocabulary

Diagnostic controls:

- responsive WASD;
- free facing;
- hold SET;
- tap/press DRIVE when not SET;
- no simultaneous SET + DRIVE authority;
- no dodge;
- no block/parry;
- no damage;
- no target lock;
- no stamina.

For automated rehearsal, SET and DRIVE are explicit intent inputs.

No policy receives privileged future knowledge.

---

## 8. Desired phenomenon

E0b is looking for a relation such as:

> **I cannot just shove forward. I need to notice how the other body is supported, decide whether to challenge that line, move around it, or force them to reorient.**

For the defender:

> **holding a useful direction matters, but if I point support badly or chase too aggressively I give up the line.**

For the breacher:

> **a direct DRIVE can be correct against poor support, but blindly repeating it into good support should lose time/position and create an exploitable afterstate.**

---

## 9. Inherited afterstate

One exchange must make the next decision different.

Candidate evidence:

- failed DRIVE leaves attacker outside the access line and laterally displaced;
- defender held the line but was pushed off-center and must choose whether to re-SET or reposition;
- angled DRIVE moves past the support axis and creates a new side relation;
- defender rotates to meet one angle and exposes another;
- DRIVE vs DRIVE leaves both unsupported in a changed relation.

The afterstate must persist through ordinary positions/velocities/facing.

No hidden advantage token.

---

## 10. Pre-registered hard falsifiers

### Static SET wall

FAIL if:

- holding SET in the middle denies every wide-start BREACH;
- movement / orientation do not matter;
- SET behaves like infinite mass.

### SET bubble

FAIL if:

- defender can rotate support fast enough that frontal support effectively follows every approach without cost;
- directional geometry becomes omnidirectional defense.

### Blind DRIVE survives

FAIL if:

- forward + DRIVE whenever ready again crosses most/all lateral starts regardless of SET.

### SET spam

FAIL if:

- rapidly toggling SET / DRIVE is better than maintaining readable intent;
- SET entry timing becomes a parry minigame.

### DRIVE damage proxy

FAIL if:

- forward impulse alone remains the only relevant source of progress;
- support only changes time-to-cross by a tiny amount while all policies still cross.

### No orientation value

FAIL if:

- directional SET and omnidirectional support produce the same strategy;
- captured DRIVE and homing DRIVE remain behaviorally identical after genuine angle pressure exists.

### Immobilized defender

FAIL if:

- SET only works because it effectively removes locomotion;
- the defender feels like a wall fixture rather than a controllable body.

### Contact noise

FAIL if:

- jitter / repeated micro-overlap decides access;
- material response is hard to attribute.

### One-script solution

FAIL if:

- one fixed left/right maneuver solves the full start sweep.

---

## 11. Required ablations

Before promotion, compare matched situations with the same opponent policy.

### A. No SET support

SET input exists but contributes zero directional support.

Purpose:

> prove the effect is not merely slower SET locomotion.

### B. Omnidirectional support

Keep support magnitude but remove orientation dependence.

Purpose:

> prove directional relation matters.

### C. No SET movement cost

Full locomotion while SET.

Purpose:

> determine whether the trade depends on mobility cost or on contact law itself.

### D. DRIVE keeps support

Allow DRIVE to retain SET support.

Purpose:

> prove sacrificing support contributes to commitment.

### E. Homing DRIVE

Allow commit direction to track.

Purpose:

> prove captured direction matters once SET creates angle pressure.

### F. No DRIVE material consequence

Action state exists but carry/contact contribution is zero.

Purpose:

> retain E0's evidence boundary.

### G. Movement-only

No SET / DRIVE authority.

Purpose:

> ensure the organism is not just body-collision access wrestling.

---

## 12. Broad-start matrix before any tuning claim

At minimum sweep lateral starting separation across:

- -300;
- -180;
- -90;
- 0;
- +90;
- +180;
- +300 px.

Test mirrored DENY and BREACH.

Candidate policy families must include:

- blind direct DRIVE;
- static SET;
- SET tracking;
- angled approach;
- angle switch / feint-like reposition without hidden AI reads;
- yield / re-SET;
- movement-only;
- retreat.

Do not require one policy to win every cell.

The goal is a possibility surface.

---

## 13. E0b promotion gate

E0b is agent-side possibility-qualified only if all of these hold:

- blind BREACH DRIVE no longer solves the broad sweep;
- static SET does not solve the broad sweep;
- at least three materially distinct response families are useful in each mirrored role;
- directional SET outperforms / differs from omnidirectional ablation in a way traceable to angle;
- SET support effect survives removing its movement cost;
- DRIVE support sacrifice matters relative to retaining support;
- captured DRIVE differs from homing when angle pressure exists;
- movement-only does not reproduce the same matrix;
- retreat keeps its ACCESS concession;
- no world-boundary dependence;
- no HP/damage required;
- inherited afterstate changes subsequent choice rather than resetting immediately.

If this gate fails:

> **do not reintroduce damage and do not tune constants into a favorable matrix.**

---

## 14. Owner boundary

Even a clean E0b pass would not be Owner-test ready.

Machine evidence may qualify:

- directional support math;
- contact/yield attribution;
- broad policy divergence;
- no boundary / script artifact;
- same-step symmetry.

It cannot qualify:

- whether SET feels intuitive;
- whether DRIVE feels satisfying;
- whether the exchange feels like combat;
- whether the relation is readable at human speed;
- whether this belongs in Feniks.

Those remain future Owner evidence after a real playable organism exists.

---

## Working invariant

> **Commitment should gain one relation by giving up another.**
