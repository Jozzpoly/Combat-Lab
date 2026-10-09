// Researcher-side ablation: the two independently collision-bearing appendages
// receive separate finite reciprocal torque. No script changes the crate.
export function independentArmsProbe(Field){
 const cases=[];
 function run(offset,pattern){
   const field=new Field({empty:true});
   try{
     const p=field.spawn("pincer",{x:9,y:12},0);
     field.select(p.id);
     const obj=field.addBox({x:10.7,y:12+offset,hx:.38,hy:.48,mass:38},false);
     const before={...obj.body.translation()},ang=obj.body.rotation();
     const commands={none:[1,1],upper:[0,1],lower:[1,0],both:[0,0]}[pattern];
     if(!commands)throw Error("Unknown physical actuation pattern");
     field.setArmAperture(p.id,0,commands[0]);
     field.setArmAperture(p.id,1,commands[1]);
     let contacts=0,peakLoad=0;
     for(let i=0;i<110;i++){
       field.step({move:{x:0,y:0},aim:{x:18,y:12}});
       if(p.contactCount)contacts++;
       peakLoad=Math.max(peakLoad,p.contactImpulse);
     }
     // Same world and movement for all interventions.
     for(let i=0;i<90;i++){
       field.step({move:{x:0,y:-1},aim:{x:18,y:12}});
       if(p.contactCount)contacts++;
       peakLoad=Math.max(peakLoad,p.contactImpulse);
     }
     const end=obj.body.translation();
     if(!Number.isFinite(end.x+end.y+obj.body.rotation()))
       throw Error("nonfinite material after independent jaw contact");
     return {offset,pattern,contacts,
       x:+(end.x-before.x).toFixed(3),
       y:+(end.y-before.y).toFixed(3),
       net:+Math.hypot(end.x-before.x,end.y-before.y).toFixed(3),
       spin:+(obj.body.rotation()-ang).toFixed(3),
       peakLoad:+peakLoad.toFixed(2)};
   }finally{field.dispose();}
 }
 for(const offset of [-.48,0,.48]){
   for(const pattern of ["none","upper","lower","both"])
     cases.push(run(offset,pattern));
 }
 const groups=[-.48,0,.48].map(offset=>{
   const same=cases.filter(x=>x.offset===offset);
   const none=same.find(x=>x.pattern==="none");
   const upper=same.find(x=>x.pattern==="upper");
   const lower=same.find(x=>x.pattern==="lower");
   const both=same.find(x=>x.pattern==="both");
   return {offset,
     maxDeltaAgainstNull:Math.max(
       Math.hypot(upper.x-none.x,upper.y-none.y),
       Math.hypot(lower.x-none.x,lower.y-none.y),
       Math.hypot(both.x-none.x,both.y-none.y)),
     upperLowerSeparation:Math.hypot(upper.x-lower.x,upper.y-lower.y),
     materialOutcomes:same};
 });
 if(!groups.some(x=>x.upperLowerSeparation>.10))
   throw Error("independent physical arm controls have no distinct material result");
 if(!groups.some(x=>x.maxDeltaAgainstNull>.30))
   throw Error("real appendage input did not alter free material afterstate");
 return {groups,patterns:4,offsets:3};
}
