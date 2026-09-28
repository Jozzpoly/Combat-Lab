import {findStaticRouteWitness} from "./static-route-witness.js";
import {
  createRouteSuffixReconnectState,
  routeSuffixReconnectSnapshot,
  stepRouteSuffixReconnectState
} from "./route-suffix-reconnect.js";

export const SINGLE_ROUTE_RECOVERY_SCHEMA="combat-lab-single-route-recovery-r1-v0";

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

function executorPosition(executor){
  return {
    x:executor.locomotion.body.x,
    y:executor.locomotion.body.y
  };
}

function freshExecutor(state,{position,witness,routeIndex=0}){
  return createRouteSuffixReconnectState({
    position,
    routeIndex,
    witness,
    radius:state.radius,
    speed:state.speed,
    world:state.world,
    obstacles:state.obstacles,
    arrivalTolerance:state.arrivalTolerance
  });
}

export function createSingleRouteRecoveryState({
  position,
  routeIndex=0,
  witness,
  radius,
  speed=140,
  world,
  obstacles=[],
  arrivalTolerance=3,
  lossPersistenceSeconds=0.35
}={}){
  const persistence=positive(lossPersistenceSeconds,"lossPersistenceSeconds");
  const r=positive(radius,"radius");
  const s=positive(speed,"speed");
  const start=point(position,"position");
  if(!witness || !["direct","witness"].includes(String(witness.status || ""))){
    throw new Error("single route recovery requires an initial executable witness");
  }

  const state={
    schema:SINGLE_ROUTE_RECOVERY_SCHEMA,
    time:0,
    status:"EXECUTING",
    radius:r,
    speed:s,
    world:structuredClone(world),
    obstacles:structuredClone(obstacles),
    arrivalTolerance:finite(arrivalTolerance,"arrivalTolerance"),
    lossPersistenceSeconds:persistence,
    target:point(witness.target,"witness.target"),
    clearance:Math.max(0,finite(witness.clearance ?? 0,"witness.clearance")),
    executor:null,
    lossFor:0,
    freshQueryCount:0,
    queryHistory:[],
    externalDisplacements:[]
  };
  state.executor=freshExecutor(state,{position:start,witness,routeIndex});
  return state;
}

function performFreshQuery(state,routeWitness){
  if(state.freshQueryCount>=1){
    state.status="RECOVERY_EXHAUSTED";
    return;
  }

  const from=executorPosition(state.executor);
  const witness=routeWitness({
    from,
    to:state.target,
    radius:state.radius,
    clearance:state.clearance,
    world:state.world,
    obstacles:state.obstacles
  });

  state.freshQueryCount+=1;
  state.queryHistory.push({
    time:state.time,
    from:{...from},
    target:{...state.target},
    status:String(witness?.status || ""),
    reason:String(witness?.reason || "")
  });

  if(witness?.status==="direct" || witness?.status==="witness"){
    state.executor=freshExecutor(state,{position:from,witness,routeIndex:0});
    state.lossFor=0;
    state.status="RECOVERING";
    return;
  }

  state.status="NO_WITNESS";
}

export function injectSingleRouteRecoveryDisplacement(state,position,{reason="external-displacement"}={}){
  const next=point(position,"position");
  const current=routeSuffixReconnectSnapshot(state.executor);
  state.executor=freshExecutor(state,{
    position:next,
    witness:state.executor.witness,
    routeIndex:state.executor.routeIndex
  });
  state.status="EXECUTING";
  state.lossFor=0;
  state.externalDisplacements.push({
    time:state.time,
    reason:String(reason),
    from:{...current.position},
    to:{...next}
  });
  return state;
}

export function stepSingleRouteRecoveryState(
  state,
  dt,
  {routeWitness=findStaticRouteWitness}={}
){
  const delta=positive(dt,"dt");
  if(["COMPLETE","NO_WITNESS","RECOVERY_EXHAUSTED"].includes(state.status)) return state;

  stepRouteSuffixReconnectState(state.executor,delta);
  state.time+=delta;

  if(state.executor.status==="COMPLETE"){
    state.status="COMPLETE";
    state.lossFor=0;
    return state;
  }

  if(state.executor.status!=="LOST_EXECUTABILITY"){
    state.status=state.freshQueryCount>0 ? "RECOVERING" : "EXECUTING";
    state.lossFor=0;
    return state;
  }

  state.lossFor+=delta;
  state.status=state.freshQueryCount>0 ? "RECOVERY_EXHAUSTED" : "LOST_WAITING";

  if(state.freshQueryCount>0) return state;
  if(state.lossFor+EPS<state.lossPersistenceSeconds) return state;

  performFreshQuery(state,routeWitness);
  return state;
}

export function singleRouteRecoverySnapshot(state){
  return {
    schema:SINGLE_ROUTE_RECOVERY_SCHEMA,
    time:state.time,
    status:state.status,
    lossFor:state.lossFor,
    lossPersistenceSeconds:state.lossPersistenceSeconds,
    freshQueryCount:state.freshQueryCount,
    queryHistory:structuredClone(state.queryHistory),
    externalDisplacements:structuredClone(state.externalDisplacements),
    executor:routeSuffixReconnectSnapshot(state.executor)
  };
}
