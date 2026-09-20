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

The first discovery campaign is now **machine/browser qualified and waiting for Owner feel evidence**. This is not gameplay acceptance.

The first campaign now contains **four deliberately divergent combat organisms** formed by crossing two questions: **continuous vs discrete intent expression**, and **authored/kinematic vs material/coupled realization**. The four corners are **DIRECT, ACTIONS, COUPLED DIRECT, and COUPLED ACTIONS**.

The active question is broader than attack steering:

> **What player-to-body-to-weapon control language makes melee combat feel responsive, embodied, spatially meaningful and worth mastering in Feniks?**

Responsiveness and player agency have veto over simulation elegance. Movement during attacks remains a strong default. Nontarget combat matters; aim assistance / soft focus / target-lock remain open questions. Universal dodge-roll / i-frame combat is not an assumed foundation. Body, weapon, terrain, mass and contact matter only where their consequences are perceivable and useful in play.

## Project control

Read these before substantial continuation:

- [Research state](docs/RESEARCH_STATE.md) — current truth, negative evidence, Owner-confirmed pressures and active roadmap.
- [Discovery Campaign v1](docs/DISCOVERY_CAMPAIGN_V1.md) — four-corner experiment design, shared situation, implementation boundaries and Owner-test contract.
- [Experiment protocol](docs/EXPERIMENT_PROTOCOL.md) — hypothesis gate, evidence boundaries, branch hygiene, deployment discipline and the meaning of short Owner commands such as “kontynuuj”.

## Deployment

- `main` is the automatic public truth and normally serves the reset/status state.
- Ordinary experimental pushes do **not** deploy.
- The currently whitelisted active experiment may deploy only after green checks and explicit `[deploy]` intent; the Pages build checks out the exact checked SHA.
- Deployed JS/CSS module URLs are versioned by that exact source SHA to prevent stale mixed-build browser caches.
- Owner play is required to qualify gameplay.

## Working invariant

A failed specimen is evidence, not a foundation.

Prefer a clean reset over accumulating mechanics around an unearned direction.
