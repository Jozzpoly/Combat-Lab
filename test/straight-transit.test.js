import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  auditStraightTransitPortal,
  createStraightTransitState,
  runStraightTransitTrial,
  stepStraightTransitState,
  straightTransitSnapshot,
  tryAdmitStraightTransit
} from "../src/research/straight-transit.js";

const DT=1/120;

function stepFor(state,seconds){
  for(let i=0;i<Math.ceil(seconds/DT) && state.status==="RUNNING";i++){
    stepStraightTransitState(state,DT);
  }
  return straightTransitSnapshot(state);
}

test("S1-1 portal admits one hard body then physically blocks the next queued participant",()=>{
  const state=createStraightTransitState({
    demandCount:3,
    trialDuration:4
  });

  const first=tryAdmitStraightTransit(state);
  assert.ok(first);
  let snap=straightTransitSnapshot(state);
  assert.deepEqual(snap.ledger.totals,{
    demanded:3,queued:2,active:1,completed:0
  });
  assert.equal(snap.physicalActiveCount,1);

  const audit=auditStraightTransitPortal(state);
  assert.equal(audit.clear,false);
  assert.equal(audit.blockingBodyId,first.id);

  const second=tryAdmitStraightTransit(state);
  assert.equal(second,null);
  assert.deepEqual(straightTransitSnapshot(state).ledger.totals,snap.ledger.totals);
});

test("S1-1 every admission has a hard-clear non-overlap portal proof",()=>{
  const state=createStraightTransitState({
    demandCount:12,
    trialDuration:6
  });
  const snap=stepFor(state,6);

  assert.ok(snap.admissionHistory.length>=8,JSON.stringify(snap.ledger.totals));
  for(const event of snap.admissionHistory){
    assert.equal(event.portalAudit.clear,true);
    if(event.portalAudit.minSurfaceGap!==null){
      assert.ok(
        event.portalAudit.minSurfaceGap+1e-8>=snap.admissionClearance,
        JSON.stringify(event)
      );
    }
  }
  assert.equal(snap.physicalActiveCount,snap.ledger.totals.active);
  assert.equal(
    snap.ledger.totals.queued+
      snap.ledger.totals.active+
      snap.ledger.totals.completed,
    snap.ledger.totals.demanded
  );
  assert.ok(
    snap.minPairSurfaceGap===null || snap.minPairSurfaceGap>-1e-6,
    JSON.stringify({gap:snap.minPairSurfaceGap})
  );
});

test("S1-1 extreme exact demand becomes visible backlog rather than overlap spawn",()=>{
  const out=runStraightTransitTrial({
    demandCount:256,
    trialDuration:2
  });

  assert.equal(out.ledger.totals.demanded,256);
  assert.ok(out.ledger.totals.queued>200,JSON.stringify(out.ledger.totals));
  assert.ok(out.ledger.totals.active<30,JSON.stringify(out.ledger.totals));
  assert.equal(
    out.ledger.totals.queued+
      out.ledger.totals.active+
      out.ledger.totals.completed,
    256
  );
  assert.equal(out.physicalActiveCount,out.ledger.totals.active);
  assert.ok(
    out.minPairSurfaceGap===null || out.minPairSurfaceGap>-1e-6,
    JSON.stringify({gap:out.minPairSurfaceGap})
  );
});

test("S1-1 sink completion retires the collider from active transit",()=>{
  const out=runStraightTransitTrial({
    demandCount:1,
    trialDuration:12
  });

  assert.equal(out.status,"COMPLETE",JSON.stringify(out));
  assert.deepEqual(out.ledger.totals,{
    demanded:1,queued:0,active:0,completed:1
  });
  assert.equal(out.physicalActiveCount,0);
  assert.equal(out.bodies.length,0);
  assert.equal(out.completionHistory.length,1);
  assert.equal(out.completionHistory[0].participantId,"eastbound-000001");
  assert.ok(out.completionHistory[0].crossingPosition.x>=out.sinkX-1e-8);
});

test("S1-1 long run conserves demand across queue active and completed populations",()=>{
  const state=createStraightTransitState({
    demandCount:40,
    trialDuration:14
  });

  for(let i=0;i<1400 && state.status==="RUNNING";i++){
    stepStraightTransitState(state,DT);
    if(i%37!==0) continue;
    const snap=straightTransitSnapshot(state);
    const totals=snap.ledger.totals;
    assert.equal(totals.queued+totals.active+totals.completed,totals.demanded);
    assert.equal(snap.physicalActiveCount,totals.active);
    assert.ok(
      snap.minPairSurfaceGap===null || snap.minPairSurfaceGap>-1e-6,
      JSON.stringify({i,gap:snap.minPairSurfaceGap})
    );
  }
});

test("S1-1 owns no route, dynamic-episode, personal-space or hidden cap authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/straight-transit.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/findStaticRouteWitness|route-execution|route-suffix/);
  assert.doesNotMatch(source,/dynamic-encounter|SIDESTEP|passingSide/);
  assert.doesNotMatch(source,/personal.?space|comfort.?radius/i);
  assert.doesNotMatch(source,/MAX_POPULATION|maxPopulation|populationCap/);
});
