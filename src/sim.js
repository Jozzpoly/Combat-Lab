import {
  createActor,
  driveMove,
  faceToward,
  integrateActor,
  SET_SPEC
} from "./actor.js";
import {
  applyDriveContact,
  probeDriveContact,
  startDrive,
  stepDrive
} from "./exchange.js";
import {
  WORLD,
  resolveSupportedBodyPair,
  resolveWorld
} from "./world.js";

export function createState({
  role="deny",
  world=WORLD,
  playerX=800,
  adversaryX=800,
  supportScale=1,
  omnidirectionalSupport=false,
  setMoveScale=SET_SPEC.moveAuthority,
  setTurnScale=SET_SPEC.turnAuthority,
  driveKeepsSupport=false,
  homingDrive=false,
  driveCarryScale=1,
  driveMaterialScale=1,
  recoveryScale=1
}={}){
  const deny=role==="deny";

  return {
    role,
    world,
    player:createActor({
      id:"player",
      x:playerX,
      y:deny?1985:1710,
      facing:deny?-Math.PI/2:Math.PI/2
    }),
    adversary:createActor({
      id:"adversary",
      x:adversaryX,
      y:deny?1710:1985,
      facing:deny?Math.PI/2:-Math.PI/2
    }),
    tuning:{
      supportScale,
      omnidirectionalSupport,
      setMoveScale,
      setTurnScale,
      driveKeepsSupport,
      homingDrive,
      driveCarryScale,
      driveMaterialScale,
      recoveryScale
    },
    time:0,
    result:"active",
    events:[]
  };
}

function applyInput(actor,input,opponent,state,dt){
  actor.setHeld=!!input.set;

  if(Number.isFinite(input.aimX)&&Number.isFinite(input.aimY)){
    faceToward(actor,input.aimX,input.aimY,dt,{
      setTurnScale:state.tuning.setTurnScale,
      driveKeepsSupport:state.tuning.driveKeepsSupport
    });
  }

  driveMove(actor,input.moveX||0,input.moveY||0,dt,{
    setMoveScale:state.tuning.setMoveScale,
    driveKeepsSupport:state.tuning.driveKeepsSupport
  });

  if(input.drive&&actor.action.mode==="idle"){
    startDrive(actor);
  }

  const event=stepDrive(actor,dt,{
    homing:state.tuning.homingDrive,
    aimX:opponent.x,
    aimY:opponent.y,
    carryScale:state.tuning.driveCarryScale
  });

  if(
    actor.action.mode==="recover" &&
    state.tuning.recoveryScale===0
  ){
    actor.action.mode="idle";
    actor.action.time=0;
  }

  integrateActor(actor,dt);
  resolveWorld(actor,state.world);
  return event;
}

function breacherInput(actor,defender,world){
  const distance=Math.hypot(
    defender.x-actor.x,
    defender.y-actor.y
  );
  return {
    moveX:(defender.x-actor.x)*0.008,
    moveY:1,
    aimX:defender.x,
    aimY:defender.y,
    set:false,
    drive:distance<94&&actor.action.mode==="idle"
  };
}

function defenderInput(actor,breacher,world){
  const desiredY=world.accessY-115;
  const distance=Math.hypot(
    breacher.x-actor.x,
    breacher.y-actor.y
  );
  return {
    moveX:(breacher.x-actor.x)*0.007,
    moveY:(desiredY-actor.y)*0.008,
    aimX:breacher.x,
    aimY:breacher.y,
    set:true,
    drive:false
  };
}

function adversaryInput(state){
  if(state.role==="deny"){
    return breacherInput(
      state.adversary,
      state.player,
      state.world
    );
  }

  return defenderInput(
    state.adversary,
    state.player,
    state.world
  );
}

function crossedAccess(actor,world){
  return actor.y>=world.accessY;
}

export function stepState(state,playerInput,dt=1/120){
  if(state.result!=="active") return [];

  const events=[];

  const pAction=applyInput(
    state.player,
    playerInput,
    state.adversary,
    state,
    dt
  );
  if(pAction) events.push(pAction);

  const aAction=applyInput(
    state.adversary,
    adversaryInput(state),
    state.player,
    state,
    dt
  );
  if(aAction) events.push(aAction);

  // Both drive candidates are measured from the shared pre-impact state.
  const pHit=probeDriveContact(state.player,state.adversary);
  const aHit=probeDriveContact(state.adversary,state.player);

  if(pHit){
    const e=applyDriveContact(
      state.player,
      state.adversary,
      pHit,
      state.tuning
    );
    if(e) events.push(e);
  }
  if(aHit){
    const e=applyDriveContact(
      state.adversary,
      state.player,
      aHit,
      state.tuning
    );
    if(e) events.push(e);
  }

  const pair=resolveSupportedBodyPair(
    state.player,
    state.adversary,
    state.tuning
  );
  if(pair) events.push({type:"body-contact",...pair});

  resolveWorld(state.player,state.world);
  resolveWorld(state.adversary,state.world);

  state.time+=dt;

  if(state.role==="deny"){
    if(crossedAccess(state.adversary,state.world)){
      state.result="breached";
      events.push({type:"access-crossed",actor:"adversary"});
    }
  }else if(crossedAccess(state.player,state.world)){
    state.result="crossed";
    events.push({type:"access-crossed",actor:"player"});
  }

  state.events.push(...events);
  return events;
}
