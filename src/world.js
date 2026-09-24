export const E0_WORLD=Object.freeze({
  width:1200,
  height:4000,
  inset:30,
  accessY:2000
});

export function resolveWorld(actor,world=E0_WORLD){
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

export function resolveBodyPair(a,b){
  const dx=b.x-a.x;
  const dy=b.y-a.y;
  const distance=Math.hypot(dx,dy);
  const required=a.spec.radius+b.spec.radius;
  if(distance>=required) return null;

  const nx=distance>1e-9?dx/distance:1;
  const ny=distance>1e-9?dy/distance:0;
  const depth=required-Math.max(distance,1e-9);
  const invA=1/a.spec.mass;
  const invB=1/b.spec.mass;
  const total=invA+invB;

  a.x-=nx*depth*(invA/total);
  a.y-=ny*depth*(invA/total);
  b.x+=nx*depth*(invB/total);
  b.y+=ny*depth*(invB/total);

  const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(closing<0){
    const j=-closing/total;
    a.vx-=nx*j*invA;
    a.vy-=ny*j*invA;
    b.vx+=nx*j*invB;
    b.vy+=ny*j*invB;
  }

  return {nx,ny,depth};
}
