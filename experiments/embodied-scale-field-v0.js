const WORLD={width:960,height:600};
const BASE_RADIUS=18;
const MIN_SCALE=0.05;
const MAX_SCALE=8.00;
const SCALE_RATE=0.55;

const OBSTACLES=[
  {x:390,y:70,w:54,h:203},
  {x:390,y:327,w:54,h:203},
  {x:650,y:125,w:120,h:42},
  {x:680,y:410,w:120,h:42},
  {x:180,y:440,w:105,h:36}
];

const DRIFTER_SEED=[
  {x:560,y:215,r:18,mass:1.35,vx:-44,vy:31},
  {x:765,y:300,r:22,mass:1.85,vx:-36,vy:-28},
  {x:520,y:455,r:14,mass:0.85,vx:48,vy:-22}
];

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function has(input,code){ return input.keys.includes(code); }

export function bodyFromScale(scale){
  const s=clamp(scale,MIN_SCALE,MAX_SCALE);
  const mass=s*s;
  return {
    scale:s,
    radius:BASE_RADIUS*s,
    mass,
    acceleration:760/(0.72+0.28*Math.sqrt(mass)),
    braking:980/(0.72+0.28*Math.sqrt(mass)),
    maxSpeed:225/(0.86+0.14*mass)
  };
}

function moveToward(value,target,maxDelta){
  if (value<target) return Math.min(value+maxDelta,target);
  if (value>target) return Math.max(value-maxDelta,target);
  return value;
}

function circleRectContact(body,rect){
  const nearestX=clamp(body.x,rect.x,rect.x+rect.w);
  const nearestY=clamp(body.y,rect.y,rect.y+rect.h);
  let dx=body.x-nearestX;
  let dy=body.y-nearestY;
  let dist=Math.hypot(dx,dy);

  if (dist>0 && dist<body.r){
    return {nx:dx/dist,ny:dy/dist,penetration:body.r-dist};
  }
  if (dist>=body.r) return null;

  const left=Math.abs(body.x-rect.x);
  const right=Math.abs(rect.x+rect.w-body.x);
  const top=Math.abs(body.y-rect.y);
  const bottom=Math.abs(rect.y+rect.h-body.y);
  const min=Math.min(left,right,top,bottom);

  if (min===left) return {nx:-1,ny:0,penetration:body.r+left};
  if (min===right) return {nx:1,ny:0,penetration:body.r+right};
  if (min===top) return {nx:0,ny:-1,penetration:body.r+top};
  return {nx:0,ny:1,penetration:body.r+bottom};
}

function resolveWorld(body,{bounce=0}={}){
  let contacts=0;

  if (body.x-body.r<0){
    body.x=body.r;
    if (body.vx<0) body.vx=-body.vx*bounce;
    contacts++;
  }
  if (body.x+body.r>WORLD.width){
    body.x=WORLD.width-body.r;
    if (body.vx>0) body.vx=-body.vx*bounce;
    contacts++;
  }
  if (body.y-body.r<0){
    body.y=body.r;
    if (body.vy<0) body.vy=-body.vy*bounce;
    contacts++;
  }
  if (body.y+body.r>WORLD.height){
    body.y=WORLD.height-body.r;
    if (body.vy>0) body.vy=-body.vy*bounce;
    contacts++;
  }

  for (const rect of OBSTACLES){
    const c=circleRectContact(body,rect);
    if (!c) continue;
    body.x+=c.nx*c.penetration;
    body.y+=c.ny*c.penetration;
    const normalVelocity=body.vx*c.nx+body.vy*c.ny;
    if (normalVelocity<0){
      body.vx-=normalVelocity*c.nx*(1+bounce);
      body.vy-=normalVelocity*c.ny*(1+bounce);
    }
    contacts++;
  }

  return contacts;
}

export function resolveBodyPair(a,b){
  let dx=b.x-a.x;
  let dy=b.y-a.y;
  let dist=Math.hypot(dx,dy);
  const minDist=a.r+b.r;
  if (dist>=minDist) return false;

  if (dist<1e-9){
    dx=1; dy=0; dist=1;
  }

  const nx=dx/dist;
  const ny=dy/dist;
  const penetration=minDist-dist;
  const invA=1/a.mass;
  const invB=1/b.mass;
  const invTotal=invA+invB;

  a.x-=nx*penetration*(invA/invTotal);
  a.y-=ny*penetration*(invA/invTotal);
  b.x+=nx*penetration*(invB/invTotal);
  b.y+=ny*penetration*(invB/invTotal);

  const rvx=b.vx-a.vx;
  const rvy=b.vy-a.vy;
  const closing=rvx*nx+rvy*ny;
  if (closing<0){
    const restitution=0.18;
    const impulse=-(1+restitution)*closing/invTotal;
    a.vx-=impulse*invA*nx;
    a.vy-=impulse*invA*ny;
    b.vx+=impulse*invB*nx;
    b.vy+=impulse*invB*ny;
  }

  return true;
}

