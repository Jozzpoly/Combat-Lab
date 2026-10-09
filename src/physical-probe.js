// Falsification-oriented browser/WASM observation, never gameplay acceptance.
// Counterfactual A/B modifies only real physical arm motor authority.
export function physicalProbe(Field){
 const assert=(v,m)=>{if(!v)throw Error("PHYSICAL PROBE: "+m);};
 const trials=[];
 function trial(torque,crateMass=13){
   const field=new Field({empty:true});
   try{
     const a=field.spawn("pincer",{x:9,y:12},0);
     field.select(a.id);
     field.setClawTorque(a.id,torque);
     const crate=field.addBox({x:10.7,y:12,hx:.38,hy:.48,mass:crateMass},false);
     field.setAperture(a.id,0);
     const init=crate.body.translation();
     let touched=false,peak=0,firstContact=-1,armSweep=0;
     for(let i=0;i<175;i++){
       field.step({move:{x:0,y:0},aim:{x:18,y:12}});
       const l=a.arms.map(arm=>
         Math.atan2(Math.sin(arm.body.rotation()-a.root.rotation()),
           Math.cos(arm.body.rotation()-a.root.rotation())));
       armSweep=Math.max(armSweep,
         Math.abs(l[0]-(-.52)),Math.abs(l[1]-.52));
       if(a.contactCount && firstContact<0)firstContact=i;
       if(a.contactCount)touched=true;
       peak=Math.max(peak,a.contactImpulse);
       const p=crate.body.translation();
       assert(Number.isFinite(p.x+p.y+crate.body.rotation()),
         "unstable material under direct physical jaw contact");
       for(const part of a.parts){
         const p=part.body.translation();
         assert(Number.isFinite(p.x+p.y+part.body.rotation()),
           "nonfinite articulated body");
       }
     }
     const p=crate.body.translation();
     return {torque,crateMass,touched,firstContact,
       peakImpulse:+peak.toFixed(4),
       maxArmRotation:+armSweep.toFixed(3),
       displacement:+Math.hypot(p.x-init.x,p.y-init.y).toFixed(4),
       crateAngular:+crate.body.angvel().toFixed(4),
       realJoints:a.joints.length};
   }finally{field.dispose();}
 }
 const live=trial(780,13),nullMotor=trial(0,13),heavier=trial(780,210);
 assert(live.realJoints===2 && nullMotor.realJoints===2,
   "pincer lost two genuine revolute joints");
 assert(live.maxArmRotation>nullMotor.maxArmRotation+.10,
   "joint actuation had no distinct material anatomy");
 // Contact/matter consequence is recorded as observation before promoted.
 // It may fail: do not fabricate the third-party object's motion.
 assert(live.touched, "moving jaws did not make active external contact");
 assert(live.peakImpulse>0,"no solver-active contact impulse");
 const authorship=new Field();
 try{
   for(let t=0;t<24;t++)authorship.step();
   const other=authorship.matter[0],q={...other.body.translation()},
     tick=authorship.ticks;
   const p=authorship.actors[0];
   const offsets=p.arms.map(arm=>{
     const b=arm.body.translation(),root=p.root.translation();
     return {x:b.x-root.x,y:b.y-root.y};
   });
   authorship.reposition(p.id,{x:8,y:14});
   authorship.world.propagateModifiedBodyPositionsToColliders();
   assert(authorship.pick({x:8,y:14})===p.id,
     "paused edited physical body cannot be selected by its collider");
   for(let i=0;i<p.arms.length;i++){
     const now=p.arms[i].body.translation(),root=p.root.translation();
     assert(Math.hypot(now.x-root.x-offsets[i].x,
       now.y-root.y-offsets[i].y)<.0001,
       "paused authoring tore real jointed appendage from trunk");
   }
   assert(authorship.ticks===tick&&
     other.body.translation().x===q.x&&other.body.translation().y===q.y,
     "editing one body reset unrelated world afterstate");
   const fixture=authorship.addBox({x:15,y:14,hx:.6,hy:.55,mass:35});
   assert(authorship.pick({x:15,y:14})===fixture.id,"crate not selectable");
   assert(authorship.undo(),"authored material cannot be removed live");
   assert(!authorship.matter.some(x=>x.id===fixture.id)&&
     authorship.ticks===tick,"Undo reset unrelated physical time");
   for(let i=0;i<160;i++)authorship.step();
   assert(authorship.actors.every(a=>a.parts.every(part=>{
     const t=part.body.translation();
     return Number.isFinite(t.x+t.y+part.body.rotation());
   })),"continuation after physical authoring unstable");
 }finally{authorship.dispose();}
 return {live,nullMotor,heavier,authorship:"joint-preserving pause edit and live undo verified"};
}
