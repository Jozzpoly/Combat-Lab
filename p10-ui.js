// P10 operator-workbench: actual physical state only; no fake sprite interactions,
// no route script, no game-level passes or observer counters fed into control.
import {makeMaterialWorkshop} from "./src/p10-workshop.js";
import {V,DT} from "./src/p0-world.js";
const $=id=>document.getElementById(id);
const canvas=$("world"),ctx=canvas.getContext("2d",{alpha:false});
const PI=Math.PI;
const colors={wall:"#56777c",pivot:"#f0cc8d",gate:"#dfae70",
 barrier:"#5c8491",load:"#b6a78e",small:"#9edfc6",bulky:"#e6a57b",
 lever:"#a5c2ec","rigid-lever":"#b99cdd",effector:"#90e9db"};
let world=makeMaterialWorkshop(),paused=false,mode="select",drag=null;
let camera={x:17.2,y:14.25,zoom:1.57};
let keys=new Set(),last=performance.now(),acc=0;
const initialCamera=()=>({x:17.2,y:14.25,zoom:1.57});
function focusChosen(){
 const a=world.chosen;if(!a){status("Wybierz ciało do wyśrodkowania.");return;}
 const p=a.body.translation();
 camera={x:p.x,y:p.y,zoom:Math.max(1.92,camera.zoom)};
 render();status("Kamera na wybranym fizycznym ciele. 0 pokazuje cały świat.");
}
function showAll(){
 camera={x:20,y:12,zoom:1.10};
 render();status("Pełna przestrzeń 40×24 m. F przybliża wybrane ciało.");
}
const focus=id=>world.actors.find(a=>a.id===id);
function status(s){$("status").textContent=s;}
function metrics(){
 const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 const width=Math.max(1,Math.round(rect.width*dpr)),
 height=Math.max(1,Math.round(rect.height*dpr));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 return {rect,width,height,scale:Math.min(width/40,height/24)*camera.zoom};
}
function atMouse(e){
 const m=metrics();
 return V(camera.x+((e.clientX-m.rect.left)*m.width/m.rect.width-m.width/2)/m.scale,
 camera.y+((e.clientY-m.rect.top)*m.height/m.rect.height-m.height/2)/m.scale);
}
function drawBody(e,p,selected){
 const collider=p.collider,shape=p.shape,pos=collider.translation();
 ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(collider.rotation());
 ctx.beginPath();
 if(shape.r)ctx.arc(0,0,shape.r,0,2*PI);
 else ctx.rect(-shape.hx,-shape.hy,2*shape.hx,2*shape.hy);
 ctx.fillStyle=colors[e.kind]||"#d4d2c7";ctx.fill();
 ctx.lineWidth=selected?.09:.047;
 ctx.strokeStyle=selected?"#fff0b7":"#254550";ctx.stroke();ctx.restore();
}
function draw(){
 const m=metrics();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#102b34";ctx.fillRect(0,0,m.width,m.height);
 ctx.setTransform(m.scale,0,0,m.scale,m.width/2-camera.x*m.scale,m.height/2-camera.y*m.scale);
 ctx.lineWidth=.025;ctx.strokeStyle="rgba(161,217,210,.105)";
 for(let x=0;x<=40;x+=2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,24);ctx.stroke();}
 for(let y=0;y<=24;y+=2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(40,y);ctx.stroke();}
 // Faint authoring regions, no invisible walls or target triggers.
 ctx.fillStyle="rgba(250,214,158,.045)";ctx.fillRect(1,2,17,20);
 ctx.fillStyle="rgba(142,213,196,.045)";ctx.fillRect(21,2,18,20);
 ctx.strokeStyle="rgba(244,202,116,.25)";ctx.lineWidth=.06;ctx.beginPath();
 ctx.arc(20,8.55,4.7,0,2*PI);ctx.stroke();
 ctx.font="500 .49px system-ui";ctx.fillStyle="rgba(195,230,217,.7)";
 ctx.fillText("ZAWIAS BRAMY",17,6.6);
 ctx.fillText("SZCZELINA",24.3,7.65);
 // The link is genuine source state. This drawn segment is a visual
 // body-to-body annotation, NOT the exact solver attachment-point geometry.
 for(const g of world.grips){
  const a=g.actor.body.translation(),b=g.load.body.translation();
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.lineWidth=.16;ctx.strokeStyle="#d8e9a0";ctx.setLineDash([.14,.09]);
  ctx.stroke();ctx.setLineDash([]);
 }
 const ready=world.chosen?world.loads.filter(x=>world.actualContact(world.chosen,x)):[];
 for(const e of world.entities){
  if(ready.includes(e)){
   const p=e.body.translation();
   ctx.beginPath();ctx.arc(p.x,p.y,.85,0,2*PI);
   ctx.lineWidth=.09;ctx.strokeStyle="#c4f7a3";ctx.stroke();
  }
  for(const s of e.shapes)drawBody(e,s,world.selected===e.id);
  if(world.actors.includes(e)){
   const p=e.body.translation();
   ctx.fillStyle="#10222a";ctx.font="bold .35px ui-monospace,monospace";
   ctx.textAlign="center";
   ctx.fillText(e.kind==="bulky"?"CIĘŻKI":e.kind==="small"?"MAŁY":
    e.kind==="lever"?"RAMIĘ":"RIGID",p.x,p.y+.13);
  }
 }
 for(const a of world.actors){
  if(!a.panel)continue;
  const v=a.body.translation(),p=a.panel.body.translation();
  ctx.beginPath();ctx.moveTo(v.x,v.y);ctx.lineTo(p.x,p.y);
  ctx.strokeStyle="#d1f3e7";ctx.lineWidth=.055;ctx.stroke();
 }
 if(world.chosen){
  const a=world.chosen,p=a.body.translation();
  const r=a.kind==="bulky"?1.45:1.04;
  ctx.strokeStyle=a.stance==="brace"?"#ffe2a4":"#e8f7d5";
  ctx.lineWidth=.065;ctx.setLineDash([.14,.10]);
  ctx.beginPath();ctx.arc(p.x,p.y,r,0,2*PI);ctx.stroke();ctx.setLineDash([]);
 }
 if(drag?.kind==="poke"){
  ctx.beginPath();ctx.moveTo(drag.from.x,drag.from.y);
  ctx.lineTo(drag.to.x,drag.to.y);ctx.strokeStyle="#ffd29a";
  ctx.lineWidth=.10;ctx.stroke();
 }
}
function ui(){
 const t=world.trace(),a=world.chosen;
 $("clock").textContent="t = "+(t.tick*DT).toFixed(1)+" s";
 $("runstate").textContent=paused?"PAUZA":"RUCH";
 $("pause").textContent=paused?"Wznów":"Pauza";
 $("chosen").textContent=a?a.kind.toUpperCase()+" · #"+a.id:"—";
 $("geometry").textContent="Prawa szczelina: "+t.aperture.width.toFixed(2)+
  " m · Mały 0,88 m · Ciężki 2,30 m.";
 const held=a?t.grips.filter(g=>g.actor===a.id):[];
 const touching=a?world.loads.filter(l=>world.actualContact(a,l)):[];
 $("contact").textContent=a?(
  held.length?"CHWYT AKTYWNY · "+held.length+" fizyczne połączenie · G puszcza":
  touching.length?"KONTAKT Z ŁADUNKIEM · G dostępne (ograniczona siła)":
  "Brak kontaktu z ładunkiem. Podjedź albo przesuń materię.")+
  "\nPostawa: "+a.stance+" · X "+a.body.translation().x.toFixed(2)+
  " · Y "+a.body.translation().y.toFixed(2):"";
 $("support").value=world.support;
}
function render(){draw();ui();}
function togglePause(){
 paused=!paused;acc=0;keys.clear();render();
 status(paused?"Pauza — możesz przenosić materię Ctrl + przeciągnięcie.":"Świat trwa dalej.");
}
function reset(){
 world.dispose();world=makeMaterialWorkshop();
 paused=false;acc=0;keys.clear();drag=null;
 camera=initialCamera();render();
 status("Nowy cichy warsztat; żaden aktor nie rusza bez polecenia.");
}
function selectMode(value){
 mode=value;
 for(const b of document.querySelectorAll("button[data-mode]"))
  b.classList.toggle("active",b.dataset.mode===mode);
}
function move(){
 return V(+(keys.has("KeyD")||keys.has("ArrowRight"))-
  +(keys.has("KeyA")||keys.has("ArrowLeft")),
  +(keys.has("KeyS")||keys.has("ArrowDown"))-
  +(keys.has("KeyW")||keys.has("ArrowUp")));
}
function tick(){world.step(move());}
function grip(){
 const r=world.toggleContactGrip();
 status(r.ok?(r.kind==="release"?"Fizyczny ładunek zwolniony.":"Chwyt po prawdziwym kontakcie, z ograniczoną siłą."):
  "Nie chwytasz: "+r.reason);render();
}
function stance(){
 const a=world.chosen;
 if(!a)return;
 world.setStance(a.id,a.stance==="brace"?"flow":"brace");render();
 status("Postawa realnie wpływa na ograniczoną reakcję wirtualnego gruntu.");
}
function arm(dir){
 const a=world.chosen;
 if(!a?.panel){status("To ciało nie ma niezależnego członu.");return;}
 world.setPanelAngle(a.id,a.target+.30*dir);render();
 status("Fizyczny zawias, momenty akcji/reakcji. Nie magiczna animacja.");
}
$("pause").onclick=togglePause;
$("step").onclick=()=>{
 if(!paused)togglePause();
 tick();render();status("Jeden prawdziwy krok Rapiera (1/60 s).");
};
$("reset").onclick=reset;
$("view-selected").onclick=focusChosen;
$("view-all").onclick=showAll;
$("grip").onclick=grip;$("stance").onclick=stance;
$("arm-left").onclick=()=>arm(-1);$("arm-right").onclick=()=>arm(1);
$("open").onclick=()=>{
 const before=world.aperture().width;
 const ok=world.openSlot();
 if(ok)status("Fizyczny collider przesunięty: "+before.toFixed(2)+
  " → "+world.aperture().width.toFixed(2)+" m. Bez resetowania świata.");
 else status("Nie udało się przenieść przeszkody.");
 render();
};
$("support").onchange=()=>{
 world.setSupport($("support").value);
 status("Zmieniono deklarowany model podparcia. To nadal nie biomechanika.");render();
};
$("strength").oninput=()=>{$("strength-out").textContent=$("strength").value;};
for(const b of document.querySelectorAll("button[data-mode]"))
 b.onclick=()=>selectMode(b.dataset.mode);
