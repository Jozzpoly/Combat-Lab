import { normalize } from "./math.js";
import { BROKEN_YARD } from "./yard.js";
import { updatePressure } from "./pressure.js";
import { resolveActorPair, resolveActorWorld, stepActorWorld } from "./world.js";
import {
  applyO2Clearance,
  applyO2Thrust,
  createO2Player,
  createO2Threat,
  driveO2Player,
  faceO2Player,
  o2ActionState,
  probeO2Clearance,
  probeO2Thrust,
  requestO2Action,
  stepO2Action
} from "./o2.js";

export const O2_DAMAGE = Object.freeze({
  playerHp:100,
  pressureHit:34
});

export const O2_DEFAULT_START = Object.freeze({
  player:Object.freeze({x:450,y:470,facing:-Math.PI/2}),
  threats:Object.freeze([
    Object.freeze({id:"north",x:450,y:300,facing:Math.PI/2}),
    Object.freeze({id:"north-east",x:565,y:340,facing:Math.PI*0.75}),
    Object.freeze({id:"north-west",x:335,y:340,facing:Math.PI*0.25})
  ])
});

export function createO2State({
  playerStart=O2_DEFAULT_START.player,
  threatStarts=O2_DEFAULT_START.threats
}={}) {
  const player=createO2Player(playerStart);
  player.hp=O2_DAMAGE.playerHp;
  player.maxHp=O2_DAMAGE.playerHp;

  return {
    player,
    threats:threatStarts.map(t=>createO2Threat(t.id,t)),
    time:0,
    result:"active",
    events:[]
  };
}

function makeIncomingCandidate(player,threat,body) {
  if(
    !body ||
    threat.state!=="lunge" ||
    threat.attackResolved ||
    threat.hp<=0
  ) return null;

  threat.attackResolved=true;
  return {
    type:"o2-body-hit-candidate",
    attacker:threat.id,
    damage:O2_DAMAGE.pressureHit,
    x:(player.x+threat.x)*0.5,
    y:(player.y+threat.y)*0.5
  };
}

function applyIncoming(player,candidate) {
  if(!candidate) return null;
  player.hp=Math.max(0,player.hp-candidate.damage);
  return {
    ...candidate,
    type:"o2-body-hit",
    hp:player.hp
  };
}

function nearestCandidates(player,candidates,limit) {
  return [...candidates]
    .sort((a,b)=>{
      const da=(a.threat.x-player.x)**2+(a.threat.y-player.y)**2;
      const db=(b.threat.x-player.x)**2+(b.threat.y-player.y)**2;
      if(Math.abs(da-db)>1e-9) return da-db;
      return a.threat.id.localeCompare(b.threat.id);
    })
    .slice(0,limit);
}

export function stepO2State(state,input,dt=1/120) {
  if(state.result!=="active") return [];

  const player=state.player;

  if(input.aimX!==undefined && input.aimY!==undefined) {
    faceO2Player(player,input.aimX,input.aimY,dt);
  }
  driveO2Player(player,input.moveX||0,input.moveY||0,dt);

  if(input.thrust) requestO2Action(player,"thrust");
  else if(input.clearance) requestO2Action(player,"clearance");

  stepActorWorld(player,BROKEN_YARD,dt);

  const frameEvents=[];
  for(const threat of state.threats){
    if(threat.hp<=0) continue;
    if(threat.state!=="lunge") threat.attackResolved=false;

    frameEvents.push(...updatePressure(
      threat,
      player,
      BROKEN_YARD,
      dt,
      state.threats
    ));
  }

  const incoming=[];
  const livingBefore=state.threats.filter(t=>t.hp>0);
  for(const threat of livingBefore){
    const body=resolveActorPair(player,threat);
    const candidate=makeIncomingCandidate(player,threat,body);
    if(candidate) incoming.push(candidate);
  }

  for(let i=0;i<livingBefore.length;i++){
    for(let j=i+1;j<livingBefore.length;j++){
      resolveActorPair(livingBefore[i],livingBefore[j]);
    }
  }
  for(const actor of [player,...livingBefore]) {
    resolveActorWorld(actor,BROKEN_YARD);
  }

  stepO2Action(player,dt);
  const action=o2ActionState(player);

  if(action.type==="thrust" && action.active){
    const candidates=[];
    for(const threat of livingBefore){
      const candidate=probeO2Thrust(player,threat);
      if(candidate) candidates.push({threat,candidate});
    }

    const remaining=Math.max(
      0,
      1-(player.o2Action?.hitIds.size||0)
    );
    for(const {threat,candidate} of nearestCandidates(player,candidates,remaining)){
      const event=applyO2Thrust(player,threat,candidate);
      if(event) frameEvents.push(event);
    }
  }

  if(action.type==="clearance" && action.active){
    const candidates=[];
    for(const threat of livingBefore){
      const candidate=probeO2Clearance(player,threat);
      if(candidate) candidates.push({threat,candidate});
    }

    const remaining=Math.max(
      0,
      3-(player.o2Action?.hitIds.size||0)
    );
    for(const {threat,candidate} of nearestCandidates(player,candidates,remaining)){
      const event=applyO2Clearance(player,threat,candidate);
      if(event) frameEvents.push(event);
    }
  }

  // Apply already-committed incoming consequences after player action candidates
  // were measured/applied; killing the attacker cannot retroactively erase a
  // body hit that was already committed in this same simulation step.
  for(const candidate of incoming){
    const event=applyIncoming(player,candidate);
    if(event) frameEvents.push(event);
  }

  state.time+=dt;
  if(player.hp<=0) state.result="down";
  else if(state.threats.every(t=>t.hp<=0)) state.result="clear";

  state.events.push(...frameEvents);
  return frameEvents;
}
