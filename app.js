import { OrganismField, FIELD } from "./src/organism-field.js";
import { MORPHS, DT, clamp } from "./src/organism-law.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#scene"), ctx = canvas.getContext("2d");
const keys = new Set();
const camera = { x: FIELD.width / 2, y: FIELD.height / 2, zoom: 1.0 };
let field, paused = false, manual = true, mouse = { x: 17, y: 11 };
let last = performance.now(), debt = 0, pan = null, drawWall = null, targetId = null;
let issuedSteps = 0;
function announce(message) { $("#interaction-status").textContent = message; }
function worldScale() {
  return Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height) * camera.zoom;
}
function worldPoint(e) {
  const b = canvas.getBoundingClientRect(), sx = canvas.width / b.width,
    sy = canvas.height / b.height, scale = worldScale();
  return { x: camera.x + ((e.clientX - b.left) * sx - canvas.width / 2) / scale,
    y: camera.y + ((e.clientY - b.top) * sy - canvas.height / 2) / scale };
}
function fit() {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.floor(canvas.clientWidth * ratio)),
    h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
}
function physicalBox(x, y, halfX, halfY, angle, color, stroke = "#1d2933") {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = color;
  ctx.fillRect(-halfX, -halfY, halfX * 2, halfY * 2);
  ctx.strokeStyle = stroke; ctx.lineWidth = 0.055;
  ctx.strokeRect(-halfX, -halfY, halfX * 2, halfY * 2); ctx.restore();
}
function circle(x, y, radius, color) {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = "#182532";
  ctx.lineWidth = 0.045; ctx.stroke();
}
function drawWorld() {
  fit();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#1a2834"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const s = worldScale();
  ctx.setTransform(s, 0, 0, s, canvas.width / 2 - camera.x * s,
    canvas.height / 2 - camera.y * s);
  ctx.fillStyle = "#273640"; ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = "#415c6b"; ctx.globalAlpha = 0.6;
  ctx.fillRect(13, 9.3, 9, 5.1); ctx.globalAlpha = 1;
  ctx.strokeStyle = "#344751"; ctx.lineWidth = 0.02;
  for (let x = 0; x < FIELD.width; x++) {
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,FIELD.height);ctx.stroke();
  }
  for (let y = 0; y < FIELD.height; y++) {
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(FIELD.width,y);ctx.stroke();
  }
  for (const wall of field.walls) {
    physicalBox(wall.x, wall.y, wall.hx, wall.hy, 0, "#607380");
  }
  for (const box of field.matter) {
    const p = box.body.translation();
    physicalBox(p.x, p.y, box.hx, box.hy, box.body.rotation(), "#b3a077",
      targetId === box.id ? "#ffdfa0" : "#665e49");
  }
  for (const actor of field.actors) {
    const selected = actor.id === field.activeActor;
    if (actor.tail) {
      const a = actor.root.translation(), b = actor.tail.translation();
      ctx.strokeStyle = "#ddc69f";ctx.lineWidth = 0.12;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    for (const part of actor.parts) {
      const b = part.body, p = b.translation(), a = b.rotation();
      const dx = part.x * Math.cos(a) - part.y * Math.sin(a);
      const dy = part.x * Math.sin(a) + part.y * Math.cos(a);
      const shape = part.shape;
      if (shape.type === "box") physicalBox(p.x + dx, p.y + dy,
        shape.hx, shape.hy, a, actor.spec.color);
      else circle(p.x + dx, p.y + dy, shape.r, actor.spec.color);
    }
    const p = actor.root.translation(), a = actor.root.rotation();
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    ctx.lineTo(p.x + Math.cos(a) * 0.9, p.y + Math.sin(a) * 0.9);
    ctx.lineWidth = 0.095;ctx.strokeStyle = selected ? "#ffe2a0" : "#e7ecdf";
    ctx.stroke();
    if (selected) {
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.9, actor.spec.width * .8),
        0, Math.PI*2);ctx.strokeStyle="#ffe2a0";
      ctx.lineWidth=0.045;ctx.stroke();
    }
    if ($("#contacts").checked && actor.contactCount) {
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,actor.spec.width),0,Math.PI*2);
      ctx.strokeStyle="#f07667";ctx.lineWidth=.055;ctx.stroke();
    }
  }
  if (drawWall) {
    const a=drawWall, b=mouse;
    ctx.setLineDash([0.15,0.15]);ctx.strokeStyle="#ffe0a5";ctx.lineWidth=0.09;
    ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),
      Math.abs(a.x-b.x),Math.abs(a.y-b.y));ctx.setLineDash([]);
  }
  ctx.beginPath();ctx.arc(mouse.x,mouse.y,0.15,0,Math.PI*2);
  ctx.strokeStyle="#ffdeb1";ctx.lineWidth=0.04;ctx.stroke();
}
function updateStatus() {
  const snap=field.snapshot(), active=field.actor(field.activeActor);
  $("#run-summary").textContent = (paused ? "PAUSED" : "LIVE") +
    " · " + snap.tick + " ticks · " + snap.count + " organisms · " +
    snap.matterCount + " movable bodies · " + snap.physicsMs.toFixed(2) + " ms/step";
  const selected=active && snap.actors.find(a=>a.id===active.id);
  $("#selected").textContent = selected ?
    [
      active.spec.name + "  [" + selected.id + "]",
      "mass " + active.spec.mass + " kg · physical parts " + active.parts.length,
      "speed " + active.spec.speed + " m/s · turning " + active.spec.turnRate + " rad/s",
      "position (" + selected.pos.x.toFixed(2) + ", " + selected.pos.y.toFixed(2) + ")",
      "realized " + selected.speed.toFixed(2) + " m/s · contacts " + selected.contacts,
      "traction " + selected.traction.toFixed(2) + " · mode " + selected.mode,
      "local recovery events " + selected.recoveries,
      "intent→impulse " + JSON.stringify(active.control.motorImpulse || {})
    ].join("\n") : "No organism selected.";
  $("#evidence").textContent = "Live solver-active contacts: " + snap.activeContacts +
    ". Physical joints: " + field.actors.filter(a=>Boolean(a.joint)).length +
    ". Simulation backlog: " + debt.toFixed(3) + "s." +
    " No organism/product qualification asserted.";
  $("#pause").textContent=paused?"Resume":"Pause";
  $("#step").disabled=!paused;
}
function input() {
  const x=(keys.has("d")||keys.has("arrowright")?1:0)-
    (keys.has("a")||keys.has("arrowleft")?1:0);
  const y=(keys.has("s")||keys.has("arrowdown")?1:0)-
    (keys.has("w")||keys.has("arrowup")?1:0);
  const l=Math.hypot(x,y)||1;return {x:x/l,y:y/l};
}
function tick() {field.step(manual?input():null);issuedSteps++;}
function loop(now) {
  const elapsed = Math.min(.12,(now-last)/1000);last=now;
  if(!paused) {
    debt+=elapsed;
    let steps=0;
    while(debt>=DT && steps<8){tick();debt-=DT;steps++;}
    // Backpressure remains visible, rather than pretending all simulated time ran.
    if(debt>1) debt=1;
  }
  drawWorld();updateStatus();
  requestAnimationFrame(loop);
}
function guarded(fn) {
  try {fn();} catch(e){announce("Rejected: "+String(e.message||e));}
}
function cursorBox() {
  const mass=Number($("#mass").value);
  field.addBox({x:mouse.x,y:mouse.y,hx:.50,hy:.38,mass});
  announce("Physical movable matter added; state continues.");
}
function selectAt(i){
  const a=field.actors[i];if(a){field.select(a.id);targetId=a.id;
    announce("Selected "+a.spec.name+"; others retain private local behavior.");}
}
function writePressureResult(status,message) {
  document.body.dataset.pressureProbe=status;
  document.body.dataset.pressureDetail=message;
}
async function pressureProbe() {
  try {
    const assert=(ok,message)=>{if(!ok)throw Error(message);};
    assert(field.actors.length===3,"missing three real organism bodies");
    assert(field.actors.find(a=>a.kind==="crawler")?.joint,
      "crawler is not physically articulated");
    assert(new Set(field.actors.map(a=>a.kind)).size===3,"morphology missing");
    for(let i=0;i<220;i++)field.step(null);
    for(const a of field.actors){
      const p=a.root.translation();
      assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&
        Number.isFinite(a.root.angvel()),"unstable organism");
    }
    const candidate=field.addBox({x:5,y:17,hx:.45,hy:.4,mass:22},false);
    const start={...candidate.body.translation()};
    field.kick(candidate.id,{x:start.x+0.3,y:start.y+0.2},45);
    for(let i=0;i<50;i++)field.step(null);
    const p=candidate.body.translation();
    assert(Math.hypot(p.x-start.x,p.y-start.y)>0.2,
      "physical impulse failed to move matter");
    assert(field.tractionAt({x:15,y:11})<field.tractionAt({x:5,y:11}),
      "ground proxy not spatially material");
    field.addWall({x:3,y:3,hx:.5,hy:.1});
    const authored=field.authored.length;
    field.reset();
    assert(field.authored.length===authored &&
      field.walls.length>=10,"authored world reset failed");
    for(let i=0;i<130;i++)field.step(null);
    for(const a of field.actors) {
      const p=a.root.translation();assert(Number.isFinite(p.x+p.y),
        "post-reset actor numerical failure");
    }
    writePressureResult("pass","3 morphologies, physical hinge, finite matter response, authored reset, 400 steps");
  } catch(e) {
    writePressureResult("fail",String(e?.message??e).slice(0,250));
    throw e;
  }
}
async function start() {
  field=await OrganismField.create();
  targetId=field.activeActor;
  document.body.dataset.labReady="true";
  window.combatOrganismField=field; // internal experiment readback, not private NPC data
  $("#pause").onclick=()=>{paused=!paused;debt=0;};
  $("#step").onclick=()=>{if(paused)tick();};
  $("#reset").onclick=()=>{field.reset();targetId=field.activeActor;announce("Starting scene rebuilt.");};
  $("#manual").onchange=e=>{manual=e.target.checked;};
  $("#kick").onclick=()=>guarded(()=>{
    const id=targetId||field.activeActor;
    if(!field.kick(id,mouse,Number($("#impulse").value)))
      throw Error("Select a dynamic body or object.");
    announce("Finite off-centre impulse applied to "+id);
  });
  $("#add-box").onclick=()=>guarded(cursorBox);
  $("#spawn").onclick=()=>guarded(()=>{
    const actor=field.spawn($("#kind").value,{...mouse});
    field.select(actor.id);targetId=actor.id;
    announce("New physical "+actor.spec.name+" created.");
  });
  $("#remove").onclick=()=>guarded(()=>{
    if(!field.remove(field.activeActor))throw Error("Nothing selected.");
    targetId=field.activeActor;announce("Organism removed; other matter persists.");
  });
  $("#undo").onclick=()=>guarded(()=>{
    if(!field.authored.length)throw Error("No authored edit.");
    field.authored.pop();field.reset();targetId=field.activeActor;
    announce("One authored edit removed; experiment reset.");
  });
  $("#clear").onclick=()=>{field.clearEdits();targetId=field.activeActor;announce("Authored edits cleared; scene reset.");};
  document.querySelectorAll("[data-pick]").forEach(button=>{
    button.onclick=()=>selectAt(Number(button.dataset.pick));
  });
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  canvas.addEventListener("wheel",e=>{
    e.preventDefault();camera.zoom=clamp(camera.zoom*Math.exp(-e.deltaY*.0015),.55,6);
  },{passive:false});
  canvas.addEventListener("pointerdown",e=>{
    mouse=worldPoint(e);canvas.setPointerCapture(e.pointerId);
    if(e.button===1){pan={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};e.preventDefault();}
    else if(e.shiftKey){drawWall={...mouse};}
    else if(e.altKey){guarded(cursorBox);}
    else {
      const id=field.pick(mouse);if(id){
        if(field.actor(id))field.select(id);
        targetId=id;announce("Selected physical "+id);
      }
    }
  });
  canvas.addEventListener("pointermove",e=>{
    if(pan){
      const rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width,
        sy=canvas.height/rect.height,scale=worldScale();
      camera.x=pan.cx-(e.clientX-pan.x)*sx/scale;
      camera.y=pan.cy-(e.clientY-pan.y)*sy/scale;
    }
    mouse=worldPoint(e);
  });
  canvas.addEventListener("pointerup",e=>{
    if(drawWall){
      const a=drawWall,b=worldPoint(e);drawWall=null;
      guarded(()=>{
        field.addWall({x:(a.x+b.x)/2,y:(a.y+b.y)/2,
          hx:Math.abs(a.x-b.x)/2,hy:Math.abs(a.y-b.y)/2});
        announce("Authored physical wall added to live world.");
      });
    }
    pan=null;
  });
  document.addEventListener("keydown",e=>{
    const key=e.key.toLowerCase();
    if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(key))
      e.preventDefault();
    if(key==="1"||key==="2"||key==="3")selectAt(Number(key)-1);
    if(key===" "&&!e.repeat){paused=!paused;debt=0;}
    if(key==="."&&paused&&!e.repeat)tick();
    keys.add(key);
  });
  document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  if(new URLSearchParams(location.search).has("pressureProbe")){
    paused=true;
    await pressureProbe();
  }
  requestAnimationFrame(loop);
}
start().catch(error=>{
  document.body.dataset.labError=String(error?.message??error).slice(0,400);
  $("#run-summary").textContent="Runtime failed: "+document.body.dataset.labError;
});
