# Embodied Scale Field S0 — Second Owner Recording, Dense Analysis

**Date:** 2026-09-25  
**Recorded specimen:** `f4c64e35f225b3a8d994f6ac05b5e7c02689cf6c`  
**S0 experiment blob:** `d0ea720a1978fe385b0358c3b870f7cc10e335a8`  
**Recording duration:** 50.5 s  
**Video:** 1868×914, 30 fps  
**Audio:** effectively silent (~ -91 dB)  
**Owner verdict:** positive direction signal for Feniks; apparatus remains raw

## 0. Method

The recording was not evaluated from a few screenshots.

Analysis included:

- full pass at 4 fps: 202 sampled frames;
- dense 12 fps windows around the major scale transitions, choke interaction and body-body contacts;
- 10 Hz color-based trajectory extraction for the blue player body and three orange drifters;
- exact source review of the recorded S0 implementation;
- explicit separation of:
  - visual recording evidence;
  - Owner verbal feedback;
  - source-level mechanical facts;
  - interpretation / hypotheses.

The goal is to extract research evidence, not to score polish.

## 1. Executive result

This recording is the first strong human evidence that the **body/world relation itself** is a useful Combat Lab direction.

The strongest qualified principle is not:

> bigger characters are better tanks

and not:

> Feniks should use these exact circles / masses / speeds.

It is:

> **body envelope and embodied dynamics can materially change which spatial relations are available, how movement behaves and how other bodies yield — without a class flag or a weapon mechanic deciding the answer.**

This is directly aligned with the Owner's stated Feniks need.

The previous weapon-centric direction is therefore not required as the foundation of Combat Lab. Weapon/contact discoveries remain donors that can be reintroduced later if they earn value inside the broader body/world combat ecology.

## 2. Scale-use timeline recovered from the recording

Approximate visual scale classification from the blue body's rendered diameter:

| Recording time | Form |
| --- | --- |
| 0.0–4.4 s | medium (~1.0) |
| 4.5–5.9 s | large (~1.7) |
| 6.0–7.0 s | small (~0.65) |
| 7.1–10.9 s | large |
| 11.0–20.4 s | small |
| 20.5–31.2 s | large |
| 31.3–34.5 s | small |
| 34.6–40.1 s | large |
| 40.2–43.9 s | medium |
| ~44.0 s onward | Owner switches to substrate smoke probe |

Important boundary:

The recording mostly exercises the three anchor keys (1 / 2 / 3).

It does **not** materially qualify the continuous `[ / ]` scale sweep.

Therefore the positive Owner signal is currently about **distinct embodied phenotypes**, not proven perceptual value of continuous scale interpolation.

## 3. Strongest human evidence — same choke, different body envelope

The most informative sequence is approximately **7.1–12.7 s**.

### 3.1 Large form

At ~7.1 s the player is large.

For the next ~3.8 s the player repeatedly occupies the central choke region but does not clear the narrow middle opening.

Dense frames show the large circle repeatedly near the mouth / edge of the opening rather than simply choosing a different part of the map.

At ~10.9 s the body is still large and remains at the choke.

### 3.2 Immediate small-form comparison

At ~11.0 s the body switches to the small anchor at essentially the same location.

Recovered trajectory samples:

- 10.9 s — large, center ~ (829, 483), rendered diameter ~56 px;
- 11.0 s — small, center ~ (829, 483), rendered diameter ~20 px;
- 11.5 s — small, center ~ (918, 486);
- 12.0 s — small, center ~ (1018, 487).

The small body therefore clears the relation immediately after the scale change.

This is unusually useful Owner evidence because much of the situation remains matched:

- same world;
- same opening;
- same player;
- same control language;
- nearly the same starting point;
- no class change;
- no weapon;
- no damage / attack rule.

The material body envelope itself changes the reachable spatial relation.

### 3.3 Exact source geometry explains the result

Central obstacle pair:

- upper block: y 70..273;
- lower block: y 327..530;
- central opening: **54 world units**.

Player diameters at anchors:

- small 0.65: **23.4**;
- medium 1.0: **36.0**;
- large 1.7: **61.2**.

Therefore:

- small has ~30.6 units of spare central clearance;
- medium has ~18 units;
- large exceeds the central opening by ~7.2 units.

The large body is not blocked by a hidden rule.

It simply does not fit.

