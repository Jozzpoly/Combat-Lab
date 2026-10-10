# Combat Lab E1 — living-world initiative experiment (2026-10-10)

**VERDICT: CONDITIONAL WHOLE-WORLD CANDIDATE; NOT OWNER-QUALIFIED, NOT AN ACCEPTED ORGANISM, NOT A 2D ARCHITECTURE SELECTION.** [Draft PR #9](https://github.com/Jozzpoly/Combat-Lab/pull/9) consciously borrows M0 Rapier2D physical objects as a replaceable DONOR; inherited code is not authority. No merge, no public deployment. Historical R0/R1/L0 Owner FAIL stands.

## Research question and source

M0 differentiated physical collisions but supplied every initiated movement via operator root thrust. G0 proved a real wheel/floor force-source distinction, not gait or animal motion. E1 therefore deliberately retains a **finite EXTERNAL planar root-traction PROXY** as a cheap fixed baseline, asking whether multiple heterogeneous bodies with independent local causes and prior physical contact feedback can generate a useful shared-world experience before investing in legs/grounded 3D.

One 44×27-unit Rapier2D world: 18 organisms spanning 1-part rigid, 3-part hinged and 8-part spring-mass morphologies; behavior roles are **orthogonal to body types**; four moveable, fully colliding 6kg scent-emitter material bodies; additional free materials and fixed obstacles with an unforced spatial passage. Each organism detects only particular odor signatures on real nearby material objects within 7.2–9.5 units, reads local actors within 3.8 units, and reacts to its own previous-step solver pressure. It updates the very small local signal snapshot every nine ticks. No global coordinates are directly fed as a navigation goal, no pathfinding, vision, NPC cognition, global traffic script, scripted scene goal or outside force applied to another material body. An independent root motor still performs the body's travel; 'holder' is not a legitimate physically grounded defensive stance.

Interaction: click/select and drive physical actors, release them to body-local effort, toggle all initiative or contact-conditioned steering, change behavior role independently from morphology, pause/step, add/edit parts and material, physically reposition scent-bearing collider in the paused live world, or edit just the odor signature without moving matter. CLI/Chromium source testing does not qualify Owner feel.

## Real source evidence and results

[Exact Chromium/WASM E1 source, physical matrices + real browser UI PASS 38091308778](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38091308778). [Raw real first frame](media/e1-actual-t0.png) and [same world after 480 genuine solver ticks](media/e1-actual-t480.png). Both agent-inspected: physical bodies genuinely move, press and deflect one another and the odor source objects; screenshots still look like geometric blocks/segments/bead-ring clumps, **not convincing living creatures or a serious playable game**.

Five separately instantiated starting worlds, same authored scene and physical code, each 420 fixed timesteps (7s):

| Scenario | Mean body distance | Contact incidence samples | Behavioral contact transitions |
|---|---:|---:|---:|
| Full local initiative / contact response | **5.501m** | 4085 | 57 |
| Same bodies completely non-initiating | **0.002m** | 420 | 0 |
| Initiative without pressure-conditioned decisions | **4.731m** | 7021 | 0 |
| Initiative without local odor input (physical sources remain) | **0.718m** | 459 | 5 |
| Physical scent object moved mid-run | **4.457m** | 3228 | 58 |

Contact incidences are repeated **solver samples** and include multiple colliders/walls/other material — they are NOT distinct collisions, useful actions, decisions, creature quality or FPS. Pressure reducing this count cannot be called better crowd behavior because the entire later trajectory changes.

**Observable new material afterstates:** in the full world, source 0 moved from (12.5,13.2) to about (17.769,10.526), and another from (30.2,14.4) to (25.856,8.104), only by real physical collisions. Organisms' later cue positions update from those moved matter bodies, without target teleport.

## Lockstep falsification of attribution

Same [exact latest CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38091308778) additionally compared **two synchronous source-identical worlds**:

1. Contact steering ON vs OFF: the first divergent local motor direction was step **34**, actor org-18 / seeker, after previous solver contact impulse **10.20286 N·s** exceeded threshold 8. With contact steering it changed to go around a local obstacle/neighbor; without, it continued approaching. This supports **caused steering**, not social intelligence.
2. Physically teleporting the *material body* carrying odor during live editor usage caused first command difference at step **161**, **before the next local sensor refresh**. Stored selected cue and measured last odor distance were still identical! Correct interpretation is a mixed physical-world/cue intervention; immediate effects may be contact changes. DO NOT falsely call step 161 a perceptual response.
3. An independent comparator changed ONLY the odor signature metadata on a source without changing any physical collider, force, position or mass. The first different command arose at step **162**, at the local sensor update, with logged pre-step body disparity exactly **0**, original actor sensing source 0 and edited actor sensing no matching source. Later max paired-world actor displacement difference was ~3.54296m. This is narrower, genuine causal evidence for local signal->action dependency.

## Density and usability

A single 30-organism stress world involved **120 genuine dynamic organism parts and 500 Rapier fixed steps**, 15,000 root-proxy source commands, 93 recorded pressure-conditioned transitions, max sampled root speed 4.536 units/s, with no sampled NaN/Infinity. **NO MEASURED FPS OR REAL-TIME THROUGHPUT.** Attempting performance.now inside headless virtual-time Chromium returned 0ms; that metric was retracted instead of published.

Source UI event tests also PASS in Chromium: click actual actor collider, manual finite WASD, independent behavior-role switch, release to autonomous effort, initiative OFF eliminates new auto motor commands, pressure switch, select actual scent source, change only its signal retaining collider identity/position, Ctrl-drag source physical body, and reset. These are synthetic browser events, NOT user-observed feel.

## Critical boundary and future judgement

**What's new and valuable:** truly independent resident-origin simplified effort within a shared physical world, plus measurable actual prior-contact -> altered steering, local semantic cue -> altered steering, and ordinary physical matter displacement altering future local signal sources. More than M0's lone human-driven push, and no fake contact/route.

**What remains missing:** distinct useful anatomical *actions*, natural locomotion/ground support, believable crowd feel, animal silhouettes, meaningful holding/yielding beyond root motor commands, gameplay reasons and robust non-scripted interaction diversity. It may STILL simply be a new incarnation of the historical traffic/attractor jam experiment that Owner rejected. The contact-direction heuristic uses nearby roots, not contact manifold normals; smelling uses exact current source position within radius and isn't occluded perceptual knowledge, let alone ReflexBrain. Repeated ticks are not independent events. Do not mistake green control/causal tests for acceptance.

**Research decision:** retain E1 as a **conditional first-look exploratory candidate, unmerged and unpublished**, rather than either claiming a product milestone or automatically killing useful new phenomena. Do NOT start E2 by tuning scent radii/roles/number of moving dots. The next meaningful whole should put fundamentally different body actions under material pressure and test whether a cheap rigid+proxy alternative suffices; concepts include actual shape negotiation, body-specific interaction authority, contact posture, movement while constrained. Selection of 2D/3D, reflex brain, real feet, soft body and next host is OPEN.

## Cross-chat boundary

The exact candidate is on branch experiment/e1-local-encounter-whole / PR #9; current neutral truths are main/docs/RESEARCH_STATE.md and main/docs/AGENT_RUN_CURSOR.md. A new conversation verifies live SHA/CI, latest Owner feedback, then only dependent checkpoints. This source is a research probe, NOT mandatory code parent. Public rehearsal/current remains untouched.
