# Combat Lab — conversation synthesis / evidence map — 2026-10-09

> **WORKING, NON-CANONICAL, NO NEXT AUTHORITY.** A research retrospective distilled from the extended Combat Lab work, not a new GDD, architecture, development sequence or owner acceptance. The canonical current selection and operating rules remain [RESEARCH_STATE](RESEARCH_STATE.md), [FRONTIER_REASSESSMENT](FRONTIER_REASSESSMENT_2026-10-07.md), [EXPERIMENT_PROTOCOL](EXPERIMENT_PROTOCOL.md) and [FAILURE_SCAR](FAILURE_SCAR_2026-10-06.md). Read live refs/CI again before acting. This public research note intentionally excludes private conversational context.

## 1. What the Lab is for

The project is an independent **embodied/material possibility discovery lab**. It is not owned by its name ("combat"), a crowd-flow demo, a specific controller, an obstacle course, a sword system or a particular physics engine.

The goal is to learn what materially different bodies and control authorities **actually make possible** in a shared, manipulable world. Exploration may range across locomotion and crowded contact, masses and envelopes, wildly different anatomy, multi-part bodies, compliant matter, terrain, persistent objects, equipment, projectiles, magic and reactions. **This is a possibility map, not a build checklist.** A separate wider ambition concerns living worlds and autonomous actors; Combat may donate physical and world-interaction discoveries but does not own the cognition architectures of SPC, ReflexBrain, Companion or Feniks.

The intended lab experience is a short live loop: **author/disturb → run → observe and challenge → revise/repeat/compare**. Permit extreme, weird or failing combinations unless the runtime is actually at risk. The person experimenting should naturally find new interventions, not merely execute instructions for a staged passage.

## 2. Why this must remain a retrospective rather than the next roadmap

The previous R0 diagnostic campaign was valuable at attribution but crossed its research boundary when diagnoses turned into named "foundations", then M1→R1→D1→S1 and a CI-legitimated continuation sequence. The later Living Movement L0 changed code but stayed qualitatively close to the old crossing-circle arrangement. The lesson is not "always delete" or "never reuse": **mechanistic PASS never grants parent-architecture authority**.

The 2026-10-06 clean-room reset removed obsolete execution from active branches while retaining forensic Git evidence. Its initial overcorrection (default deletion and CI obstructing all experiments) was subsequently repaired. The newly selected frontier is **body/world possibilities beyond traffic, fit/no-fit and mere traversal**, not restoration of R0/L0.

A future workstream should be chosen by independently assessing the phenomenon and the relevant human baseline. **Do not replace serious construction with an endless series of conveniently green diagnostic cells.**

## 3. Current truth (exact snapshot; verify again)

