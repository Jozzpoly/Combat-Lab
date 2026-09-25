import test from "node:test";
import assert from "node:assert/strict";
import {substrateSmoke} from "../experiments/substrate-smoke.js";

function input(keys=[]) {
  return {keys,buttons:[],pointer:{x:0,y:0,valid:false}};
}

test("smoke experiment moves from raw input and resets",()=>{
  const exp=substrateSmoke.create();
  exp.step(input(["KeyD"]),0.5);
  const moved=exp.snapshot();
  assert.ok(moved.x>0);
  assert.equal(moved.y,0);
  assert.equal(moved.time,0.5);

  exp.reset();
  assert.deepEqual(exp.snapshot(),{x:0,y:0,time:0,trailLength:0});
});

test("diagonal smoke motion is normalized",()=>{
  const a=substrateSmoke.create();
  const b=substrateSmoke.create();
  a.step(input(["KeyD"]),1);
  b.step(input(["KeyD","KeyS"]),1);
  const sa=a.snapshot();
  const sb=b.snapshot();
  assert.ok(Math.abs(Math.hypot(sb.x,sb.y)-Math.abs(sa.x))<1e-9);
});
