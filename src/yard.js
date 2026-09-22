export const BROKEN_YARD = Object.freeze({
  width: 900,
  height: 620,
  inset: 28,
  walls: Object.freeze([
    Object.freeze({ id: "broken-wall-west", x: 90, y: 268, w: 280, h: 28 }),
    Object.freeze({ id: "broken-wall-east", x: 530, y: 268, w: 280, h: 28 }),
    Object.freeze({ id: "north-pillar", x: 420, y: 120, w: 60, h: 92 }),
    Object.freeze({ id: "south-obstruction", x: 620, y: 405, w: 120, h: 34 })
  ])
});

export const PLAYER_SPEC = Object.freeze({
  radius: 16,
  mass: 64,
  maxSpeed: 235,
  acceleration: 2550,
  braking: 3000,
  turnRate: 14
});

export const PRESSURE_SPEC = Object.freeze({
  radius: 16,
  mass: 58,
  maxSpeed: 148,
  acceleration: 1350,
  braking: 1900,
  turnRate: 8
});
