import { OrganismField, FIELD } from "./src/organism-field.js";
import { MORPHS, DT, clamp } from "./src/organism-law.js";
import { PLAYGROUNDS, PLAYGROUND_IDS, playgroundRecipe } from "./src/playgrounds.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#scene"), ctx = canvas.getContext("2d");
const keys = new Set();
const camera = { x: FIELD.width / 2, y: FIELD.height / 2, zoom: 1.0 };
let field, paused = false, manual = true, mouse = { x: 17, y: 11 };
let last = performance.now(), debt = 0, pan = null, drawWall = null, dragPose = null, targetId = null;
let issuedSteps = 0;
let currentSituation = null;
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
function arrow(p, direction, color) {
  const size=Math.hypot(direction?.x||0,direction?.y||0);
  if(size<.04)return;
  const span=Math.min(2.4,size*.43);
  const dx=direction.x/size*span,dy=direction.y/size*span;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=.07;
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+dx,p.y+dy);ctx.stroke();
  const a=Math.atan2(dy,dx);
  ctx.beginPath();ctx.moveTo(p.x+dx,p.y+dy);
  ctx.lineTo(p.x+dx-Math.cos(a-.48)*.22,p.y+dy-Math.sin(a-.48)*.22);
  ctx.lineTo(p.x+dx-Math.cos(a+.48)*.22,p.y+dy-Math.sin(a+.48)*.22);
  ctx.closePath();ctx.fill();
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
    physicalBox(p.x, p.y, box.hx, box.hy, box.body.rotation(),
      box.kind==="gate" ? "#d7aa5d" : "#b3a077",
      targetId === box.id ? "#ffdfa0" : "#665e49");
    if(box.kind==="gate")circle(box.pivotPoint.x,box.pivotPoint.y,.20,"#e6ead7");
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
      arrow(p, actor.control.intended, "#6ad7ff");
      arrow(p, actor.root.linvel(), "#ffd187");
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.9, actor.spec.width * .8),
        0, Math.PI*2);ctx.strokeStyle="#ffe2a0";
      ctx.lineWidth=0.045;ctx.stroke();
    }
    if ($("#contacts").checked && actor.contactCount) {
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,actor.spec.width),0,Math.PI*2);
      ctx.strokeStyle="#f07667";ctx.lineWidth=.055;ctx.stroke();
    }
  }
  if (field.grip) {
    const g=field.grip, body=field.actor(g.actorId)?.root, a=body?.translation();
    if(a){
      const b=g.worldAnchor||g.target, target=g.clampedTarget||g.target;
      ctx.strokeStyle="#f5d68b";ctx.lineWidth=.075;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.setLineDash([.12,.10]);ctx.beginPath();ctx.moveTo(b.x,b.y);
      ctx.lineTo(target.x,target.y);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(b.x,b.y,.17,0,2*Math.PI);ctx.stroke();
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
      "physical COM (" + selected.pos.x.toFixed(2) + ", " + selected.pos.y.toFixed(2) + ")",
      "realized " + selected.speed.toFixed(2) + " m/s · contacts " + selected.contacts,
      "front traction " + selected.traction.toFixed(2) +
        (active.kind==="crawler" ?
          " · rear traction "+(active.control.rearTraction??field.tractionAt(active.tail.translation())).toFixed(2)+
          " · rear drive "+active.spec.rearDrive.toFixed(2) :
          active.kind==="worm" ?
            " · support force "+active.spec.supportForce.toFixed(0)+" N" : "")+
        " · mode " + selected.mode+
        (active.control.bracing ? " · brace " +
          ((active.control.braceImpulse??0)/DT).toFixed(1)+" N" : ""),
      "local response " + selected.mode + " · yield " +
        active.spec.contactYield.toFixed(2) + " · front contact " +
        selected.frontContact.toFixed(2) + " · side " +
        selected.sideContact.toFixed(2),
      "contact impulse " + selected.contactImpulse.toFixed(2) +
        " N·s · recovery events " + selected.recoveries,
      active.kind==="worm" ?
        "internal stroke J=" + (active.controlStroke?.stroke??0).toFixed(3) +
        " · actual ground support J=" + (active.controlStroke?.support??0).toFixed(3) +
        " · phase=" + (active.controlStroke?.phase??"idle") :
        "intent→impulse " + JSON.stringify(active.control.motorImpulse || {})
    ].join("\n") : "No organism selected.";
  $("#evidence").textContent = "Live solver-active contacts: " + snap.activeContacts +
    ". Physical joints: " + field.actors.filter(a=>Boolean(a.joint)).length +
    ". Simulation backlog: " + debt.toFixed(3) + "s." +
    " No organism/product qualification asserted.";
  $("#grip-state").textContent = snap.grip ?
    "Physical grip: "+snap.grip.objectId+" · actual force "+snap.grip.force.toFixed(1)+" N" :
    "No grip. Right-hold on a nearby movable object.";
  $("#pause").textContent=paused?"Resume":"Pause";
  $("#step").disabled=!paused;
}
function input() {
  const x=(keys.has("d")||keys.has("arrowright")?1:0)-
    (keys.has("a")||keys.has("arrowleft")?1:0);
  const y=(keys.has("s")||keys.has("arrowdown")?1:0)-
    (keys.has("w")||keys.has("arrowup")?1:0);
  const l=Math.hypot(x,y)||1;return {x:x/l,y:y/l,brace:keys.has("b")};
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
const bodyInputs = {
  mass: "#body-mass", speed: "#body-speed", acceleration: "#body-accel",
  gripReach: "#body-reach", gripForce: "#body-gripforce",
  contactYield: "#body-yield", braceForce:"#body-brace",
  braking: "#body-brake", turnRate: "#body-turnrate", turnTorque: "#body-torque"
};
function syncBodyForm(){
  const a=field?.actor(field.activeActor);
  if(!a)return;
  $("#shape-length").value=String(a.shapeScale.length);
  $("#shape-width").value=String(a.shapeScale.width);
  $("#body-rear-drive").value=String(a.spec.rearDrive??0);
  $("#body-rear-drive").disabled=a.kind!=="crawler";
  $("#body-muscle").value=String(a.spec.muscleForce??0);
  $("#body-support").value=String(a.spec.supportForce??0);
  $("#body-muscle").disabled=a.kind!=="worm";
  $("#body-support").disabled=a.kind!=="worm";
  for(const [k,selector] of Object.entries(bodyInputs))
    $(selector).value=String(a.spec[k]);
}
function switchSituation(key){
  if(key!=="yard" && !Object.hasOwn(PLAYGROUNDS,key))
    throw RangeError("unknown material field");
  const selected=PLAYGROUNDS[key]||null;
  const recipe=selected?playgroundRecipe(key):null;
  // Explicit authoring action: replace the starting scene, not magically
  // transfer material afterstate between incompatible worlds.
  field.releaseGrip();
  if(recipe)field.importScene(recipe);
  else{
    field.sceneRecipe=null;
    field.authored=[];
    field.reset();
  }
  keys.clear();dragPose=null;drawWall=null;pan=null;
  targetId=field.activeActor;
  syncBodyForm();
  paused=false;debt=0;last=performance.now();
  currentSituation=key;
  document.querySelectorAll("[data-situation]").forEach(button=>{
    button.classList.toggle("active",button.dataset.situation===key);
  });
  $("#situation-caption").textContent=selected?.caption||
    "Original open material yard. No task; rebuild anything.";
  announce("New physical starting arrangement: "+(selected?.label||"Original yard")+
    ". Everything now moves by the same shared world physics; intervene freely.");
}
function selectAt(i){
  const a=field.actors[i];if(a){field.select(a.id);targetId=a.id;syncBodyForm();
    announce("Selected "+a.spec.name+"; others retain private local behavior.");}
}
async function start() {
  field=await OrganismField.create();
  targetId=field.activeActor;
  syncBodyForm();
  document.body.dataset.labReady="true";
  window.combatOrganismField=field; // internal experiment readback, not private NPC data
  $("#pause").onclick=()=>{paused=!paused;debt=0;};
  $("#step").onclick=()=>{if(paused)tick();};
  $("#reset").onclick=()=>{field.releaseGrip();field.reset();targetId=field.activeActor;syncBodyForm();announce("Starting scene rebuilt.");};
  document.querySelectorAll("[data-situation]").forEach(button=>{
    button.onclick=()=>guarded(()=>switchSituation(button.dataset.situation));
  });
  $("#manual").onchange=e=>{manual=e.target.checked;};
  $("#apply-shape").onclick=()=>guarded(()=>{
    field.resizeMorphology(field.activeActor,{
      length:Number($("#shape-length").value),
      width:Number($("#shape-width").value)
    });
    syncBodyForm();
    announce("Actual physical collider envelope updated; shared world remains live.");
  });
  $("#apply-body").onclick=()=>guarded(()=>{
    const changes={};
    for(const [k,selector] of Object.entries(bodyInputs))
      changes[k]=Number($(selector).value);
    if(field.actor(field.activeActor)?.kind==="crawler")
      changes.rearDrive=Number($("#body-rear-drive").value);
    if(field.actor(field.activeActor)?.kind==="worm"){
      changes.muscleForce=Number($("#body-muscle").value);
      changes.supportForce=Number($("#body-support").value);
    }
    field.setActorProfile(field.activeActor,changes);
    announce("Actual collider mass and finite movement authority updated.");
    syncBodyForm();
  });
  $("#kick").onclick=()=>guarded(()=>{
    const id=targetId||field.activeActor;
    if(!field.kick(id,mouse,Number($("#impulse").value),$("#impulse-mode").value))
      throw Error("Select a dynamic body or object.");
    announce("Finite off-centre impulse applied to "+id);
  });
  $("#add-box").onclick=()=>guarded(cursorBox);
  $("#add-gate").onclick=()=>guarded(()=>{
    const gate=field.addGate({x:mouse.x,y:mouse.y,length:3.1,mass:Number($("#mass").value)});
    targetId=gate.id;announce("Real hinged gate added: its pivot is fixed, its arm reacts physically.");
  });
  $("#spawn").onclick=()=>guarded(()=>{
    const kind=$("#kind").value==="mixed"?"dart":$("#kind").value;
    const actor=field.spawn(kind,{...mouse});
    field.select(actor.id);targetId=actor.id;syncBodyForm();
    announce("New physical "+actor.spec.name+" created.");
  });
  $("#spawn-batch").onclick=()=>guarded(()=>{
    const count=Number($("#spawn-count").value);
    if(!Number.isInteger(count)||count<1||count>500)
      throw RangeError("Batch count must be 1–500 for one click; existing total is unrestricted.");
    const kind=$("#kind").value;
    const kinds=["dart","crawler","broad","worm"];
    const center={...mouse};
    let selected=null;
    for(let i=0;i<count;i++){
      const angle=i*2.399963229728653;
      const radial=.72*Math.sqrt(i);
      const x=center.x+radial*Math.cos(angle);
      const y=center.y+radial*Math.sin(angle);
      const k=kind==="mixed"?kinds[i%4]:kind;
      const actor=field.spawn(k,{x,y},angle%(Math.PI*2));
      if(!selected)selected=actor.id;
    }
    field.select(selected);targetId=selected;syncBodyForm();
    announce("Added "+count+" physically distinct bodies. All continue in shared solver.");
  });
  $("#remove").onclick=()=>guarded(()=>{
    if(!field.remove(field.activeActor))throw Error("Nothing selected.");
    targetId=field.activeActor;syncBodyForm();announce("Organism removed; other matter persists.");
  });
  $("#undo").onclick=()=>guarded(()=>{
    if(!field.authored.length)throw Error("No authored edit.");
    if(!field.undoLastAuthored())throw Error("No authored edit.");
    announce("Last authored object removed without resetting physical afterstate.");
  });
  $("#clear").onclick=()=>{const n=field.clearEdits();announce(n+" authored edits cleared; remaining world continues.");};
  $("#save-scene").onclick=()=>guarded(()=>{
    const recipe=field.exportScene();
    const file=new Blob([JSON.stringify(recipe,null,2)+"\n"],
      {type:"application/json"});
    const link=document.createElement("a");
    const href=URL.createObjectURL(file);
    link.href=href;
    link.download="combat-field-initial-scene-v1.json";
    document.body.appendChild(link);link.click();link.remove();
    // Browser object URLs are short-lived by design; the user's file owns
    // the durable recipe, not a hidden in-memory or local-storage sidecar.
    setTimeout(()=>URL.revokeObjectURL(href),15000);
    announce("Captured current posed arrangement as portable starting scene.");
  });
  $("#load-scene").onclick=()=>$("#scene-file").click();
  $("#scene-file").onchange=async e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    try{
      if(file.size>3_000_000)throw Error("scene JSON exceeds 3MB safety limit");
      const parsed=JSON.parse(await file.text());
      field.importScene(parsed);
      currentSituation=null;
      document.querySelectorAll("[data-situation]").forEach(button=>
        button.classList.remove("active"));
      $("#situation-caption").textContent="Your imported physical starting scene";
      paused=true;debt=0;targetId=field.activeActor;syncBodyForm();
      announce("Loaded validated starting arrangement; simulation paused.");
    }catch(err){
      announce("Scene rejected: "+String(err.message||err));
    }finally{e.target.value="";}
  };
  document.querySelectorAll("[data-pick]").forEach(button=>{
    button.onclick=()=>selectAt(Number(button.dataset.pick));
  });
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  canvas.addEventListener("wheel",e=>{
    e.preventDefault();camera.zoom=clamp(camera.zoom*Math.exp(-e.deltaY*.0015),.55,6);
  },{passive:false});
  canvas.addEventListener("pointerdown",e=>{
    mouse=worldPoint(e);canvas.setPointerCapture(e.pointerId);
    if(e.button===2){
      if(!field.beginGrip(mouse))announce("No movable matter in range. Select an organism, then right-hold on a crate.");
      else announce("Finite reciprocal grip engaged — drag cursor, then release.");
      e.preventDefault();
    }
    else if(e.button===0 && e.ctrlKey){
      if(!paused){
        announce("Pause the simulation before using Ctrl+drag to reposition real bodies.");
      }else{
        const id=field.pick(mouse), obj=field.matter.find(m=>m.id===id);
        if(obj?.kind==="gate"){
          announce("Hinged gate remains pinned: use force or grip to rotate it.");
        }else if(id){
          const a=field.actor(id);
          const b=a?.root||obj?.body;
          const p=b.translation();
          dragPose={id,delta:{x:p.x-mouse.x,y:p.y-mouse.y}};
          targetId=id;
          if(a){field.select(id);syncBodyForm();}
          announce("Editing paused physical pose; only moved body's momentum resets.");
        }else announce("No actual collider under cursor.");
      }
      e.preventDefault();
    }
    else if(e.button===1){pan={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};e.preventDefault();}
    else if(e.shiftKey){drawWall={...mouse};}
    else if(e.altKey){guarded(cursorBox);}
    else {
      const id=field.pick(mouse);if(id){
        if(field.actor(id)){field.select(id);syncBodyForm();}
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
    if(dragPose && paused){
      const id=dragPose.id,p={x:mouse.x+dragPose.delta.x,
        y:mouse.y+dragPose.delta.y};
      guarded(()=>field.reposition(id,p));
    }
    if(field.grip)field.setGripTarget(mouse);
  });
  canvas.addEventListener("pointerup",e=>{
    if(e.button===2)field.releaseGrip();
    if(drawWall){
      const a=drawWall,b=worldPoint(e);drawWall=null;
      guarded(()=>{
        field.addWall({x:(a.x+b.x)/2,y:(a.y+b.y)/2,
          hx:Math.abs(a.x-b.x)/2,hy:Math.abs(a.y-b.y)/2});
        announce("Authored physical wall added to live world.");
      });
    }
    pan=null;dragPose=null;
  });
  canvas.addEventListener("pointercancel",()=>{pan=null;drawWall=null;dragPose=null;field.releaseGrip();});
  document.addEventListener("keydown",e=>{
    if(e.target?.closest?.("input,textarea,select,[contenteditable]"))return;
    const key=e.key.toLowerCase();
    if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(key))
      e.preventDefault();
    if(key==="1"||key==="2"||key==="3"||key==="4")selectAt(Number(key)-1);
    if(key===" "&&!e.repeat){paused=!paused;debt=0;}
    if(key==="."&&paused&&!e.repeat)tick();
    keys.add(key);
  });
  document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  if(new URLSearchParams(location.search).has("uiProbe")){
    paused=true;
    const assert=(ok,message)=>{if(!ok)throw Error(message);};
    for(const [index,actor] of field.actors.entries()){
      selectAt(index);updateStatus();
      assert(field.activeActor===actor.id,"UI selected wrong organism");
      assert($("#selected").textContent.includes(actor.spec.name),
        "selection readout missing "+actor.kind);
      assert($("#body-muscle").disabled===(actor.kind!=="worm"),
        "muscle editor enabled for wrong morphology");
      assert($("#body-rear-drive").disabled===(actor.kind!=="crawler"),
        "rear-drive editor enabled for wrong morphology");
      assert(!$("#selected").textContent.includes("undefined") &&
        !$("#selected").textContent.includes("NaN"),
        "UI fabricated unavailable somatic parameters");
    }
    field.select(field.actors[2].id);
    syncBodyForm();
    $("#body-yield").value="0.37";
    $("#body-brace").value="1700";
    $("#apply-body").click();
    assert(Math.abs(field.actors[2].spec.contactYield-.37)<.001 &&
      field.actors[2].spec.braceForce===1700,
      "physical/somatic authoring controls did not modify selected body");
    field.step({x:0,y:0,brace:true});
    updateStatus();
    assert(field.actors[2].control.bracing &&
      $("#selected").textContent.includes("brace"),
      "manual brace did not enter live physical readout");
    field.select(field.actors[3].id);
    syncBodyForm();
    for(let t=0;t<90;t++)field.step({x:1,y:0});
    updateStatus();
    assert($("#selected").textContent.includes("internal stroke"),
      "physical worm selected readout does not expose its own actuation");
    // A visible situation must be a real importable material world, not a
    // cosmetic button or a separate scripted AI per scenario.
    for(const key of ["yard",...PLAYGROUND_IDS]){
      const button=document.querySelector('[data-situation="'+key+'"]');
      assert(Boolean(button),"unreachable physical world "+key);
      button.click();
      assert(currentSituation===key && button.classList.contains("active"),
        "situation did not activate in the real UI "+key);
      assert(field.actors.length>=4 && field.matter.length>0,
        "empty physical material world from UI "+key);
      assert($("#situation-caption").textContent.length>10,
        "situation does not explain the observable material question");
      for(let tick=0;tick<25;tick++)field.step(null);
      assert(field.actors.every(a=>{
        const p=a.root.translation();
        return Number.isFinite(p.x+p.y);
      }),"physical world broke immediately "+key);
    }
    document.body.dataset.situationUi="original yard + four physical situations loaded and simulated";
    document.body.dataset.uiProbe="pass";
    document.body.dataset.uiEvidence="4 morphology selections and 90 shared-world worm steps";
  }
  if(new URLSearchParams(location.search).has("pressureProbe")){
    paused=true;
    const { pressureProbe }=await import("./src/browser-pressure-probe.js");
    await pressureProbe(field);
  }
  requestAnimationFrame(loop);
}
start().catch(error=>{
  document.body.dataset.labError=String(error?.message??error).slice(0,400);
  $("#run-summary").textContent="Runtime failed: "+document.body.dataset.labError;
});
