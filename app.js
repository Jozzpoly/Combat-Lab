const canvas=document.querySelector("#lab");
const ctx=canvas.getContext("2d");
const title=document.querySelector("#experiment-title");
const purpose=document.querySelector("#experiment-purpose");
const controlsText=document.querySelector("#controls-text");
const runState=document.querySelector("#run-state");
const simTime=document.querySelector("#sim-time");
const buildId=document.querySelector("#build-id");
const pauseButton=document.querySelector("#pause");
const resetButton=document.querySelector("#reset");
const debugButton=document.querySelector("#debug");

title.textContent="Neutral smoke surface";
purpose.textContent="Raw input, stepping, reset and rendering only. No combat or organism semantics.";
controlsText.textContent="WASD / arrows move the probe · Reset returns to center";
buildId.textContent="clean-room substrate";

const state={x:0,y:0,time:0,paused:false,debug:false};
const keys=new Set();
let last=performance.now();

addEventListener("keydown",event=>keys.add(event.code));
addEventListener("keyup",event=>keys.delete(event.code));
addEventListener("blur",()=>keys.clear());

pauseButton.addEventListener("click",()=>{
  state.paused=!state.paused;
  pauseButton.textContent=state.paused ? "Resume" : "Pause";
  runState.textContent=state.paused ? "PAUSED" : "RUNNING";
  last=performance.now();
});

resetButton.addEventListener("click",()=>{
  state.x=0;
  state.y=0;
  state.time=0;
  last=performance.now();
});

debugButton.addEventListener("click",()=>{
  state.debug=!state.debug;
  debugButton.textContent=state.debug ? "Debug on" : "Debug";
});

function resize(){
  const dpr=Math.max(1,devicePixelRatio||1);
  const rect=canvas.getBoundingClientRect();
  const width=Math.max(1,Math.round(rect.width));
  const height=Math.max(1,Math.round(rect.height));
  const pixelWidth=Math.round(width*dpr);
  const pixelHeight=Math.round(height*dpr);
  if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){
    canvas.width=pixelWidth;
    canvas.height=pixelHeight;
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return {width,height};
}

function frame(now){
  const dt=Math.min(0.05,Math.max(0,(now-last)/1000));
  last=now;

  if(!state.paused){
    const dx=(keys.has("KeyD")||keys.has("ArrowRight")?1:0)-(keys.has("KeyA")||keys.has("ArrowLeft")?1:0);
    const dy=(keys.has("KeyS")||keys.has("ArrowDown")?1:0)-(keys.has("KeyW")||keys.has("ArrowUp")?1:0);
    const length=Math.hypot(dx,dy)||1;
    const speed=180;
    state.x+=dx/length*speed*dt;
    state.y+=dy/length*speed*dt;
    state.time+=dt;
  }

  const view=resize();
  ctx.clearRect(0,0,view.width,view.height);
  ctx.fillStyle="#12161b";
  ctx.fillRect(0,0,view.width,view.height);

  const cx=view.width/2+state.x;
  const cy=view.height/2+state.y;
  ctx.fillStyle="#88c7ff";
  ctx.beginPath();
  ctx.arc(cx,cy,10,0,Math.PI*2);
  ctx.fill();

  if(state.debug){
    ctx.fillStyle="#d9e0e8";
    ctx.font="12px ui-monospace, monospace";
    ctx.fillText(`probe=(${state.x.toFixed(1)}, ${state.y.toFixed(1)})`,16,24);
    ctx.fillText(`t=${state.time.toFixed(2)}`,16,42);
  }

  simTime.textContent=`${state.time.toFixed(2)} s`;
  window.__combatLabCleanRoom={...state};
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
