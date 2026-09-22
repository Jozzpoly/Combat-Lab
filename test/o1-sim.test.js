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
import { runO1ForwardIntercept, runO1LineHold, runO1Policy, runO1StakePolicy } from "../src/o1-rehearsal.js";

test("same-step committed strike and side hit both survive application order",()=>{
  const player=createO1Player({x:300,y:300,facing:-Math.PI/2});
  const strikeTarget=createO1Threat("front",{x:300,y:245,facing:Math.PI/2});
  const sideThreat=createO1Threat("side",{x:331,y:300,facing:Math.PI});
  sideThreat.state="lunge";
  sideThreat.vx=-290;

  requestO1Attack(player);
  for(let i=0;i<30 && player.attack.phase!=="active";i++) stepO1Attack(player,1/120);
  assert.equal(player.attack.phase,"active");

  const incoming=resolvePressurePhysical(player,sideThreat);
  const outgoing=probeO1Strike(player,strikeTarget);

  assert.equal(incoming.type,"body-hit-candidate");
  assert.ok(outgoing);

  // Deliberately kill the frontal target first. The other hostile's already
  // measured side hit must still land in the same simulation step.
  const strike=applyO1Strike(player,strikeTarget,outgoing);
  const hit=applyPressureHit(player,incoming);

  assert.equal(strike.killed,true);
  assert.ok(hit);
  assert.ok(player.hp<player.maxHp);
  assert.equal(strikeTarget.hp,0);
});

test("integrated O1 policies are finite diagnostic probes, not a score",()=>{
  const matrix={
    activeGuard:runO1Policy("active-guard"),
    activeUnbraced:runO1Policy("active-unbraced"),
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


test("O1 pressure-density red-team probes brace relevance without retuning mechanics",()=>{
  const layouts={
    standard2:undefined,
    triAngle:[
      {id:"north",x:315,y:175,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI},
      {id:"west",x:95,y:390,facing:0}
    ],
    triNorth:[
      {id:"north-west",x:250,y:175,facing:Math.PI/2},
      {id:"north-mid",x:450,y:230,facing:Math.PI/2},
      {id:"north-east",x:650,y:175,facing:Math.PI/2}
    ]
  };

  const result={};
  for(const [name,threatStarts] of Object.entries(layouts)){
    result[name]={
      braced:runO1Policy("active-guard",{threatStarts}),
      unbraced:runO1Policy("active-unbraced",{threatStarts})
    };
  }

  console.log("O1_BRACE_PRESSURE_REDTEAM",JSON.stringify(result));

  for(const pair of Object.values(result)){
    assert.equal(pair.braced.finite,true);
    assert.equal(pair.unbraced.finite,true);
  }
});


test("spatial-stake falsifier checks whether brace matters when displacement has a cost",()=>{
  const result={
    braced:runO1StakePolicy(true),
    unbraced:runO1StakePolicy(false)
  };
  console.log("O1_SPATIAL_STAKE_REDTEAM",JSON.stringify(result));
  assert.equal(result.braced.finite,true);
  assert.equal(result.unbraced.finite,true);
});


test("direct line-hold falsifier isolates brace support from route coverage",()=>{
  const result={
    braced:runO1LineHold(true),
    unbraced:runO1LineHold(false)
  };
  console.log("O1_LINE_HOLD_REDTEAM",JSON.stringify(result));
  assert.equal(result.braced.finite,true);
  assert.equal(result.unbraced.finite,true);
});


test("spatial stake does not pre-author brace as the only possible answer",()=>{
  const result={
    closeBraced:runO1StakePolicy(true),
    closeUnbraced:runO1StakePolicy(false),
    forwardUnbraced:runO1ForwardIntercept()
  };
  console.log("O1_STAKE_POSSIBILITY_REDTEAM",JSON.stringify(result));
  for(const value of Object.values(result)) assert.equal(value.finite,true);
});


test("spatial-stake attribution separates contact support from locomotion profile",()=>{
  const result={
    bracedNormal:runO1StakePolicy(true),
    unbracedNormal:runO1StakePolicy(false),
    supportOffSlowMovement:runO1StakePolicy(false,{movementBracedOverride:true}),
    supportOnFastMovement:runO1StakePolicy(true,{movementBracedOverride:false})
  };
  console.log("O1_STAKE_SUPPORT_ISOLATION",JSON.stringify(result));
  for(const value of Object.values(result)) assert.equal(value.finite,true);
});
