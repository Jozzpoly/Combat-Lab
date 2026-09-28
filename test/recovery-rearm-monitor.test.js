import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  createRecoveryRearmMonitor,
  observeRecoveryRearm
} from "../src/research/recovery-rearm-monitor.js";
import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "../src/research/route-execution-authority.js";
import {findStaticRouteWitness} from "../src/research/static-route-witness.js";
import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";
import {
  createSingleRouteRecoveryState,
  stepSingleRouteRecoveryState
} from "../src/research/single-route-recovery.js";

const DT=1/120;
const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

function feed(monitor,time,x,y,metric,status=ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR){
  return observeRecoveryRearm(monitor,{
    time,
    position:{x,y},
    authorityStatus:status,
    verifiedRemainingCost:metric
  });
}

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

function filmFixture(){
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

function executorMetric(state){
  const executor=state.executor;
  const position={
    x:executor.locomotion.body.x,
    y:executor.locomotion.body.y
  };
  const audit=auditRouteExecutionAuthority({
    position,
    routeIndex:executor.routeIndex,
    witness:executor.witness,
    radius:state.radius,
    world:state.world,
    obstacles:state.obstacles,
    arrivalTolerance:state.arrivalTolerance
  });
  const metric=audit.activeTraversal?.localRemainingCost;
  return {position,audit,metric};
}

test("R1-3 monitor source owns no N0b/global recovery authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/recovery-rearm-monitor.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/findStaticRouteWitness/);
  assert.doesNotMatch(source,/single-route-recovery/);
});

test("R1-3 one lucky frame cannot re-arm before the continuous healthy window",()=>{
  const monitor=createRecoveryRearmMonitor({
    healthyWindowSeconds:0.35,
    progressEpsilon:8
  });
  feed(monitor,0,0,0,100);
  const out=feed(monitor,0.1,30,0,60);
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"BUILDING_HEALTHY_WINDOW");
});

test("R1-3 lateral body travel without verified route progress cannot re-arm",()=>{
  const monitor=createRecoveryRearmMonitor({
    healthyWindowSeconds:0.35,
    progressEpsilon:8
  });
  let out=null;
  for(let i=0;i<=42;i++){
    out=feed(monitor,i/120,0,i,100);
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"HEALTH_NOT_PROVEN");
  assert.ok(out.bodyTravel>8);
  assert.equal(out.metricImprovement,0);
});

test("R1-3 metric improvement without material body travel cannot re-arm",()=>{
  const monitor=createRecoveryRearmMonitor({
    healthyWindowSeconds:0.35,
    progressEpsilon:8
  });
  let out=null;
  for(let i=0;i<=42;i++){
    out=feed(monitor,i/120,0,0,100-i*0.5);
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"HEALTH_NOT_PROVEN");
  assert.equal(out.bodyTravel,0);
  assert.ok(out.metricImprovement>8);
});

test("R1-3 route-authority loss resets the healthy window",()=>{
  const monitor=createRecoveryRearmMonitor({
    healthyWindowSeconds:0.35,
    progressEpsilon:8
  });
  for(let i=0;i<30;i++){
    feed(monitor,i/120,i*0.5,0,100-i*0.5);
  }
  let out=feed(
    monitor,
    30/120,
    15,0,85,
    ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY
  );
  assert.equal(out.status,"UNHEALTHY_AUTHORITY");
  assert.equal(out.sampleCount,0);

  for(let i=31;i<55;i++){
    out=feed(monitor,i/120,(i-30)*0.5,0,85-(i-30)*0.5);
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"BUILDING_HEALTHY_WINDOW");
});

test("R1-3 broad epsilon region recognizes sustained real verified progress",()=>{
  for(const epsilon of [2,8,16]){
    const monitor=createRecoveryRearmMonitor({
      healthyWindowSeconds:0.35,
      progressEpsilon:epsilon
    });
    let out=null;
    for(let i=0;i<=48;i++){
      out=feed(monitor,i/120,i*0.6,0,120-i*0.6);
    }
    assert.equal(out.rearmed,true,`epsilon ${epsilon}: ${JSON.stringify(out)}`);
  }
});

test("R1-3 exact filmed recovery produces enough healthy verified execution to re-arm",()=>{
  const fixture=filmFixture();

  for(const epsilon of [2,8,16]){
    const state=createSingleRouteRecoveryState({
      position:fixture.position,
      routeIndex:fixture.routeIndex,
      witness:fixture.witness,
      radius:fixture.radius,
      speed:140,
      world:WORLD,
      obstacles:OBSTACLES,
      arrivalTolerance:5,
      lossPersistenceSeconds:0.35
    });
    const monitor=createRecoveryRearmMonitor({
      healthyWindowSeconds:0.35,
      progressEpsilon:epsilon
    });

    let rearmed=false;
    for(let i=0;i<1800 && state.status!=="COMPLETE";i++){
      stepSingleRouteRecoveryState(state,DT);
      if(state.freshQueryCount<1) continue;

      const current=executorMetric(state);
      if(
        current.audit.status===ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR &&
        Number.isFinite(current.metric)
      ){
        const out=observeRecoveryRearm(monitor,{
          time:state.time,
          position:current.position,
          authorityStatus:current.audit.status,
          verifiedRemainingCost:current.metric
        });
        if(out.rearmed){
          rearmed=true;
          break;
        }
      }else{
        observeRecoveryRearm(monitor,{
          time:state.time,
          position:current.position,
          authorityStatus:current.audit.status,
          verifiedRemainingCost:Number.isFinite(current.metric) ? current.metric : 0
        });
      }
    }

    assert.equal(rearmed,true,`epsilon ${epsilon}`);
    assert.equal(state.freshQueryCount,1);
  }
});
