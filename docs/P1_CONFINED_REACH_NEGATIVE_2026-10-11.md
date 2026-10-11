# P1 — Confined Reach physical falsifier (2026-10-11)

**VERDICT: NON-PROMOTION / NEGATIVE FOR THE PROPOSED SPECIALIZED ACTION.** Source branch `experiment/p1-confined-reach-falsifier` descends from P0 solely as a *research donor*, NOT as an approved runtime path. Prior R0/R1/L0 Owner FAIL remains; no Owner feel evidence. No merge or public pointer changes.

## Question and hard comparator
Can a genuine 68+22kg articulated body reach and meaningfully move independent matter while its torso is constrained by a narrow fixed physical pocket, in a way not replicated by a **same-initial-envelope, same-mass rigid** body? The real Rapier2D arm has connected self-contact enabled. Torso starts between two fixed walls with true shape-pair start overlap checks; 32kg cargo lies to the side of the tip. The rigid control shares the initial collider profile and 90kg total, with explicit whole-body torque bounded to 1.6N·m·s per simulation step; no actor is kinematically frozen, no physical collision disabled, no external root drive. Null controls: no arm motor and no rigid torque, physically unconfined room, zero/finite terrain reaction, 3 actual object Y placements.

### Actual source evidence
[Exact-source Chromium CI PASS 38102046364](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38102046364): full original **28-world** null/comparison probe and **12 paired aggressive-rigid** red-team comparisons (24 additional actual worlds), plus real emitted Chromium screenshots `p1-lever-t0/t60/t160.png` and `p1-rigid-t0/t60/t160.png`, and JSON in short-retention CI artifact. Green checks establish only solver execution, not a body capability.

**First controller was an UNFAIR weak rigid rival.** Its PD angular impulse (~0.66 N·m·s/tick before stress) could not overcome the finite virtual terrain angular resistance (~1.33N·m·s/tick). Rigid root stayed at exactly zero yaw and payload zero motion, while hinged moved cargo by only ~0.029m. This was not proof that confinement made anatomy necessary; with physical pocket ABSENT, the same small difference persisted. Torque was spent on grounding counter-impulses, not real wall contact.

**Stronger adversarial rigid** with the exact same 1.6N·m·s *peak* cap, but using the cap aggressively each tick while target angle is unmet, was then tested. (It expended 256N·m·s total absolute commanded torque over 160 steps vs hinged ~69–81N·m·s in finite grounded tests. The effort budgets are NOT equal; the aggressive rival deliberately gets an advantage.) Genuine source results:
| World | Lever payload after 160 steps | Strong rigid after 160 | Wall-contact impulse (hinged / rigid) |
| --- | ---: | ---: | --- |
| No cage, virtual finite terrain, cargo y7.12 | 0.0291m | 0.0154m | 0 / 0 |
| Cage, virtual finite terrain, cargo y7.12 | 0.0291m | 0.0000m | 0 / 0 |
| No cage, **no terrain**, cargo y7.12 | 0.2293m | **2.2612m** | 0 / 0 |
| Cage, **no terrain**, cargo y7.12 | 0.4505m | **1.3930m** | 65.23 / 0 |

The first two grounded outcomes differ by centimeters and the fixed-wall impulses remain zero. They **cannot** establish a useful confinement-specific motor affordance. When terrain resistance is absent, rigid rivals consistently displace cargo **farther**, including within the supposed confining pocket. The best observed differences are dominated by support assumptions and actuator policy, not by demonstrated physical reach while the root is genuinely body-locked by a wall. The active arm sometimes contacts a wall without creating a materially superior action.

### Source visual verdict
I inspected actual source-generated 1500×950 Chromium t160 frames. These show a geometric rectangle plus rod, a small cargo rectangle and two horizontal wall bars; the arm is angled slightly, the rigid body turns slightly. There is no meaningful emergent action to present to Owner. Source fidelity is real; gameplay value and visual feel remain **UNKNOWN**. Raw frames are not illustrative art.

### Critical learnings
- **Never qualify a body action from one weak controller baseline.** Force opposing *virtual* stance/friction may entirely disable the chosen rival.
- A large contact tick count or small cargo Δ is not a new practical action; define material meaning before tuning.
- Physical cage nearby does not imply the cage caused differences; measure **actual wall solver contacts** and seek scenario dependence on the cage. This experiment did not.
- A same-shape rigid with higher total actuator effort does not equate to an energy/effort-matched optimal cheap alternative. That remains untested, but already the aggressive cheap rival wins many ungrounded cases.
- P1 retains the source-code unit as an optional negative donor. **STOP tuning targets, load locations, resistances or wall clearances to win P1**. Do not auto-select its technology or P0 as foundation.

## Direction after this falsifier
What earned pursuit in P0 was **material continuation**: after one actor physically changes the world, another later has new options. P1 did not establish independent limb usefulness. A more promising qualitatively different material verb could be **contact-triggered compliant grasp/drag/transport/release of a material body** within a shared edited world — not simply rotating a rod against a crate. This is a hypothesis, not a P2 mandatory roadmap. Any such grasp must be physically sourced with finite applied impulses and equal/opposite momentum, no teleport/inventory mode and cheap pushing/dragging rivals. Do not treat future actuator action as self-directed NPC cognition.

**Continuity:** Main `docs/AGENT_RUN_CURSOR.md` + `docs/RESEARCH_STATE.md` are first-read pointers; confirm P1 exact HEAD and CI after report edit. There is no public deployment change.
