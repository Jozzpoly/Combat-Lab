import test from "node:test";
import assert from "node:assert/strict";
import { stepLocalShuttle } from "../src/local-shuttle.js";

const initial = () => ({
  tick: 0, blockedTicks: 0, recoveryTicks: 0, recoveries: 0,
  estimatedX: 0, state: "cruise", lastTransition: null
});
const sample = (overrides = {}) => ({
  touch: false, forwardTouch: false,
  motorEffort: 1, progressAlongIntent: 0,
  deltaX: 0, deltaY: 0, ...overrides
});
const step = (state, mode, sense, direction = 1) =>
  stepLocalShuttle({
    state, sense, direction, mode, maxSpeed: 2.1,
    lower: -1.8, upper: 5.7,
    recoveryDuration: 58, resistanceTicks: 12
  });

test("local law is pure and does not mutate the actor's previous state or sample", () => {
  const state = initial();
  const sense = sample({ touch: true, forwardTouch: true, deltaX: 0.3 });
  const decision = step(state, "directional-recovery", sense);
  assert.equal(state.tick, 0);
  assert.equal(state.estimatedX, 0);
  assert.equal(sense.deltaX, 0.3);
  assert.equal(decision.state.tick, 1);
  assert.equal(decision.state.estimatedX, 0.3);
  assert.deepEqual(decision.intendedVelocity, { x: 2.1, y: 0 });
});

test("sustained lateral touch reverses any-touch law but not directional law", () => {
  const lateral = sample({ touch: true, forwardTouch: false });
  let old = initial(), directed = initial();
  let oldDirection = 1, directedDirection = 1;
  for (let i = 0; i < 12; i++) {
    const a = step(old, "tactile-recovery", lateral, oldDirection);
    const b = step(directed, "directional-recovery", lateral, directedDirection);
    old = a.state; oldDirection = a.direction;
    directed = b.state; directedDirection = b.direction;
  }
  assert.equal(old.recoveries, 1);
  assert.equal(oldDirection, -1);
  assert.equal(directed.recoveries, 0);
  assert.equal(directedDirection, 1);
});

test("the same forward signal causes a finite-duration recovery without World labels", () => {
  let state = initial();
  let direction = 1;
  const forward = sample({ touch: true, forwardTouch: true });
  for (let i = 0; i < 12; i++) {
    const result = step(state, "directional-recovery", forward, direction);
    state = result.state;
    direction = result.direction;
  }
  assert.equal(direction, -1);
  assert.equal(state.recoveries, 1);
  assert.equal(state.lastTransition.tick, 12);
  assert.equal(state.state, "backoff");
  assert.ok(state.recoveryTicks > 0 && state.recoveryTicks < 58);
  assert.deepEqual(Object.keys(forward).sort(),
    ["deltaX", "deltaY", "forwardTouch", "motorEffort", "progressAlongIntent", "touch"]);
});

test("invalid local policy is explicitly rejected", () => {
  assert.throws(() => step(initial(), "oracle", sample()), RangeError);
});

test("forward obstruction permits bounded lateral action without reversing heading", () => {
  let state = initial(), direction = 1, witnessed = null;
  const sampleForward = sample({ touch: true, forwardTouch: true });
  for (let i = 0; i < 18; i++) {
    const out = step(state, "skirt-recovery", sampleForward, direction);
    state = out.state; direction = out.direction;
    if (out.transition) witnessed = { ...out };
  }
  assert.ok(witnessed);
  assert.equal(direction, 1);
  assert.equal(state.skirts, 1);
  assert.equal(state.recoveries, 0);
  assert.ok(witnessed.intendedVelocity.y < -1);
  assert.ok(witnessed.intendedVelocity.x > 0);
  assert.equal(witnessed.transition.kind, "lateral-attempt");
});

test("return to the lane depends on private deltaY rather than absolute map y", () => {
  let state = { ...initial(), skirtTicks: 0, estimatedY: -2.4 };
  const out = step(state, "skirt-recovery", sample({ deltaY: 0.15 }));
  assert.equal(out.state.estimatedY, -2.25);
  assert.ok(out.intendedVelocity.y > 0);
  assert.ok(out.intendedVelocity.x > 0);
  assert.equal(out.state.state, "lane-return");
  assert.equal(state.estimatedY, -2.4);
});
