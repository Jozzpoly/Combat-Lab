# Combat Lab — R1 Embodied Route Execution / Recovery Research

**Date:** 2026-09-28  
**Status:** **R1-0 / R1-1 / R1-2 / R1-3 MECHANICALLY QUALIFIED · ISOLATED R1 FOUNDATION CLOSED · D1 NEXT · NOT INTEGRATED INTO R0**  
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


## 16. R1-1 qualification result

Exact qualified checkpoint:

`5e68644e55e8301acc36f22c3a209d53fd4ff59d`

CI:

`36425997880` — **SUCCESS**

Evidence:

- **144 / 144** Node tests PASS;
- live Chromium Workbench regression PASS;
- R1-1 source explicitly contains no N0b / `findStaticRouteWitness` authority;
- active hard-valid witness edge executes through qualified M1 with zero reconnects;
- blocked active edge + later hard-proven witness suffix reconnects monotonically and completes;
- reconnect preserves original witness identity;
- route cursor never moves backward under stable static geometry;
- exact three filmed `LOST_EXECUTABILITY` anchors remain LOST with zero motion and zero reconnect attempts;
- hard body radius / M1 final occupancy remain intact.

Bounded verdict:

> **R1-1 PASS — a body may locally reconnect to a later still-verified suffix of the same witness without a fresh global route search, while complete loss of witness executability remains explicit and inert.**

This qualifies:

- monotonic local suffix reconnect;
- preservation of witness identity;
- no opportunistic shortcut while active edge remains valid;
- no hidden recovery for full LOST states.

This does **not** qualify:

- any fresh global route query;
- temporal loss persistence;
- retry budgets;
- recovery re-arm;
- repeated displacement episodes.

## 17. R1-2 — single bounded global recovery episode

R1-2 is intentionally narrower than the earlier design wording.

Question:

> **After a body enters full LOST_EXECUTABILITY and remains there as a genuine no-progress condition, can exactly one bounded fresh N0b query recover execution without route-query thrash?**

R1-2 must not yet solve episode re-arm.

Candidate boundary:

1. R1-1 executor reaches `LOST_EXECUTABILITY`;
2. desired route progress remains unsatisfied;
3. loss persists over a bounded temporal window;
4. one fresh N0b query is permitted;
5. if direct/witness route is returned, replace the exhausted witness and resume through R1-1 + M1;
6. if no witness exists, expose explicit no-witness/unreachable evidence;
7. **no second fresh query is allowed in the same episode**, even if the replacement witness later fails.

Required cells:

- exact three filmed LOST anchors -> one fresh query -> completion if current N0b can recover them;
- transient/local reconnect case -> zero global queries;
- LOST state shorter than persistence window -> zero query;
- fresh witness fails immediately -> one query total, then explicit exhausted/no-progress state;
- no-witness result -> one query total, explicit terminal evidence;
- Euclidean-near invalid target -> no arrival alias.

Only after R1-2 qualifies may R1-3 research **episode re-arm after healthy verified progress**.

R1-3 must not inherit donor thresholds or reuse the already-falsified waypoint/distance heuristics.


## 18. R1-2 qualification result

Exact qualified checkpoint:

`24b0f85f16a41953fab201ff2d19185f7a85e176`

CI:

`36427598685` — **SUCCESS**

Final suite:

- **151 / 151** Node tests PASS;
- live Chromium Workbench regression PASS.

### Important falsification history

The first R1-2 implementation checkpoint:

`803a77467ddbf0db4cfc67144ff19771f6402bf8`

did **not** qualify.

CI `36426660018` produced:

- 149 / 150 PASS;
- exact filmed recovery fixture 0 FAIL;
- fresh N0b query returned a valid witness;
- executor later entered `RECOVERY_EXHAUSTED` after a second LOST state.

This was not evidence that one fresh recovery witness was inherently insufficient.

The failing trace exposed an R1-1 route-execution authority defect:

> entering a waypoint tolerance shell was allowed to advance the route cursor even when the next witness edge was not yet hard-feasible from the actual embodied position.

For fixture 0:

- fresh recovery query at ~0.35 s returned a valid witness;
- the executor approached the first corner;
- route cursor advanced numerically;
- current position -> target was still blocked by `pillar.upper`;
- the replacement witness then appeared lost and the single-query episode exhausted.

R1-1 was therefore reopened and hardened.

### R1-1 hardening invariant

A waypoint can be consumed only when:

1. current embodied position still has hard authority to the active node;
2. if another witness edge follows, the next edge is also hard-clear from the actual embodied position.

Being merely within `arrivalTolerance` of a node is insufficient.

This preserves a critical distinction:

> **waypoint proximity is geometric evidence; route-cursor advancement is an authority transition.**

After the hardening:

- the body may continue legal M1 movement around the corner while still targeting the current witness node;
- only once the next edge has fresh hard proof may the cursor advance;
- R1-2 exact filmed anchors then recover with the same single fresh N0b query.

### Qualified R1-2 evidence

The post-hardening checkpoint proves:

- locally reconnectable suffix case completes with **zero** global queries;
- full LOST must persist for the bounded loss window before any fresh N0b query;
- all three exact filmed LOST anchors recover with **exactly one** fresh N0b query each;
- no-witness recovery becomes explicit `NO_WITNESS`;
- a second loss in the same episode cannot trigger a second fresh query;
- invalid/near-target truth cannot alias into arrival;
- fresh-witness execution obeys the hardened R1-1 corner-authority rule;
- no route-query storm is introduced.

Bounded verdict:

