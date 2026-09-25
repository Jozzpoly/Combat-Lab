const WORLD={width:1080,height:650};
const BASE_RADIUS=18;
const BASE_FORCE=760;
const MAX_SPEED=225;

const RAILS={
  envelope:{softMin:0.50,softMax:2.00,hardMin:0.05,hardMax:12.00,step:0.01},
  bodyMass:{softMin:0.50,softMax:2.00,hardMin:0.01,hardMax:200.00,step:0.05},
  loadMass:{softMin:0.00,softMax:4.00,hardMin:0.00,hardMax:200.00,step:0.05},
  forceMultiplier:{softMin:0.50,softMax:2.00,hardMin:0.01,hardMax:100.00,step:0.05}
};

const OBSTACLES=[
  // S0 reference choke: 54-unit middle opening, 70-unit top/bottom bypass.
  {x:400,y:70,w:54,h:228},
  {x:400,y:352,w:54,h:228},

  // Open-space geometry family: staggered islands without one authored lane.
  {x:700,y:105,w:120,h:40},
  {x:760,y:500,w:135,h:40},
  {x:900,y:265,w:42,h:120}
];

const CONTACT_SEED=[
  {x:610,y:205,r:18,mass:1.50,vx:-34,vy:26},
  {x:825,y:330,r:18,mass:1.50,vx:-30,vy:-24},
  {x:645,y:480,r:18,mass:1.50,vx:36,vy:-20}
];

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

function moveVectorToward(vx,vy,targetX,targetY,maxDelta){
  const dx=targetX-vx;
  const dy=targetY-vy;
  const distance=Math.hypot(dx,dy);
  if(distance<=maxDelta || distance<1e-12){
    return {vx:targetX,vy:targetY};
  }
  const scale=maxDelta/distance;
  return {vx:vx+dx*scale,vy:vy+dy*scale};
}

export function deriveEmbodiment({
  envelope=1,
  bodyMass=1,
  loadMass=0,
  forceMultiplier=1
}={}){
  const e=clamp(Number(envelope),RAILS.envelope.hardMin,RAILS.envelope.hardMax);
  const bm=clamp(Number(bodyMass),RAILS.bodyMass.hardMin,RAILS.bodyMass.hardMax);
  const lm=clamp(Number(loadMass),RAILS.loadMass.hardMin,RAILS.loadMass.hardMax);
  const fm=clamp(Number(forceMultiplier),RAILS.forceMultiplier.hardMin,RAILS.forceMultiplier.hardMax);
  const totalMass=bm+lm;
  const acceleration=BASE_FORCE*fm/totalMass;

  return {
    envelope:e,
    radius:BASE_RADIUS*e,
    bodyMass:bm,
    loadMass:lm,
    totalMass,
    forceMultiplier:fm,
    acceleration,
    braking:acceleration,
    maxSpeed:MAX_SPEED
  };
}

function circleRectContact(body,rect){
  const nearestX=clamp(body.x,rect.x,rect.x+rect.w);
  const nearestY=clamp(body.y,rect.y,rect.y+rect.h);
  let dx=body.x-nearestX;
  let dy=body.y-nearestY;
  let dist=Math.hypot(dx,dy);

  if(dist>0 && dist<body.r){
    return {nx:dx/dist,ny:dy/dist,penetration:body.r-dist};
  }
  if(dist>=body.r) return null;

  const left=Math.abs(body.x-rect.x);
  const right=Math.abs(rect.x+rect.w-body.x);
  const top=Math.abs(body.y-rect.y);
  const bottom=Math.abs(rect.y+rect.h-body.y);
  const min=Math.min(left,right,top,bottom);

  if(min===left) return {nx:-1,ny:0,penetration:body.r+left};
  if(min===right) return {nx:1,ny:0,penetration:body.r+right};
  if(min===top) return {nx:0,ny:-1,penetration:body.r+top};
  return {nx:0,ny:1,penetration:body.r+bottom};
}

