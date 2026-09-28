import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  createFlowTruthLedger,
  requestFlowDemand,
  admitFlowParticipant,
  completeFlowTransit,
  flowTruthLedgerSnapshot
} from "../src/research/flow-truth-ledger.js";

test("S1-0 exact large demand is preserved without hidden capacity or drops",()=>{
  const state=createFlowTruthLedger();
  const ids=requestFlowDemand(state,{
    side:"left",
    count:256,
    time:0
  });
  const snap=flowTruthLedgerSnapshot(state);

  assert.equal(ids.length,256);
  assert.equal(ids[0],"left-000001");
  assert.equal(ids.at(-1),"left-000256");
  assert.deepEqual(snap.totals,{
    demanded:256,
    queued:256,
    active:0,
    completed:0
  });
  assert.equal(snap.perSide.left.queuedIds.length,256);
  assert.equal(snap.eventCount,1);
});

test("S1-0 no admission event means blocked physical demand remains queued",()=>{
  const state=createFlowTruthLedger();
  requestFlowDemand(state,{side:"left",count:8,time:0});
  const before=flowTruthLedgerSnapshot(state);

  // S1-0 deliberately has no portal-clearance authority. If a future S1-1
  // physical source is blocked it simply emits no ADMIT event.
  const after=flowTruthLedgerSnapshot(state);

  assert.deepEqual(after,before);
  assert.equal(after.perSide.left.queued,8);
  assert.equal(after.totals.active,0);
});

test("S1-0 admission preserves deterministic source queue order",()=>{
  const state=createFlowTruthLedger();
  const ids=requestFlowDemand(state,{side:"right",count:3,time:0});

  assert.throws(
    ()=>admitFlowParticipant(state,{side:"right",id:ids[1],time:0.1}),
    /preserve source queue order/
  );

  const first=admitFlowParticipant(state,{side:"right",time:0.1});
  const second=admitFlowParticipant(state,{side:"right",time:0.2});
  const snap=flowTruthLedgerSnapshot(state);

  assert.equal(first.id,ids[0]);
  assert.equal(second.id,ids[1]);
  assert.deepEqual(snap.perSide.right.queuedIds,[ids[2]]);
  assert.equal(snap.perSide.right.active,2);
});

test("S1-0 active transit and completion are disjoint exactly-once truths",()=>{
  const state=createFlowTruthLedger();
  const [id]=requestFlowDemand(state,{side:"left",count:1,time:0});

  assert.throws(
    ()=>completeFlowTransit(state,{id,time:0.1,sink:"right-exit"}),
    /not active transit/
  );

  admitFlowParticipant(state,{side:"left",time:0.1});
  let snap=flowTruthLedgerSnapshot(state);
  assert.equal(snap.totals.active,1);
  assert.equal(snap.totals.completed,0);

  const completed=completeFlowTransit(state,{
    id,
    time:1.2,
    sink:"right-exit"
  });
  snap=flowTruthLedgerSnapshot(state);

  assert.equal(completed.status,"COMPLETED");
  assert.equal(completed.sink,"right-exit");
  assert.equal(snap.totals.active,0);
  assert.equal(snap.totals.completed,1);

  assert.throws(
    ()=>completeFlowTransit(state,{id,time:1.3,sink:"right-exit"}),
    /already completed transit/
  );
});

test("S1-0 preserves independent per-side demand/admission/completion truth",()=>{
  const state=createFlowTruthLedger();
  const left=requestFlowDemand(state,{side:"left",count:4,time:0});
  requestFlowDemand(state,{side:"right",count:3,time:0});

  admitFlowParticipant(state,{side:"left",time:0.1});
  admitFlowParticipant(state,{side:"left",time:0.2});
  admitFlowParticipant(state,{side:"right",time:0.3});
  completeFlowTransit(state,{id:left[0],time:1,sink:"right-exit"});

  const snap=flowTruthLedgerSnapshot(state);

  assert.deepEqual(
    {
      demanded:snap.perSide.left.demanded,
      queued:snap.perSide.left.queued,
      active:snap.perSide.left.active,
      completed:snap.perSide.left.completed
    },
    {demanded:4,queued:2,active:1,completed:1}
  );
  assert.deepEqual(
    {
      demanded:snap.perSide.right.demanded,
      queued:snap.perSide.right.queued,
      active:snap.perSide.right.active,
      completed:snap.perSide.right.completed
    },
    {demanded:3,queued:2,active:1,completed:0}
  );
  assert.deepEqual(snap.totals,{
    demanded:7,queued:4,active:2,completed:1
  });
});

test("S1-0 event provenance is globally time-monotonic and explicit",()=>{
  const state=createFlowTruthLedger();
  const [id]=requestFlowDemand(state,{side:"left",count:1,time:2});
  admitFlowParticipant(state,{side:"left",time:2.5});
  completeFlowTransit(state,{id,time:5,sink:"right-exit"});

  const snap=flowTruthLedgerSnapshot(state);
  assert.deepEqual(
    snap.events.map(event=>event.type),
    ["REQUEST","ADMIT","COMPLETE_TRANSIT"]
  );
  assert.deepEqual(
    snap.events.map(event=>event.sequence),
    [1,2,3]
  );
  assert.deepEqual(
    snap.events.map(event=>event.time),
    [2,2.5,5]
  );

  assert.throws(
    ()=>requestFlowDemand(state,{side:"right",count:1,time:4}),
    /event time must be monotonic/
  );
});

test("S1-0 has no hidden population-cap or physical admission policy",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/flow-truth-ledger.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/stepContactWorld/);
  assert.doesNotMatch(source,/queryStaticCircle/);
  assert.doesNotMatch(source,/MAX_POPULATION|maxPopulation|populationCap/);

  const state=createFlowTruthLedger({sides:["source"]});
  requestFlowDemand(state,{side:"source",count:10000,time:0});
  const snap=flowTruthLedgerSnapshot(state);
  assert.equal(snap.totals.demanded,10000);
  assert.equal(snap.totals.queued,10000);
});
