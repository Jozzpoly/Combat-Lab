// P10: One quiet, physical, editable material COMMONS, not an NPC goal graph.
// Existing P0/P2/P4/P5 source DONORS, no automatic P7/P8 queue, no brain.
// Claims must be checked against actual emitted-browser Rapier and cheap rivals.
import {CommonsYard} from "./p5-commons.js";
import {V} from "./p0-world.js";
const rnd=x=>Math.round(x*1e4)/1e4;
const fixtures=new Set(["free","slot-small","slot-bulky","slot-open-bulky",
 "haul","hinge","rigid-tool"]);
export class MaterialWorkshop extends CommonsYard {
 constructor({fixture="free",support="finite"}={}){
  if(!fixtures.has(fixture))throw Error("P10 unknown lab fixture");
  super({support,policy:"constant",seed:1});
  this.fixture=fixture;
  // No autonomous movement. Manual operator can move any selected body.
  // Other bodies remain genuine independent Rapier physical objects.
  this.auto=false;
  this.materialEvents={edits:0,manualGrips:0,manualReleases:0};
  this.slot={
   upper:this.barrier(28,5.1,.25,3.8),   // lower edge y8.9
   lower:this.barrier(28,15.1,.25,4.0)   // upper edge y11.1
  };
  // An unprescribed physical place, not a puzzle with gate trigger IDs:
  // P0's existing hinged gate, an extra real aperture, two material clusters.
  this.barrier(6.2,5.25,.24,1.15);
  this.barrier(34.2,18.4,.36,1.45);
  const smallStart=fixture==="slot-small"?V(25.5,10.0):
   fixture==="haul"?V(9.6,10.6):V(8.5,10.6);
  const bulkyStart=["slot-bulky","slot-open-bulky"].includes(fixture)?
   V(25.5,10.0):V(9.8,15.6);
  const toolStart=V(8.8,18.6);
  this.small=this.spawn("small",smallStart);
  this.bulky=this.spawn("bulky",bulkyStart);
  this.tool=this.spawn(fixture==="rigid-tool"?"rigid-lever":"lever",toolStart);
  this.small.maxSpeedOverride=2.0;
  this.bulky.maxSpeedOverride=1.55;
  this.tool.maxSpeedOverride=1.8;
  // Real independent loads. Action verbs arise from body contacts & geometry.
  this.handLoad=this.load(fixture==="haul"?11.15:12.0,10.6,.48,.42,42);
  this.massLoad=this.load(13.8,15.4,.68,.52,90);
  this.toolLoad=this.load(11.70,19.35,.46,.4,32);
  this.farLoad=this.load(33.0,10.05,.65,.49,52);
  this.miscLoad=this.load(24.1,18.1,.6,.5,44);
  if(fixture.startsWith("slot-")){
   const active=fixture==="slot-small"?this.small:this.bulky;
   // Real physically mass+impulse+speed matched comparisons; only
   // collision ENVELOPE differs in the controlled slot comparison.
   active.shapes[0].collider.setMass(90);
   active.motor=650;
   active.maxSpeedOverride=1.65;
   this.setSelected(active.id);
  }else this.setSelected(this.small.id);
  if(fixture==="slot-open-bulky")this.openSlot();
  this.world.propagateModifiedBodyPositionsToColliders();
 }
 aperture(){
  const upperEdge=this.slot.upper.body.translation().y+
   this.slot.upper.shapes[0].shape.hy;
  const lowerEdge=this.slot.lower.body.translation().y-
   this.slot.lower.shapes[0].shape.hy;
  return {highWallEdge:rnd(upperEdge),lowWallEdge:rnd(lowerEdge),
   width:rnd(lowerEdge-upperEdge)};
 }
 openSlot(){
  // Authored physical collider translation, not a game win flag or pass hack.
  const e=this.slot.lower,p=e.body.translation();
  if(!this.moveEntity(e,V(p.x,p.y+1.30)))return false;
  this.materialEvents.edits++;
  return true;
 }
 toggleContactGrip(actor=this.chosen,load=null,maxImpulse=4){
  if(!actor)return {ok:false,reason:"no actor selected"};
  if(this.grips.some(g=>g.actor===actor)){
   const ok=this.release(actor.id);
   if(ok)this.materialEvents.manualReleases++;
   return {ok,kind:"release"};
  }
  const contacts=this.loads.map(item=>({item,hit:this.actualContact(actor,item)}))
   .filter(x=>x.hit).sort((a,b)=>b.hit.impulse-a.hit.impulse);
  const target=load||contacts[0]?.item;
  if(!target)return {ok:false,reason:"contact required, not nearest-object magnet"};
  const result=this.grip(actor.id,target.id,{maxImpulse});
  if(result.ok)this.materialEvents.manualGrips++;
  return {...result,kind:"acquire",loadId:target.id};
 }
 trace(){
  const t=this.commonsTrace();
  const body=e=>({id:e.id,kind:e.kind,
   x:rnd(e.body.translation().x),y:rnd(e.body.translation().y),
   vx:rnd(e.body.linvel().x),vy:rnd(e.body.linvel().y),
   theta:rnd(e.body.rotation()),omega:rnd(e.body.angvel()),
   mass:rnd(e.body.mass()),stance:e.stance||null,
   panel:e.panel?{
    x:rnd(e.panel.body.translation().x),y:rnd(e.panel.body.translation().y),
    theta:rnd(e.panel.body.rotation())}:null});
  return {fixture:this.fixture,tick:this.ticks,finite:t.finite,
   source:this.source,selected:this.selected,auto:this.auto,
   aperture:this.aperture(),actors:this.actors.map(body),
   cargo:this.loads.map(body),
   gate:{angle:t.gateAngle,contacts:t.events.gateContacts},
   grips:this.grips.map(g=>({actor:g.actor.id,load:g.load.id,
    stretch:rnd(g.stretch),impulse:rnd(g.totalImpulse)})),
   gripEvidence:t.gripEvidence,
   materialEvents:{...this.materialEvents},
   rootEffort:rnd(t.events.rootEffort),
   terrainImpulse:rnd(t.events.terrainLinearImpulse),
   panelImpulse:rnd(t.events.panelTorque),
   gateImpulse:rnd(t.events.gateImpulse),
   worldEntities:this.entities.length};
 }
}
export function makeMaterialWorkshop(options={}){return new MaterialWorkshop(options);}
