# K1 — kinetic shelter / interception scout (2026-10-11)

**State:** isolated **source-scoped physics scout**. NOT a new whole-world specimen, not an E1/W2 successor, not a selected Combat Lab engine or anatomy, not merged/deployed, and not Owner-tested. The previous R0/R1/L0 Owner FAIL remains binding. K1 arose from a fresh post-W2 reselection: test a plainly legible **non-transit** material event (interposition between a flying object and another physical body), with a credible cheap alternative, before adding AI/crowd/pathing.

## Live authority / provenance
- Branch: `experiment/k1-kinetic-shelter-scouter` from neutral `main`; source under `src/k1-world.js`, interactive `index.html` + `k1-app.js`.
- Sourced exact-head Chromium + Rapier2D deterministic + Vite + 9-case comparator **PASS**: [CI 38096941480](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38096941480), source at commit `186c8d5159b94db41f27129804d8bbea8cab5cb2`. CI uploads **actual** t0/t65/t100 PNGs plus full JSON as artifact `k1-exact-source-frames`. Frames are taken from running emitted source, not synthetic illustrations.
- Rendered screenshot truth: a small, legible rigid-collider mechanism with physical material world, NOT lively organisms, gameplay, or a qualitative Owner success. Operator UI has been rendered in actual Chromium, but full mouse/keyboard interaction has NOT been separately browser-injected/validated. No publication or First Look.
- The browser uses **2D zero-gravity top-down** Rapier. Shots are finite impulse-bearing 0.6kg CCD discs, witness an 11kg real physical disc, shields full physical colliders. User-driven root movement is an explicitly external finite traction proxy, not legs or support.

## Predeclared simple comparison and outcome
One source/scenario controller runs the SAME incident direction and impulse (20 N·s) with three initial morphologies:
1. **bare:** 65kg root, no broad panel;
2. **rigid:** that same 65kg root **plus one rigidly-attached 25kg panel**;
3. **hinged:** same 65+25kg shapes with a real self-contact-enabled revolute joint.

Panel/collider dimensions, total mass, launcher (x=3), no root-drive, zero hinge torque and movable witness are matched. The witness is deliberately positioned ON the shot lane for each Y condition; repositioning is treated as **author input and resets the outcome reference**, not as physical travel. Each condition executes **50 actual solver steps**, to measure first flight before far boundary rebound can confound results. The jointed body truly has zero applied motor impulse in these passive trials (not a configured servo set to zero force). No artificial `protected` flag, target-directed damage, route, hit-trigger, hidden path, collision resizing or afterstate injection.

| Shot line Y | Bare witness actual travel | Rigid shield | Hinged shield | Interpretation |
| --- | ---: | ---: | ---: | --- |
| 10.0 | 0 m | 0 m | 0 m | Core itself intercepts the center shot. No shield advantage. |
| 11.2 | 0.2335 m | **0 m** | **0 m** | Physical expanded cover changes the outcome; articulated topology unnecessary for this incident. |
| 12.0 | 0.2335 m | 0.2335 m | 0.2335 m | Outside panel span, all variants fail to intercept; important geometric negative control. |

For the offset Y=11.2 shot, at step 50 the free projectile reaches ~x23.649m; with rigid and hinged shields it remains near x13.30–13.33m, away from the witness. The witness displacement is a matched world afterstate, not a direct contact-pair event count. Exact first-contact pairs/impulses are **not logged**, so do not over-attribute projectile/witness mechanics beyond the paired solver outcomes.

The simple passive rigid panel is fully adequate for the tested off-axis material consequence. No K1 evidence that a joint or complex body is worth its physics/control/authoring cost. More morphology must earn a different action.

## Adversarial defects found and repaired during this run
- The first manual hypothesis aimed from the left at a panel positioned **behind** the root; this would fake a shield inference from a front root collision. Shield repositioned upstream of root before interpreting results.
- Using a dynamic hinge with a target-zero feedback controller is **not a passive null**. Added an explicit `panelControl=false` default; only operator Q/E activates finite paired torque. Passive CI requires exactly zero joint motor impulse.
- The witness initial `y=10` position was used as the comparison origin even when the author repositioned it to another Y. That falsely counted authored position edits as projectile afterstate. Fixed reference reset; CI now asserts zero pre-shot witness travel.
- The deterministic Rapier package initializes without `RAPIER.init()`; the first emitted browser build failed to boot until removed. The toolchain's syntax/build PASS did NOT catch this; raw Chromium gate did.
- Actual rendered frames remain stark geometric colliders and one projectile. This is NOT a lively shared world or a user-desirable Combat Lab whole. Accept the limitation.

## Permissive interactive research surface
Inside the isolated branch, the operator can pause, single-step, reset, spawn hinged/rigid/bare actors and free loads/witnesses, click a guard, issue finite player root movement (WASD), command hinge actuation (Q/E), Ctrl-drag edit objects while paused, pan/zoom, and shoot physical projectiles by dragging. These are code-level interfaces, not claims of successfully human-tested feel; malformed/free-body overlaps from arbitrary authoring are permitted but should be inspectable.

## Stop rule / next discriminating move
**STOP** if another experiment is just geometry tuning for a prettier screenshot or more corridor hits; K1 proved only a basic causal possibility, and the cheap rigid competitor already matched the shield. The single next plausible unique opportunity, if independently worthwhile, is **action-dependent interposition**: physically reorient a shield while keeping the carrying body in its own spatial relation under off-axis unpredictable incidents. Compare exact same world against a whole-body rigid orientation action and a credible collision-aware cheap shape model; use explicit control input/impulse provenance. Do not script projectile success, assume anatomy wins, or import ReflexBrain automatically. If independent useful action cannot be demonstrated in a truly editable world, retire K1 as a narrow donor and reselect another whole-level idea.

**NO automatic promotion:** do not merge to `main`, move `rehearsal/current`, publish Pages, or request Owner First Look because 9 mechanical probes passed.
