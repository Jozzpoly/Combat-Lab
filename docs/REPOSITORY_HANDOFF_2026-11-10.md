# Combat Lab — independent-agent recovery (10 November 2026)

**Status: dormant research lab. This file is not a roadmap or a new software architecture.** The Owner requested a provider-independent cleanup and a period away from GPT on 10 November 2026. A future agent must refresh live GitHub state and the latest Owner message; this is a fixed-date snapshot, not an always-current truth.

## First five minutes — no previous ChatGPT access needed

1. Read [README](../README.md), this file, [research truth](RESEARCH_STATE.md), [experiment protocol](EXPERIMENT_PROTOCOL.md) and [failure record](FAILURE_SCAR_2026-10-06.md). Only open a specimen's detailed report when needed; the long [October run cursor](AGENT_RUN_CURSOR.md) is historical and must not silently schedule work.
2. Verify `git status`, `git remote -v`, `git branch -a`, current `main`, `rehearsal/current`, [all PRs](https://github.com/Jozzpoly/Combat-Lab/pulls?q=is%3Apr) and Actions. Do not accept this file's dates as live data.
3. The active `main` is **a deliberately neutral smoke test**, not a game/organism. `rehearsal/current` points to a separately chosen public demonstration. Do not move it, dispatch Pages, or infer that `main` is an accepted product.
4. An experimental result in an archived commit is **evidence, not selected code**. Read the report, examine exact source and CI/negative controls, then decide afresh whether to borrow the smallest useful part.
5. Prefer your own provider's tools and isolated branch; GitHub and plain Markdown/JSON are the recovery substrate. No connection to ChatGPT Memory, GPT skill, private Commons, Opera tab, AgentMail or personal accounts is required to understand this public repository.

## What this project is

A lab for discovering **physically different bodies, movement, contact, pressure, crowds and material interactions in an editable world**. The Owner aims for the loop: build/change → run → observe real consequences → disrupt/break → rebuild. It is **not** a traffic simulation, a dashboard of numerical tests, or a commitment to Rapier2D, 3D, any single actor-brain or any particular Jaskinia integration. The historical R0/R1/L0 experience **FAIL** remains; later test success does not imply gameplay acceptance.

**Four kinds of proof never to conflate:** source/mechanics PASS; genuine browser/input execution; human play/feel judgment; independent, source-grounded causal explanation. For visual/feel claims, ask the Owner only when a usable candidate exists; don't pretend automatic CI decides.

## The exact repo cleanup boundary

- Source snapshot **46 original branches**, **10 open drafts at capture**, many nested head/base PRs. This is stale navigation, not 46 active initiatives.
- One forensic archive ref `archive/all-research-pre-provider-handoff-2026-11-10` at `863c0a056e9e0dfa7e5895ccf443a8ecfd4f520d`. Its **file tree equals the original main tree** and its **46 Git parents are exactly the 46 old branch tips**. Thus *all original commit graphs remain reachable through one archival ref*. It is NOT a new gameplay merge. Verify before relying on this property.
- [Machine-readable exact original ref/SHA and PR index](BRANCH_INVENTORY_2026-11-10.json): 44 research/old review/legacy-forensic refs are candidates for pruning; keep only `main`, `rehearsal/current`, archive ref.
- [Guarded, provider-neutral Git CLI pruner](../tools/prune-archived-branches.mjs) defaults to **dry-run**, requires `--apply`, checks exact live SHA for each ref, checks that all tips are ancestors of archive and refuses to touch the three keep refs. Never run it inside an incomplete/shallow clone or without required Git permissions.
- GitHub connector in GPT Chat did **not** expose branch deletion. If branch refs remain, say so: archive preparation is not the same as deletion. A future agent with ordinary Git push permission may complete the verified prune. Never use a force-move to disguise a branch deletion.

### Important source examples worth recovering (no automatic promotion)

| Research case | Exact original branch / what it genuinely established | What it did NOT establish |
| --- | --- | --- |
| W2 | `experiment/w2-embodied-material-commons`: ~20 independently simulated bodies with real foldable geometry under local rules | Natural locomotion or an interesting Owner-qualified whole; visually remains geometric |
| P7 | `experiment/p7-contested-doorway-crowd`: physical crowd/defender pressure; topology changes outcomes | Smart pathfinding, robust defensive stance, player-quality feel |
| P10b | `experiment/p10b-affordance-legibility`: direct edit, true-contact grip and reproducible real-world afterstates | Credible humanoid/animal movement, good mobile controls, natural organisms |
| P10c | `experiment/p10c-offline-owner-firstlook`: native Windows package path from P10b | Human-tested good gameplay or still-available CI ZIP artifact |
| P12b | `experiment/p12b-momentum-integrity`: sleeping backing-body caused previous false coupled momentum residual | Gait or generic physics-engine selection |
| Worldbench | `experiment/gpt6-worldbench-witness-2026-11-06`: real native Jaskinia ↔ P10b Rapier interaction under an explicit source grant | A persistent world, an accepted Jaskinia API, usable Owner UX or selected host architecture |

Some experimental reports live **only in their experiment commits**, not in main. Open by original commit SHA from the inventory, not an assumed surviving branch.

## Jaskinia relationship and proved counterexamples

Old host experiment: [Jaskinia Worldbench draft #7](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/7); [Combat donor draft #15](https://github.com/Jozzpoly/Combat-Lab/pull/15); [independent Jaskinia donor record](https://github.com/Jozzpoly/Jaskinia/issues/4). All are optional, scoped sources.

Real Chrome/Rapier tests: P10b runs in old Jaskinia; source-authorized physical edit and actual afterstate PASS. Hidden native workspace responded to source messages but **physical ticks did not advance in the measured hidden interval**. After full Jaskinia reload, **same named workspace and window ID returned, but the Rapier world was new**; material edit 3.5m → 2.2m, no physics checkpoint. A command bound to the previous runtime was rejected, even with permission granted again. **Saved host layout ≠ saved simulation, same window ≠ same world.** Do not promote a global world registry/record schema or accept synthetic CI as human feel from this isolated case.

## Safe return after a long break

- First: confirm latest Owner goals; user currently wants *the repository recoverable and clean for other providers*, not a new rushed gameplay build.
- Preserve the important evidence, but challenge its meaning. The October [failure scar](FAILURE_SCAR_2026-10-06.md) warns that mechanically passing diagnostic fixtures became false foundations.
- Never assume software dependencies, stored browser state, private material, API keys or Cloudflare data are preserved by GitHub. No private Owner data belongs in this public repo.
- For experiments, work in a single clearly named isolated branch. Mark authorship, source provenance, actual execution, Owner verdict and negative findings. A git SHA is not a promise of runnable software after tooling changes.
- Never merge/archive-replay synthetic multi-parent commit, change `rehearsal/current`, publish a new Pages version or destroy an Owner world without a new explicit decision.
