import {
  contactAcceleration,
  createContactBody,
  solveCandidateContactPairs
} from "./contact-semantics.js";

export const LIVING_MOVEMENT_SCHEMA="combat-lab-living-movement-l0-v0";

const EPS=1e-9;
const DEFAULT_WORLD={width:1200,height:720};
const SOURCE_INSET=70;
const EXIT_INSET=42;
const EDGE_SLOTS=8;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(label+" must be finite");
  return n;
}

function positive(value,label){
  const n=finite(value,label);
  if(n<=0) throw new Error(label+" must be positive");
  return n;
}

function nonNegative(value,label){
  const n=finite(value,label);
  if(n<0) throw new Error(label+" must be non-negative");
  return n;
}

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function normalize(v){
  const d=Math.hypot(v.x,v.y);
  return d<EPS ? {x:0,y:0} : {x:v.x/d,y:v.y/d};
}

function rotate(v,angle){
  const c=Math.cos(angle);
  const s=Math.sin(angle);
  return {x:v.x*c-v.y*s,y:v.x*s+v.y*c};
}

function dot(a,b){
  return a.x*b.x+a.y*b.y;
}

function vectorAngleDelta(a,b){
  const am=Math.hypot(a.x,a.y);
  const bm=Math.hypot(b.x,b.y);
  if(am<EPS || bm<EPS) return 0;
  const cosine=clamp(dot(a,b)/(am*bm),-1,1);
  return Math.acos(cosine);
}

function moveVectorToward(vx,vy,targetX,targetY,maxDelta){
  const dx=targetX-vx;
  const dy=targetY-vy;
  const distance=Math.hypot(dx,dy);
  if(distance<=maxDelta || distance<EPS) return {vx:targetX,vy:targetY};
  const scale=maxDelta/distance;
  return {vx:vx+dx*scale,vy:vy+dy*scale};
}

function sideSlotCoordinate(slot,span){
  const min=132;
  const max=span-132;
  if(EDGE_SLOTS<=1) return (min+max)*0.5;
  return min+(max-min)*(slot/(EDGE_SLOTS-1));
}

function actorSide(index){
  return ["west","east","north","south"][index%4];
}

function oppositeSide(side){
  if(side==="west") return "east";
  if(side==="east") return "west";
  if(side==="north") return "south";
  return "north";
}

function startFor(side,slot,world){
  if(side==="west") return {x:SOURCE_INSET,y:sideSlotCoordinate(slot,world.height)};
  if(side==="east") return {x:world.width-SOURCE_INSET,y:sideSlotCoordinate(slot,world.height)};
  if(side==="north") return {x:sideSlotCoordinate(slot,world.width),y:SOURCE_INSET};
  return {x:sideSlotCoordinate(slot,world.width),y:world.height-SOURCE_INSET};
}

function targetBandCenter(index,slot,exitSide,world){
  const targetSlot=(slot*5+(index%4)*2+3)%EDGE_SLOTS;
  return (exitSide==="west" || exitSide==="east")
    ? sideSlotCoordinate(targetSlot,world.height)
    : sideSlotCoordinate(targetSlot,world.width);
}

export function buildLivingMovementActivities(count,{world=DEFAULT_WORLD,bandHalf=58}={}){
  const n=Math.floor(positive(count,"count"));
  if(n>EDGE_SLOTS*4) throw new Error("L0 ordinary-valid population supports at most 32 actors");
  const specs=[];
  for(let i=0;i<n;i++){
    const side=actorSide(i);
    const slotOrder=[0,4,2,6,1,5,3,7];
    const slot=slotOrder[Math.floor(i/4)];
    const exitSide=oppositeSide(side);
    specs.push({
      id:"organism-"+String(i+1),
      index:i,
      sourceSide:side,
      exitSide,
      slot,
      start:startFor(side,slot,world),
      exitBand:{
        side:exitSide,
        center:targetBandCenter(i,slot,exitSide,world),
        half:positive(bandHalf,"bandHalf")
      }
    });
  }
  return specs;
}

export function capabilityScaleFromLoad(load,strength=1){
  const l=Math.max(0,finite(load,"load"));
  const s=nonNegative(strength,"strength");
  return 1/(1+s*1.35*l*l);
}

