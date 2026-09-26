# Feniks Combat Refoundation — phenotype before attack engine

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> This file preserves the research state at its date. Any `active`, `current` or `next` wording below is historical. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Date:** 2026-09-21  
**Status:** active research correction after Ruined Gate Terrarium Owner FAIL  
**Scope:** Combat Lab -> Feniks combat discovery

## 0. Critical correction

The Owner-qualified Ruined Gate Terrarium at `47210b16cc9a32d2d53ca42875ca7af5c6b318b3` is **rejected as a combat organism**.

This is not a request to tune opponent aggression, sword timing, recovery, damage, hit feedback or spear spacing.

The latest Owner play evidence is stronger than the green technical gate:

> the specimen is still very bad and effectively unplayable as a direction worth pursuing.

The ~26 s recording is short but sufficient to falsify the current organism. The Owner stays on the sword, repeatedly enters the same close melee collapse, wins one exchange and immediately encounters essentially the same fight shape again. The gate/world geometry rarely becomes an interesting decision. Better hit ownership feedback explains consequences more clearly, but it does not create richer causes or choices.

The useful lesson is:

> **Combat Lab optimized causal correctness inside an organism whose player-facing possibility space was still too poor.**

The Terrarium is preserved as negative evidence and as a donor of bounded mechanisms. It is not the foundation of the next combat specimen.

---

## 1. Recovered Feniks frame

Combat is not supposed to be an isolated melee minigame. It is one expression of the same character/world relationship used by movement, equipment, traversal, body contact, party play and later world simulation.

### 1.1 Gameplay veto

The durable tension is:

> **PLAYER INTENT <-> PHYSICAL CONSEQUENCE**

Physicality is useful when it gives the player weight, momentum, collision, pushing, impacts and emergent interaction. It is not the product identity and must not outrank responsiveness, legibility or fun.

Therefore:

- inertia is not automatically weight;
- simulation detail is not automatically depth;
- controller difficulty is not mastery;
- arbitrary animation lock is not commitment;
- material rules should survive only when they create better decisions or stronger world coherence.

### 1.2 Roles should emerge; hard classes should not define the world

Feniks wants recognisable roles such as tank, archer, mage, healer and hybrids to emerge naturally from specialisation.

The world should not need a `class = tank` or `class = archer` flag to make those roles real.

A role may emerge from shared properties such as:

- body size / envelope;
- body mass;
- equipment mass;
- carrying capacity;
- acceleration / braking;
- momentum resistance;
- agility / turnability;
- armour weight;
- weapon geometry;
- weapon handling;
- shield / coverage geometry;
- stance / posture;
- learned techniques;
- magic capability;
- preparation and carried tools.

The exact RPG-stat model is **not** decided. These are design pressures, not a frozen spreadsheet.

### 1.3 Specialisation should matter without forbidding hybrids

A strong specialisation should change what the character can effectively do enough that party composition matters.

At the same time:

- contradictory roles may be difficult or costly, not forbidden;
- hybrids should remain possible;
- unusual builds should not be rejected by arbitrary vocation restrictions;
- balance should be discovered empirically in play before an abstract class matrix is invented.

This implies a crucial Combat Lab requirement:

> when the lab demonstrates a role, it must be able to explain that role through shared world/body/equipment rules rather than a role-specific switch.

### 1.4 Progression should be biographical, not a loot treadmill

Feniks does not need a shower of interchangeable legendary items.

A stronger target is:

> “I have had this character for months and I remember where I got this sword.”

A new character may be slow, weak and limited. A developed character may become substantially faster and more explosive. Combat therefore cannot assume that one fixed tempo, one fixed body response or one narrow duel cadence represents the whole game.

Progression does **not** need to be implemented in the next Combat Lab specimen, but the specimen should expose meaningful axes that progression could later change.

### 1.5 Combat pace is allowed to scale dramatically

The final combat model is still open.

Feniks may eventually contain:

- deliberate heavy melee;
- fast mobile melee;
- ranged projectiles;
- magic;
- high-throughput horde combat;
- richer elites / commanders / minibosses;
- rare high-budget bosses.

