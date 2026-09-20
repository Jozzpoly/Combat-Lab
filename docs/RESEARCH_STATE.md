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

These are **candidates for research**, not accepted designs:

### H1 — direct weapon expression

Movement remains highly responsive while mouse/aim directly expresses weapon orientation or attack trajectory. The core question is whether unusually direct control creates mastery and embodiment, or instead feels floaty and detached from body mechanics.

### H2 — body-driven committed motion

The attack is produced by body + weapon momentum rather than by a free cursor-following arc. Movement remains live, but mass, current velocity, turning capability and weapon commitment materially reshape what can happen during the attack.

This is not an animation lock: the test is whether physically legible constraint can create weight without taking control away.

### H3 — persistent guard / contact language

The weapon is not merely spawned as a short damage sweep. Guard orientation and weapon presence persist between attacks, so approach angle, contact, pressure, spacing and transition into an attack become part of combat.

The falsifier is immediate: if this produces fiddliness, visual noise or simulation work without better decisions, it loses.

### H4 — soft-focus assisted nontarget

The player still fights spatially and without hard target ownership, but a soft focus / assistance layer reduces top-down orientation burden and helps express intent toward a nearby threat.

The question is whether assistance improves legibility without turning combat into target-lock automation.

### H5 — footwork-first strike language

Attacks are primarily negotiations of approach, step, reach and exit rather than cursor steering. The decisive skill is creating the right spatial relation before and during the strike.

The question is whether this makes terrain, body size and weapon reach naturally meaningful while remaining responsive.

These candidates may be changed or killed before implementation. They exist to widen the design space after three over-narrow experiments.

## Roadmap

### A. Research control — DONE

- recover project intent and negative evidence;
- reset stale R0/R1 authority;
- stop automatic experiment-branch deployment from silently becoming public truth;
- establish an explicit experiment protocol.

### B. Hypothesis formation — ACTIVE

- sharpen or replace H1–H5;
- look for overlap and fake distinctions;
- identify the smallest shared **combat situation**, not a shared combat mechanism, that can expose the hypotheses fairly;
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
