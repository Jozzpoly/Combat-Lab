// Versioned authored INITIAL condition, NOT full solver state or brain replay.
// Pure validator runs BEFORE destructive replacement of any live field.
export const SCENE_FORMAT="combat-lab.effectors.initial.v1";
function finite(n,label){
 if(typeof n!=="number"||!Number.isFinite(n)||
   !Number.isFinite(Math.fround(n)))
   throw RangeError("Invalid "+label);
 return n;
}
function num(obj,key,name,{positive=false,min=null,max=null}={}){
 const value=finite(obj?.[key],name+"."+key);
 if((positive&&value<=0)||(min!==null&&value<min)||
    (max!==null&&value>max))
   throw RangeError("Out of physical range "+name+"."+key);
 return value;
}
function arr(a,label){
 if(!Array.isArray(a))throw TypeError(label+" must be array");
 return a;
}
export function validateScene(data){
 if(!data||typeof data!=="object"||Array.isArray(data)||
   data.format!==SCENE_FORMAT)throw TypeError("Unsupported start-scene format");
 const actors=arr(data.actors,"actors").map((a,i)=>{
   if(!["pincer","ram"].includes(a?.kind))throw TypeError("actor "+i+" kind");
   const name="actor "+i;
   const result={kind:a.kind,x:num(a,"x",name),y:num(a,"y",name),
     angle:num(a,"angle",name),clawTorque:num(a,"clawTorque",name,{min:0,max:1e7}),
     reach:a.kind==="pincer"?(a.reach===undefined?1.53:
       num(a,"reach",name,{min:.86,max:60})):0,
     aperture:num(a,"aperture",name,{min:0,max:1})};
   if(a.kind==="pincer"){
     result.armAngles=arr(a.armAngles,name+".armAngles");
     if(result.armAngles.length!==2)throw RangeError(name+" needs two real arms");
     result.armAngles=result.armAngles.map((v,j)=>finite(v,name+".armAngles["+j+"]"));
   }else result.armAngles=[];
   return result;
 });
 const matter=arr(data.matter,"matter").map((m,i)=>{
   const name="matter "+i;
   return {x:num(m,"x",name),y:num(m,"y",name),
     hx:num(m,"hx",name,{positive:true}),
     hy:num(m,"hy",name,{positive:true}),
     mass:num(m,"mass",name,{positive:true,max:1e9}),
     angle:num(m,"angle",name)};
 });
 const walls=arr(data.walls,"walls").map((m,i)=>{
   const name="wall "+i;
   return {x:num(m,"x",name),y:num(m,"y",name),
     hx:num(m,"hx",name,{positive:true}),
     hy:num(m,"hy",name,{positive:true})};
 });
 const gates=arr(data.gates,"gates").map((m,i)=>{
   const name="gate "+i;
   return {x:num(m,"x",name),y:num(m,"y",name),
     length:num(m,"length",name,{positive:true}),
     mass:num(m,"mass",name,{positive:true,max:1e9}),
     angle:num(m,"angle",name)};
 });
 return {format:SCENE_FORMAT,actors,matter,walls,gates};
}
