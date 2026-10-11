// P1 bounded research: articulated reach while torso is physically confined.
// No hard pose locks, no canMove=false, no scripted payload response.
// Source donor is P0, which remains isolated/unapproved.
// The rigid 90kg actor carries the same initial 68+22kg physical profile.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {MaterialYard,V} from "./p0-world.js";
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const norm=v=>Math.hypot(v.x,v.y);
const dist=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
const round=x=>Math.round(x*1e4)/1e4;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function shape(s){return s.r?new RAPIER.Ball(s.r):new RAPIER.Cuboid(s.hx,s.hy);}
function intersectPair(a,b){
 let n=0;
 for(const p of a.shapes)for(const q of b.shapes){
  if(shape(p.shape).intersectsShape(p.collider.translation(),p.collider.rotation(),
      shape(q.shape),q.collider.translation(),q.collider.rotation()))n++;
 }
 return n;
}
function manifold(field,one,two){
 let impulse=0,touching=0;
 for(const p of one.shapes)for(const q of two.shapes){
  field.world.contactPair(p.collider,q.collider,m=>{
   for(let k=0;k<m.numSolverContacts();k++){
    const v=Math.abs(m.contactImpulse(k)||0);
    if(v>0){touching++;impulse+=v;}
   }
  });
 }
 return {impulse,touching};
}
function actualRootCommand(a,target,maxImpulse=1.6){
 const b=a.body,err=wrap(target-b.rotation()),omega=b.angvel();
 // Same per-tick 1.6 N·m·s peak as the independent limb controller,
 // NOT assumed equal net work, wheel/traction or achievable root pose.
 const j=clamp(err*.60-omega*.19,-maxImpulse,maxImpulse);
 b.applyTorqueImpulse(j,true);return Math.abs(j);
}
function build({kind="lever",support="finite",stance="brace",
 target=1.1,loadY=7.12,restricted=true,drive="actuate"}){
 const w=new MaterialYard({populated:false,support});
 const cage=[];
 if(restricted){
  // Gap width 1.28m vs torso 0.92m. This is a physical two-wall pocket;
  // allows ~18cm vertical clearance, not a kinematic pose lock.
  cage.push(w.wall(8,5.22,1.28,.14));
  cage.push(w.wall(8,6.78,1.28,.14));
 }
 const actor=w.spawn(kind,V(8,6));w.selected=actor.id;
 if(stance==="brace")w.setStance(actor.id,"brace");
 const payload=w.load(10.75,loadY,.40,.37,32);
 const all=[actor,...(actor.panel?[actor.panel]:[])];
 const pairs=[];
 for(const a of all)for(const b of [...cage,payload]){
  const count=intersectPair(a,b);
  if(count)pairs.push({a:a.kind,b:b.kind,n:count});
 }
 w.world.propagateModifiedBodyPositionsToColliders();
 return {w,actor,payload,cage,pairs};
}
export function p1Case(opts={}){
 const {kind="lever",support="finite",stance="brace",target=1.1,
   loadY=7.12,restricted=true,drive="actuate",ticks=160,captureWorld=null}=opts;
 const {w,actor,payload,cage,pairs}=build({kind,support,stance,target,loadY,restricted,drive});
 try{
  const rootStart={...actor.body.translation()},loadStart={...payload.body.translation()};
  const rootRotationStart=actor.body.rotation();
  const initial= w.traces();
  const cases=[];
  let actuatorTotal=0,objectImpulse=0,actorRootImpulse=0,
    payloadContactTicks=0,wallContactTicks=0,wallImpulse=0;
  // With drive='off' the mechanical joint is NEVER configured as a servo.
  if(drive==="actuate"&&kind==="lever")w.setPanelAngle(actor.id,target);
  for(let i=0;i<ticks;i++){
   if(drive==="actuate"&&kind==="rigid-lever")
    actuatorTotal+=actualRootCommand(actor,target);
   w.step();
   const whole=[actor,...(actor.panel?[actor.panel]:[])];
   let q=0;
   for(const a of whole)q+=manifold(w,a,payload).impulse;
   if(q>0){payloadContactTicks++;objectImpulse+=q;}
   let j=0;
   for(const part of whole)for(const wall of cage)j+=manifold(w,part,wall).impulse;
   if(j>0){wallContactTicks++;wallImpulse+=j;}
   if([0,9,29,59,99,159].includes(i)){
    cases.push({tick:i+1,root:{...actor.body.translation()},
      rootAngle:round(actor.body.rotation()),
      panelRelative:actor.panel?round(wrap(actor.panel.body.rotation()-actor.body.rotation())):null,
      load:{...payload.body.translation()},
      loadTravel:round(dist(loadStart,payload.body.translation()))});
   }
  }
  const tr=w.traces();
  if(typeof captureWorld==="function")captureWorld(w,actor,payload);
  const effectiveActuator=kind==="lever"?tr.events.panelTorque:actuatorTotal;
  return {kind,support,stance,target,loadY,restricted,drive,ticks,
   initialPairs:pairs,initialRoot:{...rootStart},rootAfter:{...actor.body.translation()},
   rootRotation:round(wrap(actor.body.rotation()-rootRotationStart)),
   rootTravel:round(dist(rootStart,actor.body.translation())),
   panelRelative:actor.panel?round(wrap(actor.panel.body.rotation()-actor.body.rotation())):null,
   payloadStart:loadStart,payloadAfter:{...payload.body.translation()},
   payloadTravel:round(dist(loadStart,payload.body.translation())),
   payloadDeltaY:round(payload.body.translation().y-loadStart.y),
   payloadContactImpulse:round(objectImpulse),payloadContactTicks,
   wallContactImpulse:round(wallImpulse),wallContactTicks,
   actuatorImpulse:round(effectiveActuator),
   terrainAngularImpulse:tr.events.terrainAngularImpulse,
   externalActorRootDrive:tr.events.rootEffort,
   finite:tr.finite,frames:cases,
   meta:"Rapier2D actual constraint/shape manifold; limit torque not matched total effort"};
 }finally{if(typeof captureWorld!=="function")w.dispose();}
}
export function p1Probe(){
 const cases=[];
 for(const restricted of [true,false])
  for(const support of ["finite","none"])
   for(const loadY of [6.9,7.12,7.35])
    for(const kind of ["lever","rigid-lever"]){
     cases.push(p1Case({kind,restricted,support,loadY,drive:"actuate"}));
    }
 for(const kind of ["lever","rigid-lever"])
  for(const support of ["finite","none"])
   cases.push(p1Case({kind,support,drive:"off",restricted:true,loadY:7.12}));
 if(cases.length!==28||cases.some(x=>!x.finite||x.initialPairs.length||
   x.externalActorRootDrive!==0))
  throw Error("P1 invalid source worlds / initial penetrations / scripted root drive");
 if(cases.some(x=>x.drive==="off"&&x.actuatorImpulse!==0))
  throw Error("P1 false passive actuator");
 const differences=[];
 for(const x of cases.filter(x=>x.drive==="actuate"&&x.kind==="lever")){
  const rival=cases.find(y=>y.kind==="rigid-lever"&&y.restricted===x.restricted&&
    y.support===x.support&&y.loadY===x.loadY&&y.drive===x.drive);
  if(!rival)throw Error("P1 missing mass-matched rigid competitor");
  differences.push({restricted:x.restricted,support:x.support,loadY:x.loadY,
    hingedPayload:x.payloadTravel,rigidPayload:rival.payloadTravel,
    hingedTouch:x.payloadContactImpulse,rigidTouch:rival.payloadContactImpulse,
    hingedYaw:x.rootRotation,rigidYaw:rival.rootRotation,
    hingedWall:x.wallContactImpulse,rigidWall:rival.wallContactImpulse});
 }
 return {description:"physical confinement vs no confinement; real arm vs same-mass rigid hull; loaded 32kg independent matter; motor OFF controls",
 source:"Actual deterministic 2D Rapier WASM, no actor root motor and no task state",
 caveat:"Competitor has matched start mass/profile and per-step torque cap, NOT equal mechanical work or optimal cheap surrogate.",
 cases:cases.length,results:cases,differences};
}
