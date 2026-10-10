# X0 — Body-origin material action, bounded checkpoint (2026-10-10)

**Research status:** isolated X0 PR #4, working implementation under narrow emitted-Chromium/WASM test; **NOT OWNER-QUALIFIED / NOT A SELECTED ARCHITECTURE / DO NOT MERGE OR DEPLOY**. This observation was made after the conversation-limit recovery and another Owner-first audit. Historical R0/R1/L0 Owner product FAILs remain intact.

## Why this experiment was worth doing

A live comparison of source and the original serious-world intent found that X0 offered externally authored point impulses, body movement and passive contact servo, but not a **continuous, body-origin action on matter**. A researcher could displace boxes at will; the *body* could not intentionally keep and move a physical load through its own real members. This was a more concrete possibility-surface deficit than the shallow "make the field less quiet" diagnosis. Non-selected stillness remains intentional, not a bug to fix with randomized roaming.

## Mechanism and source boundary

- The selected body may request a temporary hold with right click on an existing material collider. A root or independently articulated limb collider must lie within **0.18 m geometric acquisition tolerance** of the material; this is **NOT an assertion of a solver-active tactile manifold**. The operator explicitly initiates the action; no NPC decision is implied.
- Actual world-point anchors are stored relative to the physical actor part and material. Each physics step delivers capped equal-and-opposite point impulses at the real moving bodies, not kinematic object translations. Each actor has independently editable finite hold force, including zero. Holding follows the limb/body and is released when the anchor separation exceeds **0.72 m**, preventing indefinite remote towing.
- Material mass and ordinary Rapier rigid collision/hinge/prismatic constraints remain live. Mouse wheel, authoring, body selection and the existing local contact policy were not converted into a new "grip architecture". Existing starting-scene recipes missing the added hold-force parameter retain compatible default interpretation. This is a simple powered adhesive/contact abstraction, **NOT physically solved fingers, normal-load friction grasp, natural hands, or a universal handling system**.
- Right-click acquire/release was exercised by actual Chromium pointer events, not merely a unit-level method call.

## Positive, negative and null evidence

At [same-commit browser CI 38010573098](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38010573098), after 105 actual fixed steps in a bounded *authored* setup:

| Counterfactual | Recorded result | Strict meaning |
| --- | --- | --- |
| Two-arm body, 18 kg matter, manual motor to left, hold on | Material X = **−3.253 m**; hold retained | An actual body-origin force changes a continuing material interaction |
| Same two-arm body, 18 kg, hold off | Material X = **+0.6173 m** | Matched on/off difference is **3.8703 m** in this specific fixture |
| Rigid 0-arm body at same root and geometry | Cannot acquire same remotely placed load | The actual articulated member changes geometric acquisition. Total body masses are **not exactly matched**, so do not claim a controlled full-anatomy causal attribution |
| Two-arm with hold force = 0 | Cannot acquire hold | Mechanism has independent zero-authority counterexample |
| Same two-arm with **400 kg** load | Matter X = **−0.4822 m**; hold slips once | Finite authority cannot tow indefinitely; heavy load resists and breaks contact. Does not prove a mature grip-slip model |
| Held light load, **zero manual drive** | Combined body+material center-of-mass drift **0.0006 m** | A narrow check against false reactionless locomotion; not full momentum/energy conservation proof |
| Hinged bar, same manual input, hold on | Rotates **0.5725 rad** | Attachment can interact with constrained material |
| Same hinged bar, hold off | Rotates **1.0856 rad** | **Negative for the claim that hold necessarily enables or improves hinge action.** Ordinary contact did more in this fixture; do not tune the case to make a success badge |

The data support one new narrow body-origin material capability, not an Owner-quality verdict. The strongest light-load effect requires a researcher-controlled actor, an authored encounter geometry, and a manual directional motor input. It is not a demonstrated organism choosing an action, nor a second organism gaining a new opportunity.

## Subsequent attempted two-actor crossing — NEGATIVE, not hidden

[Chromium source run 38010822752](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38010822752) used one continuously simulated *authored* field with two different bodies. In phase 1, the first articulated actor pulled light matter; in the counterpart its finite contact hold was disabled. In phase 2, a distinct broad body was selected and manually commanded with identical control input. **In neither case could that second actor acquire the load.** After first-actor holding, the load subsequently moved another **1.252 m**, compared with **0.129 m** without the first hold. That would look like a second-actor consequence if we ignored provenance.

A fourth counterfactual held the second actor entirely idle in each phase-1 world: the subsequent load displacements remained **exactly 1.252 m and 0.129 m**, respectively. Thus the apparent second-stage material effect is **inherited residual motion, not action by the second organism**. The physically meaningful second-actor affordance crossing remains unproved in this setup. Do not change the fixture until green and then advertise "cross-actor agency"; this is a useful counterexample to that very method.

[Same-head later Chromium CI 38010883745](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38010883745) also exercised the right-click contact hold while issuing real keyboard directional input and single-stepping the browser UI. The real UI transfer continued without immediately breaking the light-material hold. This tests input wiring, not human control feel.

## Open limitations and stop boundary

1. The present test does **not** establish the valuable whole-world crossing: one actor materially changes a *different* organism's possible subsequent action in a freely rearranged shared world.
2. Initial grasp eligibility is a bounded **geometric near-touch rule**, not an active contact-impulse sensor. Do not call the acquisition itself a sensed reflex.
3. The zero-gravity top-down plane uses externally powered planar traction proxies. No foot-ground mechanics, genuine carry burden, body posture under gravity or flexible anatomy is proved.
4. The mechanism is a spring/damper motor and a simple distance-slip boundary; torque transfer, energy drift at extremes, actual human grip feel, dense-world robustness and sustained throughput are unqualified.
5. The original first-run world remained sparse. More diagnostic PASSes will not make it a compelling discovery experience.

**Decision:** retain this isolated X0 addition as possible material-action donor; do not promote X0 or turn this into a compulsory grip subsystem. Next judgment must return to the wider possibility surface and an independently compelling whole, with alternative interactions not explained only by holding one free block. Respect Owner attention and withhold public rehearsal pending real qualitative evidence.
