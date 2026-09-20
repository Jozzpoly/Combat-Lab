# Combat Lab — Discovery Campaign v1

**Phase:** divergent combat-language discovery  
**Authority:** subordinate to `docs/RESEARCH_STATE.md` and newest Owner play evidence  
**Goal:** create the first comparison in which different candidates actually ask the player to fight differently.

## 1. Critical correction

The previous A/B/C framing mixed two independent questions:

1. **How does the player express combat intent?**
2. **How is that intent realized by the body / weapon / world?**

That hid an important hybrid: simple discrete attack input with materially consequential weapon/contact resolution.

The first discovery campaign therefore uses a deliberate **2 × 2 set of extreme organisms**.

This matrix is a research scaffold, not a claim that final Feniks combat belongs to one quadrant.

## 2. The two axes

### Intent expression

**Continuous**

Input during the action keeps shaping weapon/body intent. The path taken by the player's hand/cursor matters after initiation.

**Discrete**

The player selects a compact action intent. The game carries most of the detailed motion execution while the player continues to position the body.

### Motion / contact realization

**Authored / kinematic**

The weapon follows a designed, controllable trajectory. Contact is a factual spatial event, but contact response is an explicit game rule rather than an emergent rigid-body solution.

**Material / coupled**

Mass, velocity, body state and/or contact constraints can alter the realized motion. A strike is not guaranteed to trace its nominal path merely because the action was requested.

Neither side is presumed superior. The material lanes exist to prove that their extra causality produces gameplay value.

## 3. Four discovery organisms

| | Authored / kinematic realization | Material / coupled realization |
|---|---|---|
| **Continuous intent** | **A — DIRECT** | **C — COUPLED DIRECT** |
| **Discrete intent** | **B — ACTIONS** | **D — COUPLED ACTIONS** |

### A — DIRECT

**Player action**

- WASD controls locomotion.
- Cursor establishes the desired weapon direction around the body.
- Holding LMB enters active weapon manipulation.
- While held, the player's changing cursor angle continuously shapes the blade path.
- Releasing LMB ends offensive drive and returns toward a neutral carried pose.

**Realized behavior**

The weapon remains body-anchored and range-limited, but follows input with intentionally crisp kinematic authority. It does not gain a second hidden physics personality.

Contact with a wall/body is still factual and cannot simply deal damage through geometry, but the response is a simple authored stop/reject/deflect rule.

**30-second discriminator**

The player should start drawing / shaping useful attack paths and deliberately correcting them during contact.

**Why it matters**

This is the strongest agency corner. If direct control can be precise, readable and pleasurable without becoming fiddly, it may unlock a combat language uncommon in top-down RPGs.

**Falsifier**

The optimal play is frantic cursor waving; weapon motion feels detached from the body; or dexterity burden increases without producing meaningful decisions.

---

### B — ACTIONS

**Player action**

- WASD controls locomotion continuously.
- Cursor expresses current aim/facing intent.
- LMB requests a compact cut.
- RMB requests a thrust.
- No hidden combo tree is required for v1.

**Realized behavior**

The game executes two authored trajectories with readable windup / active / recovery structure.

Movement remains meaningfully live during the action. The action may constrain what the weapon can do, but it does not arbitrarily set locomotion to zero.

Contact is resolved by simple explicit spatial rules.

**30-second discriminator**

The player should start choosing *which* action fits the range/angle/opening and placing that action with footwork.

**Why it matters**

This is the low-complexity benchmark. Any deeper physical organism must beat a clean authored solution in actual gameplay value, not in simulation sophistication.

**Falsifier**

It becomes ordinary cooldown-button combat; the body/world relation feels cosmetic; or live locomotion and authored motion visibly fight each other.

---

### C — COUPLED DIRECT

**Player action**

The surface controls intentionally resemble A:

- WASD moves the body.
- Cursor continuously expresses desired weapon/body direction.
- Holding LMB applies active drive rather than directly teleporting the blade to an authored pose.

