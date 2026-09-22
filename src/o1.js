import { clamp, normalize, wrapAngle } from "./math.js";
import { createActor, driveActor, faceToward } from "./actors.js";
import { PRESSURE_SPEC } from "./yard.js";
import { PRESSURE_TIMING } from "./pressure.js";
import { resolveActorPair } from "./world.js";

export const O1_PLAYER_SPEC = Object.freeze({
  radius: 18,
  mass: 92,
  maxSpeed: 224,
  acceleration: 2450,
  braking: 3150,
  turnRate: 13
});

export const O1_PRESSURE_SPEC = Object.freeze({
  ...PRESSURE_SPEC,
  hp: 55
});

export const O1_SHIELD = Object.freeze({
  forward: 24,
  halfWidth: 24,
  thickness: 5,
  bracedSupportScale: 0.34
});

export const O1_ATTACK = Object.freeze({
  windup: 0.07,
  active: 0.09,
  recover: 0.20,
  reach: 47,
  halfAngle: 0.62,
  damage: 60
});

export const O1_ATTACK_PROBES = Object.freeze({
  current: O1_ATTACK,
  compactClose: Object.freeze({ ...O1_ATTACK, reach: 30 }),
  deliberate: Object.freeze({ ...O1_ATTACK, windup: 0.20 }),
  twoHit: Object.freeze({ ...O1_ATTACK, damage: 30 }),
  compactDeliberate: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    windup: 0.20
  }),
  compactTwoHit: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    damage: 30
  }),
  deliberateTwoHit: Object.freeze({
    ...O1_ATTACK,
    windup: 0.20,
    damage: 30
  }),
  compactDeliberateTwoHit: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    windup: 0.20,
    damage: 30
  }),
  slowerThanThreatTell: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    windup: 0.30,
    damage: 30
  }),
  singleContactLethal: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    windup: 0.20,
    maxTargetsPerAction: 1
  }),
  singleContactTwoHit: Object.freeze({
    ...O1_ATTACK,
    reach: 30,
    windup: 0.20,
    damage: 30,
    maxTargetsPerAction: 1
  })
});

export const O1_DAMAGE = Object.freeze({
  playerHp: 100,
  pressureHit: 34
});

function segmentClosestPoint(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const denom = abx * abx + aby * aby;
  const t = denom <= 1e-9
    ? 0
    : clamp(((px - ax) * abx + (py - ay) * aby) / denom, 0, 1);
  return { x: ax + abx * t, y: ay + aby * t, t };
}

export function createO1Player({
  x = 450,
  y = 535,
  facing = -Math.PI / 2,
  attackSpec = O1_ATTACK
} = {}) {
  const actor = createActor(O1_PLAYER_SPEC, {
    id: "player",
    kind: "player",
    x,
    y,
    facing
  });
  actor.hp = O1_DAMAGE.playerHp;
  actor.maxHp = O1_DAMAGE.playerHp;
  actor.braced = false;
  actor.attackSpec = attackSpec;
  actor.attack = {
    phase: "idle",
    time: 0,
    serial: 0,
    hitIds: new Set()
  };
  return actor;
}

export function createO1Threat(id, {
  x,
  y,
  facing = Math.PI / 2
}) {
  const actor = createActor(O1_PRESSURE_SPEC, {
    id,
    kind: "pressure",
    x,
    y,
    facing
  });
  actor.hp = O1_PRESSURE_SPEC.hp;
  actor.maxHp = O1_PRESSURE_SPEC.hp;
  actor.attackResolved = false;
  return actor;
}

export function driveO1Player(player, inputX, inputY, dt, movementBraced = player.braced) {
  return driveActor(player, inputX, inputY, dt, movementBraced
    ? { accelerationScale: 0.78, speedScale: 0.66, brakingScale: 1.08 }
    : undefined);
}

export function faceO1Player(player, x, y, dt, movementBraced = player.braced) {
  return faceToward(player, x, y, dt, movementBraced
    ? { turnScale: 0.56 }
    : undefined);
}

