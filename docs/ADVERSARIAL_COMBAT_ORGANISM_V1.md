# Adversarial Combat Organism v1

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> This file preserves the campaign state at its date. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Status:** active hypothesis design  
**Owner play:** not eligible  
**Predecessor:** Whole Combat Organisms v0 — O1/O2 both falsified agent-side

## 0. Why this lane exists

O1 HOLD/BREAK and O2 REACH/THREAT failed for different local reasons, but both relied on the same generic cheap-pressure abstraction.

That abstraction was useful for:

- geometry stress;
- contact tests;
- commitment timing;
- deterministic regression;
- obvious exploit detection.

It was not rich enough to be the opponent substrate for discovering combat worth mastering.

The active correction is:

> **the adversary is part of the combat organism.**

The next specimen should not ask whether one player mechanic works against interchangeable pressure.

It should ask whether the player naturally reads and treats materially different adversaries differently because their body, movement, commitment and occupied space create different problems.

---

## 1. Core hypothesis

> **A small fight becomes more readable, replayable and spatially meaningful when opponents expose materially different commitments through shared physical/gameplay laws, rather than behaving as generic pursuit bodies with different constants.**

This is still a discovery hypothesis, not Feniks architecture.

---

## 2. Player action

Keep the player surface deliberately low burden:

- responsive WASD locomotion;
- mouse desired facing;
- one compact, single-solid-contact strike;
- no target lock;
- no dodge / i-frames;
- no stamina;
- no parry minigame;
- movement remains live during strike.

The player attack exists only to let adversary/world relations become consequential.

If this lane needs a large player action vocabulary to become interesting, record that dependency rather than adding buttons automatically.

---

## 3. Shared adversary contract

The first adversaries use one common state language:

- **seek** — establish useful approach;
- **prepare** — readable commitment tell;
- **commit** — bounded attack/body motion;
- **recover** — genuine vulnerability / reposition window.

The implementation should be data-driven.

Do not write product logic such as:

```text
if enemy == STRIKER
if enemy == CRUSHER
```

Temporary extreme presets are allowed as discovery anchors.

Their identity should arise from shared parameters such as:

- radius / body envelope;
- mass;
- acceleration / max speed;
- turn authority;
- contact response;
- attack reach / width;
- windup;
- commit velocity / duration;
- recovery;
- displacement consequence.

Later continuity checks can interpolate these properties.

---

## 4. Anchor adversary A — LIGHT STRIKER

Research body/equipment relation:

- small / light body;
- high acceleration and turn authority;
- low contact resistance;
- short attack reach;
- quick readable commit;
- meaningful overshoot / recovery after a missed commit;
- no high HP compensation.

Expected player-facing question:

> **Can I make the fast body overcommit, then punish the actual recovery rather than chase it continuously?**

Desired natural responses may include:

- intercept rather than chase;
- angle out of the commit;
- let terrain/body obstruction waste its line;
- punish recovery;
- avoid getting pinned into repeated face-hug contact.

Primary falsifiers:

- success is just circling an AI that cannot track;
- light identity is only higher move speed;
- the player wins by permanent chase;
- the recovery window exists only in telemetry, not spatially;
- low mass creates slippery pinball noise.

---

## 5. Anchor adversary B — HEAVY CRUSHER

Research body/equipment relation:

- larger body envelope;
- high mass / contact resistance;
- lower acceleration and turning;
- broad, slower, high-consequence commit;
- poor pursuit of a freely retreating player;
- no HP-sponging as the source of identity.

Expected player-facing question:

> **Can I avoid contesting the heavy body frontally and instead exploit its commitment, turning cost and occupied space?**

Desired natural responses may include:

- leave the broad threat geometry;
- attack after a committed miss;
- rotate around obstruction;
- use its body as temporary cover / blocker;
- avoid being trapped between heavy body and world.

Primary falsifiers:

- crusher = normal enemy with more HP;
- heavy identity is only slower movement;
- player can face-tank and mash;
- huge body becomes sticky collision frustration;
- broad attack is merely an oversized invisible cone.

---

## 5.1 A1 v0 result — PARAMETER-ONLY ADVERSARY ANCHORS FAIL

The first light/heavy anchors used the same realized attack mechanism and differed only through body and attack constants.

After removing two apparatus confounders:

- the initial Broken Yard direct route was blocked by the short wall;
- the first phase-reader controller contained a fixed distance that accidentally matched the heavy trigger better than the light trigger;

