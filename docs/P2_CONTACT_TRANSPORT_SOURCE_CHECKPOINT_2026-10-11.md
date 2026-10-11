# P2 — physical contact-grip / drag / release material whole (2026-10-11)

**EVIDENCE STATUS:** limited real-source, material-action positive; anatomy exclusivity and Owner/game feel **NOT demonstrated**. Branch `experiment/p2-contact-transport-scout` originates from **isolated P0 ONLY AS AN EXPERIMENTAL DONOR**. This is NOT an approval of P0, new engine, generalized anatomy, grounded gait, or gameplay. Historic Owner FAIL on R0/R1/L0 persists. No merge or public pointer change.

## Why P2 instead of continuing P1
P0 established that a physically opened gate changes what another later actor can do, but cheap rigid/small actors could do it. P1 evaluated a “reach through a constrained pocket” arm and failed: both the original and aggressive rigid controls revealed at most centimeter cargo movement under virtual ground support, with weak actual cage causal pressure. Without ground resistance rigid actually outperformed joint in all sampled cargo heights. P1 is CLOSED research negative; [its falsifier report](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p1-confined-reach-falsifier/docs/P1_CONFINED_REACH_NEGATIVE_2026-10-11.md).

P2 changes the kind of physical verb: **retain a material relationship while moving**. One body may physically contact independent load, attempt to grasp it, move away, and pull it along, then release it or lose the grip to an overload. No 2D scripted collection/inventory attachment, no collider deactivation, kinematic cargo pose, teleported crate, hidden success state, destination attraction, NPC “desire”, camera trick or physical exclusion by class.

## Actual implementation
- `src/p2-world.js` extends isolated P0 `MaterialYard`, preserving Rapier2D deterministic 0.21 and actual independent dynamic 45kg/100kg boxes, collisions, friction and other entities. The first contact gate reads **actual Rapier solver contact manifolds** between actor root/optional panel and cargo. An attempted grab outside contact is rejected and leaves physics unmodified. No pure broadphase query is accepted as contact.
- At real physical contact, a soft hold is created with a COMMON coincident world-space anchor transformed into both bodies' local frames. Cargo and actor **do not move on acquisition**. During subsequent physical steps a bounded impulse based on spring displacement and relative velocity is applied at each body's own actual point, **equal magnitude and opposite direction**; no body pose is overwritten. Root drive remains P0's DECLARED external finite top-down translation PROXY, not foot locomotion. Each real grip link is limited to one load per actor in this research specimen.
- User-facing `G` toggles contact grip/release on a selected actor; configurable peak impulse cap 0–10N·s/solver tick, real-time visual tether, existing WASD/B/Q/E, loads, pause, impulses, mouse pan/zoom, edit remains. A spring may fail by stretch >2.2m, a **declared limit** rather than magical protected state. This is a compliant grasp *proxy*, **NOT hands, fingers, rope, real gripping geometry or an animal carrying a crate in hands**. The shared anchor is an intentionally cheap midpoint contact approximation, not an exact tactile surface point.

## Correct source evidence
P2 first 12-source-world A/B protocol (2 organism roots small/bulky × finite/no virtual terrain × grab OFF / zero-strength link / active link at cap3N·s/tick):
1. Actor physically approaches a separate 45kg dynamic cargo until actual solver manifold contact exists. Before contact, a attempted grip is rejected. Grip acquisition does not displace the cargo.
2. For all three grip policies, actor follows **identical operator-specified reversal**, then releases/rests; measure cargo position, actual cumulative bounded link impulse, break events, root effort, finite bodies and independent cargo persistence.
3. Under FINITE virtual terrain, bulky: no grip +0.3310m cargo (body only pushed forward), zero-strength +0.3310m, active contact grip **−0.7572m** (pulled backward before snapping, actual paired impulse 273.5273N·s). Small root: no grip +0.3233m, active +0.0449m and link snaps (no robust pull in this initial controller comparison).
4. Without virtual terrain, bulky active grip carries load **−5.0769m** in that pull phase vs +4.9723m with no grip; active link remains connected. Small without terrain active −1.9613m and snaps vs no grip +4.9147m. Zero-strength cases make no link impulse and reproduce off-controls. This proves a **new physical operation against matter**, not creature identity.
5. All sources finite, positive contact acquisition, cargo collider persists and root drive is explicitly labeled. Applied impulses are logged by **holder and load separately** and cancel in source force accounting. This does **not** prove overall system momentum remains unchanged because the world also has explicit terrain and wall impulses.

