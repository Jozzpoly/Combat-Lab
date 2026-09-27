import {
  applyCandidateContactMotor,
  createContactBody,
  solveCandidateContactPairs
} from "./contact-semantics.js";
import {
  projectStaticCircleOut,
  queryStaticCircleOccupancy,
  queryStaticCircleTraversal
} from "./static-feasibility.js";
import {findStaticRouteWitness} from "./static-route-witness.js";

export const INTEGRATED_ECOLOGY_SCHEMA="combat-lab-integrated-ecology-v0";
const EPS=1e-9;

const DEFAULT_WORLD={width:1100,height:700};
const DEFAULT_OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

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
  return d<EPS ? {x:0,y:0} : {x:dx/d,y:dy/d};
}

function yFor(rank,slots){
  const minY=110;
  const maxY=690;
  const span=maxY-minY;
  return minY+(rank+0.5)*span/slots;
}

function sideSpecs(sideCount,side,world){
  const offset=Math.max(1,Math.floor(sideCount/3));
  const specs=[];
  for(let rank=0;rank<sideCount;rank++){
    const targetRank=side==="left"
      ? (rank+offset)%sideCount
      : (rank-offset+sideCount)%sideCount;
    const startY=yFor(rank,sideCount);
    const targetY=yFor(targetRank,sideCount);
    specs.push({
      side,
      rank,
      start:{
        x:side==="left" ? 120 : world.width-120,
        y:startY
      },
      target:{
        x:side==="left" ? world.width-120 : 120,
        y:targetY
      }
    });
  }
  return specs;
}

export function buildDistributedCounterflowTopology(count,{world=DEFAULT_WORLD}={}){
  const n=Math.floor(positive(count,"count"));
  if(n<4) throw new Error("integrated topology requires at least 4 actors");
  const leftCount=Math.ceil(n/2);
  const rightCount=n-leftCount;
  const specs=[
    ...sideSpecs(leftCount,"left",world),
    ...sideSpecs(rightCount,"right",world)
  ];

  return specs.map((spec,index)=>({
    id:`resident-${index+1}`,
    ...spec
  }));
}

function topologyEvidence(specs,world){
  const keys=specs.map(spec=>
    `${spec.target.x.toFixed(6)},${spec.target.y.toFixed(6)}`
  );
  const multiplicities=new Map();
  for(const key of keys) multiplicities.set(key,(multiplicities.get(key)||0)+1);
  const centerX=world.width/2;
  const centerY=world.height/2;
  return {
    kind:"distributed-counterflow-band",
    actorCount:specs.length,
    uniqueTargetCount:new Set(keys).size,
    maxTargetMultiplicity:Math.max(...multiplicities.values()),
    centerTargetCount:specs.filter(spec=>
      Math.hypot(spec.target.x-centerX,spec.target.y-centerY)<80
    ).length
  };
}

function phenotypeFor(index){
  const variants=[
    {radius:20,mass:0.8,motorAuthority:1.25,contactResistance:0.65},
    {radius:26,mass:1.2,motorAuthority:1.00,contactResistance:1.00},
    {radius:32,mass:2.0,motorAuthority:0.80,contactResistance:1.80}
  ];
  return variants[index%variants.length];
}

function currentWaypoint(actor){
  if(actor.mode==="ROUTE" && actor.route.length){
    return actor.route[Math.min(actor.routeIndex,actor.route.length-1)];
  }
  if(actor.mode==="SIDESTEP"){
    return actor.resumeWaypoint || actor.target;
  }
  return actor.target;
}

