// W2: provisional E1 world donor, B1-inspired genuine mass-bearing envelope.
// This is NOT a merged E1+B1 architecture and not grounded locomotion.
// Geometry changes arise ONLY from two jointed physical wings. All actors,
// including W2, retain the same explicitly artificial finite root traction.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {EncounterField} from "./e1-encounter.js";
import {V} from "./m0-world.js";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const round=x=>Math.round(x*1e4)/1e4;

export class MaterialCommons extends EncounterField {
 constructor({populated=true,...config}={}){
  super({...config,populated:false});
  this.w2Events={foldCommands:0,pressurePolicySwitches:0,jointImpulse:0};
  if(populated){
   super.populate(); // 18 real independent actors, real objects and cues from E1
   const left=this.addCreature("folding",V(10,13.5),"seeker");
   const right=this.addCreature("folding",V(28,15),"wary");
   this.setBodyPolicy(left.id,"pressure");
   this.setBodyPolicy(right.id,"pressure");
   // Distributed movable matter, not a task trigger or teleporting objective.
   this.addFree(19.2,13.4,.56,.40,55);
   this.addFree(24.6,13.8,.58,.44,60);
   this.select(null);
  }
 }
 addCreature(kind,pos,role="seeker"){
  if(kind==="folding")return this.addFoldable(pos,role);
  if(kind==="rival-narrow"||kind==="rival-wide")
   return this.addRigidRival(pos,role,kind);
  return super.addCreature(kind,pos,role);
 }
 addFoldable(pos,role="seeker"){
  const actor=super.addCreature("rigid",pos,role);
  const part=actor.parts[0];
  part.shape={type:"box",hx:.51,hy:.32};
  part.collider.setHalfExtents(V(.51,.32));
  part.collider.setMass(85);
  actor.form={...actor.form,speed:2.15,motor:860};
  actor.morphology="folding";actor.foldTarget=0;actor.foldPolicy="manual";actor.anatomyCap=3;
  actor.foldUntil=0;actor.wings=[];actor.anatomyImpulse=0;actor.headingImpulse=0;
  for(const sign of [-1,1]){
   const shape={type:"box",hx:.80,hy:.12};
   const body=this.makeBody(V(pos.x+.65,pos.y+sign*1.13),sign*Math.PI/2,.7);
   const collider=this.makeCollider(body,shape,20);
   const joint=this.world.createImpulseJoint(
    RAPIER.JointData.revolute(V(.65,sign*.33),V(-.80,0)),
    actor.root,body,true);
   // This is actual connected collision, NOT the createImpulseJoint wakeUp flag.
   joint.setContactsEnabled(true);
   actor.parts.push({body,collider,shape});
   actor.partLoads.push(0);
   actor.joints.push(joint);
   actor.wings.push({sign,body,joint});
  }
  this.world.propagateModifiedBodyPositionsToColliders();
  return actor;
 }
 addRigidRival(pos,role,kind){
  const actor=super.addCreature("rigid",pos,role);
  const narrow=kind==="rival-narrow";
  const hx=narrow?1.07:.55,hy=narrow?.46:1.90;
  actor.parts[0].collider.setHalfExtents(V(hx,hy));
  actor.parts[0].collider.setMass(125);
  actor.parts[0].shape={type:"box",hx,hy};
  actor.morphology=kind;
  actor.form={...actor.form,speed:2.15,motor:860};
  this.world.propagateModifiedBodyPositionsToColliders();
  return actor;
 }
 setActuatorCap(id,value){
  const a=this.actors.find(x=>x.id===id&&x.morphology==="folding");
  if(!a||!Number.isFinite(value)||value<0||value>3)return false;
  a.anatomyCap=value;return true;
 }
 setFold(id,value){
  const a=this.actors.find(x=>x.id===id&&x.morphology==="folding");
  if(!a||!Number.isFinite(value))return false;
  a.foldTarget=clamp(value,0,1);a.foldPolicy="manual";
  this.w2Events.foldCommands++;
  return true;
 }
 setBodyPolicy(id,policy){
  if(!["manual","pressure"].includes(policy))return false;
  const a=this.actors.find(x=>x.id===id&&x.morphology==="folding");
  if(!a)return false;
  a.foldPolicy=policy;a.foldUntil=0;
  return true;
 }
 extent(a){
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of a.parts){
   const q=p.body.translation(),s=p.shape,angle=p.body.rotation();
   const hx=s.hx??s.r,hy=s.hy??s.r;
   const dx=Math.abs(Math.cos(angle))*hx+Math.abs(Math.sin(angle))*hy;
   const dy=Math.abs(Math.sin(angle))*hx+Math.abs(Math.cos(angle))*hy;
   minX=Math.min(minX,q.x-dx);maxX=Math.max(maxX,q.x+dx);
   minY=Math.min(minY,q.y-dy);maxY=Math.max(maxY,q.y+dy);
  }
  return {minX:round(minX),maxX:round(maxX),minY:round(minY),maxY:round(maxY),
   spanX:round(maxX-minX),spanY:round(maxY-minY)};
 }
 anatomyStep(){
  for(const a of this.actors){
   if(a.morphology!=="folding")continue;
   if(a.foldPolicy==="pressure"&&a.id!==this.selected){
    // Delayed local contact/neighbor count only; no world coordinates or route.
    if(a.pressure>10||(a.motive?.neighborCount??0)>2){
     if(a.foldUntil<=this.ticks)this.w2Events.pressurePolicySwitches++;
     a.foldUntil=this.ticks+100;
    }
    a.foldTarget=this.ticks<a.foldUntil?1:0;
   }
   for(const wing of a.wings){
    const angle=wrap(wing.body.rotation()-a.root.rotation());
    const target=wing.sign*Math.PI/2*(1-a.foldTarget);
    const relative=wing.body.angvel()-a.root.angvel();
    const impulse=clamp(wrap(target-angle)*2.7-relative*.5,-a.anatomyCap,a.anatomyCap);
    wing.body.applyTorqueImpulse(impulse,true);
    a.root.applyTorqueImpulse(-impulse,true);
    a.anatomyImpulse+=Math.abs(impulse);
    this.w2Events.jointImpulse+=Math.abs(impulse);
   }
   // Explicit finite heading assistance (not actual floor/feet torque).
   const heading=clamp(-wrap(a.root.rotation())*1.25-a.root.angvel()*.65,-.35,.35);
   a.root.applyTorqueImpulse(heading,true);a.headingImpulse+=Math.abs(heading);
  }
 }
 step(input={}){
  this.anatomyStep();
  super.step(input);
 }
 morphologyTrace(){
  return {tick:this.ticks,physicalActorCount:this.actors.length,
   objects:this.objects.length,pressurePolicySwitches:this.w2Events.pressurePolicySwitches,
   foldables:this.actors.filter(a=>a.morphology==="folding").map(a=>({
    id:a.id,foldTarget:a.foldTarget,policy:a.foldPolicy,
    actualExtent:this.extent(a),hingeAngles:a.wings.map(w=>
     round(wrap(w.body.rotation()-a.root.rotation()))),
    actualConnectedContacts:a.wings.map(w=>w.joint.contactsEnabled()),
    pressure:round(a.pressure),motorTicks:a.motorTicks,
    root:{...a.root.translation()},anatomyImpulse:round(a.anatomyImpulse)
   }))};
 }
}