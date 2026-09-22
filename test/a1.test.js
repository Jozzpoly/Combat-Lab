import test from "node:test";
import assert from "node:assert/strict";

import {
  HEAVY_CRUSHER_SPEC,
  LIGHT_STRIKER_SPEC,
  interpolateAdversarySpec
} from "../src/anchors.js";
import { runA1Policy } from "../src/rehearsal.js";

test("A1 anchors share HP and schema rather than role-specific survivability",()=>{
  assert.equal(LIGHT_STRIKER_SPEC.body.hp,HEAVY_CRUSHER_SPEC.body.hp);
  assert.deepEqual(
    Object.keys(LIGHT_STRIKER_SPEC.body).sort(),
    Object.keys(HEAVY_CRUSHER_SPEC.body).sort()
  );
  assert.deepEqual(
    Object.keys(LIGHT_STRIKER_SPEC.attack).sort(),
    Object.keys(HEAVY_CRUSHER_SPEC.attack).sort()
  );
  assert.equal(Object.hasOwn(LIGHT_STRIKER_SPEC,"role"),false);
  assert.equal(Object.hasOwn(HEAVY_CRUSHER_SPEC,"role"),false);
});

test("A1 anchor interpolation remains finite between extremes",()=>{
  for(const t of [0,0.25,0.5,0.75,1]){
    const spec=interpolateAdversarySpec(
      LIGHT_STRIKER_SPEC,
      HEAVY_CRUSHER_SPEC,
      t
    );
    for(const group of [spec.body,spec.attack]){
      assert.equal(Object.values(group).filter(x=>typeof x==="number").every(Number.isFinite),true);
    }
  }
});

test("A1 policy matrix checks whether light and heavy already provoke different strategy",()=>{
  const policies=[
    "chase-mash",
    "retreat-strike",
    "orbit-strike",
    "stand-mash",
    "phase-reader"
  ];
  const result={light:{},heavy:{}};

  for(const policy of policies){
    result.light[policy]=runA1Policy(LIGHT_STRIKER_SPEC,policy);
    result.heavy[policy]=runA1Policy(HEAVY_CRUSHER_SPEC,policy);
  }

  console.log("A1_POLICY_MATRIX",JSON.stringify(result));

  for(const family of Object.values(result)){
    for(const value of Object.values(family)){
      assert.equal(value.finite,true);
    }
  }
});

test("A1 anchors are mechanically distinct without HP difference",()=>{
  assert.ok(LIGHT_STRIKER_SPEC.body.maxSpeed>HEAVY_CRUSHER_SPEC.body.maxSpeed*1.5);
  assert.ok(LIGHT_STRIKER_SPEC.body.turnRate>HEAVY_CRUSHER_SPEC.body.turnRate*2);
  assert.ok(HEAVY_CRUSHER_SPEC.body.mass>LIGHT_STRIKER_SPEC.body.mass*2.5);
  assert.ok(HEAVY_CRUSHER_SPEC.body.radius>LIGHT_STRIKER_SPEC.body.radius+8);
  assert.ok(HEAVY_CRUSHER_SPEC.attack.windup>LIGHT_STRIKER_SPEC.attack.windup*2);
  assert.ok(HEAVY_CRUSHER_SPEC.attack.halfWidth>LIGHT_STRIKER_SPEC.attack.halfWidth*2);
  assert.ok(HEAVY_CRUSHER_SPEC.attack.recover>LIGHT_STRIKER_SPEC.attack.recover);
});
