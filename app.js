import { BROKEN_YARD } from "./src/yard.js";
import { normalize } from "./src/math.js";
import {
  O1_ATTACK,
  attackProgress,
  shieldSegment
} from "./src/o1.js";
import { createO1State, stepO1State } from "./src/o1-sim.js";
import { runO1StakePolicy } from "./src/o1-rehearsal.js";

const canvas=document.querySelector("#game");
const ctx=canvas.getContext("2d");
const statusEl=document.querySelector("#status");
const detailEl=document.querySelector("#detail");

const DT=1/120;
const keys=new Set();
const mouse={x:450,y:280};
let attackQueued=false;
let state;
let fx=[];
let accumulator=0;
let last=performance.now();

function reset(){
  state=createO1State({
    playerStart:{x:450,y:415,facing:-Math.PI/2},
    threatStarts:[
      {id:"north",x:315,y:175,facing:Math.PI/2},
      {id:"east",x:805,y:355,facing:Math.PI}
    ],
    objective:{x:450,y:480,radius:14,hp:1}
  });
  fx=[];
  attackQueued=false;
  mouse.x=450;
  mouse.y=280;
}

function moveInput(){
  let x=0,y=0;
  if(keys.has("KeyA")) x--;
  if(keys.has("KeyD")) x++;
  if(keys.has("KeyW")) y--;
  if(keys.has("KeyS")) y++;
  return normalize(x,y,0,0);
}

function addFx(event){
  if(!event) return;
  const x=event.x ?? state.player.x;
  const y=event.y ?? state.player.y;
  fx.push({type:event.type,x,y,life:.34});
}

function step(dt){
  if(state.result!=="active"){
    for(const f of fx) f.life-=dt;
    fx=fx.filter(f=>f.life>0);
    return;
  }

  const move=moveInput();
  const events=stepO1State(state,{
    moveX:move.x,
    moveY:move.y,
    aimX:mouse.x,
    aimY:mouse.y,
    brace:keys.has("ShiftLeft")||keys.has("ShiftRight"),
    attack:attackQueued
  },dt);
  attackQueued=false;

  for(const event of events){
    if(
      event.type==="shield-block" ||
      event.type==="body-hit" ||
      event.type==="player-strike" ||
      event.type==="objective-hit"
    ) addFx(event);
  }

  for(const f of fx) f.life-=dt;
  fx=fx.filter(f=>f.life>0);
}

function drawWall(w){
  ctx.fillStyle="#30383a";
  ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.strokeStyle="#566064";
  ctx.strokeRect(w.x+.5,w.y+.5,w.w-1,w.h-1);
}

