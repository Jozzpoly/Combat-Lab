// P11: Does real MATERIAL CONTACT backing change a hinged body's ability
// to do later material work? A failed result is acceptable. No NPC brain,
// magic brace flags, kinematic body lock or convergence-to-winning target.
// Fixed backing is explicitly anchored WORLD matter, not actual feet/support.
import {makeMaterialWorkshop} from "./p10-workshop.js";
import {V,DT} from "./p0-world.js";
const round=n=>Math.round(n*1e5)/1e5;
const p=e=>({x:round(e.body.translation().x),y:round(e.body.translation().y)});
const delta=(a,b)=>round(Math.hypot(a.x-b.x,a.y-b.y));
const finite=w=>w.entities.every(e=>{
 const b=e.body,at=b.translation(),v=b.linvel();
 return [at.x,at.y,v.x,v.y,b.rotation(),b.angvel()].every(Number.isFinite);
});
function contact(w,part,other){
 let ticks=0,j=0;
 for(const a of part.shapes)for(const b of other.shapes){
  w.world.contactPair(a.collider,b.collider,m=>{
   for(let k=0;k<m.numSolverContacts();k++){
    ticks++;j+=Math.abs(m.contactImpulse(k)||0);
   }
  });
 }
 return {points:ticks,impulse:j};
}
export function makeP11World({backing="fixed",support="finite",kind="lever"}={}){
 if(!["none","fixed","movable"].includes(backing)||
  !["finite","none","actor-only","cargo-only"].includes(support)||
  !["lever","rigid-lever"].includes(kind))
  throw Error("P11 input");
 const w=makeMaterialWorkshop({fixture:kind==="lever"?"hinge":"rigid-tool",
  support:support==="none"?"none":"finite"});
 try{
  if(support==="actor-only"||support==="cargo-only"){
   // An EXPLICIT diagnostic ablation of only one source of the old
   // virtual ground friction; the real rigid collision solve is untouched.
   // Do not identify this impulse law with actual discrete foot contact.
   w.terrainStep=()=>{
    if(support==="actor-only")for(const a of w.actors){
     const mu=a.stance==="brace"?1.20:.22;
     w.terrain(a,a.body.mass()*9.81*mu,a.stance==="brace"?80:1.5);
    }
    if(support==="cargo-only")for(const load of w.loads)
     w.terrain(load,load.body.mass()*9.81*.30,24);
   };
  }
  // Empty northern source region of the SAME P10b physical courtyard.
  // All body and cargo positions are true authored material transforms.
  if(!w.moveEntity(w.tool,V(12,6.6))||!w.moveEntity(w.toolLoad,V(15.15,7.32)))
   throw Error("P11 source physical assembly refused");
  // Actual physical contact backing: a REAL fixed collider or 90kg MOVABLE
  // independent material load with the SAME dimensions / initial geometry.
  w.backer=backing==="fixed"?w.barrier(11.04,6.6,.23,1.7):
   backing==="movable"?w.load(11.04,6.6,.23,1.7,90):null;
  w.setSelected(w.tool.id);
  w.world.propagateModifiedBodyPositionsToColliders();
  return w;
 }catch(e){w.dispose();throw e;}
}
export function p11Case({backing="fixed",support="finite",
 kind="lever",actuation="hinge",ticks=240}={}){
 if(!["hinge","off","cheap-root"].includes(actuation))throw Error("P11 actuation");
 const w=makeP11World({backing,support,kind});
 try{
  const arm=w.tool,load=w.toolLoad,backer=w.backer;
  const initial={
   root:p(arm),load:p(load),panel:arm.panel?p(arm.panel):null,
   rootMass:round(arm.body.mass()),allPartsMass:round(arm.body.mass()+
    (arm.panel?.body.mass()||0)),
   backer:backer?p(backer):null,
   loadTouch:!!w.actualContact(arm,load),
   backingTouch:backer?contact(w,arm,backer).points:0
  };
  if(initial.loadTouch)throw Error("P11 load already contacted before any action");
  if(actuation==="hinge"){
   if(!arm.panel||!w.setPanelAngle(arm.id,.9))
    throw Error("P11 hinge source absent");
  }
  let contactsCargo=0,contactImpulseCargo=0,contactsBacking=0;
  let contactImpulseBacking=0,firstCargo=null,firstBacking=null;
  let rootPeakYaw=0,peakLoadTravel=0,backerPeak=0;
  const loadStart=p(load),rootStart=p(arm),backerStart=backer?p(backer):null;
  const frames=[];
  for(let i=0;i<ticks;i++){
   const command=actuation==="cheap-root"?V(1,0):V();
   w.step(command);
   const cargo=w.actualContact(arm,load);
   if(cargo){
    contactsCargo++;
    contactImpulseCargo+=cargo.impulse;
    if(firstCargo===null)firstCargo=w.ticks;
   }
   if(backer){
    const c=contact(w,arm,backer);
    if(c.points){
     contactsBacking++;contactImpulseBacking+=c.impulse;
     if(firstBacking===null)firstBacking=w.ticks;
    }
    backerPeak=Math.max(backerPeak,delta(p(backer),backerStart));
   }
   rootPeakYaw=Math.max(rootPeakYaw,Math.abs(arm.body.rotation()));
   peakLoadTravel=Math.max(peakLoadTravel,delta(p(load),loadStart));
   if([0,29,59,119,179,ticks-1].includes(i))
    frames.push({tick:w.ticks,root:p(arm),load:p(load),
     rootYaw:round(arm.body.rotation()),
     relativeAngle:arm.panel?round(arm.panel.body.rotation()-arm.body.rotation()):null,
     backing:backer?p(backer):null});
  }
  const t=w.trace();
  return {backing,support,kind,actuation,ticks,initial,
   finalRoot:p(arm),rootTravel:delta(p(arm),rootStart),
   rootYaw:round(arm.body.rotation()),peakYaw:round(rootPeakYaw),
   finalLoad:p(load),loadTravel:delta(p(load),loadStart),
   loadDX:round(load.body.translation().x-loadStart.x),
   loadDY:round(load.body.translation().y-loadStart.y),
   loadPeak:round(peakLoadTravel),
   backingTravel:backer?delta(p(backer),backerStart):null,
   backingPeak:backer?round(backerPeak):null,
   cargoContactTicks:contactsCargo,cargoContactImpulse:round(contactImpulseCargo),
   backingContactTicks:contactsBacking,backingContactImpulse:round(contactImpulseBacking),
   firstCargo,firstBacking,actuatorImpulse:round(t.panelImpulse),
   rootDriveImpulse:round(t.rootEffort),
   terrainReaction:round(t.terrainImpulse),
   finite:finite(w)&&t.finite,
   real:frames,
   limitation:"Real rigid wall/material backing is NOT a living foot; root drive is external proxy; no claim of body-action superiority on cargo."};
 }finally{w.dispose();}
}
export function p11Audit(){
 const scenarios=[];
 for(const support of ["finite","actor-only","cargo-only","none"])
  for(const backing of ["none","fixed","movable"])
   for(const actuation of ["off","hinge"])
    scenarios.push(p11Case({support,backing,actuation}));
 // Cheap alternative is operator's movement of a similarly shaped rigid
 // implement. Its EXTERNAL root force is not energy- or torque-equivalent to
 // the hinge's internal paired torque; it is a causal pragmatic rival only.
 for(const backing of ["none","fixed","movable"])
  scenarios.push(p11Case({backing,kind:"rigid-lever",actuation:"cheap-root"}));
 if(scenarios.length!==27||scenarios.some(x=>!x.finite||
    !Number.isFinite(x.loadTravel)||x.ticks!==240))
  throw Error("P11 source counterfactual worlds incomplete or nonfinite");
 for(const support of ["finite","actor-only","cargo-only","none"])for(const backing of ["none","fixed","movable"]){
  const a=scenarios.find(x=>x.support===support&&x.backing===backing&&x.actuation==="off");
  const b=scenarios.find(x=>x.support===support&&x.backing===backing&&x.actuation==="hinge");
  if(!a||!b||JSON.stringify(a.initial)!==JSON.stringify(b.initial))
   throw Error("P11 exact initial physical counterfactual mismatch");
  if(a.actuatorImpulse!==0||b.rootDriveImpulse!==0)
   throw Error("P11 mismatched root and internal force source");
 }
 return {worlds:scenarios.length,scenarios,summary:scenarios.map(x=>({
  backing:x.backing,support:x.support,kind:x.kind,act:x.actuation,
  load:x.loadTravel,dx:x.loadDX,peak:x.loadPeak,
  rootYaw:x.rootYaw,backContacts:x.backingContactTicks,
  cargoContacts:x.cargoContactTicks,actuator:x.actuatorImpulse,
  rootEffort:x.rootDriveImpulse,ground:x.terrainReaction
 })),limitations:"No product PASS. actor-only / cargo-only are controlled ablations of existing bounded virtual planar friction, not physically real foot-ground contacts. Fixed world wall is infinite-mass material support, moving 90kg cargo is a load. No active sensing/biological stance. Cheap direct-drive rival uses EXTERNAL ground proxy, not equal actuation energy. Read actual afterstates."};
}
