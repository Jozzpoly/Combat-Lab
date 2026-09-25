# Combat Lab — Owner Specimen Refoundation

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> Preserved for evidence, falsifiers, donor recovery and exact provenance. Any `active`, `current` or `next` wording below describes the document's original moment. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Date:** 2026-09-20  
**Status:** active product-research correction  
**Scope:** Combat Lab -> Feniks combat discovery

## 0. Critical correction

The four-corner A/B/C/D artifact at `88b7c40a0f66e222d683e7062f68b37e98776ba2` is **not an Owner combat specimen**.

It is a useful **mechanism probe / technical falsifier**. It establishes that several intent/realization contracts can be implemented, kept separate and made mechanically distinguishable. It does not establish that any of them form a compelling combat organism, and it is too abstract to spend high-value Owner judgement on.

The previous label `Owner feel campaign — ACTIVE` was therefore wrong.

This correction follows an already-established project rule:

- technical falsifiers may be tiny and answer one question;
- product specimens must be integrated enough to judge gestalt;
- after technical gates, do not accumulate isolated combat/camera/inventory demos; build small world slices.

Combat Lab now returns to that rule.

---

## 1. Recovered Owner intent

These are constraints and pressures recovered across Feniks / Combat Lab / prior physical-combat work. They are **not** a final combat design.

### 1.1 Combat belongs to the world

Combat must not become an isolated minigame layered over a world.

The same spatial reality should matter to:

- ordinary locomotion;
- combat footwork;
- body contact;
- weapon reach and clearance;
- walls / obstacles / passages;
- future perception;
- future companions / SPC;
- future co-op;
- future terrain / verticality.

The first serious Owner specimen therefore needs a **place**, not a grey algorithm arena.

### 1.2 Responsiveness and agency have veto

Physicality is valuable only when the player can form intent, act on it and understand the consequence.

Do not confuse:

- inertia with weight;
- controller difficulty with mastery;
- unpredictability with emergence;
- animation lock with commitment;
- simulation detail with gameplay depth.

A physically richer candidate loses if a simpler authored rule creates better play.

### 1.3 Movement remains live during attacks

The default pressure is:

> the player continues to control locomotion while attacking.

Heavy body / weapon state may physically reduce acceleration, turning or recovery, but Combat Lab should not begin from arbitrary `canMove = false` attack states or fixed animation-authored steps.

### 1.4 Real geometry should matter

No universal i-frame foundation.

A threat should primarily miss because the body is no longer in the threat geometry, a weapon physically intercepted it, an obstacle changed the relation, or another world-grounded mechanism explains the miss.

Controlled forgiveness is allowed when it improves feel and legibility.

### 1.5 Weapon identity must be mechanical

Weapons should be allowed to differ through:

- reach;
- occupied space / clearance;
- angular and linear response;
- mass / commitment;
- contact;
- recovery;
- interaction with movement;
- interaction with terrain / tight spaces.

Damage, range and cooldown values alone are not enough to demonstrate the intended direction.

### 1.6 Body identity matters

Longer-term Feniks pressure includes:

- body size;
- mass;
- acceleration / turnability;
- stance / posture;
- contact resistance;
- soft body-to-body pushing;
- heavy actors holding space;
- light actors escaping / exploiting tight geometry.

The first Owner specimen need not implement the whole system, but it must not be constructed in a way that makes these pressures irrelevant.

### 1.7 Nontarget spatial play is a strong pressure, not a frozen solution

Feniks is strongly interested in nontarget combat.

Open questions remain:

- soft focus;
- aim assistance;
- target lock as an optional layer;
- body-facing policy;
- camera relation to aim / attention.

The first serious specimen should avoid making hard target ownership the hidden foundation. Assistance may be added later if it reduces orientation burden without deleting spatial agency.

### 1.8 No universal dodge-roll assumption

Evasive movement should emerge from actual movement / body capabilities.

A light body may eventually have highly dynamic evasive actions. A heavy tank may have a short awkward step or none. This remains open.

Do not smuggle universal roll + invulnerability into the base specimen.

