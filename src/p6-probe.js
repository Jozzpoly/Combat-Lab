// P6 counterfactual physical envelope; seed-free equal motor controls.
// No route/collision size predicate used to move or stop body: only Rapier.
// Success flag is an offline readout, never used by controller.
import {p6Case,createP6Commons,openP6} from "./p6-envelope.js";
import {V} from "./p0-world.js";
const round=x=>Math.round(x*1e4)/1e4;
export function p6PressureProbe(){
 const worlds=[];
 for(const width of [.95,1.2,2.1,2.85])
  for(const support of ["finite","none"])
   for(const mass of [90,null])
    for(const motor of [650,900])
     for(const kind of ["small","bulky"])
      worlds.push(p6Case({width,support,mass,motor,kind,ticks:440}));
 const changed=[];
 for(const support of ["finite","none"])
  for(const kind of ["small","bulky"])
   for(const edit of ["none","open"])
    changed.push(p6Case({kind,width:1.2,support,mass:90,motor:650,
     edit,ticks:440}));
 if(worlds.length!==64||changed.length!==8)throw Error("P6 case count");
 for(const r of [...worlds,...changed]){
  if(!r.finite||r.actualFixedWalls!==2||r.bodyShape.r===undefined)
   throw Error("P6 expected actual circular body/two collider walls");
  if(r.massSource===90&&Math.abs(r.actualMass-90)>.0001)
   throw Error("P6 matched mass was not physically applied");
  if(r.edit==="open"&&(!r.editedBarrier||!r.preEdit||!r.afterEdit))
   throw Error("P6 source edited passage absent");
 }
 for(const r of changed.filter(x=>x.edit==="open")){
  const baseline=changed.find(x=>x.kind===r.kind&&x.support===r.support&&x.edit==="none");
  if(!baseline||JSON.stringify(r.preEdit.p)!==JSON.stringify(baseline.preEdit.p)||
    JSON.stringify(r.preEdit.v)!==JSON.stringify(baseline.preEdit.v)||
    r.preEdit.effort!==baseline.preEdit.effort)
   throw Error("P6 edited/non-edited worlds not same prior physical state");
  if(JSON.stringify(r.afterEdit.p)!==JSON.stringify(r.preEdit.p)||
   JSON.stringify(r.afterEdit.v)!==JSON.stringify(r.preEdit.v))
   throw Error("P6 topology edit teleported body/velocity");
 }
 // Same pressure control inside an inhabited spatial world. Read actual
 // body and load movements, collision contacts, and local real pressure.
 const snapshots=[];
 for(const support of ["finite","none"])
  for(const usePolicy of ["constant","touch"]){
   const w=createP6Commons({support});
   w.policy=usePolicy;
   try{
    const starts=w.traces();
    let narrowContacts=0,largeContacts=0;
    const seen=[];
    for(let i=0;i<500;i++){
     w.step();
     if(i%100===0){
      const t=w.commonsTrace();
      seen.push({tick:t.tick,actors:t.actors,loads:t.loads,
       contacts:t.activity.contactActor,fixContact:t.activity.contactFixed,
       root:t.events.rootEffort});
     }
     const actors=w.actors;
     narrowContacts+=w.touch(actors[0]).filter(x=>x.other.kind==="barrier").length;
     largeContacts+=w.touch(actors[1]).filter(x=>x.other.kind==="barrier").length;
    }
    const t=w.commonsTrace();
    snapshots.push({support,policy:usePolicy,finite:t.finite,
     actors:t.actorCount,loads:t.loadCount,roles:t.local,
     barrierContacts:{small:narrowContacts,large:largeContacts},
     displacement:t.actors.map(a=>{const prior=starts.actors.find(x=>x.id===a.id);
      return {kind:a.kind,id:a.id,dx:round(a.x-prior.x),dy:round(a.y-prior.y)};}),
     cargoDisplacement:t.loads.map(a=>{const prior=starts.loads.find(x=>x.id===a.id);
      return {id:a.id,dx:round(a.x-prior.x),dy:round(a.y-prior.y)};}),
     worldEvidence:t.activity,history:seen});
   }finally{w.dispose();}
  }
 if(snapshots.some(x=>!x.finite||x.actors!==4||x.loads!==2))
  throw Error("P6 inhabited actual-source physical scene unstable");
 const pairs=[];
 for(const width of [.95,1.2,2.1,2.85])
  for(const support of ["finite","none"])
   for(const motor of [650,900]){
    const s=worlds.find(x=>x.width===width&&x.support===support&&
      x.kind==="small"&&x.massSource===90&&x.motor===motor);
    const b=worlds.find(x=>x.width===width&&x.support===support&&
      x.kind==="bulky"&&x.massSource===90&&x.motor===motor);
    if(!s||!b||s.actualMass!==b.actualMass||s.speed!==b.speed)
     throw Error("P6 shape-only comparator not physically equalized");
    pairs.push({width,support,motor,mass:s.actualMass,
     small:{crossed:s.crossed,firstCross:s.crossedAt,endX:s.end.x,effort:s.totalEffort},
     bulky:{crossed:b.crossed,firstCross:b.crossedAt,endX:b.end.x,effort:b.totalEffort}});
   }
 return {cases:worlds.length+changed.length+snapshots.length,worlds,
  matchedGeometryPairs:pairs,editedPairs:changed,inhabited:snapshots,
  evidence:"Actual Rapier circular colliders at native and matched 90kg masses, equal x-only bounded drive, edited genuine fixed collider passage and 4-body source room.",
  limits:"Crossing is a diagnostic x-coordinate beyond real wall, not controller goal. This isolates static circular envelope, NOT articulated/anatomically distinctive locomotion or any Owner-quality play feel."};
}
