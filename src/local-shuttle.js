// Narrow research-only actor-local law, not a general NPC architecture.
// No Rapier, geometry, World class, object IDs, or global coordinates enter
// this module. Its only outputs are motor intent and a local state transition.
export function stepLocalShuttle({
  state, sense, direction, mode, maxSpeed,
  lower, upper, recoveryDuration, resistanceTicks, skirtSign = -1
}) {
  if (!["baseline", "tactile-recovery", "directional-recovery", "skirt-recovery"].includes(mode)) {
    throw new RangeError("unrecognized local shuttle mode");
  }
  const next = {
    ...state,
    tick: state.tick + 1,
    estimatedX: state.estimatedX + (sense?.deltaX ?? 0),
    estimatedY: (state.estimatedY ?? 0) + (sense?.deltaY ?? 0),
    skirtTicks: state.skirtTicks ?? 0,
    skirts: state.skirts ?? 0
  };
  let transition = null;
  if ((mode === "tactile-recovery" || mode === "directional-recovery" ||
       mode === "skirt-recovery") &&
      next.recoveryTicks === 0 && next.skirtTicks === 0) {
    const driven = Boolean(sense && sense.motorEffort > 0.01);
    const contactEvidence = Boolean(sense && (
      mode === "tactile-recovery" ? sense.touch : sense.forwardTouch
    ));
    const resisted = contactEvidence &&
      sense.progressAlongIntent !== null &&
      sense.progressAlongIntent < maxSpeed * 0.12;
    next.blockedTicks = driven && resisted ? next.blockedTicks + 1 : 0;
    if (next.blockedTicks >= resistanceTicks) {
      const former = direction;
      if (mode === "skirt-recovery") {
        // Intentionally bounded search-free lateral motion. A body may
        // discover clearance through physics; no global target or shape
        // geometry is available to this local law.
        next.skirtTicks = 155;
        next.skirts += 1;
        next.blockedTicks = 0;
        transition = {
          tick: next.tick,
          reason: "sustained forward contact + low progress + motor effort",
          kind: "lateral-attempt",
          fromDirection: former, toDirection: direction
        };
      } else {
        direction = -direction;
        next.recoveryTicks = recoveryDuration;
        next.blockedTicks = 0;
        next.recoveries += 1;
        transition = {
          tick: next.tick,
          reason: "sustained touch + low progress + motor effort",
          kind: "reversal",
          fromDirection: former, toDirection: direction
        };
      }
      next.lastTransition = transition;
    }
  }
  if (next.recoveryTicks === 0 && next.skirtTicks === 0) {
    if (next.estimatedX > upper) direction = -1;
    if (next.estimatedX < lower) direction = 1;
  }
  let intendedVelocity = { x: maxSpeed * direction, y: 0 };
  if (mode === "skirt-recovery") {
    if (next.skirtTicks > 0) {
      // Forward pressure stays finite, while lateral displacement makes
      // moving around local obstacles physically possible.
      intendedVelocity = {
        x: maxSpeed * direction * 0.42,
        y: maxSpeed * Math.sign(skirtSign) * 0.91
      };
      next.skirtTicks -= 1;
      next.state = "lateral-attempt";
    } else {
      // Return gradually to the *locally integrated* original lane.
      // Cannot look up current World y or the obstacle boundary.
      const lateral = Math.max(-maxSpeed * 0.70,
        Math.min(maxSpeed * 0.70, -next.estimatedY * 1.8));
      intendedVelocity = {
        x: maxSpeed * direction * Math.sqrt(Math.max(
          0, 1 - (lateral / Math.max(maxSpeed, 1e-8)) ** 2
        )),
        y: lateral
      };
      next.state = Math.abs(next.estimatedY) > 0.06 ?
        "lane-return" : next.blockedTicks > 0 ? "contact-pressure" : "cruise";
    }
  } else {
    next.state = next.recoveryTicks > 0 ? "backoff" :
      next.blockedTicks > 0 ? "contact-pressure" : "cruise";
  }
  if (next.recoveryTicks > 0) next.recoveryTicks -= 1;
  return { state: next, direction, intendedVelocity, transition };
}