the anchors were rehearsed in a clean open field.

Result:

- chase + mash clears both;
- retreat + strike clears both;
- orbit + strike clears both;
- stand + mash clears both;
- phase-aware play clears both.

There are timing / HP differences, but no robust motor-strategy divergence.

Therefore:

> **A1 v0 fails the adversary-identity discriminator. Different constants did not create different combat questions.**

Do not rescue this by:

- increasing HP;
- increasing damage;
- making one anchor arbitrarily faster/slower;
- adding more enemies;
- tuning policy thresholds until one matrix cell flips.

### Correction

Shared laws do **not** require every adversary to realize the same attack geometry.

A stronger adversary-first hypothesis may share:

- seek / prepare / commit / recover lifecycle;
- body/world truth;
- same-step consequence discipline;
- common collision/contact rules;

while allowing **equipment/action realization** to differ qualitatively.

Next A1 attempt should compare at least:

- a narrow dash-line commitment with real overshoot;
- a broad slower sweep / space-denial commitment.

This is not a hidden enemy-class branch if the behavior is selected by an explicit action/equipment model that any compatible body could use.

The discriminator remains unchanged:

> **does ordinary player strategy change because the opponent creates a different spatial problem?**

Do not proceed to the pair organism until this survives.

---

## 5.2 A1 v1 result — QUALITATIVE ACTION GEOMETRY CREATES FIRST STRATEGY CROSSOVER

A1 was refounded so adversary identity was not only a row of constants.

Both anchors still use the shared lifecycle:

- seek;
- prepare;
- commit;
- recover.

But action/equipment realization now differs:

- light anchor: **dash-line** with locked commitment and meaningful carry into recovery;
- heavy anchor: **sweep-arc** with slow body advance and a real rotating threat segment.

The action model is independent from body identity in code. A light body can be instantiated with sweep equipment and a heavy body with dash equipment.

### Open-field crossover

With the same player and same simple strike:

**Light dash-line**

- orbit-strike: CLEAR, **100 HP**;
- backstep-reader: CLEAR, **66 HP**.

**Heavy sweep-arc**

- orbit-strike: **DOWN**;
- backstep-reader: CLEAR, **100 HP**.

This is the first A1 result where the motor strategy itself crosses over qualitatively.

### Reaction-delay red-team

Heavy backstep was then delayed after visible prepare:

- immediate: CLEAR, 100 HP;
- 80 ms delay: CLEAR, 100 HP;
- 160 ms delay: CLEAR, 100 HP;
- 240 ms delay: CLEAR, 50 HP.

The clean response therefore does not require zero-latency internal-state access.

Evidence boundary:

> This qualifies **mechanical / temporal possibility**, not human readability.

The automated policy still reads the internal phase. A future browser specimen must make prepare / commit legible through normal motion and presentation before any Owner claim.

### A1 status

> **A1 v1 passes the agent-side strategy-divergence gate.**

It does **not** qualify gameplay, fun, mastery or Owner readiness.

Proceed to A2 pair interaction first in open space. Do not use terrain to manufacture pair value.

---

## 6. Pair phenomenon

The first product-level reason to put both in one fight is not "more enemies".

The pair should create a new question:

> **Can the player use opponent identity and body placement to simplify pressure — instead of fighting two independent health bars?**

Potential legal possibilities:

- make the striker approach through / around the crusher;
- rotate so the crusher obstructs the striker;
- punish the striker after it overcommits while avoiding crusher frontal space;
- use open space for one relation and obstruction for the other;
- temporarily yield ground to change which opponent is dangerous first.

No explicit formation script should encode the correct answer.

Friendly body collision may exist because bodies occupy space, but the pair must not become interesting only because AI pathing gets stuck.

---

## 6.1 A2 open-pair result — FAIL AS INTERACTING PAIR

The first A2 pair used the qualified A1 dash-line light anchor and sweep-arc heavy anchor together in a completely open field.

No coordination, terrain or formation logic was added.

### Simple-policy result

The mixed pair remained clearable by every tested simple policy:

- nearest-mash: CLEAR, 16 HP;
- retreat-all: CLEAR, 16 HP, with substantial boundary reliance;
- orbit-nearest: CLEAR, 50 HP;
- focus-light: CLEAR, 16 HP;
- focus-heavy: CLEAR, 16 HP;
- phase-aware pair-reader: CLEAR, 66 HP.

Focus order barely changed the cost.

