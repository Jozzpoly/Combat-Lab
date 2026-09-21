import test from "node:test";
import assert from "node:assert/strict";

import {
  runDuelRehearsal,
  runWallRehearsal,
  runGateClearanceRehearsal
} from "../rehearsal.js";

test("sword rehearsal forms an actual pressured encounter", () => {
  const result = runDuelRehearsal({ weapon: "sword", seconds: 18 });
  console.log("REHEARSAL_SWORD", JSON.stringify(result));
  assert.equal(result.finite, true);
  assert.ok(result.attackIntents >= 12);
  assert.ok(result.minDistance < 150);
  assert.ok(result.playerHits + result.enemyHits + result.clashes >= 3);
});

test("spear rehearsal forms an actual pressured encounter", () => {
  const result = runDuelRehearsal({ weapon: "spear", seconds: 18 });
  console.log("REHEARSAL_SPEAR", JSON.stringify(result));
  assert.equal(result.finite, true);
  assert.ok(result.attackIntents >= 10);
  assert.ok(result.minDistance < 170);
  assert.ok(result.playerHits + result.enemyHits + result.clashes >= 3);
});

test("long weapon rehearsal materially negotiates a wall", () => {
  const result = runWallRehearsal({ weapon: "spear" });
  console.log("REHEARSAL_WALL_SPEAR", JSON.stringify(result));
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


test("ruined gate changes which long-weapon action is viable", () => {
  const spearCut = runGateClearanceRehearsal({ weapon: "spear", action: "cut" });
  const spearThrust = runGateClearanceRehearsal({ weapon: "spear", action: "thrust" });
  const swordCut = runGateClearanceRehearsal({ weapon: "sword", action: "cut" });

  console.log("REHEARSAL_GATE", JSON.stringify({ spearCut, spearThrust, swordCut }));

  assert.equal(spearCut.finite, true);
  assert.equal(spearThrust.finite, true);
  assert.equal(swordCut.finite, true);

  assert.ok(spearCut.ruinWallContacts > 0);
  assert.equal(spearThrust.ruinWallContacts, 0);
  assert.ok(spearCut.ruinWallContacts > swordCut.ruinWallContacts);
});
