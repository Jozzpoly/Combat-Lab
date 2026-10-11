// P12b: adversarial momentum accounting in actual Rapier2D emitted runtime.
// No motor tuning, no root external force, no new product capability.
// Core question: is movable-backstop COM drift a velocity/momentum drift,
// a position projection, or related to CCD/numerical stepping?
import {makeP12World} from "./p12-pushoff.js";
import {V,DT} from "./p0-world.js";
const rnd=x=>Math.round(x*1e7)/1e7;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function account(entities){
 let m=0,px=0,py=0,mx=0,my=0,ke=0;
 for(const a of entities){
  const b=a.body,mass=b.mass(),p=b.translation(),v=b.linvel();
  if(![mass,p.x,p.y,v.x,v.y].every(Number.isFinite))throw Error("nonfinite source body");
  m+=mass;px+=mass*p.x;py+=mass*p.y;
  mx+=mass*v.x;my+=mass*v.y;ke+=.5*mass*(v.x*v.x+v.y*v.y);
 }
 return {m,com:V(px/m,py/m),p:V(mx,my),ke};
}
function run({backing="movable",ccd=true,iterations=12,cycle=false}={}){
 const w=makeP12World({backing,support:"none",kind:"lever",iterations});
 try{
  if(!w.tool.panel)throw Error("missing actual hinged source limb");
  const mobile=w.entities.filter(e=>!e.body.isFixed());
  const subjects=[w.tool,w.tool.panel,...(w.backer?[w.backer]:[])];
  if(!ccd)for(const e of mobile){
   if(typeof e.body.enableCcd!=="function")
    throw Error("Rapier RigidBody.enableCcd API unavailable; do not fake CCD ablation");
   e.body.enableCcd(false);
  }
  const allStart=account(mobile),subStart=account(subjects);
  if(!w.setPanelAngle(w.tool.id,1.2))throw Error("missing source actuator");
  let firstResidual=null,firstProjectionResidual=null,peakCombinedP=0,peakAllP=0;
  let maxCOM=0,firstContact=null,contactSteps=0;
  const sampled=[];
  for(let i=0;i<300;i++){
   if(cycle&&i===90)w.setPanelAngle(w.tool.id,0);
   if(cycle&&i===180)w.setPanelAngle(w.tool.id,1.2);
   w.step(V());
   let hit=0;
   if(w.backer)for(const part of [w.tool,w.tool.panel])
    for(const c of part.shapes)for(const b of w.backer.shapes)
     w.world.contactPair(c.collider,b.collider,m=>{hit+=m.numSolverContacts()});
   if(hit){contactSteps++;if(firstContact===null)firstContact=i+1;}
   const all=account(mobile),sub=account(subjects);
   const allP=dist(all.p,allStart.p),subP=dist(sub.p,subStart.p);
   const cd=dist(sub.com,subStart.com);
   maxCOM=Math.max(maxCOM,cd);peakCombinedP=Math.max(peakCombinedP,subP);
   peakAllP=Math.max(peakAllP,allP);
   if(firstResidual===null&&subP>.01)firstResidual=i+1;
   // The COM should evolve by velocity*dt if solver applies only physical
   // forces; sudden discrepancy indicates position projection, NOT work.
   if(i>0&&firstProjectionResidual===null){
    const dx=sub.com.x-lastCOM.x;
    const dy=sub.com.y-lastCOM.y;
    const px=sub.p.x/sub.m*DT,py=sub.p.y/sub.m*DT;
    if(Math.hypot(dx-px,dy-py)>.001)firstProjectionResidual=i+1;
   }
   var lastCOM=sub.com;
   if([0,9,29,59,89,119,179,239,299].includes(i))
    sampled.push({tick:i+1,hit:hit>0,systemCOM:V(rnd(sub.com.x),rnd(sub.com.y)),
     combinedMomentum:V(rnd(sub.p.x),rnd(sub.p.y)),
     allMomentum:V(rnd(all.p.x),rnd(all.p.y)),
     combinedKinetic:rnd(sub.ke)});
  }
  const allEnd=account(mobile),subEnd=account(subjects);
  return {backing,ccd,iterations,cycle,steps:300,
   mass:rnd(subStart.m),
   aggregateCOMDelta:rnd(dist(subEnd.com,subStart.com)),
   wholeWorldCOMDelta:rnd(dist(allEnd.com,allStart.com)),
   aggregateMomentumResidual:rnd(dist(subEnd.p,subStart.p)),
   allWorldMomentumResidual:rnd(dist(allEnd.p,allStart.p)),
   peakCombinedP:rnd(peakCombinedP),peakAllP:rnd(peakAllP),
   firstMomentumResidual:firstResidual,firstProjectionResidual,
   firstContact,contactSteps,maxCOM:rnd(maxCOM),
   energyBefore:rnd(subStart.ke),energyAfter:rnd(subEnd.ke),
   actuatorCost:rnd(w.trace().panelImpulse),
   rootMotor:w.trace().rootEffort,
   exactDamping:subjects.map(x=>({id:x.id,linear:x.body.linearDamping(),
    angular:x.body.angularDamping()})),
   samples:sampled};
 }finally{w.dispose();}
}
export function p12bAudit(){
 const rows=[];
 for(const iterations of [4,12,24])
  for(const ccd of [true,false])
   for(const backing of ["absent","movable"])
    rows.push(run({iterations,ccd,backing}));
 if(rows.length!==12||rows.some(r=>r.rootMotor!==0||r.steps!==300||
   !Number.isFinite(r.aggregateCOMDelta)))
  throw Error("P12b numerical integrity cases incomplete");
 const contrast=rows.map(r=>({
  iter:r.iterations,ccd:r.ccd,backer:r.backing,
  bodyCOM:r.aggregateCOMDelta,worldCOM:r.wholeWorldCOMDelta,
  aggregateP:r.aggregateMomentumResidual,allP:r.allWorldMomentumResidual,
  contact:r.contactSteps,firstHit:r.firstContact,
  firstP:r.firstMomentumResidual,firstProj:r.firstProjectionResidual,
  peakP:r.peakCombinedP,damping:r.exactDamping
 }));
 return {worlds:rows.length,results:rows,contrast,
  interpretation:"Actual no-virtual-terrain shared-world solver. CCD 4/12/24 iteration cross-check distinguishes velocity momentum vs COM position residual. Nonzero COM/velocity is recorded as a numerical/physics-model caveat, not physical energy-conserving locomotion. Actuator is equal/opposite torque but joint/contact correction may not conserve tracked linear momentum."};
}
