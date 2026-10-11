// P9 is a geometric CAUSAL CONTROL, not a new motor or crowd gameplay claim.
// The P8 candidate steers laterally under contact, but a real rigid guard may
// occupy the entire local throat. Separate available geometric side space
// from the ability to physically DISPLACE an independently dynamic guard.
// True world transforms and Rapier colliders are the only geometry authority.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {makeTactileYard} from "./p8-tactile.js";
import {V} from "./p0-world.js";
const round=x=>Math.round(x*1e5)/1e5;
const configurations={
  narrow:{base:2.85,edit:"none"},
  intermediate:{base:3.45,edit:"none"},
  widenedLower:{base:2.85,edit:"lower130"},
  widenedSymmetric:{base:2.85,edit:"both65"},
  wide:{base:4.65,edit:"none"}
};
function initialBodies(w){
 return w.entities.map(e=>({id:e.id,kind:e.kind,
  pos:{...e.body.translation()},vel:{...e.body.linvel()},
  yaw:e.body.rotation(),omega:e.body.angvel(),
  mass:e.body.mass(),fixed:e.body.isFixed()}));
}
function setActualGeometry(w,conf){
 if(conf.edit==="lower130"){
  if(!w.openPassage())throw Error("P9 lower real wall refused to move");
 }else if(conf.edit==="both65"){
  const lo=w.gap.lowWall,hi=w.gap.highWall;
  const l=lo.body.translation(),h=hi.body.translation();
  if(!w.moveEntity(lo,V(l.x,l.y-.65))||
     !w.moveEntity(hi,V(h.x,h.y+.65)))
    throw Error("P9 symmetric true collider edits refused");
 }
}
function clearance(w){
 const measured=w.opening(),g=w.guard.body.translation();
 const guardRadius=w.guard.shapes[0].shape.r;
 const pusherRadius=w.pushers[0].shapes[0].shape.r;
 // Gap between stationary guard's *surface* and each fixed wall lip,
 // not the entire width. One pusher needs its FULL diameter to pass
 // beside that cross-section without displacing the guard.
 const below=g.y-guardRadius-measured.low;
 const above=measured.high-g.y-guardRadius;
 const need=2*pusherRadius;
 return {actualWidth:round(measured.width),low:round(measured.low),
  high:round(measured.high),guardY:round(g.y),
  guardRadius,pusherRadius,pusherDiameter:need,
  lowerSideFree:round(below),upperSideFree:round(above),
  lowerBypassFits:below>=need-1e-5,upperBypassFits:above>=need-1e-5,
  atLeastOneLocalSide:Math.max(below,above)>=need-1e-5,
  caveat:"LOCAL fixed-cross-section eligibility only. Does not prove traversal; endpoints of wall segments admit other global routes."};
}
export function p9Case({geometry="narrow",guardMode="fixed",
 tactile="drive",formation="center",ticks=460}={}){
 const conf=configurations[geometry];
 if(!conf||!["fixed","dynamic"].includes(guardMode)||
  !["drive","slip"].includes(tactile)||
  !["center","flank"].includes(formation))throw Error("P9 control options");
 const w=makeTactileYard({width:conf.base,formation,
  guardPolicy:"brace",tactile,support:"finite",density:6,
  guardKind:"bulky",guardMass:90});
 try{
  setActualGeometry(w,conf);
  if(guardMode==="fixed"){
   // EXPLICIT physically anchored RIGID block as a null control, not
   // a claim that the regular 90kg guardian cannot move or is biological.
   w.guard.body.setBodyType(RAPIER.RigidBodyType.Fixed,true);
  }
  w.world.propagateModifiedBodyPositionsToColliders();
  const before=initialBodies(w),shape=clearance(w);
  const expectedWidth=conf.base+(conf.edit==="none"?0:1.3);
  if(Math.abs(shape.actualWidth-expectedWidth)>.0001)
   throw Error("P9 labelled gap differs from ACTUAL collider geometry");
  const initialGuard={...w.guard.body.translation()};
  const ever=new Set(),previous=new Set();
  let returns=0,maxAtMouth=0,totalMouthTicks=0,firstCross=null;
  for(let i=0;i<ticks;i++){
   w.step();
   const current=new Set();
   const gap=w.opening();
   for(const a of w.pushers){
    const p=a.body.translation(),r=a.shapes[0].shape.r;
    if(p.x>w.gap.x+1.30&&p.y-r>gap.low-.06&&p.y+r<gap.high+.06){
     current.add(a.id);ever.add(a.id);
     totalMouthTicks++;
     if(firstCross===null)firstCross=w.ticks;
    }
   }
   for(const id of previous)if(!current.has(id))returns++;
   previous.clear();for(const id of current)previous.add(id);
   maxAtMouth=Math.max(maxAtMouth,current.size);
  }
  const guardFinal=w.guard.body.translation(),report=w.pressureTrace();
  if(guardMode==="fixed"&&(Math.hypot(guardFinal.x-initialGuard.x,
    guardFinal.y-initialGuard.y)>1e-5))
   throw Error("P9 fixed physical obstruction unexpectedly moved");
  if(!report.finite||report.actorCount!==7||report.loadCount!==2)
   throw Error("P9 source physical scene invalid");
  return {geometry,guardMode,tactile,formation,ticks,
   initial:before,clearance:shape,
   startGuard:initialGuard,endGuard:{...guardFinal},
   passedFinal:report.crossings.mouth,everPassed:ever.size,
   everIds:[...ever],totalMouthTicks,firstCross,
   maxAtMouth,returns,
   contactEvents:report.pressure.guardContacts,
   realContactImpulse:round(report.pressure.guardImpulse),
   rootEffort:round(report.events.rootEffort),
   sideActivations:report.p8.contactActivations,
   sideTicks:report.p8.slideTicks,
   finite:report.finite,
   source:"Actual Rapier solver dynamics; fixed-guard is an explicit artificial BLOCKER control. Local mouth metric never enters the controller."};
 }finally{w.dispose();}
}
export function p9Audit(){
 const cases=[];
 for(const geometry of Object.keys(configurations))
  for(const guardMode of ["fixed","dynamic"])
   for(const formation of ["center","flank"])
    for(const tactile of ["drive","slip"])
     cases.push(p9Case({geometry,guardMode,formation,tactile}));
 if(cases.length!==40)throw Error("P9 40 physical controls absent");
 for(let i=0;i<cases.length;i+=2){
  const drive=cases[i],slip=cases[i+1];
  if(drive.tactile!=="drive"||slip.tactile!=="slip"||
   drive.geometry!==slip.geometry||drive.guardMode!==slip.guardMode||
   drive.formation!==slip.formation||
   JSON.stringify(drive.initial)!==JSON.stringify(slip.initial))
   throw Error("P9 A/B changed physical prestate or mispaired policy");
  if(drive.clearance.actualWidth!==slip.clearance.actualWidth)
   throw Error("P9 actual aperture differed between motor policies");
 }
 for(const x of cases){
  if(!x.finite||x.passedFinal>x.everPassed||
   x.sideActivations>0&&x.tactile!=="slip")
   throw Error("P9 source result not supported by actual solver");
  // This is a local cross-section geometric statement, not a guarantee
  // of whole-world unreachability or that an autonomous actor finds a lane.
  if(["narrow","intermediate"].includes(x.geometry)&&
      x.clearance.atLeastOneLocalSide)
   throw Error("P9 assumed impossible local sidestep but geometry allows one");
  if(["widenedLower","widenedSymmetric","wide"].includes(x.geometry)&&
      !x.clearance.atLeastOneLocalSide)
   throw Error("P9 authored opening did not actually create local side clearance");
 }
 return {worlds:cases.length,cases,
  summary:cases.map(x=>({geometry:x.geometry,
   actualWidth:x.clearance.actualWidth,guardMode:x.guardMode,
   formation:x.formation,policy:x.tactile,
   localSpace:x.clearance.atLeastOneLocalSide,
   sideBelow:x.clearance.lowerSideFree,sideAbove:x.clearance.upperSideFree,
   ever:x.everPassed,final:x.passedFinal,first:x.firstCross,
   blockerX:round(x.endGuard.x),contact:x.contactEvents,
   effort:x.rootEffort,side:x.sideActivations})),
  limitation:"A source-affordance falsifier, NOT a motor upgrade. Fixed guard is a nonliving stationary blocker. Rigid circles and finite external root traction; no feet, soft tissue, organism intelligence, FPS measurement or Owner experience."};
}