# Joint Relational Afterstate Audit

**Date:** 2026-09-25  
**Status:** synthesis complete; no R3 implementation authorized  
**Scope:** Combat Lab / Feniks combat discovery  
**Owner play:** not requested

## 0. Why this audit exists

CONTINUOUS READINESS R0 proved a narrow but important mechanism:

> **the player's tool can inherit a physically meaningful state across actions without automatic neutral reset.**

R1 and R2 then showed that this is not sufficient.

R1:

> readiness changed tool/contact geometry, but movement still decided whether the incoming dash hit.

R2:

> after movement created a real physical overrun, pressure-side geometry still decided immediate follow-through before FREE/WALL readiness history did.

Therefore the next question is not:

> how do we make player readiness stronger?

It is:

> **what afterstate can be jointly owned by multiple material participants, so the next possibilities of both sides are changed by the same relation?**

This audit re-reads preserved donors rather than inventing R3 from scratch.

---

## 1. Working distinction

### Local state

Owned by one actor/tool.

Examples:

- player weapon angle;
- player angular velocity;
- player stance;
- one actor's cooldown;
- one actor's support orientation.

R0 proved that local state can persist.

### Shared instantaneous contact

Defined by more than one material object, but only while they happen to overlap/intersect.

Examples:

- blade intersection;
- shield/body penetration;
- body/body contact;
- weapon/wall contact.

Prior work has many examples.

### Joint relational afterstate

Candidate missing object:

> **a materially defined relation whose consequences survive the initial contact and constrain more than one participant's next useful possibilities.**

It is not a hidden token.

It may be encoded entirely through:

- relative pose;
- contact manifold;
- occupied line/volume;
- support;
- body positions;
- tool positions;
- terrain;
- velocities.

The key requirement is:

> **neither participant should be able to erase the relation instantly through ordinary aim or a single local controller reset.**

---

## 2. Terrarium blade contact — genuinely mutual, but controller-neutralized

Exact Owner-tested source:

- `47210b16cc9a32d2d53ca42875ca7af5c6b318b3`.

### What was genuinely joint

`resolveWeaponContact()` used both realized weapon segments.

When they intersected:

- contact point came from actual segment/segment geometry;
- relative point velocity came from both weapons/bodies;
- a fresh energetic impact altered **both** weapon angular velocities;
- altered **both** radial velocities;
- pushed **both** bodies;
- sustained contact damped both tools rather than firing a binary parry event.

The contact episode itself also persisted:

- `engaged`;
- `separatedFor`;
- `contactTime`;
- last relative speed.

This is the strongest prior two-tool donor.

### Why it was not a relational afterstate

Each weapon still had its own authored desired state.

After the disturbance:

- action recovery continued toward its authored path;
- idle returned toward canonical guard offset / reach;
- spring control kept restoring that local target.

Thus:

> **the shared contact affected two bodies, but each controller treated the result as a disturbance to be independently removed.**

Once segment intersection ended, no jointly owned relation remained.

### Donor retained

Retain:

- segment/segment mutual geometry;
- relative contact velocity;
- symmetric consequence;
- sustained-contact episode distinct from repeated impact.

Do not retain:

- automatic guard attractor;
- contact as merely one-frame clash feedback.

---

## 3. Terrarium weapon/wall contact — world-owned constraint, one-sided semantics

Exact source:

- same Terrarium SHA.

Wall contact:

- is determined by actual segment/world intersection;
- constrains angle/reach;
- reverses/damps angular and radial velocity;
- tracks contact episode;
- does not invent repeated impacts while contact persists.

This is a real **tool ↔ place** relation.

But it still becomes local after separation:

- wall has no state except occupancy;
- weapon controller resumes its own authored target;
- next action does not inherit a shared world relation unless geometry still intersects.

### Donor retained

World geometry can:

> **co-own a readiness state while contact physically persists.**

This may matter later for:

- narrow spaces;
- weapon clearance;
- braced contact against terrain;
- two actors connected through one obstacle.

But wall contact by itself is not the missing combat relation.

---

## 4. O1 shield/body contact — persistent occupied geometry, asymmetric ownership

Exact diagnostic source:

- `c69d609408ccfc7527472b9afe5bad4b75658134`.

### What was real

Shield existed as frontal occupied geometry.

`resolveShieldContact()`:

- used actual closest point on shield segment;
- required the other body to be in front;
- resolved penetration through both inverse masses;
- transferred relative closing velocity;
- moved both actors;
- brace changed only player's directional yield rather than granting global infinite mass.

This is much richer than damage reduction.

### Why it remained mostly defender-owned

The shield relation was defined by:

- defender facing;
- defender shield segment;
- defender brace state.

The pressure body participated physically, but its higher-level action lifecycle remained:

- lunge;
- recover;
- approach.

Even when shield consumed hit authority:

- attacker did not acquire a persistent relational state with the shield/body;
- defender did not inherit a changed offensive/coverage grammar from the exact contact;
- after separation both local controllers resumed their own priorities.

Thus:

> **O1 had a persistent local obstacle presented to another body, not a jointly evolving combat relation.**

### Donor retained

Retain:

- directional occupied geometry;
- material support/yield;
- body displacement;
- stance affecting a specific contact relation.

Do not equate this with:

- parry;
- aggro;
- invulnerability;
- the missing joint afterstate.

---

## 5. A2b body screen — first-solid-body authority is the strongest relational donor

Final mechanism source:

- `bdc9c7634b8a290b93bf23bb74fd48dff5675fb9`.

### What was real

A committed adversary action could resolve against the **first solid body**, not a privileged player target.

A peer body could therefore materially occupy the attack relation.

Direct evidence:

- blocker offsets 0 / 8 / 16 / 24 px intercept;
- 32 / 40 px no longer intercept;
- zero friendly damage still allowed the body to consume the attack;
- benefits generalized to 3 / 4 ordinary layout families.

This is important because the relation was not owned by one actor's button.

It was jointly determined by:

- attack geometry;
- attacker body/action;
- blocker body;
- player/body ordering in space.

A third actor could therefore change what an attack **was** without a special integration.

### Why it still did not become robust combat grammar

The relation was transient.

After interception:

- bodies continued on independent controllers;
- the blocked attack resolved;
- there was no durable relation binding the next choices of attacker, blocker and player.

More importantly:

> **ordinary compact offense removed pressure faster than body-screen geometry could matter.**

At full combat-loop authority:

- all-body authority produced 0 / 24 outcome improvements.

Thus A2b teaches two things:

1. **shared material authority can create emergent relational value**;
2. **that value disappears if the rest of the combat grammar does not preserve or reward the relation.**

This is probably the most relevant donor for the next frontier.

---

## 6. Ordinary body/body contact — shared but semantically weak

Across multiple branches, body pair resolution was symmetric:

- penetration split by inverse mass;
- relative closing velocity transferred through impulse;
- both positions changed.

This is mechanically joint.

But ordinary contact usually had no semantic persistence:

- movement controllers immediately continued;
- no occupied front / support relation was retained;
- no follow-up action depended on how bodies had contacted.

Therefore:

> **joint physics alone is not enough.**

The relation must change later affordances.

---

## 7. Cross-donor pattern

Prior donors can be arranged by two axes.

| Donor | Joint physical causality | Joint next-decision persistence |
|---|---|---|
| R0 player readiness | low | player-local only |
| weapon ↔ wall | medium | only while wall contact persists |
| O1 shield ↔ body | medium/high | mostly defender-local |
| Terrarium blade ↔ blade | high | weak after separation |
| ordinary body ↔ body | high | weak |
| A2b first-solid-body screen | high / multi-actor | transient, then lost |

The campaign has repeatedly proven the **left column**.

The right column remains largely unproven.

---

## 8. Candidate concept — RELATIONAL MANIFOLD, not a bind mode

Working term:

> **relational manifold**

Meaning:

> **a continuous, material configuration of two or more participants that changes the action space of all participants while the configuration exists and leaves a consequential afterstate when it breaks.**

This is not permission to build a sword-lock minigame.

Possible examples, only as research shapes:

- two weapons in sustained side-pressure contact where moving/turning one changes both coverage lines;
- shield/body/weapon contact against terrain where support and escape direction matter to both actors;
- body + weapon occupying a line that constrains a third actor;
- two bodies whose stance/contact geometry creates a temporary corridor / block / lever relation;
- weapon trapped or redirected by world + opposing tool, changing both actors' next useful paths.

The manifold must emerge from geometry/forces/state already visible in the world.

No hidden:

- bind meter;
- parry success flag;
- grapple ownership;
- vulnerability token;
- rock-paper-scissors stance result.

---

