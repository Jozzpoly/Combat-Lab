import {FixedStepRunner} from "./src/core/fixed-step.js";
import {ExperimentRegistry} from "./src/core/registry.js";
import {BrowserInput} from "./src/core/browser-input.js";
import {resizeCanvas,beginCanvasFrame} from "./src/core/canvas.js";
import {readBuildIdentity} from "./src/core/provenance.js";
import {WorkbenchInspector} from "./src/core/workbench-inspector.js";
import {
  ComparisonSlotStore,
  buildComparisonSnapshot,
  comparisonSnapshotState,
  formatComparisonContract,
  formatComparisonDiff,
  formatComparisonSlot
} from "./src/core/comparison-state.js";
import {InterventionLedger} from "./src/core/intervention-ledger.js";
import {RuntimePerformanceMeter} from "./src/core/runtime-performance.js";
import {substrateSmoke} from "./experiments/substrate-smoke.js";
import {embodiedScaleFieldV0} from "./experiments/embodied-scale-field-v0.js";
import {loadEnvelopeFieldB0} from "./experiments/load-envelope-field-b0.js";
import {minimalReplanCellN1} from "./experiments/minimal-replan-cell-n1.js";
import {contactSemanticsCellC0} from "./experiments/contact-semantics-cell-c0.js";
import {dynamicEncounterCellD0} from "./experiments/dynamic-encounter-cell-d0.js";

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
const comparisonContract=document.querySelector("#comparison-contract");
const comparisonDiff=document.querySelector("#comparison-diff");
const debugInput=document.querySelector("#debug");
const runtime=window.__combatLabRuntime;

const registry=new ExperimentRegistry();
registry.register(substrateSmoke);
registry.register(embodiedScaleFieldV0);
registry.register(loadEnvelopeFieldB0);
registry.register(minimalReplanCellN1);
registry.register(contactSemanticsCellC0);
registry.register(dynamicEncounterCellD0);

const runner=new FixedStepRunner({dt:1/120,maxFrame:0.05,maxAccum:0.10});
const input=new BrowserInput({pointerTarget:canvas});
input.attach();

const comparisonSlots=new ComparisonSlotStore();
const interventionLedger=new InterventionLedger();
const runtimePerformance=new RuntimePerformanceMeter();

let paused=false;
let debug=false;
let elapsed=0;
let last=performance.now();
let current=null;
let nextInspectorSync=0;

runtime.interventionLedger=interventionLedger;
runtime.interventionCount=0;
runtime.performance=runtimePerformance;
runtime.fixedStep=null;
runtime.query=(name,args={})=>{
  const query=current?.instance?.query;
  if(typeof query!=="function") return null;
  const started=performance.now();
  try{
    const result=query.call(current.instance,name,structuredClone(args ?? {}));
    return result===undefined ? undefined : structuredClone(result);
  }finally{
    runtimePerformance.recordQuery({
      name,
      durationMs:Math.max(0,performance.now()-started)
    });
  }
};

function recordIntervention({
  operation,
  effects=[],
  detail,
  experimentId=runtime.activeExperimentId,
  simulationTime=elapsed
}){
  const event=interventionLedger.record({
    experimentId,
    simulationTime,
    operation,
    effects,
    detail
  });
  runtime.interventionCount=event.sequence;
  const durationMs=Number(detail?.durationMs);
  if(Number.isFinite(durationMs) && durationMs>=0){
    runtimePerformance.recordIntervention({operation,durationMs});
  }
  return event;
}

const inspector=new WorkbenchInspector({
  parameterRoot:document.querySelector("#parameter-panel"),
  liveRoot:document.querySelector("#live-panel"),
  restoreButton:restoreDefaultsButton,
  onIntervention:recordIntervention
});

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

function currentComparisonSnapshot(){
  const definition=inspector.getComparisonDefinition();
  if(!definition) return null;
  return buildComparisonSnapshot({
    experimentId:runtime.activeExperimentId,
    simulationTime:elapsed,
    definition,
    descriptors:inspector.getParameterDescriptors(),
    values:inspector.getParameterState()
  });
}

function updateParameterSlots(){
  const experimentId=runtime.activeExperimentId;
  const definition=inspector.getComparisonDefinition();
  const descriptors=inspector.getParameterDescriptors();
  const a=comparisonSlots.get(experimentId,"A");
  const b=comparisonSlots.get(experimentId,"B");

  slotASummary.textContent=formatComparisonSlot(a);
  slotBSummary.textContent=formatComparisonSlot(b);
  comparisonContract.textContent=formatComparisonContract(definition,descriptors);
  comparisonDiff.textContent=formatComparisonDiff(a,b);
  applyAButton.disabled=!a;
  applyBButton.disabled=!b;
  captureAButton.disabled=!definition;
  captureBButton.disabled=!definition;
}

