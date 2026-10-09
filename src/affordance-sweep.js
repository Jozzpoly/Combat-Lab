// Does this new action generalize beyond one carefully centered light box?
// Each motorized world is compared with a null motor under SAME construction.
export function affordanceSweep(Field){
 function attempt(mass,offset,servo,crateWidth=.76){
   const field=new Field({empty:true});
   try{
     const actor=field.spawn("pincer",{x:9,y:12},0);
     field.select(actor.id);field.setClawTorque(actor.id,servo);
     const object=field.addBox({
       x:10.7,y:12+offset,hx:crateWidth/2,hy:.48,mass},false);
     field.setAperture(actor.id,0);
     let activeContactTicks=0;
     for(let t=0;t<100;t++){
       field.step({move:{x:0,y:0},aim:{x:18,y:12}});
       if(actor.contactCount>0)activeContactTicks++;
     }
     const start={...object.body.translation()},before={...actor.root.translation()};
     let maxContact=0,finite=true;
     for(let t=0;t<145;t++){
       field.step({move:{x:0,y:-1},aim:{x:18,y:12}});
       const p=object.body.translation(),q=actor.root.translation();
       if(!Number.isFinite(p.x+p.y+q.x+q.y))finite=false;
       maxContact=Math.max(maxContact,actor.contactImpulse);
     }
     const finish=object.body.translation(),root=actor.root.translation();
     return {dy:+(finish.y-start.y).toFixed(3),
       displacement:+Math.hypot(finish.x-start.x,finish.y-start.y).toFixed(3),
       rootTravel:+Math.hypot(root.x-before.x,root.y-before.y).toFixed(3),
       closureContactTicks:activeContactTicks,
       peakImpulse:+maxContact.toFixed(2),finite};
   }finally{field.dispose();}
 }
 const rows=[];
 for(const mass of [8,38,180]){
   for(const offset of [-.32,0,.32]){
     const withArms=attempt(mass,offset,780);
     const deadArms=attempt(mass,offset,0);
     rows.push({mass,offset,withArms,deadArms,
       extraMaterialDisplacement:+(withArms.displacement-
         deadArms.displacement).toFixed(3)});
   }
 }
 const asymmetric=attempt(18,.10,780,1.30);
 if(!rows.every(r=>r.withArms.finite&&r.deadArms.finite)||!asymmetric.finite)
   throw Error("nonfinite articulated material sweep");
 const outliers=[
   {mass:13,offset:-1.4,width:.76},
   {mass:13,offset:1.4,width:.76},
   {mass:13,offset:2.25,width:.76},
   {mass:640,offset:0,width:.76},
   {mass:2800,offset:0,width:.76},
   {mass:40,offset:0,width:2.3}
 ].map(spec=>({
   ...spec,
   active:attempt(spec.mass,spec.offset,780,spec.width),
   disabled:attempt(spec.mass,spec.offset,0,spec.width)
 }));
 if(!outliers.every(x=>x.active.finite&&x.disabled.finite))
   throw Error("large eccentric body or heavy matter became nonfinite");
 const successes=rows.filter(r=>r.extraMaterialDisplacement>.6).length;
 const differences=rows.map(r=>r.extraMaterialDisplacement);
 return {cases:rows.length,successfulMaterialContrasts:successes,
   maxDifference:Math.max(...differences),
   minDifference:Math.min(...differences),
   rows,outliers,extraWideBox:asymmetric};
}
