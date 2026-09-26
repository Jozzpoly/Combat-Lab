import test from "node:test";
import assert from "node:assert/strict";
import {FixedStepRunner} from "../src/core/fixed-step.js";

test("fixed-step runner produces deterministic step counts",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  for (let i=0;i<10;i++) runner.advance(0.02,()=>steps++);
  assert.equal(steps,20);
});

test("fixed-step runner clamps pathological frame gaps and reports discarded wall time",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  const result=runner.advance(5,()=>steps++);
  assert.equal(steps,5);
  assert.equal(result.steps,5);
  assert.equal(result.rawFrame,5);
  assert.equal(result.acceptedFrame,0.05);
  assert.ok(Math.abs(result.droppedSeconds-4.95)<1e-12);
});

test("fixed-step runner reports accumulator protection separately through droppedSeconds",()=>{
  const runner=new FixedStepRunner({dt:0.1,maxFrame:0.5,maxAccum:0.2});
  let steps=0;
  const result=runner.advance(0.5,()=>steps++);
  assert.equal(steps,2);
  assert.ok(Math.abs(result.droppedSeconds-0.3)<1e-12);
  assert.ok(result.alpha<1);
});
