import { createTerrariumSimulation } from "./simulation.js";
import { createBody } from "./world.js";
import { createWeaponState, requestAttack, updateWeapon } from "./combat.js";

const DT = 1 / 120;

function summarize(sim, metrics) {
  return {
    weapon: sim.playerWeaponId,
    seconds: Number(metrics.seconds.toFixed(2)),
    generations: sim.generation,
    finite: [
      sim.player.x, sim.player.y, sim.player.vx, sim.player.vy,
      sim.enemy.x, sim.enemy.y, sim.enemy.vx, sim.enemy.vy,
      sim.playerWeapon.angle, sim.playerWeapon.angularVelocity,
      sim.enemyWeapon.angle, sim.enemyWeapon.angularVelocity
    ].every(Number.isFinite),
    playerHits: metrics.playerHits,
    enemyHits: metrics.enemyHits,
    clashes: metrics.clashes,
    wallContacts: metrics.wallContacts,
    attackIntents: metrics.attackIntents,
    enemyAttackIntents: metrics.enemyAttackIntents,
    enemyBreatherFrames: metrics.enemyBreatherFrames,
    roundsEnded: metrics.roundsEnded,
    minDistance: Number(metrics.minDistance.toFixed(1)),
    maxDistance: Number(metrics.maxDistance.toFixed(1)),
    averagePlayerHitDistance: metrics.playerHitDistances.length
      ? Number((metrics.playerHitDistances.reduce((a, b) => a + b, 0) / metrics.playerHitDistances.length).toFixed(1))
      : null,
    minPlayerHitDistance: metrics.playerHitDistances.length
      ? Number(Math.min(...metrics.playerHitDistances).toFixed(1))
      : null,
    maxPlayerHitDistance: metrics.playerHitDistances.length
      ? Number(Math.max(...metrics.playerHitDistances).toFixed(1))
      : null,
    ruinWallContacts: metrics.ruinWallContacts
  };
}

export function runDuelRehearsal({ weapon = "sword", seconds = 18 } = {}) {
  const sim = createTerrariumSimulation({ playerWeaponId: weapon, autoReset: true });
  const metrics = {
    seconds,
    playerHits: 0,
    enemyHits: 0,
    clashes: 0,
    wallContacts: 0,
    attackIntents: 0,
    enemyAttackIntents: 0,
    enemyBreatherFrames: 0,
    roundsEnded: 0,
    playerHitDistances: [],
    ruinWallContacts: 0,
    minDistance: Infinity,
    maxDistance: 0
  };

  let nextAttack = 0.55;
  let strafeSign = 1;

  const steps = Math.floor(seconds / DT);
  for (let i = 0; i < steps; i++) {
    const p = sim.player;
    const e = sim.enemy;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    metrics.minDistance = Math.min(metrics.minDistance, d);
    metrics.maxDistance = Math.max(metrics.maxDistance, d);

    let moveX = 0;
    let moveY = 0;

    if (d > (weapon === "spear" ? 124 : 92)) {
      moveX = dx / d;
      moveY = dy / d;
    } else if (d < (weapon === "spear" ? 76 : 58)) {
      moveX = -dx / d;
      moveY = -dy / d;
    } else {
      moveX = -dy / d * strafeSign * 0.62;
      moveY = dx / d * strafeSign * 0.62;
    }

    if (sim.totalTime >= nextAttack && sim.roundState === "fight") {
      const action = ((Math.floor(nextAttack * 10) + sim.generation) % 3 === 0) ? "thrust" : "cut";
      if (sim.attack(action)) metrics.attackIntents++;
      nextAttack += weapon === "spear" ? 0.78 : 0.64;
      if (Math.floor(nextAttack * 10) % 4 === 0) strafeSign *= -1;
    }

    sim.step({ moveX, moveY, aimX: e.x, aimY: e.y }, DT);

    if (sim.enemyBrain.mode === "disengage" || sim.enemyBrain.mode === "reset") {
      metrics.enemyBreatherFrames++;
    }

    for (const event of sim.drainEvents()) {
      if (event.type === "attack-intent" && event.actor === "duelist") {
        metrics.enemyAttackIntents++;
      } else if (event.type === "body-hit") {
        if (event.attacker === "player") {
          metrics.playerHits++;
          if (Number.isFinite(event.distance)) metrics.playerHitDistances.push(event.distance);
        } else metrics.enemyHits++;
      } else if (event.type === "blade-clash") {
        metrics.clashes++;
      } else if (event.type === "weapon-wall" && event.actor === "player") {
        metrics.wallContacts++;
        if (event.wall === "ruin-upper" || event.wall === "ruin-lower") metrics.ruinWallContacts++;
      } else if (event.type === "round-end") {
        metrics.roundsEnded++;
      }
    }
  }

  return summarize(sim, metrics);
}

