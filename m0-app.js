import {V,DT} from "./src/m0-world.js";
import {EncounterField} from "./src/e1-encounter.js";
const $=id=>document.getElementById(id),canvas=$("lab"),ctx=canvas.getContext("2d");
const keys=new Set();
let field=new EncounterField(),paused=false,mode="",drag=null;
let camera={x:22,y:13.5,zoom:1.0},last=performance.now(),acc=0;
let pointer=V(22,13.5),lastDraw=0;
const color={rigid:"#e7b574",chain:"#8bd1ed",compliant:"#b3e9a2"};
const names={rigid:"Zwarty",chain:"Członowany",compliant:"Podatny"};
function report(s){$("message").textContent=s;}
function reset(){
 field.dispose();field=new EncounterField({reflex:$("reflex").checked,
  initiative:$("initiative").checked,pressureResponse:$("response").checked});
 paused=false;mode="";drag=null;acc=0;last=performance.now();
 $("pause").textContent="Pauza";report("Nowy wspólny świat. Przesuwaj fizyczne źródła, obserwuj i zmieniaj reakcje.");
}
function resize(){
 const r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const scale=Math.min(canvas.width/44,canvas.height/27)*camera.zoom;
 return {scale,w,h,r};
}
function worldPoint(e){
 const {scale,r,w,h}=resize();
 return V(camera.x+((e.clientX-r.left)*w/r.width-w/2)/scale,
   camera.y+((e.clientY-r.top)*h/r.height-h/2)/scale);
}
function circ(p,r,fill,stroke="#182d31"){
 ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
 ctx.lineWidth=.06;ctx.strokeStyle=stroke;ctx.stroke();
}
function bodyRect(p,angle,hx,hy,fill,stroke="#234252"){
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
 ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=.06;
 ctx.fillRect(-hx,-hy,2*hx,2*hy);ctx.strokeRect(-hx,-hy,2*hx,2*hy);ctx.restore();
}
function line(p,q,color,w=.05){
 ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p.x,p.y);
 ctx.lineTo(q.x,q.y);ctx.stroke();
}
function draw(){
 const {scale,w,h}=resize();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#12232d";ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(w/2,h/2);ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);
 ctx.lineWidth=.025;ctx.strokeStyle="#263e49";
 const minx=camera.x-w/(scale*2),maxx=camera.x+w/(scale*2);
 const miny=camera.y-h/(scale*2),maxy=camera.y+h/(scale*2);
 for(let x=Math.floor(minx/2)*2;x<=maxx;x+=2){ctx.beginPath();ctx.moveTo(x,miny);ctx.lineTo(x,maxy);ctx.stroke();}
 for(let y=Math.floor(miny/2)*2;y<=maxy;y+=2){ctx.beginPath();ctx.moveTo(minx,y);ctx.lineTo(maxx,y);ctx.stroke();}
 for(const o of field.objects){
  const p=o.body.translation();
  if(o.isScent){
   // The ring is ONLY visual annotation; physical collider is the small box.
   ctx.fillStyle=o.signature==="amber"?"rgba(247,191,96,.07)":"rgba(109,213,226,.07)";
   ctx.beginPath();ctx.arc(p.x,p.y,7.4,0,Math.PI*2);ctx.fill();
  }
  bodyRect(p,o.body.rotation(),o.hx,o.hy,
    o.kind==="fixed"?"#516675":o.isScent?
      (o.signature==="amber"?"#edbf75":"#7ed8e1"):"#a2ae9d");
  if(o.isScent){
   ctx.strokeStyle=o.signature==="amber"?"#eab061":"#70d8df";
   ctx.lineWidth=.035;ctx.beginPath();ctx.arc(p.x,p.y,.55,0,Math.PI*2);ctx.stroke();
  }
 }
 for(const a of field.actors){
  const base=color[a.kind],highlight=a.id===field.selected;
  if(a.kind==="compliant"){
   // Graphic outline only, NOT a continuous physical membrane/collider.
   const pts=a.parts.slice(1).map(part=>part.body.translation());
   ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
   ctx.closePath();ctx.fillStyle="rgba(154,224,159,.08)";ctx.fill();
   ctx.strokeStyle="rgba(168,235,175,.38)";ctx.lineWidth=.06;ctx.stroke();
   const center=a.root.translation();
   for(const p of pts)line(center,p,"rgba(158,228,171,.28)",.025);
  } else if(a.kind==="chain"){
   for(let i=1;i<a.parts.length;i++)line(a.parts[i-1].body.translation(),
    a.parts[i].body.translation(),"rgba(169,216,238,.46)",.1);
  }
  a.parts.forEach((part,i)=>{
   const p=part.body.translation();
   const stroke=highlight?"#fff1ad":"#243946";
   if(part.shape.type==="ball")circ(p,part.shape.r,base,stroke);
   else bodyRect(p,part.body.rotation(),part.shape.hx,part.shape.hy,base,stroke);
  });
  const p=a.root.translation(),theta=a.root.rotation();
  if(a.motive){
   const dest=V(p.x+Math.cos(a.motive.heading)*.75,p.y+Math.sin(a.motive.heading)*.75);
   line(p,dest,a.role==="holder"?"#ecb274":a.role==="wary"?"#d8a9b5":"#b1def1",.045);
   if($("show-senses").checked&&a.id===field.selected){
    ctx.strokeStyle="#a9d9ba";ctx.lineWidth=.035;ctx.setLineDash([.12,.14]);
    ctx.beginPath();ctx.arc(p.x,p.y,a.role==="holder"?7.2:a.role==="wary"?8.4:9.5,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);
    if(a.motive.attention)line(p,a.motive.attention,"#ffeda8",.050);
   }
  }
  circ(V(p.x+Math.cos(theta)*.34,p.y+Math.sin(theta)*.34),.095,"#163442","#163442");
  if(highlight){ctx.strokeStyle="#ffec9f";ctx.lineWidth=.045;ctx.beginPath();ctx.arc(p.x,p.y,1.24,0,Math.PI*2);ctx.stroke();}
  if(a.pressure>0.1){ctx.strokeStyle="#ff8a6b";ctx.lineWidth=Math.min(.15,.02+a.pressure*.00015);
   ctx.beginPath();ctx.arc(p.x,p.y,1.36,0,Math.PI*2);ctx.stroke();}
 }
 if(drag&&drag.kind==="poke"){
  line(drag.origin,drag.current,"#ffb578",.10);
  circ(drag.origin,.12,"#ffb578");
 }
 if(mode.startsWith("add-"))circ(pointer,.2,"#f4e0a3");
 ctx.restore();
 $("time").textContent=(field.ticks*DT).toFixed(1)+" s";
 $("count").textContent=field.actors.length+" istot · "+field.cues.length+" ruchome źródła · "+field.objects.filter(o=>o.kind==="free"&&!o.isScent).length+" pozostałe bryły";
 $("contacts").textContent=field.contactPairs+" incidencji kontaktu · "+field.lastContactImpulse.toFixed(1)+" N·s";
 $("energy").textContent=field.episodes.contactReactions+" reakcji ruchu · "+field.episodes.steering+" zmian trybu · "+field.externalImpulse.toFixed(0)+" N·s z zewnątrz";
 const a=field.selectedActor;
 $("selection").textContent=a?names[a.kind]+" · "+a.parts.length+" dynamicznych części":"Brak zaznaczenia";
 $("selected-state").textContent=a?
   "Stan: "+(a.motive?.status??"—")+" · reakcji "+(a.motive?.reactEvents??0)+
   " · lokalnych obserwacji "+(a.motive?.senseEvents??0)+" · napęd proxy "+a.motorTicks+
   " · nacisk "+a.pressure.toFixed(1)+" N·s":"Kliknij ciało, aby przejąć sterowanie.";
 if(a&&document.activeElement!==$("role"))$("role").value=a.role;
 $("run-status").textContent=paused?"PAUZA / edycja":field.initiative?"LOKALNE DZIAŁANIE · NIE NPC AI":"INICJATYWA OFF · fizyka działa";
}
function controls(){
 const x=+(keys.has("KeyD")||keys.has("ArrowRight"))-+(keys.has("KeyA")||keys.has("ArrowLeft"));
 const y=+(keys.has("KeyS")||keys.has("ArrowDown"))-+(keys.has("KeyW")||keys.has("ArrowUp"));
 return {direction:V(x,y),aim:null};
}
function frame(t){
 const dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;
 if(!paused){
  acc+=dt;let steps=0;
  while(acc>=DT&&steps<4){field.step(controls());acc-=DT;steps++;}
  if(steps===4)acc=Math.min(acc,DT*2);
 }
 if(t-lastDraw>70){draw();lastDraw=t;}
 requestAnimationFrame(frame);
}
function tool(name){
 mode=mode===name?"":name;
 document.querySelectorAll(".toolbar button").forEach(b=>b.classList.toggle("active",
  b.id==="poke"&&mode==="poke"||b.id===mode));
 report(mode?"Tryb: "+mode+". Kliknij/przeciągnij w obrębie pola.":"Tryb normalny.");
}
$("pause").onclick=()=>{
 paused=!paused;acc=0;$("pause").textContent=paused?"Wznów":"Pauza";draw();
};
$("step").onclick=()=>{
 if(!paused){report("Najpierw włącz pauzę.");return;}
 field.step(controls());draw();
};
$("reset").onclick=reset;
$("initiative").onchange=()=>{field.initiative=$("initiative").checked;report("Inicjatywa "+(field.initiative?"ON":"OFF"));};
$("response").onchange=()=>{field.pressureResponse=$("response").checked;report("Zmiana decyzji po nacisku "+(field.pressureResponse?"ON":"OFF"));};
$("release").onclick=()=>{field.select(null);report("Oddano ciało: ma znów własne lokalne pobudki.");};
$("role").onchange=()=>{if(field.selected)field.setRole(field.selected,$("role").value);};
$("show-senses").onchange=draw;

