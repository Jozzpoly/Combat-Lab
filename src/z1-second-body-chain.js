// Z1 causal second-body contact chain: another explicitly piloted physical
// body acts later in the SAME solver, after body 1 displaced matter.
// All material forces are solver-active contacts, no adhesive hold or NPC goal.
// Opportunity claims compare stage-2 MOVING vs IDLE in each stage-1 world.
import {V} from "./x0-world.js";
const round=n=>+n.toFixed(4);
const positions=[17.1,18,18.9];
function trial(World,{x,firstMoves,secondMoves}){
 const w=new World();
 try{
  const first=w.actors[0],second=w.actors[3],object=w.matter.find(m=>m.kind==="free");
  if(!object)throw Error("Z1 source load missing");
  w.pose(second.id,V(x,11.1),Math.PI);
  w.select(first.id);
  let firstContacts=0,firstImpulse=0,secondPhaseContacts=0,secondPhaseImpulse=0;
  const measure=(actor)=>{
   let amount=0;
   for(const part of actor.parts)w.world.contactPair(part.collider,object.collider,m=>{
     for(let i=0;i<m.numSolverContacts();i++)
       amount+=Math.abs(m.contactImpulse(i));
   });
   return amount;
  };
  for(let t=0;t<180;t++){
   w.step({manual:{move:firstMoves?V(1,0):V(),aim:null}});
   const force=measure(first);if(force>0){firstContacts++;firstImpulse+=force;}
  }
  w.select(null);
  // allow remaining physical momentum to decay naturally. Both second
  // phase comparisons inherit exactly the same first-stage state.
  for(let t=0;t<40;t++)w.step();
  const before=object.body.translation(),initial=V(before.x,before.y);
  const ownPosition=second.root.translation(),start=V(ownPosition.x,ownPosition.y);
  const presolverGap=Math.hypot(before.x-ownPosition.x,before.y-ownPosition.y);
  w.select(second.id);
  for(let t=0;t<120;t++){
   w.step({manual:{move:secondMoves?V(-1,0):V(),aim:null}});
   const force=measure(second);
   if(force>0){secondPhaseContacts++;secondPhaseImpulse+=force;}
  }
  const p=object.body.translation(),a=second.root.translation();
  return {firstMoves,secondMoves,x,sourceContacts:firstContacts,sourceImpulse:round(firstImpulse),
   atSecondStartX:round(initial.x),atSecondStartY:round(initial.y),
   preSecondCenterGap:round(presolverGap),
   laterContactSteps:secondPhaseContacts,laterContactImpulse:round(secondPhaseImpulse),
   afterObjectDX:round(p.x-initial.x),afterObjectDY:round(p.y-initial.y),
   afterSecondDX:round(a.x-start.x),afterSecondDY:round(a.y-start.y),
   materialHold:w.holdEvents,worldPoweredSteps:w.counts.driveTicks};
 }finally{w.dispose();}
}
export function contactOnlySecondBodyContinuation(World){
 const cases=positions.map(x=>{
   const changedMoved=trial(World,{x,firstMoves:true,secondMoves:true});
   const changedIdle=trial(World,{x,firstMoves:true,secondMoves:false});
   const unchangedMoved=trial(World,{x,firstMoves:false,secondMoves:true});
   const unchangedIdle=trial(World,{x,firstMoves:false,secondMoves:false});
   const pair=(a,b)=>round(a.afterObjectDX-b.afterObjectDX);
   return {x,changedMoved,changedIdle,unchangedMoved,unchangedIdle,
    secondActionExtraChanged:pair(changedMoved,changedIdle),
    secondActionExtraUnchanged:pair(unchangedMoved,unchangedIdle),
    newContactSteps:changedMoved.laterContactSteps-unchangedMoved.laterContactSteps};
 });
 if(cases.some(c=>[c.changedMoved,c.changedIdle,c.unchangedMoved,c.unchangedIdle]
   .some(k=>k.materialHold!==0||k.worldPoweredSteps!==0)))throw Error("Z1 attribution violated");
 return {scope:"3 predeclared second-body positions in one Z1 world; stage1 body1 manual push or idle, physical settle, then stage2 body4 manual reverse push or idle; zero grip and zero world motor",
  cases,warning:"Actor movement afterstage is not an autonomous choice. Operator action difference must exceed own idle control."};
}
