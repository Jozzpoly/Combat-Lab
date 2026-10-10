import {M0Field,V,DT} from "./src/m0-world.js";
const $=id=>document.getElementById(id),canvas=$("lab"),ctx=canvas.getContext("2d");
const keys=new Set();
let field=new M0Field(),paused=false,mode="",drag=null;
let camera={x:22,y:13.5,zoom:1.0},last=performance.now(),acc=0;
let pointer=V(22,13.5),lastDraw=0;
const color={rigid:"#e7b574",chain:"#8bd1ed",compliant:"#b3e9a2"};
const names={rigid:"Zwarty",chain:"Członowany",compliant:"Podatny"};
function report(s){$("message").textContent=s;}
function reset(){
 field.dispose();field=new M0Field({reflex:$("reflex").checked});
 paused=false;mode="";drag=null;acc=0;last=performance.now();
 $("pause").textContent="Pauza";report("Nowe materialne ciała. Kliknij jedno i spróbuj wywrzeć nacisk na inne.");
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
  bodyRect(p,o.body.rotation(),o.hx,o.hy,o.kind==="fixed"?"#516675":"#a2ae9d");
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
 $("count").textContent=field.actors.length+" organizmów · "+field.objects.filter(o=>o.kind==="free").length+" swobodnych przedmiotów";
 $("contacts").textContent=field.contactPairs+" incidencji kontaktu · "+field.lastContactImpulse.toFixed(1)+" N·s";
 $("energy").textContent=field.reflexEvents+" reakcji · "+field.externalImpulse.toFixed(0)+" N·s impulsy badacza";
 const a=field.selectedActor;
 $("selection").textContent=a?names[a.kind]+" · "+a.parts.length+" dynamicznych części":"Brak zaznaczenia";
 $("selected-state").textContent=a?
   "Nacisk "+a.pressure.toFixed(2)+" N·s · odruchy "+a.responseEvents+
   " · wejścia napędu "+a.motorTicks+" · prędkość "+Math.hypot(a.root.linvel().x,a.root.linvel().y).toFixed(2)+" m/s":"Kliknij organizm.";
 $("run-status").textContent=paused?"PAUZA / edycja":"FIZYKA DZIAŁA / jakość NIEOCENIONA";
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
$("poke").onclick=()=>tool("poke");
for(const kind of ["rigid","chain","compliant"])$("add-"+kind).onclick=()=>tool("add-"+kind);
$("add-matter").onclick=()=>tool("add-matter");
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
 if(e.button===1){drag={kind:"pan",clientX:e.clientX,clientY:e.clientY};canvas.setPointerCapture(e.pointerId);return;}
 if(e.button!==0)return;
 if(mode==="poke"){drag={kind:"poke",origin:p,current:p};canvas.setPointerCapture(e.pointerId);return;}
 if(mode.startsWith("add-")){
  if(mode==="add-matter")field.addFree(p.x,p.y,.53,.47,55);
  else{let a=field.addActor(mode.slice(4),p);field.select(a.id);}
  tool(mode);mode="";draw();return;
 }
 const found=field.pick(p);
 if(found?.kind==="actor")field.select(found.id);
 if(paused&&e.ctrlKey&&found){
  drag={kind:"move",found,origin:p};
  canvas.setPointerCapture(e.pointerId);
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
if(new URLSearchParams(location.search).has("probe")){
 try{
  const {runM0Probe}=await import("./src/m0-probe.js");
  document.body.dataset.m0Probe=JSON.stringify(runM0Probe());
  // Diagram of a real, unretouched world frame for agent visual audit.
  draw();document.body.dataset.m0Frame=canvas.toDataURL("image/png");
 }catch(error){
  document.body.dataset.liveError=String(error.stack||error);
  $("run-status").textContent="PROBE FAILED";report(String(error));console.error(error);
 }
}
if(new URLSearchParams(location.search).has("frames")){
 try{
  // ONE real world and ONE continuous fixed-step timeline. Not 3 separately
  // initialized screenshots disguised as temporal evolution.
  field.select(field.actors[0].id);
  const stages=[{tick:0,actors:field.sample().actors,frame:canvas.toDataURL("image/png")}];
  for(let i=1;i<=240;i++){
   field.step({direction:i<=200?V(1,0):V()});
   if(i===80||i===160||i===240){
    draw();
    stages.push({tick:i,actors:field.sample().actors,frame:canvas.toDataURL("image/png")});
   }
  }
  document.body.dataset.m0Frames=JSON.stringify(stages);
 }catch(error){document.body.dataset.liveError=String(error.stack||error);}
}

if(new URLSearchParams(location.search).has("fairm0")){
 try{
  const {fairM0}=await import("./src/m0-fair-pressure.js");
  document.body.dataset.m0Fair=JSON.stringify(fairM0());
 }catch(error){document.body.dataset.liveError=String(error.stack||error);}
}
