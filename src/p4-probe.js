// P4 actual WASM counterfactuals: post-contact cargo pressure with NO
// programmed response time, waypoint, destination or adversary behavior.
// Only a REAL external test impulse differs from no-pulse null, and local
// sensing controls finite root traction through the same capped physical API.
import {ReflexYard} from "./p4-reflex.js";
import {V} from "./p0-world.js";
const r=x=>Math.round(x*10000)/10000;
const vec=e=>({...e.body.translation()});
function compact(s){
 return {tick:s.tick,actor:s.actors[0],cargo:s.loads[0],
  grip:s.grips.map(g=>({stretch:g.stretch,totalImpulse:g.totalImpulse})),
  breaks:s.gripEvidence.breaks,actuated:s.reflexEvents.active};
}
export function p4Case({mode="off",support="finite",kind="small",
    mass=45,force=100,side="right",offCenter=0,steps=180,
    captureWorld=null}={}){
 const w=new ReflexYard({populated:false,support});
 try{
  const actor=w.spawn(kind,V(kind==="bulky"?8.2:8.95,15));
  actor.maxSpeedOverride=1.4;
  const cargo=w.load(10,15,.48,.42,mass);
  w.selected=null;
  // Acquisition only after genuine source solver contact.
  let touchTick=-1;
  for(let i=0;i<150;i++){
   w.command(actor,V(1,0));w.step();
   if(w.actualContact(actor,cargo)){touchTick=i+1;break;}
  }
  if(touchTick<0)throw Error("P4 source did not physically touch cargo");
  const before={...cargo.body.translation()};
  const acquire=w.grip(actor.id,cargo.id,{maxImpulse:4});
  if(!acquire.ok)throw Error("P4 cannot acquire genuine contact: "+acquire.reason);
  if(Math.hypot(cargo.body.translation().x-before.x,cargo.body.translation().y-before.y)>1e-9)
   throw Error("P4 automatic cargo reposition on grip");
  // Simulate 90 ordinary unactuated solver ticks; no scripted repose.
  for(let i=0;i<90;i++)w.step();
  const start=w.reflexTrace(),startCargo=vec(cargo),startActor=vec(actor);
  // Set strategy AFTER identical settled physical states to avoid confounding
  // reference worlds by different pre-perturbation policies.
  w.setReflex(actor.id,mode);
  if(force!==0){
   if(!Number.isFinite(force)||force<0||force>600)throw Error("pulse");
   const delta=side==="left"?V(-force,0):V(force,0);
   const pos=cargo.body.translation();
   cargo.body.applyImpulseAtPoint(delta,V(pos.x,pos.y+offCenter),true);
  }
  // The response executes autonomously per tick, reading only its linked
  // cargo/holder; the impact is an owner/source perturbation, not a goal script.
  const frames=[{stage:"before-pressure",...compact(start)}];
  let survived=0,prevActive=w.grips.length;
  for(let i=0;i<steps;i++){
   w.step();
   if(w.grips.some(g=>g.actor===actor))survived++;
   if([0,7,19,44,89,steps-1].includes(i))
    frames.push({stage:"after-"+(i+1),...compact(w.reflexTrace())});
  }
  const after=w.reflexTrace(),endCargo=vec(cargo),endActor=vec(actor);
  const result={mode,support,kind,mass,force,side,offCenter,steps,touchTick,
   acquiredContact:acquire.contact,initialLoad:startCargo,initialActor:startActor,
   afterLoad:endCargo,afterActor:endActor,
   loadDX:r(endCargo.x-startCargo.x),actorDX:r(endActor.x-startActor.x),
   loadDY:r(endCargo.y-startCargo.y),loadYaw:r(cargo.body.rotation()),
   stretchPeak:after.gripEvidence.peakStretch,
   breaks:after.gripEvidence.breaks,gripTicks:survived,
   activeAtEnd:after.grips.length,gripImpulse:after.gripEvidence.pairedImpulseSum,
   reflexTicks:after.reflexEvents.active,reflexSource:after.reflexEvents.proxyImpulse,
   groundedSource:after.events.terrainLinearImpulse,
   reflexEvidence:after.reflexEvents,finite:after.finite,frames};
  if(captureWorld)captureWorld(w,{actor,cargo,result});
  return result;
 }finally{if(!captureWorld)w.dispose();}
}
export function p4Probe(){
 const cases=[];
 for(const support of ["finite","none"])
  for(const impulse of [
   {force:0,side:"right",offCenter:0},
   {force:90,side:"right",offCenter:0},
   {force:160,side:"right",offCenter:.33},
   {force:160,side:"left",offCenter:-.33},
  ])
   for(const mode of ["off","brake","follow","conditional"])
    cases.push(p4Case({support,...impulse,mode}));
 if(cases.length!==32||cases.some(x=>!x.finite||x.touchTick<0||x.acquiredContact<1))
  throw Error("P4 invalid pressure source states");
 // Each comparator starts from EXACT same physical pose before intervention.
 for(const x of cases){
  const peers=cases.filter(y=>y.support===x.support&&y.force===x.force&&
   y.side===x.side&&y.offCenter===x.offCenter);
  if(peers.some(y=>Math.hypot(y.initialLoad.x-x.initialLoad.x,
       y.initialLoad.y-x.initialLoad.y)>1e-7))
   throw Error("P4 A/B sources differ before reflex activation");
  if(x.mode==="off"&&(x.reflexSource!==0||x.reflexTicks!==0))
   throw Error("P4 OFF actually exerted proxy control");
 }
 return {cases:cases.length,results:cases,
  comparisons:cases.filter(x=>x.mode==="conditional").map(x=>{
   const peers=cases.filter(y=>y.support===x.support&&y.force===x.force&&
    y.side===x.side&&y.offCenter===x.offCenter);
   return {support:x.support,force:x.force,side:x.side,
    offCenter:x.offCenter,results:peers.map(y=>({
     mode:y.mode,dx:y.loadDX,gripTicks:y.gripTicks,
     breaks:y.breaks,reflexSource:y.reflexSource,stretch:y.stretchPeak
    }))};
  }),
  truth:"real Rapier WASM; one source-authored external impulse into real 45kg dynamic load; all actor responses strictly local linked-material velocity and tension",
  limits:"NOT a self-directed goal, cognition, proper feet or a living NPC. An active virtual traction proxy acts on root; cheap unconditional follow/brake competitors included."};
}
