# Living Movement L0 — recovered state and next research frontier

Date: 2026-10-05  
Status: **branch-local research record; not canonical Combat Lab truth**  
Branch: \`experiment/living-movement-l0\`

## Why this branch exists

This branch is a deliberate return to the early multi-body / crowd-like Combat Lab signal without reviving the old harness as an explanation.

The research question is not "how do we build a better crowd solver?"

> Can many local embodied organisms preserve meaningful movement continuity while other bodies continuously change the futures available to them, without a global crowd brain or scripted crowd role?

The current playground is intentionally much narrower than Feniks. It does not contain village simulation, social relations, LLM cognition, needs, culture or the Feniks Studio/map-editor work.

## Recovered authority

Canonical \`main\` remains at:

- \`90ac79409778aec4f8d34946d597ea4ba75cbc3f\`

The L0 branch currently derives directly from that main lineage and remains experimental.

Qualified older donors remain donors rather than a bundled inherited solution:

- C0 candidate contact semantics;
- M1 hard static locomotion/contact truth;
- R1/D1 continuity/recovery lessons;
- S1 truth/causal-observation apparatus;
- Workbench camera, selection and authored/live separation.

Frozen R0 / Integrated Ecology is evidence and historical rehearsal. It is not the new crowd organism.

## What L0 currently contains

L0 currently combines, in one continuous playground:

- hard-separated deterministic starts;
- independent edge-to-edge activity bands rather than one shared waypoint;
- material circle bodies using C0-style mass, motor authority and contact resistance;
- acceleration-limited motor realization;
- local neighbour perception only;
- short-horizon prospective evidence over a small continuation family;
- explicit permission for contact rather than universal avoidance;
- smooth effort-history -> capability deformation;
- selected-organism demand -> outcome observation;
- explicit ablations for prospection and effort-history.

This is a research specimen, not accepted Feniks locomotion or crowd semantics.

## Important evidence sequence

### A. Prospection as a hard safety policy — rejected

The first implementation effectively required candidate continuations to preserve a safety margin.

It produced a sterile result: prediction became movement policy and drove avoidance too strongly.

This directly violated the research principle:

> Prediction is evidence, not movement policy.

That implementation was changed rather than tuned to prettier numbers.

### B. Evidence-not-safety revision

At \`07913dbe074d11415c9d44ceef627fab036e68c0\`, 16-actor / 12 s ablation evidence included:

- baseline: 16/16 completed, 10 contact resolutions, 186 continuation changes;
- 123 of those changes occurred within <= 0.25 s of the prior change;
- 9 left<->right reversals;
- no-prospection: 16/16 completed but ~2155 contact resolutions.

Interpretation:

Prospection clearly changed the causal regime and prevented large amounts of material contact, but it was still re-deciding too aggressively. This is not evidence of good crowd intelligence.

### C. Reachable-motion predictor revision

The predictor was then changed so the organism's candidate future respected acceleration-limited motion rather than assuming instantaneous desired velocity.

At green \`ac547b14b8095b185a2f950250afafe96c9c0e36\`:

- baseline: 15/16 completed;
- 16 contact resolutions;
- 458 continuation changes;
- 391 rapid transitions;
- 7 left<->right reversals.

This was worse in the central problem. A more embodied trajectory calculation did not by itself create behavioral continuity.

Finding:

> Better prediction fidelity cannot substitute for continuity of attempted action.

### D. Realized-continuation authority revision

A later experiment made a corrective continuation retain local authority until outcome evidence existed. The first commit was syntactically broken; the syntax-only repair produced green head \`58edcd83d1d18ab7ce2d8b7c8c81de542f28faa2\`.

Full regression + browser gate:

- 235 / 235 tests PASS;
- browser Workbench gate PASS;
- quiet single-organism condition PASS;
- exact symmetric head-on condition still invents no hidden left/right convention.

Current 16-actor / 12 s baseline evidence:

- 13/16 completed;
- 292 contact resolutions;
- 132 continuation changes;
- 84 rapid transitions;
- 5 left<->right reversals.

The change reduced churn relative to the reachable-motion revision, but paid for that reduction with much more contact and worse completion.

This is not a success metric trade to optimize. It exposes a deeper representational problem.

## Strongest current finding

The current \`continuation.id\` is not yet a material movement attempt.

For example, an actor can remain in continuation \`left\` while each frame recomputes \`activityDirection(...)\` from its new position and then derives a new desired velocity from that moving basis.

Therefore:

- one continuation ID can correspond to many different demanded velocity vectors;
- "continuation did not change" does not prove demand continuity;
- \`lastOutcome.continuationId\` can attribute the result of an earlier demand vector to a later one with the same label;
- preserving the symbolic label can look like commitment while the actual motor command continues to morph.

This repeats an older Combat Lab failure class:

> symbolic actor state must not outrank material world truth.

The next research unit should therefore be a materially attributable movement attempt, not a stronger state-machine label.

## Additional open problem in the current code

The current release/reconsideration condition is also too narrow.

A corrective continuation is treated as materially blocked primarily when contact occurs and \`blockedFraction >= 0.25\`.

But a movement attempt can fail without contact:

- it may make no useful progress;
- its intended lateral displacement may never realize;
- it may become dynamically obsolete;
- the organism may be carried into a bad trajectory;
- another actor may remove or reopen the relevant future before contact.

Contact alone is not sufficient outcome evidence.

## Current status

### Mechanically defended

- the branch is isolated from canonical \`main\`;
- existing Combat Lab regression suite remains green at the syntax-repaired head;
- L0 starts hard-separated in its ordinary regime;
- low-density single-organism motion remains quiet;
- exact symmetric head-on pressure does not receive an invented hidden passing side;
- prospection and effort-history have truthful zero ablations;
- selected-organism demand/outcome evidence is available in the Workbench;
- population growth preserves the first-N authored activity specs.

### Materially open / unqualified

- living crowd behavior;
- quality of prospection;
- quality of movement commitment;
- usefulness of effort-history;
- local negotiation / yielding;
- lane or stream emergence;
- crowd-scale behavior;
- Feniks semantics;
- Owner experiential PASS.

No current aggregate metric is an optimization target.

## Next systematic frontier

The next campaign should isolate **movement-attempt continuity** before adding more competence.

For the first pass, hold the playground and contact substrate stable and temporarily use effort-history OFF as the cleaner causal condition. Effort-history remains a candidate donor and can be reintroduced later.

A movement attempt should be attributable to material commands and material realization, not only to a semantic label. The research question is:

> Once an organism visibly begins one locally chosen correction, what world evidence is sufficient to say that this same attempt has actually been tried, supported, contradicted, completed or invalidated?

Candidate evidence should come from the body/world relation, for example:

- actual displacement in the attempted lateral/forward relation;
- realized-vs-demanded motion;
- loss or gain of feasible local future;
- material contact/constraint;
- useful progress toward the continuing activity;
- reopening of a materially cheaper/direct future.

The campaign should explicitly avoid an arbitrary "commit for N milliseconds" cooldown unless evidence later proves a time constant is itself the physical variable of interest.

## Required observability before the next behavior change

The current churn metric counts semantic continuation-ID changes. That is insufficient.

Before the next policy change, add observation for:

- demanded velocity direction and magnitude change;
- cumulative angular/demand churn even while continuation ID stays constant;
- duration / realized displacement of each attributable attempt;
- whether reconsideration occurred before meaningful body realization;
- reason for attempt release;
- contact and activity progress during the attempt.

This should let us distinguish:

1. legitimate adaptation to a changed world;
2. prediction oscillation;
3. symbolic label stability with hidden motor-command churn;
4. over-sticky commitment;
5. genuine material failure followed by recovery.

## Guardrail

Do not tune thresholds to maximize completion or minimize contact.

A living movement substrate may legitimately contain contact, hesitation, yielding, failed attempts and local jams. The target is causal, legible, embodied continuity that survives repeated perturbation without global orchestration.

The world should create the question; the apparatus should make the cause inspectable.
