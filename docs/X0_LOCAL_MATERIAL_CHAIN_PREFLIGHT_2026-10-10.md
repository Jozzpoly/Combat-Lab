# Combat Lab — X0 material-contact continuation preflight

**Date:** 2026-10-10 · **Disposition:** FINISHED, BOUNDED, NO PRODUCT QUALIFICATION.  
**Source:** [technical donor probe PR #3](https://github.com/Jozzpoly/Combat-Lab/pull/3), forked *only for testing* from unaccepted PR #2 `db2427c4651640d9f75da9cf33c0300880d6a59d`. Preflight head `1c117fb7735d343d42b724eb0ed289c67eff8a9c`. [Final emitted Chromium/WASM verification](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38005506902): 12 Node checks PASS, emitted build and physics probe PASS. An earlier run [38005175804](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38005175804) failed due to a *harness error*: querying contacts on the field wrapper instead of the Rapier world. Do not treat that as physical failure; the error was corrected before evaluating the phenomenon.

## The physical question

Can a single actor-local, purely tactile contact signal cause a real finite actuator response that changes a later material state **without global world knowledge, target identity, choreographed destination or scripted response at a particular time**?

The probe creates a two-armed Rapier pincer (real dynamic limbs, revolute joints and finite reciprocal torque), a separate rigid ram, a free first crate and a second free crate. A research-controlled external impulse is applied to the first crate at tick 40. In **matched** trials the local reflex is either on or off:
- A pressure impulse on the actor's *own* actual arm or hook contact collider initiates finite actuation of its **opposite** arm, respecting the existing motor/collider physics. No script checks a box ID, a task route or when the experimental pulse occurred.
- Apart from that response, worlds receive the same initial conditions, drive and external pulse. Positions of both actors and both crates are checked to match before the first response command.
- Contact sourcing is measured in actual solver manifolds. The actor and second crate must be distinguished from the first-crate-to-second-crate collision.

This is a **mechanism preflight**, not an X0 implementation. The actuator responds to a narrow hand-designed local rule, not cognition. All interesting movement initially required a research impulse.

## Findings — successes AND failures

**First four-case preflight** [CI 38005257671](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38005257671): all four cases made actual first-arm contact and fired the local command. In three, first-crate afterstate differed from no-reflex by ~0.14–0.48 m. A second test added another movable object, but its changes were due to **direct arm-to-second-object contact**, not the first crate. This was caught by inspecting which collision pair actually delivered contact. It is a negative result for the purported *material relay*. Also, the ram initially contacted the first crate in the initial pose — an attribution confound.

**Final bounded counterexample control:** the ram was moved away, and the second free body was deliberately positioned on the *observed* path of the first crate **outside the arm's direct reach**. This was an intentionally informed fixture, not a naturally emerging world. Four matched cases were rerun:

| Test | Actor-arm contact and response | First-crate afterstate delta | Second-crate afterstate delta | Contact provenance |
| --- | --- | ---: | ---: | --- |
| 18kg, external impulse (65, −170) N·s | tick 42 → 42 | 0.4754m | **0.2456m** | First-crate to second-crate solver contact tick 45; **no actor-to-second-crate contact** |
| 18kg, (120, −170) N·s | tick 42 → 42 | 0.4449m | 0.0682m | First-crate to second-crate contact tick 44; no direct actor contact with second crate |
| 18kg, (65, +170) N·s | tick 42 → 42 | 0.4809m | **0m** | No second-crate contact at all |
| 60kg, (105, −230) N·s | **NO arm contact, NO response** | **0m** | **0m** | First and second crates contacted at tick 51 due to external impulse alone; on/off states identical |

The strongest case gives a **narrow physical chain**: researcher disturbance → real arm contact → actuator command → changed first-crate trajectory → later solver-active crate-to-crate contact → second object's afterstate differs by ~0.246m. The required initial states remained matched until the first sensor-triggered command.

It is essential NOT to overstate this:
- There is **no proven second-actor response** or change to a different body's meaningful action. The ram in the strongest case remained untouched and stationary.
- This secondary contact was constructed from a known previous trajectory. The fixture **does not establish spontaneous discovery** or resilient material ecology.
- That the first and second crates collide with the same or different intensity in two matched worlds does not imply agency beyond this simple triggered servo.
- Cases with a missing first contact produce no reflex, and changing impulse/mass can erase the second event. Failures are part of the signal.
- 12 Node checks and browser PASS mean a narrow factual validation only. **Owner experience, visual quality, action diversity and long-term numerical robustness remain UNKNOWN**.

## Research interpretation and explicit stop

**Technically plausible:** a small physically local response **can propagate a disturbance through real moving matter**, with no target/route awareness in the local law. This is more than copying PR #1's constant-speed wandering or merely making PR #2's jaw close on a timer.

**Not proven:** the intended whole "body → body-local adaptation → world changes someone else's possible action". Two crates moving is not that crossing. More tuning of the same two-crate collision fixture would inflate fixture success, not test the overarching hypothesis.

**Stop this probe now.** Preserve exact source/negative evidence as an isolated donor and retire the temporary PR. The next worthwhile study is a **single shared, freely rearrangeable material world**, where differing body capacities, genuine constraints and minimal local responses coexist from first boot. A later specimen must be falsifiable by deleting its local reaction, simplifying its material constraints, or replacing its articulated body with a rigid envelope-equivalent. After outside disturbance, one should inspect actual later physical opportunities for a *different organism*, not just additional centimeters of crate travel. See [Material Commons X0 hypothesis gate](MATERIAL_COMMONS_X0_RESEARCH_GATE_2026-10-10.md) — a research candidate, **not accepted architecture or implementation mandate**.

Do not alter public rehearsal or merge experimental donor branches due to this narrow preflight.
