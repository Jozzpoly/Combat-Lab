import {
  ANCHOR_FIXTURES,
  createActor
} from "./phenotype.js";
import { driveActorInWorld } from "./world.js";
import {
  moveToward,
  resolveCellPair,
  updatePressureGuardMotion
} from "./cell.js";
import {
  CELL_WALLS,
  PRESSURE_SPEC
} from "./cell-config.js";
import {
  createWeaponRuntime,
  requestCompactAttack,
  resolveCompactStrike,
  stepCompactAttack
} from "./weapon.js";

function frontPolicy(player, guard, dt) {
  const distance = Math.hypot(guard.x - player.x, guard.y - player.y);
  player.brace = distance < 66 ? 1 : 0;
  player.facing = Math.atan2(guard.y - player.y, guard.x - player.x);
  moveToward(player, 0, 28, 1, dt);
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
  moveToward(player, target.x, target.y, 1, dt);
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
  const guardWeapon = createWeaponRuntime();
  let guardAttackTimer = 0.18;

  let bodyContacts = 0;
  let shieldContacts = 0;
  let worldContacts = 0;
  let bracedFrames = 0;
  let hitsTaken = 0;
  let shieldBlocks = 0;
  let reachedAt = null;
  let diedAt = null;
  let minimumY = player.y;
  const policyState = { sidePhase: 0 };

  const frames = Math.ceil(seconds / dt);
  for (let frame = 0; frame < frames; frame++) {
    if (strategy === "front") frontPolicy(player, guard, dt);
    else if (strategy === "side") sidePolicy(player, policyState, dt);
    else throw new Error("unknown strategy: " + strategy);

    updatePressureGuardMotion(guard, player, dt);

    const contact = resolveCellPair(player, guard);
    if (contact.shieldContact) shieldContacts++;
    if (contact.bodyContact) bodyContacts++;
    worldContacts += contact.worldContacts;

    // One shared compact attack supplies consequence to frontal pressure.
    // The guard is not granted a special anti-skirmisher rule: the strike
    // meets whatever body/shield geometry the current loadout actually has.
    const distance = Math.hypot(player.x - guard.x, player.y - guard.y);
    const centralThreat = Math.abs(player.x) < 46 && distance < 86;
    guardAttackTimer -= dt;
    if (centralThreat && guardAttackTimer <= 0) {
      if (requestCompactAttack(guardWeapon)) {
        guardAttackTimer = 0.78;
      }
    }

    stepCompactAttack(guardWeapon, dt);
    const strike = resolveCompactStrike(guard, guardWeapon, player);
    if (strike?.type === "body-hit") hitsTaken++;
    if (strike?.type === "shield-block") shieldBlocks++;

    if (player.brace > 0.5) bracedFrames++;
    minimumY = Math.min(minimumY, player.y);

    if (diedAt === null && player.hp <= 0) {
      diedAt = (frame + 1) * dt;
      break;
    }

    if (reachedAt === null && player.y < 52) {
      reachedAt = (frame + 1) * dt;
      break;
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
    hitsTaken,
    shieldBlocks,
    hp: player.hp,
    died: diedAt !== null,
    diedAt: diedAt === null ? null : Number(diedAt.toFixed(3)),
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
