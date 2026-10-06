import test from "node:test";
import assert from "node:assert/strict";

import {staticLocomotionSalvageM1} from "../experiments/static-locomotion-salvage-m1.js";
import {routeRecoverySalvageR1} from "../experiments/route-recovery-salvage-r1.js";
import {dynamicEncounterSalvageD1} from "../experiments/dynamic-encounter-salvage-d1.js";

const DT=1/120;

test("M1 salvage surface exposes a visible baseline/candidate divergence",()=>{
  const instance=staticLocomotionSalvageM1.create();
  for(let i=0;i<60;i++) instance.step(null,DT);
  const out=instance.query("m1-salvage-pair");

  assert.ok(out);
  assert.ok(Math.abs(out.baseline.body.y-200)<1e-6);
  assert.ok(out.candidate.body.y>out.baseline.body.y+40);
  assert.ok(out.baseline.totalContacts>0);
  assert.ok(out.candidate.totalContacts>0);
});

test("R1 salvage surface reaches an Owner displacement gate only after re-arm evidence",()=>{
  const instance=routeRecoverySalvageR1.create();
  let out=null;
  for(let i=0;i<2400;i++){
    instance.step(null,DT);
    out=instance.query("r1-salvage-pair");
    if(out.waitingForOwner) break;
  }

  assert.ok(out?.waitingForOwner,JSON.stringify(out));
  assert.equal(out.candidate.rearmReady,true);
  assert.equal(out.candidate.totalFreshQueryCount,1);
  assert.equal(out.candidate.episodeId,1);
  assert.ok(out.recommended);
});

test("D1 salvage surface reproduces lifetime vs episodic divergence",()=>{
  const instance=dynamicEncounterSalvageD1.create();
  for(let i=0;i<1800;i++) instance.step(null,DT);
  const out=instance.query("d1-salvage-pair");

  assert.ok(out);
  assert.equal(out.baseline.actorA.encounterCount,1);
  assert.equal(out.candidate.actorA.encounterCount,2);
  assert.equal(out.baseline.status,"TRIAL_EXPIRED");
  assert.equal(out.candidate.status,"A_COMPLETE");
});
