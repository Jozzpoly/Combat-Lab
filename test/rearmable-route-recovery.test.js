import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {findStaticRouteWitness} from "../src/research/static-route-witness.js";
import {queryStaticCircleOccupancy} from "../src/research/static-feasibility.js";
import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";
import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "../src/research/route-execution-authority.js";
import {
  createRearmableRouteRecoveryState,
  injectRearmableRouteRecoveryDisplacement,
  rearmableRouteRecoverySnapshot,
  stepRearmableRouteRecoveryState
} from "../src/research/rearmable-route-recovery.js";

const DT=1/120;
const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

function witnessFor({from,to,radius,clearance=8}){
  const witness=findStaticRouteWitness({
    from,to,radius,clearance,world:WORLD,obstacles:OBSTACLES
  });
  assert.ok(["direct","witness"].includes(witness.status),JSON.stringify(witness));
  return witness;
}

function waypointIndexNear(witness,point,epsilon=1e-3){
  const index=witness.waypoints.findIndex(candidate=>
    Math.hypot(candidate.x-point.x,candidate.y-point.y)<=epsilon
  );
  assert.ok(index>=0);
  return index;
}

function fixture(){
  const spec=buildDistributedCounterflowTopology(18,{world:WORLD})[0];
  const radius=20;
  const position={x:490,y:275.996};
  const witness=witnessFor({from:spec.start,to:spec.target,radius});
  return {
    spec,radius,position,witness,
    routeIndex:waypointIndexNear(
      witness,
      {x:980,y:335.55555555555554},
      0.01
    )
  };
}

function createFixtureState(){
  const f=fixture();
  return createRearmableRouteRecoveryState({
    position:f.position,
    routeIndex:f.routeIndex,
    witness:f.witness,
    radius:f.radius,
    speed:140,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:5,
    lossPersistenceSeconds:0.35,
    healthyWindowSeconds:0.35,
    progressEpsilon:8
  });
}

function stepUntil(state,predicate,maxSteps=2400,options={}){
  for(let i=0;i<maxSteps;i++){
    if(predicate(state)) return true;
    stepRearmableRouteRecoveryState(state,DT,options);
  }
  return predicate(state);
}

function findRecoverableLostPosition(state){
  const episode=state.episode;
  const executor=episode.executor;
  const witness=executor.witness;
  const routeIndex=executor.routeIndex;
  const target=witness.target;
  const radius=state.config.radius;

  for(let y=90;y<=610;y+=20){
    for(let x=430;x<=670;x+=20){
      const occupancy=queryStaticCircleOccupancy({
        center:{x,y},radius,world:WORLD,obstacles:OBSTACLES
      });
      if(!occupancy.clear) continue;

      const audit=auditRouteExecutionAuthority({
        position:{x,y},
        routeIndex,
        witness,
        radius,
        world:WORLD,
        obstacles:OBSTACLES,
        arrivalTolerance:state.config.arrivalTolerance
      });
      if(audit.status!==ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY) continue;

      const fresh=findStaticRouteWitness({
        from:{x,y},
        to:target,
        radius,
        clearance:witness.clearance ?? 0,
        world:WORLD,
        obstacles:OBSTACLES
      });
      if(["direct","witness"].includes(fresh.status)) return {x,y};
    }
  }
  throw new Error("no recoverable hard-feasible LOST position found");
}

test("R1-3 integration source owns no direct N0b query authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/rearmable-route-recovery.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/findStaticRouteWitness/);
  assert.doesNotMatch(source,/static-route-witness/);
});

test("R1-3 displacement before healthy re-arm remains in the old one-query episode",()=>{
  const state=createFixtureState();

  assert.equal(stepUntil(
    state,
    current=>current.totalFreshQueryCount===1 && !current.rearmReady,
    240
  ),true);
  assert.equal(state.episodeId,1);
  assert.equal(state.totalFreshQueryCount,1);

  const lost=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(
    state,
    lost,
    {reason:"pre-rearm-second-loss"}
  );
  assert.equal(state.episodeId,1);

  stepRearmableRouteRecoveryState(state,DT);
  const out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.status,"RECOVERY_EXHAUSTED");
  assert.equal(out.totalFreshQueryCount,1);
  assert.equal(out.episodeId,1);
});

