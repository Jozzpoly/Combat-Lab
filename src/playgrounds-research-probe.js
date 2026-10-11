// Source-qualified observation of FULL editable physical starting situations.
// This is not an acceptance checklist or pre-authored win condition. It gives
// a researcher real contact and material afterstate instead of only a green UI.
import { PLAYGROUND_IDS, playgroundRecipe } from "./playgrounds.js";

export function observePlaygrounds(Field){
  const result={};
  const assert=(condition,msg)=>{if(!condition)throw Error("playground: "+msg)};
  for(const id of PLAYGROUND_IDS){
    const world=new Field();
    try{
      world.importScene(playgroundRecipe(id));
      const actors=world.actors.length,matter=world.matter.length,
        joints=world.actors.filter(a=>a.joint).length+world.gates.length;
      const before=world.matter.map(item=>{
        const p=item.body.translation();
        return {x:p.x,y:p.y,angle:item.body.rotation()};
      });
      let peakContactIncidences=0,touchedTicks=0,bracingTicks=0;
      let peakRearLoad=0,peakSideLoad=0;
      const observedModes=new Set();
      for(let tick=0;tick<330;tick++){
        world.step(null);
        const snapshot=world.snapshot();
        peakContactIncidences=Math.max(peakContactIncidences,
          snapshot.activeContacts);
        if(snapshot.activeContacts>0)touchedTicks++;
        for(const actor of world.actors){
          observedModes.add(actor.control.mode);
          if(actor.control.mode==="brace")bracingTicks++;
          peakRearLoad=Math.max(peakRearLoad,actor.sense.rearLoad||0);
          peakSideLoad=Math.max(peakSideLoad,actor.sense.sideLoad||0);
          for(const p of actor.parts){
            const t=p.body.translation();
            assert(Number.isFinite(t.x+t.y+p.body.rotation()),
              id+" nonfinite physical organism at tick "+tick);
          }
        }
        for(const item of world.matter){
          const p=item.body.translation();
          assert(Number.isFinite(p.x+p.y+item.body.rotation()),
            id+" nonfinite material object at tick "+tick);
        }
      }
      const after=world.matter.map((item,i)=>{
        const p=item.body.translation(),start=before[i];
        return {id:item.id,kind:item.kind,
          translation:Math.hypot(p.x-start.x,p.y-start.y),
          rotation:Math.abs(item.body.rotation()-start.angle)};
      });
      result[id]={actors,matter,joints,steps:330,
        touchedTicks,peakContactIncidences,bracingTicks,
        peakRearLoad,peakSideLoad,
        movedMaterial:after.filter(p=>p.translation>.12||p.rotation>.10).length,
        maxMaterialDisplacement:Math.max(0,...after.map(p=>p.translation)),
        maxGateRotation:Math.max(0,...after.filter(p=>p.kind==="gate")
          .map(p=>p.rotation)),modes:[...observedModes].sort()};
      assert(touchedTicks>0,id+" has no real shared contact in entire field");
    }finally{world.world.free();}
  }
  return result;
}
