// Same crowd, same bodies and autonomous somatic law; only broad-body
// external brace authority differs. No AI map, no scripted actor objective.
// Compare actual shared-world continuation and guard against differences
// *before* the first materially nonzero bracing impulse.
import { playgroundRecipe } from "./playgrounds.js";

export function spontaneousBraceAB(Field) {
  const assert=(ok,msg)=>{if(!ok)throw Error("somatic-crowd: "+msg);};
  const regular=new Field(),nullBrace=new Field();
  try{
    for(const field of [regular,nullBrace])
      field.importScene(playgroundRecipe("crush"));
    const braced=regular.actors.filter(a=>a.kind==="broad");
    const control=nullBrace.actors.filter(a=>a.kind==="broad");
    assert(braced.length===control.length&&braced.length>0,
      "paired worlds differ in somatic morphology count");
    for(const actor of control){
      actor.spec={...actor.spec,braceForce:0};
    }
    let firstBrace=-1,firstDifference=-1,peakGap=0,bracingTicks=0;
    let materialGap=0;
    for(let tick=1;tick<=440;tick++){
      regular.step(null);nullBrace.step(null);
      for(let i=0;i<braced.length;i++){
        const a=braced[i],b=control[i];
        if(a.control.bracing && a.control.braceImpulse>.0001){
          bracingTicks++;
          if(firstBrace<0)firstBrace=tick;
        }
        const p=a.root.translation(),q=b.root.translation();
        const d=Math.hypot(p.x-q.x,p.y-q.y);
        peakGap=Math.max(peakGap,d);
        if(firstDifference<0 && d>.001)firstDifference=tick;
        assert(Number.isFinite(d),"nonfinite paired embodied outcome");
      }
      for(let i=0;i<regular.matter.length;i++){
        const a=regular.matter[i].body.translation();
        const b=nullBrace.matter[i].body.translation();
        const delta=Math.hypot(a.x-b.x,a.y-b.y);
        materialGap=Math.max(materialGap,delta);
      }
      if(firstBrace<0){
        assert(peakGap<.001&&materialGap<.001,
          "different physical continuations occurred before any actual brace force");
      }
    }
    assert(firstBrace>0&&bracingTicks>0,
      "no actual autonomous ground bracing under mixed-body pressure");
    assert(peakGap>.05||materialGap>.05,
      "autonomous somatic brace has no material world consequence");
    assert(firstDifference>=firstBrace,
      "somatic response altered body trajectory before any brace force");
    return {actors:regular.actors.length,steps:440,
      firstPhysicalBrace:firstBrace,
      firstBodyDivergence:firstDifference,
      activeBroadBraceTicks:bracingTicks,
      maximumBroadPositionGap:+peakGap.toFixed(3),
      maximumMovedMatterGap:+materialGap.toFixed(3)};
  }finally{regular.world.free();nullBrace.world.free();}
}
