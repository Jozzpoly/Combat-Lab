// K1 scout: kinetic obstruction/cover as a non-transit, material action.
// New isolated branch from neutral main; no E1/W2 traffic or path steering.
// No "protected" flags: projectiles, guards, loads and witness collide in Rapier.
// A rigid two-collider body is a serious low-complexity comparator to a hinged
// body with identical root/panel masses and initial collider shapes.
import RAPIER from "@dimforge/rapier2d-deterministic";
export const DT=1/60;
const V=(x=0,y=0)=>({x,y});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const wrap=n=>Math.atan2(Math.sin(n),Math.cos(n));
const digits=n=>Math.round(n*10000)/10000;
export class KineticField {
  constructor({kind="hinged", preset="workshop"}={}) {
    this.world=new RAPIER.World(V());
    this.world.timestep=DT;
    this.entities=[];
    this.shots=[];
    this.ticks=0;this.externalShots=0;this.driveImpulse=0;this.jointImpulse=0;
    this.guard=null;this.witness=null;
    this.build(kind,preset);
  }
  add(kind,x,y,parts,{fixed=false,angle=0,ccd=false}={}) {
    const desc=fixed?RAPIER.RigidBodyDesc.fixed():RAPIER.RigidBodyDesc.dynamic();
    desc.setTranslation(x,y).setRotation(angle);
    if(!fixed)desc.setLinearDamping(.27).setAngularDamping(.40).setCcdEnabled(ccd);
    const body=this.world.createRigidBody(desc);
    const e={kind,body,parts:[],initial:V(x,y)};
    for(const p of parts){
      const shape=p.r?RAPIER.ColliderDesc.ball(p.r):RAPIER.ColliderDesc.cuboid(p.hx,p.hy);
      shape.setMass(p.mass??1).setFriction(p.friction??.6).setRestitution(p.bounce??.08);
      if(p.dx||p.dy)shape.setTranslation(p.dx||0,p.dy||0);
      const collider=this.world.createCollider(shape,body);
      e.parts.push({collider,shape:{...p}});
    }
    this.entities.push(e);return e;
  }
  wall(x,y,hx,hy){return this.add("wall",x,y,[{hx,hy,mass:0}],{fixed:true});}
  load(x,y,hx=.6,hy=.38,mass=32){return this.add("load",x,y,[{hx,hy,mass}]);}
  small(x,y){return this.add("witness",x,y,[{r:.42,mass:11}]);}
  makeGuard(x,y,kind="hinged"){
    if(!["hinged","rigid","bare"].includes(kind))throw Error("Unknown morphology");
    const root=this.add(kind,x,y,
      [{hx:.54,hy:.48,mass:65},...(kind==="rigid"?[{hx:.20,hy:1.50,mass:25,dx:-.74}]:[])]);
    root.panel=null;root.joint=null;root.target=0;root.maxImpulse=.28;root.panelControl=false;
    if(kind==="hinged"){
      const arm=this.add("hinge-panel",x-.74,y,[{hx:.20,hy:1.50,mass:25}]);
      // The two physical shapes just meet at the joint. Connected contact ON.
      const joint=this.world.createImpulseJoint(
        RAPIER.JointData.revolute(V(-.54,0),V(.20,0)),
        root.body,arm.body,true);
      joint.setContactsEnabled(true);
      root.panel=arm;root.joint=joint;
    }
    return root;
  }
  build(kind,preset){
    for(const [x,y,hx,hy] of [[16,-.30,16,.30],[16,20.30,16,.30],
      [-.3,10,.30,10],[32.3,10,.30,10]])this.wall(x,y,hx,hy);
    this.guard=this.makeGuard(15.5,10,kind);
    this.witness=this.small(24.4,10);
    if(preset==="workshop"){
      this.load(19.3,5.6,.72,.23,53);
      this.load(21.1,14.6,.25,1.35,76);
      this.load(8.0,16.2,.85,.34,40);
      this.small(25.5,15);
    }
    this.world.propagateModifiedBodyPositionsToColliders();
  }
  shoot(start,end,impulse=20) {
    const dx=end.x-start.x,dy=end.y-start.y,L=Math.hypot(dx,dy);
    if(!(L>.1)||!Number.isFinite(impulse)||impulse<=0||impulse>120)return null;
    const shot=this.add("projectile",start.x,start.y,
      [{r:.14,mass:.60,bounce:.16,friction:.20}],{ccd:true});
    const force=V(dx/L*impulse,dy/L*impulse);
    shot.body.applyImpulse(force,true);
    this.shots.push(shot);this.externalShots++;
    return shot;
  }
  aimPanel(value){if(!Number.isFinite(value))return;this.guard.target=clamp(value,-1.3,1.3);this.guard.panelControl=true;}
  // Purely bounded motor impulses, not collision teleports or inverse kinematics.
  panelStep(guard=this.guard){
    if(guard?.kind!=="hinged"||!guard.panelControl)return;
    const panel=guard.panel.body,root=guard.body;
    const relative=wrap(panel.rotation()-root.rotation());
    const angular=panel.angvel()-root.angvel();
    const torque=clamp(wrap(guard.target-relative)*.42-angular*.13,
      -guard.maxImpulse,guard.maxImpulse);
    panel.applyTorqueImpulse(torque,true);
    root.applyTorqueImpulse(-torque,true);
    this.jointImpulse+=Math.abs(torque);
  }
  step({x=0,y=0}={}){
    this.panelStep();
    const body=this.guard.body,L=Math.hypot(x,y);
    if(L>.01){
      // Explicit user-operated finite root-traction proxy; not feet or real support.
      const speed=2.8,vel=body.linvel(),mass=body.mass();
      const target=V(x/L*speed,y/L*speed);
      let imp=V((target.x-vel.x)*mass,(target.y-vel.y)*mass);
      const q=Math.hypot(imp.x,imp.y),max=600*DT;
      if(q>max){imp.x*=max/q;imp.y*=max/q;}
      body.applyImpulse(imp,true);this.driveImpulse+=Math.hypot(imp.x,imp.y);
    }
    this.world.step();this.ticks++;
  }
  reposition(e,point){
    if(!e||e.kind==="wall"||e.kind==="projectile"||!Number.isFinite(point.x)||!Number.isFinite(point.y))return false;
    const p=e.body.translation(),d=V(point.x-p.x,point.y-p.y);
    for(const part of [e,...(e.panel?[e.panel]:[])]){
      const q=part.body.translation();
      part.body.setTranslation(V(q.x+d.x,q.y+d.y),true);
      part.body.setLinvel(V(),true);part.body.setAngvel(0,true);
    }
    e.initial=V(point.x,point.y); // Author reposition resets the outcome reference; it is NOT solver travel.
    this.world.propagateModifiedBodyPositionsToColliders();return true;
  }
  pick(p){
    let hit=null,d=Infinity;
    for(const e of this.entities){
      if(e.kind==="wall"||e.kind==="projectile")continue;
      for(const t of e.parts){
        const q=t.collider.translation(),v=Math.hypot(q.x-p.x,q.y-p.y);
        const r=t.shape.r??Math.hypot(t.shape.hx,t.shape.hy);
        if(v<r+.25&&v<d){hit=e;d=v;}
      }
    }
    return hit;
  }
  trace(){
    const wp=this.witness.body.translation(),gp=this.guard.body.translation();
    return {ticks:this.ticks,guard:this.guard.kind,witness:V(digits(wp.x),digits(wp.y)),
      witnessTravel:digits(Math.hypot(wp.x-this.witness.initial.x,wp.y-this.witness.initial.y)),
      guardPosition:V(digits(gp.x),digits(gp.y)),guardAngle:digits(this.guard.body.rotation()),
      panelAngle:this.guard.panel?digits(wrap(this.guard.panel.body.rotation()-this.guard.body.rotation())):null,
      panelControl:this.guard.panelControl,
      panelsContactEnabled:this.guard.joint?this.guard.joint.contactsEnabled():null,
      shotStates:this.shots.map(s=>{const p=s.body.translation(),v=s.body.linvel();
        return {p:V(digits(p.x),digits(p.y)),v:V(digits(v.x),digits(v.y))};}),
      externalShots:this.externalShots,driveImpulse:digits(this.driveImpulse),
      boundedPanelImpulse:digits(this.jointImpulse),
      finite:this.entities.every(e=>{const p=e.body.translation(),v=e.body.linvel();return [p.x,p.y,v.x,v.y,e.body.rotation(),e.body.angvel()].every(Number.isFinite);})};
  }
  dispose(){this.world.free();}
}
export function runK1Counterfactual(){
  const cases=[];
  for(const kind of ["bare","rigid","hinged"]){
    for(const interceptY of [10,11.2,12.0]){
      const field=new KineticField({kind,preset:"probe"});
      try{
        field.reposition(field.witness,V(24.4,interceptY));
        const before=field.trace();
        field.shoot(V(3,interceptY),V(27,interceptY),20);
        for(let i=0;i<50;i++)field.step();
        const after=field.trace();
        if(!after.finite||after.externalShots!==1||after.driveImpulse!==0)
          throw Error("Invalid K1 physics or source attribution "+kind+" "+interceptY);
        cases.push({kind,interceptY,before,after});
      }finally{field.dispose();}
    }
  }
  // This is a measurement, NOT a required anatomy victory; the rigid control
  // might be equally protective, or the witness may be missed by off-axis shots.
  return {source:"Rapier2D deterministic, identical shots, true zero-torque passive actuator",cases,
    caveat:"Projectile paths differ; witnessTravel is NOT automatically proof of hit or protection."};
}
