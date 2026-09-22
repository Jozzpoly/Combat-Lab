import { BROKEN_YARD } from "./yard.js";
import { pressurePhysicalReach, updatePressure } from "./pressure.js";
import { resolveActorPair, resolveActorWorld, stepActorWorld } from "./world.js";
import {
  applyO1Strike,
  applyPressureHit,
  createO1Player,
  createO1Threat,
  driveO1Player,
  faceO1Player,
  probeO1Strike,
  requestO1Attack,
  resetThreatAttackAuthority,
  resolvePressurePhysical,
  settlePressureAfterContact,
  stepO1Attack
} from "./o1.js";

export const O1_ENCOUNTER_START = Object.freeze({
  player: Object.freeze({ x: 450, y: 520, facing: -Math.PI / 2 }),
  threats: Object.freeze([
    Object.freeze({ id: "north", x: 315, y: 175, facing: Math.PI / 2 }),
    Object.freeze({ id: "east", x: 805, y: 355, facing: Math.PI })
  ])
});

export function createO1State({
  playerStart = O1_ENCOUNTER_START.player,
  threatStarts = O1_ENCOUNTER_START.threats,
  objective = null
} = {}) {
  return {
    player: createO1Player(playerStart),
    threats: threatStarts.map(t => createO1Threat(t.id, t)),
    objective: objective ? { ...objective } : null,
    events: [],
    time: 0,
    result: "active"
  };
}


export function playerInterposesObjective(threat, player, objective) {
  if (!objective) return false;

  const abx = objective.x - threat.x;
  const aby = objective.y - threat.y;
  const denom = abx * abx + aby * aby;
  if (denom <= 1e-9) return false;

  const apx = player.x - threat.x;
  const apy = player.y - threat.y;
  const t = (apx * abx + apy * aby) / denom;
  if (t <= 0 || t >= 1) return false;

  const closestX = threat.x + abx * t;
  const closestY = threat.y + aby * t;
  const lateral = Math.hypot(player.x - closestX, player.y - closestY);
  const distance = Math.hypot(player.x - threat.x, player.y - threat.y);

  const corridor =
    player.spec.radius +
    threat.spec.radius +
    10;

  return lateral <= corridor && distance <= 112;
}

function pressureTargetFor(state, threat) {
  const objective = state.objective;
  if (!objective || objective.hp <= 0) return state.player;

  const playerDistance = Math.hypot(
    state.player.x - threat.x,
    state.player.y - threat.y
  );
  const localReach = pressurePhysicalReach(threat, state.player);

  // Primary intent remains the stake. A nearby armed body is only a temporary
  // local concern: no persistent target ownership or taunt state is created.
  if (playerDistance <= localReach + 10) return state.player;

  return playerInterposesObjective(threat, state.player, objective)
    ? state.player
    : objective;
}

export function stepO1State(state, input, dt = 1 / 120) {
  if (state.result !== "active") return [];

  const player = state.player;
  player.braced = Boolean(input.brace);

  const movementBraced = input.movementBraced ?? player.braced;

  if (input.aimX !== undefined && input.aimY !== undefined) {
    faceO1Player(player, input.aimX, input.aimY, dt, movementBraced);
  }

  driveO1Player(player, input.moveX || 0, input.moveY || 0, dt, movementBraced);
  if (input.attack) requestO1Attack(player);
  stepActorWorld(player, BROKEN_YARD, dt);

  const frameEvents = [];
  for (const threat of state.threats) {
    if (threat.hp <= 0) continue;
    resetThreatAttackAuthority(threat);
    const pressureTarget = pressureTargetFor(state, threat);
    frameEvents.push(...updatePressure(
      threat,
      pressureTarget,
      BROKEN_YARD,
      dt,
      state.threats,
      { triggerDistance: pressurePhysicalReach(threat, pressureTarget) }
    ));
  }

  const incomingCandidates = [];
  for (const threat of state.threats) {
    if (threat.hp <= 0) continue;
    const event = resolvePressurePhysical(player, threat);
    if (!event) continue;
    if (event.type === "body-hit-candidate") incomingCandidates.push(event);
    else frameEvents.push(event);
  }

  // A fragile spatial stake is intentionally simple: pressure can commit through
  // to it only if player body/shield contact did not already consume that lunge.
  const objectiveCandidates = [];
  if (state.objective && state.objective.hp > 0) {
    for (const threat of state.threats) {
      if (threat.hp <= 0 || threat.state !== "lunge" || threat.attackResolved) continue;
      const distance = Math.hypot(
        threat.x - state.objective.x,
        threat.y - state.objective.y
      );
      if (distance < threat.spec.radius + state.objective.radius) {
        objectiveCandidates.push({
          type: "objective-hit-candidate",
          attacker: threat.id
        });
        settlePressureAfterContact(threat, 0.30);
      }
    }
  }

  // Cheap threats still occupy each other physically.
  const living = state.threats.filter(t => t.hp > 0);
  for (let i = 0; i < living.length; i++) {
    for (let j = i + 1; j < living.length; j++) {
      resolveActorPair(living[i], living[j]);
    }
  }

  for (const actor of [player, ...living]) resolveActorWorld(actor, BROKEN_YARD);

  stepO1Attack(player, dt);
  const strikeCandidates = [];
  for (const threat of living) {
    const candidate = probeO1Strike(player, threat);
    if (candidate) strikeCandidates.push({ threat, candidate });
  }

  // Apply already-measured committed consequences. Order no longer decides whether
  // the other side's already-committed event disappears.
  for (const { threat, candidate } of strikeCandidates) {
    const event = applyO1Strike(player, threat, candidate);
    if (event) frameEvents.push(event);
  }
  for (const candidate of incomingCandidates) {
    const event = applyPressureHit(player, candidate);
    if (event) frameEvents.push(event);
  }
  for (const candidate of objectiveCandidates) {
    if (!state.objective || state.objective.hp <= 0) continue;
    state.objective.hp = Math.max(0, state.objective.hp - 1);
    frameEvents.push({
      ...candidate,
      type: "objective-hit",
      hp: state.objective.hp
    });
  }

  state.time += dt;
  if (player.hp <= 0) state.result = "down";
  else if (state.objective && state.objective.hp <= 0) state.result = "breach";
  else if (state.threats.every(t => t.hp <= 0)) state.result = "clear";

  state.events.push(...frameEvents);
  return frameEvents;
}
