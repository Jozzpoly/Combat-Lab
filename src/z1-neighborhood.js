// Contact-only alternatives and negative variations in the SAME Z1 whole.
// Predeclared offsets; varied mass is not proof of realistic ground support.
import {V} from "./x0-world.js";
const rnd=x=>+x.toFixed(4);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const configs=[
  {kind:"free",actor:0,target:"free",index:0,move:V(1,0),axis:"y"},
  {kind:"hinge",actor:1,target:"hinge",index:0,move:V(0,1),axis:"x"},
  {kind:"rail",actor:2,target:"rail",index:0,move:V(1,0),axis:"y"}
];
function run(World,config,{offset=0,massFactor=1,input=true,quiet=false}={}){
 const w=new World();
 try{
  const actor=w.actors[config.actor],obj=w.matter.filter(m=>m.kind===config.target)[config.index];
  const old=actor.root.translation();
  if(offset){
   w.pose(actor.id,config.axis==="y"?V(old.x,old.y+offset):V(old.x+offset,old.y));
  }
  if(massFactor!==1)w.setSpec(actor.id,"mass",actor.spec.mass*massFactor);
  w.select(actor.id);
  if(w.beginHold(obj.body.translation())||w.hold||w.counts.driveTicks>0)
    throw Error("Invalid Z1 no-grip condition");
  const start=obj.body.translation(),angle=obj.body.rotation(),aRoot=actor.root.translation();
  let first=null,touched=0,sum=0,peak=0;
  for(let t=0;t<180;t++){
   w.step({manual:{move:input&&!quiet?config.move:V(),aim:null}});
   let force=0;
   for(const part of actor.parts)w.world.contactPair(part.collider,obj.collider,m=>{
     for(let j=0;j<m.numSolverContacts();j++)force+=Math.abs(m.contactImpulse(j));
   });
   if(force>0){if(first===null)first=t;touched++;sum+=force;peak=Math.max(peak,force);}
  }
  const end=obj.body.translation(),root=actor.root.translation();
  return {offset,massFactor,input,touched,first,
    impulse:rnd(sum),peak:rnd(peak),targetDX:rnd(end.x-start.x),
    targetDY:rnd(end.y-start.y),targetAngle:rnd(wrap(obj.body.rotation()-angle)),
    rootDX:rnd(root.x-aRoot.x),rootDY:rnd(root.y-aRoot.y),
    held:!!w.hold,worldPoweredSteps:w.counts.driveTicks};
 }finally{w.dispose();}
}
export function exploreContactNeighborhood(World){
 const result=configs.map(c=>{
   const offsets=[-1,-.5,0,.5,1].map(offset=>{
     const driven=run(World,c,{offset}),idle=run(World,c,{offset,input:false});
     return {offset,driven,idle,contrast:{
        dx:rnd(driven.targetDX-idle.targetDX),
        dy:rnd(driven.targetDY-idle.targetDY),
        angle:rnd(driven.targetAngle-idle.targetAngle)}};
   });
   const masses=[.25,1,4].map(massFactor=>({
     massFactor,result:run(World,c,{massFactor})}));
   return {kind:c.kind,offsets,masses,
     activeOffsetCount:offsets.filter(t=>t.driven.touched>0).length,
     operatorInfluenceWithoutHold:offsets.filter(t=>t.driven.touched>0 &&
       Math.hypot(t.contrast.dx,t.contrast.dy)+Math.abs(t.contrast.angle)>.1).length};
 });
 return {scope:"Z1 same physical 5-body continuous scene; predeclared cross-axis offsets ±1m, mass .25x/1x/4x; 180 ticks operator-input vs idle. No hold, no world motor, no targets/AI.",
 result,warning:"Initial authored stations and traction proxy limit external validity; a contact step is not a useful action."};
}
