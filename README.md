# Combat Lab — W1 Composition Trial (CLOSED / source donor only)

**This is not `main`, not the public program, not an accepted organism and not an active development branch.** A deliberately scoped, **now-closed PR #6** comparing scene composition rather than building another mechanical proxy. [Full negative finding and self-critique](docs/W1_COMPOSITION_CHECKPOINT_2026-10-10.md).

W1 reused the existing [unqualified PR #2 articulated-body donor](https://github.com/Jozzpoly/Combat-Lab/pull/2), not its architecture authority. The browser default shows four bodies (two articulated and two rigid), seven free material objects and two physical hinged gates. The user can pilot or edit matter, but there is **no autonomous creature behavior**. Nonselected bodies have **no automatic root braking or jaw actuation**; selected locomotion still relies on a finite top-down support **proxy**, not gait or grounded stance.

**Tested outcome:** [Emitted Chromium/WASM CI 38086895697](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38086895697) demonstrated zero actor→material contacts for fully passive, torque-off and stationary jaw-only cases in the W1 default scene, versus material displacement by direct operator root-drive. The W1 composition did not produce a sufficiently interesting whole. **This is a weak falsifier of composition generally**: the scene put matter outside stationary jaw reach, and a world of fully passive bodies had no reason to act. Do not tune placements to rescue the historical code or call this a verdict on morphology, perception, brains or the general world-first hypothesis. No Owner experiential test was performed.

**Decision:** stop, retain source/history for targeted forensic comparison, do not merge, do not deploy, do not pass W1 to a new candidate as a foundation.

Current project truth and next independent frontier: [main RESEARCH_STATE](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md) and [AGENT_RUN_CURSOR](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/AGENT_RUN_CURSOR.md). A new conversation should start there and with the latest Owner feedback, not this outdated specimen.

For historical mechanical reproduction only: run `npm install`, `npm test`, `npm run build` in an environment capable of loading Rapier WASM/browser. On source CI, the separate `commonsw1=1` URL query executes a predefined diagnostic; it is **not** a game mode.
