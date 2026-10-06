import {FixedStepRunner} from "./src/core/fixed-step.js";
import {ExperimentRegistry} from "./src/core/registry.js";
import {BrowserInput} from "./src/core/browser-input.js";
import {resizeCanvas,beginCanvasFrame} from "./src/core/canvas.js";
import {readBuildIdentity} from "./src/core/provenance.js";
import {substrateSmoke} from "./experiments/substrate-smoke.js";

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

const registry=new ExperimentRegistry();
registry.register(substrateSmoke);

const {definition,instance}=registry.create("substrate-smoke");
const runner=new FixedStepRunner({dt:1/120,maxFrame:0.05,maxAccum:0.10});
const input=new BrowserInput({pointerTarget:canvas});
input.attach();

title.textContent=definition.title;
purpose.textContent=definition.purpose;
controlsText.textContent=definition.controls;

let paused=false;
let debug=false;
let elapsed=0;
let last=performance.now();

function reset() {
  runner.reset();
  instance.reset();
  elapsed=0;
  last=performance.now();
}

pauseButton.addEventListener("click",()=>{
  paused=!paused;
  pauseButton.textContent=paused ? "Resume" : "Pause";
  runState.textContent=paused ? "PAUSED" : "RUNNING";
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

function frame(now) {
  const frameSeconds=(now-last)/1000;
  last=now;

  if (!paused) {
    const snapshot=input.snapshot();
    runner.advance(frameSeconds,dt=>{
      instance.step(snapshot,dt);
      elapsed+=dt;
    });
  }

  const view=resizeCanvas(canvas);
  beginCanvasFrame(ctx,view);
  instance.render(ctx,view,{debug});
  simTime.textContent=`${elapsed.toFixed(2)} s`;

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
