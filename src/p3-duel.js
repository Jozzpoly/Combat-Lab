// P3: independent actors contest the SAME physics load, real manifold touch to link.
// Root commands remain explicit operator proxies, not NPC cognition.
// The no-link, zero-link and one-link controls preserve the same world and inputs.
import {TransportYard} from "./p2-world.js";
import {V} from "./p0-world.js";
const rnd=x=>Math.round(x*10000)/10000;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function snap(w,A,B,C,stage){
 const t=w.gripTrace(),a=A.body.translation(),b=B.body.translation(),c=C.body.translation();
 return {stage,tick:t.tick,left:{x:rnd(a.x),y:rnd(a.y)},right:{x:rnd(b.x),y:rnd(b.y)},
  load:{x:rnd(c.x),y:rnd(c.y)},activeLinks:t.grips.map(g=>g.actor),
  stretches:t.grips.map(g=>g.stretch),totalGripImpulse:t.gripEvidence.pairedImpulseSum,
  breaks:t.gripEvidence.breaks,finite:t.finite};
}
export function p3Contest({support="finite",leftKind="small",rightKind="small",
 loadMass=45,mode="dual",cap=6,driveSpeed=.85,
 contestTicks=45,afterTicks=75,captureWorld=null}={}){
 const w=new TransportYard({populated:false,support});
 try{
  const A=w.spawn(leftKind,V(leftKind==="bulky"?7.3:8,12));
  const B=w.spawn(rightKind,V(rightKind==="bulky"?13.5:12.8,12));
  const C=w.load(10.4,12,.48,.42,loadMass);
  A.maxSpeedOverride=driveSpeed;B.maxSpeedOverride=driveSpeed;
  w.selected=null; // Two real independent finite operator force channels.
  const start=snap(w,A,B,C,"start");
  let approached=-1;
  for(let i=0;i<280;i++){
   w.command(A,V(1,0));w.command(B,V(-1,0));w.step();
   if(w.actualContact(A,C)&&w.actualContact(B,C)){approached=i+1;break;}
  }
  if(approached<0)throw Error("P3 source lacks simultaneous bilateral contact "+[support,leftKind,rightKind,loadMass].join("/"));
  const touched=snap(w,A,B,C,"touch");
  const attempt=[];
  const selection=mode==="off"?[]:mode==="left"?[A]:
    mode==="right"?[B]:[A,B];
  for(const actor of selection){
   const pos={...C.body.translation()};
   const out=w.grip(actor.id,C.id,{maxImpulse:mode==="zero"?0:cap});
   if(!out.ok)throw Error("P3 refused real contact "+out.reason);
   if(distance(C.body.translation(),pos)>1e-8)
    throw Error("P3 link acquisition teleported independent cargo");
   attempt.push({id:actor.id,kind:actor.kind,sourceContacts:out.contact});
  }
  const frames=[start,touched],firstGripCount=w.grips.length;
  for(let i=0;i<contestTicks;i++){
   w.command(A,V(-1,0));w.command(B,V(1,0));w.step();
   if([0,14,29,contestTicks-1].includes(i))
    frames.push(snap(w,A,B,C,"contest-"+(i+1)));
  }
  const afterContest=snap(w,A,B,C,"contest-end");
  // Controlled A/B intervention: release only B's link. Both physical bodies
  // retain IDENTICAL intended movement commands in all variants.
  const didRelease=mode==="release"?w.release(B.id):false;
  for(let i=0;i<afterTicks;i++){
   // Release-vs-dual: EXACT SAME operator input on both bodies.
   // Only the second body's physical grip link is removed.
   w.command(A,V(-1,0));w.command(B,V(1,0));
   w.step();
   if([0,24,49,afterTicks-1].includes(i))
    frames.push(snap(w,A,B,C,"after-"+(i+1)));
  }
  const end=snap(w,A,B,C,"end"),e=w.gripEvidence;
  const out={support,leftKind,rightKind,loadMass,mode,cap,driveSpeed,
   approached,initialCargoX:touched.load.x,
   cargoAtContest:afterContest.load.x,cargoAfter:end.load.x,
   shiftedDuring:rnd(afterContest.load.x-touched.load.x),
   shiftedLater:rnd(end.load.x-afterContest.load.x),
   firstGripCount,activeAfterContest:afterContest.activeLinks.length,
   activeEnd:end.activeLinks.length,gripPairs:e.appliedPairs,
   gripImpulse:rnd(e.pairedImpulseSum),breaks:e.breaks,didRelease,
   momentumResidual:rnd(Math.hypot(e.holderImpulseX+e.loadImpulseX,
    e.holderImpulseY+e.loadImpulseY)),finite:end.finite,frames,attempt};
  if(captureWorld)captureWorld(w,{A,B,C,trace:out});
  return out;
 }finally{if(!captureWorld)w.dispose();}
}
export function p3Probe(){
 const results=[];
 for(const support of ["finite","none"])
  for(const leftKind of ["small","bulky"])
   for(const mode of ["off","left","right","dual","zero","release"])
    results.push(p3Contest({support,leftKind,mode}));
 if(results.length!==24||results.some(x=>!x.finite||x.approached<0||x.momentumResidual>1e-5))
  throw Error("P3 physical two-body worlds invalid");
 for(const x of results){
  if(["off","zero"].includes(x.mode)&&x.gripPairs!==0)
   throw Error("P3 passive/zero link exerted force");
 }
 return {cases:results.length,results,
  source:"real Rapier2D WASM solver, two independent bodies one cargo",
  limit:"Authored finite input scripts; 45kg shared mass, not gameplay, no anatomy exclusivity"};
}
