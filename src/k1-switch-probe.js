// K1 temporal posture experiment. All physics remains in ONE solver per
// comparison; no edit/reset/teleport after challenger starts moving.
import {V} from "./x0-world.js";
const rnd=n=>+n.toFixed(4);
const wrap=n=>Math.atan2(Math.sin(n),Math.cos(n));
function run(World,{offset,posture,actuator=true}){
 const w=new World({empty:true});try{
  for(const [x,y,hx,hy] of [[16.5,8.8,12,.25],[16.5,17.2,12,.25]])
   w.addWall(V(x,y),{hx,hy,created:false});
  const rigid=posture==="rigid";
  const guard=w.addActor("reach",V(17,13),Math.PI,{
   mass:rigid?180:130,hx:rigid?2.55:.62,hy:rigid?.88:.60,
   motor:0,brace:2600,torque:650,arms:rigid?0:2,armLength:2.4});
  guard.control="sense";guard.armReflexEnabled=false;
  guard.target=[1,1];
  const challenger=w.addActor("bulk",V(9.5,13+offset),0,{
   mass:96,motor:1450,speed:2.2,hx:.62,hy:.45,brace:0});
  const load=w.addMatter(V(20.7,13),{mass:45,hx:.42,hy:.38,created:false});
  // First give the physical real limb motors time to attain the same open
  // reference before changing only later active control authority.
  w.select(null);
  for(let t=0;t<85;t++)w.step();
  const firstAngles=guard.arms.map(a=>wrap(a.body.rotation()-guard.root.rotation()));
  if(posture==="folded"||posture==="zero-torque"){
    guard.target=[0,0];
    if(posture==="zero-torque")w.setSpec(guard.id,"torque",0);
  }
  for(let t=0;t<95;t++)w.step();
  const secondAngles=guard.arms.map(a=>wrap(a.body.rotation()-guard.root.rotation()));
  const meaningfulAngleMovement=Math.max(0,...firstAngles.map((a,i)=>Math.abs(wrap(secondAngles[i]-a))));
  const initial=challenger.root.translation(),initialLoad=load.body.translation();
  w.select(challenger.id);
  let guardContacts=0,firstContact=null,totalImpulse=0,armOnly=0;
  for(let t=0;t<270;t++){
   w.step({manual:{move:V(1,0),aim:null}});
   let sum=0,limbs=0;
   for(const part of guard.parts)for(const other of challenger.parts)
    w.world.contactPair(part.collider,other.collider,m=>{
     for(let i=0;i<m.numSolverContacts();i++){
      const val=Math.abs(m.contactImpulse(i));sum+=val;
      if(part.tag.startsWith("arm")||part.tag.startsWith("tip"))limbs+=val;
     }
    });
   if(sum>0){guardContacts++;totalImpulse+=sum;if(firstContact===null)firstContact=t;}
   if(limbs>0)armOnly++;
  }
  const at=challenger.root.translation(),postLoad=load.body.translation();
  if(w.holdEvents!==0||w.counts.driveTicks!==0)
   throw Error("K1 scenario acquired forbidden external material actuator");
  return {offset,posture,actuator,firstAngles:firstAngles.map(rnd),
   secondAngles:secondAngles.map(rnd),limbReposition:rnd(meaningfulAngleMovement),
   contactSteps:guardContacts,armContactSteps:armOnly,
   totalImpulse:rnd(totalImpulse),firstContact,
   challengerEndX:rnd(at.x),challengerTravelX:rnd(at.x-initial.x),
   loadMoveX:rnd(postLoad.x-initialLoad.x),rootGuardX:rnd(guard.root.translation().x)};
 }finally{w.dispose();}
}
export function switchedPosturePressure(World){
 const samples=[-.9,-.45,0,.45,.9].map(offset=>{
  const open=run(World,{offset,posture:"open"});
  const folded=run(World,{offset,posture:"folded"});
  const zeroTorque=run(World,{offset,posture:"zero-torque",actuator:false});
  const rigid=run(World,{offset,posture:"rigid"});
  return {offset,open,folded,zeroTorque,rigid,
   foldVsOpen:rnd(folded.challengerEndX-open.challengerEndX),
   foldVsNoTorque:rnd(folded.challengerEndX-zeroTorque.challengerEndX),
   foldedVsRigid:rnd(folded.challengerEndX-rigid.challengerEndX)};
 });
 return {scope:"one actual continuous physical world per sample; guardian physically settles OPEN then operator changes limb target to FOLDED, or leaves OPEN, or commands FOLDED with zero torque, against mass/envelope-matched rigid surrogate. Same second body later drives forward, no hold, no world energy, five prespecified offsets.",
   samples,changedByActuatedPosture:samples.filter(s=>Math.abs(s.foldVsNoTorque)>.25).length,
   limitation:"Timed operator intervention with finite joint effort, not autonomously selected defensive posture or grounded support. Rigid baseline is approximate."};
}
