import test from "node:test";
import assert from "node:assert/strict";
import { MORPHS, localResponse, finiteDrive, finiteGrip, finiteBrace, wrap } from "../src/organism-law.js";
const fresh=()=>({age:0,pressure:0,recover:0,turnSide:1,recoveries:0});
test("physically distinct shapes and motor authorities are declared independently",()=>{
 assert.equal(Object.keys(MORPHS).length,4);
 assert.ok(MORPHS.worm.muscleForce>0);
 assert.ok(MORPHS.worm.supportForce>0);
 assert.ok(MORPHS.dart.width<MORPHS.broad.width);
 assert.ok(MORPHS.dart.speed>MORPHS.broad.speed);
 assert.ok(MORPHS.broad.mass>MORPHS.dart.mass);
});
test("local response ignores isolated nonblocking touch",()=>{
 let s=fresh();
 for(let i=0;i<30;i++){
  const r=localResponse(s,{touch:true,progress:.9});
  s=r.state;
 }
 assert.equal(s.recoveries,0);
});
test("sustained actual obstruction starts bounded private recovery",()=>{
 let s=fresh(), r;
 for(let i=0;i<14;i++){
  r=localResponse(s,{touch:true,progress:0});s=r.state;
 }
 assert.equal(s.recoveries,1);
 assert.equal(s.turnSide,-1);
 assert.ok(r.throttle<0);
});
test("recovery eventually gives way to ordinary local motion",()=>{
 let s=fresh();
 for(let i=0;i<14;i++)s=localResponse(s,{touch:true,progress:0}).state;
 let r;
 for(let i=0;i<70;i++){r=localResponse(s,{touch:false,progress:1});s=r.state;}
 assert.equal(s.recover,0);
 assert.ok(r.throttle>0);
});
test("finite external traction cannot produce motor impulse when absent",()=>{
 const args={mass:50,velocity:{x:0,y:0},heading:0,input:1,
  speed:5,acceleration:20,braking:20};
 const no=finiteDrive({...args,traction:0});
 const yes=finiteDrive({...args,traction:1});
 assert.equal(no.x,0);assert.equal(no.y,0);
 assert.ok(yes.x>0 && yes.x<=50*20/60+1e-9);
});
test("zero motor command creates finite braking, not teleport",()=>{
 const got=finiteDrive({mass:30,velocity:{x:3,y:0},heading:0,
   input:0,speed:5,acceleration:15,braking:20,traction:1});
 assert.ok(got.x<0 && got.x>=-30*20/60-1e-9);
});
test("angle math handles ±PI wrapping",()=>{
 assert.ok(Math.abs(wrap(Math.PI*2-.05)+.05)<1e-9);
});

test("finite point-grip never exceeds declared per-step impulse",()=>{
 const r=finiteGrip({playerMass:20,objectMass:500,anchorVelocity:{x:0,y:0},
   targetError:{x:6,y:9},maxForce:30,dt:1/60});
 assert.ok(Math.abs(Math.hypot(r.x,r.y)-.5)<1e-9);
});
test("zero grip authority cannot move matter by intent",()=>{
 const r=finiteGrip({playerMass:20,objectMass:30,anchorVelocity:{x:0,y:0},
   targetError:{x:1,y:0},maxForce:0});
 assert.deepEqual(r,{x:0,y:0});
});
test("no-grip error and velocity produce no phantom impulse",()=>{
 const r=finiteGrip({playerMass:20,objectMass:30,anchorVelocity:{x:0,y:0},
   targetError:{x:0,y:0},maxForce:200});
 assert.deepEqual(r,{x:0,y:0});
});
test("nonphysical grip params are explicitly rejected",()=>{
 assert.throws(()=>finiteGrip({playerMass:20,objectMass:-1,
  anchorVelocity:{x:0,y:0},targetError:{x:1,y:0},maxForce:20}),RangeError);
});

test("zero front or rear drive allocation cannot create NaN impulse",()=>{
 const f=finiteDrive({mass:0,velocity:{x:0,y:0},heading:0,
   input:1,speed:3,acceleration:10,braking:10,traction:1});
 assert.deepEqual(f,{x:0,y:0});
});
test("negative allocated mass is visibly invalid",()=>{
 assert.throws(()=>finiteDrive({mass:-1,velocity:{x:0,y:0},heading:0,
   input:1,speed:3,acceleration:10,braking:10,traction:1}),RangeError);
});

