# Embodiment Decomposition Audit — Load / Envelope B0

**Date:** 2026-09-25  
**Status:** active design hypothesis after Workbench refoundation  
**Parent human evidence:** positive S0 BODY / WORLD signal  
**Owner correction:** the same actor may keep essentially the same body size while equipment changes total mass; continuous permissive manipulation is valuable

## 0. Why the discarded S1 decomposition was still wrong

The discarded S1 used:

- envelope;
- mass;
- "drive".

That was cleaner than S0, but still too compressed.

It silently treated several distinct questions as one axis:

- intrinsic body mass;
- carried/equipment mass;
- locomotor force;
- ground traction;
- braking authority;
- top-speed capability;
- later rotational inertia / turnability.

The fact that a three-slider model is convenient does not make it a good research ontology.

## 1. Immediate next question

Do not solve "embodied character physics" at once.

The next bounded question is:

> **Can body envelope and carried load become independently manipulable material facts while preserving direct control and useful world/contact consequences?**

The Owner's armour example is the cleanest causal case:

> same actor / roughly same body envelope / different equipment load.

This should change some dynamics without requiring a larger body.

## 2. B0 authored variables

### Body envelope

Meaning:

- occupied body radius in the current circular placeholder representation.

Affects:

- world clearance;
- body-body geometric contact.

Does **not** automatically affect:

- body mass;
- carried load;
- locomotor force;
- max speed.

This deliberately breaks S0's scale bundle.

### Intrinsic body mass

Meaning:

- inertial mass belonging to the actor before carried load.

Affects:

- total inertial mass;
- contact yield;
- acceleration under a given locomotor force.

Does not change envelope by construction in B0.

The lack of automatic mass↔size correlation is intentional laboratory freedom, not a Feniks biology claim.

### Carried load mass

Meaning:

- firmly carried / worn load that contributes to actor inertia without changing the current body-envelope placeholder.

Examples in future interpretation may include armour or carried equipment.

Affects:

- total inertial mass;
- contact yield;
- acceleration / braking under a given locomotor force.

Does not yet model:

- equipment geometry;
- center-of-mass shift;
- rotational inertia;
- loose load;
- joint restriction;
- armour stiffness.

Those are future questions.

### Locomotor force multiplier

Meaning:

- normalized actuator authority available to change velocity.

B0 uses:

> acceleration limit = BASE_FORCE × forceMultiplier / totalMass

This is deliberately force-based rather than "mass directly edits speed".

It keeps the causal statement clear:

> mass changes acceleration only relative to available actuation.

The exact law is not a Feniks decision.

## 3. Derived variables

### Total mass

`intrinsicBodyMass + carriedLoadMass`

This is the mass used by the B0 contact solver.

### Acceleration / braking limit

For the first decomposition:

`BASE_FORCE × forceMultiplier / totalMass`

Acceleration and active braking share the same force budget in B0.

This is a simplification.

### Max speed

Held constant in B0.

Reason:

If load simultaneously changed:

- acceleration;
- contact yield;
- and max speed,

the first experiment would immediately re-confound the variables.

B0 asks whether load-dependent inertia itself is useful before deciding how load should affect sustainable speed/power.

## 4. Important physical/gameplay distinction

B0 should not be described as a realistic human-locomotion model.

Real character locomotion may later depend on:

- available muscle/mechanical power;
- force;
- traction;
- gait;
- posture;
- terrain;
- joint range;
- fatigue;
- equipment geometry;
- skill;
- animation/control constraints.

B0 intentionally isolates one relation:

> **same actuation + more inertial mass -> slower change of velocity and different contact yield.**

If that isolated relation is not useful, do not bury it under a larger simulation.

## 5. Ground traction is deliberately absent as a variable

Traction / footing is likely important for Feniks, especially for:

- bracing;
- heavy armour;
- pushing;
- stance-dependent collision;
- slippery/material surfaces.

But making traction a B0 slider would create another dimension before load/envelope itself is understood.

B0 assumes sufficient ground coupling to realize the requested locomotor force.

A later experiment should falsify that assumption directly.

## 6. Rotational inertia / facing is deliberately absent

The current circular body has no meaningful orientation.

Therefore B0 cannot answer:

- how heavy armour changes turning;
- how mass distribution changes rotation;
- shoulder profile;
- sideways squeezing;
- stance-dependent width.

Do not fake those through a scalar turn-speed penalty.

They belong to a later non-circular / oriented-body front.

## 7. B0 world

B0 remains a body/world field without attacks.

It should contain:

- the S0 reference choke so envelope evidence has continuity;
- broad side bypasses;
- enough open space for acceleration / stopping / turning observation;
- standardized neutral moving bodies for contact comparison.

Contact targets should avoid hiding multiple meanings in their visuals.

Prefer same-size / known-mass neutral bodies over "small target = light / large target = heavy" when the experiment is trying to separate geometry from mass.

## 8. Workbench use

B0 is the first experiment designed **for** the Workbench rather than retrofitted into it.

The Inspector should expose:

- Body envelope;
- Intrinsic body mass;
- Carried load mass;
- Locomotor force multiplier.

Derived section:

- radius;
- total mass;
- acceleration limit;
- max speed.

Live section:

- current speed;
- contacts.

A/B parameter slots provide the main comparison workflow.

Example without memorized controls:

1. configure same actor + no load -> Capture A;
2. add heavy load only -> Capture B;
3. Apply A / Reset World;
4. explore;
5. Apply B / Reset World;
6. compare.

Keyboard shortcuts are optional and not required.

## 9. Falsifiers

B0 fails as a useful decomposition if:

- carried load is only a number and is not perceptible in motion/contact;
- mass effects are so strong that control becomes a chore rather than informative;
- mass effects are so weak that A/B is practically indistinguishable;
- envelope still leaks into acceleration/contact mass through hidden coupling;
- load accidentally changes body clearance;
- the central choke remains the only meaningful observation;
- every interesting result depends on the exact current collision solver;
- direct manipulation becomes harder than S0.

## 10. What B0 may qualify

Potentially:

- envelope as a spatial variable independent of inertial mass;
- carried load as a mass source independent of body size;
- force-vs-mass locomotor response as a human-discriminable relation;
- whether parameter A/B comparison is useful in the Workbench.

## 11. What B0 cannot qualify

Even with a positive Owner signal, B0 cannot establish:

- final armour physics;
- final character mass units;
- realistic acceleration;
- final max-speed law;
- stamina;
- traction;
- stance;
- rotational inertia;
- equipment envelope;
- humanoid collider shape;
- combat feel;
- final Feniks actor model.

## 12. Internal execution order

1. implement B0 as a separate experiment; preserve S0 unchanged as reference;
2. machine-test orthogonality and force/mass causality;
3. stress extreme Workbench ranges;
4. real-browser A/B rehearsal;
5. visual inspection of normal/extreme/compact states;
6. **do not deploy**;
7. only after internal review decide whether B0 deserves public rehearsal.

Working invariant:

> **Separate causes before deciding which correlations Feniks should restore.**
