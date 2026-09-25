import {FixedStepRunner} from "./src/core/fixed-step.js";
import {ExperimentRegistry} from "./src/core/registry.js";
import {BrowserInput} from "./src/core/browser-input.js";
import {resizeCanvas,beginCanvasFrame} from "./src/core/canvas.js";
import {readBuildIdentity} from "./src/core/provenance.js";
import {substrateSmoke} from "./experiments/substrate-smoke.js";
import {embodiedScaleFieldV0} from "./experiments/embodied-scale-field-v0.js";

const canvas=document.querySelector("#lab");
const ctx=canvas.getContext("2d");
const title=document.querySelector("#experiment-title");
const purpose=document.querySelector("#experiment-purpose");
const controlsText=document.querySelector("#controls-text");
const runState=document.querySelector("#run-state");
const simTime=document.querySelector("#sim-time");
const buildId=document.querySelector("#build-id");
const experimentSelect=document.querySelector("#experiment-select");
const pauseButton=document.querySelector("#pause");
const resetButton=document.querySelector("#reset");
const debugButton=document.querySelector("#debug");
const runtime=window.__combatLabRuntime;

const registry=new ExperimentRegistry();
registry.register(substrateSmoke);
registry.register(embodiedScaleFieldV0);

const runner=new FixedStepRunner({dt:1/120,maxFrame:0.05,maxAccum:0.10});
const input=new BrowserInput({pointerTarget:canvas});
input.attach();

let paused=false;
let debug=false;
let elapsed=0;
let last=performance.now();
let current=null;

function updateRuntimeState(state){
  runtime.state=state;
  document.documentElement.dataset.runtimeState=state;
  runState.textContent=state;
}

function captureSnapshot(){
  runtime.snapshot=typeof current?.instance?.snapshot==="function"
    ? current.instance.snapshot()
    : null;
}

function loadExperiment(id) {
  current=registry.create(id);
  runtime.activeExperimentId=id;
  title.textContent=current.definition.title;
  purpose.textContent=current.definition.purpose;
  controlsText.textContent=current.definition.controls;
  runner.reset();
  elapsed=0;
  last=performance.now();
  captureSnapshot();
}

for (const item of registry.list()) {
  const option=document.createElement("option");
  option.value=item.id;
  option.textContent=item.title;
  experimentSelect.append(option);
}

experimentSelect.value="embodied-scale-field-v0";
loadExperiment(experimentSelect.value);
experimentSelect.addEventListener("change",()=>loadExperiment(experimentSelect.value));

function reset() {
  runner.reset();
  current.instance.reset();
  elapsed=0;
  last=performance.now();
  captureSnapshot();
}

pauseButton.addEventListener("click",()=>{
  paused=!paused;
  pauseButton.textContent=paused ? "Resume" : "Pause";
  updateRuntimeState(paused ? "PAUSED" : "RUNNING");
  last=performance.now();
});

resetButton.addEventListener("click",reset);

debugButton.addEventListener("click",()=>{
  debug=!debug;
  debugButton.textContent=debug ? "Debug on" : "Debug";
});

readBuildIdentity().then(identity=>{
  buildId.textContent=`source: ${identity.commit.slice(0,12)} · ${identity.branch}`;
});

updateRuntimeState("RUNNING");

function frame(now) {
  const frameSeconds=(now-last)/1000;
  last=now;

  if (!paused) {
    const snapshot=input.snapshot();
    runner.advance(frameSeconds,dt=>{
      current.instance.step(snapshot,dt);
      elapsed+=dt;
    });
  }

  const view=resizeCanvas(canvas);
  beginCanvasFrame(ctx,view);
  current.instance.render(ctx,view,{debug});
  captureSnapshot();

  runtime.frames+=1;
  runtime.elapsed=elapsed;
  runtime.lastFrameAt=now;

  simTime.textContent=`${elapsed.toFixed(2)} s`;
  simTime.dataset.elapsed=elapsed.toFixed(4);
  document.documentElement.dataset.frameCount=String(runtime.frames);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
