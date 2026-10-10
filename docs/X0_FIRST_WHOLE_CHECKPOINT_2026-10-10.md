# Material Commons X0 — first independent whole checkpoint · 2026-10-10

**Status: MECHANICALLY LIVE / HUMAN EXPERIENCE UNQUALIFIED / DO NOT MERGE.**
Source: [isolated draft PR #4](https://github.com/Jozzpoly/Combat-Lab/pull/4), started from neutral main. PR #1 and PR #2 remain separate, unaccepted donors; PR #3 was a completed, *closed* diagnostic preflight. No parent-child architectural promotion occurred.

## Decision: first coherent whole exists; product hypothesis remains open

X0 now runs as a single physical field rather than disconnected tests of one mechanic. There are simultaneously independently configurable root/arm bodies, independent dynamic matter, real material constraints, sensor-driven finite responses on other nonpossessed actors, direct control and live authoring. Three body configurations are mere initial convenience presets: the new-body authoring form independently varies collider envelope, physical mass, motor authority, and actual 0/1/2 appendages with adjustable physical length. The engine has no global route, predetermined crossing, target or win state.

**This is significant implementation progress, NOT scientific confirmation of the larger goal.** First-run visual review still looks like a sparse machinery workshop. It is not a convincingly living population. Dense, many-body cases show only short spans of contact. A source test or browser PASS cannot override historical Owner R0/R1/L0 FAILs or claim X0 feels good.

## Source, subject and force boundaries

- All collision/matter/joint motion runs in `@dimforge/rapier2d-deterministic@0.21.0` in the emitted browser artifact. Actor limbs are separate dynamic rigid bodies joined by real revolute constraints; pinned beam and sliding beam use actual revolute/prismatic constraints, not discrete game locks.
- The user may apply finite *external* force to real bodies/appendages at a selected point. Only explicit player input drives the selected actor's planar motor. For non-selected actors, tactile contact pressure (from their own solver manifolds) can enable finite bracing and actuate an arm; no global target, path or autonomous roaming.
- The planar floor is **not physical** in a zero-gravity top-down world. Motor and bracing use finite *external ground-support proxies*; no foot/terrain/normal-load/gait claim is justified.
- Research callbacks can independently disable *only the arm reflex* while retaining the identical bracing and real contact physics, so an on/off difference need not be attributed to hull braking. The UI also provides a broader local-response toggle when an actor is not possessed.

## Narrow machine evidence, with negative limits

### Direct emitted-browser controls

[Emitted browser and source CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38007676786) at the last verified functional head before report edits: 8/8 Node integrity checks, browser/WASM field boot, actual mouse/keyboard/GUI actor selection and move, local-response toggles, direct five-body spawn, custom **one-arm** physical morphology (length 2.15m, changed root half-length .68m), arbitrary material creation, impulse arrow, paused hinge rotation, free crate reposition, paused capture and validated posed-world reload.

WASD moved an actual selected dynamic root by **1.421m after 45 single physics steps** with the real capped motor. That is mechanical responsiveness, not qualified player feel.

The default scene contains **4 actors and 8 pieces of freely movable or constrained matter**, plus fixed environmental boundaries, in one shared world. A real 1500×900 screenshot was inspected through temporary Chromium output. It confirms differentiated silhouettes and world objects in a readable field-first interface, but also showed an emotionally and mechanically sparse/inert first frame. The screenshot trace was removed from committed browser checks.

### Direct physical tactile-law comparison

[Actual-WASM comparison](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38007081868): three identical-body/matter trials with a contactable arm, same external impulse and identical finite body bracing, **arm reflex alone on/off**. Contact was observed at ticks 44/42/42; local motor response followed at 45/43/43, not before. Differences in free-object final location were **0.4299m / 0.2716m / 0.0608m**. Zero events were recorded in disabled controls.

An earlier setup at [CI 38006999232](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38006999232) had material divergence but **zero limb reflex events**: the crate contacted the *hull*, not a limb, and body bracing (not joint actuation) drove the observed difference. That failure was retained and explicitly corrected by a narrower physical sensor geometry and separate brace/arm ablation. Never rewrite the earlier test as a limb response PASS.

### Three seeded whole-world pressures, each in both arm-reflex states

[CI 38007437128](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38007437128) and again under latest input CI ran three paired 300-tick worlds. **15 differently configured actors + 19 constrained/free material objects per world**, ten explicit *researcher* impulses per trial. Results by seed:

| Seed | Local arm responses in ON world | Steps containing actor contact / 300 | Actor afterstates different (>0.1m) | Matter afterstates different (>0.1m) | Peak joint-anchor deviation |
| --- | ---: | ---: | ---: | ---: | ---: |
| 19 | 4 | 12 | 2 | 4 | 0.0062m |
| 41 | 3 | 31 | 1 | 2 | 0.0038m |
| 97 | 4 | 13 | 2 | 6 | 0.0057m |

In OFF worlds, no arm reflex events occurred; finite external body bracing remains. All examined states stayed finite. The listed changed actor counts can **include the responding bodies themselves**; they do **not prove an uninvolved bystander gained a new possible action**. Likewise the same target-index external pulse schedule can hit a body at a *different evolved position* after divergence: do not over-attribute all late differences solely to the first reflex. No attempt to infer clock-time FPS from headless virtual time. Joint error in these three loads cannot be advertised as globally better than PR #2's previously measured 9cm extreme case.

**Most important negative finding:** real contacts occupied only 12–31 out of 300 steps. Even in generated multi-body worlds, this leaves most of the simulation with no material entanglement. More mass, color presets and idle motors will not automatically solve it.

## Unresolved crucial scientific gaps

1. **Second-organism affordance change NOT YET PROVEN.** The required qualitative crossing is not simply two masses moving after a local reflex; another *different physical actor* must acquire/lose a possible material action in the same free place without scenario-specific scripting. This is the high-value next discriminator.
2. **First-run physical engagement and Owner delight NOT YET PROVEN.** The agent-inspected screenshot showed coherent geometry and clear controls but inertness. No Owner test yet on PR #4. Do not conceal lack of activity with cyclic random roaming or staged scripted goals.
3. **Material ecology remains simplistic.** Boxes, beams, one hinge, one slider and fixed walls create more relationships than PR #2, but still do not establish the required breadth of physical interaction. Body configuration is broad at spawn, but live post-spawn joint topology/length rebuilding is not implemented.
4. **Scale and robustness remain local.** 15-body stress is a bounded diagnostic, not a population count promise. No real host FPS claim, long-run memory stability, large-scale contact fidelity or aggressive arbitrary shape-topology proof.
5. **Actor-origin provenance remains partly ambiguous.** The automatic servo law is a known simple physical controller, not artificial organism cognition; stress comparisons with repeated external pulses cannot conclusively classify every late divergence as originating from the reflex.

## What now? Disciplined pause vs automatic more features

**Checkpoint recommendation:** keep PR #4 isolated and research it further only where a *new physical possibility* is at stake. Do not port PR #1 policy wholesale, keep growing PR #2's claw, create endless preflight fixtures, or expose this unfinished whole as a public release because of green CI. The next serious pressure should make it possible to inspect **one body changing the physical opportunities of another**, plus at least one honest null/bystander control, in a reconfigurable world, without solving a route.

There is no Owner-level product PASS here. Before asking the Owner to spend time, run a severe first-experience check: does the user see enough intelligible material relationships in the world to try *more than one thing spontaneously*, and can a failed experiment be changed in place? If it remains a statically pretty mechanism playground, its donor physics may deserve preservation while X0 itself is rejected.

**Repository boundary:** `main` retains neutral authority, `rehearsal/current` remains public deployment pointer and must not move automatically, PR #1 and #2 remain separate draft alternatives, PR #3 is closed technical probe, PR #4 is a new **unaccepted independent** serious whole.

[Original X0 research gate](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/MATERIAL_COMMONS_X0_RESEARCH_GATE_2026-10-10.md) · [source frontier](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md) · [Owner truth reconciliation](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/OWNER_TRUTH_RECONCILIATION_2026-10-09.md).
