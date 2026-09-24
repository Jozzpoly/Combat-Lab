import { normalize, wrapAngle } from "./math.js";

export const E0_BODY_SPEC=Object.freeze({
  radius:18,
  mass:72,
  maxSpeed:225,
  acceleration:2450,
  braking:2850,
  turnRate:15
});

export function createActor({
  id,
  x,
  y,
  facing=-Math.PI/2,
  spec=E0_BODY_SPEC
}={}){
  return {
    id,
    x,y,
    vx:0,
    vy:0,
    facing,
    spec,
    action:{
      mode:"idle",
      time:0,
      commitX:0,
      commitY:0,
      contactResolved:false,
      serial:0
    }
  };
}

export function faceToward(actor,x,y,dt=1/120){
  const desired=Math.atan2(y-actor.y,x-actor.x);
  const delta=wrapAngle(desired-actor.facing);
  const step=actor.spec.turnRate*dt;
  actor.facing+=Math.max(-step,Math.min(step,delta));
}

export function driveMove(actor,x,y,dt){
  const d=normalize(x,y,0,0);
  const speed=Math.hypot(actor.vx,actor.vy);

  if(d.length>0){
    actor.vx+=d.x*actor.spec.acceleration*dt;
    actor.vy+=d.y*actor.spec.acceleration*dt;
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

export function integrateActor(actor,dt){
  actor.x+=actor.vx*dt;
  actor.y+=actor.vy*dt;
}
