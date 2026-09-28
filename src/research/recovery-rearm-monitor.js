import {ROUTE_EXECUTION_STATUS} from "./route-execution-authority.js";

export const RECOVERY_REARM_MONITOR_SCHEMA="combat-lab-recovery-rearm-monitor-r1-v0";

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

function distance(a,b){
  return Math.hypot(b.x-a.x,b.y-a.y);
}

function evidence(samples){
  if(samples.length<2){
    return {
      windowSeconds:0,
      bodyTravel:0,
      metricImprovement:0,
      metricRegression:0
    };
  }
  const first=samples[0];
  const last=samples.at(-1);
  let bodyTravel=0;
  let metricRegression=0;
  let best=first.verifiedRemainingCost;
  for(let i=1;i<samples.length;i++){
    const prev=samples[i-1];
    const current=samples[i];
    bodyTravel+=distance(prev.position,current.position);
    if(current.verifiedRemainingCost>best){
      metricRegression=Math.max(
        metricRegression,
        current.verifiedRemainingCost-best
      );
    }else{
      best=current.verifiedRemainingCost;
    }
  }
  return {
    windowSeconds:last.time-first.time,
    bodyTravel,
    metricImprovement:first.verifiedRemainingCost-last.verifiedRemainingCost,
    metricRegression
  };
}

function snapshotDecision(state,status,reason){
  const ev=evidence(state.samples);
  return {
    schema:RECOVERY_REARM_MONITOR_SCHEMA,
    status,
    reason,
    rearmed:state.rearmed,
    healthyWindowSeconds:state.healthyWindowSeconds,
    progressEpsilon:state.progressEpsilon,
    sampleCount:state.samples.length,
    ...ev
  };
}

export function createRecoveryRearmMonitor({
  healthyWindowSeconds=0.35,
  progressEpsilon=8
}={}){
  return {
    schema:RECOVERY_REARM_MONITOR_SCHEMA,
    healthyWindowSeconds:positive(healthyWindowSeconds,"healthyWindowSeconds"),
    progressEpsilon:positive(progressEpsilon,"progressEpsilon"),
    samples:[],
    lastTime:null,
    rearmed:false,
    lastDecision:null
  };
}

export function resetRecoveryRearmMonitor(state){
  state.samples.length=0;
  state.lastTime=null;
  state.rearmed=false;
  state.lastDecision=null;
  return state;
}

export function observeRecoveryRearm(state,{
  time,
  position,
  authorityStatus,
  verifiedRemainingCost
}={}){
  const t=finite(time,"time");
  const p=point(position,"position");
  if(state.lastTime!==null && t<state.lastTime-EPS){
    throw new Error("recovery rearm observations must be time-monotonic");
  }
  state.lastTime=t;

  if(state.rearmed){
    const decision=snapshotDecision(
      state,
      "REARMED",
      "healthy verified execution already proved a new recovery episode may be opened"
    );
    state.lastDecision=decision;
    return structuredClone(decision);
  }

  if(authorityStatus!==ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR){
    state.samples.length=0;
    const decision=snapshotDecision(
      state,
      "UNHEALTHY_AUTHORITY",
      "route execution is not continuously ACTIVE_EDGE_CLEAR; healthy window reset"
    );
    state.lastDecision=decision;
    return structuredClone(decision);
  }

  const metric=finite(verifiedRemainingCost,"verifiedRemainingCost");
  if(metric<0) throw new Error("verifiedRemainingCost must be non-negative");

  state.samples.push({
    time:t,
    position:p,
    verifiedRemainingCost:metric
  });

  const minimumTime=t-state.healthyWindowSeconds;
  while(
    state.samples.length>1 &&
    state.samples[1].time<=minimumTime+EPS
  ){
    state.samples.shift();
  }

  const ev=evidence(state.samples);
  if(ev.windowSeconds+EPS<state.healthyWindowSeconds){
    const decision=snapshotDecision(
      state,
      "BUILDING_HEALTHY_WINDOW",
      "hard-valid execution is continuous but the temporal health window is not complete"
    );
    state.lastDecision=decision;
    return structuredClone(decision);
  }

  const moved=ev.bodyTravel+EPS>=state.progressEpsilon;
  const improved=ev.metricImprovement+EPS>=state.progressEpsilon;

  if(!moved || !improved){
    const reason=!moved && !improved
      ? "healthy authority persisted but neither material body travel nor verified route progress is sufficient"
      : !moved
        ? "verified route metric improved without sufficient body travel"
        : "body moved without sufficient verified route-metric improvement";
    const decision=snapshotDecision(state,"HEALTH_NOT_PROVEN",reason);
    state.lastDecision=decision;
    return structuredClone(decision);
  }

  state.rearmed=true;
  const decision=snapshotDecision(
    state,
    "REARMED",
    "continuous hard-valid execution includes material body travel and material verified remaining-route improvement"
  );
  state.lastDecision=decision;
  return structuredClone(decision);
}

export function recoveryRearmSnapshot(state){
  return state.lastDecision
    ? structuredClone(state.lastDecision)
    : snapshotDecision(state,"UNOBSERVED","no route-execution observations recorded");
}
