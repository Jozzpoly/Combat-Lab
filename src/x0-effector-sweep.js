// A/B: independent powered limb changes material outcomes without root locomotor input.
// NOT human skill, grasp, or autonomous choice evidence.
import {V,norm} from "./x0-world.js";
const distance=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
function attempt(World,position,servo){
  const w=new World({empty:true});
  try{
    const a=w.addActor("reach",V(10,12),0,{motor:0,brace:0,holdForce:0});
    w.select(a.id);
    const load=w.addMatter(position,{mass:20,hx:.23,hy:.21,created:false});
    w.setActiveArm(a.id,0,1);w.setActiveArm(a.id,1,.82);
    for(let i=0;i<55;i++)w.step({manual:{move:V(),aim:null}});
    const before=load.body.translation();
    const start=V(before.x,before.y),rootStart=a.root.translation();
    w.setActiveArm(a.id,0,0);
    if(!servo)w.setSpec(a.id,"torque",0);
    let activeContacts=0,peakLoad=0;
    for(let i=0;i<140;i++){
      w.step({manual:{move:V(),aim:null}});
      if(a.observed.load>0){activeContacts++;peakLoad=Math.max(peakLoad,a.observed.load);}
    }
    const after=load.body.translation(),rootEnd=a.root.translation();
    return {servo,position,initialObject:V(start.x,start.y),
      movedX:+(after.x-start.x).toFixed(4),movedY:+(after.y-start.y).toFixed(4),
      distance:+distance(after,start).toFixed(4),
      rootDrift:+distance(rootEnd,rootStart).toFixed(4),
      contactSteps:activeContacts,peakImpulse:+peakLoad.toFixed(4),
      rootMotor:a.spec.motor,armTorque:a.spec.torque};
  }finally{w.dispose();}
}
export function unilateralArmSweep(World){
  const stations=[11.1,11.3,11.5,11.7,11.9];
  const pairs=stations.map(y=>{
    const p=V(11.38,y);
    const active=attempt(World,p,true),quiet=attempt(World,p,false);
    return {y,active,quiet,contrast:
      +Math.abs(active.distance-quiet.distance).toFixed(4)};
  });
  return {scope:"5 authored contact-neighborhood probes; same settling history, same body, zero root motor; own joint torque A/B",
    pairs,maxContrast:Math.max(...pairs.map(x=>x.contrast)),
    contacted:pairs.filter(x=>x.active.contactSteps>0).length,
    nontrivial:pairs.filter(x=>x.contrast>.15).length};
}
