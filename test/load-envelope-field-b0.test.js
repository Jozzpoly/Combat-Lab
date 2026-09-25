import test from "node:test";
import assert from "node:assert/strict";
import {
  createLoadEnvelopeState,
  deriveEmbodiment,
  loadEnvelopeFieldB0,
  resolveBodyPair,
  setEmbodimentParameter,
  stepLoadEnvelopeField
} from "../experiments/load-envelope-field-b0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};
const right={...idle,keys:["KeyD"]};

test("B0 envelope is independent from mass and locomotor force",()=>{
  const a=deriveEmbodiment({envelope:0.65,bodyMass:1.5,loadMass:2,forceMultiplier:1.25});
  const b=deriveEmbodiment({envelope:1.70,bodyMass:1.5,loadMass:2,forceMultiplier:1.25});

  assert.notEqual(a.radius,b.radius);
  assert.equal(a.totalMass,b.totalMass);
  assert.equal(a.acceleration,b.acceleration);
  assert.equal(a.maxSpeed,b.maxSpeed);
});

test("B0 carried load changes inertia without changing envelope",()=>{
  const unloaded=deriveEmbodiment({envelope:1,bodyMass:1,loadMass:0,forceMultiplier:1});
  const loaded=deriveEmbodiment({envelope:1,bodyMass:1,loadMass:4,forceMultiplier:1});

  assert.equal(unloaded.radius,loaded.radius);
  assert.ok(loaded.totalMass>unloaded.totalMass);
  assert.ok(loaded.acceleration<unloaded.acceleration);
  assert.equal(unloaded.maxSpeed,loaded.maxSpeed);
});

test("B0 identical total mass currently ignores body-vs-load distribution",()=>{
  const bodyHeavy=deriveEmbodiment({bodyMass:4,loadMass:1,forceMultiplier:1});
  const loadHeavy=deriveEmbodiment({bodyMass:1,loadMass:4,forceMultiplier:1});

  assert.equal(bodyHeavy.totalMass,loadHeavy.totalMass);
  assert.equal(bodyHeavy.acceleration,loadHeavy.acceleration);
  assert.equal(bodyHeavy.maxSpeed,loadHeavy.maxSpeed);
});

test("B0 locomotor force changes acceleration without changing mass or envelope",()=>{
  const weak=deriveEmbodiment({envelope:1,bodyMass:2,loadMass:1,forceMultiplier:0.5});
  const strong=deriveEmbodiment({envelope:1,bodyMass:2,loadMass:1,forceMultiplier:2});

  assert.equal(weak.radius,strong.radius);
  assert.equal(weak.totalMass,strong.totalMass);
  assert.ok(strong.acceleration>weak.acceleration);
});

test("same actor with more carried load accelerates more slowly under same input",()=>{
  const light=createLoadEnvelopeState({contacts:false});
  const heavy=createLoadEnvelopeState({contacts:false});
  setEmbodimentParameter(light,"loadMass",0);
  setEmbodimentParameter(heavy,"loadMass",4);

  for(let i=0;i<36;i++){
    stepLoadEnvelopeField(light,right,1/120);
    stepLoadEnvelopeField(heavy,right,1/120);
  }

  assert.ok(light.player.vx>heavy.player.vx);
  assert.equal(light.player.r,heavy.player.r);
});

test("reference choke fit depends on envelope rather than total mass",()=>{
  const smallHeavy=createLoadEnvelopeState({contacts:false});
  const largeLight=createLoadEnvelopeState({contacts:false});

  setEmbodimentParameter(smallHeavy,"envelope",0.65);
  setEmbodimentParameter(smallHeavy,"bodyMass",10);
  setEmbodimentParameter(smallHeavy,"forceMultiplier",8);

  setEmbodimentParameter(largeLight,"envelope",1.70);
  setEmbodimentParameter(largeLight,"bodyMass",0.10);
  setEmbodimentParameter(largeLight,"forceMultiplier",0.25);

  for(let i=0;i<1800;i++){
    stepLoadEnvelopeField(smallHeavy,right,1/120);
    stepLoadEnvelopeField(largeLight,right,1/120);
  }

  assert.ok(smallHeavy.player.x>470,"small-heavy actor should clear the reference opening");
  assert.ok(largeLight.player.x<400,"large-light actor should remain excluded by envelope");
});

