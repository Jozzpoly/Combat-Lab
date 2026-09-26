export class FixedStepRunner {
  constructor({dt=1/120, maxFrame=0.05, maxAccum=0.10}={}) {
    if (!(dt > 0)) throw new Error("dt must be > 0");
    if (!(maxFrame > 0)) throw new Error("maxFrame must be > 0");
    if (!(maxAccum >= dt)) throw new Error("maxAccum must be >= dt");
    this.dt=dt;
    this.maxFrame=maxFrame;
    this.maxAccum=maxAccum;
    this.accumulator=0;
  }

  reset() {
    this.accumulator=0;
  }

  advance(frameSeconds, step) {
    const rawFrame=Math.max(0,Number.isFinite(frameSeconds) ? frameSeconds : 0);
    const frame=Math.min(rawFrame,this.maxFrame);
    const frameDropped=Math.max(0,rawFrame-frame);

    const requestedAccum=this.accumulator+frame;
    const nextAccum=Math.min(this.maxAccum,requestedAccum);
    const accumDropped=Math.max(0,requestedAccum-nextAccum);
    this.accumulator=nextAccum;

    let steps=0;
    while (this.accumulator + 1e-12 >= this.dt) {
      step(this.dt);
      this.accumulator-=this.dt;
      steps+=1;
    }

    return {
      steps,
      alpha:this.accumulator/this.dt,
      rawFrame,
      acceptedFrame:frame,
      droppedSeconds:frameDropped+accumDropped
    };
  }
}
