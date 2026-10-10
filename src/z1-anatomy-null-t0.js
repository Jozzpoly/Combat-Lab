// T0 adversarial question: does Z1's second-body contact require articulated anatomy,
// or can a simple rigid body produce the same operator-driven later intervention?
// Diagnostic only: root drive is an external top-down support proxy; not locomotion.
// Prespecified positions (3 original + 2 cross-axis), no coordinate optimization.
import {V} from "./x0-world.js";
const positions=[
  {x:17.1,y:11.1},{x:18.0,y:11.1},{x:18.9,y:11.1},
  {x:18.0,y:10.2},{x:18.0,y:12.0}
];
const variants=["jointed","rigid-root","rigid-envelope"];
const rd=n=>+n.toFixed(4);
function trial(World,pos,variant,firstMoves,secondMoves,passiveSecond=false){
 const w=new World();
 try{
  const firstId=w.actors[0].id,secondId=w.actors[3].id;
  const object=w.matter.find(m=>m.kind==="free");
  if(!object)throw Error("Z1 expected free matter absent");
  w.pose(secondId,V(pos.x,pos.y),Math.PI);
  w.select(firstId);
  for(let i=0;i<180;i++)w.step({manual:{move:firstMoves?V(1,0):V(),aim:null}});
  w.select(null);
  for(let i=0;i<40;i++)w.step();
  const before=object.body.translation();
  const stage1=V(before.x,before.y),clock=w.ticks;
  // The morphology change happens only AFTER stage 1. Thus the first-body
  // material afterstate is the same for all morphology variants.
  if(variant!=="jointed"){
   const edits=variant==="rigid-root"?{arms:0}:{arms:0,hx:1.8,hy:1.4};
   if(!w.rebuildActor(secondId,edits))throw Error("Re-rig failed");
   // Original reach mass: 80 root + 2*(14.4 shaft + 2.1 tip) = 113kg.
   // Root motor and speed stay at original reach values. Rigid-envelope has
   // larger occupied AREA: it is a generous rival, not a geometrical twin.
   w.setSpec(secondId,"mass",113);
  }
  const afterEdit=object.body.translation();
  if(w.ticks!==clock||Math.hypot(before.x-afterEdit.x,before.y-afterEdit.y)>1e-8)
   throw Error("Morphology edit altered unrelated matter/clock before stepping");
  w.select(secondId);
  // Root-input IDLE in the original Z1 still keeps joint servos active.
  // Here an additional truly unpowered second-body control is explicit.
  if(passiveSecond){
   w.setSpec(secondId,"motor",0);
   w.setSpec(secondId,"torque",0);
   w.setSpec(secondId,"brace",0);
   w.actor(secondId).control="quiet";
  }
  const second=w.actor(secondId);
  let contactSteps=0,contactImpulse=0,firstTouch=null;
  let firstStepImpulse=0;
  const secondStart=second.root.translation();
  for(let i=0;i<120;i++){
   w.step({manual:{move:secondMoves?V(-1,0):V(),aim:null}});
   let force=0;
   for(const p of second.parts)w.world.contactPair(p.collider,object.collider,m=>{
    for(let j=0;j<m.numSolverContacts();j++)force+=Math.abs(m.contactImpulse(j));
   });
   if(i===0)firstStepImpulse=force;
   if(force>0){contactSteps++;contactImpulse+=force;if(firstTouch===null)firstTouch=i;}
  }
  const end=object.body.translation(),r=second.root.translation();
  if(w.holdEvents||w.counts.driveTicks)throw Error("Z1 no-hold/world-power invariant violated");
  return {firstMoves,secondMoves,passiveSecond,variant,stage1X:rd(stage1.x),stage1Y:rd(stage1.y),
   contactSteps,contactImpulse:rd(contactImpulse),firstTouch,
   firstStepImpulse:rd(firstStepImpulse),
   afterObjectDX:rd(end.x-stage1.x),afterObjectDY:rd(end.y-stage1.y),
   afterSecondDX:rd(r.x-secondStart.x),
   // Editor created a different geometry; don't interpret contact on its own as autonomy.
   stage2Arms:second.arms.length};
 }finally{w.dispose();}
}
export function anatomyNullT0(World){
 const cases=[];
 for(const pos of positions){
  const variantsData=[];
  for(const variant of variants){
   const changedMove=trial(World,pos,variant,true,true);
   const changedIdle=trial(World,pos,variant,true,false);
   const unchangedMove=trial(World,pos,variant,false,true);
   const unchangedIdle=trial(World,pos,variant,false,false);
   const changedPassive=trial(World,pos,variant,true,false,true);
   const unchangedPassive=trial(World,pos,variant,false,false,true);
   const extraChanged=rd(changedMove.afterObjectDX-changedIdle.afterObjectDX);
   const extraUnchanged=rd(unchangedMove.afterObjectDX-unchangedIdle.afterObjectDX);
   variantsData.push({variant,
    stage1X:changedMove.stage1X,unchangedStage1X:unchangedMove.stage1X,
    contactsChanged:changedMove.contactSteps,contactsUnchanged:unchangedMove.contactSteps,
    contactsChangedIdle:changedIdle.contactSteps,
    contactsChangedPassive:changedPassive.contactSteps,
    contactsUnchangedPassive:unchangedPassive.contactSteps,
    servoVsPassiveAfterDX:rd(changedIdle.afterObjectDX-changedPassive.afterObjectDX),
    firstStepImpulse:changedMove.firstStepImpulse,
    extraChanged,extraUnchanged,
    narrowOpportunity:changedMove.contactSteps>0&&unchangedMove.contactSteps===0&&Math.abs(extraChanged)>.1});
  }
  // Same first-stage input and original morphology until the phase boundary.
  if(variantsData.some(v=>v.stage1X!==variantsData[0].stage1X||
    v.unchangedStage1X!==variantsData[0].unchangedStage1X))
   throw Error("Stage-one world changed between anatomical variants");
  cases.push({pos,variants:variantsData});
 }
 return {scope:"5 prespecified positions, 3 morphology variants, 2 first inputs x 2 second root commands + motor/torque/brace-OFF additional passive baselines. Identical Z1 source scene and 340 ticks/trial; phase-2 same-solver re-rig, stage-1 state held equal within morph comparison. No hold, no world power.",
  comparison:"Jointed vs arm-free mass-matched original root vs arm-free generously large envelope. The large rigid body is NOT a mass-distribution/contact-shape twin and may have immediate passive overlap.",
  cases,
  warning:"A material-contact opportunity under researcher motor commands is not organism cognition, a new body action, supported stance, natural locomotion, a fair calibrated morphology ranking or Owner product PASS."};
}