export function shieldSegment(player) {
  const fx = Math.cos(player.facing);
  const fy = Math.sin(player.facing);
  const sx = -fy;
  const sy = fx;
  const cx = player.x + fx * O1_SHIELD.forward;
  const cy = player.y + fy * O1_SHIELD.forward;

  return {
    ax: cx - sx * O1_SHIELD.halfWidth,
    ay: cy - sy * O1_SHIELD.halfWidth,
    bx: cx + sx * O1_SHIELD.halfWidth,
    by: cy + sy * O1_SHIELD.halfWidth,
    fx,
    fy
  };
}

export function probeShieldContact(player, other) {
  const segment = shieldSegment(player);
  const closest = segmentClosestPoint(
    other.x, other.y,
    segment.ax, segment.ay,
    segment.bx, segment.by
  );

  const dx = other.x - closest.x;
  const dy = other.y - closest.y;
  const distance = Math.hypot(dx, dy);
  const required = other.spec.radius + O1_SHIELD.thickness;

  if (distance >= required) return null;

  const frontDx = other.x - player.x;
  const frontDy = other.y - player.y;
  const front = frontDx * segment.fx + frontDy * segment.fy;
  if (front <= 0) return null;

  let nx;
  let ny;
  if (distance > 1e-9) {
    nx = dx / distance;
    ny = dy / distance;
  } else {
    nx = segment.fx;
    ny = segment.fy;
  }

  return {
    ...closest,
    nx,
    ny,
    depth: required - Math.max(distance, 1e-9),
    x: closest.x,
    y: closest.y
  };
}

export function resolveShieldContact(player, other) {
  const hit = probeShieldContact(player, other);
  if (!hit) return null;

  const baseInvPlayer = 1 / Math.max(1, player.spec.mass);
  const invPlayer = baseInvPlayer * (player.braced ? O1_SHIELD.bracedSupportScale : 1);
  const invOther = 1 / Math.max(1, other.spec.mass);
  const invTotal = invPlayer + invOther;

  const movePlayer = hit.depth * invPlayer / invTotal;
  const moveOther = hit.depth * invOther / invTotal;

  player.x -= hit.nx * movePlayer;
  player.y -= hit.ny * movePlayer;
  other.x += hit.nx * moveOther;
  other.y += hit.ny * moveOther;

  const relative = (other.vx - player.vx) * hit.nx + (other.vy - player.vy) * hit.ny;
  let impulse = 0;
  if (relative < 0) {
    impulse = -relative / invTotal;
    player.vx -= hit.nx * impulse * invPlayer;
    player.vy -= hit.ny * impulse * invPlayer;
    other.vx += hit.nx * impulse * invOther;
    other.vy += hit.ny * impulse * invOther;
  }

  return {
    type: "shield-contact",
    x: hit.x,
    y: hit.y,
    movePlayer,
    moveOther,
    impulse,
    braced: player.braced
  };
}

export function settlePressureAfterContact(threat, velocityScale = 0.32) {
  threat.state = "recover";
  threat.stateTime = PRESSURE_TIMING.recover;
  threat.vx *= velocityScale;
  threat.vy *= velocityScale;
  threat.attackResolved = true;
}

export function resolvePressurePhysical(player, threat) {
  if (threat.hp <= 0) return null;

  const shield = resolveShieldContact(player, threat);
  if (shield) {
    if (threat.state === "lunge" && !threat.attackResolved) {
      // The shield consumes this lunge's body-hit authority, but does not
      // magically cancel the attack state. Momentum/contact can continue
      // until the pressure body's normal lunge timer reaches recovery.
      threat.attackResolved = true;
      return { ...shield, type: "shield-block", attacker: threat.id };
    }
    return shield;
  }

  const body = resolveActorPair(player, threat);
  if (!body) return null;

  if (threat.state === "lunge" && !threat.attackResolved) {
    settlePressureAfterContact(threat, 0.40);
    return {
      type: "body-hit-candidate",
      attacker: threat.id,
      damage: O1_DAMAGE.pressureHit,
      x: (player.x + threat.x) * 0.5,
      y: (player.y + threat.y) * 0.5,
      ...body
    };
  }

  return { type: "body-contact", ...body };
}

