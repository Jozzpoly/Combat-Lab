import { normalize, wrapAngle } from "./math.js";
import {
  createLineActor,
  driveLineActor,
  integrateLineActor
} from "./actor.js";
import {
  resolveLineActorWorld,
  segmentCircleFirstT,
  segmentRectFirstT
} from "./world.js";

export const LIGHT_RUSHER_SPEC=Object.freeze({
  body:Object.freeze({
    radius:14,
    mass:42,
    maxSpeed:258,
    acceleration:3100,
    braking:3350,
    hp:80
  }),
  turnRate:12.5,
  attack:Object.freeze({
    triggerRange:82,
    prepareHalfAngle:0.62,
    windup:0.15,
    commitDuration:0.18,
    commitSpeed:345,
    reach:20,
    halfWidth:8,
    damage:34,
    recover:0.76,
    recoveryVelocityScale:0.72
  })
});

export function createLightRusher({
  id="rusher",
  x,
  y,
  facing=Math.PI/2,
  spec=LIGHT_RUSHER_SPEC
}={}){
  const actor=createLineActor(
    spec.body,
    {id,kind:"rusher",x,y,facing}
  );
  actor.rusherSpec=spec;
  actor.mode="seek";
  actor.modeTime=0;
  actor.commitX=0;
  actor.commitY=1;
  actor.attackResolved=false;
  return actor;
}

function turnToward(actor,target,dt){
  const desired=Math.atan2(target.y-actor.y,target.x-actor.x);
  const delta=wrapAngle(desired-actor.facing);
  const maxTurn=actor.rusherSpec.turnRate*dt;
  actor.facing+=Math.max(-maxTurn,Math.min(maxTurn,delta));
  return Math.abs(delta);
}

function enter(actor,mode,time=0){
  actor.mode=mode;
  actor.modeTime=time;
  if(mode==="commit") actor.attackResolved=false;
}

export function updateLightRusher(actor,player,world,dt,emit){
  if(actor.hp<=0||actor.mode==="down") return;

  const attack=actor.rusherSpec.attack;
  const distance=Math.hypot(player.x-actor.x,player.y-actor.y);

  if(actor.mode==="seek"){
    const error=turnToward(actor,player,dt);
    driveLineActor(
      actor,
      Math.cos(actor.facing),
      Math.sin(actor.facing),
      dt
    );

    if(
      distance<=attack.triggerRange &&
      error<=attack.prepareHalfAngle
    ){
      enter(actor,"prepare",attack.windup);
      actor.vx*=0.35;
      actor.vy*=0.35;
      emit?.({type:"rusher-prepare",actor:actor.id});
    }
  }else if(actor.mode==="prepare"){
    turnToward(actor,player,dt);
    driveLineActor(actor,0,0,dt);
    actor.modeTime-=dt;

    if(actor.modeTime<=0){
      const d=normalize(
        Math.cos(actor.facing),
        Math.sin(actor.facing),
        0,1
      );
      actor.commitX=d.x;
      actor.commitY=d.y;
      actor.vx=d.x*attack.commitSpeed;
      actor.vy=d.y*attack.commitSpeed;
      enter(actor,"commit",attack.commitDuration);
      emit?.({type:"rusher-commit",actor:actor.id});
    }
  }else if(actor.mode==="commit"){
    actor.modeTime-=dt;
    if(actor.modeTime<=0){
      const resolved=actor.attackResolved;
      actor.vx*=attack.recoveryVelocityScale;
      actor.vy*=attack.recoveryVelocityScale;
      enter(actor,"recover",attack.recover);
      emit?.({
        type:"rusher-recover",
        actor:actor.id,
        resolved
      });
    }
  }else if(actor.mode==="recover"){
    driveLineActor(actor,0,0,dt);
    actor.modeTime-=dt;
    if(actor.modeTime<=0){
      enter(actor,"seek",0);
      emit?.({type:"rusher-seek",actor:actor.id});
    }
  }

  integrateLineActor(actor,dt);
  resolveLineActorWorld(actor,world);
}

export function probeRusherHit(actor,player,world){
  if(
    actor.hp<=0||
    actor.mode!=="commit"||
    actor.attackResolved
  ) return null;

  const attack=actor.rusherSpec.attack;
  const ax=actor.x+actor.commitX*actor.spec.radius;
  const ay=actor.y+actor.commitY*actor.spec.radius;
  const bx=ax+actor.commitX*attack.reach;
  const by=ay+actor.commitY*attack.reach;

  const bodyT=segmentCircleFirstT(
    ax,ay,bx,by,
    player.x,player.y,
    player.spec.radius+attack.halfWidth
  );
  if(bodyT===null) return null;

  let wallT=Infinity;
  for(const wall of world.walls||[]){
    const t=segmentRectFirstT(ax,ay,bx,by,wall,attack.halfWidth);
    if(t!==null&&t<wallT) wallT=t;
  }
  if(wallT<=bodyT) return null;

  return {
    type:"rusher-hit-candidate",
    attacker:actor.id,
    damage:attack.damage,
    t:bodyT,
    x:ax+(bx-ax)*bodyT,
    y:ay+(by-ay)*bodyT
  };
}

export function applyRusherHit(actor,player,candidate){
  if(!candidate) return null;
  actor.attackResolved=true;
  player.hp=Math.max(0,player.hp-candidate.damage);
  return {
    ...candidate,
    type:"rusher-hit",
    hp:player.hp
  };
}
