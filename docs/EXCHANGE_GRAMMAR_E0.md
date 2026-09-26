# EXCHANGE GRAMMAR E0 — Mirrored Access Contest

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY.**
> This file preserves the research state at its date. Any `active`, `current` or `next` wording below is historical. Current truth lives in `README.md` and `docs/RESEARCH_STATE.md`.

**Date:** 2026-09-24  
**Status:** active hypothesis card; implementation not started  
**Owner play:** not eligible  
**Source:** cross-campaign audit `CROSS_CAMPAIGN_COMBAT_AUDIT_2026-09-24.md`

## 0. Purpose

E0 is not a proposed Feniks combat mode.

It is a diagnostic whole situation designed to answer one structural question before another weapon organism is built:

> **Can readable intent, responsive movement, commitment, material contact and inherited afterstate create a meaningful exchange when HP is temporarily prevented from dominating the result?**

E0 deliberately removes:

- kill / clear objective;
- damage progression;
- weapon archetype identity;
- terrain choke advantage;
- class roles.

If the exchange is still poor, adding sword / spear / shield / projectile content is not justified.

---

## 1. Local contested value — ACCESS

The local value is **access through space**.

No capture timer.

No abstract score zone.

No body-size-only route.

The world is initially a broad open strip with a wide access line behind one actor.

The same geometry is tested in two mirrored situations.

### DENY

The adversary attempts to cross the access line behind the player.

The player succeeds by preventing the crossing for a short bounded exchange window.

Retreat remains legal.

But retreat can concede the line.

### BREACH

The player attempts to cross the access line behind the adversary.

The adversary tries to deny access.

Retreat remains legal.

But retreat directly gives up progress toward access.

These are not two combat modes.

They are mirrored diagnostics of one exchange law.

If the law only works when the player is defender or only when the player is attacker, record that asymmetry rather than hiding it.

---

## 2. Why ACCESS beats the other candidate stakes for E0

### Not a choke test

The initial space is deliberately wide.

No doorway is required.

The body / commitment relation must create the contest.

### Not a capture-point game

There is no accumulating control meter.

The line only identifies whether access was actually gained.

### Not an escort-defense test

No extra vulnerable target is needed.

Co-op / protection can pressure the grammar later if E0 survives.

### Not an HP duel

Killing the other actor cannot bypass the question.

### Retreat has a world-grounded concession

The experiment does not punish retreat mechanically.

It allows retreat to change the state of the objective.

---

## 3. Player action surface

Keep it minimal:

- responsive WASD;
- free mouse facing;
- one **committed contact action**;
- no dodge;
- no i-frames;
- no block/parry button;
- no target lock;
- no stamina;
- no HP.

The contact action is diagnostic.

It is not named sword / shield bash / spear thrust.

Working label:

> **DRIVE**

The input expresses:

> **I commit my occupied contact relation in this facing direction.**

---

## 4. DRIVE — commitment without animation lock

The critical requirement is:

> **commitment must affect the next relation without setting `canMove=false`.**

First candidate realization:

### Prepare

Very short readable preparation.

During prepare:

- locomotion remains live;
- facing remains controllable;
- no contact authority yet.

### Commit

The contact direction is captured at commit start.

During commit:

- the **contact vector / contact shape** no longer homes;
- locomotion input remains live;
- body can still move;
- the committed contact relation follows the body's realized position but not a new aim direction;
- no hidden invulnerability;
- no forced hit.

A bad commitment can therefore:

- miss;
- pass beside the opponent;
- be redirected by contact;
- leave the actor on a worse angle;
- carry the actor too far relative to access.

### Recover

No arbitrary freeze.

The action cannot immediately recommit at full authority.

Locomotion remains live.

The actor inherits:

- position;
- velocity;
- facing;
- contact displacement;

from what actually happened.

The recovery exists to preserve consequence of commitment, not to manufacture vulnerability by disabling controls.

---

## 5. Material contact truth

E0 should reuse only well-defended donor laws:

- first-solid-body contact;
- same-step consequence symmetry;
- body mass;
- body radius / occupied space;
- bounded displacement;
- no infinite mass;
- no phase-through;
- no binary parry cancellation.

A DRIVE contact may produce:

- attacker yield;
- defender yield;
- both yield;
- glancing redirection;
- no useful contact if geometry misses.

It must not produce:

- stun flag;
- knockdown state;
- guaranteed attack cancel;
- damage;
- hidden "winner" token.

The next state should emerge from the physical result.

---

## 6. Initial bodies

E0 begins with approximately comparable bodies.

Do not start with tank vs skirmisher.

Reason:

> first determine whether the exchange grammar itself creates meaningful access negotiation.

Body / equipment asymmetry belongs to later donor pressure.

Initial differences may exist only where necessary to make adversary behavior legible.

---

## 7. Adversary intent

The adversary must not be generic face-hug pursuit.

It needs a visible local objective:

- in DENY: cross the access line;
- in BREACH: prevent the player crossing.

It may use the same DRIVE contract.

Required adversary lifecycle:

> **approach / set relation -> prepare -> commit -> inherit result -> reassess**

