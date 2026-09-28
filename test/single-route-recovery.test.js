import test from "node:test";
import assert from "node:assert/strict";

import {findStaticRouteWitness} from "../src/research/static-route-witness.js";
import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";
import {auditRouteExecutionAuthority,ROUTE_EXECUTION_STATUS} from "../src/research/route-execution-authority.js";
import {
  createSingleRouteRecoveryState,
  injectSingleRouteRecoveryDisplacement,
  singleRouteRecoverySnapshot,
  stepSingleRouteRecoveryState
} from "../src/research/single-route-recovery.js";

const DT=1/120;
const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];

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

function stepFor(state,seconds,options={}){
  const steps=Math.ceil(seconds/DT);
  for(let i=0;i<steps && !["COMPLETE","NO_WITNESS","RECOVERY_EXHAUSTED"].includes(state.status);i++){
    stepSingleRouteRecoveryState(state,DT,options);
  }
  return singleRouteRecoverySnapshot(state);
}

function filmFixture(index,radius,position,active){
  const spec=buildDistributedCounterflowTopology(18,{world:WORLD})[index];
  const witness=witnessFor({from:spec.start,to:spec.target,radius});
  return {
    spec,witness,radius,position,
    routeIndex:waypointIndexNear(witness,active,0.01)
  };
}

test("R1-2 locally reconnectable suffix completes with zero global queries",()=>{
  const world={width:700,height:500};
  const obstacles=[{id:"box",x:300,y:150,w:100,h:200}];
  const witness=witnessFor({
    from:{x:100,y:250},to:{x:600,y:250},radius:20,obstacles,clearance:0,world
  });
  const state=createSingleRouteRecoveryState({
    position:{x:450,y:250},
    routeIndex:0,
    witness,
    radius:20,
    speed:120,
    world,
    obstacles,
    lossPersistenceSeconds:0.35
  });
  let calls=0;
  const spy=options=>{
    calls+=1;
    return findStaticRouteWitness(options);
  };

  const out=stepFor(state,4,{routeWitness:spy});
  assert.equal(out.status,"COMPLETE");
  assert.equal(out.freshQueryCount,0);
  assert.equal(calls,0);
  assert.equal(out.executor.reconnectCount,1);
});

test("R1-2 full LOST must persist before the single global query is permitted",()=>{
  const fixture=filmFixture(
    0,20,
    {x:490,y:275.996},
    {x:980,y:335.55555555555554}
  );
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
  let calls=0;
  const spy=options=>{
    calls+=1;
    return findStaticRouteWitness(options);
  };

  let out=stepFor(state,0.25,{routeWitness:spy});
  assert.equal(out.status,"LOST_WAITING");
  assert.equal(out.freshQueryCount,0);
  assert.equal(calls,0);

  out=stepFor(state,0.15,{routeWitness:spy});
  assert.equal(out.freshQueryCount,1);
  assert.equal(calls,1);
  assert.equal(out.status,"RECOVERING");
});

test("R1-2 exact three filmed LOST anchors recover with exactly one fresh N0b witness",()=>{
  const fixtures=[
    filmFixture(0,20,{x:490,y:275.996},{x:980,y:335.55555555555554}),
    filmFixture(5,32,{x:478,y:518.599},{x:622.032,y:467.968}),
    filmFixture(11,32,{x:622,y:529.584},{x:477.968,y:467.968})
  ];

  for(const [index,fixture] of fixtures.entries()){
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
    let calls=0;
    const spy=options=>{
      calls+=1;
      return findStaticRouteWitness(options);
    };

    const out=stepFor(state,15,{routeWitness:spy});
    assert.equal(out.status,"COMPLETE",`fixture ${index}: ${JSON.stringify(out)}`);
    assert.equal(out.freshQueryCount,1,`fixture ${index}`);
    assert.equal(calls,1,`fixture ${index}`);
    assert.equal(out.queryHistory.length,1,`fixture ${index}`);
    assert.ok(["direct","witness"].includes(out.queryHistory[0].status));
  }
});

