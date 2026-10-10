# Combat Lab — Research State

**Zaktualizowano:** 2026-10-11 · **Status produktu:** no Owner-qualified new specimen; historical R0/R1/L0 Owner FAIL active; no public deployment change. W2 integrated candidate judged mechanically but NOT visually/experientially accepted.

## Aktualny stan — czytaj najpierw

**Cel:** odkrywać w otwartym, edytowalnym świecie fizycznie odmienne organizmy, rzeczywisty ruch i nacisk, relacje ciał/materii, crowds, reakcje, a w przyszłości walkę. Nie budować ponownie ruchu kulek po trasach ani zbioru demonstracji bez zabawy.

**Najlepszy bootstrap:** [skonsolidowany raport E1+B1, korekty i granice](COMBAT_LAB_CAMPAIGN_CONSOLIDATION_2026-10-11.md) oraz [krótki agent cursor](AGENT_RUN_CURSOR.md). Szczegóły i pierwotne dowody nadal są w branch-specific raportach; **23 wcześniejsze wpisy chronologiczne z tej strony zachowano w [historycznym archiwum](history/RESEARCH_STATE_OVERLAYS_THROUGH_2026-10-10.md)**, zamiast tracić je lub przenosić do nowej architektury.

| Kandydat | Evidence | Aktualna kwalifikacja |
| --- | --- | --- |
| **W2 — dwa prawdziwie składane ciała w E1-like wspólnym świecie** | [izolowana gałąź](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/w2-embodied-material-commons), [exact-head CI 38095634526](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38095634526), [genuine source frames t0](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/w2-embodied-material-commons/docs/media/w2-genuine-source-t0.png) / [t420](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/w2-embodied-material-commons/docs/media/w2-genuine-source-t420.png), [full W2 red team](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/w2-embodied-material-commons/docs/W2_INTEGRATED_MATERIAL_COMMONS.md) | Fold 3.86m→0.90m, real bounded hinges/side-matter, 20-actor shared-world numerical + interface tests; **agent visual review: still traffic-like geometric clumps, not compelling whole**. Owner feel UNKNOWN. Do NOT auto-parent. |
| E1 — 18 lokalnie aktywnych aktorów w materialnym świecie | [Draft PR #9](https://github.com/Jozzpoly/Combat-Lab/pull/9), [exact source Chromium CI PASS 38091544155](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38091544155), [checkpoint](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/e1-local-encounter-whole/docs/E1_WHOLE_LOCAL_ENCOUNTER_CHECKPOINT_2026-10-10.md) | Causally differentiated local steering, **no Owner feel PASS**; all use finite external root motor proxy |
| B1 — real folded/expanded mass-bearing body | [Draft PR #10](https://github.com/Jozzpoly/Combat-Lab/pull/10), [exact source CI PASS 38093724125](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093724125), [checkpoint](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/B1_PHYSICAL_ENVELOPE_DUAL_AFFORDANCE_2026-10-10.md) | Two actual incompatible material affordances, **not** living creature or qualified architecture |
| B1 rival — single cheap collider with edited profile | [falsifier CI 38093607072](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093607072) | Ordinary passage+wide push replicated; naive change of profile **FAIL** against occupied material; collision-aware cheap approach **UNTESTED** |
| G0 — ground-reaction source calibration | [closed PR #8](https://github.com/Jozzpoly/Combat-Lab/pull/8), [CI 38089508879](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879) | Physical wheel traction source established, NOT true animal locomotion |

**Granica źródła:** `main` = neutralny kod i dokumentacja, `rehearsal/current` = tylko wskaźnik opublikowanego pokazu (nie zmieniony), E1/B1 = osobne eksperymenty Draft bez merge ani publikacji. Sprawdzaj *live* HEAD/CI i najnowsze Owner corrections. Nie ma uczciwego pomiaru końcowego FPS, autonomicznej decyzji B1 o złożeniu, prawdziwego chodu ani Owner PASS.

**W2 source correction (CI 38095936923):** world query falsely reported 0 initial overlaps in two crowded placements, while independent direct shape-pair checks found 1 real initial intersecting pair in each. Those crowded placement results are **confounded**. Chosen default clean positions have 0 direct initial pairs, and zero-actuator causal contrast survives. [W2 red-team evidence](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/w2-embodied-material-commons/docs/W2_INTEGRATED_MATERIAL_COMMONS.md). Do not infer general collision-safety or Owner fit from a clean initial scene.

**Nowe źródłowe negatywne W2:** predeclared placement/actuator-null tests distinguish active commanded folding from passive compression; when joint torque=0, pressure-policy vs manual gives identical world outcomes. First W2 20-actor experience remained visually geometric/attractor-like and does not qualify a new game. Do not answer by another dozen odor/pressure parameter tweaks or auto merge.

**Najbliższe pytanie, nie rozkaz:** jak połączyć *samodzielną lokalną inicjatywę* z *materialnie różnymi umiejętnościami ciała* w jednym naturalnie testowalnym i niszczalnym świecie — jeśli jest to lepsze niż inne świadomie wybrane doświadczenie — zachowując równorzędne tanie modele i pierwszeństwo odczucia Ownera. Bez obowiązkowego łączenia gałęzi, nowych „fundamentów” i presji na publikację.

---

## Current repository truth

Stable repository roles (not an exhaustive or automatically refreshed branch inventory):

- `main` — neutral Lab state and selected research question;
- experimental refs — isolated, replaceable candidate work; query live branches and CI for the current head;
- `rehearsal/current` — deployment pointer only;
- `archive/forensic-pre-cleanroom-2026-10-06` — forensic reachability only.

An experimental branch may have a machine-green browser boot and still lack both Owner qualification and the intended phenomenon.

The repaired deployment path was validated by moving `rehearsal/current` to:

`cb4b44d417db612f3333fe515e6f6afffa3e56d8`

Public Pages provenance was independently verified against that exact SHA.

`main` may advance through non-rehearsal work without changing the public specimen; that separation is intentional.

CI no longer forbids `src/`, `experiments/` or `scripts/`, and no longer asserts research-roadmap text.

Pages no longer deploys every successful `main` change automatically. Public rehearsal is controlled by the explicit `rehearsal/current` pointer or an exact manual source.

## Durable Owner intent

Combat Lab is not a sword project, a crowd project or a single-combat-system project.

Its durable role is to discover useful **embodied/material possibility** across domains such as:

- body size, envelope, proportions, mass, burden and locomotor authority;
- occupied space, contact, yielding, displacement, support and stance;
- terrain, obstruction, clearance, multiple routes and local access;
- persistent tools, shields, reach, polearms, axes and other equipment relations;
- bows, projectiles, magic and mixed modalities;
- multiple actors, asymmetric pressure, future party/co-op relations and crowd/horde regimes;
- persistent material/world afterstate and other phenomena not yet named.

The list is a possibility map, not a roadmap.

The Lab must remain permissive and self-directed:

- live intervention;
- independent raw dimensions;
- exact/extreme authoring;
- intentional break regimes;
- direct causal inspection;
- no paternalistic protection from strange or destructive experiments unless the program itself is at risk.

Cheap fixtures are allowed when they answer a narrow question.

They must not become the project's identity merely because they exist.

Conversely, when evidence or explicit Owner direction calls for a serious qualitative step, the Lab must be able to spend substantial time building a coherent whole rather than endlessly substituting more tiny fixtures.

### Broader horizon

The wider dream reaches beyond Combat Lab toward living material worlds and autonomous embodied actors with continuity, local history, consequences and their own trajectories.

Combat Lab should contribute **material capability and embodied-world evidence** to that horizon.

It must not absorb the full cognition, NPC, Companion, ReflexBrain or Feniks architecture merely because those projects are related.

## Removed authority

The previous implementation families — including B0, Ecology, R0, N1, C0, D0, M1, R1, D1, S1 and Living Movement L0 — are absent from the active tree and have no execution or roadmap authority.

Historical Git remains available through the forensic archive.

Historical existence, test count, previous qualification language and commit ancestry do not make an old mechanism a current foundation.

Recover old material only for a concrete current question.

## What the forensic recovery established

The earlier Combat Lab worked best when it was **phenomenon-first**:

- unresolved frontiers were explored with sufficiently whole, divergent specimens;
- machine PASS could validate mechanisms without qualifying the whole organism;
- whole-organism FAIL could kill a line despite green tests;
- completed stages could leave the next frontier intentionally open;
- a separate frontier reassessment selected the next discovery question from broad Owner intent and evidence.

The major failure began during the second R0 rehearsal analysis.

A diagnostic campaign that successfully explained observed failures crossed its boundary and converted:

> independent causes -> "foundations" -> M1 -> R1 -> D1 -> S1 -> planned recomposition.

That future sequence was then written into canonical state and semantically asserted by repository-hygiene tests.

The result was a self-reinforcing tunnel:

> agent-selected roadmap -> canonical truth -> CI-consistent roadmap -> next agent inherits roadmap as live truth.

Living Movement L0 later changed code but inherited the narrowed problem representation. It reduced organism/body diversity, reduced pressure/break freedom, remained qualitatively close to the old crossing-ball scene and was nevertheless exposed to the Owner after mostly branch-local improvements.

## Important corrections

The clean-room reset was necessary as quarantine, but its first protocol overcorrected toward "DELETE by default" and its first CI made experiments impossible.

Those are now corrected.

The current protocol is **provisional recovery law**, not sacred architecture.

It restores:

- discovery before attribution;
- phenomenon-level baselines;
- diagnostic results without automatic parent/foundation authority;
- serious construction as a distinct mode;
- explicit Owner-attention discipline;
- permissive Lab freedom;
- repository/CI separation from research authority.

## Evidence hierarchy

For experiential/product claims:

> **Owner-observed behavior and explicit Owner judgement > live experiment evidence > machine qualification > documentation > historical implementation momentum.**

Machine evidence remains authoritative only for the narrow facts it actually establishes.

## Current frontier

**RESELECTED — embodied material agency beyond transit.**

Canonical selection record:

- `docs/FRONTIER_REASSESSMENT_2026-10-07.md`

Working question:

> **When materially different embodied actors share a varied material world, do body/world differences create multiple useful, legible possibilities that the Owner naturally discovers — beyond simple traversal, fit/no-fit and crowd flow?**

This is a reselection of the unresolved broad body/world question, not a continuation of Ecology/R0/L0 implementation.

The old traffic topology, route system, contact policy, crowd harness and old "foundation" labels have no inheritance rights.

Selected-question design record (not a declaration that implementation has not begun, nor accepted architecture):

- `docs/BODY_WORLD_SUBSTRATE_AND_SPECIMEN_2026-10-07.md`

The 2026-10-07 **research preference** for a trial physics substrate was deterministic Rapier2D behind a thin Combat Lab-owned world boundary. E1/B1 subsequently experimented on replaceable Rapier2D donors; this history is **not an endorsed final engine or required code ancestry**. Character Controller and Companion provide bounded donor properties only; neither architecture was imported wholesale.

Since that selection, E1 became an isolated conditional multi-actor local-agency candidate and B1 an isolated body-affordance experiment. W2 combined a genuine independently actuated morph with an E1-like editable local world without merging main; source tests PASS but visual whole-level result remains underwhelming and unqualified. **The still-open whole-level selection now concerns whether multiple physically distinct body actions create valuable editable material-world play, compared with credible cheap competitors.** It must not become another chain of diagnostic cells or an automatic E1+B1 merge. See the 2026-10-11 consolidation for fresh bounds.

## Current operating boundary

While the selected frontier is explored:

- no old implementation is revived merely as a continuation;
- no candidate gains organism/product authority from passing narrow CI;
- an experiment may be built, tested, substantially redesigned or retired according to the still-open body/world question;
- neutral repo/infrastructure work must serve experimentation rather than silently selecting the hypothesis;
- forensic reading remains scoped to concrete recovery questions.

> **The Lab exists to discover. Repository state, green tests and old foundations are evidence-management tools, not a substitute for choosing what is worth discovering next.**
