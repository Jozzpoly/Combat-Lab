import {
  OWNER_DT,
  createOwnerSpecimenState,
  movementFromKeys,
  ownerView,
  stepOwnerSpecimen
} from "./src/r3-owner-specimen.js";

const canvas=document.querySelector("canvas");
const ctx=canvas.getContext("2d");
const status=document.querySelector("#contact-status");
const duration=document.querySelector("#contact-duration");
const resetButton=document.querySelector("#reset");

let state=createOwnerSpecimenState();
let keys=new Set();
let pointer={x:0,y:0,valid:false};
let commitQueued=false;
let accumulator=0;
let last=performance.now();
const tipTrail={a:[],b:[]};

function reset(){
  state=createOwnerSpecimenState();
  tipTrail.a.length=0;
  tipTrail.b.length=0;
  commitQueued=false;
}

resetButton.addEventListener("click",reset);

addEventListener("keydown",event=>{
  if(["KeyW","KeyA","KeyS","KeyD","KeyR"].includes(event.code)){
    event.preventDefault();
  }
  if(event.code==="KeyR"){
    reset();
    return;
  }
  keys.add(event.code);
});
addEventListener("keyup",event=>keys.delete(event.code));
addEventListener("blur",()=>keys.clear());

canvas.addEventListener("pointermove",event=>{
  const rect=canvas.getBoundingClientRect();
  pointer.x=event.clientX-rect.left;
  pointer.y=event.clientY-rect.top;
  pointer.valid=true;
});
canvas.addEventListener("pointerdown",event=>{
  if(event.button===0){
    event.preventDefault();
    commitQueued=true;
  }
});
canvas.addEventListener("contextmenu",event=>event.preventDefault());

function resize(){
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,2);
  const width=Math.max(1,Math.round(rect.width*dpr));
  const height=Math.max(1,Math.round(rect.height*dpr));
  if(canvas.width!==width||canvas.height!==height){
    canvas.width=width;
    canvas.height=height;
  }
  return {cssW:rect.width,cssH:rect.height,dpr};
}

function camera(cssW,cssH){
  return {
    x:(state.a.x+state.b.x)*0.5,
    y:(state.a.y+state.b.y)*0.5,
    scale:3,
    cssW,
    cssH
  };
}

function screenToWorld(px,py,cam){
  return {
    x:cam.x+(px-cam.cssW*0.5)/cam.scale,
    y:cam.y+(py-cam.cssH*0.5)/cam.scale
  };
}

function worldToScreen(x,y,cam){
  return {
    x:(x-cam.x)*cam.scale+cam.cssW*0.5,
    y:(y-cam.y)*cam.scale+cam.cssH*0.5
  };
}

function guideAngle(cam){
  if(!pointer.valid) return state.a.tool.guideAngle;
  const p=screenToWorld(pointer.x,pointer.y,cam);
  return Math.atan2(p.y-state.a.y,p.x-state.a.x);
}

function simulate(frameSeconds,cam){
  accumulator=Math.min(accumulator+Math.min(frameSeconds,0.05),0.10);
  while(accumulator>=OWNER_DT){
    const move=movementFromKeys(keys);
    stepOwnerSpecimen(state,{
      moveX:move.x,
      moveY:move.y,
      guideAngle:guideAngle(cam),
      commit:commitQueued,
      dt:OWNER_DT
    });
    commitQueued=false;
    accumulator-=OWNER_DT;
  }
}

function pushTrail(){
  const view=ownerView(state);
  for(const side of ["a","b"]){
    tipTrail[side].push({x:view[side].b.x,y:view[side].b.y});
    if(tipTrail[side].length>34) tipTrail[side].shift();
  }
}

function drawGrid(cam,w,h){
  ctx.save();
  ctx.strokeStyle="rgba(255,255,255,.055)";
  ctx.lineWidth=1;
  const spacing=30*cam.scale;
  const ox=((w*0.5-cam.x*cam.scale)%spacing+spacing)%spacing;
  const oy=((h*0.5-cam.y*cam.scale)%spacing+spacing)%spacing;
  for(let x=ox;x<w;x+=spacing){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }
  for(let y=oy;y<h;y+=spacing){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  ctx.restore();
}

function drawTrail(points,cam,stroke){
  if(points.length<2) return;
  ctx.save();
  ctx.strokeStyle=stroke;
  ctx.lineWidth=1.5;
  ctx.beginPath();
  points.forEach((p,i)=>{
    const q=worldToScreen(p.x,p.y,cam);
    if(i===0) ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawActor(actor,segment,cam,bodyFill,toolStroke,label){
  const p=worldToScreen(actor.x,actor.y,cam);
  ctx.save();
  ctx.fillStyle=bodyFill;
  ctx.beginPath();
  ctx.arc(p.x,p.y,14,0,Math.PI*2);
  ctx.fill();

  const s0=worldToScreen(segment.a.x,segment.a.y,cam);
  const s1=worldToScreen(segment.b.x,segment.b.y,cam);
  ctx.strokeStyle=toolStroke;
  ctx.lineWidth=9;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(s0.x,s0.y);
  ctx.lineTo(s1.x,s1.y);
  ctx.stroke();

  ctx.fillStyle="#f5f5f7";
  ctx.font="600 12px system-ui";
  ctx.textAlign="center";
  ctx.fillText(label,p.x,p.y+4);
  ctx.restore();
}

function draw(){
  const {cssW,cssH,dpr}=resize();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  const cam=camera(cssW,cssH);
  drawGrid(cam,cssW,cssH);

  const view=ownerView(state);
  drawTrail(tipTrail.a,cam,"rgba(120,190,255,.38)");
  drawTrail(tipTrail.b,cam,"rgba(255,170,120,.34)");

  drawActor(state.a,view.a,cam,"#286aa6","#7ec7ff","YOU");
  drawActor(state.b,view.b,cam,"#8b4d2a","#ffb47b","B");

  if(view.contact.engaged&&view.contact.point){
    const q=worldToScreen(view.contact.point.x,view.contact.point.y,cam);
    ctx.save();
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(q.x,q.y,6,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  status.textContent=view.contact.engaged?"CONTACT":"SEPARATED";
  status.dataset.on=view.contact.engaged?"1":"0";
  duration.textContent=view.contact.engaged
    ? view.contact.currentDuration.toFixed(3)+" s"
    : "—";
}

function frame(now){
  const seconds=(now-last)/1000;
  last=now;
  const rect=canvas.getBoundingClientRect();
  const cam=camera(rect.width,rect.height);
  simulate(seconds,cam);
  pushTrail();
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
