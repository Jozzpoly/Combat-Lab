import test from "node:test";
import assert from "node:assert/strict";

import { createActor } from "../src/actors.js";
import { BROKEN_YARD } from "../src/yard.js";
import { updatePressure } from "../src/pressure.js";
import { resolveActorWorld, stepActorWorld } from "../src/world.js";
import {
  O1_ATTACK,
  O1_DAMAGE,
  createO1Player,
  createO1Threat,
  driveO1Player,
  faceO1Player,
  probeShieldContact,
  requestO1Attack,
  resetThreatAttackAuthority,
  resolveO1Strike,
  resolvePressureAgainstO1,
  resolveShieldContact,
  stepO1Attack
} from "../src/o1.js";

function directShieldCollision(braced) {
  const player=createO1Player({x:450,y:430,facing:-Math.PI/2});
  player.braced=braced;
  const threat=createO1Threat("t",{x:450,y:389,facing:Math.PI/2});
  threat.state="lunge";
  threat.vx=0;
  threat.vy=290;

  const y0=player.y;
  const ty0=threat.y;
  const event=resolvePressureAgainstO1(player,threat);
  return {
    event,
    playerMove:Math.abs(player.y-y0),
    threatMove:Math.abs(threat.y-ty0),
    player,
    threat
  };
}

test("shield is continuous directional geometry, not a brace-only collider",()=>{
  const player=createO1Player({x:300,y:300,facing:0});
  const front=createO1Threat("front",{x:340,y:300,facing:Math.PI});
  const rear=createO1Threat("rear",{x:260,y:300,facing:0});

  player.braced=false;
  assert.ok(probeShieldContact(player,front));
  assert.equal(probeShieldContact(player,rear),null);

  player.braced=true;
  assert.ok(probeShieldContact(player,front));
  assert.equal(probeShieldContact(player,rear),null);
});

test("brace changes only shield-contact yield and never creates an infinite wall",()=>{
  const free=directShieldCollision(false);
  const braced=directShieldCollision(true);

  assert.equal(free.event.type,"shield-block");
  assert.equal(braced.event.type,"shield-block");
  assert.ok(free.playerMove>0);
  assert.ok(braced.playerMove>0);
  assert.ok(free.threatMove>0);
  assert.ok(braced.threatMove>0);
  assert.ok(braced.playerMove < free.playerMove);
  assert.ok(braced.threatMove > free.threatMove);
});

test("side committed contact bypasses shield and damages once",()=>{
  const player=createO1Player({x:300,y:300,facing:-Math.PI/2});
  const threat=createO1Threat("side",{x:331,y:300,facing:Math.PI});
  threat.state="lunge";
  threat.vx=-290;
  threat.vy=0;

  const first=resolvePressureAgainstO1(player,threat);
  const hpAfter=player.hp;
  const second=resolvePressureAgainstO1(player,threat);

  assert.equal(first.type,"body-hit");
  assert.equal(first.damage,O1_DAMAGE.pressureHit);
  assert.equal(hpAfter,O1_DAMAGE.playerHp-O1_DAMAGE.pressureHit);
  assert.notEqual(second?.type,"body-hit");
  assert.equal(player.hp,hpAfter);
});

test("short strike is lethal to a cheap exposed threat, misses rear and does not lock movement",()=>{
  const player=createO1Player({x:300,y:300,facing:0});
  const front=createO1Threat("front",{x:355,y:300,facing:Math.PI});
  const rear=createO1Threat("rear",{x:250,y:300,facing:0});

  assert.equal(requestO1Attack(player),true);
  driveO1Player(player,1,0,1/120);
  const vxBefore=player.vx;

  for(let i=0;i<30 && player.attack.phase!=="active";i++) stepO1Attack(player,1/120);
  assert.equal(player.attack.phase,"active");
  assert.ok(player.vx>0);
  assert.ok(vxBefore>0);

  const hit=resolveO1Strike(player,front);
  const miss=resolveO1Strike(player,rear);
  assert.ok(hit);
  assert.equal(hit.killed,true);
  assert.equal(front.hp,0);
  assert.equal(miss,null);
});

test("yielding laterally during commitment can leave the actual lunge path without i-frames",()=>{
  const player=createO1Player({x:450,y:430,facing:-Math.PI/2});
  const threat=createO1Threat("t",{x:450,y:350,facing:Math.PI/2});
  const dt=1/120;
  let bodyHits=0;
  let shieldBlocks=0;
  let sawLunge=false;

  for(let frame=0;frame<180;frame++){
    const emitted=updatePressure(threat,player,BROKEN_YARD,dt,[threat]);
    if(emitted.some(e=>e.type==="pressure-lunge")) sawLunge=true;

    // Stay readable until commitment, then actually leave the committed line.
    if(sawLunge) driveO1Player(player,1,0,dt);
    else driveO1Player(player,0,0,dt);

    stepActorWorld(player,BROKEN_YARD,dt);
    const event=resolvePressureAgainstO1(player,threat);
    if(event?.type==="body-hit") bodyHits++;
    if(event?.type==="shield-block") shieldBlocks++;
    resolveActorWorld(player,BROKEN_YARD);
    resolveActorWorld(threat,BROKEN_YARD);
    resetThreatAttackAuthority(threat);
  }

  assert.equal(sawLunge,true);
  assert.equal(bodyHits,0);
  assert.equal(shieldBlocks,0);
  assert.equal(player.hp,O1_DAMAGE.playerHp);
});

test("stationary open-space brace is not a universal solution against multi-angle pressure",()=>{
  const player=createO1Player({x:450,y:430,facing:-Math.PI/2});
  player.braced=true;
  const threats=[
    createO1Threat("north",{x:450,y:330,facing:Math.PI/2}),
    createO1Threat("east",{x:565,y:430,facing:Math.PI})
  ];
  const dt=1/120;
  let blocks=0;
  let hits=0;

  for(let frame=0;frame<8*120 && player.hp>0;frame++){
    // Intentionally static: this red-team asks whether brace alone solves open space.
    driveO1Player(player,0,0,dt);
    for(const threat of threats){
      updatePressure(threat,player,BROKEN_YARD,dt,threats);
    }

    for(const threat of threats){
      const event=resolvePressureAgainstO1(player,threat);
      if(event?.type==="shield-block") blocks++;
      if(event?.type==="body-hit") hits++;
      resolveActorWorld(threat,BROKEN_YARD);
      resetThreatAttackAuthority(threat);
    }
    resolveActorWorld(player,BROKEN_YARD);
  }

  assert.ok(blocks>0);
  assert.ok(hits>0);
  assert.ok(player.hp<O1_DAMAGE.playerHp);
});

test("brace remains movement, not root authority",()=>{
  const player=createO1Player({x:300,y:300,facing:0});
  player.braced=true;
  for(let i=0;i<60;i++){
    driveO1Player(player,1,0,1/120);
    faceO1Player(player,400,340,1/120);
    stepActorWorld(player,BROKEN_YARD,1/120);
  }
  assert.ok(player.x>330);
  assert.ok(Math.hypot(player.vx,player.vy)>0);
  assert.ok(player.facing!==0);
});
