// P2 experimental contact-gated compliant grip and transport.
// Unlike inventory pickup, the load remains an independent dynamic rigid body
// with ordinary collisions, restitution, mass and support friction.
// Unlike a kinematic weld, grip is a FINITE source-accounted equal-and-opposite
// impulse pair on real body points, so it can stretch/yield/break.
// No creature cognition or automatic navigation; movement is the declared
// finite root drive proxy from P0.
import RAPIER from "@dimforge/rapier2d-deterministic";
import {MaterialYard,V,DT} from "./p0-world.js";
const norm=(p)=>Math.hypot(p.x,p.y);
const diff=(a,b)=>V(a.x-b.x,a.y-b.y);
const add=(a,b)=>V(a.x+b.x,a.y+b.y);
const sc=(a,s)=>V(a.x*s,a.y*s);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const round=x=>Math.round(x*1e4)/1e4;
function rotate(p,theta){const c=Math.cos(theta),s=Math.sin(theta);return V(c*p.x-s*p.y,s*p.x+c*p.y);}
function point(body,local){return add(body.translation(),rotate(local,body.rotation()));}
function local(body,world){return rotate(diff(world,body.translation()),-body.rotation());}
function velocity(body,worldPt){
 const o=body.translation(),r=diff(worldPt,o),v=body.linvel(),w=body.angvel();
 return V(v.x-w*r.y,v.y+w*r.x);
}
function manifold(world,a,b){
 let touched=0,impulse=0;
 for(const x of a.shapes)for(const y of b.shapes){
  world.contactPair(x.collider,y.collider,m=>{
   for(let k=0;k<m.numSolverContacts();k++){
    touched++;impulse+=Math.abs(m.contactImpulse(k)||0);
   }
  });
 }
 return {touched,impulse};
}
export class TransportYard extends MaterialYard {
 constructor(options={}) {
  super(options);
  this.grips=[];
  this.gripEvidence={contactApproaches:0,refusedWithoutContact:0,
   pairedImpulseSum:0,pairedImpulseX:0,pairedImpulseY:0,
   appliedPairs:0,meanStretch:0,peakStretch:0,breaks:0,manualReleases:0,
   transported:false};
  this.gripMaxImpulse=3;
  this.gripStiffness=130;
  this.gripDamping=18;
  this.gripBreakDistance=2.2;
 }
 actualContact(actor,load){
  // Read solver manifolds for the actual collider shape pair, NOT stale
  // broadphase overlap queries or merely visual proximity.
  const bodies=[actor,...(actor.panel?[actor.panel]:[])];
  let best=null;
  for(const body of bodies){
   const m=manifold(this.world,body,load);
   if(m.touched>0 && (!best||m.impulse>best.impulse))
    best={holder:body,contacts:m.touched,impulse:m.impulse};
  }
  return best;
 }
 grip(actorId,loadId,{maxImpulse=this.gripMaxImpulse}={}){
  const actor=this.actors.find(e=>e.id===actorId);
  const load=this.loads.find(e=>e.id===loadId);
  if(!actor||!load||!Number.isFinite(maxImpulse)||maxImpulse<0||maxImpulse>200)
   return {ok:false,reason:"invalid actor/load/strength"};
  if(this.grips.some(g=>g.actor===actor||g.load===load)){
   // Only one pull link per actor/load in the first bounded specimen.
   return {ok:false,reason:"already linked"};
  }
  const contact=this.actualContact(actor,load);
  if(!contact){this.gripEvidence.refusedWithoutContact++;
   return {ok:false,reason:"no real solver contact"};
  }
  this.gripEvidence.contactApproaches++;
  const holder=contact.holder,pa=holder.body.translation(),pb=load.body.translation();
  // Same shared physical world anchor in both local frames, so attachment
  // does NOT snap/repose load nor erase its other contacts.
  const anchor=V((pa.x+pb.x)*.5,(pa.y+pb.y)*.5);
  const g={actor,load,holder,anchorA:local(holder.body,anchor),
   anchorB:local(load.body,anchor),maxImpulse,
   totalImpulse:0,stretch:0,contactAtGrip:contact,createdTick:this.ticks};
  this.grips.push(g);
  return {ok:true,contact:contact.contacts,impulse:round(contact.impulse),
   holder:holder.kind,loadId:load.id};
 }
 release(actorId){
  const index=this.grips.findIndex(x=>x.actor.id===actorId);
  if(index<0)return false;
  this.grips.splice(index,1);this.gripEvidence.manualReleases++;return true;
 }
 applyGrips(){
  for(const g of [...this.grips]){
   const a=g.holder.body,b=g.load.body;
   const pa=point(a,g.anchorA),pb=point(b,g.anchorB);
   const e=diff(pa,pb),stretch=norm(e);
   g.stretch=stretch;
   this.gripEvidence.peakStretch=Math.max(this.gripEvidence.peakStretch,stretch);
   if(stretch>this.gripBreakDistance){
    this.grips.splice(this.grips.indexOf(g),1);
    this.gripEvidence.breaks++;continue;
   }
   const relative=diff(velocity(a,pa),velocity(b,pb));
   const desired=add(sc(e,this.gripStiffness*DT),sc(relative,this.gripDamping*DT));
   const L=norm(desired),s=L>g.maxImpulse?g.maxImpulse/L:1;
   const impulse=sc(desired,s);
   if(norm(impulse)<1e-8)continue;
   // Action-reaction impulses at their separate physical body attachment
   // positions. No load translation is manually changed here.
   a.applyImpulseAtPoint(sc(impulse,-1),pa,true);
   b.applyImpulseAtPoint(impulse,pb,true);
   const amount=norm(impulse);
   g.totalImpulse+=amount;this.gripEvidence.appliedPairs++;
   this.gripEvidence.pairedImpulseSum+=amount;
   this.gripEvidence.pairedImpulseX+=(-impulse.x+impulse.x);
   this.gripEvidence.pairedImpulseY+=(-impulse.y+impulse.y);
  }
 }
 step(move=V()){
  this.terrainStep();
  this.gateDrag();
  this.actuation();
  if(this.chosen)this.command(this.chosen,move);
  this.applyGrips();
  this.world.step();this.ticks++;this.afterStep();
 }
 gripTrace(){
  const w=this.traces();
  return {...w,grips:this.grips.map(g=>({
   actor:g.actor.id,load:g.load.id,holder:g.holder.kind,
   stretch:round(g.stretch),totalImpulse:round(g.totalImpulse),
   anchorHolder:point(g.holder.body,g.anchorA),
   anchorLoad:point(g.load.body,g.anchorB)})),
   gripEvidence:Object.fromEntries(Object.entries(this.gripEvidence)
    .map(([k,v])=>[k,typeof v==="number"?round(v):v]))};
 }
}