test("R1-3 healthy verified execution opens exactly one new independent episode",()=>{
  const state=createFixtureState();

  assert.equal(stepUntil(
    state,
    current=>current.rearmReady,
    1800
  ),true);
  let out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.rearmReady,true);
  assert.equal(out.totalFreshQueryCount,1);
  assert.equal(out.episodeId,1);
  assert.equal(out.rearm.status,"REARMED");

  const secondLoss=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(
    state,
    secondLoss,
    {reason:"independent-second-loss"}
  );
  out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.episodeId,2);
  assert.equal(out.rearmReady,false);
  assert.equal(out.totalFreshQueryCount,1);
  assert.equal(out.archivedEpisodes.length,1);
  assert.equal(out.externalDisplacements.at(-1).rearmReadyBefore,true);

  assert.equal(stepUntil(
    state,
    current=>current.totalFreshQueryCount===2,
    240
  ),true);
  out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.totalFreshQueryCount,2);
  assert.equal(out.episodeId,2);
  assert.ok(["RECOVERING","EXECUTING","COMPLETE"].includes(out.status));
});

test("R1-3 second episode still cannot query twice before its own healthy re-arm",()=>{
  const state=createFixtureState();
  assert.equal(stepUntil(state,current=>current.rearmReady,1800),true);

  const secondLoss=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(state,secondLoss,{reason:"episode-2-open"});
  assert.equal(stepUntil(state,current=>current.totalFreshQueryCount===2,240),true);
  assert.equal(state.rearmReady,false);

  const thirdLoss=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(state,thirdLoss,{reason:"same-episode-repeat-loss"});
  assert.equal(state.episodeId,2);

  stepRearmableRouteRecoveryState(state,DT);
  const out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.status,"RECOVERY_EXHAUSTED");
  assert.equal(out.totalFreshQueryCount,2);
  assert.equal(out.episodeId,2);
});

test("R1-3 no recovery query means no episode re-arm authority",()=>{
  const witness=findStaticRouteWitness({
    from:{x:120,y:350},
    to:{x:980,y:350},
    radius:20,
    clearance:0,
    world:WORLD,
    obstacles:OBSTACLES
  });
  assert.equal(witness.status,"direct");

  const state=createRearmableRouteRecoveryState({
    position:{x:120,y:350},
    routeIndex:0,
    witness,
    radius:20,
    speed:140,
    world:WORLD,
    obstacles:OBSTACLES,
    healthyWindowSeconds:0.2,
    progressEpsilon:2
  });

  stepUntil(state,current=>current.episode.status==="COMPLETE",1200);
  const out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.status,"COMPLETE");
  assert.equal(out.totalFreshQueryCount,0);
  assert.equal(out.rearmReady,false);
  assert.equal(out.episodeId,1);
});


test("R1-3 re-arm remains episodic across three independent recovery episodes",()=>{
  const state=createFixtureState();

  // Episode 1: recover once, then prove healthy execution.
  assert.equal(stepUntil(state,current=>current.rearmReady,1800),true);
  assert.equal(state.episodeId,1);
  assert.equal(state.totalFreshQueryCount,1);

  const witness1=structuredClone(state.episode.executor.witness);
  const loss2=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(state,loss2,{reason:"open-episode-2"});
  assert.equal(state.episodeId,2);
  assert.equal(state.archivedEpisodes.length,1);

  // Episode 2: one query only, then independently regain health.
  assert.equal(stepUntil(state,current=>current.rearmReady,1800),true);
  assert.equal(state.episodeId,2);
  assert.equal(state.totalFreshQueryCount,2);
  assert.equal(state.rearmReady,true);
  assert.deepEqual(
    state.archivedEpisodes[0].snapshot.executor.witness.routeNodeIds,
    witness1.routeNodeIds
  );

  const loss3=findRecoverableLostPosition(state);
  injectRearmableRouteRecoveryDisplacement(state,loss3,{reason:"open-episode-3"});
  assert.equal(state.episodeId,3);
  assert.equal(state.archivedEpisodes.length,2);
  assert.equal(state.rearmReady,false);

  // Episode 3 receives one fresh query, proving the episode rule is repeatable
  // rather than a one-off transition hard-coded for 1 -> 2.
  assert.equal(stepUntil(
    state,
    current=>current.totalFreshQueryCount===3,
    600
  ),true);

  const out=rearmableRouteRecoverySnapshot(state);
  assert.equal(out.episodeId,3);
  assert.equal(out.totalFreshQueryCount,3);
  assert.equal(out.archivedEpisodes.length,2);
  assert.equal(out.externalDisplacements.length,2);
  assert.equal(out.externalDisplacements[0].episodeIdAfter,2);
  assert.equal(out.externalDisplacements[1].episodeIdAfter,3);
  assert.ok(["RECOVERING","EXECUTING","COMPLETE"].includes(out.status));
});
