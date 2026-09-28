export const FLOW_TRUTH_LEDGER_SCHEMA="combat-lab-flow-truth-ledger-s1-v0";

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function nonNegativeTime(value,label="time"){
  const n=finite(value,label);
  if(n<0) throw new Error(`${label} must be non-negative`);
  return n;
}

function positiveInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<=0){
    throw new Error(`${label} must be a positive integer`);
  }
  return n;
}

function requiredText(value,label){
  const text=String(value ?? "").trim();
  if(!text) throw new Error(`${label} required`);
  return text;
}

function participantId(side,ordinal){
  return `${side}-${String(ordinal).padStart(6,"0")}`;
}

function assertSide(state,side){
  const key=requiredText(side,"side");
  if(!state.sideSet.has(key)) throw new Error(`unknown flow side: ${key}`);
  return key;
}

function assertMonotonicTime(state,time){
  const t=nonNegativeTime(time);
  if(state.lastEventTime!==null && t<state.lastEventTime-1e-9){
    throw new Error("flow ledger event time must be monotonic");
  }
  return t;
}

function appendEvent(state,event){
  state.eventSequence+=1;
  const record={
    sequence:state.eventSequence,
    ...event
  };
  state.events.push(record);
  state.lastEventTime=record.time;
  return record;
}

function countsForSide(state,side){
  const demanded=state.demandedBySide.get(side) || 0;
  const queued=(state.queues.get(side) || []).length;
  let active=0;
  let completed=0;
  for(const participant of state.active.values()){
    if(participant.side===side) active+=1;
  }
  for(const participant of state.completed.values()){
    if(participant.side===side) completed+=1;
  }
  return {demanded,queued,active,completed};
}

export function createFlowTruthLedger({sides=["left","right"]}={}){
  const normalized=(sides || []).map(side=>requiredText(side,"side"));
  if(normalized.length===0) throw new Error("at least one flow side required");
  if(new Set(normalized).size!==normalized.length){
    throw new Error("flow sides must be unique");
  }

  return {
    schema:FLOW_TRUTH_LEDGER_SCHEMA,
    sides:[...normalized],
    sideSet:new Set(normalized),
    nextOrdinalBySide:new Map(normalized.map(side=>[side,1])),
    demandedBySide:new Map(normalized.map(side=>[side,0])),
    queues:new Map(normalized.map(side=>[side,[]])),
    participants:new Map(),
    active:new Map(),
    completed:new Map(),
    events:[],
    eventSequence:0,
    lastEventTime:null
  };
}

export function requestFlowDemand(state,{side,count=1,time}={}){
  const key=assertSide(state,side);
  const amount=positiveInteger(count,"count");
  const t=assertMonotonicTime(state,time);
  const ids=[];

  for(let i=0;i<amount;i++){
    const ordinal=state.nextOrdinalBySide.get(key);
    state.nextOrdinalBySide.set(key,ordinal+1);
    const id=participantId(key,ordinal);
    const participant={
      id,
      side:key,
      ordinal,
      requestedAt:t,
      admittedAt:null,
      completedAt:null,
      sink:null,
      status:"QUEUED"
    };
    state.participants.set(id,participant);
    state.queues.get(key).push(id);
    ids.push(id);
  }

  state.demandedBySide.set(
    key,
    (state.demandedBySide.get(key) || 0)+amount
  );

  appendEvent(state,{
    type:"REQUEST",
    time:t,
    side:key,
    count:amount,
    participantIds:[...ids]
  });

  return [...ids];
}

export function admitFlowParticipant(state,{side,id=null,time}={}){
  const key=assertSide(state,side);
  const t=assertMonotonicTime(state,time);
  const queue=state.queues.get(key);
  if(queue.length===0) throw new Error(`no queued flow demand for side: ${key}`);

  const expectedId=queue[0];
  const chosen=id===null || id===undefined
    ? expectedId
    : requiredText(id,"participant id");

  if(chosen!==expectedId){
    throw new Error(
      `flow admission must preserve source queue order: expected ${expectedId}, received ${chosen}`
    );
  }

  const participant=state.participants.get(chosen);
  if(!participant || participant.status!=="QUEUED"){
    throw new Error(`participant is not queued: ${chosen}`);
  }

  queue.shift();
  participant.status="ACTIVE";
  participant.admittedAt=t;
  state.active.set(chosen,participant);

  appendEvent(state,{
    type:"ADMIT",
    time:t,
    side:key,
    participantId:chosen
  });

  return structuredClone(participant);
}

export function completeFlowTransit(state,{id,time,sink="sink"}={}){
  const participantIdValue=requiredText(id,"participant id");
  const t=assertMonotonicTime(state,time);
  const participant=state.active.get(participantIdValue);

  if(!participant){
    if(state.completed.has(participantIdValue)){
      throw new Error(`participant already completed transit: ${participantIdValue}`);
    }
    if(state.participants.has(participantIdValue)){
      throw new Error(`participant is not active transit: ${participantIdValue}`);
    }
    throw new Error(`unknown participant: ${participantIdValue}`);
  }

  state.active.delete(participantIdValue);
  participant.status="COMPLETED";
  participant.completedAt=t;
  participant.sink=requiredText(sink,"sink");
  state.completed.set(participantIdValue,participant);

  appendEvent(state,{
    type:"COMPLETE_TRANSIT",
    time:t,
    side:participant.side,
    participantId:participantIdValue,
    sink:participant.sink
  });

  return structuredClone(participant);
}

export function flowTruthLedgerSnapshot(state){
  const perSide={};
  for(const side of state.sides){
    perSide[side]={
      ...countsForSide(state,side),
      queuedIds:[...(state.queues.get(side) || [])]
    };
  }

  const totals=state.sides.reduce((sum,side)=>{
    const counts=perSide[side];
    sum.demanded+=counts.demanded;
    sum.queued+=counts.queued;
    sum.active+=counts.active;
    sum.completed+=counts.completed;
    return sum;
  },{demanded:0,queued:0,active:0,completed:0});

  return {
    schema:FLOW_TRUTH_LEDGER_SCHEMA,
    sides:[...state.sides],
    totals,
    perSide,
    active:[...state.active.values()].map(item=>structuredClone(item)),
    completed:[...state.completed.values()].map(item=>structuredClone(item)),
    eventCount:state.events.length,
    events:state.events.map(event=>structuredClone(event)),
    lastEventTime:state.lastEventTime
  };
}
