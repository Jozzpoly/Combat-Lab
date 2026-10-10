# X0 — rebuilding the same physical organism, then testing its action (2026-10-10)

**BOUNDARY:** isolated draft [PR #4](https://github.com/Jozzpoly/Combat-Lab/pull/4), not merged, not public rehearsal, no Owner experiential qualification. This is an **experiment in a shared physics world**, not the chosen Combat Lab architecture. Historical Owner-level R0/R1/L0 failures remain unchanged.

## Why this crossing matters

The previous X0 permitted editing body geometry only **before spawning a new organism**. The Owner's real research loop requires changing *this very organism* after observing a run, while the rest of the world, other actors and material aftermath still exist. More spawned presets or canned body trajectories would not solve this. We therefore tested the physical possibility of **live anatomy change → different body-origin material action**, not added fake movement or more contact counters.

## Actual implementation, not a visual setting

- Select an existing actor, **Pause**, open *Rebuild this body's actual shape*, edit root half-extents, 0/1/2 real articulated arms and actual arm length, then rebuild; resume in the same Rapier world.
- This constructs new rigid colliders and real impulse joints for that organism and removes its former physical body parts. **The actor ID, root pose/linear/angular velocity, existing arm relative pose where possible, control policy and selected identity are preserved.** Other actors and matter retain their exact current positions and velocities at the edit boundary; the simulation clock does not reset.
- Edits are prevalidated. An invalid arm count or dimension must leave the original physical actor intact. Any body-attached material hold is released after a successful topology change to avoid a ghost attachment. The new anatomy is preserved by the existing portable *posed initial scene* format.
- **E/Q** independently contract/extend the first real limb; **R/F** independently contract/extend the second. Root WASD and direct body/matter intervention continue to work. Input is explicit operator authority, **not self-directed organism cognition**.
- This is an instantaneous paused physical re-assembly. New limbs are not born from a continuous deformation solver. The body's mass distribution and limb velocities may change, so it is **not** energy-conserving live metamorphosis or exact transient physics replay. Rebuild during live execution is blocked in the UI.

## Scoped browser/WASM evidence

[Chromium whole-world and authored-geometry test CI 38012806353](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38012806353):

- Twenty-five successive physical re-rigs in the same active simulation, retaining **four resident actors and eight material bodies**, preserving unedited actors and material position/velocity **at the edit moment**.
- Old app collider-owner handles no longer referenced; independent test of physical solver collider removal and hold release added later. The previously selected actor ID, root kinematics and scene clock are maintained.
- Editing 0 arms → 2 arms creates a distinct *acquirable physical contact action* in a matched authored start. The original rigid body cannot contact-hold the distant 18 kg load; after the live re-rig, the operator can acquire and pull it **3.2518 m**. This shows morphology-conditioned reach in this setup, **not** that articulation is the only possible way to obtain equivalent reach. A longer rigid hull is a valid untested control.
- A real UI issue was discovered: a programmatically invalid select option silently became a zero-arm choice. The control now rejects this instead of performing an unintended edit. Browser input and invalid-parameter non-mutation passed at the corrected head.

[Independent-limb real-physics comparison CI 38012913391](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38012913391) is a stronger distinct question than reach. With **no root drive** and the same physical body, scene and motor settling history, a commanded arm sweep with finite torque was compared to disabling the joint torque after settling in five nearby contact conditions. The commanded arm produced genuine solver contacts in **all five**, versus none in the no-torque controls, and object displacement-magnitude differences of **0.255–0.5094 m**. The root also moved slightly due to reciprocal joint reaction. Initial state carries residual physics, so this does **not** mean passive cases must show zero object travel or claim zero total-body reaction.

## Limits and decisions

- These are **deliberately authored, operated counterfactuals**. Neither a real second-organism affordance chain nor autonomous choice, natural grasp, materially diverse crowd ecology or Owner-desired feel is established.
- X0 still looks like a sparse, limited polygonal yard in real captured Chromium imagery. Added edit freedom can improve testability without making the world worth playing.
- Geometric hold eligibility is a near-touch approximation; the top-down planar traction is not true grounded stance/gait. Dynamic joint assembly may be stressed by extreme parameters and high-density contact. No long-run throughput or general solver-fidelity guarantee.
- **Retain a replaceable morphology/arm-action donor. Do not merge, silently deploy or inherit it as canonical design.** The next high-value judgment is the *whole user-discoverable possibility space*, not more isolated numerical PASSes. Any Owner-observed failure outranks machine assertions at product level.
