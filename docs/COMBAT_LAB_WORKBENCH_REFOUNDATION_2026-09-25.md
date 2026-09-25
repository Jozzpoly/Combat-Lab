# Combat Lab vNext — Workbench Refoundation

**Date:** 2026-09-25  
**Status:** active design authority before further gameplay experiments  
**Owner trigger:** positive S0 body/world evidence followed by rejection of the rushed shortcut-driven S1 handoff  
**Active implementation baseline:** `3e9648fe77c49994c49b60722aa9b2d550124d58`

## 0. Reset

The post-S0 S1 implementation attempt is **discarded as active direction**.

The refoundation branch has been reset to the last good checkpoint after:

- successful neutral-substrate refoundation;
- repaired S0 runtime;
- exact deploy qualification;
- dense second Owner recording;
- positive BODY / WORLD Owner signal.

The discarded S1 commits remain recoverable by SHA if forensic comparison is ever useful, but they are not active architecture or roadmap authority.

This is not a rejection of the underlying insight that envelope, mass and locomotor capability need to become separable.

It is a rejection of the way that insight was rushed into:

- another bespoke specimen;
- another keyboard-control vocabulary;
- another immediate Owner gate;
- another deploy before the laboratory interaction model itself was ready.

## 1. New top-level problem

Combat Lab is no longer blocked primarily by lack of combat mechanics.

It is blocked by the quality of the **research instrument**.

The lab now needs to support repeated cycles such as:

> observe -> manipulate -> exaggerate -> break -> compare -> reset -> preserve interesting state -> change hypothesis

without requiring the Owner to memorize per-experiment key maps or ask the agent to rebuild UI for every variable.

Therefore the next foundation is:

> **Combat Lab Workbench — a persistent research / authoring surface around replaceable experiments.**

## 2. Workbench principles

### 2.1 Direct manipulation first

A parameter that matters to an experiment should normally be discoverable and editable from the Workbench.

Keyboard shortcuts may exist as optional acceleration.

They must not be the required memory interface.

### 2.2 Permissive by default

The Owner explicitly wants to be able to break experiments.

Each numeric parameter may define:

- a **soft range** for ordinary convenient manipulation;
- optional anchor/preset values;
- a much wider **safety rail** used only to protect finite/stable runtime.

Crossing the soft range:

- is allowed;
- should be visible;
- should not silently snap back;
- should not display paternalistic "invalid build" language.

If a value must be rejected for numerical/runtime safety, the Workbench should state that narrow reason.

### 2.3 Live editing

Where an experiment supports it, changing a parameter should update the running world immediately.

The Workbench should distinguish:

- reset simulation/world state;
- restore parameter defaults.

These are different operations.

### 2.4 Experiment semantics stay experiment-owned

The Workbench may know about generic control types:

- number;
- toggle;
- enum/select;
- action;
- read-only value.

It must not know what:

- body;
- weapon;
- spell;
- hit;
- class;
- damage;
- block

mean.

An experiment declares inspector metadata and implements reads/writes.

### 2.5 Derived values are visible but not confused with authored parameters

Example future body experiment:

Authored:

- body envelope;
- body mass;
- locomotor force.

Derived:

- radius;
- acceleration;
- braking;
- clearance;
- current speed.

The panel must visually distinguish **things the Owner sets** from **things the current law derives**.

This is critical for causal reasoning.

### 2.6 The interface must scale beyond S0

The architecture should support later experiments involving:

- body / posture / stance;
- equipment;
- shields / occupied coverage;
- polearms;
- bows / projectile properties;
- magic fields;
- terrain parameters;
- multiple actors;
- adversary configuration.

No one experiment should own the global UI shell.

## 3. Desktop layout

Desktop is the current target.

### Main viewport

The experiment remains the primary visual surface.

It should receive most horizontal space.

### Right Inspector / Manager

Persistent side panel, collapsible if desired later.

Sections:

1. **Experiment**
   - experiment selector;
   - question / short purpose;
   - run state;
   - Reset World;
   - Restore Defaults.

2. **Parameters**
   - grouped experiment-authored controls;
   - direct numeric editing;
   - sliders/scrub controls where appropriate;
   - anchor chips;
   - per-parameter reset;
   - clear current value.

3. **Derived / Live**
   - experiment-provided read-only values;
   - current contacts / speed / geometry / other relevant facts;
   - collapsible so it does not dominate play.

4. **Session / Debug**
   - exact build identity;
   - simulation time;
   - debug overlay toggle;
   - later: snapshots / A-B / replay tools.

No memorized shortcut table is the primary interface.

## 4. Numeric control behavior

