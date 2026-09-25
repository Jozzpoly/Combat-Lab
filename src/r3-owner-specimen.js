import {
  createState,
  requestCommit,
  setGuide,
  stepState,
  toolSegment
} from "./r3.js";

export const OWNER_DT=1/120;

export function createOwnerSpecimenState(){
  return createState({
    aAngle:0.78,
    bAngle:Math.PI-0.78
  });
}

export function movementFromKeys(keys){
  const x=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);
  const y=(keys.has("KeyS")?1:0)-(keys.has("KeyW")?1:0);
  return {x,y};
}

// Player-independent and state-independent by construction.
// It is presentation pressure, not adversarial policy.
export function partnerGuideAt(time){
  return Math.PI-0.58+Math.sin(time*0.72)*0.46;
}

export function stepOwnerSpecimen(state,{
  moveX=0,
  moveY=0,
  guideAngle=state.a.tool.guideAngle,
  commit=false,
  dt=OWNER_DT
}={}){
  setGuide(state.a,guideAngle);
  if(commit) requestCommit(state.a,guideAngle);

  setGuide(state.b,partnerGuideAt(state.time));

  return stepState(state,{
    dt,
    guideAuthority:0.48,
    contactEnabled:true,
    aMoveX:moveX,
    aMoveY:moveY,
    bMoveX:0,
    bMoveY:0
  });
}

export function ownerView(state){
  return {
    a:toolSegment(state.a),
    b:toolSegment(state.b),
    contact:{
      engaged:state.contact.engaged,
      currentDuration:state.contact.currentDuration,
      maxDuration:state.contact.maxDuration,
      point:state.contact.lastPoint
    }
  };
}
