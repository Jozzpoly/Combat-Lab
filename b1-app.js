import {EnvelopeField} from "./src/b1-world.js";
import {DT,V} from "./src/m0-world.js";
const $=id=>document.getElementById(id),canvas=$("lab"),ctx=canvas.getContext("2d"),keys=new Set();
let world=null,paused=false,last=performance.now(),acc=0,zoom=1,drag=false,ms=0,n=0;
let sideThings=[];
function installSideBodies(){
 for(const t of sideThings){
  if(world.objects.includes(t.item)){
   world.world.removeRigidBody(t.item.body);
   world.objects.splice(world.objects.indexOf(t.item),1);
  }
 }
 sideThings=[];
 for(const y of [11.95,15.05]){
  world.addFree(30.5,y,.42,.32,40);
  const item=world.objects[world.objects.length-1];
  sideThings.push({item,x:30.5,y});
 }
 world.world.propagateModifiedBodyPositionsToColliders();
 }
function status(s){$("message").textContent=s;}
function setup(){
 world?.dispose();sideThings=[];
 world=new EnvelopeField({kind:$("kind").value,
  holdHeading:$("heading").checked,torqueCap:Number($("torque").value),
  hingeMount:"front",selfContact:true,withMatter:false});
 world.setFold(0);world.setAperture(Number($("width").value));
 installSideBodies();
 paused=false;drag=false;acc=0;last=performance.now();ms=0;n=0;
 $("pause").textContent="Pauza";
 status("Ten świat jest fizyczny. Przeprowadź obrys przez szczelinę lub zniszcz założenie testu.");
 draw();
}
function geometry(){
 const b=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
 const w=Math.max(2,Math.round(b.width*dpr)),h=Math.max(2,Math.round(b.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const scale=Math.min(w/44,h/27)*zoom;
 return {b,w,h,scale};
}
function point(e){
 const g=geometry(),u=(e.clientX-g.b.left)/g.b.width,v=(e.clientY-g.b.top)/g.b.height;
 return V(22+(u-.5)*g.w/g.scale,13.5+(v-.5)*g.h/g.scale);
}
function bodyRect(p,a,hx,hy,color,stroke="#1b3642"){
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
 ctx.fillStyle=color;ctx.strokeStyle=stroke;ctx.lineWidth=.06;
 ctx.fillRect(-hx,-hy,hx*2,hy*2);ctx.strokeRect(-hx,-hy,hx*2,hy*2);ctx.restore();
}
function draw(){
 if(!world)return;
 const g=geometry();
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#142a35";ctx.fillRect(0,0,g.w,g.h);
 ctx.save();ctx.translate(g.w/2,g.h/2);ctx.scale(g.scale,g.scale);ctx.translate(-22,-13.5);
 ctx.lineWidth=.025;ctx.strokeStyle="#2b414b";
 for(let x=0;x<=44;x+=2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,27);ctx.stroke();}
 for(let y=0;y<=27;y+=2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(44,y);ctx.stroke();}
 for(const o of world.objects){
  const p=o.body.translation();
  bodyRect(p,o.body.rotation(),o.hx,o.hy,
   o.kind==="fixed"?"#596d77":"#b8a895","#1b3540");
 }
 const a=world.actor;for(let i=0;i<a.parts.length;i++){
  const part=a.parts[i],p=part.body.translation();
  bodyRect(p,part.body.rotation(),part.shape.hx,part.shape.hy,
    i===0?"#e2c68b":"#8dc5df",i===0?"#d5e9d9":"#e3f2ec");
 }
 const p=a.root.translation(),rot=a.root.rotation();
 ctx.strokeStyle="#fbcb80";ctx.lineWidth=.07;ctx.beginPath();
 ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(rot)*.75,p.y+Math.sin(rot)*.75);ctx.stroke();
 ctx.restore();
 const state=world.output();
 const sideDX=sideThings.map(x=>x.item.body.translation().x-x.x);
 const sideDY=sideThings.map(x=>x.item.body.translation().y-x.y);
 $("width-val").textContent=Number($("width").value).toFixed(2)+" m";
 $("readout").innerHTML="<div><b>"+(paused?"PAUZA / EDYCJA":"FIZYKA DZIAŁA")+"</b></div>"+
 "<div>Pozycja korpusu x: "+state.chassis.x.toFixed(2)+" m</div>"+
 "<div>Pozycja korpusu y: "+state.chassis.y.toFixed(2)+" m</div>"+
 "<div>Użyty impuls kadłuba: "+state.operatorImpulse.toFixed(1)+" N·s</div>"+
 "<div>Aktywność zawiasów (suma |impulsów momentu|, NIE energia): "+state.hingeTorqueImpulse.toFixed(1)+" N·m·s</div>"+
 "<div>Kontakty z bramką (próbki): "+state.gateContacts+"</div>"+
 "<div>Realny obrys pionowy: "+(state.physicalExtent.maxY-state.physicalExtent.minY).toFixed(2)+" m</div>"+
 "<div>Przedmioty po bokach ΔX: "+sideDX.map(x=>x.toFixed(2)).join(" / ")+" m</div>"+
 "<div>Przedmioty po bokach ΔY: "+sideDY.map(x=>x.toFixed(2)).join(" / ")+" m</div>"+
 "<div>CPU solwera lokalnie: "+(n?ms/n:0).toFixed(2)+" ms/krok, bez rysowania</div>";
}
const command=()=>Number(keys.has("KeyW")||keys.has("ArrowUp"))-
  Number(keys.has("KeyS")||keys.has("ArrowDown"));