export function createScaleFieldState({drifters=true}={}){
  const derived=bodyFromScale(1);
  return {
    time:0,
    player:{
      x:175,y:300,vx:0,vy:0,
      r:derived.radius,mass:derived.mass,scale:derived.scale,
      acceleration:derived.acceleration,braking:derived.braking,maxSpeed:derived.maxSpeed
    },
    drifters:drifters ? DRIFTER_SEED.map(d=>({...d})) : [],
    contacts:0,
    lastContactTime:-Infinity
  };
}

export function setPlayerScale(state,scale){
  const d=bodyFromScale(scale);
  Object.assign(state.player,{
    r:d.radius,
    mass:d.mass,
    scale:d.scale,
    acceleration:d.acceleration,
    braking:d.braking,
    maxSpeed:d.maxSpeed
  });
  resolveWorld(state.player);
}

export function stepScaleField(state,input,dt){
  const p=state.player;

  if (has(input,"Digit1")) setPlayerScale(state,0.65);
  if (has(input,"Digit2")) setPlayerScale(state,1.00);
  if (has(input,"Digit3")) setPlayerScale(state,1.70);

  const scaleDelta=(has(input,"BracketRight")?1:0)-(has(input,"BracketLeft")?1:0);
  if (scaleDelta!==0) setPlayerScale(state,p.scale+scaleDelta*SCALE_RATE*dt);

  const mx=(has(input,"KeyD")||has(input,"ArrowRight")?1:0)-(has(input,"KeyA")||has(input,"ArrowLeft")?1:0);
  const my=(has(input,"KeyS")||has(input,"ArrowDown")?1:0)-(has(input,"KeyW")||has(input,"ArrowUp")?1:0);
  const len=Math.hypot(mx,my);

  if (len>0){
    const tx=mx/len*p.maxSpeed;
    const ty=my/len*p.maxSpeed;
    p.vx=moveToward(p.vx,tx,p.acceleration*dt);
    p.vy=moveToward(p.vy,ty,p.acceleration*dt);
  } else {
    p.vx=moveToward(p.vx,0,p.braking*dt);
    p.vy=moveToward(p.vy,0,p.braking*dt);
  }

  p.x+=p.vx*dt;
  p.y+=p.vy*dt;
  let contacts=resolveWorld(p);

  for (const d of state.drifters){
    d.x+=d.vx*dt;
    d.y+=d.vy*dt;
    resolveWorld(d,{bounce:0.72});
  }

  for (let i=0;i<state.drifters.length;i++){
    for (let j=i+1;j<state.drifters.length;j++){
      resolveBodyPair(state.drifters[i],state.drifters[j]);
    }
  }

  for (const d of state.drifters){
    if (resolveBodyPair(p,d)) contacts++;
  }

  resolveWorld(p);
  state.contacts=contacts;
  if (contacts>0) state.lastContactTime=state.time;
  state.time+=dt;
  return state;
}

