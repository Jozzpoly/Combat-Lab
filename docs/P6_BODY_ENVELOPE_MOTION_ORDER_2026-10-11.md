# P6 — Material envelope and physical action ordering (2026-10-11)

**Source-scoped research checkpoint. NOT OWNER-GAMEPLAY-QUALIFIED.** Isolated P6 code donor branch is based on P5; no experimental implementation merged into main; public rehearsal/current untouched. Historical R0/R1/L0 Owner FAIL remains binding. This document is an evidence index, not final architecture, game design, artificial intelligence, true legs, or jointed anatomy.

## Why

P5 showed real edited topology changing the ability of several independent contact-only 2D bodies to attach a real cargo. P6 asks whether differences in actual body envelope can matter under IDENTICAL motor speed/force and physical mass, and whether the ordering of simple physical actions can resolve a collision-induced jam, without invisible size predicates, scripted completion or automated navigation.

## Geometry-only stress: 64 actual Rapier WASM worlds

Two circular physical colliders: small radius 0.44m (diameter0.88m), bulky radius1.15m (diameter2.30m). Each comparator receives an ACTUAL 90kg collider mass through Rapier, identical speed target1.9m/s, motor650 or900N, same continuous +X virtual-ground root drive, same start x9.8,y12 and static material wall at x14.4. Factorial coverage: widths0.95/1.20/2.10/2.85m × finite/none virtual ground × 90kg-matched/native mass × motor650/900 × small/bulky = 64 solver worlds. Crossing is an offline x>16.3 readout, NEVER fed back to the actor. No path or special collision flags.

In all 90kg pairs:
- Widths0.95, 1.20 and2.10: small crosses; bulky stays in front of REAL fixed colliders. Even motor900 fails to push the 2.30m collider through a sub-2.30m opening.
- Width2.85: both cross. Example finite motor650: small passes at tick217; bulky at221. Source root motor thrust for blocked bulky can exceed4000N.s because it continues pushing into real matter. This is expected collision physics, not a special simulation invention or a product-level achievement.

## Same-world real collider intervention: 8 actual source worlds

2 bodies × finite/none support × unchanged/open actual barrier. At identical tick160 prior body pose, velocity and accumulated motor impulse, experimenter translates ONLY a fixed real obstacle by −1.60m Y, turning 1.20m into2.80m aperture. No actor relocation, angle teleport, world reset, or collision bypass.
- Same finite/90kg bulky actor: blocked/no-edit => no passage by tick440, x13.1689; edited => passes at tick325, ends x19.7031.
- Small crosses at tick217 under both unchanged and edited topology, a useful neutral comparator.
- Native Chromium separately clicked the actual P6 preset, mouse-paused physics, widened same physical barrier y9.1→7.5 without actor movement or time advancement in edit, resumed the same world. [Native physical CI 38106725661](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38106725661) PASS. Raw unretouched browser frames and JSON included in run artifact.

## Four-body inhabited comparative world: 4 additional actual source worlds

One continuous 2D material courtyard, 4 independent small/bulky rigid organisms, 2 independent colliding cargo, 3 fixed authored barrier segments yielding one narrow ~1.0m and one broad ~2.95m opening, plus inherited material gate. All start same directional drive and 650N cap, no goal-directed navigation. In cheap CONSTANT control each drives forward. TOUCH control has large actor BRACE and small follower YIELD only after actual Rapier contact impulse. These are simple rule-triggered finite ground impulses and authored reactions, NOT cognition.
- Finite terrain, CONSTANT: large X displacement +8.1101m, second cargo +1.11m.
- Same physical start, TOUCH: large X displacement +3.9221m, second cargo +0.00m.
- The afterstate materially changed with a real-contact-triggered stance, but total postcontact drive/ground support are different; no proof of special morphology mechanics, quality of feel or superior strategy. The original all-PRESS control had IDENTICAL constant/touch afterstates; negative result preserved through history.

## Motion ordering and genuine wedging: 30 actual 90kg elongated rigid-body worlds

