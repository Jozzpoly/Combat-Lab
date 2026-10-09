// Actual emitted-browser/WASM test suite. Counts only *bounded* mechanics.
// No Owner-feel quality, life, gait, scale/FPS or natural ecology claim.
import {V,norm} from "./x0-world.js";
const close=(x,y,eps=.015)=>Math.abs(x-y)<=eps;
const check=(p,label)=>{if(!p)throw Error("X0 physical: "+label);};
function finite(w){for(const a of w.actors)for(const p of a.parts){const t=p.body.translation();if(!Number.isFinite(t.x+t.y+p.body.rotation()))return false;}for(const m of w.matter){const t=m.body.translation();if(!Number.isFinite(t.x+t.y+m.body.rotation()))return false;}return true;}
function causal(Field,trigger,{reflex=true}={}){
 const w=new Field({empty:true});try{
  const p=w.addActor("reach",V(10,12),0),b=w.addActor("bulk",V(15,12),Math.PI);
  w.addMatter(V(12.25,10.78),{mass:21,hx:.32,hy:.28,created:false});
  const obj=w.matter[0];w.select(b.id);
  // All bodies share identical geometry. Local response only on pincer.
  w.setArmReflex(p.id,reflex);
  let contact=-1,respond=-1,events=0;
  for(let t=0;t<220;t++){
   if(t===40)obj.body.applyImpulseAtPoint(V(-trigger,0),obj.body.translation(),true);
   w.step({manual:{move:V(),aim:null}});
   if(contact<0&&p.observed.load>1)contact=t;
   if(p.response.events>0&&respond<0)respond=t;
   events=p.response.events;
   if(!finite(w))throw Error("nonfinite after local stimulus");
  }
  const q=obj.body.translation(),r=p.root.translation();
  return {contact,respond,events,crate:V(q.x,q.y),
   root:V(r.x,r.y),contactCount:w.counts.contacts,reflex:w.counts.reflex,
   colliders:p.parts.length};
 }finally{w.dispose();}
}
export function runX0Probe(Field,capture,restore){
 const w=new Field();
 try{
  check(w.actors.length===4,"default world lacks heterogeneity");
  check(w.matter.some(m=>m.kind==="hinge") &&
    w.matter.some(m=>m.kind==="rail") &&
    w.matter.some(m=>m.kind==="free"),"missing real material constraint types");
  const body=w.actors.find(a=>a.form==="reach");
  check(body.arms.length===2&&body.parts.length===5,"limbs not actual rigid bodies");
  const first=w.matter.find(x=>x.kind==="free"),start=first.body.translation();
  const result=w.poke(V(start.x,start.y),V(155,92));
  check(result&&result.id===first.id,"research force did not hit actual free matter");
  for(let i=0;i<135;i++)w.step({manual:{move:V(),aim:null}});
  check(finite(w),"numerical break in authored whole world");
  const moved=norm(V(first.body.translation().x-start.x,first.body.translation().y-start.y));
  check(moved>.05,"world intervention did not move real matter");
  const hinge=w.matter.find(m=>m.kind==="hinge");
  const oldAngle=hinge.body.rotation();
  w.pose(hinge.id,V(hinge.x,hinge.y),oldAngle+1.02);
  const gp=hinge.body.translation(),an=hinge.body.rotation();
  const hingeDrift=norm(V(gp.x-hinge.x-Math.cos(an)*hinge.length/2,
    gp.y-hinge.y-Math.sin(an)*hinge.length/2));
  check(hingeDrift<.015,"hinged joint pose not about fixed real pivot");
  const recipe=capture(w);
  const reconstructed=restore(recipe);
  try{
   check(reconstructed.actors.length===w.actors.length &&
     reconstructed.matter.length===w.matter.length,"authored material state lost");
   check(reconstructed.matter.some(m=>m.kind==="rail")&&
     reconstructed.matter.some(m=>m.kind==="hinge"),"constrained matter not preserved");
   for(let i=0;i<120;i++)reconstructed.step();
   check(finite(reconstructed),"restored real joints failed after stepping");
  }finally{reconstructed.dispose();}
  let invalid=false;
  try{restore({...recipe,actors:[{form:"wrong"}]});}
  catch{invalid=true;}
  check(invalid,"malformed world recipe accepted");
  // Same exact initial matter, only the local tactile response differs.
  const variants=[65,110,185].map(power=>{
   const on=causal(Field,power,{reflex:true}),off=causal(Field,power,{reflex:false});
   check(on.respond<0||on.respond>=on.contact,
     "actuator response before actual sensor load");
   return {power,contact:on.contact,response:on.respond,
     offEvents:off.events,localEvents:on.events,
     crateContrast:+norm(V(on.crate.x-off.crate.x,on.crate.y-off.crate.y)).toFixed(4),
     rootContrast:+norm(V(on.root.x-off.root.x,on.root.y-off.root.y)).toFixed(4)};
  });
  check(variants.some(v=>v.localEvents>0 && v.crateContrast>.025),
    "all local-arm commands failed to change real matter, X0 actuation hypothesis FAIL");
  return {status:"mechanistic, NOT OWNER-QUALIFIED",defaultActors:w.actors.length,
   defaultMatter:w.matter.length,materialMoved:+moved.toFixed(4),
   hingePoseDrift:+hingeDrift.toFixed(6),portedStartScene:true,
   invalidSceneRejected:true,causalControls:variants};
 }finally{w.dispose();}
}