### 1.9 Physical contact should continue the fight

A blade clash should not automatically enter a separate bind/parry minigame.

Prior physical-combat work already explored blade contact, tether tension, bind and leverage. The useful donor is continuous causal contact. The scripted leverage/bind subgame was not the desired destination.

Contact should be allowed to:

- redirect;
- arrest;
- create separation;
- change recovery;
- produce an opening;
- transfer motion;

while ordinary combat continues.

### 1.10 Owner play is expensive evidence

Do not ask for Owner testing merely because:

- code runs;
- CI is green;
- a deploy exists;
- modes are mechanically distinct;
- the experiment is technically interesting.

Owner play should add evidence the agent cannot manufacture itself: feel, desire, control intuition, embodied legibility and whether the combat is becoming a game worth continuing.

---

## 2. What the four-corner probe actually taught us

The A/B/C/D probe remains useful, but at a lower authority level.

### Demonstrated

- continuous and discrete intent can be separated from kinematic vs coupled realization;
- simple surface controls can coexist with material contact response;
- coupled realization can produce actual path/contact differences rather than only changing constants;
- browser deployment/provenance can be made trustworthy.

### Not demonstrated

- satisfying combat;
- credible body mechanics;
- meaningful guard / defense;
- weapon identity;
- useful footwork;
- good opponent pressure;
- terrain meaning;
- camera feel;
- repeated-play interest;
- mastery;
- a Feniks-worthy control language.

### Current status

Preserve `88b7c40a...` as **Mechanism Probe v1 evidence**.

Do not tune its four modes into a product.

---

## 3. Donor recovery

### 3.1 TETHER//EDGE — useful donor, not blueprint

Recovered useful mechanisms include:

- WASD body motion contributes to weapon-system state;
- mouse input expresses desired weapon relation rather than simply choosing a target;
- weapon state has velocity / continuity;
- body-relative weapon velocity matters;
- physical blade-to-blade contact can use relative approach velocity;
- contact can redirect ordinary combat rather than only evaluate a hit boolean;
- strong local hit / contact feedback materially improves readability.

Rejected inheritance:

- tether weapon as the Feniks weapon model;
- blade-bind / leverage minigame;
- special scripted parry states as the central combat language;
- instrument telemetry as the normal gameplay interface.

### 3.2 Character-controller / physical-player R&D

Useful pressure:

> PLAYER INTENT <-> PHYSICAL CONSEQUENCE

The player should remain responsive enough to express intent while real world contacts remain authoritative enough to matter.

Do not import a donor controller as final Feniks locomotion.

### 3.3 Old generic combat artifacts

Directional arenas, combo/combat demos and legacy Coopege combat are useful as negative/reference evidence.

Do not resurrect them merely because they are more complete than the current probe.

---

## 4. External reference research — implications, not templates

### Hellish Quart

Useful observation:

- discrete conventional attack inputs can coexist with physically colliding blades;
- physical blocking does not require the player to manually pilot every centimeter of the sword;
- therefore **input abstraction and world/material consequence are independent choices**.

Implication for Combat Lab:

Do not assume that physical combat requires raw direct mouse-to-blade control.

### Half Sword / Exanima family

Useful observation:

- direct or strongly physics-mediated weapon control can create unusually expressive combat;
- players also repeatedly report control burden when intent-to-motion mapping becomes opaque, inconsistent or physically noisy.

Implication:

Do not make “fighting the controller” the price of embodiment.

### Overgrowth / Lugaru design history

Useful observation:

- contextual attacks can use movement, distance and preparation as input to action choice;
- Wolfire's own prototyping history explicitly removed an early charged-attack scheme after it proved too complicated in play.

Implication:

Contextual / authored assistance is not automatically anti-systemic. It can be an intent interpreter above physical realization, and must be judged through play rather than ideological purity.

---

## 5. New product hypothesis: EMBODIED INTENT

This is the first integrated hypothesis to build. It is **not** the final Feniks combat architecture.

### Core proposition

> The player expresses clear combat intent through responsive locomotion + facing/aim + a very small action vocabulary. The body and weapon realize that intent continuously in the shared world, and real contact is allowed to alter the result.