export function advanceEffortLoad({
  load=0,
  motorUse=0,
  speedFraction=0,
  blockedFraction=0,
  dt,
  buildRate=0.72,
  recoveryRate=0.42
}={}){
  const delta=positive(dt,"dt");
  const current=Math.max(0,finite(load,"load"));
  const motor=clamp(finite(motorUse,"motorUse"),0,2);
  const speed=clamp(finite(speedFraction,"speedFraction"),0,1.5);
  const blocked=clamp(finite(blockedFraction,"blockedFraction"),0,1);
  const stress=
    0.68*motor*motor+
    0.12*speed*speed+
    0.55*blocked;
  const build=positive(buildRate,"buildRate")*stress;
  const recovery=positive(recoveryRate,"recoveryRate")*current/(1+0.8*stress);
  return clamp(current+(build-recovery)*delta,0,1.6);
}

function nearestExitPoint(activity,body,world){
  const band=activity.exitBand;
  if(band.side==="east" || band.side==="west"){
    return {
      x:band.side==="east" ? world.width-EXIT_INSET : EXIT_INSET,
      y:clamp(body.y,band.center-band.half,band.center+band.half)
    };
  }
  return {
    x:clamp(body.x,band.center-band.half,band.center+band.half),
    y:band.side==="south" ? world.height-EXIT_INSET : EXIT_INSET
  };
}

function activityDirection(activity,body,world){
  const target=nearestExitPoint(activity,body,world);
  return normalize({x:target.x-body.x,y:target.y-body.y});
}

function activityRemainingDistance(activity,position,world){
  const target=nearestExitPoint(activity,position,world);
  return Math.hypot(target.x-position.x,target.y-position.y);
}

function completedActivity(activity,body,world){
  const band=activity.exitBand;
  if(band.side==="east"){
    return body.x>=world.width-EXIT_INSET &&
      Math.abs(body.y-band.center)<=band.half+body.radius;
  }
  if(band.side==="west"){
    return body.x<=EXIT_INSET &&
      Math.abs(body.y-band.center)<=band.half+body.radius;
  }
  if(band.side==="south"){
    return body.y>=world.height-EXIT_INSET &&
      Math.abs(body.x-band.center)<=band.half+body.radius;
  }
  return body.y<=EXIT_INSET &&
    Math.abs(body.x-band.center)<=band.half+body.radius;
}

function predictedSurfaceGap(self,desiredVelocity,others,horizon,acceleration){
  if(others.length===0) return Infinity;

  let minGap=Infinity;
  for(const other of others){
    minGap=Math.min(
      minGap,
      Math.hypot(other.x-self.x,other.y-self.y)-self.radius-other.radius
    );
  }

  const future=Math.max(0,finite(horizon,"horizon"));
  if(future<=EPS) return minGap;

  const availableAcceleration=Math.max(
    EPS,
    nonNegative(acceleration,"prediction acceleration")
  );
  const samples=Math.max(2,Math.min(10,Math.ceil(future/0.08)));
  const dt=future/samples;
  let x=self.x;
  let y=self.y;
  let vx=self.vx;
  let vy=self.vy;

  for(let step=1;step<=samples;step++){
    const next=moveVectorToward(
      vx,vy,
      desiredVelocity.x,desiredVelocity.y,
      availableAcceleration*dt
    );
    vx=next.vx;
    vy=next.vy;
    x+=vx*dt;
    y+=vy*dt;

    const t=step*dt;
    for(const other of others){
      const ox=other.x+other.vx*t;
      const oy=other.y+other.vy*t;
      const gap=Math.hypot(ox-x,oy-y)-self.radius-other.radius;
      minGap=Math.min(minGap,gap);
    }
  }
  return minGap;
}

function perceivedNeighbours(state,body){
  const radius=state.policy.perceptionRadius;
  const out=[];
  for(const other of state.bodies){
    if(other.id===body.id) continue;
    if(Math.hypot(other.x-body.x,other.y-body.y)<=radius){
      out.push(other);
    }
  }
  return out;
}

function continuationCandidate(
  id,
  baseDirection,
  offset,
  speedScale,
  body,
  others,
  state,
  projectionAcceleration
){
  const direction=rotate(baseDirection,offset);
  const velocity={
    x:direction.x*body.maxSpeed*speedScale,
    y:direction.y*body.maxSpeed*speedScale
  };
  const minGap=others.length
    ? predictedSurfaceGap(
        body,
        velocity,
        others,
        state.policy.prospectionHorizon,
        projectionAcceleration
      )
    : Infinity;
  return {
    id,
    offset,
    speedScale,
    velocity,
    minGap,
    progress:dot(velocity,baseDirection)
  };
}

