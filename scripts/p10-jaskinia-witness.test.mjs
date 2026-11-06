import test from "node:test";
import assert from "node:assert/strict";
import {installP10JaskiniaWitness} from "../src/p10-jaskinia-witness.js";

test("real-source witness: parent-bound, read-only, explicit non-replayable sample", () => {
  const out = [], handlers = new Map();
  const parent = {postMessage: (data, origin) => out.push({data, origin})};
  const fake = {parent, addEventListener: (k, v) => handlers.set(k, v),
    removeEventListener: (k) => handlers.delete(k),
    setInterval: () => 7, clearInterval: () => {}};
  const old = globalThis.window;
  globalThis.window = fake;
  let reads = 0;
  try {
    const stop = installP10JaskiniaWitness(() => {
      reads++;
      return {trace: {fixture:"free",tick:120,actors:[{id:1,x:4}],cargo:[{id:2,x:5}],
        grips:[],worldEntities:2,rootEffort:8,selected:1,aperture:{width:2.2}},
        camera:{x:4,y:5,zoom:2},paused:true,operatorMode:"select"};
    });
    const emit = (source, origin, data) => handlers.get("message")({source,origin,data});
    emit({}, "https://workbench.example", {jaskinia:1,type:"hi"});
    assert.equal(reads, 0, "unrelated frame must not start telemetry");
    emit(parent, "https://workbench.example", {jaskinia:1,type:"hi"});
    assert.equal(out[0].data.type, "hello");
    assert.equal(out[0].origin, "https://workbench.example");
    assert.equal(out[1].data.type, "state");
    assert.equal(out[2].data.type, "signals");
    const before = out.length;
    emit(parent, "https://attacker.example",
      {protocol:"jozz-worldbench/v0",type:"capture?",id:"r1"});
    assert.equal(out.length,before);
    emit(parent, "https://workbench.example",
      {protocol:"jozz-worldbench/v0",type:"capture?",id:"r1"});
    const cap=out.at(-1).data;
    assert.equal(cap.type,"capture");
    assert.equal(cap.ok,true);
    assert.equal(cap.record.simulation.tick,120);
    assert.equal(cap.record.simulation.actors[0].x,4);
    assert.equal(cap.record.restorable,false);
    assert.equal(cap.record.kind,"read-only-physical-witness");
    assert.equal(out.at(-1).origin,"https://workbench.example");
    stop();
    assert.equal(handlers.has("message"),false);
  } finally { if (old === undefined) delete globalThis.window; else globalThis.window=old; }
});

test("oversized / unreadable witness returns an error, never a fake sample", () => {
  const out=[], handlers=new Map();
  const parent={postMessage: data=>out.push(data)};
  const old=globalThis.window;
  globalThis.window={parent,addEventListener:(k,h)=>handlers.set(k,h),
    removeEventListener:k=>handlers.delete(k),
    setInterval:()=>1,clearInterval:()=>{}};
  try {
    const stop=installP10JaskiniaWitness(()=>({trace:{fixture:"free",tick:0,actors:[],
      cargo:[],grips:[],rootEffort:0,selected:0,worldEntities:0,extra:"x".repeat(50000)}}));
    const m=handlers.get("message");
    m({source:parent,origin:"null",data:{jaskinia:1,type:"hi"}});
    m({source:parent,origin:"null",
      data:{protocol:"jozz-worldbench/v0",type:"capture?",id:"case-2"}});
    assert.equal(out.at(-1).ok,false);
    assert.match(out.at(-1).error,/size limit/);
    stop();
  }finally{ if (old===undefined)delete globalThis.window;else globalThis.window=old; }
});
