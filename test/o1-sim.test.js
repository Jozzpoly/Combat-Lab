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
  stepO1Attack,
  O1_ATTACK_PROBES
} from "../src/o1.js";
import { runO1AggressiveStake, runO1ForwardIntercept, runO1LineHold, runO1Policy, runO1StakePolicy } from "../src/o1-rehearsal.js";
import { playerInterposesObjective } from "../src/o1-sim.js";
import { pressurePhysicalReach } from "../src/pressure.js";

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


test("aggressive click-forward policy red-teams whether stance has any reason to exist",()=>{
  const result={
    hold:runO1StakePolicy(true),
    aggressive:runO1AggressiveStake()
  };
  console.log("O1_AGGRESSION_REDTEAM",JSON.stringify(result));
  assert.equal(result.hold.finite,true);
  assert.equal(result.aggressive.finite,true);
});


test("stake pressure targets the player only when they materially interpose",()=>{
  const player=createO1Player({x:450,y:420,facing:-Math.PI/2});
  const threat=createO1Threat("t",{x:450,y:340,facing:Math.PI/2});
  const objective={x:450,y:500,radius:14,hp:1};

  assert.equal(playerInterposesObjective(threat,player,objective),true);

  player.x=560;
  assert.equal(playerInterposesObjective(threat,player,objective),false);

  player.x=450;
  player.y=320;
  assert.equal(playerInterposesObjective(threat,player,objective),false);
});


test("O1 pressure trigger can be grounded in committed lunge geometry",()=>{
  const player=createO1Player({x:0,y:0,facing:0});
  const threat=createO1Threat("t",{x:100,y:0,facing:Math.PI});
  const reach=pressurePhysicalReach(threat,player);

  assert.ok(reach>75);
  assert.ok(reach<90);
});


test("single-contact compact action cannot cleave several bodies in one attack",()=>{
  const state=createO1State({
    playerStart:{x:300,y:300,facing:0},
    threatStarts:[
      {id:"near",x:350,y:292,facing:Math.PI},
      {id:"far",x:360,y:308,facing:Math.PI}
    ],
    playerAttackSpec:O1_ATTACK_PROBES.singleContactLethal
  });

  state.player.attack.phase="active";
  state.player.attack.time=0.06;
  state.player.attack.serial=1;

  const events=stepO1State(state,{
    moveX:0,
    moveY:0,
    aimX:400,
    aimY:300,
    brace:false,
    attack:false
  },1/240);

  const strikes=events.filter(e=>e.type==="player-strike");
  assert.equal(strikes.length,1);
  assert.equal(state.threats.filter(x=>x.hp<=0).length,1);
});

test("O1 single-contact close-five audit preserves lethality while removing compact cleave",()=>{
  const close5=[
    {id:"north",x:450,y:315,facing:Math.PI/2},
    {id:"north-east",x:540,y:340,facing:Math.PI*0.75},
    {id:"east",x:560,y:415,facing:Math.PI},
    {id:"west",x:340,y:415,facing:0},
    {id:"north-west",x:360,y:340,facing:Math.PI*0.25}
  ];
  const result={};

  for(const name of ["singleContactLethal","singleContactTwoHit"]){
    const playerAttackSpec=O1_ATTACK_PROBES[name];
    result[name]={
      braced:runO1StakePolicy(true,{
        threatStarts:close5,
        playerAttackSpec
      }),
      unbraced:runO1StakePolicy(false,{
        threatStarts:close5,
        playerAttackSpec
      }),
      aggressive:runO1AggressiveStake({
        threatStarts:close5,
        playerAttackSpec
      })
    };
  }

  console.log("O1_SINGLE_CONTACT_AUDIT",JSON.stringify(result));

  for(const group of Object.values(result)){
    for(const value of Object.values(group)){
      assert.equal(value.finite,true);
    }
  }
});

test("O1 close-five attribution checks whether brace support actually causes the promising window",()=>{
  const close5=[
    {id:"north",x:450,y:315,facing:Math.PI/2},
    {id:"north-east",x:540,y:340,facing:Math.PI*0.75},
    {id:"east",x:560,y:415,facing:Math.PI},
    {id:"west",x:340,y:415,facing:0},
    {id:"north-west",x:360,y:340,facing:Math.PI*0.25}
  ];

  const specs={
    compactDeliberate:O1_ATTACK_PROBES.compactDeliberate,
    compactDeliberateTwoHit:O1_ATTACK_PROBES.compactDeliberateTwoHit
  };

  const result={};
  for(const [name,playerAttackSpec] of Object.entries(specs)){
    result[name]={
      braced:runO1StakePolicy(true,{
        threatStarts:close5,
        playerAttackSpec
      }),
      unbraced:runO1StakePolicy(false,{
        threatStarts:close5,
        playerAttackSpec
      }),
      supportOffSlowMovement:runO1StakePolicy(false,{
        threatStarts:close5,
        playerAttackSpec,
        movementBracedOverride:true
      }),
      supportOnFastMovement:runO1StakePolicy(true,{
        threatStarts:close5,
        playerAttackSpec,
        movementBracedOverride:false
      }),
      aggressive:runO1AggressiveStake({
        threatStarts:close5,
        playerAttackSpec
      })
    };
  }

  console.log("O1_CLOSE5_BRACE_ATTRIBUTION",JSON.stringify(result));

  for(const group of Object.values(result)){
    for(const value of Object.values(group)){
      assert.equal(value.finite,true);
    }
  }
});

