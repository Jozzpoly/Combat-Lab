// P7 red-team of real multi-actor contact pressure in ONE physical world.
// Diagnostic scoring never participates in actor decisions. Controls use
// identical beginning state, guard physical mass 90kg, equal crowd root motors.
import {makeDoorCrowd} from "./p7-crowd.js";
import {V} from "./p0-world.js";
const rd=v=>Math.round(v*1e4)/1e4;
function physicalFingerprint(w){
 return {ticks:w.ticks, bodies:w.entities.map(e=>({
  id:e.id,kind:e.kind,p:{...e.body.translation()},v:{...e.body.linvel()},
  a:e.body.rotation(),omega:e.body.angvel(),fixed:e.body.isFixed(),
  mass:e.body.mass()})),
  deflected:[...w.deflected],headings:[...w.localHeadings],
  pressure:{...w.pressure},events:{...w.events}};
}
export function p7Case({width=3.45,density=6,support="finite",
 guardKind="bulky",guardPolicy="brace",moverPolicy="drive",
 intervention="none",ticks=460,captureWorld=null}={}){
 const w=makeDoorCrowd({width,density,support,guardKind,guardMass:90,
  guardPolicy,moverPolicy});
 try{
  const start=physicalFingerprint(w),interventionTick=210;
  let pre=null,postEdit=null;
  const intervals=[];
  let firstGuardContact=null,firstPass=null;
  for(let i=0;i<ticks;i++){
   if(i===interventionTick){
    pre=physicalFingerprint(w);
    if(intervention==="open"){
     const original=pre.bodies.find(e=>e.id===w.gap.highWall.id);
     if(!w.openPassage())throw Error("P7 cannot physically move authored barrier");
     postEdit=physicalFingerprint(w);
     const wall=postEdit.bodies.find(e=>e.id===w.gap.highWall.id);
     if(Math.abs(wall.p.y-original.p.y+1.3)>1e-6)
      throw Error("P7 topology edit failed real collider movement");
     const exclude=(p)=>p.bodies.filter(e=>e.id!==wall.id);
     if(JSON.stringify(exclude(pre))!==JSON.stringify(exclude(postEdit)))
      throw Error("P7 topology edit changed bodies other than intended wall");
    }else if(intervention==="poke"){
     if(!w.pushGuard(V(85,0)))throw Error("P7 operator impulse was not physical");
     postEdit=physicalFingerprint(w);
    }else if(intervention!=="none")throw Error("P7 intervention");
   }
   w.step();
   const t=w.pressureTrace();
   if(firstGuardContact===null&&t.pressure.guardContacts>0)
    firstGuardContact=w.ticks;
   if(firstPass===null&&t.crossings.mouth>0)firstPass=w.ticks;
   if([59,139,209,259,359,ticks-1].includes(i))
    intervals.push({tick:t.tick,guard:t.guard,
     crowdContacts:t.pressure.guardContacts,
     pressure:t.pressure.guardImpulse,braced:t.pressure.guardBraceTicks,
     deflected:t.pressure.deflections,passed:t.crossings.mouth,
     loads:t.loads,movers:t.movers});
  }
  const end=w.pressureTrace(),source=end.pressure;
  const actorInitial=start.bodies.filter(e=>e.kind==="small"||e.kind==="bulky");
  const moverOutcome=end.movers.map(a=>{
   const initial=actorInitial.find(x=>x.id===a.id);
   return {...a,dx:rd(a.x-initial.p.x),dy:rd(a.y-initial.p.y)};
  });
  const out={support,width,density,guardKind,guardPolicy,moverPolicy,
   intervention,ticks,start:{guardMass:rd(w.guard.body.mass()),
    guardShape: w.guard.shapes[0].shape, guardStart:start.bodies.find(e=>e.id===w.guard.id)},
   realBodyCount:end.actorCount,realLoads:end.loadCount,
   finite:end.finite,contacts:source.guardContacts,
   contactImpulse:source.guardImpulse,pressureTicks:source.guardPressureTicks,
   braceTicks:source.guardBraceTicks,deflections:source.deflections,
   firstGuardContact,firstPass,
   passedMouth:end.crossings.mouth,passedAnywhere:end.crossings.all,
   guard:end.guard,movers:moverOutcome,loads:end.loads,
   sourceCost:{root:rd(end.events.rootEffort),
    terrain:rd(end.events.terrainLinearImpulse),
    external:rd(source.guardPokes),yawn:rd(end.events.terrainAngularImpulse)},
   initialFingerprint:start,preIntervention:pre,postIntervention:postEdit,
   intervals};
  if(captureWorld)captureWorld(w,out);
  return out;
 }finally{if(!captureWorld)w.dispose();}
}
export function p7Probe(){
 const base=[];
 for(const width of [2.85,4.65])
  for(const density of [3,6])
   for(const support of ["finite","none"])
    for(const guardKind of ["small","bulky"])
     for(const guardPolicy of ["passive","brace"])
      for(const moverPolicy of ["drive","yield"])
       base.push(p7Case({width,density,support,guardKind,guardPolicy,
        moverPolicy}));
 if(base.length!==64||base.some(x=>!x.finite||x.realLoads!==2||
   x.realBodyCount!==x.density+1))
  throw Error("P7 actual multiforce physical matrix invalid");
 for(const x of base){
  if(Math.abs(x.start.guardMass-90)>1e-4)
   throw Error("P7 opponent mass not physically matched");
  if(x.moverPolicy==="drive"&&x.deflections!==0)
   throw Error("P7 no-local-policy control secretly steered");
  if((x.support==="none"||x.guardPolicy==="passive")&&x.braceTicks!==0)
   throw Error("P7 impossible pressure-dependent brace reaction");
 }
 const paired=[];
 for(const width of [2.85,4.65])
  for(const guardPolicy of ["passive","brace"])
   for(const intervention of ["none","open","poke"])
    paired.push(p7Case({width,guardPolicy,intervention,
     density:6,support:"finite",guardKind:"bulky",moverPolicy:"drive"}));
 if(paired.length!==12||paired.some(x=>!x.finite||
  x.initialFingerprint.bodies.length!==x.preIntervention.bodies.length))
  throw Error("P7 source local operator counterfactual invalid");
 const comparisons=[];
 for(const width of [2.85,4.65])
  for(const guardPolicy of ["passive","brace"]){
   const group=paired.filter(x=>x.width===width&&x.guardPolicy===guardPolicy);
   const control=group.find(x=>x.intervention==="none");
   for(const x of group){
    if(JSON.stringify(control.preIntervention)!==JSON.stringify(x.preIntervention))
     throw Error("P7 perturbation differed BEFORE the physical intervention");
    comparisons.push({width,guardPolicy,change:x.intervention,
     guardX:x.guard.x,brace:x.braceTicks,pulse:x.sourceCost.external,
     passed:x.passedMouth,load0:x.loads[0],cost:x.sourceCost.root,
     pressure:x.contactImpulse});
   }
 }
 const geometry=[];
 for(const width of [2.85,4.65])
  for(const support of ["finite","none"]){
   const controls=base.filter(x=>x.width===width&&x.support===support&&
    x.density===6&&x.guardPolicy==="passive"&&x.moverPolicy==="drive");
   if(controls.length!==2)throw Error("P7 missing mass-matched shape A/B");
   const x=controls.find(x=>x.guardKind==="small"),y=controls.find(x=>x.guardKind==="bulky");
   if(x.start.guardMass!==y.start.guardMass)
    throw Error("P7 missing actual Rapier equal mass in different envelopes");
   geometry.push({width,support,smallRadius:x.start.guardShape.r,
    bulkyRadius:y.start.guardShape.r,bothMass:x.start.guardMass,
    small:{contacts:x.contacts,passed:x.passedMouth,guardX:x.guard.x},
    bulky:{contacts:y.contacts,passed:y.passedMouth,guardX:y.guard.x}});
  }
 return {worlds:base.length+paired.length,base,paired,comparisons,geometry,
  limitations:"Bodies are 2D rigid circles, no anatomical gait, contact-informed guard stance changes finite virtual ground coupling, not intrinsic player intelligence. Entry directions/source positions authored. Crossing statistics are offline observation, not goals or passed-through-wall permission."};
}
