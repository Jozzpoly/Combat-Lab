import test from "node:test";
import assert from "node:assert/strict";

import { HEAVY_CRUSHER_SPEC, LIGHT_STRIKER_SPEC } from "../src/anchors.js";
import { createA0State, stepA0 } from "../src/sim.js";
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

test("A2b first-solid-body authority can intercept a committed heavy sweep before the player",()=>{
  const openWorld={width:900,height:700,inset:20,walls:[]};
  const makeState=(adversaryActionsHitPeers)=>{
    const state=createA0State({
      world:openWorld,
      playerStart:{x:425,y:300,facing:Math.PI},
      adversaryEntries:[
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:300,y:300,facing:0}
        },
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:360,y:300,facing:0}
        }
      ],
      resolveAdversaryPairs:false,
      adversaryActionsHitPeers
    });

    const heavy=state.adversaries.find(x=>x.id==="heavy");
    heavy.mode="commit";
    heavy.modeTime=0.20;
    heavy.commitFacing=0;
    heavy.commitX=1;
    heavy.commitY=0;
    heavy.commitElapsed=HEAVY_CRUSHER_SPEC.attack.commitDuration*0.5;
    heavy.vx=0;
    heavy.vy=0;
    heavy.attackResolved=false;

    return state;
  };

  const playerOnly=makeState(false);
  const material=makeState(true);

  const input={moveX:0,moveY:0,aimX:300,aimY:300,strike:false};
  const playerOnlyEvents=stepA0(playerOnly,input,1/240);
  const materialEvents=stepA0(material,input,1/240);

  assert.ok(playerOnlyEvents.some(e =>
    e.type==="adversary-hit" && e.attacker==="heavy"
  ));
  assert.equal(
    playerOnlyEvents.some(e=>e.type==="adversary-friendly-hit"),
    false
  );

  assert.ok(materialEvents.some(e =>
    e.type==="adversary-friendly-hit" &&
    e.attacker==="heavy" &&
    e.target==="light"
  ));
  assert.equal(
    materialEvents.some(e =>
      e.type==="adversary-hit" && e.attacker==="heavy"
    ),
    false
  );

  assert.equal(playerOnly.player.hp,50);
  assert.equal(material.player.hp,100);
  assert.equal(material.adversaries.find(x=>x.id==="light").hp,50);
});

test("A2b body interception has a bounded spatial tolerance rather than one-pixel collinearity",()=>{
  const openWorld={width:900,height:700,inset:20,walls:[]};
  const offsets=[0,8,16,24,32,40];
  const result={};

  for(const offset of offsets){
    const state=createA0State({
      world:openWorld,
      playerStart:{x:425,y:300,facing:Math.PI},
      adversaryEntries:[
        {
          spec:HEAVY_CRUSHER_SPEC,
          start:{id:"heavy",x:300,y:300,facing:0}
        },
        {
          spec:LIGHT_STRIKER_SPEC,
          start:{id:"light",x:360,y:300+offset,facing:0}
        }
      ],
      resolveAdversaryPairs:false,
      adversaryActionsHitPeers:true
    });

    const heavy=state.adversaries.find(x=>x.id==="heavy");
    heavy.mode="commit";
    heavy.modeTime=0.20;
    heavy.commitFacing=0;
    heavy.commitX=1;
    heavy.commitY=0;
    heavy.commitElapsed=HEAVY_CRUSHER_SPEC.attack.commitDuration*0.5;
    heavy.vx=0;
    heavy.vy=0;
    heavy.attackResolved=false;

    const events=stepA0(
      state,
      {moveX:0,moveY:0,aimX:300,aimY:300,strike:false},
      1/240
    );

    result[offset]={
      playerHp:state.player.hp,
      lightHp:state.adversaries.find(x=>x.id==="light").hp,
      friendly:events.some(e=>e.type==="adversary-friendly-hit"),
      playerHit:events.some(e=>e.type==="adversary-hit")
    };
  }

  console.log("A2B_INTERCEPTION_TOLERANCE",JSON.stringify(result));

  assert.equal(result[0].friendly,true);
  assert.equal(result[16].friendly,true);
  assert.equal(result[24].friendly,true);
  assert.equal(result[32].friendly,false);
  assert.equal(result[40].friendly,false);
  assert.equal(result[32].playerHit,true);
  assert.equal(result[40].playerHit,true);
});

