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
    assert.equal(out.length,1,"identity is announced even if the parent's first hi was early");
    assert.equal(out[0].data.type,"hello");
    assert.equal(out[0].origin,"*"); // public identity, never private source state
    out.length=0;
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

test("owner-granted physical actions: precise before-state, pause, idempotency and revocation", () => {
  const out=[],handlers=new Map();
  const parent={postMessage:d=>out.push(d)};
  const old=globalThis.window;
  globalThis.window={parent,addEventListener:(k,h)=>handlers.set(k,h),
    removeEventListener:k=>handlers.delete(k),setInterval:()=>1,clearInterval:()=>{}};
  let permission=false,paused=true,tick=3, aperture=2.2,edits=0,generation=0,performed=0;
  const read=()=>({trace:{fixture:"free",tick,actors:[],cargo:[],grips:[],
    selected:1,aperture:{width:aperture},materialEvents:{edits},
    rootEffort:0,worldEntities:2},paused,remotePermission:permission,generation});
  const perform=action=>{
    performed++;
    if(action==="p10b.aperture.widen")aperture=+(aperture+1.3).toFixed(4);
    else aperture=+(aperture-1.3).toFixed(4);
    edits++;
    return {ok:true,action,after:aperture};
  };
  try{
    const stop=installP10JaskiniaWitness(read,perform);
    const emit=d=>handlers.get("message")({source:parent,origin:"https://host.example",data:d});
    emit({jaskinia:1,type:"hi",v:1});
    emit({protocol:"jozz-worldbench/v0",type:"capture?",id:"observe"});
    const first=out.at(-1).record;
    assert.equal(first.restorable,false);
    const expected={runtimeId:first.runtimeId,aperture:2.2,edits:0};
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-1",
      action:"p10b.aperture.widen",expected});
    assert.equal(out.at(-1).ok,false);
    assert.equal(out.at(-1).error,"owner-opt-in-required");
    assert.equal(performed,0);
    permission=true;
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-2",
      action:"p10b.aperture.widen",expected});
    assert.equal(out.at(-1).ok,true);
    assert.equal(out.at(-1).record.simulation.aperture.width,3.5);
    assert.equal(performed,1);
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-2",
      action:"p10b.aperture.widen",expected});
    assert.equal(out.at(-1).ok,true,"duplicate same id receives prior receipt");
    assert.equal(performed,1,"duplicate action must not move collider again");
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-3",
      action:"p10b.aperture.narrow",expected});
    assert.equal(out.at(-1).error,"stale-physical-state");
    paused=false;
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-4",
      action:"p10b.aperture.narrow",expected:{...expected,aperture:3.5,edits:1}});
    assert.equal(out.at(-1).error,"pause-required");
    paused=true;
    generation++;
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-5",
      action:"p10b.aperture.narrow",expected:{...expected,aperture:3.5,edits:1}});
    assert.equal(out.at(-1).error,"stale-runtime");
    generation--;
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-6",
      action:"p10b.aperture.narrow",expected:{...expected,aperture:3.5,edits:1}});
    assert.equal(out.at(-1).ok,true);
    assert.equal(aperture,2.2);
    permission=false;
    emit({protocol:"jozz-worldbench/v0",type:"action?",id:"act-7",
      action:"p10b.aperture.widen",expected:{...expected,edits:2}});
    assert.equal(out.at(-1).error,"owner-opt-in-required");
    stop();
  }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;}
});
