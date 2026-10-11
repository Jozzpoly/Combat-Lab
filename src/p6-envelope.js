// P6 material passage/body envelope source. Real Rapier2D collider geometry,
// not "canFit" predicates or semantic size gates. Equal drive cap + optionally
// collider mass matched across geometries. No NPC goal, route graph or
// scripted outcome. Diagnostic center-line motion is not a victory trigger.
import {CommonsYard} from "./p5-commons.js";
import {V} from "./p0-world.js";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1e4)/1e4;
export function corridor(w,width=1.2,{x=14.4,y=12,lower=4,upper=20}={}){
 if(width<.6||width>4)throw Error("corridor width out of scope");
 const bottom=y-width/2,top=y+width/2;
 const p1=w.barrier(x,(lower+bottom)/2,.25,(bottom-lower)/2);
 const p2=w.barrier(x,(top+upper)/2,.25,(upper-top)/2);
 w.world.propagateModifiedBodyPositionsToColliders();
 return {x,y,width,bottom,top,upper:p1,lower:p2};
}
function specimen(w,kind,x=9.8,y=12,mass=90,motor=650,speed=1.9){
 const a=w.spawn(kind,V(x,y));
 // Fair shape-only control: same physical collider mass, same max speed,
 // same root effort cap. In native condition retain mass as actual body trait.
 if(mass!==null){
  a.shapes[0].collider.setMass(mass);
  w.world.propagateModifiedBodyPositionsToColliders();
 }
 a.maxSpeedOverride=speed;a.motor=motor;a.stance="flow";
 return a;
}
export function createP6Aperture({kind="small",width=1.2,support="finite",
 mass=90,motor=650,speed=1.9,openAfter=null}={}){
 const w=new CommonsYard({support,policy:"constant",seed:1});
 const passage=corridor(w,width);
 const a=specimen(w,kind,9.8,12,mass,motor,speed);
 w.selected=null;w.auto=false;
 w.p6={kind,passage,actors:[a.id],opened:false};
 return w;
}
export function openP6(w){
 if(!w?.p6||w.p6.opened)return false;
 const c=w.p6.passage;
 // Real fixed collider moved, narrow 1.2 to 2.8 effective aperture.
 // No teleport of the organism, no collision disabled, no route override.
 const p=c.upper.body.translation();
 if(!w.moveEntity(c.upper,V(p.x,p.y-1.60)))return false;
 w.p6.opened=true;
 return true;
}
export function createP6Commons({support="finite"}={}){
 const w=new CommonsYard({support,policy:"touch",seed:11});
 // One tight and one generous aperture in ONE continuous world.
 const x=14.4;
 const a=w.barrier(x,9.1,.25,1.5);      // [7.6,10.6]
 const b=w.barrier(x,14.05,.25,2.45);    // [11.60,16.50] tight top gap 1.0
 const c=w.barrier(x,22.0,.25,2.55);     // [19.45,24.55] lower gap 2.95
 // Actual physical collider geometry, not scripted gates: one 1m tight
 // aperture, one 2.95m opening. All bodies use ordinary same solver rules.
 const narrow=w.spawn("small",V(9.5,11.1));
 const large=w.spawn("bulky",V(9.3,17.85));
 const follower=w.spawn("small",V(6.8,11.1));
 const rival=w.spawn("small",V(8.2,17.9));
 for(const [ent,role] of [[narrow,"press"],[large,"brace"],
                           [follower,"yield"],[rival,"press"]]){
  ent.maxSpeedOverride=1.7;ent.motor=650;
  // Same initial heading/drive caps. Under the CHEAP constant policy
  // these are ordinary straight-root drives. Under touch, only actual
  // real solver contact force can trigger BRACE or YIELD at runtime.
  w.register(ent,role,V(1,0));
 }
 // Independently mobile material in the two possible flow paths.
 w.load(17.5,11.15,.45,.4,35);
 w.load(18,17.9,.55,.48,65);
 w.selected=null;
 w.p6={kind:"commons",passage:{upper:a,mid:b,lower:c,x},
  actors:[narrow.id,large.id,follower.id,rival.id],opened:false};
 w.world.propagateModifiedBodyPositionsToColliders();
 return w;
}
export function p6Case({kind="small",width=1.2,support="finite",
 mass=90,motor=650,speed=1.9,edit="none",ticks=440,captureWorld=null}={}){
 const w=createP6Aperture({kind,width,support,mass,motor,speed});
 try{
  const a=w.actors[0],start={...a.body.translation()};
  const trace=[],atEdit=160;
  let before=null,afterEdit=null;
  let crossedAt=null,peakX=start.x,maxYDeviation=0,contacts=0,externalPokes=0;
  for(let i=0;i<ticks;i++){
   if(i===atEdit){
    before={p:{...a.body.translation()},v:{...a.body.linvel()},
      yaw:a.body.rotation(),omega:a.body.angvel(),
      barrier:w.p6.passage.upper.body.translation(),
      mass:a.body.mass(),effort:w.events.rootEffort};
    if(edit==="open"){
     if(!openP6(w))throw Error("P6 authored topology open failed");
     afterEdit={p:{...a.body.translation()},v:{...a.body.linvel()},
      barrier:w.p6.passage.upper.body.translation()};
     if(JSON.stringify(before.p)!==JSON.stringify(afterEdit.p)||
       JSON.stringify(before.v)!==JSON.stringify(afterEdit.v))
      throw Error("P6 topology edit secretly moved or sped up actor");
    }else if(edit!=="none")throw Error("edit mode");
   }
   // Equal outward drive requested EACH step for all bodies. No
   // position-dependent policy or auto-steering at the wall.
   w.command(a,V(1,0));w.step();
   const p=a.body.translation();peakX=Math.max(peakX,p.x);
   maxYDeviation=Math.max(maxYDeviation,Math.abs(p.y-start.y));
   if(crossedAt===null&&p.x>16.30)crossedAt=w.ticks;
   if(i%55===0||[atEdit-1,atEdit,atEdit+10,ticks-1].includes(i)){
    trace.push({tick:w.ticks,x:round(p.x),y:round(p.y),
      vx:round(a.body.linvel().x),angle:round(a.body.rotation()),
      angularSpeed:round(a.body.angvel()),effort:round(w.events.rootEffort)});
   }
  }
  const p=a.body.translation();
  const out={kind,width,support,massSource:mass,
   actualMass:round(a.body.mass()),motor,speed,edit,ticks,
   start,end:{x:round(p.x),y:round(p.y)},crossedAt,
   crossed:crossedAt!==null,peakX:round(peakX),
   maxYDeviation:round(maxYDeviation),distanceX:round(p.x-start.x),
   totalEffort:round(w.events.rootEffort),groundReaction:round(w.events.terrainLinearImpulse),
   bodyShape:a.shapes[0].shape,actualFixedWalls:2,
   editedBarrier:edit==="open"?w.p6.opened:false,
   preEdit:before,afterEdit,
   finite:w.traces().finite,trace};
  if(captureWorld)captureWorld(w,out);
  return out;
 }finally{if(!captureWorld)w.dispose();}
}
