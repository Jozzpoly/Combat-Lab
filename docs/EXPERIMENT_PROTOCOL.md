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

## 3.1 Discovery before attribution

Combat Lab uses two different experimental modes and must not confuse them.

### Discovery mode — default when opening an unresolved frontier

When we do not yet know the right combat language, compare a few **deliberately divergent whole organisms**. Multiple coupled mechanics may differ if that is necessary to make the player-facing phenomena genuinely different.

The goal is not yet to prove which individual variable caused an effect. The goal is to discover **where there is something worth explaining**.

### Attribution mode — later

Once an organism repeatedly survives Owner play and contains a valuable phenomenon, narrow A/B experiments can isolate steering, timing, contact, assistance, momentum, hit fidelity or other variables.

Do not enter attribution mode merely because it is easier to make a clean experiment.

Early over-isolation can remove the phenomenon we are trying to discover; R0 and the LIVE / BOUNDED / CAPTURED spike are preserved warnings of this failure mode.

## 3.2 Possibility-richness gate

Before a discovery specimen earns Owner attention, ask whether it contains a **possibility surface**, not merely a mechanism demonstration.

A useful whole organism should normally permit several materially different legal responses to pressure, such as combinations of:

- approach / retreat / angle change;
- hold / yield / displace;
- attack / threaten / interrupt;
- use of reach, cover, choke, obstruction or open space;
- bypass, reposition or terrain exploitation.

The specimen fails this gate when its claimed strategy is substantially pre-authored by the test apparatus itself.

Warning signs:

- one route exists mainly so one preset fits and another does not;
- AI threat is active only inside a hand-authored lane that encodes the intended answer;
- an automated policy knows the solution before the organism has demonstrated that a player could discover it;
- labels, HUD text or test instructions tell the Owner which role or strategy to enact;
- the same interaction would remain after replacing the combat organism with a generic movement puzzle.

Discovery specimens may still be small and authored. The requirement is not sandbox breadth. The requirement is that **multiple useful possibilities arise from the organism/world relationship rather than from the test script declaring the correct move**.

A mechanism cell may intentionally violate this gate. If it does, classify it as mechanism evidence and do not promote it to Owner-product evidence.

## 3.3 Classless-emergence check

When an experiment claims to demonstrate a natural combat role, that role must not exist only because of a hidden class flag.

Prefer shared explanatory properties such as body envelope, mass, equipment burden, acceleration, contact resistance, weapon geometry, shield coverage, stance and learned technique.

Temporary anchor presets are allowed for discovery. They are **test points**, not classes.

Before promotion, perform a continuity check by changing equipment/body properties or creating an awkward hybrid. If the role only survives at handcrafted presets, the classless-emergence claim failed.

Do not confuse this with a ban on discrete learned abilities. The rule is narrower: a role cannot be called emergent if its base identity is produced by `if class == ...`.

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

An experimental specimen may be deployed only after its checks are green and deployment intent is explicit.

Supported explicit paths:

- automatic deployment from a successful checked `main` commit whose message contains `[deploy]`; the Pages workflow deploys that exact checked `head_sha`;
- **rehearsal control plane:** move the dedicated `rehearsal/current` ref to an exact already-selected candidate; its ordinary `check` workflow must pass, after which Pages deploys that exact checked `head_sha`; or
- manual workflow dispatch of an exact branch, tag or commit SHA when a deliberate non-main rehearsal is needed.

There is **no whitelisted active `experiment/*` auto-deploy path**. Ordinary experiment-branch pushes never deploy.

`rehearsal/current` is infrastructure, not research authority:

- it must point to the exact specimen intended for the current public rehearsal;
- it must never be used as a place to author work;
- moving it is an explicit deployment action;
- after a rejected rehearsal, move it back to the intended canonical public source and let normal CI qualify the rollback;
- canonical docs must name the exact deployed candidate SHA independently of the moving rehearsal ref.

The public URL must never silently become an experiment merely because an experiment branch received a push.

After a rejected experiment:

1. if a manually deployed experiment temporarily occupied Pages, explicitly restore the intended canonical public specimen;
2. record the finding and preserved commit SHA in `RESEARCH_STATE.md`;
3. remove or retire the experiment branch instead of accumulating stale lanes.

## 8. Branch hygiene

Target state:

- `main`;
- at most **one active experiment lane** unless a simultaneous comparison genuinely requires more;
- one optional infrastructure-only `rehearsal/current` ref when public rehearsal/rollback control is active.

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


## 11. Owner exposure timing

Machine-side falsification exists to prevent obviously invalid Owner tests. It must not become a substitute for human discovery.

When a whole organism is:

- stable enough to manipulate;
- causally understandable enough that obvious runtime bugs will not dominate;
- genuinely different at the phenomenon level;
- safe to expose without contaminating the question with instructions;

then prefer an **early raw Owner observation** over another long chain of agent-only tuning.

Do not require exhaustive mechanistic attribution before the first human-facing discovery test.

A short Owner reaction such as:

- "this is dead";
- "this is sticky";
- "I don't understand what I can do";
- "this is already something";

may be more valuable than dozens of deterministic tests when the question is fundamentally experiential.

Machine evidence remains authoritative only for the narrow facts it can actually establish.

## 12. Execution-substrate refoundation rule

A clean execution reset is allowed when accumulated implementation begins to bias what the lab can ask.

A refoundation must preserve:

- exact experiment SHAs;
- Owner evidence;
- falsifiers;
- qualified causal kernels;
- donor findings;
- protocol lessons.

It does **not** need to preserve:

- current runtime architecture;
- current player controller;
- current actor representation;
- attack/action abstractions;
- weapon/contact semantics;
- experiment numbering;
- branch ancestry as design authority.

The neutral substrate should share only machinery that cannot answer a combat hypothesis by construction.

If a supposedly shared abstraction already assumes what an actor, attack, weapon, spell, projectile, hit, block or commitment is, it belongs in an experiment until multiple independent families justify promoting it.

## 13. Cross-project donor recovery

Combat Lab may deliberately recover proven capabilities from sibling Feniks-related projects when doing so prevents needless reinvention.

Likely donor domains include:

- movement / locomotion infrastructure;
- pathfinding / navigation;
- spatial relation and neighborhood bookkeeping;
- multi-actor pressure / steering support;
- other bounded infrastructure already exercised elsewhere.

Potential donor projects include **Feniks, ReflexBrain, Companion and SPC**.

Rules:

1. start from the current Combat Lab question, not from whatever architecture the donor already has;
2. identify the exact donor behavior, evidence and provenance that are useful;
3. prefer narrow infrastructure/mechanism reuse over wholesale architecture import;
4. treat donor project assumptions and abstractions as candidates, never automatic Combat Lab authority;
5. re-test the transplanted property inside the Combat Lab context before relying on it;
6. do not start a donor sweep merely because one is possible — use it when the current frontier would otherwise reinvent something material.

This donor review is intentionally **later than the current repository/preparation closure** and does not itself select the next combat specimen.
