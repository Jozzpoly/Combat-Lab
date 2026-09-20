import test from "node:test";
import assert from "node:assert/strict";

import {
  runDuelRehearsal,
  runWallRehearsal
} from "../rehearsal.js";

test("sword rehearsal forms an actual pressured encounter", () => {
  const result = runDuelRehearsal({ weapon: "sword", seconds: 18 });
  assert.equal(result.finite, true);
  assert.ok(result.attackIntents >= 12);
  assert.ok(result.minDistance < 150);
  assert.ok(result.playerHits + result.enemyHits + result.clashes >= 3);
});

test("spear rehearsal forms an actual pressured encounter", () => {
  const result = runDuelRehearsal({ weapon: "spear", seconds: 18 });
  assert.equal(result.finite, true);
  assert.ok(result.attackIntents >= 10);
  assert.ok(result.minDistance < 170);
  assert.ok(result.playerHits + result.enemyHits + result.clashes >= 3);
});

test("long weapon rehearsal materially negotiates a wall", () => {
  const result = runWallRehearsal({ weapon: "spear" });
  assert.equal(result.finite, true);
  assert.ok(result.wallContacts > 0);
});

test("sword and spear rehearsals do not collapse to identical outcomes", () => {
  const sword = runDuelRehearsal({ weapon: "sword", seconds: 18 });
  const spear = runDuelRehearsal({ weapon: "spear", seconds: 18 });

  const signature = r => [
    r.playerHits,
    r.enemyHits,
    r.clashes,
    r.wallContacts,
    r.roundsEnded,
    r.minDistance
  ].join(":");

  assert.notEqual(signature(sword), signature(spear));
});
