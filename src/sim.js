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
  adversaryStart={id:"adversary",x:450,y:150,facing:Math.PI/2},
  adversaryEntries=null,
  resolveAdversaryPairs=true,
  adversaryActionsHitPeers=true,
  adversaryFriendlyDamageScale=1
}={}){
  const player=createPlayerCombatState(
    createActor(
      PLAYER_BODY,
      {id:"player",kind:"player",...playerStart}
    )
  );
  const adversaries=adversaryEntries
    ? adversaryEntries.map(entry =>
        createAdversary(
          entry.spec ?? BASE_ADVERSARY_SPEC,
          entry.start
        )
      )
    : [createAdversary(adversarySpec,adversaryStart)];

  return {
    world,
    player,
    adversaries,
    resolveAdversaryPairs,
    adversaryActionsHitPeers,
    adversaryFriendlyDamageScale,
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
  const living=state.adversaries.filter(x=>x.hp>0);

  for(const adversary of living){
    const solidCandidates=[];

    const playerCandidate=probeAdversaryHit(adversary,player,world);
    if(playerCandidate){
      solidCandidates.push({
        actor:adversary,
        target:player,
        candidate:playerCandidate
      });
    }

    if(state.adversaryActionsHitPeers){
      for(const target of living){
        if(target===adversary) continue;
        const candidate=probeAdversaryHit(adversary,target,world);
        if(candidate){
          solidCandidates.push({
            actor:adversary,
            target,
            candidate
          });
        }
      }
    }

    solidCandidates.sort((a,b)=>{
      const dt=a.candidate.contactT-b.candidate.contactT;
      if(Math.abs(dt)>1e-9) return dt;
      return a.target.id.localeCompare(b.target.id);
    });
    if(solidCandidates.length){
      incoming.push(solidCandidates[0]);
    }

    const outCandidate=probePlayerStrike(player,adversary,world);
    if(outCandidate) outgoing.push({actor:adversary,candidate:outCandidate});
  }

  // Body contact is separate from attack authority.
  for(const adversary of living){
    resolveActorPair(player,adversary);
  }
  if(state.resolveAdversaryPairs){
    for(let i=0;i<living.length;i++){
      for(let j=i+1;j<living.length;j++){
        const contact=resolveActorPair(living[i],living[j]);
        if(contact){
          events.push({
            type:"adversary-body-contact",
            a:living[i].id,
            b:living[j].id,
            depth:contact.depth
          });
        }
      }
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
  for(const {actor,target,candidate} of incoming){
    const appliedCandidate=
      target.kind==="adversary"
        ? {
            ...candidate,
            damage:candidate.damage*state.adversaryFriendlyDamageScale
          }
        : candidate;
    const event=applyAdversaryHit(actor,target,appliedCandidate);
    if(event) events.push(event);
  }

  state.time+=dt;
  if(player.hp<=0) state.result="down";
  else if(state.adversaries.every(x=>x.hp<=0)) state.result="clear";

  state.events.push(...events);
  return events;
}
