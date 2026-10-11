// P4 forensic source conservation test: P2 grip may apply tangential
// damping at two NONCOINCIDENT anchors after stretching, violating global
// angular momentum unless a physical couple/constraint reaction exists.
// This test does NOT decide gameplay or imply all grips are invalid.
import {ReflexYard} from "./p4-reflex.js";
import {V,DT} from "./p0-world.js";
const v=(x,y)=>({x,y});
const d=(a,b)=>v(a.x-b.x,a.y-b.y);
const plus=(a,b)=>v(a.x+b.x,a.y+b.y);
const sc=(a,s)=>v(a.x*s,a.y*s);
const len=x=>Math.hypot(x.x,x.y);
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const cross=(a,b)=>a.x*b.y-a.y*b.x;
const r=x=>Math.round(x*1e6)/1e6;
function anchor(b,local){
 const a=b.rotation(),c=Math.cos(a),s=Math.sin(a),p=b.translation();
 return v(p.x+c*local.x-s*local.y,p.y+s*local.x+c*local.y);
}
function velAt(b,p){
 const o=b.translation(),u=b.linvel(),w=b.angvel();
 return v(u.x-w*(p.y-o.y),u.y+w*(p.x-o.x));
}
function balance(bodies){
 let px=0,py=0,L=0,K=0;
 for(const b of bodies){
  const p=b.translation(),u=b.linvel(),m=b.mass(),w=b.angvel(),I=b.principalInertia();
  px+=m*u.x;py+=m*u.y;
  L+=cross(p,sc(u,m))+I*w;
  K+=.5*m*dot(u,u)+.5*I*w*w;
 }
 return {px,py,L,K};
}
function centralForceOnly(w){
 for(const g of [...w.grips]){
  const a=g.holder.body,b=g.load.body,pa=anchor(a,g.anchorA),pb=anchor(b,g.anchorB),
   e=d(pa,pb),R=len(e);
  if(R> w.gripBreakDistance){w.grips.splice(w.grips.indexOf(g),1);continue;}
  if(R<1e-9)continue;
  const u=sc(e,1/R),relative=d(velAt(a,pa),velAt(b,pb));
  const intensity=Math.max(-g.maxImpulse,Math.min(g.maxImpulse,
   w.gripStiffness*DT*R+w.gripDamping*DT*dot(relative,u)));
  const j=sc(u,intensity);
  a.applyImpulseAtPoint(sc(j,-1),pa,true);
  b.applyImpulseAtPoint(j,pb,true);
 }
}
export function p4ConservationCase({model="legacy",pulse="tangent",steps=300}={}){
 const w=new ReflexYard({populated:false,support:"none"});
 try{
  const a=w.spawn("small",V(8.95,12));
  const cargo=w.load(10,12,.48,.42,45);
  w.selected=null;
  let contacted=false;
  for(let i=0;i<140;i++){
   w.command(a,V(1,0));w.step();
   if(w.actualContact(a,cargo)){contacted=true;break;}
  }
  if(!contacted)throw Error("No actual conservation source contact");
  const startLoad={...cargo.body.translation()};
  const out=w.grip(a.id,cargo.id,{maxImpulse:8});
  if(!out.ok||Math.hypot(cargo.body.translation().x-startLoad.x,
   cargo.body.translation().y-startLoad.y)>1e-8)throw Error("Conservation grip false");
  // Authored but *identical* PRE-INTERVENTION initial rest; no poses are
  // moved; finite measured external body impulses happen afterward.
  for(const b of [a.body,cargo.body]){
   b.setLinvel(V(),true);b.setAngvel(0,true);
  }
  w.gripBreakDistance=100; // FORENSIC only, prevents censoring any torque leak.
  if(model==="central")w.applyGrips=()=>centralForceOnly(w);
  if(model==="off"){w.grips.length=0;}
  const cp=cargo.body.translation();
  const J=pulse==="tangent"?V(0,90):pulse==="diagonal"?V(65,70):V(0,-90);
  const point=V(cp.x+.22,cp.y+.3);
  // One explicit, exactly same known operator impulse. Its angular impulse
  // is fully included in the starting conservation baseline.
  cargo.body.applyImpulseAtPoint(J,point,true);
  const bodies=[a.body,cargo.body],before=balance(bodies),history=[{tick:0,...before}];
  let peakL=0,peakP=0;
  for(let i=0;i<steps;i++){
   w.step();
   const after=balance(bodies);
   peakL=Math.max(peakL,Math.abs(after.L-before.L));
   peakP=Math.max(peakP,Math.hypot(after.px-before.px,after.py-before.py));
   if([0,9,39,99,199,steps-1].includes(i))history.push({tick:i+1,...after});
  }
  const after=balance(bodies);
  return {model,pulse,sourceContact:out.contact,
   externalImpulse:J,steps,initial:before,terminal:after,
   angularDrift:r(after.L-before.L),peakAngularDrift:r(peakL),
   linearDrift:r(Math.hypot(after.px-before.px,after.py-before.py)),
   peakLinearDrift:r(peakP),energyChange:r(after.K-before.K),
   actualGripAttached:w.grips.length,finite:w.traces().finite,
   history};
 }finally{w.dispose();}
}
export function p4ConservationAudit(){
 const results=[];
 for(const pulse of ["tangent","diagonal","reverse"])
  for(const model of ["off","legacy","central"])
   results.push(p4ConservationCase({pulse,model}));
 if(results.length!==9||results.some(x=>!x.finite||x.sourceContact<1))
  throw Error("Conservation probe source invalid");
 return {cases:results.length,results,
  explanation:"true Rapier 2D, only two dynamic bodies, zero world gravity/terrain, no motor after authored initial rest; conserved angular+linear system momentum post external impulse",
  caveats:"Fixed P0 gate/walls elsewhere remain uncontacted, not measured by this budget; finite solver tolerances; central-only axial spring is rope-like and NOT hand/weld. This is a falsifier, not proposed final joint design."};
}
