import {
  COUNTERFLOW_TRANSIT_SCHEMA,
  createCounterflowTransitState,
  stepCounterflowTransitState
} from "./counterflow-transit.js";
import {
  COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA,
  createCounterflowCausalObserver,
  observeCounterflowCausalHealth
} from "./counterflow-causal-observation.js";

export const COUNTERFLOW_TRIAL_SETUP_SCHEMA=
  "combat-lab-counterflow-trial-setup-s1-v0";
export const COUNTERFLOW_TRIAL_TRACE_SCHEMA=
  "combat-lab-counterflow-trial-trace-s1-v0";
export const COUNTERFLOW_TRIAL_COMPARISON_SCHEMA=
  "combat-lab-counterflow-trial-comparison-s1-v0";

const EPS=1e-9;

function clone(value){
  return value===undefined ? undefined : structuredClone(value);
}

function requiredText(value,label){
  const text=String(value ?? "").trim();
  if(!text) throw new Error(label+" required");
  return text;
}

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

function positiveInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<=0){
    throw new Error(label+" must be a positive integer");
  }
  return n;
}

function assertCounterflowState(state){
  if(!state || state.schema!==COUNTERFLOW_TRANSIT_SCHEMA){
    throw new Error("counterflow transit state required");
  }
}

function assertObserver(observer){
  if(!observer || observer.schema!==COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA){
    throw new Error("counterflow causal observer required");
  }
}

function assertObservation(observation){
  if(!observation || observation.schema!==COUNTERFLOW_CAUSAL_OBSERVATION_SCHEMA){
    throw new Error("counterflow causal observation required");
  }
}

function assertSetup(setup){
  if(!setup || setup.schema!==COUNTERFLOW_TRIAL_SETUP_SCHEMA){
    throw new Error("counterflow trial setup required");
  }
}

function assertTrace(trace){
  if(!trace || trace.schema!==COUNTERFLOW_TRIAL_TRACE_SCHEMA){
    throw new Error("counterflow trial trace required");
  }
}

function sameValue(a,b){
  return JSON.stringify(a)===JSON.stringify(b);
}

function addDiff(diffs,path,before,after){
  if(sameValue(before,after)) return;
  diffs.push({
    path,
    before:clone(before),
    after:clone(after)
  });
}

function snapshotRuntime(observation){
  const runtime=observation.runtime;
  if(!runtime?.available || !runtime.snapshot){
    return {
      available:false,
      simulationToWallRatio:null,
      discardedWallSeconds:null,
      phaseMs:null
    };
  }
  return {
    available:true,
    simulationToWallRatio:Number.isFinite(runtime.snapshot.simulationToWallRatio)
      ? runtime.snapshot.simulationToWallRatio
      : null,
    discardedWallSeconds:Number.isFinite(runtime.snapshot.discardedWallSeconds)
      ? runtime.snapshot.discardedWallSeconds
      : null,
    phaseMs:runtime.snapshot.phaseMs
      ? clone(runtime.snapshot.phaseMs)
      : null
  };
}

function traceSample(observation){
  return {
    time:observation.time,
    flow:{
      demanded:observation.flow.demanded,
      admitted:observation.flow.admitted,
      queued:observation.flow.queued,
      active:observation.flow.active,
      completed:observation.flow.completed,
      admissionRate:observation.flow.admissionRate,
      completionRate:observation.flow.completionRate
    },
    behavior:{
      progressing:observation.behavior.progressing.count,
      pending:observation.behavior.pending.count,
      stalled:observation.behavior.stalled.count
    },
    contact:{
      solverStepPairs:observation.contact.solverStep.pairCount,
      solverStepBodies:observation.contact.solverStep.bodyCount
    },
    solver:{
      pairChecks:observation.solver.current.pairChecks,
      contactResolutions:observation.solver.current.contactResolutions,
      iterationsUsed:observation.solver.current.iterationsUsed,
      iterationLimit:observation.solver.current.iterationLimit,
      hitIterationLimit:observation.solver.current.hitIterationLimit
    },
    runtime:snapshotRuntime(observation),
    validity:{
      demandedConserved:observation.validity.demandedConserved,
      invalidAdmissionCount:observation.validity.invalidAdmissionCount,
      physicalLedgerActiveMatch:observation.validity.physicalLedgerActiveMatch,
      boundaryViolationCount:observation.validity.boundaryViolationCount
    }
  };
}

