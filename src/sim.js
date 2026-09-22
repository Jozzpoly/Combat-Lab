import { angleDelta, normalize } from "./math.js";
import {
  PLAYER_BODY,
  createActor,
  driveActor,
  faceToward,
  integrateActor
} from "./actor.js";
import {
  ADVERSARIAL_YARD,
  resolveActorPair,
  resolveActorWorld
} from "./world.js";
import {
  BASE_ADVERSARY_SPEC,
  applyAdversaryHit,
  createAdversary,
  probeAdversaryHit,
  updateAdversary
} from "./adversary.js";
import {
  applyPlayerStrike,
  createPlayerCombatState,
  probePlayerStrike,
  requestPlayerStrike,
  stepPlayerStrike
} from "./combat.js";

export function createA0State({
  world=ADVERSARIAL_YARD,
  playerStart={x:450,y:500,facing:-Math.PI/2},
  adversarySpec=BASE_ADVERSARY_SPEC,
  adversaryStart={id:"adversary",x:450,y:150,facing:Math.PI/2}
}={}){
  const player=createPlayerCombatState(
    createActor(
      PLAYER_BODY,
      {id:"player",kind:"player",...playerStart}
    )
  );
  const adversary=createAdversary(adversarySpec,adversaryStart);

  return {
    world,
    player,
    adversaries:[adversary],
    time:0,
    result:"active",
    events:[]
  };
}

function nearestCandidate(player,candidates){
  if(!candidates.length) return null;
  return [...candidates].sort((a,b)=>{
    const da=(a.actor.x-player.x)**2+(a.actor.y-player.y)**2;
    const db=(b.actor.x-player.x)**2+(b.actor.y-player.y)**2;
    if(Math.abs(da-db)>1e-9) return da-db;
    return a.actor.id.localeCompare(b.actor.id);
  })[0];
}

export function stepA0(state,input,dt=1/120){
  if(state.result!=="active") return [];

  const {player,world}=state;
  if(input.aimX!==undefined&&input.aimY!==undefined){
    faceToward(player,input.aimX,input.aimY,dt);
  }

  const move=normalize(input.moveX||0,input.moveY||0,0,0);
  driveActor(player,move.x,move.y,dt);
  if(input.strike) requestPlayerStrike(player);

  integrateActor(player,dt);
  resolveActorWorld(player,world);

  const events=[];
  for(const adversary of state.adversaries){
    if(adversary.hp<=0) continue;
    updateAdversary(adversary,player,world,dt,e=>events.push(e));
  }

  stepPlayerStrike(player,dt);

  const incoming=[];
  const outgoing=[];
  for(const adversary of state.adversaries){
    if(adversary.hp<=0) continue;
    const inCandidate=probeAdversaryHit(adversary,player,world);
    if(inCandidate) incoming.push({actor:adversary,candidate:inCandidate});

    const outCandidate=probePlayerStrike(player,adversary,world);
    if(outCandidate) outgoing.push({actor:adversary,candidate:outCandidate});
  }

  // Body contact is separate from attack authority.
  const living=state.adversaries.filter(x=>x.hp>0);
  for(const adversary of living){
    resolveActorPair(player,adversary);
  }
  for(let i=0;i<living.length;i++){
    for(let j=i+1;j<living.length;j++){
      resolveActorPair(living[i],living[j]);
    }
  }
  resolveActorWorld(player,world);
  for(const adversary of living) resolveActorWorld(adversary,world);

  const chosen=nearestCandidate(player,outgoing);
  if(chosen){
    const event=applyPlayerStrike(player,chosen.actor,chosen.candidate);
    if(event) events.push(event);
  }

  // Already-measured hostile commitments survive a simultaneous lethal strike.
  for(const {actor,candidate} of incoming){
    const event=applyAdversaryHit(actor,player,candidate);
    if(event) events.push(event);
  }

  state.time+=dt;
  if(player.hp<=0) state.result="down";
  else if(state.adversaries.every(x=>x.hp<=0)) state.result="clear";

  state.events.push(...events);
  return events;
}