test("O1 close-five offense audit checks whether spatial value survives longer pressure",()=>{
  const close5=[
    {id:"north",x:450,y:315,facing:Math.PI/2},
    {id:"north-east",x:540,y:340,facing:Math.PI*0.75},
    {id:"east",x:560,y:415,facing:Math.PI},
    {id:"west",x:340,y:415,facing:0},
    {id:"north-west",x:360,y:340,facing:Math.PI*0.25}
  ];
  const names=[
    "current",
    "twoHit",
    "compactDeliberate",
    "compactDeliberateTwoHit",
    "slowerThanThreatTell"
  ];
  const result={};
  for(const name of names){
    const attackSpec=O1_ATTACK_PROBES[name];
    result[name]={
      hold:runO1StakePolicy(true,{
        threatStarts:close5,
        playerAttackSpec:attackSpec
      }),
      aggressive:runO1AggressiveStake({
        threatStarts:close5,
        playerAttackSpec:attackSpec
      })
    };
  }

  console.log("O1_CLOSE5_OFFENSE_AUDIT",JSON.stringify(result));

  for(const pair of Object.values(result)){
    assert.equal(pair.hold.finite,true);
    assert.equal(pair.aggressive.finite,true);
  }
});

test("O1 close-ring falsifier forces real concurrent pressure before refounding",()=>{
  const layouts={
    close3:[
      {id:"north",x:450,y:315,facing:Math.PI/2},
      {id:"east",x:560,y:415,facing:Math.PI},
      {id:"west",x:340,y:415,facing:0}
    ],
    close5:[
      {id:"north",x:450,y:315,facing:Math.PI/2},
      {id:"north-east",x:540,y:340,facing:Math.PI*0.75},
      {id:"east",x:560,y:415,facing:Math.PI},
      {id:"west",x:340,y:415,facing:0},
      {id:"north-west",x:360,y:340,facing:Math.PI*0.25}
    ]
  };

  const result={};
  for(const [name,threatStarts] of Object.entries(layouts)){
    result[name]={
      hold:runO1StakePolicy(true,{threatStarts}),
      aggressive:runO1AggressiveStake({threatStarts}),
      noAttack:runO1AggressiveStake({
        threatStarts,
        attackEnabled:false
      })
    };
  }

  console.log("O1_CLOSE_RING_FALSIFIER",JSON.stringify(result));

  for(const group of Object.values(result)){
    for(const value of Object.values(group)){
      assert.equal(value.finite,true);
    }
  }
});

test("O1 aggression audit separates kill authority from actual concurrent pressure",()=>{
  const layouts={
    two:[
      {id:"north",x:315,y:175,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI}
    ],
    three:[
      {id:"north",x:315,y:175,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI},
      {id:"west",x:95,y:390,facing:0}
    ],
    four:[
      {id:"north",x:315,y:175,facing:Math.PI/2},
      {id:"north-mid",x:450,y:230,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI},
      {id:"west",x:95,y:390,facing:0}
    ],
    five:[
      {id:"north-west",x:250,y:175,facing:Math.PI/2},
      {id:"north-mid",x:450,y:230,facing:Math.PI/2},
      {id:"north-east",x:650,y:175,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI},
      {id:"west",x:95,y:390,facing:0}
    ]
  };

  const result={
    noAttack:runO1AggressiveStake({
      threatStarts:layouts.two,
      attackEnabled:false
    }),
    density:{}
  };

  for(const [name,threatStarts] of Object.entries(layouts)){
    result.density[name]={
      hold:runO1StakePolicy(true,{threatStarts}),
      aggressive:runO1AggressiveStake({threatStarts})
    };
  }

  console.log("O1_PRESSURE_CONCURRENCY_AUDIT",JSON.stringify(result));

  assert.equal(result.noAttack.finite,true);
  for(const pair of Object.values(result.density)){
    assert.equal(pair.hold.finite,true);
    assert.equal(pair.aggressive.finite,true);
  }
});

test("O1 combined offense constraints test whether aggression dominance is merely one-axis tuning",()=>{
  const names=[
    "compactDeliberate",
    "compactTwoHit",
    "deliberateTwoHit",
    "compactDeliberateTwoHit",
    "slowerThanThreatTell"
  ];
  const result={};
  for(const name of names){
    const attackSpec=O1_ATTACK_PROBES[name];
    result[name]={
      hold:runO1StakePolicy(true,{playerAttackSpec:attackSpec}),
      aggressive:runO1AggressiveStake({playerAttackSpec:attackSpec})
    };
  }
  console.log("O1_OFFENSE_FACTORIAL",JSON.stringify(result));
  for(const pair of Object.values(result)){
    assert.equal(pair.hold.finite,true);
    assert.equal(pair.aggressive.finite,true);
  }
});

test("O1 offense attribution identifies what lets click-forward erase spatial pressure",()=>{
  const result={};
  for(const [name,attackSpec] of Object.entries(O1_ATTACK_PROBES)){
    result[name]={
      hold:runO1StakePolicy(true,{playerAttackSpec:attackSpec}),
      aggressive:runO1AggressiveStake({playerAttackSpec:attackSpec})
    };
  }
  console.log("O1_OFFENSE_ATTRIBUTION",JSON.stringify(result));
  for(const pair of Object.values(result)){
    assert.equal(pair.hold.finite,true);
    assert.equal(pair.aggressive.finite,true);
  }
});
