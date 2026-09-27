export const STATIC_FEASIBILITY_SCHEMA="combat-lab-static-feasibility-v0";
const EPS=1e-9;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function normalizeRect(rect,index){
  const x=finite(rect?.x,`obstacles[${index}].x`);
  const y=finite(rect?.y,`obstacles[${index}].y`);
  const width=finite(rect?.w ?? rect?.width,`obstacles[${index}].width`);
  const height=finite(rect?.h ?? rect?.height,`obstacles[${index}].height`);
  if(width<0 || height<0) throw new Error("static obstacle dimensions must be non-negative");
  return {
    id:String(rect?.id || `obstacle-${index}`),
    x,y,width,height
  };
}

function contractWorld(world,radius){
  const width=finite(world?.width,"world.width");
  const height=finite(world?.height,"world.height");
  if(width<=0 || height<=0) throw new Error("world dimensions must be positive");
  if(radius*2>width+EPS || radius*2>height+EPS){
    throw new Error("circle radius cannot fit inside static world");
  }
  return {width,height,minX:radius,maxX:width-radius,minY:radius,maxY:height-radius};
}

function pointRectDistanceSquared(p,rect){
  const nearestX=Math.max(rect.x,Math.min(rect.x+rect.width,p.x));
  const nearestY=Math.max(rect.y,Math.min(rect.y+rect.height,p.y));
  const dx=p.x-nearestX;
  const dy=p.y-nearestY;
  return dx*dx+dy*dy;
}

function obstacleOccupancy(center,radius,obstacles){
  const threshold=radius*radius;
  for(const [index,raw] of obstacles.entries()){
    const rect=normalizeRect(raw,index);
    if(pointRectDistanceSquared(center,rect)<threshold-EPS){
      return {id:rect.id,type:"obstacle"};
    }
  }
  return null;
}

export function queryStaticCircleOccupancy({center,radius,world,obstacles=[]}={}){
  const c=point(center,"center");
  const r=finite(radius,"radius");
  if(r<=0) throw new Error("radius must be positive");
  const bounds=contractWorld(world,r);

  let blocker=null;
  if(c.x<bounds.minX-EPS) blocker={id:"boundary.left",type:"boundary"};
  else if(c.x>bounds.maxX+EPS) blocker={id:"boundary.right",type:"boundary"};
  else if(c.y<bounds.minY-EPS) blocker={id:"boundary.top",type:"boundary"};
  else if(c.y>bounds.maxY+EPS) blocker={id:"boundary.bottom",type:"boundary"};
  else blocker=obstacleOccupancy(c,r,obstacles);

  return {
    center:c,
    radius:r,
    clear:blocker===null,
    blocker
  };
}

function candidate(t,id,normal){
  if(!Number.isFinite(t) || t<-EPS || t>1+EPS) return null;
  return {
    id,
    type:"obstacle",
    fraction:Math.max(0,Math.min(1,t)),
    normal,
    initialOverlap:false
  };
}

function segmentCircleEntry(from,to,center,radius,id){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  const ox=from.x-center.x;
  const oy=from.y-center.y;
  const a=dx*dx+dy*dy;
  if(a<=EPS) return null;
  const b=2*(ox*dx+oy*dy);
  const c=ox*ox+oy*oy-radius*radius;
  const discriminant=b*b-4*a*c;

  // Exact tangent contact never enters the forbidden interior.
  if(discriminant<=EPS) return null;
  const root=Math.sqrt(discriminant);
  const entry=(-b-root)/(2*a);
  return candidate(entry,id,{x:(from.x+dx*entry-center.x)/radius,y:(from.y+dy*entry-center.y)/radius});
}

function segmentRoundedRectEntry(from,to,rect,radius){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  const hits=[];

  if(dx>EPS){
    const t=(rect.x-radius-from.x)/dx;
    const y=from.y+dy*t;
    if(y>rect.y+EPS && y<rect.y+rect.height-EPS){
      const hit=candidate(t,rect.id,{x:-1,y:0});
      if(hit) hits.push(hit);
    }
  }else if(dx<-EPS){
    const t=(rect.x+rect.width+radius-from.x)/dx;
    const y=from.y+dy*t;
    if(y>rect.y+EPS && y<rect.y+rect.height-EPS){
      const hit=candidate(t,rect.id,{x:1,y:0});
      if(hit) hits.push(hit);
    }
  }

  if(dy>EPS){
    const t=(rect.y-radius-from.y)/dy;
    const x=from.x+dx*t;
    if(x>rect.x+EPS && x<rect.x+rect.width-EPS){
      const hit=candidate(t,rect.id,{x:0,y:-1});
      if(hit) hits.push(hit);
    }
  }else if(dy<-EPS){
    const t=(rect.y+rect.height+radius-from.y)/dy;
    const x=from.x+dx*t;
    if(x>rect.x+EPS && x<rect.x+rect.width-EPS){
      const hit=candidate(t,rect.id,{x:0,y:1});
      if(hit) hits.push(hit);
    }
  }

  const corners=[
    {x:rect.x,y:rect.y},
    {x:rect.x+rect.width,y:rect.y},
    {x:rect.x+rect.width,y:rect.y+rect.height},
    {x:rect.x,y:rect.y+rect.height}
  ];
  for(const corner of corners){
    const hit=segmentCircleEntry(from,to,corner,radius,rect.id);
    if(hit) hits.push(hit);
  }

  hits.sort((a,b)=>a.fraction-b.fraction || a.id.localeCompare(b.id));
  return hits[0] || null;
}

