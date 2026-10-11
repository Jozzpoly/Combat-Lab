// K2: bounded action-dependent interception under a SECOND independent material
// constraint. This is a falsifier, not a demonstration of joint superiority.
// K1 passive control already showed rigid = hinged on a simple offset shot.
// Question: can relative panel action change what the body does at a fixed
// root pose while keeping a separate rear contact, vs rotating the entire
// same-mass rigid profile with the same bounded angular impulse budget?
import {KineticField} from "./k1-world.js";
const V=(x,y)=>({x,y});
const round=x=>Math.round(x*10000)/10000;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function point(b){return b.translation();}
function controlRigid(field,target,limit=.28){
  const b=field.guard.body;
  const error=wrap(target-b.rotation()),ang=b.angvel();
  const t=clamp(error*.42-ang*.13,-limit,limit);
  b.applyTorqueImpulse(t,true);
  return Math.abs(t);
}
function single(kind,policy,angle,lineY,secondary){
  const f=new KineticField({kind,preset:"probe"});
  let torque=0;const frames=[];
  try {
    const rear=f.load(16.70,10.70,.26,.28,56);
    const rearStart={...point(rear.body)};
    const guardStart={...point(f.guard.body)};
    // Secondary 56kg matter is FULLY dynamic, not pinned or given a hidden flag.
    // A different body+rotation scheme can disturb it at its real contact.
    f.world.propagateModifiedBodyPositionsToColliders();
    if(kind==="hinged"&&policy==="active")f.aimPanel(angle);
    for(let i=0;i<95;i++){
      if(kind==="rigid"&&policy==="active")torque+=controlRigid(f,angle);
      f.step();
      if([1,20,45,95].includes(i+1)){
        const r=f.guard.body.translation(),q=rear.body.translation();
        frames.push({tick:i+1,root:{...r},rootRotation:round(f.guard.body.rotation()),
          panelAngle:f.guard.panel?round(wrap(f.guard.panel.body.rotation()-f.guard.body.rotation())):null,
          rearTravel:round(dist(rearStart,q)),rootTravel:round(dist(guardStart,r))});
      }
    }
    const beforeShot=f.trace();
    const beforeRear={...point(rear.body)},beforeWitness={...point(f.witness.body)};
    // The specimen receives the same NEW operator shot after panel/root action.
    f.reposition(f.witness,V(24.4,lineY));
    const witnessShotStart={...point(f.witness.body)};
    const projectile=f.shoot(V(3,lineY),V(28,lineY),20);
    if(!projectile)throw Error("Shot rejected");
    for(let i=0;i<55;i++){
      if(kind==="rigid"&&policy==="active")torque+=controlRigid(f,angle);
      f.step();
    }
    const after=f.trace(),endRear=point(rear.body),endWitness=point(f.witness.body);
    const panel=f.guard.panel?f.guard.panel.body.translation():null;
    return {kind,policy,angle,lineY,secondary,rootAtShot:beforeShot.guardPosition,
      rootAngleAtShot:beforeShot.guardAngle,panelAngleAtShot:beforeShot.panelAngle,
      rootAfter:after.guardPosition,rootAngleAfter:after.guardAngle,
      panelAngleAfter:after.panelAngle,
      rearMatterTravelTotal:round(dist(rearStart,endRear)),
      rearMatterAfterShot:round(dist(beforeRear,endRear)),
      witnessBeforeShotAuthoredReset:round(dist(witnessShotStart,point(f.witness.body))), 
      witnessTravelFromShot:round(dist(witnessShotStart,endWitness)),
      projectileAfter:after.shotStates[0],
      rootMovementPriorShot:round(dist(guardStart,point(f.guard.body))),
      rigidTorqueTotal:round(torque),hingeTorqueTotal:after.boundedPanelImpulse,
      shootSource:after.externalShots,rootDrive:after.driveImpulse,
      frames,finite:after.finite};
  }finally{f.dispose();}
}
export function runK2Probe(){
  const cases=[];
  for(const angle of [-1.1,1.1]){
    for(const lineY of [10.85,11.2,11.55]){
      for(const [kind,policy] of [
        ["bare","passive"],["rigid","passive"],["rigid","active"],
        ["hinged","passive"],["hinged","active"]
      ])cases.push(single(kind,policy,angle,lineY,true));
    }
  }
  if(cases.length!==30||cases.some(x=>!x.finite||x.shootSource!==1||x.rootDrive!==0))
    throw Error("K2 source/finite/drive null invalid");
  if(cases.some(x=>x.kind==="hinged"&&x.policy==="passive"&&x.hingeTorqueTotal!==0))
    throw Error("K2 claimed passive hinged actuator nonzero");
  if(cases.some(x=>x.kind==="rigid"&&x.policy==="passive"&&x.rigidTorqueTotal!==0))
    throw Error("K2 claimed passive rigid actuator nonzero");
  return {meta:{question:"Is independent panel rotation an action-level material affordance under rear load?",
     cases:cases.length,source:"actual matched Rapier2D deterministic solver",
     rootDrive:"zero",motor:"bounded paired angular impulses or bounded whole-body torque",
     policy:"operator prescribed; NOT AI",
     warning:"Check geometry/contact validity and stability; these outcomes are not Owner feel or proof of complex anatomy."},
    cases};
}