test("A2b interception value is separated from friendly-fire damage",()=>{
  const sameFront=[
    {
      spec:LIGHT_STRIKER_SPEC,
      start:{id:"light",x:625,y:300,facing:Math.PI/2}
    },
    {
      spec:HEAVY_CRUSHER_SPEC,
      start:{id:"heavy",x:785,y:300,facing:Math.PI/2}
    }
  ];
  const offsets=[-36,-24,0,24];
  const result={};

  for(const policy of ["screen-heavy","screen-light"]){
    result[policy]={};
    for(const offset of offsets){
      result[policy][offset]={
        playerOnly:runA2Policy(policy,{
          seconds:8,
          entries:sameFront,
          adversaryActionsHitPeers:false,
          screenTangentOffset:offset
        }),
        interceptOnly:runA2Policy(policy,{
          seconds:8,
          entries:sameFront,
          adversaryActionsHitPeers:true,
          adversaryFriendlyDamageScale:0,
          screenTangentOffset:offset
        }),
        damaging:runA2Policy(policy,{
          seconds:8,
          entries:sameFront,
          adversaryActionsHitPeers:true,
          adversaryFriendlyDamageScale:1,
          screenTangentOffset:offset
        })
      };
    }
  }

  console.log("A2B_INTERCEPT_VS_DAMAGE",JSON.stringify(result));

  for(const policy of Object.values(result)){
    for(const trio of Object.values(policy)){
      assert.equal(trio.playerOnly.finite,true);
      assert.equal(trio.interceptOnly.finite,true);
      assert.equal(trio.damaging.finite,true);
      assert.equal(trio.interceptOnly.friendlyDamage,0);
    }
  }
});

test("A2b sampled quantized screen perception tests solver dependence",()=>{
  const layouts={
    splitNorth:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {spec:LIGHT_STRIKER_SPEC,start:{id:"light",x:520,y:300,facing:Math.PI/2}},
        {spec:HEAVY_CRUSHER_SPEC,start:{id:"heavy",x:880,y:330,facing:Math.PI/2}}
      ]
    },
    sameFront:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {spec:LIGHT_STRIKER_SPEC,start:{id:"light",x:625,y:300,facing:Math.PI/2}},
        {spec:HEAVY_CRUSHER_SPEC,start:{id:"heavy",x:785,y:300,facing:Math.PI/2}}
      ]
    },
    staggered:{
      playerStart:{x:700,y:760,facing:-Math.PI/2},
      entries:[
        {spec:LIGHT_STRIKER_SPEC,start:{id:"light",x:700,y:300,facing:Math.PI/2}},
        {spec:HEAVY_CRUSHER_SPEC,start:{id:"heavy",x:920,y:470,facing:Math.PI}}
      ]
    },
    opposed:{
      playerStart:{x:700,y:650,facing:-Math.PI/2},
      entries:[
        {spec:LIGHT_STRIKER_SPEC,start:{id:"light",x:390,y:540,facing:0}},
        {spec:HEAVY_CRUSHER_SPEC,start:{id:"heavy",x:1010,y:540,facing:Math.PI}}
      ]
    }
  };
  const offsets=[-36,-24,0,24,36];
  const result={};

  for(const [layoutName,layout] of Object.entries(layouts)){
    result[layoutName]={};
    for(const basePolicy of ["screen-heavy","screen-light"]){
      const sampledPolicy=basePolicy+"-sampled";
      result[layoutName][basePolicy]={};
      for(const offset of offsets){
        result[layoutName][basePolicy][offset]={
          playerOnly:runA2Policy(basePolicy,{
            seconds:8,
            entries:layout.entries,
            playerStart:layout.playerStart,
            adversaryActionsHitPeers:false,
            screenTangentOffset:offset
          }),
          continuous:runA2Policy(basePolicy,{
            seconds:8,
            entries:layout.entries,
            playerStart:layout.playerStart,
            adversaryActionsHitPeers:true,
            adversaryFriendlyDamageScale:0,
            screenTangentOffset:offset
          }),
          sampled:runA2Policy(sampledPolicy,{
            seconds:8,
            entries:layout.entries,
            playerStart:layout.playerStart,
            adversaryActionsHitPeers:true,
            adversaryFriendlyDamageScale:0,
            screenTangentOffset:offset,
            screenSampleInterval:0.20,
            screenQuantize:24
          })
        };
      }
    }
  }

  console.log("A2B_SAMPLED_SCREEN",JSON.stringify(result));

  for(const layout of Object.values(result)){
    for(const policy of Object.values(layout)){
      for(const trio of Object.values(policy)){
        assert.equal(trio.playerOnly.finite,true);
        assert.equal(trio.continuous.finite,true);
        assert.equal(trio.sampled.finite,true);
        assert.equal(trio.sampled.friendlyDamage,0);
      }
    }
  }
});

