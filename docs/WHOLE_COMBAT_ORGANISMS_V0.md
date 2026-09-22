# Whole Combat Organisms v0 — discovery campaign

**Date:** 2026-09-22  
**Status:** active design authority; implementation not yet started  
**Branch:** `experiment/whole-combat-organisms-v0`

## 0. Why this campaign exists

Full project-history recovery changed the research frontier.

Combat Lab already has enough evidence that:

- mechanism sophistication does not imply good combat;
- clean parameter comparisons can erase the phenomenon we are trying to discover;
- an integrated specimen can pass many causal/mechanical gates and still feel plainly bad in Owner play;
- classless body/equipment derivation is possible as a mechanism, but it is not useful as the primary discovery objective before a combat organism is worth having.

The current target is therefore not:

> choose the best attack resolver.

It is not:

> prove that a tank and a skirmisher can emerge without class flags.

It is:

> **find at least one whole combat organism that creates readable, useful possibilities and makes the Owner want to fight again.**

Only after that do we earn attribution work.

---

## 1. Evidence carried forward

### Owner-positive signals that survived Terrarium

Preserve as pressures, not exact numbers:

- impacts should matter;
- avoid HP-sponge combat;
- weight / material consequence can be attractive;
- movement should remain meaningfully live during attacks;
- physical relation should matter without turning control into sludge.

Mount & Blade / Exanima remain references for **consequence / weight philosophy only**, not combat templates.

### Owner-negative evidence

Do not rebuild:

- aggressive face-hugging duelist theatre;
- combat that is difficult to read only because two bodies continuously overlap;
- a generic sword fight with more and more physical detail;
- a specimen that needs telemetry to explain who is winning;
- combat whose depth is mainly controller management;
- route puzzles masquerading as combat strategy.

### Preserved mechanism donors

Potential donors, not foundations:

- directional body-motion contribution to impact;
- real weapon/world clearance;
- persistent weapon contact without binary magic parry;
- same-step committed hit symmetry;
- body/equipment mass derivation;
- directional shield occupancy;
- body contact / yield;
- experimental brace / stance pressure;
- exact-SHA deployment/rehearsal infrastructure.

Nothing above must be reused if a simpler implementation gives a better game.

---

## 2. Campaign method

This is **discovery mode**.

Candidates may intentionally differ in:

- body;
- equipment;
- weapon family;
- attack vocabulary;
- contact model;
- opponent pressure;
- useful terrain relation;
- degree of authored vs material realization.

Do **not** equalize those differences merely to make causal attribution clean.

The shared comparison question is player-facing:

> **What does this organism make the player naturally start doing?**

A candidate survives only if the answer is qualitatively different from:

> circle the enemy, click whenever available, and manage the same spacing loop.

---

## 3. Possibility-richness gate

Before Owner play, each candidate must offer more than one scripted solution.

Minimum target: at least **three materially useful responses** to pressure that arise from the combat/world relationship.

Examples:

- hold a relation;
- give ground deliberately;
- change angle;
- interrupt;
- threaten space before committing;
- displace;
- use reach;
- use cover;
- split pressure around an obstruction;
- bypass;
- punish overextension.

The candidate fails as a product specimen if:

- one authored lane contains the correct answer;
- a body-size gate is the primary strategic discriminator;
- AI only becomes dangerous in the lane the experiment wants to test;
- the automated rehearsal knows the intended solution in advance and that is our main evidence;
- removing combat and keeping movement geometry preserves most of the claimed strategy.

Mechanism cells are allowed to be narrower. They simply do not become Owner candidates.

---

## 4. Shared micro-world pressure

Working place:

> **BROKEN YARD**

Not a final Feniks location and not a route puzzle.

Required spatial relations:

- one open area where circling is possible but exposed;
- one partial wall / broken gate that creates a choke without being the only route;
- one substantial obstruction / pillar that breaks line and approach;
- one wider side relation that all initial player bodies can physically traverse;
- enough depth that retreat gives space but eventually costs position.

Important correction from Phenotype P1:

> **No initial route is allowed to exist only because one player body fits and another does not.**

Body-envelope access remains a future donor pressure, not the primary v0 discriminator.

### Initial pressure

Prefer **several cheap readable threats** over one symmetric duelist.

First candidate:

- 2 light melee pressure bodies;
- simple acquire → approach → commit → recover;
- meaningful commitment;
- no omniscient perfect spacing;
- no permanent face-hug target;
- bodies collide / occupy enough space to matter.

Optional only if rehearsal proves two melee bodies are too homogeneous:

- one simple ranged/throw pressure source.

AI quality is not a success metric.

### Objective

Default:

> **small pressure clear**

The player clears the immediate defended space.

No score.
No combo meter.
No route label.
No "use shield here" prompt.

A short encounter should normally resolve in roughly tens of seconds, not minutes.

---

# 5. Organism O1 — HOLD / BREAK

Internal research label only.

## Player action

- responsive WASD locomotion;
- mouse facing;
- one compact damaging action;
- one hold/resist posture input;
- no universal dodge;
- no i-frames;
- no hard target ownership.

## Realized organism

- materially significant body + shield/front geometry;
- short lethal weapon;
- stance/contact may trade mobility for spatial authority;
- incoming bodies and the player can yield / displace rather than phase through each other;
- attacks remain usable while moving;
- shield is space, not `-damage%`.

## What the player should naturally discover

Not:

> I am slow but have more defense.

Instead:

> **where I stand and which direction I occupy changes what pressure can do.**

Useful possibilities should include more than one of:

- hold a broken-gate relation;
- advance behind occupied frontal space;
- yield from bad contact rather than stubbornly hold;
- turn one hostile into an obstruction for another;
- break formation with body/shield pressure;
- use a short strike when the spatial relation is won.

## 30-second discriminator

The player voluntarily stops chasing and starts **choosing where contact should happen**.

## Feniks relevance

This attacks the long-running tank fantasy directly:

- tanking partly as physical space-holding;
- body/equipment/posture mattering without MMO taunt authority;
- material role identity potentially preceding class labels.

## Primary falsifiers

- "same fighter, slower";
- Shift feels like a hidden defense buff;
- shield mainly exists to negate damage;
- player wins by permanent static turtling;
- movement/contact feels sticky or controller-hostile;
- all interesting behavior disappears outside the choke;
- organism only works because AI politely feeds the shield.

---

## 5.1 O1 deeper contract — stance is contact negotiation, not defense state

Historical Owner intent makes the first O1 implementation stricter than the initial outline.

The valuable idea is **not**:

> heavy actor + slower locomotion + Shift multiplies collision resistance.

The intended pressure is:

> **the same body can negotiate contact differently depending on equipment geometry, facing, posture and current intent, while remaining continuously controllable.**

### Shield truth

The shield exists continuously as frontal occupied geometry.

It does not appear only while Shift is held.

Consequences:

- a frontal incoming body/attack may meet shield geometry before body geometry;
- side/rear pressure bypasses that relation naturally;
- shield coverage is directional and can be lost by bad facing;
- shield contact may displace both participants;
- no hidden `damage *= 0.5` authority is allowed.

### Brace truth

Brace is a **support/contact posture**, not immunity.

First implementation approximation:

- brace changes support only for a contact actually realized through the shield relation;
- it must not globally increase body mass or collision authority;
- player still yields under sufficient frontal momentum;
- attacker still yields as well;
- movement remains live;
- turning / translational authority may be reduced modestly while braced, but not to create animation lock;
- side/rear body contact uses ordinary shared body rules regardless of brace.

This is deliberately narrower than the retired Phenotype P1 `contactAuthority * braceMultiplier` abstraction.

### Contact-mode falsifier

O1 fails immediately if all important outcomes can be predicted from:

> brace held = hard body; brace released = soft body.

The interesting outcome must depend on **where contact occurs and how the body/shield are oriented**.

### First three legal tactical affordances

These are affordance probes, not claims that a player will naturally discover them.

#### A — HOLD

