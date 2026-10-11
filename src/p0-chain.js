// P0 causal material continuation: actor A changes a real gate, then actor B
// receives the exact same independently applied, finite impulse in the same
// enduring physical world. No scripted crossing, key, mission or teleport.
// First actor is relocated by the AUTHOR equally in both branches to isolate
// gate afterstate from direct body blocking; this is a diagnostic protocol.
import {MaterialYard,V} from "./p0-world.js";
const round=x=>Math.round(x*10000)/10000;
function gateImpulse(field,actor){
 let total=0;
 for(const part of [actor,...(actor.panel?[actor.panel]:[])])for(const p of part.shapes)
  field.world.contactPair(p.collider,field.gate.shapes[0].collider,m=>{
  for(let k=0;k<m.numSolverContacts();k++)total+=Math.abs(m.contactImpulse(k)||0);
 });
 return total;
}
export function continuation({worldSupport,changed,kind,speed,runnerY=11.6,openerKind="bulky",captureWorld=null}){
 const field=new MaterialYard({populated:false,support:worldSupport});
 try{
  const opener=field.spawn(openerKind,V(15,11.7));
  field.setSelected(opener.id);
  let openerGateImpulse=0,openerGateFrames=0;
  for(let i=0;i<480;i++){
   field.step(changed?V(1,0):V());
   const j=gateImpulse(field,opener);
   if(j>0){openerGateImpulse+=j;openerGateFrames++;}
  }
  const gateAfterOpener=field.traces().gateAngle;
  const openerPosition={...opener.body.translation()};
  const firstStageSource=field.events.rootEffort;
  // Same diagnostic author edit in both world branches; no respawned gate,
  // no edited collider collision policy, no destination-based steering.
  field.moveEntity(opener,V(34,21));
  field.selected=null;
  const runner=field.spawn(kind,V(16.5,runnerY));
  const initial=runner.body.translation();
  const exactSpeedImpulse=runner.body.mass()*speed;
  runner.body.applyImpulse(V(exactSpeedImpulse,0),true);
  const checkpoints=[];
  let runnerGateImpulse=0,runnerGateFrames=0,firstRunnerGate=null;
  for(let i=0;i<180;i++){
   field.step();
   const j=gateImpulse(field,runner);
   if(j>0){
    runnerGateImpulse+=j;runnerGateFrames++;
    if(firstRunnerGate===null)firstRunnerGate=i+1;
   }
   if([30,60,90,120,180].includes(i+1)){
    const p=runner.body.translation();
    checkpoints.push({tick:i+1,x:round(p.x),y:round(p.y),
      gate:field.traces().gateAngle});
   }
  }
  const after=field.traces(),p=runner.body.translation();
  if(typeof captureWorld==="function")captureWorld(field);
  return {worldSupport,changed,kind,speed,runnerY,openerKind,
   exactSpeedImpulse:round(exactSpeedImpulse),
   openerGateImpulse:round(openerGateImpulse),openerGateFrames,
   openerPosition:{x:round(openerPosition.x),y:round(openerPosition.y)},
   firstStageSource:round(firstStageSource),
   gateAfterOpener,gateAfterRunner:after.gateAngle,
   runnerOrigin:{x:round(initial.x),y:round(initial.y)},
   runnerAfter:{x:round(p.x),y:round(p.y)},
   runnerCrossed:p.x>20.7,runnerGateImpulse:round(runnerGateImpulse),
   runnerGateFrames,firstRunnerGate,checkpoints,finite:after.finite,
   rootDriveInSecond:round(field.events.rootEffort-firstStageSource)};
 }finally{if(typeof captureWorld!=="function")field.dispose();}
}
export function p0MaterialChain(){
 const cases=[];
 for(const support of ["finite","none"])
  for(const speed of [3.5,5.5])
   for(const kind of ["small","bulky"])
    for(const changed of [false,true])
     cases.push(continuation({worldSupport:support,changed,kind,speed}));
 if(cases.length!==16||cases.some(x=>!x.finite||x.rootDriveInSecond!==0))
  throw Error("P0 material chain invalid population/authority");
 for(const k of cases.filter(x=>x.changed===false)){
   if(k.firstStageSource!==0||k.openerGateImpulse!==0||
     Math.abs(k.gateAfterOpener)>1e-6)
    throw Error("P0 purported untouched gate baseline physically changed");
 }
 for(const k of cases.filter(x=>x.changed===true)){
  if(k.firstStageSource<=0||k.openerGateImpulse<=0)
   throw Error("P0 attempted opener did not physically move gate by contact");
 }
 return {question:"Does one body's physical alteration of a gate change later equal-input material access for another?",
  source:"16 distinct exact-source WASM worlds, stage-1 operator COM drive with actual gate contact then independent stage-2 impulse",
  safety:"Authored opener relocation identical in both branches; no target navigation, scripted success, flags or hidden protections",
  cases};
}
