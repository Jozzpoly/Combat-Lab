import test from "node:test";
import assert from "node:assert/strict";
import { MORPHS, localResponse, finiteDrive, wrap } from "../src/organism-law.js";
const fresh=()=>({age:0,pressure:0,recover:0,turnSide:1,recoveries:0});
test("physically distinct shapes and motor authorities are declared independently",()=>{
 assert.equal(Object.keys(MORPHS).length,3);
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
