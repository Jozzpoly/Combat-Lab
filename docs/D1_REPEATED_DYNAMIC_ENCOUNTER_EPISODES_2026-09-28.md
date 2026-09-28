# Combat Lab — D1 Repeated Dynamic Encounter Episodes

**Date:** 2026-09-28  
**Status:** **D1-0 EPISODE BOUNDARY MECHANICALLY QUALIFIED · D1-1 SEQUENTIAL NEW-PARTNER ENCOUNTER NEXT · NO CROWD PROMOTION**  
**Parent evidence:** D0 single dynamic encounter qualified; second Owner rehearsal evidence campaign closed; M1 + R1 static-route foundations mechanically qualified  
**Frozen Owner-tested R0:** `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`

## 1. Why D1 exists

Current D0 proves a narrow but important local competence.

In clean open-space head-on counterflow:

- `NONE` preserves an honest material gridlock;
- shared LEFT resolves the encounter;
- unilateral yielding can resolve it;
- conflicting LEFT / RIGHT conventions may fail;
- the trigger waits for persistent dynamic no-progress instead of reacting on first contact.

The second Owner rehearsal then exposed the integration limit:

- dynamic encounter competence is guarded by a lifetime `encounterAttempted` / `dynamicEncounterAttempted` boolean;
- an actor may successfully negotiate one body and later become unable to negotiate another;
- high-density invalid spawn can even consume that one competence before the intended encounter;
- giving selected residual actors one extra sidestep did **not** by itself solve a multi-body all-large jam.

So D1 must not assume that “allow more sidesteps” solves crowds.

D1 asks a smaller question:

> **When has one factual body-body encounter ended strongly enough that a later obstruction should count as a genuinely new local encounter episode?**

## 2. Preserve the D0 control truth

D1 may not erase the properties that made D0 informative.

Required controls:

### NONE remains meaningful

Two equal hard bodies in exact straight head-on conflict with no passing convention must still be allowed to form a stable material gridlock.

A D1 candidate that always invents an escape direction fails.

### One clean LEFT / RIGHT encounter remains local

A single encounter must still:

- require real contact + persistent no-progress;
- use only the actor's authored local convention;
- avoid pair-level choreography;
- remain inspectable through trigger evidence.

### Conflicting conventions remain allowed to fail

D1 must not hide incompatible local decisions behind a global coordinator.

## 3. Recording-derived problem boundary

The clean recording evidence does **not** support one universal dynamic-crowd fix.

Important distinctions:

1. stale static route / wall-stick was a separate R1/M1 failure and is now isolated;
2. simple second-sidestep permission did not clear the all-large three-body terminal cluster;
3. same-stream waypoint convergence and target permutation amplify pressure;
4. contact-resistance heterogeneity strongly changes crowd behavior;
5. body-size geometry remains materially important after static-route fixes.

Therefore D1 qualifies only **episode lifecycle for local body-body negotiation**.

It does not qualify crowd throughput or multi-body deadlock resolution.

## 4. Targeted donor recovery

Concrete donor inspected:

`Jozzpoly/Companion-Brain-Lab@aab30aa3217ec660f9a61d690e0628b932186135`

Relevant donor evidence:

- `docs/OS_PREP_3_PH05_DOORWAY_COOPERATION_EVIDENCE.md`;
- `src/coordination/a1-conflict-evidence-persistence-necessity.audit.test.ts`;
- `src/coordination/a1-temporal-interaction-long-conflict.audit.test.ts`.

Useful transferable invariants:

1. physical conflict truth and semantic/comfort truth are separate;
2. one factual conflict lifecycle can often be read statelessly as approach -> physical conflict -> physical clear;
3. physical clear is not automatically comfort clear;
4. temporary separation can be valid and later ordinary movement can resume without a special global coordinator;
5. stale semantic intent must not be silently promoted merely because physical conflict persists.

### Explicit non-import boundary

Combat Lab D1 does **not** import:

- player/companion priority;
- comfort envelopes;
- right-of-way dossiers;
- relationship semantics;
- predicted closest-approach avoidance;
- donor thresholds or architecture.

The only local lesson is:

> **do not call a new encounter merely because a contact flag flickered; require factual separation and healthy resumed progress.**

D1 deliberately stays on hard-body contact truth. Personal-space / comfort remains a later research horizon.

## 5. D1-0 — encounter episode boundary audit

D1-0 has **no sidestep authority**.

It observes one actor after an encounter decision has already been consumed.

Inputs:

- current time;
- actual body position;
- current goal distance;
- current hard-contact partner IDs;
- triggering partner ID / episode provenance.

Question:

> **Has the previous dynamic encounter ended strongly enough to re-arm one future encounter?**

Candidate lifecycle:

### `EPISODE_ACTIVE`

Any hard dynamic contact is still present.

- no re-arm;
- clear/progress window resets;
- partner set remains factual evidence.

