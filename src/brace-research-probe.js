// Two matched worlds: a finite physical rear-pressure encounter. We alter
// only material brace authority and ground traction, never collision shapes,
// trajectories or the pusher's scripted goal/path.
export function braceProbe(Field) {
 const assert=(ok,msg)=>{if(!ok)throw Error("brace: "+msg);};
 function trial({stance,braceForce=2800,y=4}){
   const field=new Field();
   try{
     field.importScene({format:"combat-lab.initial-scene.v1",
       actors:[],walls:[],matter:[],gates:[]});
     const broad=field.spawn("broad",{x:15,y},0);
     field.select(broad.id);
     field.setActorProfile(broad.id,{braking:0,acceleration:0,
       turnTorque:0,turnRate:0,braceForce});
     const pusher=field.addBox({x:11.5,y,hx:.65,hy:.68,mass:550},false);
     const start=broad.root.translation().x;
     let maxContacts=0,peakBraceN=0;
     for(let t=0;t<165;t++){
       pusher.body.applyImpulse({x:2800/60,y:0},true);
       field.step({x:0,y:0,brace:stance});
       maxContacts=Math.max(maxContacts,broad.contactCount);
       peakBraceN=Math.max(peakBraceN,(broad.control.braceImpulse||0)*60);
       const p=broad.root.translation();
       assert(Number.isFinite(p.x+p.y+broad.root.rotation()),
         "physical pusher/holder became numerically invalid");
     }
     return {dx:broad.root.translation().x-start,
       contacts:maxContacts,peakBraceN};
   }finally{field.world.free();}
 }
 const free=trial({stance:false});
 const anchored=trial({stance:true});
 const absent=trial({stance:true,braceForce:0});
 const slick=trial({stance:true,y:11});
 assert(free.contacts>0&&anchored.contacts>0,
   "material body never reached stationary holder");
 assert(anchored.peakBraceN>0&&anchored.peakBraceN<=2800.001,
   "brace exceeded finite authored ground-reaction budget");
 assert(Math.abs(absent.dx-free.dx)<.002,
   "zero-strength brace changed the same material pressure contest");
 assert(free.dx-anchored.dx>.15,
   "active finite brace did not change physical displacement");
 return {free,anchored,absent,slick};
}
