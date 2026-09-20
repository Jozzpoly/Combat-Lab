import { angleDelta, clamp, lineOfSightBlocked, normalize, wrapAngle } from "./core.js";
import { WORLD, setDesiredFacing } from "./world.js";
import { requestAttack } from "./combat.js";

export function createDuelistBrain(seed = 1) {
  return {
    orbitSign: seed % 2 ? 1 : -1,
    decisionTimer: 0,
    attackCooldown: 0.55,
    hesitation: 0.12,
    lastDistance: Infinity
  };
}

function pathClear(x, y, angle, distance, radius) {
  const ex = x + Math.cos(angle) * distance;
  const ey = y + Math.sin(angle) * distance;

  if (ex < radius || ey < radius || ex > WORLD.width - radius || ey > WORLD.height - radius) {
    return false;
  }

  return !lineOfSightBlocked(x, y, ex, ey, WORLD.walls);
}

function chooseMoveDirection(body, target, desiredAngle) {
  const candidates = [
    0,
    0.34,
    -0.34,
    0.70,
    -0.70,
    1.08,
    -1.08,
    Math.PI * 0.5,
    -Math.PI * 0.5
  ];

  let best = desiredAngle;
  let bestScore = -Infinity;

  for (const offset of candidates) {
    const a = wrapAngle(desiredAngle + offset);
    if (!pathClear(body.x, body.y, a, 62, body.radius + 5)) continue;

    const nx = body.x + Math.cos(a) * 72;
    const ny = body.y + Math.sin(a) * 72;
    const after = Math.hypot(target.x - nx, target.y - ny);
    const before = Math.hypot(target.x - body.x, target.y - body.y);
    const progress = before - after;
    const turnPenalty = Math.abs(angleDelta(desiredAngle, a)) * 8;
    const score = progress - turnPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }

  return best;
}

export function updateDuelistAI(brain, actor, weapon, target, dt) {
  brain.decisionTimer = Math.max(0, brain.decisionTimer - dt);
  brain.attackCooldown = Math.max(0, brain.attackCooldown - dt);

  if (!actor.alive || !target.alive) {
    return { moveX: 0, moveY: 0 };
  }

  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const n = normalize(dx, dy);
  const distance = n.length;
  brain.lastDistance = distance;

  setDesiredFacing(actor, Math.atan2(dy, dx));

  const reach = weapon.config.idleReach;
  const preferred = weapon.config.id === "spear" ? reach * 0.86 : reach * 0.75;
  const tooClose = preferred * 0.58;
  const tooFar = preferred * 1.16;

  let desiredAngle;
  let speed = 1;

  if (distance > tooFar) {
    desiredAngle = Math.atan2(dy, dx);
    speed = 0.90;
  } else if (distance < tooClose) {
    desiredAngle = Math.atan2(-dy, -dx);
    speed = 0.72;
  } else {
    const base = Math.atan2(dy, dx);
    desiredAngle = base + brain.orbitSign * Math.PI * 0.5;
    speed = 0.50;

    if (brain.decisionTimer <= 0) {
      brain.orbitSign *= -1;
      brain.decisionTimer = 0.55 + ((actor.x + actor.y) % 97) / 240;
    }
  }

  const routed = chooseMoveDirection(actor, target, desiredAngle);

  const facingError = Math.abs(angleDelta(actor.facing, Math.atan2(dy, dx)));
  const clearThreatLine = !lineOfSightBlocked(actor.x, actor.y, target.x, target.y, WORLD.walls);
  const inAttackRange = distance < reach + target.radius + 24;

  if (
    !weapon.action &&
    brain.attackCooldown <= 0 &&
    inAttackRange &&
    facingError < 0.56 &&
    clearThreatLine
  ) {
    const thrustBias = weapon.config.id === "spear" ? 0.70 : clamp((distance - tooClose) / Math.max(1, tooFar - tooClose), 0.15, 0.65);
    const deterministicRoll = ((Math.floor(actor.x * 7 + actor.y * 11 + brain.decisionTimer * 1000) >>> 0) % 100) / 100;
    requestAttack(actor, weapon, deterministicRoll < thrustBias ? "thrust" : "cut");
    brain.attackCooldown = weapon.config.id === "spear" ? 0.62 : 0.48;
  }

  return {
    moveX: Math.cos(routed) * speed,
    moveY: Math.sin(routed) * speed
  };
}
