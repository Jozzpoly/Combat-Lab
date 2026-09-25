import test from "node:test";
import assert from "node:assert/strict";
import {embodiedScaleFieldV0,bodyFromScale} from "../experiments/embodied-scale-field-v0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};

test("S0 inspector exposes scale as authored and consequences as derived",()=>{
  const instance=embodiedScaleFieldV0.create();
  assert.equal(instance.inspector.get("scale"),1);

  instance.inspector.set("scale",3.25);
  const snap=instance.snapshot();
  assert.equal(snap.player.scale,3.25);
  assert.equal(instance.inspector.getLive("radius"),snap.player.r);
  assert.equal(instance.inspector.getLive("mass"),snap.player.mass);
  assert.ok(snap.player.mass>1);
});

test("world reset preserves authored scale while restore defaults resets it",()=>{
  const instance=embodiedScaleFieldV0.create();
  instance.inspector.set("scale",2.75);
  instance.step({...idle,keys:["KeyD"]},0.2);
  assert.notEqual(instance.snapshot().player.x,175);

  instance.reset();
  const afterWorldReset=instance.snapshot();
  assert.equal(afterWorldReset.player.x,175);
  assert.equal(afterWorldReset.player.scale,2.75);

  instance.inspector.restoreDefaults();
  assert.equal(instance.snapshot().player.scale,1);
});

test("S0 safety rails are intentionally much wider than its anchor range",()=>{
  assert.equal(bodyFromScale(0.05).scale,0.05);
  assert.equal(bodyFromScale(8).scale,8);
  assert.equal(bodyFromScale(-10).scale,0.05);
  assert.equal(bodyFromScale(100).scale,8);
});


test("S0 extreme safety-rail bodies remain finite under live world movement",()=>{
  for(const scale of [0.05,8]){
    const instance=embodiedScaleFieldV0.create();
    instance.inspector.set("scale",scale);

    for(let i=0;i<3000;i++){
      const keys=[];
      if(i%480<240) keys.push("KeyD");
      else keys.push("KeyS");
      instance.step({...idle,keys},1/120);
    }

    const snap=instance.snapshot();
    for(const value of [
      snap.player.x,snap.player.y,snap.player.vx,snap.player.vy,
      snap.player.r,snap.player.mass,snap.player.acceleration,
      snap.player.braking,snap.player.maxSpeed
    ]){
      assert.ok(Number.isFinite(value),`non-finite value at scale ${scale}`);
    }
    assert.equal(snap.player.scale,scale);
  }
});
