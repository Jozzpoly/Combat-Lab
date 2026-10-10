// S2: a narrow *real-ground-contact* candidate, not a Combat Lab engine decision.
// A 3D vertical normal force permits actual Coulomb friction; view/control stay top-down.
// All horizontal ram effort is EXPLICITLY EXTERNAL experimental force, never NPC locomotion.
import RAPIER from "@dimforge/rapier3d-compat";

const DT=1/60;
const F=(n)=>Number.isFinite(n)?n:0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const V3=(x=0,y=0,z=0)=>({x,y,z});
export async function preparePhysics(){await RAPIER.init();}
const contactImpulse=(world,c1,c2)=>{
  let out=0;
  world.contactPair(c1,c2,manifold=>{
    for(let i=0;i<manifold.numSolverContacts();i++){
      const v=manifold.contactImpulse(i);
      if(Number.isFinite(v))out+=Math.abs(v);
    }
  });
  return out;
};
export class GroundCase{
  constructor({surface=.8,gravity=9.81,drive=720,offset=0}={}){
    if(![surface,gravity,drive,offset].every(Number.isFinite)||
       surface<0||surface>3||gravity<0||gravity>30||
       drive<0||drive>3000||Math.abs(offset)>1.5)throw RangeError("S2 physical experiment parameter");
    this.settings={surface,gravity,drive,offset};
    this.world=new RAPIER.World(V3(0,-gravity,0));
    this.world.timestep=DT;
    this.world.integrationParameters.numSolverIterations=12;
    this.world.integrationParameters.numInternalPgsIterations=4;
    const groundBody=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed()
      .setTranslation(0,-.25,0));
    this.ground=this.world.createCollider(
      // Wide enough for the full prescribed 7-second friction-zero control:
      // the original 11m floor edge caused a misleading free-fall.
      RAPIER.ColliderDesc.cuboid(120,.25,9).setFriction(surface).setRestitution(0),groundBody);
    const make=(x,z,mass,halfX,halfY,halfZ,friction)=>{
      // Surface locomotion: 3D vertical normal reaction, horizontal XZ movement;
      // only yaw rotation, no arbitrarily frozen horizontal translation.
      const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x,halfY+.05,z).enabledRotations(false,true,false)
        .setLinearDamping(.03).setAngularDamping(.5));
      const collider=this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(halfX,halfY,halfZ)
          .setMass(mass).setFriction(friction).setRestitution(0),body);
      return {body,collider,mass,halfX,halfY,halfZ};
    };
    this.defender=make(0,0,120,.63,.90,.75,.9);
    this.ram=make(-1.43,offset,90,.65,.85,.55,.015);
    this.initialGuardX=this.defender.body.translation().x;
    this.initialRamX=this.ram.body.translation().x;
    this.history=[];
    this.totalGroundImpulse=0;
    this.totalBodyImpulse=0;
    this.supportTicks=0;this.bodyContactTicks=0;this.ticks=0;
    this.totalAppliedDrive=0;
    this.settle(110);
    this.originGuardX=this.defender.body.translation().x;
    this.originRamX=this.ram.body.translation().x;
    this.clearCounters();
  }
  clearCounters(){
    this.supportTicks=0;this.bodyContactTicks=0;
    this.totalGroundImpulse=0;this.totalBodyImpulse=0;this.totalAppliedDrive=0;this.ticks=0;
    this.history=[];
  }
  settle(count){
    for(let i=0;i<count;i++)this.world.step();
  }
  setSurface(value){
    if(!Number.isFinite(value)||value<0||value>3)throw RangeError("Invalid surface friction");
    this.settings.surface=value;
    this.ground.setFriction(value);
  }
  step(externalForce=0){
    const force=clamp(F(externalForce),0,3000);
    if(force>0){
      this.ram.body.applyImpulse(V3(force*DT,0,0),true);
      this.totalAppliedDrive+=force*DT;
    }
    this.world.step();this.ticks++;
    const grounded=contactImpulse(this.world,this.ground,this.defender.collider);
    const pressure=contactImpulse(this.world,this.ram.collider,this.defender.collider);
    if(grounded>1e-6){this.supportTicks++;this.totalGroundImpulse+=grounded;}
    if(pressure>1e-6){this.bodyContactTicks++;this.totalBodyImpulse+=pressure;}
    if(this.ticks%30===0)this.history.push({tick:this.ticks,
      defenderX:this.defender.body.translation().x,
      ramX:this.ram.body.translation().x,
      defenderY:this.defender.body.translation().y,
      contactPressure:pressure,groundNormal:grounded});
    for(const body of [this.ram.body,this.defender.body]){
      const p=body.translation(),v=body.linvel();
      if(![p.x,p.y,p.z,v.x,v.y,v.z].every(Number.isFinite))
        throw Error("S2 nonfinite physical state");
    }
    return {grounded,pressure};
  }
  snapshot(){
    const g=this.defender.body.translation(),p=this.ram.body.translation();
    return {surface:this.settings.surface,gravity:this.settings.gravity,
      appliedForce:this.settings.drive,ticks:this.ticks,
      guardX:g.x,guardY:g.y,guardZ:g.z,guardDX:g.x-this.originGuardX,
      ramX:p.x,ramY:p.y,ramZ:p.z,ramDX:p.x-this.originRamX,
      groundContactSteps:this.supportTicks,
      actorContactSteps:this.bodyContactTicks,
      totalGroundImpulse:this.totalGroundImpulse,
      totalActorImpulse:this.totalBodyImpulse,
      externalRamImpulse:this.totalAppliedDrive};
  }
  dispose(){this.world.free();}
}
