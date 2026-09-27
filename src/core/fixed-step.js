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
    const rawFrameSeconds=Math.max(
      0,
      Number.isFinite(frameSeconds) ? Number(frameSeconds) : 0
    );
    const acceptedFrameSeconds=Math.min(rawFrameSeconds,this.maxFrame);
    const discardedFrameSeconds=rawFrameSeconds-acceptedFrameSeconds;

    const accumulated=this.accumulator+acceptedFrameSeconds;
    const acceptedAccumulator=Math.min(this.maxAccum,accumulated);
    const discardedAccumulatorSeconds=accumulated-acceptedAccumulator;
    this.accumulator=acceptedAccumulator;

    let steps=0;
    while (this.accumulator + 1e-12 >= this.dt) {
      step(this.dt);
      this.accumulator-=this.dt;
      steps+=1;
    }

    return {
      steps,
      alpha:this.accumulator/this.dt,
      rawFrameSeconds,
      acceptedFrameSeconds,
      discardedFrameSeconds,
      discardedAccumulatorSeconds,
      discardedSeconds:discardedFrameSeconds+discardedAccumulatorSeconds,
      simulatedSeconds:steps*this.dt
    };
  }
}
