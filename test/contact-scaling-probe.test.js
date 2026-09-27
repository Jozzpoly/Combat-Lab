import test from "node:test";
import assert from "node:assert/strict";
import {runContactScalingProbe} from "../src/research/contact-scaling-probe.js";

test("P0 sparse scaling probe exposes exact naive all-pairs work",()=>{
  const result=runContactScalingProbe({
    count:12,
    steps:5,
    dense:false,
    now:(()=>{let n=0; return ()=>n+=2;})()
  });

  assert.equal(result.schema,"combat-lab-contact-scaling-probe-v0");
  assert.equal(result.naivePairsPerIteration,66);
  assert.equal(result.pairChecks,66*5);
  assert.equal(result.contactResolutions,0);
  assert.equal(result.solverIterations,5);
  assert.equal(result.durationMs,2);
});

test("P0 exact broad-phase work grows quadratically before any optimization",()=>{
  const small=runContactScalingProbe({count:12,steps:5,dense:false,now:()=>0});
  const large=runContactScalingProbe({count:24,steps:5,dense:false,now:()=>0});

  assert.equal(small.pairChecks,330);
  assert.equal(large.pairChecks,1380);
  assert.ok(large.pairChecks>small.pairChecks*4);
});

test("P0 dense probe distinguishes pair checks from actual contact resolutions",()=>{
  const result=runContactScalingProbe({count:12,steps:4,dense:true,now:()=>0});

  assert.ok(result.pairChecks>=result.naivePairsPerIteration*result.steps);
  assert.ok(result.contactResolutions>0);
  assert.ok(result.pairChecks>result.contactResolutions);
  assert.ok(result.solverIterations>=result.steps);
});

test("P0 wall timing is explicitly local evidence and may be zero",()=>{
  const result=runContactScalingProbe({count:8,steps:2,dense:false,now:()=>123});
  assert.equal(result.durationMs,0);
  assert.equal(result.pairChecks,28*2);
});
