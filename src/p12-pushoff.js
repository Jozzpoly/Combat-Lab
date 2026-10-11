// P12 bounded real contact-driven push-off candidate. Origin: P10b
// material workshop. No external translational drive in articulated worlds.
// This is NOT foot contact or self-sustained gait. Two-body COM must be
// measured to distinguish limb rearrangement from world reaction.
import {makeMaterialWorkshop} from "./p10-workshop.js";
import {V} from "./p0-world.js";
const rd=x=>Math.round(x*1e5)/1e5;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pos=e=>{const q=e.body.translation();return V(q.x,q.y);};
const vals=e=>{const q=e.body.translation(),v=e.body.linvel();
 return [q.x,q.y,v.x,v.y,e.body.rotation(),e.body.angvel()].every(Number.isFinite)};
function com(list){
 let sx=0,sy=0,m=0;
 for(const e of list){
  const w=e.body.mass(),q=e.body.translation();
  sx+=w*q.x;sy+=w*q.y;m+=w;
 }
 if(!m||!Number.isFinite(m))throw Error("P12 center mass");
 return V(sx/m,sy/m);
}
function touch(a,b,w){
 let n=0,j=0;
 for(const x of a.shapes)for(const y of b.shapes)
  w.world.contactPair(x.collider,y.collider,man=>{
   for(let k=0;k<man.numSolverContacts();k++){
    n++;j+=Math.abs(man.contactImpulse(k)||0);
   }
  });
 return {n,j};
}
export function makeP12World({backing="fixed",support="none",kind="lever"}={}){
 if(!["absent","fixed","movable"].includes(backing)||
  !["none","finite"].includes(support)||!["lever","rigid-lever"].includes(kind))
  throw Error("P12 invalid configuration");
 const w=makeMaterialWorkshop({fixture:kind==="lever"?"hinge":"rigid-tool",support});
 try{
  if(!w.moveEntity(w.tool,V(12,12)))throw Error("P12 relocated active body");
  w.setSelected(w.tool.id);
  // True real collider under the swept panel. Initially not overlapping.
  w.backer=backing==="fixed"?w.barrier(13.65,13.20,1.90,.22):
   backing==="movable"?w.load(13.65,13.20,1.90,.22,90):null;
  w.world.propagateModifiedBodyPositionsToColliders();
  return w;
 }catch(e){w.dispose();throw e;}
}
export function p12Case({backing="fixed",support="none",
 kind="lever",drive="sweep",ticks=300}={}){
 if(!["sweep","off","cycle","cheap-root"].includes(drive))
  throw Error("P12 invalid input");
 const w=makeP12World({backing,support,kind});
 try{
  const root=w.tool,panel=root.panel,bodyParts=panel?[root,panel]:[root];
  const backingBody=w.backer;
  const initial={com:com(bodyParts),root:pos(root),
   panel:panel?pos(panel):null,backer:backingBody?pos(backingBody):null,
   bodyMass:rd(bodyParts.reduce((s,e)=>s+e.body.mass(),0)),
   rootMass:rd(root.body.mass()),panelMass:panel?rd(panel.body.mass()):0};
  const systemParts=backingBody&&!backingBody.body.isFixed()?
   [...bodyParts,backingBody]:bodyParts;
  const systemStart=com(systemParts);
  if(drive==="sweep"||drive==="cycle"){
   if(!panel||!w.setPanelAngle(root.id,1.2))throw Error("P12 no physical hinged limb");
  }
  let materialContactSteps=0,materialNormalImpulse=0,firstHit=null;
  let rootContactSteps=0;
  let maxCOM=0,peakRoot=0,backingTravel=0;
  const frames=[];
  for(let step=0;step<ticks;step++){
   if(drive==="cycle"&&step===90)w.setPanelAngle(root.id,0);
   if(drive==="cycle"&&step===180)w.setPanelAngle(root.id,1.2);
   const move=drive==="cheap-root"?V(0,1):V();
   w.step(move);
   if(backingBody){
    for(const part of bodyParts){
     const hit=touch(part,backingBody,w);
     if(hit.n>0){
      materialContactSteps++;
      materialNormalImpulse+=hit.j;
      if(firstHit===null)firstHit=w.ticks;
     }
    }
    if(touch(root,backingBody,w).n>0)rootContactSteps++;
    backingTravel=Math.max(backingTravel,dist(pos(backingBody),initial.backer));
   }
   const current=com(bodyParts);
   maxCOM=Math.max(maxCOM,dist(current,initial.com));
   peakRoot=Math.max(peakRoot,dist(pos(root),initial.root));
   if([0,24,59,89,119,179,239,ticks-1].includes(step))
    frames.push({t:w.ticks,root:pos(root),panel:panel?pos(panel):null,
     com:current,system:com(systemParts),backer:backingBody?pos(backingBody):null,
     angle:root.body.rotation()});
  }
  const now=com(bodyParts),sys=com(systemParts),tr=w.trace();
  if(![...bodyParts,...(backingBody?[backingBody]:[])].every(vals)||
     !tr.finite)throw Error("P12 numerical physical invalid");
  return {backing,support,kind,drive,ticks,initial,
   comEnd:now,comDX:rd(now.x-initial.com.x),comDY:rd(now.y-initial.com.y),
   comDelta:rd(dist(now,initial.com)),
   systemCOMDelta:rd(dist(sys,systemStart)),
   rootDelta:rd(dist(pos(root),initial.root)),
   rootEnd:pos(root),rootYaw:rd(root.body.rotation()),
   backerDelta:backingBody?rd(dist(pos(backingBody),initial.backer)):null,
   maxCOM:rd(maxCOM),maxRoot:rd(peakRoot),maxBacker:rd(backingTravel),
   contactSteps:materialContactSteps,rootContactSteps,
   sourceContactImpulse:rd(materialNormalImpulse),firstHit,
   rootEffort:tr.rootEffort,hingeEffort:tr.panelImpulse,
   groundEffort:tr.terrainImpulse,finite:true,frames,
   note:"Body COM of root+panel; when backer is movable also evaluate aggregate COM. Fixed wall external momentum source; no feet or living gait."};
 }finally{w.dispose();}
}
export function p12Audit(){
 const cases=[];
 for(const support of ["none","finite"])
  for(const backing of ["absent","fixed","movable"])
   for(const drive of ["off","sweep","cycle"])
    cases.push(p12Case({support,backing,drive}));
 for(const backing of ["absent","fixed","movable"])
  cases.push(p12Case({support:"none",backing,kind:"rigid-lever",drive:"cheap-root"}));
 if(cases.length!==21||cases.some(x=>!x.finite||x.ticks!==300))
  throw Error("P12 21 true solver worlds invalid");
 for(const support of ["none","finite"])
  for(const backing of ["absent","fixed","movable"]){
   const group=cases.filter(x=>x.support===support&&x.backing===backing&&x.kind==="lever");
   if(group.length!==3||group.some(x=>JSON.stringify(x.initial)!==JSON.stringify(group[0].initial)))
    throw Error("P12 paired source prestates differ");
   if(group[0].drive!=="off"||group[0].hingeEffort!==0)
    throw Error("P12 zero motor null actually enabled");
   if(group.slice(1).some(x=>x.rootEffort!==0))
    throw Error("P12 inadvertent external root drive on articulated model");
  }
 return {worlds:21,source:"actual emitted Chromium Rapier2D 0.21, internal equal/opposite actuator",cases,
  summary:cases.map(x=>({support:x.support,backing:x.backing,kind:x.kind,
   drive:x.drive,bodyCOM:x.comDelta,bodyCOMY:x.comDY,systemCOM:x.systemCOMDelta,
   hit:x.contactSteps,impulse:x.sourceContactImpulse,hinge:x.hingeEffort,
   root:x.rootEffort,rootTravel:x.rootDelta,backerTravel:x.backerDelta})),
  limits:"A body propelling off a physical barrier is not walking. Virtual finite terrain itself transfers external momentum; only no-support and isolated-body vs combined movable-body COM can identify source. Null and cheap direct-root force controls cannot prove gameplay feel."};
}
