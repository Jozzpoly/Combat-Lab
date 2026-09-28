# Combat Lab — R1 Embodied Route Execution / Recovery Research

**Date:** 2026-09-28  
**Status:** **R1-0 AUTHORITY AUDIT MECHANICALLY QUALIFIED · R1-1 LOCAL SUFFIX RECONNECTION NEXT · NO GLOBAL RECOVERY PROMOTION YET**  
**Parent foundation:** M1 constraint-aware static locomotion mechanically qualified  
**Qualified M1 checkpoint:** `f4d92076fb88f2b538b309a56deffdc51eeeda94`  
**Frozen Owner-tested R0:** `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`

## 1. Why R1 exists

The second Owner rehearsal and exact frozen-R0 reconstruction established a narrow failure family in the physically valid 4–20 range:

- N0b returns a valid hard-feasible route witness;
- an actor makes real progress along that witness;
- crowd contact later displaces the embodied body;
- the actor continues to label itself `ROUTE`;
- from the displaced body position, the current body -> current waypoint segment can be hard-BLOCKED at fraction approximately zero;
- route execution has no failure episode in ROUTE mode;
- the one-shot static recovery flag prevents another witness query;
- the actor can remain alive in policy but dead in space.

All final residuals in the clean 4–20 frozen-R0 sweep belong to this stale-ROUTE / zero-fraction family.

M1 separately qualified a static locomotion law that preserves legal tangent motion at hard contact. M1 does **not** restore route authority after displacement.

R1 therefore asks:

> **How should a verified static route be executed, locally reacquired and eventually recovered after embodied displacement without turning N0b into continuous steering or a high-frequency path authority?**

## 2. Authority model

### Route-witness truth

N0b verifies:

- a concrete start;
- a concrete target;
- a sequence of concrete nodes;
- hard-feasible edges between those exact node positions;
- optional comfort evidence.

The witness does **not** prove that every arbitrary body position later reached by physics has a hard-feasible segment to the next waypoint.

### Execution truth

At runtime the embodied body may:

- remain on a verified edge;
- deviate while still having a direct hard-feasible connection to the active or later witness suffix;
- be displaced into a state from which no remaining witness node is locally reachable.

Those are different facts and must be observable.

### Recovery truth

Loss of current witness executability is evidence.

It is **not by itself permission to run a fresh global route query every frame**.

Already falsified by the recording campaign:

- re-arm on waypoint advancement;
- re-arm after one scalar movement threshold;
- immediate fresh N0b query whenever current body -> current waypoint becomes blocked.

The last policy produced severe route-query storms and could perform worse than frozen R0.

## 3. Targeted donor recovery

Concrete donor:

`Jozzpoly/Companion-Brain-Lab`

Exact donor checkpoint:

`aab30aa3217ec660f9a61d690e0628b932186135`

Relevant evidence:

- `docs/R1_4_PROGRESS_RECOVERY_QUALIFICATION.md`;
- `docs/R1_MOVEMENT_ROBUSTNESS_CAUSAL_WORKBENCH_PLAN.md`;
- `src/brain/progress-recovery.ts`;
- `src/brain/r1-recovery-supervisor.ts`.

Useful transferable invariants:

1. progress/recovery is temporal, not a one-frame speed test;
2. route truth outranks Euclidean proximity for arrival/recovery classification;
3. local retry authority and route/objective authority are separate;
4. retries belong to episodes, not lifetime booleans;
5. re-arm follows healthy measurable progress, not bookkeeping alone;
6. cooldown and cumulative recovery debt remain observable after re-arm;
7. ARRIVED / BLOCKED / NO_PROGRESS / ROUTE_INVALID / RECOVERING / UNREACHABLE must remain causally distinct.

### Explicit non-import boundary

Combat Lab does **not** import:

- Companion Brain architecture;
- Rapier / World interfaces;
- relationship objectives;
- player priority/right-of-way;
- DIRECT/NATURAL actuator stack;
- exact thresholds, retry counts or temporal constants;
- donor state-machine vocabulary wholesale.

The donor contributes invariants and falsifier history only.

## 4. R1-0 — route-execution authority audit

R1-0 deliberately has **no global recovery action**.

Given:

- current embodied body position;
- current N0b witness;
- current route suffix/index;
- body radius;
- static world;

