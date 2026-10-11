import {V,DT} from "./src/p0-world.js";
import {ReflexYard} from "./src/p4-reflex.js";
const $=id=>document.getElementById(id);
const canvas=$("world"),ctx=canvas.getContext("2d",{alpha:false});
let world=new ReflexYard(),paused=false,mode="select",drag=null,firstActorId=null,secondActorId=null;
let last=performance.now(),acc=0,lastDraw=0;
let camera={x:20,y:12,zoom:1.0},keys=new Set();
const PI=Math.PI,rgba={wall:"#546b70",pivot:"#c99a66",gate:"#cda867",
 load:"#a6b8a6",bulky:"#d48b70",small:"#a3d6ac",lever:"#78b9d6",
 "rigid-lever":"#ac97cb",effector:"#82dcd9"};
function status(t){$("status").textContent=t;}
function resize(){
 const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
 if(width!==canvas.width||height!==canvas.height){canvas.width=width;canvas.height=height;}
 return {rect,width,height,scale:Math.min(width/40,height/24)*camera.zoom};
}
function worldAt(e){
 const m=resize();
 return V(camera.x+((e.clientX-m.rect.left)*m.width/m.rect.width-m.width/2)/m.scale,
 camera.y+((e.clientY-m.rect.top)*m.height/m.rect.height-m.height/2)/m.scale);
}
function physicalShape(entity,p,highlight=false){
 const sh=p.shape,pose=p.collider.translation();
 ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(p.collider.rotation());
 ctx.beginPath();if(sh.r)ctx.arc(0,0,sh.r,0,PI*2);
 else ctx.rect(-sh.hx,-sh.hy,2*sh.hx,2*sh.hy);
 ctx.fillStyle=rgba[entity.kind]||"#9eada7";ctx.fill();
 ctx.strokeStyle=highlight?"#fff0a5":"#1d414b";
 ctx.lineWidth=highlight?.075:.05;ctx.stroke();
 ctx.restore();
}
function render(){
 const m=resize();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#132933";ctx.fillRect(0,0,m.width,m.height);
 ctx.setTransform(m.scale,0,0,m.scale,m.width/2-camera.x*m.scale,m.height/2-camera.y*m.scale);
 ctx.lineWidth=.035;ctx.strokeStyle="#2c4550";
 for(let x=-10;x<=50;x+=2){ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x,45);ctx.stroke();}
 for(let y=-10;y<=35;y+=2){ctx.beginPath();ctx.moveTo(-20,y);ctx.lineTo(60,y);ctx.stroke();}
 // Physically meaningful features are full colliders; faint annotations are not.
 ctx.fillStyle="rgba(167,211,173,.035)";ctx.fillRect(0,0,20,24);
 ctx.fillStyle="rgba(162,190,224,.03)";ctx.fillRect(20,0,20,24);
 ctx.strokeStyle="rgba(243,205,121,.23)";ctx.lineWidth=.14;ctx.beginPath();
 ctx.arc(20,8,4.7,0,2*PI);ctx.stroke();
 for(const entity of world.entities){
  const chosen=world.selected===entity.id;
  if(entity.kind==="effector"){
   const owner=world.actors.find(a=>a.panel?.id===entity.id);
   const a=owner?.body.translation(),b=entity.body.translation();
   if(a){ctx.strokeStyle="#98e1c5";ctx.lineWidth=.09;ctx.beginPath();
    ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }
  for(const p of entity.shapes)physicalShape(entity,p,chosen);
  if(world.actors.includes(entity)&&secondActorId!==null&&
     (entity.id===secondActorId||entity.id===firstActorId)){
   const label=entity.id===secondActorId?"B":"A";
   const at=entity.body.translation();
   ctx.fillStyle="#f3e8bd";ctx.textAlign="center";
   ctx.font="bold .36px ui-monospace,monospace";
   ctx.fillText(label,at.x,at.y-.67);
  }
  if(chosen){
   const q=entity.body.translation(),r=entity.kind==="bulky"?1.49:1.13;
   ctx.strokeStyle=entity.stance==="brace"?"#ffe3a4":"#a9e3db";
   ctx.lineWidth=.06;ctx.setLineDash([.20,.12]);ctx.beginPath();
   ctx.arc(q.x,q.y,r,0,2*PI);ctx.stroke();ctx.setLineDash([]);
  }
 }
 for(const g of (world.grips||[])){
  const pa=g.holder.body.translation(),pb=g.load.body.translation();
  ctx.strokeStyle="#eac77f";ctx.lineWidth=.095;ctx.setLineDash([.2,.12]);
  ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();ctx.setLineDash([]);
 }
 if(drag?.kind==="poke"){
  ctx.strokeStyle="#ffcb91";ctx.lineWidth=.14;ctx.beginPath();
  ctx.moveTo(drag.from.x,drag.from.y);
  ctx.lineTo(drag.to.x,drag.to.y);ctx.stroke();
 }
 ctx.setTransform(1,0,0,1,0,0);
 const tr=typeof world.gripTrace==="function"?world.gripTrace():world.traces(),a=tr.selected;
 $("mode-status").textContent=paused?"PAUZA / fizyczna edycja":"SOLVER AKTYWNY / "+world.support;
 $("clock").textContent=tr.seconds.toFixed(1)+" s";
 $("selection").textContent=a?("WYBRANO: "+a.kind+" #"+a.id+"\n"+
  "Postawa: "+a.stance+"\nPozycja: "+a.pos.x.toFixed(2)+", "+a.pos.y.toFixed(2)+
  "\nRotacja: "+a.rotation.toFixed(3)+
  (a.panelAngle!==null?"\nCzłon względny: "+a.panelAngle.toFixed(3):"")):
  "Wybierz fizyczne ciało.";
 $("stance-status").textContent=a?.stance??"—";
 $("evidence").textContent="Brama: "+tr.gateAngle.toFixed(3)+" rad\n"+
  "Kontakt aktor–brama: "+tr.events.gateImpulse.toFixed(1)+" N·s (sumowany)\n"+
  "Napęd proxy: "+tr.events.rootEffort.toFixed(1)+" N·s\n"+
  "Reakcja gruntu: transl. "+tr.events.terrainLinearImpulse.toFixed(1)+
  ", kątowa "+tr.events.terrainAngularImpulse.toFixed(1)+" N·s/N·m·s\n"+
  tr.actorCount+" ciał · "+tr.loadCount+" ciężarów"+
  (tr.grips?"\\nAktywne uchwyty: "+tr.grips.length+
   " · łączny impuls chwytu: "+tr.gripEvidence.pairedImpulseSum+" N·s":"");
 document.body.dataset.p0Live="yes";
}
function setMode(next){
 mode=next;for(const b of document.querySelectorAll(".toolbar button[data-mode]"))
  b.classList.toggle("selected",b.dataset.mode===next);
 status(next==="select"?"Wybór organizmu.":"Tryb: "+next+". Kliknij dziedziniec.");
}
function select(e){
 const target=world.pick(e,{includeGate:false});
 if(!target)return;
 const actor=world.actors.find(a=>a===target||a.panel===target);
 if(actor){world.setSelected(actor.id);status("Sterowanie: "+actor.kind+".");}
 else status("To ruchoma materia. Ctrl+drag na pauzie, albo użyj impulsu.");
}
function pause(){paused=!paused;acc=0;$("pause").textContent=paused?"Wznów":"Pauza";
  status(paused?"Pauza. Ctrl+przeciągnij fizyczne ciała.":"Świat działa.");render();}
