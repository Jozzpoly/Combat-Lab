import { normalize } from "./math.js";
import { createA0State, stepA0 } from "./sim.js";
import { ADVERSARIAL_YARD } from "./world.js";

function enemyOf(state){
  return state.adversaries.find(x=>x.hp>0) ?? null;
}

function aim(enemy,player){
  return enemy
    ? {aimX:enemy.x,aimY:enemy.y}
    : {aimX:player.x,aimY:player.y-100};
}

function chaseMash(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
  return {
    moveX:d.x,
    moveY:d.y,
    ...aim(enemy,state.player),
    strike:distance<86&&!state.player.action
  };
}

function retreatStrike(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
  return {
    moveX:-d.x,
    moveY:-d.y,
    ...aim(enemy,state.player),
    strike:distance<86&&!state.player.action
  };
}

function orbitStrike(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
  const inward=distance>88?0.34:distance<62?-0.22:0;
  return {
    moveX:-d.y+d.x*inward,
    moveY:d.x+d.y*inward,
    ...aim(enemy,state.player),
    strike:distance<86&&!state.player.action
  };
}

function standMash(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
  return {
    moveX:0,
    moveY:0,
    ...aim(enemy,state.player),
    strike:distance<86&&!state.player.action
  };
}

function delayedBackstepReader(state,delay){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
  const attack=enemy.adversarySpec.attack;
  const prepareElapsed=enemy.mode==="prepare"
    ? Math.max(0,attack.windup-enemy.modeTime)
    : 0;
  const react=
    enemy.mode==="commit" ||
    (enemy.mode==="prepare" && prepareElapsed>=delay);

  if(react){
    return {
      moveX:-d.x,
      moveY:-d.y,
      ...aim(enemy,state.player),
      strike:false
    };
  }

  if(enemy.mode==="recover"){
    return {
      moveX:d.x*0.82,
      moveY:d.y*0.82,
      ...aim(enemy,state.player),
      strike:distance<90&&!state.player.action
    };
  }

  return {
    moveX:d.x*0.54,
    moveY:d.y*0.54,
    ...aim(enemy,state.player),
    strike:false
  };
}

function backstepReader(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);

  if(enemy.mode==="prepare"||enemy.mode==="commit"){
    return {
      moveX:-d.x,
      moveY:-d.y,
      ...aim(enemy,state.player),
      strike:false
    };
  }

  if(enemy.mode==="recover"){
    return {
      moveX:d.x*0.82,
      moveY:d.y*0.82,
      ...aim(enemy,state.player),
      strike:distance<90&&!state.player.action
    };
  }

  return {
    moveX:d.x*0.54,
    moveY:d.y*0.54,
    ...aim(enemy,state.player),
    strike:false
  };
}

function phaseReader(state){
  const enemy=enemyOf(state);
  if(!enemy) return {moveX:0,moveY:0,...aim(null,state.player)};
  const d=normalize(enemy.x-state.player.x,enemy.y-state.player.y,0,-1);
  const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);

  if(enemy.mode==="prepare"||enemy.mode==="commit"){
    return {
      moveX:-d.y,
      moveY:d.x,
      ...aim(enemy,state.player),
      strike:false
    };
  }

  if(enemy.mode==="recover"){
    return {
      moveX:d.x*0.72,
      moveY:d.y*0.72,
      ...aim(enemy,state.player),
      strike:distance<90&&!state.player.action
    };
  }

  return {
    // During seek, keep closing until the adversary itself exposes prepare.
    // Do not bake either anchor's trigger distance into the controller.
    moveX:d.x*0.54,
    moveY:d.y*0.54,
    ...aim(enemy,state.player),
    strike:false
  };
}

export function runA1Policy(spec,policyName,{
  seconds=14,
  dt=1/120,
  world=ADVERSARIAL_YARD,
  playerStart={x:450,y:500,facing:-Math.PI/2},
  adversaryStart={id:"enemy",x:450,y:145,facing:Math.PI/2}
}={}){
  const state=createA0State({
    world,
    playerStart,
    adversarySpec:spec,
    adversaryStart
  });

  let policy;
  if(policyName==="chase-mash") policy=chaseMash;
  else if(policyName==="retreat-strike") policy=retreatStrike;
  else if(policyName==="orbit-strike") policy=orbitStrike;
  else if(policyName==="stand-mash") policy=standMash;
  else if(policyName==="phase-reader") policy=phaseReader;
  else if(policyName==="backstep-reader") policy=backstepReader;
  else if(policyName==="backstep-delay-080") policy=state=>delayedBackstepReader(state,0.08);
  else if(policyName==="backstep-delay-160") policy=state=>delayedBackstepReader(state,0.16);
  else if(policyName==="backstep-delay-240") policy=state=>delayedBackstepReader(state,0.24);
  else throw new Error("unknown A1 policy: "+policyName);

  const metrics={
    playerHits:0,
    enemyHits:0,
    prepares:0,
    commits:0,
    recovers:0,
    boundaryFrames:0,
    minDistance:Infinity,
    maxDistance:0,
    contactFrames:0
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames&&state.result==="active";frame++){
    const input=policy(state);
    const events=stepA0(state,input,dt);
    const enemy=state.adversaries[0];
    const distance=Math.hypot(enemy.x-state.player.x,enemy.y-state.player.y);
    metrics.minDistance=Math.min(metrics.minDistance,distance);
    metrics.maxDistance=Math.max(metrics.maxDistance,distance);
    if(distance<enemy.spec.radius+state.player.spec.radius+1) metrics.contactFrames++;

    const p=state.player;
    const margin=28;
    if(
      p.x<world.inset+p.spec.radius+margin||
      p.x>world.width-world.inset-p.spec.radius-margin||
      p.y<world.inset+p.spec.radius+margin||
      p.y>world.height-world.inset-p.spec.radius-margin
    ) metrics.boundaryFrames++;

    for(const event of events){
      if(event.type==="player-hit") metrics.playerHits++;
      if(event.type==="adversary-hit") metrics.enemyHits++;
      if(event.type==="adversary-prepare") metrics.prepares++;
      if(event.type==="adversary-commit") metrics.commits++;
      if(event.type==="adversary-recover") metrics.recovers++;
    }
  }

  const enemy=state.adversaries[0];
  return {
    policy:policyName,
    result:state.result,
    time:Number(state.time.toFixed(3)),
    playerHp:state.player.hp,
    enemyHp:enemy.hp,
    playerHits:metrics.playerHits,
    enemyHits:metrics.enemyHits,
    prepares:metrics.prepares,
    commits:metrics.commits,
    recovers:metrics.recovers,
    boundaryFrames:metrics.boundaryFrames,
    contactFrames:metrics.contactFrames,
    minDistance:Number((Number.isFinite(metrics.minDistance)?metrics.minDistance:0).toFixed(1)),
    maxDistance:Number(metrics.maxDistance.toFixed(1)),
    player:{x:Number(state.player.x.toFixed(1)),y:Number(state.player.y.toFixed(1))},
    enemy:{x:Number(enemy.x.toFixed(1)),y:Number(enemy.y.toFixed(1)),mode:enemy.mode},
    finite:[state.player,enemy].every(a=>
      [a.x,a.y,a.vx,a.vy,a.facing,a.hp].every(Number.isFinite)
    )
  };
}
