# Combat Lab — Active Embodied Spatial Ecology Hypothesis Card

**Date:** 2026-09-26  
**Status:** candidate next discovery organism; hypothesis/apparatus design only  
**Owner correction incorporated:** population pressure must be directly scalable up to crowd/horde/breaking regimes; a readable baseline is not a paternalistic cap  
**Implementation authority:** not yet — this card must survive final apparatus review before code

## 0. Research question

> **When materially different bodies pursue simple independent movement intents inside a varied traversable world, do envelope, inertia/load and locomotor authority change what the Owner naturally chooses to do — and how does that relation change as population pressure scales from sparse encounters into crowd/horde regimes?**

This is the next question created by S0/B0 evidence.

It is not a test of:

- final NPC intelligence;
- final Feniks pathfinding;
- crowd simulation quality;
- combat damage;
- final physics;
- whether one phenotype is globally “best”.

## 1. Owner-facing phenomenon

The specimen should make it possible to discover relations such as:

- “I yield to this body but push through those”;
- “this route is still physically open, but this population makes it costly”;
- “open space lets this phenotype express itself differently from clutter”;
- “one large body and many small bodies produce different pressure even when total mass is similar”;
- “this body can occupy / clear / congest space in a way I react to”;
- “at higher density the whole situation changes regime rather than merely adding more contacts”.

The experiment must not tell the Owner which of those interpretations to look for.

## 2. Core apparatus principle — bounded baseline, unbounded curiosity

The experiment has a **small, readable, reproducible default population** so an ordinary run is interpretable.

That default is not the allowed range.

The Owner must be able to deliberately escalate population pressure during live play.

Minimum direct controls:

- **Spawn +1**
- **Spawn +5**
- **Spawn +10**
- **Clear extras**
- normal **Reset World** returns the deterministic baseline

Repeated use of the spawn controls is expected and supported.

Do not silently clamp population to the “scientifically convenient” range.

If a true technical safety rail is required, it must be:

- broad;
- explicit;
- truthfully displayed as a real safety rail;
- justified by crash / browser-stability risk rather than by a desire to protect the experiment’s intended answer.

A performance-warning state may diagnose degradation; it must not masquerade as a gameplay prohibition.

## 3. Population pressure is a research dimension

Do not predefine “horde” as bad apparatus.

Population scaling can expose qualitatively different regimes:

### Sparse

Mostly pairwise encounters.

Useful for:

- attribution;
- push/yield readability;
- individual phenotype discrimination.

### Multi-body

Several simultaneous local relations.

Useful for:

- crossing flow;
- screening;
- congestion;
- route negotiation;
- whether pairwise body properties still matter when contacts overlap.

### Dense / crowd

Local pressure becomes persistent.

Potential findings:

- jams;
- route closure without a hidden wall;
- flow around large occupied envelopes;
- repeated displacement;
- whether many light bodies can collectively matter;
- whether high locomotor authority causes useful clearing or merely solver noise.

### Horde / break regime

The Owner intentionally pushes beyond the comfortable research range.

This is legitimate discovery.

Potential outcomes include:

- emergent collective behavior;
- new stable/unstable crowd regimes;
- physics failure;
- pathfinding failure;
- visual unreadability;
- simulation-time collapse;
- browser performance limits.

Those are all evidence if classified honestly.

The apparatus should help distinguish:

> **world/actor phenomenon**

from:

> **solver / navigation / runtime breakdown**.

## 4. Direct manipulation contract

The Owner should not need chat-side instructions to stress population.

Population controls belong next to the experiment, not hidden in Debug.

The current Workbench numeric-parameter model is not sufficient by itself for momentary commands such as “spawn more”.

Do **not** prematurely build a giant generic command framework.

Preferred first implementation seam:

- allow an experiment to expose a small set of neutral **action controls**;
- Workbench renders them as ordinary buttons;
- actions remain experiment-owned;
- shared core knows only that an action was invoked, not what “spawn” means.

If future unrelated experiments also need buttons such as:

- spawn;
- perturb;
- drop;
- trigger;
- clear;

then the neutral action-control seam has earned broader reuse.

