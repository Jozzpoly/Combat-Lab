# Embodied Scale Field S0 — First Owner Recording Analysis

**Date:** 2026-09-25  
**Exact recorded public specimen:** `3da498947b480c5da5a52530293afa818014b3c8`  
**Recording:** ~12.63 s, 1858×918, 30 fps  
**Owner result:** **PRODUCT / OBSERVATION GATE FAIL — runtime never entered simulation loop**

## 0. Verdict

The recording does **not** test the BODY / SCALE hypothesis.

It shows that the public specimen is visibly loaded at the DOM level but the JavaScript startup path throws before the animation loop, control listeners and provenance update are fully installed.

Therefore:

- S0 human phenomenon: **UNPROVEN**;
- S0 body/scale idea: **NOT FALSIFIED** by this recording;
- exact public specimen `3da498947…`: **OWNER-OBSERVED FAIL**;
- previous "Owner-ready" claim: **RETRACTED**;
- previous browser gate: **INSUFFICICIENT**, because it only proved partial DOM/module initialization.

Owner truth outranks the green machine gate.

## 1. Recording evidence

Across the recording:

- the canvas remains visually empty;
- simulation time remains `0.00 s`;
- status remains `RUNNING` only as static markup;
- build identity remains `source: local`;
- the experiment selector can visually change to `Substrate smoke probe`, but the title/purpose remain `Embodied Scale Field S0`;
- Pause / Reset / Debug do not create the expected state changes;
- no body, world geometry, grid, drifters or scale telemetry ever render.

The Owner therefore had no opportunity to judge:

- body scale;
- access;
- movement feel;
- mass/contact;
- spatial possibilities;
- whether S0 is interesting.

The only valid human-facing feedback from this recording is:

> **the test surface is broken / inert.**

## 2. Exact causal diagnosis

In deployed `app.js`, startup order is:

1. registry and input are initialized;
2. selector options are created;
3. `loadExperiment(...)` is called;
4. inside `loadExperiment`, the title / purpose / controls are updated;
5. then it executes `elapsed=0` and `last=performance.now()`;
6. but `let elapsed=0` and `let last=performance.now()` are declared only **after** that call.

Because `let` bindings are in the temporal dead zone until initialization, startup throws a `ReferenceError` at `elapsed=0`.

Consequences explain the recording exactly:

- title/purpose update before the throw -> S0 heading appears;
- selector options exist -> dropdown can open and visually change;
- selector change listener is installed only after the failing call -> visual dropdown value changes but experiment does not actually load;
- Pause / Reset / Debug listeners are installed later -> they do not function;
- `readBuildIdentity()` runs later -> `source: local` never updates;
- `requestAnimationFrame(frame)` runs last -> simulation time remains 0 and canvas remains blank.

This is a deterministic startup-order bug, not a body/scale simulation failure.

## 3. Why the machine/browser gate falsely passed

The headless-Chromium gate checked that emitted DOM contained:

- `Embodied Scale Field S0`;
- `source: local`;
- and no longer contained `Loading…`.

That was too weak.

The failing startup path updates the heading before throwing, so the gate accepted **partial initialization** as runtime success.

The gate did not assert:

- simulation time advances above 0;
- requestAnimationFrame executes;
- canvas render path produces a frame;
- Pause/Resume changes state;
- Reset calls the active experiment;
- experiment switching updates title/purpose;
- provenance resolves from `COMMIT.txt`.

Therefore:

> **green browser load evidence was real but materially narrower than the claim attached to it.**

## 4. Timeline from the Owner recording

Approximate visual sequence:

- **0–4.5 s:** S0 heading visible, canvas empty, timer fixed at 0.00, source fixed at local.
- **~4.5–7.5 s:** Owner opens the experiment selector repeatedly; DOM control itself works.
- **~7.5–9 s:** selector shows `Substrate smoke probe`, but title and canvas do not change — direct evidence that the registered `change` handler was never installed.
- **~9–10.5 s:** Owner probes other controls / page state; simulation remains inert.
- **~10.5–12.6 s:** browser contextual UI appears briefly around the static status area; no application state ever advances.

There is no useful body/scale play segment in the recording.

## 5. Research feedback extracted

### Product / apparatus

**FAIL.**

The Owner was handed a non-running experiment.

### S0 hypothesis

**UNPROVEN.**

Do not interpret the blank field as dislike of body/scale.

### Refoundation substrate

**MATERIAL FINDING.**

The substrate's isolation goal is good, but its qualification contract is too weak: an experiment can partially initialize and still receive a false browser PASS.

### Test philosophy correction

For Owner-facing browser specimens, future browser qualification must verify at least one **live state transition**, not merely static DOM/module load.

A strong minimum is:

- time advances;
- render loop executes;
- one input/control changes real experiment state;
- reset restores it;
- build provenance resolves.

### Owner burden

This is exactly the failure mode the refoundation was meant to reduce.

A broken specimen should be caught before consuming Owner attention.

## 6. Next valid move

Before changing any BODY / SCALE behavior:

1. repair startup ordering only;
2. strengthen browser runtime gate around live state;
3. redeploy the **same S0 hypothesis and behavior**;
4. perform machine + browser qualification;
5. return it to the Owner for the first actual body/scale observation.

Do not tune size, mass, geometry, movement or drifters based on this recording.

There is no Owner evidence about those yet.


## 7. Repair result

The runtime failure has now been repaired without touching `experiments/embodied-scale-field-v0.js`.

The S0 experiment blob remains exactly:

`d0ea720a1978fe385b0358c3b870f7cc10e335a8`

before and after the repair.

Checkpoint `fd851a13d1f36776f15b513884047f5cc90ff3a5` passes the strengthened live-browser gate, including real input, reset, pause/resume and experiment switching.

Therefore the next Owner observation remains a clean retest of the original S0 body/scale hypothesis.
