import test from "node:test";
import assert from "node:assert/strict";

import {
  HEAVY_CRUSHER_SPEC,
  LIGHT_STRIKER_SPEC,
  interpolateAdversarySpec
} from "../src/anchors.js";
import { createAdversary, adversaryThreatSegment } from "../src/adversary.js";
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

test("A1 action model belongs to equipment contract rather than body identity",()=>{
  const lightSweep={
    body:LIGHT_STRIKER_SPEC.body,
    attack:HEAVY_CRUSHER_SPEC.attack
  };
  const heavyDash={
    body:HEAVY_CRUSHER_SPEC.body,
    attack:LIGHT_STRIKER_SPEC.attack
  };

  const a=createAdversary(lightSweep,{id:"a",x:300,y:300,facing:0});
  const b=createAdversary(heavyDash,{id:"b",x:300,y:300,facing:0});

  assert.equal(a.adversarySpec.attack.model,"sweep-arc");
  assert.equal(b.adversarySpec.attack.model,"dash-line");
  assert.equal(a.spec, LIGHT_STRIKER_SPEC.body);
  assert.equal(b.spec, HEAVY_CRUSHER_SPEC.body);
});

test("A1 sweep geometry actually rotates while dash geometry stays locked",()=>{
  const dash=createAdversary(LIGHT_STRIKER_SPEC,{
    id:"dash",
    x:300,
    y:300,
    facing:0
  });
  dash.mode="commit";
  dash.commitFacing=0;
  dash.commitX=1;
  dash.commitY=0;
  dash.commitElapsed=0.03;

  const d0=adversaryThreatSegment(dash);
  dash.commitElapsed=0.14;
  const d1=adversaryThreatSegment(dash);
  assert.ok(Math.abs(d1.angle-d0.angle)<1e-9);

  const sweep=createAdversary(HEAVY_CRUSHER_SPEC,{
    id:"sweep",
    x:300,
    y:300,
    facing:0
  });
  sweep.mode="commit";
  sweep.commitFacing=0;
  sweep.commitElapsed=0.03;
  const s0=adversaryThreatSegment(sweep);
  sweep.commitElapsed=0.38;
  const s1=adversaryThreatSegment(sweep);

  assert.ok(Math.abs(s1.angle-s0.angle)>1.0);
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

test("A1 open-field matrix removes route blocker before judging adversary identity",()=>{
  const openWorld={
    width:1200,
    height:900,
    inset:28,
    walls:[]
  };
  const playerStart={x:600,y:650,facing:-Math.PI/2};
  const adversaryStart={id:"enemy",x:600,y:250,facing:Math.PI/2};
  const policies=[
    "chase-mash",
    "retreat-strike",
    "orbit-strike",
    "stand-mash",
    "phase-reader",
    "backstep-reader"
  ];

  const result={light:{},heavy:{}};
  for(const policy of policies){
    result.light[policy]=runA1Policy(LIGHT_STRIKER_SPEC,policy,{
      world:openWorld,
      playerStart,
      adversaryStart
    });
    result.heavy[policy]=runA1Policy(HEAVY_CRUSHER_SPEC,policy,{
      world:openWorld,
      playerStart,
      adversaryStart
    });
  }

  console.log("A1_OPEN_FIELD_MATRIX",JSON.stringify(result));

  for(const family of Object.values(result)){
    for(const value of Object.values(family)){
      assert.equal(value.finite,true);
    }
  }
});

test("A1 policy matrix checks whether light and heavy already provoke different strategy",()=>{
  const policies=[
    "chase-mash",
    "retreat-strike",
    "orbit-strike",
    "stand-mash",
    "phase-reader",
    "backstep-reader"
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
  assert.notEqual(HEAVY_CRUSHER_SPEC.attack.model,LIGHT_STRIKER_SPEC.attack.model);
  assert.ok(HEAVY_CRUSHER_SPEC.attack.sweepArc>2);
  assert.equal(LIGHT_STRIKER_SPEC.attack.sweepArc,0);
  assert.ok(HEAVY_CRUSHER_SPEC.attack.recover>LIGHT_STRIKER_SPEC.attack.recover);
});
