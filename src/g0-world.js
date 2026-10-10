// G0 source-of-propulsion falsifier. A WHEELED CALIBRATOR, not an animal,
// gait, selected 3D game substrate, or Combat Lab foundation.
// No root-body translation impulse in contact-drive mode. All horizontal work
// arises through motorized joints, real grounded wheel collider friction,
// 3D gravity/normal response and Rapier joint constraints.
// Rigid vehicle shape is intentional cheap physical baseline for future gaits.
import RAPIER from "@dimforge/rapier3d-compat";
export const DT=1/60, V3=(x=0,y=0,z=0)=>({x,y,z});
export async function initGroundPhysics(){await RAPIER.init();}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1e5)/1e5;
const finite=(...v)=>v.every(Number.isFinite);

export class GroundDriveWorld{
 constructor({mu=1,gravity=9.81,motor=380,mode="wheels",obstacle=true, wheelRadius=.48}={}){
  if(!finite(mu,gravity,motor,wheelRadius)||mu<0||mu>3||
    gravity<0||gravity>20||motor<0||motor>1200||
    wheelRadius<.15||wheelRadius>.8)throw RangeError("Invalid test parameters");
  if(!["wheels","root-proxy","passive"].includes(mode))throw RangeError("mode");
  this.settings={mu,gravity,motor,mode,obstacle,wheelRadius};
  this.world=new RAPIER.World(V3(0,-gravity,0));
  this.world.timestep=DT;
  this.world.integrationParameters.numSolverIterations=16;
  this.world.integrationParameters.numInternalPgsIterations=4;
  this.ticks=0;this.motorEnergyProxy=0;this.rootImpulseSum=0;
  this.wheelContacts=0;this.wheelContactImpulse=0;
  this.obstacleContact=0;this.obstacleImpulse=0;this.lastWheelGround=0;
  const fixed=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,-.25,0));
  this.groundBody=fixed;
  this.ground=this.world.createCollider(RAPIER.ColliderDesc.cuboid(110,.25,24)
   .setFriction(mu).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Multiply)
   .setRestitution(0),fixed);
  this.chassis=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
   .setTranslation(-9,.98,0).setLinearDamping(.045).setAngularDamping(.12)
   .setCcdEnabled(true));
  this.chassisCollider=this.world.createCollider(RAPIER.ColliderDesc.cuboid(1.1,.22,.58)
   .setMass(95).setFriction(.6).setRestitution(0),this.chassis);
  this.wheels=[];
  const radius=wheelRadius,offsetY=-.98+radius+.055;
  for(const x of [-.71,.71])for(const z of [-.88,.88]){
   const center=V3(-9+x,.98+offsetY,z);
   const wheel=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(center.x,center.y,center.z)
    .setLinearDamping(.02).setAngularDamping(.03).setCcdEnabled(true));
   const collider=this.world.createCollider(RAPIER.ColliderDesc.cylinder(.145,radius)
    // Cylinder's axis is +Y by default; make actual axle +Z.
    .setRotation({w:Math.SQRT1_2,x:Math.SQRT1_2,y:0,z:0})
    .setMass(12).setFriction(1.15).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Multiply)
    .setRestitution(0),wheel);
   const joint=this.world.createImpulseJoint(RAPIER.JointData.revolute(
    V3(x,offsetY,z),V3(),V3(0,0,1)),this.chassis,wheel,true);
   joint.configureMotorVelocity(0,15);
   joint.setMotorMaxForce(motor);
   this.wheels.push({body:wheel,collider,joint,offset:V3(x,offsetY,z)});
  }
  this.obstacle=null;
  if(obstacle){
   const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(-1.2,.74,0).setLinearDamping(.3).setAngularDamping(.65)
    .setCcdEnabled(true));
   const collider=this.world.createCollider(RAPIER.ColliderDesc.cuboid(.78,.72,.90)
    .setMass(155).setFriction(.9).setRestitution(0),body);
   this.obstacle={body,collider};
  }
  this.world.propagateModifiedBodyPositionsToColliders();
  // Allow actual bodies to settle into contact without motor action.
  for(let i=0;i<600;i++)this.world.step();
  // Prescribed initial rest condition: remaining impulse-joint settling cannot
  // masquerade as internally sourced locomotion in passive tests.
  this.preRestVel=this.chassis.linvel();
  for(const b of [this.chassis,...this.wheels.map(w=>w.body),
    ...(this.obstacle?[this.obstacle.body]:[])]){
    b.setLinvel(V3(),true);
    b.setAngvel(V3(),true);
  }
  this.origin=this.chassis.translation().x;
  this.initialObstacle=this.obstacle?.body.translation().x??null;
  this.originCOM=this.centerOfMass().x;
 }
 centerOfMass(){
  // Include every dynamic body in the system. Individual body movement is NOT
  // evidence of COM locomotion: internal motors may rearrange members.
  const bodies=[this.chassis,...this.wheels.map(x=>x.body),
    ...(this.obstacle?[this.obstacle.body]:[])];
  let m=0,x=0,y=0,z=0;
  for(const b of bodies){
   const mass=b.mass(),p=b.translation();
   if(!finite(mass,p.x,p.y,p.z)||mass<=0)throw Error("Bad body mass or position");
   m+=mass;x+=mass*p.x;y+=mass*p.y;z+=mass*p.z;
  }
  return {x:x/m,y:y/m,z:z/m,mass:m};
 }
 contact(c1,c2){
  if(!c1||!c2)return 0;
  let impulse=0;
  this.world.contactPair(c1,c2,manifold=>{
   for(let i=0;i<manifold.numSolverContacts();i++)
    impulse+=Math.abs(manifold.contactImpulse(i)||0);
  });
  return impulse;
 }
 removeGround(){
  if(!this.groundBody)return false;
  this.world.removeRigidBody(this.groundBody);
  this.groundBody=null;this.ground=null;
  return true;
 }
 step(command=0){
  if(!Number.isFinite(command)||Math.abs(command)>1)throw RangeError("command");
  const {mode,motor}=this.settings;
  const desired=-command*8; // bottom wheel surface sweeps -X for +X travel
  for(const w of this.wheels){
   if(mode==="wheels"){
    w.joint.configureMotorVelocity(desired,15);
    w.joint.setMotorMaxForce(motor);
   }else{w.joint.configureMotorVelocity(0,0);w.joint.setMotorMaxForce(0);}
  }
  if(mode==="root-proxy"&&command){
   const force=command*motor;
   this.chassis.applyImpulse(V3(force*DT,0,0),true);
   this.rootImpulseSum+=Math.abs(force*DT);
  }
  this.world.step();this.ticks++;
  this.lastWheelGround=0;
  for(const wheel of this.wheels) this.lastWheelGround+=this.contact(wheel.collider,this.ground);
  if(this.lastWheelGround>1e-7){this.wheelContacts++;this.wheelContactImpulse+=this.lastWheelGround;}
  let contact=this.contact(this.chassisCollider,this.obstacle?.collider);
  if(this.obstacle)for(const wheel of this.wheels)
    contact+=this.contact(wheel.collider,this.obstacle.collider);
  if(contact>0){this.obstacleContact++;this.obstacleImpulse+=contact;}
  for(const w of this.wheels){
   const angleRate=w.body.angvel();
   // Rough actuator activity, not real mechanical/electrical energy.
   this.motorEnergyProxy+=Math.abs(angleRate.z)*motor*DT;
  }
  const c=this.chassis.translation(),v=this.chassis.linvel();
  if(!finite(c.x,c.y,c.z,v.x,v.y,v.z))throw Error("Nonfinite physical chassis state");
 }
 read(){
  const p=this.chassis.translation(),v=this.chassis.linvel();
  const COM=this.centerOfMass();
  const wheels=this.wheels.map(w=>({
   x:round(w.body.translation().x),y:round(w.body.translation().y),
   z:round(w.body.translation().z),spin:round(w.body.angvel().z)
  }));
  return {mode:this.settings.mode,mu:this.settings.mu,g:this.settings.gravity,
   commandMotor:this.settings.motor,ticks:this.ticks,
   chassis:{x:round(p.x),y:round(p.y),z:round(p.z),dx:round(p.x-this.origin),
     vx:round(v.x),vy:round(v.y),vz:round(v.z)},
   wheels,groundAvailable:!!this.ground,
   wheelGroundTicks:this.wheelContacts,groundImpulse:round(this.wheelContactImpulse),
   lastWheelGround:round(this.lastWheelGround),
   obstacleDX:this.obstacle?round(this.obstacle.body.translation().x-this.initialObstacle):null,
   obstacleTicks:this.obstacleContact,obstacleImpulse:round(this.obstacleImpulse),
   rootImpulseSum:round(this.rootImpulseSum),
   preRestVx:round(this.preRestVel.x),
   systemCOMx:round(COM.x),systemCOMdx:round(COM.x-this.originCOM),
   systemMass:round(COM.mass),
   actuatorActivityProxy:round(this.motorEnergyProxy)};
 }
 dispose(){this.world.free();}
}
