# Phenotype Combat Ecology v0 — first falsifier campaign

**Date:** 2026-09-21  
**Status:** active design / implementation authority  
**Branch:** `experiment/phenotype-combat-ecology-v0`

## 0. Campaign purpose

This campaign tests one proposition only:

> **Can shared body + equipment + posture + world rules make two characters naturally want to fight differently, without a hard class flag or a different attack-engine minigame?**

It does **not** attempt to prove the final Feniks combat system.

It deliberately avoids:

- RPG progression implementation;
- skill trees;
- classes/vocations;
- loot rarity;
- magic;
- ranged combat;
- full 2.5D;
- destructible terrain;
- complex AI;
- multiple weapon families;
- final art direction.

The previous Terrarium over-invested in a strike/contact organism before demonstrating a sufficiently rich character/world possibility space. This campaign starts from the opposite end.

---

## 1. Core experimental contract

### Same player-facing control family

Both first anchors use the same broad input language:

- WASD — locomotion;
- mouse — facing / attention;
- LMB — one simple weapon attack intent;
- hold posture input — **brace / resist contact** while sacrificing mobility.

No dodge roll.

No i-frames.

No class-specific hotbar.

No target lock as a hidden combat authority.

### Same short weapon family initially

The first Bulwark and Skirmisher should use the **same or near-identical compact weapon action**.

This is intentional.

The first contrast should not be explainable as:

> “one preset had a better attack animation.”

Weapon-family divergence comes only after body/equipment phenotype survives.

### Shared world laws

The implementation must derive behavior from shared properties.

Minimum candidate properties:

```text
body envelope / radius
base body mass
equipment mass
locomotor drive / acceleration authority
braking authority
turn authority
contact compliance / resistance
posture / brace multiplier
shield geometry / coverage
weapon geometry
weapon handling / response
```

Exact formulas are not frozen.

The important requirement is explanatory continuity.

---

## 2. Anti-class contract

There must be no runtime authority equivalent to:

```js
if (class === "bulwark") ...
if (class === "skirmisher") ...
```

Temporary anchor configs may group properties for fast testing.

Those configs are test fixtures, not game classes.

A role qualifies as **emergent** only if its observed behavior can be explained through shared properties / equipment / posture.

Discrete learned techniques remain allowed as a future Feniks concept. They do not count as evidence for this campaign.

---

## 3. Shared body/equipment derivation pressure

The first implementation should prefer a compact derived model over disconnected hand tuning.

Illustrative relationship:

```text
total mass
    <- body mass + carried/equipped mass

movement response
    <- locomotor drive vs total mass

turn response
    <- turn authority vs total mass / equipment burden

contact displacement
    <- relative mass + relative velocity + posture resistance

shield stability
    <- shield geometry + posture + body/contact state

weapon response
    <- weapon geometry/mass + handling authority + body state
```

This is **not a realism mandate**.

If a simpler authored relationship produces clearer gameplay, use it.

The failure to avoid is unrelated constants that accidentally create three presets but cannot support coherent interpolation.

---

## 4. Shared posture: brace

The first high-value posture experiment is a single shared **brace** intent.

Brace is not a tank ability.

Any actor may attempt it.

Expected generic consequences:

- reduced locomotion authority;
- reduced turn authority;
- increased resistance to displacement;
- improved stability of persistent shield/contact geometry where equipment supports it.

A light unshielded body may gain little from bracing because its body/equipment relation does not support the same space-holding outcome.

This gives us a first stance-dependent contact test without building a stance tree.

### Falsifier

If brace becomes:

- an invisible defense buff;
- a damage-reduction timer;
- a root / animation lock;
- a Bulwark-only permission flag;

then the experiment failed its own premise.

---

## 5. Anchor A — heavy shield phenotype

Working research label:

> **BULWARK ANCHOR**

Not a class name.

Candidate properties:

- larger body envelope;
- high total mass;
- heavier equipment;
- lower acceleration / turning;
- persistent frontal shield geometry;
- high displacement resistance while braced;
- compact weapon;
- no extra HP required for the first falsifier.

Expected natural behavior:

- value a choke / doorway;
- face pressure rather than permanently kite;
- accept contact when the spatial trade is useful;
- use shield/body presence to deny or reshape approach;
- dislike unnecessary pursuit in open space.