function symmetricOpposition(a,b){
  if(!a || !b) return false;
  if(Math.sign(a.offset)===Math.sign(b.offset)) return false;
  return Math.abs(Math.abs(a.offset)-Math.abs(b.offset))<1e-9 &&
    Math.abs(a.minGap-b.minGap)<1e-6 &&
    Math.abs(a.progress-b.progress)<1e-6;
}

function chooseContinuation(state,actor,body){
  const baseDirection=activityDirection(actor.activity,body,state.world);
  const neighbours=perceivedNeighbours(state,body);
  const projectionAcceleration=contactAcceleration(body);
  const currentOffset=finite(actor.continuation.offset,"continuation.offset");
  const currentSpeedScale=finite(actor.continuation.speedScale,"continuation.speedScale");
  const current=continuationCandidate(
    actor.continuation.id,
    baseDirection,
    currentOffset,
    currentSpeedScale,
    body,
    neighbours,
    state,
    projectionAcceleration
  );
  const warningGap=state.policy.safetyGap;
  const meaningfulGain=Math.max(3,body.radius*0.22);

  const direct=continuationCandidate(
    "direct",baseDirection,0,1,body,neighbours,state,projectionAcceleration
  );

  // A corrective continuation owns its next attempt until the world supplies
  // outcome evidence about that same attempt. Do not judge a new continuation
  // using the previous continuation's result.
  if(actor.continuation.id!=="direct"){
    const startDirectGap=Number(actor.continuation.directGapAtStart);
    const directGapImprovement=Number.isFinite(startDirectGap)
      ? direct.minGap-startDirectGap
      : -Infinity;
    if(
      direct.minGap>=warningGap &&
      directGapImprovement>=meaningfulGain &&
      direct.progress>current.progress+body.maxSpeed*0.05
    ){
      return {
        ...direct,
        reason:"direct-reopened-after-material-improvement",
        neighbourCount:neighbours.length
      };
    }

    const outcome=actor.lastOutcome?.continuationId===actor.continuation.id
      ? actor.lastOutcome
      : null;
    const materiallyBlocked=Boolean(
      outcome?.contacted && Number(outcome.blockedFraction)>=0.25
    );

    if(!materiallyBlocked){
      return {
        ...current,
        reason:outcome ? "continuation-supported-by-outcome" : "continuation-awaiting-outcome",
        neighbourCount:neighbours.length
      };
    }
  }

  // Prospection is evidence, not a no-contact policy. If the current
  // continuation remains comfortably supported, keep it. A previously
  // corrective continuation may return to direct once that future reopens.
  if(current.minGap>=warningGap && current.progress>=body.maxSpeed*0.2){
    return {...current,reason:"supported",neighbourCount:neighbours.length};
  }

  const turn=state.policy.correctionAngle;
  const left=continuationCandidate(
    "left",baseDirection,-turn,0.92,body,neighbours,state,projectionAcceleration
  );
  const right=continuationCandidate(
    "right",baseDirection,turn,0.92,body,neighbours,state,projectionAcceleration
  );
  const moving=[direct,left,right].sort((a,b)=>
    b.minGap-a.minGap ||
    b.progress-a.progress ||
    Math.abs(a.offset)-Math.abs(b.offset) ||
    a.id.localeCompare(b.id)
  );

  const bestMoving=moving[0];
  const runnerUp=moving[1];
  const movingGain=bestMoving.minGap-current.minGap;

  // Exact symmetric lateral evidence is not permission to invent a passing
  // convention. First test whether yielding speed buys real future clearance.
  if(
    bestMoving &&
    runnerUp &&
    symmetricOpposition(bestMoving,runnerUp) &&
    movingGain>=meaningfulGain
  ){
    const slow=continuationCandidate(
      "slow",baseDirection,0,0.42,body,neighbours,state,projectionAcceleration
    );
    if(slow.minGap>=current.minGap+meaningfulGain){
      return {
        ...slow,
        reason:"symmetric-yield",
        neighbourCount:neighbours.length,
        directGapAtSelection:direct.minGap
      };
    }
    const wait=continuationCandidate(
      "wait",baseDirection,0,0,body,neighbours,state,projectionAcceleration
    );
    if(wait.minGap>=current.minGap+meaningfulGain){
      return {
        ...wait,
        reason:"symmetric-wait",
        neighbourCount:neighbours.length,
        directGapAtSelection:direct.minGap
      };
    }
    return {...current,reason:"symmetric-contact-tolerated",neighbourCount:neighbours.length};
  }

  // Change course only when the prospective evidence materially improves the
  // threatened future. Small clearance differences do not own the body.
  if(bestMoving && movingGain>=meaningfulGain){
    return {
      ...bestMoving,
      reason:"prospective-correction",
      neighbourCount:neighbours.length,
      directGapAtSelection:bestMoving.id==="direct" ? null : direct.minGap
    };
  }

  // Severe predicted overlap can justify reducing vigor even when no lateral
  // continuation clearly wins. Otherwise tolerate the conflict and let
  // material contact/world truth answer rather than manufacturing safety.
  if(current.minGap<-body.radius*0.35){
    const slow=continuationCandidate(
      "slow",baseDirection,0,0.42,body,neighbours,state,projectionAcceleration
    );
    if(slow.minGap>=current.minGap+meaningfulGain){
      return {
        ...slow,
        reason:"pressure-slow",
        neighbourCount:neighbours.length,
        directGapAtSelection:direct.minGap
      };
    }
    const wait=continuationCandidate(
      "wait",baseDirection,0,0,body,neighbours,state,projectionAcceleration
    );
    if(wait.minGap>=current.minGap+meaningfulGain){
      return {
        ...wait,
        reason:"pressure-wait",
        neighbourCount:neighbours.length,
        directGapAtSelection:direct.minGap
      };
    }
  }

  return {...current,reason:"contact-tolerated",neighbourCount:neighbours.length};
}

