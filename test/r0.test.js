import test from "node:test";
import assert from "node:assert/strict";

import {
  createR0State,
  driveBody,
  requestCommit,
  setBodyFacingIntent,
  setGuideIntent,
  snapshotReadiness,
  stepWeapon
} from "../src/readiness.js";
import {
  compareHistories,
  runGuideSweep,
  runContactSoak,
  runControlTradeoffSweep,
  runInheritanceAttribution,
  runIntentionalGuideRecovery,
  runMatchedNeutralTimeSweep,
  runPersistenceTimeSweep,
  runSoak
} from "../src/r0-rehearsal.js";

test("R0 locomotion remains responsive during weapon commitment",()=>{
  const state=createR0State();
  setBodyFacingIntent(state,0);
  setGuideIntent(state,0.92,82);
  requestCommit(state,0.92);
  const x0=state.body.x;

  for(let i=0;i<24;i++){
    driveBody(state,1,0,1/120);
    stepWeapon(state,{
      dt:1/120,
      guideAuthority:0.38,
      walls:[]
    });
  }

  assert.ok(state.body.x>x0+20);
  assert.ok(Math.hypot(state.body.vx,state.body.vy)>150);
});

test("R0 FREE and WALL first outcomes leave distinct second-action starting readiness",()=>{
  const result=compareHistories({
    guideAuthority:0.38,
    autoNeutral:false
  });

  console.log("R0_INHERITED_HISTORY",JSON.stringify(result));

  assert.equal(result.free.finite,true);
  assert.equal(result.wall.finite,true);
  assert.equal(result.free.firstImpacts,0);
  assert.ok(result.wall.firstImpacts>=1);
  assert.ok(result.secondStartDistance>0.35);
  assert.notEqual(
    Number(result.free.secondPath.toFixed(2)),
    Number(result.wall.secondPath.toFixed(2))
  );
});

test("R0 AUTO-NEUTRAL ablation collapses much of history before second commit",()=>{
  const inherited=compareHistories({
    guideAuthority:0.38,
    autoNeutral:false,
    interludeSeconds:0.24
  });
  const neutral=compareHistories({
    guideAuthority:0.38,
    autoNeutral:true,
    interludeSeconds:0.34
  });

  console.log("R0_AUTO_NEUTRAL_ABLATION",JSON.stringify({
    inherited:inherited.secondStartDistance,
    neutral:neutral.secondStartDistance,
    inheritedFree:inherited.free.secondStart,
    inheritedWall:inherited.wall.secondStart,
    neutralFree:neutral.free.secondStart,
    neutralWall:neutral.wall.secondStart
  }));

  assert.ok(
    neutral.secondStartDistance<
    inherited.secondStartDistance*0.45
  );
});

test("R0 attribution separates inherited pose from residual kinetic energy",()=>{
  const result=runInheritanceAttribution({
    guideAuthority:0.38,
    interludeSeconds:0.24
  });

  console.log("R0_INHERITANCE_ATTRIBUTION",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.ok(Number.isFinite(value.secondStartDistance));
  }

  // Full inheritance must differ from deliberately erased inheritance.
  assert.ok(
    result.full.secondStartDistance>
    result.none.secondStartDistance
  );
});

test("R0 persistence time sweep maps how long history survives ordinary GUIDE",()=>{
  const sweep=runPersistenceTimeSweep({
    guideAuthority:0.38
  });
  console.log("R0_PERSISTENCE_TIME_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.secondStartDistance));
  }

  assert.ok(sweep[0].secondStartDistance>0.2);
});

test("R0 guide authority sweep maps persistence vs aim erasure without a magic qualification constant",()=>{
  const sweep=runGuideSweep();
  console.log("R0_GUIDE_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.inheritedDistance));
    assert.ok(Number.isFinite(row.neutralDistance));
  }

  const first=sweep[0];
  const last=sweep[sweep.length-1];

  // This is a mapping experiment, not a preselected "good authority" gate.
  // The broad sweep only needs to demonstrate that increasing GUIDE authority
  // can materially erase history; the useful human-control regime is not
  // qualified here.
  assert.ok(first.inheritedDistance>0.35);
  assert.ok(last.inheritedDistance<first.inheritedDistance*0.45);
});

test("R0 deliberate GUIDE can convert inherited wall readiness without canonical guard",()=>{
  const weak=runIntentionalGuideRecovery({
    guideAuthority:0.08
  });
  const candidate=runIntentionalGuideRecovery({
    guideAuthority:0.38
  });
  const strong=runIntentionalGuideRecovery({
    guideAuthority:1.25
  });

  console.log("R0_GUIDE_RECOVERY",JSON.stringify({
    weak,candidate,strong
  }));

  assert.equal(weak.finite,true);
  assert.equal(candidate.finite,true);
  assert.equal(strong.finite,true);
  assert.ok(
    candidate.firstUseful!==null ||
    strong.firstUseful!==null
  );
});

test("R0 sharp aim change does not instantly erase distinct readiness at candidate guide authority",()=>{
  const baseline=compareHistories({
    guideAuthority:0.38,
    interludeSeconds:0.08,
    sharpAimAfterFirst:-1.25
  });

  console.log("R0_SHARP_AIM",JSON.stringify(baseline));

  assert.ok(baseline.secondStartDistance>0.20);
});

test("R0 AUTO-NEUTRAL matched-time sweep erases history faster than ordinary GUIDE",()=>{
  const sweep=runMatchedNeutralTimeSweep({
    guideAuthority:0.38
  });
  console.log("R0_MATCHED_NEUTRAL_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.inherited));
    assert.ok(Number.isFinite(row.autoNeutral));
    assert.ok(Number.isFinite(row.ratio));
  }

  const last=sweep[sweep.length-1];
  assert.ok(last.autoNeutral<last.inherited);
});

test("R0 control tradeoff sweep maps recoverability against history without selecting feel by metric",()=>{
  const sweep=runControlTradeoffSweep();
  console.log("R0_CONTROL_TRADEOFF",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.historyDistance));
    assert.ok(
      row.recoveryTime===null ||
      Number.isFinite(row.recoveryTime)
    );
  }

  assert.ok(sweep.some(row=>
    row.historyDistance>0.8 &&
    row.recoveryTime!==null &&
    row.recoveryTime<0.5
  ));
});

test("R0 stationary contact soak exercises repeated wall episodes without energy pumping",()=>{
  const first=runContactSoak({
    seconds:20,
    guideAuthority:0.75
  });
  const second=runContactSoak({
    seconds:20,
    guideAuthority:0.75
  });

  console.log("R0_CONTACT_SOAK",JSON.stringify(first));

  assert.equal(first.finite,true);
  assert.ok(first.impacts>=5);
  assert.ok(first.maxOmega<30);
  assert.ok(first.maxRadial<600);
  assert.deepEqual(first,second);
});

test("R0 repeated commits and wall contacts remain finite and bounded",()=>{
  const first=runSoak({seconds:20,guideAuthority:0.38});
  const second=runSoak({seconds:20,guideAuthority:0.38});

  console.log("R0_SOAK",JSON.stringify(first));

  assert.equal(first.finite,true);
  assert.ok(first.impacts>0);
  assert.ok(first.maxOmega<30);
  assert.ok(first.maxRadial<600);
  assert.deepEqual(first,second);
});
