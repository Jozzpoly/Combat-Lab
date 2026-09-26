import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVE_ECOLOGY_BASELINE_COUNT,
  activeSpatialEcologyV0,
  clearEcologyExtras,
  createActiveEcologyState,
  deriveEcologyEmbodiment,
  setActiveEcologyParameter,
  spawnEcologyResidents,
  stepActiveEcology
} from "../experiments/active-spatial-ecology-v0.js";

const idle={keys:[],buttons:[],pointer:{x:0,y:0,valid:false}};
const right={...idle,keys:["KeyD"]};

test("active ecology starts from a small deterministic heterogeneous baseline",()=>{
  const a=createActiveEcologyState();
  const b=createActiveEcologyState();

  assert.equal(a.residents.length,ACTIVE_ECOLOGY_BASELINE_COUNT);
  assert.deepEqual(
    a.residents.map(r=>({id:r.id,x:r.x,y:r.y,envelope:r.envelope,mass:r.totalMass,force:r.forceMultiplier})),
    b.residents.map(r=>({id:r.id,x:r.x,y:r.y,envelope:r.envelope,mass:r.totalMass,force:r.forceMultiplier}))
  );

  assert.ok(new Set(a.residents.map(r=>r.envelope)).size>2);
  assert.ok(new Set(a.residents.map(r=>r.totalMass)).size>2);
});

test("spawn template authors new residents without rewriting existing residents",()=>{
  const state=createActiveEcologyState();
  setActiveEcologyParameter(state,"spawnEnvelope",0.55);
  setActiveEcologyParameter(state,"spawnBodyMass",8);
  setActiveEcologyParameter(state,"spawnLoadMass",2);
  setActiveEcologyParameter(state,"spawnForceMultiplier",5);

  const first=spawnEcologyResidents(state,5);
  assert.equal(first.spawned,5);
  const firstWave=state.residents.slice(-5);
  assert.ok(firstWave.every(r=>r.envelope===0.55 && r.bodyMass===8 && r.loadMass===2 && r.forceMultiplier===5));

  setActiveEcologyParameter(state,"spawnEnvelope",2);
  setActiveEcologyParameter(state,"spawnBodyMass",0.5);
  setActiveEcologyParameter(state,"spawnLoadMass",0);
  setActiveEcologyParameter(state,"spawnForceMultiplier",0.75);

  const second=spawnEcologyResidents(state,5);
  assert.equal(second.spawned,5);
  const secondWave=state.residents.slice(-5);
  assert.ok(secondWave.every(r=>r.envelope===2 && r.bodyMass===0.5 && r.loadMass===0 && r.forceMultiplier===0.75));
  assert.ok(firstWave.every(r=>r.envelope===0.55 && r.bodyMass===8 && r.loadMass===2 && r.forceMultiplier===5));
});

test("population pressure can climb well beyond the readable baseline without a low cap",()=>{
  const state=createActiveEcologyState();
  let spawned=0;
  for(let i=0;i<5;i++) spawned+=spawnEcologyResidents(state,10).spawned;

  assert.ok(spawned>=40,`expected broad spawn headroom, got ${spawned}`);
  assert.ok(state.residents.length>=ACTIVE_ECOLOGY_BASELINE_COUNT+40);
});

test("clear extras restores the deterministic baseline population",()=>{
  const state=createActiveEcologyState();
  spawnEcologyResidents(state,10);
  assert.ok(state.residents.length>ACTIVE_ECOLOGY_BASELINE_COUNT);

  clearEcologyExtras(state);
  assert.equal(state.residents.length,ACTIVE_ECOLOGY_BASELINE_COUNT);
  assert.ok(state.residents.every(r=>r.baseline));
});

test("resident movement intent is active without player input",()=>{
  const state=createActiveEcologyState();
  const before=state.residents.map(r=>({x:r.x,y:r.y}));

  for(let i=0;i<240;i++) stepActiveEcology(state,idle,1/120);

  const moved=state.residents.filter((r,i)=>Math.hypot(r.x-before[i].x,r.y-before[i].y)>2);
  assert.ok(moved.length>=4,`expected most baseline residents to move, got ${moved.length}`);
});

