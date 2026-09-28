export const DYNAMIC_ENCOUNTER_EPISODE_MONITOR_SCHEMA="combat-lab-dynamic-encounter-episode-monitor-d1-v0";

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

function normalizePartners(values=[]){
  return [...new Set((values || []).map(String))].sort();
}

function windowEvidence(samples){
  if(samples.length<2){
    return {
      clearWindowSeconds:0,
      bodyTravel:0,
      goalImprovement:0
    };
  }
  const first=samples[0];
  const last=samples.at(-1);
  let bodyTravel=0;
  for(let i=1;i<samples.length;i++){
    bodyTravel+=distance(samples[i-1].position,samples[i].position);
  }
  return {
    clearWindowSeconds:last.time-first.time,
    bodyTravel,
    goalImprovement:first.goalDistance-last.goalDistance
  };
}

function decision(state,status,reason,currentPartners){
  const ev=windowEvidence(state.samples);
  return {
    schema:DYNAMIC_ENCOUNTER_EPISODE_MONITOR_SCHEMA,
    status,
    reason,
    rearmed:state.rearmed,
    triggerPartnerId:state.triggerPartnerId,
    partnersSeen:[...state.partnersSeen].sort(),
    currentPartners:[...currentPartners],
    requiredClearWindowSeconds:state.requiredClearWindowSeconds,
    progressEpsilon:state.progressEpsilon,
    sampleCount:state.samples.length,
    ...ev
  };
}

export function createDynamicEncounterEpisodeMonitor({
  triggerPartnerId,
  requiredClearWindowSeconds=0.35,
  progressEpsilon=8
}={}){
  const trigger=String(triggerPartnerId || "");
  if(!trigger) throw new Error("triggerPartnerId required");
  return {
    schema:DYNAMIC_ENCOUNTER_EPISODE_MONITOR_SCHEMA,
    triggerPartnerId:trigger,
    requiredClearWindowSeconds:positive(requiredClearWindowSeconds,"requiredClearWindowSeconds"),
    progressEpsilon:positive(progressEpsilon,"progressEpsilon"),
    samples:[],
    partnersSeen:new Set([trigger]),
    lastTime:null,
    rearmed:false,
    lastDecision:null
  };
}

export function observeDynamicEncounterEpisode(state,{
  time,
  position,
  goalDistance,
  contactPartnerIds=[],
  decisionActive=false
}={}){
  const t=finite(time,"time");
  const p=point(position,"position");
  const goal=Math.max(0,finite(goalDistance,"goalDistance"));
  const partners=normalizePartners(contactPartnerIds);
  for(const partner of partners) state.partnersSeen.add(partner);

  if(state.lastTime!==null && t<state.lastTime-EPS){
    throw new Error("dynamic encounter observations must be time-monotonic");
  }
  state.lastTime=t;

  if(state.rearmed){
    const out=decision(
      state,
      "REARMED",
      "previous encounter already proved complete enough to permit one future encounter",
      partners
    );
    state.lastDecision=out;
    return structuredClone(out);
  }

  if(Boolean(decisionActive)){
    state.samples.length=0;
    const out=decision(
      state,
      "ACTION_ACTIVE",
      "previous encounter decision is still executing; episode cannot re-arm",
      partners
    );
    state.lastDecision=out;
    return structuredClone(out);
  }

  if(partners.length){
    state.samples.length=0;
    const out=decision(
      state,
      "EPISODE_ACTIVE",
      "hard dynamic contact is still factual; clear/progress window reset",
      partners
    );
    state.lastDecision=out;
    return structuredClone(out);
  }

  state.samples.push({time:t,position:p,goalDistance:goal});

  const minimumTime=t-state.requiredClearWindowSeconds;
  while(
    state.samples.length>1 &&
    state.samples[1].time<=minimumTime+EPS
  ){
    state.samples.shift();
  }

  const ev=windowEvidence(state.samples);
  if(ev.clearWindowSeconds+EPS<state.requiredClearWindowSeconds){
    const out=decision(
      state,
      "CLEAR_BUILDING",
      "contact is clear and prior action ended, but the healthy window is not complete",
      partners
    );
    state.lastDecision=out;
    return structuredClone(out);
  }

  const moved=ev.bodyTravel+EPS>=state.progressEpsilon;
  const improved=ev.goalImprovement+EPS>=state.progressEpsilon;
  if(!moved || !improved){
    const reason=!moved && !improved
      ? "contact stayed clear but neither material body travel nor goal progress is sufficient"
      : !moved
        ? "goal distance improved without sufficient body travel"
        : "body moved without sufficient goal-distance improvement";
    const out=decision(state,"HEALTH_NOT_PROVEN",reason,partners);
    state.lastDecision=out;
    return structuredClone(out);
  }

  state.rearmed=true;
  const out=decision(
    state,
    "REARMED",
    "previous action ended, hard contact stayed clear, body moved materially and goal distance improved materially",
    partners
  );
  state.lastDecision=out;
  return structuredClone(out);
}

export function dynamicEncounterEpisodeMonitorSnapshot(state){
  return state.lastDecision
    ? structuredClone(state.lastDecision)
    : decision(state,"UNOBSERVED","no post-encounter evidence observed",[]);
}
