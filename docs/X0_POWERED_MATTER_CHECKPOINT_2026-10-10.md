# X0 — powered material in a shared physical world (2026-10-10)

**Status:** bounded isolated discovery / not an Owner-qualified experience / not merge-ready. The current working candidate remains **draft PR #4**, not the main runtime or public rehearsal. Previous R0/R1/L0 Owner FAIL verdicts are unaffected.

## Why this was attempted

Independent source audit and a real **1440×900 headless Chromium image** showed the initial X0 first view as a sparse, almost inert material workshop: four separated bodies, eight freely movable or constrained objects, no meaningful sustained contact until an operator intervened. Adding more randomized actor wandering would repeat the previous crowd/traffic failure. A different hypothesis was tested: **an openly authored, finite world-material energy source may create real continuing contact and locally sensed bodily response without importing an NPC/goal policy.**

This is an alternative explanation for missing physical engagement, **not a selection of a permanent world-power architecture**.

## Exact new mechanism and authority

- A **world-pinned Rapier hinge** may receive positive or negative desired angular velocity and independently capped finite motor torque. The controller delivers capped physical **torque impulse to an actual dynamic beam**, not a prescribed animation, kinematic teleport, or speed overwrite. Static world anchoring supplies outside energy/reaction.
- Any such motor can be authored anywhere; edited or completely disabled during the live experiment. It uses real body mass, geometry, collider contacts and Rapier joint constraint.
- New initial-scene JSON preserves the power fields; older scenes without them load as **passive** hinges. The UI offers separate passive and powered hinges, actual direction and torque fields, live disable/reconfiguration, and undo for newly placed powered matter.
- The power is **world-originated**, never credited to a resident actor. Non-selected actors still remain motionless without actual contact and their tiny own tactile reactions are unchanged. The experiment continues using top-down planar support approximations, not feet, soil, support load or true locomotion.

## Matched emitted-Chromium evidence

[Same-head functional/browser CI 38012114527](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38012114527) at the post-setup configuration. Identical X0 starting state, 360 fixed physics steps, **no researcher impulse, no manually piloted actor**:

| Variant | Actor contact-active steps / 360 | First active actor contact | Local arm reflexes | Finite brace actions |
| --- | ---: | ---: | ---: | ---: |
| Default **−1.1 rad/s**, motor torque 900 N·m | **95** | tick 30 | **2** | **84** |
| Motor OFF, otherwise same scene | **0** | none | **0** | **0** |
| Opposite direction +1.1 rad/s, same torque | **18** | tick 273 | **1** | — |
| Weak motor at torque 50 N·m | **172** | tick 163 | **0** | — |

- Largest final physical actor-position contrast against fully passive control: **6.7119 m** in default-power trial; **6.0931 m** for material. These are absolute afterstate differences, **not evidence of different kinds of actions**. Only two of the four actors showed displacement contrasts above zero at reported precision.
- Changing motor direction is enough to change timing and interaction pattern, with no altered route or actor cognition. The weak-motor case is a **negative warning**: many contact-active steps can occur without one arm reflex. Contact quantity is not agency.
- Joint-anchor deviation in the default powered trial peaked at **0.00004 m** within this bounded test; no wider density/long-duration stability is inferred.
- Before choosing the reverse direction for first-run encounter, the agent inspected actual screenshots at startup and 360 steps for the slower-contact direction; another headless screenshot after 100 steps of reverse revealed an early pinned-beam/organism encounter. Screenshots are **agent visual evidence only**, not Owner-observed feel or a video/user test.

## Critical counterfactual: a rigid obstruction must win

A separate 240-step physical stress uses the same powered 3.5 m world-pinned beam and finite 320 N·m motor:

| Trial | Total hinge angular travel | Solver-active beam-to-wall contact steps |
| --- | ---: | ---: |
| Unobstructed | **3.9059 rad** | 0 |
| Same drive, fixed obstruction placed in the actual sweep | **0.0994 rad** | **213** |

The peak per-step torque impulse was **5.3333 N·m·s** (=320/60), not an unbounded force. This demonstrates **a different material consequence under world constraint**, not kinematic rotation through objects. It is still a deliberately configured test fixture, not spontaneous organism ingenuity.

## First-run qualitative review — still insufficient

The field no longer requires an operator to inject every interesting external disturbance, and the material source can be interrupted. Yet real Chromium images still show a large sparse machine yard of simple polygonal hulls, separated actors and very few types of direct user action. Most bodies remain inactive, with little readable reason to test something beyond the nearby mechanism. A powered hinge alone does not create a compelling living population, broad movement/terrain/action ecology or emergent combat.

In particular:
1. **No new useful action for a distinct second organism has been proven.** Earlier X0 second-actor counterfactual was false positive due to residual material momentum.
2. **Physical availability vs action selection are separate.** A passive body receiving force is not the same as that body choosing how to use a changed possibility.
3. The first-run operator loop is functional but still heavily sidebar/sliders driven. Anatomy is limited to 0/1/2 similar jointed arms authored at spawn, without physically expressive independent in-world arm manipulation. This remains a serious **hypothesis** for the next binding constraint, not a mandatory feature order.
4. No Owner experiential test, practical long-run FPS/scaling, gravity-based stance/gait or full free-form body topology is qualified.

## Decision / stop

Preserve the material-motor result as a **replaceable embodied-world physics donor** inside isolated PR #4. Do **not** merge to main, move `rehearsal/current`, advertise X0 as Owner-ready, or keep increasing motors/metrics just because these controls passed.

The open whole-level question remains: **can the operator create and discover several materially different actions and their consequences in one freely reconfigurable place**, beyond watching a physically valid machine push actors? The next meaningful branch decision should critically compare direct bodily action/expression, anatomy, constraints and richer spatial matter **before** more automation. A repeated mechanism PASS does not pick the next architecture.

Source of truth: [neutral research state](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md), [older bodily hold checkpoint](X0_BODY_CONTACT_ACTION_CHECKPOINT_2026-10-10.md), and [live PR #4](https://github.com/Jozzpoly/Combat-Lab/pull/4). Every SHA and CI claim must be rechecked if branch changes.
