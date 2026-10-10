import {GroundCase,preparePhysics} from "./src/s2-world.js";
import {compareGroundSources} from "./src/s2-probe.js";
const el=id=>document.getElementById(id);
const canvas=el("view"),ctx=canvas.getContext("2d");
const state={sim:null,paused:false,driveTicks:0,last:performance.now(),acc:0};
const Q=(x)=>Number.isFinite(x)?x.toFixed(2):"—";
const surface=()=>Number(el("mu").value);
const gravity=()=>el("gravity").checked?9.81:0;
const force=()=>Number(el("force").value);
function newWorld(){
  state.sim?.dispose();
  state.sim=new GroundCase({surface:surface(),gravity:gravity(),drive:force()});
  state.driveTicks=0;state.acc=0;state.paused=false;
  el("pause").textContent="Pause";
  el("push").textContent="Push for 7 seconds";
  el("feedback").textContent="A real dynamic defender rests on a ground collider. Start an outside mechanical push; no organism autonomy is claimed.";
  draw();
}
function update(){
 el("muLabel").textContent=Q(surface());
 el("forceLabel").textContent=Q(force())+" N";
}
function draw(){
 if(!state.sim)return;
 const r=canvas.getBoundingClientRect();
 const ratio=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.max(300,Math.round(r.width*ratio));
 canvas.height=Math.max(260,Math.round(r.height*ratio));
 ctx.setTransform(ratio,0,0,ratio,0,0);
 const W=r.width,H=r.height;
 ctx.fillStyle="#12242d";ctx.fillRect(0,0,W,H);
 const scale=Math.min(W/12,H/8),x0=W/2+W*.04,z0=H/2;
 const trans=(x,z)=>({x:x0+x*scale,y:z0-z*scale});
 ctx.lineWidth=1;ctx.strokeStyle="#28414a";
 for(let x=-9;x<10;x++){let p=trans(x,-5);ctx.beginPath();ctx.moveTo(p.x,0);ctx.lineTo(p.x,H);ctx.stroke();}
 for(let z=-4;z<=4;z++){let p=trans(-6,z);ctx.beginPath();ctx.moveTo(0,p.y);ctx.lineTo(W,p.y);ctx.stroke();}
 ctx.fillStyle="#608b72";ctx.globalAlpha=Math.min(.55,.08+surface()*.18);
 ctx.fillRect(4,4,W-8,H-8);ctx.globalAlpha=1;
 function body(b,color,caption){
   const p=b.body.translation(),scr=trans(p.x,p.z);
   ctx.fillStyle=color;ctx.strokeStyle="#e8eff1";ctx.lineWidth=2;
   ctx.fillRect(scr.x-b.halfX*scale,scr.y-b.halfZ*scale,2*b.halfX*scale,2*b.halfZ*scale);
   ctx.strokeRect(scr.x-b.halfX*scale,scr.y-b.halfZ*scale,2*b.halfX*scale,2*b.halfZ*scale);
   ctx.fillStyle="#e8eff1";ctx.font="12px system-ui";
   ctx.textAlign="center";ctx.fillText(caption,scr.x,scr.y-1.15*b.halfZ*scale-16);
 }
 body(state.sim.defender,"#90d8b8","GUARD (120 kg)");
 body(state.sim.ram,"#e2b680","EXTERNAL RAM (90 kg)");
 const s=state.sim.snapshot();
 ctx.fillStyle="#d3e0e3";ctx.textAlign="left";ctx.font="12px ui-monospace,monospace";
 ctx.fillText("Y height: "+Q(s.guardY)+" m  •  gravity: "+Q(s.gravity),18,H-18);
 el("displacement").textContent=Q(s.guardDX)+" m";
 el("normal").textContent=Q(s.totalGroundImpulse)+" N·s";
 el("contacts").textContent=s.actorContactSteps+" ticks";
 el("elapsed").textContent=Q(s.ticks/60)+" s";
 el("status").textContent=state.driveTicks>0?"EXTERNAL FORCE ACTIVE":state.paused?"PAUSED":"SOLVER LIVE";
}
function frame(t){
 const dt=Math.max(0,Math.min(.05,(t-state.last)/1000));state.last=t;
 if(!state.paused&&state.sim){
   state.acc+=dt;let n=0;
   while(state.acc>=1/60&&n++<5){
     state.sim.step(state.driveTicks>0?force():0);
     if(state.driveTicks>0)state.driveTicks--;
     state.acc-=1/60;
   }
   if(n>=5)state.acc=Math.min(state.acc,1/30);
 }
 draw();requestAnimationFrame(frame);
}
async function main(){
 await preparePhysics();update();newWorld();
 el("mu").addEventListener("input",()=>{update();state.sim.setSurface(surface());});
 el("force").addEventListener("input",update);
 el("gravity").addEventListener("change",newWorld);
 el("reset").addEventListener("click",newWorld);
 el("push").addEventListener("click",()=>{
   state.driveTicks=420;
   state.paused=false;el("pause").textContent="Pause";
   el("feedback").textContent="External ram supplies known work. Guard response arises from real contact and ground friction.";
 });
 el("pause").addEventListener("click",()=>{
   state.paused=!state.paused;el("pause").textContent=state.paused?"Resume":"Pause";
 });
 el("step").addEventListener("click",()=>{
   state.paused=true;el("pause").textContent="Resume";
   state.sim.step(state.driveTicks>0?force():0);
   if(state.driveTicks>0)state.driveTicks--;draw();
 });
 el("compare").addEventListener("click",()=>{
   const result=compareGroundSources();
   el("feedback").textContent="Measured ice–grippy guard difference: "+Q(result.iceMinusGripDX)+" m. Grounded comparison only; does not certify stance or game quality.";
 });
 document.body.dataset.live="yes";
 if(new URLSearchParams(location.search).has("probe")){
   document.body.dataset.support=JSON.stringify(compareGroundSources());
 }
 requestAnimationFrame(frame);
}
main().catch(e=>{
 document.body.dataset.liveError=String(e.stack||e);
 el("feedback").textContent="FAILED: "+e.message;console.error(e);
});
