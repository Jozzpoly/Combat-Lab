# Combat Lab — S1 Valid Pressure / Completion / Macro-Observability Refoundation

**Date:** 2026-09-28  
**Status:** **S1-0 FLOW-TRUTH LEDGER MECHANICALLY QUALIFIED · S1-1 PHYSICAL ADMISSION / STRAIGHT TRANSIT NEXT · NO CROWD RECOMPOSITION YET**  
**Parent foundations:** M1 + R1 static-route foundations mechanically qualified; D1 repeated dynamic encounter foundation mechanically qualified and closed  
**Frozen Owner-tested R0:** `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`

## 1. Why S1 exists

The second Owner rehearsal produced a real positive signal:

> embodied local interaction already begins to generate recognizable crowd-like behavior.

But the same campaign proved that the current apparatus confounds too many variables to support clean dense-crowd claims.

Current R0 pressure changes can simultaneously alter:

- requested population;
- initial body spacing;
- initial overlap validity;
- target spacing;
- target feasibility;
- within-stream trajectory crossing;
- endpoint occupancy;
- contact workload;
- coupled-solver saturation;
- realtime capacity loss.

Above population 20, the current distributed generator already begins with invalid overlap.

`ARRIVED` is also a sticky historical mode rather than current physical completion truth, and high-density endpoint packing can displace most latched arrivals away from their target points.

Therefore S1 is an **apparatus refoundation**, not another behavior feature.

Its purpose is:

> **make pressure, topology, completion and observation independently legible so later M1/R1/D1 recomposition measures the phenomenon instead of apparatus artifacts.**

## 2. Owner requirements preserved

S1 must preserve:

- exact authored values;
- direct intervention;
- explicit Reset World / matched reruns;
- independent meaningful dimensions;
- intentional extremes;
- breakability;
- no hidden despawn/ghosting/caps;
- causal explanation rather than raw counter walls.

Important nuance:

> **valid ordinary stimuli and permissive break regimes must coexist.**

The apparatus may distinguish “ordinary-valid” from “intentional-break”.
It may not silently rewrite an authored extreme into a safer value.

## 3. Targeted donor recovery

Concrete donor inspected:

`Jozzpoly/Companion-Brain-Lab@044019106f2ad525cfa4e55bf0f382ee26fa245c`

Relevant evidence:

- `docs/FIELD_LAB_EXPERIMENT_AUTHORING_CHECKPOINT_2026-09-24.md`;
- `docs/COMPANION_SQUAD_FIELD_LAB_CAMPAIGN.md`;
- `src/squad/field-lab-experiment.ts`;
- `src/squad/field-lab-trial.ts`.

Useful transferable invariants:

1. **setup truth and temporal outcome truth are different artifacts**;
2. exact authored values must not be silently clamped into different experiments;
3. persistent A/B setup comparison is not enough — temporal outcome evidence matters;
4. trial traces should preserve provenance back to starting setup;
5. group/macro observability should lead into focused causal drilldown instead of rendering every actor's full debug;
6. manual experiment authoring is itself evidence.

### Explicit non-import boundary

Combat Lab does **not** import:

- Companion squad architecture;
- Rapier-specific world contracts;
- formation/order semantics;
- Companion status labels;
- storage/UI implementation;
- exact thresholds or trace schema.

S1 uses only the experiment-design invariants.

## 4. S1 truth planes

The apparatus must keep these truths separate.

### A. Demand truth

What the experiment asked for.

Examples:

- requested total participants;
- requested source-side counts;
- requested admission rate;
- authored phenotype sequence;
- authored break-regime demand.

Demand can exceed current physical admission capacity.

That is not an error and must not be silently clamped.

### B. Admission truth

What actually entered the active physical scene.

Examples:

- admitted count;
- admission timestamps;
- blocked/queued demand;
- source occupancy preventing admission;
- realized admission rate.

A blocked source must not silently overlap-spawn another body.

### C. Active-transit truth

What is physically present and still participating in the measured transit phenomenon.

This is distinct from both:

- queued demand;
- completed participants.

### D. Completion truth

For a transit experiment, completion should be an explicit event such as crossing a sink/finish boundary.

Completion is not automatically:

- persistent occupancy of a target point;
- a sticky actor mode;
- continued participation as a stationary collider.

A separate persistent-destination experiment may intentionally study occupancy pressure.

### E. Topology truth

Keep independently authored / attributable:

