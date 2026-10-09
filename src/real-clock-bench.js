// Human-scale timing evidence must come from a real monotonic clock, not
// Chromium's --virtual-time-budget clock (which can report exactly zero).
// Results are runner-specific observations, NEVER product-scale approval.
export function realClockCrowdBenchmark(Field) {
  const kinds=["dart","crawler","broad","worm"];
  const results=[];
  for(const actors of [16,76,152]){
    const field=new Field();
    try{
      for(let i=0;i<actors-4;i++){
        const phi=i*2.399963229728653,r=.42*Math.sqrt(i);
        field.spawn(kinds[i%4],{
          x:17+r*Math.cos(phi),y:11+r*Math.sin(phi)},phi);
      }
      if(field.actors.length!==actors)
        throw Error("population setup did not construct all physical bodies");
      for(let i=0;i<30;i++)field.step(null);
      const timings=[];
      let maxContacts=0;
      for(let tick=0;tick<140;tick++){
        const start=performance.now();
        field.step(null);
        const elapsed=performance.now()-start;
        if(!Number.isFinite(elapsed)||elapsed<0)
          throw Error("monotonic wall clock invalid");
        timings.push(elapsed);
        maxContacts=Math.max(maxContacts,field.activeContactCount);
      }
      for(const actor of field.actors){
        const p=actor.root.translation(),q=actor.tail?.translation();
        if(!Number.isFinite(p.x+p.y+actor.root.rotation()) ||
          (q&&!Number.isFinite(q.x+q.y)))
          throw Error("nonfinite body under mixed contact pressure");
      }
      timings.sort((a,b)=>a-b);
      const mean=timings.reduce((a,b)=>a+b,0)/timings.length;
      if(mean<=0)
        throw Error("host wall clock resolution did not capture finite timing");
      results.push({actors,steps:140,
        meanMs:Number(mean.toFixed(3)),
        p95Ms:Number(timings[Math.floor(timings.length*.95)].toFixed(3)),
        maxMs:Number(timings.at(-1).toFixed(3)),
        maxContactIncidences:maxContacts});
    }finally{field.world.free();}
  }
  return results;
}