function preferredVelocity(actor,body){
  if(actor.mode==="ARRIVED" || actor.mode==="STATIC_STUCK_NO_WITNESS"){
    return {x:0,y:0};
  }
  const waypoint=currentWaypoint(actor);
  const forward=normalizedToward(body,waypoint);

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

function contactPartner(state,bodyId){
  for(const contact of state.lastContacts || []){
    if(contact.a===bodyId) return contact.b;
    if(contact.b===bodyId) return contact.a;
  }
  return null;
}

function integrateAgainstStatic(state,actor,body,dt){
  const proposed={x:body.x+body.vx*dt,y:body.y+body.vy*dt};
  const traversal=queryStaticCircleTraversal({
    from:{x:body.x,y:body.y},
    to:proposed,
    radius:body.radius,
    world:state.world,
    obstacles:state.obstacles
  });
  actor.staticBlockerThisStep=null;

  if(traversal.clear){
    body.x=proposed.x;
    body.y=proposed.y;
    return;
  }

  actor.staticBlockerThisStep=traversal.blocker?.id || "static";
  const fraction=Math.max(0,Number(traversal.blocker?.fraction || 0)-1e-7);
  body.x+=(proposed.x-body.x)*fraction;
  body.y+=(proposed.y-body.y)*fraction;

  const normal=traversal.blocker?.normal || {x:0,y:0};
  const into=body.vx*normal.x+body.vy*normal.y;
  if(into<0){
    body.vx-=into*normal.x;
    body.vy-=into*normal.y;
  }
}

function updateRouteWaypoint(actor,body,tolerance){
  if(actor.mode!=="ROUTE" || actor.route.length===0) return;
  while(
    actor.routeIndex<actor.route.length &&
    distance(body,actor.route[actor.routeIndex])<=tolerance
  ){
    actor.routeIndex+=1;
  }
  if(actor.routeIndex>=actor.route.length){
    actor.route=[];
    actor.routeIndex=0;
    actor.mode="DIRECT";
  }
}

function attemptStaticReplan(state,actor,body){
  actor.staticReplanAttempted=true;
  const witness=findStaticRouteWitness({
    from:{x:body.x,y:body.y},
    to:actor.target,
    radius:body.radius,
    clearance:state.policy.staticClearance,
    world:state.world,
    obstacles:state.obstacles
  });
  actor.staticWitness=structuredClone(witness);
  actor.staticTrigger={
    time:state.time,
    blocker:actor.staticBlockerThisStep,
    noProgressFor:actor.staticNoProgressFor,
    goalDistance:actor.goalDistance
  };

  if(witness.status==="witness"){
    actor.route=witness.waypoints.map(point=>({...point}));
    actor.routeIndex=0;
    actor.mode="ROUTE";
    actor.staticReplanCount+=1;
    actor.staticNoProgressFor=0;
  }else if(witness.status==="direct"){
    actor.mode="DIRECT";
    actor.staticReplanCount+=1;
    actor.staticNoProgressFor=0;
  }else{
    actor.mode="STATIC_STUCK_NO_WITNESS";
  }
}

function attemptDynamicEncounter(state,actor,partnerId){
  actor.dynamicEncounterAttempted=true;
  actor.dynamicEncounterCount+=1;
  actor.dynamicTrigger={
    time:state.time,
    partnerId,
    noProgressFor:actor.dynamicNoProgressFor,
    passingSide:actor.passingSide,
    planMode:actor.mode
  };

  if(actor.passingSide===0){
    actor.mode="DYNAMIC_BLOCKED_NO_CONVENTION";
    return;
  }

  actor.resumeMode=actor.mode==="ROUTE" ? "ROUTE" : "DIRECT";
  actor.resumeWaypoint={...currentWaypoint(actor)};
  actor.mode="SIDESTEP";
  actor.sidestepFor=0;
  actor.dynamicNoProgressFor=0;
}

function updateActor(state,actor,body,dt){
  const goalDistance=distance(body,actor.target);
  actor.goalDistance=goalDistance;

  if(goalDistance<=state.policy.arrivalTolerance){
    actor.mode="ARRIVED";
    actor.goalDistance=0;
    body.vx=0;
    body.vy=0;
    body.desiredVelocity={x:0,y:0};
    return;
  }

  if(actor.mode==="SIDESTEP"){
    actor.sidestepFor+=dt;
    actor.staticNoProgressFor=0;
    actor.dynamicNoProgressFor=0;
    if(actor.sidestepFor>=state.policy.sidestepSeconds){
      actor.mode=actor.resumeMode || "DIRECT";
      actor.resumeMode=null;
      actor.resumeWaypoint=null;
    }
    return;
  }

  updateRouteWaypoint(actor,body,state.policy.arrivalTolerance);

  const planAfter=distance(body,actor.stepWaypoint);
  const planProgress=actor.stepPlanDistanceBefore-planAfter;
  const progressed=planProgress>state.policy.progressEpsilon;

  if(
    actor.staticBlockerThisStep &&
    !actor.staticReplanAttempted &&
    actor.mode==="DIRECT"
  ){
    actor.staticNoProgressFor=progressed ? 0 : actor.staticNoProgressFor+dt;
    if(actor.staticNoProgressFor>=state.policy.staticNoProgressSeconds){
      attemptStaticReplan(state,actor,body);
      return;
    }
  }else{
    actor.staticNoProgressFor=0;
  }

  const partnerId=contactPartner(state,actor.bodyId);
  if(
    partnerId &&
    !actor.staticBlockerThisStep &&
    !actor.dynamicEncounterAttempted &&
    actor.mode!=="STATIC_STUCK_NO_WITNESS"
  ){
    actor.dynamicNoProgressFor=progressed ? 0 : actor.dynamicNoProgressFor+dt;
    if(actor.dynamicNoProgressFor>=state.policy.dynamicNoProgressSeconds){
      attemptDynamicEncounter(state,actor,partnerId);
    }
  }else if(actor.mode!=="DYNAMIC_BLOCKED_NO_CONVENTION"){
    actor.dynamicNoProgressFor=0;
  }
}

function staticOverlapCount(state){
  let violations=0;
  for(const body of state.bodies){
    const occupancy=queryStaticCircleOccupancy({
      center:{x:body.x,y:body.y},
      radius:body.radius,
      world:state.world,
      obstacles:state.obstacles
    });
    if(!occupancy.clear) violations+=1;
  }
  return violations;
}

function dynamicOverlapCount(state){
  let violations=0;
  for(let i=0;i<state.bodies.length;i++){
    for(let j=i+1;j<state.bodies.length;j++){
      const a=state.bodies[i];
      const b=state.bodies[j];
      const minDistance=a.radius+b.radius;
      if(Math.hypot(b.x-a.x,b.y-a.y)<minDistance-EPS) violations+=1;
    }
  }
  return violations;
}

function projectBodiesOutOfStatic(state){
  let corrections=0;
  for(const body of state.bodies){
    const before={x:body.x,y:body.y};
    const projected=projectStaticCircleOut({
      center:before,
      radius:body.radius,
      world:state.world,
      obstacles:state.obstacles,
      maxIterations:12
    });
    if(projected.moved){
      body.x=projected.center.x;
      body.y=projected.center.y;
      corrections+=projected.contacts.length;

      for(const contact of projected.contacts){
        const into=body.vx*contact.normal.x+body.vy*contact.normal.y;
        if(into<0){
          body.vx-=into*contact.normal.x;
          body.vy-=into*contact.normal.y;
        }
      }
    }

    if(!projected.clear){
      state.lastUnresolvedStaticProjection={
        time:state.time,
        bodyId:body.id,
        radius:body.radius,
        before,
        after:{...projected.center},
        blocker:structuredClone(projected.blocker),
        contacts:projected.contacts.map(contact=>structuredClone(contact))
      };
    }
  }
  return corrections;
}

function solveCoupledConstraints(state,{passes=8}={}){
  const startPairChecks=state.totalPairChecks;
  const startResolutions=state.totalContactResolutions;
  const startIterations=state.totalSolverIterations;
  const startContactPairSteps=state.totalContactPairSteps;
  const contactByPair=new Map();
  let staticCorrections=0;
  let passesUsed=0;

  for(let pass=0;pass<passes;pass++){
    passesUsed+=1;
    solveCandidateContactPairs(state,{iterations:12,pairOrder:"forward"});
    for(const contact of state.lastContacts || []){
      const key=contact.a<contact.b
        ? `${contact.a}<->${contact.b}`
        : `${contact.b}<->${contact.a}`;
      if(!contactByPair.has(key)) contactByPair.set(key,structuredClone(contact));
    }

    staticCorrections+=projectBodiesOutOfStatic(state);
    if(staticOverlapCount(state)===0 && dynamicOverlapCount(state)===0) break;
  }

  state.contactPairsThisStep=contactByPair.size;
  state.totalContactPairSteps=startContactPairSteps+contactByPair.size;
  state.pairChecksThisStep=state.totalPairChecks-startPairChecks;
  state.contactResolutionsThisStep=state.totalContactResolutions-startResolutions;
  state.solverIterationsUsed=state.totalSolverIterations-startIterations;
  state.lastContacts=[...contactByPair.values()];
  state.staticProjectionCorrectionsThisStep=staticCorrections;
  state.totalStaticProjectionCorrections+=staticCorrections;
  state.coupledPassesThisStep=passesUsed;
  state.totalCoupledPasses+=passesUsed;
}

export function createIntegratedEcologyState({
  count=8,
  passingSide=1,
  world=DEFAULT_WORLD,
  obstacles=DEFAULT_OBSTACLES,
  trialDuration=10
}={}){
  const side=normalizePassingSide(passingSide);
  const normalizedWorld={
    width:positive(world.width,"world.width"),
    height:positive(world.height,"world.height")
  };
  const normalizedObstacles=obstacles.map((item,index)=>({
    id:String(item.id || `obstacle-${index}`),
    x:finite(item.x,`obstacles[${index}].x`),
    y:finite(item.y,`obstacles[${index}].y`),
    w:positive(item.w ?? item.width,`obstacles[${index}].w`),
    h:positive(item.h ?? item.height,`obstacles[${index}].h`)
  }));
  const specs=buildDistributedCounterflowTopology(count,{world:normalizedWorld});

  const bodies=specs.map((spec,index)=>{
    const phenotype=phenotypeFor(index);
    return createContactBody({
      id:spec.id,
      position:spec.start,
      radius:phenotype.radius,
      mass:phenotype.mass,
      motorAuthority:phenotype.motorAuthority,
      contactResistance:phenotype.contactResistance,
      desiredVelocity:{x:0,y:0},
      maxSpeed:140
    });
  });

  const actors={};
  for(const [index,spec] of specs.entries()){
    const body=bodies[index];
    actors[body.id]={
      bodyId:body.id,
      phenotype:index%3,
      target:{...spec.target},
      passingSide:side,
      mode:"DIRECT",
      route:[],
      routeIndex:0,
      resumeMode:null,
      resumeWaypoint:null,
      goalDistance:distance(body,spec.target),
      stepWaypoint:{...spec.target},
      stepPlanDistanceBefore:distance(body,spec.target),
      staticBlockerThisStep:null,
      staticNoProgressFor:0,
      staticReplanAttempted:false,
      staticReplanCount:0,
      staticTrigger:null,
      staticWitness:null,
      dynamicNoProgressFor:0,
      dynamicEncounterAttempted:false,
      dynamicEncounterCount:0,
      dynamicTrigger:null,
      sidestepFor:0
    };
  }

  return {
    schema:INTEGRATED_ECOLOGY_SCHEMA,
    world:normalizedWorld,
    obstacles:normalizedObstacles,
    topology:topologyEvidence(specs,normalizedWorld),
    time:0,
    trialDuration:positive(trialDuration,"trialDuration"),
    status:"RUNNING",
    bodies,
    actors,
    policy:{
      staticClearance:8,
      staticNoProgressSeconds:0.55,
      dynamicNoProgressSeconds:0.42,
      progressEpsilon:0.04,
      sidestepSeconds:0.80,
      arrivalTolerance:5
    },
    contactPairsThisStep:0,
    totalContactPairSteps:0,
    pairChecksThisStep:0,
    contactResolutionsThisStep:0,
    solverIterationsUsed:0,
    totalPairChecks:0,
    totalContactResolutions:0,
    totalSolverIterations:0,
    lastContacts:[],
    staticOverlapViolations:0,
    dynamicOverlapViolations:0,
    staticProjectionCorrectionsThisStep:0,
    totalStaticProjectionCorrections:0,
    coupledPassesThisStep:0,
    totalCoupledPasses:0,
    lastUnresolvedStaticProjection:null,
    initialTotalDistance:bodies.reduce((sum,body)=>
      sum+distance(body,actors[body.id].target),0
    )
  };
}

export function stepIntegratedEcologyState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status!=="RUNNING") return state;

  for(const body of state.bodies){
    const actor=state.actors[body.id];
    updateRouteWaypoint(actor,body,state.policy.arrivalTolerance);
    const waypoint=currentWaypoint(actor);
    actor.stepWaypoint={...waypoint};
    actor.stepPlanDistanceBefore=distance(body,waypoint);
    body.desiredVelocity=preferredVelocity(actor,body);
    applyCandidateContactMotor(body,delta);
    integrateAgainstStatic(state,actor,body,delta);
  }

  solveCoupledConstraints(state,{passes:8});
  state.staticOverlapViolations+=staticOverlapCount(state);
  state.dynamicOverlapViolations+=dynamicOverlapCount(state);
  state.time+=delta;

  for(const body of state.bodies){
    updateActor(state,state.actors[body.id],body,delta);
  }

  const arrived=Object.values(state.actors).filter(actor=>actor.mode==="ARRIVED").length;
  if(arrived===state.bodies.length){
    state.status="COMPLETE";
  }else if(state.time+EPS>=state.trialDuration){
    state.status="TRIAL_EXPIRED";
  }

  return state;
}

