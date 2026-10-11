// P5 free-run source falsification. No preset "event chain": identical
// material conditions, autonomous contact reactions, optional one external
// Owner-like impact as the ONLY timed intervention. No scripted NPC goals.
import {createCommons} from "./p5-commons.js";
import {V} from "./p0-world.js";
const r=x=>Math.round(x*1e4)/1e4;
const snapshot=(w,label)=>{
 const t=w.commonsTrace();
 // For the A/B external-shock pair, certify identical *physical state*,
 // not just on-screen positions. Do this BEFORE injecting any impulse.
 const provenance=["start","before-intervention"].includes(label)?{
  bodies:w.entities.map(e=>{
   const p=e.body.translation(),v=e.body.linvel();
   return {id:e.id,kind:e.kind,p:{...p},v:{...v},
    angle:e.body.rotation(),omega:e.body.angvel(),mass:e.body.mass(),
    fixed:e.body.isFixed()};
  }),
  links:w.grips.map(g=>({owner:g.actor.id,load:g.load.id,
   impulseCap:g.maxImpulse,anchorA:g.anchorA,anchorB:g.anchorB,
   stretch:g.stretch,totalImpulse:g.totalImpulse})),
  rules:[...w.local.entries()].map(([id,s])=>({id,...s})),
  source:{ticks:w.ticks,support:w.support,policy:w.policy,
   activity:{...w.activity},motor:{...w.events}}
 }:undefined;
 return {label,tick:t.tick,provenance,loads:t.loads.map(x=>({id:x.id,x:x.x,y:x.y})),
  actors:t.actors.map(x=>({id:x.id,kind:x.kind,x:x.x,y:x.y,stance:x.stance})),
  grips:t.grips.map(g=>({actor:g.actor,load:g.load,stretch:g.stretch})),
  contactActor:t.activity.contactActor,contactCargo:t.activity.contactCargo,
  touchGrips:t.activity.localGrips,
  rootEffort:t.events.rootEffort,autoEffort:t.activity.autonomousEffort,
  turns:t.activity.turns,braceTicks:t.activity.braceTicks};
};
export function p5Case({policy="material",support="finite",seed=1,
 density=6,topology="open",intervention="none",ticks=330,captureWorld=null}={}){
 const w=createCommons({policy,support,seed,density,topology});
 try{
  const t0=snapshot(w,"start");
  let impulseValid=null;
  const frames=[t0],interventionTick=140;
  for(let t=0;t<ticks;t++){
   if(t===interventionTick){
    // Exact observable pre-intervention state must be sampled BEFORE applying
    // the externally authored physical impulse, not after changing velocity.
    frames.push(snapshot(w,"before-intervention"));
    if(intervention==="pulse"){
     const obj=w.loads[0],p=obj.body.translation();
     impulseValid=w.exteriorImpulse(obj,V(95,25),V(p.x,p.y+.34));
     if(!impulseValid)throw Error("P5 external real source impulse invalid");
    }else if(intervention==="wall"){
     // Owner-like edited physical topology: create one actual fixed collider,
     // not an AI rule or invisible navigation modifier.
     w.barrier(14.9,12.1,.19,1.05);
     w.world.propagateModifiedBodyPositionsToColliders();
    }else if(intervention!=="none")throw Error("P5 intervention invalid");
   }
   w.step();
   if([39,99,139,159,239,ticks-1].includes(t))
    frames.push(snapshot(w,"t"+(t+1)));
  }
  const trace=w.commonsTrace();
  const end=frames[frames.length-1];
  const origins=t0.loads,terminal=trace.loads;
  const loadMotion=terminal.map(x=>{
   const p=origins.find(a=>a.id===x.id);
   return {id:x.id,dx:r(x.x-p.x),dy:r(x.y-p.y),
    displacement:r(Math.hypot(x.x-p.x,x.y-p.y))};
  });
  const uniqueTouchedActors=trace.local.filter(x=>x.contacts>0).length;
  const out={policy,support,seed,density,topology,intervention,ticks,
   finite:trace.finite,actualActorBodies:trace.actorCount,
   actualLoads:trace.loadCount,totalDynamicObjects:trace.actorCount+trace.loadCount,
   contactActor:trace.activity.contactActor,contactCargo:trace.activity.contactCargo,
   contactFixed:trace.activity.contactFixed,turns:trace.activity.turns,
   braceTicks:trace.activity.braceTicks,gripAttempts:trace.activity.gripAttempts,
   localGrips:trace.activity.localGrips,activeGrips:trace.grips.length,
   peakStretch:trace.gripEvidence.peakStretch,
   gripBreaks:trace.gripEvidence.breaks,
   impulseEffort:trace.gripEvidence.pairedImpulseSum,
   autonomousImpulse:trace.activity.autonomousEffort,
   externalImpulse:trace.activity.externalImpulseSum,
   externalCount:trace.activity.externalImpulses,
   actorContactCount:uniqueTouchedActors,
   loadMotion,frames,
   finalActors:trace.actors,finalLoads:trace.loads,
   localRules:trace.local};
  if(captureWorld)captureWorld(w,out);
  return out;
 }finally{if(!captureWorld)w.dispose();}
}
export function p5Probe(){
 const results=[];
 for(const support of ["finite","none"])
  for(const seed of [1,3])
   for(const intervention of ["none","pulse"])
    for(const policy of ["constant","touch","attach","material"])
     results.push(p5Case({support,seed,intervention,policy,topology:"blocked"}));
 // Multi-body stress/alternative topology, NOT a victory certificate.
 const pressure=[];
 for(const intervention of ["none","wall"])
  for(const policy of ["constant","touch","attach","material"])
   pressure.push(p5Case({support:"finite",seed:3,density:10,
    intervention,policy,ticks:300,topology:"blocked"}));
 const opened=[];
 for(const support of ["finite","none"])
  for(const seed of [1,3])
   for(const intervention of ["none","pulse"])
    for(const policy of ["touch","attach","material"])
     opened.push(p5Case({support,seed,intervention,policy,topology:"open"}));
 if(opened.length!==24||opened.some(x=>!x.finite||x.actualActorBodies!==6))
  throw Error("P5 genuine changed topology worlds invalid");
 if(results.length!==32||pressure.length!==8||
  [...results,...pressure].some(x=>!x.finite||x.actualLoads!==3||
   x.actualActorBodies!==x.density||!Number.isFinite(x.autonomousImpulse)))
  throw Error("P5 real source heterogenous commons invalid");
 for(const x of [...results,...pressure]){
  if(["constant","touch"].includes(x.policy)&&
    (x.localGrips!==0||x.impulseEffort!==0))
   throw Error("P5 null/non-grip policy magically linked material");
  if(x.intervention==="pulse"&&(x.externalCount!==1||x.externalImpulse<=95))
   throw Error("P5 shock not delivered physically");
  if(x.intervention!=="pulse"&&x.externalCount!==0)
   throw Error("P5 controls were secretly externally driven");
 }
 const pairs=[];
 for(const support of ["finite","none"])
  for(const seed of [1,3])
   for(const policy of ["constant","touch","attach","material"]){
    const base=results.find(x=>x.support===support&&x.seed===seed&&
      x.policy===policy&&x.intervention==="none");
    const pulse=results.find(x=>x.support===support&&x.seed===seed&&
      x.policy===policy&&x.intervention==="pulse");
    const first=base.frames[0],same=pulse.frames[0];
    if(first.loads.some((x,i)=>x.x!==same.loads[i].x||x.y!==same.loads[i].y))
      throw Error("P5 unequal actual material starting worlds");
    const preBase=base.frames.find(x=>x.label==="before-intervention"),
     prePulse=pulse.frames.find(x=>x.label==="before-intervention");
    if(JSON.stringify(preBase)!==JSON.stringify(prePulse)||
      !preBase.provenance||!prePulse.provenance)
      throw Error("P5 mismatched complete physical positions/velocities/links/decisions immediately before external shock");
    pairs.push({support,seed,policy,
     noPulseLoad0:base.loadMotion[0],shockedLoad0:pulse.loadMotion[0],
     noPulseGrips:base.localGrips,shockedGrips:pulse.localGrips,
     impulseCost:pulse.autonomousImpulse,
     bodyContacts:pulse.contactActor,cargoContacts:pulse.contactCargo});
   }
 return {cases:results.length+pressure.length+opened.length,regular:results,stress:pressure,opened,
  pairs,limitations:"Six/ten locally motile virtual traction bodies are NOT cognitive NPCs, not gait, not proved morphology advantage or gameplay. Settings intentionally seeded starting directions to create research pressure; no path, waypoint or scripted action sequence."};
}
