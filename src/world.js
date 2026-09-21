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
