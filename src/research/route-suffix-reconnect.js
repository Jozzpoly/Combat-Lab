import {
  STATIC_LOCOMOTION_POLICIES,
  createStaticLocomotionState,
  setStaticLocomotionDesiredVelocity,
  staticLocomotionSnapshot,
  stepStaticLocomotionState
} from "./static-locomotion.js";
import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "./route-execution-authority.js";

export const ROUTE_SUFFIX_RECONNECT_SCHEMA="combat-lab-route-suffix-reconnect-r1-v0";

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

function nonNegativeInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<0) throw new Error(`${label} must be a non-negative integer`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function distance(a,b){
  return Math.hypot(b.x-a.x,b.y-a.y);
}

function normalizedToward(from,to,speed){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  const d=Math.hypot(dx,dy);
  if(d<=EPS) return {x:0,y:0};
  return {x:dx/d*speed,y:dy/d*speed};
}

function routeNodeMap(witness){
  return new Map((witness.nodes || []).map(node=>[
    String(node.id),
    {id:String(node.id),position:point(node.position,`witness node ${node.id}`)}
  ]));
}

function currentNode(state){
  const nodeId=String(state.witness.routeNodeIds[state.routeIndex+1] || "");
  const node=state.nodeById.get(nodeId);
  if(!node) throw new Error(`active witness node missing: ${nodeId}`);
  return node;
}

function bodyPosition(state){
  return {
    x:state.locomotion.body.x,
    y:state.locomotion.body.y
  };
}

function updateArrival(state){
  const node=currentNode(state);
  const position=bodyPosition(state);
  if(distance(position,node.position)>state.arrivalTolerance+EPS) return false;

  const lastWaypointIndex=state.witness.routeNodeIds.length-2;
  if(state.routeIndex>=lastWaypointIndex){
    state.status="COMPLETE";
    setStaticLocomotionDesiredVelocity(state.locomotion,{x:0,y:0});
    return true;
  }

  state.routeIndex+=1;
  return true;
}

export function createRouteSuffixReconnectState({
  position,
  routeIndex=0,
  witness,
  radius,
  speed=140,
  world,
  obstacles=[],
  arrivalTolerance=3
}={}){
  const r=positive(radius,"radius");
  const s=positive(speed,"speed");
  const arrival=finite(arrivalTolerance,"arrivalTolerance");
  if(arrival<0) throw new Error("arrivalTolerance must be non-negative");
  if(!witness || !["direct","witness"].includes(String(witness.status || ""))){
    throw new Error("route suffix reconnect requires an executable direct/witness route");
  }

  const routeIds=[...(witness.routeNodeIds || [])];
  const index=nonNegativeInteger(routeIndex,"routeIndex");
  if(routeIds.length<2 || index>=routeIds.length-1){
    throw new Error("routeIndex exceeds executable witness suffix");
  }

  const start=point(position,"position");
  const locomotion=createStaticLocomotionState({
    position:start,
    desiredVelocity:{x:0,y:0},
    radius:r,
    world,
    obstacles,
    policy:STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE
  });

  return {
    schema:ROUTE_SUFFIX_RECONNECT_SCHEMA,
    time:0,
    status:"EXECUTING",
    witness:structuredClone(witness),
    nodeById:routeNodeMap(witness),
    routeIndex:index,
    radius:r,
    speed:s,
    world:structuredClone(world),
    obstacles:structuredClone(obstacles),
    arrivalTolerance:arrival,
    locomotion,
    lastAuthority:null,
    reconnectCount:0,
    reconnectHistory:[]
  };
}

export function stepRouteSuffixReconnectState(state,dt){
  const delta=positive(dt,"dt");
  if(state.status==="COMPLETE" || state.status==="LOST_EXECUTABILITY") return state;

  // Consume already-reached witness nodes before asking for route authority.
  while(state.status==="EXECUTING" && updateArrival(state)){
    if(state.status==="COMPLETE") return state;
  }

  let audit=auditRouteExecutionAuthority({
    position:bodyPosition(state),
    routeIndex:state.routeIndex,
    witness:state.witness,
    radius:state.radius,
    world:state.world,
    obstacles:state.obstacles,
    arrivalTolerance:state.arrivalTolerance
  });
  state.lastAuthority=structuredClone(audit);

  if(audit.status===ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY){
    state.status="LOST_EXECUTABILITY";
    setStaticLocomotionDesiredVelocity(state.locomotion,{x:0,y:0});
    return state;
  }

  if(audit.status===ROUTE_EXECUTION_STATUS.RECONNECTABLE_SUFFIX){
    const candidate=audit.selectedReconnectCandidate;
    if(!candidate || !candidate.clear){
      throw new Error("RECONNECTABLE_SUFFIX requires a hard-feasible selected candidate");
    }
    const nextRouteIndex=candidate.routeNodeIndex-1;
    if(nextRouteIndex<=state.routeIndex){
      throw new Error("local reconnect must advance monotonically to a later witness suffix");
    }
    state.reconnectCount+=1;
    state.reconnectHistory.push({
      time:state.time,
      fromRouteIndex:state.routeIndex,
      toRouteIndex:nextRouteIndex,
      nodeId:candidate.nodeId,
      localRemainingCost:candidate.localRemainingCost,
      directDistance:candidate.directDistance
    });
    state.routeIndex=nextRouteIndex;

    // Re-audit the committed suffix. This must now be the active hard-clear edge.
    audit=auditRouteExecutionAuthority({
      position:bodyPosition(state),
      routeIndex:state.routeIndex,
      witness:state.witness,
      radius:state.radius,
      world:state.world,
      obstacles:state.obstacles,
      arrivalTolerance:state.arrivalTolerance
    });
    state.lastAuthority=structuredClone(audit);
    if(audit.status!==ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR){
      throw new Error("committed reconnect suffix must become the active hard-clear edge");
    }
  }

  const waypoint=currentNode(state).position;
  setStaticLocomotionDesiredVelocity(
    state.locomotion,
    normalizedToward(bodyPosition(state),waypoint,state.speed)
  );
  stepStaticLocomotionState(state.locomotion,delta);
  state.time+=delta;

  updateArrival(state);
  return state;
}

export function routeSuffixReconnectSnapshot(state){
  return {
    schema:ROUTE_SUFFIX_RECONNECT_SCHEMA,
    time:state.time,
    status:state.status,
    routeIndex:state.routeIndex,
    activeNodeId:state.status==="COMPLETE"
      ? "target"
      : currentNode(state).id,
    position:bodyPosition(state),
    reconnectCount:state.reconnectCount,
    reconnectHistory:structuredClone(state.reconnectHistory),
    lastAuthority:state.lastAuthority ? structuredClone(state.lastAuthority) : null,
    locomotion:staticLocomotionSnapshot(state.locomotion)
  };
}