## 9. Why this may answer R1/R2

R1 failed because:

> the opponent remained an independent dash target; player readiness could perturb it but did not redefine both actors' relation.

R2 failed because:

> after the dash missed, the opponent's position/side dominated follow-up while player readiness remained local.

A relational manifold would ask a different question:

> **can one exchange create a shared configuration whose resolution necessarily affects both participants' next choices?**

For example, if two weapon/body lines remain in contact:

- player cannot simply aim-snap without moving the contact;
- opponent cannot simply return to pursuit without resolving the same geometry;
- terrain can make one escape/recovery route physically different from another.

This could make afterstate matter without:

- longer cooldown;
- slower controls;
- hidden advantage state.

This remains a hypothesis.

---

## 10. Strong falsifiers before any R3 implementation

### Bind-minigame collapse

FAIL if:

- the relation becomes a separate timed duel state;
- special bind controls appear;
- normal locomotion/combat pauses.

### One-side ownership

FAIL if:

- one participant can erase the relation instantly with ordinary aim while the other cannot respond;
- the "joint" state is really another local stance.

### Static wall

FAIL if:

- value comes from making one actor effectively immovable.

### Physics wrestling chore

FAIL if:

- useful play requires micromanaging noisy contact normals;
- the player must manually untangle tools.

### Passive block bubble

FAIL if:

- merely touching/holding geometry suppresses all offense.

### No afterstate

FAIL if:

- when contact breaks, both sides immediately return to semantically equivalent neutral states.

### Offense deletion

FAIL if:

- reintroducing ordinary high-consequence offense again removes the relation faster than it can matter.

### Terrain puzzle dependence

FAIL if:

- phenomenon exists only in one authored choke.

### Target-script dependence

FAIL if:

- AI must know the intended mechanic and cooperate with it.

---

## 11. Minimum evidence object for a future R3

Do **not** begin with a fight.

A legitimate R3 kernel would need only:

- two responsive bodies;
- two material tools or one tool + support surface;
- continuous contact geometry;
- no HP/damage;
- no AI strategy beyond a bounded deterministic opposing intent;
- no special bind state.

Required diagnostic sequence:

1. establish a shared contact relation;
2. apply different ordinary movement/aim intents from both sides;
3. observe whether contact state evolves continuously rather than snapping to winner/loser;
4. break the relation through geometry;
5. measure whether the resulting state of **both** participants differs from matched no-contact history;
6. issue identical next intents;
7. verify that both participants' next realized actions differ because of the shared history.

Mandatory ablation:

> **independent reset** — restore each actor/tool to its own local neutral target after contact.

If the joint-history effect survives that ablation, the supposed relation was not the cause.

---

## 12. Feniks relevance if such a relation survives

### Physical tanking

A heavy shield user could hold space because of:

- body;
- support;
- contact;
- occupied line;

not MMO aggro.

### Classlessness

Roles could emerge from continuous properties:

- mass;
- body envelope;
- tool geometry;
- support;
- handling;
- recovery authority.

No hard tank/fighter class flag.

### Weapon identity

Weapons may differ in how they:

- enter relational contact;
- preserve line;
- redirect another tool;
- recover after separation;
- interact with walls / bodies.

### Progression

Growth could improve:

- conversion of a bad shared relation;
- maintaining useful coverage while moving;
- recovering after contact;
- handling heavier equipment;
- transitions between shared geometries.

Not only DPS.

### Co-op

A third body could exploit or reshape a relation already created by two others.

A2b suggests this is possible through first-solid-body authority without scripted combo logic.

### Terrain

World geometry can become a participant:

- wall support;
- constrained clearance;
- body/tool pinning relation;
- temporary corridor control.

This aligns with Feniks' broader material-world direction.

---

## 13. Current conclusion

The next frontier is **not yet R3 code**.

The evidence supports this narrower conclusion:

> **local persistence is real, but strategic persistence probably requires a shared material relation rather than a stronger local readiness variable.**

The strongest surviving donors are:

- R0 no-auto-neutral local readiness;
- Terrarium symmetric blade contact;
- O1 directional support / occupied shield geometry;
- A2b first-solid-body authority;
- material world contact.

A future R3 should combine as little of these as necessary to test one relation.

It must not combine them into a feature pile.

---

## Working invariant

> **A meaningful exchange should be able to leave both sides inside the same changed reality, not merely leave one side with a different internal state.**