A single independent 90kg rigid rectangular collider, real half-extents(1.20,0.33)m, originally pointing across the passage (yaw ~pi/2); same geometry and authored body mass, bounded root drive, no position or rotation teleport, no dynamic collider disabling. 3 material widths 1.20/2.10/2.85 × finite/none terrain × 5 policies = 30 actual Rapier worlds:
- PASSIVE: constant +X forward drive, no requested turn.
- STRONG-PUSH: same pose and geometry, higher 1200N motor, no intentional turn.
- ALIGNED: same body but already rotated to yaw0 at the start. It is a feasibility upper bound with DIFFERENT initial orientation, not a matched-state causal comparator.
- ACTIVE: starts identical to passive, simultaneously pushes and uses PD finite external-ground torque impulse capped at1.8N.m.s per tick to turn to yaw0.
- TURN-FIRST: starts identical to passive/active and uses the SAME capped torque; simply withholds translation until its actual physical yaw error becomes <=0.22 rad. Then it pushes. No map/obstacle knowledge, no waypoint, no win condition, only own angle and authored world-X alignment target.

**Critical narrow 1.20m, finite support outcome**:
- PASSIVE: blocked, terminal X13.820; STRONG-PUSH: also blocked after ~6904.8N.s root impulse.
- ALIGNED: passes tick220 (different starting pose; do not treat as causal A/B).
- ACTIVE simultaneous push+rotation: genuinely wedges against matter, terminal X13.8177 at yaw1.2548 rad despite ~652.42N.m.s of accumulated external angular impulse. The solver is not secretly restricting rotation by ID.
- TURN-FIRST: physically rotates in free space while horizontal thrust is withheld for196 ticks (~3.27 simulated seconds), then truly passes narrow world at tick416, terminal X17.3638 yaw0.0209, cumulative angular source ~66.76N.m.s.
- Finite/none terrain both show this categorical failure/success. At width2.10m ACTIVE passes; at width2.85m even PASSIVE can pass.

**Interpretation:** ordering of simple material actions creates a new traversability affordance absent under greater strength and simultaneous actuation. This is more interesting than another pure body-size classifier. Yet a cheap UNARTICULATED rigid rectangle was sufficient: no evidence for expensive articulation yet. TURN-FIRST waits ~3.3s before moving, possibly unacceptable responsiveness/feel. Yaw target is explicitly authored and globally aligned; it is NOT locally discovered gap orientation or self-directed planning.

[Physical suite CI 38107104670](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38107104670) PASS (76 room/collider controls + 30 same-shape orientation controls, inherited P0–P5 source checks). Raw native screenshot names in artifact include p6-active-real-elongated-body-chromium.png (wedged) and p6-turn-first-real-elongated-body-chromium.png (successful crossing). These are actual emitted Chromium pixel captures, not illustrations. The final documentation/UI correction commit must receive its OWN head-bound CI verdict before final signoff.

## Exact scope limitations / next frontier

Mechanical PASS is strictly narrower than user Owner-observed FAIL/PASS. All locomotion and yaw use declared finite virtual support/root impulse approximations, not feet/biomechanical torque. No per-body AI goals, obstacle perception, route planning, tactical decisions or human-like morphology; actors do not recognize they need to turn or why they are wedged. Circle and rectangle are simple cheap shapes. Generic “slippery overlap”/soft contact, stance-conditioned squeezing and more natural crowd mechanics remain future candidates only after real pressure. The renderer retains an inherited P0 gate/background; scene legibility and actual camera feel are UNQUALIFIED. No measured FPS claim. Tests do not certify collision robustness for arbitrary scenes/forces beyond their fixtures.

Next meaningful step: compare genuinely different body envelopes and cheap reflexes in a FREE-EDITABLE inhabited world under Owner-originating interventions, and explicitly test whether mechanical action ordering creates interesting control, agency, feel and recovery rather than sluggish autonomous pauses. Do not extrapolate from a rectangle to complex articulated skeletons; no background/deploy work. Respect neutral main research pointer versus isolated experimental source.
