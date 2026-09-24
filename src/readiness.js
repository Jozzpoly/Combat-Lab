import {
  angleDelta,
  clamp,
  normalize,
  segmentIntersectsRect,
  wrapAngle
} from "./math.js";

export const BODY_SPEC=Object.freeze({
  maxSpeed:235,
  acceleration:2600,
  braking:3100,
  turnRate:13.5
});

export const WEAPON_SPEC=Object.freeze({
  length:88,
  minReach:64,
  maxReach:96,
  idleReach:82,
  guideAngleK:68,
  guideAngleD:13,
  guideReachK:62,
  guideReachD:14,
  maxAngularAccel:68,
  maxRadialAccel:1250,
  commitAngleK:178,
  commitAngleD:10,
  commitReachK:115,
  commitReachD:10,
  commitDuration:0.22,
  commitExtension:10,
  wallBounce:0.26,
  wallRadialBounce:0.18,
  canonicalGuardOffset:0.34,
  neutralAngleK:150,
  neutralAngleD:18,
  neutralReachK:130,
  neutralReachD:18
});

export function createR0State({
  x=0,
  y=0,
  facing=0,
  weaponAngle=-0.86,
  weaponReach=82
}={}){
  return {
    body:{
      x,y,
      vx:0,vy:0,
      facing,
      desiredFacing:facing
    },
    weapon:{
      angle:weaponAngle,
      angularVelocity:0,
      reach:weaponReach,
      radialVelocity:0,
      guideAngle:weaponAngle,
      guideReach:weaponReach,
      action:null,
      wallEngaged:false,
      wallSeparatedFor:1,
      wallImpacts:0
    },
    time:0
  };
}

export function weaponSegment(state){
  const b=state.body;
  const w=state.weapon;
  const pivotX=b.x+Math.cos(b.facing)*7;
  const pivotY=b.y+Math.sin(b.facing)*7;
  return {
    ax:pivotX,
    ay:pivotY,
    bx:pivotX+Math.cos(w.angle)*w.reach,
    by:pivotY+Math.sin(w.angle)*w.reach
  };
}

export function setBodyFacingIntent(state,angle){
  state.body.desiredFacing=wrapAngle(angle);
}

export function driveBody(state,x,y,dt){
  const body=state.body;
  const input=normalize(x,y,0,0);
  const speed=Math.hypot(body.vx,body.vy);

  if(input.length>0){
    body.vx+=input.x*BODY_SPEC.acceleration*dt;
    body.vy+=input.y*BODY_SPEC.acceleration*dt;
  }else if(speed>0){
    const drop=Math.min(speed,BODY_SPEC.braking*dt);
    body.vx-=body.vx/speed*drop;
    body.vy-=body.vy/speed*drop;
  }

  const next=Math.hypot(body.vx,body.vy);
  if(next>BODY_SPEC.maxSpeed){
    const s=BODY_SPEC.maxSpeed/next;
    body.vx*=s;
    body.vy*=s;
  }

  const turn=clamp(
    angleDelta(body.facing,body.desiredFacing),
    -BODY_SPEC.turnRate*dt,
    BODY_SPEC.turnRate*dt
  );
  body.facing=wrapAngle(body.facing+turn);

  body.x+=body.vx*dt;
  body.y+=body.vy*dt;
}

export function setGuideIntent(state,angle,reach=WEAPON_SPEC.idleReach){
  state.weapon.guideAngle=wrapAngle(angle);
  state.weapon.guideReach=clamp(
    reach,
    WEAPON_SPEC.minReach,
    WEAPON_SPEC.maxReach
  );
}

export function requestCommit(state,intentAngle){
  const w=state.weapon;
  if(w.action) return false;
  w.action={
    capturedAngle:wrapAngle(intentAngle),
    elapsed:0
  };
  return true;
}

function integrateAxis(value,velocity,target,k,d,maxAccel,dt){
  const accel=clamp(
    (target-value)*k-velocity*d,
    -maxAccel,
    maxAccel
  );
  velocity+=accel*dt;
  value+=velocity*dt;
  return {value,velocity};
}

function integrateAngle(angle,velocity,target,k,d,maxAccel,dt){
  const error=angleDelta(angle,target);
  const accel=clamp(
    error*k-velocity*d,
    -maxAccel,
    maxAccel
  );
  velocity+=accel*dt;
  angle=wrapAngle(angle+velocity*dt);
  return {angle,velocity};
}