### 30-second discriminator

Without reading telemetry, a player should discover:

> **standing in the right place and orienting the body/shield can be stronger than chasing.**

### Primary failure signatures

- only “same fighter, slower”;
- shield is effectively `-X% damage`;
- enemy clips through or ignores the claimed occupied space;
- holding a doorway works only because of an invisible wall;
- body mass mostly creates sluggish controls;
- player still optimally circle-strafes exactly like the light anchor.

---

## 6. Anchor B — light mobile phenotype

Working research label:

> **SKIRMISHER ANCHOR**

Not a class name.

Candidate properties:

- smaller body envelope;
- low total mass;
- low equipment burden;
- high acceleration / braking;
- strong turn authority;
- low resistance to frontal displacement;
- no large persistent shield;
- same compact weapon family as Bulwark for the first contrast.

Expected natural behavior:

- avoid losing frontal mass exchanges;
- exploit angle / route;
- enter and leave close space deliberately;
- use small envelope / mobility to access relations the Bulwark dislikes;
- turn opponent commitment into positional opportunity.

### 30-second discriminator

Without a dodge button, the player should discover:

> **movement and route choice are the defense; getting pinned is materially bad.**

### Primary failure signatures

- only “same fighter, faster”;
- success is endless orbiting around dumb tracking AI;
- collision feels slippery instead of informative;
- low mass means random pinball rather than controllable risk;
- the same doorway strategy is still optimal;
- movement advantage comes from i-frame-like immunity.

---

## 7. First continuity falsifier — awkward hybrid

Before an Owner gate, create at least one intentionally non-archetypal character.

Example pressure point:

> medium/light body + modest armour + small shield + compact weapon.

The hybrid is not expected to be optimal.

It is expected to be **coherent**.

Questions:

- does equipment mass change movement without flipping a class switch?
- does the smaller shield give partial spatial value?
- can the character brace meaningfully but less authoritatively than the heavy anchor?
- does the character still retain better route/movement behavior than the Bulwark?
- can we explain every major difference through shared properties?

### Hard falsifier

If the hybrid exposes that the two anchors only worked because of handcrafted exceptions, stop.

Do not hide the discontinuity behind balance tuning.

---

## 8. World pressure cell

Do not reuse Ruined Gate as a cosmetic arena.

Build the smallest **place** that exposes phenotype relations.

Required affordances:

- one open approach;
- one true choke / doorway;
- one side relation or alternate route;
- one obstruction that can create cover / line separation;
- enough room that mobility has meaning.

The world should not announce:

> “TANK ROUTE” / “ROGUE ROUTE”.

Geometry should simply exist, and bodies/equipment should value it differently.

### Body-envelope discriminator

At least one relation should expose actual body/envelope difference.

Example:

- the light body can use a tight side passage comfortably;
- the heavy body either cannot, or can only negotiate it slowly / awkwardly.

This must remain legible and world-grounded.

Do not solve it with a hidden class gate.

---

## 9. Pressure, not duelist theatre

The campaign does not need sophisticated opponent AI.

It needs pressure that exposes spatial choices.

Avoid one hyper-competent symmetric duelist as the whole game again.

Initial pressure may use one simple hostile body with:

- clear pursuit intent;
- readable commitment;
- real contact;
- bounded recovery;
- no omniscient spacing courtesy.

If one body cannot expose both anchors, a second **simple** pressure type may be added.

AI complexity is not a success metric.

---

## 10. First objective candidates

Do not freeze a classic “kill the duelist” loop prematurely.

The first integrated cell should choose one objective that forces world relation.

Two acceptable candidates:

### A. Cross / clear

The player needs to reach a destination beyond defended space.

Combat, pushing, bypassing and route use are all legal.

This strongly tests whether Bulwark and Skirmisher solve spatial pressure differently.

### B. Small multi-pressure clear

Two cheap hostiles create enough pressure that choke control and repositioning can both matter.

This is closer to ordinary PvE combat but risks turning the first build into AI work.

**Default preference for v0:** cross / clear, unless implementation rehearsal demonstrates that it under-tests actual fighting.

---

## 11. Damage / lethality

Carry forward the only positive Owner signal from Terrarium:

- impacts should matter;
- avoid HP-sponge combat.

