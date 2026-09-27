import test from "node:test";
import assert from "node:assert/strict";
import {dynamicEncounterCellD0} from "../experiments/dynamic-encounter-cell-d0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};

function stepFor(instance,seconds){
  for(let i=0;i<Math.ceil(seconds*120);i++) instance.step(idle,1/120);
}

test("D0 experiment defaults to honest no-convention hold rather than an invisible side choice",()=>{
  const instance=dynamicEncounterCellD0.create();
  stepFor(instance,3.2);
  const snap=instance.snapshot();

  assert.equal(snap.actors.A.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(snap.actors.B.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(instance.inspector.get("aPassingSide"),0);
  assert.equal(instance.inspector.get("bPassingSide"),0);
});

test("D0 matched reset with shared LEFT convention reaches both targets",()=>{
  const instance=dynamicEncounterCellD0.create();
  instance.inspector.set("aPassingSide",1);
  instance.inspector.set("bPassingSide",1);
  instance.reset();
  stepFor(instance,7);

  const snap=instance.snapshot();
  assert.equal(snap.status,"COMPLETE");
  assert.equal(snap.actors.A.mode,"ARRIVED");
  assert.equal(snap.actors.B.mode,"ARRIVED");
  assert.equal(snap.actors.A.trigger?.passingSide,1);
  assert.equal(snap.actors.B.trigger?.passingSide,1);
});

test("D0 Reset World preserves authored local conventions",()=>{
  const instance=dynamicEncounterCellD0.create();
  instance.inspector.set("aPassingSide",1);
  instance.inspector.set("bPassingSide",-1);
  stepFor(instance,1);
  instance.reset();

  assert.equal(instance.inspector.get("aPassingSide"),1);
  assert.equal(instance.inspector.get("bPassingSide"),-1);
  assert.equal(instance.snapshot().time,0);
});

test("D0 causal query is observational and exposes dynamic partner evidence",()=>{
  const instance=dynamicEncounterCellD0.create();
  instance.inspector.set("aPassingSide",1);
  instance.inspector.set("bPassingSide",1);
  instance.reset();
  stepFor(instance,3.2);

  const before=instance.snapshot();
  const causal=instance.query("dynamic-encounter-causal");
  const after=instance.snapshot();

  assert.deepEqual(after,before);
  assert.equal(causal.actors.A.trigger?.partnerId,"B");
  assert.equal(causal.actors.B.trigger?.partnerId,"A");
  assert.equal(causal.actors.A.encounterCount,1);
  assert.equal(causal.actors.B.encounterCount,1);
});