A frontal committed threat reaches shield geometry while the player is correctly oriented.

Expected:

- shield contact happens before body-hit;
- both actors move;
- braced player yields less than unbraced player;
- no infinite wall;
- repeated pressure can still move or surround the player.

#### B — YIELD / LET PASS

During readable enemy commitment, the player releases the frontal relation by moving/angling away.

Expected:

- the committed lunge can miss or overshoot;
- enemy enters recovery;
- no dodge button or i-frame state exists;
- success comes from leaving the actual threat path.

#### C — BREAK / ADVANCE

The player uses body + shield relation to advance into a recovering or poorly aligned threat.

Expected:

- heavier/forward-supported contact can move the hostile body;
- this may split two nearby hostiles or alter their approach;
- displacement is not a damage ability;
- this must remain useful somewhere outside the broken gate.

If O1 cannot support all three as legal actions in the same world, it lacks possibility richness.

### Static-turtle red-team

A stationary braced player in open space must **not** be a universal solution.

Agent rehearsal should place pressure from materially different approach angles.

Expected:

- frontal attacks may be intercepted;
- uncovered side/rear attacks remain dangerous;
- merely holding brace without managing facing/position eventually loses health or position.

Do not fix a static-turtle failure with stamina, cooldown or arbitrary guard-break until geometry/contact has first been falsified.

### Lethality

Carry forward Terrarium's only robust positive signal:

- impacts matter;
- no sponge.

Initial pressure:

- hostile committed body-hit: approximately one third of player health;
- clean short-weapon hit may remove a cheap hostile in one strong contact.

Exact values are disposable. The product pressure is that a positional mistake matters immediately and an exposed cheap threat does not require repetitive chopping.

### O1 presentation pressure

Before Owner eligibility, normal presentation must make these distinctions visible without debug telemetry:

- shield location and orientation;
- brace posture;
- enemy windup;
- enemy committed lunge;
- shield contact vs body hit;
- enemy recovery / vulnerability;
- dead/removed threat.

Research labels such as `HOLD/BREAK` must not appear in the eventual Owner-facing build.

---

# 6. Organism O2 — REACH / THREAT

Internal research label only.

## Player action

- responsive WASD;
- mouse-facing / aim;
- very small polearm vocabulary, likely thrust + compact clearance action;
- live movement throughout;
- no dodge button required;
- no target lock required.

## Realized organism

- long weapon occupies meaningful space;
- useful outer threat region and a bad close region;
- weapon/world clearance matters;
- movement into/out of a strike may alter consequence, but not so much that the player fights inertia;
- persistent weapon relation may influence approach before damage occurs.

## What the player should naturally discover

Not:

> keep exactly 102 pixels of range.

Instead:

> **I can shape where several enemies are willing/able to enter, but my long weapon becomes awkward when pressure collapses or terrain closes.**

Useful possibilities should include:

- threaten a lane before committing;
- give ground to preserve useful reach;
- pivot around an obstruction to stop simultaneous approach;
- deliberately accept close contact and switch to a clearance action;
- use a narrow relation as both advantage and limitation depending on weapon orientation.

## 30-second discriminator

The player makes meaningful decisions **before pressing attack** because reach, approach lane and weapon orientation already matter.

## Feniks relevance

Tests whether weapon identity can become spatial strategy rather than damage/range/cooldown stats.

It also reuses the strongest Terrarium spear questions without inheriting Terrarium as a game.

## Primary falsifiers

- endless backwards kiting is optimal;
- range maintenance becomes maintenance work rather than mastery;
- polearm is merely "sword but longer";
- AI tracking incompetence creates the entire advantage;
- persistent weapon contact becomes noisy or fiddly;
- terrain mostly produces accidental wall hits.

---

# 7. Organism O3 — LINE / IMPULSE

**Reserve candidate. Do not implement in the first pair unless O1/O2 fail to provide enough divergence or a later continuation explicitly promotes it.**

This organism exists to prevent Combat Lab from silently equating "combat" with melee.

## Player action

Candidate surface:

