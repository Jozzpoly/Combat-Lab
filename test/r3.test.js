import test from "node:test";
import assert from "node:assert/strict";

import {
  createState,
  driveActor,
  requestCommit,
  setGuide,
  stepState
} from "../src/r3.js";
import {
  compareContactGhost,
  contactFamilySweep,
  resetDecaySweep,
  mirroredContactCheck,
  perturbationSweep
} from "../src/r3-rehearsal.js";

test("R3 bodies remain ordinarily responsive while tools commit",()=>{
  const state=createState();
  setGuide(state.a,-0.72);
  requestCommit(state.a,-0.72);

  for(let i=0;i<24;i++){
    stepState(state,{
      dt:1/120,
      guideAuthority:0.48,
      contactEnabled:false,
      aMoveX:1,
      aMoveY:0
    });
  }

  assert.ok(state.a.x>-35);
  assert.ok(state.a.vx>140);
});

test("R3 apparatus produces genuine multi-frame shared tool contact and separation",()=>{
  const result=compareContactGhost({
    yOffset:0,
    guideAuthority:0.48
  });

  console.log("R3_BASELINE",JSON.stringify(result));

  assert.equal(result.finite,true);
  assert.ok(result.contact.impacts>=1);
  assert.ok(result.contact.frames>=2);
  assert.ok(result.contact.maxDuration>=2/120);
  assert.equal(result.contact.separated,true);
  assert.ok(result.historyDuration<1.6);
});

test("R3 exploratory contact family sweep stays finite",()=>{
  const result=contactFamilySweep();
  console.log("R3_CONTACT_FAMILY",JSON.stringify(result.map(x=>({
    label:x.label,
    family:x.result.family,
    yOffset:x.result.yOffset,
    hold:x.result.pressHoldSeconds,
    impacts:x.result.contact.impacts,
    frames:x.result.contact.frames,
    duration:x.result.contact.maxDuration,
    separated:x.result.contact.separated,
    distance:x.result.distance,
    nextPathDelta:x.result.nextPathDelta
  }))));

  for(const row of result){
    assert.equal(row.result.finite,true);
  }
});

test("R3 exploratory tiny perturbation sweep stays finite",()=>{
  const result=perturbationSweep();
  console.log("R3_PERTURBATION",JSON.stringify(result.map(x=>({
    yOffset:x.yOffset,
    frames:x.contact.frames,
    duration:x.contact.maxDuration,
    distance:x.distance,
    nextPathDelta:x.nextPathDelta
  }))));

  for(const row of result){
    assert.equal(row.finite,true);
  }
});

test("R3 independent local reset decay is mapped rather than assumed",()=>{
  const result=resetDecaySweep();
  console.log("R3_RESET_DECAY",JSON.stringify(result));

  for(const row of result){
    assert.ok(Number.isFinite(row.distance.a));
    assert.ok(Number.isFinite(row.distance.b));
  }
});

test("R3 mirrored contact remains finite without one-side implementation authority",()=>{
  const result=mirroredContactCheck();
  console.log("R3_MIRROR",JSON.stringify({
    left:{
      distance:result.left.distance,
      nextPathDelta:result.left.nextPathDelta
    },
    right:{
      distance:result.right.distance,
      nextPathDelta:result.right.nextPathDelta
    }
  }));

  assert.equal(result.left.finite,true);
  assert.equal(result.right.finite,true);
});
