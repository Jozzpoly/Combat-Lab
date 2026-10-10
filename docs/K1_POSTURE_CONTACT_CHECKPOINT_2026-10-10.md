# K1 — posture changes available contact (2026-10-10)

**State: major negative support-ablation result.** Independent limited physics experiment; contact/posture actuation exists, but effective space denial in these cases is largely **support-proxy-dependent**. Not an accepted architecture, product PASS, merge candidate, public rehearsal or proof of grounded defensive stance. Historical Owner R0/R1/L0 FAILs stand. Branch `experiment/posture-contact-k1` from neutral main; source-donated Z1 collision/workbench core.

## Research question

After Z1 proved a body can push free, pinned and rail-constrained matter with no adhesive hold, a harder question remained: **can a body change its own available contact envelope while the SAME world continues, so another physical body experiences a different opportunity — rather than merely changing its root movement force?** Rival explanation: a larger rigid collider with comparable mass/envelope may be just as effective.

K1 uses a two-arm physical defender facing a manually piloted broad challenger in a real-collider corridor. A protected free load is behind the defender. Defender arm joints receive explicit finite joint torque commands; its body has **zero root motor** and receives externally proxied finite contact bracing (not real ground/support). All movement by the challenger is **researcher-commanded**. No NPC route, scripted success event, hidden shield, body-to-matter hold or world drive.

## First quantitative boundary and measurement correction

The first probe mistakenly measured only defender contacts against the challenger's central hull, omitting its physical prow. That version's total contact counters were **invalid** and must not be cited. The code was corrected to inspect all real collider pairs; [corrected emitted-browser CI 38017002461](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38017002461) re-established contact evidence and actual finite bracing.

The original five-offset comparison `y = -0.9,-0.45,0,+0.45,+0.9 m` showed posture-dependent results, but the approximate rigid long-hull surrogate **stopped the challenger more reliably across all sampled offsets**. A more complex articulated shape does not automatically beat the simpler collision approximation.

## Crucial controlled live-posture change

[Actual timed postural switching run 38017100005](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38017100005): in one continuous solver, guardian limbs first reached their open physical reference; while the challenger was idle, the same guardian was commanded to fold via actual joints. The challenger then received identical finite forward input in all tested worlds. Comparators included (a) remaining open, (b) requesting a fold with **zero actuator torque** and (c) a static roughly mass/envelope-matched rigid hull.

- Joint rotation for one limb changed by **0.7083 rad** at the commanded fold boundary; no new organism was constructed for this change.
- Challengers' eventual forward position differed by over **0.25 m in 4 of 5 samples** when active joint reconfiguration was compared against the no-torque command.
- At middle initial offsets −0.45 and 0 m, actively folded posture held the challenger approximately **2.78 m and 1.84 m further back** versus same fold command with zero torque. Both had real observed defender/challenger contacts.
- At +0.45 m, a large forward-position difference occurred **without recorded direct defender/challenger contact in the open control**; treat it as downstream multi-body geometry or indirect state change, **not evidence of defender physically blocking an impact there**.
- Outer ±0.9 m conditions showed little usable fold-vs-open difference. Do not claim universal space denial.
- The rigid hull was the more reliable pure blocker at these locations; it lacks the runtime bodily opening/folding action, but this does **not** establish biomechanical superiority of the articulated alternative.

### Geometry change versus actively sustaining force

[Follow-up torque-hold ablation CI 38017208533](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38017208533) added a condition where the defender **physically folded with its motors before the encounter, then motor torque was disabled just before contact**. Compared against torque continuously maintained, it changed the challenger's eventual position by over 0.25 m in **only 1 of 5** preselected offsets. Therefore **most observed posture-dependent variation is caused by the changed physical configuration, not proof of actively holding a defensive force-bearing stance**. In the exceptional −0.45 m case continuous actuator torque did measurably alter contact evolution; this remains a local physical result.

### Browser/workbench truth

[Emitted Chromium and UI evidence 38017315937](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38017315937): actual E/R keyboard commands independently targeted both real arms to folded state. After switching selected body to the challenger, unselected defender limbs still physically changed angle by **0.5451 rad** within 100 solver ticks, no adhesive contact events. The operator can therefore issue the postural action without resetting the shared world. Agent-inspected before/after 1440×900 frames confirm the real arm transformation and shared corridor, but expose a sparse, largely static stylized mechanical study with substantial sidebar UI, not an Owner-engaging experience. Temporary screenshot instrumentation was removed after inspection; compact deterministic UI and physics gate remains.

## Critical falsification: remove nonphysical root bracing

[Actual same-browser support-control run 38017518528](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38017518528) repeated the same **open vs folded** selected postures at the three central lateral placements, changing only `brace` on the defender from 2600 to **0**. Same manual challenger input, actual colliders and finite joint torque in both worlds; no adhesive hold or motorized material.

| Challenger lateral offset | Fold-minus-open challenger X with support proxy | With proxy completely OFF |
| --- | ---: | ---: |
| −0.45 m | −2.6425 m | **−0.1246 m** |
| 0 m | −1.8438 m | **−0.0405 m** |
| +0.45 m | −4.8976 m | **−0.1223 m** |

Without the automatic body-bracing counterimpulse the guardian was physically displaced to approximately **x=20–22.6 m**, instead of remaining near x≈17–17.5 m in the decisive supported cases. It no longer functioned as an effective passive anchor. Both arm-posture variants still produced actual contacts, but **the formerly decisive gameplay-style space-denial contrast largely disappeared**.

This is a **major falsifier** of any claim that K1 has demonstrated independently useful grounded stance. It has *not* falsified physical arm reconfiguration (which also passed the live keyboard and angle test), only the idea that the current unsupported model can sustain a convincing defensive position. A finite external force proxy is a source of reaction work, not a legitimate substitute for modeled foot-ground/contact support. Any further K1 tuning that retains this proxy must say so explicitly.

Next serious work should compare plausible, appropriately scoped support substrates *against simple honest baseline*, with evaluation of **real movement/stance choices, readability, cost, robustness and inter-body contacts**. Candidates might include explicit 2D foot/contact friction, surface-constrained 3D support, or even a deliberately authored cheaper approximation where deep physics adds no Owner value. These are research alternatives, not an architectural mandate for 3D.

## Synthesis / actual frontier

- **Demonstrated (conditional):** genuine timed articulation changes contact geometry and, **when an explicit ungrounded bracing proxy is ON**, can change a challenger's pressure outcome. Removing that proxy nearly eliminated the measured space-denial effect in three decisive cases. No valid grounded stance or standalone defensive combat action has been demonstrated.
- **Not proven:** physical dominance over a simpler rigid structure; sustained ground-reacted defensive stance; natural gait; new NPC choice/initiative; robust ecology; full open-world material/topological interaction; or **Owner-level feel**.
- **Next question:** does a more expressive **force/support/contact representation** (possibly stance-dependent resistance or constrained 3D, not prematurely mandated) actually buy distinctive, readable player actions compared with simpler planar rigid-body control? Evaluate multiple interactions in a coherent world, not another set of increasingly tuned corridor offsets.
- **STOP rule:** don't continue adjusting K1 position, brace, mass or torque merely to obtain prettier contact counts. Preserve K1 as source-scoped donor and evaluate the wider whole-level bottleneck.

At report time branch state is isolated and no public environment changed. Inspect current Git refs/CI before any future claim; no Owner judgment has been requested or obtained.
