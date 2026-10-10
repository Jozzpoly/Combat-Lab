import {EnvelopeField} from "./b1-world.js";
import {ProfileSwapField} from "./b1-profile.js";
const R=x=>Math.round(x*1e4)/1e4;
const candidates=[
 {name:"real-two-hinges",ctor:()=>new EnvelopeField({kind:"folding",hingeMount:"front",torqueCap:3,withMatter:false})},
 {name:"cheap-continuous-shape-profile",ctor:()=>new ProfileSwapField({mode:"gradual"})},
 {name:"cheap-instant-shape-swap",ctor:()=>new ProfileSwapField({mode:"instant"})}
];
function placeSide(w){
 return [11.95,15.05].map(y=>{
  const body=w.addFree(30.5,y,.42,.32,40);
  return {body,origin:{...body.translation()}};
 });
}
function sideResults(side){return side.map(o=>{
 const p=o.body.translation();return {dx:R(p.x-o.origin.x),dy:R(p.y-o.origin.y)};
});}
function dual(entry){
 const w=entry.ctor(),side=placeSide(w);
 try{
  let fullExit=null,maxPressure=0,nonfinite=0;
  const samples=[];
  for(let i=0;i<=780;i++){
   if(i>0)w.step({forward:1,fold:i<100?0:i<500?1:0});
   const state=w.output();
   if(fullExit===null&&state.physicalExtent.minX>23.5)fullExit=i;
   maxPressure=Math.max(maxPressure,w.actor.pressure);
   if(!Number.isFinite(state.chassis.x)||!Number.isFinite(state.chassis.y))nonfinite++;
   if([0,180,360,480,580,780].includes(i))samples.push({
    tick:i,x:state.chassis.x,
    width:R(state.physicalExtent.maxY-state.physicalExtent.minY),
    side:sideResults(side),gateSamples:state.gateContacts,
    hinge:state.hingeTorqueImpulse,geometryChanges:state.profileEdits??0});
  }
  return {name:entry.name,firstWholeBodyExit:fullExit,
   sideAfter:sideResults(side),maxPressure:R(maxPressure),nonfinite,
   rootTotalImpulse:w.output().operatorImpulse,
   hingeTotalImpulse:w.output().hingeTorqueImpulse,
   profileEdits:w.profileEdits??0,
   physicalShapeCost:w.profileEdits?"NONE MODELED — edited collider":null,
   samples};
 }finally{w.dispose();}
}
function trapped(entry){
 const w=entry.ctor();
 try{
  const trace=[];let nonfinite=0,maxPressure=0,overwideWhileInside=0;
  for(let i=0;i<=480;i++){
   if(i>0){
    // First physically fold then DRIVE INTO tunnel, STOP, then command
    // redeployment while *still* in the corridor, no direct wall editing.
    w.step({forward:i<=315?1:0,fold:i<100?0:i<330?1:0});
   }
   const q=w.output(),span=q.physicalExtent.maxY-q.physicalExtent.minY;
   if(q.chassis.x>19&&q.chassis.x<23.5&&span>1.24)overwideWhileInside++;
   maxPressure=Math.max(maxPressure,w.actor.pressure);
   if(![q.chassis.x,q.chassis.y,q.chassis.rotation].every(Number.isFinite))nonfinite++;
   if([0,180,300,329,330,340,360,420,480].includes(i))trace.push({
    tick:i,x:q.chassis.x,y:q.chassis.y,
    span:R(span),colliderExtent:q.physicalExtent,
    wallContacts:q.gateContacts,
    hingeWorkIndicator:q.hingeTorqueImpulse,shapeEdits:q.profileEdits??0
   });
  }
  return {name:entry.name,overwideWhileInside,
   maxContactImpulse:R(maxPressure),nonfinite,trace,
   caveat:"Width greater than aperture for a central actor inside the tunnel is a geometric warning, NOT exact signed solver penetration measurement."};
 }finally{w.dispose();}
}
export function cheapB1(batch="A"){
 if(!["A","B"].includes(batch))throw RangeError("batch");
 const scenarios=candidates.map(x=>batch==="A"?dual(x):trapped(x));
 if(scenarios.some(x=>x.nonfinite))throw Error("Nonfinite caused by morphological comparison");
 return {batch,
  scope:batch==="A"?"Exact same physical edited material corridor and two moveable side props, 780 actual steps, fixed source input fold at tick 100/unfold at 500; costly genuine hinge material versus CHEAP shape-mutation surrogates":
    "Same physical tunnel, three dynamic bodies one per matched world, fold at 100 and force/open inside material tunnel at tick 330; distinguish true constrained wings from collision-profile editing",
  scenarios,
  warning:"A single authored collider-profile morph has no motor work, continuous material conservation, limb reactions or guaranteed rejection of interpenetration. Approximation may still be better for gameplay if users cannot observe the fidelity difference."};
}
