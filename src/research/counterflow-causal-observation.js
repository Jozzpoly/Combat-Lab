import {
  COUNTERFLOW_SOLVER_ITERATION_LIMIT,
  COUNTERFLOW_TRANSIT_SCHEMA
} from "./counterflow-transit.js";
import {flowTruthLedgerSnapshot} from "./flow-truth-ledger.js";

export const COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA=
  "combat-lab-counterflow-causal-observation-s1-v0";
export const COUNTERFLOW_CONTACT_PROBE_SCHEMA=
  "combat-lab-counterflow-contact-probe-s1-v0";

const EPS=1e-9;

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

function positiveInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<=0){
    throw new Error(label+" must be a positive integer");
  }
  return n;
}

function directionForSide(side){
  if(side==="eastbound") return 1;
  if(side==="westbound") return -1;
  throw new Error("unknown counterflow side: "+String(side));
}

function assertCounterflowState(state){
  if(!state || state.schema!==COUNTERFLOW_TRANSIT_SCHEMA){
    throw new Error("counterflow transit state required");
  }
}

function sorted(values){
  return [...values].sort((a,b)=>String(a).localeCompare(String(b)));
}

function bodyIds(state){
  return sorted(state.bodies.map(body=>body.id));
}

function sameIds(a,b){
  return a.length===b.length && a.every((value,index)=>value===b[index]);
}

function boundaryViolationIds(state){
  const ids=[];
  for(const body of state.bodies){
    if(
      body.x-body.radius < -EPS ||
      body.x+body.radius > state.world.width+EPS ||
      body.y-body.radius < -EPS ||
      body.y+body.radius > state.world.height+EPS
    ){
      ids.push(body.id);
    }
  }
  return sorted(ids);
}

function solverStepContactEvidence(state){
  const ids=new Set();
  const pairs=(state.lastContacts || []).map(contact=>{
    ids.add(contact.a);
    ids.add(contact.b);
    return {
      a:contact.a,
      b:contact.b,
      penetration:contact.penetration,
      impulse:contact.impulse,
      iteration:contact.iteration
    };
  });
  return {
    pairCount:state.contactPairsThisStep || pairs.length,
    bodyCount:ids.size,
    bodyIds:sorted(ids),
    pairs
  };
}

function runtimePlane(runtimeSnapshot){
  if(runtimeSnapshot===null || runtimeSnapshot===undefined){
    return {available:false,snapshot:null};
  }
  return {available:true,snapshot:structuredClone(runtimeSnapshot)};
}

function currentGeometryPlane(probe){
  if(!probe) return {available:false,probe:null};
  return {available:true,probe:structuredClone(probe)};
}

function validateContactProbe(state,probe){
  if(!probe) return;
  if(probe.schema!==COUNTERFLOW_CONTACT_PROBE_SCHEMA){
    throw new Error("counterflow contact probe required");
  }
  if(Math.abs(probe.time-state.time)>EPS){
    throw new Error("contact probe time does not match observed state");
  }
  const currentIds=bodyIds(state);
  if(!sameIds(probe.participantIds,currentIds)){
    throw new Error("contact probe participants do not match observed state");
  }
}

function updateSubject(observer,body,time){
  const direction=directionForSide(body.flowSide);
  let tracker=observer.subjects.get(body.id);
  if(!tracker){
    tracker={
      id:body.id,
      side:body.flowSide,
      anchorX:body.x,
      firstObservedTime:time,
      lastProgressTime:time,
      hasMaterialProgress:false,
      materialProgressEvents:0
    };
    observer.subjects.set(body.id,tracker);
  }else if(tracker.side!==body.flowSide){
    throw new Error("active participant changed flow side: "+body.id);
  }

  let signedProgress=direction*(body.x-tracker.anchorX);
  let materialProgressThisObservation=false;
  if(signedProgress+EPS>=observer.config.progressDistance){
    tracker.anchorX=body.x;
    tracker.lastProgressTime=time;
    tracker.hasMaterialProgress=true;
    tracker.materialProgressEvents+=1;
    signedProgress=0;
    materialProgressThisObservation=true;
  }

  const secondsSinceMaterialProgress=time-tracker.lastProgressTime;
  let progressState="PENDING";
  if(secondsSinceMaterialProgress+EPS>=observer.config.stallSeconds){
    progressState="STALLED";
  }else if(tracker.hasMaterialProgress){
    progressState="PROGRESSING";
  }

  return {
    id:body.id,
    side:body.flowSide,
    progressState,
    materialProgressThisObservation,
    materialProgressEvents:tracker.materialProgressEvents,
    secondsSinceMaterialProgress,
    signedProgressSinceAnchor:signedProgress,
    forwardVelocity:direction*body.vx,
    position:{x:body.x,y:body.y},
    velocity:{x:body.vx,y:body.vy}
  };
}

