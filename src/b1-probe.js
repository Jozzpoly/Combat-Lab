import {EnvelopeField} from "./b1-world.js";
const round=n=>+n.toFixed(4);
const SCENES=[
 {name:"hinges-fold-command",kind:"folding",action:"fold"},
 {name:"hinges-deployed",kind:"folding",action:"open"},
 {name:"hinges-no-actuators",kind:"folding",action:"fold",torqueCap:0},
 {name:"cheap-rigid-wide",kind:"rigid-wide",action:"open"},
 {name:"cheap-rigid-small",kind:"rigid-small",action:"fold"},
 {name:"fold-no-yaw-assist",kind:"folding",action:"fold",holdHeading:false},
 {name:"hinges-no-gate",kind:"folding",action:"open",withGate:false},
 {name:"fold-offset-plus",kind:"folding",action:"fold",dy:.12},
 {name:"fold-offset-minus",kind:"folding",action:"fold",dy:-.12},
 {name:"fold-without-gate",kind:"folding",action:"fold",withGate:false},
 {name:"fold-high-torque-no-gate",kind:"folding",action:"fold",withGate:false,torqueCap:3},
 {name:"fold-high-torque-at-gate",kind:"folding",action:"fold",torqueCap:3},
 {name:"fold-no-self-contact",kind:"folding",action:"fold",selfContact:false},
 {name:"deployed-no-self-contact",kind:"folding",action:"open",selfContact:false},
 {name:"fold-no-self-contact-no-gate",kind:"folding",action:"fold",selfContact:false,withGate:false},
 {name:"front-hinge-fold-self-contact",kind:"folding",hingeMount:"front",action:"fold"},
 {name:"front-hinge-deployed-self-contact",kind:"folding",hingeMount:"front",action:"open"},
 {name:"front-hinge-passive-self-contact",kind:"folding",hingeMount:"front",action:"fold",torqueCap:0},
 {name:"front-strong-fold-contact",kind:"folding",hingeMount:"front",action:"fold",torqueCap:3},
 {name:"front-strong-open-contact",kind:"folding",hingeMount:"front",action:"open",torqueCap:3},
 {name:"front-strong-fold-no-gate",kind:"folding",hingeMount:"front",action:"fold",torqueCap:3,withGate:false}
];
function one(config){
 const {name,action,dy=0,...opts}=config;
 const w=new EnvelopeField(opts);
 try{
  if(dy)w.poseActor("specimen",{x:10,y:13.5+dy});
  const before=w.output(),states=[{tick:0,...before}],root=w.actor.root;
  let crossed=null,firstContact=null,maxForce=0,maxWidth=0,nonfinite=0;
  for(let i=1;i<=720;i++){
   const target=action==="fold"&&i>=100?1:0;
   w.step({forward:1,fold:target});
   const out=w.output();
   if(firstContact===null&&out.gateContacts>0)firstContact=i;
   if(crossed===null&&out.chassis.x>24.6)crossed=i;
   maxForce=Math.max(maxForce,w.actor.pressure);
   if(![out.chassis.x,out.chassis.y,out.chassis.vx,out.hingeError].every(Number.isFinite))
    nonfinite++;
   if([90,180,300,480,720].includes(i))states.push({tick:i,...out});
  }
  const after=w.output();
  return {name,kind:w.kind,withGate:w.withGate,holdHeading:w.holdHeading,
   selfContact:w.selfContact,hingeMount:w.hingeMount,contactsEnabled:after.jointContacts,
   source:"operator finite root-traction proxy; reciprocal joint torques if enabled",
   rootDX:after.chassis.dx,rootFinalY:after.chassis.y,
   crossedGate:crossed!==null,firstPassageTick:crossed,
   firstWallTouch:firstContact,wallContactSteps:after.gateContacts,
   movedMatter:after.movedMatter,foldDegrees:round(90*(1-after.foldTarget)),
   hingeTorque:after.hingeTorqueImpulse,headingTorque:after.headingTorqueImpulse,
   outsideRootImpulse:after.operatorImpulse,hingeError:after.hingeError,
   nonfinite,samples:states};
 }finally{w.dispose();}
}
export function b1Trial(part="A"){
 if(!["A","B","C","D","E","F","G"].includes(part))throw RangeError("B1 batch");
 const slices={A:SCENES.slice(0,3),B:SCENES.slice(3,6),C:SCENES.slice(6,9),D:SCENES.slice(9,12),E:SCENES.slice(12,15),F:SCENES.slice(15,18),G:SCENES.slice(18,21)};
 const cases=slices[part].map(one);
 if(cases.some(x=>x.nonfinite||x.samples.length!==6))throw Error("Invalid physical test");
 return {part,scenes:cases,source:"same Rapier2D, same root motor force, one 1.24m *real material tunnel*, no collision resize/teleport; every physical body source tracked. 720 solver steps per scene",caution:"This is not intelligent passage planning or physically grounded gait. Comparing unlike collider distributions or holding heading with external torque does not isolate biomechanical value."};
}
