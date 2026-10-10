# Combat Lab B1 — material envelope as a REAL body action (2026-10-10)

**VERDICT: BOUNDED PHYSICAL DUAL-AFFORDANCE PASS / OWNER PRODUCT UNKNOWN.**
**NOT** accepted locomotion, natural muscles, gameplay, a living organism, a selected substrate or permission to merge into E1/main. [Isolated draft PR #10](https://github.com/Jozzpoly/Combat-Lab/pull/10), rooted in *replaceable* M0 physical source; no public deployment. Historical Owner R0/R1/L0 experiential FAIL persists.

## Why this run was selected

E1 had a material shared world and local independently triggered movement, but all morphologies acted through the same externally provided planar root drive and no *different body-specific action* was established. B1 tests a physical envelope-changing capability, explicitly alongside a simpler permanent-narrow rigid body. The experiment must earn not only passage through a restricted aperture but a SECOND distinct material action available after expansion. Root locomotion remains an admitted force proxy; the question is **shape/affordance of a body**, not self-generated gait.

## Physical truth and controls

Actual Rapier2D deterministic source, same 44×27 field, fixed 1.24m material corridor spanning X≈18.5–23.5; UI can physically reposition the corridor walls or remove their rigid bodies. The two mobile side targets are real free 40kg colliders centered at (30.5,11.95) and (30.5,15.05) in the second challenge, not scripts, triggers or animations.

- **Articulated:** one 85kg core (0.51m × 0.32m half extents) + two 20kg physical wings (0.80m × 0.12m half extents) with two genuine revolute joints mounted on **front corners**, pivot offsets (+0.65m, ±0.33m) and child anchors (−0.80m,0). Total 125kg. In front-mount mode the pieces have full connected-self collision ON and do not need overlap through the core to fold.
- **Operator anatomy drive:** explicit bounded equal/opposite angular *impulses* on wing+root toward unfolded ±90° or folded 0°, with positive damping; tested upper per-step impulse 3 (not physically modeled muscle energetics). No instantaneous collider resize and no assigned scene outcome. Two arms move and hit other bodies as real mass.
- **Root motion:** same external planar force-proxy limit 860 N, speed target 2.15, with optionally enabled separate finite heading-assistance torque. The total body masses of both single-collider comparators are also 125kg, but their inertia/contact distributions are NOT matched and the 85kg core accelerates differently than a 125kg single body under the same capped root impulse.
- **Cheap small rigid:** hx=1.07, hy=0.46, fixed 0.92m vertical span — passes a 1.24m gap with zero anatomy motor.
- **Cheap wide rigid:** hx=0.55, hy=1.90, fixed 3.80m vertical span — physically exerts broad contact but cannot traverse the gap in the prescribed scenario.
- **Articulated deployed:** ~3.86m vertical span; **articulated folded:** ~0.90m under real solver constraints. Post-contact it may rotate and otherwise change its silhouette naturally.

## Important FALSE START / source correction — retain forensic evidence

The early actor appeared 'actuated' numerically but its wings stayed at ±1.66 radians and jammed the tunnel; a narrow rigid body passed. More torque alone, including a sixfold magnitude increase on the old center mount, failed to create folding. The relevant Rapier API detail: the last `createImpulseJoint(..., wakeUp)` boolean **does not** mean `collideConnected`. Explicit `joint.setContactsEnabled(false)` actually suppresses attached-body collision. Source: [Rapier World](https://rapier.rs/javascript2d/classes/World.html), [UnitImpulseJoint](https://rapier.rs/javascript2d/classes/UnitImpulseJoint.html).

Temporarily disabling connected self-contact permitted the old assembly to move through the corridor, **EVEN WHEN commanded to stay deployed**. Thus that was **not** proof of intentional folding; it could passively flex/fold and allow overlapping parts. We rejected this as the desired material capability. Moving the *actual hinge pivots to the front of the body* avoided that internal collision trap and permitted an explicitly stronger finite reciprocal actuator to drive a non-overlapping physical fold with self-contact ON.

**Broader warning to M0 and other multi-part donors:** `createImpulseJoint`'s wakeUp parameter is not a collision policy. Internal articulation claims may be constrained by actual overlapping collider geometry and must inspect self-contact; do NOT silently modify earlier source and retroactively claim its behavior changed. A hinge count or impulse command count is not evidence of an achieved angle.

## Same-aperture source results (actual Chromium)

[Real Chromium / Rapier2D 21 prescribed source-world cases and dual-action controls CI 38093244735](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093244735). Nine initial cases demonstrated failure; later case batches deliberately exposed the confound rather than hiding it.

| 720-step variant (all target same real gate) | Root passed X>24.6? | Bounded finding |
| --- | --- | --- |
| Center hinge, original finite motor and self-contact | **NO** | Actual wing folding FAIL |
| Center hinge, self-contact OFF, fold commanded | **YES** | Invalid for body envelope fidelity; contact OFF |
| Center hinge, self-contact OFF, stay deployed | **YES** | Falsifies 'commanded fold necessary' in that geometry |
| Front hinge, self-contact ON, weak torque | **NO** | Underpowered under inertial load/pressure |
| **Front hinge, self-contact ON, finite torque cap 3; fold at tick 100** | **YES** | By tick 180 hinge angles near 0 and span ~0.90m; at tick 300 remains ~0.90m; **0 sampled gate contacts** |
| Same front hinge and torque, stay unfolded | **NO** | Broad body physically blocked, ~389 gate samples |
| Same front hinge with NO actuator | **NO** | Materially unpowered joints did not earn crossing |
| Cheap rigid small, same total mass and force cap | **YES** | Foldable anatomy NOT required merely to pass |
| Cheap rigid wide | **NO** | Broad fixed shape does not pass |

**This is no claim of optimal strength or biomechanical realism.** The stronger actuator was consciously tested after a recorded FAIL to establish physical feasibility; its chosen gain is not a calibrated muscle specification.

## Second action: same actor folds, crosses, unfolds and displaces side objects

[Source: independent 780-step paired scenario matrix in Chromium CI 38093244735](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093244735). All gate-world actors start X=10, no actor teleport. A **laboratory/operator authored** control signal opens the hinges after tick 500, not autonomous obstacle sensing.

| Exactly prescribed full-world action | Entire material body beyond corridor? | Lateral 40kg object ΔX pair | ΔY pair |
| --- | --- | --- | --- |
| **FOLD at tick 100, UNFOLD at 500** | **YES, first at tick 402** | **+0.9245m, +0.8765m** | **−1.391m, +1.3575m** |
| Fold but KEEP FOLDED | YES, tick 402 | 0, 0 | 0, 0 |
| Equally massive cheap RIGID SMALL | YES, tick 417 | 0, 0 | 0, 0 |
| RIGID WIDE with gate **removed** | N/A for honest passage | +7.8647m, +7.8646m | ≈0, ≈0 |

Fold/unfold physically drives open projected Y extent ~3.86m → ~0.90m → ~3.86m; object displacements arose from **nine observed material contact samples**, not a world teleport or an authored object-position trigger. Rigid wide is significantly stronger in the wide-contact-only trial and stays a cheap competitor. Rigid small traverses more simply but cannot touch both off-axis material objects under the prescribed path.

**B1 earns a narrow but genuinely different physical body ability: one changing anatomy supports two otherwise conflicting material affordances.** This is more persuasive than extra NPC behavioral states because the material world discriminates it. It still does not imply the resulting creature is fun or lifelike; a compound collider with cheap, explicit shape-mode switching could conceivably match the gameplay outcome at lower cost and must be treated as a future rival.

## True unretouched visual truth / UI

- [t0 actual deployed body](media/b1-source-t0.png)
- [same real physical body folded at tick 180](media/b1-folded-t180.png)
- [same world redeployed and touching side objects at tick 580](media/b1-redeployed-t580.png)
- [same world after material encounter tick 780](media/b1-post-physical-contact-t780.png)

The real frames are still simple bars, rectangles and tiny objects, with no creature art, biologically plausible posture or locomotion. Their sole value is genuine geometry/contact at exact solver moments; do not replace visual truth with an image-generation illustration. [Actual UI e2e gate CI 38093244735](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093244735) validates actual click fold/unfold **and achieved hinge geometry**, 1.25→2.5m physical gate-slider movement, direct W motor, deletion of true wall bodies, variant rebuild, physical side-target reset and scene reset. These are synthetic Chrome page events, not Owner feeling/joy.

## Adversarial cheaper collider-profile baseline (POST dual-action result)

[Actual emitted Chromium/WASM same-source comparisons CI 38093607072](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093607072) · modules: `src/b1-profile.js`, `src/b1-cheap-test.js`.

Compared real front-hinged 125kg body to a single 125kg rigid-body whose collider profile is **authored externally** to alternate between broad (hy1.90) and narrow (hy0.46). One candidate changes geometry instantly at the command tick; the other changes it over **60 steps** with actual updated collider geometry each frame, but with **NO modeled muscle effort, material-volume conservation or joint reactions**. Both are explicitly approximations and cannot be called soft/multi-body physics. The same 1.24m physical corridor, 40kg material targets and fixed fold/unfold input sequence were used.

| Source model | Entire body crossed real tunnel? | Two off-axis material objects ΔX |
| --- | --- | --- |
| Real two-wing finite actuation | YES, first tick 402 | +0.9245m / +0.8765m |
| Cheaper 60-step collider-profile morph | YES, tick 417 | +7.8936m / +7.9121m |
| Cheaper instant collider swap | YES, tick 417 | +7.8647m / +7.8646m |

**Key NEGATIVE for physical fidelity exclusivity:** a cheap one-body mode-switch can indeed reproduce passage plus broad material displacement in an unobstructed author-scripted sequence, and may even push more strongly because its rigid broad surface maintains contact. Morphology complexity is not established as gameplay-necessary by the two-action success alone.

**Critical pressure falsifier**: after physically entering the tunnel folded, each candidate was ordered to expand at solver tick 330 *while its body remained surrounded by fixed material walls*. All retained finite coordinates (no catastrophic NaN); however attempts to inject an oversized one-piece collider into the walls produced extreme contact solver impulses.

| Model | Maximum sampled contact impulse per step |
| --- | ---: |
| Actual hinged body (wings physically constrained by contact) | **23.2969 N·s** |
| 60-step externally edited collider | **21,438.2041 N·s** |
| Instant externally edited collider | **156,010.418 N·s** |

The articulated body expanded only as much as real contact allowed; its span at step 480 was ~1.61m under contact pressure, with solver tolerance/overlap and 142 accumulated wall contacts (NOT a perfect hard no-penetration guarantee). The gradual collider grew to ~3.8m **while still inside the tunnel**, producing hundreds of accumulated contact samples and abnormal solver forces; the instant profile jumped to 3.8m in one step and similarly penetrated/conflicted with material walls. This is evidence against **these exact naive geometry edits**, NOT proof all low-cost authored approximations must fail.

**A fair future cheap rival** would first assess available space and progressively limit deformation through explicit material constraints, while preserving a low-cost body model and diagnosable behavior. But such authored collision-aware morphing has design/debug cost, can be more dependent on special cases, and is NOT currently implemented or verified. Compare it if a real player-experience question justifies this additional cost. The positive hinge result does not select multi-body physics as the foundation of Combat Lab.

## Boundary and next research

**Disposition: KEEP B1 as an isolated conditional physical donor; unmerged, no public Pages promotion.** Unlike E1's simple attraction/role shifts, B1 supplies one real bodily action whose effect depends on morphology. However it does not yet belong automatically inside E1; merging would harden its 2D body+force-source implementation and risk losing sight of the intended broad organism and crowd vision.

Next conscious comparison should focus on **the practical value of joint-constrained anatomy versus a collision-aware (NOT naive) cheap shape-mode approximation in an editable *crowd* and real Owner free play**, rather than further hinge tuning. Another unexplored ability could be protecting/holding space under real pressure; B1 does not prove support-ground bracing. Body-specific action, local behavior and world must eventually meet in a common serious organism, but that is a separate decision requiring actual human feedback. Do not start a reflex/perception project in this repo or call a diagnostic mechanical PASS 'Owner PASS'.

When resuming: live GitHub branch/source and latest exact-head CI override this dated report; main/docs/RESEARCH_STATE.md and main/docs/AGENT_RUN_CURSOR.md route the current objective. Rehearsal/current must remain unchanged absent Owner consent.