### `CLEAR_BUILDING`

No hard dynamic contacts are present, but the healthy separation/progress window is not yet proved.

### `HEALTH_NOT_PROVEN`

Contact stayed clear long enough, but:

- body did not travel materially; or
- goal distance did not improve materially.

No re-arm.

### `REARMED`

For one continuous bounded window:

- no hard dynamic contacts;
- body materially moved;
- goal distance materially decreased.

Only then may a later persistent-contact no-progress event become a new episode.

## 6. D1-0 falsifiers

### D1-0A — continuous same contact

After one consumed encounter, bodies remain in contact.

Expected:

- never re-arm;
- no periodic “sidestep every timeout”.

### D1-0B — one-frame / brief contact gap

Contact disappears only briefly, then returns.

Expected:

- healthy window resets;
- same encounter episode continues.

This protects against solver/contact-edge chatter.

### D1-0C — lateral clear motion without goal progress

Body separates and moves laterally but does not reduce goal distance materially.

Expected:

- no re-arm.

This prevents the sidestep itself from automatically authorizing another sidestep.

### D1-0D — metric improvement without body motion

Synthetic / upstream metric changes cannot manufacture a new encounter episode.

### D1-0E — true pass and resumed progress

Contact clears; body travels materially; goal distance falls materially for the whole window.

Expected:

- exactly one `REARMED` state.

### D1-0F — broad threshold region

Test more than one reasonable progress epsilon / clear window.

Do not tune one magic value to the first fixture.

## 7. D1-1 — sequential new-partner encounter cell

Only after D1-0 qualifies.

Use a clean open world with straight targets and hard bodies.

Candidate three-body story:

- A travels right;
- B and C travel left at the same speed, spatially separated;
- B and C do not interact with each other;
- A first encounters B;
- after true separation + progress, A later encounters C.

Compare:

### Lifetime baseline

A retains D0 one-shot semantics.

Expected:

- first encounter may resolve;
- second encounter exposes the missing competence.

### D1 episodic candidate

A re-arms only after D1-0 healthy separation/progress evidence.

Required:

- A may trigger a second local encounter with C;
- no global planner;
- no pre-contact avoidance;
- one unresolved contact cannot spam encounter decisions.

## 8. D1-2 — same-partner second encounter

Only after new-partner sequence is qualified.

Controlled stimulus may deliberately reverse/recycle objectives **after full episode re-arm** so the same two bodies meet again.

Required distinction:

> same partner identity does not make it the same encounter forever; unresolved continuous conflict does not become a new encounter merely because time passed.

## 9. Multi-body cluster boundary

D1 does not yet promise that sequential two-body episode semantics solve simultaneous three-body congestion.

A later controlled cell may test:

- actor still in contact with old partner while a new partner also arrives;
- partner handoff without a fully contact-clear interval;
- multiple simultaneous blockers.

Default D1-0 is intentionally conservative:

> **no zero-contact healthy window -> no re-arm.**

If dense-crowd evidence later proves this too restrictive, open a separate multi-partner episode question rather than weakening D1-0 implicitly.

## 10. Required causal observation

Per actor expose:

- episode ID;
- episode trigger time;
- trigger partner ID;
- partners currently in hard contact;
- all partner IDs seen during the current episode;
- contact-clear duration;
- body travel in the healthy window;
- goal-distance improvement in the healthy window;
- re-arm status / reason;
- encounter count;
- cumulative episode count;
- last passing-side decision.

Core question:

> **who blocked me, is that encounter factually over, did I really resume my purpose, and why am I allowed to negotiate again?**

## 11. Machine falsifiers

D1 must falsify:

1. **timeout spam** — continuous contact cannot retrigger periodically;
2. **contact-flicker re-arm** — short contact gaps cannot create new episodes;
3. **sidestep-is-progress alias** — lateral escape alone cannot re-arm;
4. **metric-only re-arm** — body must actually move;
5. **lifetime paralysis** — real pass + resumed progress must permit a later encounter;
6. **hidden avoidance** — no pre-contact steering authority is added;
7. **global choreography** — pair/world coordinator cannot select a shared passing side;
8. **NONE erosion** — no-convention head-on gridlock remains possible;
9. **conflict erasure** — incompatible conventions remain allowed to fail;
10. **partner-provenance loss** — episode history must identify triggering/current partners;
11. **contact-law mutation** — D1 cannot soften/ghost hard bodies;
12. **R1 leakage** — static route recovery is not used to explain a pure open-space dynamic encounter.

## 12. Success boundary

A successful D1 qualifies only:

> **re-armable local dynamic encounter episodes for hard bodies after factual separation and healthy resumed goal progress.**

It does not qualify:

- personal space;
- anticipatory avoidance;
- multi-body crowd intelligence;
- dense scaling;
- global lane formation;
- right-of-way;
- final Feniks locomotion/combat behavior;
- integration into public R0.

