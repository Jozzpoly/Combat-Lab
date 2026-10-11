// P10b destructive operator robustness scout. Real Rapier only, no route brain,
// no authored success targets. Intentional clutter/overlaps and conflicting edits.
// PASS here means bounded source survival ONLY, NEVER good crowd handling.
import {makeMaterialWorkshop} from "./p10-workshop.js";
import {V} from "./p0-world.js";
const rnd=x=>Math.round(x*1e4)/1e4;
function random(seed){
 let s=seed>>>0;
 return ()=>((s=(1664525*s+1013904223)>>>0)/4294967296);
}
function finite(w){
 return w.entities.every(e=>{
  const b=e.body,p=b.translation(),v=b.linvel();
  return [p.x,p.y,v.x,v.y,b.rotation(),b.angvel()].every(Number.isFinite);
 });
}
function scenario(seed,support){
 const r=random(seed*337+9);
 const w=makeMaterialWorkshop({support});
 try{
  // Source-created actual colliders, not decorative crowd markers.
  for(let k=0;k<5;k++){
   const kind=["small","small","bulky","lever","rigid-lever"][k];
   const x=13.7+3.5*r(),y=11.7+7.0*r();
   const a=w.spawn(kind,V(x,y));
   a.maxSpeedOverride=1.4+1.2*r();
  }
  for(let k=0;k<5;k++)
   w.load(12.5+5.8*r(),9.8+9.6*r(),.35+.45*r(),.28+.45*r(),15+65*r());
  w.barrier(16.8,12.35,.24,1.1);
  w.barrier(17.2,17.7,.29,1.15);
  w.world.propagateModifiedBodyPositionsToColliders();
  const tick0=w.ticks,actors=w.actors.length,loads=w.loads.length,
   barriers=w.entities.filter(e=>e.kind==="barrier").length;
  let maxSpeed=0,maxPosition=0,observedContacts=0;
  const checks=[],turns=[V(1,0),V(0,1),V(-1,0),V(0,-1)];
  for(let i=0;i<550;i++){
   if(i%110===0)w.setSelected(w.actors[(i/110+seed)%w.actors.length].id);
   if(i===135){
    const q=w.handLoad.body.translation();
    // Owner intervention of free physical material without resetting anyone.
    w.moveEntity(w.handLoad,V(q.x+.75,q.y-.45));
   }
   if(i===270){
    const old=w.aperture().width;
    if(!w.openSlot()||w.aperture().width<=old)
     throw Error("P10b source physical edit unexpectedly refused");
   }
   if(i===360){
    const chosen=w.chosen;
    if(!w.setStance(chosen.id,"brace"))
     throw Error("P10b stance failed");
   }
   if(i===415){
    const target=w.massLoad.body.translation();
    // Explicit experimenter poke at actual dynamic collider center.
    if(!w.impulseAt(V(target.x,target.y),V(-1,.4),165))
     throw Error("P10b external physical disturbance refused");
   }
   w.step(turns[Math.floor(i/65)%4]);
   if(i%25===0){
    const okay=finite(w);
    if(!okay)throw Error("P10b NONFINITE real body, seed "+seed+" tick "+i);
    for(const a of w.actors){
     const b=a.body,p=b.translation(),v=b.linvel();
     maxSpeed=Math.max(maxSpeed,Math.hypot(v.x,v.y));
     maxPosition=Math.max(maxPosition,Math.hypot(p.x,p.y));
    }
    const t=w.trace();
    if(!t.finite||t.actors.length!==actors||t.cargo.length!==loads)
     throw Error("P10b source body count/finite failure at "+i);
    checks.push({tick:t.tick,aperture:t.aperture.width,
     rootImpulse:t.rootEffort});
    // Count real manifold actor↔cargo observations (not unique people).
    for(const a of w.actors)for(const load of w.loads)
     if(w.actualContact(a,load))observedContacts++;
   }
  }
  const t=w.trace();
  return {seed,support,actors,loads,barriers,tickStart:tick0,
   tickEnd:t.tick,editWidth:t.aperture.width,
   operatorEdits:t.materialEvents.edits,
   physicalOperatorPokes:w.events.operatorPokes,
   maxSpeed:rnd(maxSpeed),maxPosition:rnd(maxPosition),
   manifoldTouchObservations:observedContacts,
   totalMotorImpulse:rnd(t.rootEffort),
   finalFinite:finite(w)&&t.finite,
   checks};
 }finally{w.dispose();}
}
export function p10bStress(){
 const worlds=[];
 for(const support of ["finite","none"])
  for(let i=1;i<=8;i++)worlds.push(scenario(i,support));
 if(worlds.length!==16||worlds.some(x=>!x.finalFinite||
    x.actors!==8||x.loads!==10||
    x.tickEnd!==550||x.editWidth!==3.5||
    x.operatorEdits!==1||x.physicalOperatorPokes!==1))
  throw Error("P10b real actual destruction controls did not complete");
 return {worlds:worlds.length,results:worlds,
  interpretation:"16 independently simulated clutter worlds, each 550 real Rapier solver ticks, 8 physical actor bodies + 10 free cargo, two new fixed obstacles, true pause-like material edit, stance and impulse. PASS=finite/source causal presence, NOT compelling feel, stable real FPS, believable crowd or autonomous goals."};
}
