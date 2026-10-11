# Combat Lab — P12 real material push-off vs COM-null (2026-10-11)

**Scientific disposition: NARROW SOURCE CAUSAL PASS / SELF-SUSTAINED LOCOMOTION FAIL / OWNER FEEL UNKNOWN.** P12 stays an isolated research donor, not selected organism physics, full 3D endorsement, or a new playable creature. Historical Owner R0/R1/L0 FAIL remains binding.

## Exact implementation and evidence

- [P12 isolated source](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p12-material-pushoff) — \`src/p12-pushoff.js\`, optional \`p12audit/p12frame\` query-only instrumentation inside \`p10-ui.js\`, native \`scripts/p12-browser.mjs\` and independent workflow \`.github/workflows/p12-material.yml\`. The default P10b quiet material workshop is untouched; no merge/publish or consumer scene change.
- [Exact full emitted Vite / real Chromium / deterministic Rapier2D CI PASS 38158334650](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38158334650), implementation HEAD \`1e5a33720effe1fe0ef6bea4f102bb94c228cde3\`; project check at same branch requires separate live verification. **33 genuine physical source worlds**: 21 fixed/source controls +12 real solver-iteration checks (4/12/24/48, with contact absences / fixed / independent 90kg load). 4 direct source-matched unretouched Chrome frames plus quantitative JSON in \`p12-material-reaction-source\` artifact (~14 day retention). Full raw source frames were downloaded, agent inspected actual solver scene directly, and compared image crops. The rendered actor is still a simple rectangle connected to a bar.
- Source physics: P10b full native Rapier2D courtyard; operator/researcher places independently dynamic body at (12,12) and an actual fixed wall or independent 90kg plank at (13.65,13.20), geometry equal. Real separate 68kg root +22kg panel linked via existing Rapier revolute joint; motor applies bounded **equal and opposite angular impulses**, never an external XY root impulse. Panel actuates toward 1.2rad; zero-motor null and two-step motor cycle. Also prescribed a completely separate rigid tool propelled by external cheap root force; different force/cost source, NEVER an equal-energy comparator. Support='none' is the clean planar external-traction null; 'finite' has explicit artificial virtual-ground reaction and cannot certify a solely contact-driven motion.
- Measured full two-part body mass-weighted COM (not just chassis), contact manifolds / impulses, its root, and where appropriate physical plank trajectory. Also full-world dynamic COM and a foreign contact inventory. Foreign contacts for the active tool/backer against other objects were absent in tested push-off variants.

## Cleanest causal test, no virtual ground, 300 steps

| Source state | Body COM displacement | Root displacement | Actual contact impulse source |
| --- | ---: | ---: | --- |
| Off motor, wall physically present | exactly 0 to recorded precision | 0 | zero |
| Powered hinged member, **no** wall | **0.00001m** | 0.09324m | zero |
| Powered hinged member, **fixed wall** | **0.09670m** | 0.15475m | 29 contact samples, total positive contact impulse 1.97502N·s |
| Powered hinged member, **free movable90kg plank** | **0.08496m** | 0.14533m | 29 contact samples, 1.73481N·s; plank travels 0.00993m |
| Powered second cycle against fixed wall | **0.09668m**, no meaningful second displacement | 0.17703m | 22 contact samples, same total impulse 1.97502N·s |

**This is a valid but narrow result:** the hinged body's WHOLE mass center barely changes when it only reshapes itself in empty space. When the limb makes real contact with a stationary world collider, the whole-body COM does change, without prescribing any external root motor. It is NOT 9.7cm of useful locomotion. No repeated contact-restoration/gait cycle is demonstrated. Body root movement alone (9.3cm even without wall!) would have been a false locomotion positive if COM had not been measured.

With **virtual-ground finite reaction** re-enabled, body COM moves ~0.0945m even with no wall, while root moves ~0.0009m; this demonstrates the physical-external-force confound from the explicit approximate ground law and is NOT evidence of honest foot propulsion.

### Solver/momentum-integrity limitation (material)

An independent movable90kg plank coupled to the actuator transfers visible recoil. However the coupled COM of (root+panel+plank) changed by **~0.03751m**, despite the no-ground setting, and the entire dynamic-world COM by **~0.00942m**. A dedicated source audit found **no foreign contact pairs** for root/panel/plank against other entities. Across 4/12/24/48 Rapier solver iterations, coupled COM stayed ~0.0372–0.0376m; the change does not vanish with increased iteration count. The same full-world COM for a no-contact dynamic case is ~0, as expected; a fixed-wall contact is explicitly external.

**Do not claim exact momentum conservation.** The remaining difference could involve solver stabilization, joint/contact formulation or unresolved measurement/mass accounting; it is not yet localized to one mechanism. A future claimant must inspect velocities and impulse bookkeeping or compare independent minimal worlds before using this as an energy-conserving body-support architecture. It does not negate the narrower physically grounded fixed-wall vs absent counterfactual, which stays ~9.6–9.8cm across the same solver variation.

### Cheap alternative and negatives

A simple rigid-lever comparator externally propelled through the existing P10 root impulse can travel 9.17m in the no-wall null, or stop at the genuine fixed wall while exerting pressure. That external drive is a **different force source** and not effort matched to a single internal hinge. It is a serious usability reminder that physically accurate limb impacts are not necessarily the cheapest or most satisfying way to move a player body.

The actual source screenshot visibly remains an abstract bar/rectangle, with stale P10 labels and unrelated room objects. A successful source frame and synthetic actuator command say absolutely nothing about Owner experience, natural bodily response, contact perception, human interactive usability or creature anatomy. No FPS/population performance claim.

## Decision

**KEEP the principle / STOP tuning this motor.** P12 validates a limited real-world-matter reaction enabling a tiny one-off COM push. It does NOT establish a sustained gait, meaningful stable propulsion, qualified creature or a reason to select 3D vs planar 2D. Repeating Q/E in the same location does not accumulate progress. The existence of a weak physical possibility should be preserved as donor knowledge, not forced into a promoted feature.

The strongest next development question is at the WHOLE level: can a player naturally create, move and release multiple finite material support points in an editable world and discover genuinely different actions, while cheap virtual-ground/root-drive and simple rigid-body solutions remain active competing candidates? That experiment needs meaningful direct control and material/terrain consequences, not another scripted 300-tick rectangle or a larger servo. P10b is still the latest editable human-oriented whole; its actual uncoached human feel is NOT judged. No PR merge or public deployment.
