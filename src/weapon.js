import { clamp, lerp, pointSegmentDistance } from "./math.js";
import { shieldIntercept } from "./contact.js";

const ATTACK = Object.freeze({
  duration: 0.42,
  activeStart: 0.18,
  activeEnd: 0.76,
  startAngle: 0.72,
  endAngle: -0.72,
  thickness: 4,
  damage: 34,
  recovery: 0.12
});

export function createWeaponRuntime() {
  return {
    action: null,
    recovery: 0
  };
}

export function requestCompactAttack(runtime) {
  if (runtime.action || runtime.recovery > 0) return false;
  runtime.action = {
    t: 0,
    hitTargets: new Set()
  };
  return true;
}

export function stepCompactAttack(runtime, dt) {
  if (runtime.recovery > 0) {
    runtime.recovery = Math.max(0, runtime.recovery - dt);
  }

  if (!runtime.action) return;

  runtime.action.t += dt;
  if (runtime.action.t >= ATTACK.duration) {
    runtime.action = null;
    runtime.recovery = ATTACK.recovery;
  }
}

export function attackProgress(runtime) {
  if (!runtime.action) return null;
  return clamp(runtime.action.t / ATTACK.duration, 0, 1);
}

export function attackActive(runtime) {
  const p = attackProgress(runtime);
  return p !== null && p >= ATTACK.activeStart && p <= ATTACK.activeEnd;
}

export function compactWeaponSegment(actor, progress = 0.5) {
  const weapon = actor.spec.weapon;
  if (!weapon) return null;

  const p = clamp(progress, 0, 1);
  const relative = lerp(ATTACK.startAngle, ATTACK.endAngle, p);
  const angle = actor.facing + relative;

  const bodyForwardX = Math.cos(actor.facing);
  const bodyForwardY = Math.sin(actor.facing);
  const pivotX = actor.x + bodyForwardX * actor.spec.body.radius * 0.28;
  const pivotY = actor.y + bodyForwardY * actor.spec.body.radius * 0.28;

  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  const inner = Math.max(4, actor.spec.body.radius * 0.42);

  return {
    ax: pivotX + dirX * inner,
    ay: pivotY + dirY * inner,
    bx: pivotX + dirX * weapon.reach,
    by: pivotY + dirY * weapon.reach,
    thickness: ATTACK.thickness
  };
}

export function resolveCompactStrike(attacker, runtime, target) {
  if (!runtime.action || !attackActive(runtime)) return null;
  if (runtime.action.hitTargets.has(target.id)) return null;

  const segment = compactWeaponSegment(attacker, attackProgress(runtime));
  if (!segment) return null;

  const shieldHit = shieldIntercept(target, segment);
  if (shieldHit) {
    runtime.action.hitTargets.add(target.id);
    return {
      type: "shield-block",
      attacker: attacker.id,
      target: target.id,
      x: shieldHit.x,
      y: shieldHit.y
    };
  }

  const bodyContact = pointSegmentDistance(target.x, target.y, segment);
  if (bodyContact.distance > target.spec.body.radius + segment.thickness) {
    return null;
  }

  runtime.action.hitTargets.add(target.id);
  target.hp = Math.max(0, target.hp - ATTACK.damage);

  return {
    type: "body-hit",
    attacker: attacker.id,
    target: target.id,
    damage: ATTACK.damage,
    x: bodyContact.x,
    y: bodyContact.y
  };
}

export const COMPACT_ATTACK = ATTACK;
