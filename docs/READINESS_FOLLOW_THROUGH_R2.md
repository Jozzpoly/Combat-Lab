# READINESS FOLLOW-THROUGH R2 — Physical Overrun Opportunity

**Date:** 2026-09-25  
**Status:** active hypothesis card; pre-implementation  
**Owner play:** not eligible  
**Dependencies:**
- CONTINUOUS READINESS R0 — causal-kernel qualified;
- READINESS UNDER PRESSURE R1 — failed defensive-interruption cell.

## 0. Correction from R1

R1 asked readiness to justify itself by stopping an incoming committed dash.

That produced:

- readiness-dependent tool contact;
- real trajectory displacement;
- no change in body-contact outcome.

Movement remained the actual defensive answer.

R2 stops treating this as a defect.

Working split:

> **movement handles leaving incoming threat geometry; readiness may determine how the player exploits the physical afterstate created by the opponent's own commitment.**

This is closer to the cross-campaign INHERIT problem.

---

## 1. Core question

> **After ordinary movement makes a committed dash miss, does inherited weapon readiness change which immediate follow-through is physically available before the opponent naturally regains a closing relation?**

No HP.

No damage.

No hidden vulnerability state.

No parry.

---

## 2. Physical opponent afterstate

Use one light committed-line rusher.

### Incoming phase

- readable prepare;
- direction captured once;
- dash does not home;
- player can leave geometry through ordinary lateral movement.

### Overrun

If the player leaves the line:

- rusher continues its committed physical motion;
- it passes / overshoots the player's previous relation.

### Return

At commit end:

- there is **no fixed recovery timer** defining vulnerability;
- rusher retains actual position and velocity;
- ordinary return steering / acceleration toward the player resumes;
- existing velocity must be physically redirected.

The opportunity exists only because:

> **the rusher is actually moving away / across the player after its own commitment.**

---

## 3. Physically derived end of opportunity

Do not create:

- `vulnerable = true`;
- `counterWindow = 0.3`;
- `recoveryFrames`.

Instead observe rusher kinematics.

After commit ends, track velocity projection onto current direction toward the player.

Define descriptive event:

> **TURNAROUND / CLOSING RECOVERED**

when the rusher, after initially carrying away-motion, first regains meaningful positive closing velocity toward the player.

This event:

- does not alter controls;
- does not grant immunity/vulnerability;
- is only an evidence boundary.

A follow-up contact can therefore be classified as:

- before physical turnaround;
- after turnaround;
- absent.

---

## 4. Crossed readiness × pressure-side design

Reuse R0 causal readiness histories:

- FREE;
- WALL.

Mirror pressure:

- EAST rusher commits westward;
- WEST rusher commits eastward.

After a successful lateral evade:

- EAST pressure naturally places the rusher on / moving toward the WEST side;
- WEST pressure naturally places it on / moving toward the EAST side.

This should reverse spatial opportunity.

Desired research pressure:

> **one inherited readiness should not be globally best against both mirrored overruns.**

---

## 5. Player response families

### EVADE ONLY

- lateral movement leaves the locked dash;
- no follow-up COMMIT.

Purpose:

- establish that survival does not require readiness;
- measure physical overrun / turnaround baseline.

### EVADE -> IMMEDIATE FOLLOW

- preserve inherited readiness through incoming phase;
- after commit ends, immediately COMMIT toward actual rusher position.

Question:

> **does current readiness make the post-overrun follow-up naturally available?**

### EVADE + GUIDE -> FOLLOW

- during / after evade, deliberately GUIDE toward the emerging follow-up relation;
- COMMIT after overrun.

Question:

> **can agency convert an initially poor readiness state before physical turnaround?**

### EVADE + MOVE + FOLLOW

Only after simpler probes.

Question:

> **can locomotion and readiness cooperate to exploit afterstate without one erasing the other?**

---

## 6. Follow-up contact is diagnostic, not damage

R2 records active COMMIT tool/body geometry.

A follow-up contact means:

> **the player could physically bring the committed tool relation onto the rusher body during the observed afterstate.**

R2 does not claim:

- damage amount;
- stun;
- hit reaction;
- attack cancel.

Initial contact may be recorded without applying material impulse to the rusher, specifically to avoid changing the afterstate being measured.

If a useful phenomenon appears, material consequence must be reintroduced later.

This is mechanism evidence only.

---

## 7. Key outcomes

Record for every crossed cell:

- incoming player body contact: yes/no;
- lateral evade displacement;
- commit-end rusher position/velocity;
- time of physical turnaround;
- follow-up tool contact: yes/no;
- follow-up contact time relative to commit end;
- contact before turnaround: yes/no;
- player readiness at commit end;
- player readiness at follow-up start;
- tool path / starting pose.

