# K1 — posture changes available contact (2026-10-10)

**State:** independent limited physical experiment. Not an accepted Combat Lab architecture, product PASS, merge candidate, public rehearsal or proof of grounded posture. Historical Owner R0/R1/L0 FAILs stand. Branch `experiment/posture-contact-k1` from neutral main; source-donated Z1 collision/workbench core.

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

## Synthesis / actual frontier

- **Demonstrated:** genuinely articulated, timed configuration change on an existing organism can modify physical access/pressure outcomes in another body without scripted collision exceptions or a magic grip.
- **Not proven:** physical dominance over a simpler rigid structure; sustained ground-reacted defensive stance; natural gait; new NPC choice/initiative; robust ecology; full open-world material/topological interaction; or **Owner-level feel**.
- **Next question:** does a more expressive **force/support/contact representation** (possibly stance-dependent resistance or constrained 3D, not prematurely mandated) actually buy distinctive, readable player actions compared with simpler planar rigid-body control? Evaluate multiple interactions in a coherent world, not another set of increasingly tuned corridor offsets.
- **STOP rule:** don't continue adjusting K1 position, brace, mass or torque merely to obtain prettier contact counts. Preserve K1 as source-scoped donor and evaluate the wider whole-level bottleneck.

At report time branch state is isolated and no public environment changed. Inspect current Git refs/CI before any future claim; no Owner judgment has been requested or obtained.
