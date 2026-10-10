# Combat Lab — S2: actual ground contact as a rival support substrate

**Independent bounded physical comparison. Do not merge, deploy or select architecture. Not Owner-qualified.**

## Why this substrate is materially different

K1 showed that contact-only arm configuration had substantial measured blocking only with an unphysical world-relative root-velocity brake. Removing that proxy collapsed the significant K1 contrasts. S2 uses a **new independent** Rapier 3D physical world with vertical gravity, dynamic body mass, a fixed actual floor collider and ordinary normal-contact friction. It renders an accessible top-down view; vertical physics is real but hidden by projection. Both bodies remain dynamic and are constrained to yaw rotation only; this is a _constrained-3D surface-body substrate_, not a full humanoid.

The pressure source is a precisely bounded, **external laboratory ram impulse** applied to another dynamic body. This is NOT a locomotion brain, foot-driven sprint or self-powered organism. Compare a defender resting on ice/grip, an identical zero-gravity/zero-normal test and identical no-force test. No body grip, pivot, magical bracing or anchored defender is available. Outcomes must be explained by genuine solver contacts and floor friction, not invisible world locking.

The physical friction experiment is the *falsifier/entry point*: if changing friction with otherwise identical pressure and dynamic mass does not make a useful difference, don't grow the support system from its numerical novelty. If it does, ask next whether direct footing, actor-posture choices, crowd movement and independent world consequences become more understandable or useful **with acceptable performance**. Mere friction plausibility does not license a 3D migration or claim actual humanoid stance.

Current main source of truth: [Combat Lab research state](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md). Public `rehearsal/current` is untouched.
