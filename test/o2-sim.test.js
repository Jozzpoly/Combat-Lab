import test from "node:test";
import assert from "node:assert/strict";

import { createO2State, stepO2State } from "../src/o2-sim.js";
import { O2_PLAYER_SPEC, O2_PRESSURE_SPEC } from "../src/o2.js";
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

test("O2 deep-open stock W1 pressure reveals locomotion disengagement precondition failure",()=>{
  const deepWorld={
    width:5000,
    height:5000,
    inset:28,
    walls:[]
  };
  const playerStart={
    x:2500,
    y:2600,
    facing:-Math.PI/2
  };
  const threatStarts=[
    {id:"north",x:2500,y:2250,facing:Math.PI/2},
    {id:"north-east",x:2680,y:2320,facing:Math.PI*0.75},
    {id:"north-west",x:2320,y:2320,facing:Math.PI*0.25},
    {id:"east",x:2820,y:2520,facing:Math.PI}
  ];

  const backward=runO2Policy("backward-kite",{
    seconds:6,
    world:deepWorld,
    playerStart,
    threatStarts
  });

  console.log("O2_DEEP_OPEN_STOCK_PRESSURE",JSON.stringify(backward));

  assert.equal(backward.finite,true);
  assert.equal(backward.boundaryFrames,0);
  assert.equal(backward.hp,100);
  assert.equal(backward.bodyHits,0);
  assert.equal(backward.actionSerial,0);
  assert.equal(backward.result,"active");
});

test("O2 pursuit-speed envelope asks when K1 begins testing combat instead of escape",()=>{
  const deepWorld={
    width:8000,
    height:8000,
    inset:28,
    walls:[]
  };
  const playerStart={
    x:4000,
    y:4200,
    facing:-Math.PI/2
  };
  const threatStarts=[
    {id:"north",x:4000,y:3850,facing:Math.PI/2},
    {id:"north-east",x:4180,y:3920,facing:Math.PI*0.75},
    {id:"north-west",x:3820,y:3920,facing:Math.PI*0.25},
    {id:"east",x:4320,y:4120,facing:Math.PI}
  ];

  const ratios=[0.80,1.00,1.08,1.15,1.25];
  const result={};

  for(const ratio of ratios){
    const maxSpeed=O2_PLAYER_SPEC.maxSpeed*ratio;
    const threatSpec={
      ...O2_PRESSURE_SPEC,
      maxSpeed,
      acceleration:Math.max(
        O2_PRESSURE_SPEC.acceleration,
        maxSpeed*8
      )
    };
    const key="x"+ratio.toFixed(2);
    result[key]={
      speed:Number(maxSpeed.toFixed(1)),
      backward:runO2Policy("backward-kite",{
        seconds:12,
        world:deepWorld,
        playerStart,
        threatStarts,
        threatSpec
      }),
      mixed:runO2Policy("mixed-lane",{
        seconds:12,
        world:deepWorld,
        playerStart,
        threatStarts,
        threatSpec
      }),
      chase:runO2Policy("forward-chase",{
        seconds:12,
        world:deepWorld,
        playerStart,
        threatStarts,
        threatSpec
      })
    };
  }

  console.log("O2_PURSUIT_SPEED_SWEEP",JSON.stringify(result));

  for(const group of Object.values(result)){
    for(const value of [group.backward,group.mixed,group.chase]){
      assert.equal(value.finite,true);
      assert.equal(value.boundaryFrames,0);
    }
  }
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
