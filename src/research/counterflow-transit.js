import {
  createContactBody,
  stepContactWorld
} from "./contact-semantics.js";
import {
  createFlowTruthLedger,
  requestFlowDemand,
  admitFlowParticipant,
  completeFlowTransit,
  flowTruthLedgerSnapshot
} from "./flow-truth-ledger.js";
import {
  TRANSIT_SCENARIO_SCHEMA,
  buildTransitScenarioContract
} from "./transit-scenario-contract.js";

export const COUNTERFLOW_TRANSIT_SCHEMA="combat-lab-counterflow-transit-s1-v0";
export const COUNTERFLOW_SOLVER_ITERATION_LIMIT=12;

const EPS=1e-9;
const SIDES=Object.freeze(["eastbound","westbound"]);

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

function nonNegative(value,label){
  const n=finite(value,label);
  if(n<0) throw new Error(`${label} must be non-negative`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function normalizeScenario(value){
  const scenario=value && value.schema===TRANSIT_SCENARIO_SCHEMA
    ? structuredClone(value)
    : buildTransitScenarioContract(value || {});

  if(scenario.flowMode!=="counterflow"){
    throw new Error("S1-2B requires flowMode=counterflow");
  }
  if(scenario.trajectoryMode!=="straight"){
    throw new Error("S1-2B requires trajectoryMode=straight");
  }
  if(scenario.completionMode!=="sink-retire"){
    throw new Error("S1-2B requires completionMode=sink-retire");
  }
  if(scenario.breakMode!=="ordinary-valid"){
    throw new Error("S1-2B requires breakMode=ordinary-valid");
  }
  if(scenario.demand.eastbound<=0 || scenario.demand.westbound<=0){
    throw new Error("S1-2B counterflow requires positive demand on both sides");
  }
  return scenario;
}

function assertPortalFits(portal,radius,world,label){
  if(
    portal.x-radius<0 ||
    portal.x+radius>world.width ||
    portal.y-radius<0 ||
    portal.y+radius>world.height
  ){
    throw new Error(`${label} body envelope must fit inside world`);
  }
}

function bodySurfaceGapAtPoint(position,radius,body){
  return Math.hypot(body.x-position.x,body.y-position.y)-radius-body.radius;
}

function minPairSurfaceGap(bodies){
  let min=null;
  for(let i=0;i<bodies.length;i++){
    for(let j=i+1;j<bodies.length;j++){
      const a=bodies[i];
      const b=bodies[j];
      const gap=Math.hypot(b.x-a.x,b.y-a.y)-a.radius-b.radius;
      min=min===null ? gap : Math.min(min,gap);
    }
  }
  return min;
}

function sourceForSide(state,side){
  if(!SIDES.includes(side)) throw new Error(`unknown counterflow side: ${side}`);
  return state.sources[side];
}

export function auditCounterflowPortal(state,side){
  const source=sourceForSide(state,side);
  let blockingBodyId=null;
  let minSurfaceGap=null;

  for(const body of state.bodies){
    const gap=bodySurfaceGapAtPoint(source,state.radius,body);
    if(minSurfaceGap===null || gap<minSurfaceGap){
      minSurfaceGap=gap;
      blockingBodyId=body.id;
    }
  }

  const worldClear=(
    source.x-state.radius>=0 &&
    source.x+state.radius<=state.world.width &&
    source.y-state.radius>=0 &&
    source.y+state.radius<=state.world.height
  );
  const bodyClear=minSurfaceGap===null ||
    minSurfaceGap+EPS>=state.admissionClearance;

  return {
    side,
    clear:worldClear && bodyClear,
    worldClear,
    bodyClear,
    blockingBodyId:bodyClear ? null : blockingBodyId,
    minSurfaceGap,
    source:{...source}
  };
}

export function createCounterflowTransitState({
  scenario=buildTransitScenarioContract({
    demand:{eastbound:8,westbound:8},
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  }),
  world={width:1200,height:400},
  westPortal={x:100,y:200},
  eastPortal={x:1100,y:200},
  radius=20,
  speed=120,
  admissionClearance=0,
  trialDuration=12
}={}){
  const contract=normalizeScenario(scenario);
  const width=positive(world.width,"world.width");
  const height=positive(world.height,"world.height");
  const west=point(westPortal,"westPortal");
  const east=point(eastPortal,"eastPortal");
  const bodyRadius=positive(radius,"radius");

  if(east.x<=west.x+bodyRadius*2){
    throw new Error("eastPortal must be physically separated to the right of westPortal");
  }

  const normalizedWorld={width,height};
  assertPortalFits(west,bodyRadius,normalizedWorld,"westPortal");
  assertPortalFits(east,bodyRadius,normalizedWorld,"eastPortal");

  const ledger=createFlowTruthLedger({sides:SIDES});
  requestFlowDemand(ledger,{
    side:"eastbound",
    count:contract.demand.eastbound,
    time:0
  });
  requestFlowDemand(ledger,{
    side:"westbound",
    count:contract.demand.westbound,
    time:0
  });

  return {
    schema:COUNTERFLOW_TRANSIT_SCHEMA,
    scenario:contract,
    world:normalizedWorld,
    sources:{
      eastbound:west,
      westbound:east
    },
    sinks:{
      eastbound:{x:east.x,id:"east-sink"},
      westbound:{x:west.x,id:"west-sink"}
    },
    radius:bodyRadius,
    speed:positive(speed,"speed"),
    admissionClearance:nonNegative(admissionClearance,"admissionClearance"),
    trialDuration:positive(trialDuration,"trialDuration"),
    time:0,
    status:"RUNNING",
    bodies:[],
    ledger,
    admissionHistory:[],
    completionHistory:[],
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
}

export function tryAdmitCounterflowSide(state,side){
  if(state.status!=="RUNNING") return null;
  sourceForSide(state,side);

  const ledger=flowTruthLedgerSnapshot(state.ledger);
  const sideTruth=ledger.perSide[side];
  if(!sideTruth || sideTruth.queued===0) return null;

  const audit=auditCounterflowPortal(state,side);
  if(!audit.clear) return null;

  const participant=admitFlowParticipant(state.ledger,{
    side,
    time:state.time
  });
  const direction=side==="eastbound" ? 1 : -1;
  const body=createContactBody({
    id:participant.id,
    position:state.sources[side],
    radius:state.radius,
    mass:1,
    motorAuthority:1,
    contactResistance:1,
    desiredVelocity:{x:direction*state.speed,y:0},
    velocity:{x:0,y:0},
    maxSpeed:state.speed
  });
  body.flowSide=side;
  state.bodies.push(body);
  state.admissionHistory.push({
    time:state.time,
    participantId:participant.id,
    side,
    portalAudit:structuredClone(audit)
  });
  return body;
}

function completeSinkCrossings(state){
  const completed=state.bodies
    .filter(body=>{
      if(body.flowSide==="eastbound"){
        return body.x+EPS>=state.sinks.eastbound.x;
      }
      return body.x-EPS<=state.sinks.westbound.x;
    })
    .sort((a,b)=>a.id.localeCompare(b.id));

  if(completed.length===0) return;

  const completedIds=new Set();
  for(const body of completed){
    const sink=state.sinks[body.flowSide];
    const participant=completeFlowTransit(state.ledger,{
      id:body.id,
      time:state.time,
      sink:sink.id
    });
    state.completionHistory.push({
      time:state.time,
      participantId:body.id,
      side:body.flowSide,
      sink:participant.sink,
      crossingPosition:{x:body.x,y:body.y}
    });
    completedIds.add(body.id);
  }
  state.bodies=state.bodies.filter(body=>!completedIds.has(body.id));
}

export function stepCounterflowTransitState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status!=="RUNNING") return state;

  tryAdmitCounterflowSide(state,"eastbound");
  tryAdmitCounterflowSide(state,"westbound");

  for(const body of state.bodies){
    const direction=body.flowSide==="eastbound" ? 1 : -1;
    body.desiredVelocity={x:direction*state.speed,y:0};
  }

  stepContactWorld(state,delta,{iterations:COUNTERFLOW_SOLVER_ITERATION_LIMIT,pairOrder:"forward"});
  completeSinkCrossings(state);

  const ledger=flowTruthLedgerSnapshot(state.ledger);
  if(
    ledger.totals.completed===ledger.totals.demanded &&
    ledger.totals.active===0 &&
    ledger.totals.queued===0
  ){
    state.status="COMPLETE";
  }else if(state.time+EPS>=state.trialDuration){
    state.status="TRIAL_EXPIRED";
  }

  return state;
}

export function counterflowTransitSnapshot(state){
  const ledger=flowTruthLedgerSnapshot(state.ledger);
  return {
    schema:COUNTERFLOW_TRANSIT_SCHEMA,
    time:state.time,
    status:state.status,
    scenario:structuredClone(state.scenario),
    world:{...state.world},
    sources:structuredClone(state.sources),
    sinks:structuredClone(state.sinks),
    radius:state.radius,
    speed:state.speed,
    admissionClearance:state.admissionClearance,
    ledger,
    bodies:state.bodies.map(body=>({
      id:body.id,
      side:body.flowSide,
      x:body.x,
      y:body.y,
      vx:body.vx,
      vy:body.vy,
      radius:body.radius
    })),
    physicalActiveCount:state.bodies.length,
    minPairSurfaceGap:minPairSurfaceGap(state.bodies),
    admissionHistory:state.admissionHistory.map(item=>structuredClone(item)),
    completionHistory:state.completionHistory.map(item=>structuredClone(item)),
    solverIterationLimit:COUNTERFLOW_SOLVER_ITERATION_LIMIT,
    solverIterationsUsed:state.solverIterationsUsed,
    pairChecksThisStep:state.pairChecksThisStep,
    contactResolutionsThisStep:state.contactResolutionsThisStep,
    contactPairsThisStep:state.contactPairsThisStep,
    totalContactPairSteps:state.totalContactPairSteps,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions
  };
}

export function runCounterflowTransitTrial(options={}){
  const state=createCounterflowTransitState(options);
  const steps=Math.ceil(state.trialDuration*120)+2;
  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepCounterflowTransitState(state,1/120);
  }
  return counterflowTransitSnapshot(state);
}
