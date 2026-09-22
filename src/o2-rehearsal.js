import { normalize } from "./math.js";
import { createO2State, stepO2State } from "./o2-sim.js";
import { o2ActionState, spearSegment } from "./o2.js";

function nearestLiving(state) {
  let best=null;
  let distance=Infinity;
  for(const threat of state.threats){
    if(threat.hp<=0) continue;
    const d=Math.hypot(
      threat.x-state.player.x,
      threat.y-state.player.y
    );
    if(d<distance){
      best=threat;
      distance=d;
    }
  }
  return {threat:best,distance};
}

function baseAim(state,threat) {
  return threat
    ? {aimX:threat.x,aimY:threat.y}
    : {aimX:state.player.x,aimY:state.player.y-100};
}

function backwardKite(state) {
  const {threat,distance}=nearestLiving(state);
  if(!threat) return {moveX:0,moveY:0,...baseAim(state,null)};
  const to=normalize(
    threat.x-state.player.x,
    threat.y-state.player.y,
    0,-1
  );
  return {
    moveX:-to.x,
    moveY:-to.y,
    ...baseAim(state,threat),
    thrust:distance<150 && !state.player.o2Action
  };
}

function forwardChase(state) {
  const {threat,distance}=nearestLiving(state);
  if(!threat) return {moveX:0,moveY:0,...baseAim(state,null)};
  const to=normalize(
    threat.x-state.player.x,
    threat.y-state.player.y,
    0,-1
  );
  return {
    moveX:to.x*0.92,
    moveY:to.y*0.92,
    ...baseAim(state,threat),
    thrust:distance<145 && !state.player.o2Action
  };
}

function clearanceSpam(state) {
  const {threat}=nearestLiving(state);
  return {
    moveX:0,
    moveY:0,
    ...baseAim(state,threat),
    clearance:!state.player.o2Action
  };
}

function passive(state) {
  const {threat}=nearestLiving(state);
  return {
    moveX:0,
    moveY:0,
    ...baseAim(state,threat)
  };
}

function mixedLane(state) {
  const {threat,distance}=nearestLiving(state);
  if(!threat) return {moveX:0,moveY:0,...baseAim(state,null)};
  const to=normalize(
    threat.x-state.player.x,
    threat.y-state.player.y,
    0,-1
  );
  const action=o2ActionState(state.player);

  const collapsed=distance<74;
  const committed=
    threat.state==="windup" ||
    threat.state==="lunge";

  if(collapsed && !state.player.o2Action){
    return {
      moveX:-to.y*0.46,
      moveY:to.x*0.46,
      ...baseAim(state,threat),
      clearance:true
    };
  }

  return {
    moveX:committed
      ? -to.y*0.52
      : (distance>116 ? to.x*0.36 : 0),
    moveY:committed
      ? to.x*0.52
      : (distance>116 ? to.y*0.36 : 0),
    ...baseAim(state,threat),
    thrust:
      !state.player.o2Action &&
      distance<150 &&
      distance>74 &&
      !committed,
    clearance:false,
    actionPhase:action.phase
  };
}

export function runO2Policy(policyName,{
  seconds=16,
  dt=1/120,
  playerStart,
  threatStarts,
  world,
  threatSpec
}={}) {
  const state=createO2State({
    ...(playerStart?{playerStart}:{}),
    ...(threatStarts?{threatStarts}:{}),
    ...(world?{world}:{}),
    ...(threatSpec?{threatSpec}:{})
  });

  let policy;
  if(policyName==="backward-kite") policy=backwardKite;
  else if(policyName==="forward-chase") policy=forwardChase;
  else if(policyName==="clearance-spam") policy=clearanceSpam;
  else if(policyName==="passive") policy=passive;
  else if(policyName==="mixed-lane") policy=mixedLane;
  else throw new Error("unknown O2 policy: "+policyName);

  const counts={
    thrustHits:0,
    clearanceContacts:0,
    bodyHits:0,
    kills:0,
    wallBlockedFrames:0,
    boundaryFrames:0
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames && state.result==="active";frame++){
    const events=stepO2State(state,policy(state),dt);

    const p=state.player;
    const activeWorld=state.world;
    const margin=28;
    if(
      p.x < activeWorld.inset+p.spec.radius+margin ||
      p.x > activeWorld.width-activeWorld.inset-p.spec.radius-margin ||
      p.y < activeWorld.inset+p.spec.radius+margin ||
      p.y > activeWorld.height-activeWorld.inset-p.spec.radius-margin
    ) counts.boundaryFrames++;

    if(spearSegment(p,{world:activeWorld}).blocked) {
      counts.wallBlockedFrames++;
    }

    for(const event of events){
      if(event.type==="o2-thrust-hit"){
        counts.thrustHits++;
        if(event.killed) counts.kills++;
      }
      if(event.type==="o2-clearance-contact") counts.clearanceContacts++;
      if(event.type==="o2-body-hit") counts.bodyHits++;
    }
  }

  return {
    policy:policyName,
    result:state.result,
    time:Number(state.time.toFixed(3)),
    hp:state.player.hp,
    livingThreats:state.threats.filter(t=>t.hp>0).length,
    actionSerial:state.player.o2Serial,
    ...counts,
    player:{
      x:Number(state.player.x.toFixed(2)),
      y:Number(state.player.y.toFixed(2))
    },
    threats:state.threats.map(t=>({
      id:t.id,
      hp:t.hp,
      state:t.state,
      x:Number(t.x.toFixed(2)),
      y:Number(t.y.toFixed(2))
    })),
    finite:[state.player,...state.threats].every(a =>
      [a.x,a.y,a.vx,a.vy,a.facing].every(Number.isFinite)
    )
  };
}
