# LINE / IMPULSE Organism v0

**Status:** active hypothesis, pre-kernel  
**Owner play:** not eligible  
**Predecessor:** Adversarial Combat Organism v1 — whole-organism FAIL, donors retained

## 0. Why this lane exists

Several melee-centered organisms have now failed for different local reasons.

The recurring warning is more important than any one failure:

> **a spatial relation can be mechanically real and even tactically useful in isolation, yet disappear from the actual fight when ordinary compact offense removes pressure faster than the relation matters.**

Examples already preserved:

- O1 stance/contact could matter under sustained pressure, then collapse once compact offense / cleave erased pressure;
- A2b body screening was physically real, survived coarse perception and could protect the player with zero friendly damage, yet produced **0 / 24** combat-outcome improvements once ordinary compact melee offense was restored.

The next discovery object therefore moves outside the same compact-melee loop.

It asks whether the **offense itself can be a spatial relation**.

---

## 1. Core hypothesis

> **A ranged combat organism becomes interesting when a shot is a real line through a material world, and impact changes position / commitment — not merely HP at a distance.**

The player should care about:

- which body is actually first on the line;
- whether the line is obstructed;
- whether a shot can materially alter an approaching body;
- whether repositioning creates a better line than firing immediately;
- whether impact changes the next spatial state;
- whether close pressure destroys the clean line before the shot is ready.

This is not yet a bow system for Feniks.

It is a whole-organism discovery hypothesis.

---

## 2. Player action surface

Keep the first control vocabulary intentionally small:

- responsive WASD locomotion;
- mouse aim;
- **hold LMB to draw / prepare**;
- **release LMB to fire once minimum draw is reached**;
- no target lock;
- no dodge / i-frames;
- no melee fallback button in v0;
- no separate knockback / push ability;
- movement remains live while drawing and firing.

The player chooses **when to release**.

The action should not automatically fire at an optimal moment.

A first implementation may use a fixed useful draw threshold rather than a full strength curve.

Do not add stamina, ammunition economy or skill trees in this lane.

---

## 3. Realized projectile truth

The projectile is a simulated world object.

Required facts:

- finite projectile speed;
- no homing;
- world-space path;
- first solid wall/body consumes the shot;
- body radius matters to interception;
- impact point is real;
- projectile damage and projectile impulse are separate quantities;
- one projectile can affect at most one solid target;
- same-step consequence resolution cannot erase an already committed projectile contact.

A body between shooter and target is not a UI target-selection problem.

It is material cover.

---

## 4. Impulse truth

Impact carries a bounded world-space impulse.

The same impulse should affect bodies differently through shared properties such as mass.

Initial intent:

- light body: visibly displaced by a strong clean hit;
- heavy body: materially more resistant;
- no hidden `if light` / `if heavy`;
- no magical stun state;
- no forced attack cancel merely because damage landed.

If a committed dash is displaced enough that its locked geometry no longer intersects the player, that is a spatial interruption.

If it still reaches the player, the shot did not magically parry it.

This is important:

> **impulse changes reality; it does not grant a status-effect exemption from reality.**

---

## 5. Adversary identity remains part of the organism

Do not regress to generic W1 pressure.

A1 v1 produced one donor that survived serious agent-side falsification:

- light **dash-line** commitment;
- heavy **sweep-arc** commitment;
- one shared seek -> prepare -> commit -> recover lifecycle;
- action geometry as equipment/action data, not hidden role code.

LINE / IMPULSE may reuse those concepts later, but must not copy the old pair wholesale.

### First adversary pressure

The first live pressure should be a **light committed rusher** whose dash-line:

- has a readable prepare;
- captures direction;
- does not home during commit;
- can physically overshoot;
- remains dangerous if the player simply fails to leave the line.

Research question:

> **Can a projectile's real impact displace the rusher enough to alter a committed line, while still leaving ordinary movement / sidestep as another legal answer?**

### Second adversary pressure — only after the first survives

A heavier body may later test:

- mass resistance to the same impulse;
- first-solid-body screening;
- broad space denial;
- whether the player must reposition to expose the lighter threat rather than shooting through the heavy body.

Do not introduce it merely to increase difficulty.

---

## 6. World relation

The world participates through real line obstruction.

Minimum future place:

- one open firing relation;
- one solid obstruction;
- one side route / angle;
- enough circulation that no single cover spot is the authored answer.

The same obstruction should be ambiguous:

- it can protect the player from a clean approach line;
- it can also block the player's shot;
- it can split pressure;
- it can remove the room needed to reposition for a better line.

No invisible combat walls.

No cover flag.

No binary "in cover" state.

---

## 7. Desired player-facing phenomenon

