// P2 actual source protocol: same operator root motion and cargo/morphology,
// only the existence/force of a contact-gated compliant grip differs.
// No pre-touch telekinesis; load stays a separate collider.
// Stage-2 is scripted operator motion, not an autonomous agent goal.
import {TransportYard} from "./p2-world.js";
import {V} from "./p0-world.js";
const round=x=>Math.round(x*10000)/10000;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function one({kind="small",mass=45,support="finite",grip="on",cap=3,matchedSpeed=null}){
 const w=new TransportYard({populated:false,support});
 try{
  const actor=w.spawn(kind,V(8,16));
  if(matchedSpeed!==null)actor.maxSpeedOverride=matchedSpeed;
  w.setSelected(actor.id);
  const cargo=w.load(10.4,16,.47,.43,mass);
  const initial={actor:{...actor.body.translation()},cargo:{...cargo.body.translation()}};
  const refused=w.grip(actor.id,cargo.id);
  if(refused.ok||refused.reason!=="no real solver contact")
   throw Error("P2 early grip was NOT refused before true contact");
  let contacted=false,approachTick=null,gripAttempt=null;
  for(let tick=0;tick<260;tick++){
   w.step(V(1,0));
   if(w.actualContact(actor,cargo)){
    contacted=true;approachTick=tick+1;
    if(grip!=="off"){
     const before={...cargo.body.translation()};
     gripAttempt=w.grip(actor.id,cargo.id,{maxImpulse:grip==="zero"?0:cap});
     if(!gripAttempt.ok)throw Error("P2 true contact could not grip "+JSON.stringify(gripAttempt));
     if(dist(before,cargo.body.translation())>1e-9)
      throw Error("P2 grip acquisition teleported load");
    }
    break;
   }
  }
  if(!contacted)throw Error("P2 operator body never met cargo physically: "+kind+"/"+mass+"/"+support);
  const contact={actor:{...actor.body.translation()},cargo:{...cargo.body.translation()}};
  const samples=[];
  for(let i=0;i<210;i++){
   w.step(V(-1,0));
   if([0,14,39,79,129,209].includes(i)){
    const g=w.gripTrace();const p=cargo.body.translation(),a=actor.body.translation();
    samples.push({tick:i+1,actor:{...a},load:{...p},
      tether:g.grips.length?g.grips[0].stretch:null});
   }
  }
  const after={actor:{...actor.body.translation()},cargo:{...cargo.body.translation()}};
  const active=w.gripTrace();
  const momentumResidual=V(
   active.gripEvidence.holderImpulseX+active.gripEvidence.loadImpulseX,
   active.gripEvidence.holderImpulseY+active.gripEvidence.loadImpulseY);
  const gripBeforeRelease=active.grips.length;
  if(gripBeforeRelease)w.release(actor.id);
  for(let i=0;i<45;i++)w.step(V());
  const terminal=w.gripTrace();
  return {kind,mass,support,grip,cap,matchedSpeed,approachTick,
   initial,contact,after,finalCargo:{...cargo.body.translation()},
   cargoDXAfterPull:round(after.cargo.x-contact.cargo.x),
   bodyDXAfterPull:round(after.actor.x-contact.actor.x),
   cargoDistance:round(dist(after.cargo,contact.cargo)),
   linkedBeforeRelease:gripBeforeRelease,
   gripAttempt,refused,
   actualGripImpulse:active.gripEvidence.pairedImpulseSum,
   gripImpulsePairs:active.gripEvidence.appliedPairs,
   sourceResidual:round(dist(momentumResidual,V())),
   gripBreaks:active.gripEvidence.breaks,
   peakStretch:active.gripEvidence.peakStretch,
   manualReleases:terminal.gripEvidence.manualReleases,
   rootDrive:terminal.events.rootEffort,
   supportImpulse:terminal.events.terrainLinearImpulse,
   loadStillPhysics:terminal.loads.some(x=>x.id===cargo.id),
   finite:terminal.finite,
   frames:samples};
 }finally{w.dispose();}
}
export function p2Probe(){
 const cases=[];
 for(const kind of ["small","bulky"])
  for(const support of ["finite","none"])
   for(const grip of ["off","zero","on"]){
    cases.push(one({kind,mass:45,support,grip,cap:3}));
   }
 if(cases.length!==12||cases.some(x=>!x.finite||!x.loadStillPhysics||
  x.refused.ok||x.sourceResidual>1e-6||!x.approachTick))
  throw Error("P2 source null invalid");
 for(const x of cases){
  if(x.grip==="off"&&(x.gripImpulsePairs!==0||x.linkedBeforeRelease!==0))
   throw Error("P2 false off grip generated force");
  if(x.grip==="zero"&&(x.gripImpulsePairs!==0||x.actualGripImpulse!==0))
   throw Error("P2 zero-cap link still exerted force");
 }
 return {question:"Does a physically contacted, force-limited compliant grip create a real independent transport action compared with same operator motion and no grip?",
 warning:"Even if yes: not real hands, gait, self-directed NPC or Owner-feel PASS. Contact anchor is midpoint approximation, not tactile anatomy. One cargo and two root body kinds.",
 cases:cases.length,results:cases};
}


export function p2SpeedRedTeam(){
 // Post-hoc fairer movement policy: same desired speed 1.75m/s; body mass,
 // geometry and existing finite root motor strengths remain different.
 const cases=[];
 for(const kind of ["small","bulky"])
  for(const support of ["finite","none"])
   for(const mass of [45,100]){
    const common={kind,support,mass,matchedSpeed:1.75};
    cases.push(one({...common,grip:"off"}));
    for(const cap of [3,6])
     cases.push(one({...common,grip:"on",cap}));
   }
 if(cases.length!==24||cases.some(x=>!x.finite||!x.loadStillPhysics||
  x.refused.ok||x.sourceResidual>1e-6||!x.approachTick))
  throw Error("P2 speed-matched falsifier invalid source");
 return {scope:"POST-HOC red-team 24 solver cases, same target root speed for all bodies",
  claim:"separates programmed speed from mass, motor and strength confounds but does not isolate morphology",
  cases:cases.length,results:cases,
  comparisons:cases.filter(x=>x.grip==="on").map(x=>{
   const n=cases.find(y=>y.grip==="off"&&y.kind===x.kind&&
    y.mass===x.mass&&y.support===x.support);
   if(!n)throw Error("P2 missing valid no-grip rival");
   return {kind:x.kind,support:x.support,mass:x.mass,cap:x.cap,
    noGripCargoDX:n.cargoDXAfterPull,gripCargoDX:x.cargoDXAfterPull,
    gripBreaks:x.gripBreaks,gripImpulse:x.actualGripImpulse,
    rootDX:x.bodyDXAfterPull,contactTick:x.approachTick};
  })};
}
