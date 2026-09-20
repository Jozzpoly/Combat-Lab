# Combat Lab — Experiment Protocol

This file defines how Combat Lab should behave during long autonomous runs and short Owner commands such as **“kontynuuj.”**

Its purpose is to prevent implementation momentum from becoming research authority.

## 1. Start from live truth

Before substantial work:

- read `README.md` and `docs/RESEARCH_STATE.md`;
- inspect current branches and the public deployment source;
- distinguish Owner-confirmed intent from candidate hypotheses;
- treat the newest Owner play evidence as stronger than an older roadmap.

Do not continue an implementation merely because it already exists.

## 2. Hypothesis before code

Every new lane needs a compact hypothesis card containing:

- **player action** — what the player does with hands/input;
- **realized behavior** — what body/weapon/world actually do;
- **30-second discriminator** — what should be unmistakably different in play;
- **Feniks relevance** — why the distinction matters;
- **falsifier** — what would make us stop.

If the discriminator cannot be stated clearly, do not code the lane.

## 3. Phenomenon-level differences, not parameter theater

Different constants do not automatically make different hypotheses.

Bad comparison:

- 20° steering;
- 40° steering;
- 60° steering.

Potentially valid comparison:

- direct weapon expression;
- body/momentum-driven attack;
- persistent guard/contact combat.

The test is player-facing: **would a player naturally behave differently?**

## 4. Keep the situation comparable, not the mechanics identical

A comparison may share:

- arena;
- opponent intent;
- objective;
- broad visual language;
- input hardware.

It does **not** need to share the same attack animation, resolver, body contract or timing if those are part of the hypothesis.

Forcing every candidate through one mechanism can erase the very difference being investigated.

## 5. Minimum playable organism

A specimen must contain enough game to judge fighting:

- controllable embodied character;
- meaningful opponent or pressure;
- spatial consequence;
- readable contact / miss / threat;
- quick reset;
- enough feedback to understand causality.

Avoid both extremes:

- algorithm visualizer with no fight;
- mini-game feature pile that hides the tested phenomenon.

## 6. Evidence boundaries

### Machine evidence can qualify

- deterministic helpers;
- geometry/math;
- runtime health;
- input plumbing;
- provenance;
- deployment correctness.

### Machine evidence cannot qualify

- combat feel;
- weight;
- responsiveness;
- mastery;
- readability;
- desire to continue playing;
- whether a mechanic belongs in Feniks.

Those require Owner play.

## 7. Deployment discipline

Automatic Pages deployment is reserved for `main`.

An experimental specimen may be deployed only through an **explicit manual deploy of an exact ref/SHA** after its checks are green.

The public URL must never silently become an experiment merely because an experiment branch received a push.

After a rejected experiment:

1. restore Pages to `main` / reset truth;
2. record the finding and preserved commit SHA in `RESEARCH_STATE.md`;
3. remove or retire the experiment branch instead of accumulating stale lanes.

## 8. Branch hygiene

Target state:

- `main`;
- at most **one active experiment lane** unless a simultaneous comparison genuinely requires more.

Rejected experiments are historical evidence, not permanent branches. Preserve their commit SHA and result in documentation, then clean the branch.

Do not create branch forests for checkpoints, retries or minor parameter changes.

## 9. Meaning of “kontynuuj”

A short Owner command is authorization to continue the **current research objective**, not the last bullet point mechanically.

On each continuation:

1. recover the current live state;
2. identify the highest-value unresolved uncertainty;
3. check whether new evidence invalidates the old plan;
4. choose a reversible next action;
5. execute as far as evidence permits;
6. stop or pivot when the research question is answered or falsified.

Do not manufacture work for momentum.

## 10. Promotion rule

Nothing becomes “Feniks combat” because:

- it exists;
- it is elegant;
- tests pass;
- it took a long time to build;
- it resembles a known game;
- it is the least bad current specimen.

Promotion requires repeated Owner evidence that the player-facing combat language is valuable enough to deserve deeper investment.
