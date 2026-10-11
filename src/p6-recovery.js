// P6 local anti-jam pressure hypothesis. Same rigid 90kg elongated body,
// same finite motor and angular torque budget; no path, goal, teleport or
// simulation-time trigger. A reversible physical sequence starts only upon
// actual Rapier contact and measured root-speed stall. Retraction distance is
// the organism's own displacement since collision, not a global waypoint.
import {CommonsYard} from "./p5-commons.js";
import {corridor} from "./p6-envelope.js";
import {V} from "./p0-world.js";
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
const r=x=>Math.round(x*1e4)/1e4;
export function p6RecoveryCase({support="finite",width=1.2,
 policy="recover",ticks=850,haltOnCross=false,captureWorld=null}={}){
 if(!["recover","stubborn"].includes(policy))throw Error("recovery policy");
 const w=new CommonsYard({support,policy:"constant",seed:1});
 try{
  corridor(w,width);
  const a=w.add("slim",9.8,12,[{hx:1.20,hy:.33,mass:90}],{angle:Math.PI/2});
  a.stance="flow";a.motor=650;a.maxSpeedOverride=1.9;
  a.panel=null;a.panelActive=false;a.target=0;
  w.actors.push(a);w.selected=null;w.auto=false;
  const start={pos:{...a.body.translation()},yaw:a.body.rotation(),
   velocity:{...a.body.linvel()},mass:a.body.mass(),
   inertia:a.body.principalInertia()};
  let state="advance",stalled=0,jamAt=null,backedOut=null,
   oriented=null,firstCross=null,torqueSource=0;
  const log=[];
  for(let i=0;i<ticks;i++){
   if(state==="advance"||state==="reapproach")w.command(a,V(1,0));
   else if(state==="retreat")w.command(a,V(-1,0));
   else if(state==="orient"){
    const q=wrap(-a.body.rotation()),omega=a.body.angvel();
    const j=clamp(q*3-omega*5,-1.8,1.8);
    a.body.applyTorqueImpulse(j,true);
    torqueSource+=Math.abs(j);
   }
   w.step();
   const p=a.body.translation(),vel=a.body.linvel();
   const trueBarrierContact=w.touch(a).filter(x=>x.other.kind==="barrier");
   const hit=trueBarrierContact.some(x=>x.impulse>.025);
   if(state==="advance"&&policy==="recover"){
    const blocked=hit&&Math.abs(vel.x)<.22;
    stalled=blocked?stalled+1:0;
    if(stalled>=3){
     jamAt={tick:w.ticks,pos:{...p},yaw:a.body.rotation(),
      contactImpulse:r(trueBarrierContact.reduce((n,x)=>n+x.impulse,0))};
     state="retreat";
    }
   }else if(state==="retreat"&&jamAt){
    const retreatDX=jamAt.pos.x-p.x;
    // Retreat body-scale distance; actual grounded velocity and collision
    // dictate when that distance has been traversed.
    if(retreatDX>=1.65&&!hit){
     backedOut={tick:w.ticks,distance:r(retreatDX),x:r(p.x)};
     state="orient";
    }
   }else if(state==="orient"){
    const err=Math.abs(wrap(a.body.rotation())),omega=Math.abs(a.body.angvel());
    if(err<.22&&omega<.20){
     oriented={tick:w.ticks,x:r(p.x),yaw:r(a.body.rotation()),
      sourceTorque:r(torqueSource)};
     state="reapproach";
    }
   }
   if(firstCross===null&&p.x>16.3)firstCross=w.ticks;
   if(i%90===0||i===ticks-1||firstCross===w.ticks)
    log.push({tick:w.ticks,phase:state,x:r(p.x),y:r(p.y),
     yaw:r(a.body.rotation()),vx:r(vel.x),virtualRoot:r(w.events.rootEffort),
     virtualYaw:r(torqueSource),barrierContact:hit});
   if(firstCross!==null&&haltOnCross)break;
  }
  const result={policy,support,width,start,actorShape:a.shapes[0].shape,
   jamAt,backedOut,oriented,firstCross,crossed:firstCross!==null,
   terminal:{p:{...a.body.translation()},yaw:r(a.body.rotation())},
   effort:r(w.events.rootEffort),torqueSource:r(torqueSource),
   groundSource:r(w.events.terrainLinearImpulse),
   actualTick:w.ticks,finite:w.traces().finite,history:log};
  if(captureWorld)captureWorld(w,result);
  return result;
 }finally{if(!captureWorld)w.dispose();}
}
export function p6RecoveryProbe(){
 const results=[];
 for(const width of [1.2,2.1,2.85])
  for(const support of ["finite","none"])
   for(const policy of ["stubborn","recover"])
    results.push(p6RecoveryCase({support,width,policy}));
 if(results.length!==12||results.some(x=>!x.finite||
  Math.abs(x.start.mass-90)>1e-6||x.actorShape.hx!==1.2))
  throw Error("P6 recovery actual starting mass/shape invalid");
 const comparisons=[];
 for(const width of [1.2,2.1,2.85])
  for(const support of ["finite","none"]){
   const p=results.filter(x=>x.width===width&&x.support===support);
   if(p.length!==2||JSON.stringify(p[0].start)!==JSON.stringify(p[1].start))
    throw Error("P6 recovery physically different source initial state");
   comparisons.push({width,support,rows:p.map(x=>({
    policy:x.policy,jamTick:x.jamAt?.tick,
    retreated:x.backedOut?.distance,rotateTick:x.oriented?.tick,
    crossed:x.crossed,crossTick:x.firstCross,
    endX:r(x.terminal.p.x),root:x.effort,angular:x.torqueSource
   }))});
  }
 return {cases:results.length,results,comparisons,
  assumptions:"Source-defined reverse-by-1.65m and own-yaw-zero posture are authored low-cognition policies, NOT learned obstacle interpretation. Jam trigger reads TRUE Rapier static barrier contact force and actual stalled velocity, no script timer."};
}
