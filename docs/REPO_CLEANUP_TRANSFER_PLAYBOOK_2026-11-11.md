# Repo cleanup under multiple AI providers — tested lessons, not a universal recipe

**11 November 2026.** Distilled from Combat Lab's executed evidence and independent work of other agents. This is a method to *interrogate* other repos, not instructions to automatically delete their branches.

## Evidence-first sequence

1. **Restore the Owner's purpose and real FAILs.** Identify direct Owner videos, negative verdicts and the actual creative loop, not only agents' latest summaries. Combat recovered three Owner-observation records removed from prior branch tips.
2. **Find the true runnable source.** `main` may be a neutral index, while an active lab lives in a special branch; deployment may be controlled by `rehearsal/current`, a static host or Cloudflare.
3. **Audit writes before making any.** Inspect GitHub Actions `push`, `pull_request`, `workflow_run`, `workflow_dispatch`, Pages and Cloudflare hooks. SPC triggered a Cloudflare process from documentation-only changes. Don't copy Combat's workflow blindly.
4. **Map all branch & PR head/base dependencies.** Treat draft PRs as *evidence containers*, not necessarily work queued for release. Preserve exact SHAs and distinguish source, preview, artifacts and Owner verdicts.
5. **Select a history retention mechanism fitting the repo.** Combat used one **46-parent** synthetic Git archive, with unchanged neutral file tree; ReflexBrain preserved ~100 old branch tips as named lightweight **tags**; Companion preserved three unique November donors as **tags** and folded older September evidence into main ancestry. Neither strategy is universally right.
6. **Cold-recover from what will survive cleanup.** Fresh clone containing only retained refs; check all old tips and selected real source paths, including files deleted from recent branch trees. Combat verified 148 formerly branch-based URLs point to existing Git objects.
7. **Make a real independent backup possible.** Export all relevant ref history as a verified `git bundle`, clone it to test, record SHA256 and make a downloadable ZIP. Until the Owner saves it **outside GitHub**, it is not independent protection.
8. **Check historical credentials, private data and license.** Heuristic regex screening is only a screen. Public repository + no LICENSE is not a grant of redistribution rights. Do not leak potential secret values in logs.
9. **Validate destructive permissions on a disposable branch**, never by sacrificing a historical one. Combat's GitHub-token canary created and SHA-leased-deleted a disposable `verification/*` ref with PASS, then disabled its automatic trigger.
10. **Require manual decision and verify after deletion.** Exact SHA locks, retained-archive ancestry, no unlisted branches, excluded default/deployment refs, offsite backup acknowledgement and explicit typed confirmation. Multi-ref deletion is non-atomic; partial results require re-audit. Finish by refreshing dated handoff claims.

## Different repos require different boundaries

| Repo | Verified state around 10/11 XI | What must not be copied from Combat |
| --- | --- | --- |
| Companion-Brain-Lab | **1 surviving branch, no open PRs**; November isolated donors kept as 3 tags, earlier Sept history indexed | Do not recreate its already-closed PRs or run a second competing cleanup |
| ReflexBrain-Lab | **15 branches, 10 open PRs**, ~100 archived tip tags | Its retained PRs form a nested dependency chain; `main` is not the R8 executable lab |
| Llm-Live-NPC / SPC | **78 branches, 42 open PRs**; vendor-neutral handoff PR #167 remains open | Workflow can touch Cloudflare; may involve API keys/billing and First Hearth versus R6 distinct histories |
| Combat-Lab | **47 branches, no open PRs**; 44 candidates ready for human-approved retirement | One synthetic archive keeps history; don't merge/archive-deploy it; one-time deletion remains pending |

**Don't turn cleanup into unrequested gameplay or a new platform framework.** Preserve meaningful experiments and direct Owner observations, distinguish branch removal from code loss, and make handoff simpler for an unfamiliar agent.
