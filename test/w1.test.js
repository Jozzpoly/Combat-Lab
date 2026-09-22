import test from "node:test";
import assert from "node:assert/strict";

import { createActor } from "../src/actors.js";
import { BROKEN_YARD, PLAYER_SPEC, PRESSURE_SPEC } from "../src/yard.js";
import { PRESSURE_TIMING, updatePressure } from "../src/pressure.js";
import { routePolylineClear, runNeutralRehearsal } from "../src/rehearsal.js";
import { pointClear, resolveActorPair } from "../src/world.js";

test("W1 uses equal initial body envelopes so route access is not a phenotype gate",()=>{
  assert.equal(PLAYER_SPEC.radius,PRESSURE_SPEC.radius);
});

test("broken yard exposes more than one broad traversable relation",()=>{
  const left=[
    {x:450,y:535},{x:300,y:420},{x:300,y:330},{x:410,y:240},{x:300,y:100}
  ];
  const right=[
    {x:450,y:535},{x:560,y:450},{x:760,y:350},{x:700,y:320},{x:650,y:235},{x:600,y:100}
  ];
  assert.equal(routePolylineClear(left),true);
  assert.equal(routePolylineClear(right),true);
});

test("key open-space points remain clear for the shared actor radius",()=>{
  for(const p of [{x:450,y:535},{x:450,y:340},{x:450,y:235},{x:300,y:180},{x:650,y:180}]){
    assert.equal(pointClear(BROKEN_YARD,p.x,p.y,PLAYER_SPEC.radius),true);
  }
});

test("body contact yields both finite-mass actors",()=>{
  const a=createActor(PLAYER_SPEC,{id:"a",x:100,y:100});
  const b=createActor(PRESSURE_SPEC,{id:"b",x:125,y:100});
  a.vx=100; b.vx=-70;
  const hit=resolveActorPair(a,b);
  assert.ok(hit);
  assert.ok(hit.moveA>0);
  assert.ok(hit.moveB>0);
  assert.ok(hit.impulse>0);
  assert.ok(Number.isFinite(a.vx)&&Number.isFinite(b.vx));
});

test("pressure body exposes readable commitment and recovery without damage authority",()=>{
  const player=createActor(PLAYER_SPEC,{id:"p",x:200,y:200});
  const enemy=createActor(PRESSURE_SPEC,{id:"e",kind:"pressure",x:200,y:245,facing:-Math.PI/2});
  const seen=new Set([enemy.state]);
  const events=[];
  for(let i=0;i<Math.ceil((PRESSURE_TIMING.windup+PRESSURE_TIMING.lunge+PRESSURE_TIMING.recover+0.5)*120);i++){
    events.push(...updatePressure(enemy,player,BROKEN_YARD,1/120));
    seen.add(enemy.state);
  }
  assert.ok(seen.has("windup"));
  assert.ok(seen.has("lunge"));
  assert.ok(seen.has("recover"));
  assert.ok(events.some(e=>e.type==="pressure-lunge"));
  assert.equal(Object.hasOwn(player,"hp"),false);
});

test("neutral multi-body rehearsal stays finite and exercises pressure states",()=>{
  const result=runNeutralRehearsal({seconds:20});
  console.log("BROKEN_YARD_W1",JSON.stringify(result));
  assert.equal(result.finite,true);
  assert.ok(result.transitions>10);
  assert.ok(result.pairContacts>0);
  assert.ok(result.seenStates.includes("windup"));
  assert.ok(result.seenStates.includes("lunge"));
  assert.ok(result.seenStates.includes("recover"));
});
