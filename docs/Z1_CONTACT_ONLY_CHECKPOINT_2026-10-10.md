# Z1 — contact-only force transmission in a shared world (2026-10-10)

**STATUS:** isolated research candidate, not merged, not deployed, NOT Owner-qualified. Independent branch from neutral main using **source-scoped** X0 mechanics. Historical R0/R1/L0 Owner FAILs remain untouched. No automatic architecture choice.

## Question, method, and what is actually disabled

Y1 produced much of its apparent newly available action through an artificial `beginHold` method. Does the current 2D rigid-body substrate permit **materially different human-operated actions by actual body geometry and contact impulses alone**?

Z1 removes the source implementation for that adhesive hold, disables the public entry point, and intentionally uses **zero authored world motor power** in its starting scene and tests. All selected bodies receive **finite researcher-operated movement impulses**, not NPC plans. All free/hinged/rail-constrained matter is adjudicated by Rapier collision/joints in the *same one editable field*. The physical experiment does not pretend to simulate feet, terrain friction or stable stance; root drive/bracing are explicit top-down support proxies.

There are five resident body shapes, five movable free objects, a fixed-pivot beam and one rail-constrained material. These are **research-authored encounter positions**, not scripted victory triggers or authored tasks. The available Z1 workbench allows arbitrary reconfiguration after pause, but this does not automatically make the initial composition compelling.

## Three physically distinct consequences — narrow positive

[Exact Z1 browser/solver run](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38016006759) compared manual movement, manual idle and zero-root-motor at identical initial state, over 180 physical ticks each, with no body→material hold and no world power:

| Material | Selected actor input | Direct solver contact | Actual target result | Idle/zero-drive |
| --- | --- | --- | --- | --- |
| 48 kg free block | Broad body moves right | 130 contact ticks, 642.12 total contact impulse units | ΔX **+4.6465 m** | target stationary |
| Passive pinned beam | Broad body moves down | 3 contact ticks, 151.53 impulse units | **+1.2488 rad** rotation | beam stationary |
| Passive slider | Broad body moves right | 126 contact ticks, 433.06 impulse units | ΔX **+4.6819 m**, ΔY 0 | slider stationary |

Three distinct material constraints produce *different physical responses to contact*, without a magical grasp, programmed path, or special gameplay switch. **It is still the SAME basic input action (drive body into matter)**. Do not call this three different bodily skills.

[Cross-geometry perturbation CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38016107285) sampled five offsets −1, −0.5, 0, +0.5, +1 m perpendicular to approach; each material was contacted at all five placements, and target afterstates diverged from identical idle controls. However free-block impact at outer offsets lasted **only one active contact tick**, producing a one-off impulse rather than controlled sustained manipulation. Hinge contact in most cases lasted **1–8 ticks**; its large final angle is primarily momentum after collision, not evidence of sustained torque control. Rail pressure was longer (21–135 ticks). With mass multiplied by 0.25 and 4 at identical root drive, resulting travel varied considerably. This shows force/inertia sensitivities under the proxy, not locomotion realism.

## Sequential two-organism consequence — controlled but authored

A separate prespecified contact-only chain physically positioned another resident body on the same continuous field at three nearby positions `x=17.1,18.0,18.9` before starting. There was **no later teleport of the material**.

Stage 1: first broad body manually pushed the same free load, or remained idle. Stage 1 then settled physically for 40 simulation ticks. Stage 2: a distinct jointed organism was explicitly commanded to move left, or remained idle, with no adhesive hold and no powered world material.

[Whole chain source run](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38016212561) recorded real body-2→load direct solver contacts in the later moving phase for **21,19,30 ticks** respectively when the earlier push happened, against **0,0,0 direct ticks** in the first-body-idle control. Later object ΔX differed from the exact same stage-1 world's second-body-idle control by **−1.718, −1.4505, −1.6144 m**. The no-first-push controls also had *indirect* matter differences after later motor commands; these are not miscredited as direct contact. The source action is **explicit researcher steering**, not autonomously chosen cooperation. This is a **narrow change in contact availability in researched positions**, not a generalized ecosystem or proof of higher-level collaboration.

## Direct visual review and strategic negative

Real 1440×900 Chromium first/after screenshots were inspected from [CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38016319229). The free-object contact and onward propagation are visible; however, the first frame still presents three fairly disconnected authored interaction stations separated by a large grid and a dense sidebar. The visual experience is **not** a natural, spontaneously curiosity-provoking whole. It lacks rich shape diversity, expressive posture/body force negotiation, autonomous local intent, spatial/topological change, accessible intuitive controls and grounded locomotion. Machine screenshots do **not** substitute for Owner experience.

The inherited X0 fake visual regions were removed, and an inherited visible grip-force field was hidden since it is inert. These are necessary clarity repairs, not major product gains.

## Adjudication and stop rule

**Demonstrated:** genuine contact-only material transfer on free, anchored-pivot and constrained-rail matter, with bounded local variations; an authored sequential two-organism material-contact chain without an artificial tether.

**Not established:** three kinds of *organism action* (rather than one push into different objects), ability of a body to reason/choose, meaningful mass-dependent support, stable blocking posture, material topology changes, reactive crowd ecology, Owner feel, or product value.

**Strategic result:** contact mechanics need not be discarded, but `contact-only` by itself does not turn a mechanical yard into the wanted laboratory. Do not respond by more coordinate fitting, repetitive headless metrics or more powered mechanisms. Preserve this candidate as a source donor. Next research must decide whether more meaningful *material situations, physical body configuration/support or world topology* is what enables genuinely different actions and experiments. Fair constrained-3D/2D comparisons should remain open, not assumed.

No PR merge, public rehearsal or architecture promotion. Sources remain branch-scoped and dates are provenance, not live truth.
