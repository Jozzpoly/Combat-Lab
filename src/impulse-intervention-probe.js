// Independent experimenter force is NOT an organism ability. Verify that
// impacts hit actual separate rigid bodies, with finite off-center torque.
export function impulseInterventionProbe(Field){
 const check=(v,msg)=>{if(!v)throw Error("material-impulse: "+msg);};
 function crateCase(offcenter){
   const field=new Field({empty:true});
   try{
     const box=field.addBox({x:12,y:12,hx:.6,hy:.48,mass:45},false);
     const point=offcenter?{x:12.48,y:12.36}:{x:12,y:12};
     const hit=field.pokeAt(point,{x:400,y:0});
     check(hit?.owner===box.id && hit.part==="box","impact missed crate");
     for(let i=0;i<75;i++)field.step();
     return {offcenter,angle:+box.body.rotation().toFixed(4),
       x:+box.body.translation().x.toFixed(3),
       y:+box.body.translation().y.toFixed(3),
       delivered:hit.appliedImpulse};
   }finally{field.dispose();}
 }
 const center=crateCase(false),offcenter=crateCase(true);
 check(Math.abs(offcenter.angle-center.angle)>.02,
   "impact application was a fake centre impulse; off-center torque absent");
 const world=new Field({empty:true});
 try{
   const a=world.spawn("pincer",{x:10,y:12},0),initialTicks=world.ticks;
   const child=a.arms[0].hook,tip=child.translation();
   const before=child.body.linvel(),beforeRoot=a.root.linvel();
   const received=world.pokeAt({x:tip.x,y:tip.y},
     {x:0,y:240});
   check(received?.owner===a.id,"articulated body not reachable");
   check(received.part==="hook"||received.part==="upper",
     "wrong physical child received force");
   const after=child.body.linvel();
   check(Math.hypot(after.x-before.x,after.y-before.y)>.01,
     "impulse was applied to virtual parent rather than actual limb");
   check(world.ticks===initialTicks,"poke secretly stepped world");
   check(!world.pokeAt({x:31,y:20},{x:250,y:0}),
     "empty space must not generate collision impulse");
   check(!world.pokeAt({x:12,y:12},{x:0,y:0}),
     "zero impulse cannot fabricate material response");
   for(let i=0;i<100;i++)world.step();
   const p=a.root.translation(),q=child.body.translation();
   check(Number.isFinite(p.x+p.y+q.x+q.y),"jointed body became nonfinite");
   return {center,offcenter,
     limb:{owner:received.owner,physicalPart:received.part,
       actualImpulse:received.appliedImpulse,
       rootDeltaVelocity:Math.hypot(
         a.root.linvel().x-beforeRoot.x,a.root.linvel().y-beforeRoot.y),
       jointContinued:true}};
 }finally{world.dispose();}
}