function viewTransform(view){
  const pad=34;
  const scale=Math.min((view.width-pad*2)/WORLD.width,(view.height-pad*2)/WORLD.height);
  const ox=(view.width-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {
    scale,ox,oy,
    x:v=>ox+v*scale,
    y:v=>oy+v*scale
  };
}

function drawBody(ctx,t,body,fill,stroke){
  ctx.fillStyle=fill;
  ctx.strokeStyle=stroke;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(t.x(body.x),t.y(body.y),body.r*t.scale,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

export const embodiedScaleFieldV0={
  id:"embodied-scale-field-v0",
  title:"Embodied Scale Field S0",
  purpose:"Explore whether continuous body scale changes create different spatial and contact possibilities before adding attacks.",
  controls:"Optional shortcuts: 1/2/3 scale anchors · [ / ] continuous scale",

  create(){
    let state=createScaleFieldState();

    const inspector={
      schema:{
        groups:[
          {
            id:"body",
            label:"Body",
            description:"S0 keeps its original coupled law: body scale also derives mass and motor response. The coupling is visible here instead of hidden.",
            controls:[
              {
                id:"scale",
                type:"number",
                label:"Body scale",
                description:"Directly changes occupied body envelope. Values outside the convenient range are intentionally allowed.",
                shortcut:"[ / ]",
                default:1,
                softMin:0.40,
                softMax:2.00,
                hardMin:MIN_SCALE,
                hardMax:MAX_SCALE,
                step:0.01,
                decimals:2,
                anchors:[
                  {label:"Small",value:0.65},
                  {label:"Base",value:1.00},
                  {label:"Large",value:1.70}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"derived",
            label:"Derived from S0 law",
            description:"Read-only consequences of the current coupled scale law.",
            values:[
              {id:"radius",label:"Radius",decimals:2},
              {id:"mass",label:"Mass",decimals:3},
              {id:"acceleration",label:"Acceleration",decimals:1},
              {id:"braking",label:"Braking",decimals:1},
              {id:"maxSpeed",label:"Max speed",decimals:1}
            ]
          },
          {
            id:"live",
            label:"Live state",
            values:[
              {id:"speed",label:"Current speed",decimals:1},
              {id:"contacts",label:"Contacts",decimals:0}
            ]
          }
        ]
      },
      get(id){
        if(id==="scale") return state.player.scale;
        return undefined;
      },
      set(id,value){
        if(id==="scale") setPlayerScale(state,value);
      },
      reset(id){
        if(id==="scale") setPlayerScale(state,1);
      },
      restoreDefaults(){
        setPlayerScale(state,1);
      },
      getLive(id){
        if(id==="radius") return state.player.r;
        if(id==="mass") return state.player.mass;
        if(id==="acceleration") return state.player.acceleration;
        if(id==="braking") return state.player.braking;
        if(id==="maxSpeed") return state.player.maxSpeed;
        if(id==="speed") return Math.hypot(state.player.vx,state.player.vy);
        if(id==="contacts") return state.contacts;
        return undefined;
      }
    };

    return {
      step(input,dt){
        stepScaleField(state,input,dt);
      },

      render(ctx,view,{debug=false}={}){
        const t=viewTransform(view);

        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.08)";
        ctx.lineWidth=1;
        for(let x=0;x<=WORLD.width;x+=60){
          ctx.beginPath(); ctx.moveTo(t.x(x),t.y(0)); ctx.lineTo(t.x(x),t.y(WORLD.height)); ctx.stroke();
        }
        for(let y=0;y<=WORLD.height;y+=60){
          ctx.beginPath(); ctx.moveTo(t.x(0),t.y(y)); ctx.lineTo(t.x(WORLD.width),t.y(y)); ctx.stroke();
        }

        ctx.strokeStyle="#3e4652";
        ctx.lineWidth=3;
        ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

        ctx.fillStyle="#29303a";
        for(const r of OBSTACLES){
          ctx.fillRect(t.x(r.x),t.y(r.y),r.w*t.scale,r.h*t.scale);
        }

        for(const d of state.drifters) drawBody(ctx,t,d,"#b57b4b","#efb47e");

        const recentlyTouched=state.time-state.lastContactTime<0.18;
        drawBody(ctx,t,state.player,recentlyTouched?"#8fd5ff":"#4d9fe0","#cbeaff");

        if(debug){
          ctx.fillStyle="#e9eef5";
          ctx.font="13px ui-monospace, monospace";
          ctx.fillText(`scale ${state.player.scale.toFixed(2)} · radius ${state.player.r.toFixed(1)} · mass ${state.player.mass.toFixed(2)}`,18,24);
          ctx.fillText(`speed ${Math.hypot(state.player.vx,state.player.vy).toFixed(1)} · contacts ${state.contacts}`,18,43);

          ctx.strokeStyle="#8fd5ff";
          ctx.beginPath();
          ctx.moveTo(t.x(state.player.x),t.y(state.player.y));
          ctx.lineTo(t.x(state.player.x+state.player.vx*0.35),t.y(state.player.y+state.player.vy*0.35));
          ctx.stroke();

          ctx.fillStyle="#9eabb9";
          ctx.fillText("No HP · no attacks · no classes · no objective",18,62);
        }
        ctx.restore();
      },

      reset(){
        const scale=state.player.scale;
        state=createScaleFieldState();
        setPlayerScale(state,scale);
      },

      inspector,

      snapshot(){
        return {
          time:state.time,
          player:{...state.player},
          contacts:state.contacts,
          drifters:state.drifters.map(d=>({...d}))
        };
      }
    };
  }
};

export const SCALE_FIELD_WORLD={...WORLD};
export const SCALE_FIELD_OBSTACLES=OBSTACLES.map(r=>({...r}));
