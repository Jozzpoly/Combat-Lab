# Whole-world experience review — isolated research (2026-10-09)

**Status: evidence-bearing EXPERIMENT / NOT an accepted organism, gameplay or editor foundation.** This note is not a mandatory next-phase architecture plan. Preserve the original neutral main and independent public rehearsal until a human has a good reason to replace either.

## The weakness we deliberately attacked

The previous four-body Yard and its large sidebar exposed real physical mechanics but made the Owner manufacture nearly every interesting encounter by hand. A sophisticated physics check is not a compelling *world*. Actors could touch, move crates and brace, but their shared possibilities did not come into view naturally on first boot. We therefore prioritized whole-scene encounter density **without adding paths, objectives, goal intelligence or a sibling ReflexBrain**.

The new interface puts four selectable **open-ended, editable physical starting arrangements** above the world. They use the same versioned portable starting-scene grammar and the **same** Rapier solver and private local laws as the freely editable Yard:
- Push & jam: two same-shaped bodies face differently weighted crates and downstream walls; the rest of the world contains jointed moving material and additional actors
- Bodies under pressure: 14 real organisms, four morphologies, movable matter, hinged gate and constrictions
- Living doorway: two truly world-pinned gates surrounded by physically different actors and movable material
- Mixed footing: support/drive differences across the existing low-traction patch, with movable matter and a real hinge

No scripted objectives, victory conditions, per-scene steering or hidden actor destinations. The original unconstrained Yard can be restored in one click; switching scenes explicitly discards uncaptured afterstate. Imported user scenes clear stale preset highlights. Owner can still pause, reposition whole articulated bodies, edit parameters, disturb matter, spawn populations, reset or capture a JSON starting condition.

## Grounded world observations

[Integrated browser/Node run 37985248949](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37985248949) exercised each situation for 330 local physics steps using actual browser/WASM Rapier, recording only physical contacts and material afterstate:

| World | Organisms | Steps with solver-active actor contact | Physically moved objects | Gate rotation (absolute raw observation) |
| --- | ---: | ---: | ---: | ---: |
| Push & jam | 5 | 278 | 4 | ~0 rad |
| Bodies under pressure | 14 | 311 | 5 | 0.686 rad |
| Living doorway | 6 | 237 | 4 | 4.173 rad |
| Mixed footing | 6 | 292 | 3 | ~0 rad |

Raw gate angle differences may include >pi rotations; these numbers do not establish a safe, realistic, satisfying door feel. Contact-incidence counts are not unique independent actor pairs.

**Counterexample:** prior somatic back-pressure "brace" existed as an independent manually verified finite control, but none of the integrated physical scene observations triggered it autonomously (0 ticks across all four). Thus a physically valid capability was disconnected from rich interaction.

### Correcting the real deficit, not inventing a scripted response

The actor's solver-based private tactile sensor initially collapsed different simultaneous contacts into a single maximum frontal contact value. That erased rear or side pressure when an organism was pressed from multiple directions. The new sensor preserves *front, rear and lateral contact impulse separately*, without disclosing what kind of entity was touched, its ID, mass, position, map layout or intent.

A low-yield body can now engage a finite ground-coupled brace under actual sustained rear/side load even when a front obstruction is also present. A short local somatic latch (~9 steps) prevents the false "all progress restored" signal caused by zero-motor-intent while bracing. This is not cognition or a position lock. When pressure disappears, the stance winds down. The reaction can be overwhelmed by momentum or weakened by low traction.

[Post-correction CI 37985694208](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37985694208) observed:
- Bodies under pressure: 27 autonomous actor-bracing ticks, peak measured rear contact impulse ~238.38 N·s and side impulse ~216.35 N·s
- Mixed footing: 9 bracing ticks, peak rear ~60.62 N·s, side ~74.86 N·s
- Push & jam and Living doorway: 0 bracing ticks. This is an honest absence, not a failed global scenario; they expose different material situations.

### Counterfactual: does autonomous bracing change the shared world?

[Same-world paired A/B 37985875910](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37985875910) compares identical 14-organism Bodies under pressure scenes with exactly the same bodies, physics, timing, material and local somatic response. Only the externally grounded **brace force authority** of broad bodies is set to zero in one branch of the test. Both run the same 440 steps without route/target instructions.

Results:
- First real nonzero brace impulse: **step 211**.
- First broad-body trajectory divergence: **step 211**, not earlier.
- Active broad brace events: **41 counted ticks**.
- Maximum separation of corresponding broad-body positions: **1.139 m**.
- Maximum separation of corresponding movable-material positions: **2.924 m**.
- Before first brace, both material continuations remained coincident within the tight test threshold.

This is a bounded causal demonstration of **organism-local physical reaction altering shared material afterstate**. It does not prove intelligent coordination, socially meaningful behavior, stable population ecology or user-facing fun.

## Research representation and interface

Normal UI remains separate from the dynamically loaded browser-pressure suite. The selected organism now visibly shows its *real* local response mode and a rough facing-relative **bearing of resistance** inferred from contact normal direction (not a false exact contact point), alongside its requested-versus-realized motion. Users can look at the physical scene while learning why a body presses, yields or braces.

World situation selection, profile authoring and movement through the real UI are subject to browser tests. Do not equate a DOM and headless physical PASS with Owner's visual/interaction assessment.

## Real remaining weaknesses

1. Body silhouettes, motor affordances and simple local policy are still crude; selected world feel remains unqualified.
2. The 2D ground-reaction and alternating support are explicitly approximate; no general soft organisms, feet, slipping through deformable crowds, or convincing animal gaits are demonstrated.
3. No credible FPS, long-duration scale, interaction latency or broad numeric-stability qualification. A 76-body short contact sample is not a sustained crowd benchmark.
4. The large tuning sidebar still imposes cognitive friction, despite the new world-first situation strip and tactile labels.
5. Live editor capture saves starting poses and profiles but not exact solver contacts, velocities or private history: it is **repeatable starting conditions**, not a replay format.
6. Qualitative human/Owner testing of the **whole** is still missing. The current branch must remain a replaceable candidate, not become a self-justifying pile of green tests.

**Next decision frontier:** use direct freely manipulated whole-scene evidence to determine whether genuine diverse possibilities are spontaneously discoverable and pleasant. If not, redesign bodies/interaction phenomena or the world experience; do not reward CI count or the quantity of presets.


## Owner-style first-run consistency, live input proof

A critical observation after the first scene run: headless physical observations used step(null) for *all* actors, while the actual UI had direct possession enabled by default. The selected first organism thus remained held stationary when the Owner did not press a key. That was an evidence-to-experience mismatch, and an important usability failure.

**Corrected:** the normal boot, Original Yard and each open physical situation start with *all* organisms using their primitive actor-local reactions. The first WASD/arrow key immediately engages direct control of the selected body, without asking the Owner to discover a mode toggle. The direct-control checkbox remains fully explicit and can be unchecked to return the body to its local physical behavior. Pressing a physical scenario switch releases possession and restarts that authored starting condition. This is only an input orchestration correction, not automated body intelligence.

[Browser check 37986302228](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37986302228) showed 30/30 Node tests, emitted-browser UI and physical checks PASS, including **autonomous-first -> directional-key takeover -> release to local response** on the actual DOM/runtime.

**Reality check:** this makes the first interaction more consistent with the observed test worlds but does not prove the first experience is visually understandable, satisfying to drive, or rich enough for Owner. The editor still presents long numeric configuration and its heavy instrument panel. The emerging body and local physical behavior remain simple. Treat these as material open risks, not editorial details that machine checks can qualify.