function reset(){world.dispose();firstActorId=null;secondActorId=null;world=new ReflexYard({support:$("support").value});
 paused=false;$("pause").textContent="Pauza";acc=0;
 status("Nowy materialny dziedziniec. Przebudowuj dowolnie.");render();}
function p3Preset(){
 world.dispose();
 world=new ReflexYard({populated:false,support:$("support").value});
 const A=world.spawn("small",V(9.3,12));
 const B=world.spawn("small",V(11.5,12));
 world.load(10.4,12,.48,.42,45);
 A.maxSpeedOverride=.85;B.maxSpeedOverride=.85;
 world.setSelected(A.id);firstActorId=A.id;secondActorId=B.id;
 camera={x:10.4,y:12,zoom:2.75};keys.clear();
 paused=false;$("pause").textContent="Pauza";acc=0;
 status("P3: WASD lewe ciało, IJKL prawe, G/H chwyt tylko po dotknięciu.");
 render();
}
$("p3-preset").onclick=p3Preset;
$("p3-right-grip").onclick=()=>secondActorId===null?
 status("Najpierw uruchom scenę dwóch ciał."):toggleGrip(secondActorId);
$("pause").onclick=pause;
$("tick").onclick=()=>{if(!paused)pause();world.step();render();};
$("reset").onclick=reset;
$("support").onchange=()=>{world.setSupport($("support").value);status("Reżim wsparcia: "+world.support);render();};
$("stance").onclick=()=>{const a=world.chosen;
 if(a){world.setStance(a.id,a.stance==="brace"?"flow":"brace");render();}};
