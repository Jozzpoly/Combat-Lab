# Combat Lab — P12b causal correction: sleeping material momentum sink (2026-10-11)

**Scientific result: YES, the major P12 apparent momentum violation now has a source-confirmed cause.** This correction outranks the earlier P12 phrase "unresolved numerical integrity" and does **NOT** turn one-off push-off into sustained gait, qualified morphology or Owner-approved physics.

## Live primary evidence

- [P12b isolated diagnostic source](https://github.com/Jozzpoly/Combat-Lab/tree/experiment/p12b-momentum-integrity), [full forensic report](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p12b-momentum-integrity/docs/P12B_SLEEPING_MOMENTUM_CAUSE_2026-10-11.md), [draft PR #14](https://github.com/Jozzpoly/Combat-Lab/pull/14).
- [Exact emitted Rapier WASM/Chromium 24-world causal A/B PASS 38163867448](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38163867448), implementation HEAD \`5083f79c2ef53c413aa4a49635b4b3e9718fb124\`; after-report HEAD may differ, recheck. Two independently moving creature parts, 90kg backing, 0 virtual-ground, 0 direct root movement, 0 linear/angular damping. True contacts measured. CCD enabled/disabled, joint self-contact enabled/disabled, 4/12/24 solver iterations, backing absent vs movable, and explicit keep-awake afterstate control. 24×300 true solver steps, not node mock.
- [Prior P12 original report](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/p12-material-pushoff/docs/P12_WORLD_CONTACT_COM_NULL_2026-10-11.md) remains an accurate *historical* account of why the original evidence was narrow. Its numerical discrepancy section is superseded by P12b.

## Causal result

| Same 12-iteration real movable90kg backing, same body/actuation | Original auto sleep | Awake each solver step (no applied force) |
| --- | ---: | ---: |
| Recorded first backing sleep | tick31 | never |
| First real limb contact | tick78 | real contact remains |
| Unbalanced total linear momentum after 300 steps | **2.0886671 kg·m/s** | **0.0000244 kg·m/s** |
| Coupled body+backing COM drift | **37.5147mm** | **0.2297mm** |
| Final backing sleeping? | **yes** | **no** |

In auto-sleep world the linear momentum difference first becomes apparent at tick107 while backing is sleeping. With awake backing, strong momentum discrepancy disappears. Repeat at solver4: 2.06861→0.0000287 kg·m/s; solver24: 2.08959→0.0000099 kg·m/s. CCD/off and joint self-contact/off are NOT causes in tested source. Small remaining COM position drift (up to ~1.1mm) does not justify claiming perfect conservation. This is a bounded source diagnosis of Rapier's sleeping/contact behavior under very weak interaction, **not a universal Rapier bug claim**.

## Engineering consequence / do NOT prematurely implement

A mobile piece of matter that sleeps too aggressively may behave like **false fixed support** when a weak articulated body contacts it, breaking the intended affordance and movement of the world. Waking it conditionally for relevant contact can restore physically meaningful reactive material and measured momentum. But globally keeping thousands of loads/creatures awake would cost CPU; choose local wake-on-contact policies, force thresholds and test against true many-body performance before product integration. P10b remains the latest free-manipulation whole, ready via [Windows portable First Look](P10C_HANDOFF_POINTER_2026-10-11.md), Owner experiential quality **UNKNOWN**.

**Don't turn this into an automatic P13 locomotion program.** P12 physically demonstrated only a 9.7cm one-off fixed-wall push-off. No repeatable gait, no correct feet/support, no whole organism usability. The correction removes one unjustified solver fear; it does not qualify morphology or substrate. No P12b code merge, public change, new default sleep policy or Owner-facing demands. Next chat recovers latest repo and Owner feedback, no copy-paste necessary.
