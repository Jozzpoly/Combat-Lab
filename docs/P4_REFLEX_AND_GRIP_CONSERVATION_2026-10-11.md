# P4 · Load-contact reflex and impulse conservation falsification (2026-10-11)

**SOURCE-BOUNDED RESULT; NOT PROMOTED.** Branch `experiment/p4-load-contact-reflex` descendants P3/P2 only as isolated experimental donor. P0/P2/P3 `main` code was NEVER merged; `main` retains neutral evidence, `rehearsal/current` and public runtime remain untouched. Owner historical experiential R0/R1/L0 FAIL active. These are real Rapier WASM mechanical and real Chromium native-input claims, **NOT** gameplay, living cognition, real hands, true feet, or autonomous NPCs.

## Frontier and intent
P3 proved independently supplied actions by two physical actors could contest an independent 45kg load. But human-scripted symmetric force scenarios do not prove autonomous behavior. P4 tests whether a *minimal local linked-matter reaction* earns practical difference over a cheap policy without waypoint/goal scripts, and separately audits the physical conservation integrity of the P2/P3 tether before more complex worlds build on it.

## Implemented bounded local sensor/action
`src/p4-reflex.js` `ReflexYard` extends the isolated P2/P3 physical material yard. A configured body can sense **only the location and velocity of its own *physically connected* cargo relative to itself** and its actual link stretch; it does not receive a path, target destination, global map, other people's secret knowledge, win trigger, timestep phase or opponent action script. Reaction is a separately *accounted finite external virtual-ground traction impulse* on its body; NOT muscles/feet/gait. Four policies from the same physical source:
- OFF: nothing after the grip.
- CHEAP BRAKE: oppose own velocity under a cap.
- CHEAP FOLLOW: match velocity of currently connected cargo under SAME per-step cap.
- CONDITIONAL: same follow reaction only after local tether stretch or separation threshold.

A genuine solver contact is required before attaching the physical, separately collided cargo; acquisition never snaps it into position. Source experiments apply a **declared physical operator impulse to real cargo at an off-center point**; afterward there is NO operator drive of the responding actor, NO timed automatic input and NO scripted success event. UI: live P4 branch lets Owner physically prepare a source-contact scene, apply left/right impulse, choose local policy and watch raw bodies. This branch is research only, not new public or recommended gameplay.

## 32 initial actual Chrome/Rapier source worlds
2 terrain regimes finite/no virtual terrain × 4 physical interventions (null, right90N·s, right160N·s off-axis, left160N·s off-axis) × 4 policies. Zero external impulse + finite terrain: all policies kept contact, zero cargo movement. Finite terrain, right160N·s off-axis, 45kg:
- OFF: cargo ΔX +1.0136m, grip 180/180 source ticks, peak link stretch 1.3351m
- BRAKE: +0.6219m, grip 180/180, stretch 1.601m, 310.601N·s of additional proxy impulse
- CHEAP FOLLOW: +1.0556m, grip 180/180, stretch 1.1396m, 156.027N·s proxy impulse
- CONDITIONAL: **bitwise same measured outcome as cheap follow** in that case, grip180, stretch1.1396m, same extra proxy cost

This is **NOT a new material affordance**: even OFF grip survived, and conditional did not beat cheap always-follow. Note in terrain NONE zero-intervention world can drift ~1.5755m due to ungrounded residual initial stage movement; do not interpret that case as static rest or compare movements across support types without subtracting matched nulls. Important source complexity/interpretation caveat.

## 48 POST-HOC stronger-pressure counterfactual worlds
2 terrain regimes × 2 loads45/80kg × 3 real shock strengths240/360/520N·s × 4 policies. No cherry-picked claims; same pre-impact physical state within each matched set. Examples:
- FINITE, 45kg, 240N·s: OFF contact persists 180 ticks, brake **fails** at 20, both FOLLOW and CONDITIONAL persist 180.
- FINITE, 45kg, 360N·s: OFF fails at tick12; brake tick11; FOLLOW and CONDITIONAL fail at tick32 — **longer survival but NOT durable retention**.
- FINITE, 80kg, 520N·s: OFF breaks at tick33; brake at tick14; FOLLOW and CONDITIONAL preserve grip 180/180, peak stretch1.9514m, at 378.1618 N·s external *root* traction effort.
- Without virtual terrain, 80kg at 520N·s: OFF breaks tick31, FOLLOW/CONDITIONAL survive all180 using 524.3424 N·s explicit virtual-root drive; this is NOT energy-free physical locomotion.

**Verdict: cheap following the material earns a real categorical ability to keep connected cargo under some shocks; conditional policy offers no evidenced practical advantage beyond exactly that simpler rule.** Stop tuning sensor thresholds merely to obtain a product-like success. Reflex motor/policy source is externally injected finite traction, not cognition. Stronger shock can break everything, another material falsifier.

## Native UI source
[Exact Chromium CDP CI 38104332528](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38104332528) tested actual mouse click on P4 *contact preset* (requires real solver contact and acquires link without body translation), then genuine mouse click on rightward 160N·s off-center cargo impulse. No synthetic DOM event shortcut. At ~1.25s source cargo moved +1.0534m; 75 real reflex-active ticks spent 129.4701N·s source traction, body and load stayed finite and independent; no break. Two unretouched RAW Chromium screenshot files in short-lived CI artifact, `p4-real-native-before-shock.png`, `p4-real-native-reacting-to-shock.png`. The source pictures still show a circle linked to a rotated rectangle — **not embodied art or guaranteed feel**.

