// No authored researcher impulses or possessed actors in this physical test.
// A world-powered joint is an explicit outside energy source, not resident AI.
import {V,norm} from "./x0-world.js";
const difference=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
function trial(World,powered){
  const w=new World();
  try{
    w.select(null);
    const hinge=w.matter.find(x=>x.kind==="hinge");
    if(!hinge)throw Error("No physical world-pinned hinge");
    if(!powered)w.setHingeDrive(hinge.id,0,0);
    const start=hinge.body.rotation();
    let peakSpeed=0,peakContacts=0,contactSteps=0,firstContact=null;
    let maxJointDrift=0;
    for(let i=0;i<360;i++){
      w.step();
      const speed=Math.abs(hinge.body.angvel());
      if(speed>peakSpeed)peakSpeed=speed;
      if(w.counts.contacts>0){contactSteps++;peakContacts=Math.max(peakContacts,w.counts.contacts);
        if(firstContact===null)firstContact=i;}
      const p=hinge.body.translation(),phi=hinge.body.rotation();
      const expected=V(hinge.x+Math.cos(phi)*hinge.length/2,
        hinge.y+Math.sin(phi)*hinge.length/2);
      maxJointDrift=Math.max(maxJointDrift,difference(p,expected));
      for(const a of w.actors)for(const part of a.parts){
        const x=part.body.translation(),v=part.body.linvel();
        if(!Number.isFinite(x.x+x.y+v.x+v.y+part.body.rotation()))
          throw Error("nonfinite actor");
      }
    }
    const p=hinge.body.translation();
    return {powered,angleInitial:start,angleEnd:hinge.body.rotation(),
      finalPivotedCenter:V(p.x,p.y),
      peakSpeed:+peakSpeed.toFixed(5),contactSteps,peakContacts,firstContact,
      reflexEvents:w.counts.reflex,braceEvents:w.counts.braces,
      driveTicks:w.counts.driveTicks,
      torqueBudget:w.counts.driveImpulse,
      jointDrift:+maxJointDrift.toFixed(5),
      actors:w.actors.map(a=>({position:a.root.translation(),localEvents:a.response.events})),
      matter:w.matter.map(m=>({kind:m.kind,position:m.body.translation()}))};
  }finally{w.dispose();}
}
export function activeMaterialCommonsPressure(World){
  const on=trial(World,true),off=trial(World,false);
  const diffs={actors:on.actors.map((a,i)=>difference(a.position,off.actors[i].position)),
    matter:on.matter.map((m,i)=>difference(m.position,off.matter[i].position))};
  if(off.driveTicks!==0||on.driveTicks<1)throw Error("Material power origin incorrectly attributed");
  if(off.peakSpeed>1e-4)throw Error("Unpowered hinge spun without input in this zero-energy start");
  if(on.peakSpeed<=.05)throw Error("Finite powered hinge did not move against inertial load");
  if(on.jointDrift>.15)throw Error("World-pinned hinge lost its constrained geometry");
  return {scope:"one source of finite anchored material power; 4 actors + 8 matter; no player input",
    on:{...on,actors:undefined,matter:undefined,torqueBudget:+on.torqueBudget.toFixed(3)},
    off:{...off,actors:undefined,matter:undefined},
    maxActorContrast:+Math.max(...diffs.actors).toFixed(4),
    maxMatterContrast:+Math.max(...diffs.matter).toFixed(4),
    actorContrasts:diffs.actors.map(x=>+x.toFixed(4)),
    matterContrasts:diffs.matter.map(x=>+x.toFixed(4))};
}
