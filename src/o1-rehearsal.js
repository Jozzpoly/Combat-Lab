import { normalize } from "./math.js";
import { createO1State, stepO1State } from "./o1-sim.js";

function nearestLiving(state) {
  let best = null;
  let distance = Infinity;
  for (const threat of state.threats) {
    if (threat.hp <= 0) continue;
    const d = Math.hypot(threat.x - state.player.x, threat.y - state.player.y);
    if (d < distance) {
      best = threat;
      distance = d;
    }
  }
  return { threat: best, distance };
}

function activeGuardPolicy(state) {
  const { threat, distance } = nearestLiving(state);
  if (!threat) return { moveX: 0, moveY: 0, aimX: state.player.x, aimY: state.player.y };

  const dx = threat.x - state.player.x;
  const dy = threat.y - state.player.y;
  const d = normalize(dx, dy, 0, -1);
  const brace = distance < 104;
  const attack = threat.state === "recover" && distance < 86;

  // Seek pressure while free, become spatially deliberate once contact is near.
  const moveStrength = brace ? 0.18 : 0.78;
  return {
    moveX: d.x * moveStrength,
    moveY: d.y * moveStrength,
    aimX: threat.x,
    aimY: threat.y,
    brace,
    attack
  };
}

function mobileYieldPolicy(state) {
  const { threat, distance } = nearestLiving(state);
  if (!threat) return { moveX: 0, moveY: 0, aimX: state.player.x, aimY: state.player.y };

  const to = normalize(threat.x - state.player.x, threat.y - state.player.y, 0, -1);
  const committed = threat.state === "windup" || threat.state === "lunge";
  const attack = threat.state === "recover" && distance < 86;

  if (committed) {
    return {
      moveX: -to.y,
      moveY: to.x,
      aimX: threat.x,
      aimY: threat.y,
      brace: false,
      attack
    };
  }

  return {
    moveX: to.x * (distance > 92 ? 0.62 : -0.20),
    moveY: to.y * (distance > 92 ? 0.62 : -0.20),
    aimX: threat.x,
    aimY: threat.y,
    brace: false,
    attack
  };
}

function staticBracePolicy(state) {
  return {
    moveX: 0,
    moveY: 0,
    aimX: state.player.x,
    aimY: state.player.y - 100,
    brace: true,
    attack: false
  };
}

export function runO1Policy(policyName, {
  seconds = 18,
  dt = 1 / 120
} = {}) {
  const state = createO1State();
  let policy;
  if (policyName === "active-guard") policy = activeGuardPolicy;
  else if (policyName === "mobile-yield") policy = mobileYieldPolicy;
  else if (policyName === "static-brace") policy = staticBracePolicy;
  else throw new Error("unknown O1 policy: " + policyName);

  const counts = {
    shieldBlocks: 0,
    bodyHits: 0,
    playerStrikes: 0,
    kills: 0
  };

  const frames = Math.ceil(seconds / dt);
  for (let frame = 0; frame < frames && state.result === "active"; frame++) {
    const events = stepO1State(state, policy(state), dt);
    for (const event of events) {
      if (event.type === "shield-block") counts.shieldBlocks++;
      if (event.type === "body-hit") counts.bodyHits++;
      if (event.type === "player-strike") {
        counts.playerStrikes++;
        if (event.killed) counts.kills++;
      }
    }
  }

  return {
    policy: policyName,
    result: state.result,
    time: Number(state.time.toFixed(3)),
    hp: state.player.hp,
    livingThreats: state.threats.filter(t => t.hp > 0).length,
    ...counts,
    player: {
      x: Number(state.player.x.toFixed(2)),
      y: Number(state.player.y.toFixed(2))
    },
    threats: state.threats.map(t => ({
      id: t.id,
      hp: t.hp,
      state: t.state,
      x: Number(t.x.toFixed(2)),
      y: Number(t.y.toFixed(2))
    })),
    finite: [state.player, ...state.threats].every(a =>
      [a.x, a.y, a.vx, a.vy, a.facing].every(Number.isFinite)
    )
  };
}
