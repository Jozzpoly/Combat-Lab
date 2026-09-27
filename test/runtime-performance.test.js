import test from "node:test";
import assert from "node:assert/strict";
import {RuntimePerformanceMeter} from "../src/core/runtime-performance.js";

test("performance meter keeps render cadence, sim/wall fidelity and phase costs separate",()=>{
  const meter=new RuntimePerformanceMeter({windowSeconds:10,maxSamples:10});
  meter.recordFrame({
    wallSeconds:0.02,
    simulatedSeconds:0.016,
    discardedWallSeconds:0.004,
    simulationMs:3,
    renderMs:4,
    observationMs:1
  });
  meter.recordFrame({
    wallSeconds:0.03,
    simulatedSeconds:0.024,
    discardedWallSeconds:0.006,
    simulationMs:5,
    renderMs:6,
    observationMs:2
  });

  const snap=meter.snapshot();
  assert.equal(snap.sampleCount,2);
  assert.ok(Math.abs(snap.renderHz-40)<1e-9);
  assert.ok(Math.abs(snap.simulationToWallRatio-0.8)<1e-9);
  assert.ok(Math.abs(snap.discardedWallSeconds-0.01)<1e-9);
  assert.deepEqual(snap.phaseMs,{simulation:8,render:10,observation:3});
});

test("performance meter keeps expensive observations and interventions out of frame-phase semantics",()=>{
  const meter=new RuntimePerformanceMeter();
  meter.recordQuery({name:"contact-scaling-probe",durationMs:7.5});
  meter.recordIntervention({operation:"set",durationMs:1.25});

  const snap=meter.snapshot();
  assert.deepEqual(snap.lastQuery,{name:"contact-scaling-probe",durationMs:7.5});
  assert.deepEqual(snap.lastIntervention,{operation:"set",durationMs:1.25});
  assert.deepEqual(snap.phaseMs,{simulation:0,render:0,observation:0});
});

test("performance meter bounds rolling frame evidence rather than growing with session length",()=>{
  const meter=new RuntimePerformanceMeter({windowSeconds:0.05,maxSamples:3});
  for(let i=0;i<20;i++){
    meter.recordFrame({
      wallSeconds:0.02,
      simulatedSeconds:0.02,
      simulationMs:1,
      renderMs:1,
      observationMs:1
    });
  }
  const snap=meter.snapshot();
  assert.ok(snap.sampleCount<=3);
  assert.ok(snap.windowWallSeconds<=0.06+1e-12);
});