function boundaryExit(from,to,bounds){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  const hits=[];

  if(to.x<bounds.minX-EPS && dx<0){
    hits.push({id:"boundary.left",fraction:(bounds.minX-from.x)/dx,normal:{x:1,y:0}});
  }
  if(to.x>bounds.maxX+EPS && dx>0){
    hits.push({id:"boundary.right",fraction:(bounds.maxX-from.x)/dx,normal:{x:-1,y:0}});
  }
  if(to.y<bounds.minY-EPS && dy<0){
    hits.push({id:"boundary.top",fraction:(bounds.minY-from.y)/dy,normal:{x:0,y:1}});
  }
  if(to.y>bounds.maxY+EPS && dy>0){
    hits.push({id:"boundary.bottom",fraction:(bounds.maxY-from.y)/dy,normal:{x:0,y:-1}});
  }

  return hits
    .filter(hit=>hit.fraction>=-EPS && hit.fraction<=1+EPS)
    .sort((a,b)=>a.fraction-b.fraction || a.id.localeCompare(b.id))[0] || null;
}

export function queryStaticCircleTraversal({from,to,radius,world,obstacles=[]}={}){
  const start=point(from,"from");
  const target=point(to,"to");
  const r=finite(radius,"radius");
  if(r<=0) throw new Error("radius must be positive");
  const bounds=contractWorld(world,r);
  const distance=Math.hypot(target.x-start.x,target.y-start.y);

  const startOccupancy=queryStaticCircleOccupancy({center:start,radius:r,world,obstacles});
  if(!startOccupancy.clear){
    return {
      from:start,to:target,radius:r,distance,clear:false,
      blocker:{
        ...startOccupancy.blocker,
        distance:0,
        fraction:0,
        hitCenter:{...start},
        normal:{x:0,y:0},
        initialOverlap:true
      }
    };
  }

  const candidates=[];
  const boundary=boundaryExit(start,target,bounds);
  if(boundary) candidates.push({...boundary,type:"boundary",initialOverlap:false});

  for(const [index,raw] of obstacles.entries()){
    const rect=normalizeRect(raw,index);
    const hit=segmentRoundedRectEntry(start,target,rect,r);
    if(hit) candidates.push(hit);
  }

  candidates.sort((a,b)=>a.fraction-b.fraction || a.id.localeCompare(b.id));
  const first=candidates[0] || null;
  if(!first){
    return {from:start,to:target,radius:r,distance,clear:true,blocker:null};
  }

  const hitDistance=distance*first.fraction;
  const hitCenter={
    x:start.x+(target.x-start.x)*first.fraction,
    y:start.y+(target.y-start.y)*first.fraction
  };
  return {
    from:start,to:target,radius:r,distance,clear:false,
    blocker:{
      id:first.id,
      type:first.type,
      distance:hitDistance,
      fraction:first.fraction,
      hitCenter,
      normal:{...first.normal},
      initialOverlap:first.initialOverlap
    }
  };
}

export function explainStaticFeasibility({
  from,to,radius,clearance=0,world,obstacles=[]
}={}){
  const c=finite(clearance,"clearance");
  if(c<0) throw new Error("clearance must be non-negative");
  const hard=queryStaticCircleTraversal({from,to,radius,world,obstacles});
  const comfort=queryStaticCircleTraversal({
    from,to,radius:Number(radius)+c,world,obstacles
  });
  return {
    schema:STATIC_FEASIBILITY_SCHEMA,
    target:{...hard.to},
    bodyRadius:hard.radius,
    clearance:c,
    desiredRadius:hard.radius+c,
    hard,
    comfort,
    clearanceConstrained:hard.clear && !comfort.clear
  };
}
