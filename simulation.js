import { normalize } from "./core.js";
import {
  createBody,
  driveBody,
  resolveBodyPair,
  setDesiredFacing,
  tickBodyVisuals,
  updateFacing
} from "./world.js";
import {
  WEAPONS,
  createWeaponContactState,
  createWeaponState,
  equipWeapon,
  requestAttack,
  resolveWeaponContact,
  resolveWeaponHit,
  updateWeapon
} from "./combat.js";
import {
  createDuelistBrain,
  updateDuelistAI
} from "./ai.js";

function makePlayer() {
  return createBody({
    id: "player",
    x: 350,
    y: 790,
    radius: 18,
    mass: 1.0,
    maxSpeed: 250,
    acceleration: 2250,
    braking: 2700,
    turnRate: 11.5,
    hp: 125
  });
}

function makeEnemy() {
  const body = createBody({
    id: "duelist",
    x: 1240,
    y: 315,
    radius: 19,
    mass: 1.12,
    maxSpeed: 214,
    acceleration: 1700,
    braking: 2050,
    turnRate: 9.6,
    hp: 125
  });
  body.facing = Math.PI;
  body.desiredFacing = Math.PI;
  return body;
}

export function createTerrariumSimulation({ playerWeaponId = "sword", autoReset = true } = {}) {
  const sim = {
    time: 0,
    totalTime: 0,
    generation: 0,
    roundState: "fight",
    roundTimer: 0,
    playerWeaponId,
    player: null,
    enemy: null,
    playerWeapon: null,
    enemyWeapon: null,
    weaponContact: null,
    enemyBrain: null,
    events: [],
    pendingEvents: [],
    autoReset
  };

  function emit(event) {
    const enriched = { ...event, at: sim.totalTime, generation: sim.generation };
    sim.events.push(enriched);
    sim.pendingEvents.push(enriched);
    if (sim.events.length > 500) sim.events.shift();
  }

  function resetRound() {
    sim.generation++;
    sim.time = 0;
    sim.roundState = "fight";
    sim.roundTimer = 0;
    sim.player = makePlayer();
    sim.enemy = makeEnemy();
    sim.playerWeapon = createWeaponState(sim.player, sim.playerWeaponId);
    sim.enemyWeapon = createWeaponState(sim.enemy, "sword");
    sim.weaponContact = createWeaponContactState();
    sim.enemyBrain = createDuelistBrain(sim.generation + 3);
    emit({ type: "round-reset" });
  }

  function setPlayerWeapon(id) {
    if (!WEAPONS[id] || id === sim.playerWeaponId) return false;
    sim.playerWeaponId = id;
    equipWeapon(sim.player, sim.playerWeapon, id);
    sim.player.turnRate = id === "spear" ? 10.0 : 11.5;
    sim.player.maxSpeed = id === "spear" ? 238 : 250;
    emit({ type: "weapon-equip", actor: "player", weapon: id });
    return true;
  }

  function attack(type) {
    const accepted = requestAttack(sim.player, sim.playerWeapon, type);
    if (accepted) emit({ type: "attack-intent", actor: "player", action: type, weapon: sim.playerWeaponId });
    return accepted;
  }

  function endRound(winner) {
    if (sim.roundState !== "fight") return;
    sim.roundState = winner === "player" ? "won" : "lost";
    sim.roundTimer = 1.55;
    emit({ type: "round-end", winner });
  }

  function step(input, dt) {
    sim.time += dt;
    sim.totalTime += dt;

    if (sim.roundState !== "fight") {
      tickBodyVisuals(sim.player, dt);
      tickBodyVisuals(sim.enemy, dt);
      sim.roundTimer -= dt;
      if (sim.autoReset && sim.roundTimer <= 0) resetRound();
      return;
    }

    const p = sim.player;
    const e = sim.enemy;

    const aimX = Number.isFinite(input?.aimX) ? input.aimX : p.x + Math.cos(p.facing) * 100;
    const aimY = Number.isFinite(input?.aimY) ? input.aimY : p.y + Math.sin(p.facing) * 100;
    setDesiredFacing(p, Math.atan2(aimY - p.y, aimX - p.x));

    const move = normalize(input?.moveX || 0, input?.moveY || 0, 0, 0);
    driveBody(p, move.length > 0 ? move.x : 0, move.length > 0 ? move.y : 0, dt, 1);
    updateFacing(p, dt);

    const enemyInput = updateDuelistAI(sim.enemyBrain, e, sim.enemyWeapon, p, dt);
    driveBody(e, enemyInput.moveX, enemyInput.moveY, dt, 1);
    updateFacing(e, dt);

    resolveBodyPair(p, e, 0.80);

    const playerFrame = updateWeapon(p, sim.playerWeapon, dt, emit);
    const enemyFrame = updateWeapon(e, sim.enemyWeapon, dt, emit);

    const weaponContact = resolveWeaponContact(
      p,
      sim.playerWeapon,
      e,
      sim.enemyWeapon,
      sim.weaponContact,
      dt,
      emit
    );

    if (!weaponContact?.contact) {
      resolveWeaponHit(p, sim.playerWeapon, e, playerFrame, emit);
      resolveWeaponHit(e, sim.enemyWeapon, p, enemyFrame, emit);
    }

    if (!e.alive) endRound("player");
    if (!p.alive) endRound("enemy");

    tickBodyVisuals(p, dt);
    tickBodyVisuals(e, dt);
  }

  function drainEvents() {
    const out = sim.pendingEvents;
    sim.pendingEvents = [];
    return out;
  }

  Object.assign(sim, {
    resetRound,
    setPlayerWeapon,
    attack,
    step,
    drainEvents
  });

  resetRound();
  sim.pendingEvents = [];
  return sim;
}
