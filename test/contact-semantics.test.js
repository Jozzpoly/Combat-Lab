import test from "node:test";
import assert from "node:assert/strict";
import {
  contactOutcomeSnapshot,
  createContactBody,
  createHeadOnContactState,
  resolveCandidateContactPair,
  stepContactWorld,
  stepHeadOnContactState
} from "../src/research/contact-semantics.js";

function runHeadOn(options={}){
  const state=createHeadOnContactState(options);
  for(let i=0;i<600 && state.status!=="COMPLETE";i++){
    stepHeadOnContactState(state,1/120);
  }
  return contactOutcomeSnapshot(state);
}

test("C0 equal bodies with equal opposed intent produce a centered persistent hold",()=>{
  const out=runHeadOn();
  assert.equal(out.status,"COMPLETE");
  assert.ok(out.firstContactTime>2);
  assert.ok(out.contactPairSteps>100);
  assert.ok(Math.abs(out.midpointShift)<1e-6);
  assert.ok(Math.abs(out.separation-72)<1e-6);
});

test("C0 explicit contact resistance changes who yields without changing inertial mass",()=>{
  const equal=runHeadOn();
  const aYields=runHeadOn({
    a:{contactResistance:0.25},
    b:{contactResistance:4}
  });
  const bYields=runHeadOn({
    a:{contactResistance:4},
    b:{contactResistance:0.25}
  });

  assert.equal(aYields.bodies.A.mass,1);
  assert.equal(aYields.bodies.B.mass,1);
  assert.ok(aYields.midpointShift<equal.midpointShift-5);
  assert.ok(bYields.midpointShift>equal.midpointShift+5);
  assert.ok(Math.abs(aYields.midpointShift+bYields.midpointShift)<1e-5);
});

test("C0 inertial mass remains independently causal at equal resistance",()=>{
  const out=runHeadOn({
    a:{mass:5},
    b:{mass:1}
  });
  assert.equal(out.bodies.A.contactResistance,1);
  assert.equal(out.bodies.B.contactResistance,1);
  assert.ok(out.midpointShift>100);
});

test("C0 motor authority remains independently causal at equal mass and resistance",()=>{
  const out=runHeadOn({
    a:{motorAuthority:4},
    b:{motorAuthority:0.5}
  });
  assert.equal(out.bodies.A.mass,1);
  assert.equal(out.bodies.B.mass,1);
  assert.equal(out.bodies.A.contactResistance,1);
  assert.equal(out.bodies.B.contactResistance,1);
  assert.ok(out.midpointShift>150);
});

test("C0 pair correction reports explicit yielding shares",()=>{
  const a=createContactBody({
    id:"A",position:{x:0,y:0},radius:10,mass:1,
    contactResistance:0.25,desiredVelocity:{x:0,y:0}
  });
  const b=createContactBody({
    id:"B",position:{x:15,y:0},radius:10,mass:1,
    contactResistance:4,desiredVelocity:{x:0,y:0}
  });
  const contact=resolveCandidateContactPair(a,b);

  assert.ok(contact);
  assert.ok(contact.correction.a>contact.correction.b*10);
  assert.ok(Math.abs((contact.correction.a+contact.correction.b)-5)<1e-9);
});

function threeBody(order,iterations){
  const state={
    time:0,
    bodies:[
      createContactBody({
        id:"A",position:{x:400,y:300},radius:35,mass:1,
        motorAuthority:1,desiredVelocity:{x:140,y:0}
      }),
      createContactBody({
        id:"B",position:{x:700,y:300},radius:35,mass:1,
        motorAuthority:0.0001,desiredVelocity:{x:0,y:0}
      }),
      createContactBody({
        id:"C",position:{x:1000,y:300},radius:35,mass:1,
        motorAuthority:1,desiredVelocity:{x:-140,y:0}
      })
    ],
    contactPairsThisStep:0,totalContactPairSteps:0,lastContacts:[]
  };
  for(let i=0;i<600;i++) stepContactWorld(state,1/120,{iterations,pairOrder:order});
  return state.bodies.map(body=>body.x);
}

test("C0 iterative solve materially suppresses multi-body pair-order artifact",()=>{
  const oneForward=threeBody("forward",1);
  const oneReverse=threeBody("reverse",1);
  const eightForward=threeBody("forward",8);
  const eightReverse=threeBody("reverse",8);

  const oneError=Math.max(...oneForward.map((x,i)=>Math.abs(x-oneReverse[i])));
  const eightError=Math.max(...eightForward.map((x,i)=>Math.abs(x-eightReverse[i])));

  assert.ok(oneError>0.01);
  assert.ok(eightError<1e-4);
  assert.ok(eightError<oneError/100);
});

test("C0 candidate remains finite under strong but legal body asymmetry",()=>{
  const out=runHeadOn({
    a:{mass:20,motorAuthority:10,contactResistance:10},
    b:{mass:0.1,motorAuthority:0.1,contactResistance:0.1}
  });
  for(const body of Object.values(out.bodies)){
    for(const value of [
      body.x,body.y,body.vx,body.vy,body.mass,
      body.motorAuthority,body.contactResistance,body.acceleration
    ]) assert.ok(Number.isFinite(value));
  }
  assert.ok(Number.isFinite(out.midpointShift));
});
