import { angleDelta } from "./math.js";
import { segmentBlocked } from "./world.js";

export const PLAYER_STRIKE=Object.freeze({
  windup:0.09,
  active:0.10,
  recover:0.20,
  reach:48,
  halfAngle:0.62,
  damage:60,
  maxTargetsPerAction:1
});

export function createPlayerCombatState(player){
  player.action=null;
  player.actionSerial=0;
  return player;
}

export function requestPlayerStrike(player){
  if(player.action) return false;
  player.actionSerial++;
  player.action={
    serial:player.actionSerial,
    elapsed:0,
    hitIds:new Set()
  };
  return true;
}

export function stepPlayerStrike(player,dt){
  const action=player.action;
  if(!action) return {phase:"idle",active:false};

  action.elapsed+=dt;
  if(action.elapsed<PLAYER_STRIKE.windup){
    return {phase:"windup",active:false};
  }
  if(action.elapsed<PLAYER_STRIKE.windup+PLAYER_STRIKE.active){
    return {phase:"active",active:true};
  }
  if(action.elapsed<PLAYER_STRIKE.windup+PLAYER_STRIKE.active+PLAYER_STRIKE.recover){
    return {phase:"recover",active:false};
  }

  player.action=null;
  return {phase:"idle",active:false,done:true};
}

export function playerStrikeState(player){
  if(!player.action) return {phase:"idle",active:false};
  const t=player.action.elapsed;
  if(t<PLAYER_STRIKE.windup) return {phase:"windup",active:false};
  if(t<PLAYER_STRIKE.windup+PLAYER_STRIKE.active) return {phase:"active",active:true};
  return {phase:"recover",active:false};
}

export function probePlayerStrike(player,target,world){
  if(!player.action || !playerStrikeState(player).active) return null;
  if(target.hp<=0 || player.action.hitIds.has(target.id)) return null;
  if(player.action.hitIds.size>=PLAYER_STRIKE.maxTargetsPerAction) return null;

  const dx=target.x-player.x;
  const dy=target.y-player.y;
  const distance=Math.hypot(dx,dy);
  const maxDistance=
    player.spec.radius+
    PLAYER_STRIKE.reach+
    target.spec.radius;
  if(distance>maxDistance) return null;

  const angle=Math.atan2(dy,dx);
  if(Math.abs(angleDelta(player.facing,angle))>PLAYER_STRIKE.halfAngle) return null;

  if(segmentBlocked(world,player.x,player.y,target.x,target.y)) return null;

  return {
    type:"player-hit-candidate",
    target:target.id,
    x:target.x,
    y:target.y,
    distance,
    damage:PLAYER_STRIKE.damage
  };
}

export function applyPlayerStrike(player,target,candidate){
  if(!candidate) return null;
  player.action.hitIds.add(target.id);
  target.hp=Math.max(0,target.hp-candidate.damage);
  return {
    ...candidate,
    type:"player-hit",
    hp:target.hp,
    killed:target.hp<=0
  };
}
