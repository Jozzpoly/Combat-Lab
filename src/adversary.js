import { angleDelta, clamp, normalize } from "./math.js";
import { createActor, driveActor, faceToward, integrateActor } from "./actor.js";
import { resolveActorWorld, segmentBlocked } from "./world.js";

export const BASE_ADVERSARY_SPEC=Object.freeze({
  body:Object.freeze({
    radius:17,
    mass:68,
    maxSpeed:190,
    acceleration:1800,
    braking:2200,
    turnRate:7.5,
    hp:60
  }),
  attack:Object.freeze({
    model:"dash-line",
    triggerRange:92,
    prepareHalfAngle:0.65,
    windup:0.24,
    commitDuration:0.18,
    commitSpeed:255,
    reach:28,
    halfWidth:13,
    sweepArc:0,
    damage:34,
    recover:0.58,
    recoveryVelocityScale:0.34
  })
});

export function createAdversary(spec=BASE_ADVERSARY_SPEC,{
  id="adversary",
  x=450,
  y=180,
  facing=Math.PI/2
}={}){
  const actor=createActor(spec.body,{id,x,y,facing,kind:"adversary"});
  actor.adversarySpec=spec;
  actor.mode="seek";
  actor.modeTime=0;
  actor.commitX=0;
  actor.commitY=1;
  actor.commitFacing=facing;
  actor.commitElapsed=0;
  actor.attackResolved=false;
  return actor;
}

function enter(actor,mode,time=0){
  actor.mode=mode;
  actor.modeTime=time;
  if(mode==="commit"){
    actor.attackResolved=false;
    actor.commitElapsed=0;
  }
}

export function updateAdversary(actor,player,world,dt,emit){
  const attack=actor.adversarySpec.attack;
  const distance=Math.hypot(player.x-actor.x,player.y-actor.y);

  if(actor.mode==="seek"){
    faceToward(actor,player.x,player.y,dt);
    driveActor(actor,Math.cos(actor.facing),Math.sin(actor.facing),dt);

    const desired=Math.atan2(player.y-actor.y,player.x-actor.x);
    const error=Math.abs(angleDelta(actor.facing,desired));
    if(distance<=attack.triggerRange && error<=attack.prepareHalfAngle){
      enter(actor,"prepare",attack.windup);
      actor.vx*=0.35;
      actor.vy*=0.35;
      emit?.({type:"adversary-prepare",actor:actor.id});
    }
  }else if(actor.mode==="prepare"){
    faceToward(actor,player.x,player.y,dt);
    driveActor(actor,0,0,dt);
    actor.modeTime-=dt;
    if(actor.modeTime<=0){
      const d=normalize(
        Math.cos(actor.facing),
        Math.sin(actor.facing),
        1,0
      );
      actor.commitX=d.x;
      actor.commitY=d.y;
      actor.commitFacing=actor.facing;
      actor.vx=d.x*attack.commitSpeed;
      actor.vy=d.y*attack.commitSpeed;
      enter(actor,"commit",attack.commitDuration);
      emit?.({
        type:"adversary-commit",
        actor:actor.id,
        model:attack.model
      });
    }
  }else if(actor.mode==="commit"){
    // Commitment is spatially real: no target re-homing until recovery.
    actor.commitElapsed+=dt;
    actor.modeTime-=dt;
    if(actor.modeTime<=0){
      const carry=attack.recoveryVelocityScale ?? 0.34;
      actor.vx*=carry;
      actor.vy*=carry;
      enter(actor,"recover",attack.recover);
      emit?.({type:"adversary-recover",actor:actor.id});
    }
  }else if(actor.mode==="recover"){
    driveActor(actor,0,0,dt);
    actor.modeTime-=dt;
    if(actor.modeTime<=0){
      enter(actor,"seek",0);
      emit?.({type:"adversary-seek",actor:actor.id});
    }
  }

  integrateActor(actor,dt);
  resolveActorWorld(actor,world);
}

function pointSegmentDistance(px,py,ax,ay,bx,by){
  const dx=bx-ax;
  const dy=by-ay;
  const denom=dx*dx+dy*dy;
  const t=denom>1e-9
    ? Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/denom))
    : 0;
  const x=ax+dx*t;
  const y=ay+dy*t;
  return {x,y,distance:Math.hypot(px-x,py-y)};
}

export function adversaryThreatSegment(actor){
  const attack=actor.adversarySpec.attack;
  let angle=actor.commitFacing;

  if(attack.model==="sweep-arc"){
    const progress=clamp(
      actor.commitElapsed/Math.max(1e-9,attack.commitDuration),
      0,
      1
    );
    angle=
      actor.commitFacing-
      attack.sweepArc*0.5+
      attack.sweepArc*progress;
  }

  const fx=Math.cos(angle);
  const fy=Math.sin(angle);
  const startX=actor.x+fx*actor.spec.radius;
  const startY=actor.y+fy*actor.spec.radius;

  return {
    ax:startX,
    ay:startY,
    bx:startX+fx*attack.reach,
    by:startY+fy*attack.reach,
    angle,
    model:attack.model
  };
}

export function probeAdversaryHit(actor,player,world){
  if(actor.mode!=="commit" || actor.attackResolved || actor.hp<=0) return null;

  const attack=actor.adversarySpec.attack;
  const segment=adversaryThreatSegment(actor);

  if(segmentBlocked(
    world,
    segment.ax,
    segment.ay,
    segment.bx,
    segment.by
  )) return null;

  const contact=pointSegmentDistance(
    player.x,player.y,
    segment.ax,segment.ay,
    segment.bx,segment.by
  );
  if(contact.distance>player.spec.radius+attack.halfWidth) return null;

  return {
    type:"adversary-hit-candidate",
    attacker:actor.id,
    model:attack.model,
    x:contact.x,
    y:contact.y,
    damage:attack.damage
  };
}

export function applyAdversaryHit(actor,player,candidate){
  if(!candidate) return null;
  actor.attackResolved=true;
  player.hp=Math.max(0,player.hp-candidate.damage);
  return {
    ...candidate,
    type:"adversary-hit",
    hp:player.hp
  };
}
