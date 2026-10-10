// MATERIAL COMMONS X0 — independent, replaceable, source-readable experiment.
// Gravity-free top-down Rapier 2D. All planar locomotor/brace "support" is an
// explicit finite external proxy, not simulated feet/soil reaction.
// Actual collisions, free material, point impulses, dynamic appendages and
// hinged constraints belong to Rapier, not a scripted gameplay state machine.
import RAPIER from "@dimforge/rapier2d-deterministic";

export const DT=1/60;
export const V=(x=0,y=0)=>({x,y});
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const rot=(p,a)=>V(p.x*Math.cos(a)-p.y*Math.sin(a),p.x*Math.sin(a)+p.y*Math.cos(a));
export const norm=p=>Math.hypot(p.x,p.y);
export const safe=(x,name="value")=>{
  if(typeof x!=="number"||!Number.isFinite(x)||!Number.isFinite(Math.fround(x)))
    throw RangeError("Invalid finite "+name);
  return x;
};
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const PALETTE={reach:"#9fe3be",lever:"#e8c58a",bulk:"#aab8ef"};
const FORMS={
  reach:{mass:80,hx:.52,hy:.47,motor:900,turn:340,speed:2.4,
    torque:620,armLength:1.55,arms:2,reach:.25,brace:80,holdForce:680},
  lever:{mass:49,hx:.47,hy:.35,motor:600,turn:270,speed:3.0,
    torque:470,armLength:2.30,arms:1,reach:.18,brace:55,holdForce:420},
  bulk:{mass:260,hx:1.05,hy:.84,motor:1050,turn:510,speed:1.7,
    torque:0,armLength:0,arms:0,reach:0,brace:2200,holdForce:1100}
};
export const BODY_PRESETS=Object.freeze(FORMS);
export class CommonsWorld{
  constructor({empty=false,solverIterations=12}={}){
    if(!Number.isInteger(solverIterations)||solverIterations<4||solverIterations>40)
      throw RangeError("Solver budget outside 4..40");
    this.world=new RAPIER.World(V(0,0));
    this.world.timestep=DT;
    this.world.integrationParameters.numSolverIterations=solverIterations;
    this.actors=[];this.matter=[];this.walls=[];
    this.colliderOwner=new Map();this.created=[];
    this.next=0;this.ticks=0;this.selected=null;
    this.hold=null;this.holdEvents=0;this.holdBreaks=0;this.holdImpulse=0;
    this.counts={contacts:0,load:0,reflex:0,braces:0,driveTicks:0,driveImpulse:0};
    this.lastSource="none";
    if(!empty)this.defaultScene();
  }
  newBody(x,y,angle=0,type="dynamic"){
    const d=type==="fixed"?RAPIER.RigidBodyDesc.fixed():
      RAPIER.RigidBodyDesc.dynamic().setLinearDamping(.65).setAngularDamping(1.4);
    return this.world.createRigidBody(d.setTranslation(safe(x),safe(y))
      .setRotation(safe(angle)));
  }
  box(body,hx,hy,mass,local=V(),owner=null){
    if(hx<=.03||hy<=.03)throw RangeError("Invalid physical half extents");
    const desc=RAPIER.ColliderDesc.cuboid(hx,hy)
      .setFriction(.78).setRestitution(.07).setTranslation(local.x,local.y);
    if(body.isDynamic())desc.setMass(safe(mass,"collider mass"));
    const collider=this.world.createCollider(desc,body);
    if(owner)this.colliderOwner.set(collider.handle,owner);
    return collider;
  }
  addActor(form,pos,angle=0,specOverrides={}){
    if(!FORMS[form])throw RangeError("Unknown initial reference shape");
    const base=FORMS[form],id="actor-"+(++this.next);
    const spec={...base,...specOverrides};
    for(const key of ["mass","motor","speed","armLength","torque","brace","holdForce","hx","hy","arms"])
      if(spec[key]!==undefined)safe(spec[key],key);
    if(spec.mass<=0||spec.motor<0||spec.speed<0||spec.torque<0||
      spec.brace<0||spec.holdForce<0||spec.hx<=.10||spec.hy<=.10||
      !Number.isInteger(spec.arms)||spec.arms<0||spec.arms>2||
      (spec.arms>0&&spec.armLength<.8))
      throw RangeError("Invalid body force/geometry");
    const root=this.newBody(pos.x,pos.y,angle);
    const a={id,form,spec,root,parts:[],arms:[],target:[.82,.82],
      observed:{load:0,parts:[0,0,0],contacts:0},
      response:{latch:0,arm:-1,bracing:false,events:0},
      color:PALETTE[form],control:"sense",armReflexEnabled:true};
    const hull=this.box(root,spec.hx,spec.hy,spec.mass,V(),id);
    a.parts.push({body:root,collider:hull,tag:"hull"});
    if(form==="bulk"){
      const nose=this.box(root,.28,.59,17,V(spec.hx+.18,0),id);
      a.parts.push({body:root,collider:nose,tag:"prow"});
    }
    for(let i=0;i<spec.arms;i++){
      const sign=spec.arms===1?1:i===0?-1:1;
      const side=spec.arms===1?0:sign*(spec.hy+.23);
      const shoulder=V(.24,side),relative=sign*.34;
      const armLength=spec.armLength,half=armLength/2;
      const parentOffset=rot(shoulder,angle),childOffset=rot(V(half,0),angle+relative);
      const armBody=this.newBody(pos.x+parentOffset.x+childOffset.x,
        pos.y+parentOffset.y+childOffset.y,angle+relative);
      const shaft=this.box(armBody,half,.13,Math.max(3,spec.mass*.18),V(),id);
      const tip=this.box(armBody,.115,.27,2.1,V(half-.18,-sign*.13),id);
      const joint=this.world.createImpulseJoint(
        RAPIER.JointData.revolute(shoulder,V(-half,0)),root,armBody,true);
      const unit={index:i,sign,body:armBody,joint,shaft,tip,half,shoulder};
      a.arms.push(unit);
      a.parts.push({body:armBody,collider:shaft,tag:"arm"+i});
      a.parts.push({body:armBody,collider:tip,tag:"tip"+i});
    }
    this.actors.push(a);if(!this.selected)this.selected=id;
    this.world.propagateModifiedBodyPositionsToColliders();
    return a;
  }
  addMatter(pos,opts={}){
    const {hx=.50,hy=.42,mass=45,angle=0,form="block",created=true}=opts;
    safe(mass,"matter mass");if(mass<=0)throw RangeError("Material mass must be positive");
    const id="matter-"+(++this.next),body=this.newBody(pos.x,pos.y,angle);
    const collider=this.box(body,hx,hy,mass,V(),id);
    const m={id,kind:"free",form,body,collider,hx,hy,mass};
    this.matter.push(m);if(created)this.created.push(id);
    return m;
  }
  addWall(pos,{hx=.25,hy=1.4,created=true}={}){
    const id="wall-"+(++this.next),base=this.newBody(pos.x,pos.y,0,"fixed");
    const collider=this.box(base,hx,hy,0,V(),id),o={id,body:base,collider,hx,hy};
    this.walls.push(o);if(created)this.created.push(id);
    return o;
  }
  addHinge(pos,{length=2.8,mass=85,angle=.2,driveSpeed=0,driveTorque=0,created=true}={}){
    const id="hinge-"+(++this.next);
    if(length<=.5||mass<=0)throw RangeError("Invalid physical hinge");
    safe(driveSpeed,"hinge speed");safe(driveTorque,"hinge torque");
    if(Math.abs(driveSpeed)>20||driveTorque<0||driveTorque>1e7)
      throw RangeError("Unsupported finite hinge drive");
    const pivot=this.newBody(pos.x,pos.y,0,"fixed");
    const offset=rot(V(length/2,0),angle);
    const body=this.newBody(pos.x+offset.x,pos.y+offset.y,angle);
    const collider=this.box(body,length/2,.15,mass,V(),id);
    const joint=this.world.createImpulseJoint(
      RAPIER.JointData.revolute(V(),V(-length/2,0)),pivot,body,true);
    const o={id,kind:"hinge",body,pivot,joint,collider,length,mass,
      driveSpeed,driveTorque,lastDriveImpulse:0,x:pos.x,y:pos.y};
    this.matter.push(o);if(created)this.created.push(id);
    return o;
  }
  addRail(pos,{length=2.7,mass=90,angle=0,created=true}={}){
    // A separate *sliding* material constraint, not a scripted moveable door.
    const id="rail-"+(++this.next),fixed=this.newBody(pos.x,pos.y,0,"fixed");
    const body=this.newBody(pos.x,pos.y,angle);
    const collider=this.box(body,length/2,.20,mass,V(),id);
    const joint=this.world.createImpulseJoint(
      RAPIER.JointData.prismatic(V(),V(),V(1,0)),fixed,body,true);
    const o={id,kind:"rail",body,pivot:fixed,joint,collider,length,mass,
      x:pos.x,y:pos.y};
    this.matter.push(o);if(created)this.created.push(id);
    return o;
  }
  defaultScene(){
    // One continuous commons, no finish point, crossing goal, scripted roles
    // or narrow corridor that becomes the sole source of an event.
    for(const [x,y,hx,hy] of [
      [21,-.5,21.5,.5],[21,26.5,21.5,.5],[-.5,13,.5,13.5],
      [42.5,13,.5,13.5],[7,6,.22,2.4],[35.5,20,.22,2.9],
      [27.2,5,.25,2.5]
    ])this.addWall(V(x,y),{hx,hy,created:false});
    this.addActor("reach",V(13.0,12.2),.2);
    this.addActor("lever",V(18.5,10.1),-.25);
    this.addActor("bulk",V(26.5,14.2),2.75);
    this.addActor("reach",V(30.5,10.5),2.35,
      {mass:49,armLength:1.15,motor:710});
    for(const [x,y,hx,hy,mass,form] of [
      [15.5,12.1,.56,.45,28,"block"],
      [19.7,12.8,1.18,.17,63,"beam"],
      [22.3,9.4,.38,.52,240,"block"],
      [26.2,17.3,.72,.43,52,"block"],
      [11.7,17.0,.40,.38,17,"block"],
      [34.0,14.9,1.40,.16,165,"beam"]
    ])this.addMatter(V(x,y),{hx,hy,mass,form,created:false});
    this.addHinge(V(16.8,13.25),{length:3.7,mass:112,angle:-.68,
      driveSpeed:1.1,driveTorque:900,created:false});
    this.addRail(V(21.6,6.7),{length:2.8,mass:75,created:false});
  }
  actor(id){return this.actors.find(a=>a.id===id)||null;}
  item(id){return this.matter.find(m=>m.id===id)||null;}
  select(id){const next=this.actor(id)?.id||null;
    if(this.hold && this.hold.actorId!==next)this.endHold();
    this.selected=next;return this.selected;}
  setArmReflex(id,enabled){
    const a=this.actor(id);if(!a)return false;
    a.armReflexEnabled=Boolean(enabled);
    if(!enabled){a.response.latch=0;a.response.arm=-1;}
    return true;
  }
  setLocalResponse(id,enabled){
    const a=this.actor(id);if(!a)return false;
    a.control=enabled?"sense":"quiet";
    if(!enabled){a.response.latch=0;a.response.arm=-1;}
    return true;
  }
  setActiveArm(id,index,value){
    const a=this.actor(id);if(!a||!a.arms[index])return false;
    a.target[index]=clamp(safe(value,"arm command"),0,1);
    return true;
  }
  setSpec(id,key,value){
    const a=this.actor(id);if(!a||!["motor","speed","brace","torque","mass","holdForce"].includes(key))return false;
    const n=safe(value,key);
    if(n<0 ||(key==="mass"&&n<=0)||n>1e7)throw RangeError("Outside experimental physical range");
    a.spec[key]=n;
    if(key==="mass")a.parts[0].collider.setMass(n);
    return true;
  }
  setMaterialMass(id,mass){
    const m=this.item(id);if(!m)return false;
    const n=safe(mass,"material mass");if(n<=0||n>1e8)throw RangeError("Unsupported physical mass");
    m.mass=n;m.collider.setMass(n);return true;
  }
  setHingeDrive(id,speed,torque){
    const m=this.item(id);if(!m||m.kind!=="hinge")return false;
    const s=safe(speed,"hinge drive speed"),t=safe(torque,"hinge motor torque");
    if(Math.abs(s)>20||t<0||t>1e7)throw RangeError("Invalid hinge drive");
    m.driveSpeed=s;m.driveTorque=t;return true;
  }
  stepMaterialDrives(){
    for(const m of this.matter){
      if(m.kind!=="hinge")continue;
      m.lastDriveImpulse=0;
      if(m.driveTorque===0 || m.driveSpeed===0)continue;
      // Explicit world-anchored finite energy input, NOT autonomous actor action.
      // A loaded or blocked hinge can slow/stall; never overwrite angular velocity.
      const inertia=Math.max(1,m.mass*m.length*m.length/12);
      const request=(m.driveSpeed-m.body.angvel())*inertia*.75;
      const cap=m.driveTorque*DT;
      const delivered=clamp(request,-cap,cap);
      m.body.applyTorqueImpulse(delivered,true);
      m.lastDriveImpulse=Math.abs(delivered);
      if(m.lastDriveImpulse>0){
        this.counts.driveTicks++;
        this.counts.driveImpulse+=m.lastDriveImpulse;
      }
    }
  }
  observe(){
    let total=0,allLoad=0;
    for(const actor of this.actors){
      const loads=[0,0,0];let contacts=0;
      actor.parts.forEach(part=>{
        this.world.contactPairsWith(part.collider,other=>{
          if(this.colliderOwner.get(other.handle)===actor.id)return;
          this.world.contactPair(part.collider,other,manifold=>{
            let load=0;for(let j=0;j<manifold.numSolverContacts();j++){
              const n=manifold.contactImpulse(j);
              if(Number.isFinite(n))load+=Math.abs(n);
            }
            if(load<=0)return;
            const index=part.tag.startsWith("arm")||part.tag.startsWith("tip")?
              Number(part.tag.at(-1))+1:0;
            loads[index]+=load;contacts++;
          });
        });
      });
      actor.observed={load:loads.reduce((a,b)=>a+b,0),parts:loads,contacts};
      total+=contacts;allLoad+=actor.observed.load;
    }
    this.counts.contacts=total;this.counts.load=allLoad;
  }
  motor(a,command=null){
    const root=a.root,pos=root.translation(),vel=root.linvel();
    if(command && norm(command.move||V())>.01){
      const d=command.move,length=norm(d),s=a.spec.speed,
        target=V(d.x/length*s,d.y/length*s);
      const impulse=V((target.x-vel.x)*root.mass(),(target.y-vel.y)*root.mass());
      const amp=norm(impulse),scale=amp?Math.min(1,a.spec.motor*DT/amp):0;
      root.applyImpulse(V(impulse.x*scale,impulse.y*scale),true);
    }
    if(command?.aim){
      const dx=command.aim.x-pos.x,dy=command.aim.y-pos.y;
      if(Math.hypot(dx,dy)>.3){
        const error=wrap(Math.atan2(dy,dx)-root.rotation());
        const requested=clamp(error*8-root.angvel()*2.5,-a.spec.turn*DT,a.spec.turn*DT);
        root.applyTorqueImpulse(requested,true);
      }
    }
    // An actor with no external input is genuinely quiet until material
    // contact acts upon it. This is NOT cyclic roaming or a target policy.
    if(!command && a.control==="sense" && a.observed.load>2 && a.spec.brace>0){
      // A finite external top-down support proxy. Higher forces win.
      const impulse=V(-vel.x*root.mass(),-vel.y*root.mass());
      const amp=norm(impulse),scale=amp?Math.min(1,a.spec.brace*DT/amp):0;
      root.applyImpulse(V(impulse.x*scale,impulse.y*scale),true);
      if(scale>0){this.counts.braces++;a.response.bracing=true;}
    }else a.response.bracing=false;
    // A purely local, bounded pressure reaction on a distinct physical
    // effector. No name, position, identity or objective is read.
    if(!command && a.control==="sense" && a.armReflexEnabled && a.arms.length>0 && a.response.latch<=0){
      const signals=a.observed.parts.slice(1);
      const value=Math.max(...signals);
      if(value>1.0){
        const touched=signals.indexOf(value);
        const responding=a.arms.length>1?1-touched:touched;
        a.response.arm=responding;a.response.latch=65;
        a.response.events++;this.counts.reflex++;
      }
    }
    if(a.response.latch>0)a.response.latch--;
    for(const arm of a.arms){
      const touchedCommand=command ? a.target[arm.index] :
        ((a.response.latch>0 && arm.index===a.response.arm) ? .20 : .82);
      const open=arm.sign*.50,close=-arm.sign*.36;
      const target=open*touchedCommand+close*(1-touchedCommand);
      const delta=wrap(arm.body.rotation()-root.rotation());
      const speed=arm.body.angvel()-root.angvel();
      const torque=clamp((target-delta)*165-speed*23,-a.spec.torque*DT,a.spec.torque*DT);
      arm.body.applyTorqueImpulse(torque,true);
      root.applyTorqueImpulse(-torque,true);
    }
  }

