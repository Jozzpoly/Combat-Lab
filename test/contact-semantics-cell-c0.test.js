import test from "node:test";
import assert from "node:assert/strict";
import {contactSemanticsCellC0} from "../experiments/contact-semantics-cell-c0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};

function complete(instance){
  for(let i=0;i<600 && instance.snapshot().status!=="COMPLETE";i++){
    instance.step(idle,1/120);
  }
  return instance.snapshot();
}

test("C0 experiment equal defaults produce centered hold evidence",()=>{
  const instance=contactSemanticsCellC0.create();
  const out=complete(instance);

  assert.equal(out.status,"COMPLETE");
  assert.ok(out.contactPairSteps>100);
  assert.ok(Math.abs(out.midpointShift)<1e-6);
  assert.deepEqual(out.bodies.A.desiredVelocity,{x:140,y:0});
  assert.deepEqual(out.bodies.B.desiredVelocity,{x:-140,y:0});
});

test("C0 contact resistance remains independently authorable from mass and motor authority",()=>{
  const instance=contactSemanticsCellC0.create();
  instance.inspector.set("aContactResistance",0.25);
  instance.inspector.set("bContactResistance",4);

  assert.equal(instance.inspector.get("aMass"),1);
  assert.equal(instance.inspector.get("aMotorAuthority"),1);
  assert.equal(instance.inspector.get("bMass"),1);
  assert.equal(instance.inspector.get("bMotorAuthority"),1);

  instance.reset();
  const out=complete(instance);
  assert.ok(out.midpointShift<-5);
});

test("C0 Reset World preserves authored candidate contact parameters",()=>{
  const instance=contactSemanticsCellC0.create();
  instance.inspector.set("aMass",5);
  instance.inspector.set("aMotorAuthority",2);
  instance.inspector.set("aContactResistance",3);
  for(let i=0;i<300;i++) instance.step(idle,1/120);

  instance.reset();
  assert.equal(instance.inspector.get("aMass"),5);
  assert.equal(instance.inspector.get("aMotorAuthority"),2);
  assert.equal(instance.inspector.get("aContactResistance"),3);
  assert.equal(instance.snapshot().time,0);
});

test("C0 causal query keeps desired motion and physical contact outcome separate",()=>{
  const instance=contactSemanticsCellC0.create();
  for(let i=0;i<400;i++) instance.step(idle,1/120);
  const before=instance.snapshot();
  const causal=instance.query("contact-causal-state");
  const after=instance.snapshot();

  assert.deepEqual(after,before);
  assert.equal(causal.bodies.A.desiredVelocity.x,140);
  assert.equal(causal.bodies.B.desiredVelocity.x,-140);
  assert.ok(causal.contactPairSteps>0);
  assert.ok(Number.isFinite(causal.midpointShift));
});
