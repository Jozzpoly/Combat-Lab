import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {buildTransitScenarioContract} from "../src/research/transit-scenario-contract.js";
import {
  auditCounterflowPortal,
  counterflowTransitSnapshot,
  createCounterflowTransitState,
  runCounterflowTransitTrial,
  stepCounterflowTransitState,
  tryAdmitCounterflowSide
} from "../src/research/counterflow-transit.js";

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

test("S1-2B both physical sources admit only from hard-clear portals",()=>{
  const state=createCounterflowTransitState({
    scenario:scenario(3,3),
    trialDuration:4
  });

  const east=tryAdmitCounterflowSide(state,"eastbound");
  const west=tryAdmitCounterflowSide(state,"westbound");
  assert.ok(east);
  assert.ok(west);

  const snap=counterflowTransitSnapshot(state);
  assert.deepEqual(snap.ledger.totals,{
    demanded:6,queued:4,active:2,completed:0
  });
  assert.equal(snap.physicalActiveCount,2);
  assert.equal(snap.admissionHistory.length,2);
  assert.deepEqual(
    snap.admissionHistory.map(event=>event.side),
    ["eastbound","westbound"]
  );
  for(const event of snap.admissionHistory){
    assert.equal(event.portalAudit.clear,true);
    assert.equal(event.portalAudit.worldClear,true);
    assert.equal(event.portalAudit.bodyClear,true);
  }
  assert.ok(snap.minPairSurfaceGap>0);
});

test("S1-2B each source becomes physically blocked without dropping its queued demand",()=>{
  const state=createCounterflowTransitState({scenario:scenario(4,4)});
  const east=tryAdmitCounterflowSide(state,"eastbound");
  const west=tryAdmitCounterflowSide(state,"westbound");
  assert.ok(east && west);

  const eastAudit=auditCounterflowPortal(state,"eastbound");
  const westAudit=auditCounterflowPortal(state,"westbound");
  assert.equal(eastAudit.clear,false);
  assert.equal(westAudit.clear,false);
  assert.equal(eastAudit.blockingBodyId,east.id);
  assert.equal(westAudit.blockingBodyId,west.id);

  assert.equal(tryAdmitCounterflowSide(state,"eastbound"),null);
  assert.equal(tryAdmitCounterflowSide(state,"westbound"),null);
  const snap=counterflowTransitSnapshot(state);
  assert.equal(snap.ledger.perSide.eastbound.queued,3);
  assert.equal(snap.ledger.perSide.westbound.queued,3);
  assert.equal(snap.ledger.totals.demanded,8);
});

test("S1-2B exact extreme demand becomes two-sided backlog without ordinary overlap spawn",()=>{
  const out=runCounterflowTransitTrial({
    scenario:scenario(256,256),
    trialDuration:2
  });

  assert.equal(out.ledger.totals.demanded,512);
  assert.equal(out.ledger.perSide.eastbound.demanded,256);
  assert.equal(out.ledger.perSide.westbound.demanded,256);
  assert.ok(out.ledger.totals.queued>400,JSON.stringify(out.ledger.totals));
  assert.equal(
    out.ledger.totals.queued+out.ledger.totals.active+out.ledger.totals.completed,
    512
  );
  assert.equal(out.physicalActiveCount,out.ledger.totals.active);
  assert.ok(
    out.minPairSurfaceGap===null || out.minPairSurfaceGap>-1e-6,
    JSON.stringify({gap:out.minPairSurfaceGap})
  );
  for(const event of out.admissionHistory){
    assert.equal(event.portalAudit.clear,true);
    if(event.portalAudit.minSurfaceGap!==null){
      assert.ok(event.portalAudit.minSurfaceGap+1e-8>=out.admissionClearance);
    }
  }
});

test("S1-2B demand changes do not change straight source/sink topology",()=>{
  const low=createCounterflowTransitState({scenario:scenario(2,2)});
  const high=createCounterflowTransitState({scenario:scenario(128,128)});
  const a=counterflowTransitSnapshot(low);
  const b=counterflowTransitSnapshot(high);

  assert.deepEqual(a.sources,b.sources);
  assert.deepEqual(a.sinks,b.sinks);
  assert.deepEqual(a.world,b.world);
  assert.equal(a.scenario.trajectoryMode,"straight");
  assert.equal(b.scenario.trajectoryMode,"straight");
  assert.equal(a.scenario.completionMode,b.scenario.completionMode);
  assert.equal(a.scenario.breakMode,b.scenario.breakMode);
  assert.notDeepEqual(a.scenario.demand,b.scenario.demand);
});

