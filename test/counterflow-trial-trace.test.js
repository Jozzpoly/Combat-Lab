import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {buildTransitScenarioContract} from "../src/research/transit-scenario-contract.js";
import {
  COUNTERFLOW_TRIAL_COMPARISON_SCHEMA,
  compareCounterflowTrialTraces,
  runCounterflowTracedTrial
} from "../src/research/counterflow-trial-trace.js";

function scenario(eastbound,westbound){
  return buildTransitScenarioContract({
    demand:{eastbound,westbound},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });
}

function run(eastbound,westbound,options={}){
  return runCounterflowTracedTrial({
    trialId:options.trialId || eastbound+"x"+westbound,
    stateOptions:{
      scenario:scenario(eastbound,westbound),
      trialDuration:options.trialDuration ?? 8
    },
    traceOptions:{
      sampleInterval:options.sampleInterval ?? 0.25,
      maxSamples:options.maxSamples ?? 64
    }
  });
}

test("S1-4 trace keeps authored setup separate from temporal outcome",()=>{
  const low=run(8,8,{trialId:"low"});
  const high=run(32,32,{trialId:"high"});
  const comparison=compareCounterflowTrialTraces(low,high);

  assert.equal(comparison.schema,COUNTERFLOW_TRIAL_COMPARISON_SCHEMA);
  assert.deepEqual(
    comparison.setup.authoredDifferences.map(diff=>diff.path),
    ["scenario.demand.eastbound","scenario.demand.westbound"]
  );
  assert.deepEqual(comparison.setup.apparatusDifferences,[]);
  assert.ok(
    comparison.outcome.differences.some(
      diff=>diff.path==="final.flow.queued" && diff.after>diff.before
    ),
    JSON.stringify(comparison.outcome.differences)
  );
  assert.ok(
    comparison.outcome.differences.some(
      diff=>diff.path==="aggregate.maxActive" && diff.after>diff.before
    ),
    JSON.stringify(comparison.outcome.differences)
  );
});

test("S1-4 temporal samples are bounded, monotonic and explicit about sampling cadence",()=>{
  const trace=run(8,8,{
    trialDuration:8,
    sampleInterval:0.25,
    maxSamples:64
  });

  assert.equal(trace.sampling.sampleInterval,0.25);
  assert.equal(trace.sampling.maxSamples,64);
  assert.equal(trace.sampling.truncated,false);
  assert.ok(trace.samples.length>20);
  assert.ok(trace.samples.length<=64);
  for(let i=1;i<trace.samples.length;i++){
    assert.ok(trace.samples[i].time>trace.samples[i-1].time);
    assert.ok(
      Math.abs((trace.samples[i].time-trace.samples[i-1].time)-0.25)<1e-7,
      JSON.stringify([trace.samples[i-1].time,trace.samples[i].time])
    );
  }
});

test("S1-4 sample-budget exhaustion is visible and final truth is still retained",()=>{
  const trace=run(32,32,{
    trialDuration:8,
    sampleInterval:0.1,
    maxSamples:3
  });

  assert.equal(trace.samples.length,3);
  assert.equal(trace.sampling.storedSamples,3);
  assert.equal(trace.sampling.truncated,true);
  assert.ok(Number.isFinite(trace.sampling.budgetExhaustedAt));
  assert.ok(trace.aggregate.observationCount>trace.samples.length);
  assert.ok(trace.final);
  assert.ok(Math.abs(trace.final.time-trace.setup.authored.trialDuration)<1e-9);
  assert.equal(trace.final.validity.demandedConserved,true);
});

test("S1-4 exact extreme demand remains setup truth even when physical admission is much lower",()=>{
  const trace=runCounterflowTracedTrial({
    trialId:"extreme",
    stateOptions:{
      scenario:scenario(256,256),
      trialDuration:2
    },
    traceOptions:{
      sampleInterval:0.25,
      maxSamples:32
    }
  });

  assert.equal(trace.setup.authored.scenario.demand.eastbound,256);
  assert.equal(trace.setup.authored.scenario.demand.westbound,256);
  assert.equal(trace.final.flow.demanded,512);
  assert.ok(trace.final.flow.queued>400,JSON.stringify(trace.final.flow));
  assert.equal(trace.final.validity.demandedConserved,true);
  assert.equal(trace.aggregate.invalidAdmissionMax,0);
  assert.equal(trace.aggregate.activeParityFailureCount,0);
});

test("S1-4 low and high pressure traces preserve the actual temporal distinction",()=>{
  const low=run(8,8,{trialId:"low"});
  const high=run(32,32,{trialId:"high"});

  assert.equal(low.final.flow.queued,0);
  assert.ok(high.final.flow.queued>0,JSON.stringify(high.final.flow));
  assert.ok(high.aggregate.maxActive>low.aggregate.maxActive);
  assert.ok(high.aggregate.maxStalled>=low.aggregate.maxStalled);
  assert.ok(high.aggregate.maxContactResolutions>=low.aggregate.maxContactResolutions);
  assert.equal(low.aggregate.demandConservationFailureCount,0);
  assert.equal(high.aggregate.demandConservationFailureCount,0);
});

test("S1-4 comparison reports apparatus differences separately from authored experiment differences",()=>{
  const a=runCounterflowTracedTrial({
    trialId:"A",
    stateOptions:{scenario:scenario(8,8),trialDuration:4},
    observerOptions:{stallSeconds:0.5},
    traceOptions:{sampleInterval:0.25,maxSamples:32}
  });
  const b=runCounterflowTracedTrial({
    trialId:"B",
    stateOptions:{scenario:scenario(8,8),trialDuration:4},
    observerOptions:{stallSeconds:0.75},
    traceOptions:{sampleInterval:0.5,maxSamples:16}
  });

  const comparison=compareCounterflowTrialTraces(a,b);
  assert.deepEqual(comparison.setup.authoredDifferences,[]);
  assert.deepEqual(
    comparison.setup.apparatusDifferences.map(diff=>diff.path),
    ["observer","trace.sampleInterval","trace.maxSamples"]
  );
});

test("S1-4 captured setup and returned snapshots are immutable copies of authored inputs",()=>{
  const authoredScenario=scenario(8,8);
  const trace=runCounterflowTracedTrial({
    trialId:"copy",
    stateOptions:{scenario:authoredScenario,trialDuration:2}
  });

  authoredScenario.demand.eastbound=999;
  assert.equal(trace.setup.authored.scenario.demand.eastbound,8);
  assert.equal(trace.final.flow.demanded,16);
});

test("S1-4 comparison is descriptive evidence and contains no aggregate verdict or causal claim",()=>{
  const comparison=compareCounterflowTrialTraces(
    run(8,8,{trialId:"A",trialDuration:4}),
    run(32,32,{trialId:"B",trialDuration:4})
  );

  assert.equal("winner" in comparison,false);
  assert.equal("score" in comparison,false);
  assert.equal("verdict" in comparison,false);
  assert.equal("cause" in comparison,false);
  assert.equal("causalConclusion" in comparison,false);
});

test("S1-4 trace remains macro-only and adds no geometry probe or behavior authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/counterflow-trial-trace.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/probeCounterflowCurrentContacts/);
  assert.doesNotMatch(source,/for\s*\([^)]*state\.bodies/);
  assert.doesNotMatch(source,/desiredVelocity\s*=/);
  assert.doesNotMatch(source,/SIDESTEP|passingSide|dynamic-encounter/);
  assert.doesNotMatch(source,/findStaticRouteWitness|route-execution/);
  assert.doesNotMatch(source,/personal.?space|comfort.?radius/i);
});
