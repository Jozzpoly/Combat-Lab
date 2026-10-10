// K1: Distinguish an actual *chosen limb configuration* from mere root
// driving into matter. All bodies use the same finite Rapier collision solver.
// Scope: deliberately authored encounter, not self-initiated NPC strategy.
import {V,norm} from "./x0-world.js";
const r=n=>+n.toFixed(4),delta=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
function scenario(World,{kind="open",offset=0,powered=true}={}){
 const w=new World({empty:true});
 try{
  for(const [x,y,hx,hy] of [[16.5,8.8,12,.25],[16.5,17.2,12,.25]])
    w.addWall(V(x,y),{hx,hy,created:false});
  // A fairer static alternative than a tiny no-arm root: the long rigid hull
  // carries roughly the same total collider mass and longitudinal envelope.
  const rigid=kind==="rigid";
  const defender=w.addActor("reach",V(17,13),Math.PI,{
    mass:rigid?180:130,hx:rigid?2.55:.62,hy:rigid?.88:.60,
    motor:0,brace:2600,torque:650,arms:rigid?0:2,armLength:2.4});
  defender.control="quiet";
  defender.target=kind==="folded"?[0,0]:[1,1];
  const challenger=w.addActor("bulk",V(9.5,13+offset),0,{
    mass:96,motor:powered?1450:0,speed:2.2,hx:.62,hy:.45,brace:0});
  const protectedLoad=w.addMatter(V(20.7,13),{
    mass:45,hx:.42,hy:.38,created:false});
  w.select(challenger.id);
  const startTarget=protectedLoad.body.translation(),startShield=defender.root.translation();
  const startChallenger=challenger.root.translation();
  let shieldContacts=0,limbContacts=0,rootContacts=0,impulse=0,first=null,firstLoad=null;
  for(let tick=0;tick<270;tick++){
   w.step({manual:{move:powered?V(1,0):V(),aim:null}});
   let at=0;
   for(const part of defender.parts)w.world.contactPair(part.collider,
     challenger.parts[0].collider,m=>{
     for(let j=0;j<m.numSolverContacts();j++)at+=Math.abs(m.contactImpulse(j));
   });
   if(at>0){shieldContacts++;impulse+=at;if(first===null)first=tick;}
   let limb=false,root=false;
   for(const part of defender.parts){
    let contact=0;
    for(const other of challenger.parts)
      w.world.contactPair(part.collider,other.collider,m=>{
       for(let j=0;j<m.numSolverContacts();j++)
         contact+=Math.abs(m.contactImpulse(j));
      });
    if(contact>0){
     if(part.tag==="hull"||part.tag==="prow")root=true;
     else limb=true;
    }
   }
   if(limb)limbContacts++;
   if(root)rootContacts++;
   let loadImpulse=0;
   for(const part of challenger.parts)
     w.world.contactPair(part.collider,protectedLoad.collider,m=>{
       for(let j=0;j<m.numSolverContacts();j++)
         loadImpulse+=Math.abs(m.contactImpulse(j));
     });
   if(loadImpulse>0&&firstLoad===null)firstLoad=tick;
  }
  const end=challenger.root.translation(),def=defender.root.translation(),load=protectedLoad.body.translation();
  if(w.holdEvents!==0||w.counts.driveTicks!==0)throw Error("K1 attribution includes a material magic hold or world drive");
  return {kind,offset,powered,contactSteps:shieldContacts,limbContacts,rootContacts,
    contactImpulse:r(impulse),firstShieldContact:first,firstDirectLoadContact:firstLoad,
    bodyAdvance:r(end.x-startChallenger.x),bodyEndX:r(end.x),
    guardDisplacement:r(delta(def,startShield)),
    loadDisplacement:r(delta(load,startTarget)),loadDX:r(load.x-startTarget.x),
    limbCount:defender.arms.length,braceEvents:w.counts.braces};
 }finally{w.dispose();}
}
export function postureSpaceTrial(World){
 const offsets=[-.9,-.45,0,.45,.9];
 const cases=offsets.map(offset=>{
  const open=scenario(World,{kind:"open",offset});
  const folded=scenario(World,{kind:"folded",offset});
  const rigid=scenario(World,{kind:"rigid",offset});
  return {offset,open,folded,rigid,
    postureBodyAdvanceDifference:r(open.bodyAdvance-folded.bodyAdvance),
    postureLoadDifference:r(open.loadDisplacement-folded.loadDisplacement),
    rigidAgainstOpen:r(rigid.bodyAdvance-open.bodyAdvance)};
 });
 const idle=scenario(World,{kind:"open",powered:false});
 if(idle.contactSteps||idle.firstDirectLoadContact!==null)throw Error("K1 idle baseline already touched");
 return {scope:"five prespecified lateral encounters in same narrow support-proxy corridor. Two-arm posture open/folded against approximately mass/envelope-matched rigid hull, same challenger and root input. No grip, no material motor, no NPC chosen action.",
   cases,idle,meaningfulPostureCases:cases.filter(c=>Math.abs(c.postureBodyAdvanceDifference)>.25||Math.abs(c.postureLoadDifference)>.25).length,
   limitation:"This is physical blocking/deflection under artificial top-down bracing, not grounded stance, gait, cognition or Owner feel."};
}