function single(){
 const t=performance.now();
 world.step({forward:command()});
 const elapsed=performance.now()-t;
 if(Number.isFinite(elapsed)&&elapsed>=0){ms+=elapsed;n++;}
 if(n>300){ms*=.5;n=Math.floor(n*.5);}
}
function loop(now){
 const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 if(!paused){
  acc+=dt;let steps=0;while(acc>=DT&&steps<4){single();acc-=DT;steps++;}
  if(steps===4)acc=Math.min(DT,acc);
 }
 draw();requestAnimationFrame(loop);
}
window.addEventListener("keydown",e=>{
 if(["Space","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();
 if(e.code==="KeyQ")world.setFold(1);
 if(e.code==="KeyE")world.setFold(0);
 keys.add(e.code);
});
window.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.min(4.5,Math.max(.6,zoom*Math.exp(-e.deltaY*.0012)));draw();},{passive:false});
canvas.addEventListener("pointerdown",e=>{
 if(!paused||e.button!==0)return;
 const p=point(e);
 if(Math.hypot(world.actor.root.translation().x-p.x,world.actor.root.translation().y-p.y)<2){
  drag=true;if(e.isTrusted)canvas.setPointerCapture(e.pointerId);
 }
});
canvas.addEventListener("pointermove",e=>{
 if(!drag||!paused)return;
 world.poseActor(world.actor.id,point(e));draw();
});
canvas.addEventListener("pointerup",()=>{drag=false;draw();});
$("pause").onclick=()=>{paused=!paused;acc=0;$("pause").textContent=paused?"Wznów":"Pauza";draw();};
$("step").onclick=()=>{if(paused){single();draw();}};
$("reset").onclick=setup;
$("open").onclick=()=>{world.setFold(0);status("Rozkładanie przez rzeczywiste momenty dwóch zawiasów.");};
$("fold").onclick=()=>{world.setFold(1);status("Składanie przez rzeczywiste momenty dwóch zawiasów.");};
$("remove").onclick=()=>{world.removeGate();status("Usunięto fizyczne ciała ścian tunelu.");draw();};
$("add-side").onclick=()=>{installSideBodies();status("Odtworzono dwie rzeczywiste boczne bryły w żywym świecie.");draw();};
$("kind").onchange=setup;$("heading").onchange=setup;$("torque").onchange=setup;
$("width").oninput=()=>{world.setAperture(Number($("width").value));draw();};
try{
 setup();document.body.dataset.live="yes";
 const params=new URLSearchParams(location.search);
 if(params.has("b1probe")){
  paused=true;
  const {b1Trial}=await import("./src/b1-probe.js");
  document.body.dataset.b1Probe=JSON.stringify(b1Trial(params.get("b1probe")));
 }
 if(params.has("b1dual")){
  paused=true;
  const {dualB1}=await import("./src/b1-dual.js");
  document.body.dataset.b1Dual=JSON.stringify(dualB1());
 }
 if(params.has("b1cheap")){
  paused=true;
  const {cheapB1}=await import("./src/b1-cheap-test.js");
  document.body.dataset.b1Cheap=JSON.stringify(cheapB1(params.get("b1cheap")));
 }
 if(params.has("b1frames")){
  paused=true;world.dispose();
  world=new EnvelopeField({kind:"folding",hingeMount:"front",torqueCap:3,withMatter:false});
  sideThings=[];world.setAperture(1.25);world.setFold(0);installSideBodies();
  const frames=[];
  for(let tick=0;tick<=780;tick++){
   if(tick>0)world.step({forward:1,fold:tick<100?0:tick<500?1:0});
   if([0,90,180,360,480,580,720,780].includes(tick)){
    draw();
    frames.push({tick,source:world.output(),png:canvas.toDataURL("image/png")});
   }
  }
  document.body.dataset.b1Frames=JSON.stringify(frames);
 }
 if(params.has("b1ownercheck")){
  paused=true;world.dispose();
  world=new EnvelopeField({kind:"folding",hingeMount:"front",torqueCap:3,withMatter:false});
  sideThings=[];world.setFold(0);installSideBodies();
  const check=(v,s)=>{if(!v)throw Error("B1 UI "+s);};
  $("fold").click();check(world.foldTarget===1,"actual fold button");
  for(let i=0;i<140;i++)world.step({forward:0});
  check(world.footprint().maxY-world.footprint().minY<1.25,
    "real mass-bearing wings fully fold under reciprocal joint torque");
  $("open").click();check(world.foldTarget===0,"actual open button");
  for(let i=0;i<140;i++)world.step({forward:0});
  check(world.footprint().maxY-world.footprint().minY>3.2,
    "real wings mechanically redeploy");
  $("width").value="2.5";$("width").dispatchEvent(new Event("input",{bubbles:true}));
  check(world.gateWalls.length===2&&
   Math.abs(world.gateWalls[0].body.translation().y-(13.5-1.25-6.69))<1e-3,
   "material geometry driven by UI slider");
  $("pause").click();check(!paused,"unpause from diagnostic state");
  $("pause").click();check(paused,"pause toggle");
  window.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyW",bubbles:true}));
  for(let k=0;k<170;k++)single();
  window.dispatchEvent(new KeyboardEvent("keyup",{code:"KeyW",bubbles:true}));
  check(world.output().chassis.dx>.1,"actual WASD physics");
  $("remove").click();check(!world.withGate&&world.gateWalls.length===0,"actual physical wall removal");
  $("kind").value="rigid-small";$("kind").dispatchEvent(new Event("change",{bubbles:true}));
  check(world.kind==="rigid-small","real body rebuild");
  $("add-side").click();check(sideThings.length===2,"live scene side material is recoverable");
  $("reset").click();check(world.ticks===0&&sideThings.length===2,"reset");
  document.body.dataset.b1Ownercheck=JSON.stringify({pass:true,
   realWingJointControls:true,actualApertureGeometry:true,finiteWASD:true,
   truePhysicalWallDeletion:true,bodyChoice:true,liveMatterRestore:true,
   actualWingCompressionAndRedeployment:true,notOwnerFeel:true});
 }
 requestAnimationFrame(loop);
}catch(error){
 document.body.dataset.liveError=String(error.stack||error);
 $("message").textContent=String(error);
 console.error(error);
}
