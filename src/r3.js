import {
  angleDelta,
  clamp,
  closestPointsSegments,
  normalize,
  wrapAngle
} from "./math.js";

export const BODY=Object.freeze({
  maxSpeed:190,
  acceleration:2100,
  braking:2600
});

export const TOOL=Object.freeze({
  inner:9,
  length:78,
  thickness:5.5,
  inertia:900,
  guideK:52,
  guideD:11,
  commitK:128,
  commitD:8.5,
  maxAngularAccel:58,
  commitDuration:0.24,
  restitution:0.10,
  friction:0.16,
  penetrationBias:18
});

export function createActor(id,x,y,facing,toolAngle){
  return {
    id,x,y,
    vx:0,vy:0,
    facing,
    tool:{
      angle:toolAngle,
      angularVelocity:0,
      guideAngle:toolAngle,
      action:null
    }
  };
}

export function createState({
  yOffset=0,
  aAngle=0.78,
  bAngle=Math.PI-0.78
}={}){
  return {
    a:createActor("a",-58,-yOffset/2,0,aAngle),
    b:createActor("b",58,yOffset/2,Math.PI,bAngle),
    contact:{
      engaged:false,
      currentDuration:0,
      maxDuration:0,
      separatedFor:1,
      impacts:0,
      frames:0,
      firstImpactTime:null,
      lastPoint:null,
      normalX:null,
      normalY:null
    },
    time:0
  };
}

export function setGuide(actor,angle){
  actor.tool.guideAngle=wrapAngle(angle);
}

export function requestCommit(actor,angle){
  if(actor.tool.action) return false;
  actor.tool.action={
    angle:wrapAngle(angle),
    elapsed:0
  };
  return true;
}

export function driveActor(actor,x,y,dt){
  const d=normalize(x,y,0,0);
  const speed=Math.hypot(actor.vx,actor.vy);

  if(d.length>0){
    actor.vx+=d.x*BODY.acceleration*dt;
    actor.vy+=d.y*BODY.acceleration*dt;
  }else if(speed>0){
    const drop=Math.min(speed,BODY.braking*dt);
    actor.vx-=actor.vx/speed*drop;
    actor.vy-=actor.vy/speed*drop;
  }

  const next=Math.hypot(actor.vx,actor.vy);
  if(next>BODY.maxSpeed){
    const s=BODY.maxSpeed/next;
    actor.vx*=s;
    actor.vy*=s;
  }

  actor.x+=actor.vx*dt;
  actor.y+=actor.vy*dt;
}

export function toolSegment(actor){
  const px=actor.x+Math.cos(actor.facing)*6;
  const py=actor.y+Math.sin(actor.facing)*6;
  const ux=Math.cos(actor.tool.angle);
  const uy=Math.sin(actor.tool.angle);
  return {
    pivot:{x:px,y:py},
    a:{x:px+ux*TOOL.inner,y:py+uy*TOOL.inner},
    b:{x:px+ux*TOOL.length,y:py+uy*TOOL.length}
  };
}

export function stepTool(actor,dt,{guideAuthority=0.48}={}){
  const tool=actor.tool;

  if(tool.action){
    tool.action.elapsed+=dt;
    if(tool.action.elapsed>=TOOL.commitDuration){
      tool.action=null;
    }
  }

  const target=tool.action?.angle ?? tool.guideAngle;
  const committing=Boolean(tool.action);
  const authority=Math.max(0,guideAuthority);
  const k=(committing?TOOL.commitK:TOOL.guideK)*authority;
  const d=(committing?TOOL.commitD:TOOL.guideD)*Math.max(0.45,authority);
  const maxAccel=TOOL.maxAngularAccel*Math.max(0.25,authority);

  const error=angleDelta(tool.angle,target);
  const accel=clamp(
    error*k-tool.angularVelocity*d,
    -maxAccel,
    maxAccel
  );

  tool.angularVelocity+=accel*dt;
  tool.angle=wrapAngle(tool.angle+tool.angularVelocity*dt);
}

function pointVelocity(actor,seg,point){
  const rx=point.x-seg.pivot.x;
  const ry=point.y-seg.pivot.y;
  return {
    x:actor.vx-ry*actor.tool.angularVelocity,
    y:actor.vy+rx*actor.tool.angularVelocity
  };
}

function applyImpulse(actor,seg,point,ix,iy){
  const rx=point.x-seg.pivot.x;
  const ry=point.y-seg.pivot.y;
  const torque=rx*iy-ry*ix;
  actor.tool.angularVelocity+=torque/TOOL.inertia;
}

function fallbackNormal(state,aSeg,bSeg){
  // Zero centerline distance is geometrically ambiguous for ideal lines.
  // Prefer the already established episode normal. On a fresh exact
  // intersection, derive a symmetric A->B direction from both segment
  // midpoints rather than privileging either tool.
  if(
    state.contact.engaged &&
    Number.isFinite(state.contact.normalX) &&
    Number.isFinite(state.contact.normalY)
  ){
    return {
      x:state.contact.normalX,
      y:state.contact.normalY
    };
  }

  const aMid={
    x:(aSeg.a.x+aSeg.b.x)*0.5,
    y:(aSeg.a.y+aSeg.b.y)*0.5
  };
  const bMid={
    x:(bSeg.a.x+bSeg.b.x)*0.5,
    y:(bSeg.a.y+bSeg.b.y)*0.5
  };
  const d=normalize(
    bMid.x-aMid.x,
    bMid.y-aMid.y,
    state.b.x-state.a.x,
    state.b.y-state.a.y
  );
  return {x:d.x,y:d.y};
}

