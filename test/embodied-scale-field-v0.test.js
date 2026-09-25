import test from "node:test";
import assert from "node:assert/strict";
import {
  bodyFromScale,
  createScaleFieldState,
  resolveBodyPair,
  setPlayerScale,
  stepScaleField
} from "../experiments/embodied-scale-field-v0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};
const right={...idle,keys:["KeyD"]};

test("scale is continuous and derives envelope plus mass without a class flag",()=>{
  const state=createScaleFieldState({drifters:false});
  setPlayerScale(state,1.37);
  assert.equal(state.player.scale,1.37);
  assert.ok(state.player.r>18);
  assert.ok(state.player.mass>1);
  assert.equal("class" in state.player,false);
});

test("small body can traverse the central gap while large body is materially excluded",()=>{
  const small=createScaleFieldState({drifters:false});
  setPlayerScale(small,0.65);
  for(let i=0;i<720;i++) stepScaleField(small,right,1/120);
  assert.ok(small.player.x>470,"small body should pass the central gap");

  const large=createScaleFieldState({drifters:false});
  setPlayerScale(large,1.70);
  for(let i=0;i<720;i++) stepScaleField(large,right,1/120);
  assert.ok(large.player.x<390,"large body should be stopped by the central gap");
});

test("mass-weighted body contact yields more motion to the lighter participant",()=>{
  const light={x:0,y:0,vx:100,vy:0,r:10,mass:0.5};
  const heavy={x:18,y:0,vx:0,vy:0,r:10,mass:3};
  const beforeLight=light.vx;
  const beforeHeavy=heavy.vx;
  assert.equal(resolveBodyPair(light,heavy),true);
  assert.ok(Math.abs(light.vx-beforeLight)>Math.abs(heavy.vx-beforeHeavy));
});

test("scale field remains finite under mixed scale and movement input",()=>{
  const state=createScaleFieldState();
  for(let i=0;i<2400;i++){
    const keys=[];
    if(i%240<120) keys.push("KeyD"); else keys.push("KeyW");
    if(i%360<120) keys.push("BracketRight");
    if(i%540>420) keys.push("BracketLeft");
    stepScaleField(state,{...idle,keys},1/120);
  }
  for(const value of [
    state.player.x,state.player.y,state.player.vx,state.player.vy,
    state.player.r,state.player.mass,state.player.scale
  ]) assert.ok(Number.isFinite(value));
});
