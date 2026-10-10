// Z1: Prespecified modes of direct force transmission in the same authored
// physical world. NO grip, NO motorized world material, NO autonomous NPC.
import {V} from "./x0-world.js";
const rnd=x=>+x.toFixed(4),wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const conditions=[
 {kind:"free",actorIndex:0,targetKind:"free",targetIndex:0,command:V(1,0)},
 {kind:"hinge",actorIndex:1,targetKind:"hinge",targetIndex:0,command:V(0,1)},
 {kind:"rail",actorIndex:2,targetKind:"rail",targetIndex:0,command:V(1,0)}
];
function run(World,fixture,input=true,{rigid=false}={}){
 const w=new World();
 try {
   const actor=w.actors[fixture.actorIndex];
   const target=w.matter.filter(m=>m.kind===fixture.targetKind)[fixture.targetIndex];
   if(!target)throw Error("Missing target in whole Z1 world");
   if(rigid){ // control: turn arms off on a matched-root shape, not a weak straw man
     w.rebuildActor(actor.id,{arms:0});
   }
   const a=w.actor(actor.id),root=a.root;
   w.select(a.id);
   if(w.beginHold(target.body.translation())||w.hold)
     throw Error("Z1 unexpectedly retained adhesive hold");
   const position=target.body.translation(),angle=target.body.rotation();
   const rootStart=root.translation();
   let contactSteps=0,totalImpulse=0,firstTouch=null,peakImpulse=0;
   for(let t=0;t<180;t++){
     w.step({manual:{move:input?fixture.command:V(),aim:null}});
     let amount=0;
     for(const part of a.parts)w.world.contactPair(part.collider,target.collider,manifold=>{
       for(let k=0;k<manifold.numSolverContacts();k++)
         amount+=Math.abs(manifold.contactImpulse(k));
     });
     if(amount>0){
       contactSteps++;totalImpulse+=amount;
       peakImpulse=Math.max(peakImpulse,amount);
       if(firstTouch===null)firstTouch=t;
     }
   }
   const p=target.body.translation(),ar=root.translation();
   const state={kind:fixture.kind,input,rigid,
     contactSteps,firstTouch,totalImpulse:rnd(totalImpulse),peakImpulse:rnd(peakImpulse),
     dx:rnd(p.x-position.x),dy:rnd(p.y-position.y),
     angleChange:rnd(wrap(target.body.rotation()-angle)),
     actorDX:rnd(ar.x-rootStart.x),actorDY:rnd(ar.y-rootStart.y),
     externalDriveTicks:w.counts.driveTicks,
     materialActuatorUsed:w.holdEvents>0||Boolean(w.hold)};
   if(state.externalDriveTicks!==0||state.materialActuatorUsed)
      throw Error("Contact-only attribution invalidated");
   return state;
 }finally{w.dispose();}
}
export function contactOnlyWholeTest(World){
 const cases=conditions.map(fixture=>{
   const driven=run(World,fixture,true),idle=run(World,fixture,false);
   const zeroForce=runZero(World,fixture);
   return {kind:fixture.kind,driven,idle,zeroForce,
     differenceX:rnd(driven.dx-idle.dx),
     differenceY:rnd(driven.dy-idle.dy),
     differenceAngle:rnd(driven.angleChange-idle.angleChange)};
 });
 return {scope:"one continuous Z1 editable field; separate chosen operator body inputs vs idle/zero-force, zero adhesive body hold, zero authored world power, 180 ticks each",
   cases,
   directContactCases:cases.filter(c=>c.driven.contactSteps>0).length,
   warning:"Neither altered movement nor solver contact is yet proof of Owner value, general action availability or non-scripted cognition"};
}
function runZero(World,fixture){
 const w=new World();try{
   const a=w.actors[fixture.actorIndex],t=w.matter.filter(m=>m.kind===fixture.targetKind)[fixture.targetIndex];
   w.setSpec(a.id,"motor",0);
   w.select(a.id);
   const p=t.body.translation(),rot=t.body.rotation();
   let active=0,imp=0;
   for(let i=0;i<180;i++){
     w.step({manual:{move:fixture.command,aim:null}});
     let force=0;
     for(const part of a.parts)w.world.contactPair(part.collider,t.collider,m=>{
       for(let j=0;j<m.numSolverContacts();j++)force+=Math.abs(m.contactImpulse(j));
     });
     if(force>0){active++;imp+=force;}
   }
   const q=t.body.translation();
   return {dx:rnd(q.x-p.x),dy:rnd(q.y-p.y),angleChange:rnd(wrap(t.body.rotation()-rot)),
     contactSteps:active,totalImpulse:rnd(imp),motor:0};
 }finally{w.dispose();}
}
