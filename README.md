# Combat Lab

Combat Lab is a research laboratory for discovering **embodied combat possibility** that may later inform **Feniks**.

It is not the Feniks combat implementation, and it is not a sword project. The research space includes body size and proportions, mass and carried load, locomotion, occupied space, reach, shields, axes, spears, bows/projectiles, magic, terrain, multiple actors, mixed modalities and other phenomena when they materially change what fighting can become.

## Current truth

**Canonical live branch:** `main` after repository canonicalization.

**Current stage:** Workbench + Load / Envelope B0 is **closed** after direct Owner play and recording analysis.

Current qualified statements:

- **Workbench foundation — QUALIFIED FOR CURRENT RESEARCH USE.**
- **B0 embodiment decomposition — POSITIVE OWNER SIGNAL / STAGE CLOSED.**
- Separating spatial envelope, inertial burden/load and locomotor authority is worth carrying forward as a research principle.
- The current B0 formulas, units and circular body representation are **not** accepted Feniks semantics.
- A/B parameter slots are mechanically qualified, but their human usefulness remains **UNPROVEN**.
- There is **no accepted Feniks combat model, hit-authority model, aim/target model or commitment scheme**.
- The next research direction is deliberately **OPEN** and waits for new Owner instruction.

Latest Owner-confirmed direction: the project is broader than hitting or melee. Body/world relations matter, and later work may investigate bows, magic, axes, spears, shields, terrain and hybrids without treating any previous combat family as the project spine.

## Research standard

Owner-observed behavior and explicit Owner feedback outrank machine PASS, internal state, documentation and prior plans for product/experience claims.

A technical gate may qualify:

- deterministic mechanics;
- geometry/math;
- runtime health;
- input plumbing;
- build/deploy provenance.

It may not qualify:

- feel;
- readability;
- mastery;
- desire to continue;
- "good combat";
- Feniks fit.

Failed specimens remain evidence. They do not become foundations through implementation momentum.

## Workbench

The current Workbench provides:

- a persistent experiment viewport + Lab Inspector;
- live numeric manipulation and permissive extreme ranges;
- explicit numerical safety rails rather than paternalistic "invalid" states;
- separate `Reset World` and `Restore Defaults`;
- authored vs derived/live state separation;
- optional Debug;
- experiment switching;
- A/B authored-parameter slots;
- exact build provenance.

The first direct Owner session used the Workbench as an actual exploratory instrument, including deliberately strange body/mass/load/force combinations.

## Public specimen

The last Owner-verified B0 closure specimen before repository canonicalization was:

- `2eb9a878eb4fa9c406ca0e90abcab33cb186332a`.

Public surface:

https://jozzpoly.github.io/Combat-Lab/

Deployment is explicit: a successful `main` CI run deploys only when the commit message contains `[deploy]`, or through an explicit workflow dispatch.

## Repository authority

Start here:

1. [Current research state](docs/RESEARCH_STATE.md)
2. [Experiment protocol](docs/EXPERIMENT_PROTOCOL.md)
3. [Owner scope correction](docs/COMBAT_LAB_SCOPE_CORRECTION_2026-09-25.md)
4. [Workbench design record](docs/COMBAT_LAB_WORKBENCH_REFOUNDATION_2026-09-25.md)
5. [B0 Owner recording feedback](docs/B0_WORKBENCH_OWNER_RECORDING_FEEDBACK_2026-09-25.md)
6. [B0 / Workbench stage closure](docs/B0_WORKBENCH_STAGE_CLOSURE_2026-09-25.md)
7. [Historical evidence index](docs/HISTORY_INDEX.md)

The previous append-only canonical state is preserved verbatim as historical evidence at:

- [Pre-cleanup research-state history](docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md)

## Branch policy

The repository should normally have **one live branch: `main`**.

Experiment branches are temporary execution surfaces. Before deletion, any unique historical lineage that still matters must be made reachable from the canonical DAG and its evidence/status recorded in documentation.

Do not keep stale branches merely as bookmarks.

## Working invariant

> **We are not trying to prove that our mechanics can support combat. We are trying to discover combat worth supporting.**
