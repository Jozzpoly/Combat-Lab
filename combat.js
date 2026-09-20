import {
  angleDelta,
  clamp,
  lerp,
  segmentIntersectsRect,
  segmentsIntersection,
  sweptSegmentCircleHit,
  wrapAngle
} from "./core.js";
import { WORLD, pushBody } from "./world.js";

export const WEAPONS = Object.freeze({
  sword: Object.freeze({
    id: "sword",
    label: "Arming Sword",
    length: 82,
    idleReach: 70,
    minReach: 55,
    maxReach: 86,
    inner: 14,
    thickness: 6,
    inertia: 1.0,
    angleK: 105,
    angleD: 15,
    maxAngularAccel: 58,
    reachK: 120,
    reachD: 18,
    maxRadialAccel: 1800,
    guardOffset: 0.58,
    cutStart: 1.02,
    cutEnd: -1.08,
    cutWindup: 0.09,
    cutActive: 0.24,
    cutRecovery: 0.18,
    thrustWindup: 0.10,
    thrustActive: 0.18,
    thrustRecovery: 0.20,
    thrustExtension: 16,
    hitSpeed: 145,
    damageScale: 0.045,
    cutDamage: 1.00,
    thrustDamage: 0.92,
    knockScale: 0.032,
    cutKnock: 1.00,
    thrustKnock: 0.82
  }),
  spear: Object.freeze({
    id: "spear",
    label: "Short Spear",
    length: 126,
    idleReach: 108,
    minReach: 88,
    maxReach: 132,
    inner: 18,
    thickness: 5,
    inertia: 1.85,
    angleK: 78,
    angleD: 17,
    maxAngularAccel: 38,
    reachK: 92,
    reachD: 18,
    maxRadialAccel: 1450,
    guardOffset: 0.20,
    cutStart: 0.68,
    cutEnd: -0.70,
    cutWindup: 0.14,
    cutActive: 0.32,
    cutRecovery: 0.26,
    thrustWindup: 0.11,
    thrustActive: 0.22,
    thrustRecovery: 0.24,
    thrustExtension: 24,
    hitSpeed: 125,
    damageScale: 0.043,
    cutDamage: 0.58,
    thrustDamage: 1.18,
    knockScale: 0.035,
    cutKnock: 0.78,
    thrustKnock: 1.18
  })
});

export function weaponSegment(owner, weapon) {
  const pivotX = owner.x + Math.cos(owner.facing) * 8;
  const pivotY = owner.y + Math.sin(owner.facing) * 8;
  const reach = clamp(weapon.reach, weapon.config.minReach, weapon.config.maxReach);

  return {
    ax: pivotX + Math.cos(weapon.angle) * weapon.config.inner,
    ay: pivotY + Math.sin(weapon.angle) * weapon.config.inner,
    bx: pivotX + Math.cos(weapon.angle) * reach,
    by: pivotY + Math.sin(weapon.angle) * reach,
    pivotX,
    pivotY
  };
}

export function pointVelocity(owner, weapon, x, y) {
  const rx = x - owner.x;
  const ry = y - owner.y;
  const tangentX = -ry;
  const tangentY = rx;
  const radialX = Math.cos(weapon.angle);
  const radialY = Math.sin(weapon.angle);

  return {
    x: owner.vx + tangentX * weapon.angularVelocity + radialX * weapon.radialVelocity,
    y: owner.vy + tangentY * weapon.angularVelocity + radialY * weapon.radialVelocity
  };
}

export function createWeaponState(owner, weaponId = "sword") {
  const config = WEAPONS[weaponId];
  const angle = wrapAngle(owner.facing + config.guardOffset);
  const state = {
    config,
    angle,
    angularVelocity: 0,
    reach: config.idleReach,
    radialVelocity: 0,
    guardSide: 1,
    action: null,
    hitRegistered: false,
    wallCooldown: 0,
    wallContact: false,
    lastSegment: null,
    desiredAngle: angle,
    desiredReach: config.idleReach
  };
  state.lastSegment = weaponSegment(owner, state);
  return state;
}

