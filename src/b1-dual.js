// B1 dual-purpose affordance falsifier: can the SAME physical moving
// envelope first negotiate narrow space, then affect lateral matter?
// No actor goal: forward effort and fold/unfold timings are authored laboratory
// inputs, never NPC understanding of obstacles.
import {EnvelopeField} from "./b1-world.js";
const round=x=>Math.round(x*1e4)/1e4;
const plan=[
 {name:"fold-then-deploy",kind:"folding",hingeMount:"front",torqueCap:3,mode:"fold-then-open",withGate:true},
 {name:"stay-folded",kind:"folding",hingeMount:"front",torqueCap:3,mode:"fold",withGate:true},
 {name:"rigid-small",kind:"rigid-small",mode:"none",withGate:true},
 {name:"rigid-wide-no-gate",kind:"rigid-wide",mode:"none",withGate:false}
];
function trial(config){
 const {name,mode,...params}=config,w=new EnvelopeField({...params,withMatter:false});
 const side=[w.addFree(30.5,11.95,.42,.32,40),w.addFree(30.5,15.05,.42,.32,40)];
 const initial=side.map(b=>({...b.translation()}));
 try{
  let contactSteps=0,passage=null,allBeyond=null,angleAtEntry=null;
  const stages=[];
  for(let tick=0;tick<=780;tick++){
   if(tick>0){
    const fold=mode==="fold"?tick>=100?1:0:
      mode==="fold-then-open"?tick>=500?0:tick>=100?1:0:0;
    w.step({forward:1,fold});
    for(const s of side)for(const p of w.actor.parts){
     w.world.contactPair(s.collider?.()??w.objects.find(o=>o.body===s)?.collider,p.collider,m=>{
      for(let k=0;k<m.numSolverContacts();k++)
       if(Math.abs(m.contactImpulse(k))>1e-5)contactSteps++;
     });
    }
   }
   const state=w.output();
   if(passage===null&&state.chassis.x>24.6)passage=tick;
   if(allBeyond===null&&state.physicalExtent.minX>23.5)allBeyond=tick;
   if(angleAtEntry===null&&state.chassis.x>19.5)
    angleAtEntry=state.parts.slice(1).map(p=>round(p.rotation-state.chassis.rotation));
   if([0,180,360,480,580,680,780].includes(tick)){
    const xs=side.map((b,i)=>round(b.translation().x-initial[i].x));
    const ys=side.map((b,i)=>round(b.translation().y-initial[i].y));
    stages.push({tick,rootX:state.chassis.x,rootY:state.chassis.y,
      width:round(state.physicalExtent.maxY-state.physicalExtent.minY),
      sideX:xs,sideY:ys,physicalGateContacts:state.gateContacts,
      hingeEffort:state.hingeTorqueImpulse});
   }
  }
  const fin=w.output();
  return {name,mode,actor:w.kind,totalMass:125,torque:w.torqueCap,
   crossedRoot:passage!==null,firstRootExit:passage,
   fullBodyBeyond:allBeyond!==null,firstFullExit:allBeyond,
   contactStepsWithLateralMatter:contactSteps,
   props:side.map((b,i)=>{
    const p=b.translation();return {dx:round(p.x-initial[i].x),
      dy:round(p.y-initial[i].y)};
   }),hingeAngleAtEntry:angleAtEntry,final:fin,stages};
 }finally{w.dispose();}
}
export function dualB1(){return {scope:"Four equivalent true Rapier 2D physical experiments; 780 steps, identical 125kg root-traction force cap. All three gate-world specimens start at x=10; no teleport. Fold-then-deploy is externally scheduled at fixed solver tick 500, after physical gate passage, while alternative stays folded; later lateral material objects are genuine dynamic 40kg bodies and receive only contact forces. Narrow rigid rival and wide ungated baseline remain.",
 scenarios:plan.map(trial),limitations:"Different outer shape, inertia, joint energy and artifact contact geometry. This cannot prove optimal locomotion or creature intelligence, only contingent change of physical affordances under the same external command."};}