function desiredWeaponTargets(state,{
  guideAuthority=1,
  autoNeutral=false
}={}){
  const b=state.body;
  const w=state.weapon;
  const action=w.action;

  if(action){
    return {
      angle:action.capturedAngle,
      reach:clamp(
        w.guideReach+WEAPON_SPEC.commitExtension,
        WEAPON_SPEC.minReach,
        WEAPON_SPEC.maxReach
      ),
      angleK:WEAPON_SPEC.commitAngleK,
      angleD:WEAPON_SPEC.commitAngleD,
      reachK:WEAPON_SPEC.commitReachK,
      reachD:WEAPON_SPEC.commitReachD,
      authority:1
    };
  }

  if(autoNeutral){
    return {
      angle:wrapAngle(b.facing+WEAPON_SPEC.canonicalGuardOffset),
      reach:WEAPON_SPEC.idleReach,
      angleK:WEAPON_SPEC.neutralAngleK,
      angleD:WEAPON_SPEC.neutralAngleD,
      reachK:WEAPON_SPEC.neutralReachK,
      reachD:WEAPON_SPEC.neutralReachD,
      authority:1
    };
  }

  return {
    angle:w.guideAngle,
    reach:w.guideReach,
    angleK:WEAPON_SPEC.guideAngleK,
    angleD:WEAPON_SPEC.guideAngleD,
    reachK:WEAPON_SPEC.guideReachK,
    reachD:WEAPON_SPEC.guideReachD,
    authority:Math.max(0,guideAuthority)
  };
}

export function stepWeapon(state,{
  dt=1/120,
  guideAuthority=1,
  autoNeutral=false,
  walls=[]
}={}){
  const w=state.weapon;

  if(w.action){
    w.action.elapsed+=dt;
    if(w.action.elapsed>=WEAPON_SPEC.commitDuration){
      w.action=null;
    }
  }

  const target=desiredWeaponTargets(state,{
    guideAuthority,
    autoNeutral
  });

  const prev={
    angle:w.angle,
    angularVelocity:w.angularVelocity,
    reach:w.reach,
    radialVelocity:w.radialVelocity
  };

  const angleStep=integrateAngle(
    w.angle,
    w.angularVelocity,
    target.angle,
    target.angleK*target.authority,
    target.angleD*Math.max(0.35,target.authority),
    WEAPON_SPEC.maxAngularAccel*Math.max(0.15,target.authority),
    dt
  );
  w.angle=angleStep.angle;
  w.angularVelocity=angleStep.velocity;

  const reachStep=integrateAxis(
    w.reach,
    w.radialVelocity,
    target.reach,
    target.reachK*target.authority,
    target.reachD*Math.max(0.35,target.authority),
    WEAPON_SPEC.maxRadialAccel*Math.max(0.15,target.authority),
    dt
  );
  w.reach=clamp(
    reachStep.value,
    WEAPON_SPEC.minReach,
    WEAPON_SPEC.maxReach
  );
  w.radialVelocity=reachStep.velocity;

  let impact=null;
  const seg=weaponSegment(state);
  const wall=walls.find(rect=>segmentIntersectsRect(
    seg.ax,seg.ay,seg.bx,seg.by,rect
  ));

  if(wall){
    const fresh=!w.wallEngaged&&w.wallSeparatedFor>=0.055;

    w.angle=prev.angle;
    w.reach=prev.reach;

    if(fresh){
      w.angularVelocity=-prev.angularVelocity*WEAPON_SPEC.wallBounce;
      w.radialVelocity=-prev.radialVelocity*WEAPON_SPEC.wallRadialBounce;
      w.wallImpacts++;
      impact={
        type:"wall-impact",
        wall:wall.id??"wall",
        angle:w.angle,
        angularVelocity:w.angularVelocity,
        reach:w.reach,
        radialVelocity:w.radialVelocity
      };
    }else{
      w.angularVelocity=prev.angularVelocity*Math.pow(0.08,dt);
      w.radialVelocity=prev.radialVelocity*Math.pow(0.12,dt);
    }

    w.wallEngaged=true;
    w.wallSeparatedFor=0;
  }else{
    w.wallSeparatedFor+=dt;
    if(w.wallSeparatedFor>=0.055) w.wallEngaged=false;
  }

  state.time+=dt;
  return impact;
}

export function snapshotReadiness(state){
  return {
    angle:state.weapon.angle,
    angularVelocity:state.weapon.angularVelocity,
    reach:state.weapon.reach,
    radialVelocity:state.weapon.radialVelocity,
    bodyX:state.body.x,
    bodyY:state.body.y,
    bodyVx:state.body.vx,
    bodyVy:state.body.vy
  };
}

export function readinessDistance(a,b){
  const angle=Math.abs(angleDelta(a.angle,b.angle));
  const angularVelocity=Math.abs(
    a.angularVelocity-b.angularVelocity
  )/8;
  const reach=Math.abs(a.reach-b.reach)/30;
  const radialVelocity=Math.abs(
    a.radialVelocity-b.radialVelocity
  )/240;
  return angle+angularVelocity+reach+radialVelocity;
}
