import { createActor, driveActor, faceToward } from "./src/actors.js";
import { BROKEN_YARD, PLAYER_SPEC, PRESSURE_SPEC } from "./src/yard.js";
import { updatePressure } from "./src/pressure.js";
import { resolveActorWorld, resolvePairs, stepActorWorld } from "./src/world.js";
import { runNeutralRehearsal } from "./src/rehearsal.js";
import { normalize } from "./src/math.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const detailEl = document.querySelector("#detail");

const DT = 1 / 120;
const keys = new Set();
const mouse = { x: 450, y: 300 };
let accumulator = 0;
let last = performance.now();
let player;
let threats;
let events = [];

function reset() {
  player = createActor(PLAYER_SPEC, { id:"player", kind:"player", x:450, y:535, facing:-Math.PI/2 });
  threats = [
    createActor(PRESSURE_SPEC, { id:"pressure-a", kind:"pressure", x:315, y:92, facing:Math.PI/2 }),
    createActor(PRESSURE_SPEC, { id:"pressure-b", kind:"pressure", x:585, y:92, facing:Math.PI/2 })
  ];
  events = [];
}

function input() {
  let x=0, y=0;
  if(keys.has("KeyA")) x--;
  if(keys.has("KeyD")) x++;
  if(keys.has("KeyW")) y--;
  if(keys.has("KeyS")) y++;
  return normalize(x,y,0,0);
}

function step(dt) {
  const move=input();
  faceToward(player, mouse.x, mouse.y, dt);
  driveActor(player, move.x, move.y, dt);
  stepActorWorld(player, BROKEN_YARD, dt);

  for(const threat of threats) {
    const emitted=updatePressure(threat, player, BROKEN_YARD, dt, threats);
    for(const e of emitted) events.push({...e,life:.45});
  }

  resolvePairs([player,...threats]);
  for(const actor of [player,...threats]) resolveActorWorld(actor,BROKEN_YARD);

  for(const e of events) e.life-=dt;
  events=events.filter(e=>e.life>0);
}

function drawWall(w) {
  ctx.fillStyle="#30383a";
  ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.strokeStyle="#566064";
  ctx.strokeRect(w.x+.5,w.y+.5,w.w-1,w.h-1);
}

function drawActor(actor) {
  ctx.save();
  ctx.translate(actor.x,actor.y);
  const isPlayer=actor.kind==="player";
  ctx.fillStyle=isPlayer?"#8fc5ff":"#dc8b6f";
  ctx.beginPath();
  ctx.arc(0,0,actor.spec.radius,0,Math.PI*2);
  ctx.fill();

  ctx.rotate(actor.facing);
  ctx.strokeStyle="#0b1114";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(actor.spec.radius+8,0);
  ctx.stroke();
  ctx.restore();

  if(actor.kind==="pressure") {
    if(actor.state==="windup") {
      ctx.strokeStyle="rgba(255,205,120,.9)";
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(actor.x,actor.y,actor.spec.radius+8,0,Math.PI*2); ctx.stroke();
    } else if(actor.state==="lunge") {
      ctx.strokeStyle="rgba(255,100,80,.95)";
      ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(actor.x,actor.y,actor.spec.radius+9,0,Math.PI*2); ctx.stroke();
    } else if(actor.state==="recover") {
      ctx.strokeStyle="rgba(170,180,185,.35)";
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(actor.x,actor.y,actor.spec.radius+6,0,Math.PI*2); ctx.stroke();
    }
  }
}

function draw() {
  ctx.fillStyle="#111719";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#3a4448";
  ctx.lineWidth=2;
  ctx.strokeRect(BROKEN_YARD.inset,BROKEN_YARD.inset,BROKEN_YARD.width-BROKEN_YARD.inset*2,BROKEN_YARD.height-BROKEN_YARD.inset*2);
  for(const wall of BROKEN_YARD.walls) drawWall(wall);

  ctx.fillStyle="rgba(255,255,255,.05)";
  ctx.font="700 12px system-ui";
  ctx.fillText("BROKEN YARD · W1 NEUTRAL PRESSURE",42,54);

  for(const threat of threats) drawActor(threat);
  drawActor(player);

  statusEl.textContent="W1 · neutral situation rehearsal · player combat intentionally absent";
  detailEl.textContent=threats.map(t=>`${t.id}: ${t.state}`).join(" · ");
}

function frame(now) {
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
  const r=canvas.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)*canvas.width/r.width;
  mouse.y=(e.clientY-r.top)*canvas.height/r.height;
});

const params=new URLSearchParams(location.search);
if(params.get("probe")==="rehearsal"){
  document.querySelector("#probe").textContent=JSON.stringify(runNeutralRehearsal());
}

reset();
requestAnimationFrame(frame);
