// Whole-field F2 falsifier: compare one identical scene with limb-local
// tactile reflex ON / OFF; body motors, brace and authored world remain equal.
// No operator impulse and no new NPC policy. Never treat distance as ability.
import {V,norm} from "./x0-world.js";
const diff=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
const round=x=>+x.toFixed(5);
const vec=b=>{const p=b.translation();return V(p.x,p.y);};
const variants=[
  {dx:0,dy:0},{dx:-.6,dy:0},{dx:.6,dy:0},
  {dx:0,dy:-.7},{dx:0,dy:.7},
  {dx:-.6,dy:-.7},{dx:.6,dy:.7},
  {dx:-1.2,dy:0},{dx:1.2,dy:0}
];
function run(World,{dx,dy},responsive,onlyFirst=false){
  const w=new World();
  try{
    w.select(null);
    // Prespecified geometry changes the available source contacts, not the
    // law, solver, motor settings or any role/narrative/route.
    const a=w.actors[0],b=w.actors[1];
    const ap=a.root.translation(),bp=b.root.translation();
    w.pose(a.id,V(ap.x+dx,ap.y+dy));
    w.pose(b.id,V(bp.x,bp.y+dy*.35));
    for(let i=0;i<w.actors.length;i++)
      w.setArmReflex(w.actors[i].id,onlyFirst?(i===0?responsive:true):responsive);
    let first=null,peakContacts=0,contactTicks=0;
    const actorFirstReflex=w.actors.map(()=>null);
    const positions=[];
    for(let i=0;i<360;i++){
      w.step();
      if(w.counts.contacts>0)contactTicks++;
      peakContacts=Math.max(peakContacts,w.counts.contacts);
      if(first===null&&w.counts.reflex>0)first=i;
      for(let k=0;k<w.actors.length;k++)
        if(actorFirstReflex[k]===null&&w.actors[k].response.events>0)
          actorFirstReflex[k]=i;
      // Sensor changes may affect root or a real limb collider, so retain
      // part positions for causal checks without exposing enormous logs.
      if(i===0||i===29||i===79||i===179||i===359)
        positions.push({tick:i,
          actors:w.actors.map(actor=>vec(actor.root)),
          material:w.matter.map(m=>vec(m.body)),
          arms:w.actors.flatMap(actor=>actor.arms.map(x=>vec(x.body)))});
    }
    // At the end of the SAME unsteered world, assess the second organism's
    // *materially available* operator-action: can its own real physical part
    // establish a finite near-touch hold on any resident movable material?
    // No objects/actors are teleported into place and no action is executed.
    w.select(w.actors[1].id);
    const eligible=[];
    for(const m of w.matter){
      const p=m.body.translation();
      if(w.beginHold(V(p.x,p.y)))eligible.push(m.id);
      w.endHold();
    }
    return {eligible,first,contactTicks,peakContacts,reflex:w.counts.reflex,
      brace:w.counts.braces,positions,
      actorEvents:w.actors.map(a=>a.response.events),actorFirstReflex,
      finalActors:w.actors.map(a=>vec(a.root)),
      finalMaterial:w.matter.map(m=>vec(m.body)),
      finalArms:w.actors.flatMap(a=>a.arms.map(x=>vec(x.body)))};
  }finally{w.dispose();}
}
function contrast(a,b){
  if(a.length!==b.length)throw Error("F2 differing topology in matched controls");
  return a.map((x,i)=>diff(x,b[i]));
}
export function falsifyLocalResponse(World){
  const cases=[];
  for(const geometry of variants){
    const on=run(World,geometry,true),off=run(World,geometry,false);
    if(off.reflex!==0)throw Error("F2 local-response OFF still ran a tactile reflex");
    const actors=contrast(on.finalActors,off.finalActors);
    const matter=contrast(on.finalMaterial,off.finalMaterial);
    const limbs=contrast(on.finalArms,off.finalArms);
    const timeline=on.positions.map((p,i)=>{
      const q=off.positions[i];
      if(p.tick!==q.tick)throw Error("F2 comparison phase mismatch");
      return {tick:p.tick,
        actor:round(Math.max(...contrast(p.actors,q.actors))),
        matter:round(Math.max(...contrast(p.material,q.material))),
        limb:round(Math.max(...contrast(p.arms,q.arms)))};
    });
    // No different response force has been issued in either world if no
    // trigger occurred. Pre-event divergence here signals a bad control.
    if(on.first===null&&timeline.some(t=>Math.max(t.actor,t.matter,t.limb)>.0001))
      throw Error("F2 divergent worlds without any local reaction");
    cases.push({geometry,firstReflex:on.first,
      reflexEvents:on.reflex,perActorEvents:on.actorEvents,
      onContacts:on.contactTicks,offContacts:off.contactTicks,
      onBraces:on.brace,offBraces:off.brace,
      finalActorContrast:round(Math.max(...actors)),
      finalMatterContrast:round(Math.max(...matter)),
      finalLimbContrast:round(Math.max(...limbs)),
      timeline});
  }
  return {scope:"9 predetermined near-field repositions, 360 ticks each, world-powered material ON, only actor-own limb reflex toggled",
    cases,
    triggered:cases.filter(c=>c.firstReflex!==null).length,
    downstreamMatterCases:cases.filter(c=>c.finalMatterContrast>.1).length,
    actorAlteredCases:cases.filter(c=>c.finalActorContrast>.1).length,
    warning:"Afterstate differences are not a newly available second actor action or an Owner-quality PASS"};
}

