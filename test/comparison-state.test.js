import test from "node:test";
import assert from "node:assert/strict";
import {
  ComparisonSlotStore,
  buildComparisonSnapshot,
  comparisonSnapshotState,
  comparisonSnapshotScopes,
  diffComparisonSnapshots,
  formatComparisonDiff,
  formatComparisonSlot
} from "../src/core/comparison-state.js";

const descriptors=[
  {id:"mass",label:"Mass",domain:"specimen",scope:"player",path:"mass"},
  {id:"force",label:"Force",domain:"specimen",scope:"player",path:"force"},
  {id:"camera",label:"Camera zoom",domain:"apparatus",scope:"view",path:"zoom"}
];

const definition={
  id:"player-phenotype",
  label:"Player phenotype",
  controlIds:["mass","force"],
  applySemantics:"Apply changes specimen/player only; world remains live.",
  matchedStartHint:"Reset World separately when a matched start matters."
};

test("scoped comparison captures only experiment-declared fields rather than every editable field",()=>{
  const snapshot=buildComparisonSnapshot({
    experimentId:"probe",
    simulationTime:5,
    definition,
    descriptors,
    values:{mass:2,force:4,camera:0.5}
  });

  assert.deepEqual(snapshot.fields.map(field=>field.controlId),["mass","force"]);
  assert.deepEqual(comparisonSnapshotScopes(snapshot),["specimen/player"]);
  assert.deepEqual(comparisonSnapshotState(snapshot),{mass:2,force:4});
  assert.equal(snapshot.fields.some(field=>field.controlId==="camera"),false);
});

test("comparison diff is structural, explicit and human-readable before apply",()=>{
  const a=buildComparisonSnapshot({
    experimentId:"probe",definition,descriptors,values:{mass:1,force:2,camera:1}
  });
  const b=buildComparisonSnapshot({
    experimentId:"probe",definition,descriptors,values:{mass:3,force:2,camera:0.5}
  });

  assert.deepEqual(diffComparisonSnapshots(a,b),[{
    controlId:"mass",label:"Mass",domain:"specimen",scope:"player",path:"mass",before:1,after:3
  }]);
  assert.match(formatComparisonSlot(a),/Player phenotype · specimen\/player · 2 fields/);
  assert.equal(formatComparisonDiff(a,b),"A↔B · Mass 1.00 → 3.00");
});

test("comparison store returns copies and rejects cross-experiment capture",()=>{
  const snapshot=buildComparisonSnapshot({
    experimentId:"probe",definition,descriptors,values:{mass:1,force:2,camera:1}
  });
  const store=new ComparisonSlotStore();
  store.capture("probe","A",snapshot);
  const copy=store.get("probe","A");
  copy.fields[0].value=99;
  assert.equal(store.get("probe","A").fields[0].value,1);
  assert.throws(()=>store.capture("other","A",snapshot),/mismatch/);
});

test("comparison definition fails closed when it references undeclared editable state",()=>{
  assert.throws(
    ()=>buildComparisonSnapshot({
      experimentId:"probe",
      definition:{...definition,controlIds:["mass","missing"]},
      descriptors,
      values:{mass:1,missing:2}
    }),
    /missing descriptor/
  );
});
