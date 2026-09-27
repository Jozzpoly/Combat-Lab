import {
  queryStaticCircleOccupancy,
  queryStaticCircleTraversal
} from "./static-feasibility.js";

export const STATIC_ROUTE_WITNESS_SCHEMA="combat-lab-static-route-witness-v0";
const EPS=1e-9;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function normalizeRect(rect,index){
  const x=finite(rect?.x,`obstacles[${index}].x`);
  const y=finite(rect?.y,`obstacles[${index}].y`);
  const width=finite(rect?.w ?? rect?.width,`obstacles[${index}].width`);
  const height=finite(rect?.h ?? rect?.height,`obstacles[${index}].height`);
  if(width<0 || height<0) throw new Error("static obstacle dimensions must be non-negative");
  return {id:String(rect?.id || `obstacle-${index}`),x,y,width,height};
}

function edgeId(a,b){
  return a<b ? `${a}<->${b}` : `${b}<->${a}`;
}

function validateObstacleIds(obstacles){
  const seen=new Set();
  for(const [index,raw] of obstacles.entries()){
    const id=normalizeRect(raw,index).id;
    if(seen.has(id)) throw new Error(`duplicate static obstacle id: ${id}`);
    seen.add(id);
  }
}

function candidateNodes({world,obstacles,radius,nodeEpsilon}){
  const nodes=[];
  for(const [index,raw] of obstacles.entries()){
    const rect=normalizeRect(raw,index);
    const margin=radius+nodeEpsilon;
    const candidates=[
      {id:`${rect.id}.nw`,position:{x:rect.x-margin,y:rect.y-margin}},
      {id:`${rect.id}.ne`,position:{x:rect.x+rect.width+margin,y:rect.y-margin}},
      {id:`${rect.id}.se`,position:{x:rect.x+rect.width+margin,y:rect.y+rect.height+margin}},
      {id:`${rect.id}.sw`,position:{x:rect.x-margin,y:rect.y+rect.height+margin}}
    ];
    for(const candidate of candidates){
      const occupancy=queryStaticCircleOccupancy({
        center:candidate.position,
        radius,
        world,
        obstacles
      });
      if(occupancy.clear) nodes.push(candidate);
    }
  }
  return nodes.sort((a,b)=>a.id.localeCompare(b.id));
}

function comfortQuery(options){
  if(options.clearance<=0){
    return queryStaticCircleTraversal({
      from:options.from,
      to:options.to,
      radius:options.radius,
      world:options.world,
      obstacles:options.obstacles
    });
  }
  try{
    return queryStaticCircleTraversal({
      from:options.from,
      to:options.to,
      radius:options.radius+options.clearance,
      world:options.world,
      obstacles:options.obstacles
    });
  }catch(error){
    return {
      from:{...options.from},
      to:{...options.to},
      radius:options.radius+options.clearance,
      distance:Math.hypot(options.to.x-options.from.x,options.to.y-options.from.y),
      clear:false,
      blocker:{
        id:"comfort.out-of-domain",
        type:"constraint",
        distance:0,
        fraction:0,
        hitCenter:{...options.from},
        normal:{x:0,y:0},
        initialOverlap:true,
        reason:String(error?.message || error)
      }
    };
  }
}

function buildEdges(nodes,{radius,clearance,world,obstacles}){
  const edges=[];
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i];
      const b=nodes[j];
      const hard=queryStaticCircleTraversal({
        from:a.position,to:b.position,radius,world,obstacles
      });
      if(!hard.clear) continue;
      const comfort=comfortQuery({
        from:a.position,to:b.position,radius,clearance,world,obstacles
      });
      edges.push({
        id:edgeId(a.id,b.id),
        from:a.id,
        to:b.id,
        distance:hard.distance,
        hard,
        comfort,
        comfortClear:comfort.clear
      });
    }
  }
  return edges.sort((a,b)=>a.id.localeCompare(b.id));
}

function shortestWitness(nodes,edges){
  const adjacency=new Map(nodes.map(node=>[node.id,[]]));
  for(const edge of edges){
    adjacency.get(edge.from)?.push({to:edge.to,cost:edge.distance,edgeId:edge.id});
    adjacency.get(edge.to)?.push({to:edge.from,cost:edge.distance,edgeId:edge.id});
  }
  for(const list of adjacency.values()) list.sort((a,b)=>a.to.localeCompare(b.to));

  const best=new Map([["start",0]]);
  const key=new Map([["start","start"]]);
  const previous=new Map();
  const previousEdge=new Map();
  const open=[{id:"start",cost:0,pathKey:"start"}];

  while(open.length){
    open.sort((a,b)=>{
      if(Math.abs(a.cost-b.cost)>EPS) return a.cost-b.cost;
      return a.pathKey.localeCompare(b.pathKey);
    });
    const current=open.shift();
    if(!current) break;
    if(current.cost>Number(best.get(current.id))+EPS) continue;
    if(current.pathKey!==key.get(current.id)) continue;
    if(current.id==="target") break;

    for(const next of adjacency.get(current.id) || []){
      const nextCost=current.cost+next.cost;
      const nextKey=`${current.pathKey}>${next.to}`;
      const old=best.get(next.to);
      const oldKey=key.get(next.to);
      const better=old===undefined || nextCost<old-EPS;
      const tie=old!==undefined && Math.abs(nextCost-old)<=EPS &&
        (oldKey===undefined || nextKey<oldKey);
      if(!better && !tie) continue;
      best.set(next.to,nextCost);
      key.set(next.to,nextKey);
      previous.set(next.to,current.id);
      previousEdge.set(next.to,next.edgeId);
      open.push({id:next.to,cost:nextCost,pathKey:nextKey});
    }
  }

  if(!best.has("target")) return null;
  const nodeIds=["target"];
  const edgeIds=[];
  let cursor="target";
  while(cursor!=="start"){
    const parent=previous.get(cursor);
    const edge=previousEdge.get(cursor);
    if(!parent || !edge) return null;
    nodeIds.push(parent);
    edgeIds.push(edge);
    cursor=parent;
  }
  nodeIds.reverse();
  edgeIds.reverse();
  return {nodeIds,edgeIds,cost:best.get("target")};
}

