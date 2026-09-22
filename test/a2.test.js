import test from "node:test";
import assert from "node:assert/strict";

import { HEAVY_CRUSHER_SPEC, LIGHT_STRIKER_SPEC } from "../src/anchors.js";
import { A2_PAIR_START, createA2PairState, runA2Policy } from "../src/pair-rehearsal.js";

test("A2 pair state contains one light and one heavy adversary under shared simulation",()=>{
  const state=createA2PairState();
  assert.deepEqual(
    new Set(state.adversaries.map(x=>x.id)),
    new Set(["light","heavy"])
  );
  assert.equal(state.adversaries.length,2);
  assert.equal(state.result,"active");
});

test("A2 open-field policy matrix asks whether pair creates more than two health bars",()=>{
  const policies=[
    "nearest-mash",
    "retreat-all",
    "orbit-nearest",
    "focus-light",
    "focus-heavy",
    "pair-reader"
  ];
  const result={};

  for(const policy of policies){
    result[policy]=runA2Policy(policy);
  }

  console.log("A2_OPEN_PAIR_MATRIX",JSON.stringify(result));

  for(const value of Object.values(result)){
    assert.equal(value.finite,true);
  }
});

test("A2 mixed-pair identity is compared against same-type pairs before terrain",()=>{
  const mixed=[
    {spec:LIGHT_STRIKER_SPEC,start:A2_PAIR_START.light},
    {spec:HEAVY_CRUSHER_SPEC,start:A2_PAIR_START.heavy}
  ];
  const lightLight=[
    {
      spec:LIGHT_STRIKER_SPEC,
      start:{...A2_PAIR_START.light,id:"light-a"}
    },
    {
      spec:LIGHT_STRIKER_SPEC,
      start:{...A2_PAIR_START.heavy,id:"light-b"}
    }
  ];
  const heavyHeavy=[
    {
      spec:HEAVY_CRUSHER_SPEC,
      start:{...A2_PAIR_START.light,id:"heavy-a"}
    },
    {
      spec:HEAVY_CRUSHER_SPEC,
      start:{...A2_PAIR_START.heavy,id:"heavy-b"}
    }
  ];
  const policies=["nearest-mash","retreat-all","orbit-nearest"];
  const result={mixed:{},lightLight:{},heavyHeavy:{}};

  for(const policy of policies){
    result.mixed[policy]=runA2Policy(policy,{entries:mixed});
    result.lightLight[policy]=runA2Policy(policy,{entries:lightLight});
    result.heavyHeavy[policy]=runA2Policy(policy,{entries:heavyHeavy});
  }

  console.log("A2_PAIR_IDENTITY_ABLATION",JSON.stringify(result));

  for(const family of Object.values(result)){
    for(const value of Object.values(family)){
      assert.equal(value.finite,true);
    }
  }
});

test("A2 peer-collision ablation checks whether pair value actually uses body occupancy",()=>{
  const policies=["nearest-mash","orbit-nearest","pair-reader"];
  const result={};

  for(const policy of policies){
    result[policy]={
      physical:runA2Policy(policy,{resolveAdversaryPairs:true}),
      ghostPeers:runA2Policy(policy,{resolveAdversaryPairs:false})
    };
  }

  console.log("A2_PEER_CONTACT_ABLATION",JSON.stringify(result));

  for(const pair of Object.values(result)){
    assert.equal(pair.physical.finite,true);
    assert.equal(pair.ghostPeers.finite,true);
  }
});

test("A2b material action authority is compared against player-only targeting",()=>{
  const policies=[
    "nearest-mash",
    "orbit-nearest",
    "focus-light",
    "focus-heavy",
    "pair-reader"
  ];
  const result={};

  for(const policy of policies){
    result[policy]={
      playerOnly:runA2Policy(policy,{
        adversaryActionsHitPeers:false
      }),
      allBodies:runA2Policy(policy,{
        adversaryActionsHitPeers:true
      })
    };
  }

  console.log("A2B_MATERIAL_ACTION_ABLATION",JSON.stringify(result));

  for(const pair of Object.values(result)){
    assert.equal(pair.playerOnly.finite,true);
    assert.equal(pair.allBodies.finite,true);
    assert.equal(pair.playerOnly.friendlyHits,0);
  }
});

test("A2b layout sweep checks whether material cross-interaction is robust rather than staged",()=>{
  const layouts={
    splitNorth:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:520,y:300,facing:Math.PI/2}
        },
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:880,y:330,facing:Math.PI/2}
        }
      ]
    },
    sameFront:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:625,y:300,facing:Math.PI/2}
        },
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:785,y:300,facing:Math.PI/2}
        }
      ]
    },
    staggered:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:700,y:300,facing:Math.PI/2}
        },
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:920,y:470,facing:Math.PI}
        }
      ]
    },
    opposed:{
      playerStart:{x:700,y:650,facing:-Math.PI/2},
      entries:[
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:390,y:540,facing:0}
        },
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:1010,y:540,facing:Math.PI}
        }
      ]
    }
  };

  const policies=["nearest-mash","orbit-nearest","pair-reader"];
  const result={};

  for(const [layoutName,layout] of Object.entries(layouts)){
    result[layoutName]={};
    for(const policy of policies){
      result[layoutName][policy]=runA2Policy(policy,{
        entries:layout.entries,
        playerStart:layout.playerStart,
        adversaryActionsHitPeers:true
      });
    }
  }

  console.log("A2B_LAYOUT_SWEEP",JSON.stringify(result));

  for(const layout of Object.values(result)){
    for(const value of Object.values(layout)){
      assert.equal(value.finite,true);
    }
  }
});

test("A2 has no world obstacle available to manufacture pair value",()=>{
  const state=createA2PairState();
  assert.equal(state.world.walls.length,0);
});