function contactPartners(pairs){
  const map=new Map();
  for(const pair of pairs){
    if(!map.has(pair.a)) map.set(pair.a,new Set());
    if(!map.has(pair.b)) map.set(pair.b,new Set());
    map.get(pair.a).add(pair.b);
    map.get(pair.b).add(pair.a);
  }
  return map;
}

export function createCounterflowCausalObserver({
  progressDistance=2,
  stallSeconds=0.5,
  recentSolverSamples=120
}={}){
  return {
    schema:COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA,
    config:{
      progressDistance:positive(progressDistance,"progressDistance"),
      stallSeconds:positive(stallSeconds,"stallSeconds"),
      recentSolverSamples:positiveInteger(
        recentSolverSamples,
        "recentSolverSamples"
      )
    },
    subjects:new Map(),
    lastSubjectFacts:new Map(),
    lastObservationTime:null,
    lastAdmitted:null,
    lastCompleted:null,
    peakSolverIterations:0,
    solverSaturationSamples:[],
    lastSolverStepPartners:new Map(),
    lastCurrentGeometryPartners:new Map(),
    lastSnapshot:null
  };
}

export function probeCounterflowCurrentContacts(
  state,
  {contactTolerance=1e-8}={}
){
  assertCounterflowState(state);
  const tolerance=nonNegative(contactTolerance,"contactTolerance");
  const pairs=[];
  const ids=new Set();
  let pairChecks=0;
  let minSurfaceGap=null;
  let maxResidualPenetration=0;
  let penetratingPairCount=0;

  for(let i=0;i<state.bodies.length;i++){
    for(let j=i+1;j<state.bodies.length;j++){
      pairChecks+=1;
      const a=state.bodies[i];
      const b=state.bodies[j];
      const gap=Math.hypot(b.x-a.x,b.y-a.y)-a.radius-b.radius;
      minSurfaceGap=minSurfaceGap===null ? gap : Math.min(minSurfaceGap,gap);
      const penetration=Math.max(0,-gap);
      if(penetration>0){
        penetratingPairCount+=1;
        maxResidualPenetration=Math.max(maxResidualPenetration,penetration);
      }
      if(gap<=tolerance){
        ids.add(a.id);
        ids.add(b.id);
        pairs.push({
          a:a.id,
          b:b.id,
          surfaceGap:gap,
          penetration
        });
      }
    }
  }

  return {
    schema:COUNTERFLOW_CONTACT_PROBE_SCHEMA,
    time:state.time,
    contactTolerance:tolerance,
    participantIds:bodyIds(state),
    pairChecks,
    contactPairCount:pairs.length,
    contactingBodyCount:ids.size,
    contactingBodyIds:sorted(ids),
    penetratingPairCount,
    maxResidualPenetration,
    minSurfaceGap,
    pairs
  };
}