> **R1-2 PASS — one persistent full-loss episode may receive exactly one fresh global N0b witness and recover through hardened R1-1 + qualified M1, while repeated failure in that same episode remains bounded and explicit.**

This qualifies:

- one bounded fresh-witness recovery episode;
- persistence before route-query authority;
- one-query episode budget;
- explicit no-witness / exhausted outcomes;
- exact recovery of the three filmed clean-18 dead-body anchors.

This does **not** qualify:

- re-arming a new episode after later healthy progress;
- repeated independent displacement episodes;
- dynamic-body encounter recovery;
- crowd integration;
- Owner-visible movement feel.

## 19. R1-3 boundary — recovery episode re-arm

R1-3 is now the only remaining route-recovery question before R1 integration can be considered.

Question:

> **What observable evidence proves that the actor has genuinely recovered enough that a later loss should count as a new independent recovery episode rather than continuation of the old failure?**

Already rejected:

- waypoint advancement alone;
- route-index advancement alone;
- movement by one scalar distance threshold;
- immediate blocked-edge requery.

R1-3 must preserve the R1-2 one-query-per-episode guarantee.

Candidate evidence must combine:

- material body motion;
- verified route-execution authority;
- improvement in a verified remaining-route metric;
- persistence of that healthy progress over a bounded temporal window.

Re-arm must not be triggered by:

- lateral/orbit motion that does not reduce verified remaining cost;
- M1 sliding that merely moves without route progress;
- one lucky frame;
- bookkeeping-only cursor changes;
- target/metric change without body progress.

R1-3 should be researched as a **small temporal monitor around R1-2**, not by weakening the R1-2 query budget.


## 20. R1-3 qualification result

R1-3 was qualified in layers.

### Temporal re-arm monitor

Checkpoint: `02cb27c390c49d6a55bb5b63de475389dfcfed45`  
CI: `36448373414` — **SUCCESS**

Evidence:

- 158 / 158 Node tests PASS;
- live Chromium Workbench regression PASS;
- monitor owns no N0b/global-recovery authority;
- one lucky frame cannot re-arm;
- lateral body travel without verified route-cost improvement cannot re-arm;
- metric improvement without material body movement cannot re-arm;
- route-authority loss resets the healthy window;
- exact filmed R1-2 recovery produces sufficient healthy verified execution to re-arm;
- a broad local epsilon region (2 / 8 / 16 world units) passes.

### Episode integration

Checkpoint: `36adcd7c711e1a9d07b949ae3063689cc28b3568`  
CI: `36448864784` — **SUCCESS**

Evidence:

- 163 / 163 Node tests PASS;
- displacement before healthy re-arm remains inside the old one-query episode;
- healthy verified execution opens exactly one new independent episode;
- episode 2 receives exactly one fresh query;
- a further loss before episode-2 re-arm cannot query again;
- no recovery query means no re-arm authority.

### Repeat-episode audit and provenance gap

A stricter `1 -> 2 -> 3` episode test at `b8625da110cfafce87d29112f3bde1c234336924` produced CI `36449316315`: **163 / 164 PASS**.

The failure was not route/recovery behavior. The archived public snapshot did not expose which witness had been executed, so the test could not prove preserved route authority.

That was treated as a real observability/provenance gap. The R1-1 snapshot was extended with bounded witness evidence:

- witness status;
- target;
- route node IDs;
- route edge IDs;
- clearance.

No movement or recovery behavior changed.

Final checkpoint: `8c4861872b34641e93f88e09607a52da0775b2cc`  
CI: `36449586770` — **SUCCESS**

Final evidence:

- **164 / 164** Node tests PASS;
- live Chromium Workbench regression PASS;
- independent recovery episodes repeat across `1 -> 2 -> 3`;
- cumulative fresh-query count remains one per episode;
- archived episodes retain witness provenance;
- the same unresolved episode still cannot obtain a second query.

Bounded verdict:

> **R1-3 PASS — a consumed recovery episode can be re-armed only after sustained hard-valid execution with material body travel and verified remaining-route improvement, permitting later independent recovery episodes without weakening the one-query-per-episode invariant.**

## 21. R1 closure

R1 is now **MECHANICALLY QUALIFIED / ISOLATED / NOT INTEGRATED INTO R0**.

Qualified chain:

1. **M1** — legal tangent static locomotion while preserving hard blocking;
2. **R1-0** — existing-witness execution authority audit;
3. **R1-1** — local reconnect to a later hard-proven suffix without N0b;
4. **R1-2** — one bounded fresh global witness after persistent full loss;
5. **R1-3** — recovery-episode re-arm only after healthy verified progress.

Bounded supported claim:

> **one embodied circle can execute and recover a verified static route through externally injected displacement episodes without continuous global replanning, route-query storms, waypoint-authority overreach or wall-stick.**

R1 does **not** qualify:

- body-body negotiation;
- repeated dynamic encounters;
- crowd competence;
- right-of-way;
- personal space;
- dense scaling;
- final Feniks navigation;
- Owner-visible movement feel;
- integration into the public R0 rehearsal.

Frozen Owner-tested R0 remains:

`9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`

### Next boundary

Open **D1 repeated dynamic encounter episodes**.

Do not extend static route recovery further without new evidence.

D1 must begin from the already-qualified clean open-space control:

- hard bodies;
- no static obstacles;
- straight targets;
- NONE preserves material head-on gridlock;
- LEFT / RIGHT resolve one clean encounter.

The next question is whether local dynamic competence can re-arm across genuinely distinct body-body encounters without becoming global crowd steering.
