// Narrow research-only actor-local law, not a general NPC architecture.
// No Rapier, geometry, World class, object IDs, or global coordinates enter
// this module. Its only outputs are motor intent and a local state transition.
export function stepLocalShuttle({
  state, sense, direction, mode, maxSpeed,
  lower, upper, recoveryDuration, resistanceTicks,
  sidePreference = 1, lateralTicks = 96
}) {
  if (!["baseline", "tactile-recovery", "directional-recovery", "lateral-maneuver"].includes(mode)) {
    throw new RangeError("unrecognized local shuttle mode");
  }
  if (!Number.isInteger(sidePreference) || Math.abs(sidePreference) !== 1 ||
      !Number.isInteger(lateralTicks) || lateralTicks < 1) {
    throw new RangeError("lateral maneuver requires +/-1 side and positive duration");
  }
  const next = {
    ...state,
    tick: state.tick + 1,
    estimatedX: state.estimatedX + (sense?.deltaX ?? 0),
    estimatedY: (state.estimatedY ?? 0) + (sense?.deltaY ?? 0),
    lateralTicks: state.lateralTicks ?? 0,
    lateralAttempts: state.lateralAttempts ?? 0
  };
  let transition = null;
  if ((mode === "tactile-recovery" || mode === "directional-recovery" ||
       mode === "lateral-maneuver") &&
      next.recoveryTicks === 0 && next.lateralTicks === 0) {
    const driven = Boolean(sense && sense.motorEffort > 0.01);
    const contactEvidence = Boolean(sense && (
      (mode === "directional-recovery" || mode === "lateral-maneuver") ?
        sense.forwardTouch : sense.touch
    ));
    const resisted = contactEvidence &&
      sense.progressAlongIntent !== null &&
      sense.progressAlongIntent < maxSpeed * 0.12;
    next.blockedTicks = driven && resisted ? next.blockedTicks + 1 : 0;
    if (next.blockedTicks >= resistanceTicks) {
      const former = direction;
      next.blockedTicks = 0;
      if (mode === "lateral-maneuver") {
        next.lateralTicks = lateralTicks;
        next.lateralAttempts += 1;
        transition = {
          tick: next.tick,
          reason: "sustained forward resistance; finite side maneuver",
          fromDirection: former, toDirection: direction,
          lateralDirection: sidePreference
        };
      } else {
        direction = -direction;
        next.recoveryTicks = recoveryDuration;
        next.recoveries += 1;
        transition = {
          tick: next.tick,
          reason: "sustained touch + low progress + motor effort",
          fromDirection: former, toDirection: direction
        };
      }
      next.lastTransition = transition;
    }
  }
  if (next.recoveryTicks === 0 && next.lateralTicks === 0) {
    if (next.estimatedX > upper) direction = -1;
    if (next.estimatedX < lower) direction = 1;
  }
  next.state = next.lateralTicks > 0 ? "lateral" :
    next.recoveryTicks > 0 ? "backoff" :
    next.blockedTicks > 0 ? "contact-pressure" : "cruise";
  // A bounded exploratory vector, not path planning. It can visibly fail
  // against longer obstacles or in a crowded corridor.
  const intendedVelocity = next.lateralTicks > 0 ?
    { x: maxSpeed * direction * 0.55,
      y: maxSpeed * sidePreference * 0.84 } :
    { x: maxSpeed * direction, y: 0 };
  if (next.lateralTicks > 0) next.lateralTicks -= 1;
  if (next.recoveryTicks > 0) next.recoveryTicks -= 1;
  return { state: next, direction, intendedVelocity, transition };
}
