import { BROKEN_YARD } from "./yard.js";
import { updatePressure } from "./pressure.js";
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
  threatStarts = O1_ENCOUNTER_START.threats
} = {}) {
  return {
    player: createO1Player(playerStart),
    threats: threatStarts.map(t => createO1Threat(t.id, t)),
    events: [],
    time: 0,
    result: "active"
  };
}

export function stepO1State(state, input, dt = 1 / 120) {
  if (state.result !== "active") return [];

  const player = state.player;
  player.braced = Boolean(input.brace);

  if (input.aimX !== undefined && input.aimY !== undefined) {
    faceO1Player(player, input.aimX, input.aimY, dt);
  }

  driveO1Player(player, input.moveX || 0, input.moveY || 0, dt);
  if (input.attack) requestO1Attack(player);
  stepActorWorld(player, BROKEN_YARD, dt);

  const frameEvents = [];
  for (const threat of state.threats) {
    if (threat.hp <= 0) continue;
    resetThreatAttackAuthority(threat);
    frameEvents.push(...updatePressure(threat, player, BROKEN_YARD, dt, state.threats));
  }

  const incomingCandidates = [];
  for (const threat of state.threats) {
    if (threat.hp <= 0) continue;
    const event = resolvePressurePhysical(player, threat);
    if (!event) continue;
    if (event.type === "body-hit-candidate") incomingCandidates.push(event);
    else frameEvents.push(event);
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

  state.time += dt;
  if (player.hp <= 0) state.result = "down";
  else if (state.threats.every(t => t.hp <= 0)) state.result = "clear";

  state.events.push(...frameEvents);
  return frameEvents;
}
