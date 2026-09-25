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
  perturbationSweep,
  runSustainedContactSoak,
  pressReference
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


test("R3 press-medium reference leaves joint next-action history on both participants",()=>{
  const result=pressReference();
  console.log("R3_PRESS_REFERENCE",JSON.stringify({
    contact:result.contact,
    distance:result.distance,
    nextPathDelta:result.nextPathDelta
  }));

  assert.equal(result.finite,true);
  assert.equal(result.contact.separated,true);
  assert.ok(result.contact.maxDuration>=0.20);
  assert.ok(result.distance.a>0.30);
  assert.ok(result.distance.b>0.30);
  assert.ok(result.nextPathDelta.a>0.30);
  assert.ok(result.nextPathDelta.b>0.30);
});

test("R3 independent local neutralization collapses press-medium joint tool history",()=>{
  const sweep=resetDecaySweep();
  const start=sweep[0];
  const end=sweep.at(-1);

  assert.ok(start.distance.a>0.30);
  assert.ok(start.distance.b>0.30);
  assert.ok(end.distance.a<0.02);
  assert.ok(end.distance.b<0.02);
  assert.ok(end.nextPathDelta.a<0.02);
  assert.ok(end.nextPathDelta.b<0.02);
});

test("R3 long sustained manifold does not pump repeated impacts and releases through locomotion",()=>{
  const first=runSustainedContactSoak({
    holdSeconds:6,
    releaseSeconds:1.4,
    guideAuthority:0.48
  });
  const second=runSustainedContactSoak({
    holdSeconds:6,
    releaseSeconds:1.4,
    guideAuthority:0.48
  });

  console.log("R3_SOAK",JSON.stringify(first));

  assert.equal(first.finite,true);
  assert.equal(first.impacts,1);
  assert.ok(first.contactFrames>600);
  assert.ok(first.maxDuration>5);
  assert.ok(first.maxOmega<20);
  assert.equal(first.separated,true);
  assert.ok(first.releaseTime<1.4);
  assert.deepEqual(first,second);
});