export function integratedEcologySnapshot(state){
  const actorValues=Object.values(state.actors);
  const arrived=actorValues.filter(actor=>actor.mode==="ARRIVED").length;
  const staticReplans=actorValues.reduce((sum,actor)=>sum+actor.staticReplanCount,0);
  const dynamicEncounters=actorValues.reduce((sum,actor)=>sum+actor.dynamicEncounterCount,0);
  const noConventionBlocks=actorValues.filter(actor=>actor.mode==="DYNAMIC_BLOCKED_NO_CONVENTION").length;
  const totalInitialDistance=state.initialTotalDistance;
  const totalRemainingDistance=state.bodies.reduce((sum,body)=>
    sum+distance(body,state.actors[body.id].target),0
  );

  return {
    schema:INTEGRATED_ECOLOGY_SCHEMA,
    time:state.time,
    status:state.status,
    topology:structuredClone(state.topology),
    population:state.bodies.length,
    arrived,
    staticReplans,
    dynamicEncounters,
    noConventionBlocks,
    staticOverlapViolations:state.staticOverlapViolations,
    dynamicOverlapViolations:state.dynamicOverlapViolations,
    staticProjectionCorrections:state.totalStaticProjectionCorrections,
    coupledPasses:state.totalCoupledPasses,
    lastUnresolvedStaticProjection:state.lastUnresolvedStaticProjection
      ? structuredClone(state.lastUnresolvedStaticProjection)
      : null,
    contactPairSteps:state.totalContactPairSteps,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions,
    solverIterations:state.totalSolverIterations,
    totalInitialDistance,
    totalRemainingDistance,
    actors:Object.fromEntries(state.bodies.map(body=>{
      const actor=state.actors[body.id];
      return [body.id,{
        phenotype:actor.phenotype,
        mode:actor.mode,
        passingSide:actor.passingSide,
        position:{x:body.x,y:body.y},
        target:{...actor.target},
        goalDistance:distance(body,actor.target),
        staticReplanCount:actor.staticReplanCount,
        dynamicEncounterCount:actor.dynamicEncounterCount,
        staticTrigger:actor.staticTrigger ? structuredClone(actor.staticTrigger) : null,
        dynamicTrigger:actor.dynamicTrigger ? structuredClone(actor.dynamicTrigger) : null
      }];
    }))
  };
}

export function runIntegratedEcologyTrial(options={}){
  const state=createIntegratedEcologyState(options);
  const steps=Math.ceil(state.trialDuration*120)+2;
  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepIntegratedEcologyState(state,1/120);
  }
  return integratedEcologySnapshot(state);
}

export const E1_WORLD={...DEFAULT_WORLD};
export const E1_OBSTACLES=DEFAULT_OBSTACLES.map(item=>({...item}));
