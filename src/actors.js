import { clamp, normalize, wrapAngle } from "./math.js";

export function createActor(spec, {
  id,
  x,
  y,
  facing = 0,
  kind = "actor"
}) {
  return {
    id,
    kind,
    spec,
    x,
    y,
    vx: 0,
    vy: 0,
    facing,
    state: kind === "pressure" ? "approach" : "free",
    stateTime: 0,
    attackX: 0,
    attackY: 1
  };
}

export function faceToward(actor, x, y, dt, { turnScale = 1 } = {}) {
  const desired = Math.atan2(y - actor.y, x - actor.x);
  const delta = wrapAngle(desired - actor.facing);
  const turn = actor.spec.turnRate * turnScale * dt;
  actor.facing += clamp(delta, -turn, turn);
}

export function driveActor(actor, inputX, inputY, dt, {
  accelerationScale = 1,
  brakingScale = 1,
  speedScale = 1
} = {}) {
  const input = normalize(inputX, inputY, 0, 0);
  const speed = Math.hypot(actor.vx, actor.vy);

  if (input.length > 0) {
    actor.vx += input.x * actor.spec.acceleration * accelerationScale * dt;
    actor.vy += input.y * actor.spec.acceleration * accelerationScale * dt;
  } else if (speed > 0) {
    const drop = Math.min(speed, actor.spec.braking * brakingScale * dt);
    actor.vx -= actor.vx / speed * drop;
    actor.vy -= actor.vy / speed * drop;
  }

  const maxSpeed = actor.spec.maxSpeed * speedScale;
  const nextSpeed = Math.hypot(actor.vx, actor.vy);
  if (nextSpeed > maxSpeed) {
    const s = maxSpeed / nextSpeed;
    actor.vx *= s;
    actor.vy *= s;
  }
}

export function integrateActor(actor, dt) {
  actor.x += actor.vx * dt;
  actor.y += actor.vy * dt;
}
