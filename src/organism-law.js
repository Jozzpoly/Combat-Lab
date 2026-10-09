// Local response law. Receives only previous-step private contact/progress,
// never world geometry, actor IDs, routes or global positions.
export const MORPHS = Object.freeze({
  dart: { name: "Dart / compact", mass: 18, speed: 5.2, acceleration: 26,
    braking: 32, turnRate: 3.8, turnTorque: 95, width: 0.42, length: 1.05,
    gripReach: 1.8, gripForce: 120, color: "#75c6e8" },
  crawler: { name: "Crawler / hinged", mass: 88, speed: 2.75, acceleration: 12,
    braking: 14, turnRate: 1.65, turnTorque: 280, rearDrive: 0.55, width: 0.74, length: 2.65,
    gripReach: 2.3, gripForce: 330, color: "#d9b17b" },
  broad: { name: "Broad / pusher", mass: 245, speed: 2.0, acceleration: 7.5,
    braking: 10, turnRate: 0.9, turnTorque: 540, width: 2.3, length: 1.7,
    gripReach: 2.6, gripForce: 750, color: "#a99ae3" }
});
export const KINDS = Object.freeze(Object.keys(MORPHS));
export const DT = 1 / 60;
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function wrap(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}
export function localResponse(state, sensed) {
  const next = { ...state, age: (state.age || 0) + 1 };
  // Gated by actual solver-active contact AND poor realized progress.
  // Alternation is a private local history, not obstacle-length knowledge.
  if (sensed.touch && sensed.progress < 0.20 && next.recover <= 0) {
    next.pressure = (next.pressure || 0) + 1;
  } else next.pressure = 0;
  if (next.pressure >= 14) {
    next.pressure = 0;
    next.recover = 65;
    next.turnSide = -(next.turnSide || 1);
    next.recoveries = (next.recoveries || 0) + 1;
  }
  if (next.recover > 0) {
    next.recover -= 1;
    return { state: next, steer: (next.turnSide || 1) * 1.0,
      throttle: next.recover > 43 ? -0.45 : 0.50 };
  }
  // Quiet, actor-local wandering; never consult a target or a map.
  const wander = Math.sin(next.age * 0.012) * 0.12;
  return { state: next, steer: wander, throttle: 0.85 };
}
export function finiteDrive({ mass, velocity, heading, input, speed, acceleration,
  braking, traction, dt = DT }) {
  // Explicit top-down substrate traction approximation: external ground
  // reaction is represented by a bounded impulse budget, not Rapier ground contact.
  if (!Number.isFinite(mass) || mass < 0) throw new RangeError("invalid allocated drive mass");
  if (mass === 0) return {x:0,y:0};
  const dx = Math.cos(heading), dy = Math.sin(heading);
  const desired = { x: dx * speed * input, y: dy * speed * input };
  const error = { x: desired.x - velocity.x, y: desired.y - velocity.y };
  const limit = mass * (Math.abs(input) > 0.01 ? acceleration : braking) *
    clamp(traction, 0, 1) * dt;
  const mag = Math.hypot(error.x, error.y);
  const factor = mag > 0 ? Math.min(1, limit / (mass * mag)) : 0;
  return { x: mass * error.x * factor, y: mass * error.y * factor };
}


// Point-target intent is translated into finite reciprocal impulse. This
// translational effective-mass approximation delegates off-axis rotation to
// Rapier; it is deliberately not claimed as precision hand biomechanics.
export function finiteGrip({ playerMass, objectMass, anchorVelocity,
  targetError, maxForce, dt = DT }) {
  for (const [key, value] of Object.entries({playerMass, objectMass,maxForce,dt,
    ax:anchorVelocity.x, ay:anchorVelocity.y, ex:targetError.x, ey:targetError.y}))
    if (!Number.isFinite(value)) throw new RangeError("nonfinite grip "+key);
  if (playerMass <= 0 || objectMass <= 0 || maxForce < 0 || dt <= 0)
    throw new RangeError("invalid grip mass/force/dt");
  const len = Math.hypot(targetError.x, targetError.y);
  const desiredMag = Math.min(6, len * 7);
  const desired = len > 1e-8 ?
    { x: targetError.x / len * desiredMag,
      y: targetError.y / len * desiredMag } : { x: 0, y: 0 };
  const effective = 1 / (1/playerMass + 1/objectMass);
  const raw = {x:(desired.x-anchorVelocity.x)*effective,
    y:(desired.y-anchorVelocity.y)*effective};
  const requested = Math.hypot(raw.x,raw.y);
  const limit = maxForce*dt;
  const factor = requested > 1e-8 ? Math.min(1,limit/requested) : 0;
  return {x:raw.x*factor,y:raw.y*factor};
}
