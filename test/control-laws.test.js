import test from "node:test";
import assert from "node:assert/strict";
import { computeGripImpulse, computeMotorImpulse } from "../src/control-laws.js";

test("motor acceleration is authored independently of body mass", () => {
  const light = computeMotorImpulse({
    mass: 10,
    currentVelocity: { x: 0, y: 0 },
    desiredVelocity: { x: 5, y: 0 },
    acceleration: 12,
    braking: 20,
    dt: 1 / 60
  });
  const heavy = computeMotorImpulse({
    mass: 100,
    currentVelocity: { x: 0, y: 0 },
    desiredVelocity: { x: 5, y: 0 },
    acceleration: 12,
    braking: 20,
    dt: 1 / 60
  });
  assert.ok(Math.abs(light.appliedDeltaV.x - heavy.appliedDeltaV.x) < 1e-12);
  assert.ok(Math.abs(heavy.x / light.x - 10) < 1e-12);
});

test("motor braking uses braking authority instead of silently zeroing velocity", () => {
  const result = computeMotorImpulse({
    mass: 40,
    currentVelocity: { x: 4, y: 0 },
    desiredVelocity: { x: 0, y: 0 },
    acceleration: 10,
    braking: 24,
    dt: 1 / 60
  });
  assert.ok(result.appliedDeltaV.x < 0);
  assert.ok(Math.abs(result.appliedDeltaV.x) <= 24 / 60 + 1e-12);
  assert.equal(result.rate, 24);
});

test("finite grip force cannot teleport a heavy object", () => {
  const result = computeGripImpulse({
    playerMass: 40,
    objectMass: 200,
    anchorVelocity: { x: 0, y: 0 },
    targetError: { x: 100, y: 0 },
    maxForce: 120,
    dt: 1 / 60
  });
  assert.ok(Math.hypot(result.x, result.y) <= 2 + 1e-12);
  assert.ok(result.requestedImpulse.x > result.x);
});

test("grip uses reciprocal effective mass rather than object mass alone", () => {
  const a = computeGripImpulse({
    playerMass: 20,
    objectMass: 20,
    anchorVelocity: { x: 0, y: 0 },
    targetError: { x: 0.1, y: 0 },
    maxForce: 10000,
    dt: 1 / 60
  });
  const b = computeGripImpulse({
    playerMass: 200,
    objectMass: 20,
    anchorVelocity: { x: 0, y: 0 },
    targetError: { x: 0.1, y: 0 },
    maxForce: 10000,
    dt: 1 / 60
  });
  assert.ok(b.effectiveMass > a.effectiveMass);
});
