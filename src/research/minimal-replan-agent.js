import {
  queryStaticCircleTraversal
} from "./static-feasibility.js";
import {findStaticRouteWitness} from "./static-route-witness.js";

export const MINIMAL_REPLAN_SCHEMA="combat-lab-minimal-replan-v0";

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function cloneObstacles(obstacles=[]){
  return obstacles.map((raw,index)=>({
    id:String(raw?.id || `obstacle-${index}`),
    x:finite(raw?.x,`obstacles[${index}].x`),
    y:finite(raw?.y,`obstacles[${index}].y`),
    w:finite(raw?.w ?? raw?.width,`obstacles[${index}].w`),
    h:finite(raw?.h ?? raw?.height,`obstacles[${index}].h`)
  }));
}

function distance(a,b){
  return Math.hypot(b.x-a.x,b.y-a.y);
}

export function createMinimalReplanState({
  world,
  obstacles=[],
  start,
  target,
  radius=24,
  speed=180,
  noProgressSeconds=0.65,
  progressEpsilon=0.35,
  clearance=8,
  arrivalTolerance=3,
  replanningEnabled=true
}={}){
  const normalizedWorld={
    width:finite(world?.width,"world.width"),
    height:finite(world?.height,"world.height")
  };
  const position=point(start,"start");
  const goal=point(target,"target");
  const r=finite(radius,"radius");
  const s=finite(speed,"speed");
  const stall=finite(noProgressSeconds,"noProgressSeconds");
  const epsilon=finite(progressEpsilon,"progressEpsilon");
  const comfort=finite(clearance,"clearance");
  const arrival=finite(arrivalTolerance,"arrivalTolerance");

  if(r<=0) throw new Error("radius must be positive");
  if(s<=0) throw new Error("speed must be positive");
  if(stall<=0) throw new Error("noProgressSeconds must be positive");
  if(epsilon<0) throw new Error("progressEpsilon must be non-negative");
  if(comfort<0) throw new Error("clearance must be non-negative");
  if(arrival<0) throw new Error("arrivalTolerance must be non-negative");

  const initialDistance=distance(position,goal);
  return {
    schema:MINIMAL_REPLAN_SCHEMA,
    world:normalizedWorld,
    obstacles:cloneObstacles(obstacles),
    actor:{
      position,
      radius:r,
      speed:s
    },
    purpose:{
      type:"reach-target",
      target:goal
    },
    policy:{
      replanningEnabled:Boolean(replanningEnabled),
      noProgressSeconds:stall,
      progressEpsilon:epsilon,
      clearance:comfort,
      arrivalTolerance:arrival
    },
    time:0,
    status:"MOVING",
    planMode:"DIRECT",
    route:[{...goal}],
    routeIndex:0,
    lastBlocker:null,
    bestGoalDistance:initialDistance,
    goalDistance:initialDistance,
    noProgressFor:0,
    replanAttempted:false,
    replanCount:0,
    replanAtTime:null,
    lastRouteWitness:null
  };
}

function currentWaypoint(state){
  return state.route[state.routeIndex] || state.purpose.target;
}

function moveOneStep(state,dt){
  const position=state.actor.position;
  const waypoint=currentWaypoint(state);
  const remaining=distance(position,waypoint);
  if(remaining<=state.policy.arrivalTolerance){
    state.actor.position={...waypoint};
    if(state.routeIndex<state.route.length-1){
      state.routeIndex+=1;
      return {moved:0,blocker:null,reachedWaypoint:true};
    }
    if(distance(state.actor.position,state.purpose.target)<=state.policy.arrivalTolerance){
      state.status="ARRIVED";
      return {moved:0,blocker:null,reachedWaypoint:true};
    }
  }

  const active=currentWaypoint(state);
  const dx=active.x-state.actor.position.x;
  const dy=active.y-state.actor.position.y;
  const len=Math.hypot(dx,dy);
  if(len<=1e-12) return {moved:0,blocker:null,reachedWaypoint:false};

  const maxDistance=state.actor.speed*dt;
  const stepDistance=Math.min(len,maxDistance);
  const proposed={
    x:state.actor.position.x+dx/len*stepDistance,
    y:state.actor.position.y+dy/len*stepDistance
  };
  const traversal=queryStaticCircleTraversal({
    from:state.actor.position,
    to:proposed,
    radius:state.actor.radius,
    world:state.world,
    obstacles:state.obstacles
  });

  if(traversal.clear){
    state.actor.position=proposed;
    return {moved:stepDistance,blocker:null,reachedWaypoint:false};
  }

  const safeFraction=Math.max(0,traversal.blocker.fraction-1e-7);
  const actualDistance=stepDistance*safeFraction;
  if(actualDistance>0){
    state.actor.position={
      x:state.actor.position.x+dx/len*actualDistance,
      y:state.actor.position.y+dy/len*actualDistance
    };
  }
  return {moved:actualDistance,blocker:traversal.blocker,reachedWaypoint:false};
}

