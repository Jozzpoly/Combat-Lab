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
   const hookBefore={...p.arms[0].hook.translation()};
   assert(authorship.setClawReach(p.id,2.31),
     "real physical manipulator span cannot be authored");
   const hookAfter=p.arms[0].hook.translation();
   assert(Math.hypot(hookAfter.x-hookBefore.x,hookAfter.y-hookBefore.y)>.7,
     "jaw reach changed only a numeric setting, not a real collider");
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
   const captured=authorship.exportScene();
   const restored=Field.fromScene(captured);
   try{
     const replay=restored.exportScene();
     assert(replay.actors.length===captured.actors.length,
       "posed scene lost a physical organism");
     assert(replay.walls.length===captured.walls.length &&
       replay.matter.length===captured.matter.length &&
       replay.gates.length===captured.gates.length,
       "posed scene lost material components");
     assert(Math.abs(replay.actors[0].reach-2.31)<1e-4,
       "authored physical mandible length did not survive scene roundtrip");
     assert(Math.abs(replay.actors[0].x-captured.actors[0].x)<1e-4,
       "restored body starting pose changed");
     for(let arm=0;arm<2;arm++)
       assert(Math.abs(replay.actors[0].armAngles[arm]-
         captured.actors[0].armAngles[arm])<1e-4,
         "actual articulated starting angle was not restored");
     for(let i=0;i<120;i++)restored.step();
     assert(restored.actors.every(a=>a.parts.every(part=>{
       const p=part.body.translation();
       return Number.isFinite(p.x+p.y+part.body.rotation());
     })),"restored jointed scene unstable");
   }finally{restored.dispose();}
   let rejected=false;
   try{Field.fromScene({...captured,actors:[{kind:"fake"}]});}
   catch(error){rejected=true;}
   assert(rejected,"invalid scene was allowed to replace real runtime");
   for(let i=0;i<160;i++)authorship.step();
   assert(authorship.actors.every(a=>a.parts.every(part=>{
     const t=part.body.translation();
     return Number.isFinite(t.x+t.y+part.body.rotation());
   })),"continuation after physical authoring unstable");
 }finally{authorship.dispose();}
 // Material verbs beyond a one-shot squeeze: the SAME body closes
 // its actual jaws around matter, then translates perpendicular to them.
 // The null version has identical movement authority, only no arm torque.
 function carryTrial(torque,{releaseAfter=null}={}){
   const world=new Field({empty:true});
   try{
     const p=world.spawn("pincer",{x:9,y:12},0);
     world.select(p.id);world.setClawTorque(p.id,torque);
     const obj=world.addBox({x:10.7,y:12,hx:.38,hy:.48,mass:13},false);
     world.setAperture(p.id,0);
     let contactedTicks=0;
     for(let t=0;t<100;t++){
       world.step({move:{x:0,y:0},aim:{x:18,y:12}});
       if(p.contactCount)contactedTicks++;
     }
     const initial={...obj.body.translation()},beforeRoot={...p.root.translation()};
     let maxLoading=0;
     for(let t=0;t<145;t++){
       if(t===releaseAfter)world.setAperture(p.id,1);
       // Sideways travel with the same body facing +X. The object is NEVER
       // connected to this actor; joint count stays exactly two.
       world.step({move:{x:0,y:-1},aim:{x:18,y:12}});
       maxLoading=Math.max(maxLoading,p.contactImpulse);
     }
     const ending=obj.body.translation(),rootEnd=p.root.translation();
     return {torque,contactedTicks,
       realJointCount:p.joints.length,
       materialTravel:+Math.hypot(ending.x-initial.x,
         ending.y-initial.y).toFixed(4),
       materialY:+(ending.y-initial.y).toFixed(4),
       rootY:+(rootEnd.y-beforeRoot.y).toFixed(4),
       loadedImpulse:+maxLoading.toFixed(4)};
   }finally{world.dispose();}
 }
 const transported=carryTrial(780),uncharged=carryTrial(0),
   releasedHalfway=carryTrial(780,{releaseAfter:65});
 return {live,nullMotor,heavier,
   lateralMaterialTransport:{transported,uncharged,releasedHalfway},
   authorship:"joint-preserving pause edit and live undo verified"};
}