### Same-type comparison

The mixed pair sat between same-type extremes:

- light + light was broadly easier;
- heavy + heavy killed the simple policies;
- light + heavy produced intermediate pressure.

This is useful difficulty evidence, but not evidence that the mixed pair creates a qualitatively new combat relation.

### Peer-contact ablation

The stronger falsifier removed adversary↔adversary body collision.

Results:

- nearest-mash was exactly unchanged;
- pair-reader was exactly unchanged;
- orbit timing changed somewhat, but result and player HP remained the same.

The pair-reader generated **zero adversary↔adversary body-contact frames** even with physical peer collision enabled.

Therefore:

> **A2-open currently behaves like two independent commitments / health bars, not an interacting combat organism.**

Do not add terrain merely to manufacture pair value.

### Structural confound discovered after the ablation

A deeper authority audit found that adversary attack geometry is currently special-cased to the player:

> a dash-line / sweep-arc can hit the player, but cannot hit another adversary occupying the same material geometry.

That means the simulator asks the player to exploit opponent placement while the action resolver forbids the opponents' actions from materially interacting.

This is a stronger confound than lethality tuning.

### A2b material-action falsifier

Before changing HP, damage, arena or AI:

- remove player-only target authority from adversary commits;
- each committed action may resolve against the **first solid body** on its actual threat geometry;
- player and adversary bodies use the same geometric hit query;
- one commit still consumes at most one solid target;
- no AI gains knowledge of friendly-fire lines;
- no coordination / avoidance is scripted.

Then compare:

- current player-only authority;
- material all-body authority.

Primary falsifiers:

- nothing changes because the actions still never interact;
- friendly fire becomes random noise / free kills rather than readable positional consequence;
- the player can trivially kite enemies into deleting each other every time;
- pair value exists only under a hand-authored crossing start.

Only if A2b creates a robust, nontrivial relation should terrain re-enter.

---

## 6.2 A2b result — MATERIAL BODY SCREEN EXISTS, DISCOVERABILITY STILL UNPROVEN

A2b removed player-only authority from adversary commits.

Committed dash/sweep geometry can resolve against the **first solid body**, whether that body is the player or another adversary.

No AI receives friendly-fire awareness or avoidance.

### Direct mechanism evidence

A controlled heavy-sweep cell proved actual interception:

- without peer authority, the committed sweep hits the player for 50;
- with all-body authority, a light body standing in front takes the same commit and the player remains unharmed.

The spatial tolerance is bounded rather than pixel-perfect:

- blocker lateral offset 0 / 8 / 16 / 24 px: interception succeeds;
- 32 / 40 px: blocker no longer intersects and the player receives the hit.

This is mechanism evidence, not pair-organism evidence.

### Friendly damage ablation

Peer interception was then separated from friendly-fire damage.

With **friendly damage scaled to zero**, a peer body still consumes the committed attack.

This matters because it separates two hypotheses:

- "enemies kill each other for free";
- "another material body can genuinely occupy the attack relation."

In the strongest same-front screen-heavy case:

- player-only authority: DOWN at 7.525 s;
- intercept-only, zero friendly damage: ACTIVE after 8 s at 16 HP;
- both adversaries remain at 100 HP;
- six peer interceptions occur.

Therefore:

> **body-screen value does not require friendly-fire damage.**

### Generalization across ordinary layouts

The same position-only screen policies were tested across:

- splitNorth;
- sameFront;
- staggered;
- opposed;

with multiple lateral offsets and **zero friendly damage**.

Material benefit appears in 3 / 4 layout families, but not universally.

Examples:

- sameFront, heavy screen: one offset changes DOWN -> ACTIVE at 8 s;
- staggered, heavy screen: one offset changes DOWN -> ACTIVE at 50 HP;
- staggered, light screen: several offsets extend survival by ~1.1 s;
- opposed, heavy screen: survival extends from ~3.44 s to ~4.98 s;
- splitNorth: interception events occur but do not improve player outcome.

This is a useful property, not a defect:

> **screening is a spatial affordance, not a global defensive buff.**

The heavy body is also materially more useful as a blocker than the light body in the current pair, emerging from body/action geometry rather than a role flag.

### Evidence boundary

A2b now demonstrates:

- real first-solid-body action authority;
- bounded screen tolerance;
- interception value independent of friendly damage;
- transfer beyond one staged starting layout.

It still does **not** demonstrate human-scale discoverability.

The current screen policy:

- knows which visible body it wants as blocker;
- knows which visible body is the attacker;
- recomputes their exact positions every simulation frame;
- moves continuously toward the exact far-side relation.

Next falsifier:

> **does body-screen value survive sampled / quantized positional knowledge with no hidden attack-state access?**

If modest perception delay / spatial imprecision destroys the phenomenon, retain A2b as mechanism evidence and do not promote it to A3.

---

## 6.3 A2b coarse-perception result — MATERIAL POSSIBILITY SURVIVES, BUT NOT AS COMBAT ADVANTAGE

A2b's body-screen policy was then degraded to approximate perception:

- body positions sampled every **200 ms**;
- positions quantized to a **24 px** grid;
- no access to prepare / commit / recover state;
- no friendly damage.

Matched authority comparison was required:

- sampled player-only;
- sampled intercept-only.

Across 40 layout / blocker / offset cells:

- exact screen policy produced material player benefit in **6 / 40** cells;
- sampled / quantized policy produced benefit in **8 / 40** cells;
- **4 / 6** exact-benefit cells survived the coarse observer;
- sampled interception events occurred in **28 / 40** cells.

This is enough to reject the claim that body screening is only a frame-perfect geometry solver artifact.

The effect remains strongly spatial / conditional rather than universal.

### Final A2b combat-loop gate

The same sampled / quantized screen policy was then allowed to use the ordinary compact player strike against the nearest visible body.

Important boundaries:

- no hidden attack-phase reads;
- no friendly damage;
- same movement policy in player-only and all-body conditions;
- 4 layouts;
- heavy and light blocker relations;
- 3 lateral offsets each;
- **24 matched combat cells**.

Result:

> **0 / 24 cells gained any combat outcome benefit from material interception.**

Specifically:

- 0 clear upgrades;
- 0 HP advantages;
- 0 reductions in player hits;
- 0 survival-time advantages attributable to all-body authority.

The body-screen mechanism still exists physically, but ordinary lethal offense changes / deletes the pair relation before screening changes the actual fight.

Therefore:

> **A2b qualifies as material-world donor evidence, not as the missing pair-combat phenomenon.**

---

## 6.4 Adversarial Combat Organism v1 verdict — WHOLE-ORGANISM FAIL, DONORS RETAINED

### What survived

**A1 v1 single-adversary strategy divergence**

- light dash-line punishes backstep less and rewards lateral orbit;
- heavy sweep-arc punishes orbit and rewards giving ground;
- heavy backstep remains viable with bounded reaction delay;
- action geometry is equipment/action data, not a hidden enemy-class branch.

**A2b material action truth**

- adversary commitments can resolve against first solid body;
- body interception has bounded spatial tolerance;
- another enemy can materially screen the player;
- interception value can exist with **zero friendly damage**;
- some screen benefit survives coarse positional perception;
- heavy/light body geometry creates asymmetric screening value without a class flag.

These are valuable Feniks donor mechanisms.

### What failed as a whole organism

The mixed light + heavy pair never became more than the sum of independent pressure plus occasional material cross-contact.

- A2 open pair was clearable by all tested simple policies.
- Focus order barely mattered.
- Peer body collision was mostly irrelevant.
- Enabling all-body attack authority created real cross-interaction but only sporadically in ordinary fights.
- Body-screen positioning could improve survival while the player **did not attack**.
- Once ordinary compact offense was restored, the material screen had **0 / 24 measurable fight-outcome effects**.

This is not an argument against:

- heterogeneous enemies;
- first-solid-body combat truth;
- friendly body obstruction;
- dash / sweep action diversity;
- future classless body roles.

The narrower conclusion is:

> **player + compact lethal melee strike + dash/sweep pair did not produce a whole combat organism worth Owner attention.**

### Cross-campaign warning

O1 and A2b independently expose a similar pressure:

> **spatial defensive relations can become meaningful in isolation, then disappear once ordinary offense deletes pressure faster than the relation matters.**

Do not treat this as a universal theorem yet.

It is strong enough to prohibit another immediate patch around the same compact-melee attack abstraction.

Do not rescue Adversarial v1 by:

- increasing enemy HP;
- lowering player damage;
- adding stamina;
- adding dodge/parry;
- adding terrain to force screen value;
- adding more enemies;
- scripting formations;
- making friendly fire more lethal.

### Promotion status

