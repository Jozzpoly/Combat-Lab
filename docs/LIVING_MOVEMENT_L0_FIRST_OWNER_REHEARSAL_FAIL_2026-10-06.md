# Living Movement L0 — first Owner rehearsal FAIL

Date: 2026-10-06  
Authority: explicit Owner-observed behavior and Owner feedback  
Status: **PRODUCT / OWNER REHEARSAL FAIL**  
Branch: `experiment/living-movement-l0`

## Status rule

This document overrides any interpretation that green CI, browser qualification, aggregate completion metrics or the earlier material-continuity finding made L0 an Owner-successful specimen.

The Owner tested the deployed rehearsal and rejected it.

Do not soften this FAIL using:

- 238/238 machine tests;
- browser-gate PASS;
- reduced continuation churn;
- completion counts;
- internal causal traces;
- earlier planning intent.

Those remain narrow mechanistic evidence only.

## Owner verdict

The rehearsal is insufficient and, from the Owner's perspective, not worth carrying forward as the current Owner-facing specimen.

The most important feedback is not merely that agents still jam. The Owner identified a regression in the relationship between the Lab and the researcher:

- the Lab became paternalistic;
- the Owner was prevented from pushing population beyond an authored ceiling;
- the debug surface remained too simple;
- the experiment offered too little freedom to break, deform and stress the organism;
- the result felt like a reheated version of old multi-body work with too little experiential progress after a large amount of research;
- the apparatus ignored long-established Owner practice in which deliberately breaking the system is part of discovering feel and causal truth.

This is a failure of research-product design, not just a tuning complaint.

## Recording evidence

Owner recording reviewed: ~5 minutes, 1864×910, 30 fps.

### Paternalistic population ceiling

L0 exposes population anchors:

- 8 readable
- 16 baseline
- 24 pressure
- **32 limit**

and the implementation hard-rejects populations above 32 because its authored edge-slot topology only supports 32 actors.

This directly regresses from older R0, which visibly exposes:

- 8 baseline
- 24 pressure
- 64 dense
- **256 break**

with wording that large values intentionally enter stress/break regimes.

This is not merely a smaller default. L0 structurally removed the Owner's right to push the experiment into break regimes.

### Reset-only pressure

Population changes apply only on Reset World. The Owner cannot continuously add pressure to the current scene.

This removes a previously valuable destructive workflow: stress an already interesting state, increase density, observe what breaks, then continue from the result.

### Repeated visible jams

The recording contains multiple central clusters that stop or nearly stop for seconds while other actors have already left the scene.

A particularly clear interval occurs around 103–109 s, where several bodies remain at effectively unchanged positions for multiple seconds.

These are not acceptable as evidence of living local negotiation merely because aggregate runs later complete.

### Absorbing wait pathology

The strongest diagnostic evidence appears around ~215 s and again ~275 s.

Selected actors show:

- continuation: `wait`
- reason: `continuation-supported-by-outcome`
- demand speed: 0
- realized speed: 0
- activity progress: 0

At ~275 s the world header also shows zero contact resolutions while the selected actor remains in this zero-progress state.

Fresh code read explains why.

For every non-direct continuation, L0 preserves continuation authority unless:

1. direct future materially improves enough to reopen; or
2. the current continuation is `materiallyBlocked`.

But `materiallyBlocked` currently requires:

- contact; and
- `blockedFraction >= 0.25`.

`blockedFraction` is only non-zero when demanded forward speed is non-zero.

A `wait` continuation demands zero velocity.

Therefore wait cannot normally become materially blocked by its own outcome. In a static local configuration it can self-perpetuate indefinitely until external geometry improves enough to reopen direct motion.

This is a conceptual inversion:

> absence of evidence that waiting failed was interpreted as evidence that waiting is supported.

The debug label `continuation-supported-by-outcome` is therefore materially misleading in these cases.

### Debug is not a causal microscope for the Owner

Although the implementation contains a richer ring-buffer trace and CI can query `selected-demand-trace`, the Owner-facing UI primarily exposes a scrolling list of current scalar values.

The visual overlay is mostly:

- selected-body highlight;
- a perception-radius circle;
- small current vectors / values.

It does not make the causal episode inspectable enough to answer, at a glance:

- which neighbour(s) close the relevant future;
- which candidate continuations were considered;
- what each candidate predicted;
- why `wait` beat moving alternatives;
- what exact evidence currently preserves `wait`;
- what evidence would release it;
- how the current continuation evolved over the previous seconds;
- whether progress, contact, prediction error or geometry changed at the transition.

The machine received a richer microscope than the Owner. That is backwards for this Lab.

### Harness remains too close to old crossflow

L0 replaced shared global waypoints, but its authored activities still send actors from one world edge to the opposite edge. Four cardinal streams repeatedly converge through the central region.

The resulting visual experiment is still dominated by central crossing / pile-up behavior in an empty rectangle.

This makes the Owner's "reheated old work" judgement understandable: the substrate changed more than the visible research situation did.

### Too little embodied freedom

The Owner-facing specimen exposes only a narrow set of new movement knobs while hiding or fixing many embodied dimensions that matter to the broader research direction.

The Owner cannot meaningfully explore, in this L0 surface, combinations of:

- body envelope;
- mass / inertial burden;
- locomotor authority;
- contact resistance;
- heterogeneous actor bodies;
- carried load;
- local obstacle topology;
- live population injection/removal;
- broad break-regime scaling.

The result is causal isolation at the cost of the Owner's actual research method.

## Methodological failure

The central mistake was turning a bounded falsification specimen into the Owner-facing Lab.

Controlled causal isolation is useful internally.

It must not replace the permissive research surface.

The Lab should support both:

1. reproducible narrow experiments; and
2. Owner-led destructive exploration where strange combinations, break regimes and direct perturbation are first-class research operations.

L0 over-optimized (1) and regressed (2).

## Current decision

Do **not** continue by tuning L0 thresholds, raising the 32 cap only, or patching `wait` and calling the stage recovered.

The absorbing wait bug must eventually be fixed, but it is evidence of a broader conceptual and apparatus failure.

Before another Owner rehearsal:

- refound the Owner-facing research contract;
- restore permissive breakability;
- redesign debug around causal episodes rather than scalar lists;
- make destructive manipulation and scaling first-class;
- separate narrow qualification fixtures from the broad playground;
- only then decide which L0 mechanics deserve transplant into the new surface.

L0 remains preserved as evidence and donor material. It is not the current Owner-facing success path.