This is exactly the kind of material constraint Combat Lab was trying to recover.

## 4. The bypass matters as much as the block

The Owner explicitly reports:

> in the largest form I do not fit through the middle passage, but I can pass around the sides.

That distinction is fundamental.

The source geometry leaves 70 world units above and below the vertical barrier.

Large diameter is 61.2.

So the large body:

- fails the 54-unit central opening;
- can still fit a 70-unit bypass;
- has only ~8.8 units total spare clearance in that bypass.

That produces a materially grounded **route tradeoff**, not a paternalistic prohibition.

Important evidence boundary:

The recording strongly shows the central non-fit and subsequent small-body passage.

A complete large-body side-crossing event is not as cleanly captured in the sampled recording as the Owner's direct report.

Therefore:

- central non-fit: recording + source + Owner evidence;
- side bypass availability: Owner evidence + source geometry.

Do not falsely claim both are equally video-demonstrated.

## 5. Contact / mass evidence

S0 couples scale to mass:

- small: mass 0.4225;
- medium: mass 1.0;
- large: mass 2.89.

Drifter masses are:

- small drifter: 0.85;
- medium drifter: 1.35;
- large drifter: 1.85.

This deliberately creates two very different contact regimes:

- small player is lighter than every drifter;
- large player is heavier than every drifter.

### 5.1 Small body yields

A dense sequence around **17.2–17.9 s** shows the small blue body in sustained proximity/contact with the medium drifter.

Approximate 10 Hz trajectory derivatives:

Before / entering the relation (~17.1 s):

- player: ~(+70, +110) px/s;
- drifter: ~(+50, +29) px/s.

Near the middle of contact (~17.5 s):

- player: ~(+8, +20) px/s;
- drifter: ~(+14, +28) px/s.

By ~17.9 s:

- player is nearly stopped;
- drifter still carries residual motion.

This is not a controlled physics experiment, but it is consistent with the visible qualitative impression:

> the small body does not simply motor through the heavier body.

### 5.2 Large body redirects

A cleaner open-space sequence occurs around **35.8–36.6 s**.

The large player approaches the largest drifter from the right.

Approximate 10 Hz derivatives:

At ~35.8 s:

- player x velocity: ~ -169 px/s;
- drifter x velocity: ~ +34 px/s.

Near contact at ~36.2 s:

- player x velocity: ~ -133 px/s;
- drifter x velocity: ~ -121 px/s.

At ~36.6 s:

- drifter x velocity: ~ -149 px/s.

The orange body's horizontal trajectory visibly reverses after the heavy blue body arrives.

This is meaningful evidence that body mass is not merely telemetry: it affects another material body.

### 5.3 Movement dynamics are perceptibly different too

Observed 10 Hz trajectory p95 speeds during the recording:

- small: ~234 px/s;
- medium: ~214 px/s;
- large: ~171 px/s.

These are not controlled speed trials because Owner input differs between intervals.

However, the ordering matches the actual S0 motor law and corroborates the Owner statement that mass/size changes movement dynamics.

## 6. What the recording genuinely qualifies

### QUALIFIED — human-facing direction signal

The Owner explicitly says the direction is what Feniks needs.

The recording supports that through visible manipulation.

Qualified at this stage:

- body envelope can change topology / route availability;
- the same environment can offer different possibilities to differently embodied actors;
- route exclusion can remain permissive because alternate material routes exist;
- body mass can visibly alter body-body dynamics;
- scale/body differences are perceptible enough for the Owner to intentionally probe them;
- a body/world substrate is a more promising foundation for Feniks combat discovery than making one weapon-control system the project spine.

### EARLY POSITIVE, NOT FINAL

The Owner also says the experiment is very raw and far from real Feniks needs.

That is not a contradiction.

It means:

> **direction accepted; implementation semantics not accepted.**

## 7. What the recording does NOT qualify

Do not promote any of the following:

- `mass = scale²` as a Feniks rule;
- the exact acceleration / braking / max-speed formulas;
- circles as final body colliders;
- instant live body-size switching as gameplay;
- current drifter behavior as NPC behavior;
- current impulse / restitution values;
- current collision solver as production-quality material physics;
- a specific tank / rogue / class matrix;
- weapon removal as a permanent design decision;
- continuous scale interpolation (not meaningfully exercised);
- final movement feel;
- final combat feel.

