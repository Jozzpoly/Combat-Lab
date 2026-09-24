import { clamp } from "./math.js";

export const LINE_TEST_WORLD=Object.freeze({
  width:1000,
  height:700,
  inset:20,
  walls:Object.freeze([])
});

export function resolveLineActorWorld(actor,world=LINE_TEST_WORLD){
  const r=actor.spec.radius;
  const minX=world.inset+r;
  const maxX=world.width-world.inset-r;
  const minY=world.inset+r;
  const maxY=world.height-world.inset-r;

  if(actor.x<minX){actor.x=minX;if(actor.vx<0)actor.vx=0;}
  if(actor.x>maxX){actor.x=maxX;if(actor.vx>0)actor.vx=0;}
  if(actor.y<minY){actor.y=minY;if(actor.vy<0)actor.vy=0;}
  if(actor.y>maxY){actor.y=maxY;if(actor.vy>0)actor.vy=0;}
}

export function segmentCircleFirstT(ax,ay,bx,by,cx,cy,radius){
  const dx=bx-ax;
  const dy=by-ay;
  const fx=ax-cx;
  const fy=ay-cy;

  const a=dx*dx+dy*dy;
  if(a<=1e-12){
    return Math.hypot(fx,fy)<=radius?0:null;
  }

  const c=fx*fx+fy*fy-radius*radius;
  if(c<=0) return 0;

  const b=2*(fx*dx+fy*dy);
  const disc=b*b-4*a*c;
  if(disc<0) return null;

  const root=Math.sqrt(disc);
  const t1=(-b-root)/(2*a);
  const t2=(-b+root)/(2*a);
  if(t1>=0&&t1<=1) return t1;
  if(t2>=0&&t2<=1) return t2;
  return null;
}

export function segmentRectFirstT(ax,ay,bx,by,rect,padding=0){
  const expanded={
    x:rect.x-padding,
    y:rect.y-padding,
    w:rect.w+padding*2,
    h:rect.h+padding*2
  };
  const dx=bx-ax;
  const dy=by-ay;
  let t0=0;
  let t1=1;

  const clips=[
    [-dx,ax-expanded.x],
    [ dx,expanded.x+expanded.w-ax],
    [-dy,ay-expanded.y],
    [ dy,expanded.y+expanded.h-ay]
  ];

  for(const [p,q] of clips){
    if(Math.abs(p)<=1e-12){
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

  return clamp(t0,0,1);
}

export function resolveLineActorPair(a,b){
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
