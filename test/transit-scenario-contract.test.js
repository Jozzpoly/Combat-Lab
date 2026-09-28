import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildTransitScenarioContract,
  diffTransitScenarioContracts,
  matchedTransitScenarioExcept,
  transitScenarioAxisSnapshot
} from "../src/research/transit-scenario-contract.js";

test("S1-2A changing demand alone does not rewrite topology completion or break policy",()=>{
  const a=buildTransitScenarioContract({
    demand:{eastbound:9,westbound:9},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });
  const b=buildTransitScenarioContract({
    demand:{eastbound:128,westbound:128},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });

  const diffs=diffTransitScenarioContracts(a,b);
  assert.deepEqual(diffs.map(diff=>diff.axis),["demand"]);
  assert.equal(matchedTransitScenarioExcept(a,b,["demand"]),true);
  assert.equal(a.trajectoryMode,b.trajectoryMode);
  assert.equal(a.completionMode,b.completionMode);
  assert.equal(a.breakMode,b.breakMode);
});

test("S1-2A trajectory topology is an authored axis rather than a population-derived side effect",()=>{
  const demand={eastbound:18,westbound:18};
  const straight=buildTransitScenarioContract({
    demand,
    flowMode:"counterflow",
    trajectoryMode:"straight"
  });
  const crossing=buildTransitScenarioContract({
    demand,
    flowMode:"counterflow",
    trajectoryMode:"crossing"
  });

  assert.deepEqual(
    diffTransitScenarioContracts(straight,crossing).map(diff=>diff.axis),
    ["trajectoryMode"]
  );
  assert.deepEqual(straight.demand,crossing.demand);
});

test("S1-2A completion semantics are independent of demand and trajectory",()=>{
  const base=buildTransitScenarioContract({
    demand:{eastbound:20,westbound:20},
    flowMode:"counterflow",
    trajectoryMode:"crossing",
    completionMode:"sink-retire"
  });
  const persistent=buildTransitScenarioContract({
    demand:{eastbound:20,westbound:20},
    flowMode:"counterflow",
    trajectoryMode:"crossing",
    completionMode:"persistent-destination"
  });

  const diffs=diffTransitScenarioContracts(base,persistent);
  assert.deepEqual(diffs.map(diff=>diff.axis),["completionMode"]);
  assert.deepEqual(base.demand,persistent.demand);
  assert.equal(base.trajectoryMode,persistent.trajectoryMode);
});

test("S1-2A intentional break policy preserves exact extreme demand instead of clamping it",()=>{
  const ordinary=buildTransitScenarioContract({
    demand:{eastbound:5000,westbound:5000},
    flowMode:"counterflow",
    breakMode:"ordinary-valid"
  });
  const unsafe=buildTransitScenarioContract({
    demand:{eastbound:5000,westbound:5000},
    flowMode:"counterflow",
    breakMode:"intentional-unsafe"
  });

  assert.equal(ordinary.totalDemand,10000);
  assert.equal(unsafe.totalDemand,10000);
  assert.deepEqual(ordinary.demand,unsafe.demand);
  assert.deepEqual(
    diffTransitScenarioContracts(ordinary,unsafe).map(diff=>diff.axis),
    ["breakMode"]
  );
});

test("S1-2A flow mode is distinct from trajectory mode",()=>{
  const oneWay=buildTransitScenarioContract({
    demand:{eastbound:8,westbound:0},
    flowMode:"one-way",
    trajectoryMode:"straight"
  });
  const counter=buildTransitScenarioContract({
    demand:{eastbound:8,westbound:8},
    flowMode:"counterflow",
    trajectoryMode:"straight"
  });

  assert.equal(oneWay.flowMode,"one-way");
  assert.equal(counter.flowMode,"counterflow");
  assert.equal(oneWay.trajectoryMode,"straight");
  assert.equal(counter.trajectoryMode,"straight");
  assert.ok(
    diffTransitScenarioContracts(oneWay,counter)
      .map(diff=>diff.axis)
      .includes("flowMode")
  );
});

test("S1-2A mismatched flow declaration is visible evidence, not silent rewriting",()=>{
  const mismatch=buildTransitScenarioContract({
    demand:{eastbound:5,westbound:5},
    flowMode:"one-way",
    trajectoryMode:"straight"
  });

  assert.deepEqual(mismatch.demand,{eastbound:5,westbound:5});
  assert.ok(mismatch.warnings.includes("FLOW_MODE_DEMAND_MISMATCH"));
});

test("S1-2A axis snapshot is explicit and contains no population-derived route geometry",()=>{
  const contract=buildTransitScenarioContract({
    demand:{eastbound:64,westbound:64},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });

  assert.deepEqual(transitScenarioAxisSnapshot(contract),{
    demand:{eastbound:64,westbound:64},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });

  const source=fs.readFileSync(
    new URL("../src/research/transit-scenario-contract.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/floor\s*\(.*demand|floor\s*\(.*population/i);
  assert.doesNotMatch(source,/waypoint|route|pillar|spawnSpacing/i);
});
