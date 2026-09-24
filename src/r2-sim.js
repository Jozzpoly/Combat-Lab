import { normalize } from "./math.js";
import {
  driveBody,
  requestCommit,
  setBodyFacingIntent,
  setGuideIntent,
  snapshotReadiness,
  stepWeapon,
  weaponSegment
} from "./readiness.js";
import { createSeededPlayer } from "./r1-sim.js";
import {
  createR2Rusher,
  stepR2Rusher
} from "./r2-pressure.js";

function pointSegmentDistance(px,py,seg){
  const dx=seg.bx-seg.ax;
  const dy=seg.by-seg.ay;
  const denom=dx*dx+dy*dy;
  const t=denom>1e-9
    ? Math.max(0,Math.min(1,(
        (px-seg.ax)*dx+(py-seg.ay)*dy
      )/denom))
    : 0;
  const x=seg.ax+dx*t;
  const y=seg.ay+dy*t;
  return {
    x,y,t,
    distance:Math.hypot(px-x,py-y)
  };
}

export function createR2State({
  history="free",
  side="east",
  inheritanceMode="full",
  guideAuthority=0.38,
  interludeSeconds=0.24,
  prepare=0.32,
  returnAcceleration
}={}){
  return {
    history,
    side,
    guideAuthority,
    player:createSeededPlayer({
      history,
      inheritanceMode,
      guideAuthority,
      interludeSeconds
    }),
    rusher:createR2Rusher(side,{
      prepare,
      returnAcceleration
    }),
    toolContactAction:null,
    toolContacts:0,
    bodyContacts:0,
    commitEndedAt:null,
    turnaroundAt:null,
    events:[],
    time:0
  };
}

export function r2RusherAngle(state){
  return Math.atan2(
    state.rusher.y-state.player.body.y,
    state.rusher.x-state.player.body.x
  );
}

function probeBodyContact(state){
  if(state.rusher.mode!=="commit") return null;
  if(state.bodyContacts>0) return null;

  const p=state.player.body;
  const r=state.rusher;
  const dx=r.x-p.x;
  const dy=r.y-p.y;
  const distance=Math.hypot(dx,dy);
  const required=18+r.radius;
  if(distance>required) return null;

  const d=normalize(dx,dy,1,0);
  return {
    type:"body-contact",
    x:(p.x+r.x)*0.5,
    y:(p.y+r.y)*0.5,
    nx:d.x,
    ny:d.y
  };
}

function probeFollowContact(state){
  const action=state.player.weapon.action;
  if(!action||state.toolContactAction===action) return null;

  // R2 records follow-up geometry only after the incoming commit has
  // physically ended. No "vulnerable" state is granted.
  if(state.rusher.mode!=="return") return null;

  const seg=weaponSegment(state.player);
  const contact=pointSegmentDistance(
    state.rusher.x,
    state.rusher.y,
    seg
  );
  if(contact.distance>state.rusher.radius+4) return null;

  return {
    type:"follow-contact",
    action,
    x:contact.x,
    y:contact.y,
    beforeTurnaround:state.turnaroundAt===null
  };
}

export function stepR2(state,input,dt=1/120){
  const events=[];

  if(Number.isFinite(input.bodyFacing)){
    setBodyFacingIntent(state.player,input.bodyFacing);
  }
  if(Number.isFinite(input.guideAngle)){
    setGuideIntent(state.player,input.guideAngle,82);
  }
  if(input.commit){
    requestCommit(state.player,input.commitAngle);
  }

  driveBody(
    state.player,
    input.moveX||0,
    input.moveY||0,
    dt
  );

  const rusherEvents=stepR2Rusher(
    state.rusher,
    state.player.body,
    dt
  );
  for(const event of rusherEvents){
    if(event.type==="rusher-commit-end"&&state.commitEndedAt===null){
      state.commitEndedAt=state.time+dt;
    }
    if(event.type==="rusher-turnaround"&&state.turnaroundAt===null){
      state.turnaroundAt=state.time+dt;
    }
    events.push(event);
  }

  stepWeapon(state.player,{
    dt,
    guideAuthority:state.guideAuthority,
    walls:[]
  });

  const body=probeBodyContact(state);
  if(body){
    state.bodyContacts++;
    events.push(body);
  }

  const follow=probeFollowContact(state);
  if(follow){
    state.toolContactAction=follow.action;
    state.toolContacts++;
    events.push({
      ...follow,
      contactAt:state.time+dt,
      sinceCommitEnd:state.commitEndedAt===null
        ? null
        : state.time+dt-state.commitEndedAt
    });
  }

  state.time+=dt;
  state.events.push(...events);
  return events;
}

export function r2Snapshot(state){
  return {
    time:state.time,
    history:state.history,
    side:state.side,
    bodyContacts:state.bodyContacts,
    toolContacts:state.toolContacts,
    commitEndedAt:state.commitEndedAt,
    turnaroundAt:state.turnaroundAt,
    player:{
      x:state.player.body.x,
      y:state.player.body.y,
      readiness:snapshotReadiness(state.player)
    },
    rusher:{
      x:state.rusher.x,
      y:state.rusher.y,
      vx:state.rusher.vx,
      vy:state.rusher.vy,
      mode:state.rusher.mode,
      turnaroundObserved:state.rusher.turnaroundObserved
    }
  };
}
