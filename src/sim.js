import {
  createActor,
  driveMove,
  faceToward,
  integrateActor
} from "./actor.js";
import {
  applyDriveContact,
  probeDriveContact,
  startDrive,
  stepDriveAction
} from "./drive.js";
import {
  E0_WORLD,
  resolveBodyPair,
  resolveWorld
} from "./world.js";

export function createE0State({
  role="deny",
  world=E0_WORLD,
  driveEnabled=true,
  homingDrive=false,
  displacementScale=1,
  recoveryScale=1
}={}){
  const deny=role==="deny";

  const player=createActor({
    id:"player",
    x:600,
    y:deny?1885:1610,
    facing:deny?-Math.PI/2:Math.PI/2
  });
  const adversary=createActor({
    id:"adversary",
    x:600,
    y:deny?1610:1885,
    facing:deny?Math.PI/2:-Math.PI/2
  });

  return {
    role,
    world,
    player,
    adversary,
    driveEnabled,
    homingDrive,
    displacementScale,
    recoveryScale,
    time:0,
    result:"active",
    events:[]
  };
}

function crossedAccess(actor,world){
  return actor.y>=world.accessY;
}

function applyInput(actor,input,opponent,dt,state){
  if(Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)){
    faceToward(actor,input.aimX,input.aimY,dt);
  }

  driveMove(actor,input.moveX||0,input.moveY||0,dt);

  if(state.driveEnabled&&input.drive&&actor.action.mode==="idle"){
    startDrive(actor);
  }

  const event=stepDriveAction(actor,dt,{
    homing:state.homingDrive,
    aimX:opponent.x,
    aimY:opponent.y
  });

  if(
    actor.action.mode==="recover" &&
    state.recoveryScale===0
  ){
    actor.action.mode="idle";
    actor.action.time=0;
  }

  integrateActor(actor,dt);
  resolveWorld(actor,state.world);
  return event;
}

function adversaryInput(state){
  const {role,adversary,player,world}=state;

  if(role==="deny"){
    const dx=player.x-adversary.x;
    const dy=world.accessY-adversary.y;
    const distance=Math.hypot(player.x-adversary.x,player.y-adversary.y);
    return {
      moveX:dx*0.004,
      moveY:Math.max(0.35,dy*0.003),
      aimX:player.x,
      aimY:player.y,
      drive:distance<92
    };
  }

  // In BREACH the adversary defends a fixed band before access.
  // It may track the player's lateral angle, but does not voluntarily
  // retreat toward its own access line to preserve a player-relative offset.
  const desiredX=player.x;
  const desiredY=world.accessY-115;
  const distance=Math.hypot(player.x-adversary.x,player.y-adversary.y);
  return {
    moveX:(desiredX-adversary.x)*0.006,
    moveY:(desiredY-adversary.y)*0.006,
    aimX:player.x,
    aimY:player.y,
    drive:distance<92
  };
}

export function stepE0(state,playerInput,dt=1/120){
  if(state.result!=="active") return [];

  const events=[];

  const pAction=applyInput(
    state.player,
    playerInput,
    state.adversary,
    dt,
    state
  );
  if(pAction) events.push(pAction);

  const aAction=applyInput(
    state.adversary,
    adversaryInput(state),
    state.player,
    dt,
    state
  );
  if(aAction) events.push(aAction);

  // Measure both committed contacts before either consequence is applied.
  const pHit=state.driveEnabled
    ? probeDriveContact(state.player,state.adversary)
    : null;
  const aHit=state.driveEnabled
    ? probeDriveContact(state.adversary,state.player)
    : null;

  if(pHit){
    const e=applyDriveContact(
      state.player,
      state.adversary,
      pHit,
      {displacementScale:state.displacementScale}
    );
    if(e) events.push(e);
  }
  if(aHit){
    const e=applyDriveContact(
      state.adversary,
      state.player,
      aHit,
      {displacementScale:state.displacementScale}
    );
    if(e) events.push(e);
  }

  const pair=resolveBodyPair(state.player,state.adversary);
  if(pair){
    events.push({type:"body-contact",...pair});
  }
  resolveWorld(state.player,state.world);
  resolveWorld(state.adversary,state.world);

  state.time+=dt;

  if(state.role==="deny"){
    if(crossedAccess(state.adversary,state.world)){
      state.result="breached";
      events.push({type:"access-crossed",actor:"adversary"});
    }
  }else{
    if(crossedAccess(state.player,state.world)){
      state.result="crossed";
      events.push({type:"access-crossed",actor:"player"});
    }
  }

  state.events.push(...events);
  return events;
}
