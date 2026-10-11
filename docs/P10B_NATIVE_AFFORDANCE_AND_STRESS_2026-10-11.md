# Combat Lab — P10b: direct operator affordances, readable stage, destructive-material pressure (2026-10-11)

**QUALIFICATION: ISOLATED SOURCE-VERIFIED EDITABILITY / NOT OWNER-ACCEPTED GAMEPLAY.** The older R0/R1/L0 Owner FAIL remains binding. This is an opt-in experimental P10 child, not a replacement of Combat Lab vision, not a whole-architecture acceptance, and not a production deploy. Before acting, verify live branch, CI, later Owner corrections and source.

## Source / exact executable evidence

- **P10b IMPLEMENTATION:** [experiment/p10b-affordance-legibility](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p10b-affordance-legibility), exact implementation head \`36bfb78d3b3bd3a2cfcf32dd0a2eb5c75a5ac679\`. [Exact full emitted Vite/real native Chrome/Rapier + 19+16-world CI PASS 38114568933](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38114568933).
- Parent: [P10 isolated baseline](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p10-material-workshop-whole), last previous report [P10 negative-first](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p10-material-workshop-whole/docs/P10_MATERIAL_WORKSHOP_NEGATIVE_FIRST_2026-10-11.md). P10b does NOT integrate unselected P7/P8/P9 crowd-motor or improve biomechanics. It tests whether the ALREADY PHYSICAL shared manual commons is more understandable and robust.
- Main/public read-only boundary: project \`main\` holds research docs; \`rehearsal/current\` source remains untouched. No P10/P10b runtime deployed or merged, no production FPS data. Branch-specific P10b workflow \`.github/workflows/p10b-legibility.yml\`, artifact \`p10b-readability-source\` (14-day retention) holds the real screenshots and actual numeric source, not mocked art.
- Raw visual baseline P10 [CI 38113663018](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38113663018) was retrieved and personally reviewed by the agent. Raw first-frame and native P10b screenshots were retrieved and compared directly from native Chrome. Both stage layouts remain visibly abstract: simple circles/rectangular independent matter. Claim only relative legibility, NOT good gameplay.

## What was deliberately changed (no automatic NPC brain, no future foundation commitment)

1. **Default-free scene composition:** real small root starts (14,10.7), bulky (12.6,15.3), hinged tool (11.1,19.0), cargo placed closer to different actual bodies. Original tightly controlled slot/haul/hinge source fixtures NOT changed, preserving their meaningful A/B comparisons. Default still has 3 independent bodies, 5 physical cargo, true hinge gate and editable physics walls. All actors initially quiet.
2. **View + attention:** initial viewport \`{x:17.2,y:14.25,zoom:1.57}\` versus P10 broad \`{x:20,y:12,zoom:1.22}\`; now selected body/cargo are more discernible without crossing half the map to encounter real matter. Real \`F\` focus and \`0\` overview buttons/keys; scroll zoom centered on actual cursor world coordinate (not fixed map centre). Camera has read-only probe for native controls.
3. **A contact promise, not fake interactivity:** selected actor exposes \`G\` availability ONLY when \`actualContact(actor,load)\` sees genuine current Rapier manifold. A faint halo highlights genuinely touched cargo, and a dashed link between actual connected root/cargo centers appears ONLY if a genuine finite reciprocal grip exists. This drawn line is a high-level link indicator, NOT the solver anchor/contact point. No helper teleport, no NPC destination, no proximity magnet.
4. **Simple readable affordance hint / world framing:** direct body selection/physical edit/control guidance plus small non-goal suggestions. All further effects depend on the real physics.

## Tested results

### 19 pre-existing P10 true physical controls preserved

The exact emitted P10b Chromium/Rapier source returns the same P10 controlled outcomes because P10b changes the \`free\` stage only, not named slot/haul/hinge fixtures:
- Tiny 90kg equal-drive Ø0.88 crosses2.20m aperture and displaces distal material; matched big Ø2.30 blocked until actual wall widened to3.50m, after which it reaches and moves another independent load.
- True contact-gated finite reciprocal grip pulls cargo; no-link does not. It expends more total motor effort, so no claims of equal-cost advantage.
- Powered physical hinge remains **PRACTICALLY NEGATIVE** on finite support (about5mm flow,20mm brace cargo afterstate). Do not rename numerical actuator activity into useful hand/limb identity.

### Native manual Chromium afteraction — stronger than controller flags

Exact CI \`38114568933\`, using OS-like CDP mouse/keyboard/wheel, not JS mutations:
- Actual \`F\` focus zoom1.92, \`0\` whole-world zoom1.10, reset camera zoom1.57.
- Mouse-wheel over noncentre pixel requested zoom to2.440798…; exact before/after world point below cursor agreed with **0 recorded coordinate error** using consistent integer CDP pixel positions. An intermediate first attempt falsely produced3.8mm drift by comparing subpixel JS point against pixel-quantized CDP event; fixed test input, NOT widened physics tolerance.
- Actual selected actor click/B/E drives powered joint; native pause stops ticks.
- Actual physical toolbar edit widens real collider 2.20→3.50m without moving resident actors. Real native Ctrl+drag from physically visible upper wall changes it further to 4.00m, preserving tick and actor positions. Earlier screenshot-camera revision caused an OFFSCREEN coordinate in the native test (false failure); corrected by selecting visible segment, not disabling the test. The earlier P10 center-snap UI bug stays fixed.
- Real D held for112 solver steps moves small actor **+3.3565m** with sourced root impulses. Real G then acquires a true-contact link. **Real A held 1.8 seconds physically pulls the independent linked cargo from x18.4532 to x16.9572 (Δx=−1.496m), link still present**. This is the essential beyond-button afterstate. Other runs showed ~1.54m; use exact-run source numbers and do not imply perfect time determinism under real-time CDP waits.

### P10b deliberate crowd/destruction source redteam

\`src/p10b-stress.js\` constructs **16 independently simulated 550-tick actual Rapier worlds = 8,800 real physical steps**, 8 physical actor roots (some with articulated members), 10 independent movable cargo and 2 additional real obstacles each, across 8 deterministic clutter seeds × two virtual-ground regimes (finite vs none). Deliberate physical overlap and conflicts; operator changes controlled body during stepping, changes a load's real position, physically edits fixed aperture, toggles finite brace and delivers a direct impulse.

**All 16 completed finite, with body/cargo counts intact, a genuine physics edit and a real operator impulse.** Sampled actor-cargo manifold touches and max speeds documented in artifact JSON, not treated as unique contact events or perceptual behaviors. This does NOT prove indefinite numerical stability, high-contact natural crowd, playable FPS or physical/animation realism; nonzero collision counts alone carry no feel information. \`none\` vs \`finite\` cohorts differ in contact observations and motor effort, but scene dynamics and costs are not matched for an across-regime gameplay quality comparison.

## Audited negative findings and remaining risks

1. **P10b visuals remain crude.** The agent opened original actual Chrome images: the body/cargo grouping and zoom are clearer, but the stage is still circles, boxes, a giant hinged gate, with no articulated embodied legs/support, visual impact/crowd feel or enticing natural organisms. Avoid claiming the scene crosses Owner's quality threshold.
2. **Limb value still missing.** A surviving contact/push/grip interaction is not a true dexterous force-bearing anatomy. The actual shape-independent body mobility is still virtual-root driven. Need a substantively different embodied action under real source-grounded support, compared against cheap rigid alternatives; avoid joint-servo number tuning.
3. **Unscripted discovery not yet demonstrated.** Operator native tests are scripted input exercises, not humans freely experimenting. Need uncoached Owner feel test WHEN access is simple and safe. Do not ask Owner to deploy public Pages or install/build complicated toolchain just to satisfy a schedule.
4. **CPU / FPS / long-duration robustness unknown.** 16×550 real WASM physics ticks are bounded, no realtime performance claim or population scaling curve. Collisions/clutter in 8-actor settings still not judged as aesthetically meaningful or biologically plausible.
5. **Cross-world topology is a material causal donor, not game logic.** It is a possible action when allowed by physical geometry. No NPC intentionally finds it; no authored win trigger.

## Decision

**Keep isolated, do NOT promote/merge/release P10b.** P10b establishes a more workable direct physical operator research surface, not a new biological foundation. A credible next frontier is human qualitative intervention / better force-bearing body–terrain physics (perhaps constrained 3D substrate vs cheaper 2D friction alternatives) with explicit cheap controls and world compatibility, rather than another auto-marching crowd motor or visual veneer. Owner judgement has veto over green numerical gates. Preserve this report as negative-first research; require current source/CI check before reusing its numbers.
