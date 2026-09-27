import {
  queryStaticCircleOccupancy,
  queryStaticCircleTraversal
} from "./static-feasibility.js";

export const STATIC_LOCOMOTION_SCHEMA="combat-lab-static-locomotion-m1-v0";
export const STATIC_LOCOMOTION_POLICIES={
  DISCARD_REMAINDER:"discard-remainder",
  RESIDUAL_SLIDE:"residual-slide"
};

const EPS=1e-9;
const CONTACT_BACKOFF=1e-7;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function positive(value,label){
  const n=finite(value,label);
  if(n<=0) throw new Error(`${label} must be positive`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {
    x:finite(value.x,`${label}.x`),
    y:finite(value.y,`${label}.y`)
  };
}

function vector(value,label){
  return point(value,label);
}

function clone(value){
  return value===null || value===undefined ? value : structuredClone(value);
}

function dot(a,b){
  return a.x*b.x+a.y*b.y;
}

function add(a,b){
  return {x:a.x+b.x,y:a.y+b.y};
}

function scale(v,s){
  return {x:v.x*s,y:v.y*s};
}

function subtractNormalComponent(velocity,normal){
  const into=dot(velocity,normal);
  if(into>=0) return {...velocity};
  return {
    x:velocity.x-into*normal.x,
    y:velocity.y-into*normal.y
  };
}

function normalizedPolicy(value){
  const policy=String(value || STATIC_LOCOMOTION_POLICIES.DISCARD_REMAINDER);
  if(!Object.values(STATIC_LOCOMOTION_POLICIES).includes(policy)){
    throw new Error(`unknown static locomotion policy ${policy}`);
  }
  return policy;
}

function moveToFraction(position,displacement,fraction){
  const f=Math.max(0,Math.min(1,Number(fraction)));
  return add(position,scale(displacement,f));
}

function hitEvidence(traversal){
  if(!traversal || traversal.clear) return null;
  return {
    id:traversal.blocker?.id || "static",
    type:traversal.blocker?.type || "static",
    fraction:Number(traversal.blocker?.fraction || 0),
    distance:Number(traversal.blocker?.distance || 0),
    hitCenter:clone(traversal.blocker?.hitCenter),
    normal:clone(traversal.blocker?.normal || {x:0,y:0}),
    initialOverlap:Boolean(traversal.blocker?.initialOverlap)
  };
}

export function createStaticLocomotionState({
  position={x:200,y:200},
  desiredVelocity={x:0,y:0},
  radius=20,
  world={width:800,height:500},
  obstacles=[],
  policy=STATIC_LOCOMOTION_POLICIES.DISCARD_REMAINDER
}={}){
  const p=point(position,"position");
  const desired=vector(desiredVelocity,"desiredVelocity");
  const r=positive(radius,"radius");
  const normalizedWorld={
    width:positive(world?.width,"world.width"),
    height:positive(world?.height,"world.height")
  };
  const occupancy=queryStaticCircleOccupancy({
    center:p,radius:r,world:normalizedWorld,obstacles
  });
  if(!occupancy.clear){
    throw new Error("initial static locomotion position must be hard-feasible");
  }

  return {
    schema:STATIC_LOCOMOTION_SCHEMA,
    time:0,
    policy:normalizedPolicy(policy),
    world:normalizedWorld,
    obstacles:structuredClone(obstacles),
    body:{
      x:p.x,y:p.y,
      radius:r,
      desiredVelocity:desired,
      velocity:{...desired}
    },
    lastStep:null,
    totalContacts:0,
    totalResidualContacts:0
  };
}

export function setStaticLocomotionDesiredVelocity(state,value){
  const desired=vector(value,"desiredVelocity");
  state.body.desiredVelocity=desired;
  return {...desired};
}

export function stepStaticLocomotionState(state,dt){
  const delta=positive(dt,"dt");
  const body=state.body;
  const start={x:body.x,y:body.y};
  const desired={...body.desiredVelocity};

  // M1 intentionally gives desired motion direct authority before static
  // constraint response. Motor acceleration belongs to another research layer.
  body.velocity={...desired};

  const proposedDisplacement=scale(body.velocity,delta);
  const proposedEnd=add(start,proposedDisplacement);
  const firstTraversal=queryStaticCircleTraversal({
    from:start,
    to:proposedEnd,
    radius:body.radius,
    world:state.world,
    obstacles:state.obstacles
  });

  const evidence={
    dt:delta,
    policy:state.policy,
    start,
    desiredVelocity:desired,
    preContactVelocity:{...body.velocity},
    proposedDisplacement,
    firstHit:hitEvidence(firstTraversal),
    consumedDisplacement:{x:0,y:0},
    remainingFraction:0,
    constrainedVelocity:{...body.velocity},
    residualDisplacement:{x:0,y:0},
    residualHit:null,
    finalDisplacement:{x:0,y:0},
    finalVelocity:null,
    finalPosition:null,
    finalOccupancy:null
  };

  if(firstTraversal.clear){
    body.x=proposedEnd.x;
    body.y=proposedEnd.y;
    evidence.consumedDisplacement={...proposedDisplacement};
  }else{
    state.totalContacts+=1;
    const rawFraction=Math.max(0,Math.min(1,Number(firstTraversal.blocker?.fraction || 0)));
    const fraction=Math.max(0,rawFraction-CONTACT_BACKOFF);
    const contactPosition=moveToFraction(start,proposedDisplacement,fraction);
    body.x=contactPosition.x;
    body.y=contactPosition.y;
    evidence.consumedDisplacement={
      x:body.x-start.x,
      y:body.y-start.y
    };
    evidence.remainingFraction=Math.max(0,1-fraction);

    const normal=firstTraversal.blocker?.normal || {x:0,y:0};
    body.velocity=subtractNormalComponent(body.velocity,normal);
    evidence.constrainedVelocity={...body.velocity};

    if(
      state.policy===STATIC_LOCOMOTION_POLICIES.RESIDUAL_SLIDE &&
      evidence.remainingFraction>EPS &&
      (Math.abs(body.velocity.x)>EPS || Math.abs(body.velocity.y)>EPS)
    ){
      const residualDisplacement=scale(body.velocity,delta*evidence.remainingFraction);
      const residualEnd=add({x:body.x,y:body.y},residualDisplacement);
      evidence.residualDisplacement={...residualDisplacement};

      const residualTraversal=queryStaticCircleTraversal({
        from:{x:body.x,y:body.y},
        to:residualEnd,
        radius:body.radius,
        world:state.world,
        obstacles:state.obstacles
      });

      if(residualTraversal.clear){
        body.x=residualEnd.x;
        body.y=residualEnd.y;
      }else{
        state.totalResidualContacts+=1;
        evidence.residualHit=hitEvidence(residualTraversal);
        const rawResidualFraction=Math.max(
          0,
          Math.min(1,Number(residualTraversal.blocker?.fraction || 0))
        );
        const residualFraction=Math.max(0,rawResidualFraction-CONTACT_BACKOFF);
        const residualConsumed=moveToFraction(
          {x:body.x,y:body.y},
          residualDisplacement,
          residualFraction
        );
        body.x=residualConsumed.x;
        body.y=residualConsumed.y;

        const residualNormal=residualTraversal.blocker?.normal || {x:0,y:0};
        body.velocity=subtractNormalComponent(body.velocity,residualNormal);
      }
    }
  }

  const finalPosition={x:body.x,y:body.y};
  const finalOccupancy=queryStaticCircleOccupancy({
    center:finalPosition,
    radius:body.radius,
    world:state.world,
    obstacles:state.obstacles
  });

  evidence.finalPosition=finalPosition;
  evidence.finalVelocity={...body.velocity};
  evidence.finalDisplacement={
    x:finalPosition.x-start.x,
    y:finalPosition.y-start.y
  };
  evidence.finalOccupancy={
    clear:finalOccupancy.clear,
    blocker:clone(finalOccupancy.blocker)
  };

  state.lastStep=evidence;
  state.time+=delta;
  return state;
}

export function staticLocomotionSnapshot(state){
  return {
    schema:STATIC_LOCOMOTION_SCHEMA,
    time:state.time,
    policy:state.policy,
    body:{
      x:state.body.x,
      y:state.body.y,
      radius:state.body.radius,
      desiredVelocity:{...state.body.desiredVelocity},
      velocity:{...state.body.velocity}
    },
    totalContacts:state.totalContacts,
    totalResidualContacts:state.totalResidualContacts,
    lastStep:clone(state.lastStep)
  };
}
