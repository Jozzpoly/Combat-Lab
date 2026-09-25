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
    const frame=Math.max(0, Math.min(Number.isFinite(frameSeconds) ? frameSeconds : 0, this.maxFrame));
    this.accumulator=Math.min(this.maxAccum, this.accumulator+frame);

    let steps=0;
    while (this.accumulator + 1e-12 >= this.dt) {
      step(this.dt);
      this.accumulator-=this.dt;
      steps+=1;
    }

    return {
      steps,
      alpha:this.accumulator/this.dt
    };
  }
}