function resolveWorld(body,{bounce=0}={}){
  let contacts=0;

  if(body.x-body.r<0){
    body.x=body.r;
    if(body.vx<0) body.vx=-body.vx*bounce;
    contacts++;
  }
  if(body.x+body.r>WORLD.width){
    body.x=WORLD.width-body.r;
    if(body.vx>0) body.vx=-body.vx*bounce;
    contacts++;
  }
  if(body.y-body.r<0){
    body.y=body.r;
    if(body.vy<0) body.vy=-body.vy*bounce;
    contacts++;
  }
  if(body.y+body.r>WORLD.height){
    body.y=WORLD.height-body.r;
    if(body.vy>0) body.vy=-body.vy*bounce;
    contacts++;
  }

  for(const rect of OBSTACLES){
    const c=circleRectContact(body,rect);
    if(!c) continue;
    body.x+=c.nx*c.penetration;
    body.y+=c.ny*c.penetration;
    const normalVelocity=body.vx*c.nx+body.vy*c.ny;
    if(normalVelocity<0){
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
  if(dist>=minDist) return false;

  if(dist<1e-9){
    dx=1;
    dy=0;
    dist=1;
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
  if(closing<0){
    const restitution=0.18;
    const impulse=-(1+restitution)*closing/invTotal;
    a.vx-=impulse*invA*nx;
    a.vy-=impulse*invA*ny;
    b.vx+=impulse*invB*nx;
    b.vy+=impulse*invB*ny;
  }

  return true;
}

function applyDerived(player,patch={}){
  const d=deriveEmbodiment({
    envelope:patch.envelope ?? player.envelope,
    bodyMass:patch.bodyMass ?? player.bodyMass,
    loadMass:patch.loadMass ?? player.loadMass,
    forceMultiplier:patch.forceMultiplier ?? player.forceMultiplier
  });

  Object.assign(player,{
    envelope:d.envelope,
    r:d.radius,
    bodyMass:d.bodyMass,
    loadMass:d.loadMass,
    totalMass:d.totalMass,
    mass:d.totalMass,
    forceMultiplier:d.forceMultiplier,
    acceleration:d.acceleration,
    braking:d.braking,
    maxSpeed:d.maxSpeed
  });
}

export function setEmbodimentParameter(state,id,value){
  const patch={};
  if(id==="envelope") patch.envelope=value;
  else if(id==="bodyMass") patch.bodyMass=value;
  else if(id==="loadMass") patch.loadMass=value;
  else if(id==="forceMultiplier") patch.forceMultiplier=value;
  else return;

  applyDerived(state.player,patch);
  if(id==="envelope") resolveWorld(state.player);
}

export function createLoadEnvelopeState({contacts=true}={}){
  const d=deriveEmbodiment();
  return {
    time:0,
    player:{
      x:165,y:325,vx:0,vy:0,
      envelope:d.envelope,r:d.radius,
      bodyMass:d.bodyMass,loadMass:d.loadMass,totalMass:d.totalMass,mass:d.totalMass,
      forceMultiplier:d.forceMultiplier,
      acceleration:d.acceleration,braking:d.braking,maxSpeed:d.maxSpeed
    },
    contacts:contacts ? CONTACT_SEED.map(x=>({...x})) : [],
    contactCount:0,
    lastContactTime:-Infinity
  };
}

function has(input,code){ return input.keys.includes(code); }

export function stepLoadEnvelopeField(state,input,dt){
  const p=state.player;
  const mx=(has(input,"KeyD")||has(input,"ArrowRight")?1:0)-(has(input,"KeyA")||has(input,"ArrowLeft")?1:0);
  const my=(has(input,"KeyS")||has(input,"ArrowDown")?1:0)-(has(input,"KeyW")||has(input,"ArrowUp")?1:0);
  const len=Math.hypot(mx,my);

  const targetX=len>0 ? mx/len*p.maxSpeed : 0;
  const targetY=len>0 ? my/len*p.maxSpeed : 0;
  const authority=len>0 ? p.acceleration : p.braking;
  const next=moveVectorToward(p.vx,p.vy,targetX,targetY,authority*dt);
  p.vx=next.vx;
  p.vy=next.vy;

  p.x+=p.vx*dt;
  p.y+=p.vy*dt;
  let contactCount=resolveWorld(p);

  for(const body of state.contacts){
    body.x+=body.vx*dt;
    body.y+=body.vy*dt;
    resolveWorld(body,{bounce:0.72});
  }

  for(let i=0;i<state.contacts.length;i++){
    for(let j=i+1;j<state.contacts.length;j++){
      resolveBodyPair(state.contacts[i],state.contacts[j]);
    }
  }

  for(const body of state.contacts){
    if(resolveBodyPair(p,body)) contactCount++;
  }

  resolveWorld(p);
  state.contactCount=contactCount;
  if(contactCount>0) state.lastContactTime=state.time;
  state.time+=dt;
  return state;
}

function viewTransform(view){
  const pad=34;
  const scale=Math.min((view.width-pad*2)/WORLD.width,(view.height-pad*2)/WORLD.height);
  const ox=(view.width-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};
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

export const loadEnvelopeFieldB0={
  id:"load-envelope-field-b0",
  title:"Load / Envelope Field B0",
  kind:"research",
  purpose:"Separate occupied body envelope, intrinsic mass, carried load and locomotor force before adding stance, traction or combat actions.",
  controls:"Parameters: Lab Inspector · A/B slots compare authored configurations",

  create(){
    let state=createLoadEnvelopeState();

    const inspector={
      schema:{
        groups:[
          {
            id:"geometry",
            label:"Body geometry",
            description:"Occupied space only; independent from mass and locomotor force in B0.",
            controls:[
              {
                id:"envelope",type:"number",label:"Body envelope",
                description:"Radius / clearance only. Does not change mass or locomotor force.",
                default:1,...RAILS.envelope,decimals:2,
                anchors:[
                  {label:"Small",value:0.65},
                  {label:"Base",value:1.00},
                  {label:"Large",value:1.70}
                ]
              }
            ]
          },
          {
            id:"mass",
            label:"Mass & load",
            description:"Body mass + carried load form total inertia; neither changes envelope.",
            controls:[
              {
                id:"bodyMass",type:"number",label:"Intrinsic body mass",
                description:"Actor mass before equipment / carried load.",
                default:1,...RAILS.bodyMass,decimals:2,
                anchors:[
                  {label:"0.5×",value:0.50},
                  {label:"Base",value:1.00},
                  {label:"2×",value:2.00}
                ]
              },
              {
                id:"loadMass",type:"number",label:"Carried load mass",
                description:"Worn / carried mass. Adds inertia without enlarging the current envelope.",
                default:0,...RAILS.loadMass,decimals:2,
                anchors:[
                  {label:"None",value:0},
                  {label:"+0.5",value:0.50},
                  {label:"+2",value:2.00},
                  {label:"+5",value:5.00}
                ]
              }
            ]
          },
          {
            id:"locomotion",
            label:"Locomotion",
            description:"Force-limited acceleration / braking. Max speed stays fixed in B0.",
            controls:[
              {
                id:"forceMultiplier",type:"number",label:"Locomotor force",
                description:"Actuator force for accelerating, braking and redirecting velocity.",
                unit:"×",default:1,...RAILS.forceMultiplier,decimals:2,
                anchors:[
                  {label:"0.5×",value:0.50},
                  {label:"Base",value:1.00},
                  {label:"2×",value:2.00}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"derived",
            label:"Derived relations",
            description:"Read-only consequences of the current B0 law.",
            values:[
              {id:"radius",label:"Radius",decimals:2},
              {id:"totalMass",label:"Total mass",decimals:2},
              {id:"acceleration",label:"Acceleration limit",decimals:1},
              {id:"maxSpeed",label:"Max speed",decimals:1}
            ]
          },
          {
            id:"live",
            label:"Live state",
            values:[
              {id:"speed",label:"Current speed",decimals:1},
              {id:"contactCount",label:"Contacts",decimals:0}
            ]
          }
        ]
      },

      get(id){
        if(id==="envelope") return state.player.envelope;
        if(id==="bodyMass") return state.player.bodyMass;
        if(id==="loadMass") return state.player.loadMass;
        if(id==="forceMultiplier") return state.player.forceMultiplier;
        return undefined;
      },

      set(id,value){
        setEmbodimentParameter(state,id,value);
      },

      reset(id){
        if(id==="envelope") setEmbodimentParameter(state,id,1);
        if(id==="bodyMass") setEmbodimentParameter(state,id,1);
        if(id==="loadMass") setEmbodimentParameter(state,id,0);
        if(id==="forceMultiplier") setEmbodimentParameter(state,id,1);
      },

      restoreDefaults(){
        setEmbodimentParameter(state,"envelope",1);
        setEmbodimentParameter(state,"bodyMass",1);
        setEmbodimentParameter(state,"loadMass",0);
        setEmbodimentParameter(state,"forceMultiplier",1);
      },

      getLive(id){
        if(id==="radius") return state.player.r;
        if(id==="totalMass") return state.player.totalMass;
        if(id==="acceleration") return state.player.acceleration;
        if(id==="maxSpeed") return state.player.maxSpeed;
        if(id==="speed") return Math.hypot(state.player.vx,state.player.vy);
        if(id==="contactCount") return state.contactCount;
        return undefined;
      }
    };

    return {
      step(input,dt){
        stepLoadEnvelopeField(state,input,dt);
      },

      render(ctx,view,{debug=false}={}){
        const t=viewTransform(view);

        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.07)";
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

        for(const body of state.contacts){
          drawBody(ctx,t,body,"#b57b4b","#efb47e");
        }

        const recentlyTouched=state.time-state.lastContactTime<0.18;
        drawBody(ctx,t,state.player,recentlyTouched?"#8fd5ff":"#4d9fe0","#cbeaff");

        if(debug){
          const p=state.player;
          ctx.fillStyle="#e9eef5";
          ctx.font="13px ui-monospace, monospace";
          ctx.fillText(
            `env ${p.envelope.toFixed(2)} · body ${p.bodyMass.toFixed(2)} · load ${p.loadMass.toFixed(2)} · total ${p.totalMass.toFixed(2)}`,
            18,24
          );
          ctx.fillText(
            `force ${p.forceMultiplier.toFixed(2)}× · accel ${p.acceleration.toFixed(1)} · speed ${Math.hypot(p.vx,p.vy).toFixed(1)}`,
            18,43
          );

          ctx.strokeStyle="#8fd5ff";
          ctx.beginPath();
          ctx.moveTo(t.x(p.x),t.y(p.y));
          ctx.lineTo(t.x(p.x+p.vx*0.35),t.y(p.y+p.vy*0.35));
          ctx.stroke();

          ctx.fillStyle="#9eabb9";
          ctx.fillText("No attacks · no HP · no traction variable · no stance · max speed held constant",18,62);
        }

        ctx.restore();
      },

      reset(){
        const authored={
          envelope:state.player.envelope,
          bodyMass:state.player.bodyMass,
          loadMass:state.player.loadMass,
          forceMultiplier:state.player.forceMultiplier
        };
        state=createLoadEnvelopeState();
        for(const [id,value] of Object.entries(authored)){
          setEmbodimentParameter(state,id,value);
        }
      },

      inspector,

      snapshot(){
        return {
          time:state.time,
          player:{...state.player},
          contactCount:state.contactCount,
          contacts:state.contacts.map(x=>({...x}))
        };
      }
    };
  }
};

export const B0_WORLD={...WORLD};
export const B0_OBSTACLES=OBSTACLES.map(x=>({...x}));
export const B0_RAILS=structuredClone(RAILS);
