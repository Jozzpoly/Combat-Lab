import test from "node:test";
import assert from "node:assert/strict";
import {minimalReplanCellN1} from "../experiments/minimal-replan-cell-n1.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};

test("N1 experiment exposes no authored comparison controls and remains autonomous",()=>{
  const instance=minimalReplanCellN1.create();
  assert.deepEqual(instance.inspector.schema.groups,[]);
  assert.equal(instance.inspector.schema.comparison,undefined);
  assert.equal(instance.query("unknown"),null);
});

test("N1 experiment reaches target after exactly one bounded replan",()=>{
  const instance=minimalReplanCellN1.create();
  for(let i=0;i<1200;i++) instance.step(idle,1/120);
  const snap=instance.snapshot();

  assert.equal(snap.status,"ARRIVED");
  assert.equal(snap.replanAttempted,true);
  assert.equal(snap.replanCount,1);
  assert.equal(snap.witnessStatus,"witness");
  assert.ok(snap.replanAtTime>0.6);
  assert.ok(snap.goalDistance<=3);
});

test("N1 Reset World returns to the original unplanned state",()=>{
  const instance=minimalReplanCellN1.create();
  for(let i=0;i<500;i++) instance.step(idle,1/120);
  assert.equal(instance.snapshot().replanAttempted,true);

  instance.reset();
  const reset=instance.snapshot();
  assert.equal(reset.status,"MOVING");
  assert.equal(reset.planMode,"DIRECT");
  assert.equal(reset.replanAttempted,false);
  assert.equal(reset.replanCount,0);
  assert.equal(reset.witnessStatus,null);
  assert.deepEqual(reset.position,{x:180,y:300});
});

test("N1 causal query is a read-only explanation of current behavior",()=>{
  const instance=minimalReplanCellN1.create();
  for(let i=0;i<350;i++) instance.step(idle,1/120);
  const before=instance.snapshot();
  const causal=instance.query("causal-state");
  const after=instance.snapshot();

  assert.deepEqual(after,before);
  assert.equal(causal.schema,"combat-lab-minimal-replan-v0");
  assert.deepEqual(causal.purpose.target,{x:780,y:300});
  assert.ok(Number.isFinite(causal.factualProgress.goalDistance));
  assert.equal(typeof causal.replan.attempted,"boolean");
});
