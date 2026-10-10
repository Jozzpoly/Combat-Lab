// M0: physical BODY PHENOTYPES under reciprocal contact, NOT a combat/NPC runtime.
// Three deliberately small morphology hypotheses: rigid / articulated / compliant.
// ALL free locomotion uses an explicit finite EXTERNAL planar traction proxy;
// there are no simulated legs/ground. Selected-body commands and laboratory
// impulses are not autonomous agent decisions. Internal posture reactions
// use reciprocal impulses/torques and only ACTUAL prior-step contact evidence.
import RAPIER from "@dimforge/rapier2d-deterministic";

export const DT=1/60;
export const V=(x=0,y=0)=>({x,y});
const hypot=(a)=>Math.hypot(a.x,a.y);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1e4)/1e4;
const forms=Object.freeze({
 rigid:{name:"Zwarty",color:"#e7b574",motor:640,speed:2.8},
 chain:{name:"Członowany",color:"#8bd1ed",motor:620,speed:2.7},
 compliant:{name:"Podatny",color:"#b3e9a2",motor:550,speed:2.5}
});

export class M0Field{
 constructor({empty=false,reflex=true,iterations=12}={}){
  this.world=new RAPIER.World(V());
  this.world.timestep=DT;
  this.world.integrationParameters.numSolverIterations=iterations;
  this.actors=[];this.objects=[];this.nextId=0;this.ticks=0;
  this.selected=null;this.reflex=reflex;this.contactPairs=0;
  this.lastContactImpulse=0;this.reflexEvents=0;this.externalImpulse=0;
  this.contactHistory=[];
  this.addFixed(-.6,13.5,.5,14.5);
  this.addFixed(44.6,13.5,.5,14.5);
  this.addFixed(22,-.6,23,.5);
  this.addFixed(22,27.6,23,.5);
  if(!empty)this.populate();
 }
 makeBody(p,angle=0,damp=.85){
  return this.world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x,p.y).setRotation(angle)
      .setLinearDamping(damp).setAngularDamping(1.3).setCcdEnabled(true));
 }
 makeCollider(body,shape,mass){
  const desc=shape.type==="ball"?
   RAPIER.ColliderDesc.ball(shape.r):
   RAPIER.ColliderDesc.cuboid(shape.hx,shape.hy);
  desc.setMass(mass).setFriction(.68).setRestitution(.06);
  return this.world.createCollider(desc,body);
 }
 addFixed(x,y,hx,hy){
  const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed()
    .setTranslation(x,y));
  const col=this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy)
    .setFriction(.8),body);
  this.objects.push({body,collider:col,kind:"fixed",hx,hy});
  return col;
 }
 addFree(x,y,hx,hy,mass=65){
  const body=this.makeBody(V(x,y),0,1.0);
  const collider=this.makeCollider(body,{type:"box",hx,hy},mass);
  this.objects.push({body,collider,kind:"free",hx,hy});
  return body;
 }
 addActor(kind,pos){
  if(!forms[kind])throw Error("Unknown morphology");
  const id="org-"+(++this.nextId);
  const actor={id,kind,form:forms[kind],parts:[],joints:[],
   root:null,pressure:0,partLoads:[],reflexUntil:0,
   responseEvents:0, motorTicks:0, thrustImpulse:0};
  const part=(p,shape,mass)=>{
   const body=this.makeBody(p);
   const collider=this.makeCollider(body,shape,mass);
   actor.parts.push({body,collider,shape});
   actor.partLoads.push(0);
   return body;
  };
  if(kind==="rigid"){
   actor.root=part(pos,{type:"box",hx:1.02,hy:.66},125);
  } else if(kind==="chain"){
   const bodies=[];
   for(let i=0;i<3;i++)bodies.push(part(V(pos.x-i*1.12,pos.y),
    {type:"box",hx:.61,hy:.37},i===0?49:35));
   actor.root=bodies[0];
   for(let i=1;i<bodies.length;i++){
    const j=this.world.createImpulseJoint(RAPIER.JointData.revolute(
      V(-.56,0),V(.56,0)),bodies[i-1],bodies[i],false);
    actor.joints.push(j);
   }
  } else {
   const hub=part(pos,{type:"ball",r:.38},30);
   actor.root=hub;
   const arms=[];
   const n=7,rad=.88;
   for(let i=0;i<n;i++){
    const theta=i*Math.PI*2/n;
    const bead=part(V(pos.x+Math.cos(theta)*rad,pos.y+Math.sin(theta)*rad),
      {type:"ball",r:.28},11);
    arms.push(bead);
    const j=this.world.createImpulseJoint(RAPIER.JointData.spring(rad,260,14,V(),V()),hub,bead,false);
    actor.joints.push(j);
   }
   const edge=2*rad*Math.sin(Math.PI/n);
   for(let i=0;i<n;i++){
    const j=this.world.createImpulseJoint(RAPIER.JointData.spring(edge,105,7,V(),V()),
      arms[i],arms[(i+1)%n],false);
    actor.joints.push(j);
   }
  }
  this.actors.push(actor);
  this.world.propagateModifiedBodyPositionsToColliders();
  if(!this.selected)this.selected=id;
  return actor;
 }
 populate(){
  // Open irregular encounters, not crossing lanes or authored victory puzzles.
  for(const [kind,x,y] of [
   ["chain",10.2,11.2],["compliant",15.8,11.0],
   ["rigid",20.2,12.2],["compliant",24.8,10.8],
   ["rigid",30.2,13.0],["chain",15.0,19.0],
   ["compliant",24.0,18.4],["rigid",32.8,19.1]
  ])this.addActor(kind,V(x,y));
  // A small amount of material, never three separated 'interaction stations'.
  this.addFree(20.3,18.6,.61,.62,64);
  this.addFree(29.0,8.0,1.1,.22,90);
 }
 poseActor(id,pos){
  const a=this.actors.find(a=>a.id===id);
  if(!a)return false;
  const old=a.root.translation(),dx=pos.x-old.x,dy=pos.y-old.y;
  for(const p of a.parts){
   const body=p.body,xy=body.translation();
   body.setTranslation(V(xy.x+dx,xy.y+dy),true);
   body.setLinvel(V(),true);body.setAngvel(0,true);
  }
  a.pressure=0;a.partLoads.fill(0);a.reflexUntil=0;
  this.world.propagateModifiedBodyPositionsToColliders();
  return true;
 }
 poseObject(index,pos){
  const o=this.objects[index];
  if(!o||o.kind!=="free")return false;
  o.body.setTranslation(pos,true);
  o.body.setLinvel(V(),true);o.body.setAngvel(0,true);
  this.world.propagateModifiedBodyPositionsToColliders();
  return true;
 }
 pick(point){
  let best=null,distance=.45;
  for(const a of this.actors)for(const part of a.parts){
   const q=part.collider.projectPoint(point,true).point;
   const d=Math.hypot(q.x-point.x,q.y-point.y);
   if(d<distance){distance=d;best={kind:"actor",id:a.id};}
  }
  for(let i=0;i<this.objects.length;i++){
   const o=this.objects[i];
   if(o.kind!=="free")continue;
   const q=o.collider.projectPoint(point,true).point;
   const d=Math.hypot(q.x-point.x,q.y-point.y);
   if(d<distance){distance=d;best={kind:"object",index:i};}
  }
  return best;
 }
 select(id){this.selected=this.actors.some(a=>a.id===id)?id:null;}
 get selectedActor(){return this.actors.find(a=>a.id===this.selected)||null;}
 controlSelected(direction=V(),aim=null){
  const a=this.selectedActor;if(!a)return;
  const root=a.root,p=root.translation(),v=root.linvel(),n=hypot(direction);
  if(n>.01){
   const target=V(direction.x/n*a.form.speed,direction.y/n*a.form.speed);
   const delta=V((target.x-v.x)*root.mass(),(target.y-v.y)*root.mass());
   const impulse=hypot(delta),scale=impulse?Math.min(1,a.form.motor*DT/impulse):0;
   root.applyImpulse(V(delta.x*scale,delta.y*scale),true);
   a.motorTicks++;a.thrustImpulse+=impulse*scale;
  }
  if(aim){
   const dx=aim.x-p.x,dy=aim.y-p.y;
   if(Math.hypot(dx,dy)>.2){
    const err=Math.atan2(Math.sin(Math.atan2(dy,dx)-root.rotation()),
      Math.cos(Math.atan2(dy,dx)-root.rotation()));
    const torque=clamp(err*6-root.angvel()*1.6,-3,3);
    root.applyTorqueImpulse(torque,true);
   }
  }
 }
 doReflexes(){
  if(!this.reflex)return;
  for(const a of this.actors){
   if(a.kind==="rigid")continue; // passive rigid control
   if(a.pressure>2.5&&a.reflexUntil<=this.ticks){
    a.reflexUntil=this.ticks+24;
    a.responseEvents++;this.reflexEvents++;
   }
   if(a.reflexUntil<=this.ticks)continue;
   if(a.kind==="chain"){
    const [head,middle,tail]=a.parts.map(x=>x.body);
    const relative=Math.atan2(Math.sin(middle.rotation()-head.rotation()),
      Math.cos(middle.rotation()-head.rotation()));
    const torque=clamp((-.52-relative)*.36-(middle.angvel()-head.angvel())*.09,-.23,.23);
    middle.applyTorqueImpulse(torque,true);head.applyTorqueImpulse(-torque,true);
    const rel2=Math.atan2(Math.sin(tail.rotation()-middle.rotation()),
      Math.cos(tail.rotation()-middle.rotation()));
    const torque2=clamp((.50-rel2)*.34-(tail.angvel()-middle.angvel())*.08,-.20,.20);
    tail.applyTorqueImpulse(torque2,true);middle.applyTorqueImpulse(-torque2,true);
   }else if(a.kind==="compliant"){
    // Internal equal-and-opposite tension: no magic free-space propulsion.
    const hub=a.root,center=hub.translation();
    for(const bead of a.parts.slice(1)){
     const p=bead.body.translation(),d=V(center.x-p.x,center.y-p.y);
     const n=hypot(d);if(n<1e-5)continue;
     const magnitude=.19*DT;
     const impulse=V(d.x/n*magnitude,d.y/n*magnitude);
     bead.body.applyImpulse(impulse,true);
     hub.applyImpulse(V(-impulse.x,-impulse.y),true);
    }
   }
  }
 }
 observe(){
  let pairs=0,total=0;
  for(const a of this.actors){
   a.pressure=0;
   a.partLoads.fill(0);
   for(let i=0;i<a.parts.length;i++){
    const part=a.parts[i];
    this.world.contactPairsWith(part.collider,other=>{
     // Actual solver impulse. Ignore own-body internal contacts entirely.
     if(a.parts.some(p=>p.collider.handle===other.handle))return;
     let impulse=0;
     this.world.contactPair(part.collider,other,manifold=>{
      for(let k=0;k<manifold.numSolverContacts();k++)
       impulse+=Math.abs(manifold.contactImpulse(k)||0);
     });
     if(impulse>0){pairs++;total+=impulse;a.pressure+=impulse;a.partLoads[i]+=impulse;}
    });
   }
  }
  this.contactPairs=pairs;this.lastContactImpulse=total;
  if(this.ticks%10===0)this.contactHistory.push({t:this.ticks,contacts:pairs,impulse:round(total)});
  if(this.contactHistory.length>1000)this.contactHistory.shift();
 }
 step({direction=V(),aim=null}={}){
  this.controlSelected(direction,aim);
  this.doReflexes();
  this.world.step();this.ticks++;
  this.observe();
 }
 poke(point,impulse){
  const mag=hypot(impulse);
  if(!Number.isFinite(mag)||mag<1e-10||mag>30000)throw RangeError("Invalid impulse");
  let nearest=null,dist=Infinity;
  for(const a of this.actors)for(const part of a.parts){
   const hit=part.collider.projectPoint(point,true);
   const p=hit.point,d=Math.hypot(p.x-point.x,p.y-point.y);
   if(d<dist){dist=d;nearest=part;}
  }
  for(const o of this.objects)if(o.kind==="free"){
   const hit=o.collider.projectPoint(point,true);
   const d=Math.hypot(hit.point.x-point.x,hit.point.y-point.y);
   if(d<dist){dist=d;nearest=o;}
  }
  if(!nearest||dist>.45)return false;
  nearest.body.applyImpulseAtPoint(impulse,point,true);
  this.externalImpulse+=mag;return true;
 }
 sample(){
  const actors=this.actors.map(a=>{
   const centers=a.parts.map(p=>p.body.translation()),r=a.root.translation();
   const radial=centers.length>1?
    centers.slice(1).map(p=>Math.hypot(p.x-r.x,p.y-r.y)):[];
   return {id:a.id,kind:a.kind,x:round(r.x),y:round(r.y),
    angle:round(a.root.rotation()),velocity:round(hypot(a.root.linvel())),
    contacts:round(a.pressure),responseEvents:a.responseEvents,
    motorTicks:a.motorTicks,radialSpread:radial.length?
     round(Math.max(...radial)-Math.min(...radial)):0,
    extent:round(Math.max(...centers.map(p=>Math.hypot(p.x-r.x,p.y-r.y))))};
  });
  return {tick:this.ticks,actors,contacts:this.contactPairs,
   totalContactImpulse:round(this.lastContactImpulse),
   reflexEvents:this.reflexEvents,externalImpulse:round(this.externalImpulse)};
 }
 dispose(){this.world.free();}
}
