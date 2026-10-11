import {V,DT} from "./src/p0-world.js";
import {ReflexYard} from "./src/p4-reflex.js";
import {createCommons,CommonsYard} from "./src/p5-commons.js";
import {createP6Commons,openP6} from "./src/p6-envelope.js";
import {makeDoorCrowd,DoorCrowdYard} from "./src/p7-crowd.js";
const $=id=>document.getElementById(id);
const canvas=$("world"),ctx=canvas.getContext("2d",{alpha:false});
let world=new ReflexYard(),paused=false,mode="select",drag=null,firstActorId=null,secondActorId=null;
let last=performance.now(),acc=0,lastDraw=0;
let camera={x:20,y:12,zoom:1.0},keys=new Set();
const PI=Math.PI,rgba={wall:"#546b70",pivot:"#c99a66",gate:"#cda867",
 load:"#a6b8a6",barrier:"#799097",bulky:"#d48b70",small:"#a3d6ac",lever:"#78b9d6",
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
 // Only display actual physical roles from the local policy model, never
 // imagined autonomy or hidden NPC intentions.
 if(world instanceof CommonsYard){
  for(const [id,s] of world.local){
   const a=world.actors.find(x=>x.id===id);if(!a)continue;
   const p=a.body.translation();
   ctx.font="bold .32px ui-monospace,monospace";
   ctx.textAlign="center";ctx.fillStyle="#e9dec3";
   ctx.fillText(s.role==="carrier"?"CHWYT":s.role==="brace"?"OPÓR":
    s.role==="yield"?"USTĄP":"NAPÓR",p.x,p.y-.66);
   ctx.beginPath();ctx.moveTo(p.x,p.y);
   ctx.lineTo(p.x+s.heading.x*.65,p.y+s.heading.y*.65);
   ctx.strokeStyle="#8ed3bf";ctx.lineWidth=.035;ctx.stroke();
  }
 }
 if(world instanceof DoorCrowdYard){
  const m=world.gap, p=world.guard.body.translation(),
    state=world.pressureTrace(),isBraced=world.guard.stance==="brace";
  ctx.font="bold .34px ui-monospace,monospace";ctx.textAlign="center";
  ctx.fillStyle=isBraced?"#ffd09a":"#b8d1d0";
  ctx.fillText(isBraced?"OPÓR KONTAKTOWY":"DYNAMICZNY OBROŃCA",p.x,p.y-1.42);
  ctx.textAlign="left";ctx.fillStyle="#f1d5a2";
  ctx.fillText("światło "+state.mouth.width.toFixed(2)+" m",m.x+.55,m.y-1.8);
  ctx.fillText("dotknięcia "+state.pressure.guardContacts,
    m.x+.55,m.y-1.30);
 }
 if(world.p6?.kind==="commons"){
  const c=world.p6.passage;
  const limit=(a,up)=>a.body.translation().y+
   (up?-a.shapes[0].shape.hy:a.shapes[0].shape.hy);
  const hi=limit(c.upper,false),lo=limit(c.mid,true);
  const hi2=limit(c.mid,false),lo2=limit(c.lower,true);
  for(const [from,to] of [[hi,lo],[hi2,lo2]]){
   if(to<=from)continue;
   ctx.fillStyle="#ebdcae";ctx.textAlign="left";
   ctx.font="bold .29px ui-monospace,monospace";
   ctx.fillText("szczelina "+(to-from).toFixed(2)+" m",
    c.x+.58,(from+to)/2);
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
 if(typeof world.reflexTrace==="function"&&world.reflex.size){
  const rx=world.reflexTrace();
  $("evidence").textContent+="\\nOdruch: "+[...world.reflex.values()].join(", ")+
   " · fizyczny napęd proxy "+rx.reflexEvents.proxyImpulse.toFixed(2)+
   " N·s · aktywne kroki "+rx.reflexEvents.active;
 }
 if(world instanceof DoorCrowdYard){
  const r=world.pressureTrace();
  $("evidence").textContent+="\nP7: obrońca "+r.guard.kind+
   " "+r.guard.mass+" kg, promień "+r.guard.shapeRadius+" m"+
   "\nNacisk na obrońcę: "+r.pressure.guardContacts+
   " kontaktów / sumowany impuls "+r.pressure.guardImpulse.toFixed(1)+" N·s"+
   "\nPostawa z kontaktu: "+r.pressure.guardBraceTicks+
   " tick · ustąpienia: "+r.pressure.deflections+
   "\nPrzeszło gardzielą: "+r.crossings.mouth+"/"+r.pressure.density+
   " · przecięło linię: "+r.crossings.all+
   "\nKoszt napędu grupy: "+r.pressure.moveImpulse.toFixed(1)+" N·s";
 }
 if(world instanceof CommonsYard){
  const p=world.commonsTrace().activity;
  $("evidence").textContent+="\\nP5 fizyczne dotknięcia ciał: "+p.contactActor+
    " · ciężarów: "+p.contactCargo+"\\nLokalne uchwyty: "+p.localGrips+
    " · ustąpienia: "+p.turns+" · trzymanie pozycji: "+p.braceTicks+
    "\\nLokalny napęd: "+p.autonomousEffort.toFixed(1)+
    " N·s · ingerencje Ownera: "+p.externalImpulses+
    " · przebudowy: "+p.materialEdits;
 }
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
 else status(target.kind==="barrier"?"Przeszkoda świata: pauza + Ctrl+przeciągnij.":
    "To ruchoma materia. Ctrl+drag na pauzie, albo użyj impulsu.");
}
function pause(){paused=!paused;acc=0;$("pause").textContent=paused?"Wznów":"Pauza";
  status(paused?"Pauza. Ctrl+przeciągnij fizyczne ciała.":"Świat działa.");render();}
function reset(){world.dispose();firstActorId=null;secondActorId=null;world=new ReflexYard({support:$("support").value});
 paused=false;$("pause").textContent="Pauza";acc=0;
 status("Nowy materialny dziedziniec. Przebudowuj dowolnie.");render();}
function p7Preset(){
 world.dispose();
 world=makeDoorCrowd({support:$("support").value,
  width:Number($("p7-width").value),density:Number($("p7-density").value),
  guardKind:$("p7-kind").value,guardMass:90,
  guardPolicy:$("p7-stance").value,moverPolicy:$("p7-actor-policy").value});
 firstActorId=null;secondActorId=null;p4MaterialId=null;
 $("p5-motor").textContent="Wyłącz lokalny napęd";
 camera={x:14.2,y:12,zoom:1.85};keys.clear();
 acc=0;paused=false;$("pause").textContent="Pauza";
 status("P7: realny nacisk. Strażnik to RUCHOME ciało, nie nieruchomy collider.");
 render();
}
function p7Open(){
 if(!(world instanceof DoorCrowdYard)){status("Najpierw scena P7.");return;}
 if(!paused){status("Pauza wymagana do przebudowy świata.");return;}
 if(world.openPassage())status("Fizyczna przeszkoda przesunięta o 1,30 m bez restartu tłumu.");
 else status("Przejście już przebudowane.");
 render();
}
function p7Poke(){
 if(!(world instanceof DoorCrowdYard)){status("Najpierw scena P7.");return;}
 const ok=world.pushGuard(V(85,0));
 status(ok?"Operator szarpnął RUCHOME ciało rzeczywistym impulsem.":"Nie można szarpnąć.");
 render();
}
$("p7-preset").onclick=p7Preset;
$("p7-open").onclick=p7Open;
$("p7-poke").onclick=p7Poke;
$("p7-stance").onchange=()=>{
 if(world instanceof DoorCrowdYard){
  world.pressure.guardPolicy=$("p7-stance").value;
  status("Nowe działanie obrońcy odczytywane TYLKO z następnego rzeczywistego kontaktu.");
 }
};
$("p7-actor-policy").onchange=()=>{
 if(world instanceof DoorCrowdYard){
  world.pressure.moverPolicy=$("p7-actor-policy").value;
  status("Polityka tłumu zmieniona bez resetowania świata.");
 }
};
function p6Preset(){
 world.dispose();world=createP6Commons({support:$("support").value});
 $("p5-policy").value="touch";
 $("p5-motor").textContent="Wyłącz lokalny napęd";
 camera={x:14,y:14.4,zoom:1.75};
 firstActorId=null;secondActorId=null;p4MaterialId=null;
 keys.clear();acc=0;paused=false;$("pause").textContent="Pauza";
 status("P6: wąski i szeroki przesmyk w jednej materialnej przestrzeni. Zatrzymaj i edytuj.");
 render();
}
function p6Open(){
 if(!world.p6){status("Najpierw uruchom scenę Przesmyki P6.");return;}
 if(!paused){status("Najpierw PAUZA: edycja collidera nie powinna zachodzić podczas solvera.");return;}
 if(openP6(world)){
  status("Fizyczny collider przeniesiony. Wznów i zobacz, czy ciało przejdzie.");
 }else status("Przesmyk już otwarty.");
 render();
}
$("p6-preset").onclick=p6Preset;
$("p6-open").onclick=p6Open;
function p5Preset(){
 world.dispose();
 $("p5-motor").textContent="Wyłącz lokalny napęd";
 world=createCommons({support:$("support").value,
  policy:$("p5-policy").value,seed:1,density:Number($("p5-density").value),topology:$("p5-topology").value});
 firstActorId=null;secondActorId=null;p4MaterialId=null;
 camera={x:13.65,y:13.35,zoom:1.85};
 keys.clear();acc=0;paused=false;$("pause").textContent="Pauza";
 status("P5: swobodny kontakt. Ruch wynika z własnego kierunku, reagowanie wyłącznie z realnych dotknięć.");
 render();
}
function p5Pulse(){
 if(!(world instanceof CommonsYard)){status("Najpierw uruchom Wspólny świat P5.");return;}
 const load=world.loads[0],p=load.body.translation();
 const n=world.exteriorImpulse(load,V(95,25),V(p.x,p.y+.34));
 if(!n)throw Error("P5 physical user pulse refused");
 status("Realne szarpnięcie ruchomej materii; organizmy nie otrzymały rozkazu.");
 render();
}
$("p5-preset").onclick=p5Preset;
$("p5-pulse").onclick=p5Pulse;
$("p5-motor").onclick=()=>{
 if(!(world instanceof CommonsYard))return;
 world.auto=!world.auto;
 $("p5-motor").textContent=world.auto?"Wyłącz lokalny napęd":"Włącz lokalny napęd";
 status(world.auto?"Samodzielny lokalny napęd aktywny.":"Napęd istot wstrzymany. Solver wciąż działa.");render();
};
$("p5-apply-role").onclick=()=>{
 if(!(world instanceof CommonsYard)||!world.chosen)return;
 const a=world.chosen;
 if(!world.local.has(a.id)){
  world.register(a,$("p5-role").value,V(1,0));
 }else world.setRole(a.id,$("p5-role").value);
 world.selected=null;
 status("Fizyczne ciało #"+a.id+" ma lokalną regułę "+$("p5-role").value+". Brak globalnego celu.");render();
};
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
let p4MaterialId=null;
function p4Preset(){
 world.dispose();
 world=new ReflexYard({populated:false,support:$("support").value});
 const actor=world.spawn("small",V(8.95,15));
 const cargo=world.load(10,15,.48,.42,45);
 actor.maxSpeedOverride=1.4;
 world.selected=null;
 let touched=false;
 for(let i=0;i<150;i++){
  world.command(actor,V(1,0));world.step();
  if(world.actualContact(actor,cargo)){touched=true;break;}
 }
 if(!touched)throw Error("Cannot reach true Rapier contact in P4");
 const before={...cargo.body.translation()};
 const link=world.grip(actor.id,cargo.id,{maxImpulse:4});
 if(!link.ok||Math.hypot(before.x-cargo.body.translation().x,before.y-cargo.body.translation().y)>1e-9)
  throw Error("P4 material touch/grip invalid");
 for(let i=0;i<90;i++)world.step();
 const mode=$("reflex-mode").value;
 world.setReflex(actor.id,mode);
 world.setSelected(actor.id);
 firstActorId=null;secondActorId=null;p4MaterialId=cargo.id;
 camera={x:10,y:15,zoom:3.1};keys.clear();paused=false;acc=0;
 $("pause").textContent="Pauza";
 status("P4: realny uchwyt, odruch "+mode+". Szarpnij skrzynię i obserwuj.");
 render();
}
function p4Shock(direction){
 const cargo=world.loads.find(x=>x.id===p4MaterialId);
 if(!cargo){status("Najpierw ustaw scenę Kontakt i uchwyt.");return;}
 const p=cargo.body.translation();
 // Explicit direct experimenter physical impulse, not an NPC decision.
 cargo.body.applyImpulseAtPoint(V(160*direction,0),V(p.x,p.y+.33),true);
 status("Eksperymentator: fizyczny impuls 160 N·s "+(direction>0?"w prawo":"w lewo")+
  ". Reakcja oblicza się później lokalnie.");
 render();
}
$("p4-preset").onclick=p4Preset;
$("p4-shock-right").onclick=()=>p4Shock(1);
$("p4-shock-left").onclick=()=>p4Shock(-1);
$("reflex-mode").onchange=()=>{
 const chosen=world.chosen;
 if(chosen&&typeof world.setReflex==="function"){
  world.setReflex(chosen.id,$("reflex-mode").value);
  status("Odruch fizyczny: "+$("reflex-mode").value);render();
 }
};
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
   else if(mode==="barrier"){
    if(!(world instanceof CommonsYard)){status("Przeszkody edytujesz w P5.");return;}
    world.barrier(p.x,p.y,.20,.85);
   }
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
if(params.has("p7native")){
 window.__p7ReadOnlyProbe=()=>world instanceof DoorCrowdYard?
  world.pressureTrace():null;
}
if(params.has("p7probe")){
 paused=true;
 try{
  const {p7Probe}=await import("./src/p7-probe.js");
  const result=p7Probe();
  document.body.dataset.p7Probe="PASS";
  document.body.dataset.p7Cases=String(result.worlds);
  document.body.dataset.p7Report=encodeURIComponent(JSON.stringify(result));
  status("P7: wieloosobowy rzeczywisty nacisk, bez NPC-owych celów.");
 }catch(e){document.body.dataset.p7Probe="FAIL";
  document.body.dataset.p7Error=String(e.stack||e);console.error(e);}
}
if(params.has("p7frame")){
 paused=true;
 try{
  const {p7Case}=await import("./src/p7-probe.js");
  const policy=params.get("p7frame")==="passive"?"passive":"brace";
  const intervention=params.get("intervention")==="open"?"open":"none";
  world.dispose();
  const result=p7Case({width:2.85,density:6,support:"finite",guardKind:"bulky",
   guardPolicy:policy,moverPolicy:"drive",intervention,
   ticks:460,captureWorld:w=>{world=w;}});
  camera={x:14.2,y:12,zoom:1.85};
  document.body.dataset.p7Frame=JSON.stringify({
   policy,intervention,finite:result.finite,passed:result.passedMouth,
   pressure:result.contactImpulse,guard:result.guard});
  status("P7: fizyczna presja kilku ciał, realny nacisk i obrona.");
 }catch(e){document.body.dataset.p7FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p6recovery")){
 paused=true;
 try{
  const {p6RecoveryProbe}=await import("./src/p6-recovery.js");
  const result=p6RecoveryProbe();
  document.body.dataset.p6Recovery="PASS";
  document.body.dataset.p6RecoveryCases=String(result.cases);
  document.body.dataset.p6RecoveryReport=encodeURIComponent(JSON.stringify(result));
  status("P6: fizyczny nacisk na ścianę → wycofanie → realny obrót → próba.");
 }catch(e){document.body.dataset.p6Recovery="FAIL";
  document.body.dataset.p6RecoveryError=String(e.stack||e);console.error(e);}
}
if(params.has("p6recoverframe")){
 paused=true;
 try{
  const {p6RecoveryCase}=await import("./src/p6-recovery.js");
  const policy=params.get("p6recoverframe");
  if(!["stubborn","recover","stabilized"].includes(policy))throw Error("recovery frame policy");
  world.dispose();
  const result=p6RecoveryCase({width:1.2,support:"finite",policy,
   haltOnCross:policy!=="stubborn",captureWorld:w=>{world=w;}});
  camera={x:14.4,y:12,zoom:2.0};
  document.body.dataset.p6RecoveryFrame=JSON.stringify(result);
  status("P6 fizyczna próba przeciw zaklinowaniu: "+policy);
 }catch(e){document.body.dataset.p6RecoveryFrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p6orientation")){
 paused=true;
 try{
  const {p6OrientationProbe}=await import("./src/p6-orientation.js");
  const result=p6OrientationProbe();
  document.body.dataset.p6Orientation="PASS";
  document.body.dataset.p6OrientationCases=String(result.cases);
  document.body.dataset.p6OrientationReport=encodeURIComponent(JSON.stringify(result));
  status("P6: fizyczny obrót pod momentem, kontra silniejsze pchanie bez obrotu.");
 }catch(e){document.body.dataset.p6Orientation="FAIL";
  document.body.dataset.p6OrientationError=String(e.stack||e);console.error(e);}
}
if(params.has("p6pose")){
 paused=true;
 try{
  const {p6RotateCase}=await import("./src/p6-orientation.js");
  const mode=params.get("p6pose");
  if(!["passive","active","aligned","strong-push","turn-first"].includes(mode))throw Error("mode");
  world.dispose();
  const result=p6RotateCase({mode,width:1.2,support:"finite",
   captureWorld:w=>{world=w;}});
  camera={x:14.5,y:12,zoom:2.0};
  document.body.dataset.p6Pose=JSON.stringify(result);
  status("P6: prawdziwa fizyczna podłużna bryła "+mode+
   ", bez ustawiania pozycji ani kąta.");
 }catch(e){document.body.dataset.p6PoseError=String(e.stack||e);console.error(e);}
}
if(params.has("p6native")){
 window.__p6ReadOnlyProbe=()=>({
  ...world.commonsTrace(),opened:!!world.p6?.opened,
  p6BodyIds:world.p6?.actors??[],center:14.4});
}
if(params.has("p6probe")){
 paused=true;
 try{
  const {p6PressureProbe}=await import("./src/p6-probe.js");
  const outcome=p6PressureProbe();
  document.body.dataset.p6Probe="PASS";
  document.body.dataset.p6Cases=String(outcome.cases);
  document.body.dataset.p6Report=encodeURIComponent(JSON.stringify(outcome));
  status("P6 prawdziwe kształty ciał w fizycznych wąskich przejściach.");
 }catch(e){
  document.body.dataset.p6Probe="FAIL";
  document.body.dataset.p6Error=String(e.stack||e);console.error(e);
 }
}
if(params.has("p6frame")){
 paused=true;
 try{
  world.dispose();world=createP6Commons({support:"finite"});
  for(let i=0;i<430;i++)world.step();
  camera={x:14,y:14.4,zoom:1.75};
  document.body.dataset.p6Frame=JSON.stringify(world.commonsTrace());
  status("P6: prawdziwy solver, cztery ciała, dwa fizyczne przesmyki.");
 }catch(e){document.body.dataset.p6FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p5native")){
 window.__p5ReadOnlyProbe=()=>world instanceof CommonsYard?world.commonsTrace():null;
}
if(params.has("p5probe")){
 paused=true;
 try{
  const {p5Probe}=await import("./src/p5-probe.js");
  const evidence=p5Probe();
  document.body.dataset.p5Probe="PASS";
  document.body.dataset.p5Cases=String(evidence.cases);
  document.body.dataset.p5Report=encodeURIComponent(JSON.stringify(evidence));
  status("P5: pressure counters measured in real freely running 6/10-body worlds.");
 }catch(e){document.body.dataset.p5Probe="FAIL";
  document.body.dataset.p5Error=String(e.stack||e);console.error(e);}
}
if(params.has("p5frame")){
 paused=true;
 try{
  const {p5Case}=await import("./src/p5-probe.js");
  const policy=params.get("p5frame");
  if(!["constant","touch","attach","material"].includes(policy))throw Error("p5 mode");
  const intervention=params.get("shock")==="pulse"?"pulse":"none";
  const seed=Number(params.get("seed")||1);
  world.dispose();
  const result=p5Case({policy,support:"finite",seed,intervention,
   density:6,ticks:330,captureWorld:(w)=>{world=w;}});
  firstActorId=null;secondActorId=null;p4MaterialId=null;
  camera={x:13.65,y:13.35,zoom:1.85};
  document.body.dataset.p5Frame=JSON.stringify(result);
  status("P5: prawdziwe fizyczne kontinuum, bez skryptu zachowania.");
 }catch(e){document.body.dataset.p5FrameError=String(e.stack||e);console.error(e);}
}
if(params.has("p4native")){
 // Read-only physical introspection for genuine Chromium native mouse input.
 window.__p4ReadOnlyProbe=()=>world.reflexTrace();
}
if(params.has("p4axial")){
 paused=true;
 try{
  const {p4AxialDonorRegression}=await import("./src/p4-axial.js");
  const result=await p4AxialDonorRegression();
  document.body.dataset.p4Axial="PASS";
  document.body.dataset.p4AxialCount=String(result.actuallySimulatedPhysicalWorlds);
  document.body.dataset.p4AxialReport=encodeURIComponent(JSON.stringify(result));
  status("P4: audited conservative grip donor under identical P2/P3 real solver scenarios.");
 }catch(e){document.body.dataset.p4Axial="FAIL";
  document.body.dataset.p4AxialError=String(e.stack||e);console.error(e);}
}
if(params.has("p4momentum")){
 paused=true;
 try{
  const {p4ConservationAudit}=await import("./src/p4-conservation.js");
  const result=p4ConservationAudit();
  document.body.dataset.p4Momentum="PASS";
  document.body.dataset.p4MomentumCases=String(result.cases);
  document.body.dataset.p4MomentumReport=encodeURIComponent(JSON.stringify(result));
  status("P4: physical impulse conservation forensic, original P2 link vs axial null.");
 }catch(e){document.body.dataset.p4Momentum="FAIL";
  document.body.dataset.p4MomentumError=String(e.stack||e);console.error(e);}
}
if(params.has("p4hard")){
 paused=true;
 try{
  const {p4BreakRedTeam}=await import("./src/p4-probe.js");
  const v=p4BreakRedTeam();
  document.body.dataset.p4Hard="PASS";
  document.body.dataset.p4HardCases=String(v.cases);
  document.body.dataset.p4HardData=encodeURIComponent(JSON.stringify(v));
  status("P4: genuine adversarial grip-break source, no policy victory manufactured.");
 }catch(e){document.body.dataset.p4Hard="FAIL";
  document.body.dataset.p4HardError=String(e.stack||e);console.error(e);}
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
