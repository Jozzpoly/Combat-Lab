import { normalize } from "./math.js";
import { createL1State, stepL1, L1_OPEN_WORLD } from "./line-sim.js";

function relation(state){
  const dx=state.rusher.x-state.player.x;
  const dy=state.rusher.y-state.player.y;
  const d=normalize(dx,dy,0,-1);
  return {
    dx,dy,d,
    distance:Math.hypot(dx,dy)
  };
}

function cycleDraw(state,releaseWhen=true){
  if(!state.player.draw.held) return true;
  if(state.player.draw.ready&&releaseWhen) return false;
  return true;
}

function standFire(state){
  const r=relation(state);
  return {
    moveX:0,
    moveY:0,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:cycleDraw(state,r.distance<620)
  };
}

function maxRateFire(state){
  return {
    moveX:0,
    moveY:0,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:cycleDraw(state,true)
  };
}

function backwardKiteFire(state){
  const r=relation(state);
  return {
    moveX:-r.d.x,
    moveY:-r.d.y,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:cycleDraw(state,true)
  };
}

function lateralOnly(state){
  const r=relation(state);
  const threatened=
    state.rusher.mode==="prepare"||
    state.rusher.mode==="commit";
  return {
    moveX:threatened?-r.d.y:0,
    moveY:threatened?r.d.x:0,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:false
  };
}

function timedFire(state,mode){
  const shouldRelease=
    state.player.draw.ready&&
    state.rusher.mode===mode;
  return {
    moveX:0,
    moveY:0,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:!shouldRelease
  };
}

function lateralCommitShot(state){
  const r=relation(state);
  const threatened=
    state.rusher.mode==="prepare"||
    state.rusher.mode==="commit";
  const release=
    state.player.draw.ready&&
    state.rusher.mode==="commit";
  return {
    moveX:threatened?-r.d.y:0,
    moveY:threatened?r.d.x:0,
    aimX:state.rusher.x,
    aimY:state.rusher.y,
    drawHeld:!release
  };
}

export function runL1Policy(policyName,{
  seconds=12,
  dt=1/120,
  world=L1_OPEN_WORLD,
  playerStart,
  rusherStart,
  projectileDamageScale=1,
  projectileImpulseScale=1
}={}){
  const state=createL1State({
    world,
    ...(playerStart?{playerStart}:{}),
    ...(rusherStart?{rusherStart}:{}),
    projectileDamageScale,
    projectileImpulseScale
  });

  let policy;
  if(policyName==="stand-fire") policy=standFire;
  else if(policyName==="max-rate-fire") policy=maxRateFire;
  else if(policyName==="backward-kite-fire") policy=backwardKiteFire;
  else if(policyName==="lateral-only") policy=lateralOnly;
  else if(policyName==="fire-on-prepare") policy=s=>timedFire(s,"prepare");
  else if(policyName==="fire-on-commit") policy=s=>timedFire(s,"commit");
  else if(policyName==="lateral-commit-shot") policy=lateralCommitShot;
  else throw new Error("unknown L1 policy: "+policyName);

  const metrics={
    shots:0,
    projectileHits:0,
    projectileWallHits:0,
    rusherHits:0,
    prepares:0,
    commits:0,
    recoveries:0,
    missedCommits:0,
    hitDuringSeek:0,
    hitDuringPrepare:0,
    hitDuringCommit:0,
    hitDuringRecover:0,
    boundaryFrames:0,
    minDistance:Infinity,
    maxDistance:0
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames&&state.result==="active";frame++){
    const events=stepL1(state,policy(state),dt);
    const r=relation(state);
    metrics.minDistance=Math.min(metrics.minDistance,r.distance);
    metrics.maxDistance=Math.max(metrics.maxDistance,r.distance);

    const p=state.player;
    const margin=40;
    if(
      p.x<world.inset+p.spec.radius+margin||
      p.x>world.width-world.inset-p.spec.radius-margin||
      p.y<world.inset+p.spec.radius+margin||
      p.y>world.height-world.inset-p.spec.radius-margin
    ) metrics.boundaryFrames++;

    for(const event of events){
      if(event.type==="shot-fired") metrics.shots++;
      if(event.type==="projectile-body-hit"){
        metrics.projectileHits++;
        const key="hitDuring"+
          event.targetMode[0].toUpperCase()+
          event.targetMode.slice(1);
        if(Object.hasOwn(metrics,key)) metrics[key]++;
      }
      if(event.type==="projectile-wall-hit") metrics.projectileWallHits++;
      if(event.type==="rusher-hit") metrics.rusherHits++;
      if(event.type==="rusher-prepare") metrics.prepares++;
      if(event.type==="rusher-commit") metrics.commits++;
      if(event.type==="rusher-recover"){
        metrics.recoveries++;
        if(!event.resolved) metrics.missedCommits++;
      }
    }
  }

  return {
    policy:policyName,
    result:state.result,
    time:Number(state.time.toFixed(3)),
    playerHp:state.player.hp,
    rusherHp:state.rusher.hp,
    rusherMode:state.rusher.mode,
    activeProjectiles:state.projectiles.length,
    ...metrics,
    minDistance:Number((Number.isFinite(metrics.minDistance)?metrics.minDistance:0).toFixed(1)),
    maxDistance:Number(metrics.maxDistance.toFixed(1)),
    player:{
      x:Number(state.player.x.toFixed(1)),
      y:Number(state.player.y.toFixed(1))
    },
    rusher:{
      x:Number(state.rusher.x.toFixed(1)),
      y:Number(state.rusher.y.toFixed(1)),
      vx:Number(state.rusher.vx.toFixed(1)),
      vy:Number(state.rusher.vy.toFixed(1))
    },
    finite:[state.player,state.rusher,...state.projectiles].every(a=>
      [a.x,a.y,a.vx,a.vy].every(Number.isFinite)
    )
  };
}
