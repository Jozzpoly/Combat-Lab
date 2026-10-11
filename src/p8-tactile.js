// P8 bounded body-body side-slip scout, intentionally NOT softbody.
// Every collision is still a real rigid Rapier manifold. No sensor proximity,
// collision mask hacks, movement teleport, omniscient route or hidden goal.
// Root force remains the same bounded external-ground proxy as P7.
import {DoorCrowdYard} from "./p7-crowd.js";
import {V} from "./p0-world.js";
const vlen=p=>Math.hypot(p.x,p.y);
const round=x=>Math.round(x*1e4)/1e4;
const policies=new Set(["drive","yield","slip"]);
export class TactileYard extends DoorCrowdYard{
 constructor({tactile="slip",...rest}={}){
  if(!policies.has(tactile))throw Error("P8 tactile policy");
  super({...rest,moverPolicy:tactile==="yield"?"yield":"drive"});
  this.p8={tactile,contactActivations:0,slideTicks:0,contactTimes:0,
    contactImpulse:0,maxImpulse:0,pressureStalls:0,
    totalRootImpulse:0,bodyBlockedTicks:0,ownerSteps:0};
  this.sideMemory=new Map();
 }
 localStep(){
  if(this.p8.tactile!=="slip"){
   const effort=this.events.rootEffort,prior=this.pressure.totalMoverContacts;
   super.localStep();
   this.p8.contactTimes+=this.pressure.totalMoverContacts-prior;
   this.p8.totalRootImpulse+=this.events.rootEffort-effort;
   return;
  }
  if(!this.auto)return;
  this.activity.steps++;this.pressure.steps++;
  const guardTouch=this.touch(this.guard).filter(t=>this.pushers.includes(t.other));
  const imp=guardTouch.reduce((n,t)=>n+t.impulse,0);
  if(guardTouch.length){
   this.pressure.guardPressureTicks++;
   this.pressure.guardContacts+=guardTouch.length;
   this.pressure.guardImpulse+=imp;
   this.pressure.largestCrowdForce=Math.max(this.pressure.largestCrowdForce,imp);
  }
  if(this.selected!==this.guard.id){
   this.guard.stance=this.pressure.guardPolicy==="brace"&&imp>.12?
    "brace":"flow";
  }
  if(this.guard.stance==="brace")this.pressure.guardBraceTicks++;
  for(const a of this.pushers){
   if(this.selected===a.id){this.p8.ownerSteps++;continue;}
   const contacts=this.touch(a).filter(t=>t.other===this.guard||
    this.pushers.includes(t.other));
   this.pressure.totalMoverContacts+=contacts.length;
   this.p8.contactTimes+=contacts.length;
   this.p8.contactImpulse+=contacts.reduce((n,t)=>n+t.impulse,0);
   this.p8.maxImpulse=Math.max(this.p8.maxImpulse,
    ...contacts.map(t=>t.impulse),0);
   const v=a.body.linvel();
   if(contacts.length&&v.x<.20){
    this.p8.pressureStalls++;this.p8.bodyBlockedTicks++;
   }
   const recent=this.sideMemory.get(a.id);
   const strongest=contacts.reduce((best,t)=>t.impulse>best?.impulse?t:best,null);
   let state=recent;
   if(strongest&&strongest.impulse>.35&&(!state||state.left<=0)){
    const own=a.body.translation(),other=strongest.other.body.translation();
    // One-bit tangential choice from the ACTUAL touching neighbor, only
    // when contact impulse exists. Tie by ID to avoid global lane labels.
    let sign=Math.sign(own.y-other.y);
    if(!sign)sign=a.id%2?1:-1;
    state={sign,left:32,triggerId:strongest.other.id};
    this.sideMemory.set(a.id,state);
    this.p8.contactActivations++;this.pressure.deflections++;
   }
   let direction=V(1,0);
   if(state&&state.left>0){
    // Same motor budget and target speed as the cheap forward-only rival.
    // Tangential intent is blended; NO additional translation impulse.
    direction=V(.64,.77*state.sign);
    state.left--;this.p8.slideTicks++;
   }
   const before=this.events.rootEffort;
   this.command(a,direction);
   const spent=this.events.rootEffort-before;
   this.pressure.moveImpulse+=spent;this.p8.totalRootImpulse+=spent;
  }
 }
 pressureTrace(){
  const r=super.pressureTrace();
  return {...r,p8:{...this.p8,
   contactImpulse:round(this.p8.contactImpulse),
   maxImpulse:round(this.p8.maxImpulse),
   totalRootImpulse:round(this.p8.totalRootImpulse)},
   currentSlip:this.pushers.map(a=>({id:a.id,
    remaining:this.sideMemory.get(a.id)?.left||0,
    side:this.sideMemory.get(a.id)?.sign||0}))};
 }
}
export function makeTactileYard(options={}){return new TactileYard(options);}
