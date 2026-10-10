import {V,DT} from "./src/m0-world.js";
import {MaterialCommons} from "./src/w2-world.js";
const $=id=>document.getElementById(id),canvas=$("lab"),ctx=canvas.getContext("2d");
const keys=new Set();
let field=new MaterialCommons(),paused=false,mode="",drag=null,activeCue=null;
let camera={x:22,y:13.5,zoom:1.0},last=performance.now(),acc=0;
let pointer=V(22,13.5),lastDraw=0;
let stepCpuSamples=0,stepCpuSum=0;
const color={rigid:"#e7b574",chain:"#8bd1ed",compliant:"#b3e9a2",folding:"#e0a5c7","rival-narrow":"#b5b9de","rival-wide":"#e1bfa8"};
const names={rigid:"Zwarty",chain:"Członowany",compliant:"Podatny",folding:"Składany","rival-narrow":"Prosty wąski","rival-wide":"Prosty szeroki"};
function report(s){$("message").textContent=s;}
function reset(){
 field.dispose();field=new MaterialCommons({reflex:$("reflex").checked,
  initiative:$("initiative").checked,pressureResponse:$("response").checked});
 paused=false;mode="";drag=null;activeCue=null;acc=0;last=performance.now();
 stepCpuSamples=0;stepCpuSum=0;
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
  const base=color[a.morphology??a.kind],highlight=a.id===field.selected;
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
 $("profile").textContent=stepCpuSamples>0?"CPU fizyka: "+(stepCpuSum/stepCpuSamples).toFixed(2)+" ms/krok (lokalnie)":"CPU fizyka: —";
 const a=field.selectedActor;
 $("selection").textContent=a?names[a.morphology??a.kind]+" · "+a.parts.length+" dynamicznych części":activeCue?"Fizyczne źródło · "+activeCue.signature:"Brak zaznaczenia";
 $("selected-state").textContent=a?
   "Stan: "+(a.motive?.status??"—")+" · reakcji "+(a.motive?.reactEvents??0)+
   " · lokalnych obserwacji "+(a.motive?.senseEvents??0)+" · napęd proxy "+a.motorTicks+
   " · nacisk "+a.pressure.toFixed(1)+" N·s"+(a.morphology==="folding"?" · obrys "+field.extent(a).spanY.toFixed(2)+" m · "+a.foldPolicy+" · fold "+a.foldTarget:""):activeCue?"6 kg ruchomej materii · sygnał zmienisz poniżej":"Kliknij ciało lub źródło bodźca.";
 if(a&&document.activeElement!==$("role"))$("role").value=a.role;
 if(activeCue&&document.activeElement!==$("cue-signature"))$("cue-signature").value=activeCue.signature;
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
  while(acc>=DT&&steps<4){
    const before=performance.now();
    field.step(controls());
    const measured=performance.now()-before;
    if(Number.isFinite(measured)&&measured>=0){stepCpuSum+=measured;stepCpuSamples++;}
    if(stepCpuSamples>300){stepCpuSum*=.5;stepCpuSamples=Math.floor(stepCpuSamples*.5);}
    acc-=DT;steps++;
   }
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
$("release").onclick=()=>{field.select(null);activeCue=null;report("Oddano ciało: ma znów własne lokalne pobudki.");};
$("role").onchange=()=>{if(field.selected)field.setRole(field.selected,$("role").value);};
$("cue-signature").onchange=()=>{if(activeCue){activeCue.signature=$("cue-signature").value;
 report("Zmieniono tylko sygnał fizycznego źródła, bez przesuwania collidera.");}};
$("show-senses").onchange=draw;

$("poke").onclick=()=>tool("poke");
for(const kind of ["rigid","chain","compliant","folding","rival-narrow","rival-wide"])$("add-"+kind).onclick=()=>tool("add-"+kind);
$("add-matter").onclick=()=>tool("add-matter");
$("add-scent").onclick=()=>tool("add-scent");
$("spawn-group").onclick=()=>tool("spawn-group");
$("reflex").onchange=()=>{field.reflex=$("reflex").checked;report("Wewnętrzne odruchy "+(field.reflex?"ON":"OFF")+"; bierne sprężyny pozostają.");};
$("impulse").oninput=()=>$("impulse-value").textContent=$("impulse").value;
window.addEventListener("keydown",e=>{
 if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
 if(e.code==="KeyQ"&&field.selected)field.setFold(field.selected,1);
 if(e.code==="KeyE"&&field.selected)field.setFold(field.selected,0);
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
 if(mode==="spawn-group"){
  // Explicit group creation by Owner at a location of choice. No invisible
  // movement to this point afterwards, no path goals. Keeps all bodies real.
  if(field.actors.length>140){report("Wstrzymano dodawanie: skrajne obciążenie solvera. Zachowaj scenę lub zresetuj.");return;}
  const forms=["rigid","chain","compliant"],roles=["holder","seeker","wary"];
  for(let i=0;i<12;i++){
   const offset=V((i%4-1.5)*1.65,(Math.floor(i/4)-1)*1.85);
   field.addCreature(forms[i%3],V(p.x+offset.x,p.y+offset.y),roles[(i+1)%3]);
  }
  field.select(null);activeCue=null;tool(mode);mode="";draw();return;
 }
 if(mode.startsWith("add-")){
  if(mode==="add-matter")field.addFree(p.x,p.y,.53,.47,55);
  else if(mode==="add-scent")field.addScent(p,$("cue-signature").value);
  else{let a=field.addCreature(mode.slice(4),p,$("role").value);field.select(a.id);}
  tool(mode);mode="";draw();return;
 }
 const found=field.pick(p);
 if(found?.kind==="actor"){activeCue=null;field.select(found.id);}
 if(found?.kind==="object"&&field.objects[found.index]?.isScent){
  activeCue=field.objects[found.index];field.select(null);
  $("cue-signature").value=activeCue.signature;
 }
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



$("fold").onclick=()=>{if(field.selected&&field.setFold(field.selected,1))
 report("Rzeczywiste składanie przez dwa zawiasy. Polecenie operatora, nie decyzja NPC.");
 else report("Zaznacz wieloczłonowe ciało składane.");draw();};
$("unfold").onclick=()=>{if(field.selected&&field.setFold(field.selected,0))
 report("Rozkładanie ograniczonym momentem; materia może zablokować skrzydła.");
 else report("Zaznacz wieloczłonowe ciało składane.");draw();};
$("fold-policy").onclick=()=>{
 const a=field.selectedActor;
 if(a?.morphology!=="folding"){report("Zaznacz ciało składane.");return;}
 const next=a.foldPolicy==="manual"?"pressure":"manual";
 field.setBodyPolicy(a.id,next);
 report(next==="pressure"?"Prosta reakcja na LOKALNY poprzedni nacisk/sąsiadów.":
  "Sterowanie skrzydłami przez operatora.");
 draw();
};
if(new URLSearchParams(location.search).has("w2probe")){
 try{
  paused=true;
  const {runW2Probe}=await import("./src/w2-probe.js");
  document.body.dataset.w2Probe=JSON.stringify(runW2Probe(
   new URLSearchParams(location.search).get("w2probe")));
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}
if(new URLSearchParams(location.search).has("w2ownercheck")){
 try{
  paused=true;field.select(null);
  const check=(v,k)=>{if(!v)throw Error("W2 real UI "+k);};
  check(field.actors.length===20&&field.actors.filter(a=>a.morphology==="folding").length===2,
   "20 mixed physical organisms with 2 new real articulated bodies");
  $("add-folding").click();
  const pointer=(p)=>{
   const d=resize();return {
    clientX:d.r.left+(d.w/2+(p.x-camera.x)*d.scale)*d.r.width/d.w,
    clientY:d.r.top+(d.h/2+(p.y-camera.y)*d.scale)*d.r.height/d.h};
  };
  canvas.dispatchEvent(new PointerEvent("pointerdown",{
   ...pointer(V(22,13.5)),button:0,bubbles:true,pointerId:122}));
  check(field.actors.length===21&&field.selectedActor?.morphology==="folding",
   "operator creates true 3-body organism inside one living world");
  const actor=field.selectedActor;
  $("fold").click();
  check(actor.foldTarget===1,"actual UI requests fold");
  for(let i=0;i<150;i++)field.step();
  const narrow=field.extent(actor).spanY;
  check(narrow<1.4&&actor.wings.every(w=>w.joint.contactsEnabled()),
   "true material narrow form with real connected contact");
  $("unfold").click();
  for(let i=0;i<150;i++)field.step();
  const wide=field.extent(actor).spanY;
  check(wide>3.0&&wide>narrow+1.4,"true material wings expand by actual torque");
  $("fold-policy").click();
  check(actor.foldPolicy==="pressure","UI pressure policy toggled");
  $("fold-policy").click();
  check(actor.foldPolicy==="manual","UI manual policy restored");
  $("initiative").click();check(!field.initiative,"autonomy override OFF");
  $("initiative").click();check(field.initiative,"autonomy override ON");
  $("pause").click();check(!paused,"pause/resume state");
  $("pause").click();check(paused,"pause restored");
  $("reset").click();
  check(field.ticks===0&&field.actors.length===20,"reset produces unmodified shared world");
  document.body.dataset.w2Ownercheck=JSON.stringify({
   pass:true,source:"actual DOM controls and Rapier2D in emitted browser",
   originalActors:20,operatorAdd:true,connectedJoints:true,foldedWidth:narrow,
   unfoldedWidth:wide,autonomySwitch:true,localPolicyButton:true,reset:true,
   ownerFeel:"UNKNOWN",rootTraction:"external planar proxy"});
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}

if(new URLSearchParams(location.search).has("w2frames")){
 try{
  paused=true;field.select(null);
  const frames=[];
  for(let i=0;i<=420;i++){
   if(i>0)field.step();
   if([0,180,420].includes(i)){
    draw();
    const trace=field.morphologyTrace();
    frames.push({tick:i,
     source:{actorCount:trace.physicalActorCount,foldables:trace.foldables,
      pressurePolicySwitches:trace.pressurePolicySwitches},
     png:canvas.toDataURL("image/png")});
   }
  }
  document.body.dataset.w2Frames=JSON.stringify(frames);
 }catch(error){document.body.dataset.liveError=String(error.stack||error);console.error(error);}
}
