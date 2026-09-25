import test from "node:test";
import assert from "node:assert/strict";
import {ParameterSlotStore,formatParameterSlot} from "../src/core/parameter-state.js";

test("parameter slots are isolated per experiment and return copies",()=>{
  const slots=new ParameterSlotStore();
  slots.capture("s0","A",{scale:0.65});
  slots.capture("other","A",{mass:4});

  assert.deepEqual(slots.get("s0","A"),{scale:0.65});
  assert.deepEqual(slots.get("other","A"),{mass:4});
  assert.equal(slots.get("s0","B"),null);

  const copy=slots.get("s0","A");
  copy.scale=99;
  assert.deepEqual(slots.get("s0","A"),{scale:0.65});
});

test("parameter slot formatter remains compact and neutral",()=>{
  assert.equal(formatParameterSlot(null,{scale:"Body scale"}),"Empty");
  assert.equal(
    formatParameterSlot({scale:1.7},{scale:"Body scale"}),
    "Body scale 1.70"
  );
  assert.match(
    formatParameterSlot({scale:1,mass:4,drive:2},{scale:"Scale",mass:"Mass",drive:"Drive"}),
    /^Scale 1\.00 · Mass 4\.00 · \+1$/
  );
});
