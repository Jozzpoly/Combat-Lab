// P5 free-contact material commons. A bounded LOCAL sensorimotor sandbox,
// NOT NPC cognition or waypoint navigation. Autonomous drive is a declared
// virtual traction proxy. No scripted episodes, win signals or destination.
import {ReflexYard} from "./p4-reflex.js";
import {applyAxialGrips} from "./p4-axial.js";
import {V} from "./p0-world.js";
const norm=p=>Math.hypot(p.x,p.y);
const sub=(a,b)=>V(a.x-b.x,a.y-b.y);
const unit=p=>{const n=norm(p);return n>1e-8?V(p.x/n,p.y/n):V(1,0);};
const r=x=>Math.round(x*1e4)/1e4;
const hash=(seed,id)=>{let x=(seed*1664525+id*1013904223)>>>0;
 x^=x>>>16;x=Math.imul(x,2246822507);x^=x>>>13;
 return (x>>>0)/4294967296;};
const ROLES=new Set(["press","yield","brace","carrier"]);
export class CommonsYard extends ReflexYard{
 constructor(options={}){
  super({populated:false,support:options.support||"finite"});
  this.local=new Map();this.policy=options.policy||"material";
  this.seed=options.seed??1;this.auto=true;
  this.activity={steps:0,contactActor:0,contactCargo:0,contactFixed:0,
    pressureImpulse:0,turns:0,braceTicks:0,localGrips:0,
    gripAttempts:0,refusedGrips:0,autonomousEffort:0,
    externalImpulses:0,externalImpulseSum:0};
 }
 // Explicit and opt-in. Spawning a body never silently installs intelligence.
 register(actor,role,heading){
  if(!this.actors.includes(actor)||!ROLES.has(role))return false;
  this.local.set(actor.id,{role,heading:unit(heading),
   cooldown:0,braceLeft:0,contacts:0,turns:0,grips:0});
  return true;
 }
 setRole(id,role){const s=this.local.get(id);if(!s||!ROLES.has(role))return false;
  s.role=role;s.braceLeft=0;return true;}
 touch(a){
  // Only actual solver contactPair manifolds. No proximity/omniscient scans.
  const found=[];
  for(const other of this.entities){
   if(other===a||other===a.panel||other.kind==="pivot"||other.kind==="effector")continue;
   let num=0,impulse=0;
   for(const sx of a.shapes)for(const sy of other.shapes){
    this.world.contactPair(sx.collider,sy.collider,m=>{
     for(let k=0;k<m.numSolverContacts();k++){
      num++;impulse+=Math.abs(m.contactImpulse(k)||0);
     }
    });
   }
   if(num>0)found.push({other,contacts:num,impulse});
  }
  return found;
 }
 localStep(){
  if(!this.auto)return;
  this.activity.steps++;
  for(const a of this.actors){
   const s=this.local.get(a.id);if(!s)continue;
   // Direct human control of currently selected body overrides its autonomous
   // root motor; physics and local collision remain active for everyone.
   if(this.selected===a.id)continue;
   const before=this.events.rootEffort;
   const touched=this.touch(a);
   const total=touched.reduce((n,c)=>n+c.impulse,0);
   if(touched.length){
    s.contacts+=touched.length;
    this.activity.pressureImpulse+=total;
   }
   let cargoContact=null, strongest=null;
   for(const t of touched){
    if(t.other.kind==="load"){
     this.activity.contactCargo++;
     if(!cargoContact||t.impulse>cargoContact.impulse)cargoContact=t;
    }else if(this.actors.includes(t.other))this.activity.contactActor++;
    else this.activity.contactFixed++;
    if(!strongest||t.impulse>strongest.impulse)strongest=t;
   }
   if(s.role==="carrier"&&["material","attach"].includes(this.policy)&&cargoContact&&
      !this.grips.some(g=>g.actor===a)){
    this.activity.gripAttempts++;
    const source=this.grip(a.id,cargoContact.other.id,{maxImpulse:4});
    if(source.ok){s.grips++;this.activity.localGrips++;}
    else this.activity.refusedGrips++;
   }
   if(this.policy!=="constant"&&s.cooldown<=0&&strongest&&strongest.impulse>.8){
    if(s.role==="yield"){
     // A local contact-centered avoidance bias, no remembered waypoint.
     const away=unit(sub(a.body.translation(),strongest.other.body.translation()));
     const tangent=V(-away.y,away.x);
     const preference=hash(this.seed,s.contacts+a.id)>.5?1:-1;
     s.heading=unit(V(away.x*.66+tangent.x*.48*preference,
       away.y*.66+tangent.y*.48*preference));
     s.cooldown=18;s.turns++;this.activity.turns++;
    }else if(s.role==="brace"){
     s.braceLeft=38;s.cooldown=18;
    }
   }
   s.cooldown=Math.max(0,s.cooldown-1);
   if(this.policy!=="constant"&&s.role==="brace"&&s.braceLeft>0){
    a.stance="brace";s.braceLeft--;this.activity.braceTicks++;
    // A resisting body has finite terrain support but NO world-position lock.
   }else{
    a.stance="flow";
    if(s.role==="carrier"&&this.grips.some(g=>g.actor===a)){
     // The cheapest P4 retained-contact reflex; match physically connected
     // load velocity if tension arises (no goal or hidden location target).
     const g=this.grips.find(g=>g.actor===a);
     const v=sub(g.load.body.linvel(),a.body.linvel()),L=norm(v);
     if(L>.18&&this.policy==="material"){
      const n=unit(v);
      this.command(a,n);
     }else this.command(a,s.heading);
    }else this.command(a,s.heading);
   }
   this.activity.autonomousEffort+=this.events.rootEffort-before;
  }
 }
 applyGrips(){applyAxialGrips(this);}
 step(move=V()){
  // source contacts read from last completed solver tick before next impulses
  this.localStep();
  super.step(move);
 }
 exteriorImpulse(entity,delta,at=null){
  if(!entity||entity.body.isFixed()||!Number.isFinite(delta.x)||!Number.isFinite(delta.y))
   return false;
  const magnitude=norm(delta);
  if(magnitude<1e-6||magnitude>650)return false;
  const p=at||entity.body.translation();
  entity.body.applyImpulseAtPoint(delta,p,true);
  this.activity.externalImpulses++;
  this.activity.externalImpulseSum+=magnitude;
  return true;
 }
 commonsTrace(){
  return {...this.reflexTrace(),auto:this.auto,policy:this.policy,seed:this.seed,
   activity:Object.fromEntries(Object.entries(this.activity).map(([k,v])=>[k,r(v)])),
   local:[...this.local].map(([id,s])=>({id,role:s.role,
    h:{x:r(s.heading.x),y:r(s.heading.y)},contacts:s.contacts,
    turns:s.turns,grips:s.grips,braceLeft:s.braceLeft}))};
 }
}
// This is a setup of plausible starting pressure, NOT a trajectory or script.
// There are no destinations, goals, scripted interactions or timed choices.
// All six bodies receive independent local sensorimotor rules after start.
export function createCommons({support="finite",policy="material",seed=1,
 density=6}={}){
 if(!["constant","touch","attach","material"].includes(policy))throw Error("policy");
 const w=new CommonsYard({support,policy,seed});
 const cfg=[
  ["small",8.0,12.6, 1,.11,"carrier"],
  ["bulky",18.2,12.8,-1,.05,"brace"],
  ["small",12.65,8.4,.08,1,"yield"],
  ["small",13.1,18.2,.10,-1,"press"],
  ["bulky",18.7,16.3,-1,-.10,"carrier"],
  ["small",8.3,16.6,1,-.07,"yield"],
  ["small",10.2,9.5,.62,.75,"press"],
  ["small",16.9,18.2,-.5,-.85,"yield"],
  ["bulky",9.2,18.7,.45,-1,"brace"],
  ["small",17.9,8.7,-.8,.3,"carrier"],
 ];
 for(let i=0;i<density;i++){
  const [kind,x,y,vx,vy,role]=cfg[i];
  const a=w.spawn(kind,V(x,y));
  a.maxSpeedOverride=kind==="bulky"?1.3:1.65;
  // Different deterministic micro-directions from seed without scripted paths.
  const jitter=(hash(seed,a.id)-.5)*.22;
  w.register(a,role,V(vx-jitter*vy,vy+jitter*vx));
 }
 w.load(13.5,12.6,.63,.58,45);
 w.load(13.9,16.3,.65,.50,70);
 w.load(10.8,14.75,.44,.40,24);
 w.wall(15.4,14.9,.18,1.15);
 w.wall(11.3,11.9,.15,.80);
 w.world.propagateModifiedBodyPositionsToColliders();
 w.selected=null;
 return w;
}