## 5. Reproducibility while allowing destruction

Permissive breaking and reproducible science are compatible.

Baseline:

- deterministic initial world;
- deterministic base residents;
- deterministic initial phenotypes;
- deterministic initial goals / movement intents.

Live spawning:

- every spawned entity receives a deterministic spawn serial;
- given the same base seed + action sequence, the population expansion should be reproducible where practical;
- spawn placement should prefer physically legal seeded locations;
- failed legal placement attempts must be reported, not silently fabricate a different research state.

Do not delete existing bodies automatically to “make room”.

If density becomes impossible, that itself is a valid state to observe.

## 6. World contract

The world should be larger than the S0/B0 all-visible rectangle.

Current S0/B0 rendering fits the whole authored world into the viewport. Simply multiplying world dimensions would shrink the phenomenon rather than create traversal.

First specimen therefore needs an **experiment-owned camera/view transform**.

Keep it minimal:

- player-following center with bounded world edges;
- no cinematic system;
- no shared-core camera authority yet.

Spatial content should contain several relations in one continuous world:

- open region;
- clutter / islands;
- constrained passage(s);
- alternative route/bypass;
- at least one area where population itself can turn an otherwise open relation into local congestion.

No single choke may explain the whole result.

## 7. Actor / phenotype contract

The player and residents remain simple material bodies initially.

Underlying research dimensions carried forward from B0:

- envelope;
- intrinsic/body mass;
- carried load where relevant;
- locomotor authority.

At least several resident configurations should be materially distinct.

At least one should be deliberately non-correlated / awkward.

No labels such as:

- tank;
- rogue;
- brute;
- scout.

The Owner reads bodies through behavior and world relation.

### Optional correlated scaling

The new Owner request for size-linked phenotype scaling is valid but remains an authoring layer.

Do not hardwire it into actor truth.

A later linkage control may deliberately map one source dimension to selected dependents while leaving the raw dimensions editable.

Population authoring may be the first place where this becomes materially useful, because hand-editing many coherent phenotype values could become genuine friction.

Implement linkage only when that friction is observed or when it is necessary for a specific comparison.

## 8. Resident intent contract

Residents are active, not passive drifters.

But they do not need combat cognition.

Initial intent should be weak, legible and non-prescriptive.

Candidate:

- deterministic destination / waypoint-seeking;
- destinations chosen from world regions;
- periodic goal replacement after arrival;
- no knowledge of the “correct” route for its phenotype;
- no policy such as “large holds choke” or “small uses gap”.

Resident movement must generate pressure **incidentally**.

The apparatus fails if resident policy authors the phenomenon being claimed.

## 9. Physics / contact boundary

Current B0 pair collision is a qualitative research solver.

It performs pairwise body checks and simple overlap/impulse resolution.

This is useful precisely because mass is independently authorable.

It is not automatically sufficient for dense crowd/horde pressure.

### Important scaling consequence

With `N` dynamic bodies, the current naïve all-pairs phase performs approximately:

> `N × (N - 1) / 2`

pair checks per simulation step.

Population pressure may therefore discover a performance boundary before it discovers a useful crowd regime.

Do not hide that boundary with a tiny population cap.

Instead:

1. instrument entity count and simulation health;
2. intentionally climb the pressure ladder;
3. identify whether the first failure is:
   - computational;
   - collision-quality;
   - visual/readability;
   - navigation;
   - actual interesting crowd behavior;
4. only optimize the limiting substrate if doing so unlocks materially more research value.

A spatial broad phase / physics backend becomes justified when O(N²) cost prevents reaching the pressure regime we actually want to observe.

## 10. Minimal observability

Normal Owner play should remain visually clean.

Debug / diagnostics may expose:

- live entity count;
- recent contact count / contact rate;
- simulation step health / backlog;
- frame-rate or frame-time stress indication;
- optional resident goal markers;
- optional trails;
- selected actor phenotype values.

Do not turn normal play into a performance dashboard.

A simple diagnostic state such as `SIM STRESS` is preferable to silently reducing population.

## 11. Human discriminator

Within an ordinary baseline run, without reading telemetry or role labels:

> **the Owner should naturally begin treating different bodies and spaces differently because of their material behavior.**

Then population escalation should answer a second question:

> **does increased body pressure reveal new spatial behavior/regimes, or only add noise and technical failure?**

The experiment is valuable even if the second answer is negative, provided the failure boundary is understood.

## 12. Hard falsifiers

Stop / refound before adding combat mechanics if:

- baseline remains B0 with autonomous decorations;
- resident policy determines the intended route/role;
- the same player behavior remains dominant across materially different phenotypes and spatial regions;
- higher population only increases random jitter;
- crowd pressure is interesting only after labels explain what to notice;
- navigation sophistication becomes the primary phenomenon;
- technical scaling fails so early that multi-body pressure cannot be observed at useful density;
- the camera makes embodiment harder to read;
- collision artifacts dominate push/yield decisions;
- the only way to create significance is to add damage/HP.

## 13. Targeted donor reconnaissance — 2026-09-26

A narrow scout was performed because horde pressure makes movement/navigation scaling materially relevant.

### Companion-Brain-Lab — useful bounded donor

Concrete useful material exists:

- `src/navigation/static-body-geometry.ts`
  - explicit physical circle occupancy against static world geometry;
- `src/navigation/static-router.ts`
  - hard-body connectivity separated from desired/comfort clearance;
  - explicit egress semantics from initially overlapping/clearance-violating starts;
  - deterministic static route planning;
- `src/brain/spatial-locomotion.ts`
  - inspectable local candidate movement;
  - static traversal queries;
  - route lookahead;
  - explicit motion-state/reason evidence;
- `src/physics/rapier-physical-world.ts`
  - Rapier 2D deterministic-compatible physical world;
  - static occupancy/traversal queries;
  - physical snapshots/contact records;
  - a clean World-vs-brain authority seam.

Important boundaries:

- Companion’s spatial locomotion is currently one-companion / one-player specific;
- its own qualification explicitly says **no ORCA/RVO or multi-companion avoidance yet**;
- its actor physics uses assumptions that are not automatically compatible with B0’s independently authored envelope/mass/locomotor authority;
- therefore it is **not a ready-made crowd system**.

Potential donor use if needed:

> static navigation/query semantics and possibly physical-world infrastructure, transplanted narrowly and requalified — not Companion behavior architecture.

### ReflexBrain-Lab — no movement donor currently

Current `main` contains only the semantic-reflex bootstrap README.

Its defended scope explicitly excludes motor-controller authority.

No current multi-body navigation donor was found.

### SPC / Llm-Live-NPC — no current movement donor in repository

Current GitHub state is an early LLM transport/playable-world foundation.

It establishes world-authority boundaries but does not currently contain the mature movement/pathfinding substrate needed here.

Therefore do not claim SPC provides a ready navigation implementation based on its project concept alone.

### Feniks

There is no single obvious current Feniks GitHub repository to treat as code authority.

A later Feniks donor review may need to recover specific implementation sources from the relevant historical/project repos rather than assume one canonical `Feniks` repo exists.

## 14. Donor trigger rule for this specimen

Do not import Companion navigation pre-emptively.

Start the specimen with the minimum movement intent that can answer the hypothesis.

Trigger targeted donor recovery when one of these becomes materially blocking:

- residents repeatedly fail on ordinary static geometry for reasons unrelated to the research question;
- legal egress / hard-vs-comfort clearance becomes necessary;
- simple destination movement requires route topology to create a believable pressure field;
- O(N²) collision or current solver quality prevents reaching a useful population regime;
- a known donor can clearly replace new bespoke infrastructure with less semantic contamination.

## 15. Final apparatus review

The permissive-population correction exposed three additional seams that must be explicit before implementation.

### 15.1 Spawned phenotype must be Owner-authored

A population control that only spawns an agent-authored preset would still constrain discovery.

The first specimen should therefore distinguish:

- **player phenotype** — editable B0-like dimensions;
- **spawn-template phenotype** — editable envelope / body mass / load / locomotor authority used by subsequent Spawn actions;
- **existing residents** — retain the authored phenotype they were created with.