  // Intentionally a BODY-ORIGIN action, not the researcher's free-space impulse.
  // A physical collider on the selected actor must already touch the material.
  // The finite actuator acts at a point on an actual root or articulated limb.
  beginHold(point){
    safe(point.x);safe(point.y);this.endHold();
    const actor=this.actor(this.selected);
    if(!actor||actor.spec.holdForce<=0)return false;
    const targets=this.matter.filter(m=>m.collider.containsPoint(point)||
      norm(V(point.x-m.collider.projectPoint(point,true).point.x,
        point.y-m.collider.projectPoint(point,true).point.y))<.12);
    let best=null;
    for(const m of targets){
      for(const part of actor.parts){
        // Approximate the closest exterior surfaces of two convex colliders.
        // Starting a hold never permits remote acquisition based on cursor range.
        let onMatter=m.collider.projectPoint(part.body.translation(),false).point;
        let onActor=part.collider.projectPoint(onMatter,false).point;
        onMatter=m.collider.projectPoint(onActor,false).point;
        onActor=part.collider.projectPoint(onMatter,false).point;
        const gap=norm(V(onMatter.x-onActor.x,onMatter.y-onActor.y));
        if(gap<=.18&&(!best||gap<best.gap))
          best={m,part,onMatter,onActor,gap};
      }
    }
    if(!best)return false;
    const {m,part,onMatter,onActor}=best;
    const toLocal=(body,p)=>{
      const q=body.translation();
      return rot(V(p.x-q.x,p.y-q.y),-body.rotation());
    };
    this.hold={actorId:actor.id,objectId:m.id,actorBody:part.body,
      objectBody:m.body,actorPart:part.tag,
      actorAnchor:toLocal(part.body,onActor),
      objectAnchor:toLocal(m.body,onMatter),
      deliveredImpulse:0};
    this.holdEvents++;
    return true;
  }
  endHold(){this.hold=null;}
  holdPoints(){
    if(!this.hold)return null;
    const h=this.hold;
    const worldPoint=(body,local)=>{
      const p=body.translation(),r=rot(local,body.rotation());
      return V(p.x+r.x,p.y+r.y);
    };
    return {actor:worldPoint(h.actorBody,h.actorAnchor),
      object:worldPoint(h.objectBody,h.objectAnchor)};
  }
  stepHold(){
    if(!this.hold)return;
    const h=this.hold,actor=this.actor(h.actorId);
    if(!actor||actor.spec.holdForce<=0){this.endHold();return;}
    const {actor:p,object:q}=this.holdPoints();
    // Body-attached short contact hold, never an indefinitely stretching tether.
    // Losing material proximity releases the force rather than remote towing.
    if(norm(V(p.x-q.x,p.y-q.y))>.72){
      this.holdBreaks++;this.endHold();return;
    }
    const atVelocity=(body,at)=>{
      const v=body.linvel(),o=body.translation(),a=body.angvel();
      return V(v.x-a*(at.y-o.y),v.y+a*(at.x-o.x));
    };
    const vp=atVelocity(h.actorBody,p),vq=atVelocity(h.objectBody,q);
    const strength=1050,damper=135;
    const impulse=V(((p.x-q.x)*strength+(vp.x-vq.x)*damper)*DT,
      ((p.y-q.y)*strength+(vp.y-vq.y)*damper)*DT);
    const magnitude=norm(impulse),cap=actor.spec.holdForce*DT;
    const factor=magnitude>cap?cap/magnitude:1;
    const ix=impulse.x*factor,iy=impulse.y*factor;
    if(!Number.isFinite(ix+iy))throw RangeError("Contact hold unstable");
    h.objectBody.applyImpulseAtPoint(V(ix,iy),q,true);
    h.actorBody.applyImpulseAtPoint(V(-ix,-iy),p,true);
    h.deliveredImpulse=norm(V(ix,iy));this.holdImpulse+=h.deliveredImpulse;
  }
  step({manual=null}={}){
    for(const a of this.actors)this.motor(a,a.id===this.selected?manual:null);
    this.stepHold();
    this.stepMaterialDrives();
    this.world.step();this.ticks++;this.observe();return this.snapshot();
  }
  poke(point,impulse){
    safe(point.x);safe(point.y);safe(impulse.x);safe(impulse.y);
    const m=norm(impulse);if(m>1e7)throw RangeError("Impulse outside numerical safe range");
    if(m===0)return null;
    const bodies=[
      ...this.actors.flatMap(a=>a.parts.map(p=>({...p,id:a.id}))),
      ...this.matter.map(x=>({body:x.body,collider:x.collider,id:x.id,tag:x.kind}))
    ];
    let found=null,distance=Infinity;
    for(const part of bodies){
      const hit=part.collider.containsPoint(point);
      const q=hit?point:part.collider.projectPoint(point,true).point;
      const d=norm(V(q.x-point.x,q.y-point.y));
      if((hit||d<.18)&&d<distance){found=part;distance=d;}
    }
    if(!found)return null;
    found.body.applyImpulseAtPoint(impulse,point,true);
    this.lastSource="researcher external impulse";
    return {id:found.id,part:found.tag,impulse:m};
  }
  pose(id,pos,angle=null){
    if(this.hold && (this.hold.actorId===id||this.hold.objectId===id))this.endHold();
    const a=this.actor(id),o=this.item(id);
    if(!a&&!o)return false;
    if(o?.kind==="rail")throw RangeError("Rail base position is fixed");
    const base=a?.root||o.body,start=base.translation(),
      delta=angle===null?0:wrap(safe(angle)-base.rotation());
    const anchor=o?.kind==="hinge"?V(o.x,o.y):start;
    const target=o?.kind==="hinge"?anchor:pos;
    if(o?.kind==="hinge" && angle===null)
      throw RangeError("World-pinned hinge cannot translate");
    const bodies=a?[...new Set(a.parts.map(p=>p.body))]:[base];
    for(const body of bodies){
      const p=body.translation(),r=rot(V(p.x-anchor.x,p.y-anchor.y),delta);
      body.setTranslation(V(target.x+r.x,target.y+r.y),true);
      body.setRotation(body.rotation()+delta,true);
      body.setLinvel(V(),true);body.setAngvel(0,true);
    }
    this.world.propagateModifiedBodyPositionsToColliders();
    if(a){a.observed={load:0,parts:[0,0,0],contacts:0};a.response.latch=0;}
    return true;
  }
  pick(point){
    const list=[...this.actors.flatMap(a=>a.parts.map(p=>({id:a.id,col:p.collider}))),
      ...this.matter.map(m=>({id:m.id,col:m.collider}))];
    let best=null,dist=.18;
    for(const p of list){
      if(p.col.containsPoint(point))return p.id;
      const q=p.col.projectPoint(point,true).point;
      const d=norm(V(point.x-q.x,point.y-q.y));
      if(d<dist){best=p.id;dist=d;}
    }
    return best;
  }
  undo(){
    const id=this.created.pop();if(!id)return false;
    const w=this.walls.find(o=>o.id===id),m=this.item(id);
    if(w){this.colliderOwner.delete(w.collider.handle);this.world.removeRigidBody(w.body);
      this.walls=this.walls.filter(x=>x!==w);return true;}
    if(m){if(this.hold?.objectId===m.id)this.endHold();
      this.colliderOwner.delete(m.collider.handle);
      this.world.removeRigidBody(m.body);
      if(m.pivot)this.world.removeRigidBody(m.pivot);
      this.matter=this.matter.filter(x=>x!==m);return true;}
    return false;
  }
  snapshot(){
    return {ticks:this.ticks,actors:this.actors.length,matter:this.matter.length,
      contacts:this.counts.contacts,reflexEvents:this.counts.reflex,
      braceEvents:this.counts.braces,selected:this.selected,
      holding:this.hold?.objectId||null,holdEvents:this.holdEvents,
      holdBreaks:this.holdBreaks,driveTicks:this.counts.driveTicks};
  }
  dispose(){this.endHold();this.world.free();}
}
