import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceEffortLoad,
  buildLivingMovementActivities,
  capabilityScaleFromLoad,
  createLivingMovementState,
  externallyPlaceLivingMovementBody,
  livingMovementActorTrace,
  livingMovementSnapshot,
  stepLivingMovementState
} from "../src/research/living-movement.js";

test("living movement activity specs remain stable when population grows",()=>{
  const eight=buildLivingMovementActivities(8);
  const sixteen=buildLivingMovementActivities(16);
  assert.deepEqual(sixteen.slice(0,8),eight);
});

test("effort history deforms capability smoothly and can be disabled",()=>{
  const a=capabilityScaleFromLoad(0,1);
  const b=capabilityScaleFromLoad(0.5,1);
  const c=capabilityScaleFromLoad(1,1);
  assert.equal(a,1);
  assert.ok(a>b);
  assert.ok(b>c);
  assert.equal(capabilityScaleFromLoad(1.4,0),1);
  assert.ok(c>0);
});

test("sustained demand can build embodied load and quiet recovery reduces it",()=>{
  let load=0;
  for(let i=0;i<120;i++){
    load=advanceEffortLoad({
      load,
      motorUse:1,
      speedFraction:1,
      blockedFraction:0.5,
      dt:1/120
    });
  }
  const stressed=load;
  assert.ok(stressed>0.3);

  for(let i=0;i<600;i++){
    load=advanceEffortLoad({
      load,
      motorUse:0,
      speedFraction:0,
      blockedFraction:0,
      dt:1/120
    });
  }
  assert.ok(load<stressed);
});

test("ordinary L0 population starts hard-separated and preserves finite state",()=>{
  const state=createLivingMovementState({count:16});
  for(let i=0;i<state.bodies.length;i++){
    for(let j=i+1;j<state.bodies.length;j++){
      const a=state.bodies[i];
      const b=state.bodies[j];
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius);
    }
  }

  for(let i=0;i<1200;i++) stepLivingMovementState(state,1/120);
  const snapshot=livingMovementSnapshot(state);
  assert.equal(snapshot.active+snapshot.completed,16);
  assert.ok(Number.isFinite(snapshot.averageEffortLoad));
  assert.ok(Number.isFinite(snapshot.averageCapabilityScale));
  for(const actor of snapshot.actors){
    assert.ok(Number.isFinite(actor.body.position.x));
    assert.ok(Number.isFinite(actor.body.position.y));
    assert.ok(Number.isFinite(actor.body.capabilityScale));
  }
});

test("zero prospection and zero effort-history remain explicit ablation conditions",()=>{
  const state=createLivingMovementState({
    count:8,
    prospectionHorizon:0,
    effortHistoryStrength:0
  });
  for(let i=0;i<240;i++) stepLivingMovementState(state,1/120);
  const snapshot=livingMovementSnapshot(state);
  assert.equal(snapshot.policy.prospectionHorizon,0);
  assert.equal(snapshot.policy.effortHistoryStrength,0);
  for(const actor of snapshot.actors){
    assert.equal(actor.body.capabilityScale,1);
  }
});


test("material demand trace distinguishes command continuity from labels",()=>{
  const state=createLivingMovementState({
    count:16,
    prospectionHorizon:0.72,
    effortHistoryStrength:0
  });
  for(let i=0;i<720;i++) stepLivingMovementState(state,1/120);

  const traces=Object.keys(state.actors).map(id=>livingMovementActorTrace(state,id,{limit:240}));
  const samples=traces.flat();
  assert.ok(samples.length>0);
  for(const sample of samples){
    assert.ok(Number.isFinite(sample.demandVectorDelta));
    assert.ok(Number.isFinite(sample.demandAngleDelta));
    assert.ok(Number.isFinite(sample.activityProgress));
    assert.ok(Number.isFinite(sample.realizedDisplacement));
    assert.ok(Number.isFinite(sample.demandOutcomeError));
  }

  const sameLabelMaterialChange=samples.some(sample=>
    sample.sameContinuationAsPreviousDemand &&
    sample.demandVectorDelta>1e-6
  );
  assert.equal(
    sameLabelMaterialChange,
    true,
    "L0 microscope must reveal motor-demand change even when the semantic continuation label is unchanged"
  );
});


test("external perturbation is explicit apparatus evidence rather than motor outcome",()=>{
  const state=createLivingMovementState({count:4,effortHistoryStrength:0});
  const body=state.bodies.find(candidate=>candidate.id==="organism-1");
  body.vx=25;
  body.vy=-10;
  const before={x:body.x,y:body.y};

  const event=externallyPlaceLivingMovementBody(
    state,
    body.id,
    {x:body.x+70,y:body.y+35},
    {zeroVelocity:true,source:"test-hand"}
  );

  assert.equal(event.source,"test-hand");
  assert.ok(event.displacement>70);
  assert.equal(body.vx,0);
  assert.equal(body.vy,0);
  assert.ok(body.x>before.x+60);
  assert.ok(body.y>before.y+25);

  const actor=state.actors[body.id];
  assert.equal(actor.externalPerturbationCount,1);
  assert.equal(actor.lastExternalPerturbation.source,"test-hand");
  const trace=livingMovementActorTrace(state,body.id,{limit:10});
  assert.equal(trace.at(-1).kind,"external-perturbation");
  assert.equal(trace.at(-1).source,"test-hand");
});
