// Live physical re-rig within ONE solver; no Owner-level experience claim.
import {V,rot,norm} from "./x0-world.js";
const delta=(x,y)=>norm(V(x.x-y.x,x.y-y.y));
const same=(x,y,eps=.000001)=>delta(x,y)<=eps;
const assert=(yes,msg)=>{if(!yes)throw Error("X0 live re-rig: "+msg);};
const position=b=>{const p=b.translation();return V(p.x,p.y);};
const velocity=b=>{const p=b.linvel();return V(p.x,p.y);};
export function probeLiveRerig(World,capture,restore){
  const w=new World();
  try{
    const a=w.actors[0],id=a.id;
    w.select(id);
    for(let t=0;t<85;t++)w.step({manual:{move:V(1,0),aim:null}});
    const mate=w.actors[1],matter=w.matter[0],otherActorPos=position(mate.root);
    const otherActorVel=velocity(mate.root),otherMatterPos=position(matter.body);
    const otherMatterVel=velocity(matter.body),clock=w.ticks;
    const oldRoot=position(a.root),oldRootVel=velocity(a.root);
    const oldSpin=a.root.angvel(),oldAngle=a.root.rotation();
    const originalParts=a.parts.map(part=>part.collider.handle);
    let rejected=false;
    try{w.rebuildActor(id,{arms:3,hx:.71});}catch{rejected=true;}
    assert(rejected,"three-limb invalid mutation not rejected");
    assert(w.actor(id)===a,"invalid re-rig changed actor identity");
    assert(w.colliderOwner.has(originalParts[0]),"invalid re-rig deleted live collider");
    const revised=w.rebuildActor(id,{arms:0,hx:.71,hy:.38});
    assert(revised!==a && revised.id===id && w.actors.length===4,
      "re-rig did not replace exactly one identified body");
    assert(revised.arms.length===0 && revised.spec.hx===.71 && revised.spec.hy===.38,
      "physical shape re-rig was ignored");
    assert(same(position(revised.root),oldRoot)&&
      same(velocity(revised.root),oldRootVel)&&
      Math.abs(revised.root.rotation()-oldAngle)<.000001 &&
      Math.abs(revised.root.angvel()-oldSpin)<.000001,
      "root kinematic continuity lost");
    assert(w.selected===id && w.ticks===clock,
      "selection or shared simulation time unexpectedly reset");
    assert(same(position(mate.root),otherActorPos) && same(velocity(mate.root),otherActorVel) &&
      same(position(matter.body),otherMatterPos) && same(velocity(matter.body),otherMatterVel),
      "other resident/matter changed on body-only edit");
    for(const handle of originalParts)
      assert(!w.colliderOwner.has(handle),"stale collider ownership survived re-rig");
    let maxPartCount=0;
    for(let i=0;i<24;i++){
      const arms=i%3;
      const changed=w.rebuildActor(id,{arms,hx:.55+i*.01,hy:.36,armLength:1.25+i*.07});
      assert(changed.id===id&&changed.arms.length===arms,"repeat re-rig changed chosen body");
      const expected=w.actors.reduce((n,actor)=>n+actor.parts.length,0)+
        w.matter.length+w.walls.length;
      assert(w.colliderOwner.size===expected,"orphan collider owner or stale collider handle");
      maxPartCount=Math.max(maxPartCount,changed.parts.length);
      w.step({manual:{move:V(),aim:null}});
    }
    const altered=w.actor(id);
    const recipe=capture(w),restored=restore(recipe);
    try{
      const fromRecipe=restored.actors[0];
      assert(fromRecipe.arms.length===altered.arms.length &&
        Math.abs(fromRecipe.spec.hx-altered.spec.hx)<.000001 &&
        Math.abs(fromRecipe.spec.armLength-altered.spec.armLength)<.000001,
        "live built actual anatomy not preserved in authored recipe");
    }finally{restored.dispose();}
    return {scope:"live world re-rig preserves other current actors/matter, not solver-exact replay",
      beforeParts:originalParts.length,afterParts:revised.parts.length,
      checkedRebuilds:25,maximumPartCount:maxPartCount,
      bodyCount:w.actors.length,materialCount:w.matter.length,
      otherWorldPreserved:true,staleColliderOwner:false,
      authoredAnatomyRoundtrip:true,originalClock:clock,finalClock:w.ticks};
  }finally{w.dispose();}
}
function prospectiveArmTarget(World){
  const w=new World({empty:true});
  try{
    const a=w.addActor("reach",V(10,12),0);
    const arm=a.arms[0],angle=arm.body.rotation(),center=arm.body.translation();
    const forward=rot(V(arm.half-.18,-arm.sign*.13),angle);
    return V(center.x+forward.x+.16*Math.cos(angle),
      center.y+forward.y+.16*Math.sin(angle));
  }finally{w.dispose();}
}
function trial(World,edit){
  const p=prospectiveArmTarget(World);
  const w=new World({empty:true});
  try{
    const a=w.addActor("reach",V(10,12),0,{arms:0});
    w.select(a.id);
    const obj=w.addMatter(p,{mass:18,hx:.23,hy:.22,created:false});
    const before=w.beginHold(p);
    assert(!before,"a zero-arm body could reach distant matter before rebuild");
    if(edit)w.rebuildActor(a.id,{arms:2,armLength:1.55});
    const acquired=w.beginHold(p),from=obj.body.translation();
    const initial=V(from.x,from.y);
    for(let t=0;t<105;t++)w.step({manual:{move:V(-1,0),aim:null}});
    const after=obj.body.translation();
    return {acquired,travelX:+(after.x-initial.x).toFixed(4),
      holdReleases:w.holdBreaks,remainingArms:w.actor(a.id).arms.length,
      source:acquired?"body-origin finite hold":"only collision"};
  }finally{w.dispose();}
}
export function probeMorphologyAffordance(World){
  const rigid=trial(World,false),rerigged=trial(World,true);
  assert(!rigid.acquired&&rerigged.acquired,
    "reconfiguration failed to change physical action acquisition");
  assert(rerigged.travelX<rigid.travelX-.4,
    "actual rebuilt limb action failed to distinguish material result");
  return {scope:"matched start body/matter with deliberate edited anatomy; human manually drives actor",
    rigid,rerigged,differenceX:+(rigid.travelX-rerigged.travelX).toFixed(4)};
}
