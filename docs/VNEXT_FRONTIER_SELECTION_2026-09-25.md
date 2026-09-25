# Combat Lab vNext — Frontier Selection 2026-09-25

**Status:** first vNext discovery frontier selected  
**Selected frontier:** BODY / SCALE  
**Not selected as roadmap:** bow, magic, R3 follow-up remain open future fronts

## 0. Decision

The first vNext discovery campaign will investigate **embodied scale** before returning to a weapon-specific lane.

This is not because body/scale is presumed to be the most important final combat system.

It is selected because it has unusually high leverage over assumptions shared by almost every future combat family:

- what occupies space;
- what can pass where;
- what yields in contact;
- how acceleration / braking feel;
- what equipment geometry means relative to a body;
- how reach should be interpreted;
- what cover / choke / line of sight mean;
- how multiple bodies coexist;
- what future party roles can emerge without a class flag.

A weak actor/body foundation would contaminate melee, bows and magic alike.

## 1. Candidate comparison

### BODY / SCALE

Evidence debt:

- partial P0/P1 mechanism evidence;
- no strong Owner-facing whole phenomenon;
- previous route/policy apparatus risked encoding the answer.

Information value:

- very high cross-system leverage;
- directly tests whether body is gameplay rather than a collider;
- can invalidate hidden fixed-actor assumptions early.

Risk:

- could collapse into "small fits, big does not";
- could become a corridor puzzle;
- could couple size and slowness arbitrarily.

### RANGED / BOW

Evidence debt:

- projectile kernel exists;
- meaningful ranged combat language does not;
- previous LINE / IMPULSE collapsed into delete / kite / suppress regimes.

Information value:

- high;
- strongly orthogonal to R3;
- important for Feniks.

Dependency risk:

- requires assumptions about actor movement, body footprint, cover and pressure that vNext has not yet re-earned.

### MAGIC / WORLD RELATION

Evidence debt:

- essentially open.

Information value:

- potentially enormous;
- strongest escape from weapon-centric thinking.

Risk:

- design space is so unconstrained that an early result may mostly reflect arbitrary spell authorship rather than a reusable combat relation.

### R3 ADVERSARIAL FOLLOW-UP

Evidence debt:

- best current material-contact human signal;
- clear next local question.

Information value:

- high locally;
- lower for refoundation because it reuses the most cognitively available old lane.

Risk:

- immediately rebuilding the project around its first positive melee/contact result.

## 2. Selected first experiment — EMBODIED SCALE FIELD S0

This is deliberately **not yet a combat organism**.

It is a body/world discovery field.

### Question

> Can continuous changes in body scale and embodied mass create immediately perceptible differences in movement, access and contact without class flags, scripted correct routes or attack mechanics?

### Player action

- move freely with WASD / arrows;
- switch among a few anchor scale points for fast comparison;
- continuously vary scale between them;
- collide with neutral moving bodies and world geometry;
- explore rather than solve an objective.

### Realized world behavior

Scale changes:

- body envelope;
- area-like mass;
- acceleration / braking response;
- modest top-speed response;
- contact displacement.

World geometry contains several affordances but no winning route.

Neutral moving bodies create repeated contact opportunities without combat AI.

### 30-second discriminator

Without being told a role to enact, the Owner should begin noticing that changing scale changes:

- which spatial options feel natural;
- how the body enters / leaves constrained space;
- how much incidental contact changes its motion;
- whether a larger or smaller body suggests different local behavior.

The desired first response is not "big is stronger".

It is:

> **these bodies create different spatial possibilities.**

### Falsifiers

Stop or refound if:

- the experiment reads only as "same circle but bigger/slower";
- the main lesson is merely one gap that one size cannot fit;
- moving neutral bodies feel like noise rather than material contact;
- size changes require labels/instructions to notice;
- the coupled mass/movement law feels arbitrary enough to dominate the observation;
- the apparatus implicitly tells the Owner which scale is correct.

### Intentionally absent

- attacks;
- HP;
- damage;
- weapons;
- shields;
- classes;
- enemies;
- win condition;
- stamina;
- dodge;
- R3 contact solver.

## 3. Why S0 precedes a fight

Combat Lab has repeatedly placed combat semantics on top of a mostly fixed actor.

S0 reverses that order.

If body variation itself is dead or annoying, learn that before building weapon systems on top of it.

If it is interesting, the next step can add the **smallest pressure relation** necessary to ask whether body differences alter fighting rather than merely navigation.

## 4. Machine qualification

Exact pre-deploy checkpoint:

- `59d214ce10c261586268e309c701036fa690db63`.

Machine gate:

- 10 / 10 tests PASS;
- continuous scale derivation PASS;
- body-envelope access discriminator PASS;
- mass-weighted contact response PASS;
- mixed scale/movement finite soak PASS;
- real headless-Chromium module/runtime load PASS.

Opera remained disconnected after retries. Do not treat that as experiment evidence.

## 4.1 Deployment hygiene

The initial exact-SHA S0 deploy succeeded, then `main` performed its normal automatic Pages deploy afterward. A final S0 deploy is therefore issued only after the `main` run has completed.

No experiment behavior changed between those deploys.

## 5. Evidence boundary

Machine tests may qualify:

- continuous scale derivation;
- collision finiteness;
- body-envelope access difference;
- mass-weighted contact response;
- runtime / reset / experiment switching.

Only Owner play can qualify:

- whether scale differences are actually perceptible;
- whether they feel like different embodied possibilities;
- whether the field is interesting enough to pressure with combat;
- whether the coupling feels arbitrary or promising.

## Working invariant

> **First prove that different bodies can inhabit the same world differently. Only then ask how they fight in it.**
