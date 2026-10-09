// Browser/WASM-only physical validation of local tactile contact.
/// This deliberately asks whether *actual solver contact* can change a
// material continuation; we never pre-label obstacles, routes, or NPC roles.
export function somaticProbe(Field){
 const assert=(v,m)=>{if(!v)throw Error("somatic: "+m);};
 function attempt(yieldFactor, obstacles="wall",mass=220,steps=240){
   const world=new Field();
   try{
     for(const a of [...world.actors])world.remove(a.id);
     const a=world.spawn("dart",{x:5,y:4},0);
     world.select(a.id);
     world.setActorProfile(a.id,{contactYield:yieldFactor,turnRate:0,
       turnTorque:0});
     const crate=obstacles==="matter" ?
       world.addBox({x:7.25,y:4,hx:.26,hy:.9,mass},false):null;
     if(!crate)world.addWall({x:7.25,y:4,hx:.26,hy:.9},false);
     let firstTouch=-1,firstGive=-1,maxFront=0,maxLoad=0,backwardFrames=0;
     for(let tick=1;tick<=steps;tick++){
       world.step(null);
       if(a.sense.touch && firstTouch<0) firstTouch=tick;
       if(a.control.mode==="give-way" && firstGive<0)firstGive=tick;
       if(a.control.throttle<0)backwardFrames++;
       maxFront=Math.max(maxFront,a.sense.front);
       maxLoad=Math.max(maxLoad,a.sense.load);
       const p=a.root.translation();
       assert(Number.isFinite(p.x+p.y+a.root.rotation()),
         "frontal-contact response became nonfinite");
     }
     return {firstTouch,firstGive,maxFront,maxLoad,backwardFrames,
       objectDx:crate?crate.body.translation().x-7.25:null};
   }finally{world.world.free();}
 }
 const compliant=attempt(1),persistent=attempt(0);
 assert(compliant.firstTouch>0&&persistent.firstTouch>0,
   "static wall never physically contacted");
 assert(compliant.maxFront>.60 && persistent.maxFront>.60,
   "actual frontal contact normal was not registered");
 assert(compliant.maxLoad>0 && persistent.maxLoad>0,
   "contact load never came from solver impulses");
 assert(compliant.firstGive>compliant.firstTouch &&
   persistent.firstGive>persistent.firstTouch,
   "yield began before actual frontal blockage");
 assert(persistent.firstGive-compliant.firstGive>=20,
   "distinct tactile yielding did not emerge under same physics");
 const heavyCompliant=attempt(1,"matter"),heavyPersistent=attempt(0,"matter");
 const light=attempt(1,"matter",12,100);
 const heavy100=attempt(1,"matter",220,100);
 return {wall:{compliant,persistent},
   heavy:{compliant:heavyCompliant,persistent:heavyPersistent},
   materialAffordance:{light,heavy:heavy100}};
}
