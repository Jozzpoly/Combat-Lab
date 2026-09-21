import { normalize } from "./math.js";
import {
  ANCHOR_FIXTURES,
  createActor,
  withEquipment
} from "./phenotype.js";
import {
  resolveActorShieldContact,
  resolveBodyOverlap
} from "./contact.js";
import {
  driveActorInWorld,
  resolveActorWorld
} from "./world.js";

export const CELL_WALLS = Object.freeze([
  // Horizontal barrier with a generous central choke and a genuinely tight side route.
  Object.freeze({ id: "barrier-left", x: -140, y: 70, w: 112, h: 30 }),
  Object.freeze({ id: "barrier-middle", x: 28, y: 70, w: 50, h: 30 }),
  Object.freeze({ id: "barrier-right", x: 112, y: 70, w: 28, h: 30 })
]);

const PRESSURE_SPEC = Object.freeze({
  label: "Shared pressure body",
  body: Object.freeze({
    radius: 17,
    mass: 68,
    locomotorDrive: 7200,
    turnDrive: 560,
    support: 0.55
  }),
  equipment: Object.freeze([
    Object.freeze({ kind: "plain-gear", mass: 7 })
  ]),
  weapon: Object.freeze({ ...ANCHOR_FIXTURES.skirmisher.weapon })
});

function moveToward(actor, x, y, strength, dt, walls) {
  const d = normalize(x - actor.x, y - actor.y, 0, 0);
  driveActorInWorld(actor, d.x * strength, d.y * strength, dt, walls);
}

function frontPolicy(player, guard, dt) {
  const distance = Math.hypot(guard.x - player.x, guard.y - player.y);
  player.brace = distance < 66 ? 1 : 0;
  player.facing = Math.atan2(guard.y - player.y, guard.x - player.x);
  moveToward(player, 0, 28, 1, dt, CELL_WALLS);
}

function sidePolicy(player, policyState, dt) {
  player.brace = 0;
  const waypoints = [
    { x: 95, y: 145 },
    { x: 95, y: 35 },
    { x: 0, y: 28 }
  ];

  if (
    policyState.sidePhase === 0 &&
    Math.hypot(player.x - waypoints[0].x, player.y - waypoints[0].y) < 14
  ) {
    policyState.sidePhase = 1;
  }
  if (policyState.sidePhase === 1 && player.y < 58) {
    policyState.sidePhase = 2;
  }

  const target = waypoints[policyState.sidePhase];
  player.facing = Math.atan2(target.y - player.y, target.x - player.x);
  moveToward(player, target.x, target.y, 1, dt, CELL_WALLS);
}

function guardPolicy(guard, player, dt) {
  guard.brace = 0.85;

  // Guard the central relation rather than omnisciently hunting the flank.
  const playerInCentralRelation = Math.abs(player.x) < 42 && player.y > guard.y;
  const targetX = 0;
  const targetY = playerInCentralRelation ? Math.min(132, player.y - 34) : 86;
  const strength = playerInCentralRelation ? 0.62 : 0.42;

  guard.facing = Math.atan2(player.y - guard.y, player.x - guard.x);
  moveToward(guard, targetX, targetY, strength, dt, CELL_WALLS);
}

export function runCrossCell(spec, strategy, {
  seconds = 5,
  dt = 1 / 120
} = {}) {
  const player = createActor(spec, {
    id: "player",
    x: 0,
    y: 160,
    facing: -Math.PI / 2
  });
  const guard = createActor(PRESSURE_SPEC, {
    id: "guard",
    x: 0,
    y: 88,
    facing: Math.PI / 2
  });

  let bodyContacts = 0;
  let shieldContacts = 0;
  let worldContacts = 0;
  let bracedFrames = 0;
  let reachedAt = null;
  let minimumY = player.y;
  const policyState = { sidePhase: 0 };

  const frames = Math.ceil(seconds / dt);
  for (let frame = 0; frame < frames; frame++) {
    if (strategy === "front") frontPolicy(player, guard, dt);
    else if (strategy === "side") sidePolicy(player, policyState, dt);
    else throw new Error("unknown strategy: " + strategy);

    guardPolicy(guard, player, dt);

    const shieldContact = resolveActorShieldContact(player, guard);
    if (shieldContact.contact) {
      shieldContacts++;
    } else {
      const body = resolveBodyOverlap(player, guard);
      if (body.contact) bodyContacts++;
    }

    worldContacts += resolveActorWorld(player, CELL_WALLS);
    worldContacts += resolveActorWorld(guard, CELL_WALLS);

    if (player.brace > 0.5) bracedFrames++;
    minimumY = Math.min(minimumY, player.y);

    if (reachedAt === null && player.y < 52) {
      reachedAt = (frame + 1) * dt;
    }
  }

  return {
    label: spec.label,
    strategy,
    reached: reachedAt !== null,
    reachedAt: reachedAt === null ? null : Number(reachedAt.toFixed(3)),
    finalX: Number(player.x.toFixed(2)),
    finalY: Number(player.y.toFixed(2)),
    minimumY: Number(minimumY.toFixed(2)),
    bodyContacts,
    shieldContacts,
    worldContacts,
    bracedFrames,
    guardFinalX: Number(guard.x.toFixed(2)),
    guardFinalY: Number(guard.y.toFixed(2)),
    sidePhase: policyState.sidePhase,
    finite: [
      player.x, player.y, player.vx, player.vy,
      guard.x, guard.y, guard.vx, guard.vy
    ].every(Number.isFinite)
  };
}

export function runPhenotypeStrategyMatrix() {
  const anchors = {
    bulwark: ANCHOR_FIXTURES.bulwark,
    skirmisher: ANCHOR_FIXTURES.skirmisher,
    hybrid: ANCHOR_FIXTURES.hybrid
  };

  const out = {};
  for (const [name, spec] of Object.entries(anchors)) {
    out[name] = {
      front: runCrossCell(spec, "front"),
      side: runCrossCell(spec, "side")
    };
  }
  return out;
}