The organism is not trying to make the player "aim better".

The desired discovery is:

> **I sometimes move first because the line I have now is strategically bad, even though I technically could shoot.**

Useful examples:

- wait half a second for two bodies to separate;
- move laterally to expose the dangerous body;
- shoot a committing light body to alter its approach;
- choose not to waste a shot into a heavy blocker;
- use a wall to buy draw time, then leave cover to create a line;
- trade ground for shot quality without retreating forever.

If the correct behavior is simply "keep distance and click whenever ready", the organism fails.

---

## 8. 30-second discriminator

Before Owner eligibility, a normal fight should make these facts visually plausible without debug:

- the player can see a bad line and decide not to fire;
- one body can genuinely screen another;
- a projectile can visibly alter a light body's trajectory;
- the same impact does much less positional work on a heavy body;
- a wall can save the player **and** deny a shot;
- close pressure creates urgency without requiring a dodge button.

The hoped-for future Owner-level language is closer to:

- "nie mam czystej linii";
- "ten duży zasłania małego";
- "trafiłem go i zepchnęło go z wejścia";
- "musiałem wyjść zza osłony, żeby dostać linię";
- "strzeliłem za wcześnie i zmarnowałem okazję".

Not:

> "to po prostu łuk zamiast miecza."

---

## 9. Pre-registered hard falsifiers

### Projectile spam

FAIL if:

- firing whenever possible is as good as line preparation;
- the shot rate itself carries the encounter;
- repeated impacts permanently stunlock a body.

### Backwards kite

FAIL if:

- pure backwards movement + firing safely clears open pressure;
- the player can disengage indefinitely because pursuit cannot engage;
- world boundary becomes the hidden balancing mechanism.

### Binary cover peek

FAIL if:

- optimal play becomes stand behind one obstacle -> peek -> shoot -> repeat;
- cover has no cost except temporary line blocking;
- one authored cover location solves the encounter.

### Ranged HP subtraction

FAIL if:

- removing impact impulse leaves the meaningful strategy unchanged;
- first-solid-body truth rarely matters;
- body mass affects only damage taken / HP.

### Pinball

FAIL if:

- impact displacement produces noisy or comedic body motion that is hard to read;
- repeated impulses dominate through chaos rather than decisions;
- collision instability becomes the main skill check.

### Hidden AI respect

FAIL if:

- adversaries must know the projectile line and politely avoid it for the organism to work;
- AI dodges shots through privileged future knowledge;
- "threat" exists because AI reads a hidden range field.

### Melee relapse

FAIL if:

- a melee fallback becomes necessary before the ranged organism itself demonstrates value;
- close combat is reintroduced simply to hide weak ranged play.

---

## 10. Donor boundaries

### Reuse deliberately

From A1 v1:

- locked dash-line commitment;
- readable prepare / commit / recover lifecycle;
- bounded reaction-delay methodology.

From A2b:

- first-solid-body authority;
- body as material occluder / interceptor;
- matched authority ablations;
- coarse-perception falsification discipline.

From prior combat research:

- responsive locomotion;
- same-step consequence symmetry;
- world collision;
- exact-SHA / CI / deployment discipline.

### Do not inherit by default

- compact player melee strike;
- O1 shield / brace;
- O2 spear / range-band logic;
- generic W1 cheap pressure;
- A2 pair layouts;
- A2 screen policies;
- old Broken Yard as the required map.

Donor evidence is not architecture.

---

## 11. Experimental sequence

### L0 — projectile / impulse causal kernel

Prove only:

- finite projectile travel;
- first-solid-body body/wall hit;
- one-target authority;
- visible impact point;
- bounded impulse;
- mass-dependent displacement through shared law;
- no hidden stun / invulnerability;
- live locomotion while drawing;
- draw / release input state is deterministic.

No full enemy encounter.

## 10.1 L0 result — CAUSAL KERNEL QUALIFIED

Checkpoint:

- kernel commit: `d78ba1f0111d51cfcc4f99dc8f0da7a75656719c`;
- deterministic suite: **10 / 10 PASS**;
- Owner play: **NOT REQUESTED**.

L0 demonstrated:

- deterministic hold-to-draw / release semantics;
- early release produces no shot;
- locomotion remains live during draw;
- projectile travel is finite, not hitscan;
- swept collision prevents tunneling through a small body at a large timestep;
- first solid wall consumes a shot before a body behind it;
- first solid body consumes a shot before farther bodies;
- one projectile affects one solid target;
- the same damage / impulse contract displaces a light body materially more than a heavy body through mass alone;
- impulse delta speed is bounded;
- impact changes velocity without introducing stun, i-frames or forced state cancellation.

