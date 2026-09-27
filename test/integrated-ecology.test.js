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
  assert.equal(
    out.staticOverlapViolations,
    0,
    `unresolved static projection: ${JSON.stringify(out.lastUnresolvedStaticProjection)}`
  );
  assert.equal(
    out.dynamicOverlapViolations,
    0,
    `unresolved dynamic overlap: ${JSON.stringify(out.lastUnresolvedDynamicOverlap)}`
  );
  assert.ok(out.staticProjectionCorrections>0);
  assert.ok(out.coupledPasses>0);
  assert.ok(out.maxCoupledPassesUsed>0);
  assert.ok(
    out.maxCoupledPassesUsed<24,
    `E1 exhausted coupled-pass budget: ${out.maxCoupledPassesUsed}`
  );
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
  assert.ok(
    left.arrived>=none.arrived,
    `LEFT arrived ${left.arrived} < NONE ${none.arrived}; LEFT=${JSON.stringify(left)} NONE=${JSON.stringify(none)}`
  );
  assert.ok(
    left.totalRemainingDistance<none.totalRemainingDistance,
    `LEFT remaining ${left.totalRemainingDistance} >= NONE ${none.totalRemainingDistance}; LEFT=${JSON.stringify(left)} NONE=${JSON.stringify(none)}`
  );
  assert.ok(none.dynamicEncounters>0);
  assert.ok(none.noConventionEncounters>0);
  assert.ok(Object.values(none.actors).some(actor=>actor.dynamicTrigger?.passingSide===0));
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


test("E1 integrated outcome is not materially selected by contact pair iteration order",()=>{
  const forward=runIntegratedEcologyTrial({
    count:8,passingSide:1,pairOrder:"forward",trialDuration:10
  });
  const reverse=runIntegratedEcologyTrial({
    count:8,passingSide:1,pairOrder:"reverse",trialDuration:10
  });

  assert.equal(forward.staticOverlapViolations,0);
  assert.equal(reverse.staticOverlapViolations,0);
  assert.equal(forward.dynamicOverlapViolations,0);
  assert.equal(reverse.dynamicOverlapViolations,0);
  assert.equal(
    forward.staticReplans,
    reverse.staticReplans,
    `pair order changed static replans: forward=${JSON.stringify(forward)} reverse=${JSON.stringify(reverse)}`
  );
  assert.equal(
    forward.dynamicEncounters,
    reverse.dynamicEncounters,
    `pair order changed dynamic encounters: forward=${JSON.stringify(forward)} reverse=${JSON.stringify(reverse)}`
  );

  const causalSignature=snapshot=>Object.entries(snapshot.actors)
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([id,actor])=>({
      id,
      staticBlocker:actor.staticTrigger?.blocker || null,
      dynamicPartner:actor.dynamicTrigger?.partnerId || null,
      dynamicSide:actor.dynamicTrigger?.passingSide ?? null
    }));
  assert.deepEqual(
    causalSignature(forward),
    causalSignature(reverse),
    `pair order changed causal decisions: forward=${JSON.stringify(forward)} reverse=${JSON.stringify(reverse)}`
  );

  const remainingDelta=Math.abs(
    forward.totalRemainingDistance-reverse.totalRemainingDistance
  );
  assert.ok(
    remainingDelta<5,
    `pair order caused > one-arrival-tolerance continuous drift: forward=${forward.totalRemainingDistance} reverse=${reverse.totalRemainingDistance}`
  );
});
