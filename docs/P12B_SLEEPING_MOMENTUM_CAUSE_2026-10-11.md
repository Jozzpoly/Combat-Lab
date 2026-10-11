# Combat Lab — P12b: sleeping-body contact was the primary source of apparent linear momentum nonconservation (2026-10-11)

**Result: ROOT CAUSE LOCALIZED IN EXPERIMENT / NOT A PRODUCT-LEVEL FIX.** This resolves the *large* P12 movable-backing momentum discrepancy. P12 still does NOT demonstrate gait, useful sustained locomotion, credible organism or Owner-accepted feel. A very small residual remains and cannot be described as exact conservation.

## Source and full evidence

- [Isolated P12b source](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p12b-momentum-integrity); implementation HEAD **\`5083f79c2ef53c413aa4a49635b4b3e9718fb124\`**, independently [real emitted Vite/Rapier2D/Chromium 24-world CI PASS 38163867448](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38163867448). 24 real 300-tick worlds across solver iterations 4/12/24, CCD on/off, joint self-collision on/off, wall absent vs independent mobile 90kg backing, and an **explicit dynamic-body awake null**. 7,200 source solver ticks, no bare Node physics imitation.
- Source \`src/p12b-momentum.js\`, optional isolated \`?p12baudit\` instrumentation only, full raw numeric JSON in CI artifact \`p12b-com-ccd-source\` (retention 14 days). Original [P12 negative-first report](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p12-material-pushoff/docs/P12_WORLD_CONTACT_COM_NULL_2026-10-11.md) correctly called momentum discrepancy unexplained *at the time*; this later result explicitly supersedes only that unknown.
- All worlds use same internal paired torque actuator, same moving body/root/panel geometry, same contact material, **NO virtual ground force, NO XY root motor, zero linear/angular damping** on the three targeted bodies. The only purposeful physical source change for decisive A/B is waking the movable load each frame (NO new impulse). All status and velocity ledgers are from true WASM rigid bodies.

## Diagnosis in causal order

1. With **no material contact**, internally actuated body+panel COM and combined linear momentum remain effectively constant (momentum residual ~\`0.000038 kg·m/s\` at 12 iterations).
2. With independent **movable 90kg backing** and standard Rapier automatic sleeping, the target already first enters \`isSleeping()===true\` at **step31**, before first measured real limb contact at **step78**. The momentum ledger first crosses 0.01kg·m/s on **step107**, exactly when the backing is reported sleeping. After that, total whole-world linear momentum residual ≈**2.0886671 kg·m/s** and combined body+backing COM shifts **0.0375147m** at300 steps.
3. CCD enabled vs disabled produces **identical** results at fixed solver iterations. Root/panel joint self-collision enabled vs disabled produces **identical** results. Increasing solver iterations 4→12→24 retains essentially the same large residual ~2.07–2.09kg·m/s. All targeted linear and angular damping coefficients are0, and P12 found no foreign physical contacts for those bodies.
4. **Matched sleeping ablation: same world/motor/solver, wake backing body before each solver step via \`RigidBody.wakeUp()\`.** This is not a force source or a static world pin. Now target stays awake through and after contact and total momentum residual collapses to **0.0000244 kg·m/s**, with system COM shift only **0.0002297m** at 12 iterations. Effect repeats at all three iteration settings:

| Rapier solver iterations | Backing allowed to sleep: final momentum error | Explicit awake backer: final momentum error | Sleeping COM drift | Awake COM drift |
| --- | ---: | ---: | ---: | ---: |
| 4 | 2.0686102 kg·m/s | 0.0000287 kg·m/s | 0.0371824m | 0.0002351m |
| 12 | 2.0886671 kg·m/s | 0.0000244 kg·m/s | 0.0375147m | 0.0002297m |
| 24 | 2.0895939 kg·m/s | 0.0000099 kg·m/s | 0.0376132m | 0.0011098m |

This is strong narrow causal evidence that **sleeping behavior of an independent very low-impulse load (not continuous damping, CCD, self-contact or solver count)** created the original apparent substantial momentum loss. The diagnostic does not establish *why* Rapier's specific sleep/awake timing policy let contact-driven momentum disappear or whether all Rapier versions/configurations do the same. Avoid unsupported universal "engine bug" claims.

### Practical systems implication

A simulation of embodied finite world matter must explicitly decide which objects can sleep and what *physical contact* must wake them. Treating an asleep light/reasonably mobile load as a stable world support can silently turn a weak organism push-off into a bogus infinite-mass reaction and violate material affordance promises. But turning off all sleep for entire populations would threaten FPS; do NOT apply \`wakeUp()\` globally without profiling, load-scoped gating and interactions under many-body pressure.

**Not earned:** foot-ground contacts, repeatable gait, true body weight transfer, physically stable locomotion, good feel, unique limb affordance over cheap root drive or correct global sleep policy. P10b playable whole remains intact and Owner experiential verdict is unknown. P12 original one-off fixed-wall body COM ≈9.7cm remains source-valid; only previous "unsolved solver numerical instability" interpretation is corrected.

## Disposition / next

**Keep this P12b source *as an isolated numerical/semantic correctness donor*, not a new default physics engine setting.** Integrators should test contact-wake thresholds with the exact intended real-world material/crowd cost, rather than accepting a broad engine default. The first real Owner P10b feel/playtest should not be delayed by this backend issue, because this experiment does not create a new credible creature or gameplay. Public \`rehearsal/current\` and main runtime unchanged.

Project bootstrap: check current \`main/docs/RESEARCH_STATE.md\`, this report and [P12 original pointer](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/P12_HANDOFF_POINTER_2026-10-11.md); the original pointer must now be interpreted with the P12b correction, not vice versa.
