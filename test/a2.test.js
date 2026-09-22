import test from "node:test";
import assert from "node:assert/strict";

import { createA2PairState, runA2Policy } from "../src/pair-rehearsal.js";

test("A2 pair state contains one light and one heavy adversary under shared simulation",()=>{
  const state=createA2PairState();
  assert.deepEqual(
    new Set(state.adversaries.map(x=>x.id)),
    new Set(["light","heavy"])
  );
  assert.equal(state.adversaries.length,2);
  assert.equal(state.result,"active");
});

test("A2 open-field policy matrix asks whether pair creates more than two health bars",()=>{
  const policies=[
    "nearest-mash",
    "retreat-all",
    "orbit-nearest",
    "focus-light",
    "focus-heavy",
    "pair-reader"
  ];
  const result={};

  for(const policy of policies){
    result[policy]=runA2Policy(policy);
  }

  console.log("A2_OPEN_PAIR_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
  }
});

test("A2 has no world obstacle available to manufacture pair value",()=>{
  const state=createA2PairState();
  assert.equal(state.world.walls.length,0);
});