export function createWeaponContactState() {
  return {
    engaged: false,
    separatedFor: 1,
    impacts: 0,
    contactTime: 0,
    lastRelativeSpeed: 0
  };
}

export function equipWeapon(owner, weapon, weaponId) {
  Object.assign(weapon, createWeaponState(owner, weaponId));
}

export function requestAttack(owner, weapon, type) {
  if (!owner.alive || weapon.action) return false;
  if (type !== "cut" && type !== "thrust") return false;

  const c = weapon.config;
  weapon.hitRegistered = false;

  if (type === "cut") {
    weapon.action = {
      type,
      t: 0,
      side: weapon.guardSide,
      total: c.cutWindup + c.cutActive + c.cutRecovery
    };
  } else {
    weapon.action = {
      type,
      t: 0,
      side: weapon.guardSide,
      total: c.thrustWindup + c.thrustActive + c.thrustRecovery
    };
  }

  return true;
}

function actionTargets(owner, weapon) {
  const c = weapon.config;
  const a = weapon.action;

  if (!a) {
    return {
      angle: wrapAngle(owner.facing + weapon.guardSide * c.guardOffset),
      reach: c.idleReach,
      active: false,
      phase: "guard"
    };
  }

  if (a.type === "cut") {
    const w0 = c.cutWindup;
    const w1 = w0 + c.cutActive;
    let rel;
    let phase;
    let active = false;

    if (a.t < w0) {
      const p = clamp(a.t / w0, 0, 1);
      rel = lerp(weapon.guardSide * c.guardOffset, a.side * c.cutStart, p);
      phase = "prepare";
    } else if (a.t < w1) {
      const p = clamp((a.t - w0) / c.cutActive, 0, 1);
      rel = lerp(a.side * c.cutStart, a.side * c.cutEnd, p);
      phase = "strike";
      active = true;
    } else {
      const p = clamp((a.t - w1) / c.cutRecovery, 0, 1);
      rel = lerp(a.side * c.cutEnd, -a.side * c.guardOffset, p);
      phase = "recover";
    }

    return {
      angle: wrapAngle(owner.facing + rel),
      reach: c.idleReach + (active ? 5 : 0),
      active,
      phase,
      done: a.t >= a.total
    };
  }

  const w0 = c.thrustWindup;
  const w1 = w0 + c.thrustActive;
  let extension = 0;
  let phase;
  let active = false;

  if (a.t < w0) {
    const p = clamp(a.t / w0, 0, 1);
    extension = lerp(0, -8, p);
    phase = "prepare";
  } else if (a.t < w1) {
    const p = clamp((a.t - w0) / c.thrustActive, 0, 1);
    extension = lerp(-8, c.thrustExtension, Math.sin(p * Math.PI * 0.5));
    phase = "strike";
    active = true;
  } else {
    const p = clamp((a.t - w1) / c.thrustRecovery, 0, 1);
    extension = lerp(c.thrustExtension, 0, p);
    phase = "recover";
  }

  return {
    angle: owner.facing,
    reach: c.idleReach + extension,
    active,
    phase,
    done: a.t >= a.total
  };
}

function integrateWeapon(weapon, desiredAngle, desiredReach, dt) {
  const c = weapon.config;
  const angleError = angleDelta(weapon.angle, desiredAngle);

  const angularAccel = clamp(
    angleError * c.angleK - weapon.angularVelocity * c.angleD,
    -c.maxAngularAccel,
    c.maxAngularAccel
  ) / c.inertia;

  weapon.angularVelocity += angularAccel * dt;
  weapon.angle = wrapAngle(weapon.angle + weapon.angularVelocity * dt);

  const radialAccel = clamp(
    (desiredReach - weapon.reach) * c.reachK - weapon.radialVelocity * c.reachD,
    -c.maxRadialAccel,
    c.maxRadialAccel
  ) / Math.max(0.8, c.inertia);

  weapon.radialVelocity += radialAccel * dt;
  weapon.reach = clamp(
    weapon.reach + weapon.radialVelocity * dt,
    c.minReach,
    c.maxReach
  );
}