## 13. Immediate next action

Implement **D1-0 episode-boundary monitor first**.

It should be a pure research module with no sidestep/contact-solving authority.

Only after D1-0 passes should D1-1 receive repeated encounter execution authority.


## 14. D1-0 qualification result

Exact qualified checkpoint:

`ae0a9f3fbfe6894aacd77ebd1250bd3797713866`

CI:

`36455674093` — **SUCCESS**

Evidence:

- **172 / 172** Node tests PASS;
- live Chromium Workbench regression PASS;
- D1-0 monitor owns no sidestep, contact-solver or static-route authority;
- continuous hard contact never re-arms merely because time passed;
- prior SIDESTEP must end before clear/progress evidence can accumulate;
- brief contact gaps reset and cannot split one unresolved encounter;
- lateral body travel without goal improvement cannot re-arm;
- goal-distance improvement without body travel cannot re-arm;
- sustained clean progress passes across a broad region of clear-window/progress thresholds;
- the exact qualified D0 LEFT pass produces valid D1-0 re-arm evidence only after SIDESTEP ends.

### Falsification history

Initial D1-0 checkpoint `9766ada...` produced one red synthetic positive-control cell.

The monitor itself was not changed.

The test requested `progressEpsilon=16` inside a `0.2 s` window while its synthetic actor moved only `72 u/s`, making at most `14.4` units of progress physically available in the entire required window.

The positive-control stimulus was corrected to `120 u/s`, still below the D0 body's `140 u/s` authored speed, so every tested threshold/window pair is physically satisfiable.

Post-correction all D1-0 cells pass.

Bounded verdict:

> **D1-0 PASS — one consumed hard-body encounter may be considered factually over only after the prior action has ended, hard contact remains continuously clear, the body travels materially, and goal distance improves materially for a bounded window.**

This qualifies only the episode boundary.

It does not grant another sidestep.

## 15. D1-1 immediate boundary

Open the sequential new-partner cell.

The same physical three-body stimulus must compare:

1. **lifetime one-shot baseline** — A can negotiate only its first encounter;
2. **episodic candidate** — A receives a new encounter opportunity only after D1-0 re-arms.

Required causal proof:

- A's first trigger names B;
- D1-0 proves the first episode ended;
- later A enters a factual persistent contact/no-progress episode with C;
- baseline cannot consume a second encounter;
- episodic candidate triggers exactly one second local encounter;
- B and C never require pair-level choreography or a global side choice;
- no pre-contact steering is introduced;
- one unresolved contact still cannot spam sidesteps.

Do not claim crowd intelligence if D1-1 passes.


## 16. D1-1 first stimulus falsification and challenge redesign

Initial D1-1 checkpoint:

`c987d1a6ff9d83fd058f95c4f9f56fe08ae9531c`

CI:

`36456317521` — **FAIL**

Result:

- 174 / 178 Node tests PASS;
- four D1-1 assertions FAIL;
- baseline lifetime A unexpectedly reaches its target;
- episodic A also records only one encounter;
- C never appears in A's contact-partner evidence in the default sequential world.

The failure is **not** evidence against D1-0 episodic re-arm.

The initial stimulus assumed that two left-travelling passive bodies placed farther along the same original Y lane would automatically create two sequential head-on encounters.

That assumption is false under the existing D0 motion.

After A resolves B with a sidestep:

- A retains substantial lateral displacement;
- ordinary DIRECT movement only gradually converges back toward its target line;
- C travelling on the original `y=350` line can pass without hard contact;
- baseline and episodic candidate therefore never face a factual second encounter.

This is valuable movement evidence:

> **a successful local sidestep changes later encounter geometry; “put another body farther down the old lane” is not a valid repeated-encounter stimulus.**

### D1-1 challenge redesign

Active candidate checkpoint:

`6ee3f03ffe0b1067fe2a609ea91621f96b9d5936`

C is now an explicit **research challenge**, not an assumed natural crossing.

Rules:

1. C begins dormant and exerts no movement/steering authority.
2. Both lifetime and episodic variants observe the same D1-0 boundary after B.
3. Only when D1-0 proves the first encounter factually complete is C released.
4. C is placed without overlap a fixed distance ahead of A and on A's **actual current body Y**, then travels directly against A.
5. Release time, A position, C position and gap are preserved as experiment provenance.
6. Lifetime baseline and episodic candidate receive the **same release event**.
7. The only intended causal difference is whether A is allowed to consume another encounter decision after D1-0 re-arm.

This is a harness intervention, not agent behavior.

It must not be promoted into runtime spawning, prediction or choreography.

Promotion criterion remains:

- lifetime baseline resolves B once but stalls on released C;
- episodic candidate records trigger partners exactly `B -> C` and completes;
- no-convention first encounter remains a stable material gridlock and never releases C.
