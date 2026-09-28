import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  createDynamicEncounterEpisodeMonitor,
  observeDynamicEncounterEpisode
} from "../src/research/dynamic-encounter-episode-monitor.js";
import {
  createDynamicEncounterState,
  dynamicEncounterSnapshot,
  stepDynamicEncounterState
} from "../src/research/dynamic-encounter.js";

const DT=1/120;

function observe(monitor,{
  time,
  x=0,
  y=0,
  goal=100,
  partners=[],
  active=false
}){
  return observeDynamicEncounterEpisode(monitor,{
    time,
    position:{x,y},
    goalDistance:goal,
    contactPartnerIds:partners,
    decisionActive:active
  });
}

test("D1-0 monitor owns no sidestep, contact-solver or route authority",()=>{
  const source=fs.readFileSync(
    new URL("../src/research/dynamic-encounter-episode-monitor.js",import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source,/stepContactWorld/);
  assert.doesNotMatch(source,/findStaticRouteWitness/);
  assert.doesNotMatch(source,/SIDESTEP/);
});

test("D1-0 continuous hard contact never re-arms on a timeout",()=>{
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });
  let out=null;
  for(let i=0;i<=240;i++){
    out=observe(monitor,{
      time:i/120,
      x:i*0.2,
      goal:100-i*0.2,
      partners:["B"]
    });
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"EPISODE_ACTIVE");
  assert.deepEqual(out.partnersSeen,["B"]);
});

test("D1-0 prior SIDESTEP action must finish before clear-window evidence can accumulate",()=>{
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });

  for(let i=0;i<=60;i++){
    const out=observe(monitor,{
      time:i/120,
      x:i*0.5,
      goal:100-i*0.5,
      partners:[],
      active:true
    });
    assert.equal(out.rearmed,false);
    assert.equal(out.status,"ACTION_ACTIVE");
  }

  let out=null;
  for(let i=61;i<=90;i++){
    out=observe(monitor,{
      time:i/120,
      x:i*0.5,
      goal:100-i*0.5,
      partners:[],
      active:false
    });
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"CLEAR_BUILDING");
});

test("D1-0 brief contact gap cannot split one unresolved encounter into two",()=>{
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });

  for(let i=0;i<20;i++){
    observe(monitor,{time:i/120,partners:["B"]});
  }
  for(let i=20;i<35;i++){
    observe(monitor,{
      time:i/120,
      x:(i-20)*0.5,
      goal:100-(i-20)*0.5,
      partners:[]
    });
  }
  const back=observe(monitor,{time:35/120,partners:["B"]});
  assert.equal(back.status,"EPISODE_ACTIVE");
  assert.equal(back.rearmed,false);
  assert.equal(back.sampleCount,0);
});

test("D1-0 lateral clear travel without goal progress cannot re-arm",()=>{
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });
  let out=null;
  for(let i=0;i<=48;i++){
    out=observe(monitor,{
      time:i/120,
      x:0,
      y:i*0.6,
      goal:100,
      partners:[]
    });
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"HEALTH_NOT_PROVEN");
  assert.ok(out.bodyTravel>8);
  assert.equal(out.goalImprovement,0);
});

test("D1-0 goal metric change without body travel cannot re-arm",()=>{
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });
  let out=null;
  for(let i=0;i<=48;i++){
    out=observe(monitor,{
      time:i/120,
      x:0,
      y:0,
      goal:100-i*0.6,
      partners:[]
    });
  }
  assert.equal(out.rearmed,false);
  assert.equal(out.status,"HEALTH_NOT_PROVEN");
  assert.equal(out.bodyTravel,0);
  assert.ok(out.goalImprovement>8);
});

test("D1-0 true pass, physical separation and resumed goal progress re-arm broadly",()=>{
  for(const epsilon of [2,8,16]){
    for(const window of [0.2,0.35,0.5]){
      const monitor=createDynamicEncounterEpisodeMonitor({
        triggerPartnerId:"B",
        requiredClearWindowSeconds:window,
        progressEpsilon:epsilon
      });
      let out=null;
      for(let i=0;i<=90;i++){
        out=observe(monitor,{
          time:i/120,
          x:i*1.0,
          goal:120-i*1.0,
          partners:[]
        });
      }
      assert.equal(
        out.rearmed,
        true,
        `epsilon=${epsilon} window=${window} out=${JSON.stringify(out)}`
      );
    }
  }
});

test("D1-0 exact D0 LEFT pass eventually supplies healthy re-arm evidence only after SIDESTEP ends",()=>{
  const state=createDynamicEncounterState({
    passingSideA:1,
    passingSideB:1,
    trialDuration:8
  });
  const monitor=createDynamicEncounterEpisodeMonitor({
    triggerPartnerId:"B",
    requiredClearWindowSeconds:0.35,
    progressEpsilon:8
  });

  let triggerSeen=false;
  let sidestepEnded=false;
  let rearmed=false;

  for(let i=0;i<960 && state.status==="RUNNING";i++){
    stepDynamicEncounterState(state,DT);
    const snap=dynamicEncounterSnapshot(state);
    const actor=snap.actors.A;

    if(actor.encounterAttempted) triggerSeen=true;
    if(!triggerSeen) continue;
    if(actor.mode!=="SIDESTEP") sidestepEnded=true;

    const partners=[];
    for(const contact of state.lastContacts || []){
      if(contact.a==="A") partners.push(contact.b);
      else if(contact.b==="A") partners.push(contact.a);
    }

    const out=observeDynamicEncounterEpisode(monitor,{
      time:state.time,
      position:actor.position,
      goalDistance:actor.goalDistance,
      contactPartnerIds:partners,
      decisionActive:actor.mode==="SIDESTEP"
    });

    if(out.rearmed){
      rearmed=true;
      assert.equal(sidestepEnded,true);
      break;
    }
  }

  assert.equal(triggerSeen,true);
  assert.equal(rearmed,true);
});
