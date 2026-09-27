import test from "node:test";
import assert from "node:assert/strict";
import {
  createMinimalReplanState,
  minimalReplanCausalSnapshot,
  stepMinimalReplanState
} from "../src/research/minimal-replan-agent.js";

const world={width:960,height:600};
const obstacles=[{id:"wall.center",x:430,y:170,w:100,h:260}];
const base={
  world,
  obstacles,
  start:{x:180,y:300},
  target:{x:780,y:300},
  radius:24,
  speed:180,
  noProgressSeconds:0.65,
  progressEpsilon:0.35,
  clearance:8
};

function run(state,seconds){
  const steps=Math.ceil(seconds*120);
  for(let i=0;i<steps;i++) stepMinimalReplanState(state,1/120);
  return state;
}

test("N1 baseline without replanning factually stalls at the static blocker",()=>{
  const state=createMinimalReplanState({...base,replanningEnabled:false});
  run(state,8);

  assert.equal(state.status,"MOVING");
  assert.equal(state.planMode,"DIRECT");
  assert.equal(state.replanCount,0);
  assert.ok(state.goalDistance>300);
  assert.ok(state.noProgressFor>4);
  assert.equal(state.lastBlocker?.id,"wall.center");
});

test("N1 does not replan on first contact; it waits for bounded factual no-progress",()=>{
  const state=createMinimalReplanState(base);

  for(let i=0;i<240 && !state.lastBlocker;i++){
    stepMinimalReplanState(state,1/120);
  }
  assert.equal(state.lastBlocker?.id,"wall.center");
  assert.equal(state.replanAttempted,false);
  assert.equal(state.replanCount,0);

  const beforeThreshold=Math.max(0,state.policy.noProgressSeconds-0.12);
  run(state,beforeThreshold);
  assert.equal(state.replanAttempted,false);

  run(state,0.2);
  assert.equal(state.replanAttempted,true);
  assert.equal(state.replanCount,1);
  assert.equal(state.planMode,"ROUTE_WITNESS");
});

test("N1 consumes one verified route witness and resumes progress to the goal",()=>{
  const state=createMinimalReplanState(base);
  run(state,8);

  assert.equal(state.status,"ARRIVED");
  assert.equal(state.replanCount,1);
  assert.equal(state.replanAttempted,true);
  assert.ok(state.replanAtTime>=state.policy.noProgressSeconds);
  assert.equal(state.lastRouteWitness?.status,"witness");
  assert.equal(state.lastRouteWitness?.provesUnreachable,false);
  assert.ok(state.lastRouteWitness?.routeNodeIds.length>2);
  assert.ok(Math.hypot(
    state.actor.position.x-state.purpose.target.x,
    state.actor.position.y-state.purpose.target.y
  )<=state.policy.arrivalTolerance+1e-9);
});

test("N1 actor policy consumes the supplied witness instead of hard-coding a route side",()=>{
  const state=createMinimalReplanState(base);
  const supplied={
    schema:"combat-lab-static-route-witness-v0",
    completeness:"witness-only",
    provesUnreachable:false,
    status:"witness",
    routeNodeIds:["start","custom.low","target"],
    routeEdgeIds:["a","b"],
    waypoints:[
      {x:390,y:500},
      {x:570,y:500},
      {...base.target}
    ],
    clearanceConstrained:false
  };
  const routeWitness=()=>structuredClone(supplied);

  for(let i=0;i<600 && !state.replanAttempted;i++){
    stepMinimalReplanState(state,1/120,{routeWitness});
  }

  assert.equal(state.planMode,"ROUTE_WITNESS");
  assert.deepEqual(state.route,supplied.waypoints);
  assert.equal(state.lastRouteWitness.routeNodeIds[1],"custom.low");
});

test("N1 none-found remains an honest stuck outcome rather than invented motion",()=>{
  const sealed=createMinimalReplanState({
    world:{width:12,height:8},
    obstacles:[{id:"sealed",x:5.5,y:0,w:1,h:8}],
    start:{x:2,y:4},
    target:{x:10,y:4},
    radius:0.5,
    speed:2,
    noProgressSeconds:0.4,
    progressEpsilon:0.02,
    clearance:0
  });
  run(sealed,5);

  assert.equal(sealed.status,"STUCK_NO_WITNESS");
  assert.equal(sealed.planMode,"NO_WITNESS");
  assert.equal(sealed.replanAttempted,true);
  assert.equal(sealed.replanCount,0);
  assert.equal(sealed.lastRouteWitness?.status,"none-found");
  assert.equal(sealed.lastRouteWitness?.provesUnreachable,false);
});

test("N1 causal snapshot exposes purpose, progress, blocker and replan evidence without steering the actor",()=>{
  const state=createMinimalReplanState(base);
  run(state,2.2);
  const snap=minimalReplanCausalSnapshot(state);

  assert.equal(snap.schema,"combat-lab-minimal-replan-v0");
  assert.deepEqual(snap.purpose.target,base.target);
  assert.ok(["DIRECT","ROUTE_WITNESS"].includes(snap.immediatePlan.mode));
  assert.ok(Number.isFinite(snap.factualProgress.goalDistance));
  assert.ok(Number.isFinite(snap.factualProgress.noProgressFor));
  assert.equal(typeof snap.replan.attempted,"boolean");
});
