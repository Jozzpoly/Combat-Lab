import { angleDelta, normalize } from "./math.js";

export const PLAYER_BODY=Object.freeze({
  radius:17,
  mass:68,
  maxSpeed:230,
  acceleration:2500,
  braking:3000,
  turnRate:14,
  hp:100
});

export function createActor(spec,{
  id,
  x,
  y,
  facing=0,
  kind="actor"
}={}){
  return {
    id,
    kind,
    spec,
    x,
    y,
    vx:0,
    vy:0,
    facing,
    hp:spec.hp??100,
    maxHp:spec.hp??100
  };
}

export function faceToward(actor,x,y,dt){
  const desired=Math.atan2(y-actor.y,x-actor.x);
  const delta=angleDelta(actor.facing,desired);
  const maxTurn=actor.spec.turnRate*dt;
  actor.facing+=Math.max(-maxTurn,Math.min(maxTurn,delta));
}

export function driveActor(actor,x,y,dt){
  const n=normalize(x,y,0,0);
  const speed=Math.hypot(actor.vx,actor.vy);

  if(n.length>0){
    actor.vx+=n.x*actor.spec.acceleration*dt;
    actor.vy+=n.y*actor.spec.acceleration*dt;
  }else if(speed>0){
    const drop=Math.min(speed,actor.spec.braking*dt);
    actor.vx-=actor.vx/speed*drop;
    actor.vy-=actor.vy/speed*drop;
  }

  const next=Math.hypot(actor.vx,actor.vy);
  if(next>actor.spec.maxSpeed){
    const scale=actor.spec.maxSpeed/next;
    actor.vx*=scale;
    actor.vy*=scale;
  }
}

export function integrateActor(actor,dt){
  actor.x+=actor.vx*dt;
  actor.y+=actor.vy*dt;
}
