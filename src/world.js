import { integrateActor } from "./actors.js";

export function circleRectPenetration(x, y, radius, rect) {
  const nx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  let dx = x - nx;
  let dy = y - ny;
  const distance = Math.hypot(dx, dy);

  if (distance >= radius) return null;

  if (distance > 1e-9) {
    return { nx: dx / distance, ny: dy / distance, depth: radius - distance };
  }

  const left = Math.abs(x - rect.x);
  const right = Math.abs(rect.x + rect.w - x);
  const top = Math.abs(y - rect.y);
  const bottom = Math.abs(rect.y + rect.h - y);
  const m = Math.min(left, right, top, bottom);

  if (m === left) return { nx: -1, ny: 0, depth: radius + left };
  if (m === right) return { nx: 1, ny: 0, depth: radius + right };
  if (m === top) return { nx: 0, ny: -1, depth: radius + top };
  return { nx: 0, ny: 1, depth: radius + bottom };
}

export function pointClear(world, x, y, radius) {
  const i = world.inset + radius;
  if (x < i || x > world.width - i || y < i || y > world.height - i) return false;
  return !world.walls.some(w => circleRectPenetration(x, y, radius, w));
}

export function resolveActorWorld(actor, world, iterations = 4) {
  let contacts = 0;
  const r = actor.spec.radius;
  const minX = world.inset + r;
  const maxX = world.width - world.inset - r;
  const minY = world.inset + r;
  const maxY = world.height - world.inset - r;

  if (actor.x < minX) { actor.x = minX; if (actor.vx < 0) actor.vx = 0; contacts++; }
  if (actor.x > maxX) { actor.x = maxX; if (actor.vx > 0) actor.vx = 0; contacts++; }
  if (actor.y < minY) { actor.y = minY; if (actor.vy < 0) actor.vy = 0; contacts++; }
  if (actor.y > maxY) { actor.y = maxY; if (actor.vy > 0) actor.vy = 0; contacts++; }

  for (let iteration = 0; iteration < iterations; iteration++) {
    let changed = false;
    for (const wall of world.walls) {
      const hit = circleRectPenetration(actor.x, actor.y, r, wall);
      if (!hit) continue;
      actor.x += hit.nx * hit.depth;
      actor.y += hit.ny * hit.depth;
      const inward = actor.vx * hit.nx + actor.vy * hit.ny;
      if (inward < 0) {
        actor.vx -= hit.nx * inward;
        actor.vy -= hit.ny * inward;
      }
      contacts++;
      changed = true;
    }
    if (!changed) break;
  }
  return contacts;
}

export function stepActorWorld(actor, world, dt) {
  integrateActor(actor, dt);
  return resolveActorWorld(actor, world);
}

export function resolveActorPair(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const required = a.spec.radius + b.spec.radius;
  if (distance >= required) return null;

  const nx = distance > 1e-9 ? dx / distance : 1;
  const ny = distance > 1e-9 ? dy / distance : 0;
  const overlap = required - Math.max(distance, 1e-9);
  const invA = 1 / Math.max(1, a.spec.mass);
  const invB = 1 / Math.max(1, b.spec.mass);
  const invTotal = invA + invB;

  const moveA = overlap * invA / invTotal;
  const moveB = overlap * invB / invTotal;
  a.x -= nx * moveA;
  a.y -= ny * moveA;
  b.x += nx * moveB;
  b.y += ny * moveB;

  const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  let impulse = 0;
  if (relative < 0) {
    impulse = -relative / invTotal;
    a.vx -= nx * impulse * invA;
    a.vy -= ny * impulse * invA;
    b.vx += nx * impulse * invB;
    b.vy += ny * impulse * invB;
  }

  return { overlap, moveA, moveB, impulse };
}

export function resolvePairs(actors) {
  let contacts = 0;
  for (let i = 0; i < actors.length; i++) {
    for (let j = i + 1; j < actors.length; j++) {
      if (resolveActorPair(actors[i], actors[j])) contacts++;
    }
  }
  return contacts;
}
