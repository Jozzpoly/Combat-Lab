# Combat Lab

Experimental laboratory for discovering the combat substrate that may later inform Feniks.

## Core question

Can top-down combat remain responsive and player-authored while making bodies, weapon reach, movement, contact and spatial consequence materially real?

This repository is a research lab, not the Feniks combat implementation.

## Research stance

- prototype before architecture;
- preserve player control during attacks unless evidence earns a stronger commitment mechanism;
- prefer physical/spatial causes over invisible permissions, invulnerability windows or target-only abstractions;
- distinguish input intent, combat intent, realized motion/contact, factual outcome and presentation;
- compare simple authored approximations against more geometric/physical candidates instead of assuming higher simulation fidelity is better;
- keep experiments small enough that animation, VFX and AI cannot hide a weak mechanical core;
- promote only findings that survive A/B feel tests and causal/debug inspection.

## Current frontier

R0 will compare two deliberately different melee-hit models under the same movement and aiming substrate:

1. an authored instantaneous arc/cone check;
2. a rotating blade whose swept spatial path is tested against target geometry.

Both retain live movement during attack. The purpose is not to pick a final system from one prototype, but to expose where geometric weapon truth improves or harms responsiveness, legibility, forgiveness and weapon identity.

Sibling projects (LLM Live NPC / SPC, Companion Brain Lab, ReflexBrain Lab) are donors and pressure sources, not architecture authority.
