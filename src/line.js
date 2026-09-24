import { clamp, normalize } from "./math.js";
import {
  LINE_PLAYER_SPEC,
  createLineActor
} from "./actor.js";
import {
  LINE_TEST_WORLD,
  segmentCircleFirstT,
  segmentRectFirstT
} from "./world.js";

export const LINE_DRAW=Object.freeze({
  minimum:0.24
});

export const LINE_PROJECTILE=Object.freeze({
  radius:3,
  speed:640,
  damage:40,
  impulse:5200,
  maxImpactDeltaSpeed:120
});

export function createLinePlayer({
  x=300,
  y=350,
  facing=0
}={}){
  const player=createLineActor(
    LINE_PLAYER_SPEC,
    {id:"player",kind:"player",x,y,facing}
  );
  player.draw={
    held:false,
    elapsed:0,
    ready:false,
    serial:0
  };
  return player;
}

export function beginDraw(player){
  if(player.draw.held) return false;
  player.draw.held=true;
  player.draw.elapsed=0;
  player.draw.ready=false;
  return true;
}

export function stepDraw(player,dt){
  if(!player.draw.held) return {
    held:false,
    elapsed:0,
    ready:false
  };

  player.draw.elapsed+=dt;
  player.draw.ready=player.draw.elapsed>=LINE_DRAW.minimum;
  return {
    held:true,
    elapsed:player.draw.elapsed,
    ready:player.draw.ready
  };
}

export function cancelDraw(player){
  player.draw.held=false;
  player.draw.elapsed=0;
  player.draw.ready=false;
}

export function releaseDraw(player,{id}={}){
  if(!player.draw.held){
    return null;
  }

  const ready=player.draw.elapsed>=LINE_DRAW.minimum;
  if(!ready){
    cancelDraw(player);
    return null;
  }

  player.draw.serial++;
  const serial=player.draw.serial;
  const fx=Math.cos(player.facing);
  const fy=Math.sin(player.facing);
  const muzzleOffset=player.spec.radius+8;

  const projectile={
    id:id??`shot-${serial}`,
    ownerId:player.id,
    x:player.x+fx*muzzleOffset,
    y:player.y+fy*muzzleOffset,
    vx:fx*LINE_PROJECTILE.speed,
    vy:fy*LINE_PROJECTILE.speed,
    radius:LINE_PROJECTILE.radius,
    damage:LINE_PROJECTILE.damage,
    impulse:LINE_PROJECTILE.impulse,
    maxImpactDeltaSpeed:LINE_PROJECTILE.maxImpactDeltaSpeed,
    alive:true,
    age:0
  };

  cancelDraw(player);
  return projectile;
}

function bodyCandidate(projectile,body,ax,ay,bx,by){
  if(!body||body.hp<=0||body.id===projectile.ownerId) return null;
  const t=segmentCircleFirstT(
    ax,ay,bx,by,
    body.x,body.y,
    body.spec.radius+projectile.radius
  );
  if(t===null) return null;
  return {
    kind:"body",
    t,
    id:body.id,
    body
  };
}

function wallCandidate(projectile,wall,ax,ay,bx,by){
  const t=segmentRectFirstT(
    ax,ay,bx,by,
    wall,
    projectile.radius
  );
  if(t===null) return null;
  return {
    kind:"wall",
    t,
    id:wall.id??"wall",
    wall
  };
}

function firstSolidCandidate(projectile,bodies,world,ax,ay,bx,by){
  const candidates=[];

  for(const body of bodies){
    const hit=bodyCandidate(projectile,body,ax,ay,bx,by);
    if(hit) candidates.push(hit);
  }
  for(const wall of world.walls||[]){
    const hit=wallCandidate(projectile,wall,ax,ay,bx,by);
    if(hit) candidates.push(hit);
  }

  candidates.sort((a,b)=>{
    const dt=a.t-b.t;
    if(Math.abs(dt)>1e-9) return dt;
    if(a.kind!==b.kind) return a.kind==="wall"?-1:1;
    return String(a.id).localeCompare(String(b.id));
  });

  return candidates[0]??null;
}

export function applyProjectileBodyImpact(projectile,body,{
  x=projectile.x,
  y=projectile.y
}={}){
  body.hp=Math.max(0,body.hp-projectile.damage);

  const direction=normalize(
    projectile.vx,
    projectile.vy,
    1,0
  );
  const rawDelta=projectile.impulse/Math.max(1,body.spec.mass);
  const deltaSpeed=Math.min(
    projectile.maxImpactDeltaSpeed,
    rawDelta
  );

  body.vx+=direction.x*deltaSpeed;
  body.vy+=direction.y*deltaSpeed;

  return {
    type:"projectile-body-hit",
    projectile:projectile.id,
    target:body.id,
    x,
    y,
    damage:projectile.damage,
    hp:body.hp,
    impulse:projectile.impulse,
    deltaSpeed,
    killed:body.hp<=0
  };
}

export function stepProjectile(
  projectile,
  bodies,
  world=LINE_TEST_WORLD,
  dt=1/120
){
  if(!projectile.alive) return null;

  const ax=projectile.x;
  const ay=projectile.y;
  const bx=ax+projectile.vx*dt;
  const by=ay+projectile.vy*dt;

  const solid=firstSolidCandidate(
    projectile,
    bodies,
    world,
    ax,ay,bx,by
  );

  projectile.age+=dt;

  if(!solid){
    projectile.x=bx;
    projectile.y=by;
    return null;
  }

  projectile.x=ax+(bx-ax)*solid.t;
  projectile.y=ay+(by-ay)*solid.t;
  projectile.alive=false;

  if(solid.kind==="wall"){
    return {
      type:"projectile-wall-hit",
      projectile:projectile.id,
      wall:solid.id,
      x:projectile.x,
      y:projectile.y
    };
  }

  return applyProjectileBodyImpact(
    projectile,
    solid.body,
    {x:projectile.x,y:projectile.y}
  );
}

export function projectileTravelDistance(projectile){
  return LINE_PROJECTILE.speed*projectile.age;
}

export function impactDeltaSpeedForMass(mass){
  return clamp(
    LINE_PROJECTILE.impulse/Math.max(1,mass),
    0,
    LINE_PROJECTILE.maxImpactDeltaSpeed
  );
}
