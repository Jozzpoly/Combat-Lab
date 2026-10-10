# S2 — actual contact-derived grounding versus cheap planar friction (2026-10-10)

**Research result, not architecture selection.** Isolated `experiment/ground-contact-s2`, derived from neutral research `main`, with a separate 3D Rapier 0.21.0 substrate. K1, X0/Y1/Z1 and historical Owner FAILs retain their prior scope. No public rehearsal, merge or Owner feel PASS.

## Why this is not another K1 brace

K1 posture blocking depended largely on a **world-relative horizontal brake** applied to a body upon contact. When disabled, apparent guarding collapsed. S2 instead gives dynamic rigid bodies a vertical coordinate, physical gravity, a genuine static ground collider and the normal/tangent impulses of an actual 3D contact solve. Both bodies are constrained to yaw rotation only to retain a surface-constrained top-down representation; this **does not** create feet, gait, balancing, dynamic human stance or self-directed creature action.

The force source is a clearly identified **external laboratory ram**. It applies finite positive-X impulses to a dynamic pusher; it is not an organism's muscle/ground-propelled locomotion. It contacts a free dynamic defender. There is no material tether, scripted outcome, wall-relative brace or invisible anchor. Physical ground can be deleted by removing its actual rigid body.

## Important falsification and corrected source truth

Two bugs were detected and not silently rewritten as new wins:

1. The first floor was only 22m wide; the 'ice' test departed the physical floor and fell, invalidating the final planar-travel comparison. A 240m-wide experimental floor fixed that artifact and a guard-height assertion now rejects such a departure.
2. **Crucially:** Rapier uses `Average` friction combination by default. A floor material coefficient 0 touching defender friction 0.9 therefore had effective contact friction **0.45**, not 0. The initial values including **17.8625m** 'ice' and the initially dramatic extra-load results were incorrectly interpreted and are **superseded**. The ground now explicitly uses `CoefficientCombineRule.Multiply`; zero floor friction is truly zero effective friction. The 2D comparison law was corrected to match that choice. Only subsequent corrected runs are eligible evidence.

[Corrected genuine contact and load comparison — emitted Chromium CI 38018977998](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38018977998):

| Real 3D ground coefficient | Guard travel with identical 720N external ram for 7s |
|---|---:|
| 0 (zero tangential friction) | **78.5528m** |
| 0.15 | **61.4501m** |
| 1.2 | **0.1239m** |
| 2.4 | **0.0204m** |

Ground contacts occurred in all 420 pressure ticks across these four grounded cases. Zero gravity yielded **zero** ground-normal impulses and **78.5543m** of travel; the identical no-force control did not move. No support-height artifact remained.

## Deliberately cheap 2D rival (important NEGATIVE for 3D exclusivity)

A *separate* Rapier 2D baseline uses the same box footprint/mass and the same external ram input. Instead of a real floor it applies a transparent horizontal velocity-opposing impulse capped at `surface_mu × collider_mu × mass × gravity × DT`. This is **an authored law**, not a physically grounded normal reaction. Under matching 420-tick inputs it reproduced **the qualitative sliding-vs-gripping ordering**: 78.55m without modeled friction, 61.93m at floor coefficient 0.15, and 0.73m at 1.2. These are not numerically calibrated solver twins; different 2D vs 3D contact pipelines and approximations make exact values incomparable.

**Consequence:** for a flat world where the only question is 'does this body slide under a known push?', 3D is **not yet proven necessary**. Do not promote 3D just because it produces a physically sourced normal force. The cost/throughput comparison for dense crowds is **still unmeasured**.

## A property genuinely absent from the simple planar candidate

[Verified physical floor removal, CI 38018683386](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38018683386): after settling the same body, an outside researcher **removed the actual floor rigid body/collider** in one matched world while the other retained it. No body behavior flag, no fall script, no external push.

Over the following 150 ticks the defender's Y stayed at 0.9m when supported, but descended to **−29.0213m** when the floor was physically removed. Ground contact steps **after the edit** were 150 vs 0. This is real support/topology continuity in the 3D substrate; the simple planar surrogate would need additional authored support-state rules to replicate it. The floor was removed by a researcher, **not** by another organism. This does not yet prove the value of verticality in the intended game.

## Material load bearing (with inertia falsifier)

An independent physical 80kg mass was allowed to fall onto the 120kg defender. The payload remained in actual solver contact during all 420 sampled push ticks (yaw-constrained boxes cannot tip). Its frictional influence **must not** be confused with its inertial mass.

The amended controls found:

| Ground coefficient | No payload | Actual 80kg payload |
|---|---:|---:|
| 0 | 78.5528m | 56.8997m |
| 0.25 | 49.5448m | 22.5152m |
| 0.7 | 0.4558m | 0.1116m |

**At zero effective ground friction there is already a sizeable difference**, proving that added inertia/load transmission contributes independently of floor traction. At nonzero friction the grounded reaction also changes, but neither the relative contribution nor human gameplay value can be deduced from travel distance alone. Extra mass is genuine matter, **not** an RPG defense-stat buff.

## Actual UI and qualitative limitations

[Exact real browser UI control run CI 38018683386](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38018683386) successfully operated the actual sliders, 7s push trigger, pause, gravity-change world rebuild and physical floor removal. The initial and after-pressure browser screenshots were directly inspected on this run: the scene is readable but **still just two rectangles**, not rich bodily movement or an interesting first-run environment. The live browser UI gives an optional real 80kg load and surface friction controls; body height is explicitly displayed, with below-surface objects rendered faded to avoid showing a fallen collider as still safely standing.

### What S2 earns and what it does NOT

- **Earned:** an actual support-normal/tangential-friction physical source, finite force transference, physical stack load effect, and natural fall when a material support collider disappears.
- **Also learned:** a transparent cheaper planar rule reproduces *part* of the displacement phenomenon without 3D; dimensional upgrade remains an open cost/value question.
- **Not earned:** foot/stance/body posture dynamics, controllable locomotion, a complex interaction language, actor-created support topology, spontaneous NPC ecology, real crowds, verified FPS scaling or Owner's experience-level PASS.
- **Explicit stopping condition:** do not keep calibrating static S2 ram/blocks for a better chart. The next serious discriminator should force real inter-body movement/choices or physical material-topology changes in a coherent, operator-discoverable environment, ideally under measured crowd throughput. Compare simpler source/fake options fairly. This is a research question, not a frozen 3D engine roadmap.

Branch remains donor-only; exact-head source and CI must be checked on resumption.