function constrainToWorld(body,world){
  if(body.x-body.radius<0){
    body.x=body.radius;
    if(body.vx<0) body.vx=0;
  }
  if(body.x+body.radius>world.width){
    body.x=world.width-body.radius;
    if(body.vx>0) body.vx=0;
  }
  if(body.y-body.radius<0){
    body.y=body.radius;
    if(body.vy<0) body.vy=0;
  }
  if(body.y+body.radius>world.height){
    body.y=world.height-body.radius;
    if(body.vy>0) body.vy=0;
  }
}

function actorFor(state,body){
  return state.actors[body.id];
}

function applyLivingMotor(state,actor,body,dt){
  const desired=actor.lastDecision.velocity;
  body.desiredVelocity={...desired};

  const baseAcceleration=contactAcceleration(body);
  const capabilityScale=capabilityScaleFromLoad(
    actor.effortLoad,
    state.policy.effortHistoryStrength
  );
  const effectiveAcceleration=baseAcceleration*capabilityScale;
  const before={vx:body.vx,vy:body.vy};
  const next=moveVectorToward(
    body.vx,body.vy,
    desired.x,desired.y,
    effectiveAcceleration*dt
  );
  body.vx=next.vx;
  body.vy=next.vy;

  const motorDelta=Math.hypot(body.vx-before.vx,body.vy-before.vy);
  const availableDelta=Math.max(EPS,effectiveAcceleration*dt);
  actor.motorUse=clamp(motorDelta/availableDelta,0,2);
  actor.capabilityScale=capabilityScale;
  actor.effectiveAcceleration=effectiveAcceleration;
}

function contactIds(state){
  const ids=new Set();
  for(const contact of state.lastContacts || []){
    ids.add(contact.a);
    ids.add(contact.b);
  }
  return ids;
}

