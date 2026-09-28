import {
  createSingleRouteRecoveryState,
  injectSingleRouteRecoveryDisplacement,
  singleRouteRecoverySnapshot,
  stepSingleRouteRecoveryState
} from "./single-route-recovery.js";
import {
  createRecoveryRearmMonitor,
  observeRecoveryRearm,
  recoveryRearmSnapshot,
  resetRecoveryRearmMonitor
} from "./recovery-rearm-monitor.js";
import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "./route-execution-authority.js";

export const REARMABLE_ROUTE_RECOVERY_SCHEMA="combat-lab-rearmable-route-recovery-r1-v0";

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

function executorPosition(episode){
  return {
    x:episode.executor.locomotion.body.x,
    y:episode.executor.locomotion.body.y
  };
}

function makeEpisode(state,{position,witness,routeIndex}){
  return createSingleRouteRecoveryState({
    position,
    routeIndex,
    witness,
    radius:state.config.radius,
    speed:state.config.speed,
    world:state.config.world,
    obstacles:state.config.obstacles,
    arrivalTolerance:state.config.arrivalTolerance,
    lossPersistenceSeconds:state.config.lossPersistenceSeconds
  });
}

function currentAuthorityObservation(state){
  const episode=state.episode;
  const executor=episode.executor;
  const position=executorPosition(episode);
  const audit=auditRouteExecutionAuthority({
    position,
    routeIndex:executor.routeIndex,
    witness:executor.witness,
    radius:state.config.radius,
    world:state.config.world,
    obstacles:state.config.obstacles,
    arrivalTolerance:state.config.arrivalTolerance
  });
  return {
    position,
    audit,
    metric:audit.activeTraversal?.localRemainingCost
  };
}

function archiveEpisode(state,reason){
  state.archivedEpisodes.push({
    episodeId:state.episodeId,
    reason:String(reason),
    snapshot:singleRouteRecoverySnapshot(state.episode),
    rearm:recoveryRearmSnapshot(state.rearmMonitor)
  });
}

export function createRearmableRouteRecoveryState({
  position,
  routeIndex=0,
  witness,
  radius,
  speed=140,
  world,
  obstacles=[],
  arrivalTolerance=3,
  lossPersistenceSeconds=0.35,
  healthyWindowSeconds=0.35,
  progressEpsilon=8
}={}){
  const config={
    radius:positive(radius,"radius"),
    speed:positive(speed,"speed"),
    world:structuredClone(world),
    obstacles:structuredClone(obstacles),
    arrivalTolerance:finite(arrivalTolerance,"arrivalTolerance"),
    lossPersistenceSeconds:positive(lossPersistenceSeconds,"lossPersistenceSeconds"),
    healthyWindowSeconds:positive(healthyWindowSeconds,"healthyWindowSeconds"),
    progressEpsilon:positive(progressEpsilon,"progressEpsilon")
  };
  const start=point(position,"position");
  const state={
    schema:REARMABLE_ROUTE_RECOVERY_SCHEMA,
    config,
    episodeId:1,
    episode:null,
    rearmMonitor:createRecoveryRearmMonitor({
      healthyWindowSeconds:config.healthyWindowSeconds,
      progressEpsilon:config.progressEpsilon
    }),
    rearmReady:false,
    totalFreshQueryCount:0,
    archivedEpisodes:[],
    externalDisplacements:[]
  };
  state.episode=makeEpisode(state,{position:start,witness,routeIndex});
  return state;
}

export function stepRearmableRouteRecoveryState(state,dt,options={}){
  const beforeQueries=state.episode.freshQueryCount;
  stepSingleRouteRecoveryState(state.episode,dt,options);
  const afterQueries=state.episode.freshQueryCount;
  if(afterQueries>beforeQueries){
    state.totalFreshQueryCount+=afterQueries-beforeQueries;
  }

  if(
    state.episode.freshQueryCount>0 &&
    !["COMPLETE","NO_WITNESS","RECOVERY_EXHAUSTED"].includes(state.episode.status)
  ){
    const current=currentAuthorityObservation(state);
    const decision=observeRecoveryRearm(state.rearmMonitor,{
      time:state.episode.time,
      position:current.position,
      authorityStatus:current.audit.status,
      verifiedRemainingCost:Number.isFinite(current.metric) ? current.metric : 0
    });
    if(decision.rearmed) state.rearmReady=true;
  }

  return state;
}

export function injectRearmableRouteRecoveryDisplacement(
  state,
  position,
  {reason="external-displacement"}={}
){
  const next=point(position,"position");
  const event={
    episodeId:state.episodeId,
    rearmReadyBefore:Boolean(state.rearmReady),
    reason:String(reason),
    from:executorPosition(state.episode),
    to:{...next}
  };

  if(state.rearmReady){
    archiveEpisode(state,"healthy-progress-rearm");
    const witness=state.episode.executor.witness;
    const routeIndex=state.episode.executor.routeIndex;
    state.episodeId+=1;
    state.episode=makeEpisode(state,{
      position:next,
      witness,
      routeIndex
    });
    state.rearmMonitor=createRecoveryRearmMonitor({
      healthyWindowSeconds:state.config.healthyWindowSeconds,
      progressEpsilon:state.config.progressEpsilon
    });
    state.rearmReady=false;
  }else{
    injectSingleRouteRecoveryDisplacement(
      state.episode,
      next,
      {reason:String(reason)}
    );
    resetRecoveryRearmMonitor(state.rearmMonitor);
  }

  event.episodeIdAfter=state.episodeId;
  state.externalDisplacements.push(event);
  return state;
}

export function rearmableRouteRecoverySnapshot(state){
  return {
    schema:REARMABLE_ROUTE_RECOVERY_SCHEMA,
    episodeId:state.episodeId,
    status:state.episode.status,
    rearmReady:state.rearmReady,
    totalFreshQueryCount:state.totalFreshQueryCount,
    episode:singleRouteRecoverySnapshot(state.episode),
    rearm:recoveryRearmSnapshot(state.rearmMonitor),
    archivedEpisodes:structuredClone(state.archivedEpisodes),
    externalDisplacements:structuredClone(state.externalDisplacements)
  };
}