R1-0 asks:

> **What part of the existing witness is still executable from the body's current state?**

For every remaining witness node, evaluate a fresh **direct hard N0 traversal** from current body position to that node.

This is local feasibility evidence, not a new route search.

### `ACTIVE_EDGE_CLEAR`

Current body -> current active waypoint is directly hard-feasible.

### `RECONNECTABLE_SUFFIX`

Current waypoint is blocked, but one or more later nodes in the already verified witness are directly hard-feasible from the current body position.

Record the reachable suffix candidates. Do not yet choose movement policy.

### `LOST_EXECUTABILITY`

No remaining witness node is directly hard-feasible from current body position.

The old witness remains historically true, but it no longer provides a current executable continuation.

This is the exact class reproduced by the filmed residuals.

### Arrival boundary

Euclidean proximity alone cannot override blocked/invalid route truth.

## 5. Verified local remaining-cost evidence

For a directly reachable remaining witness node, R1-0 may compute:

`fresh direct current->node cost + verified witness suffix cost node->target`.

That metric is admissible only because:

- the local connection is freshly hard-verified by N0;
- the suffix edges were already verified by N0b.

Do not compute route remaining through a blocked local connection.

R1-0 does not mutate the witness or route cursor.

## 6. R1-0 controlled cells

### A — unchanged witness execution

At original route state:

- ACTIVE_EDGE_CLEAR;
- no recovery;
- no N0b call.

### B — harmless lateral displacement

Body is displaced but current waypoint remains directly hard-feasible.

Expected:

- ACTIVE_EDGE_CLEAR;
- no route invalidation;
- no recovery.

### C — later suffix locally reachable

Current waypoint becomes blocked but a later witness node/target is directly clear.

Expected:

- RECONNECTABLE_SUFFIX;
- exact local traversal evidence;
- no global N0b call.

### D — exact filmed residual anchors

Use the three reconstructed clean-18 dead-body states.

Expected:

- current waypoint blocked near fraction zero;
- LOST_EXECUTABILITY if no remaining suffix node is locally reachable;
- historical witness remains unchanged.

### E — target-near but route-invalid

Euclidean-near cannot become ARRIVED when hard route/execution truth is invalid.

### F — obstacle-order determinism

Equivalent geometry must give equivalent authority classification regardless of obstacle enumeration order.

## 7. R1-1 — local suffix reconnection

Only after R1-0 qualifies.

Research question:

> **Can a displaced body reconnect to a still-valid suffix of the same witness without global replanning?**

Candidate constraints:

- choose only a remaining witness node with fresh direct hard proof;
- execute through qualified M1;
- preserve witness identity;
- do not call N0b;
- do not switch reconnect targets every frame without an explicit reason.

Falsifiers:

- reconnect crosses blocked geometry;
- cursor skips without fresh proof;
- reconnect oscillation;
- hidden global planning;
- M1 causal evidence is lost.

## 8. R1-2 — bounded global recovery episode

Only after local reconnection cannot restore executability.

Candidate sequence:

`LOST_EXECUTABILITY -> persistent no-progress evidence -> bounded fresh N0b query -> RECOVERING`.

Important:

- loss is evidence, not immediate replan authority;
- route-query authority remains event-driven;
- repeated failure in one episode cannot create query storms;
- no-witness remains explicit.

## 9. Episode re-arm boundary

This remains the hardest R1 question.

Already falsified:

- routeIndex advancement alone;
- movement by K×radius alone;
- immediate blocked-edge re-query.

Candidate re-arm evidence should require **healthy verified execution**:

- body materially moves;
- a verified remaining-route metric improves;
- LOST_EXECUTABILITY does not persist;
- progress remains healthy over a bounded temporal window.

R1 must search for a stable region, not tune one threshold to clean-18.

Required behavior:

- a later genuinely independent displacement can open a new episode;
- the same unresolved failure cannot spam route queries;
- lateral/sliding motion without objective progress cannot falsely re-arm.

## 10. Recovery falsifier cells

### R1-A — temporary recoverable deviation

Local reconnect exists -> no global route query.

### R1-B — persistent loss

No reconnect exists -> explicit loss -> one bounded fresh witness only after persistence.

### R1-C — immediate fresh-witness failure

