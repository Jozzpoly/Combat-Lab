import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  runSequentialDynamicEncounterTrial
} from "../src/research/sequential-dynamic-encounters.js";

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

test("D1-1 lifetime baseline is rearm-eligible after B but cannot negotiate released C",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1
  });

  assert.equal(out.secondChallengeReleased,true,JSON.stringify(out));
  assert.equal(out.releaseHistory.length,1);
  assert.equal(out.releaseHistory[0].triggerPartnerId,"B");
  assert.equal(out.actorA.encounterCount,1);
  assert.equal(out.actorA.triggerHistory.length,1);
  assert.equal(out.actorA.triggerHistory[0].partnerId,"B");
  assert.equal(out.actorA.rearmHistory.length,0);
  assert.ok(out.actorA.contactPartnersSeen.includes("C"));
  assert.equal(out.status,"TRIAL_EXPIRED",JSON.stringify(out));
  assert.notEqual(out.actorA.mode,"ARRIVED");
  assert.ok(out.actorA.goalDistance>100);
});

test("D1-1 episodic candidate triggers B then released C and reaches A target",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:1
  });

  assert.equal(out.secondChallengeReleased,true,JSON.stringify(out));
  assert.equal(out.status,"A_COMPLETE",JSON.stringify(out));
  assert.equal(out.actorA.mode,"ARRIVED");
  assert.equal(out.actorA.encounterCount,2);
  assert.deepEqual(
    out.actorA.triggerHistory.map(trigger=>trigger.partnerId),
    ["B","C"]
  );
  assert.ok(out.actorA.rearmHistory.length>=1);
  assert.ok(out.actorA.rearmHistory[0].time<out.actorA.triggerHistory[1].time);
  assert.equal(out.actorA.triggerHistory[0].episodeId,1);
  assert.equal(out.actorA.triggerHistory[1].episodeId,2);
});

test("D1-1 identical post-rearm challenge isolates lifetime vs episodic authority",()=>{
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
  assert.deepEqual(baseline.releaseHistory,episodic.releaseHistory);
  assert.equal(baseline.passive.B.radius,episodic.passive.B.radius);
  assert.equal(baseline.passive.C.radius,episodic.passive.C.radius);
  assert.equal(baseline.actorA.encounterCount,1);
  assert.equal(episodic.actorA.encounterCount,2);
  assert.equal(baseline.status,"TRIAL_EXPIRED");
  assert.equal(episodic.status,"A_COMPLETE");
});

test("D1-1 no-convention control preserves first material gridlock and never releases C",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:0
  });

  assert.equal(out.status,"TRIAL_EXPIRED");
  assert.equal(out.actorA.encounterCount,1);
  assert.equal(out.actorA.triggerHistory[0].partnerId,"B");
  assert.equal(out.actorA.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(out.actorA.rearmHistory.length,0);
  assert.equal(out.secondChallengeReleased,false);
  assert.equal(out.passive.C.mode,"DORMANT");
});

test("D1-1 second challenge is released only after factual D1-0 rearm evidence",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1
  });

  assert.equal(out.releaseHistory.length,1);
  assert.ok(out.releaseHistory[0].time>out.actorA.triggerHistory[0].time+0.8);
  assert.equal(out.releaseHistory[0].triggerPartnerId,"B");
  assert.ok(out.releaseHistory[0].gap>out.passive.C.radius*2);
});


test("D1-1 released C is an exact opposing challenge on A's current goal ray",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1
  });
  const release=out.releaseHistory[0];
  assert.ok(release);

  const ax=release.aTarget.x-release.aPosition.x;
  const ay=release.aTarget.y-release.aPosition.y;
  const cx=release.challengeTarget.x-release.challengePosition.x;
  const cy=release.challengeTarget.y-release.challengePosition.y;
  const aLength=Math.hypot(ax,ay);
  const cLength=Math.hypot(cx,cy);
  const cross=ax*cy-ay*cx;
  const dot=(ax/aLength)*(cx/cLength)+(ay/aLength)*(cy/cLength);

  assert.ok(Math.abs(cross)<1e-6,JSON.stringify(release));
  assert.ok(dot<-0.999999,JSON.stringify({dot,release}));
  assert.ok(release.gap>out.passive.C.radius*2);
});


test("D1-2 lifetime baseline cannot renegotiate the same B after factual rearm",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1,
    secondChallengePartner:"B"
  });

  assert.equal(out.secondChallengePartner,"B");
  assert.equal(out.secondChallengeReleased,true,JSON.stringify(out));
  assert.equal(out.releaseHistory[0].partnerId,"B");
  assert.equal(out.actorA.encounterCount,1);
  assert.deepEqual(
    out.actorA.triggerHistory.map(trigger=>trigger.partnerId),
    ["B"]
  );
  assert.equal(out.status,"TRIAL_EXPIRED",JSON.stringify(out));
  assert.notEqual(out.actorA.mode,"ARRIVED");
});

test("D1-2 episodic candidate treats the same B as a new encounter only after rearm",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:1,
    secondChallengePartner:"B"
  });

  assert.equal(out.secondChallengePartner,"B");
  assert.equal(out.status,"A_COMPLETE",JSON.stringify(out));
  assert.equal(out.actorA.encounterCount,2);
  assert.deepEqual(
    out.actorA.triggerHistory.map(trigger=>trigger.partnerId),
    ["B","B"]
  );
  assert.deepEqual(
    out.actorA.triggerHistory.map(trigger=>trigger.episodeId),
    [1,2]
  );
  assert.ok(out.actorA.rearmHistory.length>=1);
  assert.ok(out.actorA.rearmHistory[0].time<out.actorA.triggerHistory[1].time);
});

test("D1-2 same-partner baseline and candidate receive an identical recycled B challenge",()=>{
  const baseline=runSequentialDynamicEncounterTrial({
    episodeMode:"lifetime",
    passingSideA:1,
    secondChallengePartner:"B"
  });
  const episodic=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:1,
    secondChallengePartner:"B"
  });

  assert.deepEqual(baseline.actorA.triggerHistory[0],episodic.actorA.triggerHistory[0]);
  assert.deepEqual(baseline.releaseHistory,episodic.releaseHistory);
  assert.equal(baseline.actorA.encounterCount,1);
  assert.equal(episodic.actorA.encounterCount,2);
});

test("D1-2 no-convention same-partner conflict never earns a recycle/rearm",()=>{
  const out=runSequentialDynamicEncounterTrial({
    episodeMode:"episodic",
    passingSideA:0,
    secondChallengePartner:"B"
  });

  assert.equal(out.actorA.encounterCount,1);
  assert.equal(out.actorA.mode,"BLOCKED_NO_CONVENTION");
  assert.equal(out.secondChallengeReleased,false);
  assert.equal(out.releaseHistory.length,0);
  assert.equal(out.status,"TRIAL_EXPIRED");
});