export function resolveToolContact(state,dt,{enabled=true}={}){
  const c=state.contact;

  if(!enabled){
    c.separatedFor+=dt;
    if(c.engaged&&c.separatedFor>=0.04){
      c.engaged=false;
      c.currentDuration=0;
    }
    return null;
  }

  const aSeg=toolSegment(state.a);
  const bSeg=toolSegment(state.b);
  const closest=closestPointsSegments(aSeg.a,aSeg.b,bSeg.a,bSeg.b);
  const required=TOOL.thickness*2;

  if(closest.distance>=required){
    c.separatedFor+=dt;
    if(c.engaged&&c.separatedFor>=0.04){
      c.engaged=false;
      c.currentDuration=0;
    }
    return null;
  }

  let normal;
  if(closest.distance>1e-6){
    normal={
      x:closest.dx/closest.distance,
      y:closest.dy/closest.distance
    };
  }else{
    normal=fallbackNormal(state,aSeg,bSeg);
  }

  // Keep the manifold normal consistently oriented A -> B.
  const abx=bSeg.pivot.x-aSeg.pivot.x;
  const aby=bSeg.pivot.y-aSeg.pivot.y;
  if(normal.x*abx+normal.y*aby<0){
    normal.x=-normal.x;
    normal.y=-normal.y;
  }

  c.normalX=normal.x;
  c.normalY=normal.y;

  const point={
    x:(closest.pa.x+closest.pb.x)*0.5,
    y:(closest.pa.y+closest.pb.y)*0.5
  };

  const va=pointVelocity(state.a,aSeg,point);
  const vb=pointVelocity(state.b,bSeg,point);
  const rvx=vb.x-va.x;
  const rvy=vb.y-va.y;
  const closing=rvx*normal.x+rvy*normal.y;
  const penetration=required-closest.distance;

  const raX=point.x-aSeg.pivot.x;
  const raY=point.y-aSeg.pivot.y;
  const rbX=point.x-bSeg.pivot.x;
  const rbY=point.y-bSeg.pivot.y;
  const raCross=raX*normal.y-raY*normal.x;
  const rbCross=rbX*normal.y-rbY*normal.x;
  const denom=
    (raCross*raCross+rbCross*rbCross)/TOOL.inertia;

  const targetDelta=
    Math.max(0,-(1+TOOL.restitution)*closing)+
    penetration*TOOL.penetrationBias;
  const j=denom>1e-9?targetDelta/denom:0;

  if(j>0){
    applyImpulse(
      state.a,aSeg,point,
      -normal.x*j,-normal.y*j
    );
    applyImpulse(
      state.b,bSeg,point,
      normal.x*j,normal.y*j
    );
  }

  const tangent={x:-normal.y,y:normal.x};
  const tangentSpeed=rvx*tangent.x+rvy*tangent.y;
  const raCrossT=raX*tangent.y-raY*tangent.x;
  const rbCrossT=rbX*tangent.y-rbY*tangent.x;
  const denomT=
    (raCrossT*raCrossT+rbCrossT*rbCrossT)/TOOL.inertia;
  if(denomT>1e-9&&j>0){
    const raw=-tangentSpeed/denomT;
    const jt=clamp(raw,-TOOL.friction*j,TOOL.friction*j);
    applyImpulse(
      state.a,aSeg,point,
      -tangent.x*jt,-tangent.y*jt
    );
    applyImpulse(
      state.b,bSeg,point,
      tangent.x*jt,tangent.y*jt
    );
  }

  const fresh=!c.engaged&&c.separatedFor>=0.04;
  if(fresh){
    c.impacts++;
    if(c.firstImpactTime===null) c.firstImpactTime=state.time;
  }

  c.engaged=true;
  c.separatedFor=0;
  c.currentDuration+=dt;
  c.maxDuration=Math.max(c.maxDuration,c.currentDuration);
  c.frames++;
  c.lastPoint=point;

  return {
    type:fresh?"tool-impact":"tool-contact",
    point,
    closing,
    penetration,
    impulse:j
  };
}

export function stepState(state,{
  dt=1/120,
  guideAuthority=0.48,
  contactEnabled=true,
  aMoveX=0,aMoveY=0,
  bMoveX=0,bMoveY=0
}={}){
  driveActor(state.a,aMoveX,aMoveY,dt);
  driveActor(state.b,bMoveX,bMoveY,dt);
  stepTool(state.a,dt,{guideAuthority});
  stepTool(state.b,dt,{guideAuthority});
  const event=resolveToolContact(
    state,dt,{enabled:contactEnabled}
  );
  state.time+=dt;
  return event;
}

export function snapshotActor(actor){
  return {
    x:actor.x,y:actor.y,
    vx:actor.vx,vy:actor.vy,
    toolAngle:actor.tool.angle,
    toolOmega:actor.tool.angularVelocity
  };
}

export function actorReadinessDistance(a,b){
  return (
    Math.abs(angleDelta(a.toolAngle,b.toolAngle))+
    Math.abs(a.toolOmega-b.toolOmega)/8
  );
}
