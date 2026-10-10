# Combat Lab — G0 / real-world traction source calibration

**STATUS: CLOSED RESEARCH, NOT AN ORGANISM OR APPROVED ARCHITECTURE.** This branch contains one independent test of where **horizontal locomotor force actually comes from**. It is not a new animal, foot model, crowd system, gait controller, or replacement for `main`.

[Full source-level physical evidence, known failures and interpretation](docs/G0_REAL_GROUND_DRIVE_CHECKPOINT_2026-10-10.md) · [PR #8](https://github.com/Jozzpoly/Combat-Lab/pull/8) · [real Chromium contact control matrix](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879).

A **wheeled robot** is used deliberately as a simpler source-of-force *calibrator*, not as a species candidate. Rapier3D handles real gravity, wheel/floor normal contact and friction, and four motorized revolute joints. Unlike the M0 body root proxy, the wheel mode has **zero direct horizontal chassis impulse**.

**Strong bounded fact:** physical wheeled propulsion causes whole-body center-of-mass motion with ground friction and stops doing so on frictionless or removed ground. The explicit fake root-force comparison still travels on frictionless ground. A genuine never-motorized hinge stays physically passive; a previously tested 'motor configured then max-force=0' hinge did not, so the test source was corrected. All claims use the **whole dynamic-system mass-weighted center of mass**, not the chassis coordinate alone.

[Unedited initial Chromium frame](docs/media/g0-physical-t0.png) / [240-step later frame in the same solver](docs/media/g0-physical-t240.png). The robot physically presses a passive block but partly loses chassis height under impact; this has **NOT** qualified even wheeled robustness, let alone animal movement.

**No public deployment, no merge, no human Owner play/feel verdict, no accepted 3D host.** All previous product FAILs remain. G0 is now a scoped historical donor to a future conscious body×ground support×movement×contact research choice.

For internal reproduction: `npm install && npm test && npm run build`, then serve `dist` in a browser with Rapier WASM. The query flags `g0probe=A`, `g0probe=B`, `g0frames=1`, `g0ownercheck=1` are diagnostics, not product modes. Live source experiments should verify exact branch HEAD / CI. Current canonical research truth is on `main/docs/RESEARCH_STATE.md`.
