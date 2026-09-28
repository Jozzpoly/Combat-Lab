import {
  createContactBody,
  stepContactWorld
} from "./contact-semantics.js";
import {
  createDynamicEncounterEpisodeMonitor,
  dynamicEncounterEpisodeMonitorSnapshot,
  observeDynamicEncounterEpisode
} from "./dynamic-encounter-episode-monitor.js";

export const SEQUENTIAL_DYNAMIC_ENCOUNTERS_SCHEMA="combat-lab-sequential-dynamic-encounters-d1-v0";

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

function normalizePassingSide(value){
  const n=Math.round(finite(value,"passingSide"));
  if(![-1,0,1].includes(n)) throw new Error("passingSide must be -1, 0 or 1");
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

function desiredForA(actor,body){
  if(actor.mode==="ARRIVED") return {x:0,y:0};
  const forward=normalizedToward(body,actor.target);
  if(actor.mode!=="SIDESTEP"){
    return {x:forward.x*body.maxSpeed,y:forward.y*body.maxSpeed};
  }

  const left={x:forward.y,y:-forward.x};
  const lateral={x:left.x*actor.passingSide,y:left.y*actor.passingSide};
  const x=forward.x*0.35+lateral.x;
  const y=forward.y*0.35+lateral.y;
  const d=Math.hypot(x,y);
  return d<EPS
    ? {x:0,y:0}
    : {x:x/d*body.maxSpeed,y:y/d*body.maxSpeed};
}

function desiredForPassive(actor,body){
  if(actor.mode==="DORMANT" || actor.mode==="ARRIVED") return {x:0,y:0};
  const forward=normalizedToward(body,actor.target);
  return {x:forward.x*body.maxSpeed,y:forward.y*body.maxSpeed};
}

function bodyById(state,id){
  const body=state.bodies.find(candidate=>candidate.id===id);
  if(!body) throw new Error(`unknown body: ${id}`);
  return body;
}

function contactPartners(state,id){
  const partners=[];
  for(const contact of state.lastContacts || []){
    if(contact.a===id) partners.push(contact.b);
    else if(contact.b===id) partners.push(contact.a);
  }
  return [...new Set(partners.map(String))].sort();
}

function updatePassiveArrival(state,actor,body){
  if(actor.mode==="DORMANT") return;
  const d=distance(body,actor.target);
  actor.goalDistance=d;
  if(d>state.policy.arrivalTolerance) return;
  body.x=actor.target.x;
  body.y=actor.target.y;
  body.vx=0;
  body.vy=0;
  body.desiredVelocity={x:0,y:0};
  actor.goalDistance=0;
  actor.mode="ARRIVED";
}

function beginEncounter(state,actor,partnerId){
  actor.encounterArmed=false;
  actor.encounterCount+=1;
  actor.episodeId+=1;
  actor.triggerHistory.push({
    episodeId:actor.episodeId,
    time:state.time,
    partnerId:String(partnerId),
    noProgressFor:actor.noProgressFor,
    goalDistance:actor.goalDistance,
    passingSide:actor.passingSide
  });

  actor.monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:String(partnerId),
    requiredClearWindowSeconds:state.policy.rearmClearSeconds,
    progressEpsilon:state.policy.rearmProgressEpsilon
  });

  if(actor.passingSide===0){
    actor.mode="BLOCKED_NO_CONVENTION";
  }else{
    actor.mode="SIDESTEP";
    actor.sidestepFor=0;
    actor.noProgressFor=0;
  }
}

function releaseSecondChallenge(state,boundary){
  if(state.secondChallengeReleased) return;
  if(!boundary?.rearmed) return;
  if(state.actorA.encounterCount!==1) return;

  const a=bodyById(state,"A");
  const partnerId=state.policy.secondChallengePartner;
  const challengeBody=bodyById(state,partnerId);
  const challengeActor=state.passiveActors[partnerId];
  const forward=normalizedToward(a,state.actorA.target);
  const challengePosition={
    x:a.x+forward.x*state.policy.secondChallengeGap,
    y:a.y+forward.y*state.policy.secondChallengeGap
  };
  if(
    challengePosition.x-challengeBody.radius<0 ||
    challengePosition.x+challengeBody.radius>state.world.width ||
    challengePosition.y-challengeBody.radius<0 ||
    challengePosition.y+challengeBody.radius>state.world.height
  ){
    throw new Error("second challenge release would violate world bounds");
  }

  challengeBody.x=challengePosition.x;
  challengeBody.y=challengePosition.y;
  challengeBody.vx=0;
  challengeBody.vy=0;
  challengeBody.desiredVelocity={x:0,y:0};

  challengeActor.mode="DIRECT";
  challengeActor.target={
    x:a.x-forward.x*state.policy.secondChallengeBacktrack,
    y:a.y-forward.y*state.policy.secondChallengeBacktrack
  };
  challengeActor.goalDistance=distance(challengeBody,challengeActor.target);

  state.secondChallengeReleased=true;
  state.releaseHistory.push({
    time:state.time,
    partnerId,
    triggerEpisodeId:state.actorA.episodeId,
    triggerPartnerId:boundary.triggerPartnerId,
    aPosition:{x:a.x,y:a.y},
    aTarget:{...state.actorA.target},
    challengeAxis:{...forward},
    challengePosition:{x:challengeBody.x,y:challengeBody.y},
    challengeTarget:{...challengeActor.target},
    gap:state.policy.secondChallengeGap,
    backtrack:state.policy.secondChallengeBacktrack
  });
}

