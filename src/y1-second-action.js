// FOLLOW-UP generated after inspecting Y1 candidate: explicitly exploratory,
// not pre-registered generalization. Tests operator action vs residual motion.
import {V,norm} from "./x0-world.js";
function caseRun(World, powered, useHold,drive){
 const w=new World();
 try {
   if(!powered)for(const m of w.matter)if(m.kind==="hinge")
     w.setHingeDrive(m.id,0,0);
   w.select(null);
   for(let t=0;t<360;t++)w.step();
   // Disable *all* outside hinge motors for the second stage; later motion
   // should not be falsely attributed to continued external machinery.
   for(const m of w.matter)if(m.kind==="hinge")
     w.setHingeDrive(m.id,0,0);
   const actor=w.actors[2],target=w.matter.find(m=>m.id==="matter-16");
   if(!target)throw Error("Expected unchanged free material in Y1");
   w.select(actor.id);
   const center=target.body.translation(),initial=V(center.x,center.y);
   // Measure the exact same admissibility before each matched action.
   const couldHold=w.beginHold(initial);
   if(!useHold)w.endHold();
   let stillHeld=false;
   const actorStart=w.actor(actor.id).root.translation();
   for(let t=0;t<100;t++){
     w.step({manual:{move:drive?V(-1,0):V(),aim:null}});
     if(w.hold)stillHeld=true;
   }
   const end=target.body.translation(),at=w.actor(actor.id).root.translation();
   return {powered,useHold,drive,couldHold,stillHeld,
     objectTravelX:+(end.x-initial.x).toFixed(4),
     objectTravelY:+(end.y-initial.y).toFixed(4),
     actorTravelX:+(at.x-actorStart.x).toFixed(4),
     actorTravelY:+(at.y-actorStart.y).toFixed(4),
     holdBreaks:w.holdBreaks,remainingHold:Boolean(w.hold),
     stageOneWorldPowerTicks:w.counts.driveTicks};
 }finally{w.dispose();}
}
export function secondActorRealAction(World){
 const powered={
   heldMoving:caseRun(World,true,true,true),
   unheldMoving:caseRun(World,true,false,true),
   heldIdle:caseRun(World,true,true,false),
   unheldIdle:caseRun(World,true,false,false)
 };
 const unpowered={
   attemptedHoldMoving:caseRun(World,false,true,true),
   unheldMoving:caseRun(World,false,false,true),
   unheldIdle:caseRun(World,false,false,false)
 };
 if(!powered.heldMoving.couldHold||unpowered.attemptedHoldMoving.couldHold)
   throw Error("Y1 actor 3 gain/loss action eligibility did not reproduce");
 const effectHeldVsUnheld=powered.heldMoving.objectTravelX-powered.unheldMoving.objectTravelX;
 const effectMoveVsIdle=powered.heldMoving.objectTravelX-powered.heldIdle.objectTravelX;
 return {scope:"post-hoc Y1 actor-3 free-matter action after 360 steps; second-stage same manual left input vs idle and hold/no-hold, powered hinge deliberately OFF at second stage",
   powered,unpowered,
   heldVsUnheldObjectX:+effectHeldVsUnheld.toFixed(4),
   heldMovingVsIdleObjectX:+effectMoveVsIdle.toFixed(4),
   status:"Geometric action eligibility and operator motor are distinct from actor self-chosen behavior"};
}