export function runWallRehearsal({ weapon = "spear" } = {}) {
  const sim = createTerrariumSimulation({ playerWeaponId: weapon, autoReset: false });
  sim.player.x = 718;
  sim.player.y = 300;
  sim.player.facing = 0;
  sim.player.desiredFacing = 0;
  sim.playerWeapon.angle = 0;
  sim.playerWeapon.reach = sim.playerWeapon.config.idleReach;
  sim.playerWeapon.lastSegment = null;

  const metrics = {
    seconds: 2,
    playerHits: 0,
    enemyHits: 0,
    clashes: 0,
    wallContacts: 0,
    attackIntents: 0,
    enemyAttackIntents: 0,
    enemyBreatherFrames: 0,
    roundsEnded: 0,
    playerHitDistances: [],
    ruinWallContacts: 0,
    minDistance: Math.hypot(sim.enemy.x - sim.player.x, sim.enemy.y - sim.player.y),
    maxDistance: Math.hypot(sim.enemy.x - sim.player.x, sim.enemy.y - sim.player.y)
  };

  sim.attack("thrust");
  metrics.attackIntents++;

  for (let i = 0; i < Math.floor(2 / DT); i++) {
    sim.step({ moveX: 0, moveY: 0, aimX: 900, aimY: 300 }, DT);
    for (const event of sim.drainEvents()) {
      if (event.type === "weapon-wall" && event.actor === "player") {
        metrics.wallContacts++;
        if (event.wall === "ruin-upper" || event.wall === "ruin-lower") metrics.ruinWallContacts++;
      }
      if (event.type === "blade-clash") metrics.clashes++;
      if (event.type === "body-hit") {
        if (event.attacker === "player") metrics.playerHits++;
        else metrics.enemyHits++;
      }
    }
  }

  return summarize(sim, metrics);
}


export function runGateClearanceRehearsal({ weapon = "spear", action = "cut" } = {}) {
  const body = createBody({
    id: "gate-probe",
    x: 720,
    y: 535,
    radius: 18,
    mass: 1
  });
  body.facing = 0;
  body.desiredFacing = 0;

  const weaponState = createWeaponState(body, weapon);
  const events = [];
  const accepted = requestAttack(body, weaponState, action);
  let wallContacts = 0;
  let ruinWallContacts = 0;
  let maxReach = weaponState.reach;
  let maxAbsAngle = Math.abs(weaponState.angle);

  for (let i = 0; i < Math.floor(1.25 / DT); i++) {
    updateWeapon(body, weaponState, DT, event => {
      events.push(event);
      if (event.type === "weapon-wall") {
        wallContacts++;
        if (event.wall === "ruin-upper" || event.wall === "ruin-lower") ruinWallContacts++;
      }
    });
    maxReach = Math.max(maxReach, weaponState.reach);
    maxAbsAngle = Math.max(maxAbsAngle, Math.abs(weaponState.angle));
  }

  return {
    weapon,
    action,
    accepted,
    finite: [
      body.x, body.y,
      weaponState.angle,
      weaponState.angularVelocity,
      weaponState.reach,
      weaponState.radialVelocity
    ].every(Number.isFinite),
    wallContacts,
    ruinWallContacts,
    maxReach: Number(maxReach.toFixed(1)),
    maxAbsAngle: Number(maxAbsAngle.toFixed(3))
  };
}

export function runNamedRehearsal(name) {
  if (name === "duel-sword") return runDuelRehearsal({ weapon: "sword" });
  if (name === "duel-spear") return runDuelRehearsal({ weapon: "spear" });
  if (name === "wall-spear") return runWallRehearsal({ weapon: "spear" });
  if (name === "gate-spear-cut") return runGateClearanceRehearsal({ weapon: "spear", action: "cut" });
  if (name === "gate-spear-thrust") return runGateClearanceRehearsal({ weapon: "spear", action: "thrust" });
  if (name === "gate-sword-cut") return runGateClearanceRehearsal({ weapon: "sword", action: "cut" });
  throw new Error("Unknown rehearsal: " + name);
}
