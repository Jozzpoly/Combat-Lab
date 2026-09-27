import test from "node:test";
import assert from "node:assert/strict";
import {
  createDynamicEncounterState,
  dynamicEncounterSnapshot,
  runDynamicEncounterTrial,
  stepDynamicEncounterState
} from "../src/research/dynamic-encounter.js";

test("D0 exact symmetric head-on conflict invents no side when no passing convention exists",()=>{
  const out=runDynamicEncounterTrial({passingSideA:0,passingSideB:0});

  assert.equal(out.status,"TRIAL_EXPIRED");
  assert.equal(out.actors.A.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(out.actors.B.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(out.actors.A.trigger?.partnerId,"B");
  assert.equal(out.actors.B.trigger?.partnerId,"A");
  assert.ok(out.actors.A.trigger?.noProgressFor>=0.45);
  assert.ok(out.actors.B.trigger?.noProgressFor>=0.45);
  assert.ok(out.actors.A.goalDistance>300);
  assert.ok(out.actors.B.goalDistance>300);
});

test("D0 shared left-of-travel convention resolves the symmetric encounter locally",()=>{
  const out=runDynamicEncounterTrial({passingSideA:1,passingSideB:1});

  assert.equal(out.status,"COMPLETE");
  assert.equal(out.actors.A.mode,"ARRIVED");
  assert.equal(out.actors.B.mode,"ARRIVED");
  assert.equal(out.actors.A.encounterCount,1);
  assert.equal(out.actors.B.encounterCount,1);
  assert.ok(out.firstContactTime>2);
  assert.ok(out.actors.A.trigger.time>=out.firstContactTime+0.4);
  assert.ok(out.actors.B.trigger.time>=out.firstContactTime+0.4);
});

test("D0 unilateral local yielding can resolve the encounter without reciprocal choreography",()=>{
  const out=runDynamicEncounterTrial({passingSideA:1,passingSideB:0});

  assert.equal(out.status,"COMPLETE");
  assert.equal(out.actors.A.encounterCount,1);
  assert.equal(out.actors.B.encounterCount,1);
  assert.equal(out.actors.A.trigger.passingSide,1);
  assert.equal(out.actors.B.trigger.passingSide,0);
});

test("D0 conflicting side conventions are allowed to fail rather than being secretly coordinated",()=>{
  const out=runDynamicEncounterTrial({passingSideA:1,passingSideB:-1});

  assert.equal(out.status,"TRIAL_EXPIRED");
  assert.notEqual(out.actors.A.mode,"ARRIVED");
  assert.notEqual(out.actors.B.mode,"ARRIVED");
  assert.equal(out.actors.A.encounterCount,1);
  assert.equal(out.actors.B.encounterCount,1);
});

test("D0 does not react on first contact; dynamic no-progress must persist",()=>{
  const state=createDynamicEncounterState({passingSideA:1,passingSideB:1});

  while(state.firstContactTime===null){
    stepDynamicEncounterState(state,1/120);
  }
  const atContact=dynamicEncounterSnapshot(state);
  assert.equal(atContact.actors.A.encounterAttempted,false);
  assert.equal(atContact.actors.B.encounterAttempted,false);

  for(let i=0;i<40;i++) stepDynamicEncounterState(state,1/120);
  const beforeThreshold=dynamicEncounterSnapshot(state);
  assert.equal(beforeThreshold.actors.A.encounterAttempted,false);

  for(let i=0;i<20;i++) stepDynamicEncounterState(state,1/120);
  const afterThreshold=dynamicEncounterSnapshot(state);
  assert.equal(afterThreshold.actors.A.encounterAttempted,true);
  assert.equal(afterThreshold.actors.B.encounterAttempted,true);
});

test("D0 causal snapshot keeps preferred motion, dynamic blocker and decision evidence inspectable",()=>{
  const state=createDynamicEncounterState({passingSideA:1,passingSideB:1});
  for(let i=0;i<370;i++) stepDynamicEncounterState(state,1/120);
  const snap=dynamicEncounterSnapshot(state);

  assert.equal(snap.schema,"combat-lab-dynamic-encounter-v0");
  assert.equal(snap.actors.A.trigger?.partnerId,"B");
  assert.equal(snap.actors.B.trigger?.partnerId,"A");
  assert.equal(snap.actors.A.trigger?.passingSide,1);
  assert.ok(Number.isFinite(snap.actors.A.goalDistance));
  assert.ok(Number.isFinite(snap.actors.A.desiredVelocity.x));
  assert.ok(Number.isFinite(snap.actors.A.desiredVelocity.y));
});