test("only sustained FRONTAL obstruction starts local yielding",()=>{
 const newborn={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 let side={...newborn},back={...newborn},front={...newborn};
 for(let i=0;i<14;i++){
  side=localResponse(side,{touch:true,progress:0,front:0,side:1},{contactYield:1}).state;
  back=localResponse(back,{touch:true,progress:0,front:0,side:0},{contactYield:1}).state;
  front=localResponse(front,{touch:true,progress:0,front:1,side:0},{contactYield:1}).state;
 }
 assert.equal(front.recoveries,1);
 assert.equal(side.recoveries,0);
 assert.equal(back.recoveries,0);
});
test("somatic yield is independent of nominal shape, inertia and body kind",()=>{
 const newborn={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 let compliant={...newborn},persistent={...newborn};
 for(let i=0;i<16;i++){
  compliant=localResponse(compliant,{touch:true,progress:0,front:1,side:0},
    {contactYield:1}).state;
  persistent=localResponse(persistent,{touch:true,progress:0,front:1,side:0},
    {contactYield:0}).state;
 }
 assert.equal(compliant.recoveries,1);
 assert.equal(persistent.recoveries,0);
 for(let i=16;i<49;i++)persistent=localResponse(persistent,
  {touch:true,progress:0,front:1,side:0},{contactYield:0}).state;
 assert.equal(persistent.recoveries,1);
});
test("free progress resets contact pressure, no omniscient obstacle awareness",()=>{
 const fresh={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 let s={...fresh};
 for(let i=0;i<9;i++)s=localResponse(s,
  {touch:true,progress:0,front:1,side:0},{contactYield:1}).state;
 s=localResponse(s,{touch:true,progress:.9,front:1,side:0},
  {contactYield:1}).state;
 assert.equal(s.pressure,0);
 for(let i=0;i<70;i++)s=localResponse(s,
  {touch:false,progress:0,front:1,side:0},{contactYield:1}).state;
 assert.equal(s.recoveries,0);
});
test("lateral contact produces bounded local steering away, without scripted route",()=>{
 const s={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 const left=localResponse(s,{touch:true,progress:1,front:0,side:1},
   {contactYield:1});
 const right=localResponse(s,{touch:true,progress:1,front:0,side:-1},
   {contactYield:1});
 assert.ok(left.steer<right.steer);
 assert.equal(left.mode,"cruise");
 assert.equal(right.mode,"cruise");
});

test("finite brace is reciprocal to drift, capped by force and traction",()=>{
 const b=finiteBrace({mass:250,velocity:{x:8,y:0},force:300,traction:1});
 assert.ok(b.x<0&&Math.abs(b.x)<=5.000001);
 assert.equal(b.y,0);
 const low=finiteBrace({mass:250,velocity:{x:8,y:0},force:300,traction:.2});
 assert.ok(Math.abs(low.x)<Math.abs(b.x));
});
test("zero ground/zero force yields no magical support",()=>{
 const input={mass:250,velocity:{x:8,y:-2},force:300,traction:0};
 const no=finiteBrace(input);
 assert.deepEqual(no,{x:0,y:0});
 const zero=finiteBrace({...input,force:0,traction:1});
 assert.deepEqual(zero,{x:0,y:0});
});
test("nonphysical brace cannot create infinite anchors",()=>{
 assert.throws(()=>finiteBrace({mass:0,velocity:{x:5,y:0},
   force:200,traction:1}),RangeError);
 assert.throws(()=>finiteBrace({mass:40,velocity:{x:5,y:0},
   force:-1,traction:1}),RangeError);
});
test("rear/lateral grounded pressure only braces low-yield material body",()=>{
 const seed={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 const s={touch:true,front:0,side:1,load:15,progress:0};
 const stiff=localResponse(seed,s,{contactYield:0.10});
 const soft=localResponse(seed,s,{contactYield:0.90});
 assert.equal(stiff.mode,"brace");
 assert.equal(stiff.throttle,0);
 assert.notEqual(soft.mode,"brace");
});


test("simultaneous front blockage and rear physical pressure still allow bracing",()=>{
 let state={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 const profile={contactYield:.12};
 let result=localResponse(state,{touch:true,progress:.35,front:1,
    rearLoad:25,sideLoad:0,frontLoad:17,load:42},profile);
 assert.equal(result.mode,"brace");
 state=result.state;
 for(let tick=0;tick<20;tick++){
   result=localResponse(state,{touch:true,progress:1,front:1,
     rearLoad:25,sideLoad:0,frontLoad:17,load:42},profile);
   state=result.state;
   assert.equal(result.mode,"brace",
     "zero motor intent must not erase real tactile stance during pressure");
 }
 for(let tick=0;tick<10;tick++){
   result=localResponse(state,{touch:false,progress:1,front:0,
     rearLoad:0,sideLoad:0,frontLoad:0,load:0},profile);
   state=result.state;
 }
 assert.equal(result.mode,"cruise");
});
test("front-only pressure remains pressing, not rear bracing",()=>{
 const state={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
 const actual=localResponse(state,{touch:true,progress:0,front:1,
    frontLoad:22,rearLoad:0,sideLoad:0,load:22},{contactYield:.12});
 assert.equal(actual.mode,"press");
});
