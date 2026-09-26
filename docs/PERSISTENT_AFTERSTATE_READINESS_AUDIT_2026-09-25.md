# Persistent Afterstate / Readiness Audit

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> This file preserves the research state at its date. Any `active`, `current` or `next` wording below is historical. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Date:** 2026-09-25  
**Status:** active synthesis; implementation not authorized by this document  
**Scope:** Combat Lab -> Feniks combat discovery  
**Owner play:** not requested

## 0. Research question

After E0 and E0b failed, the highest-value unresolved question became:

> **Why do mechanically meaningful contacts keep returning toward neutral pursuit instead of leaving a legible state that changes the next decision?**

This audit re-reads the exact rejected Terrarium implementation and preserved O1/O2 donors rather than inferring from their summaries.

The key distinction is:

> **persistent physics is not the same thing as persistent readiness.**

Several prior organisms preserved physical state for a short time.

Very few made the result of one exchange materially determine what could be done well next.

---

## 1. Three kinds of persistence

### 1.1 Physical persistence

Examples:

- body position;
- body velocity;
- weapon angle;
- weapon angular velocity;
- weapon reach;
- displacement after contact.

Prior Combat Lab work often had this.

### 1.2 Controller persistence

Question:

> **does the control system continue to respect the state produced by the previous exchange, or immediately attract the actor back toward an authored neutral target?**

Examples of neutral attractors:

- idle guard angle;
- idle spear reach;
- generic approach state;
- action phase timer returning to `idle`;
- AI recovery timer returning to `approach`.

Prior work often used these.

### 1.3 Decision persistence

Strongest form:

> **does the inherited state make the next useful decision different?**

Examples:

- weapon displaced to one side changes which follow-up is naturally available;
- a missed heavy commitment leaves a body/weapon relation that can be exploited;
- a clash changes coverage rather than merely playing an impact event;
- yielding ground preserves one line but loses another;
- recovering the weapon / support relation is itself a choice;
- an ally can exploit an opening created by another actor's prior exchange.

This is the least-demonstrated layer in the campaign.

---

## 2. Exact Terrarium evidence — persistent dynamics, authored neutral target

Owner-tested source:

- exact SHA: `47210b16cc9a32d2d53ca42875ca7af5c6b318b3`.

### 2.1 Weapon state was physically continuous

Terrarium stored:

- `weapon.angle`;
- `weapon.angularVelocity`;
- `weapon.reach`;
- `weapon.radialVelocity`;
- last segment;
- persistent contact episode state.

Wall and blade contact changed these values causally.

Fresh blade clash:

- reverses / modifies angular velocity;
- modifies radial velocity;
- pushes both bodies.

Sustained blade contact:

- damps motion rather than emitting repeated binary parries.

Body hit:

- pushes the target body;
- damps attacker weapon angular/radial velocity.

These are real donor mechanisms.

### 2.2 But readiness target was authored independently of contact result

When no attack is active, `actionTargets()` always returns:

- angle = body facing + authored guard offset;
- reach = idle reach;
- phase = guard.

During recovery, cut/thrust targets interpolate back toward authored guard / idle reach.

When the action timer completes:

- `weapon.action = null`;
- cut flips guard side;
- `hitRegistered` resets.

The spring controller then keeps driving the weapon toward the authored target through:

- angle spring `angleK`;
- angular damping `angleD`;
- reach spring `reachK`;
- radial damping `reachD`.

Therefore:

> **clash / wall / hit changed actual weapon state, but not the state the controller considered desirable next.**

Physical afterstate became a temporary disturbance around a predetermined neutral attractor.

### 2.3 Hit outcome did not author the next weapon relation

`applyWeaponHit()`:

- damages target;
- pushes target;
- damps weapon velocity.

It does **not**:

- create a new guard/readiness pose;
- change the next legal attack family;
- create a material exposed side;
- preserve a meaningful weapon line as the next starting condition.

The same authored action continues until its timer ends.

### 2.4 AI breathing phase was authored recovery, not inherited readiness

Duelist AI did improve rhythm.

After attack:

- `recoveryTimer` is set;
- AI disengages / resets / measures;
- when timer ends it returns toward ordinary approach/set logic.

This solved relentless pressure better than face-hugging.

But the recovery behavior mostly depends on:

- timers;
- distance;
- ordinary navigation.

It does not derive a new tactical readiness state from the exact blade/body outcome.

This is useful cadence donor evidence, not persistent afterstate.

---

## 3. O1 HOLD / BREAK evidence — contact truth plus timer reset

Final exact diagnostic source:

- `c69d609408ccfc7527472b9afe5bad4b75658134`.

### 3.1 Shield / brace were material

