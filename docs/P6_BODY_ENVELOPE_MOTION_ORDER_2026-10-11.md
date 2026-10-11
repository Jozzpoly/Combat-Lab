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

[Physical suite CI 38107104670](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38107104670) PASS (76 room/collider controls + 30 same-shape orientation controls, inherited P0–P5 source checks). Raw native screenshot names in artifact include p6-active-real-elongated-body-chromium.png (wedged) and p6-turn-first-real-elongated-body-chromium.png (successful crossing). These are actual emitted Chromium pixel captures, not illustrations. Every later document/UI commit still requires a new exact-head CI verdict.

## P6 real contact-triggered recovery: 18 additional physical worlds

Files: src/p6-recovery.js, same emitted-source browser runner, three widths1.20/2.10/2.85m × two finite/none terrain regimes × three policies, all with the **same initial 90kg rectangle and π/2 orientation**, same 650N external bounded root impulse control and 1.8N.m.s/tick bounded optional yaw actuator.

- STUBBORN only continually pushes; no recovery.
- RECOVER detects three successive source **actual Rapier barrier contact impulses plus stalled velocity**. Only then it retreats using its own measured displacement ~1.65m (not a world waypoint); applies source-accounted yaw torque until its *actual angle* aligns; then resumes forward command. No timed authored rescue event, no teleport, no global wall-coordinate advice. This is still a hand-authored tiny state machine, not perception/planning NPC.
- STABILIZED performs the identical contact-triggered retreat and rotation, but **continues bounded angular correction while reapproaching**, spending extra explicitly counted actuator impulse instead of freezing its rotation for free.

TRUE 1.20m finite support: STUBBORN remains x13.82 even after 850 ticks and cumulative root drive ~8305N.s; RECOVER detects jam at tick143, retreats1.6636m, completes physical orientation at403 and crosses at573, no world relocation; STABILIZED likewise crosses at573, uses ~81.43 vs ~62.83N.m.s cumulative virtual angular impulse.

TRUE 1.20m NO terrain support: STUBBORN blocked; RECOVER triggers jam tick137, retreats1.6658m, reaches orientation at390 but subsequently re-jams at x13.82. Detailed actual source history proves WHY: inertia carried actor backward while trying to turn (own X from12.15 to6.04), then without further yaw regulation it drifted away from aligned yaw on long reapproach and contacted barrier sideways. **STABILIZED wins with same per-tick torque cap**: actual cross tick745, terminal x19.548, cumulative yaw source82.544N.m.s vs unstabilized66.3046N.m.s. This **falsifies a simplistic conclusion that physical ground friction is categorically necessary**: continued powered yaw correction can compensate, at a different cumulative effort. At 2.10m unstabilized recovery already crosses even no terrain; at 2.85m all three policies traverse without jam, a critical negative control for spurious recovery triggers.

The pressure event, retreat, subsequent orientation and crossing are ACTUAL physical afterstates, but threshold, retreat scale, yaw target zero and phase transitions are explicitly authored and tuned to this simple 2D test fixture. This is a proof of limited local mechanical recovery, NOT an intelligent general actor who understands walls. No validated user responsiveness (e.g. turn-first withheld translation about196ticks/3.27s). Finite virtual ground/root actuators are budgeted surrogates, not anatomical muscles or physical footsteps. The recovered actor has NO semantic plan or gap knowledge.

[Real emitted Chrome/WASM CI 38107703957](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38107703957) PASS on recovery source head fe09aa82cc64f1a87065ce5767e03d98c3504321. Raw browser specimen frames p6-stubborn-after-jam-real-chromium.png, p6-recover-after-jam-real-chromium.png, p6-stabilized-after-jam-real-chromium.png and per-world real JSON in its 14-day artifact. Entire NEW P6 campaign now counts **76 + 30 + 18 = 124** actual P6 source worlds, alongside inherited P0–P5 checks. After documentation commits, always verify final branch HEAD independently.

## Exact scope limitations / next frontier

Mechanical PASS is strictly narrower than user Owner-observed FAIL/PASS. All locomotion and yaw use declared finite virtual support/root impulse approximations, not feet/biomechanical torque. No per-body AI goals, obstacle perception, route planning, tactical decisions or human-like morphology; actors do not recognize they need to turn or why they are wedged. Circle and rectangle are simple cheap shapes. Generic “slippery overlap”/soft contact, stance-conditioned squeezing and more natural crowd mechanics remain future candidates only after real pressure. The renderer retains an inherited P0 gate/background; scene legibility and actual camera feel are UNQUALIFIED. No measured FPS claim. Tests do not certify collision robustness for arbitrary scenes/forces beyond their fixtures.

Next meaningful step: compare genuinely different body envelopes and cheap reflexes in a FREE-EDITABLE inhabited world under Owner-originating interventions, and explicitly test whether mechanical action ordering creates interesting control, agency, feel and recovery rather than sluggish autonomous pauses. Do not extrapolate from a rectangle to complex articulated skeletons; no background/deploy work. Respect neutral main research pointer versus isolated experimental source.
