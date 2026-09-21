import test from "node:test";
import assert from "node:assert/strict";

import { runDuelRehearsal } from "../rehearsal.js";

test("terrarium survives multi-minute repeated combat without state collapse", () => {
  const sword = runDuelRehearsal({ weapon: "sword", seconds: 120 });
  const spear = runDuelRehearsal({ weapon: "spear", seconds: 120 });

  console.log("SOAK_SWORD", JSON.stringify(sword));
  console.log("SOAK_SPEAR", JSON.stringify(spear));

  for (const result of [sword, spear]) {
    assert.equal(result.finite, true);
    assert.ok(result.generations >= 5);
    assert.ok(result.attackIntents >= 80);
    assert.ok(result.enemyAttackIntents >= 20);
    assert.ok(result.playerHits + result.enemyHits + result.clashes >= 25);
    assert.ok(result.wallContacts < result.attackIntents * 1.5);
  }
});
