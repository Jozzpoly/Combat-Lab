import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {RuntimePerformanceMeter} from "../src/core/runtime-performance.js";
import {counterflowCausalHealthS13} from "../experiments/counterflow-causal-health-s1-3.js";

const DT=1/120;

function advance(instance,seconds){
  const steps=Math.ceil(seconds/DT);
  for(let i=0;i<steps;i++) instance.step({},DT);
}

test("S1-3 Workbench specimen separates macro truth and preserves next-reset demand semantics",()=>{
  const meter=new RuntimePerformanceMeter();
  meter.recordFrame({
    wallSeconds:0.02,
    simulatedSeconds:0.016,
    discardedWallSeconds:0.004,
    simulationMs:3,
    renderMs:2,
    observationMs:1
  });
  const instance=counterflowCausalHealthS13.create({runtimePerformance:meter});

  assert.equal(instance.inspector.get("eastboundDemand"),16);
  assert.equal(instance.inspector.get("westboundDemand"),16);
  assert.equal(instance.inspector.getLive("demanded"),32);

  instance.inspector.set("eastboundDemand",32);
  instance.inspector.set("westboundDemand",32);
  assert.equal(instance.inspector.getLive("demanded"),32);
  instance.reset();
  assert.equal(instance.inspector.getLive("demanded"),64);

  advance(instance,8);
  const macro=instance.query("macro-causal-health");
  assert.ok(macro.flow.queued>0);
  assert.ok(macro.flow.active>0);
  assert.equal(macro.flow.completed,0);
  assert.ok(macro.behavior.stalled.count>0);
  assert.ok(macro.contact.solverStep.bodyCount>0);
  assert.equal(macro.validity.invalidAdmissionCount,0);
  assert.equal(macro.validity.physicalLedgerActiveMatch,true);
  assert.equal(macro.runtime.available,true);
});

test("S1-3 Workbench exact geometry evidence is query-driven rather than hidden in every macro snapshot",()=>{
  const instance=counterflowCausalHealthS13.create();
  advance(instance,5);

  const before=instance.query("macro-causal-health");
  assert.equal(before.contact.currentGeometry.available,false);

  const probe=instance.query("current-contact-probe");
  assert.ok(probe.pairChecks>0);
  assert.ok(probe.contactPairCount>0);

  const after=instance.query("macro-causal-health");
  assert.equal(after.contact.currentGeometry.available,true);
  assert.equal(after.contact.currentGeometry.probe.pairChecks,probe.pairChecks);
});

test("S1-3 Workbench specimen owns observation and selection only, not movement or negotiation authority",()=>{
  const source=fs.readFileSync(
    new URL("../experiments/counterflow-causal-health-s1-3.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/desiredVelocity\s*=/);
  assert.doesNotMatch(source,/resolveCandidateContactPair|solveCandidateContactPairs/);
  assert.doesNotMatch(source,/SIDESTEP|passingSide|dynamic-encounter/);
  assert.doesNotMatch(source,/findStaticRouteWitness|route-execution/);
  assert.doesNotMatch(source,/personal.?space|comfort.?radius/i);
  assert.doesNotMatch(source,/healthScore|overallStatus/);
});