This deliberately combines the best surviving pressures instead of choosing one A/B/C/D quadrant.

### Player -> body -> weapon chain

```
WASD / aim / attack intent
        |
        v
responsive body controller
        |
        v
body facing + current movement + posture
        |
        v
weapon drive / intended trajectory
        |
        v
persistent realized weapon state
        |
        +---- wall contact
        +---- opposing weapon contact
        +---- body contact
        |
        v
continued motion / redirection / hit / recovery
```

The important seam is:

> **intent is authored; consequence is world-grounded.**

### Why this is currently the strongest first product candidate

It protects:

- responsiveness;
- locomotion during attacks;
- physical contact;
- future weapon differences;
- future body differences;
- future terrain meaning;
- nontarget spatial play.

It also avoids prematurely forcing the player into the raw-control problems repeatedly seen in physics-heavy melee games.

---

## 6. Combat Terrarium v1 — target Owner specimen

Working name:

> **RUINED GATE TERRARIUM**

Not a final level. A small place constructed to make combat laws visible through ordinary play.

### 6.1 Space

The world slice should be larger than one screen and use a simple fixed-orientation top-down camera that follows the player.

Required topology:

- open courtyard;
- one broad obstacle / pillar relation;
- one narrow gate / passage;
- one small side pocket / wall edge.

The same fight should naturally move between open and constrained space.

No teleport doors. No combat arena boundary appearing only because combat started.

### 6.2 Player body

For v1:

- responsive WASD locomotion;
- persistent velocity, but strong player authority;
- independent desired facing from mouse;
- bounded body turn rather than instantaneous sprite rotation if it remains responsive;
- body has real radius / mass;
- attack never zeros locomotion;
- contact with actors and walls is spatially real.

### 6.3 Weapon

A weapon exists continuously, not only during damage frames.

First implementation should use a **sword-like medium weapon**:

- pivot / hand relation anchored to the body;
- realized orientation + angular velocity;
- neutral guard;
- cut intent;
- thrust intent;
- wall contact;
- opposing weapon contact;
- body hit contact;
- recovery produced by the same state, not a separate magical cooldown volume.

The action driver may use authored target trajectories. The weapon is allowed to be physically deflected away from those trajectories.

### 6.4 Control

Initial low-burden surface:

- WASD — move;
- mouse — desired facing / attention;
- LMB — cut intent;
- RMB — thrust intent;
- no universal dodge;
- no separate parry button;
- no target lock;
- no combo tree.

This is deliberately conventional enough that the experiment can test the embodied realization rather than the player's ability to decode a novel chorded controller.

### 6.5 Defense

Defense should initially come from:

- leaving threat geometry;
- controlling distance;
- body positioning;
- the persistent weapon occupying useful space;
- weapon-to-weapon contact.

No invulnerability state.

No “perfect parry” timer in v1.

If persistent guard proves unreadable or passive, that becomes a later explicit problem rather than being hidden behind a block minigame now.

### 6.6 Opponent

One real duelist first, not a target dummy.

The opponent:

- uses the same broad body/contact laws;
- has a persistent weapon;
- approaches according to range;
- can hesitate / prepare / commit / recover;
- can reposition around the player and obstacle;
- should punish standing still;
- should not face-hug continuously;
- should expose openings the player can recognize spatially.

AI sophistication is subordinate to creating meaningful pressure.

### 6.7 Weapon/body contrast before Owner gate

A serious Owner build must demonstrate that the system is not one handcrafted sword animation.

Before Owner testing, add at least one materially different setup.

Preferred first contrast:

**short sword vs spear/pole weapon**

because it naturally tests:

- reach;
- clearance;
- close-space weakness;
- turning;
- obstacle interaction;
- footwork.

If the second weapon becomes only different damage/range numbers, the specimen is not ready.

### 6.8 Feedback

Normal play needs strong local causality without debug UI:

- readable windup/body preparation;
- weapon trail only where it clarifies motion;
- distinct wall / blade / body contact feedback;
- local hit reaction;
- compact HP/wound state;
- sound for swing/contact/hit;
- clear death/reset.

