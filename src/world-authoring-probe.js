// Physical-world authorship is not an action performed by organisms.
// Verify no latent teleport, unrelated reset, joint tear or incorrect gate pivot.
export function authoredPoseProbe(Field){
 const check=(ok,msg)=>{if(!ok)throw Error("authored-pose: "+msg)};
 const field=new Field();
 try{
   for(let i=0;i<60;i++)field.step();
   const p=field.actors.find(a=>a.kind==="pincer");
   const b=field.matter.find(x=>x.type==="box");
   const g=field.gates[0];
   const unrelated=field.matter.filter(x=>x!==b&&x!==g);
   const frozen=unrelated.map(x=>({
     pos:{...x.body.translation()},angle:x.body.rotation(),
     vel:{...x.body.linvel()}
   }));
   const ticks=field.ticks;
   const relatives=p.arms.map(arm=>({
     angle:arm.body.rotation()-p.root.rotation(),
     x:arm.body.translation().x-p.root.translation().x,
     y:arm.body.translation().y-p.root.translation().y
   }));
   const angle=p.root.rotation()+1.13;
   const rootInitial={...p.root.translation()};
   check(field.setAuthoredAngle(p.id,angle),"cannot rotate physical actor");
   check(Math.abs(p.root.rotation()-angle)<1e-5,"root did not rotate");
   check(Math.hypot(p.root.translation().x-rootInitial.x,
     p.root.translation().y-rootInitial.y)<1e-6,
     "whole-body rotation translated the root");
   for(let i=0;i<p.arms.length;i++){
     const arm=p.arms[i],d=relatives[i],next=arm.body.translation();
     const rotated={
       x:d.x*Math.cos(1.13)-d.y*Math.sin(1.13),
       y:d.x*Math.sin(1.13)+d.y*Math.cos(1.13)
     };
     check(Math.hypot(next.x-rootInitial.x-rotated.x,
       next.y-rootInitial.y-rotated.y)<1e-4,"real limb torn from root");
     check(Math.abs((arm.body.rotation()-p.root.rotation())-d.angle)<1e-4,
       "relative joint angle changed after whole-body author rotation");
   }
   const target=b.body.rotation()+.72;
   check(field.setAuthoredAngle(b.id,target),"cannot rotate real crate");
   check(Math.abs(b.body.rotation()-target)<1e-5,
     "crate collider orientation not updated while paused");
   const pivot=g.pivot,newAngle=.86;
   check(field.setAuthoredAngle(g.id,newAngle),
     "world-pinned gate could not be rotated for authoring");
   const gp=g.body.translation();
   const anchor={x:gp.x-Math.cos(newAngle)*g.length/2,
     y:gp.y-Math.sin(newAngle)*g.length/2};
   check(Math.hypot(anchor.x-pivot.x,anchor.y-pivot.y)<1e-4,
     "gate authoring violates physical world pin");
   check(ticks===field.ticks,"editor stepped the whole world");
   unrelated.forEach((body,i)=>{
     const ref=frozen[i],at=body.body.translation();
     check(Math.hypot(at.x-ref.pos.x,at.y-ref.pos.y)<1e-5,
       "editor changed unrelated matter");
     check(Math.abs(body.body.rotation()-ref.angle)<1e-5,
       "editor changed unrelated matter angle");
     check(Math.hypot(body.body.linvel().x-ref.vel.x,
       body.body.linvel().y-ref.vel.y)<1e-5,
       "editor cleared unrelated momentum");
   });
   const captured=field.exportScene(),restored=Field.fromScene(captured);
   try{
     const next=restored.exportScene();
     check(Math.abs(next.actors[0].angle-captured.actors[0].angle)<1e-4,
       "jointed body pose lost on import");
     check(Math.abs(next.gates[0].angle-captured.gates[0].angle)<1e-4,
       "pinned gate pose lost on import");
     for(let i=0;i<120;i++)restored.step();
     check(restored.actors.every(a=>a.parts.every(part=>{
       const t=part.body.translation();
       return Number.isFinite(t.x+t.y+part.body.rotation());
     })),"continued solver unstable after restoring authored pose");
   }finally{restored.dispose();}
   for(let i=0;i<120;i++)field.step();
   const follow=g.body.translation(),anchorAfter={
     x:follow.x-Math.cos(g.body.rotation())*g.length/2,
     y:follow.y-Math.sin(g.body.rotation())*g.length/2
   };
   const pinGap=Math.hypot(anchorAfter.x-pivot.x,anchorAfter.y-pivot.y);
   check(pinGap<.12,"world-pinned gate became detached under solver");
   return {rotatedArmBodies:p.arms.length,crateAngle:+target.toFixed(3),
     authoredGateAngle:newAngle,gatePinErrorAfterPhysics:+pinGap.toFixed(5),
     unrelatedMomentumPreserved:true,authoringSteps:0,
     schemaRoundtrip:true};
 }finally{field.dispose();}
}
