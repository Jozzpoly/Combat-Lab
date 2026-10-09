# Independent Embodied Effector Trial — 2026-10-09

**Status:** replaceable discovery experiment, NOT an approved organism, gameplay or architecture. Derived afresh from neutral \`main\` 29afa11623b8f6e9bb7190bfc1a80add709f1453. Does **not** inherit code or roadmap authority from quarantined [PR #1](https://github.com/Jozzpoly/Combat-Lab/pull/1).

## Why this experiment exists

The old R0/L0 failures and the still-unqualified 2026-10-09 rigid-body world both risk framing organisms as motorized polygons that mainly travel, push and jam. Better physics numbers, the same short reflex law and added visual diagnostics do not by themselves enlarge the set of actions.

**Discriminating hypothesis (not final design):** independently articulated collision-bearing body members, with actual reciprocal actuator torques and persistent material contact, can make distinct *actions* possible — encircle, displace, transport, lose or release real objects — that a rigid motor body does not perform under an otherwise equivalent control. The organism is NOT accepted merely because its jaws move.

This branch contains a **pincer** (dynamic trunk plus two dynamic arms, two real revolute joints and solid distal hooks) and a **ram** (rigid broad pusher). Both inhabit one continuous 36×24 Rapier 2D material field with dynamic crates, fixed walls and pinned hinged material. The world permits direct body control, physically authored mass/arm reach/actuator strength, free object placement, paused geometry authoring, live undo and a portable **initial pose** recipe.

There is no central pathfinder, agent route, "grab target" rule, attachment between creature and object, kinematic inventory or scripted victory. The root's planar propulsion is an explicitly finite external ground-reaction approximation in top-down zero-gravity 2D; it is **not** gait.

## Physical evidence and falsification

[Emitted Chromium/WASM CI 37993696554](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37993696554) and subsequent browser qualifications used actual Rapier dynamic bodies, true joints, solver-active contacts and matched simulations.

1. **Actual arm actuation vs zero torque**, 175 steps: at 780 N·m commanded actuator authority the jaws changed their real relative angle ~0.528 rad, made a solver contact with a 13kg crate and displaced the crate 0.181m. With zero actuator authority, the same scene had no contact and zero crate travel. A 210kg crate moved only 0.089m under the active jaws in that setup. These results do NOT mean the creature can carry arbitrary mass.
2. **Contact-only sideways material transport** after physical closure: the same body moved sideways about 5.48m. The free 13kg crate moved 4.345m **without any actor-to-crate joint**, while with jaw actuator disabled it moved 0m. Opening the real jaws halfway through reduced object travel to 3.419m. This is a meaningful physical action contrast, not a secure universal grasp.
3. **Adjacent variation**: in nine cases combining 8, 38 and 180kg crates at three small ±0.32m offsets, active jaw transport exceeded null by between 2.357m and 4.534m. This was a deliberately narrow local neighborhood, not a representative global success rate.
4. **Counterexamples**: moving the crate 2.25m laterally made both active and inactive jaws fail to contact or move it (0m). A highly offset box at +1.4m actually traveled *more* with jaw actuation off (~4.394m) than with it on (~3.352m), because a different material collision geometry dominates. At 2800kg the active jaw travel was ~0.259m and root travel degraded to ~2.861m. These negative cases must be retained.
5. **Geometric intervention at constant torque**, one 38kg box, matched input: physical reach 0.94m moved it ~0.901m; reach 1.53m moved ~2.950m; reach 2.31m moved ~3.216m. Thus the body geometry itself influences an interaction verb. This does **not** justify a universal monotonic reach advantage.
6. **Editor/scene truth:** altering physical jaw span initially failed an immediate collider-pose check while paused, despite updating local collider geometry. A targeted authoring-only transform refresh corrected the stale world pose without advancing simulation. Tests now check actual collider movement, preservation of the two real joints during reposing, capture/restore of physical arm angles/reach/mass, import validation prior to state replacement and reset from a captured starting condition. It is not replay of velocities, contacts or local history.

All claims above are machine-qualified physical mechanisms in **specific** setups. Any comment of "PASS" belongs only to such a declared test. Do not convert test count or the breadth of scenarios into Owner-experience approval.

## Direct image review

A real 1440×900 screenshot of the first emitted browser run was captured temporarily through Chromium. Unlike motor-only colored blocks, the two physical pivot joints and the distal solid appendages are visually distinct, but the field and controller still look like a research toy. The screenshot diagnostic was removed after inspection (no permanent large log artifacts).

## Capability boundaries and debts

- No Owner observation or qualitative judgement on this new experiment. **Product status UNKNOWN.**
- No true organism cognition, independent local agentic behavior, physiology, compliant soft bodies, feet-ground contacts, or general animal gait.
- Only two exploratory body configurations; the ram is not a normalized matched alternative in every test. The body/matter exploration is useful but far from the larger living-world horizon.
- Very unusual authoring remains constrained by solver numerical safety; physically implausible but finite combinations should continue to be allowed.
- No qualified real FPS, dense population performance, multi-minute numerical stability, or robust big-world edits.
- Crate manipulation sometimes occurs through direct bodily collisions even with the jaws inactive (not all objects are inaccessible to a rigid body); do not claim a mechanism has exclusivity it has not earned.
- Direct input quality, latency, camera feel and discovery value have NOT been human-tested.
- The apparatus contains no body-world learning, long-lived goals or autonomous coordination. Those remain outside this targeted discriminator, not secretly "solved".

## Next independent research decision (not an authorized roadmap)

Does physical articulation enable multiple naturally discoverable material actions across freely assembled scenes, including difficult negative cases, in a way that a rigid body/virtual grip cannot explain? If the answer remains only a scripted squeeze-and-carry trial, keep the findings as a donor and discard the implementation. If a more expressive whole is justified, derive its anatomy/control/world interface from the phenomenon, not from this prototype's PR branch.

**Operating boundary:** keep [PR #2](https://github.com/Jozzpoly/Combat-Lab/pull/2) as draft. Neutral \`main\`, public \`rehearsal/current\` and the quarantined PR #1 retain separate roles. No automatic inheritance or merge.

Reference: [Official Rapier JavaScript 0.21 joint guide](https://rapier.rs/docs/user_guides/javascript/joints/) and [collider positioning guide](https://rapier.rs/docs/user_guides/javascript/collider_position/).


## Next independent capability boundary — 2026-10-09 late, real UI and physics

**Why continuation was needed:** two physically independent Rapier revolute arms still had only *one coupled actuator command*. This artificially prevented free body manipulation in the actual lab despite mechanical anatomy. Green squeeze-and-transport fixtures therefore overstated the realized action repertoire.

### Uncoupling a real anatomy rather than adding an AI policy

The pincer now has independent upper and lower actuator commands (0–1 opening) with separate finite reciprocal joint torque through the existing Rapier constraints. Coupled Q/E controls remain for convenience; Z/X and C/V, plus two live sliders, address upper and lower directly. Captured JSON starting conditions preserve each arm's **target aperture and actual physical joint pose**, falling back to the old coupled command when a prior v1 recipe has no independent targets. The 1% slider granularity issue was caught by browser event testing and corrected.

[Actual Chrome/WASM independent-arm comparison](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37996734359): one real 38kg box, same world, same movement authority and overall commanded translation. Upper-only, lower-only, both, and neither were run with offsets −0.48m, 0m, +0.48m. At 0m offset, the post-contact box traveled:
- both jaws inactive: 0.760m, **NOT zero** — the original physical body still collides;
- upper alone: 1.870m;
- lower alone: 2.401m;
- both: 1.829m.

At all three local offsets, upper-only versus lower-only resulting object positions diverged by about 0.733–0.822m. The object also rotated by different measured angles. These results demonstrate *different material continuations* from separately authored control over actual arm bodies. They do not prove superiority of "lower-only", universal manipulation, human usability or complex organism behavior. The null-motion case is a vital counterexample to claims that all contact is newly created by appendage closure.

### Breaking instead of scripting: an external point-impulse tool

The live UI now permits a researcher to draw an arrow from a **real dynamic collider** (crate, gate, whole rigid body, or a jointed limb), with authored finite impulse magnitude in N·s. The force is applied once at the actual pointed Rapier rigid body at the chosen position. This is **explicit external experimenter intervention**: never credited as a capability/behavior of the creature. Paused impulses take effect upon stepping/resuming; running ones preserve material afterstate. Tool use suppresses incidental mouse-aim torque on the selected creature, avoiding an unreported second intervention.

[Browser mouse-input and physics comparison](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37997114786) proves that the toolbar button and actual pointer drag change real crate linear velocity and reset the tool state. A separate physical ablation applies equal 400 N·s impulses to the centre and an off-centre point on otherwise identical 45kg crates: central impact yields 0 rad; off-centre yields ~−1.123 rad after 75 steps. An impulse directed at the pincer tip reaches its own separate physical hook/arm rigid body; the constrained body chain carries some of the effect into the root (measured root velocity deviation ~0.132m/s in that particular case). This is not a magical "push object" teleport.

### Direct rendered-image feedback and first-run caveat

A 1440×900 Chromium screenshot of the *real* updated workbench (temporary diagnostic [run](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37997291207)) showed both independently controllable jaws and the point-impulse toolbar clearly. **Major remaining experiential limitation:** the scene still looks sparse, has only two static non-autonomous specimens until interacted with, and renders the bodies as geometric mechanical prototypes. A slightly closer initial camera and shorter nonessential prose were then authored to improve discoverability, but must not be mistaken for human qualitative approval. Temporary screenshot base64 console emission was removed after inspection.

**Hard boundary:** stronger mechanical manipulation evidence does not constitute a broad living-world answer. The body is a research actuator, not a qualified organism. Owner direct experience and whole-world possibility remain open; former Owner FAILs have not been overturned. Do not scale this one mechanic into an architecture by momentum.
