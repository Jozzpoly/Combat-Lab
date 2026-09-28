import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  createSequentialDynamicEncounterState,
  runSequentialDynamicEncounterTrial,
  sequentialDynamicEncounterSnapshot,
  stepSequentialDynamicEncounterState
} from "../src/research/sequential-dynamic-encounters.js";

const DT=1/120;

test("D1-1 source adds no route planner, personal-space or pre-contact avoidance authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/sequential-dynamic-encounters.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/findStaticRouteWitness/);
  assert.doesNotMatch(source,/route-execution/);
  assert.doesNotMatch(source,/personal.?space/i);
  assert.doesNotMatch(source,/predict/i);
});

test("D1-1 lifetime baseline resolves B once but remains unable to negotiate later C",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1
  });

  assert.equal(out.status,"TRIAL_EXPIRED",JSON.stringify(out));
  assert.equal(out.actorA.encounterCount,1);
  assert.equal(out.actorA.triggerHistory.length,1);
  assert.equal(out.actorA.triggerHistory[0].partnerId,"B");
  assert.equal(out.actorA.rearmHistory.length,0);
  assert.ok(out.actorA.contactPartnersSeen.includes("C"));
  assert.notEqual(out.actorA.mode,"ARRIVED");
  assert.ok(out.actorA.goalDistance>100);
  assert.equal(out.actorA.lastEpisodeBoundary?.rearmed,true);
});

test("D1-1 episodic candidate triggers B then C and reaches A target",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:1
  });

  assert.equal(out.status,"A_COMPLETE",JSON.stringify(out));
  assert.equal(out.actorA.mode,"ARRIVED");
  assert.equal(out.actorA.encounterCount,2);
  assert.deepEqual(
    out.actorA.triggerHistory.map(trigger=>trigger.partnerId),
    ["B","C"]
  );
  assert.equal(out.actorA.rearmHistory.length,2);
  assert.ok(out.actorA.rearmHistory[0].time<out.actorA.triggerHistory[1].time);
  assert.equal(out.actorA.triggerHistory[0].episodeId,1);
  assert.equal(out.actorA.triggerHistory[1].episodeId,2);
});

test("D1-1 identical physical stimulus isolates lifetime vs episodic authority",()=>{
  const baseline=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1
  });
  const episodic=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:1
  });

  assert.deepEqual(
    baseline.actorA.triggerHistory[0],
    episodic.actorA.triggerHistory[0]
  );
  assert.equal(baseline.passive.B.radius,episodic.passive.B.radius);
  assert.equal(baseline.passive.C.radius,episodic.passive.C.radius);
  assert.equal(baseline.actorA.encounterCount,1);
  assert.equal(episodic.actorA.encounterCount,2);
  assert.notEqual(baseline.status,episodic.status);
});

test("D1-1 no-convention control preserves material gridlock and cannot timeout-spam episodes",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:0
  });

  assert.equal(out.status,"TRIAL_EXPIRED");
  assert.equal(out.actorA.encounterCount,1);
  assert.equal(out.actorA.triggerHistory[0].partnerId,"B");
  assert.equal(out.actorA.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(out.actorA.rearmHistory.length,0);
  assert.notEqual(out.actorA.mode,"ARRIVED");
});

test("D1-1 a second body arriving before healthy clear cannot manufacture episode two",()=>{
  const state=createSequentialDynamicEncounterState({
    episodeMode:"episodic",
    passingSideA:1,
    startB:{x:850,y:350},
    startC:{x:1000,y:350},
    trialDuration:7
  });

  for(let i=0;i<Math.ceil(7/DT) && state.status==="RUNNING";i++){
    stepSequentialDynamicEncounterState(state,DT);
  }
  const out=sequentialDynamicEncounterSnapshot(state);

  assert.equal(out.actorA.encounterCount,1,JSON.stringify(out));
  assert.equal(out.actorA.rearmHistory.length,0);
  assert.notEqual(out.status,"A_COMPLETE");
  assert.ok(out.actorA.contactPartnersSeen.includes("B"));
  assert.ok(out.actorA.contactPartnersSeen.includes("C"));
});
