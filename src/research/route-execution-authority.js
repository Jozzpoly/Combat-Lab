import {queryStaticCircleTraversal} from "./static-feasibility.js";

export const ROUTE_EXECUTION_AUTHORITY_SCHEMA="combat-lab-route-execution-authority-r1-v0";

export const ROUTE_EXECUTION_STATUS={
  ACTIVE_EDGE_CLEAR:"ACTIVE_EDGE_CLEAR",
  RECONNECTABLE_SUFFIX:"RECONNECTABLE_SUFFIX",
  LOST_EXECUTABILITY:"LOST_EXECUTABILITY",
  NO_EXECUTABLE_WITNESS:"NO_EXECUTABLE_WITNESS"
};

const EPS=1e-9;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
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

function cloneBlocker(blocker){
  if(!blocker) return null;
  return structuredClone(blocker);
}

function witnessNodeMap(witness){
  return new Map((witness?.nodes || []).map(node=>[
    String(node.id),
    {id:String(node.id),position:point(node.position,`witness node ${node.id}`)}
  ]));
}

function witnessEdgeMap(witness){
  return new Map((witness?.edges || []).map(edge=>[
    String(edge.id),
    {
      id:String(edge.id),
      from:String(edge.from),
      to:String(edge.to),
      distance:finite(edge.distance,`witness edge ${edge.id}.distance`)
    }
  ]));
}

function suffixCostFromNodeIndex(witness,routeNodeIndex,edgeById){
  const routeEdgeIds=[...(witness.routeEdgeIds || [])];
  let total=0;
  for(let edgeIndex=routeNodeIndex;edgeIndex<routeEdgeIds.length;edgeIndex++){
    const edgeId=String(routeEdgeIds[edgeIndex]);
    const edge=edgeById.get(edgeId);
    if(!edge) throw new Error(`witness route edge missing: ${edgeId}`);
    total+=edge.distance;
  }
  return total;
}

function auditTraversal({from,to,radius,world,obstacles,nodeId,routeNodeIndex,suffixCost}){
  const traversal=queryStaticCircleTraversal({
    from,to,radius,world,obstacles
  });
  return {
    nodeId,
    routeNodeIndex,
    position:{...to},
    clear:Boolean(traversal.clear),
    directDistance:traversal.distance,
    suffixCost,
    localRemainingCost:traversal.clear ? traversal.distance+suffixCost : null,
    blocker:traversal.clear ? null : cloneBlocker(traversal.blocker)
  };
}

export function auditRouteExecutionAuthority({
  position,
  routeIndex=0,
  witness,
  radius,
  world,
  obstacles=[],
  arrivalTolerance=0
}={}){
  const current=point(position,"position");
  const r=finite(radius,"radius");
  const activeRouteIndex=nonNegativeInteger(routeIndex,"routeIndex");
  const arrival=finite(arrivalTolerance,"arrivalTolerance");
  if(r<=0) throw new Error("radius must be positive");
  if(arrival<0) throw new Error("arrivalTolerance must be non-negative");
  if(!witness || typeof witness!=="object") throw new Error("witness required");

  const witnessStatus=String(witness.status || "");
  const target=point(witness.target,"witness.target");

  if(witnessStatus!=="direct" && witnessStatus!=="witness"){
    return {
      schema:ROUTE_EXECUTION_AUTHORITY_SCHEMA,
      witnessStatus,
      routeIndex:activeRouteIndex,
      status:ROUTE_EXECUTION_STATUS.NO_EXECUTABLE_WITNESS,
      currentPosition:current,
      target,
      activeNodeId:null,
      activeTraversal:null,
      remainingNodeAudits:[],
      reachableSuffixCandidates:[],
      selectedReconnectCandidate:null,
      targetDistance:distance(current,target),
      arrivalEligible:false,
      reason:"current route witness does not contain an executable verified route"
    };
  }

  const routeNodeIds=[...(witness.routeNodeIds || [])].map(String);
  const routeEdgeIds=[...(witness.routeEdgeIds || [])].map(String);
  if(routeNodeIds.length<2) throw new Error("executable witness must contain start and target route nodes");
  if(routeEdgeIds.length!==routeNodeIds.length-1){
    throw new Error("routeEdgeIds must match routeNodeIds edge count");
  }
  if(activeRouteIndex>=routeNodeIds.length-1){
    throw new Error("routeIndex exceeds witness waypoint suffix");
  }

  const nodeById=witnessNodeMap(witness);
  const edgeById=witnessEdgeMap(witness);
  const activeNodeIndex=activeRouteIndex+1;
  const audits=[];

  for(let nodeIndex=activeNodeIndex;nodeIndex<routeNodeIds.length;nodeIndex++){
    const nodeId=routeNodeIds[nodeIndex];
    const node=nodeById.get(nodeId);
    if(!node) throw new Error(`witness route node missing: ${nodeId}`);
    const suffixCost=suffixCostFromNodeIndex(witness,nodeIndex,edgeById);
    audits.push(auditTraversal({
      from:current,
      to:node.position,
      radius:r,
      world,
      obstacles,
      nodeId,
      routeNodeIndex:nodeIndex,
      suffixCost
    }));
  }

  const activeTraversal=audits[0];
  const reachable=audits.filter(item=>item.clear);
  const laterReachable=reachable.filter(item=>item.routeNodeIndex>activeNodeIndex);

  let status=ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY;
  if(activeTraversal?.clear){
    status=ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR;
  }else if(laterReachable.length){
    status=ROUTE_EXECUTION_STATUS.RECONNECTABLE_SUFFIX;
  }

  const selectedReconnectCandidate=reachable
    .slice()
    .sort((a,b)=>{
      const costA=Number(a.localRemainingCost);
      const costB=Number(b.localRemainingCost);
      if(Math.abs(costA-costB)>EPS) return costA-costB;
      return a.nodeId.localeCompare(b.nodeId);
    })[0] || null;

  const targetAudit=audits.at(-1) || null;
  const targetDistance=distance(current,target);
  const arrivalEligible=Boolean(
    targetAudit?.clear &&
    targetDistance<=arrival+EPS
  );

  return {
    schema:ROUTE_EXECUTION_AUTHORITY_SCHEMA,
    witnessStatus,
    routeIndex:activeRouteIndex,
    status,
    currentPosition:current,
    target,
    activeNodeId:routeNodeIds[activeNodeIndex],
    activeTraversal:structuredClone(activeTraversal),
    remainingNodeAudits:audits.map(item=>structuredClone(item)),
    reachableSuffixCandidates:laterReachable.map(item=>structuredClone(item)),
    selectedReconnectCandidate:selectedReconnectCandidate
      ? structuredClone(selectedReconnectCandidate)
      : null,
    targetDistance,
    arrivalEligible,
    reason:status===ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR
      ? "current embodied position retains a hard-feasible connection to the active witness node"
      : status===ROUTE_EXECUTION_STATUS.RECONNECTABLE_SUFFIX
        ? "active witness node is no longer locally reachable, but a later verified suffix node has a fresh hard-feasible local connection"
        : "no remaining node in the verified witness suffix is directly hard-feasible from the current embodied position"
  };
}
