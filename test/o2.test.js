import test from "node:test";
import assert from "node:assert/strict";

import { stepActorWorld } from "../src/world.js";
import {
  O2_CLEARANCE,
  O2_THRUST,
  applyO2Thrust,
  createO2Player,
  createO2Threat,
  driveO2Player,
  o2ActionState,
  probeO2Clearance,
  probeO2Thrust,
  requestO2Action,
  resolveO2Clearance,
  spearDamagingTip,
  spearSegment,
  stepO2Action
} from "../src/o2.js";

const OPEN_WORLD={width:1000,height:1000,inset:0,walls:[]};

function advanceToActive(player,type){
  assert.equal(requestO2Action(player,type),true);
  const limit=120;
  for(let i=0;i<limit && !o2ActionState(player).active;i++){
    stepO2Action(player,1/240);
  }
  assert.equal(o2ActionState(player).active,true);
}

test("idle spear has persistent geometry but no passive damage authority",()=>{
  const player=createO2Player({x:200,y:200,facing:0});
  const target=createO2Threat("t",{x:300,y:200,facing:Math.PI});

  const seg=spearSegment(player,{world:OPEN_WORLD});
  assert.ok(seg.bx>seg.ax+80);
  assert.equal(player.o2Action,null);
  assert.equal(probeO2Thrust(player,target,{world:OPEN_WORLD}),null);
  assert.equal(target.hp,target.maxHp);
});

test("thrust damage belongs to outer tip rather than the whole shaft",()=>{
  const player=createO2Player({x:200,y:200,facing:0});
  advanceToActive(player,"thrust");

  // Use a representative early-active extension and place one body inside the
  // shaft and one around the actual damaging tip.
  for(let i=0;i<10;i++) stepO2Action(player,1/240);
  const seg=spearSegment(player,{world:OPEN_WORLD});
  const tip=spearDamagingTip(seg);

  const close=createO2Threat("close",{
    x:player.x+48,
    y:200,
    facing:Math.PI
  });
  const outer=createO2Threat("outer",{
    x:(tip.ax+tip.bx)*0.5,
    y:200,
    facing:Math.PI
  });

  assert.equal(probeO2Thrust(player,close,{world:OPEN_WORLD}),null);
  assert.ok(probeO2Thrust(player,outer,{world:OPEN_WORLD}));
});

test("one thrust action can damage only one solid target",()=>{
  const player=createO2Player({x:200,y:200,facing:0});
  advanceToActive(player,"thrust");
  for(let i=0;i<12;i++) stepO2Action(player,1/240);

  const seg=spearSegment(player,{world:OPEN_WORLD});
  const tip=spearDamagingTip(seg);
  const x=(tip.ax+tip.bx)*0.5;
  const a=createO2Threat("a",{x,y:196,facing:Math.PI});
  const b=createO2Threat("b",{x:x+3,y:204,facing:Math.PI});

  const ca=probeO2Thrust(player,a,{world:OPEN_WORLD});
  const cb=probeO2Thrust(player,b,{world:OPEN_WORLD});
  assert.ok(ca);
  assert.ok(cb);

  const hit=applyO2Thrust(player,a,ca);
  assert.equal(hit.killed,true);
  assert.equal(probeO2Thrust(player,b,{world:OPEN_WORLD}),null);
  assert.equal(b.hp,b.maxHp);
});

test("wall truncates persistent spear and denies a target behind it",()=>{
  const world={
    width:500,
    height:500,
    inset:0,
    walls:[{id:"wall",x:280,y:150,w:20,h:100}]
  };
  const player=createO2Player({x:200,y:200,facing:0});
  const idle=spearSegment(player,{world});
  assert.equal(idle.blocked,true);
  assert.equal(idle.wallId,"wall");
  assert.ok(idle.actualLength<80);

  advanceToActive(player,"thrust");
  for(let i=0;i<15;i++) stepO2Action(player,1/240);
  const target=createO2Threat("behind",{x:330,y:200,facing:Math.PI});
  assert.equal(probeO2Thrust(player,target,{world}),null);
});

test("clearance is close zero-damage displacement, not another ranged attack",()=>{
  const player=createO2Player({x:200,y:200,facing:0});
  const close=createO2Threat("close",{x:245,y:200,facing:Math.PI});
  const far=createO2Threat("far",{x:340,y:200,facing:Math.PI});

  advanceToActive(player,"clearance");
  const hp=close.hp;
  const event=resolveO2Clearance(player,close);

  assert.ok(event);
  assert.equal(event.damage,0);
  assert.equal(close.hp,hp);
  assert.ok(close.vx>0);
  assert.equal(probeO2Clearance(player,far),null);
});

test("clearance does not grant immunity or alter player health state",()=>{
  const player=createO2Player({x:200,y:200,facing:0});
  const target=createO2Threat("t",{x:245,y:200,facing:Math.PI});
  const hp=player.hp;

  advanceToActive(player,"clearance");
  resolveO2Clearance(player,target);

  assert.equal(player.hp,hp);
  assert.equal(Object.hasOwn(player,"invulnerable"),false);
  assert.equal(Object.hasOwn(player,"iframes"),false);
});

test("locomotion remains live during thrust and clearance",()=>{
  for(const type of ["thrust","clearance"]){
    const player=createO2Player({x:200,y:200,facing:0});
    assert.equal(requestO2Action(player,type),true);
    const start=player.x;

    for(let i=0;i<40;i++){
      driveO2Player(player,1,0,1/120);
      stepActorWorld(player,OPEN_WORLD,1/120);
      stepO2Action(player,1/120);
    }

    assert.ok(player.x>start+20);
  }
});