export function observeCounterflowCausalHealth(
  observer,
  state,
  {runtimeSnapshot=null,currentContactProbe=null}={}
){
  if(!observer || observer.schema!==COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA){
    throw new Error("counterflow causal observer required");
  }
  assertCounterflowState(state);
  if(
    observer.lastObservationTime!==null &&
    state.time<observer.lastObservationTime-EPS
  ){
    throw new Error("observation time must be monotonic");
  }
  validateContactProbe(state,currentContactProbe);

  const ledger=flowTruthLedgerSnapshot(state.ledger);
  const admitted=ledger.totals.active+ledger.totals.completed;
  const intervalSeconds=observer.lastObservationTime===null
    ? null
    : state.time-observer.lastObservationTime;
  const admissionRate=(
    intervalSeconds!==null &&
    intervalSeconds>EPS &&
    observer.lastAdmitted!==null
  )
    ? (admitted-observer.lastAdmitted)/intervalSeconds
    : null;
  const completionRate=(
    intervalSeconds!==null &&
    intervalSeconds>EPS &&
    observer.lastCompleted!==null
  )
    ? (ledger.totals.completed-observer.lastCompleted)/intervalSeconds
    : null;

  const activeIds=new Set();
  const subjectFacts=new Map();
  const progressingIds=[];
  const pendingIds=[];
  const stalledIds=[];

  for(const body of state.bodies){
    activeIds.add(body.id);
    const fact=updateSubject(observer,body,state.time);
    subjectFacts.set(body.id,fact);
    if(fact.progressState==="PROGRESSING") progressingIds.push(body.id);
    else if(fact.progressState==="STALLED") stalledIds.push(body.id);
    else pendingIds.push(body.id);
  }

  for(const id of observer.subjects.keys()){
    if(!activeIds.has(id)) observer.subjects.delete(id);
  }

  const solverStep=solverStepContactEvidence(state);
  const saturated=(
    state.solverIterationsUsed>=COUNTERFLOW_SOLVER_ITERATION_LIMIT &&
    state.contactResolutionsThisStep>0
  );
  observer.peakSolverIterations=Math.max(
    observer.peakSolverIterations,
    state.solverIterationsUsed || 0
  );

  const newTimeSample=(
    observer.lastObservationTime===null ||
    state.time>observer.lastObservationTime+EPS
  );
  if(newTimeSample){
    observer.solverSaturationSamples.push(saturated);
    while(
      observer.solverSaturationSamples.length>
      observer.config.recentSolverSamples
    ){
      observer.solverSaturationSamples.shift();
    }
  }

  const saturationCount=observer.solverSaturationSamples
    .filter(Boolean).length;
  const recentSaturationFraction=observer.solverSaturationSamples.length>0
    ? saturationCount/observer.solverSaturationSamples.length
    : null;

  const demanded=ledger.totals.demanded;
  const conserved=(
    ledger.totals.queued+
    ledger.totals.active+
    ledger.totals.completed===demanded
  );
  const invalidAdmissions=state.admissionHistory.filter(
    item=>!item.portalAudit || item.portalAudit.clear!==true
  );
  const boundaryIds=boundaryViolationIds(state);

  const snapshot={
    schema:COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA,
    time:state.time,
    config:structuredClone(observer.config),
    flow:{
      transitStatus:state.status,
      demanded,
      admitted,
      queued:ledger.totals.queued,
      active:ledger.totals.active,
      completed:ledger.totals.completed,
      perSide:structuredClone(ledger.perSide),
      intervalSeconds,
      admissionRate,
      completionRate
    },
    behavior:{
      progressing:{
        count:progressingIds.length,
        ids:sorted(progressingIds)
      },
      pending:{
        count:pendingIds.length,
        ids:sorted(pendingIds)
      },
      stalled:{
        count:stalledIds.length,
        ids:sorted(stalledIds)
      }
    },
    contact:{
      solverStep,
      currentGeometry:currentGeometryPlane(currentContactProbe)
    },
    solver:{
      current:{
        pairChecks:state.pairChecksThisStep || 0,
        contactResolutions:state.contactResolutionsThisStep || 0,
        iterationsUsed:state.solverIterationsUsed || 0,
        iterationLimit:COUNTERFLOW_SOLVER_ITERATION_LIMIT,
        hitIterationLimit:saturated
      },
      historical:{
        peakIterationsUsed:observer.peakSolverIterations,
        recentSampleCount:observer.solverSaturationSamples.length,
        recentSampleSaturationFraction:recentSaturationFraction
      }
    },
    runtime:runtimePlane(runtimeSnapshot),
    validity:{
      breakMode:state.scenario.breakMode,
      demandedConserved:conserved,
      invalidAdmissionCount:invalidAdmissions.length,
      physicalActiveCount:state.bodies.length,
      ledgerActiveCount:ledger.totals.active,
      physicalLedgerActiveMatch:state.bodies.length===ledger.totals.active,
      boundaryViolationCount:boundaryIds.length,
      boundaryViolationIds:boundaryIds
    }
  };

  observer.lastSubjectFacts=subjectFacts;
  observer.lastSolverStepPartners=contactPartners(solverStep.pairs);
  observer.lastCurrentGeometryPartners=currentContactProbe
    ? contactPartners(currentContactProbe.pairs)
    : new Map();
  observer.lastObservationTime=state.time;
  observer.lastAdmitted=admitted;
  observer.lastCompleted=ledger.totals.completed;
  observer.lastSnapshot=structuredClone(snapshot);
  return structuredClone(snapshot);
}

export function counterflowSubjectCausalDrilldown(observer,id){
  if(!observer || observer.schema!==COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA){
    throw new Error("counterflow causal observer required");
  }
  const key=String(id || "");
  const fact=observer.lastSubjectFacts.get(key);
  if(!fact) throw new Error("active observed subject required: "+key);

  return {
    schema:COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA,
    time:observer.lastObservationTime,
    subject:structuredClone(fact),
    contact:{
      solverStepPartners:sorted(
        observer.lastSolverStepPartners.get(key) || []
      ),
      currentGeometryAvailable:Boolean(
        observer.lastSnapshot?.contact?.currentGeometry?.available
      ),
      currentGeometryPartners:sorted(
        observer.lastCurrentGeometryPartners.get(key) || []
      )
    }
  };
}