A system that only works for one equal-body sword duel is therefore a dangerously narrow research target.

---

## 2. Body is gameplay, not a collider attached to combat

A Feniks actor can eventually differ materially through body and equipment.

High-value pressures already recovered from Owner discussion include:

- a large heavy tank may physically hold a passage better than a light actor;
- the same heavy actor may move poorly through tight geometry;
- a small goblin-like body may exploit spaces the tank cannot;
- contact can be soft, resistant or stance-dependent rather than a universal hard capsule rule;
- a defensive stance may increase contact resistance / space-holding;
- squeezing through a gap may deliberately trade away resistance, control or defense;
- pushing / displacement can be tactically meaningful without becoming a physics fetish.

These are **not immediate implementation requirements** for every specimen.

They are falsifiers for any proposed combat architecture: if the architecture makes these ideas awkward special cases, it is probably too narrow.

---

## 3. Weapon identity should be a relation, not a data row

The current sword/spear Terrarium proved some bounded mechanical differences, but Owner play still collapsed into a generic close-contact loop.

The deeper Feniks pressure is that weapons may differ through:

- reach;
- occupied space;
- clearance;
- response / handling;
- mass / commitment;
- contact;
- recovery;
- movement relation;
- stance relation;
- terrain relation;
- body requirement;
- shield interaction;
- projectile / line-of-sight relation where relevant.

A spear should not merely be “sword + longer reach”.

A heavy shield should not merely be “damage reduction”.

A bow should not merely be “melee attack with projectile=true”.

The desired question is:

> **what new strategy becomes natural because this body + equipment + world relationship exists?**

---

## 4. Movement and evasion remain part of combat truth

Owner pressure remains against universal dodge-roll / i-frame combat.

A miss should primarily come from actual relation:

- the body left the threat geometry;
- the threat was redirected or intercepted;
- spacing changed;
- terrain broke the attack relation;
- a body / weapon / shield changed contact;
- a deliberately authored forgiveness rule helped legibility without replacing spatial truth.

Movement should remain controllable during attacks unless a physical or gameplay reason earns a limitation.

Different bodies may eventually have radically different evasive capability. That diversity is more interesting than one universal dodge action.

---

## 5. Terrain must create tactics, not decorate a duel

The Ruined Gate had geometry, but the Owner recording shows that geometry existing is not enough.

A meaningful world-combat relation should create actions such as:

- hold this doorway;
- avoid this doorway with a long weapon;
- flank through space a heavy body cannot use well;
- use open space to preserve reach;
- exploit cover / occlusion for ranged pressure;
- push or displace through a constrained relation;
- use support/elevation/topology later when those systems earn entry.

Long-term Feniks pressures include 2.5D / vertical continuity, support surfaces, material topology, embodied carrying and permissive world-grounded interaction.

These remain **future pressure / architecture falsifiers**, not a mandate to put crates, climbing, roofs and full verticality into the next combat prototype.

The next specimen needs only enough spatial structure that body/equipment differences become tactically visible.

---

## 6. Co-op and natural party composition are architectural pressure

Feniks is interested in small co-op rather than a permanently solo combat model.

This matters even before networking is implemented.

A useful combat language should plausibly support:

- one actor holding space while another attacks around them;
- reach / ranged roles exploiting openings created by another body;
- heavy and light actors valuing different routes;
- revive / protection / retreat situations later;
- unusual hybrid loadouts without class permission checks.

The next Combat Lab need not implement co-op.

It should avoid proving a combat language that only makes sense in symmetric one-on-one duels.

---

## 7. Why Ruined Gate Terrarium failed

### 7.1 Attack-engine centricity

The specimen was organized around:

- movement;
- facing;
- cut;
- thrust;
- weapon contact.

That produced a technically coherent strike loop, but too little player possibility.

### 7.2 Uniform-body collapse

Player and opponent had different constants, but not meaningfully different embodied identities.

The player did not experience:

- a body role;
- meaningful armour/equipment burden;
- space-holding;
- stance-dependent contact;
- body-specific routes;
- a reason to value one spatial relation over another beyond weapon distance.

