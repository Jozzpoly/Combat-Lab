# Combat Lab — M1 Constraint-Aware Static Locomotion Research

**Date:** 2026-09-27  
**Status:** **MECHANICALLY QUALIFIED · HEADLESS RESEARCH SURVIVOR · NOT INTEGRATED INTO R0/WORKBENCH**  
**Parent evidence:** second Owner rehearsal feedback campaign closed at evidence saturation  
**Frozen Owner-tested R0:** `9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`

## 1. Why M1 exists

The second Owner rehearsal exposed three exact clean-18 residual bodies that appeared to “die” at pillar contacts.

Exact frozen replay established that those bodies:

- still had non-zero desired motion;
- were tangent to static pillar faces;
- remained in stale ROUTE execution;
- repeatedly received zero-fraction static traversal;
- discarded viable tangential motion for the remainder of each fixed step.

An analysis-only counterfactual that preserved tangential residual movement eliminated every final residual across the physically valid 4–20 sweep.

That makes static-contact locomotion a first-class foundation problem.

M1 deliberately does **not** solve:

- route recovery;
- dynamic-body negotiation;
- crowd pressure;
- arrival semantics;
- personal space;
- soft envelopes;
- large-N scaling.

Those remain separate campaigns.

## 2. Exact current R0 behavior under test

Frozen R0 static integration currently:

1. computes proposed full-step displacement from current body velocity;
2. queries static circle traversal;
3. if clear, accepts the full displacement;
4. if blocked, advances only to just before first hit fraction;
5. removes the velocity component into the reported contact normal;
6. discards the unconsumed fraction of the fixed-step displacement.

At a tangent wall contact, if motor intent contains:

- a small inward normal component;
- a meaningful tangential component;

the next sweep can hit at fraction approximately zero.

The remaining tangential displacement is discarded again.

This produces a stable wall-stick state.

## 3. M1 research question

> **What is the smallest static-contact locomotion law that preserves hard material blocking while allowing physically valid tangential movement to survive contact?**

The target is **not** “maximize throughput”.

The candidate must preserve:

- hard radius / envelope truth;
- genuine blockage when motion is normal into geometry;
- body-size consequences;
- narrow-passage capacity;
- deterministic fixed-step behavior;
- direct desired-vs-actual causal observability.

## 4. Targeted donor recovery

Concrete donor:

`Jozzpoly/Box3d-Character-Controler`

Exact donor checkpoint inspected:

`e7a98beaca4c010e056c31db97b33c05b4610e38`

Relevant donor evidence:

- `docs/E2_3C_CONSTRAINT_VELOCITY_POLICY.md`;
- `docs/E2_3D_PRODUCTION_SPECIMEN.md`;
- `scripts/e2-3d-oblique-constraint-smoke.mjs`.

Useful transferable property:

> **constraint response should remove unsupported normal authority while preserving valid tangent authority.**

The donor also falsified overly aggressive immediate clipping:

- it removed unwanted wall-release velocity;
- but could destroy useful stair / geometric negotiation.

Useful donor falsifiers include:

- tangent release at an oblique wall;
- bounded normal travel;
- substantial tangent travel;
- partial inward intent;
- corners / multiple active planes.

### Explicit non-import boundary

Combat Lab does **not** import wholesale:

- Box3D character-controller architecture;
- 3D capsule/support semantics;
- moving-support / kinematic-relative policies;
- recovered Box3D plane-push reconstruction;
- donor production profile.

M1 uses the donor only as research evidence and falsifier inspiration.

Combat Lab must re-qualify the property locally in its own 2D circle/static-world substrate.

## 5. Candidate family to compare

### Baseline B — frozen R0 remainder discard

Current reference behavior.

Expected to reproduce tangent wall-stick.

### Candidate S1 — one-contact residual slide

After first static hit:

1. move to just before hit;
2. remove only into-normal motion;
3. preserve the remaining step fraction;
4. attempt the residual tangent displacement;
5. re-sweep that residual against static geometry.

This is the analysis-only candidate that repaired the valid 4–20 residual family.

It is **not accepted yet**.

### Candidate S2 — bounded multi-plane residual solve

If S1 fails at corners:

- continue resolving only the remaining displacement;
- accumulate a bounded set of active static normals;
- project against those constraints;
- stop after a small explicit iteration cap.

S2 must not be implemented unless corner falsifiers prove S1 insufficient.

Avoid building a general solver before the need exists.

## 6. Controlled M1 cells

### M1-A — pure head-on wall

Intent exactly normal into a wall.

Must establish:

- zero penetration;
- no invented tangent drift;
- no tunneling;
- stable hard stop;
- desired intent remains distinguishable from actual motion.

This prevents “wall slide” from becoming ghosting.

### M1-B — exact tangent travel

Body begins tangent to a wall.

Intent is exactly tangent.

Must show:

- substantial tangent displacement;
- negligible normal displacement;
- no wall separation impulse invented by the controller;
- no zero-fraction freeze.

### M1-C — tangent + small inward component

This is the direct R0 pathology isolate.

Intent has:

- meaningful tangent component;
- small inward normal component.

Compare baseline B vs S1.

Required result:

- hard normal constraint remains;
- tangent travel survives;
- no penetration;
- no unexplained acceleration.

### M1-D — oblique impact then slide

Body approaches a wall at an angle from free space.

Measure:

- time / fraction of first hit;
- pre/post normal velocity;
- tangent velocity;
- tangent displacement after impact;
- penetration / separation;
- deterministic repeatability.

