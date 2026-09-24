import test from "node:test";
import assert from "node:assert/strict";

import { requestCommit } from "../src/readiness.js";
import {
  createR1State,
  rusherAngle,
  stepR1
} from "../src/r1-sim.js";
import {
  runR1CrossedMatrix,
  runR1MaterialScaleSweep,
  runR1Policy,
  summarizeR1Matrix
} from "../src/r1-rehearsal.js";

test("R1 K0 mirrors readable committed pressure with no HP model",()=>{
  const east=createR1State({
    history:"free",
    side:"east"
  });
  const west=createR1State({
    history:"free",
    side:"west"
  });

  assert.equal(Object.hasOwn(east.player.body,"hp"),false);
  assert.equal(Object.hasOwn(east.rusher,"hp"),false);
  assert.equal(east.rusher.mode,"prepare");
  assert.equal(west.rusher.mode,"prepare");
  assert.equal(east.rusher.x,-west.rusher.x);
  assert.equal(east.rusher.y,west.rusher.y);
});

test("R1 K0 rusher captures dash direction once and does not re-home",()=>{
  const state=createR1State({
    history:"wall",
    side:"east",
    prepare:0.06
  });

  let guard=0;
  while(state.rusher.mode==="prepare"&&guard<30){
    stepR1(state,{
      moveX:0,moveY:0,
      bodyFacing:rusherAngle(state),
      commit:false
    },1/120);
    guard++;
  }

  assert.equal(state.rusher.mode,"commit");
  const cx=state.rusher.commitX;
  const cy=state.rusher.commitY;

  for(let i=0;i<8;i++){
    stepR1(state,{
      moveX:0,moveY:1,
      bodyFacing:rusherAngle(state),
      commit:false
    },1/120);
    if(state.rusher.mode==="commit"){
      assert.equal(state.rusher.commitX,cx);
      assert.equal(state.rusher.commitY,cy);
    }
  }
});

test("R1 K1 tool contact changes velocity without canceling committed dash state",()=>{
  const state=createR1State({
    history:"wall",
    side:"east",
    prepare:0
  });
  state.rusher.mode="commit";
  state.rusher.time=0.35;
  state.rusher.commitX=-1;
  state.rusher.commitY=0;
  state.rusher.vx=-220;
  state.rusher.vy=0;
  state.rusher.x=92;
  state.rusher.y=0;

  const angle=rusherAngle(state);
  state.player.weapon.angle=angle;
  state.player.weapon.angularVelocity=0;
  state.player.weapon.reach=86;
  requestCommit(state.player,angle);

  const before=state.rusher.vx;
  const events=stepR1(state,{
    moveX:0,moveY:0,
    bodyFacing:angle,
    guideAngle:angle,
    commit:false,
    commitAngle:angle
  },1/120,{materialScale:1});

  assert.ok(events.some(e=>e.type==="tool-contact"));
  assert.equal(state.rusher.mode,"commit");
  assert.ok(state.rusher.vx>before);
});

test("R1 K1 zero material displacement preserves contact event but not velocity consequence",()=>{
  const make=materialScale=>{
    const state=createR1State({
      history:"wall",
      side:"east",
      prepare:0
    });
    state.rusher.mode="commit";
    state.rusher.time=0.35;
    state.rusher.commitX=-1;
    state.rusher.commitY=0;
    state.rusher.vx=-220;
    state.rusher.vy=0;
    state.rusher.x=92;
    state.rusher.y=0;

    const angle=rusherAngle(state);
    state.player.weapon.angle=angle;
    state.player.weapon.angularVelocity=0;
    state.player.weapon.reach=86;
    requestCommit(state.player,angle);

    stepR1(state,{
      moveX:0,moveY:0,
      bodyFacing:angle,
      guideAngle:angle,
      commit:false,
      commitAngle:angle
    },1/120,{materialScale});

    return state.rusher.vx;
  };

  const material=make(1);
  const zero=make(0);

  assert.ok(material>zero+50);
});

test("R1 K2 exploratory crossed readiness matrix",()=>{
  const matrix=runR1CrossedMatrix({
    guideAuthority:0.38,
    prepare:0.32,
    commitLead:0.085,
    materialScale:1
  });
  const summary=summarizeR1Matrix(matrix);

  console.log("R1_CROSSED_MATRIX",JSON.stringify(summary));

  for(const sides of Object.values(matrix)){
    for(const policies of Object.values(sides)){
      for(const value of Object.values(policies)){
        assert.equal(value.finite,true);
      }
    }
  }

  // Movement remains a legal answer in at least one mirrored pulse.
  const lateral=[
    matrix.free.east["lateral-evade"],
    matrix.free.west["lateral-evade"],
    matrix.wall.east["lateral-evade"],
    matrix.wall.west["lateral-evade"]
  ];
  assert.ok(lateral.some(x=>x.result==="body-miss"));
});

test("R1 K2 broad material-authority sweep maps whether contact can change dash outcome",()=>{
  const sweep=runR1MaterialScaleSweep();
  console.log("R1_MATERIAL_SCALE_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.materialScale));
    assert.ok(row.bodyMisses>=0&&row.bodyMisses<=4);
    assert.ok(row.toolContactCells>=0&&row.toolContactCells<=4);
  }

  assert.equal(sweep[0].bodyMisses,0);
});

test("R1 K2 material-contact ablation can be compared without hidden parry cancellation",()=>{
  const material=runR1Policy({
    history:"wall",
    side:"east",
    policy:"immediate-commit",
    materialScale:1
  });
  const zero=runR1Policy({
    history:"wall",
    side:"east",
    policy:"immediate-commit",
    materialScale:0
  });

  console.log("R1_MATERIAL_ABLATION",JSON.stringify({material,zero}));

  assert.equal(material.finite,true);
  assert.equal(zero.finite,true);
});