O1 successfully demonstrated:

- persistent frontal shield geometry;
- directional coverage;
- brace affecting contact yield;
- side/rear bypass;
- body displacement.

Those remain valid donors.

### 3.2 Player attack was still a timer island

Player attack:

- idle;
- windup;
- active;
- recover;
- idle.

At recovery completion:

- phase returns to `idle`;
- timer becomes zero;
- hit set clears.

The result of the strike does not choose the next readiness relation.

### 3.3 Pressure contact recovery was explicitly state-machine authored

On body hit:

- pressure body enters `recover`;
- gets a fixed recovery timer;
- velocity is scaled.

After timer:

- pressure returns to ordinary `approach`.

Shield interception can consume lunge hit authority without magic parry cancellation, but it still does not create a durable relational state beyond physical displacement and the normal lunge/recovery lifecycle.

Thus:

> **O1 had material contact but no demonstrated mechanism by which contact outcome became the grammar of the next exchange.**

---

## 4. O2 REACH / THREAT evidence — space consequence without readiness inheritance

Preserved source:

- `375974c3403387b3ebf4ca8c6c68355cbc6618a2`.

### 4.1 O2 had useful spatial donors

Retain:

- persistent spear geometry;
- outer-tip thrust;
- wall truncation;
- close clearance;
- one-solid-target thrust;
- live locomotion.

### 4.2 Action state explicitly disappears

`o2Action` stores:

- type;
- elapsed time;
- hit IDs.

After `windup + active + recover`:

- `player.o2Action = null`.

Spear desired reach then returns to `idleReach`.

### 4.3 Clearance creates real velocity, but controller semantics ignore it

Clearance:

- applies no damage;
- adds velocity to the pressure body.

This is genuine spatial consequence.

But:

- pressure action state is not re-derived from how clearance displaced it;
- player readiness is not changed by the clearance outcome;
- normal pressure controller continues its own approach/windup/lunge/recover lifecycle.

The displacement can matter locally, but it is not itself a persistent exchange state.

### 4.4 Responsive locomotion rapidly competes with inherited velocity

Shared actor controller adds high acceleration from current input every frame.

That is desirable for responsiveness.

It also means:

> **contact velocity is quickly subordinated to the next locomotion command unless some other state makes that displacement strategically persistent.**

The solution is not automatically "more inertia".

Owner intent explicitly rejects controller difficulty / sluggishness as fake weight.

The missing element is likely semantic/gameplay persistence, not simply slower damping.

---

## 5. Cross-campaign finding — THE NEUTRAL ATTRACTOR

Across Terrarium, O1, O2 and later exchange diagnostics, the common architecture often looks like:

1. actor is in neutral / approach / idle;
2. action starts;
3. action produces real contact / miss / displacement;
4. timer or spring recovery runs;
5. controller returns toward neutral / approach / idle;
6. next action begins from nearly the same semantic state.

This creates a powerful **neutral attractor**.

Physical disturbances may survive for milliseconds or fractions of a second.

But the combat grammar itself says:

> **that outcome is not the starting condition of the next decision; neutral is.**

This may help explain multiple campaign failures:

- Terrarium returned to adhesive pursuit after each strike;
- O1 defensive contact delayed pressure without creating productive follow-through;
- O2 clearance created room but did not create a new qualitative relation;
- A2b body screen vanished when ordinary offense removed the bodies;
- LINE / IMPULSE impact changed velocity without changing the dominant ranged-damage loop;
- E0/E0b contact altered access locally but the action system still reset to repeatable DRIVE / SET relations.

This is a cross-campaign hypothesis, not yet a proven universal cause.

---

## 6. Important correction — do not confuse persistence with sluggishness

A bad response would be:

- lower acceleration;
- increase inertia everywhere;
- lengthen recovery timers;
- lock turning;
- add stamina;
- add a hidden poise meter;
- make every action slower.

That would increase **time persistence** without proving **decision persistence**.

Owner-confirmed constraint remains:

> **responsiveness has veto over realistic inertia.**

The target is:

> **the previous exchange should matter because it changed the actor/world relation, not because controls temporarily feel bad.**

---

## 7. Candidate missing object — CONTINUOUS READINESS

Working hypothesis:

> **combat may need a continuously meaningful readiness / coverage / exposure state whose actual physical configuration survives contact and becomes the starting point of the next action.**

This is not yet a design decision.

Possible substrate components:

- weapon pose;
- weapon velocity;
- coverage direction;
- occupied hand/tool relation;
- body support/posture;
- facing;
- separation / angle;
- local obstruction/contact.

The key rule is:

> **do not automatically restore every outcome to a single authored neutral pose before the next decision matters.**

