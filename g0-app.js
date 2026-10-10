import {GroundDriveWorld,initGroundPhysics,DT} from "./src/g0-world.js";
const $=id=>document.getElementById(id),canvas=$("lab"),ctx=canvas.getContext("2d");
const keys=new Set(),round=n=>Number(n).toFixed(2);
let simulation=null,paused=false,last=performance.now(),acc=0,zoom=1;
function preset(){return {mode:$("mode").value,mu:Number($("mu").value),motor:Number($("motor").value)};}
function reset(){simulation?.dispose();simulation=new GroundDriveWorld(preset());paused=false;acc=0;last=performance.now();$("start").textContent="Pauza";}
function draw(){
 if(!simulation)return;
 const b=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(2,Math.round(b.width*dpr)),h=Math.max(2,Math.round(b.height*dpr));
 if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=simulation.ground?"#132630":"#312333";ctx.fillRect(0,0,w,h);
 const scale=Math.min(w/30,h/16)*zoom,offsetX=w*.35,offsetY=h*.5;
 // Top-down: world X right, Z downward. Vertical Y is sampled separately.
 const map=(x,z)=>({x:offsetX+x*scale,y:offsetY+z*scale});
 ctx.save();ctx.lineWidth=1;ctx.strokeStyle="#2e4651";
 for(let x=-20;x<=24;x+=2){const p=map(x,0);ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,h);ctx.stroke();}
 for(let z=-12;z<=12;z+=2){const p=map(0,z);ctx.beginPath();ctx.moveTo(0,p.y);ctx.lineTo(w,p.y);ctx.stroke();}
 function rect(body,hx,hz,color,stroke="#b5d4df"){
  const p=body.translation(),q=map(p.x,p.z);
  ctx.save();ctx.translate(q.x,q.y);
  const a=body.rotation(); // top-down yaw from actual 3D quaternion
  const yaw=Math.atan2(2*(a.w*a.y+a.x*a.z),1-2*(a.y*a.y+a.z*a.z));
  ctx.rotate(-yaw);ctx.fillStyle=color;ctx.strokeStyle=stroke;ctx.lineWidth=1.5;
  ctx.fillRect(-hx*scale,-hz*scale,2*hx*scale,2*hz*scale);
  ctx.strokeRect(-hx*scale,-hz*scale,2*hx*scale,2*hz*scale);ctx.restore();
 }
 if(simulation.obstacle)rect(simulation.obstacle.body,.78,.9,"#b58c79");
 for(const wheel of simulation.wheels){
  const q=wheel.body.translation(),p=map(q.x,q.z);
  ctx.fillStyle="#7ba3b8";ctx.strokeStyle="#bde8ed";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(p.x,p.y,.25*scale,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 rect(simulation.chassis,1.1,.58,"#d6c48b");
 const from=map(simulation.chassis.translation().x,simulation.chassis.translation().z);
 ctx.strokeStyle="#e6f0ff";ctx.lineWidth=2;ctx.beginPath();
 ctx.moveTo(from.x,from.y);ctx.lineTo(from.x+scale*1.3,from.y);ctx.stroke();
 ctx.restore();
 const v=simulation.read();
 $("readout").innerHTML="<b>"+(paused?"PAUZA":"RUCH DOSTĘPNY")+"</b>"+
 "<div>Pozycja x: "+round(v.chassis.x)+" m, z: "+round(v.chassis.z)+" m</div>"+
 "<div>Przemieszczenie z początku: "+round(v.chassis.dx)+" m</div>"+
 "<div>Wysokość nad bazą: "+round(v.chassis.y)+" m</div>"+
 "<div>Prędkość pozioma: "+round(v.chassis.vx)+" m/s</div>"+
 "<div>Kroki kontaktu kół z ziemią: "+v.wheelGroundTicks+"</div>"+
 "<div>Suma siły napędu kadłuba: "+round(v.rootImpulseSum)+" N·s</div>"+
 "<div>Przemieszczenie pasywnego ciała: "+(v.obstacleDX===null?"—":round(v.obstacleDX)+" m")+"</div>";
}
function cmd(){return Number(keys.has("KeyW")||keys.has("ArrowUp"))-Number(keys.has("KeyS")||keys.has("ArrowDown"));}
function step(){simulation.step(cmd());}
function frame(t){
 const delta=Math.max(0,Math.min(.06,(t-last)/1000));last=t;
 if(simulation&&!paused){acc+=delta;let n=0;while(acc>=DT&&n<4){step();acc-=DT;n++;}if(n===4)acc=Math.min(acc,DT);}
 draw();requestAnimationFrame(frame);
}
window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();keys.add(e.code);});
window.addEventListener("keyup",e=>keys.delete(e.code));window.addEventListener("blur",()=>keys.clear());
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.min(4,Math.max(.35,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});
$("start").onclick=()=>{paused=!paused;$("start").textContent=paused?"Wznów":"Pauza";acc=0;};
$("single").onclick=()=>{if(paused){step();draw();}};
$("reset").onclick=()=>{reset();draw();};
$("remove").onclick=()=>{if(simulation.removeGround())$("ready").textContent="Prawdziwa podłoga usunięta (nie flaga)";};
for(const id of ["mode","mu","motor"])$(id).onchange=()=>{reset();draw();};
try{
 await initGroundPhysics();
 reset();$("ready").textContent="Rapier 3D · rzeczywisty kontakt";
 draw();document.body.dataset.live="yes";
 if(new URLSearchParams(location.search).has("g0probe")){
  const {groundSourceProbe}=await import("./src/g0-probe.js");
  document.body.dataset.g0Probe=JSON.stringify(groundSourceProbe());
 }
 if(new URLSearchParams(location.search).has("g0frames")){
  paused=true;
  const frames=[];
  for(let t=0;t<=240;t++){
   if(t>0)simulation.step(t<=210?1:0);
   if([0,80,160,240].includes(t)){draw();frames.push({tick:t,source:simulation.read(),png:canvas.toDataURL("image/png")});}
  }
  document.body.dataset.g0Frames=JSON.stringify(frames);
 }
 requestAnimationFrame(frame);
}catch(error){
 $("ready").textContent="PHYSICS FAIL";
 document.body.dataset.liveError=String(error.stack||error);
 console.error(error);
}
