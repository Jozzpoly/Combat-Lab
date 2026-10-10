// M0 falsifier: does a cheap solid body with similar total mass and broad
// projected envelope reproduce the compliant body's collision afterstate?
// Deliberately NOT geometrically exact: real bead ring has gaps and a dynamic
// center-of-mass distribution, while surrogate is a solid rectangle.
import {M0Field,V} from "./m0-world.js";
const rd=x=>Math.round(x*1e4)/1e4;
function run({kind,offset,action}){
 const w=new M0Field({empty:true,reflex:false});
 try{
  const a=w.addActor(kind==="solid"?"rigid":"compliant",V(12,12));
  if(kind==="solid"){
   // 30 + 7*11 = 107 kg compliant total.
   a.parts[0].collider.setHalfExtents(V(1.16,1.16));
   a.parts[0].collider.setMass(107);
   a.parts[0].shape={type:"box",hx:1.16,hy:1.16};
   a.form={...a.form,motor:550,speed:2.5};
   w.world.propagateModifiedBodyPositionsToColliders();
  }
  const b=w.addActor("rigid",V(18,12+offset));
  const start=a.root.translation(),second=b.root.translation();
  const before={a:V(start.x,start.y),b:V(second.x,second.y)};
  if(action==="poke"){
   w.select(null);
   if(!w.poke(V(12,12),V(660,0)))throw Error("No real physical source for poke");
  } else w.select(a.id);
  let contacts=0,first=null,total=0,peak=0;
  for(let i=0;i<330;i++){
   w.step({direction:action==="drive"&&i<230?V(1,0):V()});
   let impulse=0;
   for(const p of a.parts)for(const q of b.parts)
    w.world.contactPair(p.collider,q.collider,m=>{
     for(let j=0;j<m.numSolverContacts();j++)
      impulse+=Math.abs(m.contactImpulse(j)||0);
    });
   if(impulse>0){contacts++;if(first===null)first=i;}
   total+=impulse;peak=Math.max(peak,impulse);
  }
  const end=a.root.translation(),other=b.root.translation();
  return {kind,offset,action,massKg:107,contacts,firstTouch:first,
   sourceMotorTicks:a.motorTicks,externalImpulse:rd(w.externalImpulse),
   directImpulseIntegral:rd(total),maxStepImpulse:rd(peak),
   moverDX:rd(end.x-before.a.x),secondDX:rd(other.x-before.b.x),
   secondDY:rd(other.y-before.b.y)};
 }finally{w.dispose();}
}
export function fairM0(){
 const cases=[];
 for(const offset of [-.8,0,.8])
  for(const action of ["drive","poke"])
   for(const kind of ["compliant","solid"])
    cases.push(run({kind,offset,action}));
 if(cases.some(x=>!Number.isFinite(x.directImpulseIntegral)||!Number.isFinite(x.secondDX)))
  throw Error("Nonfinite fair-pressure comparison");
 return {scope:"107kg compliant 7-bead+hub versus 107kg contiguous rigid 2.32×2.32m envelope; same root motor force/speed or 660 N·s external point impulse; three prescribed offsets, 330 physical steps. Distinct mass distribution and solid-vs-gapped contact remain confounds.",
 cases,warning:"Improved but not exact surrogate. Different duration/impulses cannot prove gameplay superiority, grounded locomotion or continuous tissue; use to reject overclaim."};
}
