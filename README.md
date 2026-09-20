# Combat Lab

Experimental laboratory for discovering combat language that may later inform **Feniks**.

Combat Lab is not the Feniks combat implementation and is not a place where a prototype automatically becomes architecture.

## Current research truth

The repository has been deliberately reset after two failed research lanes:

- **R0 — authored arc vs sampled sweep:** mechanically useful as a geometry exercise, but **FAILED AS A COMBAT EXPERIMENT**. It isolated hit testing so aggressively that it removed the phenomenon we actually needed to judge: fighting.
- **R1 — small combat organism:** restored an opponent, timing, contact, obstacles, damage and reset, but **FAILED OWNER FEEL**. More completeness did not make the local direction representative of Feniks.

Neither R0 nor R1 is a foundation to continue.

There is currently **no accepted Feniks combat model**, no accepted hit-authority model, and no accepted aim/target/commitment scheme.

## Recovered Feniks constraints

Current work must preserve these pressures without pretending they already specify the answer:

- responsiveness and player agency have veto over simulation elegance;
- the player should feel embodied in a materially meaningful world rather than operate detached combat abstractions;
- body, weapon, movement, terrain and contact may matter, but only where the player can perceive and use the difference;
- movement during attacks is a strong default; stronger commitment must earn itself in play rather than arrive as arbitrary animation lock;
- nontarget resolution remains important, while focus/assist/targeting are open experimental questions;
- weapon identity should be allowed to emerge from how weapons negotiate space, timing, movement and contact, not only from DPS/range/cooldown;
- universal dodge-roll/i-frame combat is not an assumed foundation;
- simple authored rules are allowed to beat deeper simulation whenever they produce a better game;
- automated tests can qualify mechanisms; **Owner play is required to qualify gameplay**.

## Current frontier

The next specimen should investigate a higher-level question than R0/R1:

> **How does the player express combat intent through an embodied character while remaining responsive, yet still creating readable commitment and spatial consequence?**

This is intentionally not yet a choice of sword physics, class system, camera, target lock, progression, AI architecture or final Feniks combat.

The specimen should keep the surrounding situation constant and expose materially different **control / commitment contracts** for direct comparison. Hit detection is a supporting mechanism, not the experiment's headline.

## Working method

1. Build a small **playable combat situation**, not an algorithm visualizer.
2. Change one high-level interaction contract at a time.
3. Keep raw input, realized body/weapon motion, factual contact and presentation distinguishable.
4. Use enough sensory feedback to read timing/contact, but not enough polish to hide bad control.
5. Get an Owner feel-test early.
6. Let the first repeatable material failure choose the next experiment.
7. Promote nothing to Feniks merely because CI is green or the implementation is elegant.

## Live state

There is currently **no qualified active combat specimen**. The public page intentionally reports the reset instead of serving stale R0/R1 gameplay.
