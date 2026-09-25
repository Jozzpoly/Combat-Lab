import test from "node:test";
import assert from "node:assert/strict";
import {FixedStepRunner} from "../src/core/fixed-step.js";

test("fixed-step runner produces deterministic step counts",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  for (let i=0;i<10;i++) runner.advance(0.02,()=>steps++);
  assert.equal(steps,20);
});

test("fixed-step runner clamps pathological frame gaps",()=>{
  const runner=new FixedStepRunner({dt:0.01,maxFrame:0.05,maxAccum:0.10});
  let steps=0;
  const result=runner.advance(5,()=>steps++);
  assert.equal(steps,5);
  assert.equal(result.steps,5);
});