- Neutral `main` on **`2d86dc1822c5de9037920aa882c48e8525325aba`** at synthesis time. No new Owner-qualified organism, locomotion, crowd or combat architecture.
- Current isolated candidate: [`experiment/finite-lateral-maneuver-v0`](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/finite-lateral-maneuver-v0), exact checked HEAD **`c03c082d9ba6ecbd462fa4ba39d25c34e55a8cdd`**; [same-commit CI run 37950162672](https://github.com/Jozzpoly/Combat-Lab/actions/runs/37950162672): 11/11 Node checks; 106 browser/Rapier entries split **86 scoped PASS, 20 OBSERVED, zero FAIL**. These are not 106 experience approvals.
- `rehearsal/current` remains **`cb4b44d417db612f3333fe515e6f6afffa3e56d8`**, deliberately separate from the experimental HEAD. No public promotion is implied.
- Older experimental branches remain bounded controls/donor evidence, not a future module tree.
- **Beware source staleness:** some README/research-state copies *inside experimental ancestry* still describe pre-implementation. Prefer live branch code/CI for its current mechanism and `main/docs/RESEARCH_STATE.md` for project truth.

## 4. What the long Combat continuation actually discovered (narrow evidence)

1. **Material control:** requested velocity is separated from realized physics; finite motors/grip allow differences in mass, reach, authority, impulses and reaction. Arbitrarily strange but f32-representable parameters remain testable; unrepresentable values are rejected rather than silently normalized. A scope-limited equal-impulse test yielded approx. 5.66 m/s for a 14 kg box and 0.66 m/s for 120 kg.
2. **Contact evidence correction:** a Rapier contact-pair candidate is not necessarily a solver-active contact. In a checked wall trial first candidate appeared at tick 35, first active manifold at tick 37. Sensors and diagnostic contact lists were corrected to require actual solver contacts; earlier timing language needed correction.
3. **Actor-private law:** `src/local-shuttle.js` receives synthetic local travel, effort and directional touch and returns motor intent without World/map/object IDs. This is an explicit experimental boundary, **not general embodied cognition or full egocentric localization**.
4. **Embodied cross-actor causality:** introducing another actual physical body changes the first only after contact; varying the other's mass changes afterstate. A bounded local-rule A/B altered one actor's motor request at tick 13, then the other's physical trajectory at tick 114 after contact; the peer displacement difference was only about 0.063 m.
5. **Contact direction:** responding to *any* lateral touch caused a false reversal in a tested sidewall. Forward-normal evidence avoided it. Correct physical setup and an appropriate no-obstruction null matter more than labeling a new policy "smarter".
6. **Finite lateral capability has failure boundaries:** a timed lateral attempt cleared a short static wall where simple retreat did not (pass tick 168); the same policy failed against an 8 m obstruction. Bodies of radius 0.30/0.56 m passed in one setup, radius 1.20 m failed; movable matter sometimes simply yielded and was pushed with no artificial side maneuver.
7. **Limited adaptive correction:** early wrong-side evidence was invalid because even manually choosing the good side could not pass. After a feasible geometry was established, a local side-flip could solve 6/6 manually passable variations in a small 9-case neighborhood, without passing the other three manually nonpassable cases. This remains a **bounded geometric experiment**, not a pathfinder.
8. **Geometry and torque matter:** changing a dynamic holder from circle to a rotatable physical cuboid and changing contact offset changes actual response. A checked off-axis moving-actor contact generated peak 0.4233 rad/s and 15.55° beam rotation; symmetric contact generated no measurable angular response in that scenario.
9. **Owner research workbench exists on an isolated branch:** pause/single-step, real shape authoring and undo, reset-stable body starts, optional actor roles and independent local policies, off-center experimental impulses, contact/intent/result displays, portable *initial-scene* JSON recipe with validation, plus non-destructive two-world physical A/B with true XY trajectories. This is not serialized running cognition, not a universal replay protocol, not complete Studio, and not permanent storage across reload unless explicitly exported/reimported.
10. **Controlled pressure:** multiple intervention and re-run campaigns survived narrow integrity tests; one selected 1000-step intervention schedule repeated twice yielded zero measured end-state divergence within that environment. No broad throughput, scale or performance conclusion follows.

For exact evidence/provenance and qualifications, see [Medium Issue 7's accumulated Combat thread](https://github.com/Jozzpoly/Shared-Work-Medium-Lab/issues/7#issuecomment-6070058142) and the current GitHub Actions log. The Medium source door points at the live replaceable branch; **the fact that a trace is visible is not proof Medium independently created the finding**.

## 5. The remaining qualitative deficit (do not hide with more tests)

The current experiment is still built around a handful of largely rigid shapes and constrained local motor rules. **There is no Owner-qualified rich crowd, diverse organism ecology, flexible anatomy, credible perception, whole combat/magic ecology, giant↔tiny scale range, proven performance at scale or mature data-labeling pipeline.** The ability to distinguish mechanics is better; the experience may still feel like watching slightly smarter circles.

The next serious evaluation is therefore not "what other case can be made PASS?" It is whether a changed *whole situation* gives the Owner several genuinely different actions and questions, beyond the old R0/L0 phenomenon. If the only thing new is the diagnostic overlay, the Lab has not met its qualitative objective.

## 6. Medium: what was useful, what remains unknown

Medium worked as a retrievable **cross-lab provenance/source-door and donor-question apparatus**. Character Controller E17 offered useful properties of intent versus physics and finite manipulation, and related Companion/Reflex research supplied methodological counterexamples. Combat used independent mechanics and source checks, while Medium captured findings, corrections and caveats for future receivers.

Still unproven: spontaneous independent donor discovery by Medium, objective causal uplift from the projection compared with direct source retrieval, consumer adoption, or a sustainable self-updating ecology. Future prospective comparisons should ask what concrete problem and action changed *because* Medium supplied a bounded perspective, not because the participants kept a log.

## 7. Open research questions, explicitly not a locked plan

- What can generate a **qualitatively richer physical organism** — dramatically different bodies, support, multi-part locomotion and reactions — without re-importing the obsolete traffic/crossing world?
- Can the authored space and diverse body forms create **unexpected alternative actions** rather than a one-correct-route geometry puzzle or settings panel?
- What are genuine failure regimes in multi-actor contact, pressure, long duration, scale, and reactive motion, and what does each reveal about the body/world law?
- How much authoring and causal observability is necessary for the person testing to *independently* pose new hard experiments?
- What should be kept from this candidate as neutral lab infrastructure, what remains local to it, and what must be replaced to make the next whole compelling?
- Can Medium prospectively change a receiving agent's choices/evidence quality, rather than merely describing changes afterward?

**Invariant:** preserve findings without making the current specimen sacred; do not ask the Owner to validate an underdeveloped whole because the harness is green.

---

This research note intentionally contains **no compulsory NEXT**, implementation plan, branch promotion approval or private collaboration history. Its job is to keep the question and hard-won falsifications recoverable, while leaving the next discovery decision open.