function emptyAggregate(){
  return {
    observationCount:0,
    maxQueued:0,
    maxActive:0,
    maxCompleted:0,
    maxProgressing:0,
    maxPending:0,
    maxStalled:0,
    maxSolverStepPairs:0,
    maxSolverStepBodies:0,
    maxPairChecks:0,
    maxContactResolutions:0,
    peakSolverIterations:0,
    solverCapObservationCount:0,
    invalidAdmissionMax:0,
    boundaryViolationMax:0,
    activeParityFailureCount:0,
    demandConservationFailureCount:0,
    runtimeObservationCount:0,
    minSimulationToWallRatio:null,
    maxDiscardedWallSeconds:0
  };
}

function updateAggregate(aggregate,observation){
  aggregate.observationCount+=1;
  aggregate.maxQueued=Math.max(aggregate.maxQueued,observation.flow.queued);
  aggregate.maxActive=Math.max(aggregate.maxActive,observation.flow.active);
  aggregate.maxCompleted=Math.max(aggregate.maxCompleted,observation.flow.completed);
  aggregate.maxProgressing=Math.max(
    aggregate.maxProgressing,
    observation.behavior.progressing.count
  );
  aggregate.maxPending=Math.max(
    aggregate.maxPending,
    observation.behavior.pending.count
  );
  aggregate.maxStalled=Math.max(
    aggregate.maxStalled,
    observation.behavior.stalled.count
  );
  aggregate.maxSolverStepPairs=Math.max(
    aggregate.maxSolverStepPairs,
    observation.contact.solverStep.pairCount
  );
  aggregate.maxSolverStepBodies=Math.max(
    aggregate.maxSolverStepBodies,
    observation.contact.solverStep.bodyCount
  );
  aggregate.maxPairChecks=Math.max(
    aggregate.maxPairChecks,
    observation.solver.current.pairChecks
  );
  aggregate.maxContactResolutions=Math.max(
    aggregate.maxContactResolutions,
    observation.solver.current.contactResolutions
  );
  aggregate.peakSolverIterations=Math.max(
    aggregate.peakSolverIterations,
    observation.solver.current.iterationsUsed
  );
  if(observation.solver.current.hitIterationLimit){
    aggregate.solverCapObservationCount+=1;
  }
  aggregate.invalidAdmissionMax=Math.max(
    aggregate.invalidAdmissionMax,
    observation.validity.invalidAdmissionCount
  );
  aggregate.boundaryViolationMax=Math.max(
    aggregate.boundaryViolationMax,
    observation.validity.boundaryViolationCount
  );
  if(!observation.validity.physicalLedgerActiveMatch){
    aggregate.activeParityFailureCount+=1;
  }
  if(!observation.validity.demandedConserved){
    aggregate.demandConservationFailureCount+=1;
  }

  const runtime=snapshotRuntime(observation);
  if(runtime.available){
    aggregate.runtimeObservationCount+=1;
    if(Number.isFinite(runtime.simulationToWallRatio)){
      aggregate.minSimulationToWallRatio=
        aggregate.minSimulationToWallRatio===null
          ? runtime.simulationToWallRatio
          : Math.min(
              aggregate.minSimulationToWallRatio,
              runtime.simulationToWallRatio
            );
    }
    if(Number.isFinite(runtime.discardedWallSeconds)){
      aggregate.maxDiscardedWallSeconds=Math.max(
        aggregate.maxDiscardedWallSeconds,
        runtime.discardedWallSeconds
      );
    }
  }
}

