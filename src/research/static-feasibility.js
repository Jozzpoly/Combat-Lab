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

function expandedRect(rect,radius){
  return {
    minX:rect.x-radius,
    maxX:rect.x+rect.width+radius,
    minY:rect.y-radius,
    maxY:rect.y+rect.height+radius
  };
}

function pointInsideAabb(p,aabb){
  return p.x>=aabb.minX-EPS && p.x<=aabb.maxX+EPS &&
    p.y>=aabb.minY-EPS && p.y<=aabb.maxY+EPS;
}

function obstacleOccupancy(center,radius,obstacles){
  for(const [index,raw] of obstacles.entries()){
    const rect=normalizeRect(raw,index);
    if(pointInsideAabb(center,expandedRect(rect,radius))){
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

function segmentAabbEntry(from,to,aabb){
  const dx=to.x-from.x;
  const dy=to.y-from.y;
  let tMin=0;
  let tMax=1;
  let normal={x:0,y:0};

  const axes=[
    {origin:from.x,delta:dx,min:aabb.minX,max:aabb.maxX,minNormal:{x:-1,y:0},maxNormal:{x:1,y:0}},
    {origin:from.y,delta:dy,min:aabb.minY,max:aabb.maxY,minNormal:{x:0,y:-1},maxNormal:{x:0,y:1}}
  ];

  for(const axis of axes){
    if(Math.abs(axis.delta)<=EPS){
      if(axis.origin<axis.min-EPS || axis.origin>axis.max+EPS) return null;
      continue;
    }

    let t1=(axis.min-axis.origin)/axis.delta;
    let t2=(axis.max-axis.origin)/axis.delta;
    let n1=axis.minNormal;
    let n2=axis.maxNormal;
    if(t1>t2){
      [t1,t2]=[t2,t1];
      [n1,n2]=[n2,n1];
    }
    if(t1>tMin){
      tMin=t1;
      normal=n1;
    }
    tMax=Math.min(tMax,t2);
    if(tMin>tMax+EPS) return null;
  }

  if(tMax<-EPS || tMin>1+EPS) return null;
  return {
    fraction:Math.max(0,Math.min(1,tMin)),
    normal,
    initialOverlap:pointInsideAabb(from,aabb)
  };
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
    const hit=segmentAabbEntry(start,target,expandedRect(rect,r));
    if(!hit) continue;
    candidates.push({
      id:rect.id,
      type:"obstacle",
      fraction:hit.fraction,
      normal:hit.normal,
      initialOverlap:hit.initialOverlap
    });
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
