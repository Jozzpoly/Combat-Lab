import test from "node:test";
import assert from "node:assert/strict";

import {
  applyO1Strike,
  applyPressureHit,
  createO1Player,
  createO1Threat,
  probeO1Strike,
  requestO1Attack,
  resolvePressurePhysical,
  stepO1Attack
} from "../src/o1.js";
import { runO1Policy } from "../src/o1-rehearsal.js";

test("same-step committed player strike and enemy body hit both survive application order",()=>{
  const player=createO1Player({x:300,y:300,facing:0});
  const threat=createO1Threat("t",{x:331,y:300,facing:Math.PI});
  threat.state="lunge";
  threat.vx=-290;

  requestO1Attack(player);
  for(let i=0;i<30 && player.attack.phase!=="active";i++) stepO1Attack(player,1/120);
  assert.equal(player.attack.phase,"active");

  const incoming=resolvePressurePhysical(player,threat);
  const outgoing=probeO1Strike(player,threat);

  assert.equal(incoming.type,"body-hit-candidate");
  assert.ok(outgoing);

  // Deliberately kill the threat first. Its measured committed hit must still land.
  const strike=applyO1Strike(player,threat,outgoing);
  const hit=applyPressureHit(player,incoming);

  assert.equal(strike.killed,true);
  assert.ok(hit);
  assert.ok(player.hp<player.maxHp);
  assert.equal(threat.hp,0);
});

test("integrated O1 policies are finite diagnostic probes, not a score",()=>{
  const matrix={
    activeGuard:runO1Policy("active-guard"),
    mobileYield:runO1Policy("mobile-yield"),
    staticBrace:runO1Policy("static-brace")
  };
  console.log("O1_POLICY_MATRIX",JSON.stringify(matrix));

  for(const result of Object.values(matrix)) assert.equal(result.finite,true);

  // Static brace in a multi-angle yard must not be a universal invulnerability state.
  assert.ok(matrix.staticBrace.bodyHits>0);
  assert.ok(matrix.staticBrace.hp<100);

  // At least one active policy must demonstrate real offensive consequence.
  assert.ok(
    matrix.activeGuard.playerStrikes>0 ||
    matrix.mobileYield.playerStrikes>0
  );
});
