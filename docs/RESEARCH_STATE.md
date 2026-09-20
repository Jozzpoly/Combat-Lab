# Combat Lab — Research State

**Authority:** current `main` research truth  
**Status:** 2026-09-20  
**Purpose:** discover a combat language that may later inform **Feniks**. This repository is a laboratory, not the Feniks combat implementation.

## Current truth

There is **no accepted Feniks combat model** in this repository.

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

## Hypothesis gate before implementation

Before another combat specimen is coded, the lab must produce **3–5 qualitatively different playable hypotheses**.

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

The C1–C4 set is still provisional. The next task is to attack it for hidden overlap and determine whether each candidate can produce a genuinely different playable strategy before any implementation begins.

## Roadmap

### A. Research control — DONE

- recover project intent and negative evidence;
- reset stale R0/R1 authority;
- stop automatic experiment-branch deployment from silently becoming public truth;
- establish an explicit experiment protocol.

### B. Hypothesis formation — ACTIVE

- falsify the C1–C4 taxonomy and remove hidden overlap;
- keep orthogonal assist/camera/evasion axes out of the first core-language comparison;
- define one small shared **combat situation**, not a shared combat mechanism, that makes the candidates expose different player strategies;
- define observable discriminators before code;
- perform reference research only where it can reveal a genuinely different interaction language.

### C. Specimen design

Select a small set of hypotheses that survive the discriminator gate.

For each, design the minimum playable implementation required to expose its player-facing phenomenon. Do not force all lanes to share attack mechanics merely for experimental neatness.

### D. Owner feel campaign

Expose qualified candidates through explicit, provenance-controlled Pages deployments.

Capture first-order feedback: control, readability, weight, spatial consequence, desire to keep playing, surprising affordances and recurring frustration. Do not promote a lane because CI is green.

### E. Consolidation

Use repeated material evidence to decide what deserves another experiment, what becomes a donor, and what is closed. Only after a combat language starts surviving Owner play should architectural extraction begin.

## State invariant

A failed specimen is evidence, not a foundation.

Combat Lab should prefer a clean reset over accumulating mechanics around an unearned direction.
