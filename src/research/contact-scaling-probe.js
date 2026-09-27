import {
  createContactBody,
  stepContactWorld
} from "./contact-semantics.js";

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function integer(value,label){
  const n=Math.floor(finite(value,label));
  if(n<1) throw new Error(`${label} must be >= 1`);
  return n;
}

function defaultNow(){
  return globalThis.performance?.now?.() ?? Date.now();
}

export function runContactScalingProbe({
  count=16,
  steps=12,
  dense=false,
  iterations=12,
  now=defaultNow
}={}){
  const bodyCount=integer(count,"count");
  const stepCount=integer(steps,"steps");
  const iterationCount=integer(iterations,"iterations");
  if(typeof now!=="function") throw new Error("now must be a function");

  const radius=8;
  const spacing=dense ? radius*1.35 : radius*3;
  const columns=Math.max(1,Math.ceil(Math.sqrt(bodyCount)));
  const bodies=[];

  for(let i=0;i<bodyCount;i++){
    const column=i%columns;
    const row=Math.floor(i/columns);
    bodies.push(createContactBody({
      id:`probe-${i}`,
      position:{x:100+column*spacing,y:100+row*spacing},
      radius,
      mass:1,
      motorAuthority:1,
      contactResistance:1,
      desiredVelocity:{x:0,y:0},
      maxSpeed:1
    }));
  }

  const state={
    time:0,
    bodies,
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

  const started=Number(now());
  for(let i=0;i<stepCount;i++){
    stepContactWorld(state,1/120,{iterations:iterationCount,pairOrder:"forward"});
  }
  const ended=Number(now());
  if(!Number.isFinite(started) || !Number.isFinite(ended)){
    throw new Error("probe clock must be finite");
  }

  const naivePairsPerIteration=bodyCount*(bodyCount-1)/2;
  return {
    schema:"combat-lab-contact-scaling-probe-v0",
    count:bodyCount,
    steps:stepCount,
    dense:Boolean(dense),
    iterationsLimit:iterationCount,
    naivePairsPerIteration,
    pairChecks:state.totalPairChecks,
    contactResolutions:state.totalContactResolutions,
    solverIterations:state.totalSolverIterations,
    durationMs:Math.max(0,ended-started)
  };
}
