// Bounded *unscripted material pressure* exploration. Disturb many freely
// colliding real bodies using only outside-of-organism impulses and actual
// body joint inputs. No route, task, target, success or crowd steering AI.
const v=(x,y)=>({x,y});
const rot=(point,angle)=>v(point.x*Math.cos(angle)-point.y*Math.sin(angle),
  point.x*Math.sin(angle)+point.y*Math.cos(angle));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function rng(seed){
  let n=seed>>>0;
  return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};
}
export function disturbedWorldCampaign(Field){
 const results=[];
 const regimes=[
   ...[101,503,997,2017].map(seed=>({seed,solverIterations:12})),
   ...[101,2017].map(seed=>({seed,solverIterations:24}))
 ];
 for(const {seed,solverIterations} of regimes){
   const random=rng(seed),field=new Field({empty:true,solverIterations});
   try{
     for(let i=0;i<16;i++){
       const x=10.5+(i%4)*2.25+(random()-.5)*.7;
       const y=6.5+Math.floor(i/4)*2.8+(random()-.5)*.6;
       const kind=i%3===1?"ram":"pincer";
       const body=field.spawn(kind,v(x,y),random()*6.28318);
       if(kind==="pincer"){
         const reach=[.94,1.53,2.31][i%3];
         field.setClawReach(body.id,reach);
         field.setClawTorque(body.id,[150,780,1450][i%3]);
         field.setArmAperture(body.id,0,random());
         field.setArmAperture(body.id,1,random());
       }
     }
     for(let i=0;i<12;i++){
       field.addBox({x:11+random()*11,y:6+random()*12,
         hx:.25+random()*.85,hy:.25+random()*.65,
         mass:[12,80,270,1500][i%4]},false);
     }
     field.addGate({x:8,y:12,length:2.8,mass:82},false);
     field.addGate({x:26.7,y:13,length:3.0,mass:110},false);
     let peakJointDrift=0,peakGateDrift=0;
     let contactTicks=0,highContactTicks=0,peakContact=0;
     let disruptions=0,peakMotion=0,nonfinite=0;
     const fixedStart=field.matter.map(o=>({x:o.body.translation().x,
       y:o.body.translation().y}));
     const impulsesBefore=field.ticks;
     for(let t=0;t<540;t++){
       if(t%43===0){
         const items=field.actors.flatMap(a=>a.arms.length?
           [...a.arms.map(q=>({body:q.body,which:"arm"})),{body:a.root,which:"trunk"}]:
           [{body:a.root,which:"trunk"}])
          .concat(field.matter.map(m=>({body:m.body,which:m.type})));
         const target=items[Math.floor(random()*items.length)];
         const p=target.body.translation();
         const ang=random()*6.28318,impulse=130+random()*440;
         const result=field.pokeAt(v(p.x,p.y),
           v(Math.cos(ang)*impulse,Math.sin(ang)*impulse));
         if(result)disruptions++;
       }
       if(t%61===0){
         for(const a of field.actors){
           if(a.kind!=="pincer")continue;
           field.setArmAperture(a.id,0,random());
           field.setArmAperture(a.id,1,random());
         }
       }
       field.step();
       const active=field.contactReadout.count;
       peakContact=Math.max(peakContact,active);
       if(active)contactTicks++;
       if(active>4)highContactTicks++;
       for(const a of field.actors){
         for(const b of new Set(a.parts.map(p=>p.body))){
           const p=b.translation(),angle=b.rotation();
           if(!Number.isFinite(p.x+p.y+angle+b.linvel().x+b.linvel().y))
             nonfinite++;
           peakMotion=Math.max(peakMotion,Math.hypot(b.linvel().x,b.linvel().y));
         }
         if(a.kind==="pincer"){
           const root=a.root.translation(),angle=a.root.rotation();
           for(const arm of a.arms){
             const parent=rot(v(.39,arm.sign*.72),angle);
             const child=rot(v(-.72,0),arm.body.rotation());
             const pointParent=v(root.x+parent.x,root.y+parent.y);
             const q=arm.body.translation();
             const pointChild=v(q.x+child.x,q.y+child.y);
             peakJointDrift=Math.max(peakJointDrift,dist(pointParent,pointChild));
           }
         }
       }
       for(const gate of field.gates){
         const p=gate.body.translation();
         const offset=rot(v(-gate.length/2,0),gate.body.rotation());
         peakGateDrift=Math.max(peakGateDrift,
           dist(v(p.x+offset.x,p.y+offset.y),gate.pivot));
       }
     }
     let moved=0;
     for(let i=0;i<field.matter.length;i++){
       if(dist(field.matter[i].body.translation(),fixedStart[i])>.15)moved++;
     }
     if(nonfinite)throw Error("nonfinite solver under free physical pressure, seed "+seed);
     results.push({seed,solverIterations,actors:field.actors.length,matter:field.matter.length,
       steps:field.ticks-impulsesBefore,contactTicks,highContactTicks,
       peakContactIncidences:peakContact,independentImpulses:disruptions,
       movedMatter:moved,peakJointDrift:+peakJointDrift.toFixed(4),
       peakGateDrift:+peakGateDrift.toFixed(4),
       peakSpeed:+peakMotion.toFixed(3)});
   }finally{field.dispose();}
 }
 return {disclosure:"external impulses simulate Owner interventions, NOT organism autonomy or FPS",results};
}