function captureParameterSlot(name){
  const before=comparisonSlots.get(runtime.activeExperimentId,name);
  const snapshot=currentComparisonSnapshot();
  if(!snapshot) return;
  comparisonSlots.capture(runtime.activeExperimentId,name,snapshot);
  recordIntervention({
    operation:"comparison-capture",
    effects:[{
      domain:"comparison",
      scope:`slot:${name}`,
      path:snapshot.comparisonId,
      before,
      after:snapshot
    }],
    detail:{slot:name,comparisonId:snapshot.comparisonId}
  });
  updateParameterSlots();
}

function applyParameterSlot(name){
  const snapshot=comparisonSlots.get(runtime.activeExperimentId,name);
  if(!snapshot) return;
  const state=comparisonSnapshotState(snapshot);
  const before=inspector.getParameterState();
  const started=performance.now();
  inspector.applyParameterState(state);
  const durationMs=Math.max(0,performance.now()-started);
  const after=inspector.getParameterState();
  recordIntervention({
    operation:"comparison-apply",
    effects:inspector.describeParameterChanges(before,after,{requestedState:state}),
    detail:{
      slot:name,
      comparisonId:snapshot.comparisonId,
      applySemantics:snapshot.applySemantics,
      matchedStartHint:snapshot.matchedStartHint,
      durationMs
    }
  });
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
  runtimePerformance.resetFrames();
  elapsed=0;
  runtime.elapsed=0;
  runtime.fixedStep=null;
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
experimentSelect.addEventListener("change",()=>{
  const before=runtime.activeExperimentId;
  const after=experimentSelect.value;
  if(before!==after){
    recordIntervention({
      operation:"experiment-switch",
      experimentId:null,
      effects:[{
        domain:"session",
        scope:"lab",
        path:"activeExperiment",
        before,
        after
      }]
    });
  }
  loadExperiment(after);
});

function resetWorld(){
  const simulationTime=elapsed;
  const started=performance.now();
  runner.reset();
  current.instance.reset();
  const durationMs=Math.max(0,performance.now()-started);
  recordIntervention({
    operation:"reset-world",
    simulationTime,
    effects:[{
      domain:"world",
      scope:"active-experiment",
      path:"state"
    }],
    detail:{preservesAuthoredState:true,durationMs}
  });
  runtimePerformance.resetFrames();
  runtime.fixedStep=null;
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
  const before=paused;
  paused=!paused;
  recordIntervention({
    operation:"toggle-pause",
    effects:[{
      domain:"session",
      scope:"simulation",
      path:"paused",
      before,
      after:paused
    }]
  });
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
  const before=debug;
  debug=debugInput.checked;
  recordIntervention({
    operation:"toggle-debug",
    effects:[{
      domain:"apparatus",
      scope:"diagnostics",
      path:"debug",
      before,
      after:debug
    }]
  });
});

readBuildIdentity().then(identity=>{
  buildId.textContent=`${identity.commit.slice(0,12)} · ${identity.branch}`;
});

updateRuntimeState("RUNNING");

function frame(now){
  const wallNow=performance.now();
  const frameSeconds=Math.max(0,(wallNow-last)/1000);
  last=wallNow;

  let fixedStep={
    steps:0,
    alpha:0,
    rawFrameSeconds:frameSeconds,
    acceptedFrameSeconds:0,
    discardedFrameSeconds:0,
    discardedAccumulatorSeconds:0,
    discardedSeconds:0,
    simulatedSeconds:0
  };

  const simulationStarted=performance.now();
  if(!paused){
    const snapshot=input.snapshot();
    fixedStep=runner.advance(frameSeconds,dt=>{
      current.instance.step(snapshot,dt);
      elapsed+=dt;
    });
  }
  const simulationMs=Math.max(0,performance.now()-simulationStarted);

  const renderStarted=performance.now();
  const view=resizeCanvas(canvas);
  beginCanvasFrame(ctx,view);
  current.instance.render(ctx,view,{debug});
  const renderMs=Math.max(0,performance.now()-renderStarted);

  const observationStarted=performance.now();
  captureSnapshot();

  runtime.frames+=1;
  runtime.elapsed=elapsed;
  runtime.lastFrameAt=wallNow;
  runtime.fixedStep=structuredClone(fixedStep);

  const formatted=`${elapsed.toFixed(2)} s`;
  simTime.textContent=formatted;
  simTimeDetail.textContent=formatted;
  simTime.dataset.elapsed=elapsed.toFixed(4);
  document.documentElement.dataset.frameCount=String(runtime.frames);

  if(now>=nextInspectorSync){
    inspector.sync();
    nextInspectorSync=now+80;
  }
  const observationMs=Math.max(0,performance.now()-observationStarted);

  runtimePerformance.recordFrame({
    wallSeconds:frameSeconds,
    simulatedSeconds:fixedStep.simulatedSeconds,
    discardedWallSeconds:fixedStep.discardedSeconds,
    simulationMs,
    renderMs,
    observationMs
  });

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
