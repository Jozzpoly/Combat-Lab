// Portable authored starting condition, NOT a full running-state Rapier replay.
// Never deserialize arbitrary behavior or mutate the live world on parse failure.
import {CommonsWorld,BODY_PRESETS,V,safe} from "./x0-world.js";
export const FORMAT="combatlab.material-commons.initial.v0";
function num(o,k,{min=-1e6,max=1e6}={}){
  const n=safe(o?.[k],k);if(n<min||n>max)throw RangeError("Scene "+k+" out of range");
  return n;
}
function array(x,label){
  if(!Array.isArray(x)||x.length>3000)throw TypeError("Scene "+label+" invalid");
  return x;
}
function shape(o,keys){
  if(!o||typeof o!=="object"||Array.isArray(o))throw TypeError("Invalid scene shape");
  return Object.fromEntries(keys.map(key=>[key,num(o,key)]));
}
export function validate(data){
  if(data?.format!==FORMAT)throw TypeError("Unsupported initial scene recipe");
  const actors=array(data.actors,"actors").map(a=>{
    if(!["reach","lever","bulk"].includes(a?.form))throw TypeError("Unknown reference body");
    const parsed={form:a.form,...shape(a,["x","y","angle"]),
      spec:{...shape(a.spec,["mass","motor","turn","speed","torque","brace","armLength",
        "hx","hy","arms","reach"]),
        holdForce:a.spec?.holdForce===undefined?BODY_PRESETS[a.form].holdForce:
          num(a.spec,"holdForce",{min:0,max:1e7})},target:array(a.target,"target").map(x=>safe(x)),
      relative:array(a.relative,"relative").map(x=>safe(x))};
    if(parsed.spec.mass<=0||parsed.spec.motor<0||parsed.spec.brace<0||
      parsed.spec.torque<0||parsed.spec.armLength<0||
      ![0,1,2].includes(parsed.spec.arms)||parsed.target.length!==2||
      parsed.relative.length!==parsed.spec.arms||
      parsed.target.some(x=>x<0||x>1))throw RangeError("Invalid actuator/body recipe");
    return parsed;
  });
  const matter=array(data.matter,"matter").map(m=>{
    if(!["free","hinge","rail"].includes(m?.kind))throw TypeError("Unknown material constraint");
    const form=m.kind==="free"?(m.form||"block"):m.kind;
    if(m.kind==="free"&&!["block","beam"].includes(form))
      throw TypeError("Unsupported free material identity");
    const base={kind:m.kind,form,...shape(m,["x","y","angle","mass","length","hx","hy"])};
    if(base.mass<=0||base.hx<=0||base.hy<=0||base.length<0)throw RangeError("Invalid matter");
    if(m.kind==="hinge"){
      base.driveSpeed=m.driveSpeed===undefined?0:num(m,"driveSpeed",{min:-20,max:20});
      base.driveTorque=m.driveTorque===undefined?0:num(m,"driveTorque",{min:0,max:1e7});
    }
    return base;
  });
  const walls=array(data.walls,"walls").map(w=>{
    const base=shape(w,["x","y","hx","hy"]);
    if(base.hx<=.03||base.hy<=.03)throw RangeError("Invalid authored wall");
    return base;
  });
  return {format:FORMAT,actors,matter,walls};
}
export function capture(world){
  const recipe={format:FORMAT,
    actors:world.actors.map(a=>{
      const root=a.root.translation(),angle=a.root.rotation();
      return {form:a.form,x:root.x,y:root.y,angle,
        spec:{...a.spec},
        target:[...a.target],
        relative:a.arms.map(p=>Math.atan2(
          Math.sin(p.body.rotation()-angle),Math.cos(p.body.rotation()-angle)))};
    }),
    matter:world.matter.map(m=>{
      const t=m.body.translation();
      return {kind:m.kind,form:m.form||m.kind,
        x:m.pivot?m.x:t.x,y:m.pivot?m.y:t.y,
        angle:m.body.rotation(),mass:m.mass,
        ...(m.kind==="hinge"?{driveSpeed:m.driveSpeed,driveTorque:m.driveTorque}:{}),
        length:m.length||0,
        hx:m.kind==="free"?m.hx:m.length/2,
        hy:m.kind==="free"?m.hy:.2};
    }),
    walls:world.walls.map(w=>({
      x:w.body.translation().x,y:w.body.translation().y,hx:w.hx,hy:w.hy}))
  };
  return validate(recipe);
}
export function restore(input){
  const scene=validate(input);
  const w=new CommonsWorld({empty:true});
  try{
    for(const wall of scene.walls)
      w.addWall(V(wall.x,wall.y),{hx:wall.hx,hy:wall.hy,created:false});
    for(const m of scene.matter){
      if(m.kind==="free")w.addMatter(V(m.x,m.y),
        {hx:m.hx,hy:m.hy,mass:m.mass,angle:m.angle,form:m.form,created:false});
      else if(m.kind==="hinge")w.addHinge(V(m.x,m.y),
        {length:m.length,mass:m.mass,angle:m.angle,
          driveSpeed:m.driveSpeed,driveTorque:m.driveTorque,created:false});
      else if(m.kind==="rail")w.addRail(V(m.x,m.y),
        {length:m.length,mass:m.mass,angle:m.angle,created:false});
    }
    for(const data of scene.actors){
      const a=w.addActor(data.form,V(data.x,data.y),data.angle,data.spec);
      a.target=[...data.target];
      for(let i=0;i<a.arms.length;i++){
        const arm=a.arms[i],orientation=data.angle+data.relative[i];
        const parent=V(data.x,data.y),
          shx=Math.cos(data.angle)*arm.shoulder.x-
            Math.sin(data.angle)*arm.shoulder.y,
          shy=Math.sin(data.angle)*arm.shoulder.x+
            Math.cos(data.angle)*arm.shoulder.y;
        const center=V(parent.x+shx+Math.cos(orientation)*arm.half,
          parent.y+shy+Math.sin(orientation)*arm.half);
        arm.body.setTranslation(center,true);
        arm.body.setRotation(orientation,true);
      }
    }
    w.world.propagateModifiedBodyPositionsToColliders();
    w.select(w.actors[0]?.id||null);
    return w;
  }catch(error){w.dispose();throw error;}
}