Important:

- no hidden future-read of player input;
- no teleport correction;
- no aim homing during committed contact;
- no "respect radius";
- no polite feeding of a scripted solution.

The adversary may choose among a small number of readable approach angles.

It should not instantly recompute the perfect contact line every frame after commitment.

---

## 8. Exchange states are descriptive, not authoritative

For analysis we may describe:

- NEUTRAL;
- THREAT;
- COMMITMENT;
- RESOLUTION;
- ADVANTAGE / DISADVANTAGE;
- RESET.

These must not become hidden gameplay flags that decide what actors are allowed to do.

They are observations derived from:

- geometry;
- intent/action state;
- access relation;
- velocity;
- facing;
- distance.

Especially:

> **ADVANTAGE must be visible in the world state, not awarded by a combat state machine.**

---

## 9. Meaningful inherited afterstate

This is the central E0 discriminator.

A successful exchange must make the next decision different.

Candidate afterstates include:

- one actor displaced off the direct access line;
- one actor overextended past the other;
- one actor gains lateral angle to the access line;
- one actor is forced to yield ground but still blocks a second route;
- both bodies separate into a new orientation;
- a failed DRIVE gives the other actor a temporary route window.

No explicit opening token is required.

The afterstate is useful only if ordinary movement / geometry can exploit it before everything resets to the same pursuit relation.

---

## 10. 30-second machine-level discriminator

Before any Owner build exists, deterministic rehearsal should be able to show more than one useful response in both mirrored roles.

### DENY candidate responses

- meet the commit and contest contact;
- yield laterally and re-intercept;
- let the attacker overextend and recover the line;
- pre-position off-center to change approach geometry.

### BREACH candidate responses

- direct committed challenge;
- angle around a prepared defender;
- provoke / out-position a bad commit;
- yield temporarily to create a better second entry.

These are candidate observations, not scripted policies that define success.

---

## 11. Pre-registered red-team

E0 fails if any of these survive serious testing.

### Face-hug mash

Holding forward + DRIVE whenever ready wins both roles reliably.

### Permanent retreat

Backing away indefinitely preserves the objective as defender or somehow advances it as breacher.

### Drive spam

Recommitting on cooldown is as good as reading the relation.

### Static wall

Defender can stand still in the middle and become an impenetrable collider without reading intent.

### Orbit cheese

Pure circling exploits tracking rather than negotiating commitment.

### One-angle script

One fixed lateral move solves every commitment.

### Contact noise

Small collision jitter / pinball decides access more often than deliberate positioning.

### Reset collapse

After every contact, both actors simply return to the same neutral pursuit relation with no usable inherited state.

### Apparatus answer

The access line / starting positions encode one obvious correct policy.

---

## 12. Required ablations

Before E0 can be considered exchange-qualified, compare:

### No DRIVE

Movement/body contact only.

If this already produces the same strategic result, DRIVE adds no exchange value.

### No committed direction

Allow DRIVE to home continuously.

If homing preserves the same behavior, commitment was fake.

### No displacement

Keep contact detection but remove material displacement.

If the same policies work, the claimed afterstate is not material.

### No recovery consequence

Allow immediate recommit.

If spam becomes dominant only here, recovery may be carrying legitimate commitment value.

### Wide-start sweep

Vary starting lateral position.

The exchange must not depend on one exact centerline setup.

---

## 13. Success gate for E0

E0 is not successful because one clever policy wins.

Minimum evidence target:

- DENY has at least **three materially distinct useful responses** across a broad start sweep;
- BREACH has at least **three materially distinct useful responses** across a broad start sweep;
- no single blind policy dominates both roles;
- retreat changes access outcome rather than merely delaying time;
- DRIVE changes outcomes relative to movement-only;
- captured commitment direction matters relative to homing;
- displacement creates measurable inherited afterstate;
- immediate recommit ablation exposes spam pressure;
- results do not rely on world boundary;
- results do not rely on a narrow doorway;
- results do not rely on HP.

This is still agent-side evidence only.

---

## 13.1 E0 v0 result — ACCESS SURVIVES, DRIVE GRAMMAR FAILS

Final clean checkpoint:

- final attribution commit: `e15670db86b5a60dcff2e57b02478e333c3aa09b`;
- broad lateral falsifier: `240375ca756c43488205be9acd39b77b2b3aeb22`;
- deterministic suite: **6 / 6 PASS**;
- Owner play: **NOT REQUESTED**;
- browser deployment: **NOT WARRANTED**.

### Apparatus corrections before interpretation

The first exploratory build exposed three apparatus problems that were corrected before product interpretation:

1. the simultaneous-contact test incorrectly expected same-frame position change rather than velocity consequence;
2. retreat policies could reach a world boundary;
3. the BREACH defender voluntarily retreated toward its own access line to preserve a player-relative offset.

After correction:

- the world is large enough that tested access outcomes are boundary-independent;
- the BREACH defender holds a fixed band before access;
- same-step opposing DRIVE contacts are measured before either consequence is applied.

### ACCESS stake finding — SUPPORTED AS DONOR

The contested-value hypothesis survived its first direct falsifier.

