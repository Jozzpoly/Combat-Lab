import {
  createContactBody,
  stepContactWorld
} from "./contact-semantics.js";

export const DYNAMIC_ENCOUNTER_SCHEMA="combat-lab-dynamic-encounter-v0";
const DEFAULT_SPEED=140;
const EPS=1e-9;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function positive(value,label){
  const n=finite(value,label);
  if(n<=0) throw new Error(`${label} must be positive`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function normalizePassingSide(value,label){
  const n=Math.round(finite(value,label));
  if(![-1,0,1].includes(n)) throw new Error(`${label} must be -1, 0 or 1`);
  return n;
}

function distance(a,b){
  return Math.hypot(b.x-a.x,b.y-a.y);
}

function normalizedToward(from,to){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  const d=Math.hypot(dx,dy);
  if(d<EPS) return {x:0,y:0};
  return {x:dx/d,y:dy/d};
}

function desiredFor(actor,body){
  if(actor.mode==="ARRIVED") return {x:0,y:0};
  const forward=normalizedToward(body,actor.target);
  if(actor.mode!=="SIDESTEP"){
    return {x:forward.x*body.maxSpeed,y:forward.y*body.maxSpeed};
  }

  const left={x:forward.y,y:-forward.x};
  const side=actor.passingSide;
  const lateral={x:left.x*side,y:left.y*side};
  const forwardWeight=0.35;
  const lateralWeight=1;
  const x=forward.x*forwardWeight+lateral.x*lateralWeight;
  const y=forward.y*forwardWeight+lateral.y*lateralWeight;
  const d=Math.hypot(x,y);
  return d<EPS
    ? {x:0,y:0}
    : {x:x/d*body.maxSpeed,y:y/d*body.maxSpeed};
}

function contactPartner(state,bodyId){
  for(const contact of state.lastContacts || []){
    if(contact.a===bodyId) return contact.b;
    if(contact.b===bodyId) return contact.a;
  }
  return null;
}

function captureTrigger(state,actor,partnerId){
  actor.trigger={
    time:state.time,
    partnerId,
    noProgressFor:actor.noProgressFor,
    goalDistance:actor.goalDistance,
    passingSide:actor.passingSide
  };
}

function updateActorAfterContact(state,actor,body,dt){
  const goalDistance=distance(body,actor.target);
  actor.goalDistance=goalDistance;

  if(goalDistance<=state.policy.arrivalTolerance){
    body.x=actor.target.x;
    body.y=actor.target.y;
    body.vx=0;
    body.vy=0;
    body.desiredVelocity={x:0,y:0};
    actor.bestGoalDistance=0;
    actor.goalDistance=0;
    actor.noProgressFor=0;
    actor.mode="ARRIVED";
    return;
  }

  if(actor.mode==="SIDESTEP"){
    actor.sidestepFor+=dt;
    actor.noProgressFor=0;
    if(goalDistance<actor.bestGoalDistance-state.policy.progressEpsilon){
      actor.bestGoalDistance=goalDistance;
    }
    if(actor.sidestepFor>=state.policy.sidestepSeconds){
      actor.mode="DIRECT";
    }
    return;
  }

  const partnerId=contactPartner(state,actor.bodyId);
  if(goalDistance<actor.bestGoalDistance-state.policy.progressEpsilon){
    actor.bestGoalDistance=goalDistance;
    actor.noProgressFor=0;
  }else if(partnerId){
    actor.noProgressFor+=dt;
  }else{
    actor.noProgressFor=0;
  }

  if(
    actor.mode==="DIRECT" &&
    !actor.encounterAttempted &&
    partnerId &&
    actor.noProgressFor>=state.policy.noProgressSeconds
  ){
    actor.encounterAttempted=true;
    actor.encounterCount+=1;
    captureTrigger(state,actor,partnerId);

    if(actor.passingSide===0){
      actor.mode="BLOCKED_NO_CONVENTION";
    }else{
      actor.mode="SIDESTEP";
      actor.sidestepFor=0;
      actor.noProgressFor=0;
    }
  }
}

export function createDynamicEncounterState({
  passingSideA=0,
  passingSideB=0,
  world={width:1400,height:700},
  startA={x:350,y:350},
  startB={x:1050,y:350},
  targetA={x:1050,y:350},
  targetB={x:350,y:350},
  radius=36,
  speed=DEFAULT_SPEED,
  noProgressSeconds=0.45,
  progressEpsilon=0.35,
  sidestepSeconds=0.80,
  arrivalTolerance=3,
  trialDuration=8
}={}){
  const sideA=normalizePassingSide(passingSideA,"passingSideA");
  const sideB=normalizePassingSide(passingSideB,"passingSideB");
  const targetAPoint=point(targetA,"targetA");
  const targetBPoint=point(targetB,"targetB");
  const bodyA=createContactBody({
    id:"A",
    position:point(startA,"startA"),
    radius:positive(radius,"radius"),
    mass:1,
    motorAuthority:1,
    contactResistance:1,
    desiredVelocity:{x:speed,y:0},
    maxSpeed:positive(speed,"speed")
  });
  const bodyB=createContactBody({
    id:"B",
    position:point(startB,"startB"),
    radius:positive(radius,"radius"),
    mass:1,
    motorAuthority:1,
    contactResistance:1,
    desiredVelocity:{x:-speed,y:0},
    maxSpeed:positive(speed,"speed")
  });

  const actorState=(body,target,passingSide)=>({
    bodyId:body.id,
    target,
    passingSide,
    mode:"DIRECT",
    bestGoalDistance:distance(body,target),
    goalDistance:distance(body,target),
    noProgressFor:0,
    sidestepFor:0,
    encounterAttempted:false,
    encounterCount:0,
    trigger:null
  });

  return {
    schema:DYNAMIC_ENCOUNTER_SCHEMA,
    world:{
      width:positive(world.width,"world.width"),
      height:positive(world.height,"world.height")
    },
    bodies:[bodyA,bodyB],
    actors:{
      A:actorState(bodyA,targetAPoint,sideA),
      B:actorState(bodyB,targetBPoint,sideB)
    },
    policy:{
      noProgressSeconds:positive(noProgressSeconds,"noProgressSeconds"),
      progressEpsilon:Math.max(0,finite(progressEpsilon,"progressEpsilon")),
      sidestepSeconds:positive(sidestepSeconds,"sidestepSeconds"),
      arrivalTolerance:Math.max(0,finite(arrivalTolerance,"arrivalTolerance"))
    },
    time:0,
    trialDuration:positive(trialDuration,"trialDuration"),
    status:"RUNNING",
    firstContactTime:null,
    lastContacts:[],
    contactPairsThisStep:0,
    totalContactPairSteps:0,
    pairChecksThisStep:0,
    contactResolutionsThisStep:0,
    solverIterationsUsed:0,
    totalPairChecks:0,
    totalContactResolutions:0,
    totalSolverIterations:0
  };
}

export function setDynamicEncounterPassingSide(state,actorId,value){
  const actor=state?.actors?.[actorId];
  if(!actor) throw new Error(`unknown dynamic encounter actor: ${actorId}`);
  actor.passingSide=normalizePassingSide(value,`passingSide${actorId}`);
  return actor.passingSide;
}

export function stepDynamicEncounterState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status!=="RUNNING") return state;

  for(const key of ["A","B"]){
    const actor=state.actors[key];
    const body=state.bodies.find(candidate=>candidate.id===actor.bodyId);
    body.desiredVelocity=desiredFor(actor,body);
  }

  const beforeContacts=state.totalContactPairSteps;
  stepContactWorld(state,delta,{iterations:12,pairOrder:"forward"});
  if(state.firstContactTime===null && state.totalContactPairSteps>beforeContacts){
    state.firstContactTime=state.time;
  }

  for(const key of ["A","B"]){
    const actor=state.actors[key];
    const body=state.bodies.find(candidate=>candidate.id===actor.bodyId);
    updateActorAfterContact(state,actor,body,delta);
  }

  if(state.actors.A.mode==="ARRIVED" && state.actors.B.mode==="ARRIVED"){
    state.status="COMPLETE";
  }else if(state.time+EPS>=state.trialDuration){
    state.status="TRIAL_EXPIRED";
  }
  return state;
}

