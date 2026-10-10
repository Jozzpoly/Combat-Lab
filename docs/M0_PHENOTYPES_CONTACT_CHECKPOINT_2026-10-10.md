# Combat Lab — M0 physical phenotypes / contact-focused recovery (2026-10-10)

**STATUS: isolated exploratory MECHANICAL trial, NOT an accepted organism, not a selected 2D/3D architecture, no Owner experience PASS, no public deploy.** Source in `experiment/m0-physical-phenotypes`, draft [PR #7](https://github.com/Jozzpoly/Combat-Lab/pull/7) against neutral `main`. Historical R0/R1/L0 human product FAIL remains. This document is a bounded run record, not a new roadmap.

## What recovered Owner intent changed

Following T0 and W1, the Lab over-centered the problem on free blocks, pincer arms and authored contact chains. From older Owner conversation, the *much wider experimental dream* is not crates or melee: heterogeneous bodies (humanoid / small / large / animal / spiderlike / compliant), movement, compression, crowd and local reaction, ability to break absurd worlds, physical contact and emergent interactions. Combat itself is delayed until body/movement/world phenomena deserve it. Full autonomous cognition belongs to distinct ReflexBrain/Companion horizons.

This run tested the *different embodied material constructions* part without accepting X0/W1 or installing traffic policy. External inspirations are **methodological**, not imported implementations:
- Rain World ecosystem/creature-specific embodiment and procedural motion: https://unity.com/blog/exploring-procedural-design-rain-world
- EvoGym body–controller co-design and difficulties of hardest tasks: https://arxiv.org/abs/2201.09863
- Algodoo immediate editable matter and force interaction: https://www.algodoo.com/what-is-it/
- physical crowd contact research distinguishes impulse vs sustained pushing and cautions against universal circular collision agents: https://www.nature.com/articles/s41598-023-31148-z
- Karl Sims (1994) co-generation of shapes/control as inspiration, not permission to add evolution now: https://karlsims.com/evolved-virtual-creatures.html

## Physical candidate, not cosmetic phenotype

Created **independently on neutral main** with Rapier 2D deterministic 0.21.0:
- **rigid**: a real single collider/root (125kg);
- **chain**: three real colliding masses (49 + 35 + 35kg) connected by two genuine revolute joints;
- **compliant**: 30kg hub + seven 11kg satellite colliders attached by radial/neighbor spring impulse joints. Its visual outline is NOT a collision membrane; gaps remain. This is a spring-mass **surrogate**, not a human, continuous soft body or physically faithful tissue.

Shared editable 44×27m field starts with eight organisms, two small material objects and boundaries. User can select a body, use WASD, pause + move existing real assemblies, create more and drag a point impulse. No global destination, path plan or fake NPC role.

**Sources of action explicitly separated:** selected body's WASD applies limited external planar traction **proxy** at root; laboratory impulse applies real impulse at a collider; nonselected bodies have no free locomotor drive; chain/jelly have bounded reciprocal INTERNAL contact-triggered reflexes; all bodies retain natural passive constraints. No simulated feet, ground friction normal, actual muscle metabolism or living cognition. Toggle OFF removes active reflex, not passive springs.

## Executed source results (not Owner feel results)

- Initial [emitted Chromium/WASM source run 38087927814](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38087927814): 18 action cases (3 morphology × three offsets ±0.8/0 × reflex ON/OFF), 3 fully passive and 3 externally poked controls, each 330 solver steps. All numerically finite; active operator push physically contacts second body in 18/18. No passive root drive, external impulse or reflex event without stimulation.
- Under a single 660 N·s external point impulse against a separate rigid body at original authored offset 0, the source-specific pair has **1 direct contact tick (rigid), 2 (chain), 69 (compliant)**. This is interesting physically, but NOT a stiffness/quality ranking; envelope, mass and collider multiplicity differ. Note that this is actual measured *contact-presence frames*, not subjective friction quality.
- Same-world 240-fixed-step real visual chronology [CI 38088072780](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088072780): selected chain root moved **x=10.2→18.111**, near compliant body **x=15.8→18.912**, downstream rigid **x=20.2→20.2923**. First and t240 raw frames were visually inspected. There is a real body–body push and spring-bunching, but the image is **still very crude box/bead physics**, NOT a convincing living-creature laboratory or a compelling human-observed behavior demo.
- A more serious **cheap-rigid challenger** matched compliant TOTAL mass ~107kg, projected broad ~2.32m envelope and user motor force/speed, but not exact contact outline or mass distribution; executed [CI 38088121316](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088121316), 12 cases (2 morphology × 3 offsets × direct drive / external impulse, 330 steps each).
  - **Central root-drive pressure:** compliant contact 147 ticks and second-body ΔX **6.303m**; mass/envelope-matched solid 129 ticks and ΔX **6.2826m**. Hence compliant structure **does not earn a general stronger-pushing claim**; a cheap solid does just as much meaningful work in this case.
  - **Central single external impulse:** compliant 70 contact ticks and second-body ΔX **1.797m**; solid 1 contact tick and ΔX **1.1393m**. Sustained contact can be qualitatively distinct; cannot attribute to 'softness superiority' rather than ring geometry/contact distribution/energy delivery.
  - **Off-axis ±0.8m under sustained drive:** compliant moves second body ~3.04m versus solid ~4.91m; a strong counterexample to a blanket compliant advantage.
- **Reflex concern:** in the original 3-offset operator-driven matrix, the chain's sum of second-body ΔX changes only ~+0.111m across three offsets with reflex ON versus OFF (mean ~0.037m); compliant changes ~−0.027m total (mean ~−0.009m). Recorded contact-reflex events do **NOT** yet correspond to a new bodily action/reaction that would interest the Owner. Don't tune to get a green count.

## True, inspected, lasting visual evidence

The frames below were extracted from ONE actual Chromium/Rapier physical world, at tick 0 and tick 240, under fixed-step forward input to one chain-root for 200 ticks followed by 40 no-command ticks. They are not independently reset worlds, illustrations or edited images.

- [Actual raw t0 PNG](media/m0-actual-t0.png) — physically differentiated geometry, but visibly sparse and crude.
- [Actual raw t240 PNG](media/m0-actual-t240.png) — jointed chain physically contacts/displaces a compliant organism toward a heavy rigid body. There is no emergent locomotion or individually chosen behavior, just externally driven input and solver dynamics.
- [One-world timeline execution](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088072780) — tick 0/80/160/240 positions and rendered data from the same runtime.
- [Owner-style actual browser UI qualification](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088221703) — source code path not just helper simulation; no Owner subjective feedback.

The unretouched images **fail to demonstrate** the qualitatively serious organism experience. Do not redesign the screenshots and call it progress. Investigate missing anatomical movement/control and real self-sourced effort *before* claiming any serious next whole.

## Adversarial interpretation

These demonstrations show **distinct physical contact dynamics**, not distinct purposeful actions or self-locomotion. Multiple colliders extend solver contact persistence and allow internal deformation but do not prove they create an observable worthwhile organism behavior.

Actual M0 first and 240-tick images reveal a material field with rectangles, segmented bars and spring-ring beads. The one-lane push only touched nearby bodies; most of the scene was inactive. This STILL threatens to repeat historical L0/W1's failure: polishing good physics until presentation is called an organism. A new controller/AI system is not automatically the answer either. We need a genuine source of intentional/physically sourced action that creates varied encounters.

**Important limitations:** 2D planar root traction is not real ground support; the chain's hinge bend during straight-drive tests was very small; collider graph is not a watertight membrane; rigid substitutes are not fully matched in geometry/rotational inertia; contact ticks may reflect multiple and persistent solver manifolds; all actor movement in trials is operator input or laboratory impulse; no large-crowd performance, chaos/failure campaign or Owner free-play test. The actual UI was subsequently qualified through emitted Chromium: pointer selection, real finite WASD motor, pause/one solver step, physical spring-body creation, paused complete-assembly pose edit, impulse drag, reflex toggle and reset all passed ([CI 38088221703](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088221703)). This is a plumbing check, NOT Owner experience acceptance.

## Provisional decision

Keep M0 as an **isolated replaceable physical embodiment donor** until UI qualification and broader qualitative tests; do not promote a body model or automatically build M1. Before investing in physiology, evaluate whether even a hard, accurate user-operated real contact body makes the Owner want to experiment. If not, revisit body and motor source together (support, muscle force, localized voluntary action), not just scene density, reflex gain or solver fidelity.

The next *serious* candidate must give qualitatively different movement/contact choices at near/far and low/high pressure, not traffic routes, a pincer target, or 3 rigid boxes labeled species. Keep direct Owner loop short and honest, with a few true visual frames rather than fake progress scores. Combat and ReflexBrain remain outside the immediate scope.

## Handoff

Live authority: latest `main/docs/RESEARCH_STATE.md`, `docs/AGENT_RUN_CURSOR.md`, latest Owner feedback and exact source refs/CI. The present PR #7 is independent and unmerged; public `rehearsal/current` must remain untouched absent explicit consent. Do not make this source a mandatory parent of any subsequent new organism.
