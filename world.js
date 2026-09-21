import {
  angleDelta,
  circleRectPenetration,
  clamp,
  moveToward,
  normalize,
  wrapAngle
} from "./core.js";

export const WORLD = Object.freeze({
  width: 1760,
  height: 1080,
  walls: Object.freeze([
    { id: "north", x: 0, y: 0, w: 1760, h: 52 },
    { id: "south", x: 0, y: 1028, w: 1760, h: 52 },
    { id: "west", x: 0, y: 0, w: 52, h: 1080 },
    { id: "east", x: 1708, y: 0, w: 52, h: 1080 },

    { id: "ruin-upper", x: 790, y: 150, w: 44, h: 345 },
    { id: "ruin-lower", x: 790, y: 575, w: 44, h: 315 },

    { id: "broken-wall", x: 1110, y: 350, w: 270, h: 38 },
    { id: "side-wall", x: 1320, y: 388, w: 38, h: 220 },

    { id: "pillar-a", x: 500, y: 300, w: 88, h: 88 },
    { id: "pillar-b", x: 1010, y: 760, w: 78, h: 78 }
  ])
});

export function createBody({
  id,
  x,
  y,
  radius = 18,
  mass = 1,
  maxSpeed = 240,
  acceleration = 1900,
  braking = 2300,
  turnRate = 11,
  hp = 100
}) {
  return {
    id,
    x, y,
    vx: 0,
    vy: 0,
    radius,
    mass,
    maxSpeed,
    acceleration,
    braking,
    turnRate,
    facing: 0,
    desiredFacing: 0,
    hp,
    maxHp: hp,
    alive: true,
    hitFlash: 0,
    impactFlash: 0
  };
}

export function setDesiredFacing(body, angle) {
  body.desiredFacing = wrapAngle(angle);
}

export function updateFacing(body, dt) {
  const delta = angleDelta(body.facing, body.desiredFacing);
  const step = Math.min(Math.abs(delta), body.turnRate * dt);
  body.facing = wrapAngle(body.facing + Math.sign(delta) * step);
}

export function driveBody(body, moveX, moveY, dt, speedScale = 1) {
  if (!body.alive) return;

  const n = normalize(moveX, moveY, 0, 0);
  const desiredVx = n.length > 0 ? n.x * body.maxSpeed * speedScale : 0;
  const desiredVy = n.length > 0 ? n.y * body.maxSpeed * speedScale : 0;
  const accel = n.length > 0 ? body.acceleration : body.braking;

  body.vx = moveToward(body.vx, desiredVx, accel * dt);
  body.vy = moveToward(body.vy, desiredVy, accel * dt);

  body.x += body.vx * dt;
  body.y += body.vy * dt;

  resolveBodyStatic(body);
}

export function resolveBodyStatic(body) {
  body.x = clamp(body.x, body.radius, WORLD.width - body.radius);
  body.y = clamp(body.y, body.radius, WORLD.height - body.radius);

  for (const rect of WORLD.walls) {
    const hit = circleRectPenetration({ x: body.x, y: body.y, r: body.radius }, rect);
    if (!hit) continue;

    body.x += hit.nx * hit.depth;
    body.y += hit.ny * hit.depth;

    const inward = body.vx * hit.nx + body.vy * hit.ny;
    if (inward < 0) {
      body.vx -= hit.nx * inward;
      body.vy -= hit.ny * inward;
    }
  }
}

export function resolveBodyPair(a, b, softness = 0.78) {
  if (!a.alive || !b.alive) return null;

  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let d = Math.hypot(dx, dy);
  const minD = a.radius + b.radius;

  if (d >= minD) return null;
  if (d < 1e-8) { dx = 1; dy = 0; d = 1; }

  const nx = dx / d;
  const ny = dy / d;
  const depth = minD - d;

  const invA = 1 / Math.max(0.001, a.mass);
  const invB = 1 / Math.max(0.001, b.mass);
  const invSum = invA + invB;

  const moveA = depth * softness * (invA / invSum);
  const moveB = depth * softness * (invB / invSum);

  a.x -= nx * moveA;
  a.y -= ny * moveA;
  b.x += nx * moveB;
  b.y += ny * moveB;

  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const closing = rvx * nx + rvy * ny;

  if (closing < 0) {
    const impulse = -closing * 0.46 / invSum;
    a.vx -= nx * impulse * invA;
    a.vy -= ny * impulse * invA;
    b.vx += nx * impulse * invB;
    b.vy += ny * impulse * invB;
  }

  resolveBodyStatic(a);
  resolveBodyStatic(b);

  return { nx, ny, depth };
}

export function pushBody(body, ix, iy) {
  body.vx += ix / Math.max(0.001, body.mass);
  body.vy += iy / Math.max(0.001, body.mass);
}

export function tickBodyVisuals(body, dt) {
  body.hitFlash = Math.max(0, body.hitFlash - dt);
  body.impactFlash = Math.max(0, body.impactFlash - dt);
}