Debug is separate and toggleable:

- desired vs realized facing;
- desired vs realized weapon path;
- blade/contact point and relative speed;
- body velocity;
- current weapon drive;
- contact reason.

### 6.9 Camera

Keep the first camera conservative:

- fixed world orientation;
- smooth player follow;
- limited aim lead;
- no camera rotation;
- no cinematic zoom.

Camera experimentation remains open, but the first combat slice should not make camera novelty a confounder.

---

## 7. Owner-test gate

Do **not** request Owner feel yet.

The Terrarium becomes eligible only after agent-side rehearsal can defend all of these claims:

### Functional

- several minutes of uninterrupted fight/reset loop;
- no runtime/import/deploy ambiguity;
- opponent reliably reaches and pressures the player;
- attack, miss, wall contact, weapon clash and body hit all occur intentionally;
- reset is immediate and stable.

### Player-facing causality

- movement changes combat outcomes;
- wall / gate geometry changes weapon or footwork decisions;
- weapon contact changes the fight without entering a minigame;
- player can understand why representative hits/misses happened with debug off;
- debug can explain the same event when enabled.

### Embodiment

- player can move throughout attack;
- contact can alter a weapon trajectory;
- body movement contributes to realized action enough to be perceptible;
- physical coupling does not make basic intent unreliable.

### Breadth

- at least two materially distinct weapon/body setups;
- distinction is experienced through play, not only telemetry.

### Product integrity

- the slice feels like a small place in which a fight occurs;
- not four buttons selecting algorithms;
- not a hitbox viewer;
- not a physics instrument with an enemy bolted on;
- not a feature pile trying to impersonate completeness.

Only then is Owner play high-value.

---

## 8. Current execution plan

### Phase R — recovery / refoundation

**DONE**

- re-read current Combat Lab history;
- recover Feniks combat pressures;
- recover TETHER//EDGE donor lessons;
- re-read project methodology around technical falsifiers vs product specimens;
- perform external comparison research;
- demote A/B/C/D from Owner specimen to mechanism evidence.

### Phase T0 — terrarium substrate

**ACTIVE**

Build:

- world / camera;
- responsive body;
- static spatial topology;
- persistent sword state;
- opponent body;
- simple event/debug spine.

No fancy combat balancing yet.

### Phase T1 — embodied strike/contact loop

Implement and qualify:

- cut / thrust intent;
- realized weapon dynamics;
- wall contact;
- blade contact;
- body hit;
- continuous movement;
- recovery.

### Phase T2 — pressure / spatial play

Make opponent behavior and topology strong enough that:

- standing still loses;
- spacing matters;
- obstacle relation matters;
- face-hugging is not dominant;
- footwork can intentionally create / deny an opening.

### Phase T3 — second material setup

Add sword vs spear/pole contrast.

Falsify whether weapon identity emerges from the same laws.

### Phase T4 — presentation / causality

Add only the feedback required to read the fight.

Keep instrumentation separate.

### Phase T5 — agent rehearsal

Use deterministic probes + live browser inspection + repeated scripted scenarios.

Do not declare gameplay PASS.

### Phase T6 — Owner eligibility decision

Only if the full gate above survives do we ask for Owner play.

---

## 9. Anti-goals

Do not:

- resurrect R0/R1 by polishing them;
- continue the A/B/C/D matrix as product lanes;
- build a generic CombatSystem framework first;
- lock Feniks into a final target scheme;
- introduce universal roll / i-frames;
- turn blade clashes into a bind meter;
- add stamina/skills/loot/progression to fake depth;
- use telemetry to compensate for unreadable normal play;
- ask the Owner to debug basic integration for us;
- call a technically qualified mechanism an Owner-ready game specimen.

---

## 10. Success condition for this stage

The immediate success condition is **not** “we found Feniks combat.”

It is:

> We created the first Combat Lab organism rich enough that a negative Owner reaction would itself be meaningful evidence about Feniks combat, instead of merely evidence that the prototype was too empty to judge.
