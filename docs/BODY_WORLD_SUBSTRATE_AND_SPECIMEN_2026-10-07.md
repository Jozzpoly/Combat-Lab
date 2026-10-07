# Combat Lab — Body/World Substrate + First Serious Specimen Design — 2026-10-07

**Status:** pre-implementation design · selected frontier support · not permanent architecture  
**Frontier:** reselected broad body/world possibility question  
**Mode:** serious construction, with small internal falsifiers only when a concrete technical uncertainty requires them

## 1. The question this build must serve

> **When materially different embodied actors share a varied material world, do body/world differences create multiple useful, legible possibilities that the Owner naturally discovers — beyond simple traversal, fit/no-fit and crowd flow?**

The build is not a crowd system, pathfinding project, combat system or manipulation product.

It is the first serious whole after the 2026-10-06 reset.

Its purpose is to make the body/world question genuinely judgeable.

## 2. Substrate decision

### Preferred trial substrate

Use **Rapier 2D deterministic** through its current JavaScript/WASM package, with a fixed timestep and a thin Combat Lab-owned world boundary.

Reasons:

- mature dynamic rigid bodies and contacts;
- 2D shapes, masses, friction/restitution and joints;
- forces and impulses at bodies/points;
- scene queries and shape casts;
- contact/collision evidence;
- CCD;
- snapshots and strong deterministic support;
- already exercised in Companion-Brain-Lab, reducing unknown integration risk;
- does not require importing Companion behavior architecture.

This is a trial substrate decision, not a permanent Feniks physics decision.

### Do not import Companion's motor semantics

Companion's current physical world is valuable evidence for world authority and traversal queries, but it directly sets actor linear velocity each step.

That is appropriate for its current movement research, but it would erase too much material consequence for this frontier.

Combat Lab should keep:

> intent -> finite motor authority -> physics -> realized motion

rather than:

> intent -> overwrite velocity -> physics resolves around it.

### Character Controller donor boundary

Box3d-Character-Controler is not a direct 2D runtime donor.

Its valuable transferable properties are:

- **player intent and physical consequence are separate authorities**;
- accepted movement should remain responsive rather than sacrificing agency for simulation purity;
- E17 showed that one broad physical manipulation capability can generate a family of verbs even with a crude executor;
- finite manipulation authority, mass, leverage, collision and release momentum can remain perceptible;
- interaction mechanics can be donors without their current control grammar becoming architecture.

Do not import its 3D body/controller architecture wholesale.

### Alternatives not selected now

- old Combat Lab custom circle/contact solver — too entangled with the failed line and provides no current advantage;
- wholesale Companion/Rapier world — too much scenario/actor policy and velocity-authority semantics;
- native Box3D / Box3d-Character-Controler runtime — wrong dimensional substrate for the current top-down 2D question;
- Box2D v3 web ports — credible alternatives, but no demonstrated current advantage over the already exercised Rapier 2D path;
- FrameMatter topology machinery — valuable elsewhere, but not a concrete dependency of this question.

If Rapier blocks the actual phenomenon, revisit this decision.

## 3. Motor contract

The player is a **dynamic physical body**.

WASD produces desired planar velocity.

The motor does not write that velocity into the rigid body.

Instead:

1. compute desired velocity;
2. compare with current physical velocity;
3. cap the velocity correction by authored acceleration/braking authority;
4. convert the correction to a finite impulse using the current body mass;
5. let Rapier contacts and other impulses determine the final result.

This preserves:

- responsive control;
- independent mass vs locomotor-authority authoring;
- material pushes and external disturbance;
- causal requested-vs-realized observation.

Mass must not silently dictate player acceleration unless the authored motor parameters make that relation explicit.

## 4. Working specimen — Material Agency Yard

The name is provisional.

The world should feel like a small continuous material place, not a traffic fixture.

### World relations

Use several different relations in one world:

- open yard;
- constrained shortcut;
- generous bypass;
- movable light and heavy objects;
- at least one obstruction whose state can be materially changed;
- a hinged or otherwise physically movable barrier if the simple implementation remains robust;
- enough open space that different bodies are not defined only by doorway fit.

No single choke should explain the experiment.

### Persistent world state

Moved objects stay moved.

A pushed barrier stays displaced according to physics.

