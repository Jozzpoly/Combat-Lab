export function clamp(v,min,max){
  return Math.max(min,Math.min(max,v));
}

export function wrapAngle(a){
  while(a<=-Math.PI) a+=Math.PI*2;
  while(a>Math.PI) a-=Math.PI*2;
  return a;
}

export function angleDelta(from,to){
  return wrapAngle(to-from);
}

export function normalize(x,y,fallbackX=0,fallbackY=0){
  const length=Math.hypot(x,y);
  if(length<=1e-9) return {x:fallbackX,y:fallbackY,length:0};
  return {x:x/length,y:y/length,length};
}

export function segmentIntersectsRect(ax,ay,bx,by,rect){
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
    if(Math.abs(p)<=1e-12){
      if(q<0) return false;
      continue;
    }
    const r=q/p;
    if(p<0){
      if(r>t1) return false;
      if(r>t0) t0=r;
    }else{
      if(r<t0) return false;
      if(r<t1) t1=r;
    }
  }
  return true;
}