$("poke").onclick=()=>tool("poke");
for(const kind of ["rigid","chain","compliant"])$("add-"+kind).onclick=()=>tool("add-"+kind);
$("add-matter").onclick=()=>tool("add-matter");
$("add-scent").onclick=()=>tool("add-scent");
$("reflex").onchange=()=>{field.reflex=$("reflex").checked;report("Wewnętrzne odruchy "+(field.reflex?"ON":"OFF")+"; bierne sprężyny pozostają.");};
$("impulse").oninput=()=>$("impulse-value").textContent=$("impulse").value;
window.addEventListener("keydown",e=>{
 if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
 if(e.code==="Escape"){mode="";drag=null;tool("noop");mode="";draw();}
 keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
canvas.addEventListener("contextmenu",e=>e.preventDefault());
canvas.addEventListener("wheel",e=>{e.preventDefault();camera.zoom=Math.max(.36,Math.min(4.5,camera.zoom*Math.exp(-e.deltaY*.0012)));draw();},{passive:false});
canvas.addEventListener("pointerdown",e=>{
 const p=worldPoint(e);pointer=p;
 if(e.button===1){drag={kind:"pan",clientX:e.clientX,clientY:e.clientY};(e.isTrusted&&canvas.setPointerCapture(e.pointerId));return;}
 if(e.button!==0)return;
 if(mode==="poke"){drag={kind:"poke",origin:p,current:p};(e.isTrusted&&canvas.setPointerCapture(e.pointerId));return;}
 if(mode.startsWith("add-")){
  if(mode==="add-matter")field.addFree(p.x,p.y,.53,.47,55);
  else if(mode==="add-scent")field.addScent(p,"amber");
  else{let a=field.addCreature(mode.slice(4),p,$("role").value);field.select(a.id);}
  tool(mode);mode="";draw();return;
 }
 const found=field.pick(p);
 if(found?.kind==="actor")field.select(found.id);
 if(paused&&e.ctrlKey&&found){
  drag={kind:"move",found,origin:p};
  (e.isTrusted&&canvas.setPointerCapture(e.pointerId));
 }
 draw();
});
canvas.addEventListener("pointermove",e=>{
 const p=worldPoint(e);pointer=p;
 if(!drag){return;}
 if(drag.kind==="poke"){drag.current=p;draw();}
 if(drag.kind==="pan"){
  const {scale}=resize();
  camera.x-=(e.clientX-drag.clientX)/scale;
  camera.y-=(e.clientY-drag.clientY)/scale;
  drag.clientX=e.clientX;drag.clientY=e.clientY;draw();
 }
 if(drag.kind==="move"){
  if(drag.found.kind==="actor")field.poseActor(drag.found.id,p);
  else field.poseObject(drag.found.index,p);
  draw();
 }
});
canvas.addEventListener("pointerup",e=>{
 if(!drag)return;
 const d=drag;drag=null;
 if(d.kind==="poke"){
  const p=worldPoint(e),v=V(p.x-d.origin.x,p.y-d.origin.y),len=Math.hypot(v.x,v.y);
  if(len>.08){
   const mag=Number($("impulse").value);
   const ok=field.poke(d.origin,V(v.x/len*mag,v.y/len*mag));
   report(ok?"Rzeczywisty impuls eksperymentatora "+mag+" N·s.":"Nie trafiłeś w dynamiczny collider.");
  }
  mode="";document.querySelectorAll(".toolbar button").forEach(b=>b.classList.remove("active"));
 }
 draw();
});
canvas.addEventListener("pointercancel",()=>{drag=null;draw();});
draw();requestAnimationFrame(frame);
document.body.dataset.live="yes";


if(new URLSearchParams(location.search).has("e1probe")){
 try{
  paused=true;
  const {runE1Probe}=await import("./src/e1-probe.js");
  const batch=new URLSearchParams(location.search).get("e1probe");
  document.body.dataset.e1Probe=JSON.stringify(runE1Probe(batch));
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}
if(new URLSearchParams(location.search).has("e1frames")){
 try{
  paused=true;field.select(null);
  const stages=[];
  for(let i=0;i<=480;i++){
   if(i>0)field.step();
   if([0,120,240,360,480].includes(i)){
    draw();
    const state=field.getTrace();
    stages.push({tick:i,actors:state.actors.map(a=>({
     kind:a.kind,role:a.role,x:a.x,y:a.y,state:a.state})),
      contactEvents:state.episodes.contactReactions,
      actionTicks:state.actors.reduce((z,a)=>z+a.autonomousTicks,0),
      frame:canvas.toDataURL("image/png")});
   }
  }
  document.body.dataset.e1Frames=JSON.stringify(stages);
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}
if(new URLSearchParams(location.search).has("e1ownercheck")){
 try{
  paused=true;field.select(null);
  const check=(value,label)=>{if(!value)throw Error("E1 UI "+label);};
  const toClient=p=>{
   const d=resize();
   return {clientX:d.r.left+(d.w/2+(p.x-camera.x)*d.scale)*d.r.width/d.w,
    clientY:d.r.top+(d.h/2+(p.y-camera.y)*d.scale)*d.r.height/d.h};
  };
  check(field.actors.length===18&&field.cues.length===4,"composed same scene");
  const p=field.actors.find(a=>a.kind==="rigid").root.translation();
  canvas.dispatchEvent(new PointerEvent("pointerdown",{
   ...toClient(p),button:0,bubbles:true,pointerId:111}));
  check(field.selectedActor?.kind==="rigid","real collider selection");
  const selected=field.selectedActor;
  $("role").value="wary";$("role").dispatchEvent(new Event("change",{bubbles:true}));
  check(selected.role==="wary","independent role edit");
  const x=selected.root.translation().x;
  window.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyD",bubbles:true}));
  for(let i=0;i<65;i++)field.step(controls());
  window.dispatchEvent(new KeyboardEvent("keyup",{code:"KeyD",bubbles:true}));
  check(selected.root.translation().x-x>.15,"real manual root control");
  $("release").click();
  check(field.selected===null,"agent release");
  const prior=field.actors.reduce((s,a)=>s+a.autoMotorTicks,0);
  for(let i=0;i<55;i++)field.step();
  check(field.actors.reduce((s,a)=>s+a.autoMotorTicks,0)>prior,"local initiative resumes");
  $("initiative").click();check(!field.initiative,"global initiative switch OFF");
  const before=field.actors.reduce((s,a)=>s+a.autoMotorTicks,0);
  for(let i=0;i<30;i++)field.step();
  check(field.actors.reduce((s,a)=>s+a.autoMotorTicks,0)===before,"no invisible auto motor");
  $("initiative").click();
  $("response").click();check(!field.pressureResponse,"contact-conditioned decisions OFF");
  const src=field.cues[0],old=src.body.translation(),idx=field.objects.indexOf(src);
  const destination=V(old.x+1.4,old.y+1.8);
  const point=V(old.x,old.y);
  canvas.dispatchEvent(new PointerEvent("pointerdown",{
   ...toClient(point),button:0,bubbles:true,pointerId:112,ctrlKey:true}));
  canvas.dispatchEvent(new PointerEvent("pointermove",{
   ...toClient(destination),button:0,bubbles:true,pointerId:112,ctrlKey:true}));
  canvas.dispatchEvent(new PointerEvent("pointerup",{
   ...toClient(destination),button:0,bubbles:true,pointerId:112}));
  check(Math.hypot(src.body.translation().x-old.x,src.body.translation().y-old.y)>1,
    "live editor moves actual source physics collider");
  check(field.objects[idx]===src,"source keeps material identity");
  $("reset").click();
  check(field.actors.length===18&&field.cues.length===4&&field.ticks===0,
    "whole scene fresh reset");
  document.body.dataset.e1Ownercheck=JSON.stringify({
   pass:true,actualColliderClick:true,manualMotor:true,roleEdit:true,
   controlledAutonomyOff:true,liveSourcePose:true,
   exactPhysicalIdentity:true,reset:true,notOwnerFeel:true});
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}

if(new URLSearchParams(location.search).has("e1causal")){
 try{
  paused=true;
  const {runE1Causality}=await import("./src/e1-causality.js");
  const mode=new URLSearchParams(location.search).get("e1causal");
  document.body.dataset.e1Causal=JSON.stringify(runE1Causality(mode));
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}
