import test from "node:test";
import assert from "node:assert/strict";

import {
  circleRectPenetration,
  segmentCircleHit,
  segmentIntersectsRect,
  segmentsIntersection,
  wrapAngle
} from "../core.js";

test("angles remain wrapped", () => {
  for (const a of [-100, -9, 0, 8, 100]) {
    const w = wrapAngle(a);
    assert.ok(w > -Math.PI - 1e-9);
    assert.ok(w <= Math.PI + 1e-9);
  }
});

test("segment-circle contact is spatial", () => {
  assert.equal(segmentCircleHit({ ax: 0, ay: 0, bx: 10, by: 0 }, { x: 5, y: 1, r: 2 }), true);
  assert.equal(segmentCircleHit({ ax: 0, ay: 0, bx: 10, by: 0 }, { x: 5, y: 5, r: 2 }), false);
});

test("crossing segments report an intersection point", () => {
  const hit = segmentsIntersection(
    { ax: 0, ay: 0, bx: 10, by: 10 },
    { ax: 0, ay: 10, bx: 10, by: 0 }
  );
  assert.ok(hit);
  assert.ok(Math.abs(hit.x - 5) < 1e-8);
  assert.ok(Math.abs(hit.y - 5) < 1e-8);
});

test("weapon segment sees static wall geometry", () => {
  const wall = { x: 5, y: -3, w: 2, h: 6 };
  assert.equal(segmentIntersectsRect({ ax: 0, ay: 0, bx: 10, by: 0 }, wall), true);
  assert.equal(segmentIntersectsRect({ ax: 0, ay: 8, bx: 10, by: 8 }, wall), false);
});

test("circle-rect penetration produces a separating direction", () => {
  const hit = circleRectPenetration({ x: 4, y: 5, r: 2 }, { x: 5, y: 0, w: 4, h: 10 });
  assert.ok(hit);
  assert.ok(hit.depth > 0);
  assert.ok(hit.nx < 0);
});
