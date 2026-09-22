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
  const d=Math.hypot(x,y);
  if(d<=1e-9) return {x:fallbackX,y:fallbackY,length:0};
  return {x:x/d,y:y/d,length:d};
}