Evidence boundary:

> **projectile / line / impulse mechanism = qualified; combat organism = untested.**

Before L1, projectile contact measurement is being separated from consequence application so same-step committed hostile contact cannot be erased by execution order.

---

### L1 — committed rusher interaction

One light dash-line adversary in open space.

Required red-team policies:

- stand + fire;
- backwards kite + fire;
- lateral evade only;
- fire-on-prepare;
- fire-on-commit;
- intentionally hold shot / reposition.

Key question:

> **does projectile impulse create a second real answer to commitment without replacing movement or becoming an automatic interrupt?**

If backwards kite dominates, stop.

If every timely shot nullifies every dash, stop.

## 11.1 L1 first matrix — CURRENT COMBAT CONTRACT FAILS BEFORE COMMITMENT

Initial L1 checkpoint:

- integration commit: `8077f9bc7680930a83ffd22733ce747d540daabc`;
- deterministic suite: **15 / 15 PASS**;
- world boundary use: zero in all tested policies.

The default start placed the player and rusher ~500 px apart.

Results:

- stand + fire: CLEAR in **0.875 s**, 100 HP;
- max-rate fire: CLEAR in **0.875 s**, 100 HP;
- backwards kite + fire: CLEAR in **1.000 s**, 100 HP;
- in all three cases the rusher entered **0 prepare / 0 commit** states.

Two projectile hits killed the 80 HP rusher before engagement existed.

Timing policies only became meaningful because they voluntarily withheld the shot:

- fire on prepare: CLEAR, 66 HP;
- fire on commit: CLEAR, 32 HP;
- lateral + commit shot: CLEAR, 66 HP, one real missed commit;
- lateral movement with no shot: DOWN after three hits, but generated one real miss.

Interpretation:

> **The first L1 combat contract fails the pre-registered projectile-spam / ranged-HP-subtraction gate.**

Do not rescue this result by increasing rusher HP or reducing projectile damage until a target matrix appears.

### Diagnostic next question

The deeper LINE / IMPULSE hypothesis can still be falsified independently of lethality.

Run an **engaged-start, impulse-only** diagnostic:

- projectile damage = 0;
- same projectile speed;
- same impulse;
- rusher starts close enough to enter readable commitment;
- no world boundary support.

Ask:

1. does max-rate impulse create a physical stunlock / permanent disengagement?
2. does release timing relative to prepare / commit materially change missed-commit rate or player survival?
3. can lateral movement remain a separate legal answer?
4. does impulse change commitment geometry without a hidden attack cancel?

This is a mechanism-discovery diagnostic, not a new product configuration.

---

## 11.2 L1 engaged ablation — IMPULSE DOES NOT EARN THE ORGANISM

After fixing diagnostic plumbing, the same engaged-start experiment was repeated correctly.

Checkpoint:

- corrected engaged diagnostic: `0750c317d4e8a3d9dfe0da7c1aa567ffcdf8a698`;
- deterministic suite: **17 / 17 PASS**;
- world boundary use: zero in all engaged diagnostics.

### Impulse-only

Projectile damage was set to zero while retaining the same projectile speed and impulse.

Results:

**max-rate fire, stationary**
- DOWN at 2.825 s;
- 11 projectile impacts;
- 3 rusher hits;
- 3 commits;
- 0 missed commits.

**fire on prepare**
- DOWN at 2.825 s;
- 3 projectile impacts;
- 3 rusher hits;
- 0 missed commits.

**fire on commit**
- DOWN at 2.825 s;
- 2 projectile impacts;
- 3 rusher hits;
- 0 missed commits.

**lateral movement only**
- DOWN at 4.367 s;
- 4 commits;
- 1 missed commit.

**lateral movement + commit shot**
- DOWN at 4.250 s;
- 3 projectile impacts during commit;
- 4 commits;
- 1 missed commit.

Thus the tested projectile impulse adds no demonstrated commitment-breaking value beyond the lateral movement that already creates the miss.

### Backwards retreat + impulse-only

The opposite failure appears when continuous retreat is added:

- ACTIVE after 10 s;
- player HP 100;
- rusher HP 80;
- 40 shots / 39 projectile impacts;
- only 1 prepare / 1 commit;
- that single commit missed;
- 0 rusher hits;
- 0 boundary frames.

This is not a kill loop.

It is worse for the hypothesis:

> **repeated physical impulse plus backwards movement can suppress engagement indefinitely without creating a fight.**

### Normal vs damage-only

The same engaged policies were compared with:

- normal projectile: damage + impulse;
- damage-only projectile: identical damage, zero impulse.

Results were effectively the same in every tested policy:

- max-rate: both CLEAR at 0.558 s, 100 HP;
- backwards kite: both CLEAR at 0.642 s, 100 HP;
- fire on prepare: both CLEAR at 1.558 s, 66 HP;
- fire on commit: both CLEAR at 1.717 s, 32 HP;
- lateral + commit shot: same hits / misses / HP, only ~0.05 s clear-time difference.

Therefore:

> **the current lethal fight is carried by ranged HP subtraction; the tested impulse is not responsible for its strategy.**

This directly triggers pre-registered hard falsifiers:

- projectile spam;
- backwards kite;
- ranged HP subtraction;
- physical disengagement / effective impulse-lock under retreat.

Do not proceed to L2 obstruction.

Do not tune:

- rusher HP;
- projectile damage;
- draw time;
- impulse magnitude;
- pursuit speed;
- arena size;

to manufacture a favorable matrix after this result.

---

## 11.3 LINE / IMPULSE Organism v0 verdict — WHOLE-ORGANISM FAIL, KERNEL DONOR RETAINED

What survives:

### L0 projectile / world kernel

- finite projectile travel;
- swept collision / no tunneling;
- first-solid-body / first-solid-wall authority;
- deterministic draw / release;
- live locomotion during draw;
- one-projectile / one-solid-target consequence;
- bounded impact impulse;
- mass-dependent displacement from one shared law;
- projectile consequence can be measured before application for same-step authority;
- no hidden stun, i-frames or forced state cancel.

### L1 adversary donor

- light rusher uses a readable prepare;
- commit direction locks and does not home;
- same-step projectile impact does not erase an already committed hostile hit.

What failed:

- a normal lethal projectile deletes the rusher before meaningful engagement;
- timing the shot to prepare / commit does not outperform ranged damage in a new qualitative way;
- removing impulse leaves lethal fight outcomes essentially unchanged;
- impulse-only does not reliably create commitment misses;
- backwards retreat + repeated impulse can suppress engagement without boundary support.

Product conclusion:

> **LINE / IMPULSE v0 does not produce a combat organism worth Owner attention.**

Owner eligibility: **NO**.  
Browser deployment: **NOT WARRANTED**.

### Campaign-level implication

This is now broader than one bad projectile constant.

Across several independent organisms, we repeatedly see one of two collapses:

1. **offense deletes the relation before spatial play develops**, or
2. **movement + spacing lets the player suppress engagement instead of interacting with it**.

This suggests the next move should not be another immediate weapon archetype.

The campaign needs a higher-level refoundation of:

- what counts as a combat exchange;
- how offense earns consequence;
- how engagement remains voluntary/responsive without becoming infinitely suppressible;
- how player and adversary intent become readable before resolution;
- how Feniks progression / body / equipment axes could deepen that language rather than merely scale damage or speed.

Next step:

> **perform a cross-campaign combat-discovery audit before implementing another organism.**

---

### L2 — obstruction relation

Only after L1 survives.

Introduce one obstruction and compare:

- open line;
- blocked line;
- lateral angle creation;
- cover-hug / peek spam;
- moving away from cover to gain a shot.

The wall must both help and constrain.

### L3 — first-solid-body adversary relation

Only after L2.

Add a materially heavier body if needed to test:

- screening;
- mass resistance;
- line creation;
- whether the player moves to expose a target rather than spamming the blocker.

No formation script.

### L4 — whole-organism red-team

Required attacks:

- max-rate fire;
- permanent retreat;
- cover peek loop;
- target-nearest;
- target-light;
- target-heavy;
- no-impulse ablation;
- infinite-mass / equal-mass comparison;
- obstacle removal;
- projectile-speed sweep across a **broad** range, not one magic value.

### L5 — Owner eligibility

Only if:

- at least three materially different legal responses survive;
- line / obstruction decisions affect ordinary combat;
- impulse matters without becoming stun;
- opponent bodies matter as material objects;
- backwards kite / spam / cover peek are bounded;
- normal presentation makes projectile and commitment causality readable;
- browser runtime is stable and provenance-verified.

No Owner deployment before this gate.

---

## 12. Evidence boundary

Machine evidence may qualify:

- projectile integration;
- collision / first-hit ordering;
- impulse math;
- finite-state stability;
- deterministic action lifecycle;
- broad exploit falsifiers;
- provenance.

Machine evidence cannot qualify:

- whether aiming feels good;
- whether draw timing feels responsive;
- whether impact feels satisfying;
- whether line management is intuitive;
- whether the organism creates curiosity / mastery;
- whether the player wants another fight.

Those remain Owner evidence.

---

## Working invariant

> **A shot is valuable only if the line and its consequence make the next decision different.**
