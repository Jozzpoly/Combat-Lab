// S2 physical support falsifier: ground contact must be the SOURCE of resistance.
// Explicit external laboratory ram; no actor locomotion/feet/AI claims.
import {GroundCase} from "./s2-world.js";
import {comparePlanarProxy} from "./s2-planar-proxy.js";
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
function removeGroundControl(){
  const cases=[{name:"supported",remove:false},{name:"removed",remove:true}]
    .map(mode=>{
      const run=new GroundCase({surface:1.2,gravity:9.81,drive:0});
      try{
        for(let i=0;i<60;i++)run.step();
        const yBefore=run.defender.body.translation().y;
        run.clearCounters(); // only the AFTER-change contact evidence
        if(mode.remove&&!run.removeSupport())throw Error("S2 floor removal failed");
        for(let i=0;i<150;i++)run.step();
        const s=run.snapshot();
        return {name:mode.name,initialHeight:+yBefore.toFixed(4),
          finalHeight:+s.guardY.toFixed(4),floorExists:s.floorExists,
          heightChange:+(s.guardY-yBefore).toFixed(4),
          groundContactsAfterChange:s.groundContactSteps};
      }finally{run.dispose();}
    });
  if(cases[0].finalHeight<.8||cases[1].finalHeight>-.5)
    throw Error("S2 missing meaningful vertical physical support-loss contrast");
  return {scope:"same physical 3D body/identical settled world, zero operator drive; actual floor collider retained vs removed; no gameplay fall flag",
    cases};
}
function loadBearingControl(){
 const setups=[
  {mu:0,load:0},{mu:0,load:80},
  {mu:.25,load:0},{mu:.25,load:80},
  {mu:.7,load:0},{mu:.7,load:80},
  {mu:.7,load:80,drive:0}
 ];
 const cases=setups.map(x=>{
  const world=new GroundCase({surface:x.mu,gravity:9.81,drive:x.drive??720,payloadMass:x.load});
  try{
   for(let i=0;i<420;i++)world.step(x.drive??720);
   const s=world.snapshot();
   return {friction:x.mu,cargoKg:x.load,ramN:x.drive??720,
     guardDX:r(s.guardDX),groundImpulse:r(s.totalGroundImpulse),
     cargoOnGuardTicks:s.payloadContactTicks,
     cargoImpulse:r(s.payloadImpulse),cargoEndHeight:s.payloadY===null?null:r(s.payloadY),
     cargoEndX:s.payloadX===null?null:r(s.payloadX),
     actorContacts:s.actorContactSteps};
  }finally{world.dispose();}
 });
 if(cases.find(x=>x.ramN===0).guardDX!==0)
   throw Error("Loaded idle control unexpectedly drifted horizontally");
 return {scope:"additional real dynamic 80kg object allowed to settle on actual guard, then identical external ram push; 0/.25/.7 floor friction and no-push control. Material load is not an assigned stance buff.",
  cases,warning:"Any added resistance must be separated from added inertia; payload can slide off, and yaw-only bodies cannot tip."};
}
export function compareGroundSources(){
 const cases=presets.map(run),find=id=>cases.find(c=>c.id===id);
 const ice=find("ice"),grip=find("grippy"),float=find("floating"),idle=find("idle");
 if(grip.grounded<50||ice.grounded<50)throw Error("S2 didn't form sustained real ground contacts");
 if(float.grounded>0)throw Error("Zero-gravity control received fictitious floor support");
 if(ice.guardDX<grip.guardDX+.3)throw Error("S2 ground friction does not mediate resistance");
 if(Math.abs(ice.guardDX-float.guardDX)>10)
    throw Error("S2 zero-friction floor unexpectedly resists motion much more than unsupported control");
 if(Math.abs(idle.guardDX)>.1||idle.contacts>0)
   throw Error("S2 passive control applied force or created false contact");
 if(ice.guardY<.75||grip.guardY<.75||ice.guardY>1.1||grip.guardY>1.1)
   throw Error("S2 contact control departed the real floor; boundary artifact");
 if(ice.contacts<5||grip.contacts<5)
   throw Error("S2 ram didn't physically contact both material regimes");
 const cheaper=comparePlanarProxy();
 const supportLoss=removeGroundControl();
 const payload=loadBearingControl();
 return {cheaper,supportLoss,payload,scope:"single grounded Rapier3D model; fixed ground collider and dynamic yaw-only bodies, 420 ticks of IDENTICAL external laboratory force; gravity/friction controls + idle/offset",
  cases,iceMinusGripDX:r(ice.guardDX-grip.guardDX),
  conclusionRule:"A different grounded friction outcome proves substrate-level support transmission only; no feet, gait, sustained defensive technique, product feel or 2D cost advantage."};
}
