# Combat Lab — P9 real-material clearance and movable-guard controls (2026-10-11)

**Source qualification only.** This report is a neutral research pointer, NOT approval of a body architecture, crowd AI, product feel, merge, or deployment. Owner historical R0/R1/L0 FAIL remains active. See live source and later Owner feedback first.

## Provenance

- Isolated, unmerged implementation: [experiment/p9-topology-clearance-controls](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p9-topology-clearance-controls); last exact audited implementation head `b126c40ee9967463dadb01ee1ef1d7170fd126d7`.
- [Full exact-head source Chromium/Rapier CI PASS 38112643693](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38112643693), 40 actual physical 460-step worlds plus FOUR raw native Chromium screenshots, source-checked against executed numerical states. The screenshots are not human-observed feel evidence; evidence artifact `p0-physical-source-evidence` expires after 14 days.
- [Actual mechanism and immutable source experiment](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p9-topology-clearance-controls/src/p9-geometry-audit.js), emitted browser entry in `p0-app.js`, CI driver in `scripts/browser-live-gate.mjs`. `main` and public `rehearsal/current` retain their previous executable behavior.
- One FIRST failed attempt launched Rapier's browser-oriented package via bare Node import (module resolution error); that harness was removed. Actual validated source matrix executes via the emitted Vite Chromium runtime, preserving solver/evidence parity. Do not classify initial harness fail as a physics finding.

## Question and sources

After P8 slip steered small pushers sideways into a wall and produced worse occupancy than cheap direct drive in the 2.85 m aperture, ask: **Was lateral room physically available at the guard's cross-section, and how does that differ from displacing a movable guard?** Test a genuine stationary collider as an explicit null control versus the existing independently dynamic 90 kg bulky guard. Neither is a model of a foot, animal decision or human defensive posture.

All cases: same six 27 kg circular pushers radius 0.44 m, bulky guard radius 1.15 m, other real independent cargo, real fixed wall colliders, Rapier 2D fixed 1/60-second steps for 460 ticks, finite virtual terrain traction proxy, source contact and impulse policy. Comparators: simple DRIVE vs 32-step true-contact-triggered SLIP. Two authored center/flank initial positions. Five geometries x two physical guard types x two formations x two movement policies = **40 actual worlds**. Paired drive/slip comparator initial physical fingerprint equality enforced. Temporal distinct-ever crossings separate from final-state occupancy; passage statistic never controls agents.

Geometric side test requires full pusher diameter 0.88 m free between guard edge and local upper or lower wall. This tests **local cross-section affordance only**; it is NOT proof of globally impossible navigation, stable passage or any intended route.

## Critical measured source controls (center formation, same force limits)

| Physical aperture geometry | Guard | DRIVE distinct ever / FINAL | SLIP distinct ever / FINAL | Measured local side margin |
| --- | --- | --- | --- | --- |
| Narrow 2.85 m | fixed | 0/6 / 0/6 | 0/6 / 0/6 | 0.275 m each: smaller than 0.88 m |
| Narrow 2.85 m | movable | 6/6 / 4/6 | 0/6 / 0/6 | initially 0.275 m each; DRIVE pushes guard from x15.07 to x22.0597 |
| Intermediate 3.45 m | fixed | 0/6 / 0/6 | 0/6 / 0/6 | 0.575 m each |
| Open lower 4.15 m | fixed | 3/6 / 3/6 | 3/6 / 2/6 | lower1.575 / upper0.275 m |
| Open symmetric 4.15 m | fixed | 6/6 / 6/6 | 6/6 / 5/6 | lower0.925 / upper0.925 m |
| Wide 4.65 m | fixed | 6/6 / 6/6 | 6/6 / 5/6 | lower1.175 / upper1.175 m |

**Main causal split:** no policy bypasses a truly static guard with no local room. The cheap DRIVE policy can instead physically displace the dynamic guard at exactly the same narrow width (all6 ever crossed), while SLIP weakens forward pressure, guard remains near x15.39, and zero cross. Equal measured total width 4.15 m is NOT equal material access: symmetric versus one-sided authoring yields 6 vs3 final DRIVE on a fixed blocker, despite unchanged initial actor conditions.

The stronger apparent positive of P8 in wide/flank (SLIP6 final vs cheap DRIVE5) still exists; opposite cases falsify universal superiority. Neither policy is motor-effort-matched endogenously even if they share the same per-tick cap. No claim of body shape changing, soft-contact compression, intelligent local planning, anatomy dominance or successful crowd feel.

## Four truly source-matched Chromium screenshots

Inside CI run `38112643693` artifact `p0-physical-source-evidence`:
- `p9-narrow-fixed-slip-real-chromium.png`: 0 final, guard x15.07.
- `p9-narrow-dynamic-drive-real-chromium.png`: 4 final (6 ever measured by matrix), guard x22.0597.
- `p9-lower-fixed-drive-real-chromium.png`: 3 final, guard x15.07.
- `p9-symmetric-fixed-drive-real-chromium.png`: 6 final, guard x15.07.

The test independently reconstructs the world using the same source factory, advances 460 actual WASM steps and verifies the final guard coordinate, physical `fixed` flag, wall/body counts, solver finiteness, and final crossing against the main physical matrix before emitting PNG. Images are unretouched actual browser screenshots. This is source provenance, NOT proof of useful aesthetics or Owner experiential acceptance.

## Design conclusion / limits / next credible frontier

**KEEP the measured material/topology insight; DO NOT promote the P8 motor.** Shape, obstruction, actual movable matter and spatial layout can explain apparent failures of steering. More steering coefficients cannot make a locally too-small rigid aperture physically fit without relocating matter, changing body configuration or finding other actual space.

DO NOT immediately turn these 40 tests into P10 corridor-tuning or treat source tests as a whole-world playable success. The next higher-value evidence should confront a **freely editable coherent WORLD with several distinct Owner-discoverable physical actions and matched cheap rivals**, not another script of six fixed-drive circles. Human play, natural movement/control feel, durable multi-actor behavior and organic anatomy are UNPROVEN. Keep [P8 negative-first handoff](P8_HANDOFF_POINTER_2026-10-11.md) and original Owner fail provenance.

**Status:** isolated tested physics donor; no new human-qualified specimen, no merge to main, no public release, no automatic architecture selection.
