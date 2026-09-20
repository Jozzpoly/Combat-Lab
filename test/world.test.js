import test from "node:test";
import assert from "node:assert/strict";

import {
  WORLD,
  createBody,
  driveBody,
  resolveBodyPair,
  resolveBodyStatic
} from "../world.js";

test("terrarium contains both open and constraining topology", () => {
  assert.ok(WORLD.width > 1400);
  assert.ok(WORLD.height > 800);
  assert.ok(WORLD.walls.some(w => w.id === "ruin-upper"));
  assert.ok(WORLD.walls.some(w => w.id === "ruin-lower"));
  assert.ok(WORLD.walls.some(w => w.id === "pillar-a"));
});

test("responsive body advances under input without attack-state ownership", () => {
  const body = createBody({ id: "p", x: 300, y: 800 });
  const start = body.x;
  for (let i = 0; i < 60; i++) driveBody(body, 1, 0, 1 / 120);
  assert.ok(body.x > start + 40);
  assert.ok(body.vx > 0);
});

test("heavier body yields less in body-to-body contact", () => {
  const light = createBody({ id: "light", x: 300, y: 800, radius: 20, mass: 1 });
  const heavy = createBody({ id: "heavy", x: 330, y: 800, radius: 20, mass: 3 });
  const lx = light.x;
  const hx = heavy.x;
  const hit = resolveBodyPair(light, heavy, 1);
  assert.ok(hit);
  assert.ok(Math.abs(light.x - lx) > Math.abs(heavy.x - hx));
});

test("static topology prevents body from remaining inside a wall", () => {
  const wall = WORLD.walls.find(w => w.id === "pillar-a");
  const body = createBody({ id: "p", x: wall.x - 10, y: wall.y + wall.h / 2, radius: 18 });
  body.vx = 220;
  for (let i = 0; i < 30; i++) {
    body.x += body.vx / 120;
    resolveBodyStatic(body);
  }
  assert.ok(body.x <= wall.x - body.radius + 1 || body.x >= wall.x + wall.w + body.radius - 1);
});
