// A genuine editor intervention moves real collider-bearing Rapier bodies.
// It must not reset unrelated world afterstate, fake physics, or destroy joints.
export function poseProbe(Field) {
 const assert=(v,m)=>{if(!v)throw Error("pose: "+m);};
 const world=new Field();
 try{
   for(let i=0;i<35;i++)world.step(null);
   const tick=world.ticks;
   const otherMatter=world.matter.find(m=>m.kind==="matter");
   const before={...otherMatter.body.translation()};
   const targets=[
     {x:4,y:4},{x:8,y:13},{x:16,y:3},{x:27,y:19}
   ];
   for(const [i,actor] of world.actors.entries()){
     const original=actor.root.translation();
     const tailRelative=actor.tail?{
       x:actor.tail.translation().x-original.x,
       y:actor.tail.translation().y-original.y}:null;
     const at=targets[i];
     assert(world.reposition(actor.id,at),
       "cannot edit a physical organism in pause");
     const p=actor.root.translation();
     assert(Math.hypot(p.x-at.x,p.y-at.y)<.0001,
       "authored root pose was not applied");
     assert(Math.hypot(actor.root.linvel().x,actor.root.linvel().y)===0,
       "edited body retained pre-intervention momentum");
     if(tailRelative){
       const tail=actor.tail.translation();
       assert(Math.hypot(tail.x-p.x-tailRelative.x,
         tail.y-p.y-tailRelative.y)<.0001,
         "editing articulated body tore segments apart");
       assert(actor.joint.isValid(),
         "editing articulated body invalidated its real joint");
     }
     assert(world.pick(at)===actor.id,
       "shape-accurate pick failed on authored organism collider");
   }
   assert(world.ticks===tick,"reposition secretly advanced physics");
   assert(otherMatter.body.translation().x===before.x&&
     otherMatter.body.translation().y===before.y,
     "unrelated dynamic matter afterstate was destroyed by authoring");
   const some=world.matter.find(m=>m.kind==="matter");
   assert(world.reposition(some.id,{x:29,y:5}),
     "cannot author movable matter body pose");
   assert(world.pick({x:29,y:5})===some.id,
     "edited matter collider not selectable at its real position");
   assert(world.reposition(world.gates[0].id,{x:3,y:3})===false,
     "anchored hinge pivot was moved by illegal free drag");
   const positions=world.exportScene();
   assert(positions.actors.length===4 &&
      Math.abs(positions.actors[0].pos.x-4)<.0001 &&
      Math.abs(positions.matter[0].x-29)<.0001,
      "paused authored afterstate was not capturable as a new scene");
   for(let i=0;i<90;i++)world.step(null);
   assert(world.actors.every(a=>{
     const r=a.root.translation(),t=a.tail?.translation();
     return Number.isFinite(r.x+r.y+a.root.rotation())&&
       (!t||Number.isFinite(t.x+t.y));
   }),"reposed physical organisms became unstable on continuation");
   return {morphologies:4,initialTick:tick,remainingMatterStable:true,
     completeJointTranslation:true,pausedSceneCaptured:true};
 }finally{world.world.free();}
}