export function applyPressureHit(player, candidate) {
  if (!candidate || candidate.type !== "body-hit-candidate") return null;
  player.hp = Math.max(0, player.hp - candidate.damage);
  return {
    ...candidate,
    type: "body-hit",
    hp: player.hp
  };
}

export function resolvePressureAgainstO1(player, threat) {
  const event = resolvePressurePhysical(player, threat);
  return event?.type === "body-hit-candidate"
    ? applyPressureHit(player, event)
    : event;
}

export function requestO1Attack(player) {
  const attack = player.attack;
  if (!attack || attack.phase !== "idle") return false;
  attack.phase = "windup";
  attack.time = player.attackSpec.windup;
  attack.serial++;
  attack.hitIds.clear();
  return true;
}

export function stepO1Attack(player, dt) {
  const attack = player.attack;
  if (!attack || attack.phase === "idle") return;

  attack.time -= dt;
  if (attack.time > 0) return;

  if (attack.phase === "windup") {
    attack.phase = "active";
    attack.time += player.attackSpec.active;
  } else if (attack.phase === "active") {
    attack.phase = "recover";
    attack.time += player.attackSpec.recover;
  } else {
    attack.phase = "idle";
    attack.time = 0;
    attack.hitIds.clear();
  }
}

export function attackProgress(player) {
  const attack = player.attack;
  if (!attack || attack.phase === "idle") return null;
  if (attack.phase === "windup") return 0;
  if (attack.phase === "active") return 1;
  return 0.45;
}

export function probeO1Strike(player, threat) {
  if (!player.attack || player.attack.phase !== "active") return null;
  if (threat.hp <= 0 || player.attack.hitIds.has(threat.id)) return null;

  const targetBudget = player.attackSpec.maxTargetsPerAction ?? Infinity;
  if (player.attack.hitIds.size >= targetBudget) return null;

  const dx = threat.x - player.x;
  const dy = threat.y - player.y;
  const distance = Math.hypot(dx, dy);
  const maxDistance = player.spec.radius + player.attackSpec.reach + threat.spec.radius;
  if (distance > maxDistance) return null;

  const angle = Math.atan2(dy, dx);
  const diff = Math.abs(wrapAngle(angle - player.facing));
  if (diff > player.attackSpec.halfAngle) return null;

  return {
    type: "player-strike",
    target: threat.id,
    x: player.x + Math.cos(player.facing) * Math.min(distance, player.spec.radius + player.attackSpec.reach),
    y: player.y + Math.sin(player.facing) * Math.min(distance, player.spec.radius + player.attackSpec.reach)
  };
}

export function applyO1Strike(player, threat, hit) {
  if (!hit || hit.type !== "player-strike") return null;

  player.attack.hitIds.add(threat.id);
  threat.hp = Math.max(0, threat.hp - player.attackSpec.damage);
  if (threat.hp <= 0) {
    threat.vx = 0;
    threat.vy = 0;
    threat.state = "down";
  }

  return {
    ...hit,
    damage: player.attackSpec.damage,
    hp: threat.hp,
    killed: threat.hp <= 0
  };
}

export function resolveO1Strike(player, threat) {
  return applyO1Strike(player, threat, probeO1Strike(player, threat));
}

export function resetThreatAttackAuthority(threat) {
  if (threat.state !== "lunge") threat.attackResolved = false;
}

export function forwardContactScore(actor, other) {
  const d = normalize(other.x - actor.x, other.y - actor.y, 1, 0);
  return d.x * Math.cos(actor.facing) + d.y * Math.sin(actor.facing);
}