No score.

No "counter success" UI.

---

## 8. Desired phenomenon

A useful result looks qualitatively like:

- FREE history makes one overrun side immediately exploitable;
- WALL history makes the mirrored side more available;
- poor readiness may require GUIDE before contact;
- GUIDE costs physical opportunity because rusher is already turning back;
- movement-only remains valid for survival;
- no hidden timer awards the opening.

Exact winners are not preselected.

Core requirement:

> **readiness history changes whether an immediate follow-through is physically available before the opponent naturally restores closing pressure.**

---

## 9. Mirror falsifier — one best guard

FAIL if:

- one readiness history dominates EAST and WEST overruns;
- pressure-side reversal does not materially alter follow-up availability;
- one canonical pose is always best.

---

## 10. Follow-up spam falsifier

FAIL if:

- immediate COMMIT after every evade contacts successfully from all histories/sides;
- inherited readiness is irrelevant;
- GUIDE is unnecessary because COMMIT sweeps through enough space to catch everything.

Do not add cooldown to fix this.

---

## 11. GUIDE-trivialization falsifier

FAIL if:

- ordinary GUIDE during the incoming dash always fully converts any readiness before follow-up;
- FREE/WALL histories become equivalent before commit ends.

This would mean incoming pressure itself provides too much free reset time.

Required follow-up if observed:

- shorten nothing yet;
- map guide/history decay relative to actual physical dash duration first.

---

## 12. Timer-window falsifier

FAIL if the result only exists because:

- rusher is artificially frozen;
- return control is disabled for a fixed time;
- a hidden recovery timer defines opportunity.

The window must come from:

- inherited velocity;
- actual position;
- bounded acceleration / turning;
- physical route back toward closing motion.

---

## 13. Movement-path confound

The player's lateral evade itself changes position.

This may dominate follow-up geometry.

Mandatory matched comparison:

- same evade path;
- different readiness history.

If follow-up differences disappear when player path is matched:

> **readiness was not responsible.**

---

## 14. Pose-only attribution

Only after a follow-up phenomenon exists.

Repeat with:

- full inherited state;
- pose-only;
- velocity-only;
- both erased.

R0 requires that pose can carry history.

R2 must not rely exclusively on residual weapon kinetic energy.

---

## 15. AUTO-NEUTRAL ablation

Only after a follow-up phenomenon exists.

Restore competent canonical neutral convergence before / during incoming pressure.

Expected:

> **history-specific follow-up asymmetry should collapse.**

If not:

- R0 readiness was not carrying the result.

---

## 16. Return-authority sweep

Do not choose one perfect rusher turnaround speed.

Sweep broad return acceleration / steering authority.

Questions:

- if return is very weak, does every readiness eventually get a free follow-up?
- if return is very strong, does no readiness matter?
- is there a nontrivial region where immediate vs guided follow-up differs contextually?

This is a mechanism map.

Do not tune a single value for a preferred matrix.

---

## 17. Initial experiment order

### R2-K0 — physical overrun

Prove only:

- movement makes locked dash miss;
- rusher genuinely overshoots;
- no recovery timer;
- ordinary return steering resumes immediately;
- turnaround event is derived from physical closing velocity.

### R2-K1 — follow-up geometry

Add active COMMIT contact recording.

No impulse/damage.

Compare:

- FREE/WALL;
- EAST/WEST;
- EVADE ONLY;
- EVADE -> IMMEDIATE FOLLOW.

### R2-K2 — intentional conversion

Add:

- EVADE + GUIDE -> FOLLOW.

Ask whether GUIDE can repair poor readiness before physical turnaround.

### R2-K3 — attribution only if phenomenon exists

Then:

- pose-only;
- velocity-only;
- AUTO-NEUTRAL;
- return-authority sweep;
- broad initial-state perturbation.

Stop if K1 has no contextual follow-up phenomenon.

---

## 18. Promotion gate

R2 becomes mechanism-qualified only if:

- lateral movement reliably leaves incoming locked geometry;
- overrun/turnaround is genuinely physical, not timer-awarded;
- readiness history changes pre-turnaround follow-up availability;
- EAST/WEST mirror changes readiness value;
- immediate follow-up does not work from every state;
- GUIDE can intentionally convert at least some poor states;
- the same evade path still produces readiness-dependent follow-up;
- result survives pose-only attribution;
- AUTO-NEUTRAL collapses the history-specific result;
- return-authority sweep shows a nontrivial region rather than one magic constant;
- no HP/damage/stun/parry is required.

Still no Owner eligibility.

---

## Working invariant

> **Survive with movement; exploit with the state the exchange actually left you in.**
