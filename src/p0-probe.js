// P0 truthful source probes. No success scripted into main world.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {MaterialYard,V} from "./p0-world.js";
const round=x=>Math.round(x*10000)/10000;
const diff=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function shape(p){return p.shape.r?new RAPIER.Ball(p.shape.r):
 new RAPIER.Cuboid(p.shape.hx,p.shape.hy);}
function intersects(a,b){
 let n=0;
 for(const x of a.shapes)for(const y of b.shapes){
   if(shape(x).intersectsShape(x.collider.translation(),x.collider.rotation(),
      shape(y),y.collider.translation(),y.collider.rotation()))n++;
 }
 return n;
}
function initialPairs(f){
 const relevant=[...f.actors,...f.loads,f.gate];
 const pairs=[];
 for(let i=0;i<relevant.length;i++)for(let j=i+1;j<relevant.length;j++){
  const n=intersects(relevant[i],relevant[j]);
  if(n)pairs.push({a:relevant[i].kind+"/"+relevant[i].id,
    b:relevant[j].kind+"/"+relevant[j].id,n});
 }
 return pairs;
}
function testAnatomy(support,stance,target,kind="lever"){
 const f=new MaterialYard({populated:false,support});
 try{
  const actor=f.spawn(kind,V(13,11.3));
  f.selected=actor.id;f.setStance(actor.id,stance);
  const initial=actor.body.translation(),angle=actor.body.rotation();
  if(kind==="lever")f.setPanelAngle(actor.id,target);
  const starts=initialPairs(f);
  for(let i=0;i<165;i++)f.step();
  const t=f.traces();
  return {support,stance,target,kind,initialPairs:starts,
   rootYaw:round(actor.body.rotation()-angle),
   rootTravel:round(diff(initial,actor.body.translation())),
   relativePanel:t.selected.panelAngle,
   gateAngle:t.gateAngle,effort:t.events,
   finite:t.finite};
 }finally{f.dispose();}
}
function testGate(withPulse,support){
 const f=new MaterialYard({populated:true,support});
 try{
  const initial=f.traces(),starts=initialPairs(f);
  const gateInitial={...f.gate.body.translation()},origin=f.gate.body.rotation();
  if(withPulse)f.impulseAt(V(20,10.8),V(140,0),125);
  for(let i=0;i<210;i++)f.step();
  const t=f.traces();
  return {withPulse,support,initialPairs:starts,
   initialAngle:initial.gateAngle,afterAngle:t.gateAngle,
   angleDelta:round(f.gate.body.rotation()-origin),
   gateCenterMove:round(diff(gateInitial,f.gate.body.translation())),
   loadMoves:t.loads.map((x,i)=>round(diff(
       f.loads[i].initial,V(x.x,x.y)))),
   selected:t.selected,events:t.events,finite:t.finite};
 }finally{f.dispose();}
}
function testIntervention(kind,support){
 const f=new MaterialYard({populated:true,support});
 try{
  const actor=f.spawn(kind,V(13.3,10.7));
  f.setSelected(actor.id);
  // Operator-issued movement is explicitly finite artificial root drive,
  // with no autonomous actor and no direct force applied to the gate.
  for(let i=0;i<280;i++)f.step(V(1,0));
  const t=f.traces();
  return {kind,support,gateAngle:t.gateAngle,gateContacts:t.events.gateContacts,
   gateImpulse:t.events.gateImpulse,operatorRootEffort:t.events.rootEffort,
   body:t.selected,finite:t.finite};
 }finally{f.dispose();}
}
export function p0Probe(){
 const anatomy=[];
 for(const mode of ["none","finite","damping"])
  for(const stance of ["flow","brace"])
   for(const target of [-1.1,0,1.1])
    anatomy.push(testAnatomy(mode,stance,target));
 const gates=[];
 for(const support of ["none","finite","damping"])
  for(const pulse of [false,true])gates.push(testGate(pulse,support));
 const interventions=[];
 for(const support of ["none","finite"])
  for(const kind of ["small","bulky","lever","rigid-lever"])
   interventions.push(testIntervention(kind,support));
 const all=[...anatomy,...gates,...interventions];
 if(all.length!==32||all.some(x=>!x.finite||x.initialPairs?.length))
  throw Error("P0 invalid initial world, nonfinite solver, or count");
 if(anatomy.some(x=>x.support==="none"&&(x.effort.terrainLinearImpulse||
     x.effort.terrainAngularImpulse))||
    anatomy.some(x=>x.support==="finite"&&x.stance==="brace"&&
     x.effort.terrainAngularImpulse===0&&x.target!==0))
   throw Error("P0 terrain source attribution");
 for(const mode of ["none","finite","damping"]){
  const zero=anatomy.find(x=>x.support===mode&&x.stance==="brace"&&x.target===0);
  if(Math.abs(zero.rootYaw)>1e-3)
   throw Error("P0 no-actuation null unexpectedly rotates body");
 }
 return {source:"actual browser emitted deterministic Rapier2D 0.21 fixed-step",
   warning:"32 valid test runs prove only solver/source null; they do NOT qualify world-level gameplay, stance advantage or different body affordances",
   samples:32,anatomy,gates,interventions};
}
