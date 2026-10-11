// Isolated K1 manual workshop. Not the public rehearsal, no scripted victories.
import {KineticField,DT,runK1Counterfactual} from "./src/k1-world.js";
const $=id=>document.getElementById(id);
const canvas=$("world"),ctx=canvas.getContext("2d",{alpha:false});
let field=new KineticField(),paused=false,mode="shoot",drag=null;
let keys=new Set(),last=performance.now(),acc=0,frames=0;
let camera={x:16,y:10,zoom:1},sampleMs=0,sampleN=0;
const V=(x=0,y=0)=>({x,y}),color={
  wall:"#526b78",load:"#c8a47a",witness:"#c0d6da",
  hinged:"#64adbd",rigid:"#ad9ccf",bare:"#a2c39c",
  "hinge-panel":"#68d4d2",projectile:"#ffd68b"};
function screen(){
  const rect=canvas.getBoundingClientRect();
  const w=Math.max(1,Math.round(rect.width*devicePixelRatio)),
    h=Math.max(1,Math.round(rect.height*devicePixelRatio));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  return {w,h,rect,s:Math.min(w/32,h/20)*camera.zoom};
}
function at(e){
  const d=screen(),dx=(e.clientX-d.rect.left)*d.w/d.rect.width,
    dy=(e.clientY-d.rect.top)*d.h/d.rect.height;
  return V(camera.x+(dx-d.w/2)/d.s,camera.y+(dy-d.h/2)/d.s);
}
function report(s){$("status").textContent=s;}
function render(){
  const {w,h,s}=screen();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle="#10212c";ctx.fillRect(0,0,w,h);
  ctx.setTransform(s,0,0,s,w/2-camera.x*s,h/2-camera.y*s);
  ctx.strokeStyle="#233844";ctx.lineWidth=.023;
  for(let i=-20;i<60;i+=2){
    ctx.beginPath();ctx.moveTo(i,-40);ctx.lineTo(i,60);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-40,i);ctx.lineTo(70,i);ctx.stroke();
  }
  for(const e of field.entities){
    const selected=e===field.guard;
    for(const part of e.parts){
      const p=part.collider.translation(),a=part.collider.rotation(),r=part.shape;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
      ctx.fillStyle=color[e.kind]||"#e6ab99";
      ctx.strokeStyle=selected?"#fff0a0":"#24414d";ctx.lineWidth=.065;
      ctx.beginPath();
      if(r.r){ctx.arc(0,0,r.r,0,Math.PI*2);}
      else{ctx.rect(-r.hx,-r.hy,r.hx*2,r.hy*2);}
      ctx.fill();ctx.stroke();ctx.restore();
    }
    if(e.kind==="hinged"&&e.panel){
      const a=e.body.translation(),b=e.panel.body.translation();
      ctx.strokeStyle="#b5fbde";ctx.lineWidth=.05;ctx.beginPath();
      ctx.moveTo(a.x-.54,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
  }
  if(drag?.kind==="shot"){
    ctx.strokeStyle="#ffc573";ctx.lineWidth=.09;ctx.beginPath();
    ctx.moveTo(drag.start.x,drag.start.y);ctx.lineTo(drag.end.x,drag.end.y);ctx.stroke();
  }
  ctx.setTransform(1,0,0,1,0,0);
  const t=field.trace();
  $("trace").textContent="Kroki: "+t.ticks+
    " · Pociski: "+t.externalShots+" · fizyczny ruch świadka: "+
    t.witnessTravel.toFixed(3)+"m · motor korpusu: "+
    t.driveImpulse.toFixed(1)+" N·s · impuls zawiasu: "+
    t.boundedPanelImpulse.toFixed(1)+" N·m·s · "+field.guard.kind;
  document.body.dataset.k1Runtime="ready";
}
function selectMode(next){
  mode=next;
  document.querySelectorAll(".tools button").forEach(b=>b.classList.toggle("chosen",b.id===next));
  report(next==="shoot"?"Przeciągnij od punktu wystrzału w kierunku strzału.":"Kliknij mapę, aby dodać "+next+".");
}
$("pause").onclick=()=>{
  paused=!paused;acc=0;$("pause").textContent=paused?"Wznów":"Pauza";
  report(paused?"PAUZA: dostępne przesuwanie ciał Ctrl+drag.":"Symulacja.");
  render();
};
$("step").onclick=()=>{if(!paused)paused=true;
  $("pause").textContent="Wznów";field.step();render();};
$("reset").onclick=()=>{field.dispose();field=new KineticField();
  paused=false;$("pause").textContent="Pauza";acc=0;report("Scena przywrócona.");render();};
for(const name of ["shoot","add-hinged","add-rigid","add-bare","add-load","add-witness"]){
  $(name).onclick=()=>selectMode(name);
}
$("release").onclick=()=>selectMode("shoot");
function spawn(point){
  if(field.entities.length>140){report("Wstrzymano dodawanie: bezpieczeństwo solvera.");return;}
  const kind=mode.slice(4);
  if(["hinged","rigid","bare"].includes(kind))field.guard=field.makeGuard(point.x,point.y,kind);
  else if(kind==="load")field.load(point.x,point.y);
  else if(kind==="witness")field.small(point.x,point.y);
  field.world.propagateModifiedBodyPositionsToColliders();
  selectMode("shoot");
}
canvas.oncontextmenu=e=>e.preventDefault();
canvas.addEventListener("wheel",e=>{e.preventDefault();
  camera.zoom=Math.max(.35,Math.min(5,camera.zoom*Math.exp(-e.deltaY*.0013)));render();
},{passive:false});
canvas.addEventListener("pointerdown",e=>{
  const p=at(e);if(e.button===1){drag={kind:"pan",cx:e.clientX,cy:e.clientY};}
  else if(e.button===0){
    if(e.ctrlKey&&paused){const target=field.pick(p);
      if(target)drag={kind:"move",target};
    } else if(mode.startsWith("add-"))spawn(p);
    else if(mode==="shoot")drag={kind:"shot",start:p,end:p};
    else{const pick=field.pick(p);if(pick&&["hinged","rigid","bare"].includes(pick.kind))field.guard=pick;}
  }
  if(drag)canvas.setPointerCapture(e.pointerId);render();
});
canvas.addEventListener("pointermove",e=>{
  if(!drag)return;
  const p=at(e);
  if(drag.kind==="shot")drag.end=p;
  if(drag.kind==="move")field.reposition(drag.target,p);
  if(drag.kind==="pan"){const {s}=screen();
    camera.x-=(e.clientX-drag.cx)*devicePixelRatio/s;
    camera.y-=(e.clientY-drag.cy)*devicePixelRatio/s;
    drag.cx=e.clientX;drag.cy=e.clientY;
  }render();
});
canvas.addEventListener("pointerup",e=>{
  if(!drag)return;
  const d=drag;drag=null;
  if(d.kind==="shot"){
    const end=at(e),distance=Math.hypot(end.x-d.start.x,end.y-d.start.y);
    if(distance<.22){
      const pick=field.pick(d.start);
      if(pick&&["hinged","rigid","bare"].includes(pick.kind)){
        field.guard=pick;report("Wybrano fizyczny organizm: "+pick.kind);
      }else report("Kliknięcie. Przeciągnij, aby wystrzelić.");
    }else{
      const shot=field.shoot(d.start,end,20);
      report(shot?"Wystrzelono materialny pocisk z fizycznym CCD.":"Błędny kierunek.");
    }
  }render();
});
canvas.addEventListener("pointercancel",()=>{drag=null;render();});
window.addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code==="KeyQ")field.aimPanel(field.guard.target-.3);
  if(e.code==="KeyE")field.aimPanel(field.guard.target+.3);
  if(e.code==="Escape")selectMode("shoot");
  keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
