# Combat Lab — Whole-Experiment Checkpoint (2026-10-10)

**Status: RESEARCH CHECKPOINT / STOP FOR OWNER-LEVEL SYNTHESIS.**
This document records what has been demonstrated and what has *not*. It must not become a semantic CI test, future implementation mandate, preferred branch ancestry or a substitute for Owner judgement. Check current ref heads again before work resumes.

## Why we reached this checkpoint

The Owner's larger goal is a permissive, continuously editable material laboratory for discovering what distinct physical organisms can *actually do* and how they influence one another and their world. Historical R0/R1/L0 product-level FAILs are not overturned by engineering improvements, screenshots or CI. The project is broader than mobility, crowd, combat or one special tool; it must support unexpected affordances and direct Owner attempts to destroy hypotheses.

The Oct 9 Owner-first reconciliation reset authority: neither a diagnostic foundation nor an unfinished prototype can dictate the next anatomy. Two **unaccepted and mutually independent** experimental donors are now available, not a merged architecture.

## Candidate contrast — properties, not a leaderboard

| | PR #1 — integrated field | PR #2 — articulated effectors |
| --- | --- | --- |
| Tested capability | Crates, pinned barriers, finite grip, local somatic contact/yield/brace, a few compound/jointed shapes | Two genuinely independently driven arms and distal physical hooks, real crate contact/transport without grip link, independent geometry/actuator authority |
| Strong causal result | Actor-local finite bracing in a 14-body crowded situation changes later corresponding body/material afterstate | In matched 38kg matter tests different upper/lower arm commands produce different crate displacement/rotation; actual limbs transmit outside impulses through joints |
| Whole-world action source | Primitive, shared actor-local forward motion/pressure law plus manual intervention | **Only selected actor receives a locomotor command; other actors are physically present but essentially passive** |
| Distinctive weakness | Diverse apparent world interactions can still reduce to motorized rigid blocks and hand-built jams | Free manipulator actions exist but the world is sparse/inert and anatomy limited to two fixed forms |
| Owner qualification | None | None |
| Role | Isolated mechanical and somatic donor; [draft PR #1](https://github.com/Jozzpoly/Combat-Lab/pull/1) | Independent material-effector donor; [draft PR #2](https://github.com/Jozzpoly/Combat-Lab/pull/2) |

**Do not treat the first candidate as the necessary foundation for the second.** The second started afresh from neutral main. Conversely, do not assume all local-somatic parts of PR #1 should be copied into PR #2: their combination is an untested new hypothesis.

## Additional evidence from the major review run

**A. Free physical pressure, wider than staged squeeze/transport.** [CI 38000141681](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38000141681) ran four deterministic but non-quest worlds with **16 actors, 12 crates, 2 hinged gates, 540 physics steps and 13 external material impulses per world**. All four remained finite, with real contact during all 540 steps and 10–12 movable objects displaced more than 0.15m. This is **2160 total simulated steps**, not a single world replay and not 64 concurrent actors; high contact counts can result from initial density. External impulses were researcher interventions, **not autonomous actor decisions**. This does not establish FPS, large-population quality, free-world behavioral diversity, or long-term stability.

**B. Joint integrity is not universally solved.** Measured peak pin/anchor displacement of the independent arms reached ~0.093m in one dense run using 12 solver iterations. Two additional same-seed runs with 24 solver iterations had **mixed results**, from ~0.093 to ~0.053m in one case, and ~0.056 to ~0.059m in another. Same seed is not strict identical-contact replay once paths diverge. No global solver tuning is justified. Gate pin errors remained small in these samples. Need wider stress/performance tradeoff analysis if joint stability becomes a product dependency.

**C. A genuinely editable physical world, not just scene swap.** [CI 38000429850](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38000429850) confirmed that paused Alt-drag rotates actual body, matter and pinned gate colliders and that a whole articulated body can be reposed without tearing its two physical joints. Other matter retains its position and momentum; there is no hidden physics step. A portably captured starting condition can be imported and advanced; this is NOT live solver-state replay.

**D. First-run visual audit remains unfavorable.** A real 1440×900 Chromium screenshot showed visible separate jaws, direct input, and now independent controls, but the world still felt like sparse mechanical geometry in *agent visual inspection*. That is not Owner-observed usability, and it does not prove living bodies. Subsequent camera framing and shorter prose changed presentation but were not Owner-tested.

**E. Mechanistic negative evidence must remain in view.** With both arms inactive, an otherwise identical moving body can still collide and displace matter. Very heavy loads or eccentric placement can defeat the pincer or favor inactive jaws. Longer jaws help in one bounded trial but are not universally beneficial. There is no verified generic grasp, learned adaptation or creature agency.

## Research conclusions and limits

**Defended:** Real separately articulated motor effectors can create physically different actions and material afterstates, beyond changing a rigid body's movement speed or color. Researcher interventions and direct initial-pose authoring make this inspectable without switching to special test cells. Some complex multi-body contact loads remain solver-finite in specific short-to-medium runs.

**Not defended:** The grand experiential objective, convincingly different living organisms, physically faithful grounded gait, body/body ecology, meaningful spontaneous population agency, unrestricted topology building, hundreds of robust simultaneous actors, real-world performance or human feel. More green tests would not bridge those gaps.

**Material source of possible self-deception:** "prototype feature is implemented → initial bug is fixed → CI turns green" generates abundant impressive engineering milestones with little qualification of the *whole*. One experiment can be a valuable donor and still a poor future Combat Lab.

## Deliberate stopping point

The next owner-level discussion should decide **which phenomenon to challenge next**, not which PR to merge. Three competing directions remain open, none selected by this report:
- Broader **whole embodied-world interaction**: actors with several distinct physical capacities and body-local perception/responses interacting simultaneously, without a scripted crossing goal or borrowed simplistic universal brain
- Deeper **configurable anatomy and effectors**: free rearrangement of physical parts and their effects on actions, including convincing failures and support constraints; avoid turning the laboratory into a one-purpose claw editor
- Fundamental **world/material substrate**: richer matter, terrain and constraints that make diverse actions valuable; avoid treating the four preset arrangements and crates as the entire world

There is no new Owner experiential verdict on either experimental branch. At this checkpoint, stop new feature production. Ask for Owner judgement only when a well-grounded qualitative comparison or an appropriately presented, accessible rehearsal is available. Never silently deploy a draft PR to the existing public rehearsal.

## Source authority

[Canonical RESEARCH_STATE](RESEARCH_STATE.md) · [Owner-first reconciliation](OWNER_TRUTH_RECONCILIATION_2026-10-09.md) · [Failure scar](FAILURE_SCAR_2026-10-06.md) · [Frontier reassessment](FRONTIER_REASSESSMENT_2026-10-07.md) · [PR #1 full experiment](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/integrated-organism-field-v0/docs/WHOLE_WORLD_EXPERIENCE_REVIEW_2026-10-09.md) · [PR #2 full experiment](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/embodied-effectors-v0/docs/EMBODIED_EFFECTOR_TRIAL_2026-10-09.md).