- responsive movement;
- free aim;
- one physical ranged action;
- one bounded impulse / displacement action or a single projectile whose impact meaningfully displaces;
- no target lock required.

Exact controls are deliberately not frozen yet.

## Realized organism

- real projectile path / obstruction;
- cover and line separation matter;
- impact may move bodies or create local positional consequences;
- close pressure is dangerous without requiring a universal roll;
- the world participates through collision/cover, not just sight range.

## What the player should naturally discover

> **I am managing lines, interruption and space creation rather than merely reducing HP from farther away.**

Potential useful possibilities:

- create distance through displacement;
- use obstruction to split pressure;
- take a clean line instead of firing continuously;
- punish an enemy whose movement exposes another;
- trade position for shot quality.

## Feniks relevance

- opens the discovery space toward archer / magic / physical projectile play;
- tests whether body/world causality remains valuable outside melee;
- prevents premature melee lock-in.

## Primary falsifiers

- "melee organism but from farther away";
- projectile spam;
- cover becomes binary peek-shoot repetition;
- displacement produces pinball chaos;
- the ranged layer makes body/material relation irrelevant.

---

# 8. Why O1 and O2 are the first implementation pair

They are intentionally related enough to share a micro-world and basic body/contact substrate, but different enough to demand distinct play.

**O1 asks:** can occupying / resisting / reshaping contact become fun?

**O2 asks:** can threatening / preserving / surrendering reach become fun?

They should not share identical attack code merely for cleanliness.

They should share only what genuinely belongs to the world:

- time;
- coordinate space;
- walls/obstructions;
- actor occupancy;
- broad damage consequence language;
- quick reset;
- presentation conventions.

O3 remains reserved because adding ranged + projectile + displacement at the same time would expand implementation breadth before the first pair tells us whether melee-space interaction contains any promising phenomenon.

---

# 9. Product-integrity gates before Owner attention

Machine / agent rehearsal must establish only:

1. runtime stability;
2. browser execution and input path;
3. obvious geometry/contact correctness;
4. no accidental one-frame multi-hit / order authority;
5. no obvious dominant exploit caused by broken AI;
6. each organism has at least three **legal** tactical possibilities in the world;
7. none of those possibilities exists solely because the test harness labels or forces it;
8. normal presentation makes threat / hit / contact understandable without telemetry;
9. exact build provenance.

Do **not** build a giant quantitative assurance suite.

A dozen green tests cannot qualify feel.

---

# 10. Owner evidence protocol

When a candidate is finally worth Owner attention:

- do not reveal the intended strategy;
- do not label the build "tank", "skirmisher", "reach", "correct route", etc.;
- hide research telemetry by default;
- ask for ordinary play, not a checklist;
- let the Owner stop quickly if the organism is plainly bad.

High-value evidence includes spontaneous statements like:

- "I keep wanting to do X";
- "this feels heavy in a good/bad way";
- "I figured out that I can...";
- "I am fighting the controls";
- "I want to try that again";
- "this is still the same shitty loop";
- "I don't know who hit whom";
- "this situation makes me use the wall / spacing / body differently."

Negative evidence is not a request to tune forever.

---

# 11. Promotion order

A candidate does **not** graduate because it is the least bad specimen.

Promotion requires:

1. **PLAY PHENOMENON** — Owner naturally discovers at least one valuable behavior.
2. **DESIRE** — some wish to repeat, improve or explore the interaction.
3. **READABILITY** — the cause of important outcomes is sufficiently understandable in motion.
4. **CONTROL** — physical consequence does not overpower player intent.
5. **WORLD VALUE** — terrain/body/weapon relation changes decisions rather than decorating them.

Only after that:

6. isolate which mechanisms caused the phenomenon;
7. test whether simpler authored rules preserve it;
8. reintroduce classless-continuity pressure;
9. test progression/build implications;
10. expand toward ranged, magic, party/co-op and richer world interaction.

---

# 12. Immediate execution plan

### W0 — campaign truth

- mark Phenotype P0/P1 as mechanism donor;
- create this clean active branch and campaign;
- do not deploy.