function updateActorA(state,dt){
  const actor=state.actorA;
  const body=bodyById(state,"A");
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

  const partners=contactPartners(state,"A");
  const partnerId=partners[0] || null;
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
    actor.encounterArmed &&
    partnerId &&
    actor.noProgressFor>=state.policy.noProgressSeconds
  ){
    beginEncounter(state,actor,partnerId);
  }
}

function updateEpisodeBoundary(state){
  const actor=state.actorA;
  if(!actor.monitor || actor.mode==="ARRIVED") return;

  const body=bodyById(state,"A");
  const partners=contactPartners(state,"A");
  for(const partner of partners) actor.contactPartnersSeen.add(partner);

  const out=observeDynamicEncounterEpisode(actor.monitor,{
    time:state.time,
    position:{x:body.x,y:body.y},
    goalDistance:actor.goalDistance,
    contactPartnerIds:partners,
    decisionActive:actor.mode==="SIDESTEP"
  });
  actor.lastEpisodeBoundary=out;

  releaseSecondChallenge(state,out);

  if(
    out.rearmed &&
    state.policy.episodeMode==="episodic" &&
    !actor.encounterArmed
  ){
    actor.encounterArmed=true;
    actor.rearmHistory.push({
      episodeId:actor.episodeId,
      time:state.time,
      triggerPartnerId:out.triggerPartnerId,
      bodyTravel:out.bodyTravel,
      goalImprovement:out.goalImprovement,
      clearWindowSeconds:out.clearWindowSeconds
    });
  }
}