- A0 shared substrate: mechanism-qualified;
- A1 v1 single-adversary divergence: agent-side possibility-qualified;
- A2/A2b pair organism: **FAIL**;
- Owner eligibility: **NO**;
- browser deployment: **NOT WARRANTED**.

### Next frontier

Reconsider the reserved **LINE / IMPULSE** organism from a clean product hypothesis.

Do not implement it as:

> "the same compact melee loop, but projectile=true."

The next lane should explicitly test whether:

- projectile travel / obstruction;
- first-solid-body line truth;
- opponent body placement;
- cover;
- impact displacement / interruption;
- close-pressure vulnerability;

can create a different decision language before returning to melee attribution.

---

## 7. World relation

Build a small place, not a puzzle lane.

Minimum geometry:

- one open relation;
- one short obstruction / pillar;
- one constrained side relation;
- enough circulation that no route is "the intended solution".

The same geometry should be ambiguous:

- obstruction can help split pressure;
- obstruction can also trap or block the player;
- open space helps read heavy commitment;
- open space also gives the light body room to re-enter.

No objective marker, stake or tower-defense target in v1.

---

## 8. 30-second discriminator

The lane only survives if ordinary play would plausibly make the player do **different things because of which opponent is currently dangerous**.

A successful future Owner reaction would sound like:

- "tego małego nie opłaca się gonić";
- "ten duży zamyka mi przestrzeń";
- "ustawiłem jednego tak, że przeszkadzał drugiemu";
- "czekałem aż ten ciężki przestrzeli / przecommitował";
- "musiałem zmienić stronę, bo byłem zamknięty między nimi".

The lane fails if the best description remains:

> "biegnę do najbliższego i klikam, tylko jeden jest szybszy, a drugi wolniejszy."

---

## 9. Hard falsifiers before Owner attention

Stop or refound if any of these survives serious agent red-team:

- nearest-target mash clears safely;
- pure backwards disengagement cancels the fight indefinitely;
- circling exploits turn-rate AI rather than meaningful geometry;
- light and heavy require the same motor strategy;
- crusher value comes from HP;
- striker value comes from homing speed;
- pair value comes from pathfinding failure;
- obstacle use is a single authored route solution;
- an automated "smart" policy only works because it reads hidden state the player could not perceive;
- one adversary can be deleted without changing how the fight is played;
- the fight becomes interesting only after adding stamina, parry, dodge, combo or progression systems.

---

## 10. First implementation sequence

### A0 — neutral combat substrate

Build only:

- player body + one compact strike;
- shared adversary body/state schema;
- world geometry;
- body/world contact;
- same-step consequence discipline;
- presentation hooks;
- quick reset.

No pair fight yet.

### A1 — single-adversary discriminators

Instantiate extreme light and heavy anchors separately.

Machine rehearsal asks:

- can the same nearest-mash policy solve both?
- can pure retreat disengage both forever?
- does each commitment create a real, spatially visible punish window?
- are misses and body contacts finite / understandable?
- does either anchor depend on pathing bugs?

If the two single-adversary fights do not provoke meaningfully different strategy, stop.

### A2 — pair organism

Only after A1 divergence exists.

Put both in one small place without scripted coordination.

Look for:

- body obstruction;
- pressure ordering;
- commitment overlap;
- route/space decisions;
- legal separation/re-engagement.

### A3 — adversarial red-team

Required bad/simple policies:

- nearest-target mash;
- permanent retreat;
- permanent circle;
- focus light first;
- focus heavy first;
- ignore one opponent;
- obstacle-hug.

No policy is "the intended solution".

### A4 — continuity falsifier

Interpolate body / handling / attack properties between anchors.

Ask whether behavior changes coherently rather than flipping through hidden role branches.

### A5 — Owner eligibility

Only if:

- agent-side exploits are bounded;
- adversaries are visibly distinct without labels;
- at least three legal responses exist;
- terrain changes decisions;
- the pair is more than two health bars;
- browser runtime/presentation is stable.

No Owner deployment before this gate.

---

## 11. O3 status

The reserved LINE / IMPULSE ranged organism remains valid research space.

It is **not** the automatic next implementation merely because O1/O2 failed.

First determine whether replacing generic pressure with materially legible adversaries creates a stronger combat-discovery substrate.

If Adversarial Combat Organism v1 also collapses into trivial pursuit / attack loops, reconsider O3 or a more radical control/world organism from a clean state.

---

## Working invariant

> **We are not trying to make enemies harder. We are trying to make opponents worth reading.**
