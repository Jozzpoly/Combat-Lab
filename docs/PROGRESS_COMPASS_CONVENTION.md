# Combat Lab — Progress Compass / Owner navigation convention

**Status:** presentation convention for future Combat Lab conversations and checkpoint reports. **Not** a product-roadmap authority, implementation requirement, metric, CI gate, or frozen project state. This note exists so the compact visual navigation pattern survives chat changes. A later explicit Owner preference overrides it.

## Purpose

Long project work can consume the Owner's attention when each answer requires reconstructing the strategy. Provide a small, legible *route to the research goal* at natural stopping points. It should take seconds to scan and explain: **where we came from, where we are, the next meaningful threshold, and what the larger work is for**.

This follows an actual Owner screenshot/review dated 2026-10-09. The earlier four stacked lines were readable, but looked like a list of equal statuses. The past, the active frontier, the next decision and the horizon lacked clear hierarchy; muted icons were not a strong timeline. The explanatory disclaimer plus following prose lengthened the footer unnecessarily.

## Stable four anchors

1. **ZA NAMI** — a short *established* finding or previously experienced failure that constrains the path; not a feature changelog or blanket PASS.
2. **TERAZ** — one current research question, task or unresolved decision. Strongest visual emphasis. It must reflect *live* state, not the last assistant's announced plan.
3. **NASTĘPNY PRÓG** — one concrete high-value evidence/decision boundary. Not every next command, implementation step or PR.
4. **HORYZONT** — the durable Owner-level purpose. Stable across many conversations, changed only by substantial Owner correction.

Heading: **Combat Lab · kompas** (or *<project> · kompas* in another project, with its own verified intent). Four rows, short label + one short clause per row. Prefer distinct small icons: completed history / active marker / upcoming marker / distant destination; no repeated colorful status badges. Emphasize the whole **TERAZ** row, not every word. Make the next threshold legible but secondary, and the distant goal quiet.

The *current slot text* is always generated from recent Owner corrections, live repository/experiments and the current conversation. **Never copy a dated example into a new chat as factual live truth.**

### Example (dated, not operational authority)

Combat Lab · kompas

- ✓ **ZA NAMI** — odzyskany Owner intent; lekcje R0/L0
- ● **TERAZ** — rozstrzygamy, czego brakuje relacji ciało ↔ świat
- ○ **NASTĘPNY PRÓG** — sensowny eksperyment całej relacji, nie kolejna mechanika
- ◇ **HORYZONT** — swobodne odkrywanie fizycznych możliwości istot

For narrow tooling without visual layout, plain text with these exact Polish labels is the durable fallback. The meaning must survive losing icons, formatting and colors.

## Usage cadence and hierarchy

Use on **meaningful checkpoints**, long-run summaries, strategic pivots, after a change of chat, or when the Owner explicitly asks to regain orientation. **Not** at the end of every routine status update or each minor CI finding. If the answer is already short and locally clear, omit the compass. It is a small footer, not a replacement for the result or an obligatory dashboard.

Keep every stage to **one line when reasonably possible**, especially on mobile. Avoid small-print narrative and a second paragraph after the compass. If there is a crucial qualification, prefer one optional compact status line above the compass: e.g. `Dowody mechaniczne: ograniczone · Owner feel: niezweryfikowany`. Omit it when the main answer already expresses those caveats.

No arbitrary percentage, timeline countdown, fixed phase count, score, emoji-rich decoration, or progress bar that implies a known distance to completion. This is a **qualitative navigation instrument**.

## Source-of-truth rules

- The Owner's direct observed outcomes and later corrections supersede product-level assertions. Old Owner-level FAIL is not healed by internal machine PASS.
- Machine evidence can justify movement of the research question or engineering capability, but not a product-level claim like "organisms achieved" or "feel solved".
- "ZA NAMI" can contain a negative lesson and a genuinely defended limited technical discovery; it must not rewrite the old verdict.
- "TERAZ" must change when the actual decision boundary changes; it need not change with every commit.
- "NASTĘPNY PRÓG" is an *evidence threshold*, not an order to execute last session's roadmap by inertia.
- "HORYZONT" remains Owner intent rather than an implementation checklist.
- If live context is unavailable, omit details or explicitly mark uncertainty instead of repeating stale labels.

## Multi-chat continuity

When resuming Combat Lab after a conversation boundary, read the live canonical [RESEARCH_STATE](RESEARCH_STATE.md), most relevant recent checkpoint and Owner feedback. Recover the current frontier and then render a **fresh** Compass with this four-anchor shape. This **presentation pattern may persist**, but its inner content is *always reconstructed*.

Do not modify the neutral repository, public rehearsal, branch boundaries or experiment scopes merely to display a status compass. This Markdown note is sufficient; there is no need for a widget dependency or new tooling.

**Anti-goal:** turning the footer into another compulsory report, overlong decorative tracker, fictional roadmap percentage or source of competing authority.
