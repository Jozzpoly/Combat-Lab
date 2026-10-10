# W1 — material commons composition-first pressure (2026-10-10)

**Disposition: DISCONTINUE W1 AS A CANDIDATE WHOLE; retain narrow research data only.** This source reuses PR #2 articulated Rapier2D code as an explicitly temporary donor, not a project foundation. No merge, no public preview/deploy, no Owner product/feel PASS/FAIL assigned to this new W1 prototype. Historical R0/R1/L0 Owner FAILs remain.

**Verified browser evidence:** [exact browser + inherited donor checks CI 38086895697](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38086895697) on source `c2989be37717ea020866aa6a775cfe4c3f51c481`; emitted `W1 COMPOSED COMMONS WHOLE` results in job log. [Source probe](../src/commons-world-probe.js).

## What was tested

A default single editable 36×24 top-down Rapier2D world: **4 existing donor body types/instances (2 articulated pincers, 2 heavy rams), 7 freely dynamic material objects of different sizes/masses, 2 physical hinged gates**, existing fixed obstructions, no scripted goals, world power or false UI overlays. Full operator UI retains controls, physical pointer manipulation and source-scoped scene authoring. Not an independent body or movement architecture.

**Important control correction:** the donor's `motor()` auto-applies a finite root brake to no-input actors and active joint servo torque. In W1, `CommonsField.motor` returns for every *unselected* body, so nonselected residents actually have no root drive/brake or jaw servo, instead of being mislabeled passive while artificially bracing. The selected body still uses a finite top-down root motor/brake **proxy**, not real legs or grounded stance. No autonomous initiative is claimed.

Five independently recreated 240-step full-world regimes, **without relocating any object between regimes**:
- `passive`: no selected body, no active motor/jaw servo;
- `jawNoTorque`: selected pincer requests closure, torso drive set zero and jaw torque also zero;
- `jawOnly`: selected pincer commands both real jaws closed, torso motor force set zero;
- `pincerDrive`: selected pincer drives right for 180 steps, then coast/brake;
- `ramDrive`: selected large rigid body drives left for 180 steps, then coast/brake.

The same initial arrangement and source, no target teleports, no sensory controller, no gameplay objectives. All cases were executed in actual emitted Chromium + Rapier; the test also established same-count scene recipe roundtrip with W1 subclass semantics. This is a *source-bound sample*, not systematic space exploration or an Owner session.

## Findings that change the decision

| Regime | Direct actor/material contact incidences across entire field in 240 steps | Material afterstate |
| --- | ---: | --- |
| No selected actor: fully passive | 0 | No meaningful material motion |
| Selected joint angle request, joint torque zero | 0 | No meaningful material motion |
| Real joint torque only, zero torso root motor | 0 | No meaningful material motion; torso drifts about 0.02m due reciprocal reaction |
| Pincer root-drive | 23 | 13kg box displacement **5.5893m**, 48kg box **2.7082m**, 75kg long beam **0.8127m** |
| Heavy rigid root-drive | 102 | 230kg box displacement **3.5586m** |

The contact number is *actor/material pair incidences accumulated across frames*, not independent actions or contact events. Different contacts do not imply a rich body vocabulary. With no selected actuator, the field is inert; unlike X0's world-power experiments there is no ambient energy. With jaw closure alone, default material does not lie within effective actuator reach/contact. It is **not** evidence that articulated limbs cannot manipulate material in general: the independent PR #2 already demonstrated this in appropriate physical circumstances.

**Whole-level verdict: negative for this attempt.** The default authored scene is again mechanically separated: one operator-driven body moves objects as it goes, and the other bodies have no lawful reasons to initiate anything. This does not offer a novel independent local-response ecology or several naturally discoverable actions. It makes a better-composed *picture of an experimental yard*, not the Owner's organism/crowd/feel goal. No human experience was measured, so product-level W1 outcome is UNQUALIFIED, **not Owner FAIL**.

## Methodological self-critique — IMPORTANT

**W1 was a weak falsifier of composition-first as a GENERAL idea.** By making every nonselected body completely passive and placing default material beyond effective stationary jaw reach, the test made both a dead idle field and a jaw-only null foreseeable. The conditions were still worth executing to expose how the actual UI/source behaves, but **zero contact here cannot rank action languages, infer the need for cognition or reject materially richer scenes in general**. We did not A/B compare against an independently plausible contact-capable whole, did not test varied free interventions or ask the Owner to use it. We merely reject the specific W1 implementation as unpromising under tested operator commands. Its narrow root-drive contact effects do not merit prolonged coordinate tuning. This correction must travel with every downstream reference to the W1 result.

## Critical alternative explanations / limits

- World composition was changed, but the available *action grammar* remained finite root drive plus opening/closing pincer jaws. A different physical arrangement might generate a jaw-only contact, but manually tuning this W1 to prove such a known PR #2 donor would not answer the whole-system deficit.
- Making nonselected actors truly passive removed a false source of resident activity but exposed a **missing source of purposeful actor action**. This does not prove a learned brain, ReflexBrain, LLM or complex planner is required. It means a passive physics set will not self-excite without material forcing or actor-generated effort.
- W1's 36×24 world still has simple box geometry and sparse material affordances. The runs measure narrow physical motion, not uncoached human curiosity, legibility of perceived abilities, crowd throughput or any combat.
- The prototype did not perform a human First Look, capture a new raw image, or validate free-form inputs in this run beyond inherited emitted-browser checks. No public artifact should be promoted on this evidence.

## Research decision

**STOP W1, do NOT scale body counts, tune positions, bolt on X0 reflexes, or optimize contacts.** Its exact source stays an isolated historical discriminator. Separate the two increasingly conflated questions:

1. **Physical repertoire:** What different interventions can a body actually perform *in the same material world*, over simple rigid proxy controls, without secretly relying on a world anchor or grip?
2. **Self-generated consequential action:** What modest **explicit source of actor effort/intent** permits real independent local action/reaction, without imposing traffic routes or importing a whole AI system? Compare operator-driven and caused local automatic actions fairly; label causal source.

A next credible **serious whole** should intentionally couple both questions and give a free operator a short edit→play→break loop. It must then be judged against R0/R1/L0 Owner-level fail baseline, not W1's contact counts. Nonselected body being inert is an honest control, not a product solution. New dimensionality, support, body anatomy, and learned reflexes remain OPEN competing pressures.

**No coding continuation mandate.** Select a whole based on compelling affordances and its ability to falsify this diagnosis; source code from W1 earns no parent rights.

## Repository / next conversation

- Branch: `experiment/commons-w1-composition`; PR #6 review target is donor PR #2 only. Do not merge it into `main`.
- `main` remains neutral research truth; `rehearsal/current` unchanged and needs Owner publication consent.
- T0 remains a negative morphology/idle diagnostic, separate from W1.
- For restart, read `docs/RESEARCH_STATE.md`, `docs/AGENT_RUN_CURSOR.md` then **this checkpoint only if necessary**. Neither W1 nor this document may dictate the next code branch.
