import { normalize } from "./math.js";

export const DRIVE_SPEC=Object.freeze({
  prepare:0.12,
  commit:0.20,
  recover:0.34,
  reach:34,
  halfWidth:10,
  carryImpulse:1650,
  contactImpulse:5200,
  maxDeltaSpeed:105
});

export function canStartDrive(actor){
  return actor.action.mode==="idle";
}

export function startDrive(actor){
  if(!canStartDrive(actor)) return false;
  actor.action.mode="prepare";
  actor.action.time=DRIVE_SPEC.prepare;
  actor.action.contactResolved=false;
  actor.action.serial++;
  return true;
}

export function stepDriveAction(actor,dt,{
  homing=false,
  aimX,
  aimY,
  carryScale=1
}={}){
  const action=actor.action;

  if(action.mode==="idle") return null;

  if(action.mode==="prepare"){
    action.time-=dt;
    if(action.time<=0){
      const facing=homing&&Number.isFinite(aimX)&&Number.isFinite(aimY)
        ? Math.atan2(aimY-actor.y,aimX-actor.x)
        : actor.facing;
      action.commitX=Math.cos(facing);
      action.commitY=Math.sin(facing);
      action.mode="commit";
      action.time=DRIVE_SPEC.commit;
      action.contactResolved=false;

      const mass=Math.max(1,actor.spec.mass);
      const delta=DRIVE_SPEC.carryImpulse*Math.max(0,carryScale)/mass;
      actor.vx+=action.commitX*delta;
      actor.vy+=action.commitY*delta;

      return {type:"drive-commit",actor:actor.id};
    }
  }else if(action.mode==="commit"){
    if(homing&&Number.isFinite(aimX)&&Number.isFinite(aimY)){
      const d=normalize(aimX-actor.x,aimY-actor.y,action.commitX,action.commitY);
      action.commitX=d.x;
      action.commitY=d.y;
    }
    action.time-=dt;
    if(action.time<=0){
      action.mode="recover";
      action.time=DRIVE_SPEC.recover;
      return {type:"drive-recover",actor:actor.id};
    }
  }else if(action.mode==="recover"){
    action.time-=dt;
    if(action.time<=0){
      action.mode="idle";
      action.time=0;
      return {type:"drive-ready",actor:actor.id};
    }
  }

  return null;
}

export function probeDriveContact(attacker,target){
  const action=attacker.action;
  if(action.mode!=="commit"||action.contactResolved) return null;

  const dx=target.x-attacker.x;
  const dy=target.y-attacker.y;
  const along=dx*action.commitX+dy*action.commitY;
  const side=Math.abs(dx*(-action.commitY)+dy*action.commitX);
  const minAlong=attacker.spec.radius-target.spec.radius*0.35;
  const maxAlong=attacker.spec.radius+DRIVE_SPEC.reach+target.spec.radius;

  if(along<minAlong||along>maxAlong) return null;
  if(side>target.spec.radius+DRIVE_SPEC.halfWidth) return null;

  return {
    type:"drive-contact-candidate",
    attacker:attacker.id,
    target:target.id,
    nx:action.commitX,
    ny:action.commitY,
    along,
    side
  };
}

export function applyDriveContact(attacker,target,candidate,{
  displacementScale=1
}={}){
  if(!candidate) return null;
  attacker.action.contactResolved=true;

  const scale=Math.max(0,displacementScale);
  const invA=1/Math.max(1,attacker.spec.mass);
  const invB=1/Math.max(1,target.spec.mass);
  const total=invA+invB;
  const impulse=DRIVE_SPEC.contactImpulse*scale;

  const targetDelta=Math.min(
    DRIVE_SPEC.maxDeltaSpeed,
    impulse*invB
  );
  const attackerDelta=Math.min(
    DRIVE_SPEC.maxDeltaSpeed*0.45,
    impulse*invA*0.35
  );

  target.vx+=candidate.nx*targetDelta;
  target.vy+=candidate.ny*targetDelta;
  attacker.vx-=candidate.nx*attackerDelta;
  attacker.vy-=candidate.ny*attackerDelta;

  return {
    type:"drive-contact",
    attacker:attacker.id,
    target:target.id,
    nx:candidate.nx,
    ny:candidate.ny,
    targetDelta,
    attackerDelta
  };
}