### 7.3 The world behaved like collision scenery

The gate could discriminate spear cut vs thrust in tests, yet the Owner did not naturally experience the level as a tactical place.

Machine evidence proved geometry effects that play did not promote into meaningful strategy.

### 7.4 More readable consequence did not create richer agency

`YOU HIT`, `YOU TOOK`, local HP and contact feedback improved causal reporting.

They did not answer:

> **what interesting thing can I intentionally do next?**

### 7.5 Agent rehearsal answered the wrong-level question

The spear rehearsal eventually proved that a competent controller can preserve a useful range band.

That is valid mechanism evidence.

It is not evidence that a human naturally discovers, enjoys or wants to master that range game.

### 7.6 The organism had no progression-shaped future

There was no visible path from the generic body + sword loop toward:

- heavy shield specialist;
- mobile skirmisher;
- reach specialist;
- ranged specialist;
- hybrid;
- physically unusual character;
- long-lived equipment identity.

That is a warning that the research object itself was too narrow.

---

## 8. New research question

The next active question should be:

> **Can distinct combat roles and strategies emerge from shared body + equipment + world rules, while controls remain responsive and no hard class flag decides what the character is?**

This question is intentionally broader than melee attack control and narrower than “build the Feniks RPG”.

It asks whether the world can generate meaningful **combat phenotypes**.

---

## 9. New discovery object: Phenotype Combat Ecology

Working name:

> **PHENOTYPE COMBAT ECOLOGY v0**

This is not a progression system and not a class system.

It is a small research slice where a few deliberately extreme character/equipment anchors expose whether shared rules can produce qualitatively different play.

### 9.1 Anchor organisms are not classes

Each anchor is a test point in a continuous possibility space.

The implementation must not depend on hidden branches such as:

```text
if class == TANK
if class == SKIRMISHER
if class == SPEARMAN
```

Instead, the role should follow from shared properties / equipment / stance / techniques.

Discrete learned techniques are allowed later. They cannot be used as fake evidence that the underlying role emerged naturally.

### 9.2 Candidate anchor A — ANCHOR / BULWARK

Research phenotype:

- large/heavy body;
- high equipment mass;
- large shield or equivalent persistent coverage;
- compact weapon;
- lower acceleration / turnability;
- high contact resistance in an explicit defensive posture.

Expected natural strategy:

> occupy valuable space, hold a passage, make frontal approach expensive, accept/redirect contact instead of chasing.

30-second discriminator:

- the Owner should naturally stop trying to circle/chase like the current Terrarium;
- holding a useful line should become a real strategy.

Primary falsifier:

- “tank” is only slower movement + more HP;
- shield is just damage reduction;
- doorway control requires invisible collision cheats.

### 9.3 Candidate anchor B — REACH / SPACE CONTROLLER

Research phenotype:

- medium/light body;
- long spear/pole weapon;
- strong open-space reach;
- meaningful clearance / turning cost;
- weak performance after close collapse.

Expected natural strategy:

> preserve / create distance, choose lanes, make approach dangerous, dislike tight geometry.

30-second discriminator:

- the Owner should begin treating open space and narrow space differently without needing telemetry.

Primary falsifier:

- optimal play is just continuous backwards kiting;
- the opponent can ignore occupied reach until a damage frame;
- role exists only because AI politely respects a radius.

### 9.4 Candidate anchor C — MOBILE / SKIRMISHER

Research phenotype:

- light body;
- low contact resistance;
- strong acceleration / turning;
- compact weapon or another close tool;
- high ability to leave threat geometry;
- poor outcome when pinned by heavy contact.

Expected natural strategy:

> use angle, route and timing; enter/leave close space deliberately; avoid winning by frontal mass.

30-second discriminator:

- movement itself becomes a weapon/defense, not a universal dodge button.

Primary falsifier:

- this is merely “same character but faster”;
- success reduces to circling an AI that cannot track;
- soft collision becomes slippery/noisy rather than legible.

### 9.5 Ranged / magic are important, but second-wave

Feniks needs eventual evidence for ranged and magic roles.

Do not add them to the first phenotype slice merely to claim completeness.

