// M0 pressure trials: actual physical organism-to-organism encounter.
// This is NOT a pass/fail test of animal life, grounded locomotion or game feel.
// Reusable fixed initial worlds; only explicit operator force, laboratory
// impulse, actual solver contact, and bounded internal reflex energy.
import {M0Field,V} from "./m0-world.js";
const rd=n=>Math.round(n*1e4)/1e4;
function trial(kind,{reflex=false,offset=0,mode="drive"}={}){
 const w=new M0Field({empty:true,reflex});
 try{
  const mover=w.addActor(kind,V(12,12));
  const other=w.addActor("rigid",V(18,12+offset));
  w.select(mode==="passive"?null:mover.id);
  const source=w.sample().actors[0];
  const before=other.root.translation(),first=V(before.x,before.y);
  let firstTouch=null,contactTicks=0,peak=0,reflexStarted=null;
  const hit=()=>{
   let impulse=0;
   for(const part of mover.parts)for(const target of other.parts){
    w.world.contactPair(part.collider,target.collider,manifold=>{
     for(let k=0;k<manifold.numSolverContacts();k++)
      impulse+=Math.abs(manifold.contactImpulse(k)||0);
    });
   }
   return impulse;
  };
  if(mode==="poke"){
   w.select(null);
   if(!w.poke(V(12,12),V(660,0)))throw Error("External research poke missed actual collider");
  }
  let maxRadialSpread=0,maxHingeBend=0,energyCheck=true;
  for(let tick=0;tick<330;tick++){
   w.step({direction:mode==="drive"&&tick<230?V(1,0):V()});
   const imp=hit();
   if(imp>0){contactTicks++;if(firstTouch===null)firstTouch=tick;}
   peak=Math.max(peak,imp);
   if(mover.responseEvents&&reflexStarted===null)reflexStarted=tick;
   const r=mover.root.translation();
   const lengths=mover.parts.slice(1).map(p=>{
    const xy=p.body.translation();return Math.hypot(xy.x-r.x,xy.y-r.y);
   });
   if(lengths.length)maxRadialSpread=Math.max(maxRadialSpread,Math.max(...lengths)-Math.min(...lengths));
   if(kind==="chain"){
    const angles=mover.parts.map(p=>p.body.rotation());
    maxHingeBend=Math.max(maxHingeBend,Math.abs(Math.atan2(Math.sin(angles[1]-angles[0]),Math.cos(angles[1]-angles[0]))),
       Math.abs(Math.atan2(Math.sin(angles[2]-angles[1]),Math.cos(angles[2]-angles[1]))));
   }
   if(!Number.isFinite(w.lastContactImpulse)||!Number.isFinite(r.x))energyCheck=false;
  }
  const end=other.root.translation(),head=mover.root.translation(),s=w.sample();
  return {kind,reflex,offset,mode,contactTicks,firstTouch,peakContactImpulse:rd(peak),
    otherDX:rd(end.x-first.x),otherDY:rd(end.y-first.y),
    moverDX:rd(head.x-source.x),moverDY:rd(head.y-source.y),
    maxRadialSpread:rd(maxRadialSpread),maxHingeBend:rd(maxHingeBend),
    responseEvents:mover.responseEvents,firstReflexTick:reflexStarted,
    rootMotorTicks:mover.motorTicks,externalImpulse:rd(w.externalImpulse),
    final:s.actors.map(a=>({kind:a.kind,x:a.x,y:a.y})),numericFinite:energyCheck};
 }finally{w.dispose();}
}
export function runM0Probe(){
 const cases=[];
 for(const kind of ["rigid","chain","compliant"])
  for(const offset of [-.8,0,.8])
   for(const reflex of [false,true])
    cases.push(trial(kind,{offset,reflex}));
 const passive=["rigid","chain","compliant"].map(kind=>trial(kind,{mode:"passive"}));
 const poke=["rigid","chain","compliant"].map(kind=>trial(kind,{mode:"poke",reflex:true}));
 if(cases.some(c=>!c.numericFinite)||passive.some(c=>!c.numericFinite)||poke.some(c=>!c.numericFinite))
  throw Error("M0 solver produced nonfinite state");
 if(passive.some(c=>c.rootMotorTicks!==0||c.externalImpulse!==0||c.responseEvents>0))
  throw Error("M0 passive control unexpectedly actuated");
 if(cases.some(c=>c.externalImpulse>0)||poke.some(c=>c.rootMotorTicks>0))
  throw Error("M0 source of action/energy conflated");
 return {scope:"3 morphological constructions × 3 predeclared offsets × reflex ON/OFF; 3 truly passive and 3 external-poke controls. 330 solver ticks each; physically independent worlds, no traffic goals/path planning. Head-root finite external planar traction PROXY.",
  cases,passive,poke,warning:"The rigid candidate is not a matched-envelope substitute; this is source/behavior feasibility, NOT a morphology ranking, proven locomotion, life, soft tissue, or Owner acceptance."};
}
