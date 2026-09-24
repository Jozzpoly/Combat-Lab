import {
  createR0State,
  driveBody,
  requestCommit,
  setBodyFacingIntent,
  setGuideIntent,
  snapshotReadiness,
  stepWeapon,
  weaponSegment
} from "./readiness.js";
import { R0_WALL } from "./r0-rehearsal.js";
import { createRusher, stepRusher } from "./r1-pressure.js";
import { normalize } from "./math.js";

export const R1_TOOL=Object.freeze({
  impulse:5040,
  maxDeltaSpeed:105,
  weaponAngularBounce:0.22,
  weaponRadialBounce:0.18
});

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

function runR0Frames(state,frames,{
  guideAuthority=0.38,
  walls=[]
}={}){
  for(let i=0;i<frames;i++){
    driveBody(state,0,0,1/120);
    stepWeapon(state,{
      dt:1/120,
      guideAuthority,
      walls
    });
  }
}

export function createSeededPlayer({
  history="free",
  inheritanceMode="full",
  guideAuthority=0.38,
  interludeSeconds=0.24
}={}){
  const state=createR0State();
  setGuideIntent(state,0.92,82);
  requestCommit(state,0.92);

  let guard=0;
  while(state.weapon.action&&guard<240){
    runR0Frames(state,1,{
      guideAuthority,
      walls:history==="wall"?[R0_WALL]:[]
    });
    guard++;
  }

  if(inheritanceMode==="pose-only"){
    state.weapon.angularVelocity=0;
    state.weapon.radialVelocity=0;
  }else if(inheritanceMode==="velocity-only"){
    state.weapon.angle=0.34;
    state.weapon.reach=82;
  }else if(inheritanceMode==="none"){
    state.weapon.angle=0.34;
    state.weapon.reach=82;
    state.weapon.angularVelocity=0;
    state.weapon.radialVelocity=0;
  }else if(inheritanceMode!=="full"){
    throw new Error("unknown inheritance mode "+inheritanceMode);
  }

  runR0Frames(
    state,
    Math.round(interludeSeconds*120),
    {guideAuthority,walls:[]}
  );

  return state;
}

export function createR1State({
  history="free",
  side="east",
  inheritanceMode="full",
  guideAuthority=0.38,
  interludeSeconds=0.24,
  prepare
}={}){
  const player=createSeededPlayer({
    history,
    inheritanceMode,
    guideAuthority,
    interludeSeconds
  });

  return {
    history,
    side,
    guideAuthority,
    player,
    rusher:createRusher(side,{prepare}),
    toolContactAction:null,
    toolContacts:0,
    bodyContacts:0,
    events:[],
    time:0
  };
}

function probeToolContact(state){
  const action=state.player.weapon.action;
  if(!action) return null;
  if(state.toolContactAction===action) return null;

  const seg=weaponSegment(state.player);
  const r=state.rusher;
  const contact=pointSegmentDistance(r.x,r.y,seg);

  if(contact.distance>r.radius+4) return null;

  const axis=normalize(
    Math.cos(state.player.weapon.angle),
    Math.sin(state.player.weapon.angle),
    1,0
  );

  return {
    type:"tool-contact-candidate",
    action,
    x:contact.x,
    y:contact.y,
    nx:axis.x,
    ny:axis.y,
    rusherMode:r.mode
  };
}

function applyToolContact(state,candidate,{
  materialScale=1
}={}){
  if(!candidate) return null;

  state.toolContactAction=candidate.action;
  state.toolContacts++;

  const r=state.rusher;
  const scale=Math.max(0,materialScale);
  const delta=Math.min(
    R1_TOOL.maxDeltaSpeed,
    R1_TOOL.impulse/Math.max(1,r.mass)*scale
  );

  r.vx+=candidate.nx*delta;
  r.vy+=candidate.ny*delta;

  state.player.weapon.angularVelocity*=
    -R1_TOOL.weaponAngularBounce;
  state.player.weapon.radialVelocity*=
    -R1_TOOL.weaponRadialBounce;

  return {
    type:"tool-contact",
    x:candidate.x,
    y:candidate.y,
    nx:candidate.nx,
    ny:candidate.ny,
    deltaSpeed:delta,
    rusherMode:candidate.rusherMode
  };
}

function probeBodyContact(state){
  const r=state.rusher;
  if(r.mode!=="commit"||r.bodyContactResolved) return null;

  const p=state.player.body;
  const dx=r.x-p.x;
  const dy=r.y-p.y;
  const distance=Math.hypot(dx,dy);
  const required=r.radius+18;

  if(distance>required) return null;

  const d=normalize(dx,dy,1,0);
  return {
    type:"body-contact-candidate",
    nx:d.x,
    ny:d.y,
    depth:required-Math.max(distance,1e-9),
    x:(r.x+p.x)*0.5,
    y:(r.y+p.y)*0.5
  };
}

function applyBodyContact(state,candidate){
  if(!candidate) return null;

  const r=state.rusher;
  const p=state.player.body;
  r.bodyContactResolved=true;
  state.bodyContacts++;

  const half=candidate.depth*0.5;
  p.x-=candidate.nx*half;
  p.y-=candidate.ny*half;
  r.x+=candidate.nx*half;
  r.y+=candidate.ny*half;

  return {
    type:"body-contact",
    x:candidate.x,
    y:candidate.y,
    rusherMode:r.mode
  };
}

export function stepR1(state,input,dt=1/120,{
  materialScale=1
}={}){
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

  events.push(...stepRusher(
    state.rusher,
    state.player.body,
    dt
  ));

  const weaponImpact=stepWeapon(state.player,{
    dt,
    guideAuthority:state.guideAuthority,
    walls:[]
  });
  if(weaponImpact) events.push(weaponImpact);

  // Measure both possible contacts from the same post-integration,
  // pre-consequence state. Tool contact cannot retroactively erase a
  // body contact already present in the same simulation step.
  const toolCandidate=probeToolContact(state);
  const bodyCandidate=probeBodyContact(state);

  const toolEvent=applyToolContact(
    state,
    toolCandidate,
    {materialScale}
  );
  if(toolEvent) events.push(toolEvent);

  const bodyEvent=applyBodyContact(state,bodyCandidate);
  if(bodyEvent) events.push(bodyEvent);

  state.time+=dt;
  state.events.push(...events);
  return events;
}

export function rusherAngle(state){
  return Math.atan2(
    state.rusher.y-state.player.body.y,
    state.rusher.x-state.player.body.x
  );
}

export function r1Snapshot(state){
  return {
    time:state.time,
    history:state.history,
    side:state.side,
    toolContacts:state.toolContacts,
    bodyContacts:state.bodyContacts,
    playerReadiness:snapshotReadiness(state.player),
    player:{
      x:state.player.body.x,
      y:state.player.body.y
    },
    rusher:{
      x:state.rusher.x,
      y:state.rusher.y,
      vx:state.rusher.vx,
      vy:state.rusher.vy,
      mode:state.rusher.mode,
      commitX:state.rusher.commitX,
      commitY:state.rusher.commitY
    }
  };
}
