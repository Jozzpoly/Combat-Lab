import { clamp, lerp } from "./math.js";

const SHORT_BLADE = Object.freeze({
  kind: "short-blade",
  mass: 3,
  reach: 48
});

export const ANCHOR_FIXTURES = Object.freeze({
  bulwark: Object.freeze({
    label: "Bulwark anchor",
    body: Object.freeze({
      radius: 22,
      mass: 95,
      locomotorDrive: 12000,
      turnDrive: 700,
      support: 0.90
    }),
    equipment: Object.freeze([
      Object.freeze({ kind: "armour", mass: 25 }),
      Object.freeze({
        kind: "shield",
        mass: 20,
        width: 52,
        offset: 28,
        thickness: 6
      })
    ]),
    weapon: SHORT_BLADE
  }),
  skirmisher: Object.freeze({
    label: "Skirmisher anchor",
    body: Object.freeze({
      radius: 15,
      mass: 58,
      locomotorDrive: 12000,
      turnDrive: 660,
      support: 0.35
    }),
    equipment: Object.freeze([
      Object.freeze({ kind: "light-gear", mass: 4 })
    ]),
    weapon: SHORT_BLADE
  }),
  hybrid: Object.freeze({
    label: "Continuity hybrid",
    body: Object.freeze({
      radius: 18,
      mass: 70,
      locomotorDrive: 12000,
      turnDrive: 630,
      support: 0.55
    }),
    equipment: Object.freeze([
      Object.freeze({ kind: "armour", mass: 10 }),
      Object.freeze({
        kind: "shield",
        mass: 10,
        width: 34,
        offset: 24,
        thickness: 5
      })
    ]),
    weapon: SHORT_BLADE
  })
});

export function equipmentMass(spec) {
  return (spec.equipment || []).reduce((sum, item) => sum + (Number(item.mass) || 0), 0);
}

export function totalMass(spec) {
  return spec.body.mass + equipmentMass(spec) + (Number(spec.weapon?.mass) || 0);
}

export function shieldOf(spec) {
  return (spec.equipment || []).find(item => item.kind === "shield") || null;
}

export function derivePhenotype(spec, brace = 0) {
  const posture = clamp(brace, 0, 1);
  const mass = totalMass(spec);
  const locomotorDrive = Math.max(1, spec.body.locomotorDrive);
  const support = clamp(spec.body.support ?? 0.5, 0, 1);

  const maxSpeed = 20 * Math.sqrt(locomotorDrive / mass);
  const acceleration = 14 * locomotorDrive / mass;
  const turnRate = clamp(spec.body.turnDrive / mass, 3, 12);

  const moveScale = lerp(1, 0.38, posture);
  const turnScale = lerp(1, 0.48, posture);
  const braceGain = 0.40 + support * 1.20;
  const contactAuthority = mass * (1 + posture * braceGain);

  return {
    radius: spec.body.radius,
    totalMass: mass,
    maxSpeed: maxSpeed * moveScale,
    acceleration: acceleration * moveScale,
    turnRate: turnRate * turnScale,
    contactAuthority,
    support,
    shield: shieldOf(spec),
    posture
  };
}

export function createActor(spec, {
  id = "actor",
  x = 0,
  y = 0,
  facing = 0
} = {}) {
  return {
    id,
    spec,
    x,
    y,
    vx: 0,
    vy: 0,
    facing,
    brace: 0
  };
}

export function fitsGap(spec, gapWidth, margin = 2) {
  return spec.body.radius * 2 + margin * 2 <= gapWidth;
}
