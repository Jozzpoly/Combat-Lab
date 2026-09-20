import test from "node:test";
import assert from "node:assert/strict";

import { createBody, driveBody, setDesiredFacing, updateFacing } from "../world.js";
import {
  WEAPONS,
  createWeaponState,
  requestAttack,
  resolveWeaponClash,
  resolveWeaponHit,
  updateWeapon,
  weaponSegment
} from "../combat.js";

test("spear has materially different reach and inertia from sword", () => {
  assert.ok(WEAPONS.spear.maxReach > WEAPONS.sword.maxReach + 30);
  assert.ok(WEAPONS.spear.inertia > WEAPONS.sword.inertia * 1.5);
  assert.ok(WEAPONS.spear.maxAngularAccel < WEAPONS.sword.maxAngularAccel);
});

test("attack does not lock locomotion", () => {
  const body = createBody({ id: "p", x: 300, y: 800, maxSpeed: 240, acceleration: 2200 });
  const weapon = createWeaponState(body, "sword");
  assert.equal(requestAttack(body, weapon, "cut"), true);

  const startX = body.x;
  let sawActive = false;

  for (let i = 0; i < 70; i++) {
    driveBody(body, 1, 0, 1 / 120);
    setDesiredFacing(body, 0);
    updateFacing(body, 1 / 120);
    const frame = updateWeapon(body, weapon, 1 / 120);
    sawActive ||= frame.active;
  }

  assert.equal(sawActive, true);
  assert.ok(body.x > startX + 35);
});

test("weapon wall contact alters realized motion", () => {
  const body = createBody({ id: "p", x: 728, y: 300 });
  body.facing = 0;
  body.desiredFacing = 0;
  const weapon = createWeaponState(body, "spear");
  weapon.angle = 0;
  weapon.angularVelocity = 4;
  weapon.reach = 120;
  weapon.lastSegment = weaponSegment(body, weapon);

  const events = [];
  for (let i = 0; i < 20; i++) {
    updateWeapon(body, weapon, 1 / 120, e => events.push(e));
  }

  assert.ok(events.some(e => e.type === "weapon-wall"));
  assert.equal(weapon.wallContact || events.length > 0, true);
});

test("blade clash redirects weapon motion", () => {
  const a = createBody({ id: "a", x: 500, y: 500 });
  const b = createBody({ id: "b", x: 550, y: 540 });
  a.facing = 0;
  b.facing = Math.PI;

  const aw = createWeaponState(a, "sword");
  const bw = createWeaponState(b, "sword");
  aw.angle = 0;
  bw.angle = -Math.PI / 2;
  aw.reach = 78;
  bw.reach = 78;
  aw.angularVelocity = 6;
  bw.angularVelocity = -5;

  const beforeA = aw.angularVelocity;
  const beforeB = bw.angularVelocity;
  const event = resolveWeaponClash(a, aw, b, bw);

  assert.ok(event);
  assert.notEqual(aw.angularVelocity, beforeA);
  assert.notEqual(bw.angularVelocity, beforeB);
  assert.ok(event.relativeSpeed > 65);
});

test("a real active weapon contact can damage a body", () => {
  const attacker = createBody({ id: "a", x: 500, y: 800 });
  const target = createBody({ id: "b", x: 565, y: 800, radius: 18 });
  attacker.facing = 0;
  attacker.desiredFacing = 0;

  const weapon = createWeaponState(attacker, "sword");
  requestAttack(attacker, weapon, "thrust");

  let hitEvent = null;
  for (let i = 0; i < 90 && !hitEvent; i++) {
    updateFacing(attacker, 1 / 120);
    const frame = updateWeapon(attacker, weapon, 1 / 120);
    hitEvent = resolveWeaponHit(attacker, weapon, target, frame);
  }

  assert.ok(hitEvent);
  assert.ok(target.hp < target.maxHp);
});

test("same attack cannot multi-hit the same body every substep", () => {
  const attacker = createBody({ id: "a", x: 500, y: 800 });
  const target = createBody({ id: "b", x: 565, y: 800, radius: 18 });
  attacker.facing = 0;
  attacker.desiredFacing = 0;

  const weapon = createWeaponState(attacker, "sword");
  requestAttack(attacker, weapon, "thrust");

  let firstHp = null;
  for (let i = 0; i < 90; i++) {
    const frame = updateWeapon(attacker, weapon, 1 / 120);
    const event = resolveWeaponHit(attacker, weapon, target, frame);
    if (event && firstHp === null) firstHp = target.hp;
    else if (firstHp !== null && weapon.action) assert.equal(target.hp, firstHp);
  }

  assert.notEqual(firstHp, null);
});
