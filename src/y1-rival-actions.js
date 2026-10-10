// Bounded post-hoc rival actions; no Owner feel or all-geometry inference.
import {V} from "./x0-world.js";
const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
function run(World,{power=true,bodyIndex,targetId,deltaY=0,hold=true,move=true}){
 const w=new World();
 try{
   const actor=w.actors[bodyIndex],target=w.matter.find(m=>m.id===targetId);
   if(!target)throw Error("Missing physical target");
   if(deltaY!==0){
     const p=actor.root.translation();
     w.pose(actor.id,V(p.x,p.y+deltaY));
   }
   if(!power)for(const m of w.matter)if(m.kind==="hinge")
     w.setHingeDrive(m.id,0,0);
   w.select(null);
   for(let t=0;t<360;t++)w.step();
   for(const m of w.matter)if(m.kind==="hinge")
     w.setHingeDrive(m.id,0,0);
   w.select(actor.id);
   const before=target.body.translation(),position=V(before.x,before.y),
     angle=target.body.rotation();
   const eligible=w.beginHold(position);
   if(!hold)w.endHold();
   const startRoot=actor.root.translation(),initialRoot=V(startRoot.x,startRoot.y);
   let delivered=0;
   for(let t=0;t<100;t++){
     w.step({manual:{move:move?V(-1,0):V(),aim:null}});
     if(w.hold)delivered+=w.hold.deliveredImpulse||0;
   }
   const after=target.body.translation(),currentRoot=w.actor(actor.id).root.translation();
   return {eligible,actuallyHeld:eligible&&hold,remainingHold:Boolean(w.hold),
     targetX:+(after.x-position.x).toFixed(4),
     targetY:+(after.y-position.y).toFixed(4),
     targetAngle:+angleDelta(target.body.rotation(),angle).toFixed(4),
     rootX:+(currentRoot.x-initialRoot.x).toFixed(4),
     holdImpulse:+delivered.toFixed(4),slipped:w.holdBreaks};
 }finally{w.dispose();}
}
export function testRelationalRivals(World){
 const offsets=[-.25,0,.25];
 const free=offsets.map(deltaY=>{
   const common={bodyIndex:2,targetId:"matter-16",deltaY};
   const held=run(World,{...common,hold:true,move:true});
   const unheld=run(World,{...common,hold:false,move:true});
   const idle=run(World,{...common,hold:true,move:false});
   const unheldIdle=run(World,{...common,hold:false,move:false});
   const passive=run(World,{...common,power:false,hold:true,move:true});
   return {deltaY,held,unheld,idle,unheldIdle,passive,
     noGripActorActionX:+(unheld.targetX-unheldIdle.targetX).toFixed(4),
     gripIncrementX:+(held.targetX-unheld.targetX).toFixed(4),
     motionIncrementX:+(held.targetX-idle.targetX).toFixed(4)};
 });
 const hingeCommon={bodyIndex:1,targetId:"hinge-23"};
 const hinge={
   held:run(World,{...hingeCommon,hold:true,move:true}),
   unheld:run(World,{...hingeCommon,hold:false,move:true}),
   idle:run(World,{...hingeCommon,hold:true,move:false}),
   unheldIdle:run(World,{...hingeCommon,hold:false,move:false}),
   passive:run(World,{...hingeCommon,power:false,hold:true,move:true})
 };
 hinge.noGripActorAngle=+
   (hinge.unheld.targetAngle-hinge.unheldIdle.targetAngle).toFixed(4);
 return {scope:"Exploratory Y1 follow-up: 3 predeclared offsets for body-3 free matter; body-2 bulk attempts anchored hinge. 360 physical setup ticks, world power OFF before 100 manual-action ticks. Manual input and idle/no-hold controls.",
   free,hinge,
   limitation:"No-grip mechanical response isolates ordinary physical contact from powered adhesive hold. Actor input is operated by a researcher, not chosen by NPC."};
}
