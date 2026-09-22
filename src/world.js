import { clamp } from "./math.js";

export const ADVERSARIAL_YARD=Object.freeze({
  width:900,
  height:620,
  inset:28,
  walls:Object.freeze([
    Object.freeze({id:"short-wall",x:365,y:245,w:170,h:30}),
    Object.freeze({id:"pillar",x:610,y:355,w:64,h:64})
  ])
});

export function circleRectPenetration(x,y,radius,rect){
  const nx=clamp(x,rect.x,rect.x+rect.w);
  const ny=clamp(y,rect.y,rect.y+rect.h);
  let dx=x-nx;
  let dy=y-ny;
  const distance=Math.hypot(dx,dy);

  if(distance>=radius) return null;

  if(distance>1e-9){
    return {
      nx:dx/distance,
      ny:dy/distance,
      depth:radius-distance
    };
  }

  const left=Math.abs(x-rect.x);
  const right=Math.abs(rect.x+rect.w-x);
  const top=Math.abs(y-rect.y);
  const bottom=Math.abs(rect.y+rect.h-y);
  const m=Math.min(left,right,top,bottom);

  if(m===left) return {nx:-1,ny:0,depth:radius+left};
  if(m===right) return {nx:1,ny:0,depth:radius+right};
  if(m===top) return {nx:0,ny:-1,depth:radius+top};
  return {nx:0,ny:1,depth:radius+bottom};
}

export function resolveActorWorld(actor,world=ADVERSARIAL_YARD,iterations=4){
  let contacts=0;
  const r=actor.spec.radius;
  const minX=world.inset+r;
  const maxX=world.width-world.inset-r;
  const minY=world.inset+r;
  const maxY=world.height-world.inset-r;

  if(actor.x<minX){actor.x=minX;if(actor.vx<0)actor.vx=0;contacts++;}
  if(actor.x>maxX){actor.x=maxX;if(actor.vx>0)actor.vx=0;contacts++;}
  if(actor.y<minY){actor.y=minY;if(actor.vy<0)actor.vy=0;contacts++;}
  if(actor.y>maxY){actor.y=maxY;if(actor.vy>0)actor.vy=0;contacts++;}

  for(let n=0;n<iterations;n++){
    let changed=false;
    for(const wall of world.walls||[]){
      const hit=circleRectPenetration(actor.x,actor.y,r,wall);
      if(!hit) continue;
      actor.x+=hit.nx*hit.depth;
      actor.y+=hit.ny*hit.depth;
      const inward=actor.vx*hit.nx+actor.vy*hit.ny;
      if(inward<0){
        actor.vx-=hit.nx*inward;
        actor.vy-=hit.ny*inward;
      }
      contacts++;
      changed=true;
    }
    if(!changed) break;
  }
  return contacts;
}

export function resolveActorPair(a,b){
  const dx=b.x-a.x;
  const dy=b.y-a.y;
  const distance=Math.hypot(dx,dy);
  const required=a.spec.radius+b.spec.radius;
  if(distance>=required) return null;

  const nx=distance>1e-9?dx/distance:1;
  const ny=distance>1e-9?dy/distance:0;
  const depth=required-Math.max(distance,1e-9);
  const invA=1/Math.max(1,a.spec.mass);
  const invB=1/Math.max(1,b.spec.mass);
  const total=invA+invB;

  const moveA=depth*invA/total;
  const moveB=depth*invB/total;

  a.x-=nx*moveA;
  a.y-=ny*moveA;
  b.x+=nx*moveB;
  b.y+=ny*moveB;

  const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(relative<0){
    const impulse=-relative/total;
    a.vx-=nx*impulse*invA;
    a.vy-=ny*impulse*invA;
    b.vx+=nx*impulse*invB;
    b.vy+=ny*impulse*invB;
  }

  return {nx,ny,depth,moveA,moveB};
}

function segmentRectFirstT(ax,ay,bx,by,rect){
  const dx=bx-ax;
  const dy=by-ay;
  let t0=0;
  let t1=1;
  const clips=[
    [-dx,ax-rect.x],
    [ dx,rect.x+rect.w-ax],
    [-dy,ay-rect.y],
    [ dy,rect.y+rect.h-ay]
  ];

  for(const [p,q] of clips){
    if(Math.abs(p)<=1e-9){
      if(q<0) return null;
      continue;
    }
    const r=q/p;
    if(p<0){
      if(r>t1) return null;
      if(r>t0) t0=r;
    }else{
      if(r<t0) return null;
      if(r<t1) t1=r;
    }
  }
  return t0>=0&&t0<=1?t0:null;
}

export function segmentBlocked(world,ax,ay,bx,by){
  for(const wall of world.walls||[]){
    const t=segmentRectFirstT(ax,ay,bx,by,wall);
    if(t!==null) return {wall,t};
  }
  return null;
}
