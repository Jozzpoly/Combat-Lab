import test from "node:test";
import assert from "node:assert/strict";

import { createE0State, stepE0 } from "../src/sim.js";
import { runE0Policy } from "../src/rehearsal.js";

test("E0 has mirrored access roles with no HP authority",()=>{
  const deny=createE0State({role:"deny"});
  const breach=createE0State({role:"breach"});

  assert.equal(Object.hasOwn(deny.player,"hp"),false);
  assert.equal(Object.hasOwn(deny.adversary,"hp"),false);
  assert.equal(deny.world.accessY,breach.world.accessY);
  assert.ok(deny.player.y>deny.adversary.y);
  assert.ok(breach.player.y<breach.adversary.y);
});

test("E0 DRIVE keeps locomotion live and captures contact direction",()=>{
  const state=createE0State({role:"breach"});
  const startY=state.player.y;

  for(let i=0;i<20;i++){
    stepE0(state,{
      moveX:0,
      moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:i===0
    },1/120);
  }

  assert.ok(state.player.y>startY);
  assert.equal(state.player.action.mode,"commit");
  const cx=state.player.action.commitX;
  const cy=state.player.action.commitY;

  for(let i=0;i<6;i++){
    stepE0(state,{
      moveX:1,
      moveY:0,
      aimX:state.adversary.x+300,
      aimY:state.adversary.y,
      drive:false
    },1/120);
    if(state.player.action.mode==="commit"){
      assert.equal(state.player.action.commitX,cx);
      assert.equal(state.player.action.commitY,cy);
    }
  }
});

test("E0 simultaneous DRIVE contacts are measured before consequence",()=>{
  const state=createE0State({role:"breach"});
  state.player.x=600;
  state.player.y=420;
  state.player.facing=Math.PI/2;
  state.adversary.x=600;
  state.adversary.y=470;
  state.adversary.facing=-Math.PI/2;

  for(const actor of [state.player,state.adversary]){
    actor.action.mode="commit";
    actor.action.time=0.10;
    actor.action.commitX=0;
    actor.action.commitY=actor.id==="player"?1:-1;
    actor.action.contactResolved=false;
  }

  const events=stepE0(state,{
    moveX:0,moveY:0,
    aimX:state.adversary.x,
    aimY:state.adversary.y,
    drive:false
  },1/240);

  assert.ok(events.filter(e=>e.type==="drive-contact").length>=2);
  assert.equal(state.player.action.contactResolved,true);
  assert.equal(state.adversary.action.contactResolved,true);
  assert.ok(Math.abs(state.player.vy)>1);
  assert.ok(Math.abs(state.adversary.vy)>1);
  assert.ok(state.player.vy<0);
  assert.ok(state.adversary.vy>0);
});

test("E0 exploratory mirrored policy matrix remains finite and boundary-independent",()=>{
  const cases=[
    ["deny","static-block"],
    ["deny","meet-drive"],
    ["deny","lateral-track"],
    ["deny","retreat"],
    ["deny","orbit"],
    ["deny","mash"],
    ["breach","direct-mash"],
    ["breach","angle-left"],
    ["breach","angle-right"],
    ["breach","yield-reset"],
    ["breach","retreat"],
    ["breach","no-drive-direct"]
  ];
  const result={};

  for(const [role,policy] of cases){
    const key=role+":"+policy;
    result[key]=runE0Policy({role,policy});
  }

  console.log("E0_EXPLORATORY_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
    assert.equal(value.boundaryFrames,0);
  }

  assert.equal(result["breach:retreat"].result,"blocked");
  assert.ok(result["deny:retreat"].accessMargin<120);
});

test("E0 blind mash and captured-direction falsifier sweep lateral starts",()=>{
  const offsets=[-300,-180,-90,0,90,180,300];
  const result={
    denyMash:[],
    breachMash:[],
    breachCaptured:[],
    breachHoming:[]
  };

  for(const offset of offsets){
    const playerX=600-offset/2;
    const adversaryX=600+offset/2;

    result.denyMash.push(runE0Policy({
      role:"deny",
      policy:"mash",
      playerX,
      adversaryX
    }));

    result.breachMash.push(runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerX,
      adversaryX
    }));

    result.breachCaptured.push(runE0Policy({
      role:"breach",
      policy:"angle-left",
      playerX,
      adversaryX,
      playerHomingDrive:false
    }));

    result.breachHoming.push(runE0Policy({
      role:"breach",
      policy:"angle-left",
      playerX,
      adversaryX,
      playerHomingDrive:true
    }));
  }

  const summary={
    offsets,
    denyMashHeld:result.denyMash.filter(x=>x.result==="held").length,
    breachMashCrossed:result.breachMash.filter(x=>x.result==="crossed").length,
    capturedCrossed:result.breachCaptured.filter(x=>x.result==="crossed").length,
    homingCrossed:result.breachHoming.filter(x=>x.result==="crossed").length,
    capturedTimes:result.breachCaptured.map(x=>x.time),
    homingTimes:result.breachHoming.map(x=>x.time),
    denyBoundary:result.denyMash.reduce((n,x)=>n+x.boundaryFrames,0),
    breachBoundary:result.breachMash.reduce((n,x)=>n+x.boundaryFrames,0)
  };

  console.log("E0_LATERAL_START_SWEEP",JSON.stringify(summary));

  for(const group of Object.values(result)){
    for(const value of group){
      assert.equal(value.finite,true);
    }
  }
  assert.equal(summary.denyBoundary,0);
  assert.equal(summary.breachBoundary,0);
});

test("E0 matched player DRIVE ablations keep defender authority constant",()=>{
  const variants={
    normal:runE0Policy({
      role:"breach",
      policy:"direct-mash"
    }),
    playerNoDrive:runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerDriveEnabled:false
    }),
    playerNoCarry:runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerCarryScale:0
    }),
    playerNoDisplacement:runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerDisplacementScale:0
    }),
    playerHoming:runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerHomingDrive:true
    }),
    playerNoRecovery:runE0Policy({
      role:"breach",
      policy:"direct-mash",
      playerRecoveryScale:0
    })
  };

  console.log("E0_MATCHED_DRIVE_ABLATIONS",JSON.stringify(variants));

  for(const value of Object.values(variants)){
    assert.equal(value.finite,true);
    assert.equal(value.boundaryFrames,0);
  }

  assert.equal(variants.normal.result,"crossed");
  assert.equal(variants.playerNoDrive.result,"blocked");
  assert.ok(variants.normal.playerContacts>0);
  assert.equal(variants.playerNoDrive.playerContacts,0);
});