function updateEffortAndOutcome(state,actor,body,before,dt,contacted){
  const realizedVelocity={
    x:(body.x-before.x)/dt,
    y:(body.y-before.y)/dt
  };
  const demand=actor.lastDecision.velocity;
  const demandSpeed=Math.hypot(demand.x,demand.y);
  const realizedSpeed=Math.hypot(realizedVelocity.x,realizedVelocity.y);
  const desiredDirection=demandSpeed<EPS ? {x:0,y:0} : {x:demand.x/demandSpeed,y:demand.y/demandSpeed};
  const expectedForward=demandSpeed;
  const realizedForward=dot(realizedVelocity,desiredDirection);
  const blockedFraction=contacted && expectedForward>EPS
    ? clamp(1-Math.max(0,realizedForward)/expectedForward,0,1)
    : 0;

  const telemetry=actor.demandTelemetry;
  const previousDemand=telemetry.lastDemand;
  const previousContinuationId=telemetry.lastContinuationId;
  const demandVectorDelta=previousDemand
    ? Math.hypot(demand.x-previousDemand.x,demand.y-previousDemand.y)
    : 0;
  const demandAngleDelta=previousDemand
    ? vectorAngleDelta(demand,previousDemand)
    : 0;
  const sameContinuation=previousContinuationId===actor.continuation.id;
  const beforeRemaining=activityRemainingDistance(
    actor.activity,{x:before.x,y:before.y},state.world
  );
  const afterRemaining=activityRemainingDistance(
    actor.activity,{x:body.x,y:body.y},state.world
  );
  const activityProgress=beforeRemaining-afterRemaining;
  const realizedDisplacement=Math.hypot(body.x-before.x,body.y-before.y);
  const demandOutcomeAngularError=vectorAngleDelta(demand,realizedVelocity);

  telemetry.samples+=1;
  telemetry.lastDemand={...demand};
  telemetry.lastContinuationId=actor.continuation.id;
  telemetry.lastDemandVectorDelta=demandVectorDelta;
  telemetry.lastDemandAngleDelta=demandAngleDelta;
  telemetry.lastActivityProgress=activityProgress;
  telemetry.lastRealizedDisplacement=realizedDisplacement;
  telemetry.lastDemandOutcomeAngularError=demandOutcomeAngularError;
  telemetry.cumulativeDemandVectorChurn+=demandVectorDelta;
  telemetry.cumulativeDemandAngularChurn+=demandAngleDelta;
  telemetry.cumulativeAbsoluteActivityProgress+=Math.abs(activityProgress);
  telemetry.netActivityProgress+=activityProgress;
  if(
    sameContinuation &&
    previousDemand &&
    demandVectorDelta>1e-6
  ){
    telemetry.sameLabelDemandChangeFrames+=1;
    telemetry.sameLabelDemandVectorChurn+=demandVectorDelta;
    telemetry.sameLabelDemandAngularChurn+=demandAngleDelta;
  }

  actor.effortLoad=advanceEffortLoad({
    load:actor.effortLoad,
    motorUse:actor.motorUse,
    speedFraction:realizedSpeed/body.maxSpeed,
    blockedFraction,
    dt,
    buildRate:state.policy.effortBuildRate,
    recoveryRate:state.policy.effortRecoveryRate
  });

  actor.lastOutcome={
    beforePosition:{x:before.x,y:before.y},
    finalPosition:{x:body.x,y:body.y},
    continuationId:actor.continuation.id,
    demandedVelocity:{...demand},
    realizedVelocity,
    demandOutcomeError:Math.hypot(
      demand.x-realizedVelocity.x,
      demand.y-realizedVelocity.y
    ),
    demandOutcomeAngularError,
    demandVectorDelta,
    demandAngleDelta,
    sameContinuationAsPreviousDemand:sameContinuation,
    activityProgress,
    activityRemainingDistance:afterRemaining,
    realizedDisplacement,
    blockedFraction,
    contacted:Boolean(contacted)
  };

  actor.causalTrace.push({
    time:state.time+dt,
    continuationId:actor.continuation.id,
    decisionReason:actor.lastDecision.reason,
    demandedVelocity:{...demand},
    realizedVelocity:{...realizedVelocity},
    demandVectorDelta,
    demandAngleDelta,
    sameContinuationAsPreviousDemand:sameContinuation,
    demandOutcomeError:actor.lastOutcome.demandOutcomeError,
    demandOutcomeAngularError,
    activityProgress,
    activityRemainingDistance:afterRemaining,
    realizedDisplacement,
    contacted:Boolean(contacted),
    blockedFraction
  });
  if(actor.causalTrace.length>240){
    actor.causalTrace.splice(0,actor.causalTrace.length-240);
  }
}