**Realized behavior**

The player controls *intent/effort*, while body turn, angular velocity, weapon inertia and contact determine the realized weapon state.

Movement can add or remove useful momentum. Contact can redirect or arrest the weapon.

The implementation should use the minimum dynamics required to expose this phenomenon; it is not a mandate for general rigid-body simulation.

**30-second discriminator**

The player should stop merely drawing paths and begin setting up swings through body movement, timing, preload and follow-through.

**Why it matters**

This tests whether physical commitment can emerge from controllable causality instead of animation lock.

**Falsifier**

The player mainly fights inertia, loses confidence about what input will do, or learns that the safest tactic is slow controller babysitting.

---

### D — COUPLED ACTIONS

**Player action**

The surface controls intentionally resemble B:

- WASD locomotion.
- cursor aim/facing intent.
- LMB compact cut.
- RMB thrust.

**Realized behavior**

The requested action supplies a target motion / effort profile, but the actual body and weapon are allowed to be altered by material contact, current movement and limited dynamic response.

A wall, opposing weapon or bad body relationship can meaningfully prevent or deform the requested action instead of the game merely playing through it.

The player does **not** manually pilot every centimeter of the blade.

**30-second discriminator**

The player should begin choosing authored actions not only for nominal range/timing, but for whether the current material relationship gives the action room to happen.

**Why it matters**

This is the missing quadrant. It asks whether Feniks can keep simple, game-like controls while obtaining material consequences and weapon/world credibility.

**Falsifier**

The physical layer merely makes authored actions inconsistent, or its useful consequences can be reproduced more clearly by B with cheap explicit rules.

## 4. Why these four survive the paper falsification

### A vs B

Same low-dynamics corner, different motor grammar:

- A: shape the weapon action continuously.
- B: choose and place an authored action.

### C vs D

Same material/coupled corner, different motor grammar:

- C: continuously drive the embodied system.
- D: choose an action and let the embodied system negotiate execution.

### A vs C

Similar continuous expression, deliberately different realization authority.

If they play the same, deeper dynamics did not earn themselves.

### B vs D

Similar discrete expression, deliberately different realization authority.

This is the cleanest test of whether material resolution adds gameplay value without adding input burden.

## 5. Reference falsifiers, not templates

Existing games demonstrate that these axes can be combined in materially different ways:

- **V Rising / Battlerite lineage:** precise WASD + aimed authored skills/actions — evidence that authored controls can remain strongly spatial.
- **Mount & Blade:** directional attack/block grammar plus meaningful footwork — evidence that authored action selection need not collapse into detached cooldown combat.
- **Exanima:** cursor/body movement and momentum materially shape attacks — evidence for the coupled-direct corner and also a warning about control burden.
- **Hellish Quart:** discrete attack buttons drive authored fencing while physical blades actually clash — direct evidence that discrete intent and material resolution are separable.
- **For Honor:** stance / guard / lock creates a separate intent-state layer; this is evidence to keep target/stance policy orthogonal to the first matrix rather than smuggling it into one quadrant.

None of these defines Feniks.

## 6. Shared combat situation

The organisms share a **problem**, not an attack mechanism.

### Arena

- compact top-down room;
- open central space;
- one offset pillar / short wall creating a real near-obstacle fight;
- hard outer boundary;
- no decorative clutter.

### Player

- same broad body footprint;
- same baseline locomotion speed;
- no i-frames;
- no universal roll;
- no stamina meter in v1;
- no class/progression stats.

Minor locomotion coupling may differ only where C/D require it to expose their hypothesis.

### Opponent

One simple melee duelist applying real pressure.

High-level behavior:

1. approach / track;
2. create readable preparation;
3. commit to a spatial threat;
4. recover / become punishable;
5. repeat with modest spacing variation.

The opponent must be dangerous enough that attack placement and footwork matter, but not sophisticated enough to become the main research subject.

### Match loop

