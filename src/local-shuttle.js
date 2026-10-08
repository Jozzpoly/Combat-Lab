// Narrow research-only actor-local law, not a general NPC architecture.
// No Rapier, geometry, World class, object IDs, or global coordinates enter
// this module. Its only outputs are motor intent and a local state transition.
export function stepLocalShuttle({
  state, sense, direction, mode, maxSpeed,
  lower, upper, recoveryDuration, resistanceTicks
}) {
  if (!["baseline", "tactile-recovery", "directional-recovery"].includes(mode)) {
    throw new RangeError("unrecognized local shuttle mode");
  }
  const next = {
    ...state,
    tick: state.tick + 1,
    estimatedX: state.estimatedX + (sense?.deltaX ?? 0)
  };
  let transition = null;
  if ((mode === "tactile-recovery" || mode === "directional-recovery") &&
      next.recoveryTicks === 0) {
    const driven = Boolean(sense && sense.motorEffort > 0.01);
    const contactEvidence = Boolean(sense && (
      mode === "directional-recovery" ? sense.forwardTouch : sense.touch
    ));
    const resisted = contactEvidence &&
      sense.progressAlongIntent !== null &&
      sense.progressAlongIntent < maxSpeed * 0.12;
    next.blockedTicks = driven && resisted ? next.blockedTicks + 1 : 0;
    if (next.blockedTicks >= resistanceTicks) {
      const former = direction;
      direction = -direction;
      next.recoveryTicks = recoveryDuration;
      next.blockedTicks = 0;
      next.recoveries += 1;
      transition = {
        tick: next.tick,
        reason: "sustained touch + low progress + motor effort",
        fromDirection: former, toDirection: direction
      };
      next.lastTransition = transition;
    }
  }
  if (next.recoveryTicks === 0) {
    if (next.estimatedX > upper) direction = -1;
    if (next.estimatedX < lower) direction = 1;
  }
  next.state = next.recoveryTicks > 0 ? "backoff" :
    next.blockedTicks > 0 ? "contact-pressure" : "cruise";
  const intendedVelocity = { x: maxSpeed * direction, y: 0 };
  if (next.recoveryTicks > 0) next.recoveryTicks -= 1;
  return { state: next, direction, intendedVelocity, transition };
}