The Owner should be able to alter the situation and continue from the altered world rather than resetting after every action.

Reset remains available, but it is not the normal interaction loop.

### Embodied authoring

Keep core axes independent:

- envelope / body size;
- mass;
- locomotor acceleration authority;
- braking authority;
- max speed;
- manipulation force/reach if manipulation is present.

Quick anchor presets may exist only as convenience.

Weird combinations remain legal.

Do not encode body classes.

### Finite direct manipulation

Include one minimal high-level world-manipulation capability unless a concrete technical falsifier shows it dominates the experiment.

Candidate interaction:

- point at a nearby dynamic object;
- hold a direct grip input;
- cursor/world target expresses where the selected point is intended to go;
- force/impulse is finite;
- object mass and leverage remain real;
- reaction on the player body is reciprocal enough that a heavy object can resist, pull or disturb the player;
- release preserves physical momentum.

This is inspired by E17's demonstrated verb ecology, not copied as architecture.

The purpose is not "grab system research".

The purpose is to give the body/world relation enough agency to produce more than transit.

## 5. What the specimen must make possible

Before Owner attention, the agent should be able to demonstrate that the same world supports several materially different continuations, for example:

- take a narrow shortcut or a broad route for material reasons;
- push through / yield to / get displaced by another body or object;
- move an obstruction instead of pathing around it;
- use a moved object to change access or pressure elsewhere;
- fail to move something because available authority is insufficient, then change the body/approach rather than trigger a hidden rule;
- manipulate an object in a way that changes subsequent world interaction;
- recover from messy contact without the Lab silently teleporting, ghosting or resetting the situation.

These are examples, not scripted objectives.

If the test harness has to tell the Owner which one to perform, the specimen is too authored.

## 6. Minimal causal observation

Do not rebuild the giant Workbench first.

Always-visible essentials:

- current body envelope;
- mass;
- max speed;
- acceleration/braking authority;
- current velocity;
- requested velocity;
- active grip/target if any;
- selected object's mass and velocity;
- current contact partners;
- simulation step health.

Direct interaction should dominate.

Detailed causal information may appear only after selecting an entity.

## 7. Owner-facing baseline

The relevant baseline is **not the previous commit of this new branch**.

The specimen must be judged against the things already outgrown:

- R0/Ecology crossing traffic;
- Living Movement L0;
- the earlier fit/no-fit-only body-scale risk;
- the explicit Owner request for a much more serious qualitative step.

Before requesting Owner play, ask:

> **If the Owner dislikes this, will the reaction teach us something about body/world possibility, or only tell us that we once again built an empty/crippled prototype?**

If the latter, keep working.

## 8. Hard anti-regressions

The build must not:

- use crossing traffic as the default world;
- cap ordinary experimentation at a tiny population/body count merely to keep the specimen safe;
- make every actor the same body;
- silently clamp extreme authored values to convenient ones;
- use pathfinding sophistication as the interesting behavior;
- introduce LEFT/RIGHT/WAIT crowd-policy logic as the core organism;
- reset moved objects automatically when they become inconvenient;
- turn causal debug into the primary visual experience;
- hide physics failures through ghosting/despawn;
- call branch-local metric improvement a qualitative project gain.

## 9. Internal pre-Owner gates

Machine/agent work should establish:

- deterministic fixed-step execution;
- no obvious tunneling/NaN/explosive solver bug in ordinary use;
- responsive motor remains controllable under contact;
- material mass differences survive contact;
- dynamic objects can be moved and remain part of the world;
- finite manipulation, if present, cannot kinematically teleport heavy matter;
- broad/extreme authoring remains available and failures stay visible;
- camera zoom/pan supports both local inspection and wider world reading;
- the emitted exact browser artifact is reproducible and provenance-visible.

These gates do not prove the frontier.

## 10. Repository execution

Use one fresh experiment lane from current `main`.

Do not merge the specimen into `main` merely because it becomes playable.

Do not create M1/R1/D1-style child foundations.

Commit freely inside the lane as implementation work evolves.

The branch either:

- becomes worth an Owner rehearsal through `rehearsal/current`;
- is substantially rebuilt while the same question remains alive;
- or is retired with findings preserved.

## Working invariant

> **Build a material place that produces possibilities, not a cleaner demonstration of one mechanism.**
