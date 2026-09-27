import test from "node:test";
import assert from "node:assert/strict";
import {
  STATIC_LOCOMOTION_POLICIES,
  createStaticLocomotionState,
  staticLocomotionSnapshot,
  stepStaticLocomotionState
} from "../src/research/static-locomotion.js";

const DT=1/120;
const WORLD={width:800,height:500};
const WALL={id:"wall",x:500,y:80,w:40,h:340};

function state({position,desiredVelocity,policy,radius=20}){
  return createStaticLocomotionState({
    position,
    desiredVelocity,
    radius,
    world:WORLD,
    obstacles:[WALL],
    policy
  });
}

function run(instance,frames){
  for(let i=0;i<frames;i++) stepStaticLocomotionState(instance,DT);
  return staticLocomotionSnapshot(instance);
}

test("M1 baseline reproduces the exact tangent-plus-inward zero-fraction wall stick",()=>{
  const instance=state({
    position:{x:480,y:200},
    desiredVelocity:{x:20,y:100},
    policy:STATIC_LOCOMOTION_POLICIES.DISCARD_REMAINDER
  });

  const out=run(instance,60);

  assert.ok(out.totalContacts>=60);
  assert.ok(Math.abs(out.body.x-480)<1e-6);
  assert.ok(Math.abs(out.body.y-200)<1e-6);
  assert.equal(out.lastStep.firstHit.id,"wall");
  assert.ok(out.lastStep.firstHit.fraction<1e-8);
  assert.ok(Math.abs(out.lastStep.constrainedVelocity.x)<1e-9);
  assert.ok(out.lastStep.constrainedVelocity.y>99.9);
  assert.deepEqual(out.lastStep.residualDisplacement,{x:0,y:0});
});

test("M1 S1 preserves tangent motion while hard normal contact remains",()=>{
  const instance=state({
    position:{x:480,y:200},
    desiredVelocity:{x:20,y:100},
    policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
  });

  const out=run(instance,60);

  assert.ok(out.totalContacts>=60);
  assert.ok(Math.abs(out.body.x-480)<1e-5);
  assert.ok(out.body.y>245);
  assert.equal(out.lastStep.firstHit.id,"wall");
  assert.ok(out.lastStep.firstHit.fraction<1e-8);
  assert.ok(Math.abs(out.lastStep.finalVelocity.x)<1e-9);
  assert.ok(out.lastStep.finalVelocity.y>99.9);
  assert.equal(out.lastStep.finalOccupancy.clear,true);
  assert.ok(out.lastStep.finalDisplacement.y>0.8);
});

test("M1 S1 pure head-on intent remains a hard stop without invented tangent",()=>{
  const instance=state({
    position:{x:420,y:220},
    desiredVelocity:{x:140,y:0},
    policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
  });

  const out=run(instance,120);

  assert.ok(Math.abs(out.body.x-480)<2e-4);
  assert.ok(Math.abs(out.body.y-220)<1e-9);
  assert.ok(Math.abs(out.body.velocity.x)<1e-9);
  assert.ok(Math.abs(out.body.velocity.y)<1e-9);
  assert.equal(out.lastStep.finalOccupancy.clear,true);
});

test("M1 S1 oblique free-space impact becomes bounded wall slide rather than sticky stop",()=>{
  const baseline=state({
    position:{x:430,y:160},
    desiredVelocity:{x:140,y:70},
    policy:STATIC_LOCOMOTION_POLICIES.DISCARD_REMAINDER
  });
  const slide=state({
    position:{x:430,y:160},
    desiredVelocity:{x:140,y:70},
    policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
  });

  const frozen=run(baseline,120);
  const moving=run(slide,120);

  assert.ok(Math.abs(frozen.body.x-480)<2e-4);
  assert.ok(Math.abs(moving.body.x-480)<2e-4);
  assert.ok(moving.body.y>frozen.body.y+40);
  assert.equal(frozen.lastStep.finalOccupancy.clear,true);
  assert.equal(moving.lastStep.finalOccupancy.clear,true);
  assert.ok(moving.totalContacts>0);
});

test("M1 S1 is deterministic for the controlled oblique specimen",()=>{
  function specimen(){
    return run(state({
      position:{x:430,y:160},
      desiredVelocity:{x:140,y:70},
      policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
    }),120);
  }

  assert.deepEqual(specimen(),specimen());
});


test("M1-E S1 stops cleanly at a two-constraint corner without tunneling or obstacle-order authority",()=>{
  const vertical={id:"corner.vertical",x:500,y:80,w:40,h:340};
  const horizontal={id:"corner.horizontal",x:300,y:300,w:240,h:40};

  function specimen(obstacles){
    const instance=createStaticLocomotionState({
      position:{x:450,y:250},
      desiredVelocity:{x:140,y:140},
      radius:20,
      world:WORLD,
      obstacles,
      policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
    });
    return run(instance,120);
  }

  const forward=specimen([vertical,horizontal]);
  const reverse=specimen([horizontal,vertical]);

  assert.deepEqual(reverse,forward);
  assert.ok(Math.abs(forward.body.x-480)<2e-4);
  assert.ok(Math.abs(forward.body.y-280)<2e-4);
  assert.ok(forward.totalContacts>0);
  assert.ok(forward.totalResidualContacts>0);
  assert.equal(forward.lastStep.finalOccupancy.clear,true);
  assert.ok(forward.lastStep.firstHit);
  assert.ok(forward.lastStep.residualHit);
  assert.notEqual(forward.lastStep.firstHit.id,forward.lastStep.residualHit.id);
  assert.ok(Math.hypot(
    forward.lastStep.finalDisplacement.x,
    forward.lastStep.finalDisplacement.y
  )<1e-5);
});