function setupAuthoredDiffs(a,b){
  const diffs=[];
  const as=a.authored;
  const bs=b.authored;
  addDiff(diffs,"scenario.demand.eastbound",
    as.scenario.demand.eastbound,bs.scenario.demand.eastbound);
  addDiff(diffs,"scenario.demand.westbound",
    as.scenario.demand.westbound,bs.scenario.demand.westbound);
  addDiff(diffs,"scenario.flowMode",as.scenario.flowMode,bs.scenario.flowMode);
  addDiff(diffs,"scenario.trajectoryMode",
    as.scenario.trajectoryMode,bs.scenario.trajectoryMode);
  addDiff(diffs,"scenario.completionMode",
    as.scenario.completionMode,bs.scenario.completionMode);
  addDiff(diffs,"scenario.breakMode",as.scenario.breakMode,bs.scenario.breakMode);
  addDiff(diffs,"world",as.world,bs.world);
  addDiff(diffs,"sources",as.sources,bs.sources);
  addDiff(diffs,"sinks",as.sinks,bs.sinks);
  addDiff(diffs,"body.radius",as.body.radius,bs.body.radius);
  addDiff(diffs,"body.speed",as.body.speed,bs.body.speed);
  addDiff(diffs,"admissionClearance",
    as.admissionClearance,bs.admissionClearance);
  addDiff(diffs,"trialDuration",as.trialDuration,bs.trialDuration);
  return diffs;
}

function setupApparatusDiffs(a,b,traceA,traceB){
  const diffs=[];
  addDiff(diffs,"observer",a.apparatus.observer,b.apparatus.observer);
  addDiff(diffs,"trace.sampleInterval",
    traceA.sampling.sampleInterval,traceB.sampling.sampleInterval);
  addDiff(diffs,"trace.maxSamples",
    traceA.sampling.maxSamples,traceB.sampling.maxSamples);
  return diffs;
}

function outcomeDiffs(a,b){
  const diffs=[];
  const af=a.final;
  const bf=b.final;
  for(const key of ["queued","active","completed"]){
    addDiff(diffs,"final.flow."+key,af.flow[key],bf.flow[key]);
  }
  for(const key of ["progressing","pending","stalled"]){
    addDiff(diffs,"final.behavior."+key,af.behavior[key],bf.behavior[key]);
  }
  for(const key of [
    "maxQueued","maxActive","maxCompleted","maxProgressing","maxPending",
    "maxStalled","maxSolverStepPairs","maxSolverStepBodies","maxPairChecks",
    "maxContactResolutions","peakSolverIterations","solverCapObservationCount",
    "invalidAdmissionMax","boundaryViolationMax","activeParityFailureCount",
    "demandConservationFailureCount"
  ]){
    addDiff(diffs,"aggregate."+key,a.aggregate[key],b.aggregate[key]);
  }
  addDiff(
    diffs,
    "sampling.truncated",
    a.sampling.truncated,
    b.sampling.truncated
  );
  return diffs;
}

export function captureCounterflowTrialSetup(
  state,
  observer,
  {trialId="trial",metadata={}}={}
){
  assertCounterflowState(state);
  assertObserver(observer);
  return {
    schema:COUNTERFLOW_TRIAL_SETUP_SCHEMA,
    trialId:requiredText(trialId,"trialId"),
    authored:{
      scenario:clone(state.scenario),
      world:clone(state.world),
      sources:clone(state.sources),
      sinks:clone(state.sinks),
      body:{
        radius:state.radius,
        speed:state.speed
      },
      admissionClearance:state.admissionClearance,
      trialDuration:state.trialDuration
    },
    apparatus:{
      observer:clone(observer.config)
    },
    metadata:clone(metadata)
  };
}