Do not carry forward exact Terrarium numbers.

For the first phenotype falsifier:

- keep health simple;
- avoid armour-as-HP;
- let shield/contact/body relation do the interesting defensive work;
- keep enough lethality that positioning mistakes matter.

---

## 12. Visual language minimum

Do not return to two nearly identical triangles with sticks.

No final art pipeline is needed.

But the silhouettes must communicate:

- heavy vs light body;
- shield presence / orientation;
- compact weapon;
- brace posture;
- body contact / displacement;
- usable world openings.

A screenshot should already reveal which body occupies more space and which one is equipped to resist frontal pressure.

---

## 13. Agent-side rehearsal boundaries

Agent-side checks may prove:

- the two anchors are built from shared properties, not class branches;
- body/equipment mass flows into derived motion/contact;
- brace changes displacement through shared contact logic;
- shield geometry physically intercepts relevant contact;
- the tight route is a geometry/envelope fact;
- the hybrid interpolates coherently;
- runtime/deployment are stable.

Agent-side checks must **not** claim:

- Bulwark feels powerful;
- Skirmisher feels agile;
- brace is intuitive;
- shield combat is satisfying;
- the hybrid is fun;
- the place creates good combat.

Those remain Owner evidence.

---

## 14. Early machine discriminators

The campaign should prefer a few phenomenon-level probes over dozens of assertions.

### M1 — same impulse, different posture

Apply comparable contact to the same body neutral vs braced.

Expected:

- braced displacement meaningfully lower;
- no immunity;
- no magic damage state.

### M2 — heavy vs light contact

Comparable approach/contact under shared rules.

Expected:

- light body yields more;
- heavy body still moves — no infinite-mass wall.

### M3 — shield world occupancy

Approach a shielded actor from covered vs uncovered relation.

Expected:

- geometry/contact outcome differs for explainable spatial reasons.

### M4 — route envelope

Drive heavy and light bodies through the same side relation.

Expected:

- different access / negotiation from actual geometry.

### M5 — hybrid continuity

Measure derived movement/contact values and one integrated rehearsal.

Expected:

- coherent intermediate behavior;
- no hidden preset mode.

These probes are gates to an organism, not the product result.

---

## 15. Implementation order

### P0 — shared phenotype substrate

Implement only:

- body specification;
- equipment mass contribution;
- derived locomotion;
- shared body contact;
- posture/brace;
- shield geometry/contact;
- simple compact weapon action;
- minimal world geometry.

No polished opponent yet.

### P1 — two anchor organisms

Create Bulwark and Skirmisher configs from the same substrate.

Agent-rehearse the qualitative discriminator.

If they collapse into the same strategy, stop before adding more content.

### P2 — continuity hybrid

Create one awkward hybrid.

If continuity fails, fix the shared model or abandon the premise.

Do not paper over it with role-specific code.

### P3 — integrated pressure cell

Add only enough opponent/world pressure to let the two phenotypes express their differences.

### P4 — Owner eligibility review

Ask:

- are the organisms qualitatively different in ordinary play?
- does the world relation create the difference?
- has the build become a small game interaction rather than a mechanics viewer?
- is Owner attention now likely to produce evidence unavailable to automation?

Only then deploy an Owner candidate.

### P5 — third phenotype only after evidence

A reach / polearm phenotype is the most likely third anchor.

Do not implement it merely because Terrarium already had spear code.

The third anchor must earn itself after the body/equipment premise survives.

---

## 16. Promotion / falsification rule

### Promote the direction only if

- Bulwark and Skirmisher provoke visibly different natural strategies;
- the difference is explainable through shared body/equipment/world rules;
- the hybrid remains coherent;
- the world matters;
- the controls remain responsive;
- the Owner expresses at least some desire to explore / improve the interaction.

### Kill or refound the direction if

- role identity is mostly narrated by labels;
- class-like exceptions proliferate;
- heavy means sluggish;
- light means fast circle-strafe;
- brace becomes a buff state;
- shield becomes hidden damage reduction;
- the world becomes a route puzzle rather than useful combat space;
- Owner play again reports that the organism is simply bad / unplayable.

---

## Working invariant

> **The first victory is not “we built a tank and a rogue.”  
> The first victory is “the same world laws produced two different, understandable ways of being effective.”**
