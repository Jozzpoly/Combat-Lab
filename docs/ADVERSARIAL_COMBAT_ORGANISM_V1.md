# Adversarial Combat Organism v1

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
