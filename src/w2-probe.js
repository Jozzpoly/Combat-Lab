// W2 real-source tests: "body ability inside a commons" vs rigid controls.
// Mechanical diagnostics only. NOT a qualitative Owner/organism PASS.
import {MaterialCommons} from "./w2-world.js";
import {V} from "./m0-world.js";
const n=x=>Math.round(x*1e4)/1e4;
const finite=(w)=>w.actors.every(a=>a.parts.every(p=>{
 const q=p.body.translation(),v=p.body.linvel();
 return [q.x,q.y,v.x,v.y,p.body.rotation()].every(Number.isFinite);
}));
function gateWorld(kind){
 const world=new MaterialCommons({populated:false,initiative:false,reflex:false});
 const upper=world.addFixed(21,6.19,2.5,6.69);
 const lower=world.addFixed(21,20.56,2.5,6.44);
 const a=world.addCreature(kind,V(10,13.5),"seeker");
 world.select(a.id);
 const props=[11.95,15.05].map(y=>{
  world.addFree(30.5,y,.42,.32,40);
  const item=world.objects[world.objects.length-1];
  return {item,start:{...item.body.translation()}};
 });
 return {world,a,props,upper,lower};
}
const moved=props=>props.map(({item,start})=>{
 const p=item.body.translation();
 return {dx:n(p.x-start.x),dy:n(p.y-start.y)};
});
function crossing(kind,policy){
 const {world,a,props}=gateWorld(kind);
 let wholeExit=null,firstActualFold=null;
 const snapshots=[];
 try{
  for(let tick=0;tick<=800;tick++){
   if(tick>0){
    if(kind==="folding"){
     const command=policy==="never"?0:policy==="keep"?tick<100?0:1:
      tick<100?0:tick<500?1:0;
     if(command!==a.foldTarget)world.setFold(a.id,command);
    }
    world.step({direction:V(1,0)});
   }
   const extent=world.extent(a);
   if(wholeExit===null&&extent.minX>23.5)wholeExit=tick;
   if(firstActualFold===null&&extent.spanY<1.25)firstActualFold=tick;
   if([0,180,360,480,580,800].includes(tick))snapshots.push({
    tick,rootX:n(a.root.translation().x),spanY:extent.spanY,
    material:moved(props),pressure:n(a.pressure)});
  }
  return {kind,policy,wholeExit,firstActualFold,finalWidth:world.extent(a).spanY,
   material:moved(props),motorTicks:a.motorTicks,
   realJoints:a.wings?.length??0,
   connectedContacts:a.wings?.map(w=>w.joint.contactsEnabled())??[],
   jointTorque:a.anatomyImpulse??0,numericOK:finite(world),snapshots};
 }finally{world.dispose();}
}
function trapped(){
 const {world,a}=gateWorld("folding");
 const checkpoints=[];
 let greatestPressure=0,actualFoldAt300=null;
 try{
  for(let tick=0;tick<=480;tick++){
   if(tick>0){
    const target=tick<100?0:tick<330?1:0;
    if(target!==a.foldTarget)world.setFold(a.id,target);
    world.step({direction:V(tick<=315?1:0,0)});
   }
   greatestPressure=Math.max(greatestPressure,a.pressure);
   const size=world.extent(a);
   if(tick===300)actualFoldAt300=size.spanY;
   if([0,180,300,329,360,420,480].includes(tick))
    checkpoints.push({tick,rootX:n(a.root.translation().x),spanY:size.spanY,
     pressure:n(a.pressure)});
  }
  return {kind:"real-connected-foldable",widthAt300:actualFoldAt300,
   finalWidth:world.extent(a).spanY,greatestPressure:n(greatestPressure),
   connectedContacts:a.wings.map(w=>w.joint.contactsEnabled()),
   numericOK:finite(world),checkpoints};
 }finally{world.dispose();}
}
function commons(){
 const w=new MaterialCommons(),baseline=w.morphologyTrace();
 const foldables=w.actors.filter(a=>a.morphology==="folding");
 const start=w.getTrace();
 let accidental=0;
 try{
  for(let i=0;i<420;i++){
   if(i===110){
    // Non-scripted operator intervention to one real body, while all other
    // residents keep acting in their persistent, physically common world.
    w.setFold(foldables[0].id,1);
   }
   if(i===320)w.setFold(foldables[0].id,0);
   w.step();
   if(!finite(w))accidental++;
  }
  const finish=w.morphologyTrace(),trace=w.getTrace();
  return {initialActors:baseline.physicalActorCount,finalActors:finish.physicalActorCount,
   initialFreeObjects:start.cues.length,finalFreeObjects:trace.cues.length,
   allMotorTicks:trace.actors.reduce((sum,a)=>sum+a.autonomousTicks,0),
   differentMorphs:[...new Set(w.actors.map(a=>a.morphology??a.kind))],
   foldables:finish.foldables,contacts:trace.totalContactPairs,
   sourceDelta:trace.cues.map((c,i)=>({i,dx:n(c.x-start.cues[i].x),dy:n(c.y-start.cues[i].y)})),
   nonfinite:accidental,stepCount:w.ticks};
 }finally{w.dispose();}
}
export function runW2Probe(batch){
 if(batch==="A"){
  const cases=[
   crossing("folding","change"),
   crossing("folding","keep"),
   crossing("folding","never"),
   crossing("rival-narrow","constant"),
   crossing("rival-wide","constant")];
  if(cases.some(c=>!c.numericOK))throw Error("W2 nonfinite crossing");
  if(cases[0].realJoints!==2||cases[0].connectedContacts.some(x=>!x))
   throw Error("W2 false joint contact/actual anatomy");
  return {batch,cases,warning:"E1 root traction remains an EXTERNAL proxy; these are operator-authored commands, not chosen intentions. Cheap constant geometry is not collision-aware morph."};
 }
 if(batch==="B"){
  const result=trapped();
  if(!result.numericOK||result.connectedContacts.some(x=>!x))
   throw Error("W2 contact-body obstruction corrupt");
  return {batch,result,warning:"Penetration and solver impulse must still be evaluated against cheaper collision-aware morph alternatives."};
 }
 if(batch==="C"){
  const result=commons();
  if(result.initialActors!==20||result.nonfinite||result.stepCount!==420)
   throw Error("W2 shared-world 20-actor run incomplete");
  return {batch,result,warning:"420 ticks and population do not establish natural crowd feel or Owner acceptance."};
 }
 throw Error("Unknown W2 batch");
}