// P8 real WASM crowd A/B. Source outcome readouts never drive behavior.
// Exactly the same initial physical bodies, masses, motor/speed budgets
// between drive, naive yield and actual-contact-only finite side-slip.
import {makeTactileYard} from "./p8-tactile.js";
import {V} from "./p0-world.js";
const round=x=>Math.round(x*1e4)/1e4;
function physicalState(w){
 return {tick:w.ticks,bodies:w.entities.map(e=>({id:e.id,kind:e.kind,
  p:{...e.body.translation()},v:{...e.body.linvel()},
  yaw:e.body.rotation(),omega:e.body.angvel(),
  mass:e.body.mass(),fixed:e.body.isFixed()}))};
}
export function p8Case({tactile="slip",width=2.85,formation="center",
 guardPolicy="brace",support="finite",density=6,
 intervention="none",ticks=460,captureWorld=null}={}){
 const w=makeTactileYard({tactile,width,formation,guardPolicy,support,density,
  guardKind:"bulky",guardMass:90});
 try{
  const start=physicalState(w),trace=[];
  let preContact=null,preAction=null,postAction=null,
   firstRealContact=null,firstCross=null,preCollisionEffort=0;
  let zeroDriveWhileBlocked=0,stalledUnderPhysicalPressure=0;
  for(let step=0;step<ticks;step++){
   if(step===45)preContact=physicalState(w);
   if(step===190){
    preAction=physicalState(w);
    if(intervention==="poke"){
     if(!w.pushGuard(V(85,0)))throw Error("P8 genuine shock did not apply");
     postAction=physicalState(w);
    }else if(intervention==="open"){
     const old= w.opening().width;
     if(!w.openPassage()||Math.abs(w.opening().width-old-1.30)>.0001)
      throw Error("P8 actual same-world collider widening failed");
     postAction=physicalState(w);
     const except=e=>e.bodies.filter(a=>a.id!==w.gap.lowWall.id);
     if(JSON.stringify(except(preAction))!==JSON.stringify(except(postAction)))
      throw Error("P8 edit teleported independent physical bodies");
    }else if(intervention!=="none")throw Error("P8 intervention unknown");
   }
   w.step();
   const res=w.pressureTrace();
   if(firstRealContact===null&&res.pressure.guardContacts>0)
    firstRealContact=w.ticks;
   if(firstCross===null&&res.crossings.mouth>0)
    firstCross=w.ticks;
   for(const a of w.pushers){
    const v=a.body.linvel();
    const contact=w.touch(a).filter(x=>x.other===w.guard||
      w.pushers.includes(x.other));
    if(contact.length&&v.x<.15)stalledUnderPhysicalPressure++;
    if(contact.length&&vlen(v)<.08)zeroDriveWhileBlocked++;
   }
   if([0,44,94,189,250,349,ticks-1].includes(step))
    trace.push({tick:res.tick,guard:res.guard,passes:res.crossings.mouth,
     contact:res.pressure.guardContacts,effort:round(res.events.rootEffort),
     pressure:res.pressure.guardImpulse,slip:res.p8.slideTicks,
     movers:res.movers});
  }
  const out=w.pressureTrace();
  const state={
   source:"Rapier2D actual rigid independent physical actors, NOT softbody",
   tactile,width,formation,guardPolicy,support,density,intervention,
   finite:out.finite,actors:out.actorCount,loads:out.loadCount,
   mass:out.guard.mass,shape:out.guard.shapeRadius,
   starts:start,early:preContact,preAction,postAction,
   contacts:out.pressure.guardContacts,pressure:out.pressure.guardImpulse,
   impulses:out.events.rootEffort,terrain:out.events.terrainLinearImpulse,
   guard:out.guard,passes:out.crossings.mouth,movers:out.movers,
   loads:out.loads,firstRealContact,firstCross,
   slipTriggers:out.p8.contactActivations,slipTicks:out.p8.slideTicks,
   actualContactTime:out.p8.contactTimes,
   stalledUnderPhysicalPressure,zeroDriveWhileBlocked,
   cumulativeMoverEffort:out.p8.totalRootImpulse,
   trace};
  if(captureWorld)captureWorld(w,state);
  return state;
 }finally{if(!captureWorld)w.dispose();}
}
const vlen=p=>Math.hypot(p.x,p.y);
export function p8Probe(){
 const worlds=[];
 for(const width of [2.85,4.65])
  for(const support of ["finite","none"])
   for(const formation of ["center","flank"])
    for(const guardPolicy of ["passive","brace"])
     for(const tactile of ["drive","yield","slip"])
      worlds.push(p8Case({width,support,formation,guardPolicy,tactile}));
 const bad=worlds.filter(x=>!x.finite||x.actors!==7||x.loads!==2||
  x.mass!==90);
 if(worlds.length!==48||bad.length)
  throw Error("P8 actual 48 controlled material crowd scenarios absent: "+
   JSON.stringify({total:worlds.length,bad:bad.map(x=>({
    tactile:x.tactile,width:x.width,formation:x.formation,
    support:x.support,guard:x.guardPolicy,finite:x.finite,
    actors:x.actors,loads:x.loads,mass:x.mass}))}));
 const triples=[];
 for(const width of [2.85,4.65])
  for(const support of ["finite","none"])
   for(const formation of ["center","flank"])
    for(const guardPolicy of ["passive","brace"]){
     const group=worlds.filter(x=>x.width===width&&
      x.support===support&&x.formation===formation&&
      x.guardPolicy===guardPolicy);
     if(group.length!==3)throw Error("P8 missing comparator triple");
     const start=JSON.stringify(group[0].starts);
     if(group.some(x=>JSON.stringify(x.starts)!==start))
      throw Error("P8 pre-source physical mass/positions not identical");
     const slip=group.find(x=>x.tactile==="slip");
     if(slip.slipTriggers>0&&slip.actualContactTime<=0)
      throw Error("P8 tactile slip activated with no physical solver contact");
     if(group.some(x=>x.tactile!=="slip"&&x.slipTriggers!==0))
      throw Error("P8 cheap baseline showed unearned slip");
     triples.push({width,support,formation,guardPolicy,
      modes:group.map(x=>({policy:x.tactile,
       passes:x.passes,firstCross:x.firstCross,guardX:x.guard.x,
       root:round(x.impulses),moverSource:round(x.cumulativeMoverEffort),
       contacts:x.contacts,slip:x.slipTriggers,
       blocked:x.stalledUnderPhysicalPressure}))});
    }
 const actions=[];
 for(const tactile of ["drive","yield","slip"])
  for(const intervention of ["none","poke","open"])
   actions.push(p8Case({tactile,width:2.85,formation:"flank",
    support:"finite",guardPolicy:"brace",intervention}));
 if(actions.length!==9||actions.some(x=>!x.finite||!x.preAction))
  throw Error("P8 matched action source worlds missing");
 for(const tactile of ["drive","yield","slip"]){
  const group=actions.filter(x=>x.tactile===tactile);
  const nullWorld=group.find(x=>x.intervention==="none");
  if(group.some(x=>JSON.stringify(x.preAction)!==
      JSON.stringify(nullWorld.preAction)))
   throw Error("P8 operator edits not sourced from EXACT same preevent physical state");
 }
 return {cases:worlds.length+actions.length,worlds,triples,actions,
  explicitLimits:"P8 is TACTILE steering control, not soft-body compression. Different source motor impulse budgets and endstates invalidate unconditional superiority claims. Owner not tested; real gameplay feel unknown."};
}
