// V1 portable starting-scene contract for controlled material experiments.
// Snapshots retain intentional body/world *starting pose*, not a running
// solver, velocities, joint strain, autonomous histories or exact replay.
import { MORPHS, KINDS } from "./organism-law.js";

function finite(value,label,positive=false) {
  if(typeof value!=="number" || !Number.isFinite(value) ||
      !Number.isFinite(Math.fround(value)) ||
      (positive ? value<=0 : false))
    throw new RangeError(label+" must be a finite, solver-representable "+
      (positive?"positive ":"")+"number");
  return value;
}
function vec(src,label){
  if(!src || typeof src!=="object")throw new TypeError(label+" must be a point");
  return {x:finite(src.x,label+".x"),y:finite(src.y,label+".y")};
}
function rect(src,label,mass=false){
  if(!src || typeof src!=="object")throw new TypeError(label+" missing");
  const pos=vec(src,label);
  const hx=finite(src.hx,label+".hx",true),hy=finite(src.hy,label+".hy",true);
  if(hx<.04||hy<.04)throw new RangeError(label+" collider too thin");
  return {...pos,hx,hy,...(mass?{mass:finite(src.mass,label+".mass",true)}:{})};
}
const PHYSICAL_KEYS=["mass","speed","acceleration","braking","turnRate",
  "turnTorque","gripForce","gripReach"];
export function validateScene(input){
  if(!input||typeof input!=="object" || Array.isArray(input) ||
    input.format!=="combat-lab.initial-scene.v1")
    throw new TypeError("unsupported starting scene format");
  const arrays=["actors","matter","gates","walls"];
  for(const key of arrays){
    if(!Array.isArray(input[key])||input[key].length>8000)
      throw new RangeError(key+" must be an array with at most 8000 entries");
  }
  if(input.actors.length>3000)
    throw new RangeError("more than 3000 organism bodies requires a smaller import");
  const actors=input.actors.map((src,i)=>{
    const label="actors["+i+"]";
    if(!src||typeof src!=="object"||!KINDS.includes(src.kind))
      throw new TypeError(label+" has unknown morphology");
    const pos=vec(src.pos,label+".pos");
    const heading=finite(src.heading,label+".heading");
    const length=finite(src.length,label+".length",true);
    const width=finite(src.width,label+".width",true);
    const minScale=src.kind==="dart"?.20:src.kind==="broad"?.10:src.kind==="worm"?.10:0;
    if(length<(src.kind==="crawler"?.08:minScale) ||
       width<(src.kind==="crawler"?.13:minScale))
      throw new RangeError(label+" has unresolvable real collider dimensions");
    const profile={};
    for(const key of PHYSICAL_KEYS)profile[key]=
      finite(src.profile?.[key],label+".profile."+key,key==="mass");
    for(const key of PHYSICAL_KEYS)if(profile[key]<0)
      throw new RangeError(label+" has negative physical authority "+key);
    if(src.kind==="worm"){
      profile.muscleForce=finite(src.profile.muscleForce,label+".profile.muscleForce");
      profile.supportForce=finite(src.profile.supportForce,label+".profile.supportForce");
      if(profile.muscleForce<0||profile.supportForce<0)
        throw new RangeError(label+" muscle/support must be nonnegative");
    }
    if(src.kind==="crawler"){
      profile.rearDrive=finite(src.profile.rearDrive,label+".profile.rearDrive");
      if(profile.rearDrive<0||profile.rearDrive>1)
        throw new RangeError(label+" rearDrive must be [0,1]");
    }
    return {kind:src.kind,pos,heading,length,width,profile};
  });
  const matter=input.matter.map((o,i)=>{
    const r=rect(o,"matter["+i+"]",true);
    return {...r,angle:finite(o.angle,"matter["+i+"].angle")};
  });
  const gates=input.gates.map((o,i)=>{
    const label="gates["+i+"]";
    const pivot=vec(o,label);
    const length=finite(o.length,label+".length",true);
    const mass=finite(o.mass,label+".mass",true);
    const angle=finite(o.angle,label+".angle");
    if(length<.20)throw new RangeError(label+" too thin for revolute fixture");
    return {...pivot,length,mass,angle};
  });
  const walls=input.walls.map((w,i)=>rect(w,"walls["+i+"]"));
  return {format:"combat-lab.initial-scene.v1",
    actors,matter,gates,walls};
}
export function actorRecipe(actor){
  const pos=actor.root.translation(), spec=actor.spec;
  const profile={};
  for(const key of PHYSICAL_KEYS)profile[key]=spec[key];
  if(actor.kind==="crawler")profile.rearDrive=spec.rearDrive;
  if(actor.kind==="worm"){
    profile.muscleForce=spec.muscleForce;
    profile.supportForce=spec.supportForce;
  }
  return {kind:actor.kind,pos:{...pos},heading:actor.root.rotation(),
    length:actor.shapeScale.length,width:actor.shapeScale.width,profile};
}
