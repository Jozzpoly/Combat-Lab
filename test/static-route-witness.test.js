import test from "node:test";
import assert from "node:assert/strict";
import {findStaticRouteWitness} from "../src/research/static-route-witness.js";

const b0World={width:1080,height:650};
const b0Choke=[
  {id:"choke.top",x:400,y:70,w:54,h:228},
  {id:"choke.bottom",x:400,y:352,w:54,h:228}
];
const b0Start={x:165,y:325};
const b0Target={x:520,y:325};

test("N0b returns direct when direct whole-body traversal is already hard-feasible",()=>{
  const result=findStaticRouteWitness({
    from:b0Start,to:b0Target,radius:18,clearance:0,world:b0World,obstacles:b0Choke
  });

  assert.equal(result.status,"direct");
  assert.deepEqual(result.routeNodeIds,["start","target"]);
  assert.equal(result.provesUnreachable,false);
});

test("N0b finds a verified hard-feasible bypass for the large B0 body without claiming a pathfinder",()=>{
  const result=findStaticRouteWitness({
    from:b0Start,to:b0Target,radius:18*1.70,clearance:0,world:b0World,obstacles:b0Choke
  });

  assert.equal(result.status,"witness");
  assert.equal(result.completeness,"witness-only");
  assert.equal(result.provesUnreachable,false);
  assert.ok(result.routeNodeIds.length>2);
  assert.ok(result.routeEdgeIds.length>=2);
  for(const edgeId of result.routeEdgeIds){
    const edge=result.edges.find(candidate=>candidate.id===edgeId);
    assert.ok(edge);
    assert.equal(edge.hard.clear,true);
  }
});

test("N0b comfort clearance annotates the same hard route instead of deleting hard connectivity",()=>{
  const narrowWorld={width:12,height:8};
  const wall=[{id:"hard-only-wall",x:5.5,y:0.7,w:1,h:7.3}];
  const args={
    from:{x:8,y:4},
    to:{x:3,y:4},
    radius:0.3,
    world:narrowWorld,
    obstacles:wall
  };

  const hard=findStaticRouteWitness({...args,clearance:0});
  const comfort=findStaticRouteWitness({...args,clearance:0.08});

  assert.equal(hard.status,"witness");
  assert.equal(comfort.status,"witness");
  assert.deepEqual(comfort.routeNodeIds,hard.routeNodeIds);
  assert.equal(comfort.clearanceConstrained,true);
});

test("N0b none-found is explicitly not an unreachable proof",()=>{
  const result=findStaticRouteWitness({
    from:{x:2,y:4},
    to:{x:10,y:4},
    radius:0.5,
    clearance:0,
    world:{width:12,height:8},
    obstacles:[{id:"sealed-wall",x:5.5,y:0,w:1,h:8}]
  });

  assert.equal(result.status,"none-found");
  assert.equal(result.provesUnreachable,false);
  assert.equal(result.routeNodeIds.length,0);
  assert.match(result.reason,/bounded candidate graph found no verified/);
});

test("N0b invalid target remains a hard geometric fact distinct from none-found",()=>{
  const result=findStaticRouteWitness({
    from:{x:2,y:4},
    to:{x:6,y:4},
    radius:0.5,
    clearance:0,
    world:{width:12,height:8},
    obstacles:[{id:"box",x:5.5,y:3,w:1,h:2}]
  });

  assert.equal(result.status,"invalid-target");
  assert.equal(result.blocker.id,"box");
  assert.equal(result.provesUnreachable,false);
});

test("N0b route witness is deterministic under obstacle input ordering",()=>{
  const obstacles=[
    {id:"a",x:4,y:1,w:1,h:5},
    {id:"b",x:7,y:2,w:1,h:5}
  ];
  const args={from:{x:2,y:4},to:{x:10,y:4},radius:0.3,clearance:0,world:{width:12,height:8}};
  const first=findStaticRouteWitness({...args,obstacles});
  const second=findStaticRouteWitness({...args,obstacles:[...obstacles].reverse()});

  assert.equal(first.status,second.status);
  assert.deepEqual(first.routeNodeIds,second.routeNodeIds);
  assert.deepEqual(first.waypoints,second.waypoints);
});


test("N0b rejects duplicate obstacle identities before they can alias graph nodes",()=>{
  assert.throws(
    ()=>findStaticRouteWitness({
      from:{x:1,y:1},
      to:{x:9,y:1},
      radius:0.3,
      clearance:0,
      world:{width:10,height:6},
      obstacles:[
        {id:"wall",x:4,y:0,w:1,h:2},
        {id:"wall",x:6,y:3,w:1,h:2}
      ]
    }),
    /duplicate static obstacle id: wall/
  );
});
