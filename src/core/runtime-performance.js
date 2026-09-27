function nonNegative(value,label){
  const n=Number(value);
  if(!Number.isFinite(n) || n<0) throw new Error(`${label} must be finite and non-negative`);
  return n;
}

function clone(value){
  return value===null || value===undefined ? value : structuredClone(value);
}

export class RuntimePerformanceMeter {
  #windowSeconds;
  #maxSamples;
  #samples;
  #runTotals;
  #lastQuery;
  #lastIntervention;

  constructor({windowSeconds=1.5,maxSamples=240}={}){
    this.#windowSeconds=nonNegative(windowSeconds,"windowSeconds");
    if(this.#windowSeconds<=0) throw new Error("windowSeconds must be positive");
    this.#maxSamples=Math.max(1,Math.floor(nonNegative(maxSamples,"maxSamples")));
    this.#samples=[];
    this.#runTotals=this.#emptyTotals();
    this.#lastQuery=null;
    this.#lastIntervention=null;
  }

  #emptyTotals(){
    return {
      frames:0,
      wallSeconds:0,
      simulatedSeconds:0,
      discardedWallSeconds:0,
      simulationMs:0,
      renderMs:0,
      observationMs:0
    };
  }

  resetFrames(){
    this.#samples=[];
    this.#runTotals=this.#emptyTotals();
  }

  recordFrame({
    wallSeconds,
    simulatedSeconds,
    discardedWallSeconds=0,
    simulationMs=0,
    renderMs=0,
    observationMs=0
  }={}){
    const sample={
      wallSeconds:nonNegative(wallSeconds,"wallSeconds"),
      simulatedSeconds:nonNegative(simulatedSeconds,"simulatedSeconds"),
      discardedWallSeconds:nonNegative(discardedWallSeconds,"discardedWallSeconds"),
      simulationMs:nonNegative(simulationMs,"simulationMs"),
      renderMs:nonNegative(renderMs,"renderMs"),
      observationMs:nonNegative(observationMs,"observationMs")
    };
    this.#samples.push(sample);
    this.#runTotals.frames+=1;
    this.#runTotals.wallSeconds+=sample.wallSeconds;
    this.#runTotals.simulatedSeconds+=sample.simulatedSeconds;
    this.#runTotals.discardedWallSeconds+=sample.discardedWallSeconds;
    this.#runTotals.simulationMs+=sample.simulationMs;
    this.#runTotals.renderMs+=sample.renderMs;
    this.#runTotals.observationMs+=sample.observationMs;

    let wall=this.#samples.reduce((sum,item)=>sum+item.wallSeconds,0);
    while(
      this.#samples.length>1 &&
      (this.#samples.length>this.#maxSamples || wall>this.#windowSeconds)
    ){
      const removed=this.#samples.shift();
      wall-=removed.wallSeconds;
    }
    return this.snapshot();
  }

  recordQuery({name,durationMs}={}){
    this.#lastQuery={
      name:String(name || "query"),
      durationMs:nonNegative(durationMs,"query durationMs")
    };
  }

  recordIntervention({operation,durationMs}={}){
    this.#lastIntervention={
      operation:String(operation || "intervention"),
      durationMs:nonNegative(durationMs,"intervention durationMs")
    };
  }

  snapshot(){
    const totals=this.#samples.reduce((sum,item)=>({
      wallSeconds:sum.wallSeconds+item.wallSeconds,
      simulatedSeconds:sum.simulatedSeconds+item.simulatedSeconds,
      discardedWallSeconds:sum.discardedWallSeconds+item.discardedWallSeconds,
      simulationMs:sum.simulationMs+item.simulationMs,
      renderMs:sum.renderMs+item.renderMs,
      observationMs:sum.observationMs+item.observationMs
    }),{
      wallSeconds:0,
      simulatedSeconds:0,
      discardedWallSeconds:0,
      simulationMs:0,
      renderMs:0,
      observationMs:0
    });

    return {
      sampleCount:this.#samples.length,
      windowWallSeconds:totals.wallSeconds,
      renderHz:totals.wallSeconds>0 ? this.#samples.length/totals.wallSeconds : null,
      simulatedSeconds:totals.simulatedSeconds,
      simulationToWallRatio:totals.wallSeconds>0
        ? totals.simulatedSeconds/totals.wallSeconds
        : null,
      discardedWallSeconds:totals.discardedWallSeconds,
      phaseMs:{
        simulation:totals.simulationMs,
        render:totals.renderMs,
        observation:totals.observationMs
      },
      run:{
        frames:this.#runTotals.frames,
        wallSeconds:this.#runTotals.wallSeconds,
        simulatedSeconds:this.#runTotals.simulatedSeconds,
        simulationToWallRatio:this.#runTotals.wallSeconds>0
          ? this.#runTotals.simulatedSeconds/this.#runTotals.wallSeconds
          : null,
        discardedWallSeconds:this.#runTotals.discardedWallSeconds,
        phaseMs:{
          simulation:this.#runTotals.simulationMs,
          render:this.#runTotals.renderMs,
          observation:this.#runTotals.observationMs
        }
      },
      lastQuery:clone(this.#lastQuery),
      lastIntervention:clone(this.#lastIntervention)
    };
  }
}
