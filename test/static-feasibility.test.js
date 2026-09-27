import test from "node:test";
import assert from "node:assert/strict";
import {
  explainStaticFeasibility,
  queryStaticCircleOccupancy,
  queryStaticCircleTraversal
} from "../src/research/static-feasibility.js";

const world={width:1080,height:650};
const obstacles=[
  {id:"choke.top",x:400,y:70,w:54,h:228},
  {id:"choke.bottom",x:400,y:352,w:54,h:228}
];
const from={x:165,y:325};
const target={x:520,y:325};

test("N0 whole-body traversal sees a blocker even when the endpoint itself is legal",()=>{
  const occupancy=queryStaticCircleOccupancy({center:target,radius:30.6,world,obstacles});
  const traversal=queryStaticCircleTraversal({from,to:target,radius:30.6,world,obstacles});

  assert.equal(occupancy.clear,true);
  assert.equal(traversal.clear,false);
  assert.match(traversal.blocker.id,/choke\.(top|bottom)/);
  assert.ok(traversal.blocker.distance>0);
  assert.ok(traversal.blocker.distance<traversal.distance);
});

test("N0 body envelope materially changes hard feasibility through the same choke",()=>{
  const small=queryStaticCircleTraversal({from,to:target,radius:18*0.65,world,obstacles});
  const large=queryStaticCircleTraversal({from,to:target,radius:18*1.70,world,obstacles});

  assert.equal(small.clear,true);
  assert.equal(large.clear,false);
});

test("N0 hard feasibility remains separate from desired comfort clearance",()=>{
  const result=explainStaticFeasibility({
    from,to:target,radius:18,clearance:10,world,obstacles
  });

  assert.equal(result.hard.clear,true);
  assert.equal(result.comfort.clear,false);
  assert.equal(result.clearanceConstrained,true);
  assert.equal(result.bodyRadius,18);
  assert.equal(result.desiredRadius,28);
});

test("N0 traversal reports the first world boundary instead of silently accepting an outside target",()=>{
  const result=queryStaticCircleTraversal({
    from:{x:100,y:100},
    to:{x:-100,y:100},
    radius:20,
    world,
    obstacles:[]
  });

  assert.equal(result.clear,false);
  assert.equal(result.blocker.id,"boundary.left");
  assert.ok(result.blocker.fraction>0);
  assert.ok(result.blocker.fraction<1);
});

test("N0 query is observational and does not mutate caller-owned geometry",()=>{
  const fromValue={x:165,y:325};
  const targetValue={x:520,y:325};
  const obstacleValue={id:"wall",x:400,y:0,w:40,h:200};
  const before=structuredClone({fromValue,targetValue,obstacleValue});

  queryStaticCircleTraversal({
    from:fromValue,to:targetValue,radius:18,world,obstacles:[obstacleValue]
  });

  assert.deepEqual({fromValue,targetValue,obstacleValue},before);
});

test("N0 rejects invalid radius and clearance rather than fabricating feasibility",()=>{
  assert.throws(()=>queryStaticCircleTraversal({from,to:target,radius:0,world,obstacles}),/positive/);
  assert.throws(()=>explainStaticFeasibility({from,to:target,radius:18,clearance:-1,world,obstacles}),/non-negative/);
});


test("N0 static occupancy does not invent square collision at rounded rectangle corners",()=>{
  const cornerWorld={width:200,height:200};
  const wall={id:"box",x:50,y:50,w:20,h:20};
  const outsideRoundedCorner={x:48.1,y:48.1};

  const result=queryStaticCircleOccupancy({
    center:outsideRoundedCorner,
    radius:2,
    world:cornerWorld,
    obstacles:[wall]
  });

  assert.equal(result.clear,true);
});

test("N0 exact side tangency is legal while motion through the side is blocked",()=>{
  const cornerWorld={width:200,height:200};
  const wall={id:"box",x:50,y:50,w:20,h:20};

  const tangent=queryStaticCircleOccupancy({
    center:{x:48,y:60},
    radius:2,
    world:cornerWorld,
    obstacles:[wall]
  });
  const crossing=queryStaticCircleTraversal({
    from:{x:40,y:60},
    to:{x:80,y:60},
    radius:2,
    world:cornerWorld,
    obstacles:[wall]
  });

  assert.equal(tangent.clear,true);
  assert.equal(crossing.clear,false);
  assert.equal(crossing.blocker.id,"box");
  assert.ok(Math.abs(crossing.blocker.hitCenter.x-48)<1e-8);
});

test("N0 grazing along the exact rounded/side boundary remains clear without penetration",()=>{
  const cornerWorld={width:200,height:200};
  const wall={id:"box",x:50,y:50,w:20,h:20};
  const result=queryStaticCircleTraversal({
    from:{x:40,y:48},
    to:{x:80,y:48},
    radius:2,
    world:cornerWorld,
    obstacles:[wall]
  });

  assert.equal(result.clear,true);
  assert.equal(result.blocker,null);
});