$("arm-left").onclick=()=>{const a=world.chosen;if(a)world.setPanelAngle(a.id,a.target-.30);render();};
$("arm-right").onclick=()=>{const a=world.chosen;if(a)world.setPanelAngle(a.id,a.target+.30);render();};
$("arm-neutral").onclick=()=>{const a=world.chosen;if(a)world.setPanelAngle(a.id,0);render();};
function toggleGrip(id=null){
 const a=id===null?world.chosen:world.actors.find(a=>a.id===id);
 if(!a||typeof world.grip!=="function"){status("Wybierz fizycznego aktora.");return;}
 if(world.grips.some(x=>x.actor.id===a.id)){
  world.release(a.id);status("Uchwyt puszczony; ładunek zachowuje pęd i kolizję.");render();return;
 }
 const options=world.loads.map(load=>({load,contact:world.actualContact(a,load)}))
  .filter(x=>x.contact).sort((x,y)=>y.contact.impulse-x.contact.impulse);
 if(!options.length){status("BRAK UCHWYTU: najpierw dotknij ciężaru fizycznie.");render();return;}
 const out=world.grip(a.id,options[0].load.id,{maxImpulse:Number($("grip-force").value)});
 status(out.ok?"Chwyt po realnym kontakcie, siła ograniczona. G puszcza.":"Odmowa: "+out.reason);
 render();
}
$("grip").onclick=()=>toggleGrip(firstActorId);
$("grip-force").oninput=()=>{
 $("grip-force-text").textContent=$("grip-force").value+" N·s/krok";
};
$("strength").oninput=()=>{$("strength-text").textContent=$("strength").value+" N·s";};
for(const b of document.querySelectorAll(".toolbar button[data-mode]"))b.onclick=()=>setMode(b.dataset.mode);
canvas.addEventListener("contextmenu",e=>e.preventDefault());
canvas.addEventListener("wheel",e=>{e.preventDefault();
 camera.zoom=Math.max(.32,Math.min(5,camera.zoom*Math.exp(-e.deltaY*.0012)));
 render();},{passive:false});
