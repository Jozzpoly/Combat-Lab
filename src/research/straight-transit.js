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

export const STRAIGHT_TRANSIT_SCHEMA="combat-lab-straight-transit-s1-v0";

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

function nonNegative(value,label){
  const n=finite(value,label);
  if(n<0) throw new Error(`${label} must be non-negative`);
  return n;
}

function nonNegativeInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<0){
    throw new Error(`${label} must be a non-negative integer`);
  }
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
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

export function auditStraightTransitPortal(state){
  const source=state.source;
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
    clear:worldClear && bodyClear,
    worldClear,
    bodyClear,
    blockingBodyId:bodyClear ? null : blockingBodyId,
    minSurfaceGap
  };
}

export function createStraightTransitState({
  demandCount=0,
  side="eastbound",
  world={width:1200,height:400},
  source={x:100,y:200},
  sinkX=1100,
  radius=20,
  speed=120,
  admissionClearance=0,
  trialDuration=12
}={}){
  const width=positive(world.width,"world.width");
  const height=positive(world.height,"world.height");
  const start=point(source,"source");
  const bodyRadius=positive(radius,"radius");
  const targetSink=finite(sinkX,"sinkX");
  const count=nonNegativeInteger(demandCount,"demandCount");

  if(targetSink<=start.x) throw new Error("sinkX must be to the right of source.x");
  if(targetSink+bodyRadius>width) throw new Error("sinkX must leave body envelope inside world");
  if(
    start.x-bodyRadius<0 ||
    start.x+bodyRadius>width ||
    start.y-bodyRadius<0 ||
    start.y+bodyRadius>height
  ){
    throw new Error("source body envelope must fit inside world");
  }

  const ledger=createFlowTruthLedger({sides:[String(side)]});
  if(count>0){
    requestFlowDemand(ledger,{side:String(side),count,time:0});
  }

  return {
    schema:STRAIGHT_TRANSIT_SCHEMA,
    world:{width,height},
    source:start,
    sinkX:targetSink,
    radius:bodyRadius,
    speed:positive(speed,"speed"),
    side:String(side),
    admissionClearance:nonNegative(admissionClearance,"admissionClearance"),
    trialDuration:positive(trialDuration,"trialDuration"),
    time:0,
    status:count===0 ? "COMPLETE" : "RUNNING",
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

export function tryAdmitStraightTransit(state){
  if(state.status!=="RUNNING") return null;
  const ledger=flowTruthLedgerSnapshot(state.ledger);
  const sideTruth=ledger.perSide[state.side];
  if(!sideTruth || sideTruth.queued===0) return null;

  const audit=auditStraightTransitPortal(state);
  if(!audit.clear) return null;

  const participant=admitFlowParticipant(state.ledger,{
    side:state.side,
    time:state.time
  });

  const body=createContactBody({
    id:participant.id,
    position:state.source,
    radius:state.radius,
    mass:1,
    motorAuthority:1,
    contactResistance:1,
    desiredVelocity:{x:state.speed,y:0},
    velocity:{x:0,y:0},
    maxSpeed:state.speed
  });
  state.bodies.push(body);
  state.admissionHistory.push({
    time:state.time,
    participantId:participant.id,
    portalAudit:structuredClone(audit)
  });
  return body;
}

function completeSinkCrossings(state){
  const completed=state.bodies
    .filter(body=>body.x+EPS>=state.sinkX)
    .sort((a,b)=>a.id.localeCompare(b.id));

  if(completed.length===0) return;

  const completedIds=new Set();
  for(const body of completed){
    const participant=completeFlowTransit(state.ledger,{
      id:body.id,
      time:state.time,
      sink:"east-sink"
    });
    state.completionHistory.push({
      time:state.time,
      participantId:body.id,
      sink:participant.sink,
      crossingPosition:{x:body.x,y:body.y}
    });
    completedIds.add(body.id);
  }
  state.bodies=state.bodies.filter(body=>!completedIds.has(body.id));
}

export function stepStraightTransitState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status!=="RUNNING") return state;

  tryAdmitStraightTransit(state);

  for(const body of state.bodies){
    body.desiredVelocity={x:state.speed,y:0};
  }
  stepContactWorld(state,delta,{iterations:12,pairOrder:"forward"});
  completeSinkCrossings(state);

  const ledger=flowTruthLedgerSnapshot(state.ledger);
  if(
    ledger.totals.demanded>0 &&
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

export function straightTransitSnapshot(state){
  const ledger=flowTruthLedgerSnapshot(state.ledger);
  return {
    schema:STRAIGHT_TRANSIT_SCHEMA,
    time:state.time,
    status:state.status,
    source:{...state.source},
    sinkX:state.sinkX,
    radius:state.radius,
    speed:state.speed,
    admissionClearance:state.admissionClearance,
    ledger,
    bodies:state.bodies.map(body=>({
      id:body.id,
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
    contactPairsThisStep:state.contactPairsThisStep,
    totalContactPairSteps:state.totalContactPairSteps,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions
  };
}

export function runStraightTransitTrial(options={}){
  const state=createStraightTransitState(options);
  const steps=Math.ceil(state.trialDuration*120)+2;
  for(let i=0;i<steps && state.status==="RUNNING";i++){
    stepStraightTransitState(state,1/120);
  }
  return straightTransitSnapshot(state);
}