Minimum loop:

1. edit the spawn-template dimensions;
2. click Spawn +1 / +5 / +10;
3. edit the template again;
4. spawn a different phenotype into the same live world.

This allows:

- homogeneous hordes;
- mixed hordes;
- correlated-looking populations;
- deliberately absurd non-correlated populations;
- “one giant among many tiny bodies” and the inverse.

Do not force a predefined mix.

A deterministic baseline may still contain several distinct residents for immediate legibility.

### 15.2 Count alone is not pressure

Entity count is useful but insufficient.

A world containing 50 tiny bodies and one containing 50 huge bodies do not express the same spatial load.

Optional diagnostics should therefore distinguish at least:

- total active body count;
- nominal occupied-body area / world-area ratio (diagnostic approximation, not physics authority);
- recent body-body contact rate;
- recent static-contact rate.

Do not turn these into goals or optimization scores.

They exist to help explain why a state changed regime.

### 15.3 Fixed-step overload must be truthful

The current shared `FixedStepRunner` intentionally clamps frame delta and accumulated simulation debt.

That keeps the browser stable, but under heavy population load it can make simulation time advance more slowly than wall time.

Without instrumentation, a technical slowdown could be mistaken for a crowd-behavior finding.

The first horde-capable specimen therefore needs narrow neutral runtime diagnostics:

- cumulative wall time discarded/clamped by fixed-step protection;
- recent simulation-time / wall-time ratio or equivalent lag indicator;
- number of simulation steps executed per rendered frame where useful.

The implementation should preserve the existing safety behavior.

It should **expose the loss of real-time fidelity**, not remove the guard and risk spiral-of-death behavior.

A visible `SIM STRESS` diagnostic may appear when the runtime is no longer approximately real-time.

It must not automatically despawn bodies or lower research parameters.

### 15.4 Camera must not erase extremes

A larger world needs an experiment-owned camera.

Automatic zoom-to-fit based on actor size would be dangerous because it could visually normalize away the very scale differences under study.

Preferred first contract:

- camera follows player position;
- default zoom is fixed;
- manual zoom is allowed over a broad range;
- changing body envelope does not silently change camera zoom;
- world bounds constrain camera translation where useful.

Camera zoom is apparatus state, not actor semantics.

### 15.5 Spawn placement

Ordinary spawn actions should attempt deterministic physically legal placement from one or more neutral entry regions.

Do not silently:

- delete existing residents;
- shrink the spawned body;
- change its mass/force;
- move obstacles;
- swap to a different phenotype.

If ordinary legal placement fails because the world/entry region is saturated, report the failure truthfully.

Do not treat that as a reason for a low global population cap.

A later explicit overlap/break-spawn control may be added if legal-placement saturation itself blocks useful destructive testing, but it is not required before the first Owner specimen.

## 16. Promotion decision

After the final apparatus review, this hypothesis is sufficiently bounded to open an implementation lane.

Promotion is narrow:

> **READY FOR IMPLEMENTATION AS THE NEXT REVERSIBLE DISCOVERY SPECIMEN**

This does not promote:

- active spatial ecology to Feniks architecture;
- the current B0 physics to production physics;
- Companion navigation to Combat Lab authority;
- any population size as canonical;
- any crowd algorithm;
- any combat mechanics.

The implementation target is the smallest specimen that can expose:

1. a larger continuous world;
2. active resident movement;
3. independently authored player and spawned resident phenotypes;
4. permissive live population escalation;
5. truthful runtime/pressure diagnostics;
6. an early raw Owner observation.

## 17. Candidate promotion boundary

Final design review completed on 2026-09-26. The implementation lane may now open provided the implementation remains within the bounded contract above. It must preserve:

- population escalation is permissive;
- horde/break mode is supported rather than prohibited;
- baseline remains interpretable;
- camera/world expansion does not become the research object;
- resident intent does not encode the answer;
- the first implementation can stay small enough for early Owner play.

## 18. Working invariant

> **Give the Owner a clean baseline, then let him increase pressure until the phenomenon, the solver or the runtime breaks — and treat the location and nature of that break as evidence.**
