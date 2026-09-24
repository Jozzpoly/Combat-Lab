import { normalize } from "./math.js";
import { createState, stepState } from "./sim.js";

function relation(state){
  const dx=state.adversary.x-state.player.x;
  const dy=state.adversary.y-state.player.y;
  const d=normalize(dx,dy,0,-1);
  return {d,distance:Math.hypot(dx,dy)};
}

function ready(actor){
  return actor.action.mode==="idle";
}

function denyPolicy(name,state){
  const r=relation(state);

  if(name==="static-set"){
    return {
      moveX:0,moveY:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:true,drive:false
    };
  }

  if(name==="set-track"){
    return {
      moveX:(state.adversary.x-state.player.x)*0.014,
      moveY:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:true,drive:false
    };
  }

  if(name==="set-drive"){
    return {
      moveX:(state.adversary.x-state.player.x)*0.010,
      moveY:r.distance<90?-0.15:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:true,
      drive:r.distance<86&&ready(state.player)
    };
  }

  if(name==="blind-drive"){
    return {
      moveX:r.d.x,
      moveY:r.d.y,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,
      drive:ready(state.player)
    };
  }

  if(name==="lateral-yield"){
    const close=r.distance<90;
    return {
      moveX:close?-r.d.y:0,
      moveY:close?r.d.x*0.25:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:!close,
      drive:false
    };
  }

  if(name==="retreat"){
    return {
      moveX:0,moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,drive:false
    };
  }

  if(name==="movement-track"){
    return {
      moveX:(state.adversary.x-state.player.x)*0.014,
      moveY:0,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,drive:false
    };
  }

  throw new Error("unknown DENY policy "+name);
}

function breachPolicy(name,state){
  const r=relation(state);

  if(name==="blind-drive"){
    return {
      moveX:0,moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,
      drive:ready(state.player)
    };
  }

  if(name==="set-drive"){
    return {
      moveX:0,moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:true,
      drive:r.distance<88&&ready(state.player)
    };
  }

  if(name==="angle-left"||name==="angle-right"){
    const side=name==="angle-left"?-1:1;
    const targetX=800+side*220;
    const error=targetX-state.player.x;
    return {
      moveX:Math.max(-1,Math.min(1,error*0.018)),
      moveY:0.82,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,
      drive:r.distance<90&&ready(state.player)
    };
  }

  if(name==="angle-switch"){
    const side=state.player.y<1870?-1:1;
    const targetX=800+side*210;
    const error=targetX-state.player.x;
    return {
      moveX:Math.max(-1,Math.min(1,error*0.018)),
      moveY:0.78,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,
      drive:r.distance<88&&ready(state.player)
    };
  }

  if(name==="movement-only"){
    return {
      moveX:0,moveY:1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,drive:false
    };
  }

  if(name==="retreat"){
    return {
      moveX:0,moveY:-1,
      aimX:state.adversary.x,
      aimY:state.adversary.y,
      set:false,drive:false
    };
  }

  throw new Error("unknown BREACH policy "+name);
}

export function runPolicy({
  role,
  policy,
  seconds=6,
  dt=1/120,
  playerX=800,
  adversaryX=800,
  ...tuning
}={}){
  const state=createState({
    role,
    playerX,
    adversaryX,
    ...tuning
  });

  const metrics={
    playerDrives:0,
    adversaryDrives:0,
    playerDriveContacts:0,
    adversaryDriveContacts:0,
    supportedBodyFrames:0,
    maxPlayerSupport:0,
    maxAdversarySupport:0,
    bodyContacts:0,
    boundaryFrames:0,
    accessMargin:Infinity,
    playerMaxY:state.player.y,
    adversaryMaxY:state.adversary.y
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames&&state.result==="active";frame++){
    const input=role==="deny"
      ? denyPolicy(policy,state)
      : breachPolicy(policy,state);

    const events=stepState(state,input,dt);
    const contest=role==="deny"?state.adversary:state.player;
    metrics.accessMargin=Math.min(
      metrics.accessMargin,
      state.world.accessY-contest.y
    );
    metrics.playerMaxY=Math.max(metrics.playerMaxY,state.player.y);
    metrics.adversaryMaxY=Math.max(metrics.adversaryMaxY,state.adversary.y);

    for(const e of events){
      if(e.type==="drive-commit"){
        if(e.actor==="player") metrics.playerDrives++;
        else metrics.adversaryDrives++;
      }
      if(e.type==="drive-contact"){
        if(e.attacker==="player"){
          metrics.playerDriveContacts++;
          metrics.maxAdversarySupport=Math.max(
            metrics.maxAdversarySupport,
            e.targetSupport
          );
        }else{
          metrics.adversaryDriveContacts++;
          metrics.maxPlayerSupport=Math.max(
            metrics.maxPlayerSupport,
            e.targetSupport
          );
        }
      }
      if(e.type==="body-contact"){
        metrics.bodyContacts++;
        if(e.supportA>1e-8||e.supportB>1e-8){
          metrics.supportedBodyFrames++;
        }
      }
    }

    const margin=35;
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
    accessMargin:Number((Number.isFinite(metrics.accessMargin)?metrics.accessMargin:0).toFixed(1)),
    maxPlayerSupport:Number(metrics.maxPlayerSupport.toFixed(3)),
    maxAdversarySupport:Number(metrics.maxAdversarySupport.toFixed(3)),
    player:{
      x:Number(state.player.x.toFixed(1)),
      y:Number(state.player.y.toFixed(1)),
      set:state.player.setHeld,
      mode:state.player.action.mode
    },
    adversary:{
      x:Number(state.adversary.x.toFixed(1)),
      y:Number(state.adversary.y.toFixed(1)),
      set:state.adversary.setHeld,
      mode:state.adversary.action.mode
    },
    finite:[state.player,state.adversary].every(a=>
      [a.x,a.y,a.vx,a.vy,a.facing].every(Number.isFinite)
    )
  };
}
