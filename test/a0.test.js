import test from "node:test";
import assert from "node:assert/strict";

import { PLAYER_BODY, createActor, driveActor, integrateActor } from "../src/actor.js";
import { BASE_ADVERSARY_SPEC, createAdversary, updateAdversary } from "../src/adversary.js";
import { createPlayerCombatState, requestPlayerStrike, stepPlayerStrike } from "../src/combat.js";
import { createA0State, stepA0 } from "../src/sim.js";
import { ADVERSARIAL_YARD, resolveActorPair, resolveActorWorld } from "../src/world.js";

const OPEN_WORLD={width:1600,height:1000,inset:20,walls:[]};

test("A0 shared adversary state machine exposes seek prepare commit recover",()=>{
  const player=createActor(PLAYER_BODY,{id:"p",x:400,y:500,facing:0});
  const enemy=createAdversary(BASE_ADVERSARY_SPEC,{
    id:"e",
    x:400,
    y:420,
    facing:Math.PI/2
  });

  const seen=new Set([enemy.mode]);
  for(let i=0;i<300;i++){
    updateAdversary(enemy,player,OPEN_WORLD,1/120);
    seen.add(enemy.mode);
  }

  assert.equal(seen.has("seek"),true);
  assert.equal(seen.has("prepare"),true);
  assert.equal(seen.has("commit"),true);
  assert.equal(seen.has("recover"),true);
});

test("A0 adversary commit captures direction instead of re-homing",()=>{
  const player=createActor(PLAYER_BODY,{id:"p",x:500,y:500,facing:0});
  const enemy=createAdversary(BASE_ADVERSARY_SPEC,{
    id:"e",
    x:500,
    y:430,
    facing:Math.PI/2
  });

  for(let i=0;i<120&&enemy.mode!=="commit";i++){
    updateAdversary(enemy,player,OPEN_WORLD,1/120);
  }
  assert.equal(enemy.mode,"commit");

  const x=enemy.commitX;
  const y=enemy.commitY;

  player.x+=220;
  player.y-=80;
  for(let i=0;i<8;i++){
    updateAdversary(enemy,player,OPEN_WORLD,1/120);
    if(enemy.mode!=="commit") break;
    assert.equal(enemy.commitX,x);
    assert.equal(enemy.commitY,y);
  }
});

test("A0 body contact respects mass rather than equal displacement",()=>{
  const lightSpec={...PLAYER_BODY,mass:40};
  const heavySpec={...PLAYER_BODY,mass:120};
  const light=createActor(lightSpec,{id:"l",x:300,y:300});
  const heavy=createActor(heavySpec,{id:"h",x:325,y:300});

  const beforeLight=light.x;
  const beforeHeavy=heavy.x;
  const hit=resolveActorPair(light,heavy);

  assert.ok(hit);
  assert.ok(Math.abs(light.x-beforeLight)>Math.abs(heavy.x-beforeHeavy));
});

test("A0 world obstruction prevents body traversal",()=>{
  const actor=createActor(PLAYER_BODY,{
    id:"p",
    x:330,
    y:260,
    facing:0
  });
  actor.vx=230;

  for(let i=0;i<60;i++){
    integrateActor(actor,1/120);
    resolveActorWorld(actor,ADVERSARIAL_YARD);
  }

  assert.ok(actor.x<=365-actor.spec.radius+0.01);
});

test("A0 player locomotion remains live during strike",()=>{
  const player=createPlayerCombatState(
    createActor(PLAYER_BODY,{id:"p",x:300,y:500,facing:0})
  );
  assert.equal(requestPlayerStrike(player),true);
  const start=player.x;

  for(let i=0;i<40;i++){
    driveActor(player,1,0,1/120);
    integrateActor(player,1/120);
    stepPlayerStrike(player,1/120);
  }

  assert.ok(player.x>start+20);
});

test("A0 compact strike has one solid-target authority",()=>{
  const state=createA0State({
    world:OPEN_WORLD,
    playerStart:{x:300,y:500,facing:0},
    adversaryStart:{id:"near",x:350,y:495,facing:Math.PI}
  });
  const second=createAdversary(BASE_ADVERSARY_SPEC,{
    id:"far",
    x:360,
    y:505,
    facing:Math.PI
  });
  state.adversaries.push(second);

  // Put the player directly into a measured active strike frame.
  state.player.action={
    serial:1,
    elapsed:0.11,
    hitIds:new Set()
  };
  state.player.actionSerial=1;

  const events=stepA0(state,{
    moveX:0,
    moveY:0,
    aimX:400,
    aimY:500
  },1/240);

  const hits=events.filter(e=>e.type==="player-hit");
  assert.equal(hits.length,1);
  assert.equal(state.adversaries.filter(x=>x.hp<=0).length,1);
});

test("A0 simultaneous committed hits are not erased by lethal player strike",()=>{
  const state=createA0State({
    world:OPEN_WORLD,
    playerStart:{x:300,y:500,facing:0},
    adversaryStart:{id:"e",x:355,y:500,facing:Math.PI}
  });
  const enemy=state.adversaries[0];

  state.player.action={
    serial:1,
    elapsed:0.11,
    hitIds:new Set()
  };
  state.player.actionSerial=1;

  enemy.mode="commit";
  enemy.modeTime=0.10;
  enemy.commitX=-1;
  enemy.commitY=0;
  enemy.vx=-120;
  enemy.vy=0;
  enemy.attackResolved=false;

  const before=state.player.hp;
  const events=stepA0(state,{
    moveX:0,
    moveY:0,
    aimX:400,
    aimY:500
  },1/240);

  assert.ok(events.some(e=>e.type==="player-hit"));
  assert.ok(events.some(e=>e.type==="adversary-hit"));
  assert.equal(enemy.hp,0);
  assert.ok(state.player.hp<before);
});

test("A0 state remains finite through repeated shared-law exchange",()=>{
  const state=createA0State({
    world:OPEN_WORLD,
    playerStart:{x:500,y:700,facing:-Math.PI/2},
    adversaryStart:{id:"e",x:500,y:300,facing:Math.PI/2}
  });

  for(let frame=0;frame<2400&&state.result==="active";frame++){
    const e=state.adversaries[0];
    const dx=e.x-state.player.x;
    const dy=e.y-state.player.y;
    const d=Math.hypot(dx,dy)||1;
    const strike=!state.player.action && d<82;

    stepA0(state,{
      moveX:d>90?dx/d:-(dy/d)*0.45,
      moveY:d>90?dy/d:(dx/d)*0.45,
      aimX:e.x,
      aimY:e.y,
      strike
    },1/120);

    for(const actor of [state.player,...state.adversaries]){
      assert.equal(
        [actor.x,actor.y,actor.vx,actor.vy,actor.facing,actor.hp].every(Number.isFinite),
        true
      );
    }
  }

  assert.ok(state.time>0);
});
