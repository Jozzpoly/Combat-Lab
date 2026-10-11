// An independently falsifiable locomotor contrast, not a species simulation.
// Two real dynamic bodies translate relative to one another along a Rapier
// prismatic joint. The internal stroke alone is reciprocal; progression
// requires a finite external supporting impulse against the authored ground.
import RAPIER from "@dimforge/rapier2d-deterministic";

const DT=1/60;
const v=(x,y)=>({x,y});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mag=p=>Math.hypot(p.x,p.y);

export function createInchwormProbe({ groundForce=900, muscleForce=850,
  x=6,y=8, headMass=42, rearMass=42,
  tractionAt=()=>1, cycleTicks=100 }={}) {
  const world=new RAPIER.World(v(0,0));world.timestep=DT;
  const make=(px,m)=> {
    const body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(px,y).setLinearDamping(.14)
      .setAngularDamping(.9).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.cuboid(.44,.31)
      .setMass(m).setFriction(.7).setRestitution(0),body);
    return body;
  };
  const head=make(x,headMass),rear=make(x-1.16,rearMass);
  const jointData=RAPIER.JointData.prismatic(v(0,0),v(0,0),v(1,0));
  jointData.limitsEnabled=true;
  jointData.limits=[-1.85,-.73];
  const joint=world.createImpulseJoint(jointData,head,rear,true);
  const start=v((head.translation().x*headMass+
    rear.translation().x*rearMass)/(headMass+rearMass),y);
  let tick=0,last={},supportImpulse=0,strokeImpulse=0;
  function step(){
    const phase=(tick%cycleTicks)/cycleTicks;
    const extending=phase<.5;
    const anchor=extending?rear:head;
    const h=head.translation(),r=rear.translation();
    const hv=head.linvel(),rv=rear.linvel();
    const span=h.x-r.x, relative=hv.x-rv.x;
    const target=extending?1.64:.88;
    const f=clamp((target-span)*180-relative*42,-muscleForce,muscleForce);
    // Internal forces are equal and opposite, with *no* global drive.
    head.applyImpulse(v(f*DT,0),true);
    rear.applyImpulse(v(-f*DT,0),true);
    strokeImpulse=f*DT;
    // External finite ground grip of the supporting body, at its physical
    // location. It may be absent or weak; it does NOT directly prescribe
    // the position or speed of either part.
    const vel=anchor.linvel(), mass=anchor.mass();
    const maxJ=groundForce*DT*clamp(tractionAt(anchor.translation()),0,1);
    const raw=v(-vel.x*mass,-vel.y*mass);
    const ratio=mag(raw)>0?Math.min(1,maxJ/mag(raw)):0;
    const j=v(raw.x*ratio,raw.y*ratio);
    anchor.applyImpulse(j,true);supportImpulse=mag(j);
    world.step();tick++;
    const p=head.translation(),q=rear.translation();
    const cx=(p.x*headMass+q.x*rearMass)/(headMass+rearMass);
    const cy=(p.y*headMass+q.y*rearMass)/(headMass+rearMass);
    last={tick,phase:extending?"extend":"retract",head:{...p},
      rear:{...q},span:p.x-q.x,com:v(cx,cy),
      deltaX:cx-start.x,supportImpulse,strokeImpulse,
      jointValid:joint.isValid()};
    return last;
  }
  return {world,head,rear,joint,step,
    measure:()=>last,free:()=>world.free()};
}