### Example

A heavy cut finishes or clashes on the actor's far side.

Instead of:

> recovery timer -> canonical guard -> next attack

the resulting weapon/body configuration might remain a real state.

The player may then naturally choose among:

- follow through from that side;
- actively recover coverage;
- use movement to buy recovery space;
- transition into another action that is good from the inherited pose;
- accept temporary exposure to preserve pressure.

No hidden "opening token" is required.

---

## 8. Feniks relevance

### Weapon identity

Weapons can differ through how their **state evolves**, not only reach/damage/timing:

- heavy weapon may preserve momentum and take meaningful work to redirect;
- light weapon may change readiness faster;
- spear may preserve line but hate lateral recovery;
- shield may preserve coverage while limiting another relation.

### Classless specialization

Roles can emerge through shared continuous axes:

- handling;
- mass;
- support;
- recovery authority;
- coverage;
- equipment burden;
- techniques that transform one readiness state into another.

No `class = tank` flag is required.

### Progression

Progression gains richer axes than DPS:

- recover useful weapon state faster without making locomotion sluggish;
- redirect a heavy tool more effectively;
- maintain coverage while moving;
- transition between readiness states;
- preserve body support after contact;
- learn new transitions / techniques.

This supports the long-lived / biographical character vision better than pure damage scaling.

### Co-op

Persistent afterstate creates natural synergy:

- one actor displaces / occupies a weapon or body line;
- another exploits the inherited exposure;
- one actor covers while another recovers;
- body screening / protection can matter without MMO taunt.

### Terrain

World contact can change readiness persistently:

- weapon hits wall and remains displaced / constrained;
- narrow geometry changes available recovery path;
- cover changes which readiness relation can be maintained.

This is stronger than terrain as passive collision scenery.

---

## 9. Strong anti-goals

A future readiness experiment must not become:

- manual physics puppeteering for its own sake;
- Exanima imitation;
- Mount & Blade directional-block clone;
- fighting-game frame advantage token system;
- hidden posture / poise meter;
- universal parry timing minigame;
- combo tree;
- animation-lock combat;
- "more inertia = more weight";
- one optimal guard pose.

It must preserve:

- direct player intent;
- readable consequences;
- live movement;
- actual geometry where valuable;
- high consequence when a clean hit is earned.

---

## 10. Pre-registered falsifiers for a readiness lane

### Auto-neutral in disguise

FAIL if:

- a new system nominally stores pose but rapidly converges to one canonical guard before the next decision;
- all meaningful actions still start from equivalent state.

### Controller chore

FAIL if:

- player spends attention merely centering / untangling the weapon;
- state persistence feels like maintenance work rather than possibility.

### Physics mush

FAIL if:

- small numerical disturbances dominate;
- weapon state becomes noisy/unpredictable;
- causal attribution is difficult.

### Instant aim erasure

FAIL if:

- free aim can rotate the entire meaningful readiness relation instantly enough that prior state has no cost.

### Passive hazard

FAIL if:

- simply holding a weapon pose damages/blocks everything without commitment;
- readiness becomes a static threat bubble.

### Timer substitution

FAIL if:

- benefit comes mainly from longer cooldown/recovery rather than inherited world state.

### One best guard

FAIL if:

- one pose dominates every situation.

### Damage collapse

FAIL if:

- after reintroducing high-consequence damage, persistent readiness again becomes irrelevant because spam kills faster.

---

## 11. Next research object boundary

Do not build another whole combat organism yet.

First hypothesis card should target:

> **CONTINUOUS READINESS / NO AUTO-NEUTRAL v0**

Its first kernel must answer:

1. Can a contact / miss leave a deterministic weapon/body readiness state that persists without a hidden token?
2. Does the next action materially differ because it starts from that inherited state?
3. Can the player intentionally recover / convert that state while locomotion stays responsive?
4. Can the system avoid a canonical guard attractor?
5. Can it remain stable and explainable rather than physics-noisy?

Only after this causal kernel survives should an opponent / objective be introduced.

---

## 12. Evidence boundary

Machine evidence can test:

- persistence vs auto-neutral;
- deterministic contact state;
- action reachability from different inherited poses;
- stability;
- whether state differences survive ordinary locomotion / aiming;
- whether a second action starts from the actual prior state.

Machine evidence cannot decide:

- whether handling feels intuitive;
- whether the weapon feels satisfying;
- whether readiness is readable at human speed;
- whether this is combat the Owner wants;
- whether the added state is worth the mental load.

Those remain Owner-level evidence later.

---

## Working invariant

> **The result of one exchange should be the physical starting condition of the next, not a disturbance that the controller automatically erases.**
