// P4 research rival, not a merged patch: physically central grip force
// removes unconstrained tangential two-point damping that may leak angular
// momentum. This is a compliant *axial tether*, NOT a hand/weld.
import {TransportYard} from "./p2-world.js";
import {V,DT} from "./p0-world.js";
const d=(a,b)=>V(a.x-b.x,a.y-b.y);
const sc=(p,s)=>V(p.x*s,p.y*s);
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const clamp=(x,a,b)=>Math.max(a,Math.min(x,b));
function at(b,p){
 const x=b.translation(),q=b.rotation(),c=Math.cos(q),s=Math.sin(q);
 return V(x.x+c*p.x-s*p.y,x.y+s*p.x+c*p.y);
}
function vel(b,p){
 const x=b.translation(),v=b.linvel(),w=b.angvel();
 return V(v.x-w*(p.y-x.y),v.y+w*(p.x-x.x));
}
export function applyAxialGrips(w){
 for(const g of [...w.grips]){
  const a=g.holder.body,b=g.load.body;
  const pa=at(a,g.anchorA),pb=at(b,g.anchorB);
  const e=d(pa,pb),R=Math.hypot(e.x,e.y);
  g.stretch=R;
  w.gripEvidence.peakStretch=Math.max(w.gripEvidence.peakStretch,R);
  if(R>w.gripBreakDistance){
   w.grips.splice(w.grips.indexOf(g),1);w.gripEvidence.breaks++;continue;
  }
  if(R<1e-8)continue;
  const u=sc(e,1/R),v=d(vel(a,pa),vel(b,pb));
  // Same spring constants and peak impulse as P2; only the tangential
  // component is removed. Positive or negative (compression) along axis.
  const jsc=clamp((w.gripStiffness*R+
    w.gripDamping*dot(v,u))*DT,-g.maxImpulse,g.maxImpulse);
  if(Math.abs(jsc)<1e-8)continue;
  const j=sc(u,jsc);
  a.applyImpulseAtPoint(sc(j,-1),pa,true);
  b.applyImpulseAtPoint(j,pb,true);
  const magnitude=Math.abs(jsc);
  g.totalImpulse+=magnitude;w.gripEvidence.appliedPairs++;
  w.gripEvidence.pairedImpulseSum+=magnitude;
  w.gripEvidence.holderImpulseX-=j.x;
  w.gripEvidence.holderImpulseY-=j.y;
  w.gripEvidence.loadImpulseX+=j.x;
  w.gripEvidence.loadImpulseY+=j.y;
 }
}
function withAxial(fn){
 const saved=TransportYard.prototype.applyGrips;
 TransportYard.prototype.applyGrips=function(){applyAxialGrips(this);};
 try{return fn();}finally{TransportYard.prototype.applyGrips=saved;}
}
export async function p4AxialDonorRegression(){
 // Same independent source world construction and no/root/grip test
 // protocols as P2/P3, reused verbatim; only link-force law changed.
 const [{p2Probe,p2SpeedRedTeam},{p3Probe}]=await Promise.all([
  import("./p2-probe.js"),import("./p3-duel.js")
 ]);
 const baselineP2=p2Probe(),baselineP3=p3Probe();
 const variant=withAxial(()=>({
  p2:p2Probe(),p3:p3Probe(),speed:p2SpeedRedTeam()
 }));
 if(variant.p2.cases!==12||variant.p3.cases!==24||variant.speed.cases!==24)
  throw Error("P4 axial regression number of actual source worlds");
 const comparisons=[];
 for(const a of baselineP2.results){
  const b=variant.p2.results.find(x=>x.kind===a.kind&&
   x.support===a.support&&x.grip===a.grip);
  if(!b||!b.finite)throw Error("Axial missing physical A/B case");
  comparisons.push({kind:a.kind,support:a.support,grip:a.grip,
   oldDX:a.cargoDXAfterPull,axialDX:b.cargoDXAfterPull,
   oldBreak:a.gripBreaks,axialBreak:b.gripBreaks,
   oldImpulse:a.actualGripImpulse,axialImpulse:b.actualGripImpulse});
 }
 const contest=[];
 for(const a of baselineP3.results){
  const b=variant.p3.results.find(x=>x.support===a.support&&
   x.leftKind===a.leftKind&&x.mode===a.mode);
  if(!b||!b.finite)throw Error("Axial missing physical P3 world");
  contest.push({support:a.support,kind:a.leftKind,mode:a.mode,
   oldCargoX:a.cargoAfter,axialCargoX:b.cargoAfter,
   oldLinks:a.activeEnd,axialLinks:b.activeEnd,
   oldBreaks:a.breaks,axialBreaks:b.breaks});
 }
 return {
  description:"Non-promoting source donor A/B: original P2/P3 vector-grip vs central axial-only compliant coupling",
  law:"same k,damping,max impulse, same source world and operator controls, remove only transverse force component",
  actuallySimulatedPhysicalWorlds:12+24+12+24+24,
  p2:comparisons,p3:contest,speedMatchedAxial:variant.speed.comparisons,
  limitation:"An axial elastic tether is not physical fingers or carrying grip; even if it works, it may lose different angular control or feel. No Owner verdict."
 };
}
