# Combat Lab — Repository Closure Audit 2026-09-26

**Purpose:** verify that the project is technically and organizationally clean before opening a new research direction.  
**Authority:** repository-hygiene / handoff record; product and research claims remain subordinate to Owner evidence and `docs/RESEARCH_STATE.md`.  
**Pre-final-deploy audit head:** `38ce712bfea787f8372521a403c5f2a4e878061c`.

## 1. Owner requirement being verified

"Ready to move on" means more than a green specimen.

The repository must have:

- one current truth;
- no stale live branches;
- no unpreserved historical lineages;
- no obsolete workflow files;
- no accidental auto-deploy path;
- no historical document masquerading as current instruction;
- no known open implementation debt from the closed Workbench/B0 stage;
- a clean exact-SHA public provenance chain.

## 2. Canonical truth — PASS

Canonical entrypoints are now:

- `README.md`;
- `docs/RESEARCH_STATE.md`;
- `docs/EXPERIMENT_PROTOCOL.md`;
- durable Owner scope / Workbench / B0 closure records.

The old append-only `RESEARCH_STATE.md` was preserved verbatim at:

- `docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md`.

`docs/HISTORY_INDEX.md` separates current/durable records from historical campaign evidence.

Historical campaign files carry a visible:

> **HISTORICAL RECORD — NOT CURRENT AUTHORITY**

banner when their original wording could otherwise imply that an old "active/current/next" state is still live.

## 3. Branch topology — PASS

Before cleanup, the repository had seven branch refs:

- `main`;
- five `experiment/*` branches;
- `refoundation/combat-lab-vnext`.

Before any deletion, every stale branch HEAD was independently verified to be an ancestor of canonical `main`.

Unique historical lineages were preserved in the canonical Git DAG by multi-parent checkpoint:

- `a70f145e826b2afb90de3cdbef84a0ca5004917b`.

Preserved historical heads include:

- Terrarium: `a95654ca7a765167375086259f09a7b090fa6bcb`;
- control/discovery shared ancestor: `35e5017af40c85cdeb2e03e9843e75ae5cc2998a`;
- phenotype: `e9d592f007d31c2715d9f687e336c4517504e59a`;
- whole-organism lineage: `ba081120d2563f767e14cd5b61e07f6503a0627f`;
- former-main hardening lineage: `46877d01119f4098e685b06dcbba04188700d897`.

An ancestry-gated one-time GitHub Actions cleanup then deleted all six stale refs.

Post-cleanup GitHub API verification returned exactly one branch/ref:

- `main`.

The one-time cleanup workflow was subsequently deleted.

## 4. Repository surface — PASS

Default branch:

- `main`.

Open pull requests:

- none.

Open issues:

- none.

Releases:

- none.

Root/project tree contains only the current Workbench runtime, experiments, source, tests, documentation and two permanent workflows.

Removed / absent:

- stale experiment branch refs;
- stale refoundation branch ref;
- legacy `pages-r0.yml`;
- one-time cleanup workflow;
- obsolete `organisms` deployment fallback;
- generated `dist` artifacts in source control.

Package identity is now:

- `combat-lab-research-workbench`.

## 5. Workflow / deployment contract — PASS

Permanent workflows:

- `.github/workflows/check.yml`;
- `.github/workflows/pages.yml`.

`check.yml` runs:

- Node test suite;
- real Chromium Workbench interaction gate;
- screenshot rehearsal artifact generation.

`pages.yml`:

- listens only to successful `main` checks;
- deploys automatically only when the source commit explicitly contains `[deploy]`;
- also supports explicit manual exact-ref dispatch;
- checks out the exact deploy SHA;
- emits `COMMIT.txt` and `BRANCH.txt`;
- runs the browser gate against the emitted deployment artifact before upload.

Repository-hygiene tests additionally enforce:

- compact canonical entrypoints;
- preserved append-only history;
- resolvable canonical markdown links;
- one canonical Pages workflow contract;
- current package identity.

## 6. Runtime preservation across cleanup — PASS

Comparison from the Owner-verified B0 public closure specimen:

- `2eb9a878eb4fa9c406ca0e90abcab33cb186332a`

to the post-cleanup audit head shows **no changes** to:

- `index.html`;
- `app.js`;
- `style.css`;
- `src/**`;
- `experiments/**`;
- runtime browser-gate implementation.