canvas.oncontextmenu=e=>e.preventDefault();
canvas.addEventListener("wheel",e=>{
 e.preventDefault();const pointer=atMouse(e);
 camera.zoom=Math.max(.36,Math.min(4.5,camera.zoom*Math.exp(-e.deltaY*.0012)));
 const shifted=atMouse(e);
 // World coordinate under cursor remains fixed during zoom.
 camera.x+=pointer.x-shifted.x;camera.y+=pointer.y-shifted.y;
 render();
},{passive:false});
canvas.addEventListener("pointerdown",e=>{
 const p=atMouse(e);
 if(e.button===1||e.button===2)
  drag={kind:"pan",cx:e.clientX,cy:e.clientY};
 else if(e.button===0&&e.ctrlKey&&paused){
  const target=world.pick(p,{includeGate:true});
  if(target&&target.kind!=="gate"&&target.kind!=="pivot"&&
      !world.entities.some(a=>a.panel===target)){
   const center=target.body.translation();
   // Preserve the exact material grab offset: no snapping body CENTRE
   // onto cursor merely because the user grabbed near an edge.
   drag={kind:"edit",target,offset:V(center.x-p.x,center.y-p.y)};
  }
 }else if(e.button===0&&mode==="select"){
  const target=world.pick(p);
  const actor=world.actors.find(a=>a===target||a.panel===target);
  if(actor){world.setSelected(actor.id);status("Sterujesz fizycznym ciałem #"+actor.id);}
  else if(target)status("Fizyczna materia · Ctrl+drag na pauzie albo impuls.");
 }else if(e.button===0&&mode==="poke")
  drag={kind:"poke",from:p,to:p};
 else if(e.button===0){
  if(world.entities.length>=160){status("Granica ochronna krytycznej stabilności solvera.");return;}
  if(mode==="load")world.load(p.x,p.y,.55,.45,48);
  else if(mode==="barrier")world.barrier(p.x,p.y,.25,.95);
  else{const a=world.spawn(mode,p);world.setSelected(a.id);}
  world.world.propagateModifiedBodyPositionsToColliders();
  selectMode("select");
  status("Dodano prawdziwe fizyczne ciało/materię. Bez automatycznej roli AI.");
 }
 if(drag)canvas.setPointerCapture(e.pointerId);
 render();
});
canvas.addEventListener("pointermove",e=>{
 if(!drag)return;
 const p=atMouse(e);
 if(drag.kind==="pan"){
  const m=metrics();
  camera.x-=(e.clientX-drag.cx)*(m.width/m.rect.width)/m.scale;
  camera.y-=(e.clientY-drag.cy)*(m.height/m.rect.height)/m.scale;
  drag.cx=e.clientX;drag.cy=e.clientY;
 }else if(drag.kind==="poke")drag.to=p;
 else if(drag.kind==="edit"){
  world.moveEntity(drag.target,V(p.x+drag.offset.x,p.y+drag.offset.y));
 }
 render();
});
canvas.addEventListener("pointerup",e=>{
 if(!drag)return;
 const d=drag;drag=null;
 if(d.kind==="poke"){
  const p=atMouse(e),v=V(p.x-d.from.x,p.y-d.from.y);
  const ok=world.impulseAt(d.from,v,Number($("strength").value));
  status(ok?"Prawdziwy fizyczny impuls w punkcie kontaktu.":
   "Brak trafionego ruchomego ciała albo za krótki gest.");
  selectMode("select");
 }
 render();
});
canvas.addEventListener("pointercancel",()=>{drag=null;render();});
addEventListener("keydown",e=>{
 if(["Space","ArrowUp","ArrowDown","ArrowRight","ArrowLeft"].includes(e.code))
  e.preventDefault();
 if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
 if(e.repeat)return;
 if(e.code==="Space"){togglePause();return;}
 if(e.code==="KeyG"){grip();return;}
 if(e.code==="KeyB"){stance();return;}
 if(e.code==="KeyQ"){arm(-1);return;}
 if(e.code==="KeyE"){arm(1);return;}
 if(e.code==="KeyR"){reset();return;}
 if(e.code==="KeyF"){focusChosen();return;}
 if(e.code==="Digit0"){showAll();return;}
 if(e.code==="Escape"){selectMode("select");return;}
 if(/^Digit[123]$/.test(e.code)){
  const index=Number(e.code.at(-1))-1;
  const a=world.actors[index];if(a){world.setSelected(a.id);render();}
  return;
 }
 keys.add(e.code);
});
addEventListener("keyup",e=>keys.delete(e.code));
addEventListener("blur",()=>keys.clear());
function frame(now){
 const d=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 if(!paused){acc=Math.min(.20,acc+d);
  let count=0;
  while(acc>=DT&&count<12){tick();acc-=DT;count++;}
 }
 render();requestAnimationFrame(frame);
}
window.__p10ReadOnlyProbe=()=>world.trace();
window.__p10ViewReadOnly=()=>({...camera});
document.body.dataset.p10Live="yes";
const params=new URLSearchParams(location.search);
if(params.has("p10audit")){
 paused=true;
 try{
  const {p10Audit}=await import("./src/p10-probe.js");
  const report=p10Audit();
  document.body.dataset.p10Audit="PASS";
  document.body.dataset.p10Cases=String(report.cases);
  document.body.dataset.p10Report=encodeURIComponent(JSON.stringify(report));
 }catch(e){
  document.body.dataset.p10Audit="FAIL";
  document.body.dataset.p10AuditError=String(e.stack||e);console.error(e);
 }
}

