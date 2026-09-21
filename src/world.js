import { driveActor } from "./motion.js";

export function circleIntersectsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function actorIntersectsWorld(actor, walls) {
  const radius = actor.spec.body.radius;
  return walls.some(wall => circleIntersectsRect(actor.x, actor.y, radius, wall));
}

export function driveActorInWorld(actor, inputX, inputY, dt, walls) {
  const startX = actor.x;
  const startY = actor.y;

  const phenotype = driveActor(actor, inputX, inputY, dt);
  const targetX = actor.x;
  const targetY = actor.y;

  actor.x = startX;
  actor.y = startY;

  actor.x = targetX;
  if (actorIntersectsWorld(actor, walls)) {
    actor.x = startX;
    actor.vx = 0;
  }

  actor.y = targetY;
  if (actorIntersectsWorld(actor, walls)) {
    actor.y = startY;
    actor.vy = 0;
  }

  return phenotype;
}

export function runRoute(actor, {
  walls,
  inputX = 0,
  inputY = -1,
  seconds = 1,
  dt = 1 / 120
}) {
  const frames = Math.ceil(seconds / dt);
  let blockedFrames = 0;

  for (let i = 0; i < frames; i++) {
    const beforeX = actor.x;
    const beforeY = actor.y;
    driveActorInWorld(actor, inputX, inputY, dt, walls);
    if (
      Math.abs(actor.x - beforeX) < 1e-6 &&
      Math.abs(actor.y - beforeY) < 1e-6
    ) {
      blockedFrames++;
    }
  }

  return {
    x: actor.x,
    y: actor.y,
    blockedFrames
  };
}


export function circleRectPenetration(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  let dx = x - nearestX;
  let dy = y - nearestY;
  const distance = Math.hypot(dx, dy);

  if (distance >= radius) return null;

  if (distance > 1e-9) {
    return {
      nx: dx / distance,
      ny: dy / distance,
      depth: radius - distance
    };
  }

  const toLeft = Math.abs(x - rect.x);
  const toRight = Math.abs(rect.x + rect.w - x);
  const toTop = Math.abs(y - rect.y);
  const toBottom = Math.abs(rect.y + rect.h - y);
  const minimum = Math.min(toLeft, toRight, toTop, toBottom);

  if (minimum === toLeft) return { nx: -1, ny: 0, depth: radius + toLeft };
  if (minimum === toRight) return { nx: 1, ny: 0, depth: radius + toRight };
  if (minimum === toTop) return { nx: 0, ny: -1, depth: radius + toTop };
  return { nx: 0, ny: 1, depth: radius + toBottom };
}

export function resolveActorWorld(actor, walls, iterations = 4) {
  let contacts = 0;
  const radius = actor.spec.body.radius;

  for (let iteration = 0; iteration < iterations; iteration++) {
    let changed = false;
    for (const wall of walls) {
      const hit = circleRectPenetration(actor.x, actor.y, radius, wall);
      if (!hit) continue;

      actor.x += hit.nx * hit.depth;
      actor.y += hit.ny * hit.depth;

      const inwardVelocity = actor.vx * hit.nx + actor.vy * hit.ny;
      if (inwardVelocity < 0) {
        actor.vx -= hit.nx * inwardVelocity;
        actor.vy -= hit.ny * inwardVelocity;
      }

      contacts++;
      changed = true;
    }
    if (!changed) break;
  }

  return contacts;
}