export function updateWeapon(owner, weapon, dt, emit) {
  weapon.wallCooldown = Math.max(0, weapon.wallCooldown - dt);
  weapon.wallContact = false;

  if (weapon.action) weapon.action.t += dt;

  const target = actionTargets(owner, weapon);
  weapon.desiredAngle = target.angle;
  weapon.desiredReach = target.reach;

  const prevAngle = weapon.angle;
  const prevReach = weapon.reach;
  const prevAngularVelocity = weapon.angularVelocity;
  const prevRadialVelocity = weapon.radialVelocity;
  const prevSeg = weapon.lastSegment || weaponSegment(owner, weapon);

  integrateWeapon(weapon, target.angle, target.reach, dt);
  let seg = weaponSegment(owner, weapon);

  const blockingWall = WORLD.walls.find(wall => segmentIntersectsRect(seg, wall));
  if (blockingWall) {
    weapon.angle = prevAngle;
    weapon.reach = prevReach;
    weapon.angularVelocity = -prevAngularVelocity * 0.22;
    weapon.radialVelocity = -prevRadialVelocity * 0.14;
    seg = weaponSegment(owner, weapon);
    weapon.wallContact = true;

    if (weapon.wallCooldown <= 0) {
      emit?.({ type: "weapon-wall", actor: owner.id, weapon: weapon.config.id, wall: blockingWall.id });
      weapon.wallCooldown = 0.14;
    }
  }

  weapon.lastSegment = seg;

  if (target.done && weapon.action) {
    if (weapon.action.type === "cut") weapon.guardSide *= -1;
    weapon.action = null;
    weapon.hitRegistered = false;
  }

  return {
    segment: seg,
    previousSegment: prevSeg,
    active: target.active,
    phase: target.phase
  };
}

export function resolveWeaponContact(
  aOwner,
  aWeapon,
  bOwner,
  bWeapon,
  contactState,
  dt,
  emit
) {
  if (!aOwner.alive || !bOwner.alive) {
    contactState.engaged = false;
    contactState.separatedFor = 1;
    return null;
  }

  const aSeg = weaponSegment(aOwner, aWeapon);
  const bSeg = weaponSegment(bOwner, bWeapon);
  const hit = segmentsIntersection(aSeg, bSeg);

  if (!hit) {
    contactState.contactTime = 0;
    contactState.separatedFor += dt;
    if (contactState.separatedFor >= 0.055) contactState.engaged = false;
    return null;
  }

  const av = pointVelocity(aOwner, aWeapon, hit.x, hit.y);
  const bv = pointVelocity(bOwner, bWeapon, hit.x, hit.y);
  const rvx = av.x - bv.x;
  const rvy = av.y - bv.y;
  const relSpeed = Math.hypot(rvx, rvy);

  contactState.separatedFor = 0;
  contactState.contactTime += dt;
  contactState.lastRelativeSpeed = relSpeed;

  const newImpact = !contactState.engaged && relSpeed >= 72;
  contactState.engaged = true;

  if (newImpact) {
    const aSign = Math.sign(aWeapon.angularVelocity || 1);
    const bSign = Math.sign(bWeapon.angularVelocity || -1);
    const impulse = clamp(relSpeed / 440, 0.15, 0.80);

    aWeapon.angularVelocity = -aSign * Math.max(
      0.75,
      Math.abs(aWeapon.angularVelocity) * (0.17 + impulse * 0.28)
    );
    bWeapon.angularVelocity = -bSign * Math.max(
      0.75,
      Math.abs(bWeapon.angularVelocity) * (0.17 + impulse * 0.28)
    );
    aWeapon.radialVelocity *= -0.15;
    bWeapon.radialVelocity *= -0.15;

    const nx = bOwner.x - aOwner.x;
    const ny = bOwner.y - aOwner.y;
    const n = Math.hypot(nx, ny) || 1;
    const bodyPush = relSpeed * 0.014;
    pushBody(aOwner, -nx / n * bodyPush, -ny / n * bodyPush);
    pushBody(bOwner, nx / n * bodyPush, ny / n * bodyPush);

    contactState.impacts++;

    const event = {
      type: "blade-clash",
      x: hit.x,
      y: hit.y,
      relativeSpeed: relSpeed,
      a: aOwner.id,
      b: bOwner.id,
      episode: contactState.impacts
    };
    emit?.(event);
    return {
      contact: true,
      impact: event,
      relativeSpeed: relSpeed
    };
  }

  // Persistent contact is still causal, but not a repeated "parry event".
  // Mild damping prevents interpenetrating blades from pumping energy forever.
  const damping = Math.pow(0.22, dt);
  aWeapon.angularVelocity *= damping;
  bWeapon.angularVelocity *= damping;
  aWeapon.radialVelocity *= Math.pow(0.32, dt);
  bWeapon.radialVelocity *= Math.pow(0.32, dt);

  return {
    contact: true,
    impact: null,
    relativeSpeed: relSpeed
  };
}