export function createSequentialDynamicEncounterState({
  episodeMode="lifetime",
  passingSideA=1,
  world={width:2000,height:700},
  startA={x:250,y:350},
  startB={x:850,y:350},
  dormantC={x:1900,y:100},
  targetA={x:1750,y:350},
  targetB={x:150,y:350},
  radius=36,
  speed=140,
  noProgressSeconds=0.45,
  progressEpsilon=0.35,
  sidestepSeconds=0.80,
  arrivalTolerance=3,
  rearmClearSeconds=0.35,
  rearmProgressEpsilon=8,
  secondChallengeGap=220,
  secondChallengeBacktrack=500,
  secondChallengePartner="C",
  trialDuration=14
}={}){
  if(!["lifetime","episodic"].includes(String(episodeMode))){
    throw new Error("episodeMode must be lifetime or episodic");
  }
  const r=positive(radius,"radius");
  const s=positive(speed,"speed");
  const challengePartner=String(secondChallengePartner);
  if(!["B","C"].includes(challengePartner)){
    throw new Error("secondChallengePartner must be B or C");
  }
  const side=normalizePassingSide(passingSideA);
  const aStart=point(startA,"startA");
  const bStart=point(startB,"startB");
  const cDormant=point(dormantC,"dormantC");
  const aTarget=point(targetA,"targetA");
  const bTarget=point(targetB,"targetB");

  const bodies=[
    createContactBody({
      id:"A",position:aStart,radius:r,mass:1,motorAuthority:1,
      contactResistance:1,desiredVelocity:{x:s,y:0},maxSpeed:s
    }),
    createContactBody({
      id:"B",position:bStart,radius:r,mass:1,motorAuthority:1,
      contactResistance:1,desiredVelocity:{x:-s,y:0},maxSpeed:s
    }),
    createContactBody({
      id:"C",position:cDormant,radius:r,mass:1,motorAuthority:1,
      contactResistance:1,desiredVelocity:{x:0,y:0},maxSpeed:s
    })
  ];

  return {
    schema:SEQUENTIAL_DYNAMIC_ENCOUNTERS_SCHEMA,
    world:{
      width:positive(world.width,"world.width"),
      height:positive(world.height,"world.height")
    },
    bodies,
    actorA:{
      bodyId:"A",
      target:aTarget,
      passingSide:side,
      mode:"DIRECT",
      bestGoalDistance:distance(aStart,aTarget),
      goalDistance:distance(aStart,aTarget),
      noProgressFor:0,
      sidestepFor:0,
      encounterArmed:true,
      encounterCount:0,
      episodeId:0,
      triggerHistory:[],
      rearmHistory:[],
      monitor:null,
      lastEpisodeBoundary:null,
      contactPartnersSeen:new Set()
    },
    passiveActors:{
      B:{
        bodyId:"B",
        target:bTarget,
        mode:"DIRECT",
        goalDistance:distance(bStart,bTarget)
      },
      C:{
        bodyId:"C",
        target:{...cDormant},
        mode:"DORMANT",
        goalDistance:null
      }
    },
    policy:{
      episodeMode:String(episodeMode),
      noProgressSeconds:positive(noProgressSeconds,"noProgressSeconds"),
      progressEpsilon:Math.max(0,finite(progressEpsilon,"progressEpsilon")),
      sidestepSeconds:positive(sidestepSeconds,"sidestepSeconds"),
      arrivalTolerance:Math.max(0,finite(arrivalTolerance,"arrivalTolerance")),
      rearmClearSeconds:positive(rearmClearSeconds,"rearmClearSeconds"),
      rearmProgressEpsilon:positive(rearmProgressEpsilon,"rearmProgressEpsilon"),
      secondChallengeGap:positive(secondChallengeGap,"secondChallengeGap"),
      secondChallengeBacktrack:positive(secondChallengeBacktrack,"secondChallengeBacktrack"),
      secondChallengePartner:challengePartner
    },
    secondChallengeReleased:false,
    releaseHistory:[],
    time:0,
    trialDuration:positive(trialDuration,"trialDuration"),
    status:"RUNNING",
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

export function stepSequentialDynamicEncounterState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status!=="RUNNING") return state;

  const aBody=bodyById(state,"A");
  aBody.desiredVelocity=desiredForA(state.actorA,aBody);
  for(const id of ["B","C"]){
    const actor=state.passiveActors[id];
    const body=bodyById(state,id);
    body.desiredVelocity=desiredForPassive(actor,body);
  }

  stepContactWorld(state,delta,{iterations:12,pairOrder:"forward"});

  updateActorA(state,delta);
  for(const id of ["B","C"]){
    updatePassiveArrival(state,state.passiveActors[id],bodyById(state,id));
  }
  updateEpisodeBoundary(state);

  if(state.actorA.mode==="ARRIVED"){
    state.status="A_COMPLETE";
  }else if(state.time+EPS>=state.trialDuration){
    state.status="TRIAL_EXPIRED";
  }
  return state;
}

export function sequentialDynamicEncounterSnapshot(state){
  const bodySnapshot=id=>{
    const body=bodyById(state,id);
    return {
      position:{x:body.x,y:body.y},
      velocity:{x:body.vx,y:body.vy},
      desiredVelocity:{...body.desiredVelocity},
      radius:body.radius
    };
  };
  return {
    schema:SEQUENTIAL_DYNAMIC_ENCOUNTERS_SCHEMA,
    time:state.time,
    status:state.status,
    episodeMode:state.policy.episodeMode,
    secondChallengePartner:state.policy.secondChallengePartner,
    secondChallengeReleased:state.secondChallengeReleased,
    releaseHistory:structuredClone(state.releaseHistory),
    actorA:{
      mode:state.actorA.mode,
      position:bodySnapshot("A").position,
      target:{...state.actorA.target},
      goalDistance:state.actorA.goalDistance,
      encounterArmed:state.actorA.encounterArmed,
      encounterCount:state.actorA.encounterCount,
      episodeId:state.actorA.episodeId,
      triggerHistory:structuredClone(state.actorA.triggerHistory),
      rearmHistory:structuredClone(state.actorA.rearmHistory),
      contactPartnersSeen:[...state.actorA.contactPartnersSeen].sort(),
      lastEpisodeBoundary:state.actorA.monitor
        ? dynamicEncounterEpisodeMonitorSnapshot(state.actorA.monitor)
        : null
    },
    passive:{
      B:{mode:state.passiveActors.B.mode,...bodySnapshot("B")},
      C:{mode:state.passiveActors.C.mode,...bodySnapshot("C")}
    },
    lastContacts:(state.lastContacts || []).map(contact=>structuredClone(contact)),
    contactPairSteps:state.totalContactPairSteps,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions
  };
}

export function runSequentialDynamicEncounterTrial(options={}){
  const state=createSequentialDynamicEncounterState(options);
  const steps=Math.ceil(state.trialDuration*120)+2;
  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepSequentialDynamicEncounterState(state,1/120);
  }
  return sequentialDynamicEncounterSnapshot(state);
}
