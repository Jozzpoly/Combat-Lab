import test from "node:test";
import assert from "node:assert/strict";

import { ANCHOR_FIXTURES, createActor } from "../src/phenotype.js";
import {
  COMPACT_ATTACK,
  attackActive,
  compactWeaponSegment,
  createWeaponRuntime,
  requestCompactAttack,
  resolveCompactStrike,
  stepCompactAttack
} from "../src/weapon.js";

function advanceToMidStrike(runtime) {
  const dt = COMPACT_ATTACK.duration * 0.5;
  stepCompactAttack(runtime, dt);
  assert.equal(attackActive(runtime), true);
}

test("shared compact attack is authored and bounded", () => {
  const actor = createActor(ANCHOR_FIXTURES.skirmisher, { x: 0, y: 0, facing: 0 });
  const runtime = createWeaponRuntime();

  assert.equal(requestCompactAttack(runtime), true);
  advanceToMidStrike(runtime);

  const seg = compactWeaponSegment(actor, 0.5);
  assert.ok(seg);
  assert.ok(seg.bx > seg.ax);
  assert.ok(Math.abs(seg.by - seg.ay) < 1e-6);
});

test("frontal shield geometry intercepts the shared compact strike before body damage", () => {
  const attacker = createActor(ANCHOR_FIXTURES.skirmisher, {
    id: "attacker",
    x: 0,
    y: 0,
    facing: 0
  });
  const defender = createActor(ANCHOR_FIXTURES.bulwark, {
    id: "defender",
    x: 58,
    y: 0,
    facing: Math.PI
  });
  const runtime = createWeaponRuntime();
  requestCompactAttack(runtime);
  advanceToMidStrike(runtime);

  const beforeHp = defender.hp;
  const event = resolveCompactStrike(attacker, runtime, defender);

  assert.ok(event);
  assert.equal(event.type, "shield-block");
  assert.equal(defender.hp, beforeHp);
});

test("the same strike can reach an unshielded body", () => {
  const attacker = createActor(ANCHOR_FIXTURES.skirmisher, {
    id: "attacker",
    x: 0,
    y: 0,
    facing: 0
  });
  const target = createActor(ANCHOR_FIXTURES.skirmisher, {
    id: "target",
    x: 50,
    y: 0,
    facing: Math.PI
  });
  const runtime = createWeaponRuntime();
  requestCompactAttack(runtime);
  advanceToMidStrike(runtime);

  const event = resolveCompactStrike(attacker, runtime, target);

  assert.ok(event);
  assert.equal(event.type, "body-hit");
  assert.equal(target.hp, 100 - event.damage);
});

test("one attack cannot multi-hit the same body every simulation frame", () => {
  const attacker = createActor(ANCHOR_FIXTURES.skirmisher, {
    id: "attacker",
    x: 0,
    y: 0,
    facing: 0
  });
  const target = createActor(ANCHOR_FIXTURES.skirmisher, {
    id: "target",
    x: 50,
    y: 0,
    facing: Math.PI
  });
  const runtime = createWeaponRuntime();
  requestCompactAttack(runtime);
  advanceToMidStrike(runtime);

  const first = resolveCompactStrike(attacker, runtime, target);
  const hpAfterFirst = target.hp;
  const second = resolveCompactStrike(attacker, runtime, target);

  assert.equal(first?.type, "body-hit");
  assert.equal(second, null);
  assert.equal(target.hp, hpAfterFirst);
});
