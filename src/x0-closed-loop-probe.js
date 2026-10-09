// Narrow donor preflight ONLY, not X0 architecture or "organism autonomy".
// A per-limb, actor-local contact signal authorizes a finite reciprocal
// actuation on the OTHER limb. Counterfactual arm-off is otherwise identical.
// This is NOT a goal controller and NEVER sees crate/ram positions or IDs.
const V=(x=0,y=0)=>({x,y});
const diff=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const finite=p=>Number.isFinite(p.x+p.y);
const round=n=>+n.toFixed(4);
function localExternalContact(world,actor){
  const loads=[0,0],counts=[0,0],rapier=world.world;
  for(const arm of actor.arms){
    const i=arm.index;
    for(const collider of [arm.bar,arm.hook]){
      rapier.contactPairsWith(collider,other=>{
        if(world.colliderOwner.get(other.handle)===actor.id)return;
        rapier.contactPair(collider,other,manifold=>{
          for(let j=0;j<manifold.numSolverContacts();j++){
            loads[i]+=Math.abs(manifold.contactImpulse(j)||0);
            counts[i]++;
          }
        });
      });
    }
  }
  return {loads,counts};
}
function attempt(Field,{mass=18,impulse=V(65,-170),reflex=false,limit=240}={}){
  const world=new Field({empty:true});
  try{
    const p=world.spawn("pincer",V(9,12),0);
    world.select(p.id);
    const b=world.spawn("ram",V(13.20,12),Math.PI);
    const o=world.addBox({x:10.70,y:12,hx:.38,hy:.48,mass},false);
    const secondary=world.addBox({x:9.65,y:10.55,hx:.23,hy:.24,mass:9},false);
    const secondaryStart=V(secondary.body.translation().x,secondary.body.translation().y);
    p.spec.clawTorque=780;
    world.setAperture(p.id,.92);
    const origin=V(o.body.translation().x,o.body.translation().y);
    let contactAt=-1,actuationAt=-1,firstB=-1,crateSecondaryAt=-1,secondaryPincerAt=-1;
    let contactCount=0,contactLoad=0;
    let lastSensor=V(),latch=0,respondedUpper=0,respondedLower=0;
    const states=[];
    let impulseDelivered=false;
    for(let tick=0;tick<limit;tick++){
      if(tick===40){
        // External research stimulus, explicitly NOT organism behavior.
        o.body.applyImpulseAtPoint(impulse,o.body.translation(),true);
        impulseDelivered=true;
      }
      world.step({move:V(),aim:null});
      const sensor=localExternalContact(world,p);
      const load=Math.max(...sensor.loads);
      lastSensor=V(...sensor.loads);
      if(load>0.02){
        if(contactAt<0)contactAt=tick;
        contactCount++;
        contactLoad+=load;
      }
      // Reflex is causal and scene-agnostic: external pressure on one
      // arm starts a bounded closing response in its opposite arm.
      // The sensor never gets material identity, scene geometry,
      // research-test progress or global destinations.
      if(reflex&&latch===0&&load>1.0){
        const touched=sensor.loads[0]>=sensor.loads[1]?0:1;
        const target=1-touched;
        world.setArmAperture(p.id,target,0);
        latch=100;
        if(actuationAt<0)actuationAt=tick;
        if(target===0)respondedUpper++;else respondedLower++;
      }
      if(latch>0)latch--;
      if(b.contactCount>0&&firstB<0)firstB=tick;
      world.world.contactPair(o.collider,secondary.collider,m=>{
        if(m.numSolverContacts()>0&&crateSecondaryAt<0)crateSecondaryAt=tick;
      });
      for(const part of p.parts){
        world.world.contactPair(part.collider,secondary.collider,m=>{
          if(m.numSolverContacts()>0&&secondaryPincerAt<0)secondaryPincerAt=tick;
        });
      }
      for(const a of [p,b]){
        for(const part of a.parts){
          const t=part.body.translation();
          if(!finite(t)||!Number.isFinite(part.body.rotation()))
            throw Error("nonfinite linked body");
        }
      }
      if(tick%10===0 || tick>=38&&tick<=65){
        const po=o.body.translation(),pb=b.root.translation(),pa=p.root.translation();
        states.push({tick,
          crate:V(round(po.x),round(po.y)),bodyB:V(round(pb.x),round(pb.y)),
          bodyA:V(round(pa.x),round(pa.y)),
          secondary:V(round(secondary.body.translation().x),round(secondary.body.translation().y)),
          aperture:[...p.targetApertures],
          externalContactLoad:round(load)});
      }
    }
    const finish=o.body.translation(),ram=b.root.translation();
    const secondAfter=secondary.body.translation();
    return {mass,impulse,reflex,impulseDelivered,contactAt,actuationAt,
      firstB,crateSecondaryAt,secondaryPincerAt,
      secondary:{x:round(secondAfter.x),y:round(secondAfter.y),
        displacement:round(diff(secondAfter,secondaryStart))},
      contactTicks:contactCount,totalContactLoad:round(contactLoad),
      respondedUpper,respondedLower,
      crate:{x:round(finish.x),y:round(finish.y),
        displacement:round(diff(finish,origin)),
        angle:round(o.body.rotation())},
      otherBody:{x:round(ram.x),y:round(ram.y),
        speed:round(Math.hypot(b.root.linvel().x,b.root.linvel().y))},
      states};
  }finally{world.dispose();}
}
export function closedMaterialLoopPreflight(Field){
  const cases=[
    {mass:18,impulse:V(65,-170)},
    {mass:18,impulse:V(120,-170)},
    {mass:18,impulse:V(65,170)},
    {mass:60,impulse:V(105,-230)}
  ];
  const results=cases.map(test=>{
    const off=attempt(Field,{...test,reflex:false});
    const on=attempt(Field,{...test,reflex:true});
    if(!on.impulseDelivered||!off.impulseDelivered)
      throw Error("missing external stimulus");
    if(on.actuationAt>=0 && on.actuationAt<on.contactAt)
      throw Error("local physical motor acted before its own touch signal");
    // Key experimental-control invariant: neither world can diverge
    // before a locally sensed contact causes a different control action.
    const earliest=on.actuationAt<0?Number.POSITIVE_INFINITY:on.actuationAt;
    for(let i=0;i<off.states.length;i++){
      const a=on.states[i],b=off.states[i];
      if(a.tick<earliest && (
        diff(a.crate,b.crate)>0.00015 ||
        diff(a.bodyB,b.bodyB)>0.00015 ||
        diff(a.bodyA,b.bodyA)>0.00015 ||
        diff(a.secondary,b.secondary)>0.00015))
        throw Error("false counterfactual divergence before actual actuator response");
    }
    const difference=diff(on.crate,off.crate);
    return {test,off:{
      contactAt:off.contactAt,firstB:off.firstB,crate:off.crate,
      otherBody:off.otherBody},on:{
      contactAt:on.contactAt,actuationAt:on.actuationAt,
      firstB:on.firstB,crate:on.crate,otherBody:on.otherBody,
      respondedUpper:on.respondedUpper,respondedLower:on.respondedLower},
      materialDifference:round(difference),
      secondMaterialDifference:round(diff(on.secondary,off.secondary)),
      secondaryPath:{firstActualCrateContact:on.crateSecondaryAt,
        firstActorContact:on.secondaryPincerAt,
        onDisplacement:on.secondary.displacement,
        offDisplacement:off.secondary.displacement},
      otherBodyDifference:round(diff(on.otherBody,off.otherBody)),
      preActuationMatched:true};
  });
  return {disclosure:"A donor-only falsification harness. No living-world success, no Owner feel verdict.",
    cases:results.length,withContact:results.filter(x=>x.on.contactAt>=0).length,
    withResponse:results.filter(x=>x.on.actuationAt>=0).length,
    withNewMaterialConsequence:results.filter(x=>x.materialDifference>.08).length,
    withSecondaryAfterstateDifference:results.filter(x=>x.secondMaterialDifference>.08).length,
    results};
}
