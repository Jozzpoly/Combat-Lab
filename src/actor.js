import { normalize } from "./math.js";

export const LINE_PLAYER_SPEC=Object.freeze({
  radius:16,
  mass:64,
  maxSpeed:235,
  acceleration:2550,
  braking:3000,
  hp:100
});

export function createLineActor(spec,{
  id,
  kind="body",
  x,
  y,
  facing=0
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

export function driveLineActor(actor,x,y,dt){
  const input=normalize(x,y,0,0);
  const speed=Math.hypot(actor.vx,actor.vy);

  if(input.length>0){
    actor.vx+=input.x*actor.spec.acceleration*dt;
    actor.vy+=input.y*actor.spec.acceleration*dt;
  }else if(speed>0){
    const drop=Math.min(speed,actor.spec.braking*dt);
    actor.vx-=actor.vx/speed*drop;
    actor.vy-=actor.vy/speed*drop;
  }

  const next=Math.hypot(actor.vx,actor.vy);
  if(next>actor.spec.maxSpeed){
    const s=actor.spec.maxSpeed/next;
    actor.vx*=s;
    actor.vy*=s;
  }
}

export function integrateLineActor(actor,dt){
  actor.x+=actor.vx*dt;
  actor.y+=actor.vy*dt;
}
