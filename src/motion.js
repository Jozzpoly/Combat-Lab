import { clamp, normalize } from "./math.js";
import { derivePhenotype } from "./phenotype.js";

export function driveActor(actor, inputX, inputY, dt) {
  const p = derivePhenotype(actor.spec, actor.brace);
  const input = normalize(inputX, inputY, 0, 0);

  if (input.length > 0) {
    actor.vx += input.x * p.acceleration * dt;
    actor.vy += input.y * p.acceleration * dt;
  } else {
    const speed = Math.hypot(actor.vx, actor.vy);
    if (speed > 0) {
      const braking = Math.min(speed, p.acceleration * 1.15 * dt);
      actor.vx -= actor.vx / speed * braking;
      actor.vy -= actor.vy / speed * braking;
    }
  }

  const speed = Math.hypot(actor.vx, actor.vy);
  if (speed > p.maxSpeed) {
    const scale = p.maxSpeed / speed;
    actor.vx *= scale;
    actor.vy *= scale;
  }

  actor.x += actor.vx * dt;
  actor.y += actor.vy * dt;

  return p;
}

export function turnActorToward(actor, desiredFacing, dt) {
  const p = derivePhenotype(actor.spec, actor.brace);
  let delta = desiredFacing - actor.facing;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;

  const step = clamp(delta, -p.turnRate * dt, p.turnRate * dt);
  actor.facing += step;
  return p;
}
