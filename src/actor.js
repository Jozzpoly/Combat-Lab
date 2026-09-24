import { normalize, wrapAngle } from "./math.js";

export const BODY_SPEC=Object.freeze({
  radius:18,
  mass:72,
  maxSpeed:225,
  acceleration:2450,
  braking:2850,
  turnRate:15
});

export const SET_SPEC=Object.freeze({
  moveAuthority:0.62,
  turnAuthority:0.62,
  directionalSupport:0.78,
  alignmentExponent:2
});

export function createActor({
  id,
  x,
  y,
  facing=-Math.PI/2,
  spec=BODY_SPEC
}={}){
  return {
    id,
    x,y,
    vx:0,
    vy:0,
    facing,
    spec,
    setHeld:false,
    action:{
      mode:"idle",
      time:0,
      commitX:0,
      commitY:0,
      contactResolved:false,
      serial:0
    }
  };
}

export function supportIsActive(actor,{driveKeepsSupport=false}={}){
  if(!actor.setHeld) return false;
  if(actor.action.mode==="idle") return true;
  return !!driveKeepsSupport;
}

export function supportAlignment(actor,dirX,dirY,{
  omnidirectional=false,
  driveKeepsSupport=false
}={}){
  if(!supportIsActive(actor,{driveKeepsSupport})) return 0;
  if(omnidirectional) return 1;

  const facingX=Math.cos(actor.facing);
  const facingY=Math.sin(actor.facing);
  const alignment=Math.max(0,facingX*dirX+facingY*dirY);
  return alignment**SET_SPEC.alignmentExponent;
}

export function directionalInvMass(actor,dirX,dirY,{
  supportScale=1,
  omnidirectional=false,
  driveKeepsSupport=false
}={}){
  const base=1/Math.max(1,actor.spec.mass);
  const alignment=supportAlignment(actor,dirX,dirY,{
    omnidirectional,
    driveKeepsSupport
  });
  const support=Math.max(0,Math.min(
    0.92,
    SET_SPEC.directionalSupport*Math.max(0,supportScale)*alignment
  ));
  return base*(1-support);
}

export function faceToward(actor,x,y,dt,{
  setTurnScale=SET_SPEC.turnAuthority,
  driveKeepsSupport=false
}={}){
  const desired=Math.atan2(y-actor.y,x-actor.x);
  const delta=wrapAngle(desired-actor.facing);
  const setScale=supportIsActive(actor,{driveKeepsSupport})
    ? setTurnScale
    : 1;
  const step=actor.spec.turnRate*setScale*dt;
  actor.facing+=Math.max(-step,Math.min(step,delta));
}

export function driveMove(actor,x,y,dt,{
  setMoveScale=SET_SPEC.moveAuthority,
  driveKeepsSupport=false
}={}){
  const d=normalize(x,y,0,0);
  const speed=Math.hypot(actor.vx,actor.vy);
  const setScale=supportIsActive(actor,{driveKeepsSupport})
    ? setMoveScale
    : 1;

  if(d.length>0){
    actor.vx+=d.x*actor.spec.acceleration*setScale*dt;
    actor.vy+=d.y*actor.spec.acceleration*setScale*dt;
  }else if(speed>0){
    const drop=Math.min(speed,actor.spec.braking*dt);
    actor.vx-=actor.vx/speed*drop;
    actor.vy-=actor.vy/speed*drop;
  }

  const next=Math.hypot(actor.vx,actor.vy);
  if(next>actor.spec.maxSpeed){
    const s=actor.spec.maxSpeed/next;
    actor.vx*=s;
    actor.vy*=s;
  }
}

export function integrateActor(actor,dt){
  actor.x+=actor.vx*dt;
  actor.y+=actor.vy*dt;
}
