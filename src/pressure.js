import { normalize } from "./math.js";
import { driveActor, faceToward } from "./actors.js";
import { pointClear, stepActorWorld } from "./world.js";

const OFFSETS = Object.freeze([0, 0.34, -0.34, 0.70, -0.70, 1.08, -1.08, 1.57, -1.57]);

export const PRESSURE_TIMING = Object.freeze({
  triggerDistance: 68,
  windup: 0.24,
  lunge: 0.16,
  recover: 0.52,
  lungeSpeed: 290
});

function steerAngle(actor, base, world) {
  for (const offset of OFFSETS) {
    const angle = base + offset;
    const x = actor.x + Math.cos(angle) * 30;
    const y = actor.y + Math.sin(angle) * 30;
    if (pointClear(world, x, y, actor.spec.radius)) {
      return { x: Math.cos(angle), y: Math.sin(angle) };
    }
  }
  return { x: Math.cos(base), y: Math.sin(base) };
}

function steerToward(actor, target, world) {
  return steerAngle(actor, Math.atan2(target.y - actor.y, target.x - actor.x), world);
}

function steerAway(actor, target, world) {
  return steerAngle(actor, Math.atan2(actor.y - target.y, actor.x - target.x), world);
}

function applyPeerSeparation(actor, desired, peers) {
  let sx = 0;
  let sy = 0;
  let weight = 0;

  for (const peer of peers) {
    if (!peer || peer === actor) continue;
    const dx = actor.x - peer.x;
    const dy = actor.y - peer.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 1e-6 || distance >= 62) continue;

    const strength = (62 - distance) / 62;
    sx += dx / distance * strength;
    sy += dy / distance * strength;
    weight += strength;
  }

  if (weight <= 0) return desired;

  const combined = normalize(
    desired.x + sx * 0.95,
    desired.y + sy * 0.95,
    desired.x,
    desired.y
  );
  return { x: combined.x, y: combined.y };
}

function enter(actor, state, time) {
  actor.state = state;
  actor.stateTime = time;
}

export function updatePressure(actor, player, world, dt, peers = []) {
  const events = [];
  faceToward(actor, player.x, player.y, dt);
  const distance = Math.hypot(player.x - actor.x, player.y - actor.y);

  if (actor.state === "approach") {
    const steer = applyPeerSeparation(actor, steerToward(actor, player, world), peers);
    driveActor(actor, steer.x, steer.y, dt);
    if (distance <= PRESSURE_TIMING.triggerDistance) {
      enter(actor, "windup", PRESSURE_TIMING.windup);
      actor.vx *= 0.35;
      actor.vy *= 0.35;
      events.push({ type: "pressure-windup", actor: actor.id });
    }
  } else if (actor.state === "windup") {
    driveActor(actor, 0, 0, dt);
    actor.stateTime -= dt;
    if (actor.stateTime <= 0) {
      const d = normalize(player.x - actor.x, player.y - actor.y, Math.cos(actor.facing), Math.sin(actor.facing));
      actor.attackX = d.x;
      actor.attackY = d.y;
      enter(actor, "lunge", PRESSURE_TIMING.lunge);
      actor.vx = actor.attackX * PRESSURE_TIMING.lungeSpeed;
      actor.vy = actor.attackY * PRESSURE_TIMING.lungeSpeed;
      events.push({ type: "pressure-lunge", actor: actor.id });
    }
  } else if (actor.state === "lunge") {
    actor.stateTime -= dt;
    if (actor.stateTime <= 0) {
      enter(actor, "recover", PRESSURE_TIMING.recover);
      actor.vx *= 0.45;
      actor.vy *= 0.45;
      events.push({ type: "pressure-recover", actor: actor.id });
    }
  } else if (actor.state === "recover") {
    const shouldDisengage = distance < 96 && actor.stateTime > PRESSURE_TIMING.recover * 0.28;
    if (shouldDisengage) {
      const steer = applyPeerSeparation(actor, steerAway(actor, player, world), peers);
      driveActor(actor, steer.x * 0.62, steer.y * 0.62, dt);
    } else {
      driveActor(actor, 0, 0, dt);
    }
    actor.stateTime -= dt;
    if (actor.stateTime <= 0) {
      enter(actor, "approach", 0);
      events.push({ type: "pressure-approach", actor: actor.id });
    }
  }

  stepActorWorld(actor, world, dt);
  return events;
}
