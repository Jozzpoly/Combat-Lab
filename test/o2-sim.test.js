import test from "node:test";
import assert from "node:assert/strict";

import { createO2State, stepO2State } from "../src/o2-sim.js";
import { runO2Policy } from "../src/o2-rehearsal.js";

test("O2 same-step committed body hit survives lethal thrust",()=>{
  const state=createO2State({
    playerStart:{x:300,y:300,facing:0},
    threatStarts:[
      {id:"front",x:405,y:300,facing:Math.PI},
      {id:"side",x:331,y:300,facing:Math.PI}
    ]
  });

  // Put the side threat into a committed contact and make thrust immediately active.
  const side=state.threats.find(t=>t.id==="side");
  side.state="lunge";
  side.stateTime=0.10;
  side.vx=-290;
  side.attackResolved=false;

  state.player.o2Action={
    type:"thrust",
    elapsed:0.16,
    serial:1,
    hitIds:new Set()
  };
  state.player.o2Serial=1;

  const events=stepO2State(state,{
    moveX:0,
    moveY:0,
    aimX:500,
    aimY:300
  },1/240);

  assert.ok(events.some(e=>e.type==="o2-body-hit"));
  assert.ok(state.player.hp<state.player.maxHp);
});

test("O2 backward-kite attribution separates boundary funnel from reach structure",()=>{
  const openWorld={
    width:1800,
    height:1400,
    inset:28,
    walls:[]
  };
  const openStart={
    x:900,
    y:900,
    facing:-Math.PI/2
  };
  const openThreats=[
    {id:"north",x:900,y:650,facing:Math.PI/2},
    {id:"north-east",x:1040,y:700,facing:Math.PI*0.75},
    {id:"north-west",x:760,y:700,facing:Math.PI*0.25}
  ];

  const ringThreats=[
    {id:"north",x:450,y:315,facing:Math.PI/2},
    {id:"east",x:575,y:455,facing:Math.PI},
    {id:"west",x:325,y:455,facing:0},
    {id:"north-east",x:540,y:350,facing:Math.PI*0.75}
  ];

  const result={
    openBackward:runO2Policy("backward-kite",{
      world:openWorld,
      playerStart:openStart,
      threatStarts:openThreats
    }),
    openMixed:runO2Policy("mixed-lane",{
      world:openWorld,
      playerStart:openStart,
      threatStarts:openThreats
    }),
    ringBackward:runO2Policy("backward-kite",{
      threatStarts:ringThreats
    }),
    ringMixed:runO2Policy("mixed-lane",{
      threatStarts:ringThreats
    })
  };

  console.log("O2_KITE_ATTRIBUTION",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
  }
});

test("O2 K1 red-team policies are finite diagnostics",()=>{
  const result={
    backwardKite:runO2Policy("backward-kite"),
    forwardChase:runO2Policy("forward-chase"),
    clearanceSpam:runO2Policy("clearance-spam"),
    passive:runO2Policy("passive"),
    mixedLane:runO2Policy("mixed-lane")
  };

  console.log("O2_K1_POLICY_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
  }

  // A zero-damage clearance loop must not be able to clear by itself.
  assert.notEqual(result.clearanceSpam.result,"clear");
  assert.equal(result.clearanceSpam.kills,0);

  // Passive pressure should remain meaningfully dangerous.
  assert.ok(
    result.passive.bodyHits>0 ||
    result.passive.result==="down"
  );
});
