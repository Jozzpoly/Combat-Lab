import test from "node:test";
import assert from "node:assert/strict";

import {
  LIGHT_RUSHER_SPEC,
  createLightRusher
} from "../src/rusher.js";
import { createL1State, stepL1 } from "../src/line-sim.js";
import { runL1Policy } from "../src/line-rehearsal.js";

test("L1 rusher donor is faster than player but uses a locked finite dash",()=>{
  const state=createL1State();
  assert.ok(
    LIGHT_RUSHER_SPEC.body.maxSpeed>
    state.player.spec.maxSpeed
  );
  assert.ok(LIGHT_RUSHER_SPEC.attack.windup>0);
  assert.ok(LIGHT_RUSHER_SPEC.attack.commitDuration>0);
  assert.ok(LIGHT_RUSHER_SPEC.attack.recover>0);
});

test("L1 committed dash does not re-home after player moves",()=>{
  const state=createL1State({
    playerStart:{x:1000,y:1000,facing:-Math.PI/2},
    rusherStart:{id:"rusher",x:1000,y:930,facing:Math.PI/2}
  });
  const r=state.rusher;

  for(let i=0;i<120&&r.mode!=="commit";i++){
    stepL1(state,{
      moveX:0,moveY:0,
      aimX:r.x,aimY:r.y,
      drawHeld:false
    },1/240);
  }
  assert.equal(r.mode,"commit");

  const cx=r.commitX;
  const cy=r.commitY;
  state.player.x+=220;
  state.player.y-=100;

  for(let i=0;i<8&&r.mode==="commit";i++){
    stepL1(state,{
      moveX:0,moveY:0,
      aimX:r.x,aimY:r.y,
      drawHeld:false
    },1/240);
    if(r.mode==="commit"){
      assert.equal(r.commitX,cx);
      assert.equal(r.commitY,cy);
    }
  }
});

test("L1 same-step projectile impact cannot erase already committed rusher hit",()=>{
  const state=createL1State({
    playerStart:{x:1000,y:1000,facing:-Math.PI/2},
    rusherStart:{id:"rusher",x:1000,y:960,facing:Math.PI/2}
  });
  const r=state.rusher;
  r.mode="commit";
  r.modeTime=0.12;
  r.commitX=0;
  r.commitY=1;
  r.vx=0;
  r.vy=260;
  r.attackResolved=false;

  state.player.draw.held=true;
  state.player.draw.elapsed=0.30;
  state.player.draw.ready=true;
  // Release this frame from a position close enough for the projectile sweep
  // and hostile committed segment to both resolve.
  const events=stepL1(state,{
    moveX:0,moveY:0,
    aimX:r.x,aimY:r.y,
    drawHeld:false
  },0.04);

  assert.ok(events.some(e=>e.type==="projectile-body-hit"));
  assert.ok(events.some(e=>e.type==="rusher-hit"));
  assert.ok(state.player.hp<state.player.maxHp);
  assert.ok(r.hp<LIGHT_RUSHER_SPEC.body.hp);
});

test("L1 policy matrix exposes spam kite movement and timing falsifiers",()=>{
  const policies=[
    "stand-fire",
    "max-rate-fire",
    "backward-kite-fire",
    "lateral-only",
    "fire-on-prepare",
    "fire-on-commit",
    "lateral-commit-shot"
  ];
  const result={};

  for(const policy of policies){
    result[policy]=runL1Policy(policy);
  }

  console.log("L1_POLICY_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
    assert.equal(value.boundaryFrames,0);
  }

  // Movement alone must remain a legal way to make real commits miss sometimes.
  assert.ok(result["lateral-only"].missedCommits>0);

  // Projectile impact must actually occur in at least one firing policy.
  assert.ok(
    policies.some(p=>result[p].projectileHits>0)
  );
});
