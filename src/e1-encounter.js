// E1: one editable shared-world initiative candidate — deliberately a TEMPORARY
// M0/Rapier2D physical donor, not a selected body, engine or NPC brain.
// No globally authored routes, no goal coordinates fed to actors, no teleport,
// no force applied directly to nonselected matter or contact resolution hacks.
// Only tagged REAL free material bodies emit LOCAL scalar 'odor' cues.
// Organisms decide from limited-distance cue positions, immediate proximity,
// actual prior-solver contact and a short-lived local alarm; movement remains
// a finite EXTERNAL PLANAR ROOT-TRACTION PROXY (not grounded feet).
import {M0Field,V,DT} from "./m0-world.js";
const cap=(x,a,b)=>Math.min(b,Math.max(a,x));
const norm=(v)=>Math.hypot(v.x,v.y);
const wrap=(a)=>Math.atan2(Math.sin(a),Math.cos(a));
const unit=(v)=>{const n=norm(v);return n>1e-8?V(v.x/n,v.y/n):V();};
const delta=(a,b)=>V(b.x-a.x,b.y-a.y);
const roles=["seeker","wary","holder"];
const properties={
 seeker:{sensor:9.5,pressure:8,power:.90,near:.85},
 wary:{sensor:8.4,pressure:5,power:.87,near:1.20},
 holder:{sensor:7.2,pressure:11,power:.76,near:1.60}
};
const round=(x)=>Math.round(x*1e3)/1e3;
export class EncounterField extends M0Field{
 constructor({initiative=true,pressureResponse=true,reflex=true,
   populated=true,seed=31}={}){
  super({empty:true,reflex});
  this.initiative=initiative;
  this.pressureResponse=pressureResponse;
  this.seed=seed;
  this.cues=[];
  this.episodes={sensing:0,steering:0,contactReactions:0,cueChanges:0};
  this.crowdPeak=0;
  if(populated)this.populate();
 }
 addCreature(kind,point,role="seeker"){
  if(!roles.includes(role))throw RangeError("Role");
  const a=this.addActor(kind,point);
  const n=parseInt(a.id.replace(/\D/g,""),10);
  a.role=role;
  a.motive={heading:((n*2.399+this.seed*.27)%(Math.PI*2)),
   direction:V(),attention:null,alarm:0,alarmFrom:V(),lastContact:0,
   senseEvents:0,steerEvents:0,reactEvents:0,
   status:"rozgląda się",lastOdorDist:null,chosenCue:null};
  a.autoMotorTicks=0;
  a.autoImpulse=0;
  return a;
 }
 addScent(point,signature="amber",strength=1){
  if(!["amber","cyan"].includes(signature)||!Number.isFinite(strength)||strength<.1)
   throw RangeError("Odor");
  // A source is a genuine movable 6kg free collider — not a graphical anchor.
  const body=this.addFree(point.x,point.y,.34,.30,6);
  const obj=this.objects[this.objects.length-1];
  obj.signature=signature;obj.strength=strength;obj.isScent=true;
  obj.index=this.cues.length;
  this.cues.push(obj);
  return obj;
 }
 populate(){
  // A COMMON place, not separate fixtures or routes. The central two static
  // pillars delimit a 4.4m gap, but there is no programmed traversal.
  this.addFixed(21,6.55,.38,5.0);
  this.addFixed(21,20.45,.38,4.5);
  this.addFixed(11.9,6.5,1.4,.31);
  this.addFixed(34.8,20.7,1.3,.30);
  for(const [x,y,hx,hy,mass] of [
   [17.1,13.4,.53,.6,68],
   [26.5,12.3,.55,.62,86],
   [14.8,21.0,.65,.42,43],
   [28.9,5.4,.88,.30,72]
  ])this.addFree(x,y,hx,hy,mass);
  // Movable odor sources can be pushed through a choke or brought to a crowd.
  for(const [x,y,color] of [[12.5,13.2,"amber"],[30.2,14.4,"cyan"],
    [28.3,8.4,"amber"],[10.5,20.8,"cyan"]]){
   this.addScent(V(x,y),color,1);
  }
  const initial=[
   ["chain",6.6,11.0,"seeker"],["rigid",7.2,13.4,"holder"],
   ["compliant",8.7,16.0,"wary"],["chain",12.7,8.9,"seeker"],
   ["rigid",14.2,16.3,"wary"],["compliant",14.4,19.3,"holder"],
   ["chain",17.7,10.0,"wary"],["rigid",17.2,18.6,"holder"],
   ["compliant",19.5,16.9,"seeker"],
   ["rigid",26.1,10.3,"seeker"],["compliant",25.4,17.2,"wary"],
   ["chain",28.2,19.4,"holder"],["rigid",31.7,12.6,"holder"],
   ["compliant",34.4,16.9,"seeker"],["chain",35.5,9.2,"wary"],
   ["rigid",37.2,14.2,"wary"],["chain",31.8,22.6,"seeker"],
   ["compliant",8.5,21.0,"seeker"]
  ];
  for(const [kind,x,y,role] of initial)this.addCreature(kind,V(x,y),role);
  this.select(null); // physically autonomous set, operator can seize any body
 }
 setRole(id,role){
  const a=this.actors.find(x=>x.id===id);
  if(!a||!roles.includes(role))return false;
  a.role=role;
  if(a.motive){a.motive.status="zmiana zachowania";a.motive.alarm=0;}
  return true;
 }
 reseedRoles(){ // diagnostic only: same physical bodies, swap role assignment
  for(let i=0;i<this.actors.length;i++){
   const a=this.actors[i];
   a.role=roles[(i*2+1)%3];a.motive.alarm=0;
  }
 }
 cueAt(index){return this.cues[index]?.body.translation()??null;}
 // NO hidden navigation. Agent reads ONLY current local cue positions and
 // other body roots inside range; fixed walls may physically stop it.
 sense(a){
  const m=a.motive,here=a.root.translation();
  const profile=properties[a.role]||properties.seeker;
  let closest=null,best=Infinity;
  const preference=(a.role==="holder"?"amber":
    a.role==="wary"?"cyan":((parseInt(a.id.replace(/\D/g,""),10)%2)?"amber":"cyan"));
  for(const cue of this.cues){
   if(cue.signature!==preference)continue;
   const point=cue.body.translation(),d=Math.hypot(point.x-here.x,point.y-here.y);
   if(d>profile.sensor||d>=best)continue;
   closest=cue;best=d;
  }
  let away=V(),count=0,near=Infinity,first=null;
  // Only neighbors in local scope, never global crowd center/target.
  for(const other of this.actors){
   if(other===a)continue;
   const p=other.root.translation();
   const rel=delta(p,here),dist=Math.max(norm(rel),.15);
   if(dist>3.8)continue;
   count++;
   if(dist<near){near=dist;first=other;}
   if(dist<2.9){
    const w=1/(.6+dist*dist);
    away.x+=rel.x/dist*w;away.y+=rel.y/dist*w;
   }
  }
  m.chosenCue=closest?closest.index:null;
  m.attention=closest?V(closest.body.translation().x,closest.body.translation().y):null;
  m.lastOdorDist=Number.isFinite(best)?best:null;
  m.neighborCount=count;
  m.nearBody=first?.id??null;
  m.away=unit(away);
  m.senseEvents++;this.episodes.sensing++;
  return m;
 }
 think(a){
  const m=a.motive,p=a.root.translation(),role=a.role;
  const prof=properties[role]||properties.seeker;
  // Evidence is delayed one solver step. No future collision knowledge.
  const actualPressure=a.pressure;
  const contact=actualPressure>prof.pressure;
  const previous=m.status;
  if(this.pressureResponse&&contact){
   m.alarm=role==="holder"?18:role==="wary"?95:45;
   m.alarmFrom=m.neighborCount?m.away:unit(V(-a.root.linvel().x,-a.root.linvel().y));
   if(this.ticks-m.lastContact>14){
    m.reactEvents++;this.episodes.contactReactions++;
   }
   m.lastContact=this.ticks;
  }
  if(m.alarm>0)m.alarm--;
  const odor=m.attention?delta(p,m.attention):null;
  const distance=odor?norm(odor):Infinity;
  // Deterministic correlated free exploration, not a baked waypoint path.
  let targetAngle=m.heading+
    Math.sin(this.ticks*.015+a.motive.senseEvents*.09+
      parseInt(a.id.replace(/\D/g,""),10)*1.7)*.11;
  let effort=.33;
  let status="szuka lokalnego bodźca";
  if(odor){
   targetAngle=Math.atan2(odor.y,odor.x);
   effort=distance<prof.near ? .09 : .88;
   status=distance<prof.near?"bada źródło":"zbliża się";
  }
  // Pressure responses cause *a change of command*, never contact forces
  // injected directly into another body. Disabled pressure response is a
  // literal control condition, not a separate solver.
  if(this.pressureResponse&&m.alarm>0){
   if(role==="wary"){
    const escape=m.alarmFrom;
    if(norm(escape)>.03){targetAngle=Math.atan2(escape.y,escape.x);effort=1.1;status="ustępuje po nacisku";}
   }else if(role==="holder"){
    // Try to remain at the sniffed place through a finite ROOT TRACTION PROXY.
    // This is not actual physically grounded defensive stance.
    if(odor&&distance>1){targetAngle=Math.atan2(odor.y,odor.x);effort=1.0;}
    else effort=.03;
    status="utrzymuje miejsce (proxy)";
   }else{
    const side=V(-m.alarmFrom.y,m.alarmFrom.x);
    if(norm(side)>.03){targetAngle=Math.atan2(side.y,side.x);effort=.70;status="obchodzi kontakt";}
   }
  }
  if(role==="wary"&&m.neighborCount>2&&m.alarm===0){
   const away=m.away;
   if(norm(away)>.2){
    targetAngle=Math.atan2(away.y,away.x);
    effort=.67;status="omija tłok";
   }
  }
  // Bounded angular change for legible local turns.
  const rotation=cap(wrap(targetAngle-m.heading),-.055,.055);
  m.heading=wrap(m.heading+rotation);
  m.direction=V(Math.cos(m.heading)*effort,Math.sin(m.heading)*effort);
  m.status=status;
  if(previous!==status){m.steerEvents++;this.episodes.steering++;}
  return m.direction;
 }
 motor(a,dir){
  const d=unit(dir),len=norm(dir);
  if(len<.02)return;
  const body=a.root,v=body.linvel(),prof=properties[a.role]||properties.seeker;
  // EXACT SAME transparent top-down root-force proxy class as the M0 donor.
  const capSpeed=a.form.speed*prof.power*cap(len,0,1);
  const goal=V(d.x*capSpeed,d.y*capSpeed);
  const mass=body.mass(),change=V((goal.x-v.x)*mass,(goal.y-v.y)*mass);
  const length=norm(change),step=a.form.motor*DT;
  const scale=length>0?Math.min(1,step/length):0;
  const impulse=V(change.x*scale,change.y*scale);
  if(!Number.isFinite(impulse.x)||!Number.isFinite(impulse.y))
   throw Error("Nonfinite initiative motor command");
  body.applyImpulse(impulse,true);
  a.autoMotorTicks++;a.autoImpulse+=norm(impulse);
  a.motorTicks++;a.thrustImpulse+=norm(impulse);
 }
 step({direction=V(),aim=null}={}){
  if(this.initiative){
   for(const a of this.actors){
    if(a.id===this.selected)continue; // manual seizure removes AI control
    if(!a.motive)continue;
    if(this.ticks%9===0||a.motive.senseEvents===0)this.sense(a);
    const command=this.think(a);
    this.motor(a,command);
   }
  }
  super.step({direction,aim});
  this.crowdPeak=Math.max(this.crowdPeak,this.contactPairs);
 }
 getTrace(){
  return {tick:this.ticks,initiative:this.initiative,
   pressureResponse:this.pressureResponse,
   totalContactPairs:this.contactPairs,crowdPeak:this.crowdPeak,
   reflexEvents:this.reflexEvents,actorCount:this.actors.length,
   cueCount:this.cues.length,episodes:{...this.episodes},
   actors:this.actors.map(a=>{
    const r=a.root.translation(),m=a.motive;
    return {id:a.id,kind:a.kind,role:a.role,x:round(r.x),y:round(r.y),
      pressure:round(a.pressure),autonomousTicks:a.autoMotorTicks,
      autoImpulse:round(a.autoImpulse),state:m?.status??"nie ma sterownika",
      sensed:m?.chosenCue??null,neighborCount:m?.neighborCount??0,
      reactions:m?.reactEvents??0};
   }),
   cues:this.cues.map(c=>({index:c.index,color:c.signature,
     x:round(c.body.translation().x),y:round(c.body.translation().y)}))};
 }
}