In DENY:

- pure retreat concedes access in **1.783 s**;
- zero boundary frames;
- no attack / damage rule is required to punish retreat.

In BREACH:

- pure retreat remains **BLOCKED after 6 s**;
- zero boundary frames.

Therefore:

> **ACCESS gives retreat a world-grounded concession without stamina, backwards-speed penalty or shrinking arena.**

This is a useful donor finding.

It does not prove the whole exchange grammar.

### Matched player DRIVE attribution

The defender remained unchanged while only the player's DRIVE components were ablated.

**Normal player DRIVE**
- CROSSED in **2.225 s**.

**Player DRIVE disabled**
- BLOCKED after **6 s**;
- stopped ~25.8 px before access.

**Player DRIVE action present but both material consequences removed**
- carry = 0;
- contact displacement = 0;
- BLOCKED after **6 s**;
- same ~25.8 px margin.

Therefore:

> **the breach effect is materially carried, not created by entering an action state.**

The two material pathways are partially redundant:

**No carry, contact displacement retained**
- CROSSED in **2.300 s**.

**Carry retained, no contact displacement**
- CROSSED in **2.942 s**.

Thus either can currently provide enough forward consequence to breach.

**No recovery**
- CROSSED in **2.067 s**;
- more drive/contact events.

Recovery therefore constrains spam somewhat, but does not create the strategic discriminator.

### Broad lateral-start falsifier — FAIL

Offsets:

- -300;
- -180;
- -90;
- 0;
- +90;
- +180;
- +300 px.

Results:

**DENY blind mash**
- HELD in only **1 / 7** starts.

**BREACH blind direct-mash**
- CROSSED in **7 / 7** starts.

**BREACH angle-left**
- captured direction: CROSSED **7 / 7**;
- homing direction: CROSSED **7 / 7**;
- exact crossing times were identical at every tested offset.

Therefore the captured-direction commitment has no demonstrated strategic cost in the current organism.

The stronger failure is:

> **BREACH is solved robustly by forward movement + DRIVE whenever ready.**

This directly triggers the pre-registered **face-hug mash / drive-spam** concern for the BREACH half of the mirrored exchange.

### E0 v0 verdict

> **EXCHANGE GRAMMAR E0 v0 FAILS AS A REUSABLE EXCHANGE GRAMMAR.**

What survives:

- ACCESS as a minimal world-grounded contested value;
- retreat can concede value without an artificial movement tax;
- material DRIVE can change access outcome;
- DRIVE value depends on actual material consequence;
- recovery measurably restrains action frequency;
- same-step opposing commitments can remain symmetric.

What fails:

- BREACH has a blind dominant forward+DRIVE policy across the full lateral sweep;
- captured commitment direction is behaviorally indistinguishable from homing in the tested breach relation;
- a committed action has too little downside / exposure relative to its access objective;
- inherited afterstate does not force a new decision strongly enough;
- the exchange remains closer to a committed shove contest than to a reusable combat grammar.

### Why this is not a request to tune DRIVE

Do not rescue E0 v0 by:

- reducing DRIVE impulse;
- lengthening recovery;
- making defender DRIVE stronger;
- narrowing the access lane;
- adding damage;
- adding HP;
- making the defender faster;
- giving the defender hidden reaction advantage.

Those changes can make the matrix harder without fixing the structural problem.

### New question exposed by E0

ACCESS solved one half of the audit problem:

> retreat can be legal while conceding something valuable.

The unresolved half is:

> **what persistent relation exists before commitment so a forward DRIVE can lose something other than time?**

Current candidate:

> **SET / SUPPORT as a continuously legible contact claim, with DRIVE sacrificing some of that support for forward consequence.**

This is not permission to copy O1 brace.

A new test would need to show:

- SET is not a binary block/parry;
- SET does not become an immovable wall;
- DRIVE into a good SET can lose angle / access;
- DRIVE around a badly oriented SET can win;
- the same actor can SET or DRIVE;
- all consequences arise from shared contact/support rules;
- no damage is needed to manufacture the distinction.

Do not implement until a fresh E0b hypothesis card pre-registers these falsifiers.

---

## 14. Stop rule

If E0 fails to create a reusable access exchange:

- do not add damage;
- do not add weapons;
- do not add shield;
- do not add terrain;
- do not add progression;
- do not add co-op.

Return to the exchange thesis.

If E0 survives:

> **E1 must reintroduce fast, meaningful damage without altering the access/commitment grammar.**

That is the real falsifier.

If damage causes the old collapse again, E0 was only a non-lethal movement/contact game.

---

## 15. Feniks boundary

Nothing here means Feniks combat should revolve around access lines or a generic DRIVE action.

E0 is intentionally abstract.

Its job is to establish whether this deeper grammar is viable:

> **intent -> relation -> commitment -> material resolution -> inherited next state -> consequence**

Only surviving structure may later be donated into:

- shield / body holding;
- melee weapons;
- reach;
- projectile pressure;
- magic;
- co-op;
- progression.

---

## Working invariant

> **Retreat may refuse contact, but it should not preserve every valuable relation for free.**
