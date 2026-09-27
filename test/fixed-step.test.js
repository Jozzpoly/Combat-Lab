import test from "node:test";
import assert from "node:assert/strict";
import {FixedStepRunner} from "../src/core/fixed-step.js";

test("fixed-step runner produces deterministic step counts",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  for (let i=0;i<10;i++) runner.advance(0.02,()=>steps++);
  assert.equal(steps,20);
});

test("fixed-step runner reports frame-clamp wall-time loss instead of hiding it",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  const result=runner.advance(5,()=>steps++);
  assert.equal(steps,5);
  assert.equal(result.steps,5);
  assert.equal(result.rawFrameSeconds,5);
  assert.equal(result.acceptedFrameSeconds,0.05);
  assert.equal(result.discardedFrameSeconds,4.95);
  assert.equal(result.discardedAccumulatorSeconds,0);
  assert.equal(result.discardedSeconds,4.95);
  assert.equal(result.simulatedSeconds,0.05);
});

test("fixed-step runner separately reports accumulator overflow",()=>{
  const runner=new FixedStepRunner({dt:0.05,maxFrame:0.10,maxAccum:0.10});
  runner.accumulator=0.08;
  const result=runner.advance(0.10,()=>{});
  assert.ok(Math.abs(result.discardedFrameSeconds)<1e-12);
  assert.ok(Math.abs(result.discardedAccumulatorSeconds-0.08)<1e-12);
  assert.ok(Math.abs(result.discardedSeconds-0.08)<1e-12);
  assert.equal(result.steps,2);
  assert.ok(Math.abs(result.simulatedSeconds-0.10)<1e-12);
});