test("S1-2B higher matched demand drives a material jam back into source backlog without changing topology",()=>{
  const low=runCounterflowTransitTrial({scenario:scenario(8,8),trialDuration:8});
  const high=runCounterflowTransitTrial({scenario:scenario(32,32),trialDuration:8});

  assert.deepEqual(low.sources,high.sources);
  assert.deepEqual(low.sinks,high.sinks);
  assert.deepEqual(low.world,high.world);
  assert.equal(low.scenario.trajectoryMode,high.scenario.trajectoryMode);
  assert.equal(low.ledger.totals.queued,0);
  assert.ok(high.ledger.totals.queued>0,JSON.stringify(high.ledger.totals));
  assert.ok(high.ledger.totals.active>low.ledger.totals.active);
  assert.ok(high.totalContactPairSteps>low.totalContactPairSteps);
  assert.equal(high.ledger.perSide.eastbound.queued,high.ledger.perSide.westbound.queued);
  assert.equal(high.ledger.perSide.eastbound.active,high.ledger.perSide.westbound.active);
  assert.equal(low.physicalActiveCount,low.ledger.totals.active);
  assert.equal(high.physicalActiveCount,high.ledger.totals.active);
});

test("S1-2B sink crossing explicitly retires both directions from the contact set",()=>{
  const out=runCounterflowTransitTrial({
    scenario:scenario(1,1),
    westPortal:{x:100,y:140},
    eastPortal:{x:1100,y:260},
    trialDuration:12
  });

  assert.equal(out.status,"COMPLETE",JSON.stringify(out.ledger.totals));
  assert.deepEqual(out.ledger.totals,{
    demanded:2,queued:0,active:0,completed:2
  });
  assert.equal(out.physicalActiveCount,0);
  assert.equal(out.bodies.length,0);
  assert.deepEqual(
    out.completionHistory.map(event=>event.side).sort(),
    ["eastbound","westbound"]
  );
  assert.equal(out.completionHistory.length,2);
});

test("S1-2B same-lane straight counterflow may remain a real material jam",()=>{
  const out=runCounterflowTransitTrial({
    scenario:scenario(8,8),
    trialDuration:8
  });

  assert.equal(out.status,"TRIAL_EXPIRED");
  assert.ok(out.totalContactPairSteps>0);
  assert.ok(out.ledger.totals.active>0);
  assert.equal(out.physicalActiveCount,out.ledger.totals.active);
  assert.equal(out.ledger.totals.completed,0);
  assert.ok(Number.isFinite(out.minPairSurfaceGap));
});

test("S1-2B sampled runs preserve physical-active equality and demand conservation",()=>{
  const state=createCounterflowTransitState({
    scenario:scenario(40,40),
    trialDuration:6
  });

  for(let i=0;i<720 && state.status==="RUNNING";i++){
    stepCounterflowTransitState(state,DT);
    if(i%29!==0) continue;
    const snap=counterflowTransitSnapshot(state);
    const totals=snap.ledger.totals;
    assert.equal(totals.queued+totals.active+totals.completed,totals.demanded);
    assert.equal(snap.physicalActiveCount,totals.active);
  }
});

test("S1-2B rejects unsupported topology/completion/break modes instead of silently rewriting them",()=>{
  assert.throws(
    ()=>createCounterflowTransitState({
      scenario:buildTransitScenarioContract({
        demand:{eastbound:2,westbound:2},
        flowMode:"counterflow",
        trajectoryMode:"crossing"
      })
    }),
    /trajectoryMode=straight/
  );
  assert.throws(
    ()=>createCounterflowTransitState({
      scenario:buildTransitScenarioContract({
        demand:{eastbound:2,westbound:2},
        flowMode:"counterflow",
        completionMode:"persistent-destination"
      })
    }),
    /completionMode=sink-retire/
  );
  assert.throws(
    ()=>createCounterflowTransitState({
      scenario:buildTransitScenarioContract({
        demand:{eastbound:2,westbound:2},
        flowMode:"counterflow",
        breakMode:"intentional-unsafe"
      })
    }),
    /breakMode=ordinary-valid/
  );
  assert.throws(
    ()=>createCounterflowTransitState({
      scenario:buildTransitScenarioContract({
        demand:{eastbound:2,westbound:0},
        flowMode:"counterflow"
      })
    }),
    /positive demand on both sides/
  );
});

test("S1-2B adds no route recovery dynamic encounter personal-space or unsafe-burst authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/counterflow-transit.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/findStaticRouteWitness|route-execution|route-suffix/);
  assert.doesNotMatch(source,/dynamic-encounter|SIDESTEP|passingSide/);
  assert.doesNotMatch(source,/personal.?space|comfort.?radius/i);
  assert.doesNotMatch(source,/unsafe.?burst|overlap.?spawn/i);
  assert.doesNotMatch(source,/MAX_POPULATION|maxPopulation|populationCap/);
});