A professional numeric control should support:

- current numeric value;
- keyboard entry;
- mouse/pointer slider or scrub manipulation;
- optional fine/coarse modifiers;
- default reset;
- anchors/presets;
- unit / label;
- description/tooltip;
- soft range;
- wide safety rail;
- visible extreme state.

### Soft range vs safety rail

Example:

- soft range: 0.5 .. 2.0;
- safety rail: 0.05 .. 8.0.

The normal slider initially presents the soft range.

If the Owner enters or scrubs beyond it, the control should remain valid and the visual range should adapt/expand rather than clamp back to the soft range.

This is a core research behavior, not cosmetic UI.

## 5. Experiment inspector contract

Inspector support is optional.

An experiment instance may expose a neutral structure conceptually equivalent to:

- sections/groups;
- editable controls;
- derived/read-only values;
- actions.

Each editable control declares generic UI metadata and delegates actual semantics to the experiment.

The shell may render and route edits.

The shell must not synthesize gameplay meaning.

### Initial generic control types

Implement only what current evidence needs:

- numeric;
- action;
- read-only.

Design the contract so toggle/select can be added without breaking it.

Do not build a generic game-editor framework before evidence needs it.

## 6. First migration target: S0

Do **not** invent S1 yet.

Migrate the existing positive S0 phenomenon into the Workbench.

Initial S0 Inspector should expose:

### Editable

- **Body scale**
  - current S0 law may still couple scale -> mass/motor internally;
  - this is explicitly marked as a coupled experimental law;
  - wide permissive scale manipulation;
  - small / baseline / large anchors;
  - Restore default.

### Derived / live

- radius;
- current coupled mass;
- acceleration;
- braking;
- max speed;
- current speed;
- contact count.

This lets us validate the Workbench against an already-understood phenomenon without introducing a second research question.

Only after the Workbench itself is good should we design the orthogonal body experiment.

## 7. Future body decomposition — not yet S1

The following insight is retained from Owner feedback:

> body envelope, carried/equipment mass and locomotor capability cannot remain one permanent variable.

But the next body experiment must be designed **after** the Workbench exists.

Likely dimensions include:

- envelope/body geometry;
- body mass;
- carried mass / equipment burden;
- locomotor force/power;
- traction/footing later;
- posture/stance later.

Important correction:

Do not prematurely equate all mass with one scalar gameplay effect.

For example, heavy armour may change:

- total mass;
- rotational inertia;
- acceleration;
- braking;
- energy cost;
- contact yield;

but the exact relationships remain research questions.

The Workbench must make these questions cheap to manipulate without making today's formula canonical.

## 8. Professional quality gate before Owner exposure

The next Owner request must satisfy all of the following.

### Functionality

- public origin displays the exact expected SHA;
- viewport runs;
- Inspector edits change the actual live experiment;
- Restore Defaults works;
- Reset World works independently;
- experiment switching works;
- no runtime errors.

### Usability

- no important feature requires memorizing an undocumented shortcut;
- parameters are understandable from the panel;
- current values are visible;
- controls are large enough for deliberate desktop use;
- extreme values are allowed and legibly marked;
- the Owner can discover how to manipulate S0 without reading a chat message.

### Presentation

- the Workbench looks like one coherent tool rather than a demo page plus debug text;
- hierarchy between viewport, parameters, derived values and debug state is clear;
- debug/provenance exists but does not visually dominate;
- resizing the browser preserves usable viewport/panel proportions.

### Evidence

Before asking the Owner:

1. deterministic/unit checks;
2. source-tree browser interaction gate;
3. emitted-artifact browser interaction gate;
4. **public-origin exact-SHA verification after deployment**;
5. visual screenshot inspection of the deployed surface.

A green deploy alone is not Owner-ready evidence.

## 9. Explicit non-goals

Do not build yet:

- S1 orthogonal-body gameplay;
- weapon systems;
- damage;
- combat AI;
- timeline editor;
- full replay browser;
- asset editor;
- node graph;
- universal actor component model;
- a giant generic engine inspector.

First prove the Workbench interaction model on S0.

## 10. Immediate execution order

### W0 — reset and contract

- active branch reset to the last good S0 checkpoint;
- record this Workbench contract;
- amend neutral-substrate ergonomics requirements.

### W1 — Inspector core

Implement:

- Workbench layout;
- experiment metadata area;
- generic numeric parameter control;
- read-only derived rows;
- Reset World vs Restore Defaults;
- optional shortcut hints only.

No S1.

### W2 — S0 migration

Expose S0 scale through the Inspector.