New witness becomes non-executable before healthy progress.

Expected:

- no query storm;
- visible recovery debt.

### R1-D — healthy progress then second independent loss

After first recovery and real verified progress, later displacement may open a new recovery episode.

### R1-E — lateral/orbit false progress

Body motion alone cannot re-arm recovery.

### R1-F — M1 tangent progress

M1 slide that still improves verified route progress must not be mislabeled as route loss.

### R1-G — hard no-witness

Explicit unreachable/no-witness; no ARRIVED alias; no repeated query spam.

## 11. Required causal observation

Expose:

### Witness truth

- witness generation/identity;
- original query start/target;
- route node IDs / edge IDs;
- active suffix index.

### Execution truth

- actual body position;
- active waypoint;
- direct current->active traversal;
- reachable remaining suffix nodes;
- local remaining-cost candidates;
- execution status.

### Progress truth

- physical displacement over the window;
- verified route-metric delta;
- no-progress duration;
- whether progress is healthy enough to re-arm.

### Recovery truth

- episode ID;
- episode query/retry count;
- cumulative fresh-witness count;
- last recovery reason;
- armed / cooldown / exhausted state.

Core diagnostic question:

> **what route fact was verified, what remains executable from the actual body position, what progress really occurred, and why is a fresh global witness allowed now?**

## 12. Machine falsifiers

R1 must falsify:

1. witness authority overreach;
2. hypersensitive invalidation;
3. route-query storm;
4. hidden continuous N0b steering;
5. false suffix reconnect;
6. movement-only re-arm;
7. bookkeeping-only re-arm;
8. lifetime recovery paralysis;
9. Euclidean arrival aliasing;
10. M1 wall-stick regression;
11. dynamic-policy leakage;
12. hard-radius erosion.

## 13. Success boundary

R1 can qualify only:

> **bounded execution and recovery of a verified static route for one embodied circle on qualified M1 locomotion after externally injected displacement.**

It does not qualify:

- dynamic crowd negotiation;
- multi-actor right-of-way;
- personal space;
- dense scaling;
- final route planner;
- final Feniks navigation;
- Owner-visible movement feel.

## 14. Immediate next action

Implement **R1-0 authority audit first** as a pure research module + tests.

Do not implement global recovery in the same change.

Use existing N0 hard traversal, N0b witness evidence and exact filmed residual fixtures.

If R1-0 cannot classify those states cleanly without inventing route policy, stop and redesign before any recovery state machine.


## 15. R1-0 qualification result

Exact qualified checkpoint:

`9eb76892f4a6116e1065bbc9027069b2f42f7391`

CI:

`36425234758` — **SUCCESS**

Evidence:

- **138 / 138** Node tests PASS;
- live Chromium Workbench regression PASS;
- source screenshot artifact PASS;
- R1-0 module imports only N0 hard traversal and contains no N0b/global route-query authority;
- unchanged / harmlessly displaced witness execution remains `ACTIVE_EDGE_CLEAR`;
- active waypoint blocked + later witness suffix locally clear is distinguished as `RECONNECTABLE_SUFFIX`;
- exact three filmed clean-18 residual anchors all classify as **`LOST_EXECUTABILITY`**;
- those anchors have zero reachable remaining suffix candidates under the old witness;
- invalid-target witness truth outranks Euclidean near-target distance;
- obstacle enumeration reversal preserves authority classification.

Bounded verdict:

> **R1-0 PASS — current executability of an existing route witness can be classified from actual embodied position without mutating the witness or invoking a fresh global route search.**

This qualifies:

- route-witness authority boundary;
- local hard-feasibility audit of remaining witness suffix;
- explicit distinction between active-edge authority, locally reconnectable suffix and complete loss of executability.

This does **not** qualify:

- choosing or executing a reconnect;
- temporal progress;
- recovery episodes;
- fresh global route queries;
- crowd behavior.

### Next boundary

Open **R1-1 local suffix reconnection** only.

R1-1 must prove that a `RECONNECTABLE_SUFFIX` body can resume the same witness using one fresh local hard-feasible connection and qualified M1, while:

- preserving witness identity;
- never calling N0b;
- preventing reconnect target oscillation;
- not changing behavior for `LOST_EXECUTABILITY` states.
