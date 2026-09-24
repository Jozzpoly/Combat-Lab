import test from "node:test";
import assert from "node:assert/strict";

import {
  createR2State,
  r2RusherAngle,
  stepR2
} from "../src/r2-sim.js";
import {
  runR2CrossedMatrix,
  runR2GuideRetentionSweep,
  runR2Policy,
  runR2PrepareRetentionSweep,
  summarizeR2Matrix
} from "../src/r2-rehearsal.js";

test("R2 K0 locked dash can be left through ordinary lateral movement",()=>{
  for(const side of ["east","west"]){
    const result=runR2Policy({
      history:"free",
      side,
      policy:"evade-only"
    });

    assert.equal(result.finite,true);
    assert.equal(result.incomingBodyContact,false);
    assert.ok(result.maxPlayerDisplacement>30);
  }
});

test("R2 K0 overrun transitions directly into physical return with no recovery timer",()=>{
  const state=createR2State({
    history:"wall",
    side:"east",
    prepare:0.04
  });

  let commitEnd=null;
  let turnaround=null;

  for(let i=0;i<180;i++){
    const events=stepR2(state,{
      moveX:0,
      moveY:state.rusher.mode==="commit"?1:0,
      bodyFacing:r2RusherAngle(state),
      commit:false
    },1/120);

    for(const event of events){
      if(event.type==="rusher-commit-end") commitEnd=event;
      if(event.type==="rusher-turnaround") turnaround=event;
    }
    if(turnaround) break;
  }

  assert.ok(commitEnd);
  assert.equal(state.rusher.mode,"return");
  assert.equal(Object.hasOwn(state.rusher,"recoverTime"),false);
  assert.ok(commitEnd.closing<0);
  assert.ok(turnaround);
  assert.ok(turnaround.closing>0);
});

test("R2 K0 physical turnaround duration is derived and mirrored",()=>{
  const east=runR2Policy({
    history:"free",
    side:"east",
    policy:"evade-only"
  });
  const west=runR2Policy({
    history:"free",
    side:"west",
    policy:"evade-only"
  });

  console.log("R2_OVERRUN_BASELINE",JSON.stringify({east,west}));

  assert.ok(east.opportunityDuration>0);
  assert.ok(west.opportunityDuration>0);
  assert.ok(Math.abs(
    east.opportunityDuration-west.opportunityDuration
  )<0.03);
});

test("R2 K1 maps readiness retention across R0-qualified GUIDE authority range",()=>{
  const sweep=runR2GuideRetentionSweep();
  console.log("R2_GUIDE_RETENTION_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.commitEndHistoryDistanceEast));
    assert.ok(Number.isFinite(row.commitEndHistoryDistanceWest));
  }
});

test("R2 K1 maps readiness retention against prepare duration before changing pressure",()=>{
  const sweep=runR2PrepareRetentionSweep({
    guideAuthority:0.38
  });
  console.log("R2_PREPARE_RETENTION_SWEEP",JSON.stringify(sweep));

  for(const row of sweep){
    assert.ok(Number.isFinite(row.commitEndHistoryDistance));
  }
});

test("R2 K1 exploratory crossed follow-through matrix",()=>{
  const matrix=runR2CrossedMatrix();
  const summary=summarizeR2Matrix(matrix);

  console.log("R2_CROSSED_MATRIX",JSON.stringify(summary));

  for(const sides of Object.values(matrix)){
    for(const policies of Object.values(sides)){
      for(const value of Object.values(policies)){
        assert.equal(value.finite,true);
        assert.equal(value.incomingBodyContact,false);
      }
    }
  }
});
