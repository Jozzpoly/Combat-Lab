import test from "node:test";
import assert from "node:assert/strict";

import {
  LINE_PLAYER_SPEC,
  createLineActor,
  driveLineActor,
  integrateLineActor
} from "../src/actor.js";
import {
  LINE_DRAW,
  LINE_PROJECTILE,
  beginDraw,
  createLinePlayer,
  impactDeltaSpeedForMass,
  releaseDraw,
  stepDraw,
  stepProjectile
} from "../src/line.js";
import { resolveLineActorWorld } from "../src/world.js";

const OPEN_WORLD={width:1600,height:900,inset:20,walls:[]};

const LIGHT=Object.freeze({
  radius:14,
  mass:42,
  maxSpeed:220,
  acceleration:2200,
  braking:2600,
  hp:100
});
const HEAVY=Object.freeze({
  radius:24,
  mass:132,
  maxSpeed:140,
  acceleration:1000,
  braking:1500,
  hp:100
});

function readyShot(player){
  assert.equal(beginDraw(player),true);
  const steps=Math.ceil(LINE_DRAW.minimum/(1/240))+1;
  for(let i=0;i<steps;i++) stepDraw(player,1/240);
  const shot=releaseDraw(player);
  assert.ok(shot);
  return shot;
}

test("L0 draw/release is deterministic and early release produces no projectile",()=>{
  const player=createLinePlayer();

  assert.equal(beginDraw(player),true);
  for(let i=0;i<20;i++) stepDraw(player,1/240);
  assert.equal(releaseDraw(player),null);
  assert.equal(player.draw.held,false);

  const shot=readyShot(player);
  assert.equal(shot.alive,true);
  assert.equal(shot.ownerId,"player");
  assert.equal(player.draw.held,false);
  assert.equal(player.draw.serial,1);
});

test("L0 locomotion remains live while drawing",()=>{
  const player=createLinePlayer({x:300,y:350,facing:0});
  beginDraw(player);
  const start=player.x;

  for(let i=0;i<60;i++){
    driveLineActor(player,1,0,1/120);
    integrateLineActor(player,1/120);
    resolveLineActorWorld(player,OPEN_WORLD);
    stepDraw(player,1/120);
  }

  assert.ok(player.x>start+60);
  assert.equal(player.draw.held,true);
  assert.equal(player.draw.ready,true);
});

test("L0 projectile has finite travel instead of instant hit authority",()=>{
  const player=createLinePlayer({x:200,y:350,facing:0});
  const shot=readyShot(player);
  const start=shot.x;

  const event=stepProjectile(shot,[],OPEN_WORLD,0.10);

  assert.equal(event,null);
  assert.equal(shot.alive,true);
  assert.ok(Math.abs((shot.x-start)-LINE_PROJECTILE.speed*0.10)<1e-9);
});

test("L0 first solid wall consumes shot before body behind it",()=>{
  const world={
    width:1000,
    height:700,
    inset:20,
    walls:[{id:"cover",x:360,y:280,w:24,h:140}]
  };
  const player=createLinePlayer({x:250,y:350,facing:0});
  const target=createLineActor(
    LIGHT,
    {id:"target",x:450,y:350,facing:Math.PI}
  );
  const shot=readyShot(player);

  let event=null;
  for(let i=0;i<60&&!event;i++){
    event=stepProjectile(shot,[target],world,1/120);
  }

  assert.ok(event);
  assert.equal(event.type,"projectile-wall-hit");
  assert.equal(event.wall,"cover");
  assert.equal(target.hp,100);
  assert.equal(shot.alive,false);
});

test("L0 nearer body consumes shot before farther body",()=>{
  const player=createLinePlayer({x:200,y:350,facing:0});
  const near=createLineActor(LIGHT,{id:"near",x:360,y:350,facing:Math.PI});
  const far=createLineActor(LIGHT,{id:"far",x:470,y:350,facing:Math.PI});
  const shot=readyShot(player);

  let event=null;
  for(let i=0;i<80&&!event;i++){
    event=stepProjectile(shot,[far,near],OPEN_WORLD,1/120);
  }

  assert.equal(event.type,"projectile-body-hit");
  assert.equal(event.target,"near");
  assert.equal(near.hp,60);
  assert.equal(far.hp,100);
  assert.equal(shot.alive,false);
});

test("L0 same impulse displaces light body more than heavy body through mass",()=>{
  const makeTrial=spec=>{
    const player=createLinePlayer({x:200,y:350,facing:0});
    const body=createLineActor(spec,{id:"body",x:360,y:350,facing:Math.PI});
    const shot=readyShot(player);
    let event=null;
    for(let i=0;i<80&&!event;i++){
      event=stepProjectile(shot,[body],OPEN_WORLD,1/120);
    }
    return {body,event};
  };

  const light=makeTrial(LIGHT);
  const heavy=makeTrial(HEAVY);

  assert.equal(light.event.damage,heavy.event.damage);
  assert.ok(light.body.vx>heavy.body.vx*2.5);
  assert.ok(light.event.deltaSpeed>heavy.event.deltaSpeed*2.5);
  assert.equal(light.body.hp,60);
  assert.equal(heavy.body.hp,60);
});

test("L0 impact changes velocity without magical stun or forced state cancellation",()=>{
  const player=createLinePlayer({x:200,y:350,facing:0});
  const body=createLineActor(LIGHT,{id:"committed",x:360,y:350,facing:Math.PI});
  body.mode="commit";
  body.modeTime=0.17;
  body.attackResolved=false;

  const shot=readyShot(player);
  let event=null;
  for(let i=0;i<80&&!event;i++){
    event=stepProjectile(shot,[body],OPEN_WORLD,1/120);
  }

  assert.equal(event.type,"projectile-body-hit");
  assert.equal(body.mode,"commit");
  assert.equal(body.modeTime,0.17);
  assert.equal(body.attackResolved,false);
  assert.equal(Object.hasOwn(body,"stunned"),false);
  assert.equal(Object.hasOwn(body,"iframes"),false);
});

test("L0 impact delta speed is bounded even for tiny mass",()=>{
  assert.equal(
    impactDeltaSpeedForMass(1),
    LINE_PROJECTILE.maxImpactDeltaSpeed
  );
  assert.ok(
    impactDeltaSpeedForMass(HEAVY.mass)<
    impactDeltaSpeedForMass(LIGHT.mass)
  );
});

test("L0 first-solid ordering uses actual swept path and does not tunnel",()=>{
  const player=createLinePlayer({x:100,y:350,facing:0});
  const tiny={
    radius:3,
    mass:42,
    maxSpeed:0,
    acceleration:0,
    braking:0,
    hp:100
  };
  const target=createLineActor(tiny,{id:"tiny",x:250,y:350,facing:0});
  const shot=readyShot(player);

  // A single large step travels farther than the target diameter.
  const event=stepProjectile(shot,[target],OPEN_WORLD,0.30);

  assert.equal(event.type,"projectile-body-hit");
  assert.equal(event.target,"tiny");
  assert.equal(target.hp,60);
});

test("L0 player spec itself remains ordinary responsive locomotion substrate",()=>{
  assert.equal(LINE_PLAYER_SPEC.maxSpeed,235);
  assert.ok(LINE_PLAYER_SPEC.acceleration>LINE_PLAYER_SPEC.maxSpeed*8);
});
