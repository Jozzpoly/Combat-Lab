// Narrow research-only actor-local law, not a general NPC architecture.
// No Rapier, geometry, World class, object IDs, or global coordinates enter
// this module. Its only outputs are motor intent and a local state transition.
export function stepLocalShuttle({
  state, sense, direction, mode, maxSpeed,
  lower, upper, recoveryDuration, resistanceTicks,
  sidePreference = 1, lateralTicks = 96
}) {
  if (!["baseline", "tactile-recovery", "directional-recovery", "lateral-maneuver", "adaptive-lateral"].includes(mode)) {
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
    lateralAttempts: state.lateralAttempts ?? 0,
    lateralSide: state.lateralSide ?? sidePreference,
    lateralBlockedTicks: state.lateralBlockedTicks ?? 0,
    lateralFlips: state.lateralFlips ?? 0,
    sideFlipUsed: state.sideFlipUsed ?? false
  };
  let transition = null;
  if (mode === "adaptive-lateral" && next.lateralTicks > 0 &&
      !next.sideFlipUsed) {
    // This is a local failure of the CURRENT side effort, never a query of
    // obstacle extent, route feasibility or absolute world position.
    const resistedSide = Boolean(sense && sense.forwardTouch &&
      sense.motorEffort > 0.01 &&
      sense.deltaY * next.lateralSide < 0.0015);
    next.lateralBlockedTicks = resistedSide ?
      next.lateralBlockedTicks + 1 : 0;
    if (next.lateralBlockedTicks >= 10) {
      next.lateralSide = -next.lateralSide;
      next.sideFlipUsed = true;
      next.lateralFlips += 1;
      next.lateralBlockedTicks = 0;
      next.lateralTicks = lateralTicks;
      transition = {
        tick: next.tick,
        reason: "own lateral push made no progress despite forward touch",
        lateralDirection: next.lateralSide,
        sideFlip: true
      };
      next.lastTransition = transition;
    }
  }
  if ((mode === "tactile-recovery" || mode === "directional-recovery" ||
       mode === "lateral-maneuver" || mode === "adaptive-lateral") &&
      next.recoveryTicks === 0 && next.lateralTicks === 0) {
    const driven = Boolean(sense && sense.motorEffort > 0.01);
    const contactEvidence = Boolean(sense && (
      (mode === "directional-recovery" || mode === "lateral-maneuver" ||
        mode === "adaptive-lateral") ?
        sense.forwardTouch : sense.touch
    ));
    const resisted = contactEvidence &&
      sense.progressAlongIntent !== null &&
      sense.progressAlongIntent < maxSpeed * 0.12;
    next.blockedTicks = driven && resisted ? next.blockedTicks + 1 : 0;
    if (next.blockedTicks >= resistanceTicks) {
      const former = direction;
      next.blockedTicks = 0;
      if (mode === "lateral-maneuver" || mode === "adaptive-lateral") {
        next.lateralTicks = lateralTicks;
        next.lateralAttempts += 1;
        next.lateralSide = sidePreference;
        next.lateralBlockedTicks = 0;
        next.sideFlipUsed = false;
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
      y: maxSpeed * next.lateralSide * 0.84 } :
    { x: maxSpeed * direction, y: 0 };
  if (next.lateralTicks > 0) next.lateralTicks -= 1;
  if (next.recoveryTicks > 0) next.recoveryTicks -= 1;
  return { state: next, direction, intendedVelocity, transition };
}