test("more total mass yields less velocity change in equal body contact",()=>{
  const light={x:0,y:0,vx:100,vy:0,r:18,mass:1};
  const targetA={x:34,y:0,vx:0,vy:0,r:18,mass:1.5};
  resolveBodyPair(light,targetA);
  const lightDelta=Math.abs(light.vx-100);

  const heavy={x:0,y:0,vx:100,vy:0,r:18,mass:5};
  const targetB={x:34,y:0,vx:0,vy:0,r:18,mass:1.5};
  resolveBodyPair(heavy,targetB);
  const heavyDelta=Math.abs(heavy.vx-100);

  assert.ok(lightDelta>heavyDelta);
});

test("B0 Workbench reset preserves all authored parameters",()=>{
  const instance=loadEnvelopeFieldB0.create();
  instance.inspector.set("envelope",1.4);
  instance.inspector.set("bodyMass",2.2);
  instance.inspector.set("loadMass",3.3);
  instance.inspector.set("forceMultiplier",1.6);

  instance.step(right,0.2);
  instance.reset();
  const p=instance.snapshot().player;

  assert.equal(p.envelope,1.4);
  assert.equal(p.bodyMass,2.2);
  assert.equal(p.loadMass,3.3);
  assert.equal(p.forceMultiplier,1.6);
  assert.equal(p.x,165);
});

test("B0 extreme safety rails remain finite during long mixed movement",()=>{
  const instance=loadEnvelopeFieldB0.create();
  instance.inspector.set("envelope",4.5);
  instance.inspector.set("bodyMass",0.05);
  instance.inspector.set("loadMass",40);
  instance.inspector.set("forceMultiplier",8);

  for(let i=0;i<5000;i++){
    const keys=[];
    const phase=i%960;
    if(phase<240) keys.push("KeyD");
    else if(phase<480) keys.push("KeyS");
    else if(phase<720) keys.push("KeyA");
    else keys.push("KeyW");
    instance.step({...idle,keys},1/120);
  }

  const p=instance.snapshot().player;
  for(const value of [
    p.x,p.y,p.vx,p.vy,p.r,p.bodyMass,p.loadMass,p.totalMass,
    p.forceMultiplier,p.acceleration,p.braking,p.maxSpeed
  ]){
    assert.ok(Number.isFinite(value));
  }
});


test("more mass can preserve locomotor response when force rises proportionally",()=>{
  const baseline=deriveEmbodiment({envelope:1,bodyMass:1,loadMass:0,forceMultiplier:1});
  const heavyStrong=deriveEmbodiment({envelope:1,bodyMass:2,loadMass:0,forceMultiplier:2});

  assert.equal(baseline.radius,heavyStrong.radius);
  assert.equal(baseline.acceleration,heavyStrong.acceleration);
  assert.equal(baseline.maxSpeed,heavyStrong.maxSpeed);
  assert.ok(heavyStrong.totalMass>baseline.totalMass);

  const a=createLoadEnvelopeState({contacts:false});
  const b=createLoadEnvelopeState({contacts:false});
  setEmbodimentParameter(b,"bodyMass",2);
  setEmbodimentParameter(b,"forceMultiplier",2);

  for(let i=0;i<120;i++){
    stepLoadEnvelopeField(a,right,1/120);
    stepLoadEnvelopeField(b,right,1/120);
  }

  assert.ok(Math.abs(a.player.vx-b.player.vx)<1e-9);
  assert.ok(Math.abs(a.player.x-b.player.x)<1e-9);
});

test("vector locomotor authority is directionally isotropic",()=>{
  const cardinal=createLoadEnvelopeState({contacts:false});
  const diagonal=createLoadEnvelopeState({contacts:false});
  const diag={...idle,keys:["KeyD","KeyS"]};

  for(let i=0;i<12;i++){
    stepLoadEnvelopeField(cardinal,right,1/120);
    stepLoadEnvelopeField(diagonal,diag,1/120);
  }

  const cardinalSpeed=Math.hypot(cardinal.player.vx,cardinal.player.vy);
  const diagonalSpeed=Math.hypot(diagonal.player.vx,diagonal.player.vy);
  assert.ok(Math.abs(cardinalSpeed-diagonalSpeed)<1e-9);
});
