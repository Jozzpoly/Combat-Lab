const EPS=1e-9;

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

function normalizeBounds(bounds){
  if(!bounds || typeof bounds!=="object") throw new Error("camera bounds required");
  const x=finite(bounds.x ?? 0,"bounds.x");
  const y=finite(bounds.y ?? 0,"bounds.y");
  const width=positive(bounds.width,"bounds.width");
  const height=positive(bounds.height,"bounds.height");
  return {x,y,width,height};
}

function normalizeView(view){
  return {
    width:positive(view?.width,"view.width"),
    height:positive(view?.height,"view.height")
  };
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

export class ResearchCamera {
  constructor({
    minZoom=0.12,
    maxZoom=8,
    wheelSensitivity=0.0017
  }={}){
    this.minZoom=positive(minZoom,"minZoom");
    this.maxZoom=positive(maxZoom,"maxZoom");
    if(this.maxZoom<this.minZoom) throw new Error("maxZoom must be >= minZoom");
    this.wheelSensitivity=positive(wheelSensitivity,"wheelSensitivity");
    this.center={x:0,y:0};
    this.zoom=1;
    this.bounds=null;
  }

  setBounds(bounds){
    this.bounds=normalizeBounds(bounds);
    return this.snapshot();
  }

  fit(bounds=this.bounds,view,{padding=42}={}){
    const b=normalizeBounds(bounds);
    const v=normalizeView(view);
    const p=Math.max(0,finite(padding,"padding"));
    const availableWidth=Math.max(1,v.width-p*2);
    const availableHeight=Math.max(1,v.height-p*2);
    this.bounds=b;
    this.center={
      x:b.x+b.width/2,
      y:b.y+b.height/2
    };
    this.zoom=clamp(
      Math.min(availableWidth/b.width,availableHeight/b.height),
      this.minZoom,
      this.maxZoom
    );
    return this.snapshot();
  }

  screenToWorld(screen,view){
    const p=point(screen,"screen");
    const v=normalizeView(view);
    return {
      x:this.center.x+(p.x-v.width/2)/this.zoom,
      y:this.center.y+(p.y-v.height/2)/this.zoom
    };
  }

  worldToScreen(world,view){
    const p=point(world,"world");
    const v=normalizeView(view);
    return {
      x:v.width/2+(p.x-this.center.x)*this.zoom,
      y:v.height/2+(p.y-this.center.y)*this.zoom
    };
  }

  setZoomAt(nextZoom,screen,view){
    const v=normalizeView(view);
    const anchor=point(screen,"screen");
    const before=this.screenToWorld(anchor,v);
    const zoom=clamp(finite(nextZoom,"zoom"),this.minZoom,this.maxZoom);
    this.zoom=zoom;
    this.center={
      x:before.x-(anchor.x-v.width/2)/zoom,
      y:before.y-(anchor.y-v.height/2)/zoom
    };
    return this.snapshot();
  }

  zoomWheel(deltaY,screen,view){
    const delta=finite(deltaY,"deltaY");
    const factor=Math.exp(-delta*this.wheelSensitivity);
    return this.setZoomAt(this.zoom*factor,screen,view);
  }

  panScreen(deltaX,deltaY){
    const dx=finite(deltaX,"deltaX");
    const dy=finite(deltaY,"deltaY");
    this.center={
      x:this.center.x-dx/this.zoom,
      y:this.center.y-dy/this.zoom
    };
    return this.snapshot();
  }

  apply(ctx,view){
    const v=normalizeView(view);
    ctx.translate(v.width/2,v.height/2);
    ctx.scale(this.zoom,this.zoom);
    ctx.translate(-this.center.x,-this.center.y);
  }

  snapshot(){
    return {
      center:{...this.center},
      zoom:this.zoom,
      minZoom:this.minZoom,
      maxZoom:this.maxZoom,
      bounds:this.bounds ? {...this.bounds} : null
    };
  }
}
