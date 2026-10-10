// E1 one-world challenge: different physically embodied residents choose
// LIMITED local efforts in the same edited world; no traffic lanes/route graph.
// Negative controls use same starting scene/geometry/solver, varying only
// whether motor initiative, odor sensing or pressure-conditioned decisions exist.
// These are practical phenomena checks, NOT synthetic "intelligence scores".
import {EncounterField} from "./e1-encounter.js";
import {V} from "./m0-world.js";
const round=x=>Math.round(x*1000)/1000;
function run(kind){
 const opts={initiative:kind!=="passive",pressureResponse:kind!=="no-pressure",reflex:true};
 const w=new EncounterField(opts);
 try{
  if(kind==="no-odor")w.cues=[]; // boxes remain REAL PHYSICAL objects
  const starts=new Map(w.actors.map(a=>{
   const p=a.root.translation();return [a.id,V(p.x,p.y)];
  }));
  let physCount=0,maxPressure=0,numericalOK=true,edits=0,probes=[];
  for(let i=0;i<420;i++){
   if(kind==="shifted-odor"&&i===160){
    const chosen=w.cues[0];
    const index=w.objects.indexOf(chosen);
    if(index<0||!w.poseObject(index,V(33.6,22.5)))throw Error("Live physical cue edit failed");
    edits++;
   }
   w.step();
   physCount+=w.contactPairs;
   for(const a of w.actors){
    maxPressure=Math.max(maxPressure,a.pressure);
    const p=a.root.translation(),v=a.root.linvel();
    if(![p.x,p.y,v.x,v.y].every(Number.isFinite))numericalOK=false;
    if(Math.abs(p.x)>100||Math.abs(p.y)>100)numericalOK=false;
   }
   if([0,79,159,239,319,419].includes(i)){
    const snap=w.getTrace();
    probes.push({tick:i,
      avgMoved:round(w.actors.reduce((sum,a)=>{
       const o=starts.get(a.id),p=a.root.translation();
       return sum+Math.hypot(p.x-o.x,p.y-o.y);
      },0)/w.actors.length),
      contacts:physCount,reactions:w.episodes.contactReactions,
      attention:snap.actors.filter(a=>a.sensed!==null).length,
      localMotors:snap.actors.reduce((sum,a)=>sum+a.autonomousTicks,0),
      cues:snap.cues.map(c=>({i:c.index,x:c.x,y:c.y}))});
   }
  }
  const end=w.getTrace();
  const avgTravel=round(w.actors.reduce((sum,a)=>{
   const o=starts.get(a.id),p=a.root.translation();
   return sum+Math.hypot(p.x-o.x,p.y-o.y);
  },0)/w.actors.length);
  return {kind,actors:w.actors.length,cues:w.cues.length,
   frameContacts:physCount,peakPressure:round(maxPressure),
   reflexes:end.reflexEvents,reactiveChanges:end.episodes.contactReactions,
   steeringChanges:end.episodes.steering,
   autonomousTicks:end.actors.reduce((n,a)=>n+a.autonomousTicks,0),
   autoImpulse:round(end.actors.reduce((n,a)=>n+a.autoImpulse,0)),
   attended:end.actors.filter(a=>a.sensed!==null).length,avgTravel,
   stagedEditCount:edits,numericOK:numericalOK,
   sample:probes,
   actors:end.actors.map(a=>({id:a.id,kind:a.kind,role:a.role,
     x:a.x,y:a.y,motor:a.autonomousTicks,react:a.reactions,state:a.state}))};
 }finally{w.dispose();}
}
export function runE1Probe(part="A"){
 if(!["A","B"].includes(part))throw RangeError("Invalid experimental batch");
 const cases=(part==="A"?["full","passive","no-pressure"]:
   ["no-odor","shifted-odor"]).map(run);
 if(cases.some(x=>!x.numericOK))throw Error("Unbounded/nonfinite E1 physical state");
 if(cases.some(x=>x.actors!==18))throw Error("Unintended actor reproduction/teleport");
 const passive=cases.find(x=>x.kind==="passive");
 if(passive&&(passive.autonomousTicks!==0||passive.autoImpulse!==0))
  throw Error("No-initiative physical baseline was powered");
 return {part,scope:"One shared, editable physical 2D world with 18 mixed rigid/segmented/spring-mass residents; 420 actual solver steps per independent initial world. Controls toggle ONLY local root-proxy initiative, limited local odor signal and pressure-conditioned direction; one physically reposed movable odor body in a still-running world. No programmed traffic routes, magic item collection, cognitive/perception claim or gameplay PASS.",
  cases,warning:"Physically separate initial worlds share sourced arrangement. Contact incidences accumulate repeated manifolds and cannot stand for quality. 'Odor' is an authored local scalar cue of genuine moving objects, not full sensory perception. Motion source remains an external planar traction proxy."};
}
