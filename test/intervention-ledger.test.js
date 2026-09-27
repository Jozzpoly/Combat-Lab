import test from "node:test";
import assert from "node:assert/strict";
import {
  INTERVENTION_EVENT_SCHEMA,
  INTERVENTION_LEDGER_SCHEMA,
  InterventionLedger
} from "../src/core/intervention-ledger.js";

test("intervention ledger preserves ordered structural provenance without a closed domain ontology",()=>{
  let now=1000;
  const ledger=new InterventionLedger({now:()=>now++});

  const requested={value:9999};
  const first=ledger.record({
    experimentId:"load-envelope-field-b0",
    simulationTime:12.5,
    operation:"set",
    effects:[{
      domain:"specimen",
      scope:"player",
      path:"forceMultiplier",
      before:42,
      after:100,
      requested
    }]
  });

  const second=ledger.record({
    experimentId:"custom-probe",
    simulationTime:12.75,
    operation:"action",
    effects:[{
      domain:"custom-domain-that-shared-lab-does-not-interpret",
      scope:"cohort:alpha",
      path:"pulse"
    }],
    detail:{actionId:"pulse"}
  });

  requested.value=0;

  assert.equal(first.schema,INTERVENTION_EVENT_SCHEMA);
  assert.equal(first.sequence,1);
  assert.equal(second.sequence,2);
  assert.equal(first.wallTimeMs,1000);
  assert.equal(second.wallTimeMs,1001);
  assert.equal(first.effects[0].requested.value,9999);

  const snapshot=ledger.snapshot();
  assert.equal(snapshot.schema,INTERVENTION_LEDGER_SCHEMA);
  assert.equal(snapshot.count,2);
  assert.equal(snapshot.events[1].effects[0].domain,"custom-domain-that-shared-lab-does-not-interpret");

  snapshot.events[0].effects[0].after=-1;
  assert.equal(ledger.entries()[0].effects[0].after,100);
});

test("intervention events may target an operation without pretending to snapshot the world",()=>{
  const ledger=new InterventionLedger({now:()=>123});
  const event=ledger.record({
    experimentId:"load-envelope-field-b0",
    simulationTime:4,
    operation:"reset-world",
    effects:[{
      domain:"world",
      scope:"active-experiment",
      path:"state"
    }],
    detail:{preservesAuthoredState:true}
  });

  assert.equal(event.effects.length,1);
  assert.equal(event.effects[0].domain,"world");
  assert.equal(Object.hasOwn(event.effects[0],"before"),false);
  assert.equal(Object.hasOwn(event.effects[0],"after"),false);
});
