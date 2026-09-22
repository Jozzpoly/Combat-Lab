import { clamp, normalize, wrapAngle } from "./math.js";
import { createActor, driveActor, faceToward } from "./actors.js";
import { BROKEN_YARD, PLAYER_SPEC, PRESSURE_SPEC } from "./yard.js";

export const O2_PLAYER_SPEC = PLAYER_SPEC;

export const O2_PRESSURE_SPEC = Object.freeze({
  ...PRESSURE_SPEC,
  hp: 60
});

export const O2_SPEAR = Object.freeze({
  inner: 14,
  idleReach: 104,
  thrustExtension: 24,
  thickness: 4,
  damagingTipLength: 30,
  wallClearance: 3
});

export const O2_THRUST = Object.freeze({
  windup: 0.14,
  active: 0.12,
  recover: 0.22,
  damage: 64,
  maxTargetsPerAction: 1
});

export const O2_CLEARANCE = Object.freeze({
  windup: 0.10,
  active: 0.11,
  recover: 0.30,
  reach: 58,
  halfAngle: 1.10,
  pushSpeed: 118,
  maxTargetsPerAction: 3
});

function segmentRectFirstT(ax, ay, bx, by, rect) {
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;

  const clips = [
    [-dx, ax - rect.x],
    [ dx, rect.x + rect.w - ax],
    [-dy, ay - rect.y],
    [ dy, rect.y + rect.h - ay]
  ];

  for (const [p, q] of clips) {
    if (Math.abs(p) <= 1e-9) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }

  return t0 >= 0 && t0 <= 1 ? t0 : null;
}

function actionPhase(action, spec) {
  if (!action) return { phase:"idle", active:false, progress:0 };
  const elapsed = action.elapsed;
  if (elapsed < spec.windup) {
    return {
      phase:"windup",
      active:false,
      progress:spec.windup > 0 ? elapsed / spec.windup : 1
    };
  }
  if (elapsed < spec.windup + spec.active) {
    return {
      phase:"active",
      active:true,
      progress:spec.active > 0
        ? (elapsed - spec.windup) / spec.active
        : 1
    };
  }
  return {
    phase:"recover",
    active:false,
    progress:spec.recover > 0
      ? (elapsed - spec.windup - spec.active) / spec.recover
      : 1
  };
}

function actionSpec(action) {
  return action?.type === "clearance" ? O2_CLEARANCE : O2_THRUST;
}

export function createO2Player({
  x=450,
  y=535,
  facing=-Math.PI/2
}={}) {
  const actor=createActor(O2_PLAYER_SPEC,{
    id:"player",
    kind:"player",
    x,
    y,
    facing
  });
  actor.hp=100;
  actor.maxHp=100;
  actor.o2Action=null;
  actor.o2Serial=0;
  return actor;
}

export function createO2Threat(id,{
  x,
  y,
  facing=Math.PI/2
}) {
  const actor=createActor(O2_PRESSURE_SPEC,{
    id,
    kind:"pressure",
    x,
    y,
    facing
  });
  actor.hp=O2_PRESSURE_SPEC.hp;
  actor.maxHp=O2_PRESSURE_SPEC.hp;
  actor.attackResolved=false;
  return actor;
}

export function faceO2Player(player,x,y,dt) {
  return faceToward(player,x,y,dt);
}

export function driveO2Player(player,x,y,dt) {
  return driveActor(player,x,y,dt);
}

export function requestO2Action(player,type) {
  if (player.o2Action) return false;
  if (type !== "thrust" && type !== "clearance") return false;

  player.o2Serial++;
  player.o2Action={
    type,
    elapsed:0,
    serial:player.o2Serial,
    hitIds:new Set()
  };
  return true;
}

export function stepO2Action(player,dt) {
  const action=player.o2Action;
  if (!action) return null;

  action.elapsed+=dt;
  const spec=actionSpec(action);
  const total=spec.windup+spec.active+spec.recover;
  const state=actionPhase(action,spec);

  if (action.elapsed >= total) {
    player.o2Action=null;
    return { phase:"idle", active:false, done:true };
  }
  return { ...state, done:false };
}

export function o2ActionState(player) {
  const action=player.o2Action;
  if (!action) return { type:null, phase:"idle", active:false, progress:0 };
  return {
    type:action.type,
    ...actionPhase(action,actionSpec(action))
  };
}

export function spearDesiredReach(player) {
  const state=o2ActionState(player);
  if (state.type !== "thrust") return O2_SPEAR.idleReach;

  if (state.phase === "windup") {
    return O2_SPEAR.idleReach - 12 * state.progress;
  }
  if (state.phase === "active") {
    return (
      O2_SPEAR.idleReach - 12 +
      (O2_SPEAR.thrustExtension + 12) * state.progress
    );
  }
  if (state.phase === "recover") {
    return (
      O2_SPEAR.idleReach + O2_SPEAR.thrustExtension * (1 - state.progress)
    );
  }
  return O2_SPEAR.idleReach;
}

