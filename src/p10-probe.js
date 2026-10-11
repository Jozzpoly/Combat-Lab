// P10 actual Rapier source tests: mechanically observed action opportunities,
// not engineered success labels or product-level verdicts. Compare cheap nulls.
// No fixture is counted as organism cognition or an Owner-play session.
import {makeMaterialWorkshop} from "./p10-workshop.js";
import {V} from "./p0-world.js";
const round=x=>Math.round(x*1e4)/1e4;
const pos=e=>({x:round(e.body.translation().x),y:round(e.body.translation().y)});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function snapshot(w){
 return w.entities.map(e=>({id:e.id,kind:e.kind,
  x:round(e.body.translation().x),y:round(e.body.translation().y),
  vx:round(e.body.linvel().x),vy:round(e.body.linvel().y),
  angle:round(e.body.rotation()),omega:round(e.body.angvel()),
  fixed:e.body.isFixed(),mass:round(e.body.mass())}));
}
function runSlot({who="small",open=false,support="finite"}={}){
 const w=makeMaterialWorkshop({fixture:who==="small"?"slot-small":"slot-bulky",support});
 try{
  const t0=w.trace(),before=snapshot(w),active=w.chosen,initial=pos(active);
  if(open&&!w.openSlot())throw Error("P10 physical topology change failed");
  const aperture=w.aperture(),firstEnter=null;
  let firstExit=null,firstTouch=0,peakX=initial.x,maxPenetration=0;
  for(let i=0;i<470;i++){
   w.step(V(1,0));
   const p=active.body.translation(),r=active.shapes[0].shape.r;
   peakX=Math.max(peakX,p.x);
   if(firstExit===null&&p.x>29.2&&p.y-r>aperture.highWallEdge-.02&&
    p.y+r<aperture.lowWallEdge+.02)firstExit=w.ticks;
   if(w.touch(active).some(t=>t.other===w.slot.upper||t.other===w.slot.lower))
    firstTouch++;
  }
  const t=w.trace();
  return {who,open,support,actualGap:aperture.width,diameter:active.shapes[0].shape.r*2,
   mass:round(active.body.mass()),speed:active.maxSpeedOverride,motor:active.motor,
   initially:before,start:initial,end:pos(active),peakX:round(peakX),
   firstExit,colliderTouchTicks:firstTouch,finalFinite:t.finite,
   effort:t.rootEffort,otherActors:t.actors.filter(a=>a.id!==active.id).map(a=>({
    id:a.id,x:a.x,y:a.y})),materialLoads:t.cargo.length};
 }finally{w.dispose();}
}
function runHaul({link=false}={}){
 const w=makeMaterialWorkshop({fixture:"haul"});
 try{
  w.setSelected(w.small.id);
  const initial=snapshot(w),loadStart=pos(w.handLoad);
  let atContact=null;
  for(let i=0;i<115;i++){
   w.step(V(1,0));
   if(w.actualContact(w.small,w.handLoad)){atContact=w.ticks;break;}
  }
  if(atContact===null)throw Error("P10 no real solver contact reached in haul trial");
  const physicalBeforeGrip=snapshot(w);
  let acquired=false;
  if(link){
   const result=w.grip(w.small.id,w.handLoad.id,{maxImpulse:4});
   acquired=result.ok;
   if(!acquired)throw Error("P10 grip refused genuine prior contact");
  }
  for(let i=0;i<30;i++)w.step(V());
  const reverseAt=pos(w.handLoad);
  for(let i=0;i<185;i++)w.step(V(-1,0));
  const t=w.trace();
  return {link,atContact,acquired,initial,physicalBeforeGrip,
   cargoStart:loadStart,cargoPreReverse:reverseAt,cargoEnd:pos(w.handLoad),
   bodyEnd:pos(w.small),gripPairs:t.gripEvidence.appliedPairs,
   gripBreaks:t.gripEvidence.breaks,finalLinked:t.grips.length,
   rootEffort:t.rootEffort,finite:t.finite};
 }finally{w.dispose();}
}
function runTool({kind="lever",powered=true,stance="flow",support="finite"}={}){
 const fixture=kind==="rigid-lever"?"rigid-tool":"hinge";
 const w=makeMaterialWorkshop({fixture,support});
 try{
  w.setSelected(w.tool.id);
  if(!w.setStance(w.tool.id,stance))throw Error("P10 physical stance refused");
  const loadInitial=pos(w.toolLoad),rootInitial=pos(w.tool);
  const initial=snapshot(w);
  if(powered&&w.tool.panel)w.setPanelAngle(w.tool.id,.90);
  let touches=0;
  for(let i=0;i<175;i++){
   w.step(V());
   if(w.actualContact(w.tool,w.toolLoad))touches++;
  }
  const t=w.trace(),tool=t.actors.find(x=>x.id===w.tool.id);
  return {kind,powered,stance,support,initial,
   cargoStart:loadInitial,cargoEnd:pos(w.toolLoad),
   cargoDisplacement:round(distance(loadInitial,pos(w.toolLoad))),
   rootStart:rootInitial,rootEnd:pos(w.tool),
   rootYaw:tool.theta,
   panel:tool.panel,
   contactTicks:touches,
   jointEffort:t.panelImpulse,rootEffort:t.rootEffort,
   terrainImpulse:t.terrainImpulse,finite:t.finite};
 }finally{w.dispose();}
}
function quiet(){
 const w=makeMaterialWorkshop();
 try{
  const initial=snapshot(w);
  for(let i=0;i<180;i++)w.step(V());
  const trace=w.trace();
  return {initial,after:snapshot(w),
   selected:trace.selected,actors:trace.actors.length,cargo:trace.cargo.length,
   auto:trace.auto,rootEffort:trace.rootEffort,finite:trace.finite};
 }finally{w.dispose();}
}
function editWhilePaused(){
 const w=makeMaterialWorkshop();
 try{
  for(let i=0;i<80;i++)w.step(V());
  const old=w.aperture().width,start=snapshot(w),tick=w.ticks;
  if(!w.openSlot())throw Error("P10 real collider edit declined");
  const after=snapshot(w),aperture=w.aperture().width;
  const changedId=w.slot.lower.id;
  const other=state=>state.filter(a=>a.id!==changedId);
  if(JSON.stringify(other(start))!==JSON.stringify(other(after))||
   tick!==w.ticks||Math.abs(aperture-old-1.30)>.0002)
   throw Error("P10 topology edit altered unrelated physical bodies or did not move a real collider");
  for(let i=0;i<90;i++)w.step(V());
  return {tick,old,aperture,changedId,unchanged: true,
   finite:w.trace().finite,cargo:w.loads.length};
 }finally{w.dispose();}
}
export function p10Audit(){
 const q=quiet();
 const slots=[];
 for(const support of ["finite","none"])
  for(const who of ["small","bulky"])
   for(const open of [false,true])
    slots.push(runSlot({who,open,support}));
 const hauls=[runHaul({link:false}),runHaul({link:true})];
 const tools=[runTool({kind:"lever",powered:false}),
   runTool({kind:"lever",powered:true}),
   runTool({kind:"lever",powered:true,stance:"brace"}),
   runTool({kind:"lever",powered:true,stance:"flow",support:"none"}),
   runTool({kind:"lever",powered:true,stance:"brace",support:"none"}),
   runTool({kind:"rigid-lever",powered:false}),
   runTool({kind:"rigid-lever",powered:false,stance:"brace"})];
 const topology=editWhilePaused();
 if(q.auto!==false||q.rootEffort!==0||q.actors!==3||q.cargo!==5||!q.finite)
  throw Error("P10 independent quiet world not real");
 for(const x of slots){
  if(!x.finalFinite||x.materialLoads!==5||x.mass!==90||
   x.motor!==650||x.speed!==1.65||
   Math.abs(x.actualGap-(x.open?3.5:2.2))>.001)
   throw Error("P10 matched real physical cross-section invalid");
 }
 for(const support of ["finite","none"]){
  const control=slots.filter(s=>s.support===support&&s.who==="bulky");
  const a=control.find(s=>!s.open),b=control.find(s=>s.open);
  if(JSON.stringify(a.initially)!==JSON.stringify(b.initially))
   throw Error("P10 aperture edit physical prestates not matched");
 }
 if(hauls.some(x=>!x.finite)||JSON.stringify(hauls[0].physicalBeforeGrip)!==
    JSON.stringify(hauls[1].physicalBeforeGrip)||
   hauls[1].gripPairs<=0||hauls[0].gripPairs!==0)
  throw Error("P10 genuine link/no-link causal source controls invalid");
 if(tools.some(x=>!x.finite)||tools[0].rootEffort!==0||
  tools[1].rootEffort!==0||tools[2].rootEffort!==0||
  tools[0].jointEffort!==0||tools[5].jointEffort!==0)
  throw Error("P10 source motor off/hinge/rival invalid");
 if(!topology.finite||!topology.unchanged)
  throw Error("P10 genuine paused topology continuous world invalid");
 return {cases:1+slots.length+hauls.length+tools.length+1,
  quiet:{auto:q.auto,actors:q.actors,cargo:q.cargo,effort:q.rootEffort,finite:q.finite},
  slots:slots.map(x=>({who:x.who,open:x.open,support:x.support,
   width:x.actualGap,bodyDiameter:x.diameter,mass:x.mass,
   peakX:x.peakX,afterX:x.end.x,firstExit:x.firstExit,effort:x.effort,
   blockerContact:x.colliderTouchTicks})),
  haul:hauls.map(x=>({link:x.link,contactTick:x.atContact,
   cargoStart:x.cargoStart,cargoPreReverse:x.cargoPreReverse,
   cargoEnd:x.cargoEnd,rootEnd:x.bodyEnd,pairedImpulses:x.gripPairs,
   breaks:x.gripBreaks,stillAttached:x.finalLinked,effort:x.rootEffort})),
  tools:tools.map(x=>({kind:x.kind,powered:x.powered,
   cargoMove:x.cargoDisplacement,from:x.cargoStart,to:x.cargoEnd,
   jointImpulse:x.jointEffort,rootImpulse:x.rootEffort,terrainImpulse:x.terrainImpulse,
   stance:x.stance,support:x.support,rootYaw:x.rootYaw,
   panel:x.panel,contactTicks:x.contactTicks})),
  topology,
  warning:"Controlled static world operator actions are NOT living NPC behavior. Free-form Owner feel and autonomous initiative untested. Comparators vary anatomy and input capability; no unique hinged-body superiority shown."};
}
