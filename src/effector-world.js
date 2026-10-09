// Independent embodiment contrast. NO inheritance from the quarantined Yard.
// Multiple collision-bearing arm bodies, true revolute joints, bounded
// reciprocal actuation. A crate is NEVER glued/teleported to a hand.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {SCENE_FORMAT,validateScene} from "./scene-contract.js";

export const DT=1/60;
export const V=(x=0,y=0)=>({x,y});
export const norm=v=>Math.hypot(v.x,v.y);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const rotate=(v,a)=>V(v.x*Math.cos(a)-v.y*Math.sin(a),
  v.x*Math.sin(a)+v.y*Math.cos(a));
const safe=(n,name)=>{if(!Number.isFinite(n)||!Number.isFinite(Math.fround(n)))
 throw RangeError("Nonphysical "+name);return n};

export class EffectorField {
  static async create(){return new EffectorField();}
  constructor({empty=false}={}){
    this.world=new RAPIER.World(V(0,0));
    this.world.timestep=DT;
    this.world.integrationParameters.numSolverIterations=12;
    this.width=36;this.height=24;
    this.actors=[];this.matter=[];this.walls=[];this.gates=[];
    this.colliderOwner=new Map();this.next=0;this.ticks=0;
    this.selected=null;this.authored=[];
    this.contactReadout={count:0,impulse:0};
    this.fixedWorld();
    if(!empty)this.populate();
  }
  exportScene(){
    const data={
      format:SCENE_FORMAT,
      actors:this.actors.map(a=>{
        const root=a.root.translation(),angle=a.root.rotation();
        return {kind:a.kind,x:root.x,y:root.y,angle,
          clawTorque:a.spec.clawTorque,reach:a.spec.clawReach,
          aperture:a.targetAperture,armApertures:[...a.targetApertures],
          armAngles:a.arms.map(arm=>wrap(arm.body.rotation()-angle))};
      }),
      matter:this.matter.filter(x=>x.type==="box").map(m=>{
        const p=m.body.translation();
        return {x:p.x,y:p.y,hx:m.hx,hy:m.hy,mass:m.mass,
          angle:m.body.rotation()};
      }),
      walls:this.walls.slice(8).map(w=>({
        x:w.x,y:w.y,hx:w.hx,hy:w.hy})),
      gates:this.gates.map(g=>({
        x:g.pivot.x,y:g.pivot.y,length:g.length,mass:g.mass,
        angle:g.body.rotation()}))
    };
    return validateScene(data);
  }
  static fromScene(input){
    // Validation is pure; no live state is modified on failure.
    const data=validateScene(input);
    const field=new EffectorField({empty:true});
    try{
      for(const w of data.walls)field.addWall(w,false);
      for(const m of data.matter){
        const item=field.addBox(m,false);
        item.body.setRotation(m.angle,true);
      }
      for(const g of data.gates){
        const item=field.addGate(g,false);
        item.body.setRotation(g.angle,true);
        item.body.setTranslation(V(g.x+Math.cos(g.angle)*g.length/2,
          g.y+Math.sin(g.angle)*g.length/2),true);
      }
      for(const a of data.actors){
        const created=field.spawn(a.kind,V(a.x,a.y),a.angle);
        created.spec.clawTorque=a.clawTorque;
        created.targetAperture=a.aperture;
        if(a.kind==="pincer"){
          created.targetApertures=[...a.armApertures];
          field.setClawReach(created.id,a.reach);
        }
        if(a.kind==="pincer"){
          for(let i=0;i<created.arms.length;i++){
            const arm=created.arms[i],relative=a.armAngles[i];
            const r=a.angle+relative;
            const shoulder=rotate(V(.39,arm.sign*.72),a.angle);
            const h=rotate(V(.72,0),r);
            arm.body.setRotation(r,true);
            arm.body.setTranslation(V(a.x+shoulder.x+h.x,
              a.y+shoulder.y+h.y),true);
          }
        }
      }
      field.world.propagateModifiedBodyPositionsToColliders();
      field.select(field.actors[0]?.id||null);
      return field;
    }catch(error){field.dispose();throw error;}
  }
  dispose(){this.world.free();}
  register(owner,collider){this.colliderOwner.set(collider.handle,owner);}
  fixedWorld(){
    for(const b of [
      [18,.18,18,.18],[18,23.82,18,.18],[.18,12,.18,12],
      [35.82,12,.18,12],[16,5.2,3,.22],
      [16,18.8,3,.22],[30.5,7.3,.25,2],
      [30.5,17,.25,2]
    ])this.addWall({x:b[0],y:b[1],hx:b[2],hy:b[3]},false);
  }
  populate(){
    const a=this.spawn("pincer",{x:7,y:11.5});
    this.spawn("ram",{x:26,y:12},Math.PI);
    this.select(a.id);
    this.addBox({x:10.3,y:11.5,hx:.42,hy:.47,mass:13},false);
    this.addBox({x:14.4,y:11.5,hx:.68,hy:.70,mass:210},false);
    this.addBox({x:18.3,y:13.7,hx:.52,hy:.52,mass:48},false);
    this.addBox({x:23.5,y:10.5,hx:.5,hy:1.15,mass:72},false);
    this.addGate({x:21,y:16,length:3.0,mass:88},false);
  }
  makeBody(x,y,a=0,linearDamp=1.3){
    return this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y).setRotation(a)
       .setLinearDamping(linearDamp).setAngularDamping(2.1)
       .setCcdEnabled(true));
  }
  makeBox(body,hx,hy,mass,px=0,py=0){
    const c=this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx,hy).setTranslation(px,py)
        .setMass(mass).setFriction(.8).setRestitution(0),body);
    return c;
  }
  spawn(kind,p,angle=0){
    if(!["pincer","ram"].includes(kind))throw RangeError("Unknown body form");
    const x=safe(p.x,"spawn x"),y=safe(p.y,"spawn y");
    const a=safe(angle,"rotation"),id="actor-"+(++this.next);
    const root=this.makeBody(x,y,a);
    const actor={id,kind,root,parts:[],joints:[],arms:[],
      spec:{motorForce:kind==="ram"?1250:770,torque:kind==="ram"?720:440,
        speed:kind==="ram"?2.0:2.5,clawTorque:kind==="pincer"?780:0,
        bodyMass:kind==="ram"?220:85,
        clawReach:kind==="pincer"?1.53:0},
      targetAperture:1, targetApertures:[1,1], contactCount:0, contactImpulse:0};
    const bodyCollider=this.makeBox(root,kind==="ram"?1.04:.64,
      kind==="ram"?.80:.48,actor.spec.bodyMass);
    actor.parts.push({body:root,collider:bodyCollider,tag:"body"});
    this.register(id,bodyCollider);
    if(kind==="ram"){
      const nose=this.makeBox(root,.48,.28,10,.94,0);
      actor.parts.push({body:root,collider:nose,tag:"prow"});
      this.register(id,nose);
    }else{
      for(const sign of [-1,1]){
        // Rotating physical appendages with real pivot anchors.
        const localShoulder=V(.39,sign*.72);
        const initial=sign*.52;
        const elbow=rotate(V(.72,0),a+initial);
        const shoulder=rotate(localShoulder,a);
        const arm=this.makeBody(x+shoulder.x+elbow.x,
          y+shoulder.y+elbow.y,a+initial,1.1);
        const bar=this.makeBox(arm,.81,.13,15);
        // Small inward-facing distal hooked surface; part of actual solid.
        const hook=this.makeBox(arm,.115,.26,2.2,.70,-sign*.20);
        const joint=this.world.createImpulseJoint(RAPIER.JointData.revolute(
          localShoulder,V(-.72,0)),root,arm,true);
        actor.parts.push({body:arm,collider:bar,tag:sign<0?"upper":"lower"});
        actor.parts.push({body:arm,collider:hook,tag:"hook"});
        actor.arms.push({body:arm,joint,sign,bar,hook,index:actor.arms.length});
        actor.joints.push(joint);
        this.register(id,bar);this.register(id,hook);
      }
    }
    this.actors.push(actor);
    this.world.propagateModifiedBodyPositionsToColliders();
    return actor;
  }
  select(id){this.selected=this.actors.some(a=>a.id===id)?id:null;return this.selected;}
  actor(id){return this.actors.find(a=>a.id===id)||null;}
  addBox({x,y,hx=.5,hy=.5,mass=35},authored=true){
    for(const [k,n] of Object.entries({x,y,hx,hy,mass}))safe(n,k);
    if(hx<.03||hy<.03||mass<=0)throw RangeError("Invalid physical crate");
    const id="box-"+(++this.next),body=this.makeBody(x,y);
    const collider=this.makeBox(body,hx,hy,mass);
    const item={id,body,collider,mass,hx,hy,type:"box"};
    this.matter.push(item);this.register(id,collider);
    if(authored)this.authored.push({type:"box",id});
    return item;
  }
  addWall({x,y,hx=.4,hy=.4},authored=true){
    for(const [k,n] of Object.entries({x,y,hx,hy}))safe(n,k);
    if(hx<.03||hy<.03)throw RangeError("Invalid wall");
    const id="wall-"+(++this.next);
    const collider=this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy)
      .setTranslation(x,y).setFriction(.85).setRestitution(0));
    const item={id,collider,x,y,hx,hy};
    this.walls.push(item);this.register(id,collider);
    if(authored)this.authored.push({type:"wall",id});
    return item;
  }
  addGate({x,y,length=2.8,mass=65},authored=true){
    for(const [k,n] of Object.entries({x,y,length,mass}))safe(n,k);
    if(length<=.2||mass<=0)throw RangeError("Invalid gate");
    const id="gate-"+(++this.next),anchor=this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(x,y));
    const body=this.makeBody(x+length/2,y,0,.5);
    const collider=this.makeBox(body,length/2,.14,mass);
    const joint=this.world.createImpulseJoint(RAPIER.JointData.revolute(
      V(0,0),V(-length/2,0)),anchor,body,true);
    const item={id,body,collider,anchor,joint,pivot:V(x,y),
      length,mass,type:"gate"};
    this.gates.push(item);this.matter.push(item);this.register(id,collider);
    if(authored)this.authored.push({type:"gate",id});
    return item;
  }
  setClawReach(id,newReach){
    const a=this.actor(id);
    if(!a||a.kind!=="pincer")return false;
    const reach=safe(newReach,"jaw geometric reach");
    if(reach<.86||reach>60)
      throw RangeError("Jaw reach exceeds this runtime's representable geometry");
    const half=reach-.72;
    // The pivot is physically fixed to the arm's local -0.72 point.
    // Changing span changes real collider geometry, effective inertia and
    // distal hook placement, not just the renderer's decorative length.
    for(const arm of a.arms){
      arm.bar.setHalfExtents(V(half,.13));
      arm.bar.setTranslationWrtParent(V(0,0));
      const localHook=V(half-.11,-arm.sign*.20);
      arm.hook.setTranslationWrtParent(localHook);
      // Rapier caches attached collider world poses until a solver update.
      // This one-time authoring refresh is NOT movement: the local offset
      // stays the physical source of truth on the next simulation step.
      const center=arm.body.translation(),off=rotate(localHook,arm.body.rotation());
      arm.hook.setTranslation(V(center.x+off.x,center.y+off.y));
      arm.bar.setMass(15);
      arm.hook.setMass(2.2);
      // Explicitly dirty the unchanged parent pose so cached collider
      // world transforms reflect edited local offsets even while paused.
      arm.body.setTranslation(V(arm.body.translation().x,
        arm.body.translation().y),true);
    }
    a.spec.clawReach=reach;
    this.world.propagateModifiedBodyPositionsToColliders();
    return true;
  }
  setAperture(id,value){
    const a=this.actor(id);
    if(!a||a.kind!=="pincer")return false;
    const aperture=clamp(safe(value,"aperture"),0,1);
    a.targetAperture=aperture;
    a.targetApertures=[aperture,aperture];return true;
  }
  setArmAperture(id,index,value){
    const a=this.actor(id);
    if(!a || a.kind!=="pincer")return false;
    if(index!==0 && index!==1)throw RangeError("Arm is 0 (upper) or 1 (lower)");
    const aperture=clamp(safe(value,"independent arm aperture"),0,1);
    a.targetApertures[index]=aperture;
    a.targetAperture=(a.targetApertures[0]+a.targetApertures[1])/2;
    return true;
  }
  setClawTorque(id,value){
    const a=this.actor(id);
    if(!a||a.kind!=="pincer")return false;
    const torque=safe(value,"claw torque");
    if(torque<0||torque>1e7)throw RangeError("Claw torque outside runtime safety");
    a.spec.clawTorque=torque;return true;
  }
  setObjectMass(id,value){
    const obj=this.matter.find(m=>m.id===id&&m.type==="box");
    if(!obj)return false;
    const mass=safe(value,"matter mass");
    if(mass<=0||mass>1e9)throw RangeError("Mass outside physical runtime");
    obj.mass=mass;obj.collider.setMass(mass);return true;
  }
  // Direct authoring ONLY while paused in UI, not a solver-disguised grip.
  reposition(id,p){
    safe(p.x,"editor x");safe(p.y,"editor y");
    const actor=this.actor(id),matter=this.matter.find(m=>m.id===id);
    if(matter?.type==="gate")throw RangeError("Gate pivot is world-fixed");
    const base=actor?.root||matter?.body;if(!base)return false;
    const pos=base.translation(),dx=p.x-pos.x,dy=p.y-pos.y;
    const bodies=actor?[...new Set(actor.parts.map(k=>k.body))]:[base];
    for(const b of bodies){
      const at=b.translation();
      b.setTranslation(V(at.x+dx,at.y+dy),true);
      b.setLinvel(V(),true);b.setAngvel(0,true);
    }
    this.world.propagateModifiedBodyPositionsToColliders();return true;
  }
  undo(){
    const edit=this.authored.pop();if(!edit)return false;
    if(edit.type==="wall"){
      const index=this.walls.findIndex(w=>w.id===edit.id);
      const [x]=this.walls.splice(index,1);
      this.colliderOwner.delete(x.collider.handle);
      this.world.removeCollider(x.collider,true);
    }else{
      const index=this.matter.findIndex(m=>m.id===edit.id);
      const [x]=this.matter.splice(index,1);
      this.colliderOwner.delete(x.collider.handle);
      this.world.removeRigidBody(x.body);
      if(edit.type==="gate"){
        this.world.removeRigidBody(x.anchor);
        this.gates=this.gates.filter(g=>g!==x);
      }
    }
    return true;
  }
  pick(p){
    let nearest=null,dist=Infinity;
    const colliders=[
      ...this.actors.flatMap(a=>a.parts.map(t=>({id:a.id,collider:t.collider}))),
      ...this.matter.map(m=>({id:m.id,collider:m.collider}))
    ];
    for(const c of colliders){
      const exact=c.collider.containsPoint(p);
      const q=exact?p:c.collider.projectPoint(p,true).point;
      const d=Math.hypot(p.x-q.x,p.y-q.y);
      if(d<dist&&(exact||d<.23)){nearest=c.id;dist=d;}
    }
    return nearest;
  }
  pokeAt(point,impulse){
    safe(point?.x,"poke x");safe(point?.y,"poke y");
    safe(impulse?.x,"poke impulse x");safe(impulse?.y,"poke impulse y");
    const strength=norm(impulse);
    if(strength>1e7)throw RangeError("Experimenter impulse exceeds solver-safe finite range");
    if(strength===0)return null;
    const candidates=[
      ...this.actors.flatMap(actor=>actor.parts.map(part=>({
        owner:actor.id,tag:part.tag,collider:part.collider,body:part.body
      }))),
      ...this.matter.map(item=>({owner:item.id,tag:item.type,
        collider:item.collider,body:item.body}))
    ];
    let best=null,distance=Infinity;
    for(const candidate of candidates){
      const hit=candidate.collider.containsPoint(point);
      const q=hit?point:candidate.collider.projectPoint(point,true).point;
      const d=norm(V(point.x-q.x,point.y-q.y));
      if((hit||d<.20)&&d<distance){
        best=candidate;distance=d;
      }
    }
    if(!best)return null;
    // A physical impulse at the chosen collision point, NOT a velocity
    // overwrite or an input to organism cognition. Articulated appendages
    // receive the force on their OWN dynamic rigid body.
    best.body.applyImpulseAtPoint(impulse,point,true);
    return {owner:best.owner,part:best.tag,
      appliedImpulse:strength,at:V(point.x,point.y)};
  }
  motor(a,control){
    const root=a.root,pos=root.translation(),vel=root.linvel();
    const move=control?.move||V();
    const magnitude=Math.min(1,norm(move));
    if(magnitude){
      const desired=V(move.x/magnitude*a.spec.speed,
        move.y/magnitude*a.spec.speed);
      const error=V(desired.x-vel.x,desired.y-vel.y);
      const amount=Math.hypot(error.x,error.y)||1;
      const mass=root.mass();
      const cap=a.spec.motorForce*DT;
      const impulse=V(error.x*mass*Math.min(1,cap/(mass*amount)),
        error.y*mass*Math.min(1,cap/(mass*amount)));
      root.applyImpulse(impulse,true);
    }else{
      // Finite ground-coupled braking, independent of current body mass.
      const m=root.mass(),maxImpulse=a.spec.motorForce*.34*DT,
        impulseLen=m*Math.hypot(vel.x,vel.y);
      const f=impulseLen?Math.min(1,maxImpulse/impulseLen):0;
      root.applyImpulse(V(-vel.x*m*f,-vel.y*m*f),true);
    }
    if(control?.aim){
      const aim=V(control.aim.x-pos.x,control.aim.y-pos.y);
      if(norm(aim)>.4){
        const desired=Math.atan2(aim.y,aim.x);
        const error=wrap(desired-root.rotation());
        const torque=clamp(error*7-root.angvel()*3,
          -a.spec.torque*DT,a.spec.torque*DT);
        root.applyTorqueImpulse(torque,true);
      }
    }
    if(a.kind==="pincer"){
      for(const arm of a.arms){
        const openAngle=arm.sign*.52;
        const closeAngle=-arm.sign*.28;
        const individual=a.targetApertures[arm.index];
        const target=openAngle*individual+closeAngle*(1-individual);
        const relative=wrap(arm.body.rotation()-root.rotation());
        const relativeVelocity=arm.body.angvel()-root.angvel();
        const j=clamp((target-relative)*210-relativeVelocity*29,
          -a.spec.clawTorque*DT,a.spec.clawTorque*DT);
        arm.body.applyTorqueImpulse(j,true);
        root.applyTorqueImpulse(-j,true);
      }
    }
  }
  step(controls={}){
    for(const actor of this.actors){
      const selected=actor.id===this.selected;
      this.motor(actor,selected?controls:null);
    }
    this.world.step();
    this.ticks++;
    let count=0,impulse=0;
    for(const actor of this.actors){
      let localCount=0,localImpulse=0;
      for(const part of actor.parts){
        this.world.contactPairsWith(part.collider,other=>{
          if(this.colliderOwner.get(other.handle)===actor.id)return;
          this.world.contactPair(part.collider,other,manifold=>{
            const n=manifold.numSolverContacts();
            if(!n)return;
            localCount++;
            for(let i=0;i<n;i++)
              localImpulse+=Math.abs(manifold.contactImpulse(i)||0);
          });
        });
      }
      actor.contactCount=localCount;actor.contactImpulse=localImpulse;
      count+=localCount;impulse+=localImpulse;
    }
    this.contactReadout={count,impulse};
  }
  snapshot(){
    return {ticks:this.ticks,actorCount:this.actors.length,
      materialCount:this.matter.length,contacts:this.contactReadout.count,
      actors:this.actors.map(a=>({id:a.id,kind:a.kind,
        x:a.root.translation().x,y:a.root.translation().y,
        angle:a.root.rotation(),parts:a.parts.length,
        aperture:a.targetAperture,
        upperAperture:a.targetApertures[0],lowerAperture:a.targetApertures[1],
        contacts:a.contactCount,
        impulse:a.contactImpulse}))};
  }
}
