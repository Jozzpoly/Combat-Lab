// W1 WHOLE first check: same open authored commons, no staged per-target
// teleports, hidden tasks, AI routes or second-actor autonomy.
// Deliberately tests whether scene COMPOSITION alone generates interactions.
import {V} from "./effector-world.js";
const round=x=>+x.toFixed(4);
function trial(World,mode){
 const w=new World();
 try{
  if(w.actors.length!==4||w.matter.length!==9)
   throw Error("W1 starting-world composition count incorrect");
  const first=w.actors[0],ram=w.actors[1];
  const light=w.matter.find(m=>m.type==="box"&&m.mass===13);
  const heavy=w.matter.find(m=>m.type==="box"&&m.mass===230);
  if(!light||!heavy||w.gates.length!==2)throw Error("W1 source objects absent");
  const before=[...w.matter].map(m=>({id:m.id,x:m.body.translation().x,y:m.body.translation().y,
    angle:m.body.rotation()}));
  if(mode==="passive"){
   w.select(null); // no hidden root brake / jaw torque for any resident
  }else if(mode.startsWith("ram")){
   w.select(ram.id);
  }else{
   w.select(first.id);
   // Left actor has two independently jointed appendages.
   if(mode==="jawOnly"||mode==="jawNoTorque"){
    w.setArmAperture(first.id,0,0);
    w.setArmAperture(first.id,1,0);
    // Remove root-ground impulse so any work is from reciprocal joint torque
    // and actual collisions (not a fictitious anchored torso).
    first.spec.motorForce=0;
   }
   if(mode==="jawNoTorque")w.setClawTorque(first.id,0);
  }
  let directLight=0,directHeavy=0,totalActorMaterialContact=0,firstContact=null;
  const contact=(a,m)=>{
   let f=0;
   for(const p of a.parts)w.world.contactPair(p.collider,m.collider,manifold=>{
    for(let j=0;j<manifold.numSolverContacts();j++)
     f+=Math.abs(manifold.contactImpulse(j)||0);
   });
   return f;
  };
  for(let t=0;t<240;t++){
   const move=t<180&&(mode==="pincerDrive"||mode==="ramDrive")?
     (mode==="ramDrive"?V(-1,0):V(1,0)):V();
   w.step({move,aim:null});
   const subject=mode.startsWith("ram")?ram:first;
   const l=contact(subject,light),h=contact(subject,heavy);
   if(l>0)directLight++;
   if(h>0)directHeavy++;
   if((l>0||h>0)&&firstContact===null)firstContact=t;
   for(const a of w.actors)for(const m of w.matter)
     if(contact(a,m)>0)totalActorMaterialContact++;
  }
  const changes=w.matter.map((m,i)=>{
    const now=m.body.translation(),prev=before[i];
    return {id:m.id,kind:m.type,mass:m.mass,
      displacement:round(Math.hypot(now.x-prev.x,now.y-prev.y)),
      rotation:round(m.body.rotation()-prev.angle)};
  });
  const snap=w.snapshot();
  if(snap.actorCount!==4||snap.materialCount!==9)throw Error("W1 matter/actor lost");
  return {mode,actors:w.actors.length,matter:w.matter.length,
   directLight,directHeavy,totalActorMaterialContact,firstContact,
   movedMatter:changes.filter(c=>c.displacement>.10||Math.abs(c.rotation)>.15),
   bodyPositions:snap.actors.map(a=>({kind:a.kind,x:round(a.x),y:round(a.y)})),
   noScriptedWorldTarget:true,
   physicallyPassiveResidents:mode==="passive"?true:"all unselected"};
 }finally{w.dispose();}
}
export function commonsWholeProbe(World){
 const modes=["passive","jawNoTorque","jawOnly","pincerDrive","ramDrive"];
 const cases=modes.map(mode=>trial(World,mode));
 const passive=cases[0];
 const continuity=(()=>{
  const field=new World();
  try{
   field.select(null);
   for(let k=0;k<19;k++)field.step({move:V(),aim:null});
   const original=field.exportScene();
   const restored=World.fromScene(original);
   try{
    const sameCount=restored.actors.length===field.actors.length&&
      restored.matter.length===field.matter.length;
    const retainedType=restored instanceof World;
    return {sameCount,retainedType,originalKind:field.actors[0]?.kind,
      note:"initial-pose recipe only; no physics velocities/history"};
   }finally{restored.dispose();}
  }finally{field.dispose();}
 })();
 return {scope:"one W1 four-body/nine-matter open commons; five fixed 240-tick full-world modes without any per-case object repositioning; root/arm force sources distinguished",
  cases,continuity,
  warning:"This test can disprove scene usefulness, but cannot certify free-form Owner interest, autonomous life, grounding, crowd feel, genuine gait or a selected 2D architecture."};
}