### W1 — neutral Broken Yard substrate

Build only:

- world geometry;
- actor occupancy/contact basics;
- two cheap readable pressure bodies;
- presentation / reset;
- no player combat yet.

Purpose: prove the **situation** is legible and not secretly a route puzzle.

### W2 — O1 HOLD / BREAK

Add only the mechanics necessary for the organism.

Agent-rehearse for:

- static-turtle exploit;
- AI-feeds-shield artifact;
- sticky contact;
- possibility richness.

### W3 — O2 REACH / THREAT

Implement as a sibling organism against the same broad place/pressure, reusing world substrate but not forcing the same attack engine.

Agent-rehearse for:

- perpetual backwards-kite exploit;
- wall-hit noise;
- range-maintenance chores;
- AI tracking artifact.

### W4 — comparative red-team

Do not score O1 vs O2.

Ask:

- do they provoke genuinely different play?
- can each be described without referencing tuning constants?
- does either contain a phenomenon worth Owner attention?
- are we seeing combat decisions or merely solving AI?

If neither survives, stop and reconsider O3 or a more radical organism.

### W5 — Owner eligibility

Only if at least one organism survives W4.

No Owner deployment before this gate.

---

## W1 checkpoint — neutral Broken Yard substrate — MECHANICALLY ADEQUATE, BROWSER RUNTIME PASS

Current pre-browser checkpoint:

- code head before this note: `6257789d49a7a0c013148a537270395303442a3b`;
- 6 / 6 deterministic W1 checks PASS;
- player and both pressure bodies begin with the same body radius;
- two broad yard relations are geometrically traversable without phenotype gates;
- pressure state machine exercises `approach → windup → lunge → recover`;
- player has no attack or HP authority in W1;
- the neutral 20 s rehearsal is finite and advances through the yard rather than remaining blocked.

Important apparatus failures found and corrected before this checkpoint:

1. the first right-route proof crossed the south obstruction;
2. the first rehearsal path crossed the east wall and falsely generated thousands of wall contacts;
3. the first pressure recover remained too adhesive, producing 2699 pair-contact frames;
4. after bounded disengage, player adhesion dropped sharply;
5. the two pressure bodies then revealed a separate blob problem;
6. local peer separation was added only during ordinary approach/recover steering, not as formation/flank authority.

Latest deterministic rehearsal signature:

- `waypointAdvances = 33`;
- `playerThreatContactFrames = 317 / 2400`;
- `playerContactEpisodes = 8`;
- `maxPlayerContactStreak = 115` (~0.96 s);
- `threatThreatContactFrames = 539 / 2400`;
- `pairContacts = 595`;
- `worldContacts = 499`;
- all pressure phases observed;
- finite state throughout.

Interpretation boundary:

> W1 is now good enough mechanically to inspect as a **situation substrate**. It does not prove that multi-body pressure is visually legible, pleasant or product-worthy.

Exact-SHA agent browser rehearsal:

- deployed source: `ba408d52549175b06d10d5387eb7f331717cc630`;
- branch CI: 6 / 6 PASS;
- Pages build log checked out exactly that SHA;
- Pages deploy PASS;
- Opera loaded the W1 page and its dynamic accessibility state changed at runtime;
- live state exposed pressure bodies in changing phases such as `recover`, proving that JS module loading and the simulation/render loop are executing in the real browser.

Evidence boundary:

- browser runtime / module execution: **PASS**;
- canvas visual legibility: **UNPROVEN** — the screenshot connector returned image bytes but no inspectable visual surface in this run;
- therefore no claim is made that the bodies remain visually individuated, threat phases read well at speed, or Broken Yard already reads as a convincing place.

W1 is sufficient as an **internal situation substrate**, not as an Owner specimen. W2 may proceed, but O1 must earn its own visual/product-integrity gate before any Owner play.

No Owner play is authorized by this checkpoint.

---

## Working invariant

> **We are not trying to prove that our mechanics can support combat. We are trying to discover combat worth supporting.**
