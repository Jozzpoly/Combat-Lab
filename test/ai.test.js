import test from "node:test";
import assert from "node:assert/strict";

import { createBody } from "../world.js";
import { createWeaponState } from "../combat.js";
import { createDuelistBrain, updateDuelistAI } from "../ai.js";

test("duelist approaches from far range", () => {
  const a = createBody({ id: "enemy", x: 1100, y: 900 });
  const t = createBody({ id: "player", x: 700, y: 900 });
  const w = createWeaponState(a, "sword");
  const brain = createDuelistBrain(3);

  const input = updateDuelistAI(brain, a, w, t, 1 / 120);
  const towardX = t.x - a.x;
  assert.ok(input.moveX * towardX > 0);
});

test("duelist creates separation when face-hugging", () => {
  const a = createBody({ id: "enemy", x: 1100, y: 900 });
  const t = createBody({ id: "player", x: 1075, y: 900 });
  const w = createWeaponState(a, "sword");
  const brain = createDuelistBrain(3);

  const input = updateDuelistAI(brain, a, w, t, 1 / 120);
  const towardX = t.x - a.x;
  assert.ok(input.moveX * towardX < 0);
});
