# Combat Lab — P12 material push-off: real contact, NOT gait (2026-10-11)

**Live priority:** Owner historical R0/R1/L0 experience FAIL remains in force. This is a physical-source donor, not an approved organism, locomotion model, scene, architectural foundation or public deployment. P10b is still the most recent operator-editable experimental whole. Verify live source and newest Owner corrections before proceeding.

## Proof / exact state

- [P12 isolated branch](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p12-material-pushoff); **tested implementation HEAD** \`1e5a33720effe1fe0ef6bea4f102bb94c228cde3\`; [exact source real Vite/Rapier/Chromium CI PASS 38158334650](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38158334650). Branch HEAD later \`0c55f131\` is an added forensic report, not a physics change, subject to current status check. [Detailed negative-first source report](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p12-material-pushoff/docs/P12_WORLD_CONTACT_COM_NULL_2026-10-11.md).
- 33 genuine physical 300-tick worlds, four actual source-verified Chromium frames; 21 matched case/null models + 12 numerical-solver-iteration/source-integrity controls. Results and images in CI artifact \`p12-material-reaction-source\` (temporary 14 days).
- P12 controlled actor: 68kg root +22kg independently actuated hinged member, equal/opposite **internal torque**, source external root impulse **0**. Genuine fixed wall vs genuine independent 90kg movable plank vs NO obstacle, with absent/finite virtual-ground variants, inactive motor, repeat-cycle and cheap externally driven rigid comparator.

## What survived adversarial falsification

| External contact with genuine matter | Whole hinged body COM displacement after 300 ticks, virtual-ground OFF |
| --- | ---: |
| No wall, working motor | **0.00001m** (root alone falsely appears to move 0.09324m as limb rearranges) |
| Genuine fixed material wall | **0.09670m**; true contact impulse1.97502N·s, 29 sampled contact steps |
| Genuine 90kg independently moving plank | **0.08496m**; plank moves0.00993m |
| Real fixed wall, motor fully OFF | **0m** |
| Repeat motor cycle | **~0.09668m**, no meaningful repeat advance |

**Earned:** a real internally actuated body can exchange momentum with WORLD matter and shift its entire COM without direct XY root command. It is a SINGLE tiny push-off, NOT walking or self-sustaining mobility. The same actor with finite virtual-ground reacts differently because the ground proxy itself supplies external impulses; do not call that foot locomotion. The rigid direct-drive rival traverses dramatically farther because it is given a fundamentally different external power source, not a matched muscular budget.

**LATER SOURCE CORRECTION (P12b, same date):** This section formerly reported an *unexplained* coupled root+panel+90kg backer COM shift ~0.03751m and all-world shift ~0.00942m. [P12b 24-world forensic control](P12B_SLEEPING_MOMENTUM_POINTER_2026-10-11.md) identified the **backing body's automatic sleep during weak material contacts** as the primary cause: keeping it awake with no force changes net momentum residual **2.0886671→0.0000244kg·m/s**, and coupled COM drift **37.5→0.23mm** at 12 iterations. CCD, joint self-contact, damping and solver-iteration alternatives do not account for the large effect. **The previous "unlocalized generic solver instability" claim is superseded.** Small position residual remains and full conservation is not generally demonstrated. Still NO useful gait or Owner feel.

## Source/Owner boundary and next decision

P12 source screenshots are still crude bars/blocks, not organism visual design. It is **premature to build another motor variant, increase torque, polish these rectangles, or select Rapier2D vs Rapier3D** based on 9.7cm. Stop P12 as a bounded donor. The larger whole question is whether physically different entities can establish/remove FINITE supports through direct interaction and use that to change real options in a free editable world, under an honest cheap root-drive/virtual-ground rival. In addition, current P10b needs actual spontaneous Owner free-play before any product claim. Prefer one strong selection supported by theory+source over serial scripted rigs. No automatic public build/PR merge.

Continuation without Owner paste: verify main and branch heads/CI, read current research and this pointer, do not assume a temporal background agent.
