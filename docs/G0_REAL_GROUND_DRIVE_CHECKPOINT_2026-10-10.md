# Combat Lab G0 — TRUE ground-reaction source calibration (2026-10-10)

**CLASSIFICATION: SCOPED MECHANICAL CAUSAL PASS, NOT an organism, not gait, not Owner product/feel PASS, not architecture selection. CLOSED DIAGNOSTIC.** Branch `experiment/g0-physical-ground-reaction`; review [PR #8](https://github.com/Jozzpoly/Combat-Lab/pull/8) is research-only; public `rehearsal/current` unchanged. Historical R0/R1/L0 Owner FAIL stands. Full report is intentionally not a mandate to implement G1.

## Why this question earned a single bounded run

M0 achieved differentiated physical collision for rigid, jointed and spring-connected bodies, but the selected body's whole-translation motion still came from a **world-facing finite planar impulse at the root**. No natural force source existed in its arms, feet, support or terrain. After T0/W1/M0 it was more valuable to check the **source of locomotor effort** than to tune spring/contact counts.

Physics invariant: internal motor torques alone do not provide free-space center-of-mass propulsion to an isolated system. Translation must exchange momentum with something external (ground, water, air, another dynamic body, thrown mass). Consequently, a top-down 'body motor' pushing center directly is a **deliberate support proxy**, not genuine leg/foot locomotion. It may STILL prove the better gameplay and performance choice.

## What actually exists

An independently built Rapier3D **four-wheel calibration robot**, no creature metaphor. Actual vertical gravity, fixed physical ground collider, 4 separate dynamic cylinder wheels and revolute axle joints, 95kg hull, 12kg each wheel, friction rule explicitly set to `Multiply` for real zero-friction controls, and an optional 155kg passive dynamic obstacle. The body/wheel dynamics are not pre-recorded animations. Vehicle visual is a crude top-down 2D projection of the real 3D physical positions.

In wheels mode **NO horizontal root impulse is ever applied**. Only the four axle joint motors receive velocity targets. Horizontal translation requires actual wheel collider friction against real ground. Alternate `root-proxy` mode applies a plainly labeled direct chassis impulse, not an 'organism' motor. `passive` has revolute joints with **no motor configuration ever activated**.

Implementation + negative controls: `src/g0-world.js`, `src/g0-probe.js`, `g0-app.js` and `scripts/browser-live-gate.mjs`. [Exact Chromium/WASM full causal run 38089508879](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879). Ten source-equivalent predeclared cases × 420 solver ticks, partitioned across two Chrome launches only to avoid a non-deterministic big-DOM timeout. The partition changed **no parameters or physics claims**.

**Important COM instrumentation:** measured full mass-weighted center of mass over **all dynamic objects (chassis+wheels+passive obstacle if present)**. Chassis coordinate alone is not proof of propulsion because internal joint rearrangement can shift the chassis while maintaining COM. The force-source check applies to COM.

## Main source results

| Prescribed condition | Whole-system COM ΔX | Chassis ΔX | Wheel-to-ground contact ticks | Root injected impulse |
| --- | ---: | ---: | ---: | ---: |
| Joint-wheel motor; friction 1; passive obstacle in scene | **+2.63375m** | +5.12740m | 218/420 | **0** |
| Same wheel drive with **friction 0** | **+0.00126m** | +0.00262m | 420/420 | **0** |
| Same motor command with **no physical floor** | **+0.00619m** | −0.11447m | 0/420 | **0** |
| **Truly passive wheel joints (no motor ever configured)** | **0.00000m** | 0.00000m | 420/420 | **0** |
| Motor-wheel drive; **no obstacle** | **+22.33629m** | +22.33628m | 420/420 | **0** |
| Truly passive wheels; no obstacle | **0.00000m** | 0.00000m | 420/420 | 0 |
| Directly forced root, friction 1, obstacle | +3.22879m | +6.25704m | 416/420 | 2,280 N·s |
| Directly forced root on **friction-zero** floor, obstacle | **+22.76184m** | +32.18854m | 418/420 | 2,280 N·s |

**Primary bounded conclusion:** source wheel motors generated whole-system translation that depended on real ground traction. Removing friction or removing the physical ground collider eliminated almost all whole-system horizontal translation; the directly forced-root model translated without needing friction. With the real passive obstacle in the scene, source wheel motion physically reached the other body (64 aggregate wheel/hull/obstacle contact ticks, obstacle displacement +0.33316m). No hidden contact hold or world motor.

**Do not compare distances between cases of different total system mass**, e.g. no-obstacle (143kg) vs obstacle-included (298kg) COM as a fair velocity competition. These are causal availability tests, not calibrated locomotive efficiency comparisons.

## Source-level FAIL discovered and corrected

Earlier G0 tests incorrectly used `configureMotorVelocity(0,0)` plus `setMotorMaxForce(0)` to mean 'motor OFF'. In those test worlds, the alleged passive configuration still showed chassis +0.76461m and total COM +0.36691m with obstacle (and +0.76461m COM without obstacle), despite the declared zero limit. This is an **observed behavioral flaw of our configuration**, not a general claim about Rapier's API guarantees.

Corrected null: create the actual wheel revolute joint but **never enable/configure the joint motor** if `mode!=="wheels"` or `motor===0`. Under those real null controls, chassis/COM displacement both exactly 0 to recorded precision. The source now also runs 600 initial unpowered settling steps and prescribes a common rest start (all initial linear/angular velocities zero). The phantom mobility did not disappear under merely longer settling or zeroed velocities; eliminating the motor configuration was essential.

**Caution:** zero gravity is NOT the same as deleting ground support. In the gravity=0 driven case the motor/wheel geometry still produced 13 ground contact ticks and COM displacement +1.24437m; actuator/joint forces may generate normals even without gravitational loading. This is a useful negative to a simplistic 'no gravity => no support' control, NOT evidence of flight or forbidden force creation. Physical floor removal is the clean source-availability null here.

## Real visual/Owner-interface evidence and limits

- [Unretouched source-world frame t0](media/g0-physical-t0.png) and [same-world t240 frame](media/g0-physical-t240.png) from the actual emitted Chromium page, [measured same-world timeline](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879).
- The cheap robot reaches the passive block, wheels bunch against it and the hull partially collapses/reorients after impact. In the full obstacle-included 420-step test the hull's Y fell to ~0.22m; **not a reliable walking robot or robust collision-handling organism**. The world remains a rudimentary mechanical calibration, not an Owner-worthy body/crowd lab.
- Actual source UI tested in Chromium: click Pause, click +1 step, send real keyboard W key events, motorized response, delete physical floor with corresponding gravity-induced falling, change mode to a new simulation ([same CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879)). Pointer ergonomics and free human use NOT assessed. Not public.

## Decision

**G0 is closed as a source-of-force discriminator.** The value is separating honest material propulsion from a convenient drive proxy; it has not established a selected creature morphology, gait, movement feel, AI, 3D host, stable postural control or performance budget. **DO NOT evolve wheels into 'animals', tune chassis or tire physics to obtain more distance, or automatically open G1 as the next module.**

Return to **serious embodied whole selection**. Make these distinct but coordinated decisions:
1. **Gameplay/Owner:** what movements and reactive situations should naturally become possible for materially distinct organisms, including dense crowd, larger/smaller bodies, compliant posture, impact, pressure, and actual player agency?
2. **Physical support hypothesis:** would genuine feet/support normals/ground contact create those new possibilities, compared to a cheap, consistently declared proxy?
3. **Representation:** constrained 3D + top-down visual projection versus planar 2D with an explicit contact/traction law versus another honest approximation; select only after relevant in-game tests, not from G0's wheel PASS.
4. **Controller:** independent body-local effort must correspond to measurable material action; do not prematurely import ReflexBrain cognition or scripted traffic routes.

The most valuable next *whole* will have at least two strongly distinct bodily actions and a genuinely consequential reaction in a shared modifiable physical situation, rather than a separate walking demo plus a crate station. The operator must be able to create and destroy abnormal situations without arbitrary hidden blocks. A simpler rigid+proxy alternative must remain a live falsifier.

**Continuity / ownership:** read current `main/docs/RESEARCH_STATE.md`, `main/docs/AGENT_RUN_CURSOR.md`, latest explicit Owner feedback, then this checkpoint only for the relevant G0 donor fact. Verify branch HEAD/CI live; no background work happens between user turns. PR #8 is a contained archaeological artifact, not an approved implementation ancestor.