canvas.addEventListener("pointerdown",e=>{
 const p=worldAt(e);
 if(e.button===1){drag={kind:"pan",cx:e.clientX,cy:e.clientY};}
 if(e.button===0){
  if(e.ctrlKey&&paused){
   const target=world.pick(p,{includeGate:true});
   if(target&&target.kind!=="gate")drag={kind:"move",target};
  }else if(mode==="select")select(p);
  else if(mode==="poke")drag={kind:"poke",from:p,to:p};
  else{
   if(world.actors.length>115||world.entities.length>190){status("Limit ochronny solvera dla ekstremalnych spawnów.");return;}
   if(mode==="load")world.load(p.x,p.y);
   else{const actor=world.spawn(mode,p);world.setSelected(actor.id);}
   world.world.propagateModifiedBodyPositionsToColliders();setMode("select");
  }
 }
 if(drag)canvas.setPointerCapture(e.pointerId);render();
});
canvas.addEventListener("pointermove",e=>{
 if(!drag)return;const p=worldAt(e);
 if(drag.kind==="poke")drag.to=p;
 if(drag.kind==="move")world.moveEntity(drag.target,p);
 if(drag.kind==="pan"){
  const m=resize();
  camera.x-=(e.clientX-drag.cx)*(m.width/m.rect.width)/m.scale;
  camera.y-=(e.clientY-drag.cy)*(m.height/m.rect.height)/m.scale;
  drag.cx=e.clientX;drag.cy=e.clientY;
 }
 render();
});
canvas.addEventListener("pointerup",e=>{
 if(!drag)return;
 const d=drag;drag=null;
 if(d.kind==="poke"){
  const to=worldAt(e),dir=V(to.x-d.from.x,to.y-d.from.y);
  if(!world.impulseAt(d.from,dir,Number($("strength").value)))
   status("Nie trafiłeś w ruchomą materię lub wektor jest za krótki.");
  else status("Fizyczny impuls eksperymentatora; bez fabularnego wyniku.");
  setMode("select");
 }
 render();
});
canvas.addEventListener("pointercancel",()=>{drag=null;render();});
window.addEventListener("keydown",e=>{
 if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
 const tag=document.activeElement?.tagName;if(["INPUT","SELECT","TEXTAREA"].includes(tag))return;
 if(e.code==="KeyB"&&!e.repeat)$("stance").click();
 if(e.code==="KeyQ"&&!e.repeat)$("arm-left").click();
 if(e.code==="KeyE"&&!e.repeat)$("arm-right").click();
 if(e.code==="KeyG"&&!e.repeat)$("grip").click();
 if(e.code==="KeyH"&&!e.repeat)$("p3-right-grip").click();
 if(e.code==="Escape")setMode("select");
 keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
function controls(){return V(+(keys.has("KeyD")||keys.has("ArrowRight"))-+(keys.has("KeyA")||keys.has("ArrowLeft")),
 +(keys.has("KeyS")||keys.has("ArrowDown"))-+(keys.has("KeyW")||keys.has("ArrowUp")));}
function secondControls(){return V(+keys.has("KeyL")-+keys.has("KeyJ"),+keys.has("KeyK")-+keys.has("KeyI"));}

const params=new URLSearchParams(location.search);
if(params.has("p0realinput"))window.__p0ReadOnlyProbe=()=>world.traces();

if(params.has("p0pairframe")){
 paused=true;
 try{
  const {continuation}=await import("./src/p0-chain.js");
  const changed=params.get("p0pairframe")==="opened";
  world.dispose();
  const state=continuation({worldSupport:"finite",changed,kind:"small",
    speed:5.5,runnerY:11.6,openerKind:"bulky",captureWorld:f=>{
      world=f;f.setSelected(f.actors[f.actors.length-1].id);
    }});
  document.body.dataset.p0Pairframe=JSON.stringify(state);
  status(changed?"Wcześniejsza materialna ingerencja OTWORZYŁA bramę.":
    "Kontrola: brama NIENARUSZONA, ten sam fizyczny impuls małej istoty.");
 }catch(e){document.body.dataset.p0PairframeError=String(e.stack||e);console.error(e);}
}
if(params.has("p0redteam")){
 paused=true;
 try{
  const {redteamP0}=await import("./src/p0-redteam.js");
  const mode=params.get("p0redteam");
  const result=redteamP0(mode);
  document.body.dataset.p0Redteam="PASS";
  document.body.dataset.p0RedteamAxis=mode;
  document.body.dataset.p0RedteamCases=String(result.cases);
  document.body.dataset.p0RedteamResult=encodeURIComponent(JSON.stringify(result));
  status("Rzeczywista kontrola odporności A/B: "+result.cases+" par.");
 }catch(e){document.body.dataset.p0Redteam="FAIL";
  document.body.dataset.p0RedteamError=String(e.stack||e);console.error(e);}
}
if(params.has("p0chain")){
 paused=true;
 try{
  const {p0MaterialChain}=await import("./src/p0-chain.js");
  const result=p0MaterialChain();
  document.body.dataset.p0Chain="PASS";
  document.body.dataset.p0ChainCases=String(result.cases.length);
  document.body.dataset.p0ChainResult=encodeURIComponent(JSON.stringify(result));
  status("P0 material continuation: 16 real separate paired physical worlds.");
 }catch(e){document.body.dataset.p0Chain="FAIL";
  document.body.dataset.p0ChainError=String(e.stack||e);console.error(e);}
}
if(params.has("p2input")){
 paused=true;
 try{
  world.dispose();
  world=new ReflexYard({populated:false,support:"finite"});
  const actor=world.spawn("bulky",V(8,16)),cargo=world.load(10.4,16,.47,.43,45);
  world.setSelected(actor.id);
  let contactTick=-1;
  for(let i=0;i<260;i++){
   world.step(V(1,0));
   if(world.actualContact(actor,cargo)){contactTick=i+1;break;}
  }
  if(contactTick<0)throw Error("No genuine contact for real input test");
  camera.x=10;camera.y=15;camera.zoom=1.4;
  window.__p2ReadOnlyProbe=()=>world.gripTrace();
  document.body.dataset.p2ContactReady=String(contactTick);
  status("G to contact-grip actual physical load; no connection yet.");
 }catch(e){document.body.dataset.p2ContactError=String(e.stack||e);console.error(e);}
}
if(params.has("p2red")){
 paused=true;
 try{
  const {p2SpeedRedTeam}=await import("./src/p2-probe.js");
  const v=p2SpeedRedTeam();
  document.body.dataset.p2Red="PASS";
  document.body.dataset.p2RedCases=String(v.cases);
  document.body.dataset.p2RedResult=encodeURIComponent(JSON.stringify(v));
  status("P2: 24 rzeczywiste próby z jednakową prędkością ruchu.");
 }catch(e){document.body.dataset.p2Red="FAIL";
  document.body.dataset.p2RedError=String(e.stack||e);console.error(e);}
}
if(params.has("p3native")){
 paused=true;
 try{
  world.dispose();world=new ReflexYard({populated:false,support:"finite"});
  const A=world.spawn("small",V(8,12)),B=world.spawn("small",V(12.8,12));
  const C=world.load(10.4,12,.48,.42,45);
  A.maxSpeedOverride=.85;B.maxSpeedOverride=.85;
  world.selected=null;
  let sourceTick=-1;
  for(let i=0;i<280;i++){
   world.command(A,V(1,0));world.command(B,V(-1,0));world.step();
   if(world.actualContact(A,C)&&world.actualContact(B,C)){sourceTick=i+1;break;}
  }
  if(sourceTick<0)throw Error("P3 second body not in source real contact");
  world.setSelected(A.id);secondActorId=B.id;
  camera={x:10.4,y:12,zoom:2.75};
  $("grip-force").value="6";$("grip-force-text").textContent="6 N·s/krok";
  window.__p3ReadOnlyProbe=()=>world.gripTrace();
  document.body.dataset.p3NativeReady=String(sourceTick);
  status("P3: native G/H separate grips after real two-sided solver contact.");
 }catch(e){document.body.dataset.p3NativeError=String(e.stack||e);console.error(e);}
}
if(params.has("p4probe")){
 paused=true;
 try{
  const {p4Probe}=await import("./src/p4-probe.js");
  const v=p4Probe();
  document.body.dataset.p4Probe="PASS";
  document.body.dataset.p4Cases=String(v.cases);
  document.body.dataset.p4Report=encodeURIComponent(JSON.stringify(v));
  status("P4: local contact-load reflex against cheap constant brake/follow.");
 }catch(e){document.body.dataset.p4Probe="FAIL";
  document.body.dataset.p4Error=String(e.stack||e);console.error(e);}
}
if(params.has("p4frame")){
 paused=true;
 try{
  const {p4Case}=await import("./src/p4-probe.js");
  const mode=params.get("p4frame");
  if(!["off","conditional","follow","brake"].includes(mode))throw Error("mode");
  const source=params.get("side")==="left"?"left":"right";
  const support=params.get("terrain")==="none"?"none":"finite";
  world.dispose();camera={x:10,y:15,zoom:3.1};
  const v=p4Case({mode,side:source,support,force:160,offCenter:.33,
   captureWorld:(w,{actor})=>{
    world=w;firstActorId=actor.id;secondActorId=null;world.setSelected(actor.id);
   }});
  document.body.dataset.p4Frame=JSON.stringify(v);
  status("P4 raw source: local reflex "+mode+" after external finite shock.");
 }catch(e){document.body.dataset.p4FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p3probe")){
 paused=true;
 try{
  const {p3Probe}=await import("./src/p3-duel.js");
  const v=p3Probe();
  document.body.dataset.p3Probe="PASS";
  document.body.dataset.p3Count=String(v.cases);
  document.body.dataset.p3Result=encodeURIComponent(JSON.stringify(v));
  status("P3 genuine physical bilateral matter pressure.");
 }catch(e){document.body.dataset.p3Probe="FAIL";
  document.body.dataset.p3Error=String(e.stack||e);console.error(e);}
}
if(params.has("p3frame")){
 paused=true;
 try{
  const {p3Contest}=await import("./src/p3-duel.js");
  const kind=params.get("p3frame")==="off"?"off":
    params.get("p3frame")==="release"?"release":"dual";
  const support=params.get("terrain")==="none"?"none":"finite";
  const leftKind=params.get("left")==="bulky"?"bulky":"small";
  world.dispose();camera={x:10.4,y:12,zoom:2.75};
  const v=p3Contest({mode:kind,support,leftKind,
    captureWorld:(w,{A,B,C})=>{world=w;w.setSelected(A.id);firstActorId=A.id;secondActorId=B.id;}});
  document.body.dataset.p3Frame=JSON.stringify(v);
  status("P3: two bodies, shared real cargo, true late-source frame.");
 }catch(e){document.body.dataset.p3FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p2probe")){
 paused=true;
 try{
  const {p2Probe}=await import("./src/p2-probe.js");
  const v=p2Probe();
  document.body.dataset.p2Probe="PASS";
  document.body.dataset.p2Cases=String(v.cases);
  document.body.dataset.p2Result=encodeURIComponent(JSON.stringify(v));
  status("P2: solver-verified contact-gated finite cargo grip vs null");
 }catch(e){
  document.body.dataset.p2Probe="FAIL";
  document.body.dataset.p2Error=String(e.stack||e);console.error(e);
 }
}
if(params.has("p0probe")){
 paused=true;
 try{const {p0Probe}=await import("./src/p0-probe.js"),result=p0Probe();
  document.body.dataset.p0Probe="PASS";
  document.body.dataset.p0Cases=String(result.samples);
  document.body.dataset.p0Result=encodeURIComponent(JSON.stringify(result));
  status("Rzeczywiste 32 próby WASM zakończone — tylko diagnoza mechaniczna.");
 }catch(e){document.body.dataset.p0Probe="FAIL";
   document.body.dataset.p0ProbeError=String(e.stack||e);console.error(e);}
}
if(params.has("p0frame")){
 paused=true;
 try{
  const tick=Math.max(0,Math.min(800,Number(params.get("p0frame"))||0));
  const actor=world.actors.find(x=>x.kind===params.get("actor"))||world.actors[0];
  world.setSelected(actor.id);
  const dir=params.has("drive")?V(1,0):V();
  if(params.has("brace"))world.setStance(actor.id,"brace");
  if(params.has("poke"))world.impulseAt(V(20,11),V(1,0),130);
  for(let i=0;i<tick;i++)world.step(dir);
  document.body.dataset.p0Frame=JSON.stringify(world.traces());
 }catch(e){document.body.dataset.p0FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p0ownercheck")){
 paused=true;
 try{
  $("pause").click();if(paused)throw Error("pause UI failed");
  $("pause").click();if(!paused)throw Error("resume UI failed");
  $("tick").click();
  $("support").value="none";$("support").dispatchEvent(new Event("change"));
  if(world.support!=="none")throw Error("support selector failed");
  const b=world.chosen;$("stance").click();
  if(b.stance!=="brace")throw Error("stance button failed");
  document.body.dataset.p0Ownercheck="PASS";
 }catch(e){document.body.dataset.p0Ownercheck="FAIL";
  document.body.dataset.p0OwnercheckError=String(e.stack||e);}
}
function frame(t){
 const delta=Math.min(.05,Math.max(0,(t-last)/1000));last=t;
 if(!paused){
  acc+=delta;let n=0;
  while(acc>=DT&&n<4){
   const first=world.actors.find(a=>a.id===firstActorId);
   const second=world.actors.find(a=>a.id===secondActorId);
   if(first&&second){
    // Fixed independent operator channels, regardless of body selected for
    // inspecting physical telemetry. No scripted destination or goal.
    world.command(first,controls());
    world.command(second,secondControls());
    const observedSelection=world.selected;
    world.selected=null;world.step();world.selected=observedSelection;
   }else world.step(controls());
   acc-=DT;n++;
  }
  if(n===4)acc=Math.min(acc,DT*2);
 }
 if(t-lastDraw>55){render();lastDraw=t;}
 requestAnimationFrame(frame);
}
status("Prawdziwa fizyka Rapier2D działa. Możesz niszczyć ustawienie.");
render();requestAnimationFrame(frame);
