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

export function normalize(x,y,fx=1,fy=0){
  const l=Math.hypot(x,y);
  if(l<=1e-9) return {x:fx,y:fy,length:0};
  return {x:x/l,y:y/l,length:l};
}

export function closestPointsSegments(a0,a1,b0,b1){
  const ux=a1.x-a0.x, uy=a1.y-a0.y;
  const vx=b1.x-b0.x, vy=b1.y-b0.y;
  const wx=a0.x-b0.x, wy=a0.y-b0.y;

  const A=ux*ux+uy*uy;
  const B=ux*vx+uy*vy;
  const C=vx*vx+vy*vy;
  const D=ux*wx+uy*wy;
  const E=vx*wx+vy*wy;
  const denom=A*C-B*B;

  let sN,sD=denom,tN,tD=denom;

  if(denom<1e-9){
    sN=0;sD=1;
    tN=E;tD=C;
  }else{
    sN=B*E-C*D;
    tN=A*E-B*D;
    if(sN<0){
      sN=0;
      tN=E;tD=C;
    }else if(sN>sD){
      sN=sD;
      tN=E+B;tD=C;
    }
  }

  if(tN<0){
    tN=0;
    if(-D<0) sN=0;
    else if(-D>A) sN=sD;
    else {sN=-D;sD=A;}
  }else if(tN>tD){
    tN=tD;
    if((-D+B)<0) sN=0;
    else if((-D+B)>A) sN=sD;
    else {sN=(-D+B);sD=A;}
  }

  const sc=Math.abs(sN)<1e-9?0:sN/sD;
  const tc=Math.abs(tN)<1e-9?0:tN/tD;
  const pa={x:a0.x+sc*ux,y:a0.y+sc*uy};
  const pb={x:b0.x+tc*vx,y:b0.y+tc*vy};
  const dx=pb.x-pa.x,dy=pb.y-pa.y;

  return {
    pa,pb,s:sc,t:tc,
    distance:Math.hypot(dx,dy),
    dx,dy
  };
}
