# Combat Lab — instructions for any code agent

These are repository-local working constraints, **not** instructions tied to GPT, Claude, Gemini, Grok or any particular provider. Latest direct Owner instruction overrides older plans.

Read `docs/REPOSITORY_HANDOFF_2026-11-10.md` before substantial changes. Read `docs/OWNER_EXPERIENCE_PRIMARY_EVIDENCE_2026-11-10.md` before treating any physical prototype as Owner-qualified. This repo is deliberately dormant pending the Owner's return; do not wake a roadmap just because a tool can write code.

- **Goal:** open-ended exploration of embodied movement, material contact, crowds, pressure and meaningful differences between physical bodies. Owner should be able to directly change, break, observe and rebuild worlds. Product-level R0/R1/L0 failures remain binding.
- **Authority:** Owner's latest instruction > current verified live source / direct evidence > dated research summaries > old agent prompts. An experiment is not automatically a foundation; a green CI test is not Owner-accepted gameplay.
- **Topology:** `main` = neutral current research truth, not a playable feature branch; `rehearsal/current` = controlled public deploy pointer; `archive/all-research-pre-provider-handoff-2026-11-10` = synthetic forensic graph only, never build/merge/deploy it. See JSON branch manifest for exact recovery. You may experiment on new clearly named branches; don't resurrect dozens of old PRs.
- **Permissions:** isolated/reversible tests and PRs are appropriate. Treat deleting remote history, changing production, exposing data, charging accounts, and irreversible migrations as separate boundaries. Preserve exact source and rollback when appropriate. Do not insert private conversations, secret keys, Library files or user data into public source/CI logs.
- **Proof:** distinguish source PASS, real browser PASS, Owner experience UNKNOWN/FAIL and source-causal explanations. Explicitly note when exact code was not executed.
- **Handoff:** write one small honest checkpoint in plain Markdown with SHA, tests, decisions and unresolved questions. Avoid provider-only memory/skills as the sole continuity path. Prefer work/output over status theater.
- **Do not silently select technology:** Rapier2D, Rapier3D, AI control, player input, world persistence and Jaskinia integration remain hypotheses, not accepted product contracts.