Changes are repository governance / docs / workflow / package metadata / hygiene tests only.

Therefore the cleanup did not silently mutate the Owner-observed B0 phenomenon.

## 7. Research boundary — PASS

Current stage truth remains:

- Workbench foundation: **QUALIFIED FOR CURRENT RESEARCH USE**;
- B0 embodiment decomposition: **POSITIVE OWNER SIGNAL / STAGE CLOSED**;
- A/B human usefulness: **UNPROVEN**;
- final Feniks body/combat model: **UNDECIDED**;
- next research direction: **OPEN**.

No R4, weapon family, body continuation or other next campaign is preselected by the cleanup.

## 8. Final release gate — PASS

Final repository-closure release:

- `6bd4b4492261b9fe3b8edbca276cf9b7de3d822d`;
- commit message carries explicit `[deploy]`;
- GitHub Actions test: **SUCCESS**;
- emitted-artifact Pages build/browser qualification: **SUCCESS**;
- GitHub Pages deploy: **SUCCESS** (deployment `6676500885`).

External public-origin verification after deployment confirms:

- `COMMIT.txt` = `6bd4b4492261b9fe3b8edbca276cf9b7de3d822d`;
- `BRANCH.txt` = `main`;
- public root = `Combat Lab vNext — Workbench`;
- active public experiment = `Load / Envelope Field B0`.

Therefore the repository-closure public handoff is externally proven for release `6bd4b4492261b9fe3b8edbca276cf9b7de3d822d`.

Post-release documentation / hygiene corrections may advance `main` without replacing the public specimen when they intentionally omit `[deploy]`. This is expected under the explicit-deployment contract and does not change the provenance of the deployed runtime.

During recovery after the conversation-limit failure, one canonical documentation drift was found and repaired:

- `EXPERIMENT_PROTOCOL.md` still described the removed whitelisted-experiment-branch auto-deploy model;
- commit `9f23d677a7f703a84ab138aa5ca80e8268bc639e` aligned the protocol with the live main-only automatic deployment contract;
- commit `e29cf8559d3a2a3409b13c443897b5e61e611b9d` added a repository-hygiene regression guard;
- the resulting full check passed, while Pages build/deploy were correctly skipped because those commits did not request deployment.

## 9. Conversation-limit recovery hardening — PASS

A fresh recovery audit was performed after the previous conversation ended at its context limit without returning a user-facing handoff.

Material findings and repairs:

- the deployment protocol still described a removed whitelisted experiment-branch auto-deploy path; corrected;
- the neutral-substrate record still said the substrate was not deployed and carried a superseded first-frontier shortlist as if it could be current guidance; historical execution guidance was demoted explicitly;
- the Workbench refoundation record still exposed its old W0–W4 plan and an "active implementation baseline" without enough historical scoping; corrected;
- B0 evidence / closure records now state explicitly when their execution or `WAITING FOR OWNER INSTRUCTION` wording is historical rather than live authority;
- current Owner direction now records optional future linked/correlated phenotype scaling, larger terrain/obstacle/multi-actor pressure, and later bounded donor recovery from Feniks / ReflexBrain / Companion / SPC without promoting any of those to an automatic next build;
- repository hygiene now checks all non-archived Markdown links, current preparation-state truth and durable-vs-live authority boundaries.

Repository verification after these repairs:

- branch refs: **`main` only**;
- open pull requests: **0**;
- open issues: **0**;
- releases: **0**;
- latest full `check` on recovery head `b805202cab40d2163018e3923a7e00e750bb4cd5`: **SUCCESS**;
- Pages build/deploy on documentation-only commits: correctly **SKIPPED** without explicit `[deploy]`.

Runtime-preservation comparison:

- base public closure release: `6bd4b4492261b9fe3b8edbca276cf9b7de3d822d`;
- recovery head checked: `b805202cab40d2163018e3923a7e00e750bb4cd5`;
- changed files are limited to Markdown documentation and `test/repository-hygiene.test.js`;
- **no changes** to `index.html`, `app.js`, `style.css`, `src/**`, `experiments/**` or the browser-gate implementation.

Therefore this hardening campaign changes repository truth / governance only and does not silently mutate the Owner-observed B0 runtime.

## Closure invariant

> **Preserve evidence, remove stale authority, and leave exactly one clean place from which the next research question can begin.**