function createActor(spec,index,state){
  const body=createContactBody({
    id:spec.id,
    position:spec.start,
    radius:18,
    mass:1,
    motorAuthority:1,
    contactResistance:1,
    desiredVelocity:{x:0,y:0},
    velocity:{x:0,y:0},
    maxSpeed:132
  });
  const actor={
    id:spec.id,
    index,
    activity:structuredClone(spec),
    continuation:{offset:0,speedScale:1,id:"direct",directGapAtStart:null},
    lastDecision:{
      id:"direct",
      offset:0,
      speedScale:1,
      velocity:{x:0,y:0},
      minGap:Infinity,
      progress:0,
      reason:"initial",
      neighbourCount:0
    },
    effortLoad:0,
    motorUse:0,
    capabilityScale:1,
    effectiveAcceleration:contactAcceleration(body),
    continuationChanges:0,
    demandTelemetry:{
      samples:0,
      lastDemand:null,
      lastContinuationId:null,
      lastDemandVectorDelta:0,
      lastDemandAngleDelta:0,
      lastActivityProgress:0,
      lastRealizedDisplacement:0,
      lastDemandOutcomeAngularError:0,
      cumulativeDemandVectorChurn:0,
      cumulativeDemandAngularChurn:0,
      sameLabelDemandChangeFrames:0,
      sameLabelDemandVectorChurn:0,
      sameLabelDemandAngularChurn:0,
      cumulativeAbsoluteActivityProgress:0,
      netActivityProgress:0
    },
    causalTrace:[],
    lastOutcome:null,
    completedAt:null
  };
  state.actors[spec.id]=actor;
  state.bodies.push(body);
}

export function createLivingMovementState({
  count=16,
  world=DEFAULT_WORLD,
  prospectionHorizon=0.72,
  safetyGap=10,
  perceptionRadius=230,
  correctionAngle=0.48,
  effortHistoryStrength=1,
  effortBuildRate=0.72,
  effortRecoveryRate=0.42
}={}){
  const normalizedWorld={
    width:positive(world.width,"world.width"),
    height:positive(world.height,"world.height")
  };
  const state={
    schema:LIVING_MOVEMENT_SCHEMA,
    time:0,
    world:normalizedWorld,
    authoredCount:Math.floor(positive(count,"count")),
    policy:{
      prospectionHorizon:nonNegative(prospectionHorizon,"prospectionHorizon"),
      safetyGap:nonNegative(safetyGap,"safetyGap"),
      perceptionRadius:positive(perceptionRadius,"perceptionRadius"),
      correctionAngle:positive(correctionAngle,"correctionAngle"),
      effortHistoryStrength:nonNegative(effortHistoryStrength,"effortHistoryStrength"),
      effortBuildRate:positive(effortBuildRate,"effortBuildRate"),
      effortRecoveryRate:positive(effortRecoveryRate,"effortRecoveryRate")
    },
    bodies:[],
    actors:{},
    completedIds:[],
    contactPairsThisStep:0,
    totalContactPairSteps:0,
    pairChecksThisStep:0,
    contactResolutionsThisStep:0,
    solverIterationsUsed:0,
    totalPairChecks:0,
    totalContactResolutions:0,
    totalSolverIterations:0,
    lastContacts:[]
  };

  const specs=buildLivingMovementActivities(state.authoredCount,{world:normalizedWorld});
  specs.forEach((spec,index)=>createActor(spec,index,state));
  return state;
}

export function setLivingMovementPolicy(state,id,value){
  if(id==="prospectionHorizon"){
    state.policy.prospectionHorizon=nonNegative(value,id);
  }else if(id==="effortHistoryStrength"){
    state.policy.effortHistoryStrength=nonNegative(value,id);
  }else if(id==="safetyGap"){
    state.policy.safetyGap=nonNegative(value,id);
  }else{
    throw new Error("unknown living movement policy: "+id);
  }
}

