const EPS = 1e-9;

function finite(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(label + " must be finite");
  return n;
}

export function clampMagnitude(vector, maxLength) {
  const x = finite(vector.x, "vector.x");
  const y = finite(vector.y, "vector.y");
  const limit = Math.max(0, finite(maxLength, "maxLength"));
  const length = Math.hypot(x, y);
  if (length <= limit || length < EPS) return { x, y };
  const scale = limit / length;
  return { x: x * scale, y: y * scale };
}

export function computeMotorImpulse({
  mass,
  currentVelocity,
  desiredVelocity,
  acceleration,
  braking,
  dt
}) {
  const m = Math.max(EPS, finite(mass, "mass"));
  const delta = Math.max(EPS, finite(dt, "dt"));
  const accel = Math.max(0, finite(acceleration, "acceleration"));
  const brake = Math.max(0, finite(braking, "braking"));

  const current = {
    x: finite(currentVelocity.x, "currentVelocity.x"),
    y: finite(currentVelocity.y, "currentVelocity.y")
  };
  const desired = {
    x: finite(desiredVelocity.x, "desiredVelocity.x"),
    y: finite(desiredVelocity.y, "desiredVelocity.y")
  };

  const currentSpeed = Math.hypot(current.x, current.y);
  const desiredSpeed = Math.hypot(desired.x, desired.y);
  const dot = current.x * desired.x + current.y * desired.y;
  const slowing = desiredSpeed < EPS || (dot > 0 && desiredSpeed < currentSpeed);
  const maxDeltaV = (slowing ? brake : accel) * delta;
  const requestedDeltaV = {
    x: desired.x - current.x,
    y: desired.y - current.y
  };
  const appliedDeltaV = clampMagnitude(requestedDeltaV, maxDeltaV);

  return {
    x: appliedDeltaV.x * m,
    y: appliedDeltaV.y * m,
    requestedDeltaV,
    appliedDeltaV,
    rate: slowing ? brake : accel
  };
}

export function computeGripImpulse({
  playerMass,
  objectMass,
  anchorVelocity,
  targetError,
  gain = 9,
  maxAnchorSpeed = 8,
  maxForce,
  dt
}) {
  const pm = Math.max(EPS, finite(playerMass, "playerMass"));
  const om = Math.max(EPS, finite(objectMass, "objectMass"));
  const force = Math.max(0, finite(maxForce, "maxForce"));
  const delta = Math.max(EPS, finite(dt, "dt"));
  const k = Math.max(0, finite(gain, "gain"));

  const desired = clampMagnitude({
    x: finite(targetError.x, "targetError.x") * k,
    y: finite(targetError.y, "targetError.y") * k
  }, Math.max(0, finite(maxAnchorSpeed, "maxAnchorSpeed")));

  const correction = {
    x: desired.x - finite(anchorVelocity.x, "anchorVelocity.x"),
    y: desired.y - finite(anchorVelocity.y, "anchorVelocity.y")
  };
  const effectiveMass = 1 / (1 / pm + 1 / om);
  const requested = {
    x: correction.x * effectiveMass,
    y: correction.y * effectiveMass
  };
  const applied = clampMagnitude(requested, force * delta);

  return {
    ...applied,
    desiredAnchorVelocity: desired,
    effectiveMass,
    requestedImpulse: requested
  };
}
