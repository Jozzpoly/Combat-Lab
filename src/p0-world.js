// P0 research candidate: freely editable shared material courtyard.
// A genuine pivoted gate + independent bodies + persistent movable loads.
// FORCE TRUTH: all top-down translational movement is a bounded external
// traction proxy, NOT foot-based locomotion. Optional terrain support applies
// finite, fully accounted impulse against an explicit virtual ground.
// No path, completion triggers, hidden contact clamps, scripted collision
// success, NPC cognition, or claimed performance/Owner acceptance.
import RAPIER from "@dimforge/rapier2d-deterministic";
export const DT=1/60;
export const V=(x=0,y=0)=>({x,y});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const norm=v=>Math.hypot(v.x,v.y);
const round=x=>Math.round(x*1e4)/1e4;
export class MaterialYard{
 constructor({populated=true,support="finite",seed=0}={}){
  if(!["finite","none","damping"].includes(support))throw Error("support regime");
  this.world=new RAPIER.World(V());this.world.timestep=DT;
  this.world.integrationParameters.numSolverIterations=12;
  this.entities=[];this.actors=[];this.loads=[];this.ticks=0;
  this.support=support;this.selected=null;this.nextId=1;
  this.events={rootEffort:0,terrainLinearImpulse:0,terrainAngularImpulse:0,
   panelTorque:0,operatorPokes:0,gateTorque:0,gateContacts:0,gateImpulse:0};
  this.source="Rapier2D deterministic 0.21, zero gravity, finite virtual terrain impulse";
  this.setup(populated,seed);
 }
 add(kind,x,y,shapes,{fixed=false,angle=0,damping=0}={}){
  const d=(fixed?RAPIER.RigidBodyDesc.fixed():RAPIER.RigidBodyDesc.dynamic())
   .setTranslation(x,y).setRotation(angle);
  if(!fixed)d.setLinearDamping(damping).setAngularDamping(damping).setCcdEnabled(true);
  const b=this.world.createRigidBody(d);
  const e={id:this.nextId++,kind,body:b,shapes:[],initial:V(x,y)};
  for(const p of shapes){
   const desc=p.r?RAPIER.ColliderDesc.ball(p.r):RAPIER.ColliderDesc.cuboid(p.hx,p.hy);
   desc.setMass(p.mass??1).setFriction(p.friction??.7).setRestitution(p.restitution??.04);
   if(p.dx||p.dy)desc.setTranslation(p.dx||0,p.dy||0);
   const col=this.world.createCollider(desc,b);
   e.shapes.push({collider:col,shape:{...p}});
  }
  this.entities.push(e);return e;
 }
 wall(x,y,hx,hy){return this.add("wall",x,y,[{hx,hy,mass:1}],{fixed:true});}
 setup(populated,seed){
  this.wall(20,-.45,20.5,.45);this.wall(20,24.45,20.5,.45);
  this.wall(-.45,12,.45,12.5);this.wall(40.45,12,.45,12.5);
  // There is an 8m material gap between these two wall segments.
  this.wall(20,4,.34,4);this.wall(20,20,.34,4);
  this.anchor=this.add("pivot",20,8.55,[{r:.28,mass:1}],{fixed:true});
  this.gate=this.add("gate",20,10.90,[{hx:.20,hy:2.35,mass:90}]);
  const j=this.world.createImpulseJoint(
   RAPIER.JointData.revolute(V(0,0),V(0,-2.35)),
   this.anchor.body,this.gate.body,true);
  j.setContactsEnabled(false); // mount is a real hinge; pivot itself overlaps gate at attachment.
  this.gate.joint=j;
  if(populated){
   this.load(19.6,14.95,.70,.39,70);
   this.load(22.7,15.25,.62,.6,80);
   this.load(27.0,7.5,.85,.25,38);
   this.load(9.0,17.5,.47,.78,44);
   this.spawn("bulky",V(12,11.7));
   this.spawn("small",V(15.9,16));
   this.spawn("lever",V(27,11.5));
   this.spawn("small",V(29,18));
   this.selected=this.actors[0].id;
  }
  this.world.propagateModifiedBodyPositionsToColliders();
 }
 load(x,y,hx=.6,hy=.45,mass=55){
  const obj=this.add("load",x,y,[{hx,hy,mass}]);
  this.loads.push(obj);return obj;
 }
 spawn(kind,p){
  if(!["bulky","small","lever","rigid-lever"].includes(kind))throw Error("kind");
  let shape,mass,motor;
  if(kind==="bulky"){shape={r:1.15,mass:160};motor=750;}
  else if(kind==="small"){shape={r:.44,mass:27};motor=470;}
  else{shape={hx:.63,hy:.46,mass:68};motor=530;}
  const e=this.add(kind,p.x,p.y,[shape],{damping:this.support==="damping"?1.2:0});
  e.stance="flow";e.motor=motor;e.target=0;e.panel=null;e.panelActive=false;e.actuatorLimit=1.6;
  if(kind==="lever"){
   // A real front-mounted panel with 22kg and paired bounded torques.
   const panel=this.add("effector",p.x+1.88,p.y,
      [{hx:1.25,hy:.17,mass:22}]);
   const joint=this.world.createImpulseJoint(
      RAPIER.JointData.revolute(V(.63,0),V(-1.25,0)),
      e.body,panel.body,true);
   joint.setContactsEnabled(true);
   e.panel=panel;e.joint=joint;
  } else if(kind==="rigid-lever"){
   // Cheap rival: similar envelope and combined mass, no separate actuation.
   const col=this.world.createCollider(
    RAPIER.ColliderDesc.cuboid(1.25,.17).setTranslation(1.88,0)
     .setMass(22).setFriction(.7),e.body);
   e.shapes.push({collider:col,shape:{hx:1.25,hy:.17,dx:1.88,dy:0,mass:22}});
  }
  this.actors.push(e);return e;
 }
 setSelected(id){if(!this.actors.some(x=>x.id===id))return false;this.selected=id;return true;}
 get chosen(){return this.actors.find(x=>x.id===this.selected)||null;}
 setStance(id,value){
  const a=this.actors.find(x=>x.id===id);
  if(!a||!["flow","brace"].includes(value))return false;
  a.stance=value;return true;
 }
 setSupport(value){if(!["finite","none","damping"].includes(value))return false;
   this.support=value;
   for(const a of this.actors){
    a.body.setLinearDamping(value==="damping"?1.2:0);
    a.body.setAngularDamping(value==="damping"?1.6:0);
   }
   return true;
 }
 setPanelAngle(id,target){const a=this.actors.find(x=>x.id===id);
  if(!a?.panel||!Number.isFinite(target))return false;
  a.target=clamp(target,-1.35,1.35);a.panelActive=true;return true;
 }
 // Explicit virtual terrain reaction: finite Coulomb-like impulses on moving
 // bodies, with separately bounded translation and yaw. This is NOT direct
 // proof of real 3D support, discrete footprints or reaction force geometry.
 terrain(e,maxF,maxT){
  const b=e.body;
  const v=b.linvel(),L=norm(v);
  const m=b.mass(),want=m*L,step=maxF*DT;
  if(want>1e-9&&step>0){
   const j=Math.min(want,step);
   b.applyImpulse(V(-v.x/L*j,-v.y/L*j),true);
   this.events.terrainLinearImpulse+=j;
  }
  const w=b.angvel(),i=b.principalInertia(),torque=Math.min(Math.abs(w)*i,maxT*DT);
  if(Math.abs(w)>1e-9&&torque>0){
   b.applyTorqueImpulse(-Math.sign(w)*torque,true);
   this.events.terrainAngularImpulse+=torque;
  }
 }
 terrainStep(){
  if(this.support!=="finite")return;
  for(const a of this.actors){
   const mu=a.stance==="brace"?1.35:.45;
   // Strong posture is still finite: a bounded external ground torque.
   // Flow explicitly yields to body-internal angular reaction.
   const yaw=a.stance==="brace"?80:1.5;
   this.terrain(a,a.body.mass()*9.81*mu,yaw);
  }
  // Loads also have a finite non-magical ground reaction.
  for(const obj of this.loads)this.terrain(obj,obj.body.mass()*9.81*.30,24);
 }
 actuation(){
  for(const a of this.actors){
   if(!a.panel||!a.panelActive)continue;
   const body=a.panel.body,root=a.body;
   const delta=wrap(body.rotation()-root.rotation()),w=body.angvel()-root.angvel();
   const impulse=clamp(wrap(a.target-delta)*.60-w*.19,
    -a.actuatorLimit,a.actuatorLimit);
   body.applyTorqueImpulse(impulse,true);root.applyTorqueImpulse(-impulse,true);
   this.events.panelTorque+=Math.abs(impulse);
  }
 }
 command(a,move){
  const n=norm(move);if(n<1e-5)return;
  const d=V(move.x/n,move.y/n),v=a.body.linvel(),maxSpeed=
    a.kind==="bulky"?1.75:a.kind==="small"?3.6:2.5;
  const stanceSpeed=a.stance==="brace"?.48:1;
  const target=V(d.x*maxSpeed*stanceSpeed,d.y*maxSpeed*stanceSpeed);
  const m=a.body.mass(),force=V((target.x-v.x)*m,(target.y-v.y)*m);
  const L=norm(force),lim=a.motor*DT*(a.stance==="brace"?.76:1);
  const sc=L>lim?lim/L:1;
  const j=V(force.x*sc,force.y*sc);
  a.body.applyImpulse(j,true);this.events.rootEffort+=norm(j);
 }
 gateDrag(){
  // Physical dissipative hinge, no fixed-position servo or hidden world lock.
  const w=this.gate.body.angvel(),inertia=this.gate.body.principalInertia();
  const j=Math.min(Math.abs(w)*inertia,80*DT);
  if(j>0){this.gate.body.applyTorqueImpulse(-Math.sign(w)*j,true);this.events.gateTorque+=j;}
 }
 afterStep(){
  let impulse=0,contacts=0;
  for(const a of this.actors){
   for(const p of a.shapes)this.world.contactPair(p.collider,this.gate.shapes[0].collider,m=>{
    for(let k=0;k<m.numSolverContacts();k++){
     const j=Math.abs(m.contactImpulse(k)||0);if(j>0){impulse+=j;contacts++;}
    }
   });
   if(a.panel)for(const p of a.panel.shapes)this.world.contactPair(p.collider,
      this.gate.shapes[0].collider,m=>{
      for(let k=0;k<m.numSolverContacts();k++){
       const j=Math.abs(m.contactImpulse(k)||0);if(j>0){impulse+=j;contacts++;}
      }
    });
  }
  this.events.gateContacts+=contacts;this.events.gateImpulse+=impulse;
 }
 step(move=V()){
  this.terrainStep();this.gateDrag();this.actuation();
  if(this.chosen)this.command(this.chosen,move);
  this.world.step();this.ticks++;this.afterStep();
 }
 impulseAt(p,delta,magnitude=80){
  if(!Number.isFinite(magnitude)||magnitude<0||magnitude>2000)return false;
  const n=norm(delta);if(n<1e-6)return false;
  const hit=this.pick(p,{includeGate:true});
  if(!hit||hit.body.isFixed())return false;
  // Force is applied at the actual picked world point: off-center hits spin bodies.
  hit.body.applyImpulseAtPoint(V(delta.x/n*magnitude,delta.y/n*magnitude),p,true);
  this.events.operatorPokes++;return true;
 }
 moveEntity(entity,p){
  if(!entity||entity.body.isFixed()||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  const old=entity.body.translation(),dx=p.x-old.x,dy=p.y-old.y;
  for(const e of [entity,...(entity.panel?[entity.panel]:[])]){
   const q=e.body.translation();
   e.body.setTranslation(V(q.x+dx,q.y+dy),true);
   e.body.setLinvel(V(),true);e.body.setAngvel(0,true);
  }
  this.world.propagateModifiedBodyPositionsToColliders();
  return true;
 }
 pick(p,{includeGate=false}={}){
  let candidate=null,best=Infinity;
  for(const e of this.entities){
   if(["wall","pivot"].includes(e.kind)||!includeGate&&e.kind==="gate")continue;
   for(const s of e.shapes){
    const q=s.collider.translation(),distance=norm(V(q.x-p.x,q.y-p.y));
    const r=s.shape.r??Math.hypot(s.shape.hx,s.shape.hy);
    if(distance<r+.25&&distance<best){candidate=e;best=distance;}
   }
  }return candidate;
 }
 traces(){
  const gateRotation=wrap(this.gate.body.rotation());
  const a=this.chosen;
  return {tick:this.ticks,seconds:round(this.ticks*DT),support:this.support,
    actorCount:this.actors.length,loadCount:this.loads.length,
    gateAngle:round(gateRotation),gateTip:V(round(20+Math.sin(gateRotation)*(-4.7)),round(8.55+Math.cos(gateRotation)*4.7)),
    selected:a?{id:a.id,kind:a.kind,stance:a.stance,pos:{...a.body.translation()},
      rotation:round(a.body.rotation()),panelAngle:a.panel?round(wrap(a.panel.body.rotation()-a.body.rotation())):null}:null,
    events:Object.fromEntries(Object.entries(this.events).map(([k,v])=>[k,round(v)])),
    actors:this.actors.map(e=>({id:e.id,kind:e.kind,stance:e.stance,
      x:round(e.body.translation().x),y:round(e.body.translation().y),
      angle:round(e.body.rotation()),panel:e.panel?round(wrap(e.panel.body.rotation()-e.body.rotation())):null})),
    loads:this.loads.map(e=>({id:e.id,x:round(e.body.translation().x),y:round(e.body.translation().y)})),
    finite:this.entities.every(e=>{const p=e.body.translation(),v=e.body.linvel();
      return [p.x,p.y,v.x,v.y,e.body.rotation(),e.body.angvel()].every(Number.isFinite);
    })};
 }
 dispose(){this.world.free();}
}