// Backward-compatible alias for bounded mechanism tests.
export function resolveWeaponClash(aOwner, aWeapon, bOwner, bWeapon, emit) {
  const state = createWeaponContactState();
  return resolveWeaponContact(aOwner, aWeapon, bOwner, bWeapon, state, 1 / 120, emit)?.impact || null;
}

export function resolveWeaponHit(attacker, weapon, target, frame, emit) {
  if (!attacker.alive || !target.alive || !weapon.action || weapon.hitRegistered) return null;
  if (!frame.active) return null;

  const hit = sweptSegmentCircleHit(
    frame.previousSegment,
    frame.segment,
    { x: target.x, y: target.y, r: target.radius + weapon.config.thickness },
    8
  );
  if (!hit) return null;

  const tipVelocity = pointVelocity(attacker, weapon, frame.segment.bx, frame.segment.by);
  const relativeVx = tipVelocity.x - target.vx;
  const relativeVy = tipVelocity.y - target.vy;
  const speed = Math.hypot(relativeVx, relativeVy);

  if (speed < weapon.config.hitSpeed) return null;

  weapon.hitRegistered = true;

  const actionType = weapon.action.type;
  const actionDamage = actionType === "thrust"
    ? weapon.config.thrustDamage
    : weapon.config.cutDamage;
  const actionKnock = actionType === "thrust"
    ? weapon.config.thrustKnock
    : weapon.config.cutKnock;

  const normalized = clamp((speed - weapon.config.hitSpeed) / 520, 0, 1);
  const rawDamage = 6 + speed * weapon.config.damageScale + normalized * 7;
  const damage = Math.max(4, Math.round(rawDamage * actionDamage));

  target.hp = Math.max(0, target.hp - damage);
  target.hitFlash = 0.14;

  const impactN = Math.hypot(relativeVx, relativeVy) || 1;
  const knock = clamp(speed * weapon.config.knockScale * actionKnock, 6, 28);
  pushBody(
    target,
    relativeVx / impactN * knock * target.mass,
    relativeVy / impactN * knock * target.mass
  );

  weapon.angularVelocity *= 0.58;
  weapon.radialVelocity *= 0.66;

  if (target.hp <= 0) target.alive = false;

  const event = {
    type: "body-hit",
    attacker: attacker.id,
    target: target.id,
    weapon: weapon.config.id,
    action: actionType,
    damage,
    speed,
    x: frame.segment.bx,
    y: frame.segment.by
  };
  emit?.(event);
  return event;
}
