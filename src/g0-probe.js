// PREDESIGNATED G0 pressure: identical 3D geometry, distinct source of effort.
// No hidden body translation force in wheels mode, no truth-changing flag when
// removing support. A root proxy is an explicit rival, not a physical gait.
import {GroundDriveWorld} from "./g0-world.js";
const cases=[
 {tag:"driven-grounded",mu:1,motor:380,mode:"wheels"},
 {tag:"friction-zero",mu:0,motor:380,mode:"wheels"},
 {tag:"joint-torque-zero",mu:1,motor:0,mode:"wheels"},
 {tag:"completely-passive",mu:1,motor:0,mode:"passive"},
 {tag:"planar-root-proxy",mu:1,motor:380,mode:"root-proxy"},
 {tag:"root-proxy-on-ice",mu:0,motor:380,mode:"root-proxy"},
 {tag:"no-floor",mu:1,motor:380,mode:"wheels",removeGround:true},
 {tag:"gravity-zero",mu:1,gravity:0,motor:380,mode:"wheels"},
 {tag:"driven-no-obstacle",mu:1,motor:380,mode:"wheels",obstacle:false},
 {tag:"passive-no-obstacle",mu:1,motor:0,mode:"passive",obstacle:false}
];
export function groundSourceProbe(part="all"){
 if(!["A","B","all"].includes(part))throw RangeError("G0 probe batch");
 const selected=part==="A"?cases.slice(0,5):part==="B"?cases.slice(5):cases;
 const results=[];
 for(const preset of selected){
  const w=new GroundDriveWorld(preset);
  try{
   let sourceRoot=0,phase=[];
   if(preset.removeGround&&!w.removeGround())throw Error("physical ground removal failed");
   for(let tick=0;tick<420;tick++){
    w.step(tick<360?1:0);
    if([0,60,180,359,419].includes(tick))phase.push({tick,...w.read()});
   }
   const state=w.read();
   if(preset.mode==="wheels"&&state.rootImpulseSum!==0)
    throw Error("Wheel-only drive illegally applied a root impulse");
   if(!Number.isFinite(state.chassis.dx))throw Error("nonfinite poststep");
   results.push({tag:preset.tag,...state,phase});
  }finally{w.dispose();}
 }
 return {part,scope:"Rapier 3D with vertical gravity, 4 real wheel bodies/axle joints, real ground collider and Multiply friction. Same physical vehicle under 10 fixed interventions × 420 solver ticks; motorized wheel joint effort ONLY except the explicitly labeled root-drive rival. No animal gait, navigation, RL, autonomy, or anthropomorphic claims.",
  results,warning:"Motorized wheels are a calibration of ground-reaction causality, NOT evidence for paws, feet, leg-gait or gameplay; wheel vs root drive intentionally differs in motor force-transmission semantics."};
}
