// K2 forced-contact falsifier: an independently driven rear 56kg load reaches
// a 65+25kg guarded actor, then a second finite physical projectile arrives.
// Neither the body nor the load is pinned or given script immunity.
// A remote load-pulse controls for falsely calling free motion a "contact".
import RAPIER from "@dimforge/rapier2d-deterministic";
import {K2Field} from "./k2-probe.js";
const V=(x,y)=>({x,y});
const digits=x=>Math.round(x*1e4)/1e4;
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function rootCommand(field,target){
  const b=field.guard.body;
  const t=clamp(wrap(target-b.rotation())*.42-b.angvel()*.13,-.28,.28);
  b.applyTorqueImpulse(t,true);
  return Math.abs(t);
}
function shapeOf(p){
  return p.shape.r?new RAPIER.Ball(p.shape.r):
   new RAPIER.Cuboid(p.shape.hx,p.shape.hy);
}
function trueInitialIntersections(a,b){
  let collisions=0;
  for(const pa of a.parts)for(const pb of b.parts){
    const sa=shapeOf(pa),sb=shapeOf(pb);
    if(sa.intersectsShape(pa.collider.translation(),pa.collider.rotation(),
      sb,pb.collider.translation(),pb.collider.rotation()))collisions++;
  }
  return collisions;
}
// Sample REAL solver manifold impulse, not visual distance, cached broadphase
// initial query, or count of merely nearby pairs.
function impulseBetween(field,ea,eb){
  let force=0;
  for(const a of ea.parts)for(const b of eb.parts){
    field.world.contactPair(a.collider,b.collider,m=>{
      for(let k=0;k<m.numSolverContacts();k++)
        force+=Math.abs(m.contactImpulse(k)||0);
    });
  }
  return force;
}
function runOne(kind,policy,angle,lineY,pulse,loadY){
  const f=new K2Field({kind,preset:"probe"});
  try{
    const load=f.load(17,loadY,.34,.32,56);
    f.world.propagateModifiedBodyPositionsToColliders();
    const guardShapes=[f.guard,...(f.guard.panel?[f.guard.panel]:[])];
    const initialIntersections=guardShapes.reduce(
      (n,g)=>n+trueInitialIntersections(g,load),0);
    if(initialIntersections!==0)throw Error("False physical baseline overlap");
    let rootTorque=0,loadContactTicks=0,loadContactImpulse=0;
    let projectileGuardTicks=0,projectileWitnessTicks=0,projectileWitnessImpulse=0;
    const rootStart={...f.guard.body.translation()},loadStart={...load.body.translation()};
    const samples=[];
    if(kind==="hinged"&&policy==="active")f.aimPanel(angle);
    for(let i=0;i<95;i++){
      if(i===15&&pulse)load.body.applyImpulse(V(-pulse,0),true);
      if(kind==="rigid"&&policy==="active")rootTorque+=rootCommand(f,angle);
      f.step();
      const contact=guardShapes.reduce((sum,g)=>sum+impulseBetween(f,load,g),0);
      if(contact>0){loadContactTicks++;loadContactImpulse+=contact;}
      if([15,32,55,75,95].includes(i+1)){
        samples.push({t:i+1,
          root:{...f.guard.body.translation()},angle:digits(f.guard.body.rotation()),
          load:{...load.body.translation()},vx:digits(load.body.linvel().x),
          loadDistance:digits(dist(loadStart,load.body.translation())),
          panelAngle:f.guard.panel?digits(wrap(f.guard.panel.body.rotation()-f.guard.body.rotation())):null});
      }
    }
    const positionPreShot={...f.guard.body.translation()},
      loadPreShot={...load.body.translation()},
      rawPre=f.trace();
    f.reposition(f.witness,V(24.4,lineY));
    const targetStart={...f.witness.body.translation()};
    if(!f.shoot(V(3,lineY),V(28,lineY),20))throw Error("Missing shot");
    for(let i=0;i<55;i++){
      if(kind==="rigid"&&policy==="active")rootTorque+=rootCommand(f,angle);
      f.step();
      const shot=f.shots[0];
      const guardShot=guardShapes.reduce((sum,g)=>sum+impulseBetween(f,shot,g),0);
      if(guardShot>0)projectileGuardTicks++;
      const witnessShot=impulseBetween(f,shot,f.witness);
      if(witnessShot>0){projectileWitnessTicks++;projectileWitnessImpulse+=witnessShot;}
      const contact=guardShapes.reduce((sum,g)=>sum+impulseBetween(f,load,g),0);
      if(contact>0){loadContactTicks++;loadContactImpulse+=contact;}
    }
    const after=f.trace();
    return {kind,policy,angle,lineY,pulse,loadY,
      initialIntersections,guardTotalMass:digits(guardShapes.reduce(
       (n,g)=>n+g.body.mass(),0)),
      rootAtShot:rawPre.guardPosition,rootAngleAtShot:rawPre.guardAngle,
      hingeAtShot:rawPre.panelAngle,
      rootPost:after.guardPosition,rootAnglePost:after.guardAngle,
      hingePost:after.panelAngle,
      rootMovedBeforeShot:digits(dist(rootStart,positionPreShot)),
      loadMovedBeforeShot:digits(dist(loadStart,loadPreShot)),
      loadPostShift:digits(dist(loadPreShot,load.body.translation())),
      rearActualContactTicks:loadContactTicks,
      rearActualContactImpulse:digits(loadContactImpulse),
      projectileActualGuardTicks:projectileGuardTicks,
      projectileWitnessContactTicks:projectileWitnessTicks,
      projectileWitnessImpulse:digits(projectileWitnessImpulse),
      loadVelocityPost:digits(load.body.linvel().x),
      witnessMovedAfterShot:digits(dist(targetStart,f.witness.body.translation())),
      projectile:after.shotStates[0],
      rootDrive:after.driveImpulse,
      hingeDrive:after.boundedPanelImpulse,
      rigidRootTorque:digits(rootTorque),
      shots:after.externalShots,finite:after.finite,
      samples};
  } finally {f.dispose();}
}
export function runK2Concurrent(){
  const cases=[];
  for(const loadY of [10.2,13]){
    for(const pulse of [0,90]){
      for(const angle of [-1.1,1.1]){
        for(const lineY of [11.2,11.55]){
          for(const [kind,policy] of [
            ["rigid","passive"],["rigid","active"],
            ["hinged","passive"],["hinged","active"]
          ])cases.push(runOne(kind,policy,angle,lineY,pulse,loadY));
        }
      }
    }
  }
  if(cases.length!==64||cases.some(x=>!x.finite||x.initialIntersections||
    x.rootDrive!==0||x.shots!==1||
    x.policy==="passive"&&(x.hingeDrive!==0||x.rigidRootTorque!==0)))
      throw Error("K2 invalid source-matched physical forced-contact null");
  for(const a of cases){
    if(a.policy!=="passive")continue;
    const counterpart=cases.find(x=>x.kind===a.kind&&x.policy===a.policy&&
      x.lineY===a.lineY&&x.pulse===a.pulse&&x.loadY===a.loadY&&x.angle===-a.angle);
    if(!counterpart||counterpart.witnessMovedAfterShot!==a.witnessMovedAfterShot||
       counterpart.loadMovedBeforeShot!==a.loadMovedBeforeShot)
      throw Error("K2 pressure baseline depends on unused target angle");
  }
  return {source:"actual deterministic 2D WASM with equal-mass shell and panel",
    controls:"same 90 N.s rear load pulse, same 20 N.s shot, or zero-pulse control; zero root-drive; true passive hinges",
    verdict:"UNDETERMINED until qualitative + comparable source red-team",cases};
}
