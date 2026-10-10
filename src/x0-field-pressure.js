// Actual Rapier shared-world pressure, never an "ecosystem score".
// Paired world seeds: identical authored bodies/matter/external forcing,
 // DIFFERENCE: own-sensed tactile arm servo response on/off. Finite bracing
// remains unchanged in both. External force is explicitly researcher-origin.
import {V,norm} from "./x0-world.js";
const round=x=>+x.toFixed(4);
const rotate=(p,a)=>V(p.x*Math.cos(a)-p.y*Math.sin(a),
 p.x*Math.sin(a)+p.y*Math.cos(a));
const delta=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
function randomGenerator(seed){
 let x=seed>>>0;return ()=>{
  x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;
 };
}
function trial(World,seed,enabled){
 const w=new World({empty:true});
 const r=randomGenerator(seed);
 try{
  for(let i=0;i<15;i++){
   const form=["reach","bulk","lever"][i%3],x=8.3+i%5*5.3+(r()-.5)*.4,
     y=5.7+Math.floor(i/5)*6.9+(r()-.5)*.5;
   const body=w.addActor(form,V(x,y),(r()-.5)*6.2,{
     mass:form==="bulk"?180+r()*160:35+r()*90,
     motor:300+r()*1300,
     brace:40+r()*1700,
     armLength:form==="bulk"?0:1.0+r()*1.6
   });
   w.setArmReflex(body.id,enabled);
  }
  for(let i=0;i<17;i++){
   const x=7+r()*28,y=4+r()*18,
     hx=.2+r()*1.1,hy=.17+r()*.64;
   w.addMatter(V(x,y),{mass:15+r()*450,hx,hy,
     form:i%5===0?"beam":"block",created:false});
  }
  w.addHinge(V(21,11.5),{length:3.6,mass:145,angle:.3,created:false});
  w.addRail(V(12.8,20.5),{length:2.4,mass:100,created:false});
  // Respect the same selected-user state for both. Here NONE is possessed.
  w.select(null);
  const initial=w.actors.map(a=>V(a.root.translation().x,a.root.translation().y));
  let peak=0,peakDrift=0,impulses=0,moving=0,contactSteps=0;
  for(let t=0;t<300;t++){
   if(t%31===0){
    // Identical target-index and vector selection across paired worlds;
    // the force point is on the evolving target, so not a fixed world point.
    const targetIndex=Math.floor(r()*(w.actors.length+w.matter.length));
    const body=targetIndex<w.actors.length?
      w.actors[targetIndex].root:
      w.matter[targetIndex-w.actors.length].body;
    const angle=r()*Math.PI*2,size=110+r()*470,p=body.translation();
    body.applyImpulseAtPoint(V(Math.cos(angle)*size,Math.sin(angle)*size),p,true);
    impulses++;
   }
   w.step();peak=Math.max(peak,w.counts.contacts);
   if(w.counts.contacts>0)contactSteps++;
   for(const a of w.actors){
    for(const part of a.parts){
     const p=part.body.translation(),v=part.body.linvel();
     if(!Number.isFinite(p.x+p.y+v.x+v.y+part.body.rotation()))
       throw Error("nonfinite organism under pressure");
    }
    for(const arm of a.arms){
     const b=a.root.translation(),ap=rotate(arm.shoulder,a.root.rotation());
     const q=arm.body.translation(),anchor=rotate(V(-arm.half,0),
       arm.body.rotation());
     peakDrift=Math.max(peakDrift,
       delta(V(b.x+ap.x,b.y+ap.y),V(q.x+anchor.x,q.y+anchor.y)));
    }
   }
   for(const m of w.matter){
    const p=m.body.translation();
    if(!Number.isFinite(p.x+p.y+m.body.rotation()))
      throw Error("nonfinite constrained material under pressure");
   }
  }
  for(let i=0;i<w.actors.length;i++){
   if(delta(w.actors[i].root.translation(),initial[i])>.15)moving++;
  }
  return {seed,enabled,actors:w.actors.length,matter:w.matter.length,
    steps:w.ticks,contactSteps,peakContactIncidences:peak,
    externalImpulses:impulses,actorResponses:w.counts.reflex,
    braceActions:w.counts.braces,
    peakJointAnchorGap:round(peakDrift),
    bodiesMoved: moving,
    finalActors:w.actors.map(a=>({id:a.id,pos:V(round(a.root.translation().x),
      round(a.root.translation().y)),localEvents:a.response.events})),
    finalMatter:w.matter.map(m=>V(round(m.body.translation().x),
      round(m.body.translation().y)))};
 }finally{w.dispose();}
}
export function sharedMaterialPressure(World){
 const pairs=[];
 for(const seed of [19,41,97]){
  const quiet=trial(World,seed,false),reactive=trial(World,seed,true);
  const actorDivergence=quiet.finalActors.map((x,i)=>
    delta(x.pos,reactive.finalActors[i].pos));
  const matterDivergence=quiet.finalMatter.map((x,i)=>
    delta(x,reactive.finalMatter[i]));
  pairs.push({seed,contactSteps:reactive.contactSteps,
    externallyPerturbed:reactive.externalImpulses,
    localResponseEvents:reactive.actorResponses,
    quietLocalEvents:quiet.actorResponses,
    movedActors:reactive.bodiesMoved,
    actorAfterstatesChanged:actorDivergence.filter(d=>d>.1).length,
    matterAfterstatesChanged:matterDivergence.filter(d=>d>.1).length,
    peakJointGap:reactive.peakJointAnchorGap,
    quietPeakJointGap:quiet.peakJointAnchorGap,
    maxActorContrast:round(Math.max(...actorDivergence)),
    maxMatterContrast:round(Math.max(...matterDivergence))});
 }
 return {scope:"3 seeded 15-body/19-matter worlds; explicit outside disturbance; not natural ecology or FPS",
   trials:pairs,
   sensorResponses:pairs.reduce((n,p)=>n+p.localResponseEvents,0)};
}
