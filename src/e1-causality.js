// E1 counterfactual: when do motor decisions FIRST diverge, and why?
// Simultaneously-created sourced whole worlds start with EXACT same
// physical model and seed. No coordinate tuning after results.
import {EncounterField} from "./e1-encounter.js";
import {V} from "./m0-world.js";
const round=x=>+x.toFixed(5);
const len=v=>Math.hypot(v.x,v.y);
const pressureLimit={seeker:8,wary:5,holder:11};
function distance(a,b){
 let max=0;
 for(let i=0;i<a.actors.length;i++){
  const u=a.actors[i].root.translation(),v=b.actors[i].root.translation();
  max=Math.max(max,Math.hypot(u.x-v.x,u.y-v.y));
 }
 return max;
}
function lockstepPressure(){
 const withResponse=new EncounterField({pressureResponse:true}),
  noResponse=new EncounterField({pressureResponse:false});
 try{
  let first=null,prevPressure=null,lastDistance=0;
  for(let tick=0;tick<420;tick++){
   const before=withResponse.actors.map(a=>({
    id:a.id,role:a.role,impulse:a.pressure,status:a.motive.status,
    nearby:a.motive.neighborCount,odor:a.motive.chosenCue}));
   withResponse.step();noResponse.step();
   if(!first){
    const distinct=withResponse.actors.find((a,i)=>len(V(
       a.motive.direction.x-noResponse.actors[i].motive.direction.x,
       a.motive.direction.y-noResponse.actors[i].motive.direction.y))>1e-5);
    if(distinct){
     const i=withResponse.actors.indexOf(distinct),prior=before[i];
     first={tick,actor:distinct.id,role:distinct.role,
      previousSolverContactImpulse:round(prior.impulse),
      threshold:pressureLimit[distinct.role],beforeMode:prior.status,
      withResponse:distinct.motive.status,
      withoutResponse:noResponse.actors[i].motive.status,
      beforeActorWorldDivergence:round(distance(withResponse,noResponse)),
      sourceOfDifference:"response law toggled; all initial conditions identical"};
    }
   }
   lastDistance=distance(withResponse,noResponse);
  }
  const a=withResponse.getTrace(),b=noResponse.getTrace();
  return {first,finalActorDisparity:round(lastDistance),
   physicalContactChangesOn:a.episodes.contactReactions,
   off:b.episodes.contactReactions,
   sourceMotorTicksOn:a.actors.reduce((n,x)=>n+x.autonomousTicks,0),
   sourceMotorTicksOff:b.actors.reduce((n,x)=>n+x.autonomousTicks,0),
   warning:"The first different local command from a previous-frame impulse does not establish better/realistic social response, only causal steering change."};
 }finally{withResponse.dispose();noResponse.dispose();}
}
function moveCue(){
 const original=new EncounterField(),edited=new EncounterField();
 try{
  let initialMismatch=null,firstChange=null;
  const src=edited.cues[0],objectIndex=edited.objects.indexOf(src);
  if(objectIndex<0)throw Error("No actual physical cue to edit");
  for(let tick=0;tick<360;tick++){
   if(tick===160){
    const pre=distance(original,edited);
    if(pre>1e-7)initialMismatch={tick,pre};
    if(!edited.poseObject(objectIndex,V(33.6,22.5)))
     throw Error("Dynamic physical stimulus edit failed");
   }
   original.step();edited.step();
   if(tick>=160&&!firstChange){
    const changed=original.actors.find((a,i)=>{
     const b=edited.actors[i];
     return len(V(a.motive.direction.x-b.motive.direction.x,
       a.motive.direction.y-b.motive.direction.y))>1e-5;
    });
    if(changed){
     const i=original.actors.indexOf(changed);
     firstChange={tick,actor:changed.id,role:changed.role,
      originalCue:changed.motive.chosenCue,
      editedCue:edited.actors[i].motive.chosenCue,
      fromSignal:changed.motive.lastOdorDist,
      withEditedSignal:edited.actors[i].motive.lastOdorDist,
      actorPositionAtChange:{x:round(changed.root.translation().x),
       y:round(changed.root.translation().y)}};
    }
   }
  }
  return {initialMismatch,firstChangedDecision:firstChange,
   finalPhysicalDifference:round(distance(original,edited)),
   note:"This editor intervention moves a REAL matter collider, not purely an abstract scent signal. Physical-object position and local cue may BOTH explain downstream divergence."};
 }finally{original.dispose();edited.dispose();}
}
function signalOnly(){
 const original=new EncounterField(),changed=new EncounterField();
 try{
  let prefixDifference=null,first=null;
  for(let tick=0;tick<320;tick++){
   if(tick===160){
    const d=distance(original,changed);
    if(d>1e-8)prefixDifference={tick,d};
    // Change only an authored LOCAL ODOR SIGNATURE. No body/collider mass,
    // transform, material state, joint, force or engine condition changes.
    changed.cues[0].signature="cyan";
    if(changed.cues[0].body.translation().x!==
       original.cues[0].body.translation().x)
     throw Error("Signal-only edit contaminated physics");
   }
   const pre=distance(original,changed);
   original.step();changed.step();
   if(tick>=160&&!first){
    const actor=original.actors.find((a,i)=>len(V(
      a.motive.direction.x-changed.actors[i].motive.direction.x,
      a.motive.direction.y-changed.actors[i].motive.direction.y))>1e-5);
    if(actor){
     const i=original.actors.indexOf(actor),another=changed.actors[i];
     first={tick,actor:actor.id,role:actor.role,
      preStepBodyDisparity:round(pre),
      originalSensed:actor.motive.chosenCue,
      changedSensed:another.motive.chosenCue,
      originalState:actor.motive.status,
      changedState:another.motive.status,
      originalSource0:original.cues[0].signature,
      changedSource0:changed.cues[0].signature};
    }
   }
  }
  return {prefixDifference,firstSignalCommandDifference:first,
   postSignalWorldDivergence:round(distance(original,changed)),
   note:"Unlike moving a material source, this comparison changes only one local signal descriptor on the same physical free collider. First decision divergence must follow a later local sensor refresh; no immediate physical collider change is allowed."};
 }finally{original.dispose();changed.dispose();}
}
function stress(){
 const w=new EncounterField();
 try{
  const kinds=["rigid","chain","compliant"],roles=["wary","holder","seeker"];
  // Additional unscripted residents share SAME live Rapier solver. Authors add
  // them after initial placement; these are intended as adversarial density.
  for(let i=0;i<12;i++)w.addCreature(kinds[i%3],
    V(7.3+(i%4)*2.6,4.8+Math.floor(i/4)*1.8),roles[(i+1)%3]);
  w.select(null);
  let maxPressure=0,maxColliders=0,nonfinite=0,peakRootSpeed=0;
  // Headless Chromium virtual time is not wall time. Do NOT claim FPS here.
  for(let i=0;i<500;i++){
   w.step();
   maxColliders=Math.max(maxColliders,w.contactPairs);
   for(const a of w.actors){
    const p=a.root.translation(),v=a.root.linvel();
    if(![p.x,p.y,v.x,v.y].every(Number.isFinite))nonfinite++;
    maxPressure=Math.max(maxPressure,a.pressure);
    peakRootSpeed=Math.max(peakRootSpeed,len(v));
   }
  }

  const state=w.getTrace();
  return {actors:w.actors.length,bodyCount:w.actors.reduce((n,a)=>n+a.parts.length,0),
   simulationTicks:500,timing:"UNMEASURED (Chromium virtual time)",
   maxContactIncidencesPerTick:maxColliders,
   maxImpulseSeen:round(maxPressure),maxRootSpeed:round(peakRootSpeed),
   nonfinite,autonomousTicks:state.actors.reduce((n,a)=>n+a.autonomousTicks,0),
   contactDecisions:state.episodes.contactReactions,
   note:"Browser CI runner timing is NOT an end-user FPS benchmark; this only checks bounded whole-world stress under one hardware runner."};
 }finally{w.dispose();}
}
export function runE1Causality(batch="C"){
 if(!["C","D"].includes(batch))throw RangeError("Batch");
 return batch==="C"?{batch,pressure:lockstepPressure(),edit:moveCue(),signalOnly:signalOnly()}:
   {batch,stress:stress()};
}