function input(){return V(+(keys.has("KeyD")||keys.has("ArrowRight"))-+(keys.has("KeyA")||keys.has("ArrowLeft")),
  +(keys.has("KeyS")||keys.has("ArrowDown"))-+(keys.has("KeyW")||keys.has("ArrowUp")));}
const params=new URLSearchParams(location.search);
if(params.has("k1probe")){
  try{
    const data=runK1Counterfactual();
    document.body.dataset.k1Probe="PASS";
    document.body.dataset.k1Cases=String(data.cases.length);
    document.body.dataset.k1Report=encodeURIComponent(JSON.stringify(data));
    report("K1: próba kontrfaktyczna zapisana; NIE jest to Owner feel PASS.");
  }catch(error){document.body.dataset.k1Probe="FAIL";
    document.body.dataset.k1Error=String(error.stack||error);console.error(error);}
}
if(params.has("k2scene")){
  try{
    paused=true;field.dispose();
    const {K2Field}=await import("./src/k2-probe.js");
    const kind=params.get("k2scene")||"hinged",
      active=params.get("k2active")!=="0",
      target=Number(params.get("k2target")||"1.1"),
      loadY=Number(params.get("k2loady")||"10.2"),
      pulse=Number(params.get("k2pulse")||"90"),
      shotY=Number(params.get("k2shoty")||"11.2"),
      tick=Math.max(0,Math.min(150,Number(params.get("k2tick")||"95")));
    field=new K2Field({kind,preset:"probe"});
    const second=field.load(17,loadY,.34,.32,56);
    field.world.propagateModifiedBodyPositionsToColliders();
    if(kind==="hinged"&&active)field.aimPanel(target);
    const wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
    for(let i=0;i<tick;i++){
      if(i===15&&pulse>0)second.body.applyImpulse(V(-pulse,0),true);
      if(i===95){
        field.reposition(field.witness,V(24.4,shotY));
        field.shoot(V(3,shotY),V(28,shotY),20);
      }
      if(kind==="rigid"&&active){
        const b=field.guard.body,
          error=wrap(target-b.rotation()),
          torque=Math.max(-.28,Math.min(.28,error*.42-b.angvel()*.13));
        b.applyTorqueImpulse(torque,true);
      }
      field.step();
    }
    document.body.dataset.k2Scene=JSON.stringify({
      kind,active,target,pulse,loadY,shotY,tick,load:second.body.translation(),
      guard:field.trace()});
    report("K2 rzeczywista klatka źródłowa: t"+tick+" "+kind+
      ", aktywacja "+active+", wtórny impuls "+pulse+" N·s");
  }catch(e){
    document.body.dataset.k2SceneError=String(e.stack||e);console.error(e);
  }
}
if(params.has("k2pressure")){
  try{
    paused=true;
    const {runK2Concurrent}=await import("./src/k2-concurrent.js");
    const result=runK2Concurrent();
    document.body.dataset.k2Pressure="PASS";
    document.body.dataset.k2PressureCases=String(result.cases.length);
    document.body.dataset.k2PressureReport=encodeURIComponent(JSON.stringify(result));
    report("K2 real material pulse + cover: computer source tests only.");
  }catch(e){
    document.body.dataset.k2Pressure="FAIL";
    document.body.dataset.k2PressureError=String(e.stack||e);
    console.error(e);
  }
}
if(params.has("k2probe")){
  try {
    paused=true;
    const {runK2Probe}=await import("./src/k2-probe.js");
    const results=runK2Probe();
    document.body.dataset.k2Probe="PASS";
    document.body.dataset.k2Cases=String(results.cases.length);
    document.body.dataset.k2Report=encodeURIComponent(JSON.stringify(results));
    report("K2: 30 real physics source trials; mechanical evidence ONLY.");
  } catch(e) {
    document.body.dataset.k2Probe="FAIL";
    document.body.dataset.k2Error=String(e.stack||e);
    console.error(e);
  }
}
if(params.has("k1frame")){
  paused=true;const step=Math.min(240,Math.max(0,Number(params.get("k1frame"))||0));
  field.shoot(V(3,10),V(27,10),20);
  for(let i=0;i<step;i++)field.step();
  document.body.dataset.k1Frame=String(field.ticks);
}
function loop(now){
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(!paused){
    acc+=dt;let count=0;
    while(acc>=DT&&count++<4){
      const start=performance.now();field.step(input());
      sampleMs+=performance.now()-start;sampleN++;acc-=DT;
    }
    if(count>=5)acc=Math.min(acc,DT*2);
  }
  if(frames++%3===0)render();
  requestAnimationFrame(loop);
}
report("Prawdziwy solver załadowany. Kliknij osłonę lub wystrzel pocisk.");
render();requestAnimationFrame(loop);
