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

export function faceToward(actor, x, y, dt) {
  const desired = Math.atan2(y - actor.y, x - actor.x);
  const delta = wrapAngle(desired - actor.facing);
  actor.facing += clamp(delta, -actor.spec.turnRate * dt, actor.spec.turnRate * dt);
}

export function driveActor(actor, inputX, inputY, dt) {
  const input = normalize(inputX, inputY, 0, 0);
  const speed = Math.hypot(actor.vx, actor.vy);

  if (input.length > 0) {
    actor.vx += input.x * actor.spec.acceleration * dt;
    actor.vy += input.y * actor.spec.acceleration * dt;
  } else if (speed > 0) {
    const drop = Math.min(speed, actor.spec.braking * dt);
    actor.vx -= actor.vx / speed * drop;
    actor.vy -= actor.vy / speed * drop;
  }

  const nextSpeed = Math.hypot(actor.vx, actor.vy);
  if (nextSpeed > actor.spec.maxSpeed) {
    const s = actor.spec.maxSpeed / nextSpeed;
    actor.vx *= s;
    actor.vy *= s;
  }
}

export function integrateActor(actor, dt) {
  actor.x += actor.vx * dt;
  actor.y += actor.vy * dt;
}
