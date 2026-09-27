import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDistributedCounterflowTopology,
  createIntegratedEcologyState,
  integratedEcologySnapshot,
  runIntegratedEcologyTrial,
  stepIntegratedEcologyState
} from "../src/research/integrated-ecology.js";

test("E1 stimulus topology distributes unique destinations instead of four shared hubs",()=>{
  const specs=buildDistributedCounterflowTopology(8);
  const targets=specs.map(spec=>`${spec.target.x.toFixed(3)},${spec.target.y.toFixed(3)}`);

  assert.equal(specs.length,8);
  assert.equal(new Set(targets).size,8);
  assert.equal(Math.max(...Object.values(
    targets.reduce((acc,key)=>({...acc,[key]:(acc[key]||0)+1}),{})
  )),1);
  assert.equal(specs.some(spec=>Math.abs(spec.target.x-550)<100),false);
});

test("E1 integrated state begins with heterogeneous embodied phenotypes and finite truth",()=>{
  const state=createIntegratedEcologyState({count:8,passingSide:1});
  const radii=new Set(state.bodies.map(body=>body.radius));
  const masses=new Set(state.bodies.map(body=>body.mass));
  const resistances=new Set(state.bodies.map(body=>body.contactResistance));

  assert.ok(radii.size>=3);
  assert.ok(masses.size>=3);
  assert.ok(resistances.size>=3);
  assert.equal(state.topology.uniqueTargetCount,8);
  assert.equal(state.topology.maxTargetMultiplicity,1);
  assert.equal(state.topology.centerTargetCount,0);
});

test("E1 bounded integrated run exercises both static recovery and dynamic encounter mechanisms",()=>{
  const out=runIntegratedEcologyTrial({count:8,passingSide:1,trialDuration:10});

  assert.equal(out.population,8);
  assert.ok(out.staticReplans>0);
  assert.ok(out.dynamicEncounters>0);
  assert.equal(out.staticOverlapViolations,0);
  assert.ok(out.pairChecks>0);
  assert.ok(out.contactResolutions>0);
  assert.ok(out.totalRemainingDistance<out.totalInitialDistance);
  for(const actor of Object.values(out.actors)){
    assert.ok(Number.isFinite(actor.position.x));
    assert.ok(Number.isFinite(actor.position.y));
    assert.ok(Number.isFinite(actor.goalDistance));
  }
});

test("E1 explicit passing convention materially improves the same integrated topology over NONE",()=>{
  const none=runIntegratedEcologyTrial({count:8,passingSide:0,trialDuration:10});
  const left=runIntegratedEcologyTrial({count:8,passingSide:1,trialDuration:10});

  assert.equal(none.topology.kind,left.topology.kind);
  assert.equal(none.topology.uniqueTargetCount,left.topology.uniqueTargetCount);
  assert.ok(left.arrived>=none.arrived);
  assert.ok(left.totalRemainingDistance<none.totalRemainingDistance);
  assert.ok(none.noConventionBlocks>0);
});

test("E1 snapshot preserves per-actor causal triggers instead of only aggregate crowd metrics",()=>{
  const state=createIntegratedEcologyState({count:8,passingSide:1,trialDuration:10});
  for(let i=0;i<900 && state.status==="RUNNING";i++){
    stepIntegratedEcologyState(state,1/120);
  }
  const snap=integratedEcologySnapshot(state);

  assert.ok(Object.values(snap.actors).some(actor=>actor.staticTrigger));
  assert.ok(Object.values(snap.actors).some(actor=>actor.dynamicTrigger));
  assert.ok(snap.pairChecks>=snap.contactResolutions);
});