## 8. Critical apparatus debts exposed by the positive result

The result is promising enough that the flaws now matter more, not less.

### 8.1 Size, mass and motor power are confounded

One scale variable currently changes simultaneously:

- body radius;
- mass;
- acceleration;
- braking;
- max speed.

The Owner likes the resulting phenotype.

We do **not** yet know which relations are essential.

For example:

- large + light;
- small + heavy;
- large + powerful motor;
- small + weak motor

are currently impossible to test independently.

This is the highest-priority causal debt.

### 8.2 Circle collider is only a placeholder for body envelope

A circle cannot express:

- shoulder / torso width;
- facing-dependent profile;
- squeezing;
- posture;
- crouch;
- braced stance;
- carrying equipment outside the torso;
- asymmetric anatomy.

The useful principle is **embodied occupied space**, not "Feniks characters are circles".

### 8.3 The choke is highly discriminating but authored

The central opening was deliberately placed between medium and large diameter.

That is good experiment design for discovering the phenomenon.

It is not evidence that real Feniks levels will automatically produce rich size ecology.

Future tests need multiple geometry families and open-space situations so that body-size value is not one corridor puzzle.

### 8.4 Current body-body solver is qualitative evidence only

The solver:

- resolves overlap positionally using inverse mass;
- adds a bounded restitution impulse;
- has no persistent contact manifold;
- has no friction / bracing / footing model;
- allows the player motor to reassert target velocity every simulation step.

Therefore the Owner-visible push/yield signal is real, but the exact feel and physical law are not trustworthy yet.

### 8.5 World collision is also intentionally primitive

World collision resolves circle-rectangle contacts sequentially.

Near an impossible narrow gap, that can produce edge/sliding/jitter behavior whose details should not be treated as Feniks physics.

The only defended claim is the topological one:

> large cannot occupy a route narrower than its envelope.

### 8.6 Drifters are not actors

They are moving material test bodies.

They have no intent, stance, perception, support relation or combat semantics.

This is useful precisely because it isolates body interaction.

Do not accidentally evolve drifters into enemies.

## 9. Owner behavior as research evidence

Without inferring motivation beyond the visible actions:

- the Owner repeatedly switches between extreme scale anchors;
- the longest S0 intervals are spent in small and large forms;
- the Owner revisits contacts rather than only testing the choke once;
- the Owner tests both movement through geometry and body-body interaction;
- around ~44 s the Owner switches to the neutral substrate smoke probe and moves it for the rest of the recording.

This means the artifact exposed enough manipulable difference to support self-directed probing.

That itself is a major improvement over earlier Combat Lab specimens, where the Owner's interaction often collapsed immediately into "this is bad / unplayable".

## 10. Core research interpretation

The strongest new Combat Lab thesis is now:

> **Embodiment should constrain and enable combat before weapon mechanics define it.**

A weapon, spell, shield or movement technique should eventually meet an already-material actor:

- with a body envelope;
- mass / resistance;
- locomotor capability;
- access constraints;
- occupied space;
- equipment burden;
- world relation.

This does not demote weapons to cosmetic details.

It changes the dependency direction.

Instead of:

> weapon combat system -> actor attached to it

the promising direction is:

> embodied actor + material world -> weapon / magic / stance relations emerge inside it.

## 11. Relationship to R3 and the old melee line

The positive S0 result does not invalidate R3.

R3's shared material afterstate remains interesting.

But its role changes:

- not the foundation of Combat Lab;
- not evidence that Feniks needs sword physics;
- a donor candidate for future tool contact inside an embodied actor/world substrate.

Likewise spear, shield, projectile and other donors remain available.

The refoundation decision is now positively supported by Owner evidence rather than only by architectural critique.

## 12. Current status

- S0 runtime: PASS;
- S0 exact deploy provenance: PASS;
- S0 human body/world phenomenon: **POSITIVE OWNER SIGNAL**;
- exact Feniks body model: UNPROVEN;
- exact mass law: UNPROVEN;
- exact movement law: UNPROVEN;
- exact collision/contact law: UNPROVEN;
- BODY / WORLD direction as a Combat Lab campaign: **PROMOTED TO ACTIVE DISCOVERY FRONT**.

Working invariant:

> **Preserve the material difference; refuse to canonize the placeholder law that currently produces it.**