export function stepLivingMovementState(state,dt){
  const delta=positive(dt,"dt");
  if(state.bodies.length===0){
    state.time+=delta;
    return state;
  }

  const before=new Map();
  for(const body of state.bodies){
    const actor=actorFor(state,body);
    before.set(body.id,{x:body.x,y:body.y,vx:body.vx,vy:body.vy});

    const decision=chooseContinuation(state,actor,body);
    const continuationChanged=(
      decision.id!==actor.continuation.id ||
      Math.abs(decision.offset-actor.continuation.offset)>1e-9 ||
      Math.abs(decision.speedScale-actor.continuation.speedScale)>1e-9
    );
    if(continuationChanged){
      actor.continuationChanges+=1;
    }
    actor.continuation={
      id:decision.id,
      offset:decision.offset,
      speedScale:decision.speedScale,
      directGapAtStart:decision.id==="direct"
        ? null
        : continuationChanged
          ? Number.isFinite(Number(decision.directGapAtSelection))
            ? Number(decision.directGapAtSelection)
            : null
          : actor.continuation.directGapAtStart
    };
    actor.lastDecision=decision;
    applyLivingMotor(state,actor,body,delta);
  }

  for(const body of state.bodies){
    body.x+=body.vx*delta;
    body.y+=body.vy*delta;
    constrainToWorld(body,state.world);
  }

  solveCandidateContactPairs(state,{iterations:16,pairOrder:"forward"});
  for(const body of state.bodies) constrainToWorld(body,state.world);

  const contacted=contactIds(state);
  for(const body of state.bodies){
    updateEffortAndOutcome(
      state,
      actorFor(state,body),
      body,
      before.get(body.id),
      delta,
      contacted.has(body.id)
    );
  }

  const completed=[];
  for(const body of state.bodies){
    const actor=actorFor(state,body);
    if(completedActivity(actor.activity,body,state.world)){
      actor.completedAt=state.time+delta;
      completed.push(body.id);
    }
  }
  if(completed.length){
    const completedSet=new Set(completed);
    state.completedIds.push(...completed);
    state.bodies=state.bodies.filter(body=>!completedSet.has(body.id));
  }

  state.time+=delta;
  return state;
}

function finiteOrNull(value){
  return Number.isFinite(value) ? value : null;
}

export function livingMovementActorSnapshot(state,id){
  const actor=state.actors[String(id)];
  if(!actor) return null;
  const body=state.bodies.find(candidate=>candidate.id===actor.id) || null;
  return {
    id:actor.id,
    active:Boolean(body),
    completedAt:actor.completedAt,
    activity:structuredClone(actor.activity),
    continuation:structuredClone(actor.continuation),
    decision:{
      id:actor.lastDecision.id,
      reason:actor.lastDecision.reason,
      minPredictedSurfaceGap:finiteOrNull(actor.lastDecision.minGap),
      progress:actor.lastDecision.progress,
      neighbourCount:actor.lastDecision.neighbourCount,
      demandedVelocity:{...actor.lastDecision.velocity}
    },
    body:body ? {
      position:{x:body.x,y:body.y},
      velocity:{x:body.vx,y:body.vy},
      radius:body.radius,
      mass:body.mass,
      motorAuthority:body.motorAuthority,
      contactResistance:body.contactResistance,
      maxSpeed:body.maxSpeed,
      effectiveAcceleration:actor.effectiveAcceleration,
      capabilityScale:actor.capabilityScale,
      effortLoad:actor.effortLoad,
      motorUse:actor.motorUse
    } : null,
    outcome:actor.lastOutcome ? structuredClone(actor.lastOutcome) : null,
    demandTelemetry:structuredClone(actor.demandTelemetry),
    continuationChanges:actor.continuationChanges
  };
}

export function livingMovementActorTrace(state,id,{limit=120}={}){
  const actor=state.actors[String(id)];
  if(!actor) return [];
  const count=Math.max(1,Math.min(240,Math.floor(Number(limit) || 120)));
  return structuredClone(actor.causalTrace.slice(-count));
}

export function livingMovementSnapshot(state){
  const active=state.bodies.map(body=>livingMovementActorSnapshot(state,body.id));
  const avgEffort=active.length
    ? active.reduce((sum,item)=>sum+item.body.effortLoad,0)/active.length
    : 0;
  const avgCapability=active.length
    ? active.reduce((sum,item)=>sum+item.body.capabilityScale,0)/active.length
    : 1;
  return {
    schema:LIVING_MOVEMENT_SCHEMA,
    time:state.time,
    populationAuthored:state.authoredCount,
    active:state.bodies.length,
    completed:state.completedIds.length,
    policy:{...state.policy},
    averageEffortLoad:avgEffort,
    averageCapabilityScale:avgCapability,
    contactPairsThisStep:state.contactPairsThisStep,
    contactResolutionsThisStep:state.contactResolutionsThisStep,
    totalContactResolutions:state.totalContactResolutions,
    solverIterationsUsed:state.solverIterationsUsed,
    actors:active
  };
}

export const LIVING_MOVEMENT_WORLD={...DEFAULT_WORLD};
