import test from "node:test";
import assert from "node:assert/strict";

import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "../src/research/route-execution-authority.js";
import {findStaticRouteWitness} from "../src/research/static-route-witness.js";
import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";

const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

function witnessFor({from,to,radius,obstacles=OBSTACLES,clearance=8}){
  const witness=findStaticRouteWitness({
    from,to,radius,clearance,world:WORLD,obstacles
  });
  assert.ok(["direct","witness"].includes(witness.status),JSON.stringify(witness));
  return witness;
}

function waypointIndexNear(witness,point,epsilon=1e-3){
  const index=witness.waypoints.findIndex(candidate=>
    Math.hypot(candidate.x-point.x,candidate.y-point.y)<=epsilon
  );
  assert.ok(index>=0,`waypoint not found near ${JSON.stringify(point)} in ${JSON.stringify(witness.waypoints)}`);
  return index;
}

test("R1-0 unchanged witness execution retains active-edge authority without replanning",()=>{
  const witness=witnessFor({
    from:{x:120,y:350},
    to:{x:980,y:350},
    radius:20
  });
  assert.equal(witness.status,"direct");

  const before=structuredClone(witness);
  const audit=auditRouteExecutionAuthority({
    position:{x:220,y:350},
    routeIndex:0,
    witness,
    radius:20,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:5
  });

  assert.equal(audit.status,ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR);
  assert.equal(audit.activeTraversal.clear,true);
  assert.equal(audit.selectedReconnectCandidate.nodeId,"target");
  assert.equal(audit.arrivalEligible,false);
  assert.deepEqual(witness,before);
});

test("R1-0 harmless embodied displacement does not hypersensitively invalidate a witness",()=>{
  const witness=witnessFor({
    from:{x:120,y:350},
    to:{x:980,y:350},
    radius:20
  });

  const audit=auditRouteExecutionAuthority({
    position:{x:250,y:365},
    routeIndex:0,
    witness,
    radius:20,
    world:WORLD,
    obstacles:OBSTACLES
  });

  assert.equal(audit.status,ROUTE_EXECUTION_STATUS.ACTIVE_EDGE_CLEAR);
  assert.equal(audit.reachableSuffixCandidates.length,0);
  assert.ok(audit.selectedReconnectCandidate.localRemainingCost>0);
});

test("R1-0 can prove a later witness suffix locally reconnectable without a new route search",()=>{
  const obstacle={id:"box",x:300,y:150,w:100,h:200};
  const witness=findStaticRouteWitness({
    from:{x:100,y:250},
    to:{x:600,y:250},
    radius:20,
    clearance:0,
    world:{width:700,height:500},
    obstacles:[obstacle]
  });
  assert.equal(witness.status,"witness");
  assert.ok(witness.waypoints.length>=3);

  const audit=auditRouteExecutionAuthority({
    position:{x:450,y:250},
    routeIndex:0,
    witness,
    radius:20,
    world:{width:700,height:500},
    obstacles:[obstacle]
  });

  assert.equal(audit.activeTraversal.clear,false);
  assert.equal(audit.status,ROUTE_EXECUTION_STATUS.RECONNECTABLE_SUFFIX);
  assert.ok(audit.reachableSuffixCandidates.some(candidate=>candidate.nodeId==="target"));
  assert.equal(audit.selectedReconnectCandidate.clear,true);
});

test("R1-0 exact filmed residual anchors no longer inherit active-edge route authority",()=>{
  const topology=buildDistributedCounterflowTopology(18,{world:WORLD});
  const fixtures=[
    {
      id:"resident-1",
      index:0,
      radius:20,
      position:{x:490,y:275.996},
      active:{x:980,y:335.55555555555554}
    },
    {
      id:"resident-6",
      index:5,
      radius:32,
      position:{x:478,y:518.599},
      active:{x:622.032,y:467.968}
    },
    {
      id:"resident-12",
      index:11,
      radius:32,
      position:{x:622,y:529.584},
      active:{x:477.968,y:467.968}
    }
  ];

  for(const fixture of fixtures){
    const spec=topology[fixture.index];
    assert.equal(spec.id,fixture.id);
    const witness=witnessFor({
      from:spec.start,
      to:spec.target,
      radius:fixture.radius
    });
    const routeIndex=waypointIndexNear(witness,fixture.active,0.01);
    const audit=auditRouteExecutionAuthority({
      position:fixture.position,
      routeIndex,
      witness,
      radius:fixture.radius,
      world:WORLD,
      obstacles:OBSTACLES,
      arrivalTolerance:5
    });

    assert.equal(audit.activeTraversal.clear,false,`${fixture.id}: ${JSON.stringify(audit)}`);
    assert.ok(
      [
        ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY,
        ROUTE_EXECUTION_STATUS.RECONNECTABLE_SUFFIX
      ].includes(audit.status),
      `${fixture.id}: ${JSON.stringify(audit)}`
    );
    assert.equal(audit.arrivalEligible,false);
  }
});

test("R1-0 route-invalid truth outranks Euclidean target proximity",()=>{
  const invalid=findStaticRouteWitness({
    from:{x:120,y:350},
    to:{x:540,y:200},
    radius:32,
    clearance:0,
    world:WORLD,
    obstacles:OBSTACLES
  });
  assert.equal(invalid.status,"invalid-target");

  const audit=auditRouteExecutionAuthority({
    position:{x:539,y:200},
    routeIndex:0,
    witness:invalid,
    radius:32,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:5
  });

  assert.equal(audit.status,ROUTE_EXECUTION_STATUS.NO_EXECUTABLE_WITNESS);
  assert.ok(audit.targetDistance<5);
  assert.equal(audit.arrivalEligible,false);
});

test("R1-0 authority result is stable under obstacle enumeration order",()=>{
  const start={x:120,y:350};
  const target={x:980,y:350};
  const radius=32;
  const forward=witnessFor({from:start,to:target,radius,obstacles:OBSTACLES});
  const reverse=witnessFor({from:start,to:target,radius,obstacles:[...OBSTACLES].reverse()});
  assert.deepEqual(forward.routeNodeIds,reverse.routeNodeIds);

  const position={x:350,y:330};
  const a=auditRouteExecutionAuthority({
    position,routeIndex:0,witness:forward,radius,world:WORLD,obstacles:OBSTACLES
  });
  const b=auditRouteExecutionAuthority({
    position,routeIndex:0,witness:reverse,radius,world:WORLD,obstacles:[...OBSTACLES].reverse()
  });

  assert.equal(a.status,b.status);
  assert.equal(a.activeTraversal.clear,b.activeTraversal.clear);
  assert.deepEqual(
    a.remainingNodeAudits.map(item=>({id:item.nodeId,clear:item.clear})),
    b.remainingNodeAudits.map(item=>({id:item.nodeId,clear:item.clear}))
  );
});
