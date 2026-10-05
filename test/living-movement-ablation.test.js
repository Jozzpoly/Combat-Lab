import test from "node:test";
import assert from "node:assert/strict";
import {
  createLivingMovementState,
  stepLivingMovementState
} from "../src/research/living-movement.js";

function runTrial(options,{seconds=12,dt=1/120}={}){
  const state=createLivingMovementState(options);
  const steps=Math.round(seconds/dt);
  const previous=new Map(
    Object.values(state.actors).map(actor=>[actor.id,{
      id:actor.continuation.id,
      lastChangeStep:-Infinity
    }])
  );
  let rapidTransitions=0;
  let lateralReversals=0;
  let waitOrSlowEntries=0;
  const transitionPairs={};
  const transitionReasons={};
  const dwellSeconds=[];

  for(let i=0;i<steps;i++){
    stepLivingMovementState(state,dt);
    for(const actor of Object.values(state.actors)){
      const prior=previous.get(actor.id);
      const now=actor.continuation.id;
      if(now===prior.id) continue;
      const pair=prior.id+"→"+now;
      transitionPairs[pair]=(transitionPairs[pair] || 0)+1;
      const reason=String(actor.lastDecision?.reason || "unknown");
      transitionReasons[reason]=(transitionReasons[reason] || 0)+1;
      if(Number.isFinite(prior.lastChangeStep)){
        dwellSeconds.push((i-prior.lastChangeStep)*dt);
      }
      if(i-prior.lastChangeStep<=Math.round(0.25/dt)) rapidTransitions+=1;
      if(
        (prior.id==="left" && now==="right") ||
        (prior.id==="right" && now==="left")
      ) lateralReversals+=1;
      if(now==="wait" || now==="slow") waitOrSlowEntries+=1;
      prior.id=now;
      prior.lastChangeStep=i;
    }
  }

  const actors=Object.values(state.actors);
  const total=fn=>actors.reduce((sum,actor)=>sum+fn(actor),0);
  const mean=fn=>actors.length
    ? actors.reduce((sum,actor)=>sum+fn(actor),0)/actors.length
    : 0;
  return {
    state,
    metrics:{
      count:actors.length,
      active:state.bodies.length,
      completed:state.completedIds.length,
      contactResolutions:state.totalContactResolutions,
      continuationChanges:actors.reduce((sum,actor)=>sum+actor.continuationChanges,0),
      rapidTransitions,
      lateralReversals,
      waitOrSlowEntries,
      transitionPairs,
      transitionReasons,
      meanDwellSeconds:dwellSeconds.length
        ? dwellSeconds.reduce((sum,value)=>sum+value,0)/dwellSeconds.length
        : null,
      sameLabelDemandChangeFrames:total(actor=>actor.demandTelemetry.sameLabelDemandChangeFrames),
      cumulativeDemandTurnRadians:total(actor=>actor.demandTelemetry.cumulativeDemandAngularChurn),
      sameLabelDemandTurnRadians:total(actor=>actor.demandTelemetry.sameLabelDemandAngularChurn),
      cumulativeDemandVectorChurn:total(actor=>actor.demandTelemetry.cumulativeDemandVectorChurn),
      netActivityProgress:total(actor=>actor.demandTelemetry.netActivityProgress),
      meanEffortLoad:mean(actor=>actor.effortLoad),
      meanCapabilityScale:mean(actor=>actor.capabilityScale),
      meanDemandOutcomeError:mean(actor=>Number(actor.lastOutcome?.demandOutcomeError || 0))
    }
  };
}

test("quiet single-organism transit stays causally quiet",()=>{
  const {state,metrics}=runTrial({count:1},{seconds:3});
  const actor=state.actors["organism-1"];
  assert.equal(metrics.contactResolutions,0);
  assert.ok(actor.continuationChanges<=1);
  assert.ok(["direct","keep"].includes(actor.continuation.id));
  assert.equal(metrics.active+metrics.completed,1);
});

test("exact symmetric head-on conflict does not invent a hidden passing side",()=>{
  const state=createLivingMovementState({
    count:2,
    prospectionHorizon:0.9,
    safetyGap:12,
    effortHistoryStrength:0
  });
  const a=state.bodies.find(body=>body.id==="organism-1");
  const b=state.bodies.find(body=>body.id==="organism-2");
  a.x=260; a.y=360; a.vx=0; a.vy=0;
  b.x=940; b.y=360; b.vx=0; b.vy=0;
  state.actors[a.id].activity.exitBand={side:"east",center:360,half:20};
  state.actors[b.id].activity.exitBand={side:"west",center:360,half:20};

  const seen=new Set();
  for(let i=0;i<720;i++){
    stepLivingMovementState(state,1/120);
    for(const actor of Object.values(state.actors)) seen.add(actor.continuation.id);
  }
  assert.equal(seen.has("left"),false);
  assert.equal(seen.has("right"),false);
  assert.ok(seen.has("slow") || seen.has("wait"));
});

test("L0 ablation matrix reports behavior without promoting one metric to success",()=>{
  const configurations=[
    ["baseline",{count:16,prospectionHorizon:0.72,effortHistoryStrength:1}],
    ["no-prospection",{count:16,prospectionHorizon:0,effortHistoryStrength:1}],
    ["no-effort-history",{count:16,prospectionHorizon:0.72,effortHistoryStrength:0}],
    ["bare",{count:16,prospectionHorizon:0,effortHistoryStrength:0}]
  ];

  const results={};
  for(const [label,options] of configurations){
    const {state,metrics}=runTrial(options);
    assert.equal(metrics.active+metrics.completed,16,label+" lost or duplicated actors");
    assert.ok(Number.isFinite(metrics.meanEffortLoad),label+" effort must remain finite");
    assert.ok(Number.isFinite(metrics.meanCapabilityScale),label+" capability must remain finite");
    assert.ok(Number.isFinite(metrics.meanDemandOutcomeError),label+" demand/outcome evidence must remain finite");
    results[label]=metrics;
  }

  assert.equal(results["no-effort-history"].meanCapabilityScale,1);
  assert.equal(results.bare.meanCapabilityScale,1);
  console.log("L0_ABLATION_METRICS "+JSON.stringify(results));
});


test("L0 four-organism microscope reports transition anatomy without changing policy",()=>{
  const baseline=runTrial({
    count:4,
    prospectionHorizon:0.72,
    effortHistoryStrength:0
  },{seconds:12}).metrics;
  const noProspection=runTrial({
    count:4,
    prospectionHorizon:0,
    effortHistoryStrength:0
  },{seconds:12}).metrics;

  assert.equal(baseline.active+baseline.completed,4);
  assert.equal(noProspection.active+noProspection.completed,4);
  console.log("L0_MICROSCOPE_METRICS "+JSON.stringify({baseline,noProspection}));
});
