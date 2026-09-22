import { createActor, driveActor, faceToward } from "./actors.js";
import { BROKEN_YARD, PLAYER_SPEC, PRESSURE_SPEC } from "./yard.js";
import { updatePressure } from "./pressure.js";
import { pointClear, resolveActorWorld, resolvePairs, stepActorWorld } from "./world.js";

export function routePolylineClear(points, radius = PLAYER_SPEC.radius) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(distance / 8));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      if (!pointClear(BROKEN_YARD, x, y, radius)) return false;
    }
  }
  return true;
}

export function runNeutralRehearsal({ seconds = 20, dt = 1 / 120 } = {}) {
  const player = createActor(PLAYER_SPEC, { id: "player", kind: "player", x: 450, y: 535, facing: -Math.PI / 2 });
  const threats = [
    createActor(PRESSURE_SPEC, { id: "pressure-a", kind: "pressure", x: 315, y: 92, facing: Math.PI / 2 }),
    createActor(PRESSURE_SPEC, { id: "pressure-b", kind: "pressure", x: 585, y: 92, facing: Math.PI / 2 })
  ];
  const waypoints = [
    { x: 300, y: 470 },
    { x: 300, y: 330 },
    { x: 410, y: 330 },
    { x: 410, y: 240 },
    { x: 380, y: 230 },
    { x: 300, y: 160 },
    { x: 380, y: 230 },
    { x: 520, y: 230 },
    { x: 650, y: 180 },
    { x: 840, y: 235 },
    { x: 840, y: 330 },
    { x: 790, y: 360 },
    { x: 820, y: 500 },
    { x: 450, y: 520 }
  ];
  let waypoint = 0;
  let waypointAdvances = 0;
  let pairContacts = 0;
  let worldContacts = 0;
  let transitions = 0;
  let playerThreatContactFrames = 0;
  let threatThreatContactFrames = 0;
  let playerContactEpisodes = 0;
  let playerContactStreak = 0;
  let maxPlayerContactStreak = 0;
  let wasPlayerContact = false;
  const seenStates = new Set();

  const frames = Math.ceil(seconds / dt);
  for (let frame = 0; frame < frames; frame++) {
    const target = waypoints[waypoint];
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    if (Math.hypot(dx, dy) < 25) {
      waypoint = (waypoint + 1) % waypoints.length;
      waypointAdvances++;
    }
    faceToward(player, target.x, target.y, dt);
    driveActor(player, dx, dy, dt);
    worldContacts += stepActorWorld(player, BROKEN_YARD, dt);

    for (const threat of threats) {
      const events = updatePressure(threat, player, BROKEN_YARD, dt, threats);
      transitions += events.length;
      seenStates.add(threat.state);
      worldContacts += resolveActorWorld(threat, BROKEN_YARD);
    }

    const playerContact = threats.some(t =>
      Math.hypot(t.x - player.x, t.y - player.y) <
      t.spec.radius + player.spec.radius + 0.5
    );
    const threatContact =
      Math.hypot(threats[0].x - threats[1].x, threats[0].y - threats[1].y) <
      threats[0].spec.radius + threats[1].spec.radius + 0.5;

    if (playerContact) {
      playerThreatContactFrames++;
      playerContactStreak++;
      maxPlayerContactStreak = Math.max(maxPlayerContactStreak, playerContactStreak);
      if (!wasPlayerContact) playerContactEpisodes++;
    } else {
      playerContactStreak = 0;
    }
    wasPlayerContact = playerContact;
    if (threatContact) threatThreatContactFrames++;

    pairContacts += resolvePairs([player, ...threats]);
    for (const actor of [player, ...threats]) worldContacts += resolveActorWorld(actor, BROKEN_YARD);
  }

  return {
    finite: [player, ...threats].every(a => [a.x,a.y,a.vx,a.vy,a.facing].every(Number.isFinite)),
    pairContacts,
    worldContacts,
    transitions,
    waypointAdvances,
    playerThreatContactFrames,
    threatThreatContactFrames,
    playerContactEpisodes,
    maxPlayerContactStreak,
    seenStates: [...seenStates].sort(),
    player: { x: Number(player.x.toFixed(2)), y: Number(player.y.toFixed(2)) },
    threats: threats.map(a => ({ id:a.id, state:a.state, x:Number(a.x.toFixed(2)), y:Number(a.y.toFixed(2)) }))
  };
}
