const WORLD={width:3000,height:1800};
const BASE_RADIUS=18;
const BASE_FORCE=760;
const MAX_SPEED=225;
const RESIDENT_MAX_SPEED=175;
const BASELINE_COUNT=6;

const RAILS={
  envelope:{softMin:0.50,softMax:2.00,hardMin:0.05,hardMax:12.00,step:0.01},
  bodyMass:{softMin:0.50,softMax:2.00,hardMin:0.01,hardMax:200.00,step:0.05},
  loadMass:{softMin:0.00,softMax:4.00,hardMin:0.00,hardMax:200.00,step:0.05},
  forceMultiplier:{softMin:0.50,softMax:2.00,hardMin:0.01,hardMax:100.00,step:0.05},
  cameraZoom:{softMin:0.55,softMax:1.40,hardMin:0.15,hardMax:6.00,step:0.05}
};

const OBSTACLES=[
  {x:420,y:120,w:90,h:560},
  {x:420,y:870,w:90,h:620},
  {x:850,y:300,w:230,h:90},
  {x:930,y:700,w:90,h:340},
  {x:720,y:1290,w:350,h:80},
  {x:1350,y:120,w:90,h:500},
  {x:1350,y:820,w:90,h:420},
  {x:1700,y:450,w:320,h:90},
  {x:1850,y:900,w:90,h:520},
  {x:2250,y:170,w:100,h:620},
  {x:2350,y:1080,w:360,h:90},
  {x:2650,y:480,w:90,h:360}
];

const GOALS=[
  {x:240,y:220},{x:720,y:180},{x:1160,y:520},{x:1600,y:240},
  {x:2100,y:260},{x:2760,y:220},{x:2700,y:780},{x:2500,y:1500},
  {x:1850,y:1580},{x:1250,y:1510},{x:650,y:1580},{x:260,y:1120}
];

const SPAWN_ZONES=[
  {x:180,y:150,w:360,h:260},
  {x:600,y:1430,w:420,h:220},
  {x:1480,y:130,w:420,h:240},
  {x:2150,y:1380,w:520,h:240},
  {x:2450,y:650,w:360,h:260}
];

const BASELINE_PHENOTYPES=[
  {envelope:0.65,bodyMass:0.70,loadMass:0.00,forceMultiplier:1.20},
  {envelope:1.70,bodyMass:2.60,loadMass:0.40,forceMultiplier:1.35},
  {envelope:1.00,bodyMass:4.00,loadMass:1.50,forceMultiplier:2.20},
  {envelope:1.35,bodyMass:0.55,loadMass:0.00,forceMultiplier:0.75},
  {envelope:0.55,bodyMass:5.50,loadMass:0.50,forceMultiplier:3.80},
  {envelope:2.00,bodyMass:1.10,loadMass:0.00,forceMultiplier:1.10}
];

const BASELINE_POSITIONS=[
  {x:700,y:510},{x:1120,y:1120},{x:1580,y:620},
  {x:2040,y:1320},{x:2480,y:420},{x:2580,y:1450}
];

function clamp(value,min,max){
  const n=Number(value);
  if(!Number.isFinite(n)) return min;
  return Math.max(min,Math.min(max,n));
}

function moveVectorToward(vx,vy,targetX,targetY,maxDelta){
  const dx=targetX-vx;
  const dy=targetY-vy;
  const distance=Math.hypot(dx,dy);
  if(distance<=maxDelta || distance<1e-12) return {vx:targetX,vy:targetY};
  const scale=maxDelta/distance;
  return {vx:vx+dx*scale,vy:vy+dy*scale};
}

function normalize(x,y){
  const len=Math.hypot(x,y);
  return len>1e-9 ? {x:x/len,y:y/len} : {x:0,y:0};
}

function hash01(n){
  let x=(n|0)+0x9e3779b9;
  x=Math.imul(x^(x>>>16),0x21f0aaad);
  x=Math.imul(x^(x>>>15),0x735a2d97);
  x=x^(x>>>15);
  return (x>>>0)/4294967296;
}

