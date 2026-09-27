import test from "node:test";
import assert from "node:assert/strict";
import {ResearchCamera} from "../src/core/research-camera.js";

const view={width:1000,height:600};
const bounds={x:0,y:0,width:2000,height:1000};

test("research camera fits world bounds without hiding its wider hard zoom range",()=>{
  const camera=new ResearchCamera({minZoom:0.12,maxZoom:8});
  const snap=camera.fit(bounds,view,{padding:50});

  assert.equal(snap.center.x,1000);
  assert.equal(snap.center.y,500);
  assert.ok(snap.zoom>0.12);
  assert.ok(snap.zoom<1);
  assert.equal(snap.minZoom,0.12);
  assert.equal(snap.maxZoom,8);
});

test("wheel zoom preserves the world point under the cursor",()=>{
  const camera=new ResearchCamera();
  camera.fit(bounds,view);
  const cursor={x:820,y:210};
  const before=camera.screenToWorld(cursor,view);

  camera.zoomWheel(-320,cursor,view);
  const after=camera.screenToWorld(cursor,view);

  assert.ok(camera.zoom>0);
  assert.ok(Math.abs(before.x-after.x)<1e-9);
  assert.ok(Math.abs(before.y-after.y)<1e-9);
});

test("camera pan is screen-space direct and reversible",()=>{
  const camera=new ResearchCamera();
  camera.fit(bounds,view);
  const before=camera.snapshot();

  camera.panScreen(120,-40);
  camera.panScreen(-120,40);
  const after=camera.snapshot();

  assert.ok(Math.abs(before.center.x-after.center.x)<1e-9);
  assert.ok(Math.abs(before.center.y-after.center.y)<1e-9);
});

test("camera zoom clamps only at explicit numerical rails",()=>{
  const camera=new ResearchCamera({minZoom:0.1,maxZoom:10});
  camera.fit(bounds,view);
  camera.setZoomAt(1e-9,{x:500,y:300},view);
  assert.equal(camera.zoom,0.1);
  camera.setZoomAt(1e9,{x:500,y:300},view);
  assert.equal(camera.zoom,10);
});
