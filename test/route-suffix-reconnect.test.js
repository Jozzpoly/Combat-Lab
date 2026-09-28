import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {findStaticRouteWitness} from "../src/research/static-route-witness.js";
import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";
import {
  createRouteSuffixReconnectState,
  routeSuffixReconnectSnapshot,
  stepRouteSuffixReconnectState
} from "../src/research/route-suffix-reconnect.js";

const DT=1/120;
const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

function run(state,seconds){
  const steps=Math.ceil(seconds/DT);
  for(let i=0;i<steps && state.status==="EXECUTING";i++){
    stepRouteSuffixReconnectState(state,DT);
  }
  return routeSuffixReconnectSnapshot(state);
}

function witnessFor({from,to,radius,obstacles=OBSTACLES,clearance=8,world=WORLD}){
  const witness=findStaticRouteWitness({from,to,radius,clearance,world,obstacles});
  assert.ok(["direct","witness"].includes(witness.status),JSON.stringify(witness));
  return witness;
}

function waypointIndexNear(witness,point,epsilon=1e-3){
  const index=witness.waypoints.findIndex(candidate=>
    Math.hypot(candidate.x-point.x,candidate.y-point.y)<=epsilon
  );
  assert.ok(index>=0,`waypoint missing: ${JSON.stringify({point,waypoints:witness.waypoints})}`);
  return index;
}

test("R1-1 source has no N0b/global route-query authority",()=>{
  const source=fs.readFileSync(new URL("../src/research/route-suffix-reconnect.js",import.meta.url),"utf8");
  assert.doesNotMatch(source,/findStaticRouteWitness/);
  assert.doesNotMatch(source,/static-route-witness/);
});

test("R1-1 active valid edge executes through M1 without reconnect",()=>{
  const witness=witnessFor({
    from:{x:120,y:350},to:{x:980,y:350},radius:20
  });
  const state=createRouteSuffixReconnectState({
    position:{x:120,y:350},
    routeIndex:0,
    witness,
    radius:20,
    speed:140,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:3
  });

  const out=run(state,8);
  assert.equal(out.status,"COMPLETE");
  assert.equal(out.reconnectCount,0);
  assert.equal(out.locomotion.policy,"residual-slide");
  assert.equal(out.locomotion.lastStep.finalOccupancy.clear,true);
});

test("R1-1 reconnects monotonically to a later hard-proven suffix and completes",()=>{
  const world={width:700,height:500};
  const obstacles=[{id:"box",x:300,y:150,w:100,h:200}];
  const witness=witnessFor({
    from:{x:100,y:250},
    to:{x:600,y:250},
    radius:20,
    obstacles,
    clearance:0,
    world
  });
  assert.equal(witness.status,"witness");
  assert.ok(witness.waypoints.length>=3);

  const before=structuredClone(witness);
  const state=createRouteSuffixReconnectState({
    position:{x:450,y:250},
    routeIndex:0,
    witness,
    radius:20,
    speed:120,
    world,
    obstacles,
    arrivalTolerance:3
  });

  stepRouteSuffixReconnectState(state,DT);
  let snap=routeSuffixReconnectSnapshot(state);
  assert.equal(snap.status,"EXECUTING");
  assert.equal(snap.reconnectCount,1);
  assert.ok(snap.reconnectHistory[0].toRouteIndex>snap.reconnectHistory[0].fromRouteIndex);
  assert.equal(snap.lastAuthority.status,"ACTIVE_EDGE_CLEAR");
  assert.deepEqual(state.witness,before);

  snap=run(state,4);
  assert.equal(snap.status,"COMPLETE");
  assert.equal(snap.reconnectCount,1);
});

test("R1-1 exact filmed lost-executability anchors do not silently reconnect",()=>{
  const topology=buildDistributedCounterflowTopology(18,{world:WORLD});
  const fixtures=[
    {id:"resident-1",index:0,radius:20,position:{x:490,y:275.996},active:{x:980,y:335.55555555555554}},
    {id:"resident-6",index:5,radius:32,position:{x:478,y:518.599},active:{x:622.032,y:467.968}},
    {id:"resident-12",index:11,radius:32,position:{x:622,y:529.584},active:{x:477.968,y:467.968}}
  ];

  for(const fixture of fixtures){
    const spec=topology[fixture.index];
    const witness=witnessFor({from:spec.start,to:spec.target,radius:fixture.radius});
    const routeIndex=waypointIndexNear(witness,fixture.active,0.01);
    const before=structuredClone(witness);
    const state=createRouteSuffixReconnectState({
      position:fixture.position,
      routeIndex,
      witness,
      radius:fixture.radius,
      speed:140,
      world:WORLD,
      obstacles:OBSTACLES,
      arrivalTolerance:5
    });
    const start={...state.locomotion.body};

    stepRouteSuffixReconnectState(state,DT);
    const snap=routeSuffixReconnectSnapshot(state);

    assert.equal(snap.status,"LOST_EXECUTABILITY",fixture.id);
    assert.equal(snap.reconnectCount,0,fixture.id);
    assert.equal(snap.lastAuthority.status,"LOST_EXECUTABILITY",fixture.id);
    assert.ok(Math.abs(snap.position.x-start.x)<1e-12,fixture.id);
    assert.ok(Math.abs(snap.position.y-start.y)<1e-12,fixture.id);
    assert.deepEqual(state.witness,before);
  }
});

test("R1-1 reconnect cursor never moves backward or oscillates under stable static geometry",()=>{
  const world={width:700,height:500};
  const obstacles=[{id:"box",x:300,y:150,w:100,h:200}];
  const witness=witnessFor({
    from:{x:100,y:250},to:{x:600,y:250},radius:20,obstacles,clearance:0,world
  });
  const state=createRouteSuffixReconnectState({
    position:{x:450,y:250},routeIndex:0,witness,radius:20,speed:80,world,obstacles
  });

  let previousIndex=state.routeIndex;
  for(let i=0;i<240 && state.status==="EXECUTING";i++){
    stepRouteSuffixReconnectState(state,DT);
    assert.ok(state.routeIndex>=previousIndex);
    previousIndex=state.routeIndex;
  }
  assert.ok(state.reconnectCount<=witness.routeNodeIds.length-2);
});

test("R1-1 preserves hard body truth while reconnecting",()=>{
  const world={width:700,height:500};
  const obstacles=[{id:"box",x:300,y:150,w:100,h:200}];
  const witness=witnessFor({
    from:{x:100,y:250},to:{x:600,y:250},radius:32,obstacles,clearance:0,world
  });
  const state=createRouteSuffixReconnectState({
    position:{x:450,y:250},routeIndex:0,witness,radius:32,speed:180,world,obstacles
  });

  const out=run(state,4);
  assert.equal(out.status,"COMPLETE");
  assert.equal(out.locomotion.lastStep.finalOccupancy.clear,true);
  assert.equal(out.locomotion.body.radius,32);
});