export function deriveEcologyEmbodiment({
  envelope=1,bodyMass=1,loadMass=0,forceMultiplier=1,maxSpeed=MAX_SPEED
}={}){
  const e=clamp(envelope,RAILS.envelope.hardMin,RAILS.envelope.hardMax);
  const bm=clamp(bodyMass,RAILS.bodyMass.hardMin,RAILS.bodyMass.hardMax);
  const lm=clamp(loadMass,RAILS.loadMass.hardMin,RAILS.loadMass.hardMax);
  const fm=clamp(forceMultiplier,RAILS.forceMultiplier.hardMin,RAILS.forceMultiplier.hardMax);
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
    maxSpeed
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

function circleOverlapsRect(x,y,r,rect){
  const nearestX=clamp(x,rect.x,rect.x+rect.w);
  const nearestY=clamp(y,rect.y,rect.y+rect.h);
  return Math.hypot(x-nearestX,y-nearestY)<r;
}

function legalStaticPosition(x,y,r){
  if(x-r<0 || x+r>WORLD.width || y-r<0 || y+r>WORLD.height) return false;
  return !OBSTACLES.some(rect=>circleOverlapsRect(x,y,r,rect));
}

function overlapsBody(x,y,r,body,padding=2){
  return Math.hypot(x-body.x,y-body.y)<r+body.r+padding;
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

export function resolveEcologyBodyPair(a,b){
  let dx=b.x-a.x;
  let dy=b.y-a.y;
  let dist=Math.hypot(dx,dy);
  const minDist=a.r+b.r;
  if(dist>=minDist) return false;

  if(dist<1e-9){
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
  if(closing<0){
    const restitution=0.10;
    const impulse=-(1+restitution)*closing/invTotal;
    a.vx-=impulse*invA*nx;
    a.vy-=impulse*invA*ny;
    b.vx+=impulse*invB*nx;
    b.vy+=impulse*invB*ny;
  }
  return true;
}

function makeBody({x,y,phenotype,maxSpeed=MAX_SPEED,id,baseline=false,goalIndex=0}){
  const d=deriveEcologyEmbodiment({...phenotype,maxSpeed});
  return {
    id,baseline,
    x,y,vx:0,vy:0,
    envelope:d.envelope,r:d.radius,
    bodyMass:d.bodyMass,loadMass:d.loadMass,totalMass:d.totalMass,mass:d.totalMass,
    forceMultiplier:d.forceMultiplier,acceleration:d.acceleration,braking:d.braking,maxSpeed:d.maxSpeed,
    goalIndex,
    staticContacts:0
  };
}

function phenotypeFromBody(body){
  return {
    envelope:body.envelope,
    bodyMass:body.bodyMass,
    loadMass:body.loadMass,
    forceMultiplier:body.forceMultiplier
  };
}

function applyPhenotype(body,patch={}){
  const d=deriveEcologyEmbodiment({
    envelope:patch.envelope ?? body.envelope,
    bodyMass:patch.bodyMass ?? body.bodyMass,
    loadMass:patch.loadMass ?? body.loadMass,
    forceMultiplier:patch.forceMultiplier ?? body.forceMultiplier,
    maxSpeed:body.maxSpeed
  });
  Object.assign(body,{
    envelope:d.envelope,r:d.radius,
    bodyMass:d.bodyMass,loadMass:d.loadMass,totalMass:d.totalMass,mass:d.totalMass,
    forceMultiplier:d.forceMultiplier,acceleration:d.acceleration,braking:d.braking
  });
}

function createBaselineResidents(){
  return BASELINE_PHENOTYPES.map((phenotype,index)=>makeBody({
    x:BASELINE_POSITIONS[index].x,
    y:BASELINE_POSITIONS[index].y,
    phenotype,
    maxSpeed:RESIDENT_MAX_SPEED,
    id:`resident-${index+1}`,
    baseline:true,
    goalIndex:(index*2+3)%GOALS.length
  }));
}

export function createActiveEcologyState(){
  const player=makeBody({
    x:1500,y:900,
    phenotype:{envelope:1,bodyMass:1,loadMass:0,forceMultiplier:1},
    maxSpeed:MAX_SPEED,
    id:"player"
  });

  return {
    time:0,
    player,
    spawnTemplate:{envelope:1,bodyMass:1,loadMass:0,forceMultiplier:1},
    cameraZoom:1,
    residents:createBaselineResidents(),
    nextSpawnSerial:1,
    spawnFailures:0,
    lastSpawnResult:null,
    contactWindowTime:0,
    bodyContactsWindow:0,
    staticContactsWindow:0,
    bodyContactsPerSecond:0,
    staticContactsPerSecond:0
  };
}

export function setActiveEcologyParameter(state,id,value){
  if(id==="playerEnvelope") applyPhenotype(state.player,{envelope:value});
  else if(id==="playerBodyMass") applyPhenotype(state.player,{bodyMass:value});
  else if(id==="playerLoadMass") applyPhenotype(state.player,{loadMass:value});
  else if(id==="playerForceMultiplier") applyPhenotype(state.player,{forceMultiplier:value});
  else if(id==="spawnEnvelope") state.spawnTemplate.envelope=clamp(value,RAILS.envelope.hardMin,RAILS.envelope.hardMax);
  else if(id==="spawnBodyMass") state.spawnTemplate.bodyMass=clamp(value,RAILS.bodyMass.hardMin,RAILS.bodyMass.hardMax);
  else if(id==="spawnLoadMass") state.spawnTemplate.loadMass=clamp(value,RAILS.loadMass.hardMin,RAILS.loadMass.hardMax);
  else if(id==="spawnForceMultiplier") state.spawnTemplate.forceMultiplier=clamp(value,RAILS.forceMultiplier.hardMin,RAILS.forceMultiplier.hardMax);
  else if(id==="cameraZoom") state.cameraZoom=clamp(value,RAILS.cameraZoom.hardMin,RAILS.cameraZoom.hardMax);
  if(id==="playerEnvelope") resolveWorld(state.player);
}

function spawnCandidate(state,serial,attempt,radius){
  const zone=SPAWN_ZONES[(serial+attempt*3)%SPAWN_ZONES.length];
  const hx=hash01(serial*7919+attempt*104729+17);
  const hy=hash01(serial*1543+attempt*31337+91);
  const minX=zone.x+radius;
  const maxX=zone.x+zone.w-radius;
  const minY=zone.y+radius;
  const maxY=zone.y+zone.h-radius;
  if(maxX<=minX || maxY<=minY) return null;
  return {
    x:minX+(maxX-minX)*hx,
    y:minY+(maxY-minY)*hy
  };
}

export function spawnEcologyResidents(state,count){
  const requested=Math.max(0,Math.floor(Number(count)||0));
  let spawned=0;

  for(let n=0;n<requested;n++){
    const serial=state.nextSpawnSerial++;
    const d=deriveEcologyEmbodiment({...state.spawnTemplate,maxSpeed:RESIDENT_MAX_SPEED});
    let position=null;

    for(let attempt=0;attempt<180;attempt++){
      const candidate=spawnCandidate(state,serial,attempt,d.radius);
      if(!candidate) continue;
      if(!legalStaticPosition(candidate.x,candidate.y,d.radius)) continue;
      if(overlapsBody(candidate.x,candidate.y,d.radius,state.player)) continue;
      if(state.residents.some(body=>overlapsBody(candidate.x,candidate.y,d.radius,body))) continue;
      position=candidate;
      break;
    }

    if(!position){
      state.spawnFailures++;
      continue;
    }

    state.residents.push(makeBody({
      x:position.x,y:position.y,
      phenotype:{...state.spawnTemplate},
      maxSpeed:RESIDENT_MAX_SPEED,
      id:`spawn-${serial}`,
      baseline:false,
      goalIndex:(serial*5+1)%GOALS.length
    }));
    spawned++;
  }

  state.lastSpawnResult={requested,spawned,failed:requested-spawned};
  return state.lastSpawnResult;
}

export function clearEcologyExtras(state){
  state.residents=state.residents.filter(body=>body.baseline);
  state.lastSpawnResult={requested:0,spawned:0,failed:0};
}

function movementTarget(body,inputX,inputY){
  const len=Math.hypot(inputX,inputY);
  if(len<=1e-9) return {x:0,y:0};
  return {x:inputX/len*body.maxSpeed,y:inputY/len*body.maxSpeed};
}

function steerResident(body){
  let goal=GOALS[body.goalIndex%GOALS.length];
  if(Math.hypot(goal.x-body.x,goal.y-body.y)<70+body.r){
    body.goalIndex=(body.goalIndex+3+(Number(body.id.match(/\d+/)?.[0])||1))%GOALS.length;
    goal=GOALS[body.goalIndex];
  }

  const desired=normalize(goal.x-body.x,goal.y-body.y);
  const baseAngle=Math.atan2(desired.y,desired.x);
  const offsets=[0,0.34,-0.34,0.68,-0.68,1.02,-1.02,1.57,-1.57,Math.PI];
  const probe=Math.max(45,body.r*1.8);

  for(const offset of offsets){
    const angle=baseAngle+offset;
    const x=body.x+Math.cos(angle)*probe;
    const y=body.y+Math.sin(angle)*probe;
    if(legalStaticPosition(x,y,body.r)){
      return {x:Math.cos(angle),y:Math.sin(angle)};
    }
  }
  return {x:0,y:0};
}

function has(input,code){
  return input.keys.includes(code);
}

export function stepActiveEcology(state,input,dt){
  const p=state.player;
  const mx=(has(input,"KeyD")||has(input,"ArrowRight")?1:0)-(has(input,"KeyA")||has(input,"ArrowLeft")?1:0);
  const my=(has(input,"KeyS")||has(input,"ArrowDown")?1:0)-(has(input,"KeyW")||has(input,"ArrowUp")?1:0);
  const playerTarget=movementTarget(p,mx,my);
  const playerAuthority=(mx||my)?p.acceleration:p.braking;
  const nextPlayer=moveVectorToward(p.vx,p.vy,playerTarget.x,playerTarget.y,playerAuthority*dt);
  p.vx=nextPlayer.vx;
  p.vy=nextPlayer.vy;

  const all=[p,...state.residents];
  for(const body of state.residents){
    const desired=steerResident(body);
    const target=movementTarget(body,desired.x,desired.y);
    const next=moveVectorToward(body.vx,body.vy,target.x,target.y,body.acceleration*dt);
    body.vx=next.vx;
    body.vy=next.vy;
  }

  let staticContacts=0;
  for(const body of all){
    body.x+=body.vx*dt;
    body.y+=body.vy*dt;
    const hits=resolveWorld(body,{bounce:0});
    body.staticContacts=hits;
    staticContacts+=hits;
  }

  let bodyContacts=0;
  for(let i=0;i<all.length;i++){
    for(let j=i+1;j<all.length;j++){
      if(resolveEcologyBodyPair(all[i],all[j])) bodyContacts++;
    }
  }

  for(const body of all){
    staticContacts+=resolveWorld(body,{bounce:0});
  }

  state.bodyContactsWindow+=bodyContacts;
  state.staticContactsWindow+=staticContacts;
  state.contactWindowTime+=dt;
  if(state.contactWindowTime>=0.50){
    state.bodyContactsPerSecond=state.bodyContactsWindow/state.contactWindowTime;
    state.staticContactsPerSecond=state.staticContactsWindow/state.contactWindowTime;
    state.contactWindowTime=0;
    state.bodyContactsWindow=0;
    state.staticContactsWindow=0;
  }

  state.time+=dt;
  return state;
}

function occupiedAreaPercent(state){
  const area=Math.PI*state.player.r*state.player.r+
    state.residents.reduce((sum,body)=>sum+Math.PI*body.r*body.r,0);
  return area/(WORLD.width*WORLD.height)*100;
}

function cameraTransform(view,state){
  const scale=state.cameraZoom;
  const visibleW=view.width/scale;
  const visibleH=view.height/scale;
  const halfW=visibleW/2;
  const halfH=visibleH/2;

  let cx=state.player.x;
  let cy=state.player.y;
  if(visibleW<WORLD.width) cx=clamp(cx,halfW,WORLD.width-halfW);
  else cx=WORLD.width/2;
  if(visibleH<WORLD.height) cy=clamp(cy,halfH,WORLD.height-halfH);
  else cy=WORLD.height/2;

  return {
    scale,cx,cy,
    x:x=>view.width/2+(x-cx)*scale,
    y:y=>view.height/2+(y-cy)*scale
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

function resetStatePreservingAuthored(state){
  const authored={
    player:phenotypeFromBody(state.player),
    spawnTemplate:{...state.spawnTemplate},
    cameraZoom:state.cameraZoom
  };
  const next=createActiveEcologyState();
  for(const [id,value] of Object.entries({
    playerEnvelope:authored.player.envelope,
    playerBodyMass:authored.player.bodyMass,
    playerLoadMass:authored.player.loadMass,
    playerForceMultiplier:authored.player.forceMultiplier,
    spawnEnvelope:authored.spawnTemplate.envelope,
    spawnBodyMass:authored.spawnTemplate.bodyMass,
    spawnLoadMass:authored.spawnTemplate.loadMass,
    spawnForceMultiplier:authored.spawnTemplate.forceMultiplier,
    cameraZoom:authored.cameraZoom
  })) setActiveEcologyParameter(next,id,value);
  return next;
}

export const activeSpatialEcologyV0={
  id:"active-spatial-ecology-v0",
  title:"Active Embodied Spatial Ecology v0",
  kind:"research",
  purpose:"Test whether embodied differences change spatial decisions as active body pressure scales from sparse encounters into crowd and break regimes.",
  controls:"WASD / arrows · author player + spawn phenotype in Inspector · Spawn +1 / +5 / +10",

  create(){
    let state=createActiveEcologyState();

    const inspector={
      schema:{
        groups:[
          {
            id:"player-body",label:"Player phenotype",
            description:"Your live body. Geometry, inertia/load and locomotor force remain independently authored.",
            controls:[
              {id:"playerEnvelope",type:"number",label:"Player envelope",default:1,...RAILS.envelope,decimals:2},
              {id:"playerBodyMass",type:"number",label:"Player body mass",default:1,...RAILS.bodyMass,decimals:2},
              {id:"playerLoadMass",type:"number",label:"Player carried load",default:0,...RAILS.loadMass,decimals:2},
              {id:"playerForceMultiplier",type:"number",label:"Player locomotor force",unit:"×",default:1,...RAILS.forceMultiplier,decimals:2}
            ]
          },
          {
            id:"spawn-phenotype",label:"Spawn phenotype",
            description:"Only new residents use these values. Existing bodies keep the phenotype they were spawned with.",
            controls:[
              {id:"spawnEnvelope",type:"number",label:"Spawn envelope",default:1,...RAILS.envelope,decimals:2},
              {id:"spawnBodyMass",type:"number",label:"Spawn body mass",default:1,...RAILS.bodyMass,decimals:2},
              {id:"spawnLoadMass",type:"number",label:"Spawn carried load",default:0,...RAILS.loadMass,decimals:2},
              {id:"spawnForceMultiplier",type:"number",label:"Spawn locomotor force",unit:"×",default:1,...RAILS.forceMultiplier,decimals:2}
            ]
          },
          {
            id:"view",label:"View",
            description:"Camera follows the player. Zoom is apparatus state and never changes automatically with body size.",
            controls:[
              {id:"cameraZoom",type:"number",label:"Camera zoom",unit:"×",default:1,...RAILS.cameraZoom,decimals:2,
               anchors:[{label:"0.5×",value:0.5},{label:"1×",value:1},{label:"2×",value:2}]}
            ]
          }
        ],
        actionGroups:[
          {
            id:"population-pressure",label:"Population pressure",
            description:"Readable baseline, permissive escalation. Repeated spawning is expected; technical breakage is evidence.",
            actions:[
              {id:"spawn1",label:"Spawn +1"},
              {id:"spawn5",label:"Spawn +5"},
              {id:"spawn10",label:"Spawn +10"},
              {id:"clearExtras",label:"Clear extras"}
            ]
          }
        ],
        liveGroups:[
          {
            id:"pressure",label:"Spatial pressure",
            values:[
              {id:"residentCount",label:"Residents",decimals:0},
              {id:"occupiedPercent",label:"Nominal occupied area",decimals:2,unit:"%"},
              {id:"bodyContactRate",label:"Body contacts / s",decimals:1},
              {id:"staticContactRate",label:"Static contacts / s",decimals:1},
              {id:"spawnFailures",label:"Spawn failures",decimals:0}
            ]
          },
          {
            id:"player-live",label:"Player live state",
            values:[
              {id:"playerTotalMass",label:"Total mass",decimals:2},
              {id:"playerAcceleration",label:"Acceleration limit",decimals:1},
              {id:"playerSpeed",label:"Current speed",decimals:1}
            ]
          }
        ]
      },

      get(id){
        if(id==="playerEnvelope") return state.player.envelope;
        if(id==="playerBodyMass") return state.player.bodyMass;
        if(id==="playerLoadMass") return state.player.loadMass;
        if(id==="playerForceMultiplier") return state.player.forceMultiplier;
        if(id==="spawnEnvelope") return state.spawnTemplate.envelope;
        if(id==="spawnBodyMass") return state.spawnTemplate.bodyMass;
        if(id==="spawnLoadMass") return state.spawnTemplate.loadMass;
        if(id==="spawnForceMultiplier") return state.spawnTemplate.forceMultiplier;
        if(id==="cameraZoom") return state.cameraZoom;
        return undefined;
      },

      set(id,value){
        setActiveEcologyParameter(state,id,value);
      },

      reset(id){
        const defaults={
          playerEnvelope:1,playerBodyMass:1,playerLoadMass:0,playerForceMultiplier:1,
          spawnEnvelope:1,spawnBodyMass:1,spawnLoadMass:0,spawnForceMultiplier:1,
          cameraZoom:1
        };
        if(id in defaults) setActiveEcologyParameter(state,id,defaults[id]);
      },

      restoreDefaults(){
        for(const [id,value] of Object.entries({
          playerEnvelope:1,playerBodyMass:1,playerLoadMass:0,playerForceMultiplier:1,
          spawnEnvelope:1,spawnBodyMass:1,spawnLoadMass:0,spawnForceMultiplier:1,
          cameraZoom:1
        })) setActiveEcologyParameter(state,id,value);
      },

      action(id){
        if(id==="spawn1") spawnEcologyResidents(state,1);
        else if(id==="spawn5") spawnEcologyResidents(state,5);
        else if(id==="spawn10") spawnEcologyResidents(state,10);
        else if(id==="clearExtras") clearEcologyExtras(state);
      },

      getLive(id){
        if(id==="residentCount") return state.residents.length;
        if(id==="occupiedPercent") return occupiedAreaPercent(state);
        if(id==="bodyContactRate") return state.bodyContactsPerSecond;
        if(id==="staticContactRate") return state.staticContactsPerSecond;
        if(id==="spawnFailures") return state.spawnFailures;
        if(id==="playerTotalMass") return state.player.totalMass;
        if(id==="playerAcceleration") return state.player.acceleration;
        if(id==="playerSpeed") return Math.hypot(state.player.vx,state.player.vy);
        return undefined;
      }
    };

    return {
      step(input,dt){
        stepActiveEcology(state,input,dt);
      },

      render(ctx,view,{debug=false}={}){
        const t=cameraTransform(view,state);

        ctx.save();
        ctx.fillStyle="#0e151b";
        ctx.fillRect(0,0,view.width,view.height);

        const grid=120;
        ctx.strokeStyle="rgba(255,255,255,.045)";
        ctx.lineWidth=1;
        const minX=Math.max(0,Math.floor((t.cx-view.width/(2*t.scale))/grid)*grid);
        const maxX=Math.min(WORLD.width,t.cx+view.width/(2*t.scale));
        const minY=Math.max(0,Math.floor((t.cy-view.height/(2*t.scale))/grid)*grid);
        const maxY=Math.min(WORLD.height,t.cy+view.height/(2*t.scale));
        for(let x=minX;x<=maxX;x+=grid){
          ctx.beginPath();ctx.moveTo(t.x(x),0);ctx.lineTo(t.x(x),view.height);ctx.stroke();
        }
        for(let y=minY;y<=maxY;y+=grid){
          ctx.beginPath();ctx.moveTo(0,t.y(y));ctx.lineTo(view.width,t.y(y));ctx.stroke();
        }

        ctx.fillStyle="#29303a";
        for(const rect of OBSTACLES){
          ctx.fillRect(t.x(rect.x),t.y(rect.y),rect.w*t.scale,rect.h*t.scale);
        }

        ctx.strokeStyle="#46515e";
        ctx.lineWidth=2;
        ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

        for(const body of state.residents){
          drawBody(ctx,t,body,body.baseline?"#b57b4b":"#9b6e45",body.baseline?"#efb47e":"#d8a576");
        }
        drawBody(ctx,t,state.player,"#4d9fe0","#cbeaff");

        if(debug){
          ctx.font="11px ui-monospace, monospace";
          for(const body of state.residents){
            const goal=GOALS[body.goalIndex%GOALS.length];
            ctx.strokeStyle="rgba(239,180,126,.20)";
            ctx.beginPath();
            ctx.moveTo(t.x(body.x),t.y(body.y));
            ctx.lineTo(t.x(goal.x),t.y(goal.y));
            ctx.stroke();
          }
          ctx.fillStyle="#e9eef5";
          ctx.fillText(`residents ${state.residents.length} · occupied ~${occupiedAreaPercent(state).toFixed(2)}% · spawn fails ${state.spawnFailures}`,18,24);
          ctx.fillText(`body contacts/s ${state.bodyContactsPerSecond.toFixed(1)} · static contacts/s ${state.staticContactsPerSecond.toFixed(1)} · camera ${state.cameraZoom.toFixed(2)}×`,18,43);
        }

        ctx.restore();
      },

      reset(){
        state=resetStatePreservingAuthored(state);
      },

      inspector,

      snapshot(){
        return {
          time:state.time,
          world:{...WORLD},
          cameraZoom:state.cameraZoom,
          player:{...state.player},
          spawnTemplate:{...state.spawnTemplate},
          residents:state.residents.map(body=>({...body})),
          baselineCount:BASELINE_COUNT,
          spawnFailures:state.spawnFailures,
          lastSpawnResult:state.lastSpawnResult?{...state.lastSpawnResult}:null,
          occupiedPercent:occupiedAreaPercent(state),
          bodyContactsPerSecond:state.bodyContactsPerSecond,
          staticContactsPerSecond:state.staticContactsPerSecond
        };
      }
    };
  }
};

export const ACTIVE_ECOLOGY_WORLD={...WORLD};
export const ACTIVE_ECOLOGY_OBSTACLES=OBSTACLES.map(x=>({...x}));
export const ACTIVE_ECOLOGY_RAILS=structuredClone(RAILS);
export const ACTIVE_ECOLOGY_BASELINE_COUNT=BASELINE_COUNT;
