import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {RuntimePerformanceMeter} from "../src/core/runtime-performance.js";
import {
  COUNTERFLOW_SOLVER_ITERATION_LIMIT,
  counterflowTransitSnapshot,
  createCounterflowTransitState,
  stepCounterflowTransitState
} from "../src/research/counterflow-transit.js";
import {buildTransitScenarioContract} from "../src/research/transit-scenario-contract.js";
import {
  counterflowSubjectCausalDrilldown,
  createCounterflowCausalObserver,
  observeCounterflowCausalHealth,
  probeCounterflowCurrentContacts
} from "../src/research/counterflow-causal-observation.js";

const DT=1/120;

function scenario(eastbound,westbound){
  return buildTransitScenarioContract({
    demand:{eastbound,westbound},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });
}

function runObserved({
  eastbound=8,
  westbound=8,
  seconds=8,
  stateOptions={},
  observerOptions={}
}={}){
  const state=createCounterflowTransitState({
    scenario:scenario(eastbound,westbound),
    trialDuration:Math.max(seconds,0.1),
    ...stateOptions
  });
  const observer=createCounterflowCausalObserver(observerOptions);
  const steps=Math.ceil(seconds/DT);
  let observation=null;

  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepCounterflowTransitState(state,DT);
    const finalSample=(
      i===steps-1 ||
      state.status!=="RUNNING"
    );
    observation=observeCounterflowCausalHealth(
      observer,
      state,
      {
        currentContactProbe:finalSample
          ? probeCounterflowCurrentContacts(state)
          : null
      }
    );
  }

  if(observation===null){
    observation=observeCounterflowCausalHealth(
      observer,
      state,
      {currentContactProbe:probeCounterflowCurrentContacts(state)}
    );
  }
  return {state,observer,observation};
}

test("S1-3 macro observation keeps causal truth planes separate with no aggregate health score",()=>{
  const {observation}=runObserved({eastbound:4,westbound:4,seconds:1});

  assert.ok(observation.flow);
  assert.ok(observation.behavior);
  assert.ok(observation.contact);
  assert.ok(observation.solver);
  assert.ok(observation.runtime);
  assert.ok(observation.validity);
  assert.equal("health" in observation,false);
  assert.equal("healthScore" in observation,false);
  assert.equal("score" in observation,false);
  assert.equal("overallStatus" in observation,false);
  assert.equal(observation.runtime.available,false);
});

test("S1-3 clean moving control becomes progressing rather than falsely stalled",()=>{
  const {observation}=runObserved({
    eastbound:1,
    westbound:1,
    seconds:2,
    stateOptions:{
      westPortal:{x:100,y:140},
      eastPortal:{x:1100,y:260},
      trialDuration:4
    }
  });

  assert.equal(observation.flow.queued,0);
  assert.equal(observation.flow.active,2);
  assert.equal(observation.behavior.progressing.count,2);
  assert.equal(observation.behavior.stalled.count,0);
  assert.equal(observation.contact.currentGeometry.probe.contactPairCount,0);
});

test("S1-3 material jam can exist with zero source backlog",()=>{
  const {observation}=runObserved({
    eastbound:8,
    westbound:8,
    seconds:8
  });

  assert.equal(observation.flow.queued,0);
  assert.equal(observation.flow.active,16);
  assert.equal(observation.flow.completed,0);
  assert.ok(observation.behavior.stalled.count>0);
  assert.ok(observation.contact.currentGeometry.probe.contactPairCount>0);
  assert.equal(observation.validity.invalidAdmissionCount,0);
});

test("S1-3 higher demand exposes backlog and active congestion as distinct facts",()=>{
  const {observation}=runObserved({
    eastbound:32,
    westbound:32,
    seconds:8
  });

  assert.ok(observation.flow.queued>0);
  assert.ok(observation.flow.active>0);
  assert.equal(observation.flow.completed,0);
  assert.ok(observation.behavior.stalled.count>0);
  assert.ok(observation.contact.currentGeometry.probe.contactPairCount>0);
  assert.equal(observation.validity.demandedConserved,true);
  assert.equal(observation.validity.physicalLedgerActiveMatch,true);
  assert.equal(
    observation.flow.perSide.eastbound.queued,
    observation.flow.perSide.westbound.queued
  );
});

test("S1-3 residual solver penetration does not rewrite hard-valid admission truth",()=>{
  const {observation}=runObserved({
    eastbound:32,
    westbound:32,
    seconds:8
  });
  const probe=observation.contact.currentGeometry.probe;

  assert.equal(observation.validity.invalidAdmissionCount,0);
  assert.equal(observation.validity.breakMode,"ordinary-valid");
  assert.ok(probe.maxResidualPenetration>0,JSON.stringify(probe));
  assert.ok(probe.penetratingPairCount>0,JSON.stringify(probe));
});

