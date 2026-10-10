// Deliberately cheap, openly *authored* planar support approximation.
// NO physical floor, vertical normal or possibility of falling out of support.
import RAPIER from "@dimforge/rapier2d-deterministic";
const DT=1/60,V=(x=0,y=0)=>({x,y}),r=n=>+n.toFixed(4);
function friction(body,m,gravity,mu){
 if(mu<=0||gravity<=0)return 0;
 const vel=body.linvel(),speed=Math.hypot(vel.x,vel.y);
 const impulse=Math.min(m*speed,mu*m*gravity*DT);
 if(impulse>0)body.applyImpulse(V(-vel.x/speed*impulse,-vel.y/speed*impulse),true);
 return impulse;
}
function run({mu,g=9.81,push=720}){
 const w=new RAPIER.World(V());w.timestep=DT;
 w.integrationParameters.numSolverIterations=12;
 function make(x,m,hx,hy){
  const body=w.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(x,0).lockRotations().setLinearDamping(.03));
  const col=w.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy)
    .setMass(m).setRestitution(0).setFriction(0),body);
  return {body,col,m};
 }
 const guard=make(0,120,.63,.75),ram=make(-1.43,90,.65,.55);
 let contacts=0,impulse=0,supportEffort=0;
 try{
  for(let t=0;t<420;t++){
   if(push)ram.body.applyImpulse(V(push*DT,0),true);
   supportEffort+=friction(guard.body,guard.m,g,mu*.9);
   friction(ram.body,ram.m,g,mu*.015);
   w.step();
   w.contactPair(guard.col,ram.col,man=>{
    let p=0;
    for(let k=0;k<man.numSolverContacts();k++)p+=Math.abs(man.contactImpulse(k));
    if(p>0){contacts++;impulse+=p;}
   });
  }
  return {mu,g,push,guardDX:r(guard.body.translation().x),
    ramDX:r(ram.body.translation().x+1.43),
    contacts,actorImpulse:r(impulse),authoredSupportImpulse:r(supportEffort)};
 }finally{w.free();}
}
export function comparePlanarProxy(){
 const choices=[
  {mu:0},{mu:.15},{mu:1.2},{mu:2.4},
  {mu:1.2,g:0},{mu:1.2,push:0}
 ];
 const results=choices.map(run);
 const ice=results[0],grip=results[2],idle=results[5];
 if(idle.guardDX!==0||idle.contacts!==0)throw Error("2D proxy moved without force");
 if(ice.guardDX<=grip.guardDX+.3)throw Error("2D proxy failed qualitative friction comparison");
 return {scope:"same masses/box widths/external ram effort/420 ticks in planar Rapier, explicitly authored mu*m*g planar drag; NOT floor contact or K1's load-triggered brake",
  results,iceMinusGripDX:r(ice.guardDX-grip.guardDX),
  limitations:"No vertical state, traction loss, surface collision, actual ground normal, support transitions or qualitative cost comparison. Different solvers cannot be assumed numerically equivalent."};
}