test("R1-2 no-witness recovery result is explicit and queried only once",()=>{
  const fixture=filmFixture(
    0,20,
    {x:490,y:275.996},
    {x:980,y:335.55555555555554}
  );
  const state=createSingleRouteRecoveryState({
    position:fixture.position,
    routeIndex:fixture.routeIndex,
    witness:fixture.witness,
    radius:fixture.radius,
    world:WORLD,
    obstacles:OBSTACLES,
    lossPersistenceSeconds:0.1
  });
  let calls=0;
  const noWitness=options=>{
    calls+=1;
    return {
      status:"none-found",
      reason:"synthetic no-witness recovery falsifier",
      from:{...options.from},
      target:{...options.to},
      clearance:options.clearance
    };
  };

  const out=stepFor(state,1,{routeWitness:noWitness});
  assert.equal(out.status,"NO_WITNESS");
  assert.equal(out.freshQueryCount,1);
  assert.equal(calls,1);
  assert.equal(out.queryHistory[0].status,"none-found");
});

test("R1-2 a second loss in the same episode cannot trigger a second global query",()=>{
  const fixture=filmFixture(
    0,20,
    {x:490,y:275.996},
    {x:980,y:335.55555555555554}
  );
  const state=createSingleRouteRecoveryState({
    position:fixture.position,
    routeIndex:fixture.routeIndex,
    witness:fixture.witness,
    radius:fixture.radius,
    speed:140,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:5,
    lossPersistenceSeconds:0.1
  });
  let calls=0;
  const spy=options=>{
    calls+=1;
    return findStaticRouteWitness(options);
  };

  let out=stepFor(state,0.2,{routeWitness:spy});
  assert.equal(out.freshQueryCount,1);
  assert.equal(calls,1);
  assert.equal(out.status,"RECOVERING");

  // Find a hard-feasible body position that is LOST relative to the replacement witness.
  let lostPosition=null;
  const executor=state.executor;
  for(let y=90;y<=610 && !lostPosition;y+=20){
    for(let x=430;x<=670;x+=20){
      try{
        const audit=auditRouteExecutionAuthority({
          position:{x,y},
          routeIndex:executor.routeIndex,
          witness:executor.witness,
          radius:fixture.radius,
          world:WORLD,
          obstacles:OBSTACLES,
          arrivalTolerance:5
        });
        if(audit.status===ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY){
          // create/injection will independently reject hard-invalid positions.
          const probe=structuredClone({x,y});
          try{
            injectSingleRouteRecoveryDisplacement(state,probe,{reason:"second-loss-falsifier"});
            lostPosition=probe;
            break;
          }catch{}
        }
      }catch{}
    }
  }
  assert.ok(lostPosition,"could not construct a second hard-feasible LOST state");

  out=stepFor(state,0.2,{routeWitness:spy});
  assert.equal(out.status,"RECOVERY_EXHAUSTED");
  assert.equal(out.freshQueryCount,1);
  assert.equal(calls,1);
});

test("R1-2 does not alias invalid/near target into arrival",()=>{
  const fixture=filmFixture(
    0,20,
    {x:490,y:275.996},
    {x:980,y:335.55555555555554}
  );
  const state=createSingleRouteRecoveryState({
    position:fixture.position,
    routeIndex:fixture.routeIndex,
    witness:fixture.witness,
    radius:fixture.radius,
    world:WORLD,
    obstacles:OBSTACLES,
    lossPersistenceSeconds:0.1
  });

  const invalid=options=>({
    status:"invalid-target",
    reason:"synthetic invalid target",
    from:{...options.from},
    target:{...options.to},
    clearance:options.clearance
  });

  const out=stepFor(state,1,{routeWitness:invalid});
  assert.equal(out.status,"NO_WITNESS");
  assert.equal(out.freshQueryCount,1);
  assert.notEqual(out.status,"COMPLETE");
});
