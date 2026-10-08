import test from "node:test";
import assert from "node:assert/strict";
import { MaterialWorld } from "../src/material-world.js";

const moving = { x: 1, y: 0 };
const neutral = { x: 0, y: 0 };

function entity(world, id) {
  const found = world.snapshot().entities.find((item) => item.id === id);
  assert.ok(found, "missing entity " + id);
  return found;
}

function checkFinite(world, label) {
  for (const e of world.snapshot().entities) {
    for (const n of [e.position.x, e.position.y, e.velocity.x, e.velocity.y, e.rotation]) {
      assert.ok(Number.isFinite(n), label + ": nonfinite state in " + e.id);
    }
  }
}

async function withWorld(fn) {
  const world = await MaterialWorld.create();
  try { await fn(world); }
  finally { world.world.free(); }
}

test("live dynamic motor produces realized displacement without overwriting physics state", async () => {
  await withWorld((world) => {
    const initial = entity(world, "player");
    for (let i = 0; i < 90; i++) world.step(moving);
    const after = entity(world, "player");
    assert.ok(after.position.x > initial.position.x + 1, "no useful realized travel");
    checkFinite(world, "motor");
  });
});

test("a finite grip moves nearby matter and the displaced object persists after release", async () => {
  await withWorld((world) => {
    world.player().body.setTranslation({ x: 5.5, y: 5.8 }, true);
    assert.equal(world.beginGrip({ x: 6.9, y: 5.8 }), true);
    const before = entity(world, "light-crate");
    world.setGripTarget({ x: 8.0, y: 5.8 });
    for (let i = 0; i < 90; i++) world.step(neutral);
    const during = entity(world, "light-crate");
    assert.ok(Math.hypot(during.position.x - before.position.x, during.position.y - before.position.y) > 0.2,
      "grip never produced a material change");
    world.endGrip();
    for (let i = 0; i < 30; i++) world.step(neutral);
    checkFinite(world, "grip afterstate");
    assert.equal(world.snapshot().entities.length, 5, "matter disappeared after release");
  });
});

test("identical applied impulse on separately resting objects yields mass-dependent velocity", async () => {
  await withWorld((world) => {
    const light = world.entities.get("light-crate");
    const heavy = world.entities.get("heavy-crate");
    light.body.applyImpulse({ x: 20, y: 0 }, true);
    heavy.body.applyImpulse({ x: 20, y: 0 }, true);
    assert.ok(light.body.linvel().x > heavy.body.linvel().x * 3,
      "mass does not materially affect the response to a fixed impulse");
  });
});

test("repeatable reset restores physical scene and does not silently erase authored body profile", async () => {
  await withWorld((world) => {
    world.setPlayerProfile({ ...world.profile, mass: 75, radius: 0.65 });
    world.spawnCrate("heavy");
    assert.equal(world.snapshot().entities.length, 6);
    for (let i = 0; i < 45; i++) world.step(moving);
    world.reset();
    const snapshot = world.snapshot();
    assert.equal(snapshot.entities.length, 5);
    assert.equal(snapshot.profile.mass, 75);
    assert.equal(snapshot.profile.radius, 0.65);
    assert.ok(Math.abs(entity(world, "player").position.x - 4) < 1e-5);
    checkFinite(world, "reset");
  });
});

test("overlapping material-pressure spawn does not silently despawn or produce NaN", async () => {
  await withWorld((world) => {
    for (let i = 0; i < 32; i++) world.spawnCrate(i % 3 === 0 ? "heavy" : "light");
    assert.equal(world.snapshot().entities.length, 37);
    for (let i = 0; i < 100; i++) {
      world.step(i % 40 < 20 ? moving : neutral);
      if (i % 20 === 0) checkFinite(world, "overload tick " + i);
    }
    checkFinite(world, "overload final");
    assert.equal(world.snapshot().entities.length, 37, "spawned objects were silently discarded");
  });
});
