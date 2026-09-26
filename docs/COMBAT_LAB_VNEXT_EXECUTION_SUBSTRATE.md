# Combat Lab vNext — Neutral Execution Substrate

**Date:** 2026-09-25  
**Status:** implemented substrate contract; current until superseded by newer Owner evidence  
**Authority:** subordinate to Owner evidence and `RESEARCH_STATE.md`  
**Execution note:** this file preserves the durable neutral-substrate contract. Checkpoint and frontier-sequencing text records its historical execution context; `RESEARCH_STATE.md` is the live authority for what happens next.

## 0. Purpose

The vNext substrate exists to make many incompatible combat hypotheses cheap to build, observe, reject and replace.

It must not encode a preferred combat model.

The core test is:

> **Could a body-scale experiment, a bow experiment, a non-projectile magic experiment and an R3-like material-contact experiment all live here without pretending they share the same combat semantics?**

If not, the substrate is too opinionated.

---

## 1. Shared core — allowed

The shared layer may own:

### Runtime clock

- fixed simulation timestep;
- bounded frame accumulator;
- pause/reset;
- deterministic stepping where an experiment requests it.

### Raw input capture

- keyboard state;
- pointer position/buttons;
- optional gamepad later.

The core reports input facts.

It does not translate them into "attack", "block", "spell", "aim" or "dodge".

### Experiment registry

Each experiment provides metadata and lifecycle hooks.

The shell may:

- select/load an experiment;
- reset it;
- display its title and minimal controls;
- expose debug mode;
- capture provenance.

### Rendering primitives

Neutral drawing helpers may include:

- circles / ellipses;
- lines / segments;
- polygons;
- simple text / markers;
- camera transforms;
- trails / diagnostic overlays.

The core should not know what counts as:

- body;
- sword;
- shield;
- projectile;
- spell;
- hitbox;
- attack arc.

Those meanings belong to the experiment.

### Observation / telemetry

The shell may capture:

- time;
- input events;
- experiment-emitted events;
- snapshots;
- reset count;
- exact source SHA / build identity.

An experiment decides which semantic events it emits.

### Optional neutral math

Vector, segment, sweep and intersection helpers may be shared only when they do not silently impose combat semantics.

---

## 2. Experiment-owned — mandatory

Each experiment owns whatever meaning it needs for:

- actor representation;
- body shape;
- movement/controller law;
- mass;
- equipment;
- weapon/tool state;
- projectile state;
- magic state;
- action lifecycle;
- contact law;
- hit/damage authority;
- adversary behavior;
- objective / local value;
- world interaction semantics;
- afterstate.

Do not promote one experiment's object model into shared core merely because it is convenient.

Promotion requires repeated use across genuinely different successful experiments.

---

## 3. Experiment interface

Keep the interface deliberately small.

Conceptually an experiment needs equivalents of:

- metadata / hypothesis;
- create/reset;
- step;
- render;
- optional debug render;
- optional snapshot / event export.

There should be **no required combat verbs** in the interface.

No required:

- `attack()`;
- `block()`;
- `takeDamage()`;
- `weapon`;
- `target`;
- `cooldown`;
- `class`.

A magic field experiment should not need to pretend it is a weapon attack to fit the shell.

---

## 4. Hypothesis card is part of the artifact

Every Owner-facing experiment must declare:

- **question**;
- **player action**;
- **realized world behavior**;
- **30-second discriminator**;
- **why it matters**;
- **falsifier**;
- **what is intentionally absent**;
- **machine evidence boundary**.

This metadata should be visible to the research process.

It should not necessarily be shown to the Owner before free-form play if doing so would bias observation.

---

## 5. Owner-facing ergonomics

The lab should optimize for rapid cycles:

> load -> understand controls -> manipulate -> notice -> reset -> change experiment

Requirements:

- one public surface;
- fast reset;
- controls visible but minimal;
- no mandatory debug HUD;
- exact build identity available;
- easy experiment switching once multiple specimens exist;
- no long setup ceremony.

Owner observation should be cheap enough that discovery can happen earlier.

