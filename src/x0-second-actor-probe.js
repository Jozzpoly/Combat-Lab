// Deliberately authored counterfactual, NOT spontaneous ecology or Owner feel.
// Can a first body's finite contact action change a distinct second body's
// opportunity for a subsequently commanded physical action in one world?
import {V,rot,norm} from "./x0-world.js";
export function secondActorOpportunityProbe(World){
  const run=(enabled,secondInput=true)=>{
    const w=new World({empty:true});
    try{
      const first=w.addActor("reach",V(10,12),0);
      const second=w.addActor("bulk",V(8.2,9.75),0);
      w.select(first.id);
      const tip=first.arms[0],b=tip.body,p=b.translation();
      const local=rot(V(tip.half-.18,-tip.sign*.13),b.rotation());
      const target=V(p.x+local.x+.16*Math.cos(b.rotation()),
        p.y+local.y+.16*Math.sin(b.rotation()));
      const obj=w.addMatter(target,{mass:18,hx:.23,hy:.22,created:false});
      const firstHasHold=enabled&&w.beginHold(target);
      for(let i=0;i<105;i++)
        w.step({manual:{move:V(-1,0),aim:null}});
      const afterFirst=V(obj.body.translation().x,obj.body.translation().y);
      const firstContactLost=w.holdBreaks;
      w.select(second.id); // release the old actor's physically held contact
      const secondCanAcquire=w.beginHold(afterFirst);
      const afterSelection=w.hold?.actorPart||null;
      for(let i=0;i<50;i++)
        w.step({manual:{move:secondInput?V(-1,0):V(),aim:null}});
      const end=obj.body.translation();
      const materialShift=norm(V(end.x-afterFirst.x,end.y-afterFirst.y));
      return {enabled,secondInput,firstHasHold,firstContactLost,
        afterFirst:{x:+afterFirst.x.toFixed(3),y:+afterFirst.y.toFixed(3)},
        secondCanAcquire,secondMount:afterSelection,
        secondActor:w.actor(second.id).form,secondActionShift:+materialShift.toFixed(3),
        secondHoldBroken:w.holdBreaks-firstContactLost,
        objectX:+end.x.toFixed(3)};
    }finally{w.dispose();}
  };
  return {scope:"two distinct physical actors in one authored field; manual two-stage action; NOT emergence",
    withFirstHold:run(true),withFirstHoldSecondIdle:run(true,false),
    withoutFirstHold:run(false),withoutFirstHoldSecondIdle:run(false,false)};
}
