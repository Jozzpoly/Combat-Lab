// P4 isolated sensory-reflex scout. No NPC, path or scripted contest phase.
// Only LOCAL physical state of an actor's already-contact-acquired load may
// activate a finite top-down reaction; the same cheap response cap competes.
// Does not change existing P3/P2 or public build.
import {TransportYard} from "./p2-world.js";
import {V,DT} from "./p0-world.js";
const hypot=v=>Math.hypot(v.x,v.y);
const sub=(a,b)=>V(a.x-b.x,a.y-b.y);
const scale=(p,s)=>V(p.x*s,p.y*s);
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const r4=v=>Math.round(v*1e4)/1e4;
export class ReflexYard extends TransportYard{
 constructor(options={}){
  super(options);
  this.reflex=new Map();
  this.reflexEvents={ticks:0,sensed:0,active:0,
   proxyImpulse:0,triggeredAt:[],peakStretch:0};
  this.reflexCap=3.0; // N.s per tick, explicit virtual terrain source.
  this.minTension=.12;
  this.minSeparatingVelocity=.06;
 }
 setReflex(id,mode){
  if(!this.actors.some(x=>x.id===id)||!["off","brake","follow","conditional"].includes(mode))
   return false;
  this.reflex.set(id,mode);return true;
 }
 response(){
  this.reflexEvents.ticks++;
  for(const [id,mode] of this.reflex){
   const a=this.actors.find(x=>x.id===id);
   if(!a||mode==="off")continue;
   const link=this.grips.find(x=>x.actor===a);
   if(!link)continue;
   const b=a.body,c=link.load.body;
   // SENSE: only linked material's position+velocity relative to our body,
   // not target coordinates, map, hidden victory/episode stage or timer.
   const body=b.translation(),cargo=c.translation();
   const x=sub(cargo,body),d=hypot(x);
   if(d<1e-9)continue;
   const dir=scale(x,1/d),ownVel=b.linvel(),loadVel=c.linvel();
   const relative=sub(loadVel,ownVel);
   const separating=dot(relative,dir);
   const stretch=link.stretch;
   this.reflexEvents.sensed++;
   this.reflexEvents.peakStretch=Math.max(stretch,this.reflexEvents.peakStretch);
   let want=V(0,0);
   if(mode==="brake")want=scale(ownVel,-1);
   else if(mode==="follow")want=sub(loadVel,ownVel);
   else if(mode==="conditional"&&
     (stretch>this.minTension||separating>this.minSeparatingVelocity)){
    // React to impending separation, not to the location or name of cargo.
    // A bounded top-down traction proxy drives our body velocity toward load.
    want=sub(loadVel,ownVel);
   }
   const mag=hypot(want);
   if(mag<1e-7)continue;
   const impulse=Math.min(this.reflexCap,mag*b.mass());
   b.applyImpulse(scale(want,impulse/mag),true);
   this.reflexEvents.proxyImpulse+=impulse;
   this.reflexEvents.active++;
   if(this.reflexEvents.triggeredAt.length<10)
    this.reflexEvents.triggeredAt.push({tick:this.ticks,actor:id,
     separation:r4(d),stretch:r4(stretch),radialSpeed:r4(separating),mode});
  }
 }
 step(move=V()){
  this.response();
  super.step(move);
 }
 reflexTrace(){
  return {...this.gripTrace(),reflexPolicy:Object.fromEntries(this.reflex),
   reflexEvents:{...this.reflexEvents,
    proxyImpulse:r4(this.reflexEvents.proxyImpulse),
    peakStretch:r4(this.reflexEvents.peakStretch)}};
 }
}