Expand S0's manipulative range enough to support deliberate breakage while preserving broad numerical safety.

Do not alter the positive S0 body/world concept to manufacture new findings.

### W3 — internal qualification

Perform:

- causal checks;
- interaction/browser checks;
- visual desktop inspection;
- responsive-layout inspection;
- emitted artifact qualification.

Do not deploy to the Owner yet.

### W4 — public rehearsal

Deploy a candidate only after W3.

Then verify the public URL itself:

- exact SHA;
- correct experiment;
- functional Inspector;
- visual integrity.

Only then decide whether an Owner observation is worth requesting.

## Working invariant

> **The next discovery should come from manipulating the phenomenon, not from deciphering the apparatus.**


## 11. W1/W2 internal qualification

Checkpoint:

`c92e20b032aad50a74512b12b0d5f83dac39cf09`

Implemented:

- coherent desktop viewport + Inspector layout;
- optional-debug clean viewport;
- data-driven numeric parameter control;
- live slider and numeric entry;
- anchors and per-parameter reset;
- separate world reset / parameter-default reset;
- read-only derived and live sections;
- wide permissive safety rails with soft-range EXTREME indication;
- S0 migration only.

Validation:

- 14 / 14 automated checks PASS;
- live Chromium interaction gate PASS;
- extreme 0.05 / 8.0 world soak finite;
- visual rehearsal inspected at 1600×1000;
- visual extreme rehearsal inspected at scale 4.5;
- compact 1280×800 rehearsal inspected;
- desktop double-scroll debt corrected.

Status:

> **internal Workbench checkpoint, not an Owner specimen.**

Do not deploy or ask for Owner play merely because this checkpoint is green.


## 12. B0 internal Workbench qualification

The first multi-parameter client of the Workbench is **Load / Envelope Field B0**.

Internal checkpoint before public rehearsal:

`435660123365636458f5adf978c3ede728e095d8`

The multi-parameter experiment exposed and corrected additional Workbench issues:

- keyboard focus leakage from Inspector to world controls;
- need for neutral A/B authored-parameter slots;
- grid min-content horizontal overflow at compact desktop widths.

Current Workbench gate now includes:

- focus isolation;
- direct slider + numeric editing;
- parameter A/B capture/apply;
- matched raw-input A/B comparison;
- Reset World vs Restore Defaults;
- experiment switching;
- permissive extreme ranges;
- 1600×1000 / extreme / 1280×800 visual rehearsal;
- horizontal overflow audit.

No Owner-facing qualification is claimed from this.


## 13. First exact public Workbench rehearsal

Exact public candidate:

`43c8a3fdf1bc12110e34c53159841b363b4414ea`

The public-origin rehearsal fixes the earlier process failure where a green pipeline was mistaken for proof of what the Owner actually received.

This time the public origin itself was verified to expose:

- the expected exact SHA;
- the expected refoundation branch;
- the Workbench title;
- B0 as active experiment;
- the Inspector parameter tree;
- A/B state controls;
- derived/live values;
- RUNNING runtime with advancing simulation time.

The emitted artifact had already passed the full interaction gate before deploy.

This combination is the minimum acceptable public translation evidence going forward.


## 14. First Owner-use feedback

The first 160.2 s Owner recording on the public B0 candidate provides narrow human qualification for the Workbench itself.

Observed direct use includes:

- parameter sliders / numbers;
- per-parameter resets;
- Reset World;
- Debug;
- experiment switching;
- parameter slot A capture.

Therefore:

- direct-manipulation Workbench interaction: **OWNER-OBSERVED PASS**;
- A/B comparison usefulness: **UNPROVEN** (only A capture observed; no complete A↔B comparison loop).

The recording also exposes a material Workbench truthfulness bug:

- requested out-of-rail numeric values can remain visible while runtime has clamped them.

Closure requires visible numeric state to always match applied authored state.

See `B0_WORKBENCH_OWNER_RECORDING_FEEDBACK_2026-09-25.md`.


## 15. Workbench stage closure

The first real Owner session qualifies the Workbench interaction foundation for continued research use.

Closure polish at `9a58da5f99202fb777f3a5a066dedeea86370cfb` resolves:

- overly narrow B0 rails exposed by Owner force=42 input;
- numeric field/runtime truth mismatch during clamp;
- unnecessary B0 copy density;
- diagnostic/research experiment presentation ambiguity.

31 / 31 checks and the full live-browser gate pass after these fixes.

Canonical Workbench verdict:

> **QUALIFIED FOR CURRENT RESEARCH USE**

This is a substrate verdict, not a claim that the Workbench feature set is complete forever.
