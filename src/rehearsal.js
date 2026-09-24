import { normalize } from "./math.js";
import { createE0State, stepE0 } from "./sim.js";

function relation(state){
  const dx=state.adversary.x-state.player.x;
  const dy=state.adversary.y-state.player.y;
  const d=normalize(dx,dy,0,-1);
  return {
    d,
    distance:Math.hypot(dx,dy)
  };
}

function driveWhenClose(state,threshold=92){
  return (
    state.player.action.mode==="idle" &&
    relation(state).distance<threshold
  );
}

function denyPolicy(name,state){
  const r=relation(state);

  if(name==="static-block"){
    return {
      moveX:0,
      moveY:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state)
    };
  }

  if(name==="meet-drive"){
    return {
      moveX:r.d.x*0.35,
      moveY:r.d.y*0.35,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state)
    };
  }

  if(name==="lateral-track"){
    return {
      moveX:(state.adversary.x-state.player.x)*0.012,
      moveY:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state)
    };
  }

  if(name==="retreat"){
    return {
      moveX:0,
      moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:false
    };
  }

  if(name==="orbit"){
    return {
      moveX:-r.d.y,
      moveY:r.d.x,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state,82)
    };
  }

  if(name==="mash"){
    return {
      moveX:r.d.x,
      moveY:r.d.y,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:state.player.action.mode==="idle"
    };
  }

  throw new Error("unknown deny policy "+name);
}

function breachPolicy(name,state){
  const r=relation(state);

  if(name==="direct-mash"){
    return {
      moveX:0,
      moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:state.player.action.mode==="idle"
    };
  }

  if(name==="angle-left"){
    return {
      moveX:-0.72,
      moveY:0.78,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state,86)
    };
  }

  if(name==="angle-right"){
    return {
      moveX:0.72,
      moveY:0.78,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state,86)
    };
  }

  if(name==="yield-reset"){
    const close=r.distance<86;
    const playerRecovering=state.player.action.mode==="recover";
    return {
      moveX:close||playerRecovering?-r.d.x*0.65:0,
      moveY:close||playerRecovering?-r.d.y*0.65:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:driveWhenClose(state,80)
    };
  }

  if(name==="retreat"){
    return {
      moveX:0,
      moveY:-1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:false
    };
  }

  if(name==="no-drive-direct"){
    return {
      moveX:0,
      moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      drive:false
    };
  }

  throw new Error("unknown breach policy "+name);
}

export function runE0Policy({
  role,
  policy,
  seconds=6,
  dt=1/120,
  driveEnabled=true,
  homingDrive=false,
  displacementScale=1,
  recoveryScale=1
}={}){
  const state=createE0State({
    role,
    driveEnabled,
    homingDrive,
    displacementScale,
    recoveryScale
  });

  const metrics={
    playerDrives:0,
    adversaryDrives:0,
    playerContacts:0,
    adversaryContacts:0,
    bodyContacts:0,
    minDistance:Infinity,
    maxDistance:0,
    boundaryFrames:0,
    playerMaxY:state.player.y,
    adversaryMaxY:state.adversary.y,
    accessMargin:Infinity
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames&&state.result==="active";frame++){
    const input=role==="deny"
      ? denyPolicy(policy,state)
      : breachPolicy(policy,state);

    const events=stepE0(state,input,dt);
    const dx=state.adversary.x-state.player.x;
    const dy=state.adversary.y-state.player.y;
    const distance=Math.hypot(dx,dy);
    metrics.minDistance=Math.min(metrics.minDistance,distance);
    metrics.maxDistance=Math.max(metrics.maxDistance,distance);
    metrics.playerMaxY=Math.max(metrics.playerMaxY,state.player.y);
    metrics.adversaryMaxY=Math.max(metrics.adversaryMaxY,state.adversary.y);

    const contestActor=role==="deny"?state.adversary:state.player;
    metrics.accessMargin=Math.min(
      metrics.accessMargin,
      state.world.accessY-contestActor.y
    );

    for(const event of events){
      if(event.type==="drive-commit"){
        if(event.actor==="player") metrics.playerDrives++;
        else metrics.adversaryDrives++;
      }
      if(event.type==="drive-contact"){
        if(event.attacker==="player") metrics.playerContacts++;
        else metrics.adversaryContacts++;
      }
      if(event.type==="body-contact") metrics.bodyContacts++;
    }

    const margin=28;
    for(const actor of [state.player,state.adversary]){
      if(
        actor.x<state.world.inset+actor.spec.radius+margin||
        actor.x>state.world.width-state.world.inset-actor.spec.radius-margin||
        actor.y<state.world.inset+actor.spec.radius+margin||
        actor.y>state.world.height-state.world.inset-actor.spec.radius-margin
      ) metrics.boundaryFrames++;
    }
  }

  if(state.result==="active"){
    state.result=role==="deny"?"held":"blocked";
  }

  return {
    role,
    policy,
    result:state.result,
    time:Number(state.time.toFixed(3)),
    ...metrics,
    minDistance:Number((Number.isFinite(metrics.minDistance)?metrics.minDistance:0).toFixed(1)),
    maxDistance:Number(metrics.maxDistance.toFixed(1)),
    accessMargin:Number((Number.isFinite(metrics.accessMargin)?metrics.accessMargin:0).toFixed(1)),
    player:{
      x:Number(state.player.x.toFixed(1)),
      y:Number(state.player.y.toFixed(1)),
      mode:state.player.action.mode
    },
    adversary:{
      x:Number(state.adversary.x.toFixed(1)),
      y:Number(state.adversary.y.toFixed(1)),
      mode:state.adversary.action.mode
    },
    finite:[state.player,state.adversary].every(a=>
      [a.x,a.y,a.vx,a.vy].every(Number.isFinite)
    )
  };
}