---

## 6. Reproducibility without overfitting

Support deterministic replay where it helps mechanism attribution.

Do not require one universal replay contract.

Different experiments may need:

- identical raw input;
- identical target trajectory;
- identical initial geometry;
- identical disturbance;
- controlled parameter perturbation.

The shell should store facts, not dictate which equivalence relation is scientifically correct.

---

## 7. No premature universal actor

vNext should initially avoid a canonical `Actor` combat class.

Reason:

body size, body topology, movement, carried equipment and even what counts as an actor may themselves be research variables.

A shared identity/provenance handle is fine.

A fixed radius + HP + weapon slot + attack state is not neutral.

---

## 8. No premature universal world collision contract

World geometry helpers can exist.

But do not assume every experiment wants:

- hard body collision;
- soft body collision;
- continuous weapon collision;
- projectile blocking;
- magic blocking;
- identical treatment of actors and terrain.

Those are combat/world hypotheses.

---

## 9. Testing contract

Shared-core tests may qualify:

- timestep behavior;
- reset isolation;
- input capture;
- experiment switching;
- finite coordinate transforms;
- renderer/runtime no-crash;
- provenance;
- deterministic event capture where requested.

Experiment tests may qualify their own mechanics.

Neither may qualify:

- fun;
- feel;
- mastery;
- readability;
- interesting strategy;
- Feniks fit.

Those remain Owner territory.

---

## 10. Migration policy for old code

Default:

> **copy nothing until needed.**

When an old donor becomes useful:

1. identify its exact source SHA;
2. state the narrow property being reused;
3. transplant the minimum;
4. test that property in the new context;
5. avoid importing surrounding architecture accidentally.

R3 is a donor library, not a dependency.

The same rule applies to:

- shield/contact;
- spear reach;
- projectile sweep;
- first-solid-body;
- readiness;
- world geometry;
- old controllers.

---

## 10.1 First implementation checkpoint

Checkpoint `6f2ed95b102cba802c1701326c7b9026892a532c` implements the minimum neutral shell:

- fixed-step runner;
- raw keyboard / pointer capture;
- experiment registry;
- canvas resize / frame helpers;
- source provenance lookup;
- one non-combat smoke probe;
- automated lifecycle / stepping checks.

This checkpoint intentionally contains no shared Actor, Weapon, Attack, HP, target, block or damage abstraction.

CI is green.

At this first checkpoint, the substrate was not yet deployed and had no combat-product authority. It was later incorporated into the qualified Workbench/public closure line; see `RESEARCH_STATE.md` for current status.

## 11. Historical first frontier selection after substrate — SUPERSEDED AS EXECUTION GUIDANCE

This section records the frontier comparison used at that point in the refoundation. It is retained as historical reasoning, **not** as the current shortlist or next-step instruction.

Do not automatically implement R4.

At that time, the plan was to compare divergent first-campaign candidates.

At minimum consider:

- **BODY / SCALE** — can materially different bodies create different combat possibilities without class flags or authored route answers?
- **RANGED / BOW** — can a physical ranged tool create meaningful line/space/preparation play without delete-or-kite collapse?
- **MAGIC / WORLD RELATION** — can magic change combat through persistent or spatial world relations rather than projectile reskin?
- **R3 FOLLOW-UP** — does shared material afterstate remain interesting under minimal adversarial intent?

The comparison was intended to select one next experiment at that historical point.

It was not a commitment to implement all four. Current frontier selection must start from `RESEARCH_STATE.md` and newest Owner evidence.

---

## 12. Stop conditions for the substrate itself

Refoundation fails if the new shell:

- already contains a generic combat engine;
- requires every experiment to look like an actor with HP and an attack;
- makes body shape hard to vary;
- makes non-projectile magic awkward;
- imports R3 semantics as "physics";
- makes experiment replacement expensive;
- becomes a framework project larger than the experiments it serves.

If this happens, simplify before building the first campaign.

---

## Working invariant

> **The substrate should make hypotheses cheap; it should not decide which hypothesis is true.**
