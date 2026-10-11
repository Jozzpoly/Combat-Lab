# Combat Lab P11 — false positive risk: body backing vs target cargo-ground drag (2026-10-11)

**Status: REAL physical source test / action still PRACTICAL FAIL / not selected architecture.** This is a terminal bounded negative-first research donor, NOT P10b feature implementation, a chosen Rapier2D locomotion substrate, 3D veto or Owner feel PASS. Historical Owner R0/R1/L0 FAIL remains active.

## Exact source provenance / verification

- Code: [experiment/p11-material-brace-source](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p11-material-brace-source), modules \`src/p11-brace.js\`, isolated query-only test exposure in \`p10-ui.js\`, source harness \`scripts/p11-browser.mjs\`, independent workflow \`.github/workflows/p11-bracing.yml\`.
- [EXACT emitted Vite/Rapier2D deterministic 0.21 Chromium CI PASS 38155662371](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38155662371), and normal branch project \`check\` PASS 38155662318, HEAD \`db55c69612642c3f8769c863da9c11ef964e3081\` at tested implementation. **39 real 240-tick source worlds**, 4 source-matched unretouched Chrome frames, JSON artifacts \`p11-real-bracing-source\` (14-day retention). The frames compare actual run states, not generated illustrative visuals.
- Parent: independent P10b quiet manual material workshop branch; preexisting P10/P10b standard experience, steering, cameras or source body models are NOT changed in default behavior. P11 query parameters run and pause standalone research source worlds. \`main\` only documentation pending, public deployment unchanged.
- Full real numeric source state: \`p11-evidence/p11-real-39-material-contact-cases.json\` in aforementioned CI artifact.

## Question

Does a genuine **physical world wall behind an independently motorized hinged body** provide a new material handling action which did not exist without that backing? And does a movable real 90kg backer differ from a fixed infinite-mass environmental wall? Earlier P10 showed a powered limb/contact with ≈5mm 32kg cargo movement on the existing finite virtual ground, yet an uncontrolled zero-support test moved considerably more. P11 must distinguish support/contact influence from **target load friction** before declaring stance, morphology or Rapier substrate the limiting cause.

## Source design and honest controls

Reuses one actual physical P10b courtyard and one same body, cargo (32kg), hinge and motor. Actual authored physical transform places tool root at (12,6.6), source cargo at (15.15,7.32). Body center and independent panel are real dynamic bodies linked via real Rapier revolute joint. All dynamics remain solved, material cargo has its own collider and finite (not magically attached) mass. A backing barrier at (11.04,6.6), box half-extents (.23,1.7) is either **absent, fixed wall, or freely dynamic 90kg object**. No support changes the actor's component set, uses special trigger logic or pins body translation. External world backing is NOT a real foot, floor normal reaction or biomechanical stance. The tested motor command is exactly the same target .9 radians with equal/opposite angular torque impulses between root and panel, never an external root-translation impulse.

- Initial no-actuator null with exact identical source actor+payload prestate for each backing/support control.
- Separately ablate original P10 source finite virtual terrain reaction on **actor only**, **cargo only**, **both**, or **neither**; \`actor-only\` leaves extra movable backing load freely sliding and must not be read as the same contact condition as \`fixed\`. 3 backing × 4 support regimes × 2 motor/null =24 plus3 cheap physical rigid+external-root-operator-drive rivals = **27**.
- Independent **12-world predeclared load friction gradient**: actor finite ground force fixed; cargo Coulomb-like horizontal opposing impulse \`μ × 32kg × 9.81 × dt\` at μ=0,.05,.10,.15,.20,.30; cargo angular virtual-ground cap held at24N·m, compared with real fixed backer versus none. Still P10 approximate virtual friction, NOT true 3D grounded load. No changes to source hinge gain/motor per scan.
- Source measurements: complete body material position afterstates, root yaw, distinct contact sample ticks and impulses, actual external operator root effort, internal joint torque sum, ground proxy impulse and pre-action equivalent states. Contact ticks are sampled manifolds not distinct unique contacts.

## Main physical results at t=240 (4s)

| Finite virtual-ground on | Source backing | Final target load displacement | Root yaw |
| --- | --- | ---: | ---: |
| Both actor and cargo | None | 0.00459m | −1.00769rad |
| Both actor and cargo | Fixed world barrier | 0.01300m | −0.37531rad |
| Both actor and cargo | Movable90kg backing | 0.01208m | −0.42982rad |
| Actor only (cargo free) | None | 0.60786m | −0.91298rad |
| Actor only (cargo free) | Fixed world barrier | **0.98960m** | −0.33488rad |
| Actor only (cargo free) | Movable90kg backing | 0.59946m | −0.72638rad |
| Cargo only (actor free) | None / fixed / movable | **0.00499m in all three** | −1.16121rad |
| No proxy friction | None / fixed / movable | **0.59596m in all three** | −1.03828rad |

**Strongest falsifier:** while a real fixed wall behind the root changes its recoil/yaw (211 measured wall-contact ticks in finite run; 53–220 cargo contact ticks), the *same 32kg cargo* does NOT undergo appreciable material movement at the original virtual friction coefficient. **Backing changes hinge posture; it does not create a useful transferable action by itself.** Source data does show more material travel when only the cargo resistance is removed; different source-ground inputs to body vs load must be separated.

**Cheap rigid shape with external DIRECT root-drive comparator** moved the same cargo **1.28575m**, in all three backing scenarios, while injecting ~1370 N·s external root effort. It is *not impulse/energy/actuator matched* to the limb's internal torque and cannot fairly prove morphological inferiority, but it keeps a plausible much simpler operator action live and shows no exclusive successful limb affordance.

## Predeclared nonzero cargo friction sweep: strong negative

| Target horizontal coefficient μ | Cargo movement, no backer | Cargo movement, fixed barrier |
| --- | ---: | ---: |
| 0 | 0.59770m | **0.98022m** |
| .05 | .03066m | **.03809m** |
| .10 | .01387m | .02254m |
| .15 | .00887m | .01734m |
| .20 | .00662m | .01515m |
| .30 | .00459m | .01300m |

No post-hoc gain or motor cap tuning. Holding root ground response constant and restoring even weak cargo horizontal friction (while holding 24N·m angular drag) **collapses practical cargo motion**. At μ=.05, the real wall still reduces root recoil and cargo contact may persist, but only 3.8cm movement occurs. This supports a *force budget/material response threshold* diagnosis for the tested setup. It does NOT prove that actual 3D Coulomb contact would have the same quantitative threshold, nor that μ=0.05 is intrinsically high/low in a real game. The P10 proxy law is a deliberately simplified damping-like capped impulse, not source physical foot/ground reaction. This result does NOT warrant an automatic actuator tuning sweep to force a positive score.

## Real source images and limitations

Four actual native Chrome snapshots at 240 ticks, source-checked against numerical cases: unsupported, fixed-backed, movable-backed and fixed-wall no-motor. Raw pictures show significant silhouette/yaw contrast, plus still very poor biological shape and zero useful handling with realistic finite proxy. The inherited generic P10 overlay label \`ZAWIAS BRAMY\` falls near P11 test cargo; that is a presentational leftover, NOT physically another pivot/contact or new mechanics. Do not claim the screenshot is a clean owner-ready UI. Bounded source GPU/window did NOT measure native owner interactive feel or FPS.

Infrastructure FAILs were corrected and should not be reinterpreted as physics: initial workflow used \`npm ci\` without a repository lockfile, fixed to the same \`npm install\` pattern as existing checks; first appended top-level dynamic import accidentally fell inside non-async \`frame()\`, found by Vite parser and relocated to module scope; both source failures resolved in the exact final CI before physical results. Do not suppress or conceal them when assessing process quality.

## Assessment and next frontier

- **KEEP:** verified real reciprocal hinge ↔ material backing force exchange, phase-specific root-yaw difference, realistic visibility of cheap mechanically adequate alternatives, a reproducible confound of target-load versus actor-ground resistance.
- **FAIL:** useful limb-controlled cargo action under current bounded finite proxy; biologically grounded stance, locomotion, differentiated support mechanics, scene feel and interesting freeplay all remain NOT proven.
- **DO NOT:** merge P11, promote 3D or 2D, add artificial position-lock "brace", overdrive the servo to "win", interpret total motor impulse as metabolic work, silently select P10b as project foundation, or return to synthetic crowd traffic.
- **NEXT STRONG DISCRIMINATOR:** a shared physical whole where independent material support points are produced and lost through **real** contacts and a creature's action (foot/anchor/posture in material space), not the lab's permanent wall. Compare with **bounded, costed planar virtual-ground rival** and plausible rigid operator strategy, and evaluate real afterstate under movable loads, contact pressure, obstacle changes, readability and actual human control. A constrained 3D substrate deserves testing only if source-selected whole genuinely needs vertical support/normal force beyond a cheaper planar approximation (see S2). A specific operator-action feel test in P10b remains desirable before choosing scale/host. No claim that the next candidate has been selected.

**Continuity:** Current live repo/CI/Owner feedback supersedes this snapshot. Prefer P10b canonical pointer in main for the prior whole; P11 is isolated terminal scientific result. No public release or merge.