- straight counterflow;
- crossing/permuted destinations;
- static bottleneck geometry;
- source/sink geometry;
- body phenotype composition.

Do not call population itself “pressure” if changing population also changes trajectory topology.

### F. Behavioral/contact truth

Examples:

- progressing;
- stalled;
- hard-contact partners;
- episode state;
- static-route validity;
- recovery state.

### G. Solver truth

Examples:

- current coupled passes;
- peak coupled passes;
- recent saturation fraction;
- current contact-resolution workload.

Solver effort is not a crowd-health score.

### H. Realtime performance truth

Reuse existing `RuntimePerformanceMeter` evidence:

- simulation / wall ratio;
- discarded wall time;
- simulation/render/observation cost.

A behavioral jam can be computationally cheap.
A healthy negotiated flow can perform more contact work than a deadlock.

### I. Break-regime truth

An intentional pathological experiment must say so explicitly.

Examples:

- unsafe raw burst;
- invalid initial overlap;
- physically impossible target packing;
- solver-capacity stress.

Break regimes remain allowed.
They must not masquerade as ordinary valid crowd trials.

## 5. Ordinary transit candidate — source / sink flow

The strongest current candidate for clean counterflow pressure is not “pack more bodies into the same two columns”.

Instead use explicit:

- source side;
- queued demand;
- hard-valid admission portal / source region;
- active transit;
- sink/finish crossing;
- explicit completion retirement from the transit contact set.

This provides a pressure axis through **demand/admission rate** rather than initial overlap.

Important:

- high authored demand may create backlog;
- backlog is visible evidence, not dropped work;
- active density emerges from admission + transit throughput;
- a blocked portal naturally throttles realized admission;
- sink retirement is declared experiment semantics, not hidden protective despawn.

## 6. S1-0 — flow-truth ledger

S1-0 is deliberately non-physical.

It owns no contact solver, locomotion, route planner or spawn geometry.

It records only event truth:

### Demand event

`REQUEST(side, count, time)`

Effects:

- increments authored demand;
- creates deterministic queued participant IDs;
- never drops demand silently.

### Admission event

`ADMIT(id, time)`

Allowed only for an actually queued participant.

Effects:

- queued -> active;
- records admission provenance.

S1-0 itself does not decide whether a physical portal is clear.
That authority belongs to S1-1.

### Completion event

`COMPLETE_TRANSIT(id, time, sink)`

Allowed only for active transit participants.

Effects:

- active -> completed;
- participant leaves the transit-active set;
- completion remains historical event truth.

No actor can be:

- queued and active;
- active and completed;
- completed twice.

## 7. S1-0 falsifiers

### A — exact large demand is preserved

Request 256 participants.

Expected:

- demanded = 256;
- queued = 256 before admissions;
- zero hidden clamp/drop.

### B — blocked admission does not mutate truth

If S1-1 later says portal blocked, S1-0 simply receives no ADMIT event.

Demand remains queued.

### C — admission order is deterministic

Within each authored source queue, stable participant ordering is preserved.

### D — completion requires active participation

Queued/nonexistent IDs cannot complete.

### E — completion is exactly-once

A completed ID cannot complete again.

### F — side truth is preserved

Demand / queue / active / completed counts remain available per source side.

### G — event provenance is monotonic

Demand, admit and completion timestamps are monotonic per participant and event sequence.

### H — no hidden capacity policy

S1-0 has no maximum population constant.

It can represent pathological demand without claiming physical admission.

## 8. S1-1 — physical admission + straight transit cell

Only after S1-0 qualifies.

Integrate:

- hard bodies;
- a simple straight transit world;
- one or more explicit source portals;
- hard occupancy check before admission;
- sink/finish planes.

Required:

- no initial overlap introduced by ordinary admission;
- blocked portal preserves backlog;
- demand can exceed admission capacity;
- current active count remains physically factual;
- sink crossing records completion and removes the body from transit interaction;
- no point-target pile is required.

This cell should initially avoid:

- static pillars;
- target permutation;
- R1 routes;
- D1 repeated encounters if not needed by the first admission/completion falsifier.

## 9. S1-2 — independent pressure / topology / break axes

After straight transit qualifies, expose independent scenario axes.

Candidate pressure dimensions:

- requested demand count;
- source demand rate;
- source portal count/width;
- active-world width;
- bottleneck width;
- body phenotype composition.

Candidate topology modes:

- straight counterflow;
- crossing/reordering;
- bottleneck;
- persistent destination occupancy.

Candidate break mode:

- explicit unsafe raw burst / overlap stress.

A break mode must preserve exact authored values and report invalidity.
It must not become the default meaning of “dense”.

## 10. S1-3 — macro causal-health observation

Build the Owner-facing macro evidence that the second rehearsal actually asked for.

At minimum separate:

### Population / flow

- demanded;
- queued;
- admitted;
- active;
- completed;
- admission rate;
- completion/throughput rate.

### Behavioral health

- progressing;
- stalled;
- current hard-contact cohort;
- route-loss/recovery cohort where applicable;
- dynamic episode cohort where applicable.

### Solver health

- current coupled passes;
- peak;
- recent saturation fraction;
- current contact workload.

### Runtime health

- simulation/wall ratio;
- discarded wall time;
- phase costs.

### Validity

- ordinary-valid vs break;
- spawn overlap count;
- boundary violations;
- invalid target/source facts.

Owner-facing flow should support:

> **macro anomaly -> suspicious cohort -> selected-subject causal drilldown**

Do not collapse this into one red/yellow/green health score.

## 11. S1-4 — trial trace and comparison

Reuse existing Combat Lab foundations where possible:

- `comparison-state.js` for authored setup differences;
- `RuntimePerformanceMeter` for performance evidence;
- provenance files / experiment IDs.

Add temporal outcome evidence only where it materially helps compare trials.

Candidate summaries:

- demand/admission/completion curves;
- throughput;
- queue backlog;
- stalled time;
- contact time;
- solver saturation fraction;
- simulation/wall ratio.

A/B must distinguish:

> **what we authored differently**

from:

> **what happened differently**.

## 12. Promotion boundary

S1 may qualify only a cleaner experiment apparatus.

It does not qualify:

- crowd intelligence;
- personal space;
- compressible bodies;
- final spawn system;
- final game traffic/navigation;
- final Workbench UX.

## 13. Immediate next action

Implement **S1-0 flow-truth ledger** as a pure research module + tests.

Do not put physics or portal-clearance logic into S1-0.

The first PASS should establish that extreme exact demand, queue state, active transit and completion can coexist without hidden clamps, dropped participants or sticky completion ambiguity.


## 14. S1-0 qualification result

Exact checkpoint:

`bd2684d1397e3a00acc4d0e028c45e01ac87b732`

CI:

`36472032893` — **SUCCESS**

Evidence:

- **191 / 191** Node tests PASS;
- live Chromium Workbench regression PASS;
- exact demand of 256 is preserved without hidden cap/drop;
- a physically blocked future source can leave demand queued simply by emitting no ADMIT event;
- admission preserves deterministic per-source queue order;
- active transit and completed transit are disjoint states;
- completion is exactly-once;
- queued/non-active participants cannot complete;
- per-side demanded / queued / active / completed truth is preserved;
- event provenance is time-monotonic;
- the ledger contains no contact solver, occupancy query or population-cap authority;
- stress demand of 10,000 remains representable as queued truth.

Bounded verdict:

> **S1-0 PASS — exact authored flow demand, queued demand, admitted active transit and exactly-once completion can be represented independently without hidden capacity policy or physical admission authority.**

This does not prove:

- collision-free admission;
- source portal semantics;
- physical throughput;
- sink crossing;
- counterflow pressure;
- crowd behavior.

## 15. S1-1 immediate boundary

Open a **single-direction hard-body straight-transit cell**.

Why single-direction first:

> admission/backlog/completion must be qualified before opposing-flow behavior is allowed to contaminate the result.

S1-1 should:

- request an exact cohort through S1-0;
- use one physical source portal;
- admit only when a real hard-body occupancy check says the spawn envelope is clear;
- preserve all blocked demand in the queue;
- drive admitted bodies straight toward a sink;
- count completion on sink crossing;
- remove completed bodies from the transit-active contact set by explicit scenario semantics;
- preserve admission/completion event provenance.

Required falsifiers:

1. high demand cannot create overlap at admission;
2. blocked portal cannot silently drop/replace demand;
3. completion cannot leave an invisible active collider behind;
4. physical body count must equal ledger active count;
5. admitted + queued + completed must equal demanded;
6. exact extreme demand remains authored even when only a small fraction is physically admitted;
7. no dynamic encounter, route planner or personal-space authority is introduced.