## Forensic finding: P2/P3 full angular momentum was never proved by paired impulses
Current P2/P3 link applies a spring-displacement force plus 2D relative-velocity damping at TWO SEPARATED attachment points. Although linear impulses are equal and opposite, the damping component can act **transverse to the separation vector**, generating a net internal torque with no explicit balancing couple or grounded angular source. Source design should not claim physically complete momentum conservation from linear-pair accounting alone.

`src/p4-conservation.js` constructs a freshly truly contacted P2 link between TWO dynamic Rapier2D bodies with **zero terrain/zero gravity and no subsequent root drive**, author-stops the bodies identically *before* the known external impulse (no cargo pose teleport), prevents artificial link-breaking during the conservation audit only, injects the same measured impulse and compares OFF/no-link, original P2 vector damping, and central/axial-only link. The probes observe true solver mass, inertia, translation, linear velocity and rotation/angular velocity over 300 fixed steps. 3 pulse directions × 3 link laws = **9 actual physical worlds**. [Exact emitted Chromium CI 38104556645](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38104556645) PASS.
- External tangential upward 90N·s: angular-momentum change OFF **+0.020683 kg·m²/s**, original vector-grip **−12.100479**, axial-only **+0.023091**.
- Reverse tangential 90N·s: OFF **−0.020685**, original vector-grip **+12.101377**, axial-only **−0.023680**.
- Diagonal 65×70N·s: peak |ΔL| original 1.6951 vs axial 0.4183, although final axial ΔL −0.4173 is larger in magnitude than original −0.1917; **do not claim axis-only solver parity for all impulses**.
- Linear system impulse drift remains ~0–0.00007 N·s, hence a simple “paired source balanced” test conceals angular issue. The scene's source-free walls/gate are not contacted; solver numerical residual remains, so do not extrapolate exact real-world conservation. Conservation of system angular momentum about a point requires central forces or an explicitly accounted couple.

**Technical interpretation:** P2/P3 did move material in real Rapier, and their gross causal afterstates are source facts. But exact internal contact-grip force semantics are overclaimed if called a fully physically justified passive tether. Need bounded alternative with explicit torsional coupling if hand-like grip is desired, and a differential actual gameplay regression; do not silently merge the axial source into P2 or P3.

## Donor regression of axial grip — SOURCE PASS in bounded test
`src/p4-axial.js` is a deliberate cheap axial-compliant alternative preserving P2 spring constants and max impulse while eliminating transverse force. It runs the **unchanged P2 and P3 source probes** against both original and axial-only coupling, plus the P2 equal-speed adversarial masses/terrain/caps. This is NOT a final "fixed" hand because the axial rope-like tether does not transmit arbitrary transverse shear or intentional grasp torque. [Exact genuine source CI 38104699226](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38104699226) PASS. It executed **96 independent actual WASM physical worlds** (12 legacy P2 + 24 legacy P3 + 12 axial P2 + 24 axial P3 + 24 axial P2 equal-speed stress), in a separate emitted-browser page. Reused original P2/P3 source *fixture code*; the only law change was eliminating transverse grip force while preserving spring constants, peak impulse and actor/operator controls.

**Regression outcome:** the practical P2 and P3 findings survived the axial replacement in measured cases:
- P2 bulky 45kg cargo, virtual finite terrain, pulled DX **−0.7572m old and axial** with break in both; without terrain **−5.0769m original vs −5.0771m axial**, both retained.
- P2 small45 no terrain **−1.9613m old vs −1.9563m axial**, both rupture; original P2 speed-matched nulls (small/body policy confound) keep the same categorical transport and failure boundaries under axial law.
- P3 two small finite terrain, dual contact force: final cargo X **10.4005m old and axial**, both links retained.
- P3 after one physical release with both operator inputs unchanged: cargo X **10.2222m old and axial**, one link retained. All other 24-case comparisons show near-identical positions and link categories; the run logs and uploaded JSON include the exact full tables.
- This is **NOT** proof of hand-like 2D joint equivalence or angular control under arbitrary off-center loads. The corrected coupling is an **axial tether**, essentially cable/spring, and could lose lateral or torsional affordances untested in the P2/P3 straight-line worlds. The conservative result is that their demonstrated **translation and shared-cargo competition** did not depend on the old phantom transverse spring-damping moment.

**Decision:** P4 evidence justifies treating the old P2/P3 force law as a known angular-source debt and axial law as a promising cheaper physically central donor. Do not silently overwrite baseline P2/P3: preserve original for forensic comparison. A future candidate whole may explicitly select axial vs a legitimate bounded 2D contact/weld joint with torque reaction; make this decision through other-angle load/real Owner gameplay pressure, not architectural preference alone.

## Source verdict / next frontier
P4 *reflex mechanism* is bounded positive for cheap following under pressure, **negative for needing complex conditional sensing**. Full contact-hold angular accounting reveals a material weakness in the inherited P2/P3 solver-level interaction. Next project-level frontier should decide a truthful contact-grip law and then test in freely editable whole with genuine other actors/physical terrain. DO NOT automatically turn this into a reflex-brain/NPC cognition project, keep declaring root-drive traction proxy, do not let multiple stale experimental branches become an implicit runtime architecture.

Source hierarchy: Owner observed feel > live exact-source CI > scoped machine mechanisms > archived working hypotheses. No human Owner play session P4 and no public deployment change.