- player and opponent can each sustain a few clean meaningful hits;
- hit / miss / weapon contact / wall contact are readable;
- short death/reset;
- switching organism resets the duel;
- no loot, progression, skills, magic or meta loop.

## 7. Defensive policy for v1

Do **not** add a generic block button merely to equalize the organisms.

Primary defense is real positioning and leaving the threat geometry.

Weapon-to-weapon interception may occur where an organism's representation naturally supports it:

- A/B may use a simple authored clash/reject rule when explicit weapon segments intersect;
- C/D may allow material contact to alter motion.

This asymmetry is acceptable in discovery mode if it is a consequence of the organism rather than a hidden balance patch.

If defense differences dominate the entire Owner result, that becomes the next attribution question.

## 8. Presentation discipline

Default presentation should reveal causality without selling a candidate:

- body orientation;
- visible weapon;
- opponent preparation;
- brief hit/contact feedback;
- current organism label + controls.

Do not show scoreboards such as accuracy or DPS during the initial feel test.

A debug toggle may expose:

- body velocity;
- blade velocity/angular velocity;
- nominal vs realized weapon direction;
- contact point/type;
- current opponent state.

Debug information is diagnostic only.

## 9. Runtime / architecture boundary

The first implementation may share only infrastructure that cannot erase the hypotheses:

**Safe to share**

- canvas/runtime loop;
- input capture;
- arena geometry data;
- reset/mode selection;
- broad opponent intent state machine;
- debug/event recording;
- presentation helpers.

**Must remain organism-owned when relevant**

- player body controller;
- weapon state and trajectory;
- attack lifecycle;
- motion coupling;
- contact response;
- damage/contact authority.

Do not create one generic attack engine with four parameter presets.

Each organism should satisfy a small interface such as reset / update / render / input, but may implement the internals independently.

## 10. Automated qualification

Machine tests may assert:

- all four organisms load and reset;
- no runtime exception under scripted input;
- mode switch clears incompatible state;
- body/world boundaries remain finite;
- contact helpers obey basic geometry invariants;
- C/D dynamics do not explode numerically under the test envelope;
- deployed SHA/ref provenance is explicit.

Machine tests must not declare one organism better.

## 11. Owner campaign

The Owner test is intentionally qualitative.

For each organism, seek evidence about:

- responsiveness;
- causal readability;
- useful footwork;
- body/weapon/world embodiment;
- controllable commitment;
- interesting mistakes;
- interesting mastery;
- desire to continue fighting.

The first test should be free-form. Do not force numerical ratings.

The most valuable output may be a hybrid insight or the rejection of all four.

## 12. Build order

1. shared arena/runtime shell;
2. **B — ACTIONS** as the simplest playable benchmark;
3. **D — COUPLED ACTIONS** while B is fresh, to test whether material resolution earns itself without changing surface controls;
4. **A — DIRECT**;
5. **C — COUPLED DIRECT** while A is fresh;
6. browser/runtime qualification across all four;
7. explicit Pages deployment of the exact qualified experiment SHA;
8. Owner play.

The build order is for implementation efficiency and paired comparison. It does **not** imply preference.

## 13. Stop conditions before Owner play

Do not deploy the campaign as a gameplay comparison if:

- any two organisms remain player-strategy-equivalent;
- a material lane is unstable enough that bugs dominate feel;
- one lane silently depends on target-lock/assist while others do not;
- presentation prevents the player from understanding contact;
- the opponent is so weak that footwork is irrelevant;
- the opponent is so strong/random that control differences cannot be learned.

Fix the experimental instrument first.

## 14. What v1 is not trying to answer

- final Feniks combat;
- final weapon fidelity;
- target lock vs nontarget;
- final camera;
- dodge vocabulary;
- shield system;
- stamina;
- combos;
- ranged weapons;
- magic;
- body archetypes;
- RPG progression;
- multiplayer;
- SPC combat AI;
- verticality.

Those become meaningful after the lab discovers a combat language worth carrying forward.
