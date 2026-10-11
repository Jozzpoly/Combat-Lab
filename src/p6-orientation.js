// P6 negative-control orientation scout: SAME elongated 90kg rigid shape.
// Physically actuated external torque (source-accounted virtual traction)
// versus no torque. No actor pose teleport, collision filtering or level
// event. A cheap rigid body is deliberately the competitor to anatomy.
import {CommonsYard} from "./p5-commons.js";
import {corridor} from "./p6-envelope.js";
import {V} from "./p0-world.js";
const clamp=(v,min,max)=>Math.max(min,Math.min(v,max));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const r=x=>Math.round(x*1e4)/1e4;
export function p6RotateCase({width=1.2,support="finite",
 mode="passive",motor=650,frames=450,captureWorld=null}={}){
 if(!["passive","active","aligned","strong-push","turn-first"].includes(mode))throw Error("mode");
 const w=new CommonsYard({support,policy:"constant"});
 try{
  corridor(w,width,{x:14.4,y:12,lower:4,upper:20});
  const angle=mode==="aligned"?0:Math.PI/2;
  const a=w.add("slim",9.8,12,[{hx:1.20,hy:.33,mass:90}],{angle});
  a.stance="flow";a.motor=mode==="strong-push"?1200:motor;
  a.maxSpeedOverride=1.9;a.panel=null;a.panelActive=false;a.target=0;
  w.actors.push(a);w.selected=null;w.auto=false;
  const pre={position:{...a.body.translation()},angle:a.body.rotation(),
   inertia:a.body.principalInertia(),mass:a.body.mass()};
  let torqueSource=0,firstCross=null,peakX=a.body.translation().x;
  const timeline=[];let heldTicks=0;
  for(let step=0;step<frames;step++){
   if(mode==="active"||mode==="turn-first"){
    const angleError=wrap(-a.body.rotation()),rate=a.body.angvel();
    // True bounded N.m.s angular impulse into a physical dynamic rigid
    // body, NEVER setRotation or direct collider position changes.
    const impulse=clamp(angleError*3-rate*5,-1.8,1.8);
    a.body.applyTorqueImpulse(impulse,true);torqueSource+=Math.abs(impulse);
   }
   // Turn-first has identical physical torque/rigid shape to ACTIVE, but
   // withholds only translational root drive until body is aligned *by
   // measured own orientation*, rather than shoving while sideways.
   // This is a cheap posture policy, not a collision-bypass flag.
   const moving=mode!=="turn-first"||Math.abs(wrap(a.body.rotation()))<.22;
   if(moving)w.command(a,V(1,0));else heldTicks++;
   w.step();
   const p=a.body.translation();
   peakX=Math.max(peakX,p.x);
   if(firstCross===null&&p.x>16.3)firstCross=w.ticks;
   if([0,59,119,179,239,319,frames-1].includes(step))
    timeline.push({tick:w.ticks,x:r(p.x),y:r(p.y),angle:r(a.body.rotation()),
      rate:r(a.body.angvel()),drive:r(w.events.rootEffort),torque:r(torqueSource)});
  }
  const o={mode,width,support,motor:mode==="strong-push"?1200:motor,
   actualShape:a.shapes[0].shape,mass:r(a.body.mass()),
   angularInertia:r(a.body.principalInertia()),initial:pre,
   end:{p:{...a.body.translation()},angle:r(a.body.rotation())},
   terminalAngle:r(a.body.rotation()),firstCross,
   crossed:firstCross!==null,peakX:r(peakX),inputEffort:r(w.events.rootEffort),
   actuatorTorqueImpulse:r(torqueSource),translationHeldTicks:heldTicks,finite:w.traces().finite,
   timeline};
  if(captureWorld)captureWorld(w,o);
  return o;
 }finally{if(!captureWorld)w.dispose();}
}
export function p6OrientationProbe(){
 const cases=[];
 for(const width of [1.2,2.1,2.85])
  for(const support of ["finite","none"])
   for(const mode of ["passive","strong-push","aligned","active","turn-first"])
    cases.push(p6RotateCase({width,support,mode}));
 if(cases.length!==30||cases.some(x=>!x.finite||x.mass!==90||
  x.actualShape.hx!==1.2||x.actualShape.hy!==.33))
  throw Error("P6 actual shared-shape impulse source invalid");
 const summary=[];
 for(const width of [1.2,2.1,2.85])
  for(const support of ["finite","none"]){
   const group=cases.filter(x=>x.width===width&&x.support===support);
   const first=group[0];
   if(group.some(x=>JSON.stringify(x.initial.position)!==
      JSON.stringify(first.initial.position)||
      x.actualShape.hx!==first.actualShape.hx||
      x.mass!==first.mass))
    throw Error("P6 shape/mass source confounded");
   summary.push({width,support,cases:group.map(x=>({
    mode:x.mode,cross:x.crossed,tick:x.firstCross,
    x:r(x.end.p.x),yaw:x.terminalAngle,
    root:x.inputEffort,virtualYaw:x.actuatorTorqueImpulse,wait:x.translationHeldTicks
   }))});
  }
 return {cases:cases.length,results:cases,summary,
  caveat:"Active case uses explicit virtual-ground torque PD target zero (orientation policy), not cognition. Aligned mode intentionally starts at different orientation; don't compare it as matched initial-state causal pair. Passive/active/turn-first start identical physical pose/geometry. Turn-first and active use the same bounded torque; turn-first delays only translational traction until its own orientation aligns."};
}