export function falsifyInterActorReflexRelay(World){
  const cases=[];
  for(const geometry of variants){
    const activated=run(World,geometry,true,true);
    const firstQuiet=run(World,geometry,false,true);
    if(firstQuiet.actorEvents[0]!==0)
      throw Error("F2 control actor 0 reacted despite specific reflex ablation");
    const actorContrasts=contrast(activated.finalActors,firstQuiet.finalActors);
    const materialContrasts=contrast(activated.finalMaterial,firstQuiet.finalMaterial);
    const secondChanged=activated.actorEvents[1]!==firstQuiet.actorEvents[1] ||
      activated.actorFirstReflex[1]!==firstQuiet.actorFirstReflex[1];
    const newEligible=activated.eligible.filter(id=>!firstQuiet.eligible.includes(id));
    const lostEligible=firstQuiet.eligible.filter(id=>!activated.eligible.includes(id));
    const timeline=activated.positions.map((p,i)=>{
      const q=firstQuiet.positions[i];
      return {tick:p.tick,
        actor:round(Math.max(...contrast(p.actors,q.actors))),
        material:round(Math.max(...contrast(p.material,q.material)))};
    });
    if(activated.actorFirstReflex[0]===null&&
      timeline.some(t=>Math.max(t.actor,t.material)>.0001))
      throw Error("F2 relay diverged without actor 0 active reflex");
    cases.push({geometry,firstActiveAt:activated.actorFirstReflex[0],
      secondActiveAt:activated.actorFirstReflex[1],
      secondControlAt:firstQuiet.actorFirstReflex[1],
      secondActiveEvents:activated.actorEvents[1],
      secondControlEvents:firstQuiet.actorEvents[1],
      secondResponseChanged:secondChanged,
      secondCanContactHold:{on:activated.eligible,off:firstQuiet.eligible,
        newEligible,lostEligible},
      actorFinalContrast:round(Math.max(...actorContrasts)),
      materialFinalContrast:round(Math.max(...materialContrasts)),
      timeline});
  }
  return {scope:"9 matched world initial states: ONLY the first organism's own tactile arm reflex differs; all other organism-local policies stay live in both worlds",
    cases,secondResponseDifferences:cases.filter(x=>x.secondResponseChanged).length,
    newOrLostSecondActorHoldCases:cases.filter(c=>
      c.secondCanContactHold.newEligible.length+c.secondCanContactHold.lostEligible.length>0).length,
    stillUnproven:"A downstream response is not proof of a newly available action or full organism autonomy"};
}