export function findStaticRouteWitness({
  from,to,radius,clearance=0,world,obstacles=[],nodeEpsilon
}={}){
  const start=point(from,"from");
  const target=point(to,"to");
  const hardRadius=finite(radius,"radius");
  const comfortClearance=finite(clearance,"clearance");
  if(hardRadius<=0) throw new Error("radius must be positive");
  if(comfortClearance<0) throw new Error("clearance must be non-negative");
  const epsilon=nodeEpsilon===undefined
    ? Math.max(1e-6,hardRadius*1e-3)
    : finite(nodeEpsilon,"nodeEpsilon");
  if(epsilon<=0) throw new Error("nodeEpsilon must be positive");
  validateObstacleIds(obstacles);

  const base={
    schema:STATIC_ROUTE_WITNESS_SCHEMA,
    completeness:"witness-only",
    provesUnreachable:false,
    from:start,
    target,
    radius:hardRadius,
    clearance:comfortClearance,
    desiredRadius:hardRadius+comfortClearance
  };

  const startOccupancy=queryStaticCircleOccupancy({
    center:start,radius:hardRadius,world,obstacles
  });
  if(!startOccupancy.clear){
    return {
      ...base,status:"invalid-start",reason:"hard body does not fit at start",
      blocker:startOccupancy.blocker,nodes:[],edges:[],routeNodeIds:[],routeEdgeIds:[],
      waypoints:[],cost:null,clearanceConstrained:false
    };
  }

  const targetOccupancy=queryStaticCircleOccupancy({
    center:target,radius:hardRadius,world,obstacles
  });
  if(!targetOccupancy.clear){
    return {
      ...base,status:"invalid-target",reason:"hard body does not fit at target",
      blocker:targetOccupancy.blocker,nodes:[],edges:[],routeNodeIds:[],routeEdgeIds:[],
      waypoints:[],cost:null,clearanceConstrained:false
    };
  }

  const direct=queryStaticCircleTraversal({
    from:start,to:target,radius:hardRadius,world,obstacles
  });
  if(direct.clear){
    const comfort=comfortQuery({
      from:start,to:target,radius:hardRadius,clearance:comfortClearance,world,obstacles
    });
    return {
      ...base,status:"direct",reason:"direct hard-feasible traversal is a verified witness",
      blocker:null,
      nodes:[
        {id:"start",position:{...start}},
        {id:"target",position:{...target}}
      ],
      edges:[{
        id:edgeId("start","target"),
        from:"start",to:"target",distance:direct.distance,
        hard:direct,comfort,comfortClear:comfort.clear
      }],
      routeNodeIds:["start","target"],
      routeEdgeIds:[edgeId("start","target")],
      waypoints:[{...target}],
      cost:direct.distance,
      clearanceConstrained:!comfort.clear
    };
  }

  const nodes=[
    {id:"start",position:{...start}},
    {id:"target",position:{...target}},
    ...candidateNodes({world,obstacles,radius:hardRadius,nodeEpsilon:epsilon})
  ];
  const edges=buildEdges(nodes,{
    radius:hardRadius,
    clearance:comfortClearance,
    world,
    obstacles
  });
  const witness=shortestWitness(nodes,edges);
  if(!witness){
    return {
      ...base,
      status:"none-found",
      reason:`direct traversal blocked by ${direct.blocker?.id || "static geometry"}; bounded candidate graph found no verified hard-feasible alternative`,
      blocker:direct.blocker,
      nodes,edges,routeNodeIds:[],routeEdgeIds:[],waypoints:[],cost:null,
      clearanceConstrained:false
    };
  }

  const nodeById=new Map(nodes.map(node=>[node.id,node]));
  const edgeById=new Map(edges.map(edge=>[edge.id,edge]));
  const routeEdges=witness.edgeIds.map(id=>edgeById.get(id)).filter(Boolean);
  const clearanceConstrained=routeEdges.some(edge=>!edge.comfortClear);
  return {
    ...base,
    status:"witness",
    reason:`direct traversal blocked by ${direct.blocker?.id || "static geometry"}; verified hard-feasible alternative witness found`,
    blocker:direct.blocker,
    nodes,edges,
    routeNodeIds:witness.nodeIds,
    routeEdgeIds:witness.edgeIds,
    waypoints:witness.nodeIds.slice(1).map(id=>({...nodeById.get(id).position})),
    cost:witness.cost,
    clearanceConstrained
  };
}