export function createCounterflowTrialTrace({
  setup,
  sampleInterval=0.25,
  maxSamples=256
}={}){
  assertSetup(setup);
  return {
    schema:COUNTERFLOW_TRIAL_TRACE_SCHEMA,
    setup:clone(setup),
    sampling:{
      sampleInterval:positive(sampleInterval,"sampleInterval"),
      maxSamples:positiveInteger(maxSamples,"maxSamples"),
      nextSampleTime:0,
      storedSamples:0,
      truncated:false,
      budgetExhaustedAt:null
    },
    samples:[],
    aggregate:emptyAggregate(),
    lastObservationTime:null,
    final:null
  };
}

export function recordCounterflowTrialObservation(trace,observation){
  assertTrace(trace);
  assertObservation(observation);
  const time=finite(observation.time,"observation.time");
  if(trace.final) throw new Error("cannot record after trace finalization");
  if(
    trace.lastObservationTime!==null &&
    time<trace.lastObservationTime-EPS
  ){
    throw new Error("trace observation time must be monotonic");
  }

  updateAggregate(trace.aggregate,observation);

  if(time+EPS>=trace.sampling.nextSampleTime){
    if(trace.samples.length<trace.sampling.maxSamples){
      trace.samples.push(traceSample(observation));
      trace.sampling.storedSamples=trace.samples.length;
    }else if(!trace.sampling.truncated){
      trace.sampling.truncated=true;
      trace.sampling.budgetExhaustedAt=time;
    }

    while(time+EPS>=trace.sampling.nextSampleTime){
      trace.sampling.nextSampleTime+=trace.sampling.sampleInterval;
    }
  }

  trace.lastObservationTime=time;
  return trace;
}

export function finalizeCounterflowTrialTrace(trace,observation){
  assertTrace(trace);
  assertObservation(observation);
  if(trace.final) throw new Error("trace already finalized");
  if(
    trace.lastObservationTime===null ||
    observation.time>trace.lastObservationTime+EPS
  ){
    recordCounterflowTrialObservation(trace,observation);
  }else if(observation.time<trace.lastObservationTime-EPS){
    throw new Error("final observation precedes trace history");
  }

  trace.final=traceSample(observation);
  return counterflowTrialTraceSnapshot(trace);
}

export function counterflowTrialTraceSnapshot(trace){
  assertTrace(trace);
  const snapshot=clone(trace);
  delete snapshot.sampling.nextSampleTime;
  return snapshot;
}

export function compareCounterflowTrialTraces(a,b){
  assertTrace(a);
  assertTrace(b);
  if(!a.final || !b.final){
    throw new Error("finalized counterflow traces required");
  }

  return {
    schema:COUNTERFLOW_TRIAL_COMPARISON_SCHEMA,
    trials:{
      a:a.setup.trialId,
      b:b.setup.trialId
    },
    setup:{
      authoredDifferences:setupAuthoredDiffs(a.setup,b.setup),
      apparatusDifferences:setupApparatusDiffs(a.setup,b.setup,a,b)
    },
    outcome:{
      differences:outcomeDiffs(a,b)
    }
  };
}

export function runCounterflowTracedTrial({
  trialId="trial",
  stateOptions={},
  observerOptions={},
  traceOptions={},
  metadata={},
  dt=1/120
}={}){
  const delta=positive(dt,"dt");
  const state=createCounterflowTransitState(stateOptions);
  const observer=createCounterflowCausalObserver(observerOptions);
  const setup=captureCounterflowTrialSetup(
    state,
    observer,
    {trialId,metadata}
  );
  const trace=createCounterflowTrialTrace({
    setup,
    ...traceOptions
  });

  let observation=observeCounterflowCausalHealth(observer,state);
  recordCounterflowTrialObservation(trace,observation);

  const maxSteps=Math.ceil(state.trialDuration/delta)+2;
  for(let i=0;i<maxSteps && state.status==="RUNNING";i++){
    stepCounterflowTransitState(state,delta);
    observation=observeCounterflowCausalHealth(observer,state);
    recordCounterflowTrialObservation(trace,observation);
  }

  return finalizeCounterflowTrialTrace(trace,observation);
}
