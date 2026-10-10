// S2 physical support falsifier: ground contact must be the SOURCE of resistance.
// Explicit external laboratory ram; no actor locomotion/feet/AI claims.
import {GroundCase} from "./s2-world.js";
const r=n=>+n.toFixed(4);
const presets=[
 {id:"floating",gravity:0,surface:1.2,drive:720,offset:0},
 {id:"ice",gravity:9.81,surface:0,drive:720,offset:0},
 {id:"slippery",gravity:9.81,surface:.15,drive:720,offset:0},
 {id:"grippy",gravity:9.81,surface:1.2,drive:720,offset:0},
 {id:"high-friction",gravity:9.81,surface:2.4,drive:720,offset:0},
 {id:"idle",gravity:9.81,surface:1.2,drive:0,offset:0},
 {id:"glancing",gravity:9.81,surface:1.2,drive:720,offset:.48}
];
function run(spec){
  const test=new GroundCase(spec);
  try{
    for(let i=0;i<420;i++)test.step(spec.drive);
    const x=test.snapshot();
    return {id:spec.id,surface:x.surface,gravity:x.gravity,
      guardDX:r(x.guardDX),guardY:r(x.guardY),
      ramDX:r(x.ramDX),contacts:x.actorContactSteps,
      grounded:x.groundContactSteps,normalImpulse:r(x.totalGroundImpulse),
      actorImpulse:r(x.totalActorImpulse),driveImpulse:r(x.externalRamImpulse)};
  }finally{test.dispose();}
}
export function compareGroundSources(){
 const cases=presets.map(run),find=id=>cases.find(c=>c.id===id);
 const ice=find("ice"),grip=find("grippy"),float=find("floating"),idle=find("idle");
 if(grip.grounded<50||ice.grounded<50)throw Error("S2 didn't form sustained real ground contacts");
 if(float.grounded>0)throw Error("Zero-gravity control received fictitious floor support");
 if(Math.abs(idle.guardDX)>.1||idle.contacts>0)
   throw Error("S2 passive control applied force or created false contact");
 if(ice.contacts<5||grip.contacts<5)
   throw Error("S2 ram didn't physically contact both material regimes");
 return {scope:"single grounded Rapier3D model; fixed ground collider and dynamic yaw-only bodies, 420 ticks of IDENTICAL external laboratory force; gravity/friction controls + idle/offset",
  cases,iceMinusGripDX:r(ice.guardDX-grip.guardDX),
  conclusionRule:"A different grounded friction outcome proves substrate-level support transmission only; no feet, gait, sustained defensive technique, product feel or 2D cost advantage."};
}