function drawObjective(){
  const o=state.objective;
  ctx.fillStyle=o.hp>0?"#d5bf7a":"#6d5648";
  ctx.beginPath();
  ctx.arc(o.x,o.y,o.radius,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle=o.hp>0?"rgba(245,223,151,.85)":"rgba(120,90,80,.55)";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.arc(o.x,o.y,o.radius+6,0,Math.PI*2);
  ctx.stroke();
}

function drawThreat(threat){
  if(threat.hp<=0){
    ctx.strokeStyle="rgba(210,115,95,.35)";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(threat.x-10,threat.y-10);
    ctx.lineTo(threat.x+10,threat.y+10);
    ctx.moveTo(threat.x+10,threat.y-10);
    ctx.lineTo(threat.x-10,threat.y+10);
    ctx.stroke();
    return;
  }

  ctx.fillStyle="#dc8b6f";
  ctx.beginPath();
  ctx.arc(threat.x,threat.y,threat.spec.radius,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle="#0b1114";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(threat.x,threat.y);
  ctx.lineTo(
    threat.x+Math.cos(threat.facing)*(threat.spec.radius+8),
    threat.y+Math.sin(threat.facing)*(threat.spec.radius+8)
  );
  ctx.stroke();

  if(threat.state==="windup"){
    ctx.strokeStyle="rgba(255,205,120,.95)";
    ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(threat.x,threat.y,threat.spec.radius+8,0,Math.PI*2);ctx.stroke();
  }else if(threat.state==="lunge"){
    ctx.strokeStyle="rgba(255,95,75,.95)";
    ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(threat.x,threat.y,threat.spec.radius+10,0,Math.PI*2);ctx.stroke();
  }else if(threat.state==="recover"){
    ctx.strokeStyle="rgba(175,188,194,.38)";
    ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(threat.x,threat.y,threat.spec.radius+6,0,Math.PI*2);ctx.stroke();
  }
}

function drawPlayer(){
  const p=state.player;
  ctx.fillStyle="#8fc5ff";
  ctx.beginPath();
  ctx.arc(p.x,p.y,p.spec.radius,0,Math.PI*2);
  ctx.fill();

  if(p.braced){
    ctx.strokeStyle="rgba(245,217,145,.75)";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.spec.radius+7,p.facing-.72,p.facing+.72);
    ctx.stroke();
  }

  const shield=shieldSegment(p);
  ctx.strokeStyle=p.braced?"#f1dfac":"#d8e7ee";
  ctx.lineWidth=p.braced?9:7;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(shield.ax,shield.ay);
  ctx.lineTo(shield.bx,shield.by);
  ctx.stroke();

  const progress=attackProgress(p);
  const weaponLength=p.spec.radius+22+(progress??.25)*O1_ATTACK.reach*.55;
  ctx.strokeStyle=progress===1?"#ffffff":"#b9d8ee";
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.moveTo(
    p.x+Math.cos(p.facing)*p.spec.radius*.55,
    p.y+Math.sin(p.facing)*p.spec.radius*.55
  );
  ctx.lineTo(
    p.x+Math.cos(p.facing)*weaponLength,
    p.y+Math.sin(p.facing)*weaponLength
  );
  ctx.stroke();

  ctx.strokeStyle="#0b1114";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(p.x,p.y);
  ctx.lineTo(
    p.x+Math.cos(p.facing)*(p.spec.radius+7),
    p.y+Math.sin(p.facing)*(p.spec.radius+7)
  );
  ctx.stroke();
}

function drawFx(){
  for(const f of fx){
    const alpha=Math.max(0,f.life/.34);
    ctx.strokeStyle=
      f.type==="body-hit"?`rgba(255,90,75,${alpha})`:
      f.type==="objective-hit"?`rgba(255,70,60,${alpha})`:
      f.type==="player-strike"?`rgba(170,220,255,${alpha})`:
      `rgba(245,225,165,${alpha})`;
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(f.x,f.y,8+(1-alpha)*14,0,Math.PI*2);
    ctx.stroke();
  }
}

function draw(){
  ctx.fillStyle="#111719";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#3a4448";
  ctx.lineWidth=2;
  ctx.strokeRect(
    BROKEN_YARD.inset,
    BROKEN_YARD.inset,
    BROKEN_YARD.width-BROKEN_YARD.inset*2,
    BROKEN_YARD.height-BROKEN_YARD.inset*2
  );
  for(const wall of BROKEN_YARD.walls) drawWall(wall);

  ctx.fillStyle="rgba(255,255,255,.05)";
  ctx.font="700 12px system-ui";
  ctx.fillText("BROKEN YARD · W2 INTERNAL ORGANISM",42,54);

  drawObjective();
  for(const threat of state.threats) drawThreat(threat);
  drawPlayer();
  drawFx();

  if(state.result!=="active"){
    ctx.fillStyle="rgba(5,8,9,.42)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign="center";
    ctx.fillStyle="#f0f4f5";
    ctx.font="800 34px system-ui";
    const label=state.result==="clear"?"CLEAR":state.result==="breach"?"BREACH":"DOWN";
    ctx.fillText(label,canvas.width/2,canvas.height/2);
    ctx.font="500 15px system-ui";
    ctx.fillText("R to reset",canvas.width/2,canvas.height/2+30);
    ctx.textAlign="left";
  }

  statusEl.textContent=
    `W2 internal · HP ${state.player.hp}/${state.player.maxHp} · stake ${state.objective.hp>0?"intact":"lost"}`;
  detailEl.textContent=
    `${state.player.braced?"BRACED":"free"} · threats ${state.threats.filter(t=>t.hp>0).length} · ${state.result}`;
}

function frame(now){
  accumulator+=Math.min(.05,Math.max(0,(now-last)/1000));
  last=now;
  while(accumulator>=DT){step(DT);accumulator-=DT;}
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown",e=>{
  keys.add(e.code);
  if(e.code==="KeyR") reset();
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
canvas.addEventListener("pointermove",e=>{
  const rect=canvas.getBoundingClientRect();
  mouse.x=(e.clientX-rect.left)*canvas.width/rect.width;
  mouse.y=(e.clientY-rect.top)*canvas.height/rect.height;
});
canvas.addEventListener("pointerdown",e=>{
  if(e.button===0 && state.result==="active") attackQueued=true;
});
canvas.addEventListener("contextmenu",e=>e.preventDefault());

const params=new URLSearchParams(location.search);
if(params.get("probe")==="stake"){
  document.querySelector("#probe").textContent=JSON.stringify({
    braced:runO1StakePolicy(true),
    unbraced:runO1StakePolicy(false)
  });
}

reset();
requestAnimationFrame(frame);
