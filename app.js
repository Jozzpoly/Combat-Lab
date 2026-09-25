import {FixedStepRunner} from "./src/core/fixed-step.js";
import {ExperimentRegistry} from "./src/core/registry.js";
import {BrowserInput} from "./src/core/browser-input.js";
import {resizeCanvas,beginCanvasFrame} from "./src/core/canvas.js";
import {readBuildIdentity} from "./src/core/provenance.js";
import {WorkbenchInspector} from "./src/core/workbench-inspector.js";
import {ParameterSlotStore,formatParameterSlot} from "./src/core/parameter-state.js";
import {substrateSmoke} from "./experiments/substrate-smoke.js";
import {embodiedScaleFieldV0} from "./experiments/embodied-scale-field-v0.js";
import {loadEnvelopeFieldB0} from "./experiments/load-envelope-field-b0.js";

const canvas=document.querySelector("#lab");
const ctx=canvas.getContext("2d");
const title=document.querySelector("#experiment-title");
const purpose=document.querySelector("#experiment-purpose");
const controlsText=document.querySelector("#controls-text");
const runState=document.querySelector("#run-state");
const runtimeDetail=document.querySelector("#runtime-detail");
const simTime=document.querySelector("#sim-time");
const simTimeDetail=document.querySelector("#sim-time-detail");
const buildId=document.querySelector("#build-id");
const experimentSelect=document.querySelector("#experiment-select");
const pauseButton=document.querySelector("#pause");
const resetWorldButton=document.querySelector("#reset-world");
const restoreDefaultsButton=document.querySelector("#restore-defaults");
const captureAButton=document.querySelector("#capture-a");
const applyAButton=document.querySelector("#apply-a");
const captureBButton=document.querySelector("#capture-b");
const applyBButton=document.querySelector("#apply-b");
const slotASummary=document.querySelector("#slot-a-summary");
const slotBSummary=document.querySelector("#slot-b-summary");
const debugInput=document.querySelector("#debug");
const runtime=window.__combatLabRuntime;

const registry=new ExperimentRegistry();
registry.register(substrateSmoke);
registry.register(embodiedScaleFieldV0);
registry.register(loadEnvelopeFieldB0);

const runner=new FixedStepRunner({dt:1/120,maxFrame:0.05,maxAccum:0.10});
const input=new BrowserInput({pointerTarget:canvas});
input.attach();

const parameterSlots=new ParameterSlotStore();

const inspector=new WorkbenchInspector({
  parameterRoot:document.querySelector("#parameter-panel"),
  liveRoot:document.querySelector("#live-panel"),
  restoreButton:restoreDefaultsButton
});

let paused=false;
let debug=false;
let elapsed=0;
let last=performance.now();
let current=null;
let nextInspectorSync=0;

function updateRuntimeState(state){
  runtime.state=state;
  document.documentElement.dataset.runtimeState=state;
  runState.textContent=state;
  runState.dataset.state=state;
  runtimeDetail.textContent=state;
}

function captureSnapshot(){
  runtime.snapshot=typeof current?.instance?.snapshot==="function"
    ? current.instance.snapshot()
    : null;
}

function updateParameterSlots(){
  const experimentId=runtime.activeExperimentId;
  const labels=inspector.getParameterLabels();
  const a=parameterSlots.get(experimentId,"A");
  const b=parameterSlots.get(experimentId,"B");

  slotASummary.textContent=formatParameterSlot(a,labels);
  slotBSummary.textContent=formatParameterSlot(b,labels);
  applyAButton.disabled=!a;
  applyBButton.disabled=!b;
  captureAButton.disabled=inspector.editableIds.length===0;
  captureBButton.disabled=inspector.editableIds.length===0;
}

function captureParameterSlot(name){
  parameterSlots.capture(
    runtime.activeExperimentId,
    name,
    inspector.getParameterState()
  );
  updateParameterSlots();
}

function applyParameterSlot(name){
  const state=parameterSlots.get(runtime.activeExperimentId,name);
  if(!state) return;
  inspector.applyParameterState(state);
  captureSnapshot();
  updateParameterSlots();
}

function loadExperiment(id){
  current=registry.create(id);
  runtime.activeExperimentId=id;
  title.textContent=current.definition.title;
  purpose.textContent=current.definition.purpose;
  controlsText.textContent=current.definition.controls || "Direct controls available in Lab Inspector.";
  runner.reset();
  elapsed=0;
  runtime.elapsed=0;
  last=performance.now();
  captureSnapshot();
  inspector.mount(current.instance);
  updateParameterSlots();
}

const experimentGroups=[
  {kind:"research",label:"Research experiments"},
  {kind:"diagnostic",label:"Internal diagnostics"}
];

const experimentItems=registry.list();
for(const group of experimentGroups){
  const items=experimentItems.filter(item=>item.kind===group.kind);
  if(items.length===0) continue;

  const optgroup=document.createElement("optgroup");
  optgroup.label=group.label;

  for(const item of items){
    const option=document.createElement("option");
    option.value=item.id;
    option.textContent=item.title;
    optgroup.append(option);
  }

  experimentSelect.append(optgroup);
}

experimentSelect.value="load-envelope-field-b0";
loadExperiment(experimentSelect.value);
experimentSelect.addEventListener("change",()=>loadExperiment(experimentSelect.value));

function resetWorld(){
  runner.reset();
  current.instance.reset();
  elapsed=0;
  runtime.elapsed=0;
  simTime.textContent="0.00 s";
  simTimeDetail.textContent="0.00 s";
  simTime.dataset.elapsed="0.0000";
  last=performance.now();
  captureSnapshot();
  inspector.sync(true);
}

pauseButton.addEventListener("click",()=>{
  paused=!paused;
  pauseButton.textContent=paused ? "Resume" : "Pause";
  updateRuntimeState(paused ? "PAUSED" : "RUNNING");
  last=performance.now();
});

resetWorldButton.addEventListener("click",resetWorld);

captureAButton.addEventListener("click",()=>captureParameterSlot("A"));
applyAButton.addEventListener("click",()=>applyParameterSlot("A"));
captureBButton.addEventListener("click",()=>captureParameterSlot("B"));
applyBButton.addEventListener("click",()=>applyParameterSlot("B"));

restoreDefaultsButton.addEventListener("click",()=>{
  queueMicrotask(()=>{
    captureSnapshot();
    inspector.sync(true);
  });
});

debugInput.addEventListener("change",()=>{
  debug=debugInput.checked;
});

readBuildIdentity().then(identity=>{
  buildId.textContent=`${identity.commit.slice(0,12)} · ${identity.branch}`;
});

updateRuntimeState("RUNNING");

function frame(now){
  const frameSeconds=(now-last)/1000;
  last=now;

  if(!paused){
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

  const formatted=`${elapsed.toFixed(2)} s`;
  simTime.textContent=formatted;
  simTimeDetail.textContent=formatted;
  simTime.dataset.elapsed=elapsed.toFixed(4);
  document.documentElement.dataset.frameCount=String(runtime.frames);

  if(now>=nextInspectorSync){
    inspector.sync();
    nextInspectorSync=now+80;
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
