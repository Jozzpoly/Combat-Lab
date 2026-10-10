// B1 morphology affordance falsifier. New physical hinged shoulders vs
// two CHEAP fixed-geometry surrogates; all use the SAME root traction proxy.
// No teleport, no invisible collider resize, no NPC path or route assignment.
// This bounded gate test does NOT validate natural muscles or stance.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {M0Field,V,DT} from "./m0-world.js";
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const wrap=n=>Math.atan2(Math.sin(n),Math.cos(n));
const round=n=>Math.round(n*1e4)/1e4;
const len=n=>Math.hypot(n.x,n.y);
const kinds=["folding","rigid-wide","rigid-small"];
export class EnvelopeField extends M0Field{
 constructor({kind="folding",withGate=true,withMatter=true,holdHeading=true,
   stiffness=2.7,torqueCap=.5,drive=860}={}){
  super({empty:true,reflex:false,iterations:16});
  if(!kinds.includes(kind))throw RangeError("kind");
  if(!Number.isFinite(torqueCap)||torqueCap<0||torqueCap>4)throw RangeError("torque");
  this.kind=kind;this.withGate=withGate;this.holdHeading=holdHeading;
  this.stiffness=stiffness;this.torqueCap=torqueCap;this.drive=drive;
  this.foldTarget=1;this.jointImpulseTotal=0;this.hingeError=0;
  this.operatorImpulse=0;this.headingImpulse=0;this.gateContacts=0;
  this.externalBodyContacts=0;
  // The physical world shares a 44x27m arena, but the gate is ONE real
  // 5m-long, 1.24m-high material aperture. No scripted passage sensing.
  if(withGate){
   this.addFixed(21,6.19,2.5,6.69); // upper edge y=12.88
   this.addFixed(21,20.56,2.5,6.44); // lower edge y=14.12 => 1.24m gap
   this.gateWalls=this.objects.slice(-2);
  }else this.gateWalls=[];
  this.wallColliders=this.objects.filter(x=>x.kind==="fixed").map(x=>x.collider);
  this.thing=null;
  if(withMatter){
   this.addFree(28.6,13.3,.52,.40,48);
   this.thing=this.objects[this.objects.length-1];
  }
  const root=this.makeBody(V(10,13.5),0,.7),parts=[],joints=[],wings=[];
  const rootShape={type:"box",hx:kind==="rigid-wide"?.55:
    kind==="rigid-small"?1.07:.51,hy:kind==="rigid-wide"?1.90:
    kind==="rigid-small"?.46:.32};
  const collider=this.makeCollider(root,rootShape,125);
  parts.push({body:root,collider,shape:rootShape});
  if(kind==="folding"){
   collider.setMass(85);
   for(const sign of [-1,1]){
    const shape={type:"box",hx:.80,hy:.12};
    const pose=V(10,13.5+sign*1.13);
    const body=this.makeBody(pose,sign*Math.PI/2,.7);
    const child=this.makeCollider(body,shape,20);
    const joint=this.world.createImpulseJoint(RAPIER.JointData.revolute(
      V(0,sign*.33),V(-.80,0)),root,body,false);
    wings.push({sign,body,collider:child,joint,shape});
    parts.push({body,collider:child,shape});joints.push(joint);
   }
  }
  this.actor={id:"specimen",kind,root,form:{speed:2.15,motor:drive},
   parts,joints,wings,pressure:0,partLoads:parts.map(()=>0),
   reflexUntil:0,responseEvents:0,motorTicks:0,thrustImpulse:0};
  this.actors.push(this.actor);
  this.selected="specimen";
  this.world.propagateModifiedBodyPositionsToColliders();
  this.startX=root.translation().x;
  this.startMatter=this.thing?.body.translation().x??null;
 }
 setAperture(width){
  if(!Number.isFinite(width)||width<.65||width>4.5)
   throw RangeError("Invalid physical tunnel width");
  if(this.gateWalls.length!==2)return false;
  const top=this.gateWalls[0],bottom=this.gateWalls[1];
  top.body.setTranslation(V(21,13.5-width*.5-top.hy),true);
  bottom.body.setTranslation(V(21,13.5+width*.5+bottom.hy),true);
  this.world.propagateModifiedBodyPositionsToColliders();
  return true;
 }
 removeGate(){
  for(const item of this.gateWalls){
   this.world.removeRigidBody(item.body);
   const idx=this.objects.indexOf(item);
   if(idx>=0)this.objects.splice(idx,1);
  }
  this.gateWalls=[];this.withGate=false;
 }
 setFold(value){
  if(!Number.isFinite(value))throw RangeError("fold");
  this.foldTarget=clamp(value,0,1);
 }
 applyAnatomy(){
  if(this.kind!=="folding"||this.torqueCap===0)return;
  const a=this.actor,root=a.root;
  let sum=0;
  for(const wing of a.wings){
   // Angle from +X: deployed ±pi/2, stowed along +X. Multiple material
   // bodies genuinely rotate around hinges; none of their colliders resize.
   const target=wing.sign*Math.PI/2*(1-this.foldTarget);
   const angle=wrap(wing.body.rotation()-root.rotation());
   const relativeVelocity=wing.body.angvel()-root.angvel();
   const command=clamp(wrap(target-angle)*this.stiffness
     -relativeVelocity*.50,-this.torqueCap,this.torqueCap);
   // Newton paired torque impulses (actuated joint torque surrogate).
   wing.body.applyTorqueImpulse(command,true);
   root.applyTorqueImpulse(-command,true);
   this.jointImpulseTotal+=Math.abs(command);
   sum+=Math.abs(wrap(target-angle));
  }
  this.hingeError=sum/2;
 }
 holdOrientation(){
  if(!this.holdHeading)return;
  const root=this.actor.root;
  const impulse=clamp(-wrap(root.rotation())*1.25-root.angvel()*.65,-.35,.35);
  root.applyTorqueImpulse(impulse,true);
  this.headingImpulse+=Math.abs(impulse);
 }
 step({forward=0,fold=this.foldTarget}={}){
  this.setFold(fold);
  const a=this.actor,root=a.root;
  this.applyAnatomy();this.holdOrientation();
  const v=root.linvel(),target=clamp(forward,-1,1)*a.form.speed;
  if(Math.abs(forward)>1e-4){
   const delta=(target-v.x)*root.mass();
   const impulse=clamp(delta,-this.drive*DT,this.drive*DT);
   root.applyImpulse(V(impulse,0),true);
   this.operatorImpulse+=Math.abs(impulse);
   a.motorTicks++;
  }
  // Intentionally do not invoke M0Field.step: root motor is already applied.
  this.world.step();this.ticks++;
  this.observe();
  this.gateContacts+=this.contactAgainst(this.objects.filter(x=>x.kind==="fixed"));
  if(this.thing)this.externalBodyContacts+=this.contactAgainst([this.thing]);
  const p=root.translation();
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error("Nonfinite body");
 }
 contactAgainst(list){
  let num=0;
  for(const p of this.actor.parts)for(const o of list){
   this.world.contactPair(p.collider,o.collider,m=>{
    for(let k=0;k<m.numSolverContacts();k++)
     if(Math.abs(m.contactImpulse(k))>1e-5)num++;
   });
  }
  return num;
 }
 footprint(){
  const angles=this.actor.parts.map(p=>{
   const shape=p.shape,b=p.body,q=b.translation(),t=b.rotation();
   const X=shape.hx,Y=shape.hy;
   return [
    V(q.x+Math.cos(t)*X-Math.sin(t)*Y,q.y+Math.sin(t)*X+Math.cos(t)*Y),
    V(q.x+Math.cos(t)*X+Math.sin(t)*Y,q.y+Math.sin(t)*X-Math.cos(t)*Y),
    V(q.x-Math.cos(t)*X-Math.sin(t)*Y,q.y-Math.sin(t)*X+Math.cos(t)*Y),
    V(q.x-Math.cos(t)*X+Math.sin(t)*Y,q.y-Math.sin(t)*X-Math.cos(t)*Y)
   ];
  }).flat();
  return {minX:round(Math.min(...angles.map(p=>p.x))),maxX:round(Math.max(...angles.map(p=>p.x))),
   minY:round(Math.min(...angles.map(p=>p.y))),maxY:round(Math.max(...angles.map(p=>p.y)))};
 }
 output(){
  const a=this.actor,p=a.root.translation(),v=a.root.linvel();
  const partPositions=a.parts.map(x=>({
   x:round(x.body.translation().x),y:round(x.body.translation().y),
   rotation:round(x.body.rotation())}));
  return {kind:this.kind,ticks:this.ticks,foldTarget:this.foldTarget,
   chassis:{x:round(p.x),y:round(p.y),rotation:round(a.root.rotation()),
    vx:round(v.x),dx:round(p.x-this.startX)},
   physicalExtent:this.footprint(),
   parts:partPositions,gateContacts:this.gateContacts,
   bodyContacts:this.externalBodyContacts,
   movedMatter:this.thing?round(this.thing.body.translation().x-this.startMatter):null,
   operatorImpulse:round(this.operatorImpulse),
   hingeTorqueImpulse:round(this.jointImpulseTotal),
   headingTorqueImpulse:round(this.headingImpulse),
   hingeError:round(this.hingeError)};
 }
}
