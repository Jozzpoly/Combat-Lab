// Whole-scene source observations, not a scoreboard or experiential PASS.
import {V,norm} from "./x0-world.js";
const d=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
const pos=b=>{const q=b.translation();return V(q.x,q.y);};
function run(World,energy){
  const w=new World();try{
    if(!energy)for(const m of w.matter)
      if(m.kind==="hinge")w.setHingeDrive(m.id,0,0);
    w.select(null);
    const initial=w.actors.map(a=>pos(a.root));
    let bodiesEverTouched=new Set(),contactSteps=0,firstContact=null,maxContact=0;
    for(let t=0;t<360;t++){
      w.step();
      if(w.counts.contacts>0){contactSteps++;if(firstContact===null)firstContact=t;}
      maxContact=Math.max(maxContact,w.counts.contacts);
      for(const a of w.actors)if(a.observed.contacts>0)bodiesEverTouched.add(a.id);
      for(const a of w.actors)for(const p of a.parts){
        const x=p.body.translation();
        if(!Number.isFinite(x.x+x.y+p.body.rotation()))throw Error("Nonfinite Y1 actor");
      }
    }
    const moved=w.actors.map((a,i)=>+d(pos(a.root),initial[i]).toFixed(3));
    return {powered:energy,actors:w.actors.length,matter:w.matter.length,
      contactSteps,firstContact,contactActors:bodiesEverTouched.size,
      peakContactIncidences:maxContact,localReflexes:w.counts.reflex,
      poweredSteps:w.counts.driveTicks,actorMovement:moved,
      finalActorPositions:w.actors.map(a=>pos(a.root)),
      finalMatterPositions:w.matter.map(m=>pos(m.body))};
  }finally{w.dispose();}
}
export function runRelationalObservation(World){
  const on=run(World,true),off=run(World,false);
  if(on.actors<4||on.matter<7)throw Error("Not a multi-body material candidate");
  if(on.poweredSteps<=0||off.poweredSteps!==0)
    throw Error("Source of material energy is incorrectly attributed");
  const differences=on.finalActorPositions.map((p,i)=>d(p,off.finalActorPositions[i]));
  return {scope:"one freely editable Y1 initial composition, same X0 donor mechanics; ON/OFF outside energy only, no player control",
    on:{...on,finalActorPositions:undefined,finalMatterPositions:undefined},
    off:{...off,finalActorPositions:undefined,finalMatterPositions:undefined},
    maxActorAfterstateDifference:+Math.max(...differences).toFixed(4),
    actorContrasts:differences.map(x=>+x.toFixed(4)),
    warning:"Body displacement and contacts do NOT prove new actions, second-actor opportunity, Owner value or autonomous ecology"};
}