export function spearSegment(player,{
  world=BROKEN_YARD,
  reach=spearDesiredReach(player)
}={}) {
  const fx=Math.cos(player.facing);
  const fy=Math.sin(player.facing);
  const pivotX=player.x+fx*6;
  const pivotY=player.y+fy*6;

  const desiredTipX=pivotX+fx*reach;
  const desiredTipY=pivotY+fy*reach;

  let wallT=1;
  let wallId=null;
  for(const wall of world.walls || []){
    const t=segmentRectFirstT(
      pivotX,pivotY,
      desiredTipX,desiredTipY,
      wall
    );
    if(t!==null && t<wallT){
      wallT=t;
      wallId=wall.id ?? null;
    }
  }

  const desiredLength=reach;
  const clippedLength=Math.max(
    O2_SPEAR.inner,
    desiredLength*wallT-O2_SPEAR.wallClearance
  );
  const blocked=wallT<1 && clippedLength<desiredLength-0.5;

  return {
    pivotX,
    pivotY,
    ax:pivotX+fx*O2_SPEAR.inner,
    ay:pivotY+fy*O2_SPEAR.inner,
    bx:pivotX+fx*clippedLength,
    by:pivotY+fy*clippedLength,
    fx,
    fy,
    desiredLength,
    actualLength:clippedLength,
    blocked,
    wallId
  };
}

export function spearDamagingTip(segment) {
  const length=Math.hypot(segment.bx-segment.ax,segment.by-segment.ay);
  const tipLength=Math.min(O2_SPEAR.damagingTipLength,length);
  return {
    ax:segment.bx-segment.fx*tipLength,
    ay:segment.by-segment.fy*tipLength,
    bx:segment.bx,
    by:segment.by
  };
}

function pointSegmentDistance(px,py,seg) {
  const dx=seg.bx-seg.ax;
  const dy=seg.by-seg.ay;
  const denom=dx*dx+dy*dy;
  const t=denom>1e-9
    ? clamp(((px-seg.ax)*dx+(py-seg.ay)*dy)/denom,0,1)
    : 0;
  const x=seg.ax+dx*t;
  const y=seg.ay+dy*t;
  return {
    x,
    y,
    t,
    distance:Math.hypot(px-x,py-y)
  };
}

export function probeO2Thrust(player,threat,{world=BROKEN_YARD}={}) {
  const action=player.o2Action;
  const state=o2ActionState(player);
  if(!action || state.type!=="thrust" || !state.active) return null;
  if(threat.hp<=0 || action.hitIds.has(threat.id)) return null;
  if(action.hitIds.size >= O2_THRUST.maxTargetsPerAction) return null;

  const full=spearSegment(player,{world});
  const tip=spearDamagingTip(full);
  const contact=pointSegmentDistance(threat.x,threat.y,tip);
  if(contact.distance > threat.spec.radius+O2_SPEAR.thickness) return null;

  return {
    type:"o2-thrust-candidate",
    target:threat.id,
    x:contact.x,
    y:contact.y,
    blocked:full.blocked,
    wallId:full.wallId,
    actualReach:full.actualLength,
    distance:Math.hypot(threat.x-player.x,threat.y-player.y)
  };
}

export function applyO2Thrust(player,threat,candidate) {
  if(!candidate || candidate.type!=="o2-thrust-candidate") return null;
  player.o2Action.hitIds.add(threat.id);
  threat.hp=Math.max(0,threat.hp-O2_THRUST.damage);
  if(threat.hp<=0){
    threat.vx=0;
    threat.vy=0;
    threat.state="down";
  }
  return {
    ...candidate,
    type:"o2-thrust-hit",
    damage:O2_THRUST.damage,
    hp:threat.hp,
    killed:threat.hp<=0
  };
}

export function resolveO2Thrust(player,threat,options) {
  return applyO2Thrust(player,threat,probeO2Thrust(player,threat,options));
}

export function probeO2Clearance(player,threat) {
  const action=player.o2Action;
  const state=o2ActionState(player);
  if(!action || state.type!=="clearance" || !state.active) return null;
  if(threat.hp<=0 || action.hitIds.has(threat.id)) return null;
  if(action.hitIds.size >= O2_CLEARANCE.maxTargetsPerAction) return null;

  const dx=threat.x-player.x;
  const dy=threat.y-player.y;
  const distance=Math.hypot(dx,dy);
  const maxDistance=player.spec.radius+O2_CLEARANCE.reach+threat.spec.radius;
  if(distance>maxDistance) return null;

  const angle=Math.atan2(dy,dx);
  const diff=Math.abs(wrapAngle(angle-player.facing));
  if(diff>O2_CLEARANCE.halfAngle) return null;

  const n=normalize(dx,dy,Math.cos(player.facing),Math.sin(player.facing));
  return {
    type:"o2-clearance-candidate",
    target:threat.id,
    x:threat.x-n.x*threat.spec.radius,
    y:threat.y-n.y*threat.spec.radius,
    nx:n.x,
    ny:n.y,
    distance
  };
}

export function applyO2Clearance(player,threat,candidate) {
  if(!candidate || candidate.type!=="o2-clearance-candidate") return null;
  player.o2Action.hitIds.add(threat.id);

  // Space recovery, not damage.
  threat.vx+=candidate.nx*O2_CLEARANCE.pushSpeed;
  threat.vy+=candidate.ny*O2_CLEARANCE.pushSpeed;

  return {
    ...candidate,
    type:"o2-clearance-contact",
    damage:0,
    hp:threat.hp
  };
}

export function resolveO2Clearance(player,threat) {
  return applyO2Clearance(player,threat,probeO2Clearance(player,threat));
}