export function dynamicEncounterSnapshot(state){
  const bodyById=new Map(state.bodies.map(body=>[body.id,body]));
  const actors={};
  for(const key of ["A","B"]){
    const actor=state.actors[key];
    const body=bodyById.get(actor.bodyId);
    actors[key]={
      mode:actor.mode,
      passingSide:actor.passingSide,
      target:{...actor.target},
      position:{x:body.x,y:body.y},
      velocity:{x:body.vx,y:body.vy},
      desiredVelocity:{...body.desiredVelocity},
      goalDistance:actor.goalDistance,
      bestGoalDistance:actor.bestGoalDistance,
      noProgressFor:actor.noProgressFor,
      encounterAttempted:actor.encounterAttempted,
      encounterCount:actor.encounterCount,
      trigger:actor.trigger ? structuredClone(actor.trigger) : null
    };
  }

  return {
    schema:DYNAMIC_ENCOUNTER_SCHEMA,
    time:state.time,
    status:state.status,
    firstContactTime:state.firstContactTime,
    contactPairSteps:state.totalContactPairSteps,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions,
    actors
  };
}

export function runDynamicEncounterTrial(options={}){
  const state=createDynamicEncounterState(options);
  const steps=Math.ceil(state.trialDuration*120)+2;
  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepDynamicEncounterState(state,1/120);
  }
  return dynamicEncounterSnapshot(state);
}