Once shared body/equipment/world relations survive a first Owner pass, a ranged anchor can test:

- line of sight;
- cover;
- projectile truth;
- preparation / ammunition;
- pressure when rushed;
- party synergy.

Magic should remain even later unless a specific combat question demands it.

---

## 10. Shared world situation for the next specimen

Do not build another symmetric duel arena.

The minimum place should contain a few **affordances**, not feature count:

- one open lane;
- one meaningful choke / doorway;
- one alternative route or side relation;
- one piece of cover / obstruction that matters differently to different bodies/weapons.

Opponent pressure should also stop being one generic duelist.

A small mix is more informative, for example:

- one light/fast pressure body;
- one heavier space-holding body.

The exact enemy set remains open until implementation planning.

The goal is not “more AI”.

The goal is to make the same world ask different questions of different phenotypes.

---

## 11. Continuity / no-class falsifier

After the anchors become visibly distinct, Combat Lab must test that they are not secretly handcrafted classes.

Possible continuity checks:

- replace the shield;
- add/remove equipment mass;
- change body envelope;
- change stance/contact resistance;
- change weapon length/handling;
- trade acceleration for protection;
- create one intentionally awkward hybrid.

The resulting character should move through the phenotype space coherently.

If the system only works at three handcrafted presets, the classless claim fails.

---

## 12. Progression pressure without implementing progression

The next specimen should expose parameters / capabilities that later progression could plausibly affect, such as:

- handling a heavier weapon with less control loss;
- maintaining useful movement under armour load;
- changing acceleration / braking / turn authority;
- improving stance transition or stability;
- carrying more equipment;
- using a weapon geometry effectively;
- learning a discrete technique.

Do **not** implement XP, levels, skill trees or loot rarity in this phase.

The test is architectural/gameplay pressure:

> can character growth deepen an already meaningful physical/gameplay identity instead of merely increasing damage numbers?

---

## 13. What remains future pressure, not current scope

Keep visible but do not implement by default:

- full 2.5D / constrained-3D spatial substrate;
- vertical projectile continuity;
- support surfaces and crate topology;
- embodied carrying;
- destructible/reactive terrain;
- fog/perception;
- LOD's World simulation attention;
- SPC/LLM social interpretation;
- full co-op;
- full inventory / expedition preparation;
- magic ecosystem;
- death/recovery system.

These are architecture falsifiers and future opportunities.

They are not a feature checklist for Combat Lab vNext.

---

## 14. Promotion gate for the next organism

Machine evidence may qualify:

- runtime stability;
- geometry;
- contact math;
- shared-property continuity;
- no hidden class-specific code in the claimed base role;
- exact deployment provenance.

Owner evidence must qualify:

- whether each phenotype is immediately understandable;
- whether the Owner naturally behaves differently;
- whether the differences feel empowering rather than restrictive;
- whether terrain changes decisions;
- whether body/equipment identity is felt rather than narrated;
- whether any phenotype creates a desire to learn / improve;
- whether hybrids feel plausible rather than forbidden;
- whether the world begins to feel like a place that can support a larger RPG.

### Hard stop

Do not polish a phenotype merely because its automated metrics look distinct.

If the Owner again says “still unplayable / very bad”, return to organism design rather than tuning constants.

---

## 15. Immediate execution sequence

1. Preserve Ruined Gate Terrarium as rejected Owner evidence.
2. Stop all feel tuning on that organism.
3. Restore public truth away from the rejected experiment.
4. Create a clean next experiment lane from an appropriate base rather than piling new systems into Terrarium.
5. Implement only the shared substrate required to express body/equipment phenotypes.
6. Build the first two extreme anchors before adding presentation polish.
7. Add the third anchor only if the first two are qualitatively distinct in agent rehearsal.
8. Perform the continuity/no-class falsifier before an Owner gate.
9. Build enough world pressure that the anchors naturally want different spatial strategies.
10. Only then spend Owner attention again.

---

## Working invariant

> **Feniks combat should be discovered as a relationship between character, equipment, movement and world — not as an attack engine that later receives RPG systems.**