## Critical red-team — original morphology observation was confounded
Initial small v bulky comparison is **NOT a size-based capability finding**. P0's original locomotor proxy commanded small up to 3.6m/s and bulky 1.75m/s. A faster actor can snap the same finite tether sooner. P2 explicitly added an opt-in research target-speed override of 1.75m/s without modifying body sizes/masses, world gravity/friction, or other controller physics.

**24 post-hoc actual-source counterfactual worlds**: small/bulky, finite/no terrain, cargo45/100kg, link OFF or link ON at cap3/cap6. Selected results with equal 1.75m/s target:
| Condition | Small cargo DX (active) | Bulky cargo DX (active) | Readout |
| --- | ---: | ---: | --- |
| terrain finite, 45kg, cap3 | **−4.433m** (NO rupture) | −0.7572m (rupture) | Original “big pulls better” REVERSED |
| terrain finite, 45kg, cap6 | −5.1299m (NO rupture) | −4.4276m (NO rupture) | Both can transport material |
| terrain finite, 100kg, cap3 | −0.0106m (rupture) | +0.1630m (rupture) | Heavy load material limit, no meaningful hauling |
| terrain finite, 100kg, cap6 | −0.0202m (rupture) | +0.1547m (rupture) | Simply doubling cap did not solve the opposed terrain load |
| terrain NONE, 100kg, cap3 | −5.992m (small stable) | −0.7486m (bulky rupture) | Support/drive policy enormously alters the result |
| terrain NONE, 100kg, cap6 | −5.9903m (small stable) | −5.3445m (bulky stable) | Source impulse cap matters |

All cases compare matching physical contact then actor reverse direction; their initial contact time and actuator budget still differ as a consequence of body properties and P0 root drive, so **do not infer anatomy or effort-optimal transport dominance**. This falsifies promoting a “bulky is a natural hauler” identity from first observed results.

## Native user-input evidence
The real emitted production Chromium page was exercised via **actual CDP native key/mouse input**, NOT fabricated JS keyboard/PointerEvent. A prepared source scene genuinely uses a bulky body to reach actual contact (not teleported load); then native `G` acquires a real physical grip, native `G` releases, native `G` reacquires, actual mouse click unpauses, native held `A` pulls cargo. [Exact source CI 38102569231](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38102569231) at `a3b8f2a331038af799807d50c0066553958ff6ce`: cargo x10.419→9.691 via real keyboard, paired grip impulse269.5272N·s, a natural rupture occurred during prolonged pull, material remained a physics body. Source screenshot `p2-real-g-grip-transport.png` and JSON in short-retention CI artifact. New later capture additionally records screenshot **while link remains ACTIVE**; check final-head CI before claiming it.

The later [exact source/run 38102699723](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38102699723) at `5b509c469090a05abc5e29f65dcab5cf2089d2b4` also captured the raw, **actually physically stretched grip while it was still attached** in `p2-real-active-tether.png`, before natural rupture, plus the after-rupture `p2-real-g-grip-transport.png` and state JSON. The raw picture is a *thin spring-like line* between a circle and a crate, and visually remains a material mechanism yard rather than a convincing embodied organism; this distinction matters. These frames were personally inspected and are NOT AI-generated imagery. The exact final-head CI after this note should still be verified.

**This is not human usability/feel evidence.** Test required scripted preparation of a legitimate contact scene; native key and click events only drive the mechanism from there. No measured player cadence, art, character animation, genuine touch geometry, FPS, dense crowd or actual autonomous agent.

## Decision
P2 is a **conditional positive material-verb donor**, not a foundation. It is a strong step beyond P1/K2 *mechanical position counts*: actor and load persistently negotiate a physical relationship, including real stretch/rupture, visible retained cargo, false-contact rejection, and normal move/push control. However the same verb is made available to both small and bulky roots; no distinct organic anatomical ability is yet proved and behavior still comes from an externally controlled proxy actuator, not the body/brain.

**Next practical pressure** should be one freely editable whole where grasp/drag/release interacts with other actors and topology (e.g. carry through a doorway, drag while crowd pushes, material handoff, or brace while load exerts pressure), with matched cheap pushing/pseudo-carry competitors. Do not auto-merge P0 and P2, automatically implement P3, or give Owner a premature First Look on CI alone. A source screenshot with an ACTIVE grip shows a thin mechanical spring link, not a true person carrying a material object.

## Exact continuity
- Check live branch HEAD and exact CI; short-lived artifact images, source JSON and real input trace are archived there.
- Current neutral `main` houses `docs/AGENT_RUN_CURSOR.md`, `docs/RESEARCH_STATE.md`; add this bounded donor evidence, but do not promote branch code to main.
- `rehearsal/current` and public deployment remain unchanged.
