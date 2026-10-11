# Combat Lab — P10 quiet material workshop (2026-10-11)

**QUALIFICATION: ISOLATED SOURCE DONOR / NOT OWNER-ACCEPTED / NOT DEPLOYED.** This is NOT the first good organism, not a generalized anatomy, not gameplay maturity, not crowd AI. Owner-observed historical R0/R1/L0 FAIL remains active. Read live source, current CI and any later Owner corrections before treating this report as authority.

## Provenance

- Isolated, unmerged branch: [experiment/p10-material-workshop-whole](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p10-material-workshop-whole). **Last audited IMPLEMENTATION head:** \`39aab1f2067cf57e15f30e1d26ecd8a943ad0589\`, full [source-owned emitted Vite / Rapier2D / real Chrome CI PASS 38113663018](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38113663018).
- This is an **independent sibling** to P9: P10 branch started at P8 for source infrastructure; it does NOT import or use P7/P8/P9 crowd locomotion, P8 tactile steering, or P9 geometry control logic. It reuses concrete P0/P2/P4/P5 mechanics, not their unaccepted product architecture.
- Source files: \`src/p10-workshop.js\`, \`src/p10-probe.js\`, \`p10.html\`, \`p10-ui.js\`, \`p10.css\`, isolated \`vite.config.js\` multipage config, \`scripts/p10-browser.mjs\`, \`scripts/p10-native-real.mjs\`, \`.github/workflows/p10-workshop.yml\`.
- P10 is a **separate HTML entry** (\`/p10.html\`) inside emitted Vite bundle. Existing \`index.html\` and existing P0–P8 browser/physical tests stay unchanged; no new public deployment. Independently verified \`rehearsal/current\` still \`cb4b44d417db612f3333fe515e6f6afffa3e56d8\`.
- CI retained actual unretouched Chrome screenshots and JSON in artifact \`p10-real-workshop-source\` (14-day retention). They are machine-observed real pixels, NOT directly inspected by Owner or proof of good feel.

## Why this whole was selected

P8/P9 physical throughput and wall-contact evidence revealed something real about material clearance, but did not turn rigid circles into rewarding organisms. Continuing another corridor/sidestep motor variant would repeat Owner-rejected traffic. P10 asks whether a **QUIET, manually interruptible single world** allows several different *physical* operator actions to coexist and affect one another.

Unlike P7/P8, **no actor receives implicit authored forward drive or goals**. Default world has three independently dynamic physical bodies (small / bulky / physically hinged lever), five independent dynamic cargo, P0's real pivoted gate, additional fixed author-editable obstacles and a true 2.20m aperture. Nothing walks autonomously. Human can choose any body, use WASD, press/release actual-contact-qualified bounded reciprocal grip (G), toggle finite-ground stance (B), actuate actual physical joint Q/E, shove material by pointer impulse, pause/step/resume, spawn bodies/cargo/static obstacles, Ctrl-drag existing entities and move camera/zoom. Both static and dynamic matter remain genuine colliders, not sprites.

**Not earned:** real feet/support mechanics (external planar root and virtual finite-terrain impulses), dexterous grasp/hand, softbody, memory/perception/LLM NPC, good animation/visual artistry, Owner-rated movement feel, robust huge crowds, stable many-hour runtime or measured game FPS. The first screen is still abstract labelled circles and blocks.

## 19 actual matched source worlds, no magic post-hoc completion policy

Executed inside the actual Vite-built Chrome WASM runtime, not a bare Node imitation: **1 quiet scene + 8 slot comparisons + 2 paired grip controls + 7 hinge/stance/support controls + 1 paused topology edit = 19 physical worlds**.

### A. Material access vs action, mass/speed/motor matched

Two actual body shapes compared with the SAME 90kg physics mass, \`motor=650\`, \`maxSpeedOverride=1.65\` and authored initial forward command. Small diameter \`0.88m\`; bulky diameter \`2.30m\`.

| True physical gap / finite ground | Small after 470 ticks | Bulky after 470 ticks |
|---|---|---|
| 2.20m closed | Actual crossing t141; distal cargo Δx **+6.1524m**, 231 real-contact ticks | **Blocked** at x27.4146, 393 blocker-contact ticks, **no distal cargo contact or movement** |
| 3.50m physically opened | Same small crossing and cargo Δx +6.1524m | Actual crossing t148; **250 genuine distal cargo-contact ticks**, distal cargo Δx **+5.4099m** |

The \`none\` virtual-ground ablation repeats the qualitative blocked/opened distinction (bulky closed distal cargo Δx0 versus widened +6.2784m). The exact world/body prestates are paired before the true collider edit. These are manually commanded **action opportunities** and genuine material afterstates — not NPC goal finding, unique heavy advantage (small gets through earlier), authored completion flags, global navigation or a trajectory scripted into the controller. Total impulse expenditure differs by consequence; not an energy-equalized cognition test.

### B. Contact-gated material hauling, cheap no-link rival

A small actor genuinely approaches a real 42kg load and collides at tick23. At the identical full pre-action physical snapshot, one world acquires a **bounded reciprocal physical link** (\`maxImpulse=4 N·s/step\`) while its twin does not. Both receive the same subsequent direction changes.

- No link: cargo x11.27 after reversing (effectively remains).
- Genuine link: cargo x5.9086 after reversing; 213 applied finite paired impulses; zero break in this bounded scenario. Link remains attached in the last frame.
- Different physical coupling changes force expenditure: total root effort 752.39 versus no-link 308.07 N·s; **not** a matched-energy comparison, unique creature anatomy, hand grasp or operator-feel proof.
- REAL native Chrome pointer/key test later selects small body by real mouse, presses real held D for112 ticks (Δx+3.4102m), then real G; contact-qualified link actually appears in source physics. The click is NOT a synthetic DOM event.

### C. Genuine hinge operates but fails useful finite-ground material action

With source root motor OFF, old bounded joint torque acts with an equal/opposite body reaction. After 175 ticks:

| Hinge/posture/support | Cargo motion | Root world yaw |
|---|---:|---:|
| Powered hinge + finite / flow | **0.0053m** | −0.8951rad |
| Powered hinge + finite / brace | **0.0197m** | −0.1201rad |
| Powered hinge + zero support | 0.38m | about −0.8569rad |
| Hinge OFF / rigid simple nonpowered comparator | 0 | 0 |

The servo does actuate and contact impulses occur; in ordinary finite support it does NOT meaningfully transfer action to cargo. Counter-rotation of the body is material to motion; root bracing reduces that counter-rotation, but even that is insufficient for useful material handling in this world. The zero-support motion is a conditional physical afterstate, not practical evidence of a working anatomical advantage. Cheap rigid rival is unpowered, so this is NOT a fair general anatomical necessity test against a comparably controllable powered rigid body. **DO NOT PROMOTE the hinged tool as a successful distinct playable action.** Do not tune arbitrarily to get a one-case positive result.

### D. True world edit, preserved physics and actual owner input

Source edit after80 ticks moves a specific fixed barrier physically, widening actual collider gap **2.20→3.50m** without advancing simulation time or changing any unrelated physical body. Both methods were tested via actual Chrome input:

- Native real canvas pointer selects the hinged actor, B/E physically changes posture/actuation; raw source joint effort rises.
- Real native pause stops ticks; physical **Open** button changes only authored wall, preserves all resident actor poses, same WASM world resumes.
- **Important first native UX FAIL:** Ctrl+drag grabbed a fixed wall by its edge, but UI snapped its center under the pointer; dragging pointer upward from y6.5→6.0 actually moved wall center downward, making width **3.50→2.60m**. This was not a Rapier numerical bug. UI fixed by storing world-space grab offset and dragging the true collider center with that offset; subsequent **same native physical pointer** Ctrl-drag gives **3.50→4.00m**, same paused tick and unchanged actors. Real tested, not inferred from handler code.
- Final native G after direct WASD contact linked the physical load. No authored script fired an interaction event in place of the input.

### Five actual preview frames — raw physical world

[Successful exact head CI 38113663018](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38113663018) artifact \`p10-real-workshop-source\` contains:

- \`p10-free-real-chromium.png\` / JSON: 3 quiet actors and5 cargo, no motor.
- \`p10-blocked-real-chromium.png\`: bulky body physically blocked.
- \`p10-opened-real-chromium.png\`: same body physically reaches beyond the edited aperture.
- \`p10-haul-real-chromium.png\`: actor and physically contacted cargo after real bounded link and reverse pull.
- \`p10-hinge-real-chromium.png\`: source hinge activates, though ineffective for useful cargo motion.
- Native \`p10-native-world-start.png\`, \`p10-native-world-physical-wall-edited.png\`, \`p10-native-real-ctrl-drag-edited-wall.png\`, \`p10-native-world-after-real-input.png\` and \`p10-native-operator-source.json\`. All real Chrome captures, not illustrative pictures.

The metric probes and preview frames are built from the same physical source, but frame selection is an authored research fixture; their existence is not equivalent to unscripted learning or everyday player affordance discovery.

## Adversarial adjudication / disposition

**NARROW POSITIVE** — one integrated, quiet, editable physical world supports independent operator-driven passage, genuine cargo handling via contact-bounded linkage, and editable material constraints where a changed obstacle opens a later real ability to contact and displace a different load. Tests are genuine and can be deliberately broken with other world configurations.

**NEGATIVE** — physics and UI remain crude. Hinge currently fails useful finite-ground cargo manipulation, all bodies still share the same externally applied root drive proxy and three primitive shapes, nothing initiates its own action, no demonstrated crowd softness/body posture under sustained loads, performance or OWNER feel. The body/world architecture is NOT validated. Three manual verbs do not alone make the world interesting or the actors organism-like. This can still be another mechanical workbench that Owner finds dull.

**Decision:** retain P10 as an isolated playable-source candidate/temporary donor, not a foundation to merge or ship. Do not add scripted traffic, more tuned servo demos or an NPC prompt to patch the missing interest. The next strong test is whether an actual Owner uncoached disturbance of this coherent world feels like several discoverable possibilities, and whether restoring differentiated support/contact mechanics provides real body action not reproducible by cheap rigid controls. Prepare a safe actual preview route if needed; public \`rehearsal/current\` remains untouched unless Owner authorizes a change. Unedited source frames remain appropriate early feedback anchors.

**Bootstrap:** future conversations first verify live \`main\`, P10 branch/head/CI, latest Owner corrections, and public ref. [main Research State](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md) remains project truth index. This note is bounded evidence, not the new roadmap.