test("A2b interception-only body screen generalizes across ordinary pair layouts",()=>{
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
  const offsets=[-36,-24,0,24,36];
  const result={};

  for(const [layoutName,layout] of Object.entries(layouts)){
    result[layoutName]={};
    for(const policy of ["screen-heavy","screen-light"]){
      result[layoutName][policy]={};
      for(const offset of offsets){
        result[layoutName][policy][offset]={
          playerOnly:runA2Policy(policy,{
            seconds:8,
            entries:layout.entries,
            playerStart:layout.playerStart,
            adversaryActionsHitPeers:false,
            screenTangentOffset:offset
          }),
          interceptOnly:runA2Policy(policy,{
            seconds:8,
            entries:layout.entries,
            playerStart:layout.playerStart,
            adversaryActionsHitPeers:true,
            adversaryFriendlyDamageScale:0,
            screenTangentOffset:offset
          })
        };
      }
    }
  }

  console.log("A2B_SCREEN_GENERALIZATION",JSON.stringify(result));

  for(const layout of Object.values(result)){
    for(const policy of Object.values(layout)){
      for(const pair of Object.values(policy)){
        assert.equal(pair.playerOnly.finite,true);
        assert.equal(pair.interceptOnly.finite,true);
        assert.equal(pair.interceptOnly.friendlyDamage,0);
      }
    }
  }
});

test("A2b coarse body-screen sweep checks robustness to imperfect lateral placement",()=>{
  const sameFront=[
    {
      spec:LIGHT_STRIKER_SPEC,
      start:{id:"light",x:625,y:300,facing:Math.PI/2}
    },
    {
      spec:HEAVY_CRUSHER_SPEC,
      start:{id:"heavy",x:785,y:300,facing:Math.PI/2}
    }
  ];
  const offsets=[-36,-24,-12,0,12,24,36];
  const result={};

  for(const policy of ["screen-heavy","screen-light"]){
    result[policy]={};
    for(const offset of offsets){
      result[policy][offset]={
        playerOnly:runA2Policy(policy,{
          seconds:8,
          entries:sameFront,
          adversaryActionsHitPeers:false,
          screenTangentOffset:offset
        }),
        allBodies:runA2Policy(policy,{
          seconds:8,
          entries:sameFront,
          adversaryActionsHitPeers:true,
          screenTangentOffset:offset
        })
      };
    }
  }

  console.log("A2B_COARSE_SCREEN_SWEEP",JSON.stringify(result));

  for(const policy of Object.values(result)){
    for(const pair of Object.values(policy)){
      assert.equal(pair.playerOnly.finite,true);
      assert.equal(pair.allBodies.finite,true);
      assert.equal(pair.playerOnly.playerHits,0);
      assert.equal(pair.allBodies.playerHits,0);
    }
  }
});

test("A2b body-screen possibility probe uses positions only and no player attacks",()=>{
  const sameFront=[
    {
      spec:LIGHT_STRIKER_SPEC,
      start:{id:"light",x:625,y:300,facing:Math.PI/2}
    },
    {
      spec:HEAVY_CRUSHER_SPEC,
      start:{id:"heavy",x:785,y:300,facing:Math.PI/2}
    }
  ];
  const result={};

  for(const policy of ["screen-heavy","screen-light"]){
    result[policy]={
      playerOnly:runA2Policy(policy,{
        seconds:8,
        entries:sameFront,
        adversaryActionsHitPeers:false
      }),
      allBodies:runA2Policy(policy,{
        seconds:8,
        entries:sameFront,
        adversaryActionsHitPeers:true
      })
    };
  }

  console.log("A2B_BODY_SCREEN_PROBE",JSON.stringify(result));

  for(const pair of Object.values(result)){
    assert.equal(pair.playerOnly.finite,true);
    assert.equal(pair.allBodies.finite,true);
    assert.equal(pair.playerOnly.playerHits,0);
    assert.equal(pair.allBodies.playerHits,0);
  }
});

test("A2 has no world obstacle available to manufacture pair value",()=>{
  const state=createA2PairState();
  assert.equal(state.world.walls.length,0);
});