if(params.has("p10bstress")){
 paused=true;
 try{
  const {p10bStress}=await import("./src/p10b-stress.js");
  const data=p10bStress();
  document.body.dataset.p10bStress="PASS";
  document.body.dataset.p10bWorlds=String(data.worlds);
  document.body.dataset.p10bReport=encodeURIComponent(JSON.stringify(data));
 }catch(e){
  document.body.dataset.p10bStress="FAIL";
  document.body.dataset.p10bError=String(e.stack||e);console.error(e);
 }
}

if(params.has("p10frame")){
 paused=true;
 try{
  const test=params.get("p10frame");
  if(!["free","blocked","opened","haul","hinge"].includes(test))throw Error("unknown frame");
  world.dispose();
  world=makeMaterialWorkshop({fixture:
   test==="blocked"?"slot-bulky":
   test==="opened"?"slot-open-bulky":
   test==="haul"?"haul":"free"});
  if(test==="blocked"||test==="opened"){
   for(let i=0;i<270;i++)world.step(V(1,0));
  }else if(test==="haul"){
   world.setSelected(world.small.id);
   let contacted=false;
   for(let i=0;i<115;i++){
    world.step(V(1,0));
    if(world.actualContact(world.small,world.handLoad)){contacted=true;break;}
   }
   if(!contacted)throw Error("P10 visual cargo case did not physically contact cargo");
   const grip=world.grip(world.small.id,world.handLoad.id,{maxImpulse:4});
   if(!grip.ok)throw Error("P10 visual cargo not physically grasped");
   for(let i=0;i<30;i++)world.step(V());
   for(let i=0;i<185;i++)world.step(V(-1,0));
  }else if(test==="hinge"){
   world.setSelected(world.tool.id);
   world.setPanelAngle(world.tool.id,.9);
   for(let i=0;i<140;i++)world.step(V());
  }else for(let i=0;i<20;i++)world.step(V());
  const t=world.trace();
  document.body.dataset.p10Frame=encodeURIComponent(JSON.stringify(t));
  status("P10: rzeczywisty kadr fizyki Rapier; to nie animowany mockup.");
 }catch(e){document.body.dataset.p10FrameError=String(e.stack||e);console.error(e);}
}
render();requestAnimationFrame(frame);
