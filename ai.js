import {
  angleDelta,
  clamp,
  lineOfSightBlocked,
  normalize,
  wrapAngle
} from "./core.js";
import { WORLD, setDesiredFacing } from "./world.js";
import { requestAttack } from "./combat.js";

const GATE = Object.freeze({ x: 812, y: 535 });

export function createDuelistBrain(seed = 1) {
  return {
    orbitSign: seed % 2 ? 1 : -1,
    decisionTimer: 0,
    attackCooldown: 0.78,
    recoveryTimer: 0,
    readiness: 0,
    wasAttacking: false,
    mode: "approach",
    lastDistance: Infinity,
    routedViaGate: false
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

function chooseMoveDirection(body, targetX, targetY, desiredAngle) {
  const candidates = [
    0,
    0.28,
    -0.28,
    0.58,
    -0.58,
    0.92,
    -0.92,
    Math.PI * 0.5,
    -Math.PI * 0.5
  ];

  let best = desiredAngle;
  let bestScore = -Infinity;
  const before = Math.hypot(targetX - body.x, targetY - body.y);

  for (const offset of candidates) {
    const a = wrapAngle(desiredAngle + offset);
    if (!pathClear(body.x, body.y, a, 68, body.radius + 6)) continue;

    const nx = body.x + Math.cos(a) * 76;
    const ny = body.y + Math.sin(a) * 76;
    const after = Math.hypot(targetX - nx, targetY - ny);
    const progress = before - after;
    const turnPenalty = Math.abs(angleDelta(desiredAngle, a)) * 6;
    const score = progress - turnPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }

  return best;
}

function navigationGoal(body, target) {
  const directBlocked = lineOfSightBlocked(
    body.x,
    body.y,
    target.x,
    target.y,
    WORLD.walls
  );

  const oppositeSides =
    (body.x < 770 && target.x > 850) ||
    (body.x > 850 && target.x < 770);

  if (directBlocked && oppositeSides) {
    return { x: GATE.x, y: GATE.y, viaGate: true };
  }

  return { x: target.x, y: target.y, viaGate: false };
}

export function updateDuelistAI(brain, actor, weapon, target, dt) {
  brain.decisionTimer = Math.max(0, brain.decisionTimer - dt);
  brain.attackCooldown = Math.max(0, brain.attackCooldown - dt);
  brain.recoveryTimer = Math.max(0, brain.recoveryTimer - dt);

  if (brain.wasAttacking && !weapon.action) {
    const cadenceJitter = ((Math.floor(actor.x + actor.y) >>> 0) % 17) / 100;
    brain.recoveryTimer = Math.max(brain.recoveryTimer, 0.42 + cadenceJitter);
    brain.attackCooldown = Math.max(brain.attackCooldown, 0.72 + cadenceJitter);
    brain.readiness = 0;
  }
  brain.wasAttacking = Boolean(weapon.action);

  if (!actor.alive || !target.alive) {
    return { moveX: 0, moveY: 0 };
  }

  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const toTarget = normalize(dx, dy);
  const distance = toTarget.length;
  brain.lastDistance = distance;

  const targetAngle = Math.atan2(dy, dx);
  setDesiredFacing(actor, targetAngle);

  const nav = navigationGoal(actor, target);
  brain.routedViaGate = nav.viaGate;

  const navDx = nav.x - actor.x;
  const navDy = nav.y - actor.y;
  const navDistance = Math.hypot(navDx, navDy);
  const navAngle = Math.atan2(navDy, navDx);

  const reach = weapon.config.idleReach;
  const preferred = reach * 0.78;
  const tooClose = preferred * 0.62;
  const tooFar = preferred * 1.20;

  let desiredAngle = navAngle;
  let speed = 0.86;
  let mode = nav.viaGate ? "route" : "approach";

  if (brain.recoveryTimer > 0 && !nav.viaGate) {
    // A committed exchange creates a real breathing/reposition phase.
    // The duelist remains dangerous, but does not glue itself to the player.
    if (distance < preferred * 1.28) {
      desiredAngle = targetAngle + Math.PI + brain.orbitSign * 0.28;
      speed = 0.54;
      mode = "disengage";
    } else {
      desiredAngle = targetAngle + brain.orbitSign * Math.PI * 0.5;
      speed = 0.30;
      mode = "reset";
    }
  } else if (!nav.viaGate && distance <= tooFar) {
    if (distance < tooClose) {
      desiredAngle = Math.atan2(-dy, -dx);
      speed = 0.66;
      mode = "make-space";
    } else {
      desiredAngle = targetAngle + brain.orbitSign * Math.PI * 0.5;
      speed = 0.34;
      mode = "measure";

      if (brain.decisionTimer <= 0) {
        brain.orbitSign *= -1;
        brain.decisionTimer = 0.72 + ((actor.x + actor.y) % 97) / 220;
      }
    }
  } else if (nav.viaGate && navDistance < 74) {
    // Once inside the gate opening, bias through it instead of orbiting on the threshold.
    desiredAngle = navAngle;
    speed = 0.78;
    mode = "route";
  }

  const routed = chooseMoveDirection(actor, nav.x, nav.y, desiredAngle);

  const facingError = Math.abs(angleDelta(actor.facing, targetAngle));
  const clearThreatLine = !lineOfSightBlocked(
    actor.x,
    actor.y,
    target.x,
    target.y,
    WORLD.walls
  );
  const inAttackRange = distance < reach + target.radius + 20;

  const canSetUpAttack =
    brain.recoveryTimer <= 0 &&
    !weapon.action &&
    brain.attackCooldown <= 0 &&
    inAttackRange &&
    facingError < 0.48 &&
    clearThreatLine;

  if (canSetUpAttack) {
    brain.readiness += dt;
    mode = "set";
    // Telegraph intent through ordinary footwork: settle before committing.
    speed = Math.min(speed, 0.16);
  } else {
    brain.readiness = Math.max(0, brain.readiness - dt * 2.4);
  }

  let attackStarted = false;
  if (canSetUpAttack && brain.readiness >= 0.22) {
    const thrustBias = clamp(
      (distance - tooClose) / Math.max(1, tooFar - tooClose),
      0.20,
      0.62
    );

    const deterministicRoll =
      ((Math.floor(actor.x * 7 + actor.y * 11 + brain.decisionTimer * 1000) >>> 0) % 100) / 100;

    attackStarted = requestAttack(
      actor,
      weapon,
      deterministicRoll < thrustBias ? "thrust" : "cut"
    );

    if (attackStarted) {
      brain.wasAttacking = true;
      brain.attackCooldown = 0.84;
      brain.readiness = 0;
      mode = "commit";
    }
  }

  brain.mode = mode;

  return {
    moveX: Math.cos(routed) * speed,
    moveY: Math.sin(routed) * speed,
    attackStarted,
    mode
  };
}
