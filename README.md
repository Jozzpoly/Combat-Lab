# Combat Lab

Experimental laboratory for discovering combat language that may later inform **Feniks**.

Combat Lab is **not** the Feniks combat implementation. A prototype, branch or green CI run never becomes architecture by default.

## Live research truth

There is currently **no accepted Feniks combat model, hit-authority model, aim/target model or commitment scheme**.

Three lanes have already produced negative evidence:

- **R0 — authored arc vs sampled sweep:** useful geometry work, but **FAILED AS A COMBAT EXPERIMENT** because the specimen became a hit-test visualizer rather than a fight.
- **R1 — small combat organism:** restored an opponent, timing, contact, damage and obstacles, but **FAILED OWNER FEEL**. More completeness did not make the direction representative of Feniks.
- **Control / commitment micro-spike:** LIVE STEER vs BOUNDED STEER vs CAPTURED was **REJECTED AS NON-DISCRIMINATING**. The modes changed an algorithmic steering parameter while leaving the player-facing combat language almost the same.

None of these is a foundation to continue.

## Current phase

The lab is back in **hypothesis formation**.

Before another gameplay lane is implemented, we need **3–5 qualitatively different playable combat hypotheses** that differ in what the player actually does and feels within the first ~30 seconds.

The active question is broader than attack steering:

> **What player-to-body-to-weapon control language makes melee combat feel responsive, embodied, spatially meaningful and worth mastering in Feniks?**

Responsiveness and player agency have veto over simulation elegance. Movement during attacks remains a strong default. Nontarget combat matters; aim assistance / soft focus / target-lock remain open questions. Universal dodge-roll / i-frame combat is not an assumed foundation. Body, weapon, terrain, mass and contact matter only where their consequences are perceivable and useful in play.

## Project control

Read these before substantial continuation:

- [Research state](docs/RESEARCH_STATE.md) — current truth, negative evidence, Owner-confirmed pressures, active hypothesis space and roadmap.
- [Experiment protocol](docs/EXPERIMENT_PROTOCOL.md) — hypothesis gate, evidence boundaries, branch hygiene, deployment discipline and the meaning of short Owner commands such as “kontynuuj”.

## Deployment

- `main` is the automatic public truth and currently serves a reset/status page.
- Experimental branches do **not** auto-deploy.
- A candidate may reach Pages only through an explicit manual deploy of an exact branch/tag/SHA after its checks are green.
- Owner play is required to qualify gameplay.

## Working invariant

A failed specimen is evidence, not a foundation.

Prefer a clean reset over accumulating mechanics around an unearned direction.
