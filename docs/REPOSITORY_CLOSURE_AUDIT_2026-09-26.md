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

## 8. Final release gate

One final canonical `main` commit must carry `[deploy]`.

After its CI + emitted-artifact qualification succeeds, the public origin must be checked for:

- `COMMIT.txt` = exact final deploy SHA;
- `BRANCH.txt` = `main`;
- live B0 Workbench runtime;
- no stale refoundation provenance.

Only after that external verification is the repository/public handoff fully closed.

## Closure invariant

> **Preserve evidence, remove stale authority, and leave exactly one clean place from which the next research question can begin.**
