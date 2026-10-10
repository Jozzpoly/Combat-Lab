// B1 physically cheap alternative: ONE shape-changing rigid collider.
// Explicitly NON-PHYSICAL material editing: instantly or gradually updates
// collision geometry but has no mass-bearing limbs, muscle work, joint
// reactions or continuous conservation of displaced material volume.
// DO NOT use this as a 'real folding body' even if outputs look similar.
import {EnvelopeField} from "./b1-world.js";
import {V} from "./m0-world.js";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1e4)/1e4;
export class ProfileSwapField extends EnvelopeField{
 constructor({mode="gradual",withGate=true,holdHeading=true}={}){
  super({kind:"rigid-wide",withGate,withMatter:false,holdHeading});
  if(!["gradual","instant"].includes(mode))throw RangeError("profile switch");
  this.profileMode=mode;this.profile=0;this.profileEdits=0;
  this.geometryChanged=0;this.shapePowerProxy=0;
 }
 morph(value){
  if(!Number.isFinite(value))throw RangeError("profile");
  const target=clamp(value,0,1),old=this.profile;
  this.profile=this.profileMode==="instant"?target:
   old+clamp(target-old,-1/60,1/60);
  const dh=Math.abs(this.profile-old);
  if(dh<1e-9)return;
  const part=this.actor.parts[0];
  const hx=.55+(1.07-.55)*this.profile;
  const hy=1.9+(.46-1.9)*this.profile;
  part.collider.setHalfExtents(V(hx,hy));
  part.collider.setMass(125);
  part.shape.hx=hx;part.shape.hy=hy;
  this.profileEdits++;this.geometryChanged+=dh;
  // shapePowerProxy stays ZERO intentionally: no actual actuator work.
 }
 step({forward=0,fold=0}={}){
  this.morph(fold);
  super.step({forward,fold});
 }
 output(){
  const v=super.output();
  return {...v,kind:"cheap-profile-edit",mode:this.profileMode,
   profile:round(this.profile),profileEdits:this.profileEdits,
   unpoweredGeometryChange:round(this.geometryChanged),
   materialDeformationWork:"UNMODELED; exact collider geometry authored from outside"};
 }
}