This is the closest 2D analogue to the donor oblique-wall gate.

### M1-E — convex corner / two-plane contact

Body moves diagonally into an obstacle corner.

Must falsify:

- tunneling around the corner;
- ping-pong / oscillatory projection;
- infinite zero-fraction loop;
- artificial corner ejection;
- order-sensitive outcome.

If S1 fails here, only then open S2.

### M1-F — concave / corridor contact

Use a corridor whose width is close to body diameter.

Test:

- passable width remains passable;
- too-narrow width remains impossible;
- slide does not shrink hard radius;
- large and small bodies retain different capacity.

### M1-G — release / intent change

While tangent-constrained:

- tangent intent -> slide;
- neutral intent -> stop;
- away-from-wall intent -> leave immediately;
- reverse tangent intent -> reverse without sticky state.

No stale contact cache may continue to own motion after geometry/intent changes.

## 7. Dimensions and rails

M1 should independently author:

- body radius: at least current 20 / 26 / 32 plus legal extremes;
- desired speed: include current ~140 world-units/s and bounded extremes;
- incidence angle;
- wall orientation;
- wall/corner geometry;
- fixed dt reference `1/120 s`.

Do not bundle these into phenotype presets as the only control surface.

## 8. Required causal observation

For one selected body, expose at minimum:

- desired velocity;
- pre-contact physical velocity;
- proposed displacement;
- first hit fraction;
- blocker ID;
- contact normal;
- consumed displacement;
- remaining displacement;
- tangent residual;
- second hit / corner constraint if any;
- final physical displacement;
- final physical velocity.

The core diagnostic question is:

> **what did the body want, what constraint answered, and what motion remained legally available?**

Do not reduce M1 debug to a binary “blocked”.

## 9. Machine falsifiers

M1 does not PASS merely because clean 18 later improves.

It must independently falsify:

1. **hard penetration**  
   No body ends inside static geometry beyond declared epsilon.

2. **normal leak**  
   Pure head-on motion cannot crawl through or around the wall.

3. **tangent loss**  
   Valid tangent motion cannot remain frozen at fraction-zero contact.

4. **invented tangent**  
   Pure normal input cannot acquire lateral motion without geometric cause.

5. **corner tunneling**  
   Residual projection cannot pass through a convex corner.

6. **iteration pathology**  
   Corner/multi-plane resolution must remain bounded and deterministic.

7. **hard-radius erosion**  
   Sliding cannot make a body fit through a corridor narrower than its hard diameter.

8. **intent-cache stickiness**  
   Changing to neutral/away intent must immediately remove obsolete constraint behavior.

9. **extreme-speed skip**  
   Legal authored high speed must not bypass thin static geometry.

10. **hidden crowd coupling**  
    M1 must require no other actors, avoidance, passing convention or path query.

## 10. Success classification

A successful M1 candidate qualifies only:

> **constraint-aware static locomotion for one embodied circle against static geometry.**

It does not qualify:

- route execution;
- navigation;
- crowd behavior;
- dynamic-body contact;
- personal space;
- Feniks final movement feel.

Only after M1 is mechanically qualified should R1 test route execution on top of it.

## 11. Qualification result

Exact qualified checkpoint:

`f4d92076fb88f2b538b309a56deffdc51eeeda94`

CI:

`36356102263` — **SUCCESS**

Scope of evidence:

- Node experiment suite PASS;
- live Chromium Workbench regression PASS;
- frozen discard-remainder baseline reproduces tangent + inward fraction-zero wall-stick;
- S1 preserves hard normal contact while retaining valid tangent motion;
- pure head-on intent remains a hard stop with no invented tangent;
- oblique free-space impact transitions into bounded wall slide;
- deterministic repeat PASS;
- two-constraint corner PASS with first-hit + residual-hit attribution;
- obstacle-order reversal produces the same corner outcome;
- no S2/multi-plane solver was required;
- corridor capacity PASS: radius 20 traverses a 50-unit gap while radius 26 does not;
- intent reversal / neutral / away-from-wall release PASS with no sticky contact ownership;
- extreme-speed thin-wall sweep PASS;
- all three exact filmed clean-18 residual wall states reproduce baseline death and recover tangent motion under S1.

Qualified implementation remains isolated in:

- `src/research/static-locomotion.js`;
- `test/static-locomotion.test.js`.

### Bounded verdict

> **M1 PASS — one-contact residual static slide is a viable mechanically qualified candidate for one embodied circle against static geometry.**

This qualifies:

- hard normal blocking;
- preserved legal tangent motion;
- swept high-speed contact;
- bounded residual resweep;
- current-intent ownership;
- hard-radius corridor truth;
- exact reproduction/release of the filmed wall-stick mechanism.

This does **not** qualify:

- route execution;
- pathfinding;
- crowd behavior;
- dynamic-body contact;
- final Feniks movement feel;
- integration into R0.

### S2 decision

**S2 NOT OPENED.**

The required M1-E corner falsifier passed with S1.

Do not generalize this into “multi-plane constraints never need a richer solve”. It means only that the current M1 requirement does not justify additional solver complexity.

## 12. Next boundary

M1 is closed as a mechanically qualified isolated foundation.

Next research question:

> **R1 — how should a verified route be executed and recover after embodied displacement when the mover now has qualified constraint-aware static locomotion?**

R1 must use M1 as a substrate without silently turning N0b into continuous steering.

Frozen Owner-tested R0 remains unchanged:

`9fe3e7f7ecbd94636cee7d9b3cdbb9e54cab60cd`