test("player envelope remains independent from mass and locomotor force",()=>{
  const state=createActiveEcologyState();
  setActiveEcologyParameter(state,"playerBodyMass",12);
  setActiveEcologyParameter(state,"playerLoadMass",8);
  setActiveEcologyParameter(state,"playerForceMultiplier",7);
  const mass=state.player.totalMass;
  const accel=state.player.acceleration;

  setActiveEcologyParameter(state,"playerEnvelope",2.5);
  assert.equal(state.player.totalMass,mass);
  assert.equal(state.player.acceleration,accel);
  assert.equal(state.player.r,45);
});

test("camera zoom is explicit apparatus state and does not follow body envelope",()=>{
  const state=createActiveEcologyState();
  setActiveEcologyParameter(state,"cameraZoom",1.75);
  setActiveEcologyParameter(state,"playerEnvelope",4.5);

  assert.equal(state.cameraZoom,1.75);
  assert.equal(state.player.envelope,4.5);

  setActiveEcologyParameter(state,"cameraZoom",999);
  assert.equal(state.cameraZoom,6);
});

test("Workbench actions expose direct spawn pressure and reset preserves authored templates",()=>{
  const instance=activeSpatialEcologyV0.create();

  instance.inspector.set("playerEnvelope",1.5);
  instance.inspector.set("spawnEnvelope",0.65);
  instance.inspector.set("spawnBodyMass",6);
  instance.inspector.set("spawnForceMultiplier",4);
  instance.inspector.set("cameraZoom",1.4);

  instance.inspector.action("spawn10");
  let snapshot=instance.snapshot();
  assert.equal(snapshot.residents.length,ACTIVE_ECOLOGY_BASELINE_COUNT+10);
  assert.ok(snapshot.residents.slice(-10).every(r=>r.envelope===0.65 && r.bodyMass===6 && r.forceMultiplier===4));

  instance.step(right,0.1);
  instance.reset();
  snapshot=instance.snapshot();

  assert.equal(snapshot.residents.length,ACTIVE_ECOLOGY_BASELINE_COUNT);
  assert.equal(snapshot.player.envelope,1.5);
  assert.equal(snapshot.spawnTemplate.envelope,0.65);
  assert.equal(snapshot.spawnTemplate.bodyMass,6);
  assert.equal(snapshot.spawnTemplate.forceMultiplier,4);
  assert.equal(snapshot.cameraZoom,1.4);
});

test("dense pressure remains finite under mixed motion in the current qualitative solver",()=>{
  const state=createActiveEcologyState();
  const spawn=spawnEcologyResidents(state,45);
  assert.ok(spawn.spawned>=35);

  for(let i=0;i<900;i++){
    const phase=i%360;
    const keys=phase<90?["KeyD"]:phase<180?["KeyS"]:phase<270?["KeyA"]:["KeyW"];
    stepActiveEcology(state,{...idle,keys},1/120);
  }

  const bodies=[state.player,...state.residents];
  for(const body of bodies){
    for(const value of [body.x,body.y,body.vx,body.vy,body.r,body.mass,body.acceleration]){
      assert.ok(Number.isFinite(value));
    }
  }
  assert.ok(Number.isFinite(state.bodyContactsPerSecond));
  assert.ok(Number.isFinite(state.staticContactsPerSecond));
});

test("ecology embodiment keeps B0-style cause separation in the new apparatus",()=>{
  const smallHeavy=deriveEcologyEmbodiment({envelope:0.5,bodyMass:20,loadMass:5,forceMultiplier:8});
  const giantHeavy=deriveEcologyEmbodiment({envelope:3,bodyMass:20,loadMass:5,forceMultiplier:8});

  assert.notEqual(smallHeavy.radius,giantHeavy.radius);
  assert.equal(smallHeavy.totalMass,giantHeavy.totalMass);
  assert.equal(smallHeavy.acceleration,giantHeavy.acceleration);
});