function attemptReplan(state,routeWitness){
  state.replanAttempted=true;
  const witness=routeWitness({
    from:state.actor.position,
    to:state.purpose.target,
    radius:state.actor.radius,
    clearance:state.policy.clearance,
    world:state.world,
    obstacles:state.obstacles
  });
  state.lastRouteWitness=structuredClone(witness);

  if(witness.status==="witness"){
    state.route=witness.waypoints.map(p=>({...p}));
    state.routeIndex=0;
    state.planMode="ROUTE_WITNESS";
    state.replanCount+=1;
    state.replanAtTime=state.time;
    state.noProgressFor=0;
    state.lastBlocker=null;
    return;
  }

  if(witness.status==="direct"){
    state.route=[{...state.purpose.target}];
    state.routeIndex=0;
    state.planMode="DIRECT";
    state.replanCount+=1;
    state.replanAtTime=state.time;
    state.noProgressFor=0;
    state.lastBlocker=null;
    return;
  }

  state.status="STUCK_NO_WITNESS";
  state.planMode="NO_WITNESS";
}

export function stepMinimalReplanState(
  state,
  dt,
  {routeWitness=findStaticRouteWitness}={}
){
  const delta=finite(dt,"dt");
  if(delta<=0) throw new Error("dt must be positive");
  if(state.status==="ARRIVED" || state.status==="STUCK_NO_WITNESS") return state;

  const result=moveOneStep(state,delta);
  state.time+=delta;
  state.lastBlocker=result.blocker ? structuredClone(result.blocker) : null;

  const goalDistance=distance(state.actor.position,state.purpose.target);
  state.goalDistance=goalDistance;

  if(state.status==="ARRIVED"){
    state.goalDistance=0;
    state.bestGoalDistance=0;
    state.noProgressFor=0;
    return state;
  }

  if(goalDistance<state.bestGoalDistance-state.policy.progressEpsilon){
    state.bestGoalDistance=goalDistance;
    state.noProgressFor=0;
  }else{
    state.noProgressFor+=delta;
  }

  if(
    state.planMode==="DIRECT" &&
    state.policy.replanningEnabled &&
    !state.replanAttempted &&
    state.noProgressFor>=state.policy.noProgressSeconds
  ){
    attemptReplan(state,routeWitness);
  }

  return state;
}

export function minimalReplanCausalSnapshot(state){
  const waypoint=currentWaypoint(state);
  return {
    schema:MINIMAL_REPLAN_SCHEMA,
    time:state.time,
    status:state.status,
    purpose:{
      type:state.purpose.type,
      target:{...state.purpose.target}
    },
    immediatePlan:{
      mode:state.planMode,
      waypoint:{...waypoint},
      routeIndex:state.routeIndex,
      routeLength:state.route.length
    },
    factualProgress:{
      goalDistance:state.goalDistance,
      bestGoalDistance:state.bestGoalDistance,
      noProgressFor:state.noProgressFor,
      threshold:state.policy.noProgressSeconds
    },
    obstruction:state.lastBlocker
      ? {id:state.lastBlocker.id,distance:state.lastBlocker.distance,fraction:state.lastBlocker.fraction}
      : null,
    replan:{
      attempted:state.replanAttempted,
      count:state.replanCount,
      atTime:state.replanAtTime,
      witness:state.lastRouteWitness
        ? {
            status:state.lastRouteWitness.status,
            provesUnreachable:state.lastRouteWitness.provesUnreachable,
            routeNodeIds:[...(state.lastRouteWitness.routeNodeIds || [])],
            clearanceConstrained:Boolean(state.lastRouteWitness.clearanceConstrained)
          }
        : null
    }
  };
}
