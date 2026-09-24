import { normalize } from "./math.js";
import {
  driveLineActor,
  integrateLineActor
} from "./actor.js";
import {
  applyProjectileStep,
  beginDraw,
  createLinePlayer,
  probeProjectileStep,
  releaseDraw,
  stepDraw
} from "./line.js";
import {
  applyRusherHit,
  createLightRusher,
  probeRusherHit,
  updateLightRusher
} from "./rusher.js";
import {
  resolveLineActorPair,
  resolveLineActorWorld
} from "./world.js";

export const L1_OPEN_WORLD=Object.freeze({
  width:8000,
  height:8000,
  inset:28,
  walls:Object.freeze([])
});

export function createL1State({
  world=L1_OPEN_WORLD,
  playerStart={x:4000,y:4400,facing:-Math.PI/2},
  rusherStart={id:"rusher",x:4000,y:3900,facing:Math.PI/2},
  projectileDamageScale=1,
  projectileImpulseScale=1
}={}){
  return {
    world,
    player:createLinePlayer(playerStart),
    rusher:createLightRusher(rusherStart),
    projectiles:[],
    projectileDamageScale,
    projectileImpulseScale,
    time:0,
    result:"active",
    events:[]
  };
}

function aimPlayer(player,x,y){
  player.facing=Math.atan2(y-player.y,x-player.x);
}

function projectileOutside(projectile,world){
  return (
    projectile.x<world.inset-projectile.radius||
    projectile.x>world.width-world.inset+projectile.radius||
    projectile.y<world.inset-projectile.radius||
    projectile.y>world.height-world.inset+projectile.radius
  );
}

export function stepL1(state,input,dt=1/120){
  if(state.result!=="active") return [];

  const events=[];
  const {player,rusher,world}=state;

  if(input.aimX!==undefined&&input.aimY!==undefined){
    aimPlayer(player,input.aimX,input.aimY);
  }

  const move=normalize(input.moveX||0,input.moveY||0,0,0);
  driveLineActor(player,move.x,move.y,dt);
  integrateLineActor(player,dt);
  resolveLineActorWorld(player,world);

  if(input.drawHeld){
    if(!player.draw.held) beginDraw(player);
    stepDraw(player,dt);
  }else if(player.draw.held){
    const shot=releaseDraw(player);
    if(shot){
      shot.damage*=state.projectileDamageScale;
      shot.impulse*=state.projectileImpulseScale;
      state.projectiles.push(shot);
      events.push({
        type:"shot-fired",
        projectile:shot.id,
        x:shot.x,
        y:shot.y
      });
    }else{
      events.push({type:"draw-released-early"});
    }
  }

  updateLightRusher(
    rusher,
    player,
    world,
    dt,
    e=>events.push(e)
  );

  const incoming=probeRusherHit(rusher,player,world);

  const projectileProbes=[];
  for(const projectile of state.projectiles){
    if(!projectile.alive) continue;
    const probe=probeProjectileStep(
      projectile,
      rusher.hp>0?[rusher]:[],
      world,
      dt
    );
    if(probe){
      projectileProbes.push({
        projectile,
        probe,
        targetMode:rusher.mode
      });
    }
  }

  // Physical body contact remains independent from attack authority.
  resolveLineActorPair(player,rusher);
  resolveLineActorWorld(player,world);
  resolveLineActorWorld(rusher,world);

  // Apply projectile consequences and already-measured hostile consequence
  // from the same pre-impact state. Neither side retroactively erases the other.
  for(const {projectile,probe,targetMode} of projectileProbes){
    const event=applyProjectileStep(projectile,probe);
    if(event){
      if(event.type==="projectile-body-hit"){
        event.targetMode=targetMode;
        if(event.killed){
          rusher.mode="down";
          rusher.vx=0;
          rusher.vy=0;
        }
      }
      events.push(event);
    }
    if(projectile.alive&&projectileOutside(projectile,world)){
      projectile.alive=false;
      events.push({
        type:"projectile-expired",
        projectile:projectile.id
      });
    }
  }

  if(incoming){
    const event=applyRusherHit(rusher,player,incoming);
    if(event) events.push(event);
  }

  state.projectiles=state.projectiles.filter(x=>x.alive);
  state.time+=dt;

  if(player.hp<=0) state.result="down";
  else if(rusher.hp<=0) state.result="clear";

  state.events.push(...events);
  return events;
}
