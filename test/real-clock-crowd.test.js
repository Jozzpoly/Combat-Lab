import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { OrganismField } from "../src/organism-field.js";

// Runner-observed wall time, not Chromium's mocked virtual-time clock.
// Observational, noisy across hosted runners; NOT a production FPS gate.
test("mixed-morph population under real monotonic timing", {timeout:90000},()=>{
 const results=[],forms=["dart","crawler","broad","worm"];
 for(const count of [16,76,152]){
  const field=new OrganismField();
  try{
   for(let i=0;i<count-4;i++){
    const angle=i*2.399963229728653,rad=.42*Math.sqrt(i);
    field.spawn(forms[i%forms.length],
      {x:17+Math.cos(angle)*rad,y:11+Math.sin(angle)*rad},angle);
   }
   assert.equal(field.actors.length,count);
   for(let i=0;i<30;i++)field.step(null);
   const elapsed=[],contacts=[];
   for(let i=0;i<140;i++){
    const t=performance.now();
    field.step(null);
    elapsed.push(performance.now()-t);
    contacts.push(field.activeContactCount);
   }
   const sorted=[...elapsed].sort((a,b)=>a-b);
   const mean=elapsed.reduce((a,b)=>a+b,0)/elapsed.length;
   const p95=sorted[Math.floor(sorted.length*.95)];
   const worst=sorted.at(-1);
   assert(mean>0&&Number.isFinite(mean)&&Number.isFinite(worst),
     "no usable real monotonic wall timing");
   assert(field.actors.every(a=>{
     const p=a.root.translation();
     const t=a.tail?.translation();
     return Number.isFinite(p.x+p.y+a.root.rotation()) &&
       (!t||Number.isFinite(t.x+t.y));
   }),"nonfinite mixed morphology under real-clock pressure");
   results.push({actors:count,steps:140,
     meanWallMs:+mean.toFixed(3),p95WallMs:+p95.toFixed(3),
     maxWallMs:+worst.toFixed(3),
     maxContactIncidences:Math.max(...contacts)});
  }finally{field.world.free();}
 }
 console.log("OBSERVED real-clock crowd physics, not throughput guarantee: "+
   JSON.stringify(results));
});
