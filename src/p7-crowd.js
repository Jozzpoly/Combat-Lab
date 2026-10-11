// P7: multiple truly dynamic organisms sharing one physical aperture.
// Intentionally CHEAP surrogate, not smart crowd traffic, goal finding, or
// postural anatomy. P7 asks if force/contact/shape yield observable consequences
// in a continuous owner-editable world, with cheap source counterfactuals.
import {CommonsYard} from "./p5-commons.js";
import {V} from "./p0-world.js";
const norm=p=>Math.hypot(p.x,p.y);
const unit=p=>{const n=norm(p);return n<1e-8?V(1,0):V(p.x/n,p.y/n);};
const round=x=>Math.round(x*1e4)/1e4;
const guardPolicies=new Set(["passive","brace"]);
const moverPolicies=new Set(["drive","yield"]);
const crowdCfg=[
 [11.1,11.55],[10.15,12.45],[9.15,11.70],
 [8.15,12.35],[7.20,11.63],[6.25,12.45],
 [5.25,11.75],[4.25,12.35]
];
// Deliberately same authored starting heading for comparison; these are
// source actors with root drive, not pathfinding agents.
export class DoorCrowdYard extends CommonsYard{
 constructor({support="finite",guardPolicy="brace",
 moverPolicy="drive",width=3.4,density=6,
 guardKind="bulky",guardMass=90}={}){
  super({support,policy:"constant",seed:1});
  if(!guardPolicies.has(guardPolicy)||!moverPolicies.has(moverPolicy))
   throw Error("P7 unsupported bounded pressure comparator");
  if(![2.85,3.45,4.65].includes(width)||![3,6,8].includes(density))
   throw Error("P7 pressure geometry or density");
  if(!["small","bulky"].includes(guardKind))throw Error("P7 guard kind");
  this.pressure={guardPolicy,moverPolicy,width,density,guardKind,guardMass,
   steps:0,guardPressureTicks:0,guardContacts:0,guardImpulse:0,
   totalMoverContacts:0,deflections:0,guardBraceTicks:0,
   moveImpulse:0,guardPokes:0,sourceEdits:0,largestCrowdForce:0};
  const y=12,x=15.0,low=y-width/2,high=y+width/2;
  const lowWall=this.barrier(x,(3.2+low)/2,.32,(low-3.2)/2);
  const highWall=this.barrier(x,(high+20.8)/2,.32,(20.8-high)/2);
  this.gap={x,y,width,lowWall,highWall,low,high};
  const g=this.spawn(guardKind,V(15.07,12));
  if(guardMass!==null){g.shapes[0].collider.setMass(guardMass);
    this.world.propagateModifiedBodyPositionsToColliders();}
  g.motor=650;g.maxSpeedOverride=1.7;g.stance="flow";
  this.guard=g;
  this.pushers=[];
  for(let i=0;i<density;i++){
   const [sx,sy]=crowdCfg[i],a=this.spawn("small",V(sx,sy));
   a.motor=470;a.maxSpeedOverride=1.85;
   this.pushers.push(a);
  }
  this.localHeadings=new Map(this.pushers.map(x=>[x.id,V(1,0)]));
  this.deflected=new Set();
  // Real independent matter competes for the aperture, rather than being
  // a scripted destination or a rendered sprite that hides physics.
  this.load(19.0,11.20,.48,.42,32);
  this.load(19.5,13.1,.53,.44,60);
  this.selected=null;this.auto=true;
  this.world.propagateModifiedBodyPositionsToColliders();
 }
 openPassage(){
  if(!this.gap||this.gap.opened)return false;
  const upper=this.gap.highWall,p=upper.body.translation();
  if(!this.moveEntity(upper,V(p.x,p.y-1.30)))return false;
  this.gap.opened=true;this.pressure.sourceEdits++;
  return true;
 }
 pushGuard(delta=V(85,0)){
  const p=this.guard.body.translation();
  const ok=this.exteriorImpulse(this.guard,delta,V(p.x,p.y+.45));
  if(ok)this.pressure.guardPokes++;
  return ok;
 }
 localStep(){
  if(!this.auto)return;
  this.activity.steps++;this.pressure.steps++;
  const guardTouch=this.touch(this.guard).filter(t=>this.pushers.includes(t.other));
  const impulse=guardTouch.reduce((acc,t)=>acc+t.impulse,0);
  if(guardTouch.length>0){
   this.pressure.guardPressureTicks++;
   this.pressure.guardContacts+=guardTouch.length;
   this.pressure.guardImpulse+=impulse;
   this.pressure.largestCrowdForce=Math.max(this.pressure.largestCrowdForce,impulse);
  }
  // NO position servo and NO artificial lock. Standing guard is literally
  // a free dynamic rigid body resisting the crowd through the same finite
  // virtual ground reaction already used for all organisms.
  this.guard.stance=this.pressure.guardPolicy==="brace"&&impulse>.12?
   "brace":"flow";
  if(this.guard.stance==="brace")this.pressure.guardBraceTicks++;
  // The guard is not secretly applying reverse drive. OWNER can select and
  // steer it directly with WASD, if desired.
  for(const a of this.pushers){
   if(this.selected===a.id)continue;
   const incoming=this.touch(a);
   this.pressure.totalMoverContacts+=incoming.filter(t=>
     t.other===this.guard||this.pushers.includes(t.other)).length;
   if(this.pressure.moverPolicy==="yield"&&!this.deflected.has(a.id)){
    // Real Rapier physical contact with a large dynamic body is necessary.
    const hit=incoming.find(t=>t.other===this.guard&&t.impulse>.55);
    if(hit){
     // A cheap single steering change, not a sophisticated anticipatory AI:
     // attempt to deflect tangentially around a body actually felt.
     const side=Math.sign(a.body.translation().y-this.guard.body.translation().y)||1;
     this.localHeadings.set(a.id,unit(V(.58,side*.82)));
     this.deflected.add(a.id);this.pressure.deflections++;
    }
   }
   const before=this.events.rootEffort;
   this.command(a,this.localHeadings.get(a.id));
   this.pressure.moveImpulse+=this.events.rootEffort-before;
  }
 }
 pressureTrace(){
  const base=this.commonsTrace();
  const g=this.guard.body.translation(),radius=this.guard.shapes[0].shape.r||0;
  const crossers=this.pushers.filter(a=>a.body.translation().x>this.gap.x+1.30);
  const withinMouth=crossers.filter(a=>{
   const p=a.body.translation(),r=a.shapes[0].shape.r||0;
   const low=this.gap.low,high=this.gap.high;
   return p.y-r>low-.06&&p.y+r<high+.06;
  });
  return {...base,
   pressure:{...this.pressure,guardImpulse:round(this.pressure.guardImpulse),
    moveImpulse:round(this.pressure.moveImpulse),
    largestCrowdForce:round(this.pressure.largestCrowdForce)},
   guard:{id:this.guard.id,kind:this.guard.kind,mass:round(this.guard.body.mass()),
    x:round(g.x),y:round(g.y),vx:round(this.guard.body.linvel().x),
    stance:this.guard.stance,shapeRadius:radius},
   mouth:{width:this.gap.width,low:this.gap.low,high:this.gap.high,
    changed:!!this.gap.opened},
   crossings:{all:crossers.length,mouth:withinMouth.length},
   movers:this.pushers.map(a=>({id:a.id,kind:a.kind,
    x:round(a.body.translation().x),y:round(a.body.translation().y),
    vx:round(a.body.linvel().x),steered:this.deflected.has(a.id)})),
   loads:this.loads.map(a=>({id:a.id,x:round(a.body.translation().x),
    y:round(a.body.translation().y)}))};
 }
}
export function makeDoorCrowd(options={}){
 return new DoorCrowdYard(options);
}
