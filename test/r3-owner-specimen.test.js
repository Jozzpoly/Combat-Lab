import test from "node:test";
import assert from "node:assert/strict";

import {
  createOwnerSpecimenState,
  movementFromKeys,
  partnerGuideAt,
  stepOwnerSpecimen
} from "../src/r3-owner-specimen.js";

test("Owner specimen WASD mapping is ordinary and diagonal-capable",()=>{
  assert.deepEqual(movementFromKeys(new Set(["KeyW","KeyD"])),{x:1,y:-1});
  assert.deepEqual(movementFromKeys(new Set(["KeyA","KeyS"])),{x:-1,y:1});
  assert.deepEqual(movementFromKeys(new Set()),{x:0,y:0});
});

test("Owner specimen partner guide is deterministic, finite and player-independent",()=>{
  for(const t of [0,0.25,1,3.7,20]){
    const first=partnerGuideAt(t);
    const second=partnerGuideAt(t);
    assert.equal(first,second);
    assert.ok(Number.isFinite(first));
    assert.ok(first>Math.PI-1.1);
    assert.ok(first<Math.PI);
  }
});

test("Owner specimen writes human GUIDE into the qualified R3 state without neutral reset",()=>{
  const state=createOwnerSpecimenState();
  const target=-0.91;

  for(let i=0;i<30;i++){
    stepOwnerSpecimen(state,{
      guideAngle:target,
      moveX:0,
      moveY:0
    });
  }

  assert.equal(state.a.tool.guideAngle,target);
  assert.notEqual(state.a.tool.angle,0.78);
  assert.ok(Number.isFinite(state.a.tool.angularVelocity));
});

test("Owner specimen COMMIT starts from current inherited state instead of canonicalizing pose",()=>{
  const state=createOwnerSpecimenState();

  for(let i=0;i<24;i++){
    stepOwnerSpecimen(state,{guideAngle:-0.45});
  }
  const before=state.a.tool.angle;

  stepOwnerSpecimen(state,{
    guideAngle:0.36,
    commit:true
  });

  assert.ok(state.a.tool.action);
  assert.equal(state.a.tool.action.angle,0.36);
  assert.ok(Math.abs(state.a.tool.angle-before)<0.2);
});


test("Owner specimen starts outside contact and does not auto-create the relation",()=>{
  const state=createOwnerSpecimenState();

  for(let i=0;i<120;i++){
    stepOwnerSpecimen(state,{
      guideAngle:state.a.tool.guideAngle,
      moveX:0,
      moveY:0
    });
  }

  assert.equal(state.contact.frames,0);
  assert.equal(state.contact.engaged,false);
});