test("S1-3 runtime evidence is independent from the same mechanical state",()=>{
  const state=createCounterflowTransitState({
    scenario:scenario(8,8),
    trialDuration:4
  });
  for(let i=0;i<240;i++) stepCounterflowTransitState(state,DT);

  const fast=new RuntimePerformanceMeter();
  fast.recordFrame({
    wallSeconds:0.016,
    simulatedSeconds:0.016,
    simulationMs:2,
    renderMs:2,
    observationMs:0.5
  });
  const slow=new RuntimePerformanceMeter();
  slow.recordFrame({
    wallSeconds:0.04,
    simulatedSeconds:0.016,
    discardedWallSeconds:0.024,
    simulationMs:9,
    renderMs:5,
    observationMs:2
  });

  const a=observeCounterflowCausalHealth(
    createCounterflowCausalObserver(),
    state,
    {runtimeSnapshot:fast.snapshot()}
  );
  const b=observeCounterflowCausalHealth(
    createCounterflowCausalObserver(),
    state,
    {runtimeSnapshot:slow.snapshot()}
  );

  for(const key of ["flow","behavior","contact","solver","validity"]){
    assert.deepEqual(a[key],b[key],key);
  }
  assert.notDeepEqual(a.runtime,b.runtime);
  assert.equal(a.runtime.snapshot.simulationToWallRatio,1);
  assert.ok(b.runtime.snapshot.simulationToWallRatio<1);
  assert.ok(b.runtime.snapshot.discardedWallSeconds>0);
});

test("S1-3 keeps current solver effort distinct from historical peak and recent saturation",()=>{
  const {observation}=runObserved({
    eastbound:32,
    westbound:32,
    seconds:8,
    observerOptions:{recentSolverSamples:120}
  });

  assert.equal(
    observation.solver.current.iterationLimit,
    COUNTERFLOW_SOLVER_ITERATION_LIMIT
  );
  assert.equal(
    observation.solver.historical.peakIterationsUsed,
    COUNTERFLOW_SOLVER_ITERATION_LIMIT
  );
  assert.ok(
    observation.solver.historical.recentSampleSaturationFraction>0
  );
  assert.ok(
    observation.solver.historical.recentSampleSaturationFraction<=1
  );
  assert.ok(
    observation.solver.historical.recentSampleCount<=120
  );
});

test("S1-3 suspicious cohort can drill into one active subject without global actor debug",()=>{
  const {observer,observation}=runObserved({
    eastbound:8,
    westbound:8,
    seconds:8
  });
  const geometryIds=new Set(
    observation.contact.currentGeometry.probe.contactingBodyIds
  );
  const selected=observation.behavior.stalled.ids
    .find(id=>geometryIds.has(id));
  assert.ok(selected,JSON.stringify(observation.behavior));

  const detail=counterflowSubjectCausalDrilldown(observer,selected);
  assert.equal(detail.subject.id,selected);
  assert.equal(detail.subject.progressState,"STALLED");
  assert.ok(["eastbound","westbound"].includes(detail.subject.side));
  assert.equal(detail.contact.currentGeometryAvailable,true);
  assert.ok(detail.contact.currentGeometryPartners.length>0);
});

test("S1-3 exact current-contact geometry remains an explicit O(n^2) probe rather than hidden always-on work",()=>{
  const state=createCounterflowTransitState({
    scenario:scenario(8,8),
    trialDuration:4
  });
  for(let i=0;i<240;i++) stepCounterflowTransitState(state,DT);

  const withoutProbe=observeCounterflowCausalHealth(
    createCounterflowCausalObserver(),
    state
  );
  assert.equal(withoutProbe.contact.currentGeometry.available,false);

  const probe=probeCounterflowCurrentContacts(state);
  assert.equal(
    probe.pairChecks,
    state.bodies.length*(state.bodies.length-1)/2
  );

  const withProbe=observeCounterflowCausalHealth(
    createCounterflowCausalObserver(),
    state,
    {currentContactProbe:probe}
  );
  assert.equal(withProbe.contact.currentGeometry.available,true);
  assert.equal(withProbe.contact.currentGeometry.probe.pairChecks,probe.pairChecks);
});

test("S1-3 observer and probe do not mutate transit mechanics or acquire behavior authority",()=>{
  const state=createCounterflowTransitState({
    scenario:scenario(12,12),
    trialDuration:4
  });
  for(let i=0;i<180;i++) stepCounterflowTransitState(state,DT);
  const before=counterflowTransitSnapshot(state);

  const observer=createCounterflowCausalObserver();
  const probe=probeCounterflowCurrentContacts(state);
  observeCounterflowCausalHealth(observer,state,{currentContactProbe:probe});

  assert.deepEqual(counterflowTransitSnapshot(state),before);

  const source=fs.readFileSync(
    new URL("../src/research/counterflow-causal-observation.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/stepContactWorld|tryAdmitCounterflowSide/);
  assert.doesNotMatch(source,/desiredVelocity\s*=/);
  assert.doesNotMatch(source,/dynamic-encounter|SIDESTEP|passingSide/);
  assert.doesNotMatch(source,/findStaticRouteWitness|route-execution/);
  assert.doesNotMatch(source,/personal.?space|comfort.?radius/i);
  assert.doesNotMatch(source,/healthScore|overallStatus/);
});
